# Aire — Архитектура (launch-ready MVP → миллионы пользователей)

> Принцип старшего инженера: **строить нужное сейчас, а не всё сразу.** Aire — это
> офлайн-first дыхательный инструмент. Движок дыхания, орб, гаптика, своя
> настройка ритмов — всё работает на клиенте без сервера. Бэкенд добавляется
> слоями, только когда появляется реальная нужда (аккаунты, синхрон, оплата).

---

## 0. TL;DR — что делать сейчас

- **MVP уже есть.** Текущий клиент (Expo Router web → статический PWA) — это
  запускаемый продукт. Деплой = залить `dist/` на CDN. Стоимость ≈ $0,
  масштаб — миллионы, потому что это статика.
- **Бэкенд не строим, пока нет аккаунтов.** Локальное хранилище (AsyncStorage)
  закрывает 100% MVP-сценариев.
- **Готовимся к бэкенду архитектурно, не реализуя его:** ввести интерфейс
  репозитория, чтобы потом подменить «локально» на «локально + синхрон» одним
  модулем, не переписывая экраны. (У вас уже почти так: `*Storage.ts`.)

Дальше — полная картина, размеченная по фазам роста.

---

## 1. Системная архитектура (по фазам)

```
ФАЗА 0 — СЕЙЧАС (0 → первые тысячи)         Стоимость ~$0, ops ~0
┌──────────────────────────────────────────┐
│  Браузер / PWA (Expo RN Web)             │
│   • Движок дыхания (timerCore)           │
│   • Локальные данные (AsyncStorage)      │
│   • Service worker (офлайн-shell)        │
└──────────────────────────────────────────┘
            ▲ статика с CDN (Cloudflare Pages / Vercel)

ФАЗА 1 — АККАУНТЫ + СИНХРОН (тысячи → сотни тысяч)
┌───────────────┐   HTTPS   ┌───────────────────────────┐
│ Клиент (как   │◀────────▶│ Auth (Supabase/Clerk)     │
│ выше) +       │           │ Postgres + RLS            │
│ sync-движок   │           │ Edge Functions (/sync)    │
│ (offline-first)│          └───────────────────────────┘
└───────────────┘

ФАЗА 2 — МОНЕТИЗАЦИЯ + АНАЛИТИКА (сотни тысяч)
  + Stripe (web) / RevenueCat (сторы)  + PostHog (аналитика)
  + Push (reminders)                   + Webhooks → entitlements

ФАЗА 3 — МИЛЛИОНЫ
  + Read-replica Postgres, Redis (кэш entitlements/настроек)
  + Очередь (reminders, экспорт, вебхуки) — SQS/Cloud Tasks
  + Edge-кэш, многорегиональность, observability (Sentry+метрики)
```

Ключевая идея: **движок остаётся на клиенте всегда.** Сервер хранит и
синхронизирует данные пользователя и продаёт подписку — не считает дыхание.

---

## 2. Рекомендуемый стек (трезвый, мало ops)

| Слой | Выбор для MVP→скейла | Почему | Альтернатива |
|---|---|---|---|
| Клиент | Expo RN + expo-router (есть) | web-first PWA + путь в сторы | — |
| Хостинг web | Cloudflare Pages / Vercel | статика, глобальный CDN, бесплатно на старте | Netlify |
| Auth | Supabase Auth | встроен в БД, RLS из коробки, OAuth | Clerk, Auth0 |
| БД | Supabase Postgres | managed, RLS, realtime, бэкапы | Neon, RDS |
| API | Supabase Edge Functions (Deno) | близко к данным, серверлесс, автоскейл | Hono на CF Workers |
| Подписки | Stripe (web) + RevenueCat (сторы) | стандарт, вебхуки | Paddle |
| Аналитика | PostHog | privacy-first, воронки, флаги | Amplitude |
| Ошибки | Sentry | трейсы клиент+сервер | — |

Один поставщик (Supabase) на старте закрывает Auth + БД + API + storage с
минимумом операционки и при этом масштабируется. Когда нагрузка вырастет —
выносим горячие пути на свой сервис, не меняя клиент.

