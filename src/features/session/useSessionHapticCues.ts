import { useCallback, useRef } from "react";
import { Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { hapticStyleForPhase } from "@/features/session/hapticStyles";
import type { BreathingGoal, BreathingPhase, SessionCueSettings } from "@/types/breathing";

export function useSessionHapticCues(settings: SessionCueSettings, goal?: BreathingGoal) {
  const previousPhaseRef = useRef<string | null>(null);

  const playHaptic = useCallback(
    (phase: BreathingPhase) => {
      if (!settings.hapticsEnabled || Platform.OS === "web") return;
      const style = hapticStyleForPhase(phase.name, goal);
      if (!style) return;
      Haptics.impactAsync(style as Haptics.ImpactFeedbackStyle).catch(() => {});
    },
    [settings.hapticsEnabled, goal]
  );

  const cuePhaseChange = useCallback(
    (phase: BreathingPhase, phaseKey: string) => {
      if (!settings.hapticsEnabled || Platform.OS === "web") return;
      if (previousPhaseRef.current === phaseKey) return;
      previousPhaseRef.current = phaseKey;
      playHaptic(phase);
    },
    [settings.hapticsEnabled, playHaptic]
  );

  return { cuePhaseChange, playHaptic };
}
