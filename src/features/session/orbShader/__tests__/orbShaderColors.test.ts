import { describe, expect, it } from "vitest";
import { getOrbShaderColors, hexToRgb } from "@/features/session/orbShader/orbShaderColors";
import type { BreathingGoal } from "@/types/breathing";

const ALL_GOALS: readonly BreathingGoal[] = ["calm", "focus", "fear", "recover", "sleep", "pain", "irritation"];

describe("hexToRgb", () => {
  it("converts a hex string to normalized rgb in 0..1", () => {
    expect(hexToRgb("#ffffff")).toEqual([1, 1, 1]);
    expect(hexToRgb("#000000")).toEqual([0, 0, 0]);
  });

  it("handles hex without the leading hash", () => {
    expect(hexToRgb("8ce6f5")).toEqual(hexToRgb("#8ce6f5"));
  });

  it("returns three channels each within 0..1", () => {
    const rgb = hexToRgb("#4fc3d4");
    expect(rgb).toHaveLength(3);
    for (const channel of rgb) {
      expect(channel).toBeGreaterThanOrEqual(0);
      expect(channel).toBeLessThanOrEqual(1);
    }
  });
});

describe("getOrbShaderColors", () => {
  it("returns c1/c2/c3 triples for every breathing goal", () => {
    for (const goal of ALL_GOALS) {
      const colors = getOrbShaderColors(goal);
      for (const triple of [colors.c1, colors.c2, colors.c3]) {
        expect(triple).toHaveLength(3);
      }
    }
  });

  it("maps the calm core token into c1", () => {
    // stateOrbColors.calm.core = "#8CE6F5"
    expect(getOrbShaderColors("calm").c1).toEqual(hexToRgb("#8CE6F5"));
  });
});
