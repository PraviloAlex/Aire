import { describe, expect, it } from "vitest";
import { PHASE_VOICE_TEXT } from "@/data/phaseAudio";
import type { BreathingPhaseName } from "@/types/breathing";

const ALL_PHASES: readonly BreathingPhaseName[] = [
  "inhale", "hold", "exhale", "pause", "sigh", "rest",
];

describe("PHASE_VOICE_TEXT", () => {
  it("покрывает все имена фаз", () => {
    for (const phase of ALL_PHASES) {
      expect(PHASE_VOICE_TEXT).toHaveProperty(phase);
    }
  });

  it("все значения — непустые строки", () => {
    for (const phase of ALL_PHASES) {
      expect(typeof PHASE_VOICE_TEXT[phase]).toBe("string");
      expect(PHASE_VOICE_TEXT[phase].length).toBeGreaterThan(0);
    }
  });

  it("inhale → 'вдох'", () => {
    expect(PHASE_VOICE_TEXT.inhale).toBe("вдох");
  });

  it("exhale → 'выдох'", () => {
    expect(PHASE_VOICE_TEXT.exhale).toBe("выдох");
  });

  it("hold → 'задержи'", () => {
    expect(PHASE_VOICE_TEXT.hold).toBe("задержи");
  });

  it("sigh → 'довдох'", () => {
    expect(PHASE_VOICE_TEXT.sigh).toBe("довдох");
  });
});
