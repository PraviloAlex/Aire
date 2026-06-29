# Plan: Session Shader Orb — визуальная полировка (M1 follow-up)

**Source PRD**: `.claude/prds/aire-session-shader-orb.prd.md`
**Selected Milestone**: полировка результата Milestone 1 (не M2/M3 — это доводка уже встроенного орба по визуальному фидбеку)
**Complexity**: Small

## Summary
Доводка интеграции shader-орба по фидбеку: свечение обрезается границей канваса, сам орб мелкий, вокруг лишнее кольцо, строку практики надо опустить. Меняем долю радиуса в шейдере и размер канваса так, чтобы glow помещался с запасом, а видимый орб стал крупнее; убираем `SessionProgressRing`; опускаем блок фразы. Логика дыхания/цвета не трогается.

## Patterns to Mirror
| Category | Source | Pattern |
|---|---|---|
| Размеры экрана | `src/features/session/BreathingSessionScreen.tsx:23` | Числовые константы `RING_SIZE`/`ORB_SIZE` модульного уровня |
| Константы шейдера | `src/features/session/orbShader/orbShaderSource.ts` | `baseR=0.38*uScale` в FS — единственное место, задающее долю радиуса |
| Размер орба (web) | `src/features/session/orbShader/ShaderOrb.web.tsx:54` | `size = 196` дефолт; канвас = `size` |
| Размер орба (native) | `src/features/session/orbShader/ShaderOrb.tsx` | Тот же контракт пропсов → менять размер только в вызове на экране |
| Композиция центра | `src/features/session/BreathingSessionScreen.tsx:184` | `center` (gap) → `orbWrap` (ring+orb+text) → `phraseBlock` |

## Files to Change
| File | Action | Why |
|---|---|---|
| `src/features/session/orbShader/orbShaderSource.ts` | UPDATE | Снизить `baseR` (0.38 → ~0.32), чтобы внешнее свечение помещалось в канвас и не обрывалось краем |
| `src/features/session/BreathingSessionScreen.tsx` | UPDATE | Увеличить размер орба; убрать `SessionProgressRing` и его импорт; подогнать `orbWrap` под размер орба; опустить `phraseBlock` ниже |

## Tasks

### Task 1: Дать свечению место (убрать обрезание)
- **Action**: В `orbShaderSource.ts` уменьшить `float baseR=0.38*uScale;` до `~0.32` (подобрать в превью так, чтобы glow полностью затухал внутри канваса, без квадратной отсечки по краю). Это делает орб меньше **относительно канваса**, что компенсируется увеличением канваса в Task 2 — итоговый видимый орб крупнее, а свечение целое.
- **Mirror**: единственная строка доли радиуса в FS.
- **Validate**: превью сессии — свечение плавно гаснет до краёв, нет резкой границы.

### Task 2: Увеличить орб
- **Action**: В `BreathingSessionScreen.tsx` поднять `ORB_SIZE` (196 → ~300; подобрать визуально под раскладку телефона). Канвас орба берёт этот размер; с уменьшенной долей радиуса (Task 1) видимый орб станет заметно крупнее, а glow останется внутри.
- **Mirror**: `ORB_SIZE` константа модульного уровня.
- **Validate**: `npm run typecheck`; превью — орб крупный, свечение не режется.

### Task 3: Убрать кольцо вокруг орба
- **Action**: В `BreathingSessionScreen.tsx` удалить `<SessionProgressRing …/>` и его импорт; `orbWrap` перевести с `RING_SIZE` на размер орба, чтобы центр и текст остались выровнены. (Прогресс сессии вернётся позже через morph орба в кольцо — Milestone 3.)
- **Mirror**: текущая структура `orbWrap`/`centerText`.
- **Validate**: `npm run lint` (нет неиспользуемого импорта); превью — кольца нет, текст по центру орба.

### Task 4: Опустить строку практики
- **Action**: В `BreathingSessionScreen.tsx` опустить `phraseBlock` ниже относительно орба (увеличить отступ сверху блока или gap в `center`; подобрать визуально, чтобы не липло к орбу и не уезжало к кнопкам).
- **Mirror**: стиль `phraseBlock`/`center` (spacing-токены).
- **Validate**: превью — фраза заметно ниже орба, дышит свободно.

## Validation
```bash
npm run typecheck
npm run lint
npm test
npm run build
# npm run preview → /session/box-breathing
# ВАЖНО: перед проверкой сбросить PWA-кэш (service worker + caches), иначе виден старый бандл
```

## Risks
| Risk | Likelihood | Mitigation |
|---|---|---|
| Подбор `baseR` + `ORB_SIZE` требует визуальной итерации | Высокая | Крутить в превью по 1 параметру, сверять со скриншотом; значения — единственные две ручки |
| Удаление кольца убирает индикатор прогресса | Средняя | Осознанно: прогресс вернётся как morph орба в кольцо (M3); пока пользователь явно просит убрать |
| Крупный орб начинает перекрывать текст «фаза/число» | Средняя | Текст уже поверх центра; при необходимости подстроить размер шрифта/позицию (в рамках Task 2/4) |
| Stale PWA-кэш скрывает правки при проверке | Средняя | Сбрасывать SW+caches перед перезагрузкой превью (см. память проекта) |

## Acceptance
- [ ] Свечение орба не обрезается границей канваса
- [ ] Орб заметно крупнее
- [ ] Кольцо вокруг орба убрано
- [ ] Строка практики опущена ниже
- [ ] `typecheck` + `lint` + `test` + `build` зелёные
- [ ] Проверено визуально в превью (с сбросом кэша)
