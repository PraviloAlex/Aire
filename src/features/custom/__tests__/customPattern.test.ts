import { describe, expect, it } from "vitest";
import {
  buildCustomPractice,
  clampRounds,
  clampSeconds,
  DEFAULT_CUSTOM_PATTERN,
  isPlayable,
  roundSeconds,
  totalSeconds,
  type CustomPattern,
} from "@/features/custom/customPattern";
import { parseCustomPattern } from "@/features/custom/customPatternStorage";

const base: CustomPattern = {
  id: "p1",
  name: "Мой ритм",
  goal: "calm",
  rounds: 5,
  seconds: { inhale: 4, holdIn: 2, exhale: 6, holdOut: 0 },
};

describe("clamps", () => {
  it("clampSeconds bounds and rounds value", () => {
    expect(clampSeconds(-3)).toBe(0);
    expect(clampSeconds(999)).toBe(30);
    expect(clampSeconds(4.6)).toBe(5);
    expect(clampSeconds(Number.NaN)).toBe(0);
  });

  it("clampRounds keeps at least one round", () => {
    expect(clampRounds(0)).toBe(1);
    expect(clampRounds(100)).toBe(60);
    expect(clampRounds(8)).toBe(8);
  });
});

describe("duration math", () => {
  it("roundSeconds sums the four slots", () => {
    expect(roundSeconds(base.seconds)).toBe(12);
  });

  it("totalSeconds multiplies by rounds", () => {
    expect(totalSeconds(base)).toBe(60);
  });

  it("isPlayable is false when all phases are zero", () => {
    expect(isPlayable({ ...base, seconds: { inhale: 0, holdIn: 0, exhale: 0, holdOut: 0 } })).toBe(false);
    expect(isPlayable(base)).toBe(true);
  });
});

describe("buildCustomPractice", () => {
  it("drops zero-length phases and keeps order", () => {
    const practice = buildCustomPractice(base);
    expect(practice.pattern.phases.map((p) => p.name)).toEqual(["inhale", "hold", "exhale"]);
    expect(practice.pattern.rounds).toBe(5);
    expect(practice.durationSeconds).toBe(60);
    expect(practice.goal).toBe("calm");
    expect(practice.id).toBe("custom:p1");
    expect(practice.title).toBe("Мой ритм");
  });

  it("falls back to a default title when name is empty", () => {
    const practice = buildCustomPractice({ ...base, name: "   " });
    expect(practice.title).toBe("Свой паттерн");
  });

  it("produces a valid practice from defaults", () => {
    const practice = buildCustomPractice(DEFAULT_CUSTOM_PATTERN);
    expect(practice.pattern.phases.length).toBe(4);
    expect(practice.durationSeconds).toBe(128);
  });
});

describe("parseCustomPattern", () => {
  it("normalizes and clamps a raw object", () => {
    const parsed = parseCustomPattern({
      id: "x",
      name: "n",
      goal: "focus",
      rounds: 999,
      seconds: { inhale: -1, holdIn: 4, exhale: 100, holdOut: 2 },
    });
    expect(parsed).not.toBeNull();
    expect(parsed?.rounds).toBe(60);
    expect(parsed?.seconds).toEqual({ inhale: 0, holdIn: 4, exhale: 30, holdOut: 2 });
  });

  it("rejects invalid input", () => {
    expect(parseCustomPattern(null)).toBeNull();
    expect(parseCustomPattern({ id: "x" })).toBeNull();
    expect(parseCustomPattern({ id: "x", name: "n", goal: "nope", rounds: 3, seconds: {} })).toBeNull();
  });
});
