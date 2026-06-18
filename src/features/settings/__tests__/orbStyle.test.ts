import { describe, expect, it } from "vitest";
import { isOrbStyle } from "@/features/settings/SettingsContext";

describe("isOrbStyle", () => {
  it("accepts the two valid styles", () => {
    expect(isOrbStyle("shader")).toBe(true);
    expect(isOrbStyle("classic")).toBe(true);
  });

  it("rejects unknown or missing values (old settings migrate to default)", () => {
    expect(isOrbStyle(undefined)).toBe(false);
    expect(isOrbStyle(null)).toBe(false);
    expect(isOrbStyle("webgl")).toBe(false);
    expect(isOrbStyle(7)).toBe(false);
  });
});
