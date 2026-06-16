import { describe, expect, it } from "vitest";
import { fearCopy } from "@/data/fearCopy";
import { breathingPractices } from "@/data/breathingPractices";

describe("fearCopy", () => {
  it("has a non-empty preparation string", () => {
    expect(fearCopy.preparation.length).toBeGreaterThan(0);
  });

  it("has a non-empty hint string", () => {
    expect(fearCopy.hint.length).toBeGreaterThan(0);
  });

  it("has at least 5 grounding phrases", () => {
    expect(fearCopy.grounding.length).toBeGreaterThanOrEqual(5);
  });

  it("all grounding phrases are non-empty strings", () => {
    for (const phrase of fearCopy.grounding) {
      expect(typeof phrase).toBe("string");
      expect(phrase.length).toBeGreaterThan(0);
    }
  });

  it("grounding phrases are unique", () => {
    const unique = new Set(fearCopy.grounding);
    expect(unique.size).toBe(fearCopy.grounding.length);
  });

  it("roundIndex modulo cycles through all grounding phrases", () => {
    const len = fearCopy.grounding.length;
    const seen = new Set<string>();
    for (let i = 0; i < len * 2; i++) {
      seen.add(fearCopy.grounding[i % len]);
    }
    expect(seen.size).toBe(len);
  });
});

describe("fear-anchor practice", () => {
  const fearAnchor = breathingPractices.find((p) => p.id === "fear-anchor");

  it("exists in breathingPractices", () => {
    expect(fearAnchor).toBeDefined();
  });

  it("has durationSeconds matching actual pattern length (192s)", () => {
    if (!fearAnchor) return;
    const phaseTotal = fearAnchor.pattern.phases.reduce((sum, p) => sum + p.durationSeconds, 0);
    const actual = phaseTotal * fearAnchor.pattern.rounds;
    expect(actual).toBe(192);
    expect(fearAnchor.durationSeconds).toBe(actual);
  });

  it("goal is 'fear'", () => {
    expect(fearAnchor?.goal).toBe("fear");
  });
});
