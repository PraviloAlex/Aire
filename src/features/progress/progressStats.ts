import type { BreathingGoal, SessionRecord } from "@/types/breathing";

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
