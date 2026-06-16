import { describe, expect, it } from "vitest";
import { breathingPractices } from "@/data/breathingPractices";
import { getPracticeForSituation, situations } from "@/data/situations";
import type { BreathingGoal } from "@/types/breathing";

const VALID_GOALS = new Set<BreathingGoal>([
  "calm",
  "focus",
  "fear",
  "recover",
  "sleep",
  "pain",
  "irritation",
]);

describe("situations data", () => {
  it("has at least 8 situations", () => {
    expect(situations.length).toBeGreaterThanOrEqual(8);
  });

  it("all ids are unique", () => {
    const ids = situations.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all goals are valid BreathingGoal values", () => {
    for (const situation of situations) {
      expect(VALID_GOALS.has(situation.goal)).toBe(true);
    }
  });

  it("covers all 5 goals", () => {
    const covered = new Set(situations.map((s) => s.goal));
    for (const goal of VALID_GOALS) {
      expect(covered.has(goal)).toBe(true);
    }
  });

  it("all labels and sublabels are non-empty strings", () => {
    for (const situation of situations) {
      expect(situation.label.length).toBeGreaterThan(0);
      expect(situation.sublabel.length).toBeGreaterThan(0);
    }
  });

  it("all icons are non-empty strings", () => {
    for (const situation of situations) {
      expect(typeof situation.icon).toBe("string");
      expect(situation.icon.length).toBeGreaterThan(0);
    }
  });
});

describe("getPracticeForSituation", () => {
  it("returns a practice for every situation", () => {
    for (const situation of situations) {
      const practice = getPracticeForSituation(situation, breathingPractices);
      expect(practice).toBeDefined();
    }
  });

  it("returned practice goal matches situation goal or includes it in goals", () => {
    for (const situation of situations) {
      const practice = getPracticeForSituation(situation, breathingPractices);
      if (practice) {
        expect(practice.goals.includes(situation.goal) || practice.goal === situation.goal).toBe(true);
      }
    }
  });

  it("returns undefined for empty practice list", () => {
    const result = getPracticeForSituation(situations[0], []);
    expect(result).toBeUndefined();
  });
});
