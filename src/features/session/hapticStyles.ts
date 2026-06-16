import type { BreathingPhaseName } from "@/types/breathing";

export type HapticStyle = "light" | "medium" | "heavy" | null;

export function hapticStyleForPhase(name: BreathingPhaseName): HapticStyle {
  if (name === "inhale" || name === "sigh") return "medium";
  if (name === "hold") return "light";
  if (name === "exhale") return "light";
  return null; // pause, rest — no haptic
}
