import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ProgramProgress } from "@/types/program";
import { nowIso, type SingletonRepository } from "@/data/repository";

const PROGRAM_KEY = "aire:active_program";

export function isProgramProgress(v: unknown): v is ProgramProgress {
  if (!v || typeof v !== "object") return false;
  const p = v as Record<string, unknown>;
  return (
    typeof p.programId === "string" &&
    typeof p.startedAt === "string" &&
    Array.isArray(p.completedDays) &&
    (p.completedDays as unknown[]).every((d) => typeof d === "number")
  );
}

export async function loadActiveProgram(): Promise<ProgramProgress | null> {
  try {
    const raw = await AsyncStorage.getItem(PROGRAM_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isProgramProgress(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export async function saveActiveProgram(progress: ProgramProgress): Promise<void> {
  try {
    await AsyncStorage.setItem(PROGRAM_KEY, JSON.stringify({ ...progress, updatedAt: nowIso() }));
  } catch {
    // Storage errors are non-fatal
  }
}

export async function markDayComplete(
  current: ProgramProgress,
  day: number
): Promise<ProgramProgress> {
  const set = new Set(current.completedDays);
  set.add(day);
  const updated: ProgramProgress = {
    ...current,
    completedDays: Array.from(set).sort((a, b) => a - b),
  };
  await saveActiveProgram(updated);
  return updated;
}

export async function startProgram(programId: string): Promise<ProgramProgress> {
  const progress: ProgramProgress = {
    programId,
    startedAt: new Date().toISOString(),
    completedDays: [],
  };
  await saveActiveProgram(progress);
  return progress;
}

export async function clearActiveProgram(): Promise<void> {
  try {
    await AsyncStorage.removeItem(PROGRAM_KEY);
  } catch {
    // non-fatal
  }
}

// Repository-обёртка над активной программой (одиночное значение).
export const programRepository: SingletonRepository<ProgramProgress> = {
  get: () => loadActiveProgram(),
  set: (progress) => saveActiveProgram(progress),
};
