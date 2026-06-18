import type { BreathingGoal, BreathingPhaseName } from "@/types/breathing";

export type HapticStyle = "light" | "medium" | "heavy" | null;

export function hapticStyleForPhase(name: BreathingPhaseName, goal?: BreathingGoal): HapticStyle {
  if (goal === "sleep") return null;
  if (name === "inhale" || name === "sigh") return "light";
  if (name === "hold") return "light";
  if (name === "exhale") return "light";
  return null; // pause, rest — no haptic
}
