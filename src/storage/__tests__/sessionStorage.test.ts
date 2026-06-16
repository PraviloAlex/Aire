import { beforeEach, describe, expect, it, vi } from "vitest";
import { generateId, loadSessionHistory, saveSessionRecord, clearSessionHistory } from '@/storage/sessionStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SessionRecord } from "@/types/breathing";

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  }
}));

const mockStorage = vi.mocked(AsyncStorage);

function makeRecord(id: string): SessionRecord {
  return {
    id,
    practiceId: 'box-breathing',
    goal: 'focus',
    durationSeconds: 300,
    completedAt: '2026-06-14T10:00:00.000Z',
    reflection: 'better',
  };
}

function makeFullRecord(id: string): SessionRecord {
  return {
    ...makeRecord(id),
    trigger: 'Работа',
    note: 'Помогло сосредоточиться',
  };
}

describe("loadSessionHistory", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns empty array when storage has nothing", async () => {
    vi.mocked(mockStorage.getItem).mockResolvedValue(null);
    const result = await loadSessionHistory();
    expect(result).toEqual([]);
  });

  it("returns parsed records from storage", async () => {
    const records = [makeRecord("a1"), makeRecord("b2")];
    vi.mocked(mockStorage.getItem).mockResolvedValue(JSON.stringify(records));
    const result = await loadSessionHistory();
    expect(result).toEqual(records);
  });

  it("throws when storage fails", async () => {
    vi.mocked(mockStorage.getItem).mockRejectedValue(new Error("storage error"));
    await expect(loadSessionHistory()).rejects.toThrow("storage error");
  });

  it("returns empty array when stored data is not an array", async () => {
    vi.mocked(mockStorage.getItem).mockResolvedValue('"corrupted"');
    const result = await loadSessionHistory();
    expect(result).toEqual([]);
  });
});

describe("saveSessionRecord", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("saves record when storage is empty", async () => {
    vi.mocked(mockStorage.getItem).mockResolvedValue(null);
    vi.mocked(mockStorage.setItem).mockResolvedValue(undefined);
    await saveSessionRecord(makeRecord("x1"));
    expect(mockStorage.setItem).toHaveBeenCalledWith(
      'aire:session_history',
      expect.stringContaining('"x1"')
    );
  });

  it("appends new record to existing records", async () => {
    const existing = [makeRecord("old1")];
    vi.mocked(mockStorage.getItem).mockResolvedValue(JSON.stringify(existing));
    vi.mocked(mockStorage.setItem).mockResolvedValue(undefined);
    await saveSessionRecord(makeRecord("new1"));
    const saved = JSON.parse(vi.mocked(mockStorage.setItem).mock.calls[0][1] as string) as SessionRecord[];
    expect(saved).toHaveLength(2);
    expect(saved[1].id).toBe("new1");
  });

  it("saves record with null reflection (skip)", async () => {
    vi.mocked(mockStorage.getItem).mockResolvedValue(null);
    vi.mocked(mockStorage.setItem).mockResolvedValue(undefined);
    const record: SessionRecord = { ...makeRecord("skip1"), reflection: null };
    await saveSessionRecord(record);
    const saved = JSON.parse(vi.mocked(mockStorage.setItem).mock.calls[0][1] as string) as SessionRecord[];
    expect(saved[0].reflection).toBeNull();
  });

  it("returns false when setItem fails", async () => {
    vi.mocked(mockStorage.getItem).mockResolvedValue(null);
    vi.mocked(mockStorage.setItem).mockRejectedValue(new Error("disk full"));
    await expect(saveSessionRecord(makeRecord("z1"))).resolves.toBe(false);
  });

  it("returns false when getItem fails (prevents history overwrite)", async () => {
    vi.mocked(mockStorage.getItem).mockRejectedValue(new Error("storage corrupt"));
    await expect(saveSessionRecord(makeRecord("z2"))).resolves.toBe(false);
    expect(mockStorage.setItem).not.toHaveBeenCalled();
  });

  it("saves trigger and note fields", async () => {
    vi.mocked(mockStorage.getItem).mockResolvedValue(null);
    vi.mocked(mockStorage.setItem).mockResolvedValue(undefined);
    await saveSessionRecord(makeFullRecord("full1"));
    const saved = JSON.parse(vi.mocked(mockStorage.setItem).mock.calls[0][1] as string) as SessionRecord[];
    expect(saved[0].trigger).toBe("Работа");
    expect(saved[0].note).toBe("Помогло сосредоточиться");
  });

  it("reads old records without trigger/note without throwing", async () => {
    const legacyRecord = makeRecord("legacy1");
    vi.mocked(mockStorage.getItem).mockResolvedValue(JSON.stringify([legacyRecord]));
    const result = await loadSessionHistory();
    expect(result[0].trigger).toBeUndefined();
    expect(result[0].note).toBeUndefined();
    expect(result[0].reflection).toBe("better");
  });
});

describe("clearSessionHistory", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("calls removeItem with the correct key", async () => {
    vi.mocked(mockStorage.removeItem).mockResolvedValue(undefined);
    await clearSessionHistory();
    expect(mockStorage.removeItem).toHaveBeenCalledWith('aire:session_history');
  });

  it("does not throw when storage fails", async () => {
    vi.mocked(mockStorage.removeItem).mockRejectedValue(new Error("error"));
    await expect(clearSessionHistory()).resolves.toBeUndefined();
  });
});

describe("generateId", () => {
  it("returns a non-empty string", () => {
    expect(typeof generateId()).toBe("string");
    expect(generateId().length).toBeGreaterThan(0);
  });

  it("returns unique values on consecutive calls", () => {
    const ids = new Set(Array.from({ length: 10 }, () => generateId()));
    expect(ids.size).toBe(10);
  });
});
