import { describe, expect, it } from "vitest";
import { sessionStatePhrases } from "@/features/session/sessionStateCopy";
import type { BreathingGoal } from "@/types/breathing";

const GOALS: readonly BreathingGoal[] = [
  "calm",
  "focus",
  "fear",
  "recover",
  "sleep",
  "pain",
  "irritation",
];

describe("sessionStatePhrases", () => {
  it("has a phrase for every breathing goal", () => {
    for (const goal of GOALS) {
      expect(sessionStatePhrases[goal]).toBeTruthy();
    }
  });

  it("keeps phrases short enough for the session screen", () => {
    for (const phrase of Object.values(sessionStatePhrases)) {
      expect(phrase.length).toBeLessThanOrEqual(36);
    }
  });
});
