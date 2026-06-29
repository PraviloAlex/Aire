# Plan: Aire Session Shader Orb

> Переместить в `.claude/PRPs/plans/aire-session-shader-orb.plan.md`, затем `/prp-implement .claude/PRPs/plans/aire-session-shader-orb.plan.md`.

## Summary
Заменить «плоский» орб сессии (стек `Animated.View`-кругов) на **полуживое дыхательное ядро на 2D-фрагментном шейдере** (domain-warped fbm): полупрозрачная текучая энергия, тёмное ядро, светящиеся внутренние «нити» и мягкий ободок — близко к утверждённому референсу. Орб остаётся **полностью детерминированным**: ни микрофона, ни камеры, ни датчиков. Он реагирует только на три входа — состояние (`goal`), текущую фазу дыхания (`phaseName`) и прогресс фазы (`phaseProgress` 0..1), вычисляемый из таймера сессии.

Рендер — через `@shopify/react-native-skia` runtime shader (SkSL), который работает и на web (CanvasKit/WASM), и на нативе из одного кода. Таймерная механика, роуты, хранилище, рефлексия и хаптика **не трогаются**. Прототип-эталон визуала: `orb-shader.html` в корне репозитория.

## User Story
Как человек, открывший Aire чтобы переключить состояние, я хочу видеть живое премиальное дыхательное ядро, которое ведёт меня по ритму, чтобы следовать за дыханием без чтения инструкций и чувствовать, что экран персональный и «живой».

## Problem -> Solution
Текущий `BreathingOrb` собран из вложенных `Animated.View` с заливкой и `borderRadius` — это даёт ровный непрозрачный круг («желе/пластилин»), без внутреннего потока и глубины. Такой материал в принципе недостижим заливкой SVG/View.

Решение: ввести `ShaderOrb` на Skia runtime shader. Внутренний поток считается domain-warped fbm-шумом в фрагментном шейдере (один квад → дёшево, держит 60fps). Дыхание управляет масштабом и яркостью через uniform'ы; состояние задаёт цвет, скорость потока и «хаотичность» края. Старый `BreathingOrb` сохраняется как **фолбэк** на случай недоступности Skia/CanvasKit.

## Metadata
- **Complexity**: High (новая нативная зависимость + WASM на web + шейдер)
- **Source PRD**: N/A (визуальный rescue-pass поверх `aire-core-v2`)
- **PRD Phase**: Standalone visual upgrade
- **Estimated Files**: 7–9
- **Reference artifact**: `orb-shader.html` (корень репо) — эталон вида и параметров

---

## ⚠️ P0 Compatibility Spike (сделать ПЕРВЫМ, до любого кода)
Перед реализацией подтвердить совместимость — иначе риск сломать `web-first` сборку:

1. Подобрать версию `@shopify/react-native-skia`, совместимую с **Expo 56 / RN 0.85 / React 19**. Зафиксировать точную версию в `package.json` (не `latest`).
2. Проверить **web-путь**: Skia на web грузит CanvasKit WASM (~2.9 МБ). Подтвердить, что `expo export --platform web` собирается и WASM отдаётся из `dist/`. Оценить влияние на первый загруз PWA.
3. Решить способ загрузки на web: `WithSkiaWeb` (ленивая загрузка CanvasKit) + skeleton/фолбэк, чтобы не блокировать TTI.
4. Подтвердить, что нужен dev-client rebuild (Skia — нативный модуль); зафиксировать в отчёте шаги для `eas`/локальной сборки.

**Gate спайка:** `npm run build` зелёный + орб рендерится в `npm run preview`. Если web-стоимость WASM неприемлема → откатиться на улучшенный SVG-орб (см. «Fallback B») и остановить план.

---

## Mandatory Reading

