import { describe, expect, it } from "vitest";
import { breathingPractices } from "@/data/breathingPractices";
import { getPhaseHint } from "@/features/session/phaseHints";

const MAX_HINT_LENGTH = 32;

describe("phaseHints", () => {
  it("provides a hint for every phase of every practice", () => {
    for (const practice of breathingPractices) {
      for (const phase of practice.pattern.phases) {
        const hint = getPhaseHint(practice.goal, phase.name);
        expect(hint, `${practice.id} / ${phase.name}`).toBeTruthy();
      }
    }
  });

  it("keeps hints short enough for the session screen", () => {
    for (const practice of breathingPractices) {
      for (const phase of practice.pattern.phases) {
        const hint = getPhaseHint(practice.goal, phase.name);
        expect(hint && hint.length, `${practice.id} / ${phase.name}`).toBeLessThanOrEqual(
          MAX_HINT_LENGTH
        );
      }
    }
  });
});
