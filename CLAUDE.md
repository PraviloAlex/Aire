# CLAUDE.md — Aire

Aire — карманный «переключатель состояния» (дыхательные практики), Expo + React Native + TypeScript. Сейчас приоритет: **веб-first / PWA** (фоновое аудио и стор пока не нужны).

## ОБЯЗАТЕЛЬНО при любой работе с UI
Сверяйся с **`.claude/DESIGN-GUIDE.md`** — это единый стандарт визуала (контраст поверхностей, рамки, отступы, типографика, кнопки, орб). Дизайн-правки проверяй ВИЗУАЛЬНО в превью (`npm run build && npm run preview`), а не только по typecheck.

Главный принцип: полировка = видимые контейнеры + контраст + единые отступы + чистые контролы. Эффекты (glow/градиенты) — вишенка, не фундамент.

## Рабочий процесс
- Планы (PRP) лежат в `.claude/PRPs/plans/`. Реализация — через `/prp-implement <путь к плану>`.
- После изменений: `npm run typecheck && npm run lint && npm test && npm run build`.
- Не ломать нативную сборку: богатые веб-эффекты — только под `Platform.OS === "web"`.

## Архитектура (кратко)
- Экраны/роуты: `app/` (expo-router, табы в `app/(tabs)/`).
- Фичи: `src/features/*`. Данные практик: `src/data/breathingPractices.ts` (партитура дыхания — `pattern.phases[]` + `rounds`).
- Тема/токены: `src/theme/tokens.ts`, `src/theme/gradients.ts`. Общие UI: `src/features/common/`.
