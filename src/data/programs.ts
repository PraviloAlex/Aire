import type { Program } from "@/types/program";

export const programs: readonly Program[] = [
  {
    id: "calm-7",
    title: "7 дней спокойствия",
    subtitle: "Один протокол в день, 5 минут",
    goal: "calm",
    accent: "calm",
    lengthDays: 7,
    days: [
      { day: 1, practiceId: "long-exhale",       focus: "Первый шаг — просто замедлиться" },
      { day: 2, practiceId: "box-breathing",      focus: "Найти ровный ритм" },
      { day: 3, practiceId: "physiological-sigh", focus: "Быстрый сброс напряжения" },
      { day: 4, practiceId: "long-exhale",        focus: "Закрепляем навык" },
      { day: 5, practiceId: "coherent-breathing", focus: "Баланс без задержек" },
      { day: 6, practiceId: "box-breathing",      focus: "Устойчивость ритма" },
      { day: 7, practiceId: "recovery-breath",    focus: "Финальное восстановление" },
    ],
  },
  {
    id: "focus-14",
    title: "14 дней фокуса",
    subtitle: "Протокол концентрации — каждое утро",
    goal: "focus",
    accent: "focus",
    lengthDays: 14,
    days: [
      { day: 1,  practiceId: "wake-up-breath",     focus: "Мягкий вход в день" },
      { day: 2,  practiceId: "box-breathing",       focus: "Ровный ритм перед задачей" },
      { day: 3,  practiceId: "coherent-breathing",  focus: "Тихая концентрация" },
      { day: 4,  practiceId: "wake-up-breath",      focus: "Включиться без давления" },
      { day: 5,  practiceId: "box-breathing",       focus: "Фокус через равновесие" },
      { day: 6,  practiceId: "physiological-sigh",  focus: "Сбросить лишнее, взяться за дело" },
      { day: 7,  practiceId: "coherent-breathing",  focus: "Неделя позади — отдышаться" },
      { day: 8,  practiceId: "wake-up-breath",      focus: "Вторая неделя — активнее" },
      { day: 9,  practiceId: "box-breathing",       focus: "Ритм как якорь" },
      { day: 10, practiceId: "coherent-breathing",  focus: "Спокойный фокус" },
      { day: 11, practiceId: "irritation-pause",    focus: "Пауза перед реакцией" },
      { day: 12, practiceId: "wake-up-breath",      focus: "Энергия без суеты" },
      { day: 13, practiceId: "box-breathing",       focus: "Предфинишный ритм" },
      { day: 14, practiceId: "coherent-breathing",  focus: "Финальный день — полная концентрация" },
    ],
  },
];

export function getProgramById(id: string): Program | undefined {
  return programs.find((p) => p.id === id);
}