| Priority | File | Why |
|---|---|---|
| P0 | `src/features/session/BreathingOrb.tsx` | Текущий орб и контракт пропсов (`goal`, `phaseName`, `durationSeconds`, `running`, `size`) — сохранить как фолбэк. |
| P0 | `src/features/session/BreathingSessionScreen.tsx` | Где монтируется орб, откуда брать фазу и остаток (`getPhaseRemainingSeconds`, `snapshot.currentPhase`). |
| P0 | `src/features/session/orbMotion.ts` | Маппинг фазы → цели анимации; расширим до непрерывного `phaseProgress` + per-phase scale/bright/amp. |
| P0 | `orb-shader.html` (корень) | Эталон SkSL-логики: domain-warp fbm, морфинг края, цветовая раскладка, дыхательные uniform'ы. |
| P1 | `src/theme/gradients.ts` | `stateOrbColors` (core/mid/edge/glow на 7 состояний) — источник цвета для шейдера. |
| P1 | `src/theme/tokens.ts` | `stateColors`, типографика. |
| P1 | `src/features/session/__tests__/orbMotion.test.ts` | Стиль тестов фазовой логики — расширить под новые поля. |
| P1 | `.claude/DESIGN-GUIDE.md` | Стандарт визуала (контраст, отступы, контролы). |

## External Documentation
- `@shopify/react-native-skia` — Runtime Shaders (`Skia.RuntimeEffect.Make`, `<Fill>`/`<Shader>`), `useClock`, web setup (`WithSkiaWeb`, CanvasKit). Свериться с версией, выбранной в спайке.

---

## Architecture & Contract

### Новый компонент `ShaderOrb`
`src/features/session/ShaderOrb.tsx` — drop-in замена `BreathingOrb` с тем же публичным контрактом плюс прогресс фазы:

```ts
type ShaderOrbProps = Readonly<{
  goal: BreathingGoal;
  phaseName: BreathingPhaseName;
  phaseProgress: number;   // 0..1 в пределах текущей фазы (из таймера)
  running: boolean;
  size?: number;
}>;
```

`phaseProgress` вычисляется в экране из таймера:
`phaseProgress = 1 - getPhaseRemainingSeconds(snapshot) / snapshot.currentPhase.durationSeconds` (clamp 0..1; при `!running` → удержание).

### Маппинг состояния → стиль (uniform'ы)
Расширить `orbMotion.ts` функцией `getOrbScenarioStyle(goal)` (детерминированный пресет на каждое из 7 состояний), переиспользуя `stateOrbColors[goal]` как `c1=core`, `c2=mid`, `c3=edge`, `glow`:

| goal | speed | amp(край) | chaos | dim | характер |
|---|---|---|---|---|---|
| focus | 0.9 | 0.7 | 0.30 | 1.00 | собранный, почти симметричный, чистый teal |
| calm | 1.25 | 1.0 | 0.85 | 1.00 | живее, холодный синий, на выдохе ровнее |
| irritation | 1.15 | 0.95 | 0.75 | 1.00 | как calm, чуть теплее край |
| fear | 1.2 | 1.0 | 0.9 | 1.00 | неровный край, тёплый янтарь, успокаивается на выдохе |
| recover | 0.8 | 0.78 | 0.50 | 0.92 | объёмное, teal↔тёплое золото, энергия в центр |
| sleep | 0.45 | 0.6 | 0.30 | 0.78 | самое медленное, мягкое, янтарь, тусклее (но не в ноль) |
| pain | 0.5 | 0.55 | 0.25 | 0.74 | очень спокойное, голубое, минимум деформации |

### Маппинг фазы → дыхание (расширить `getOrbPhaseTarget`)
Per-phase интерполяция по `phaseProgress` (easeInOut):
- **inhale/sigh**: scale 0.92→1.12, bright 0.72→1.0, ampMul=1.0 (нити заметнее).
- **hold**: scale ≈1.12 + микро-синус, bright=1.0, ampMul=0.5 (почти замирает).
- **pause**: scale удержание у нижней точки, bright≈0.7, ampMul=0.4.
- **exhale/rest**: scale 1.12→0.92, bright 1.0→~0.64, ampMul 1.0→0.45 (форма ровнее, свет мягко уходит).
- `dim` состояния умножает итоговую яркость (sleep/pain тусклее). **Sleep не гаснет в ноль** — минимум яркости ≥ ~0.45.

