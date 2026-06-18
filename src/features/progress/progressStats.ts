import type { BreathingGoal, ReflectionRating, SessionRecord } from "@/types/breathing";

export type ProgressStats = Readonly<{
  totalSessions: number;
  totalMinutes: number;
  topGoal: BreathingGoal | null;
  weekSessions: number;
  isFirstTime: boolean;
}>;

const WEEK_MS = 7 * 86_400_000;

export function computeProgressStats(records: readonly SessionRecord[]): ProgressStats {
  if (records.length === 0) {
    return {
      totalSessions: 0,
      totalMinutes: 0,
      topGoal: null,
      weekSessions: 0,
      isFirstTime: true,
    };
  }

  const totalSessions = records.length;
  const totalMinutes = Math.round(
    records.reduce((sum, r) => sum + r.durationSeconds, 0) / 60
  );

  const now = Date.now();
  const weekSessions = records.filter(
    (r) => now - new Date(r.completedAt).getTime() < WEEK_MS
  ).length;

  const counts: Partial<Record<BreathingGoal, number>> = {};
  for (const r of records) {
    counts[r.goal] = (counts[r.goal] ?? 0) + 1;
  }
  const topGoal =
    (Object.entries(counts).sort(([, a], [, b]) => (b ?? 0) - (a ?? 0))[0]?.[0] ??
      null) as BreathingGoal | null;

  return { totalSessions, totalMinutes, topGoal, weekSessions, isFirstTime: false };
}

export function getLastPracticeId(records: readonly SessionRecord[]): string | null {
  if (records.length === 0) return null;
  const sorted = [...records].sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );
  return sorted[0]?.practiceId ?? null;
}

export function getPracticeUsageCounts(records: readonly SessionRecord[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const r of records) {
    counts[r.practiceId] = (counts[r.practiceId] ?? 0) + 1;
  }
  return counts;
}

export function getFavoritePracticeId(records: readonly SessionRecord[]): string | null {
  if (records.length === 0) return null;
  const counts = getPracticeUsageCounts(records);
  const entries = Object.entries(counts);
  if (entries.length === 0) return null;
  return entries.sort(([, a], [, b]) => b - a)[0]?.[0] ?? null;
}

const HELPED_RATINGS: readonly ReflectionRating[] = ["better", "much_better"];

export function getHelpRate(records: readonly SessionRecord[]): number {
  const withReflection = records.filter(
    (r) => r.reflection !== null && r.reflection !== undefined
  );
  if (withReflection.length === 0) return 0;
  const helped = withReflection.filter((r) => HELPED_RATINGS.includes(r.reflection as ReflectionRating));
  return helped.length / withReflection.length;
}
