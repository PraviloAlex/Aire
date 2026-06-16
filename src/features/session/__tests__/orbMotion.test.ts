import { describe, expect, it } from "vitest";
import { getOrbPhaseTarget } from "@/features/session/orbMotion";

describe("getOrbPhaseTarget", () => {
  it("expands on inhale", () => {
    expect(getOrbPhaseTarget("inhale", true)).toMatchObject({
      breathTarget: 1,
      isStill: false,
    });
  });

  it("expands on sigh", () => {
    expect(getOrbPhaseTarget("sigh", true)).toMatchObject({
      breathTarget: 1,
      isStill: false,
    });
  });

  it("stays expanded on hold", () => {
    expect(getOrbPhaseTarget("hold", true)).toMatchObject({
      breathTarget: 1,
      isStill: true,
    });
  });

  it("contracts on exhale and rest", () => {
    expect(getOrbPhaseTarget("exhale", true).breathTarget).toBe(0);
    expect(getOrbPhaseTarget("rest", true).breathTarget).toBe(0);
  });

  it("stays contracted on pause", () => {
    expect(getOrbPhaseTarget("pause", true)).toMatchObject({
      breathTarget: 0,
      isStill: true,
    });
  });

  it("returns idle targets when not running", () => {
    expect(getOrbPhaseTarget("inhale", false)).toMatchObject({
      breathTarget: 0,
      emphasisTarget: 0,
      isStill: true,
    });
  });
});
