import { fearCopy } from "@/data/fearCopy";
import type { BreathingGoal } from "@/types/breathing";

export const supportPhrases: Record<BreathingGoal, readonly string[]> = {
  calm: [
    "Замедлись. Один вдох за раз.",
    "Ты в безопасности. Дыши.",
    "Позволь телу успокоиться.",
    "Не нужно торопиться.",
  ],
  focus: [
    "Здесь. Сейчас. Дыши.",
    "Собери внимание на ритме.",
    "Один шаг. Один вдох.",
    "Контроль начинается с дыхания.",
  ],
  fear: [...fearCopy.grounding],
  recover: [
    "Возвращайся мягко.",
    "Тело знает как восстановиться.",
    "Без спешки. Без давления.",
    "Один ровный вдох за раз.",
  ],
  sleep: [
    "Отпусти день.",
    "Позволь телу замедлиться.",
    "Мысли уходят с каждым выдохом.",
    "Скоро наступит покой.",
  ],
  pain: [
    "Не борись с телом. Дыши мягко.",
    "Заметь дискомфорт и добавь пространства.",
    "Выдох может быть чуть длиннее.",
    "Если боль сильная — остановись и позаботься о себе.",
  ],
  irritation: [
    "Пауза уже началась.",
    "Сначала выдох. Потом ответ.",
    "Не нужно решать всё прямо сейчас.",
    "Верни себе секунду выбора.",
  ],
};

export function getPhraseForRound(goal: BreathingGoal, roundIndex: number): string {
  const phrases = supportPhrases[goal];
  return phrases[roundIndex % phrases.length];
}