---

## 3. Структура файлов

Текущее (оставляем) + то, что добавится в Фазе 1+ (помечено `// +phase1`).

```
aire/
  app/                      # экраны (expo-router) — есть
    (tabs)/ session/ custom.tsx ...
  src/
    features/               # фичи — есть
    data/                   # статические данные практик — есть
    theme/                  # editorial + tokens — есть
    storage/                # ЛОКАЛЬНЫЕ репозитории — есть
      sessionStorage.ts
      customPatternStorage.ts
      programStorage.ts
    types/                  # доменные типы — есть
    # ──────────── добавляется при бэкенде ────────────
    data/repository.ts      # +phase1  интерфейс Repository<T>
    sync/
      syncEngine.ts         # +phase1  pull/push, разрешение конфликтов
      queue.ts              # +phase1  очередь офлайн-мутаций
    api/
      client.ts             # +phase1  типизированный fetch + auth
      endpoints.ts          # +phase1  пути и DTO
    auth/
      AuthProvider.tsx      # +phase1  сессия, вход/выход
      useEntitlements.ts    # +phase2  доступ к платным фичам
  server/                   # +phase1  (или supabase/)
    migrations/             # SQL миграции
    functions/
      sync/index.ts         # Edge Function /sync
      webhooks-stripe/index.ts   # +phase2
    policies.sql            # RLS
  docs/ARCHITECTURE.md      # этот файл
```

Принцип: экраны зависят от **интерфейса** `Repository`, а не от конкретного
хранилища. Локальная и синхронизируемая реализации взаимозаменяемы.

---

## 4. Доменная модель и схема БД (Postgres)

Типы уже есть на клиенте (`BreathingPattern`, `CustomPattern`, `SessionRecord`).
Серверная схема их зеркалит. Каждая таблица — с `user_id`, `updated_at`,
`deleted_at` (мягкое удаление для синхрона) и RLS.

```sql
-- profiles: 1:1 к auth.users
create table profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  created_at    timestamptz not null default now(),
  settings      jsonb not null default '{}'::jsonb   -- cueSettings, orbStyle, centerDisplay...
);

-- custom_patterns: «Свой ритм»
create table custom_patterns (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  name          text not null default '',
  goal          text not null,                         -- calm|focus|fear|recover|sleep|pain|irritation
  inhale        smallint not null,
  hold_in       smallint not null,
  exhale        smallint not null,
  hold_out      smallint not null,
  rounds        smallint not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);
create index on custom_patterns(user_id, updated_at);

-- session_records: история практик (append-heavy)
create table session_records (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  practice_id     text not null,                       -- 'box-breathing' | 'custom:<id>'
  goal            text not null,
  duration_seconds integer not null,
  completed       boolean not null default false,
  reflection      text,                                -- worse|same|better|much_better
  bpm_before      smallint,
  bpm_after       smallint,
  completed_at    timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);
create index on session_records(user_id, completed_at desc);

-- program_progress: активная программа
create table program_progress (
  user_id        uuid primary key references auth.users(id) on delete cascade,
  program_id     text not null,
  started_at     timestamptz not null,
  completed_days smallint[] not null default '{}',
  updated_at     timestamptz not null default now()
);

-- subscriptions: источник правды о доступе (заполняется вебхуками)
create table subscriptions (
  user_id            uuid primary key references auth.users(id) on delete cascade,
  provider           text not null,                    -- stripe|revenuecat
  status             text not null,                    -- active|trialing|canceled|past_due
  plan               text,
  current_period_end timestamptz,
  updated_at         timestamptz not null default now()
);
```

**RLS — каждый видит только своё (критично для health-adjacent данных):**

```sql
alter table custom_patterns enable row level security;
create policy "own rows" on custom_patterns
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- аналогично для session_records, program_progress, profiles.
-- subscriptions: SELECT — свой; запись — только сервисная роль (вебхуки).
```

---

## 5. API-эндпоинты

