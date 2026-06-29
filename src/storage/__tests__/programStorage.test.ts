import { describe, expect, it, vi, beforeEach } from "vitest";
import { isProgramProgress } from "@/storage/programStorage";
import type { ProgramProgress } from "@/types/program";

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn().mockResolvedValue(null),
    setItem: vi.fn().mockResolvedValue(undefined),
    removeItem: vi.fn().mockResolvedValue(undefined),
  },
}));

describe("isProgramProgress", () => {
  it("принимает корректный объект", () => {
    const valid: ProgramProgress = {
      programId: "calm-7",
      startedAt: "2024-06-15T10:00:00.000Z",
      completedDays: [1, 2, 3],
    };
    expect(isProgramProgress(valid)).toBe(true);
  });

  it("принимает пустой completedDays", () => {
    expect(
      isProgramProgress({ programId: "calm-7", startedAt: "2024-06-15T00:00:00Z", completedDays: [] })
    ).toBe(true);
  });

  it("отклоняет null", () => {
    expect(isProgramProgress(null)).toBe(false);
  });

  it("отклоняет строку", () => {
    expect(isProgramProgress("{}")).toBe(false);
  });

  it("отклоняет объект без programId", () => {
    expect(isProgramProgress({ startedAt: "2024-06-15T00:00:00Z", completedDays: [] })).toBe(false);
  });

  it("отклоняет объект с числовым programId", () => {
    expect(isProgramProgress({ programId: 42, startedAt: "2024-06-15T00:00:00Z", completedDays: [] })).toBe(false);
  });

  it("отклоняет completedDays со строками", () => {
    expect(
      isProgramProgress({ programId: "calm-7", startedAt: "2024-06-15T00:00:00Z", completedDays: ["1"] })
    ).toBe(false);
  });
});

describe("programStorage — markDayComplete дедупликация", () => {
  beforeEach(() => vi.clearAllMocks());

  it("не дублирует день при повторном вызове", async () => {
    const { markDayComplete } = await import("@/storage/programStorage");
    const progress: ProgramProgress = {
      programId: "calm-7",
      startedAt: "2024-06-15T00:00:00Z",
      completedDays: [1],
    };
    const result = await markDayComplete(progress, 1);
    expect(result.completedDays).toEqual([1]);
  });

  it("добавляет новый день", async () => {
    const { markDayComplete } = await import("@/storage/programStorage");
    const progress: ProgramProgress = {
      programId: "calm-7",
      startedAt: "2024-06-15T00:00:00Z",
      completedDays: [1],
    };
    const result = await markDayComplete(progress, 2);
    expect(result.completedDays).toEqual([1, 2]);
  });
});
