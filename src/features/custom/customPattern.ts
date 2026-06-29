import type {
  BreathingGoal,
  BreathingPhase,
  BreathingPhaseName,
  BreathingPractice,
} from "@/types/breathing";

/** Длительности четырёх слотов своего паттерна, в секундах (0 = фаза пропускается). */
export type CustomPhaseSeconds = Readonly<{
  inhale: number;
  holdIn: number;
  exhale: number;
  holdOut: number;
}>;

/** Сохраняемый пользовательский паттерн. */
export type CustomPattern = Readonly<{
  id: string;
  name: string;
  goal: BreathingGoal;
  rounds: number;
  seconds: CustomPhaseSeconds;
  updatedAt?: string;
  deletedAt?: string | null;
}>;

export const PHASE_MIN_SECONDS = 0;
export const PHASE_MAX_SECONDS = 30;
export const ROUNDS_MIN = 1;
export const ROUNDS_MAX = 60;

export const DEFAULT_CUSTOM_PATTERN: CustomPattern = {
  id: "draft",
  name: "",
  goal: "calm",
  rounds: 8,
  seconds: { inhale: 4, holdIn: 4, exhale: 4, holdOut: 4 },
};

type SlotMeta = Readonly<{ name: BreathingPhaseName; label: string; shortLabel: string; cueTone: BreathingPhase["cueTone"] }>;

const SLOT_META: Readonly<Record<keyof CustomPhaseSeconds, SlotMeta>> = {
  inhale: { name: "inhale", label: "Вдох", shortLabel: "Вдох", cueTone: "start" },
  holdIn: { name: "hold", label: "Пауза", shortLabel: "Пауза", cueTone: "shift" },
  exhale: { name: "exhale", label: "Выдох", shortLabel: "Выдох", cueTone: "soft" },
  holdOut: { name: "pause", label: "Пауза", shortLabel: "Пауза", cueTone: "shift" },
};

const SLOT_ORDER: readonly (keyof CustomPhaseSeconds)[] = ["inhale", "holdIn", "exhale", "holdOut"];

export function clampSeconds(value: number): number {
  if (!Number.isFinite(value)) return PHASE_MIN_SECONDS;
  return Math.min(PHASE_MAX_SECONDS, Math.max(PHASE_MIN_SECONDS, Math.round(value)));
}

export function clampRounds(value: number): number {
  if (!Number.isFinite(value)) return ROUNDS_MIN;
  return Math.min(ROUNDS_MAX, Math.max(ROUNDS_MIN, Math.round(value)));
}

/** Сумма длительностей одного круга (без учёта количества раундов). */
export function roundSeconds(seconds: CustomPhaseSeconds): number {
  return SLOT_ORDER.reduce((total, slot) => total + clampSeconds(seconds[slot]), 0);
}

/** Полная длительность паттерна с учётом раундов. */
export function totalSeconds(pattern: CustomPattern): number {
  return roundSeconds(pattern.seconds) * clampRounds(pattern.rounds);
}

/** Есть ли в паттерне хотя бы одна ненулевая фаза. */
export function isPlayable(pattern: CustomPattern): boolean {
  return roundSeconds(pattern.seconds) > 0;
}

function buildPhases(seconds: CustomPhaseSeconds): BreathingPhase[] {
  return SLOT_ORDER.filter((slot) => clampSeconds(seconds[slot]) > 0).map((slot) => {
    const meta = SLOT_META[slot];
    return {
      name: meta.name,
      label: meta.label,
      shortLabel: meta.shortLabel,
      durationSeconds: clampSeconds(seconds[slot]),
      cueTone: meta.cueTone,
    };
  });
}

function patternSummary(pattern: CustomPattern): string {
  const { inhale, holdIn, exhale, holdOut } = pattern.seconds;
  const rhythm = [inhale, holdIn, exhale, holdOut].map((value) => clampSeconds(value)).join("-");
  return `Свой ритм ${rhythm}, ${clampRounds(pattern.rounds)} циклов.`;
}

/**
 * Превращает пользовательский паттерн в полноценный BreathingPractice,
 * который понимает существующий движок сессии. Никакой отдельной логики
 * воспроизведения не нужно — переиспользуем весь экран сессии.
 */
export function buildCustomPractice(pattern: CustomPattern): BreathingPractice {
  const phases = buildPhases(pattern.seconds);
  const rounds = clampRounds(pattern.rounds);
  const trimmedName = pattern.name.trim();

  return {
    id: `custom:${pattern.id}`,
    title: trimmedName.length > 0 ? trimmedName : "Свой паттерн",
    subtitle: "Свой ритм дыхания",
    goal: pattern.goal,
    goals: [pattern.goal],
    durationSeconds: totalSeconds(pattern),
    intensity: "balanced",
    recommended: false,
    summary: patternSummary(pattern),
    benefits: [],
    safetyNote:
      "Свой ритм — слушайте тело. Остановитесь при головокружении, боли или сильном дискомфорте.",
    pattern: { rounds, phases },
  };
}

/**
 * Базовый ритм под каждое состояние — точка старта, которую пользователь
 * докручивает под себя. Значения согласованы с ритмами практик на главной.
 */
export const BASE_RHYTHM_BY_GOAL: Readonly<Record<BreathingGoal, { seconds: CustomPhaseSeconds; rounds: number }>> = {
  calm: { seconds: { inhale: 4, holdIn: 0, exhale: 6, holdOut: 0 }, rounds: 12 },
  focus: { seconds: { inhale: 4, holdIn: 4, exhale: 4, holdOut: 4 }, rounds: 8 },
  fear: { seconds: { inhale: 4, holdIn: 0, exhale: 8, holdOut: 0 }, rounds: 10 },
  recover: { seconds: { inhale: 5, holdIn: 0, exhale: 7, holdOut: 0 }, rounds: 12 },
  sleep: { seconds: { inhale: 4, holdIn: 0, exhale: 8, holdOut: 0 }, rounds: 12 },
  pain: { seconds: { inhale: 4, holdIn: 0, exhale: 6, holdOut: 0 }, rounds: 12 },
  irritation: { seconds: { inhale: 4, holdIn: 0, exhale: 6, holdOut: 0 }, rounds: 12 },
};

export function baseForGoal(goal: BreathingGoal): { seconds: CustomPhaseSeconds; rounds: number } {
  return BASE_RHYTHM_BY_GOAL[goal];
}
