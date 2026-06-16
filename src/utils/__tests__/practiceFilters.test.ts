import { describe, expect, it } from "vitest";
import { breathingPractices } from "@/data/breathingPractices";
import {
  filterPractices,
  getBestPracticeForState,
  getPracticeChoicesForState,
  sortPracticesForToday,
} from "@/utils/practiceFilters";

describe("filterPractices", () => {
  it("filters practices by goal", () => {
    const calmPractices = filterPractices(breathingPractices, { goal: "calm" });

    expect(calmPractices.length).toBeGreaterThan(0);
    expect(calmPractices.every((practice) => practice.goals.includes("calm"))).toBe(true);
  });

  it("filters practices by max duration", () => {
    const shortPractices = filterPractices(breathingPractices, {
      maxDurationSeconds: 240
    });

    expect(shortPractices.length).toBeGreaterThan(0);
    expect(shortPractices.every((practice) => practice.durationSeconds <= 240)).toBe(true);
  });

  it("filters recommended practices", () => {
    const recommended = filterPractices(breathingPractices, { recommendedOnly: true });

    expect(recommended.every((practice) => practice.recommended)).toBe(true);
  });
});

describe("sortPracticesForToday", () => {
  it("puts recommended practices first", () => {
    const sorted = sortPracticesForToday(breathingPractices);

    expect(sorted[0].recommended).toBe(true);
  });
});

describe("getBestPracticeForState", () => {
  it("returns a practice for calm state", () => {
    const practice = getBestPracticeForState(breathingPractices, "calm");

    expect(practice).toBeDefined();
    expect(practice?.goals).toContain("calm");
  });

  it("returns a practice for fear state", () => {
    const practice = getBestPracticeForState(breathingPractices, "fear");

    expect(practice).toBeDefined();
    expect(practice?.goals).toContain("fear");
    expect(practice?.recommended).toBe(true);
  });

  it("returns a practice for recover state", () => {
    const practice = getBestPracticeForState(breathingPractices, "recover");

    expect(practice).toBeDefined();
    expect(practice?.goals).toContain("recover");
  });

  it("returns a practice for sleep state", () => {
    const practice = getBestPracticeForState(breathingPractices, "sleep");

    expect(practice).toBeDefined();
    expect(practice?.goals).toContain("sleep");
  });

  it("returns a practice for focus state", () => {
    const practice = getBestPracticeForState(breathingPractices, "focus");

    expect(practice).toBeDefined();
    expect(practice?.goals).toContain("focus");
  });

  it("returns a practice for pain state", () => {
    const practice = getBestPracticeForState(breathingPractices, "pain");

    expect(practice).toBeDefined();
    expect(practice?.goals).toContain("pain");
  });

  it("returns a practice for irritation state", () => {
    const practice = getBestPracticeForState(breathingPractices, "irritation");

    expect(practice).toBeDefined();
    expect(practice?.goals).toContain("irritation");
  });

  it("returns a recommended practice when available", () => {
    const practice = getBestPracticeForState(breathingPractices, "calm");

    expect(practice?.recommended).toBe(true);
  });
});

describe("getPracticeChoicesForState", () => {
  it.each([
    ["calm", "long-exhale"],
    ["focus", "box-breathing"],
    ["recover", "coherent-breathing"],
    ["sleep", "sleep-wind-down"],
    ["pain", "body-softening"],
    ["irritation", "irritation-pause"],
  ] as const)("puts %s first", (goal, expectedPracticeId) => {
    const choices = getPracticeChoicesForState(breathingPractices, goal);

    expect(choices.length).toBeGreaterThan(0);
    expect(choices[0].id).toBe(expectedPracticeId);
    expect(choices[0].goals).toContain(goal);
  });

  it("keeps physiological sigh available for fear but not first for calm choices", () => {
    const calmChoices = getPracticeChoicesForState(breathingPractices, "calm");
    const fearChoices = getPracticeChoicesForState(breathingPractices, "fear");

    expect(calmChoices[0].id).not.toBe("physiological-sigh");
    expect(fearChoices[0].id).toBe("physiological-sigh");
  });
});
