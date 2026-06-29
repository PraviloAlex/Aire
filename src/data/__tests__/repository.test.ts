import { describe, expect, it } from "vitest";
import { nowIso, touch, type SyncableRecord } from "@/data/repository";

describe("repository helpers", () => {
  it("nowIso returns a valid ISO timestamp", () => {
    const iso = nowIso();
    expect(iso).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(new Date(iso).toISOString()).toBe(iso);
  });

  it("touch stamps updatedAt without mutating the input", () => {
    const input: SyncableRecord = { id: "x" };
    const stamped = touch(input);
    expect(stamped.id).toBe("x");
    expect(typeof stamped.updatedAt).toBe("string");
    expect(input).not.toHaveProperty("updatedAt");
  });
});
