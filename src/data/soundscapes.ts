import type { Soundscape } from "@/types/audio";

export const soundscapes: readonly Soundscape[] = [
  {
    id: "none",
    title: "Тишина",
    description: "Без фонового звука",
    synthType: "none",
    suggestedGoals: [],
    baseVolume: 0,
  },
  {
    id: "rain",
    title: "Дождь",
    description: "Мягкий белый шум, как дождь за окном",
    synthType: "rain",
    suggestedGoals: ["calm", "sleep"],
    baseVolume: 0.35,
  },
  {
    id: "drone",
    title: "Низкий гул",
    description: "Глубокий резонирующий тон для концентрации",
    synthType: "drone",
    suggestedGoals: ["focus", "recover"],
    baseVolume: 0.025,
  },
  {
    id: "warm",
    title: "Эмбиент",
    description: "Тёплый мягкий тон для расслабления",
    synthType: "warm",
    suggestedGoals: ["calm", "sleep", "irritation"],
    baseVolume: 0.022,
  },
];

export function findSoundscape(id: string): Soundscape {
  return soundscapes.find((s) => s.id === id) ?? soundscapes[0];
}
