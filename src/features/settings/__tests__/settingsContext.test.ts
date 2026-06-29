import { describe, expect, it } from "vitest";
import { isStoredSettings } from "@/features/settings/SettingsContext";
import type { SessionCueSettings } from "@/types/breathing";

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

  it("принимает старую запись без voiceEnabled/ambientEnabled (миграция)", () => {
    // Старые хранилища не имеют этих полей — isStoredSettings должен их принять
    expect(isStoredSettings({
      cueSettings: { soundEnabled: true, hapticsEnabled: false },
      defaultDurationMinutes: 5,
    })).toBe(true);
  });

  it("принимает новую запись с voiceEnabled и ambientEnabled", () => {
    expect(isStoredSettings({
      cueSettings: { soundEnabled: true, hapticsEnabled: false, voiceEnabled: true, ambientEnabled: false },
      defaultDurationMinutes: 5,
    })).toBe(true);
  });
});

describe("дефолтные настройки аудио", () => {
  it("voiceEnabled по умолчанию false", () => {
    const cue: SessionCueSettings = {
      soundEnabled: true,
      hapticsEnabled: false,
      voiceEnabled: false,
      ambientEnabled: false,
    };
    expect(cue.voiceEnabled).toBe(false);
    expect(cue.ambientEnabled).toBe(false);
  });
});

describe("миграция defaultSoundscapeId", () => {
  it("старая запись без defaultSoundscapeId принимается через isStoredSettings", () => {
    expect(isStoredSettings({
      cueSettings: { soundEnabled: true, hapticsEnabled: false },
      defaultDurationMinutes: 5,
    })).toBe(true);
  });

  it("новая запись с defaultSoundscapeId принимается", () => {
    expect(isStoredSettings({
      cueSettings: { soundEnabled: true, hapticsEnabled: false },
      defaultDurationMinutes: 5,
      defaultSoundscapeId: "rain",
    })).toBe(true);
  });
});

describe("миграция pulseEnabled", () => {
  it("старая запись без pulseEnabled принимается (мигрирует на false по умолчанию)", () => {
    expect(isStoredSettings({
      cueSettings: { soundEnabled: true, hapticsEnabled: false },
      defaultDurationMinutes: 5,
    })).toBe(true);
  });

  it("новая запись с pulseEnabled=true принимается", () => {
    expect(isStoredSettings({
      cueSettings: { soundEnabled: true, hapticsEnabled: false },
      defaultDurationMinutes: 5,
      pulseEnabled: true,
    })).toBe(true);
  });
});
