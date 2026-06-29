import { findSoundscape, soundscapes } from "@/data/soundscapes";
import type { BreathingGoal } from "@/types/breathing";
import type { Soundscape } from "@/types/audio";

export type VolumeMix = Readonly<{
  ambientVolume: number;
  voiceVolume: number;
  cueVolume: number;
}>;

/**
 * Resolves which soundscape to play.
 * Priority:
 *   1. Explicit session picker choice (non-null)
 *   2. Settings default (if not "none")
 *   3. Auto-match by practice goal when default is "none"
 *   4. "none" (silence)
 */
export function resolveSoundscape(
  sessionChoice: string | null,
  defaultId: string,
  practiceGoal: BreathingGoal
): Soundscape {
  if (sessionChoice !== null) {
    const found = soundscapes.find((s) => s.id === sessionChoice);
    if (found) return found;
  }

  if (defaultId !== "none") {
    const found = soundscapes.find((s) => s.id === defaultId);
    if (found) return found;
  }

  const autoMatch = soundscapes.find(
    (s) => s.id !== "none" && (s.suggestedGoals as readonly string[]).includes(practiceGoal)
  );
  if (autoMatch) return autoMatch;

  return findSoundscape("none");
}

/**
 * Returns volume levels for all audio layers.
 * Hierarchy: ambient < cue < voice — voice always reads above the background.
 * For sleep goal: voice is silenced (no disturbance).
 */
export function mixVolumes(soundscape: Soundscape, isSleep: boolean): VolumeMix {
  return {
    ambientVolume: soundscape.baseVolume,
    voiceVolume: isSleep ? 0 : 1.0,
    cueVolume: 0.6,
  };
}
