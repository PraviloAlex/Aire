import type { BreathingGoal } from "@/types/breathing";

export const sessionStatePhrases: Record<BreathingGoal, string> = {
  calm: "Вернись к контролю",
  focus: "Собери внимание",
  fear: "Страх - сигнал, не приказ",
  recover: "Дай телу восстановиться",
  sleep: "Отпусти день",
  pain: "Смягчи напряжение",
  irritation: "Сначала пауза. Потом ответ",
};
