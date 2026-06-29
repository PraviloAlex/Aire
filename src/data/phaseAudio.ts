import type { BreathingPhaseName } from "@/types/breathing";

// Русские фразы для голосового ведения через Web Speech API.
// Аудио-ассеты (MP3) — TODO: записать профессиональным голосом и положить в assets/audio/voice/.
export const PHASE_VOICE_TEXT: Record<BreathingPhaseName, string> = {
  inhale: "вдох",
  hold:   "задержи",
  exhale: "выдох",
  pause:  "пауза",
  sigh:   "довдох",
  rest:   "отдых",
};
