import { describe, expect, it } from "vitest";
import {
  baseForGoal,
  buildCustomPractice,
  isPlayable,
  type CustomPattern,
} from "@/features/custom/customPattern";
import type { BreathingGoal } from "@/types/breathing";

const GOALS: readonly BreathingGoal[] = ["calm", "focus", "fear", "recover", "sleep", "pain", "irritation"];

describe("baseForGoal", () => {
  it("returns a playable base for every goal", () => {
    for (const g of GOALS) {
      const base = baseForGoal(g);
      const pattern: CustomPattern = { id: "t", name: "", goal: g, rounds: base.rounds, seconds: base.seconds };
      expect(isPlayable(pattern)).toBe(true);
      expect(buildCustomPractice(pattern).pattern.phases.length).toBeGreaterThan(0);
    }
  });

  it("fear uses a longer exhale than inhale", () => {
    const fear = baseForGoal("fear").seconds;
    expect(fear.exhale).toBeGreaterThan(fear.inhale);
  });

  it("focus is box breathing", () => {
    expect(baseForGoal("focus").seconds).toEqual({ inhale: 4, holdIn: 4, exhale: 4, holdOut: 4 });
  });
});
