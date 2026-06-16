import type { BreathingPhaseName } from "@/types/breathing";

export type OrbPhaseTarget = Readonly<{
  breathTarget: number;
  emphasisTarget: number;
  coreOpacityTarget: number;
  isStill: boolean;
}>;

export function getOrbPhaseTarget(phaseName: BreathingPhaseName, running: boolean): OrbPhaseTarget {
  if (!running) {
    return {
      breathTarget: 0,
      emphasisTarget: 0,
      coreOpacityTarget: 0.68,
      isStill: true,
    };
  }

  if (phaseName === "inhale" || phaseName === "sigh") {
    return {
      breathTarget: 1,
      emphasisTarget: 1,
      coreOpacityTarget: 0.9,
      isStill: false,
    };
  }

  if (phaseName === "hold") {
    return {
      breathTarget: 1,
      emphasisTarget: 0.72,
      coreOpacityTarget: 0.82,
      isStill: true,
    };
  }

  if (phaseName === "pause") {
    return {
      breathTarget: 0,
      emphasisTarget: 0.36,
      coreOpacityTarget: 0.72,
      isStill: true,
    };
  }

  return {
    breathTarget: 0,
    emphasisTarget: 0.48,
    coreOpacityTarget: 0.76,
    isStill: false,
  };
}
