import { useCallback, useEffect, useRef } from "react";
import { Platform } from "react-native";
import { useAudioPlayer } from "expo-audio";
import type { BreathingPhase, SessionCueSettings } from "@/types/breathing";

type WebAudioContext = typeof AudioContext;

export function useSessionAudioCues(settings: SessionCueSettings) {
  const player = useAudioPlayer(null);
  const previousPhaseRef = useRef<string | null>(null);

  const playCue = useCallback(
    (phase: BreathingPhase) => {
      if (!settings.soundEnabled || phase.cueTone === "none") {
        return;
      }

      try {
        if (Platform.OS === "web") {
          playWebTone(phase.cueTone);
          return;
        }

        // Native cue assets can be added later without changing session screens.
        player.seekTo(0);
        player.play();
      } catch (error) {
        if (__DEV__) {
          console.warn("Audio cue failed", error);
        }
      }
    },
    [player, settings.soundEnabled]
  );

  const cuePhaseChange = useCallback(
    (phase: BreathingPhase, phaseKey: string) => {
      if (previousPhaseRef.current === phaseKey) {
        return;
      }

      previousPhaseRef.current = phaseKey;
      playCue(phase);
    },
    [playCue]
  );

  useEffect(() => {
    if (!settings.soundEnabled) {
      previousPhaseRef.current = null;
    }
  }, [settings.soundEnabled]);

  return {
    cuePhaseChange,
    playCue
  };
}

function playWebTone(tone: BreathingPhase["cueTone"]) {
  if (typeof window === "undefined") {
    return;
  }

  const AudioContextCtor =
    window.AudioContext || ((window as unknown as { webkitAudioContext?: WebAudioContext }).webkitAudioContext);

  if (!AudioContextCtor) {
    return;
  }

  const context = new AudioContextCtor();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const frequency = tone === "start" ? 520 : tone === "shift" ? 420 : 320;

  oscillator.frequency.value = frequency;
  oscillator.type = "sine";
  gain.gain.value = 0.05;
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.11);
  oscillator.addEventListener("ended", () => { void context.close(); });
}
