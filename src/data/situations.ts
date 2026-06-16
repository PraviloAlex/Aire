import type { BreathingPractice, Situation } from "@/types/breathing";
import { getBestPracticeForState } from "@/utils/practiceFilters";

export const situations: readonly Situation[] = [
  {
    id: "before-meeting",
    label: "Перед встречей",
    sublabel: "Собраться",
    goal: "focus",
    icon: "people-outline",
  },
  {
    id: "before-interview",
    label: "Перед собеседованием",
    sublabel: "Спокойствие и уверенность",
    goal: "focus",
    icon: "briefcase-outline",
  },
  {
    id: "before-hard-talk",
    label: "Перед сложным разговором",
    sublabel: "Говорить ясно",
    goal: "calm",
    icon: "chatbubble-outline",
  },
  {
    id: "panic-hit",
    label: "Накрыла паника",
    sublabel: "Быстрый сброс",
    goal: "fear",
    icon: "flash-outline",
  },
  {
    id: "after-conflict",
    label: "После конфликта",
    sublabel: "Сбросить напряжение",
    goal: "recover",
    icon: "heart-outline",
  },
  {
    id: "cant-sleep",
    label: "Не могу уснуть",
    sublabel: "Подготовиться ко сну",
    goal: "sleep",
    icon: "moon-outline",
  },
  {
    id: "anxiety-no-reason",
    label: "Тревога без причины",
    sublabel: "Вернуться в момент",
    goal: "calm",
    icon: "cloudy-outline",
  },
  {
    id: "morning-focus",
    label: "Утренний фокус",
    sublabel: "Мягко включиться",
    goal: "focus",
    icon: "sunny-outline",
  },
  {
    id: "body-discomfort",
    label: "Дискомфорт в теле",
    sublabel: "Смягчить напряжение",
    goal: "pain",
    icon: "body-outline",
  },
  {
    id: "irritated",
    label: "Раздражение",
    sublabel: "Пауза перед ответом",
    goal: "irritation",
    icon: "flame-outline",
  },
];

export function getPracticeForSituation(
  situation: Situation,
  practices: readonly BreathingPractice[]
): BreathingPractice | undefined {
  return getBestPracticeForState(practices, situation.goal);
}