### SkSL шейдер
Порт GLSL из `orb-shader.html` в SkSL (`half4 main(float2 fragCoord)`), uniform'ы: `uResolution, uTime, uScale, uBright, uChaos, uAmp, uGlow, uDetail, uC1, uC2, uC3`. Время гонит `useClock`, домноженное на `speed*phaseSpeed`. Для слабых Android — `uDetail`/число октав fbm понижается (см. perf).

---

## Implementation Steps
1. **Spike** (см. P0 выше). Зафиксировать версию Skia, web-загрузку, dev-client.
2. Установить `@shopify/react-native-skia` (точная версия), при необходимости добавить config-plugin в `app.json`.
3. Создать `src/features/session/orbShader.ts` — строка SkSL + типы uniform'ов (порт из `orb-shader.html`).
4. Расширить `orbMotion.ts`: `getOrbScenarioStyle(goal)` + поля непрерывного дыхания по `phaseProgress`; обновить тесты.
5. Создать `ShaderOrb.tsx` (Skia `Canvas` + runtime shader). На web обернуть в `WithSkiaWeb` с фолбэком-скелетоном.
6. Создать `OrbView.tsx` — обёртка-селектор: рендерит `ShaderOrb` если Skia доступен, иначе текущий `BreathingOrb` (**Fallback A**). Экран использует `OrbView`.
7. В `BreathingSessionScreen.tsx` вычислять `phaseProgress` из таймера и прокидывать в `OrbView`. Контролы/таймер/хаптику не трогать.
8. Проверить копию на экране: формулировки в духе «Орб ведёт тебя через дыхание» / «Следуй за ритмом». **Запрещены** фразы про «мы слышим/орб реагирует на твоё дыхание».
9. Прогнать gates + визуальная проверка в превью на десктопе и реальном Android.

## Performance & Fallback
- Cap DPR ≤ 2; на web рендер можно в 0.75–0.85 разрешения от CSS-бокса.
- fbm: 6 октав на десктопе, понизить до 4 при слабом устройстве; `uDetail` управляет насыщенностью нитей.
- **Fallback A** (рантайм): нет Skia/CanvasKit → текущий `BreathingOrb`.
- **Fallback B** (если спайк провалился по web-стоимости): не вводить Skia, вместо этого улучшить SVG-орб (полупрозрачные слои, `feTurbulence` под `Platform.OS==="web"`). Это отдельный план.

## Honesty / Copy Rules
Никаких ложных заявлений о сенсорах. Тексты-подсказки берём нейтральные («через нос», «медленно», «расслабь плечи») и идею «орб ведёт», а не «реагирует на твоё дыхание».

---

## Validation Gates
- `npm run typecheck` — без ошибок.
- `npm run lint` — чисто.
- `npm test` — включая обновлённые тесты `orbMotion` (scenario style + phase progress, детерминизм).
- `npm run build` — web-сборка зелёная, CanvasKit-ассеты на месте.
- `npm run preview` — **визуальная** проверка: 7 состояний различимы, дыхание читается (вдох расширяет/ярче, выдох сжимает/ровнее, пауза замирает), sleep не гаснет в ноль, фолбэк работает при отключённом Skia.
- Smoke на реальном Android: субъективная плавность (цель 60fps, важнее — отсутствие рывков).

## Out of Scope
Таймерная логика дыхания, паттерны практик (`breathingPractices.ts`), роуты, хранилище, рефлексия, хаптика, звук, домашний экран и его орбы (`HomeOrb`, `StateOrb`). Только орб экрана сессии.

## Tasks
- [ ] P0 compatibility spike (Skia версия, web WASM, dev-client) + gate
- [ ] Установить и сконфигурировать `@shopify/react-native-skia`
- [ ] `orbShader.ts` — SkSL порт из `orb-shader.html`
- [ ] Расширить `orbMotion.ts` (scenario style + phase progress) + тесты
- [ ] `ShaderOrb.tsx` (+ web `WithSkiaWeb` + скелетон)
- [ ] `OrbView.tsx` селектор с Fallback A
- [ ] Прокинуть `phaseProgress` в экране сессии
- [ ] Проверить/поправить копию (honesty rules)
- [ ] Прогнать все gates + визуальная проверка (десктоп + Android)
