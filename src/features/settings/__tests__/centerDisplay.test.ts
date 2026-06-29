import { describe, expect, it } from "vitest";
import { isCenterDisplayMode } from "@/features/settings/SettingsContext";

describe("isCenterDisplayMode", () => {
  it("accepts the three valid modes", () => {
    expect(isCenterDisplayMode("phase_count")).toBe(true);
    expect(isCenterDisplayMode("phase")).toBe(true);
    expect(isCenterDisplayMode("clean")).toBe(true);
  });

  it("rejects unknown or missing values (old settings migrate to default)", () => {
    expect(isCenterDisplayMode(undefined)).toBe(false);
    expect(isCenterDisplayMode(null)).toBe(false);
    expect(isCenterDisplayMode("full")).toBe(false);
    expect(isCenterDisplayMode(42)).toBe(false);
  });
});
