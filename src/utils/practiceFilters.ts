import type { BreathingGoal, BreathingPractice } from "@/types/breathing";

const STATE_CHOICE_ORDER: Record<BreathingGoal, readonly string[]> = {
  calm: ["long-exhale", "coherent-breathing", "box-breathing"],
  focus: ["box-breathing", "coherent-breathing", "wake-up-breath"],
  fear: ["physiological-sigh", "fear-anchor", "long-exhale"],
  recover: ["coherent-breathing", "recovery-breath", "long-exhale"],
  sleep: ["sleep-wind-down", "long-exhale", "four-seven-eight"],
  pain: ["body-softening", "long-exhale", "coherent-breathing"],
  irritation: ["irritation-pause", "long-exhale", "box-breathing"],
};

export type PracticeFilter = Readonly<{
  goal?: BreathingGoal | "all";
  maxDurationSeconds?: number;
  recommendedOnly?: boolean;
}>;

export function filterPractices(
  practices: readonly BreathingPractice[],
  filter: PracticeFilter
): readonly BreathingPractice[] {
  return practices.filter((practice) => {
    const goalMatches =
      !filter.goal || filter.goal === "all" || practice.goals.includes(filter.goal);
    const durationMatches =
      !filter.maxDurationSeconds || practice.durationSeconds <= filter.maxDurationSeconds;
    const recommendationMatches = !filter.recommendedOnly || practice.recommended;

    return goalMatches && durationMatches && recommendationMatches;
  });
}

export function sortPracticesForToday(
  practices: readonly BreathingPractice[]
): readonly BreathingPractice[] {
  return [...practices].sort((left, right) => {
    if (left.recommended !== right.recommended) {
      return left.recommended ? -1 : 1;
    }

    return left.durationSeconds - right.durationSeconds;
  });
}

export function getBestPracticeForState(
  practices: readonly BreathingPractice[],
  goal: BreathingGoal
): BreathingPractice | undefined {
  const matching = filterPractices(practices, { goal, recommendedOnly: true });
  const sorted = sortPracticesForToday([...matching]);
  return sorted[0] ?? filterPractices(practices, { goal })[0];
}

export function getPracticeChoicesForState(
  practices: readonly BreathingPractice[],
  goal: BreathingGoal
): readonly BreathingPractice[] {
  const matching = filterPractices(practices, { goal });
  const order = STATE_CHOICE_ORDER[goal];

  const ranked = order
    .map((id) => matching.find((practice) => practice.id === id))
    .filter((practice): practice is BreathingPractice => Boolean(practice));

  const rankedIds = new Set(ranked.map((practice) => practice.id));
  const fallback = sortPracticesForToday(matching)
    .filter((practice) => !rankedIds.has(practice.id));

  return [...ranked, ...fallback];
}
