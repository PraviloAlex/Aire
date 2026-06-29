import type { BreathingGoal } from "./breathing";

export type SoundscapeSynthType = "none" | "rain" | "drone" | "warm";

export type Soundscape = Readonly<{
  id: string;
  title: string;
  description: string;
  synthType: SoundscapeSynthType;
  suggestedGoals: readonly BreathingGoal[];
  baseVolume: number;
}>;
