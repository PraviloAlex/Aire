# Plan: Aire Session Shader Orb — Milestone 1

**Source PRD**: `.claude/prds/aire-session-shader-orb.prd.md`
**Selected Milestone**: 1 — Shader-орб как web-компонент
**Complexity**: Medium

## Summary
Перенести WebGL-шейдер из `orb-shader.html` (domain-warped fbm орб) в приложение как **web-only** компонент `ShaderOrb`, с одним цветом (расслабление / cyan) из токенов. На этом шаге орб самостоятельно «дышит» по внутреннему таймеру и заменяет визуал `BreathingOrb` на экране сессии в web; на native остаётся текущий `BreathingOrb` как fallback. Привязка к реальному движку дыхания и morph «хаос→кольцо» — следующие milestone'ы (2, 3).

## Patterns to Mirror
| Category | Source | Pattern |
|---|---|---|
| Component shape | `src/features/session/BreathingOrb.tsx:8` | `type Props = Readonly<{…}>`, именованный `export function`, проп `size`, деструктуризация в параметрах |
| Web gating | `src/features/session/BreathingOrb.tsx:110` | Богатый эффект под `Platform.OS === "web"`; native — без него |
| Color source | `src/theme/gradients.ts:11` | `stateOrbColors[goal]` (`core/mid/edge/glow`) как источник палитры орба |
| Phase→motion map | `src/features/session/orbMotion.ts:10` | Чистая функция `phaseName → числовые цели`, без побочных эффектов (готовый стиль для будущей M2) |
| Tests | `src/features/mockups/__tests__/sessionOrbMockupData.test.ts:1` | `vitest` `describe/it/expect`, проверка формы данных и hex-цветов |
| Integration point | `src/features/session/BreathingSessionScreen.tsx:185` | `orbWrap`: `SessionProgressRing` + орб + `centerText` поверх; `ORB_SIZE = 196` |

## Files to Change
| File | Action | Why |
|---|---|---|
| `src/features/session/orbShader/orbShaderSource.ts` | CREATE | Чистые строки вершинного/фрагментного шейдера (перенос дословно из HTML) + список имён uniform'ов. Без DOM — переиспользуемо и проверяемо |
| `src/features/session/orbShader/orbShaderColors.ts` | CREATE | Маппинг `BreathingGoal → {c1,c2,c3}` из `stateOrbColors`; MVP реально использует только `calm`. Функция `hexToRgb` (перенос `hex()` из HTML) |
| `src/features/session/orbShader/ShaderOrb.web.tsx` | CREATE | Web-only: создаёт `<canvas>` + WebGL-контекст, RAF-цикл, прокидывает uniform'ы (time/scale/bright/цвета). Самодостаточный «дышащий» цикл на этом шаге |
| `src/features/session/orbShader/ShaderOrb.tsx` | CREATE | Native/умолчательный fallback: рендерит текущий `BreathingOrb` (тот же интерфейс пропсов), чтобы native не регрессировал |
| `src/features/session/orbShader/__tests__/orbShaderColors.test.ts` | CREATE | Unit-тест чистого маппинга цветов и `hexToRgb` (vitest), зеркалит существующий тест моков |
| `src/features/session/BreathingSessionScreen.tsx` | UPDATE | Заменить `<BreathingOrb…>` на `<ShaderOrb…>` (тот же контракт `goal/running/size`); кольцо и центральный текст не трогаем |

## Tasks

### Task 1: Вынести шейдер в чистый модуль
- **Action**: Создать `orbShaderSource.ts` — экспортировать `VERTEX_SRC` и `FRAGMENT_SRC` дословным переносом `VS`/`FS` из `orb-shader.html` (строки 81–129). Экспортировать список имён uniform'ов как `const` массив/объект для типобезопасного `getUniformLocation`.
- **Mirror**: чистый логический модуль без JSX — как `orbMotion.ts`.
- **Validate**: `npm run typecheck` (файл компилируется, нет `any` в публичном API).

