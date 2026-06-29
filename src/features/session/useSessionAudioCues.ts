import { useCallback, useEffect, useRef } from "react";
import { Platform } from "react-native";
import { useAudioPlayer } from "expo-audio";
import { PHASE_VOICE_TEXT } from "@/data/phaseAudio";
import type { BreathingPhase, SessionCueSettings } from "@/types/breathing";
import type { Soundscape } from "@/types/audio";

type WebAudioContext = typeof AudioContext;

// --- голосовое ведение (Web Speech API) ---

function speakPhase(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ru-RU";
  utterance.rate = 0.75;
  utterance.pitch = 0.9;
  utterance.volume = 0.95;
  window.speechSynthesis.speak(utterance);
}

function stopVoice() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

// --- эмбиент (WebAudio — многотипный синтез) ---

type AmbientSource = OscillatorNode | AudioBufferSourceNode;

type AmbientState = {
  context: AudioContext;
  source: AmbientSource;
  gain: GainNode;
};

let ambientState: AmbientState | null = null;

function buildAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ||
    ((window as unknown as { webkitAudioContext?: WebAudioContext }).webkitAudioContext);
  return Ctor ? new Ctor() : null;
}

function startAmbient(soundscape: Soundscape) {
  stopAmbient();

  const context = buildAudioContext();
  if (!context) return;

  const gain = context.createGain();
  gain.gain.value = 0;
  gain.connect(context.destination);

  let source: AmbientSource;

  if (soundscape.synthType === "rain") {
    // Белый шум через AudioBuffer — звучит как дождь за окном
    const sampleRate = context.sampleRate;
    const bufferSize = Math.ceil(sampleRate * 2);
    const buffer = context.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noiseSource = context.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 700;
    filter.Q.value = 0.4;

    noiseSource.connect(filter);
    filter.connect(gain);
    noiseSource.start();
    source = noiseSource;
  } else {
    // drone: 110Hz A2 (глубокий), warm: 220Hz A3 (тёплый)
    const freq = soundscape.synthType === "warm" ? 220 : 110;
    const osc = context.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;

    if (soundscape.synthType === "drone") {
      const filter = context.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 220;
      osc.connect(filter);
      filter.connect(gain);
    } else {
      osc.connect(gain);
    }

    osc.start();
    source = osc;
  }

  // Плавный fade-in за 2 секунды
  gain.gain.linearRampToValueAtTime(soundscape.baseVolume, context.currentTime + 2);

  ambientState = { context, source, gain };
}

function stopAmbient() {
  if (!ambientState) return;
  const { context, source, gain } = ambientState;
  ambientState = null;
  try {
    gain.gain.linearRampToValueAtTime(0, context.currentTime + 1.5);
    source.stop(context.currentTime + 1.6);
  } catch {
    // ignore if already stopped
  }
  setTimeout(() => {
    try { void context.close(); } catch { /* ignore */ }
  }, 2000);
}

// --- бип (существующий механизм) ---

function playWebTone(tone: BreathingPhase["cueTone"]) {
  if (typeof window === "undefined") return;

  const context = buildAudioContext();
  if (!context) return;

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

// --- хук ---

const INHALE_ASSET = require("../../../assets/sounds/inhale.wav") as number;
const HOLD_ASSET = require("../../../assets/sounds/hold.wav") as number;
const EXHALE_ASSET = require("../../../assets/sounds/exhale.wav") as number;

function getNativeTonePlayer(
  phase: BreathingPhase,
  inhale: ReturnType<typeof useAudioPlayer>,
  hold: ReturnType<typeof useAudioPlayer>,
  exhale: ReturnType<typeof useAudioPlayer>,
): ReturnType<typeof useAudioPlayer> | null {
  if (phase.name === "inhale" || phase.name === "sigh") return inhale;
  if (phase.name === "hold") return hold;
  if (phase.name === "exhale") return exhale;
  return null;
}

export function useSessionAudioCues(settings: SessionCueSettings, soundscape?: Soundscape) {
  const inhalePlayer = useAudioPlayer(Platform.OS !== "web" ? INHALE_ASSET : null);
  const holdPlayer = useAudioPlayer(Platform.OS !== "web" ? HOLD_ASSET : null);
  const exhalePlayer = useAudioPlayer(Platform.OS !== "web" ? EXHALE_ASSET : null);
  const previousPhaseRef = useRef<string | null>(null);

  // Запускаем/останавливаем эмбиент при изменении саундскейпа или настройки
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const shouldPlay =
      settings.ambientEnabled &&
      soundscape != null &&
      soundscape.synthType !== "none";

    if (shouldPlay) {
      startAmbient(soundscape!);
    } else {
      stopAmbient();
    }
    return () => stopAmbient();
    // soundscape.id captures full synth config (static catalog — id determines everything)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.ambientEnabled, soundscape?.id]);

  // Останавливаем голос при отключении настройки
  useEffect(() => {
    if (!settings.voiceEnabled) stopVoice();
  }, [settings.voiceEnabled]);

  const playCue = useCallback(
    (phase: BreathingPhase) => {
      // Голосовое ведение (приоритет над бипом)
      if (settings.voiceEnabled && Platform.OS === "web") {
        speakPhase(PHASE_VOICE_TEXT[phase.name]);
        return;
      }

      if (!settings.soundEnabled || phase.cueTone === "none") return;

      try {
        if (Platform.OS === "web") {
          playWebTone(phase.cueTone);
          return;
        }
        const nativePlayer = getNativeTonePlayer(phase, inhalePlayer, holdPlayer, exhalePlayer);
        if (nativePlayer) {
          nativePlayer.seekTo(0);
          nativePlayer.play();
        }
      } catch (error) {
        if (__DEV__) {
          console.warn("Audio cue failed", error);
        }
      }
    },
    [inhalePlayer, holdPlayer, exhalePlayer, settings.soundEnabled, settings.voiceEnabled]
  );

  const cuePhaseChange = useCallback(
    (phase: BreathingPhase, phaseKey: string) => {
      if (previousPhaseRef.current === phaseKey) return;
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

  return { cuePhaseChange, playCue };
}
