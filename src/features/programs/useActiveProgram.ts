import { useCallback, useEffect, useState } from "react";
import { getProgramById } from "@/data/programs";
import { getPracticeById } from "@/data/breathingPractices";
import {
  clearActiveProgram,
  loadActiveProgram,
  markDayComplete,
  startProgram,
} from "@/storage/programStorage";
import type { Program, ProgramProgress } from "@/types/program";
import type { BreathingPractice } from "@/types/breathing";

export type ActiveProgramState = {
  program: Program | null;
  progress: ProgramProgress | null;
  currentDay: number | null;
  todayPractice: BreathingPractice | null;
  isLoading: boolean;
  start: (programId: string) => Promise<void>;
  complete: (day: number) => Promise<void>;
  stop: () => Promise<void>;
};

export function resolveCurrentDay(
  program: Program,
  progress: ProgramProgress
): number | null {
  for (const d of program.days) {
    if (!progress.completedDays.includes(d.day)) return d.day;
  }
  return null;
}

export function useActiveProgram(): ActiveProgramState {
  const [progress, setProgress] = useState<ProgramProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadActiveProgram()
      .then(setProgress)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const program = progress ? (getProgramById(progress.programId) ?? null) : null;
  const currentDay = program && progress ? resolveCurrentDay(program, progress) : null;
  const todayPractice =
    program && currentDay !== null
      ? (getPracticeById(program.days[currentDay - 1]?.practiceId) ?? null)
      : null;

  const start = useCallback(async (programId: string) => {
    const p = await startProgram(programId);
    setProgress(p);
  }, []);

  const complete = useCallback(
    async (day: number) => {
      if (!progress) return;
      const updated = await markDayComplete(progress, day);
      setProgress(updated);
    },
    [progress]
  );

  const stop = useCallback(async () => {
    await clearActiveProgram();
    setProgress(null);
  }, []);

  return { program, progress, currentDay, todayPractice, isLoading, start, complete, stop };
}
