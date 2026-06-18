import { describe, expect, it } from "vitest";
import {
  computeProgressStats,
  getFavoritePracticeId,
  getHelpRate,
  getLastPracticeId,
  getPracticeUsageCounts,
} from "@/features/progress/progressStats";
import type { SessionRecord } from "@/types/breathing";

function makeRecord(overrides: Partial<SessionRecord> = {}): SessionRecord {
  return {
    id: "test-1",
    practiceId: "box-breathing",
    goal: "focus",
    durationSeconds: 300,
    completedAt: new Date().toISOString(),
    reflection: "better",
    ...overrides,
  };
}

describe("computeProgressStats — пустые данные", () => {
  it("возвращает isFirstTime true при пустом массиве", () => {
    const stats = computeProgressStats([]);
    expect(stats.isFirstTime).toBe(true);
    expect(stats.totalSessions).toBe(0);
    expect(stats.totalMinutes).toBe(0);
    expect(stats.topGoal).toBeNull();
    expect(stats.weekSessions).toBe(0);
  });
});

describe("computeProgressStats — с данными", () => {
  it("считает totalSessions правильно", () => {
    const records = [makeRecord({ id: "a" }), makeRecord({ id: "b" })];
    expect(computeProgressStats(records).totalSessions).toBe(2);
  });

  it("считает totalMinutes из durationSeconds", () => {
    const records = [
      makeRecord({ durationSeconds: 120 }),
      makeRecord({ durationSeconds: 180 }),
    ];
    expect(computeProgressStats(records).totalMinutes).toBe(5);
  });

  it("определяет topGoal как самый частый", () => {
    const records = [
      makeRecord({ goal: "calm" }),
      makeRecord({ goal: "calm" }),
      makeRecord({ goal: "focus" }),
    ];
    expect(computeProgressStats(records).topGoal).toBe("calm");
  });

  it("isFirstTime: false когда есть хотя бы одна сессия", () => {
    expect(computeProgressStats([makeRecord()]).isFirstTime).toBe(false);
  });

  it("weekSessions включает только сессии за последние 7 дней", () => {
    const oldDate = new Date(Date.now() - 8 * 86_400_000).toISOString();
    const newDate = new Date().toISOString();
    const records = [
      makeRecord({ completedAt: oldDate }),
      makeRecord({ completedAt: newDate }),
      makeRecord({ completedAt: newDate }),
    ];
    expect(computeProgressStats(records).weekSessions).toBe(2);
  });

  it("weekSessions равен 0 когда все сессии старше 7 дней", () => {
    const oldDate = new Date(Date.now() - 10 * 86_400_000).toISOString();
    expect(computeProgressStats([makeRecord({ completedAt: oldDate })]).weekSessions).toBe(0);
  });

  it("totalMinutes округляется до целых минут", () => {
    expect(computeProgressStats([makeRecord({ durationSeconds: 90 })]).totalMinutes).toBe(2);
  });

  it("работает с null reflection", () => {
    const stats = computeProgressStats([makeRecord({ reflection: null })]);
    expect(stats.totalSessions).toBe(1);
    expect(stats.isFirstTime).toBe(false);
  });
});

describe("getLastPracticeId", () => {
  it("возвращает null при пустом массиве", () => {
    expect(getLastPracticeId([])).toBeNull();
  });

  it("возвращает practiceId последней записи по дате", () => {
    const old = makeRecord({ id: "1", practiceId: "box-breathing", completedAt: new Date(Date.now() - 5000).toISOString() });
    const recent = makeRecord({ id: "2", practiceId: "long-exhale", completedAt: new Date().toISOString() });
    expect(getLastPracticeId([old, recent])).toBe("long-exhale");
  });

  it("возвращает единственную запись при одном элементе", () => {
    expect(getLastPracticeId([makeRecord()])).toBe("box-breathing");
  });
});

describe("getFavoritePracticeId", () => {
  it("возвращает null при пустом массиве", () => {
    expect(getFavoritePracticeId([])).toBeNull();
  });

  it("возвращает самый частый practiceId", () => {
    const records = [
      makeRecord({ id: "1", practiceId: "box-breathing" }),
      makeRecord({ id: "2", practiceId: "box-breathing" }),
      makeRecord({ id: "3", practiceId: "long-exhale" }),
    ];
    expect(getFavoritePracticeId(records)).toBe("box-breathing");
  });

  it("возвращает единственный practiceId при равенстве", () => {
    const records = [
      makeRecord({ id: "1", practiceId: "box-breathing" }),
      makeRecord({ id: "2", practiceId: "long-exhale" }),
    ];
    const result = getFavoritePracticeId(records);
    expect(result === "box-breathing" || result === "long-exhale").toBe(true);
  });
});

describe("getPracticeUsageCounts", () => {
  it("возвращает пустой объект при пустом массиве", () => {
    expect(getPracticeUsageCounts([])).toEqual({});
  });

  it("считает количество по каждому practiceId", () => {
    const records = [
      makeRecord({ id: "1", practiceId: "box-breathing" }),
      makeRecord({ id: "2", practiceId: "box-breathing" }),
      makeRecord({ id: "3", practiceId: "long-exhale" }),
    ];
    expect(getPracticeUsageCounts(records)).toEqual({ "box-breathing": 2, "long-exhale": 1 });
  });
});

describe("getHelpRate", () => {
  it("возвращает 0 при пустом массиве", () => {
    expect(getHelpRate([])).toBe(0);
  });

  it("возвращает 0 когда ни у кого нет reflection", () => {
    expect(getHelpRate([makeRecord({ reflection: null })])).toBe(0);
  });

  it("считает better и much_better как помогло", () => {
    const records = [
      makeRecord({ id: "1", reflection: "better" }),
      makeRecord({ id: "2", reflection: "same" }),
      makeRecord({ id: "3", reflection: null }),
    ];
    expect(getHelpRate(records)).toBe(0.5);
  });

  it("возвращает 1 когда все с reflection оценили как better/much_better", () => {
    const records = [
      makeRecord({ id: "1", reflection: "better" }),
      makeRecord({ id: "2", reflection: "much_better" }),
    ];
    expect(getHelpRate(records)).toBe(1);
  });
});
