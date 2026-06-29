import type { BreathingGoal } from "./breathing";

export type ProgramDay = Readonly<{
  day: number;
  practiceId: string;
  focus: string;
}>;

export type Program = Readonly<{
  id: string;
  title: string;
  subtitle: string;
  goal: BreathingGoal;
  lengthDays: number;
  accent: BreathingGoal;
  days: readonly ProgramDay[];
  isPremium?: boolean;
}>;

export type ProgramProgress = Readonly<{
  programId: string;
  startedAt: string;
  completedDays: readonly number[];
  updatedAt?: string;
}>;
