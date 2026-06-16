import { describe, expect, it } from "vitest";
import { getPhraseForRound, supportPhrases } from "@/data/supportPhrases";
import type { BreathingGoal } from "@/types/breathing";

describe("supportPhrases", () => {
  it("has phrases for all goals", () => {
    const goals: BreathingGoal[] = ["calm", "focus", "fear", "recover", "sleep", "pain", "irritation"];
    goals.forEach((goal) => {
      expect(supportPhrases[goal].length).toBeGreaterThan(0);
    });
  });
});

describe("getPhraseForRound", () => {
  it("returns a string for round 0", () => {
    expect(typeof getPhraseForRound("calm", 0)).toBe("string");
  });

  it("cycles through phrases — round >= phrases.length wraps around", () => {
    const phrases = supportPhrases["fear"];
    const len = phrases.length;
    expect(getPhraseForRound("fear", 0)).toBe(phrases[0]);
    expect(getPhraseForRound("fear", len)).toBe(phrases[0]);
    expect(getPhraseForRound("fear", len + 1)).toBe(phrases[1]);
  });

  it("returns different phrases for consecutive rounds when multiple phrases exist", () => {
    if (supportPhrases["calm"].length > 1) {
      const p0 = getPhraseForRound("calm", 0);
      const p1 = getPhraseForRound("calm", 1);
      expect(p0).not.toBe(p1);
    }
  });

  it("works for all goals at round 0", () => {
    const goals: BreathingGoal[] = ["calm", "focus", "fear", "recover", "sleep", "pain", "irritation"];
    goals.forEach((goal) => {
      const phrase = getPhraseForRound(goal, 0);
      expect(typeof phrase).toBe("string");
      expect(phrase.length).toBeGreaterThan(0);
    });
  });
});