### Task 2: Цвета из токенов
- **Action**: Создать `orbShaderColors.ts`: `hexToRgb(hex: string): [number, number, number]` (перенос `hex()`), и `getOrbShaderColors(goal: BreathingGoal): { c1; c2; c3 }`, где `c1 = core`, `c2 = glow`, `c3 = edge` из `stateOrbColors`. На MVP вызываем только для `calm`, но функция покрывает все цели.
- **Mirror**: `stateOrbColors` из `theme/gradients.ts`; стиль чистой функции из `orbMotion.ts`.
- **Validate**: `npm test` — новый тест на маппинг и формат rgb (0..1, длина 3).

### Task 3: Web-компонент орба
- **Action**: Создать `ShaderOrb.web.tsx`. Props `Readonly<{ goal; running; size? }>` (зеркало `BreathingOrb`). Создать canvas (через `unstable_createElement('canvas')` из `react-native-web` — без новых зависимостей; решение зафиксировать в коде комментом), получить `webgl` контекст, скомпилировать программу из `orbShaderSource`, в `requestAnimationFrame` гнать `uTime` и дышащие `scale/bright` (перенос логики кадра из HTML, строки 185–203, но self-driven). Корректный teardown: отмена RAF и `loseContext` при unmount. При отсутствии WebGL — вернуть null/ничего (родитель покажет кольцо).
- **Mirror**: web-гейтинг и форма пропсов `BreathingOrb`; cleanup-паттерн из `react/hooks.md` (отмена подписок в return эффекта).
- **Validate**: `npm run build` + визуальная проверка в превью (`/state/...` сессия): живой орб виден, без ошибок в консоли.

### Task 4: Native fallback
- **Action**: Создать `ShaderOrb.tsx` (без `.web`), который рендерит существующий `BreathingOrb` с теми же пропсами. Expo сам выберет `.web.tsx` на web и `.tsx` на native.
- **Mirror**: интерфейс пропсов `BreathingOrb`.
- **Validate**: `npm run typecheck` — оба файла удовлетворяют одному контракту пропсов.

### Task 5: Встроить в экран сессии
- **Action**: В `BreathingSessionScreen.tsx` заменить импорт и использование `BreathingOrb` на `ShaderOrb` в блоке `orbWrap` (строка ~187), сохранив `goal/running/size={ORB_SIZE}`. Кольцо `SessionProgressRing` и `centerText` оставить как есть (лишний внутренний контур уходит вместе со старым орбом).
- **Mirror**: текущая композиция `orbWrap`.
- **Validate**: `npm run typecheck && npm run lint && npm test && npm run build`; визуальная проверка сессии в превью на web.

## Validation
```bash
npm run typecheck
npm run lint
npm test
npm run build
# затем: npm run preview → открыть сессию (например /state/calm) и сверить орб с orb-shader.html
```

## Risks
| Risk | Likelihood | Mitigation |
|---|---|---|
| `<canvas>` в Expo-web рендерится не через стандартный JSX | Средняя | Использовать `unstable_createElement('canvas')` из `react-native-web` (без новых зависимостей); путь зафиксирован в Task 3 |
| Потеря WebGL-контекста при размонтировании роутера | Средняя | Явный teardown: cancel RAF + `WEBGL_lose_context`; пересоздание контекста на mount |
| WebGL недоступен в браузере | Низкая | Тихий fallback: компонент ничего не рисует, остаётся кольцо + текст (как защита `if(!gl)` в HTML) |
| Регрессия native-сборки | Низкая | `.tsx` fallback рендерит прежний `BreathingOrb`; rich-эффект только в `.web.tsx` |
| Перфоманс на слабом Android-web | Средняя | `min(devicePixelRatio, 2)`, один квад, без доп. проходов (как в прототипе) |

## Acceptance
- [ ] Все задачи выполнены
- [ ] `typecheck` + `lint` + `test` + `build` зелёные
- [ ] На web сессия показывает живой shader-орб (цвет calm), без ошибок консоли
- [ ] На native сессия рендерит прежний `BreathingOrb` без регрессий
- [ ] Паттерны переиспользованы (форма пропсов, web-гейтинг, источник цвета, стиль тестов), не изобретены заново
```
