import { describe, expect, it } from "vitest";
import { isStoredSettings } from "@/features/settings/SettingsContext";

describe("isStoredSettings", () => {
  it("accepts valid settings shape", () => {
    expect(isStoredSettings({
      cueSettings: { soundEnabled: true, hapticsEnabled: false },
      defaultDurationMinutes: 5,
    })).toBe(true);
  });

  it("rejects null", () => {
    expect(isStoredSettings(null)).toBe(false);
  });

  it("rejects missing cueSettings", () => {
    expect(isStoredSettings({ defaultDurationMinutes: 5 })).toBe(false);
  });

  it("rejects wrong soundEnabled type", () => {
    expect(isStoredSettings({
      cueSettings: { soundEnabled: "yes", hapticsEnabled: false },
      defaultDurationMinutes: 5,
    })).toBe(false);
  });

  it("rejects string defaultDurationMinutes", () => {
    expect(isStoredSettings({
      cueSettings: { soundEnabled: true, hapticsEnabled: false },
      defaultDurationMinutes: "5",
    })).toBe(false);
  });
});
