import { describe, expect, it } from "vitest";
import { resolveCurrentDay } from "@/features/programs/useActiveProgram";
import { programs } from "@/data/programs";
import { breathingPractices } from "@/data/breathingPractices";
import type { ProgramProgress } from "@/types/program";

const calm7 = programs.find((p) => p.id === "calm-7")!;

describe("resolveCurrentDay", () => {
  it("возвращает день 1 при пустом прогрессе", () => {
    const progress: ProgramProgress = { programId: "calm-7", startedAt: "", completedDays: [] };
    expect(resolveCurrentDay(calm7, progress)).toBe(1);
  });

  it("возвращает следующий незавершённый день", () => {
    const progress: ProgramProgress = { programId: "calm-7", startedAt: "", completedDays: [1, 2] };
    expect(resolveCurrentDay(calm7, progress)).toBe(3);
  });

  it("возвращает null когда все дни завершены", () => {
    const all = calm7.days.map((d) => d.day);
    const progress: ProgramProgress = { programId: "calm-7", startedAt: "", completedDays: all };
    expect(resolveCurrentDay(calm7, progress)).toBeNull();
  });
});

describe("инвариант контента — все practiceId существуют", () => {
  const practiceIds = new Set(breathingPractices.map((p) => p.id));

  for (const program of programs) {
    for (const day of program.days) {
      it(`${program.id} день ${day.day}: practiceId "${day.practiceId}" существует`, () => {
        expect(practiceIds.has(day.practiceId)).toBe(true);
      });
    }
  }
});