С Supabase значительная часть CRUD доступна автогенерируемым REST/Realtime под
RLS. Свои функции нужны для (а) офлайн-синхрона батчем и (б) вебхуков оплаты.

```
Auth (провайдер):
  POST  /auth/signup            email/OAuth
  POST  /auth/signin
  POST  /auth/signout
  POST  /auth/refresh

Данные (через PostgREST под RLS или тонкие функции):
  GET   /me                     профиль + settings + entitlements
  PUT   /me/settings            { settings: jsonb }

  GET   /custom-patterns
  POST  /custom-patterns
  PATCH /custom-patterns/:id
  DELETE /custom-patterns/:id   (soft delete → deleted_at)

  GET   /session-records?since=<ts>
  POST  /session-records        (append)

  GET   /program-progress
  PUT   /program-progress

Синхрон (ключевая функция, offline-first):
  POST  /sync
    body:  { since: ISO, changes: { custom_patterns:[...], session_records:[...], ... } }
    resp:  { serverTime: ISO, changes: { ...изменения сервера с момента since } }

Монетизация:
  GET   /me/entitlements        { pro: boolean, until: ISO }
  POST  /webhooks/stripe        (подпись проверяется; обновляет subscriptions)
  POST  /webhooks/revenuecat
```

Контракт `/sync` — основа: клиент шлёт локальные изменения с `updated_at`, сервер
мёржит (last-write-wins по `updated_at`, удаления через `deleted_at`) и отдаёт
свои новые изменения. Так работает офлайн и несколько устройств.

---

## 6. Архитектура фронтенда (offline-first)

Экраны не знают, есть ли сеть. Они говорят с `Repository`. Реализация решает,
читать локально и синхронизировать в фоне.

```
Экран ──▶ Repository<CustomPattern>
                 ├─ LocalRepository   (AsyncStorage)         ← Фаза 0, уже есть
                 └─ SyncedRepository   (local cache + queue + /sync) ← Фаза 1
                          ├─ читает из локального кэша мгновенно
                          ├─ пишет локально + ставит мутацию в очередь
                          └─ syncEngine: фоновый pull/push, разрешение конфликтов
```

Состояние: лёгкий клиентский стейт (Context, как сейчас) + серверные данные
через репозиторий. Высокочастотное (тик таймера) — никогда в Context/сеть.

Правила, которые уже соблюдены и которые держим: движок чистый и тестируемый;
богатые веб-эффекты под `Platform.OS === "web"`; данные — через модули-репозитории.

---

## 7. Прод-код (ключевые куски, готовые к переносу)

### 7.1 Интерфейс репозитория — `src/data/repository.ts`
```ts
export interface SyncableRecord {
  id: string;
  updatedAt: string;     // ISO
  deletedAt?: string | null;
}

export interface Repository<T extends SyncableRecord> {
  list(): Promise<readonly T[]>;
  get(id: string): Promise<T | null>;
  upsert(item: T): Promise<void>;
  remove(id: string): Promise<void>;   // soft delete
}
```
Ваш `customPatternStorage.ts` уже почти реализует это — нужно лишь добавить
`updatedAt` к `CustomPattern` и обернуть в этот интерфейс.

### 7.2 Типизированный API-клиент — `src/api/client.ts`
```ts
const BASE = process.env.EXPO_PUBLIC_API_URL!;

async function authedFetch(path: string, init: RequestInit, token: string | null) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.status === 204 ? null : res.json();
}

export const api = {
  sync: (token: string, body: SyncRequest): Promise<SyncResponse> =>
    authedFetch("/sync", { method: "POST", body: JSON.stringify(body) }, token),
};
```

### 7.3 Sync-движок (суть) — `src/sync/syncEngine.ts`
```ts
// last-write-wins по updatedAt; удаления через deletedAt.
export async function runSync(token: string, repos: SyncBundle): Promise<void> {
  const since = await repos.meta.lastSyncedAt();
  const changes = await repos.collectLocalChangesSince(since);
  const resp = await api.sync(token, { since, changes });
  await repos.applyServerChanges(resp.changes);   // мёрж по updatedAt
  await repos.meta.setLastSyncedAt(resp.serverTime);
}
// Триггеры: при входе, при возврате онлайн, по таймеру/при фокусе.
```

