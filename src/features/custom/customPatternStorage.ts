import AsyncStorage from "@react-native-async-storage/async-storage";
import type { BreathingGoal } from "@/types/breathing";
import { clampRounds, clampSeconds, type CustomPattern } from "@/features/custom/customPattern";
import { nowIso, type Repository } from "@/data/repository";

const PRESETS_KEY = "aire:custom_patterns";
const DRAFT_KEY = "aire:custom_draft";
const MAX_PRESETS = 50;

const GOALS: readonly BreathingGoal[] = [
  "calm",
  "focus",
  "fear",
  "recover",
  "sleep",
  "pain",
  "irritation",
];

export function generateCustomId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/** Жёсткая валидация + нормализация (клампы) произвольного значения в CustomPattern. */
export function parseCustomPattern(value: unknown): CustomPattern | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  const seconds = v.seconds as Record<string, unknown> | undefined;
  if (
    typeof v.id !== "string" ||
    typeof v.name !== "string" ||
    typeof v.goal !== "string" ||
    !GOALS.includes(v.goal as BreathingGoal) ||
    typeof v.rounds !== "number" ||
    !seconds ||
    typeof seconds !== "object"
  ) {
    return null;
  }
  const numberOr = (x: unknown): number => (typeof x === "number" ? x : 0);
  return {
    id: v.id,
    name: v.name,
    goal: v.goal as BreathingGoal,
    rounds: clampRounds(v.rounds),
    seconds: {
      inhale: clampSeconds(numberOr(seconds.inhale)),
      holdIn: clampSeconds(numberOr(seconds.holdIn)),
      exhale: clampSeconds(numberOr(seconds.exhale)),
      holdOut: clampSeconds(numberOr(seconds.holdOut)),
    },
    updatedAt: typeof v.updatedAt === "string" ? v.updatedAt : undefined,
    deletedAt: typeof v.deletedAt === "string" ? v.deletedAt : undefined,
  };
}

export async function loadCustomPatterns(): Promise<readonly CustomPattern[]> {
  try {
    const raw = await AsyncStorage.getItem(PRESETS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(parseCustomPattern).filter((p): p is CustomPattern => p !== null);
  } catch {
    return [];
  }
}

async function writePatterns(list: readonly CustomPattern[]): Promise<void> {
  await AsyncStorage.setItem(PRESETS_KEY, JSON.stringify(list.slice(0, MAX_PRESETS)));
}

/** Добавить новый или обновить существующий пресет (по id). Возвращает новый список. */
export async function saveCustomPattern(pattern: CustomPattern): Promise<readonly CustomPattern[]> {
  const existing = await loadCustomPatterns();
  const stamped: CustomPattern = { ...pattern, updatedAt: nowIso() };
  const index = existing.findIndex((p) => p.id === pattern.id);
  const next = index >= 0
    ? existing.map((p) => (p.id === pattern.id ? stamped : p))
    : [stamped, ...existing];
  try {
    await writePatterns(next);
  } catch {
    // Ошибки хранилища не фатальны.
  }
  return next.slice(0, MAX_PRESETS);
}

export async function deleteCustomPattern(id: string): Promise<readonly CustomPattern[]> {
  const existing = await loadCustomPatterns();
  const next = existing.filter((p) => p.id !== id);
  try {
    await writePatterns(next);
  } catch {
    // no-op
  }
  return next;
}

export async function getCustomPatternById(id: string): Promise<CustomPattern | null> {
  const all = await loadCustomPatterns();
  return all.find((p) => p.id === id) ?? null;
}

/** Черновик для быстрого «Запустить» без сохранения в список. */
export async function saveCustomDraft(pattern: CustomPattern): Promise<void> {
  try {
    await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(pattern));
  } catch {
    // no-op
  }
}

export async function loadCustomDraft(): Promise<CustomPattern | null> {
  try {
    const raw = await AsyncStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return parseCustomPattern(JSON.parse(raw));
  } catch {
    return null;
  }
}

// Адаптер к общему интерфейсу Repository (готовность к синхрону). Экраны могут
// постепенно переходить на него; существующие функции выше остаются.
export const customPatternRepository: Repository<CustomPattern> = {
  list: () => loadCustomPatterns(),
  get: (id) => getCustomPatternById(id),
  upsert: (pattern) => saveCustomPattern(pattern),
  remove: (id) => deleteCustomPattern(id),
};
