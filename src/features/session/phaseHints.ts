import type { BreathingGoal, BreathingPhaseName } from "@/types/breathing";

// Микроподсказки по фазам под каждое состояние. Спокойные, короткие (≤32 симв.).
// Покрывают только фазы, реально встречающиеся в практиках данного состояния.
export const phaseHints: Record<BreathingGoal, Partial<Record<BreathingPhaseName, string>>> = {
  calm: {
    inhale: "Вдохни мягко через нос",
    hold: "Не напрягайся",
    exhale: "Медленно отпускай воздух",
    pause: "Отпусти, не торопись",
    sigh: "Короткий довдох сверху",
  },
  focus: {
    inhale: "Собери внимание",
    exhale: "Не теряй ритм",
    rest: "Держи спокойный ритм",
  },
  fear: {
    inhale: "Замечаю страх",
    hold: "Я здесь, в безопасности",
    exhale: "Выбираю свой ответ",
  },
  recover: {
    inhale: "Наполни тело воздухом",
    pause: "Мягко удержи",
    exhale: "Отпусти напряжение",
    rest: "Отдохни",
  },
  sleep: {
    inhale: "Вдохни спокойно",
    hold: "Мягко удержи",
    exhale: "Выдыхай дольше вдоха",
  },
  pain: {
    inhale: "Мягкий вдох без борьбы",
    exhale: "Дай телу смягчиться",
  },
  irritation: {
    inhale: "Сделай паузу",
    exhale: "Отпусти импульс",
  },
};

export function getPhaseHint(goal: BreathingGoal, phaseName: BreathingPhaseName): string | undefined {
  return phaseHints[goal]?.[phaseName];
}