### 7.4 Edge Function `/sync` (Supabase/Deno) — `server/functions/sync/index.ts`
```ts
// Псевдо-обработчик: проверяет JWT, мёржит, возвращает дельту.
Deno.serve(async (req) => {
  const user = await requireUser(req);                 // из JWT
  const { since, changes } = await req.json();
  await upsertUserRows(user.id, changes);              // with check user_id
  const serverChanges = await rowsUpdatedSince(user.id, since);
  return Response.json({ serverTime: new Date().toISOString(), changes: serverChanges });
});
```

### 7.5 Конфиг/секреты
```
EXPO_PUBLIC_API_URL=...        # публично — ок
EXPO_PUBLIC_SUPABASE_ANON=...  # анонимный ключ — ок (под RLS)
# СЕРВЕРНЫЕ секреты (service_role, STRIPE_SECRET) — только на сервере, НИКОГДА в клиент.
```

---

## 8. Масштабирование до миллионов

| Узкое место | Решение |
|---|---|
| Раздача приложения | Статика на CDN — масштабируется само. |
| Чтение профиля/настроек/entitlements | Кэш в Redis (TTL), инвалидция вебхуком. |
| История сессий (растёт) | Партиционирование по дате, read-replica для аналитики. |
| Пиковая запись синхрона | Stateless API за балансировщиком, горизонтальный автоскейл. |
| Reminders / экспорт / вебхуки | Очередь (SQS/Cloud Tasks) + воркеры, идемпотентность. |
| Аналитика | Слать события в PostHog/warehouse, НЕ в основную БД. |
| Холодные старты серверлесс | При большом RPS — вынести `/sync` в постоянный сервис (Fastify/Hono). |

Stateless API + managed Postgres с репликами + кэш + очередь — это и есть
«до миллионов». Никаких микросервисов на старте: один сервис, чёткие границы.

---

## 9. Безопасность и комплаенс (важно: данные о здоровье)

- RLS на всех таблицах — пользователь видит только своё. Тестировать политики.
- Никаких секретов в клиентском бандле (`EXPO_PUBLIC_*` — публичны по определению).
- Биометрия (BPM из PulseCamera) — это чувствительные данные. По умолчанию
  держать локально; на сервер — только с явного согласия, минимизировать,
  шифровать at-rest (managed Postgres делает), не логировать значения.
- GDPR/право на удаление: `DELETE /me` каскадом (`on delete cascade`) + экспорт.
- Дисклеймер «не медицинский продукт» — уже есть, держать в онбординге.
- Вебхуки оплаты — обязательная проверка подписи, идемпотентность по event id.

---

## 10. Стоимость и операционка

- Фаза 0: ~$0 (статика на бесплатном тарифе CDN).
- Фаза 1: Supabase free → ~$25/мес на старте; растёт по использованию.
- Фаза 2: + Stripe (% с платежей), PostHog (free→по событиям), Sentry (free→).
- Один человек способен вести всё это до десятков тысяч пользователей — потому
  что выбран managed-стек, а не самосбор.

---

## 11. Порядок сборки (рекомендация)

1. **Сейчас:** довести клиент (консистентность тем, экран сессии) и задеплоить
   PWA на CDN. Это уже продукт — собирать обратную связь.
2. **Когда просят «сохранить мои ритмы на телефоне и компе»:** Фаза 1 —
   Supabase Auth + Postgres + `/sync`, ввести `Repository` и `SyncedRepository`.
3. **Когда есть удержание и спрос на платное:** Фаза 2 — подписки + аналитика.
4. **Когда есть масштаб:** Фаза 3 — кэш, реплики, очереди, observability.

Главный вывод инженера: ваш MVP — это клиент, и он почти готов. Бэкенд — не
«чтобы было», а под конкретную нужду. Архитектура выше даёт расти до миллионов
**не переписывая клиент** — потому что данные спрятаны за репозиторием, а движок
живёт на устройстве.
