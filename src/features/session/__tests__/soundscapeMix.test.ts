import { describe, expect, it } from "vitest";
import { findSoundscape } from "@/data/soundscapes";
import { mixVolumes, resolveSoundscape } from "@/features/session/soundscapeMix";

describe("resolveSoundscape", () => {
  it("явный выбор сессии имеет приоритет над дефолтом", () => {
    const result = resolveSoundscape("rain", "drone", "calm");
    expect(result.id).toBe("rain");
  });

  it("возвращает дефолт из настроек, если нет выбора сессии", () => {
    const result = resolveSoundscape(null, "drone", "focus");
    expect(result.id).toBe("drone");
  });

  it("авто по цели — находит soundscape для calm, если дефолт 'none'", () => {
    const result = resolveSoundscape(null, "none", "calm");
    expect(result.suggestedGoals).toContain("calm");
    expect(result.id).not.toBe("none");
  });

  it("авто по цели — находит soundscape для focus, если дефолт 'none'", () => {
    const result = resolveSoundscape(null, "none", "focus");
    expect(result.suggestedGoals).toContain("focus");
  });

  it("фолбэк на none, если нет подходящего саундскейпа (fear)", () => {
    const result = resolveSoundscape(null, "none", "fear");
    expect(result.id).toBe("none");
  });

  it("явный выбор 'none' — тишина", () => {
    const result = resolveSoundscape("none", "drone", "calm");
    expect(result.id).toBe("none");
    expect(result.synthType).toBe("none");
  });

  it("несуществующий id сессии — фолбэк через дефолт", () => {
    const result = resolveSoundscape("nonexistent-id", "rain", "sleep");
    expect(result.id).toBe("rain");
  });
});

describe("mixVolumes", () => {
  it("фон ниже голоса и сигнала при обычной практике", () => {
    const soundscape = findSoundscape("rain");
    const mix = mixVolumes(soundscape, false);
    expect(mix.ambientVolume).toBeLessThan(mix.voiceVolume);
    expect(mix.ambientVolume).toBeLessThan(mix.cueVolume);
  });

  it("голос приглушён (0) при практике на сон", () => {
    const soundscape = findSoundscape("warm");
    const mix = mixVolumes(soundscape, true);
    expect(mix.voiceVolume).toBe(0);
  });

  it("ambientVolume равен baseVolume саундскейпа", () => {
    const soundscape = findSoundscape("drone");
    const mix = mixVolumes(soundscape, false);
    expect(mix.ambientVolume).toBe(soundscape.baseVolume);
  });

  it("none-саундскейп даёт ambientVolume 0", () => {
    const soundscape = findSoundscape("none");
    const mix = mixVolumes(soundscape, false);
    expect(mix.ambientVolume).toBe(0);
  });
});
