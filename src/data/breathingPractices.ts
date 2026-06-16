import type { BreathingGoal, BreathingPhaseName, BreathingPractice } from "@/types/breathing";

const safety = {
  gentle:
    "Практика мягкая, но остановитесь, если появляется головокружение, боль или сильный дискомфорт.",
  active:
    "Активные техники не подходят при беременности, панических состояниях, сердечно-сосудистых рисках или головокружении. Начинайте мягко и остановитесь при дискомфорте."
} as const;

export const phaseVerbs: Record<BreathingPhaseName, string> = {
  inhale:  "Вдохни",
  sigh:    "Довдохни",
  hold:    "Задержи",
  pause:   "Задержи",
  exhale:  "Выдохни",
  rest:    "Отдыхай",
};

export const goalLabels: Record<BreathingGoal, string> = {
  calm:    "Успокоиться",
  focus:   "Собраться",
  fear:    "Встретить страх",
  recover: "Восстановиться",
  sleep:   "Заснуть",
  pain:    "Боль",
  irritation: "Раздражение",
};

export const goalSubtitles: Record<BreathingGoal, string> = {
  calm:    "Снизь тревогу и напряжение",
  focus:   "Верни концентрацию",
  fear:    "Управляй реакцией на страх",
  recover: "Восстановись после нагрузки",
  sleep:   "Подготовься ко сну",
  pain:    "Мягко поддержать тело при дискомфорте",
  irritation: "Сделать паузу перед реакцией",
};

export const breathingPractices: readonly BreathingPractice[] = [
  {
    id: "box-breathing",
    title: "Квадратное дыхание",
    subtitle: "Ровный ритм для тревожности и фокуса",
    goal: "calm",
    goals: ["calm", "focus", "irritation"],
    durationSeconds: 240,
    intensity: "balanced",
    recommended: true,
    summary:
      "Четыре равные фазы помогают вернуть ощущение контроля и стабилизировать внимание.",
    benefits: ["собраться", "замедлить тревожные мысли", "переключиться перед задачей"],
    safetyNote: safety.gentle,
    pattern: {
      rounds: 15,
      phases: [
        { name: "inhale", label: "Вдох",  shortLabel: "Вдох",  durationSeconds: 4, cueTone: "start" },
        { name: "hold",   label: "Пауза", shortLabel: "Пауза", durationSeconds: 4, cueTone: "shift" },
        { name: "exhale", label: "Выдох", shortLabel: "Выдох", durationSeconds: 4, cueTone: "soft"  },
        { name: "pause",  label: "Пауза", shortLabel: "Пауза", durationSeconds: 4, cueTone: "shift" }
      ]
    }
  },
  {
    id: "long-exhale",
    title: "Длинный выдох",
    subtitle: "Быстрое успокоение без задержек",
    goal: "calm",
    goals: ["calm", "sleep", "pain", "irritation"],
    durationSeconds: 180,
    intensity: "gentle",
    recommended: true,
    summary:
      "Выдох длиннее вдоха. Это простой способ мягко сбавить внутреннюю скорость.",
    benefits: ["успокоиться", "снять напряжение", "подготовиться ко сну"],
    safetyNote: safety.gentle,
    pattern: {
      rounds: 18,
      phases: [
        { name: "inhale", label: "Мягкий вдох",   shortLabel: "Вдох",  durationSeconds: 4, cueTone: "start" },
        { name: "exhale", label: "Длинный выдох",  shortLabel: "Выдох", durationSeconds: 6, cueTone: "soft"  }
      ]
    }
  },
  {
    id: "coherent-breathing",
    title: "Ровное дыхание",
    subtitle: "Баланс на 5 минут",
    goal: "focus",
    goals: ["focus", "calm", "recover"],
    durationSeconds: 300,
    intensity: "gentle",
    recommended: true,
    summary:
      "Медленный ровный ритм без задержек подходит для восстановления и спокойной концентрации.",
    benefits: ["снизить суету", "вернуться в тело", "поддержать расслабление"],
    safetyNote: safety.gentle,
    pattern: {
      rounds: 25,
      phases: [
        { name: "inhale", label: "Спокойный вдох",  shortLabel: "Вдох",  durationSeconds: 5, cueTone: "start" },
        { name: "exhale", label: "Спокойный выдох", shortLabel: "Выдох", durationSeconds: 7, cueTone: "soft"  }
      ]
    }
  },
  {
    id: "four-seven-eight",
    title: "4-7-8",
    subtitle: "Вечернее расслабление",
    goal: "sleep",
    goals: ["sleep", "calm"],
    durationSeconds: 228,
    intensity: "balanced",
    recommended: false,
    summary:
      "Классический спокойный паттерн для перехода из активного режима в отдых.",
    benefits: ["замедлиться", "отпустить день", "подготовиться ко сну"],
    safetyNote:
      "Задержка дыхания не обязательна. Если некомфортно, сократите паузу или выберите практику без задержек.",
    pattern: {
      rounds: 12,
      phases: [
        { name: "inhale", label: "Вдох на 4",  shortLabel: "Вдох",  durationSeconds: 4, cueTone: "start" },
        { name: "hold",   label: "Пауза на 7", shortLabel: "Пауза", durationSeconds: 7, cueTone: "shift" },
        { name: "exhale", label: "Выдох на 8", shortLabel: "Выдох", durationSeconds: 8, cueTone: "soft"  }
      ]
    }
  },
  {
    id: "physiological-sigh",
    title: "Физиологический вздох",
    subtitle: "Очень короткий сброс напряжения",
    goal: "calm",
    goals: ["calm", "fear"],
    durationSeconds: 90,
    intensity: "gentle",
    recommended: true,
    summary:
      "Двойной мягкий вдох и полный выдох помогают быстро разрядить накопленное напряжение.",
    benefits: ["быстрый reset", "снять зажим", "вернуться к текущему моменту"],
    safetyNote: safety.gentle,
    pattern: {
      rounds: 10,
      phases: [
        { name: "inhale", label: "Вдох",           shortLabel: "Вдох",   durationSeconds: 2, cueTone: "start" },
        { name: "sigh",   label: "Короткий довдох", shortLabel: "Довдох", durationSeconds: 1, cueTone: "shift" },
        { name: "exhale", label: "Полный выдох",    shortLabel: "Выдох",  durationSeconds: 6, cueTone: "soft"  }
      ]
    }
  },
  {
    id: "wake-up-breath",
    title: "Пробуждение",
    subtitle: "Мягкий вход в день",
    goal: "focus",
    goals: ["focus", "calm"],
    durationSeconds: 150,
    intensity: "active",
    recommended: true,
    summary:
      "Более бодрый ритм для момента, когда нужно включиться, но без экстремальных задержек.",
    benefits: ["включиться мягко", "найти ритм", "начать без давления"],
    safetyNote: safety.active,
    pattern: {
      rounds: 15,
      phases: [
        { name: "inhale", label: "Активный вдох", shortLabel: "Вдох",  durationSeconds: 3, cueTone: "start" },
        { name: "exhale", label: "Четкий выдох",  shortLabel: "Выдох", durationSeconds: 3, cueTone: "shift" },
        { name: "rest",   label: "Мягкий отдых",  shortLabel: "Отдых", durationSeconds: 4, cueTone: "soft"  }
      ]
    }
  },
  {
    id: "sleep-wind-down",
    title: "Засыпание",
    subtitle: "Мягкий переход в сон",
    goal: "sleep",
    goals: ["sleep", "calm"],
    durationSeconds: 300,
    intensity: "gentle",
    recommended: true,
    summary:
      "Спокойный темп без задержек, который помогает телу перейти из дня в ночь.",
    benefits: ["сбавить напряжение", "дышать мягче", "отдохнуть от спешки"],
    safetyNote: safety.gentle,
    pattern: {
      rounds: 25,
      phases: [
        { name: "inhale", label: "Лёгкий вдох",  shortLabel: "Вдох",  durationSeconds: 4, cueTone: "start" },
        { name: "exhale", label: "Плавный выдох", shortLabel: "Выдох", durationSeconds: 8, cueTone: "soft"  }
      ]
    }
  },
  {
    id: "recovery-breath",
    title: "Восстановление",
    subtitle: "После стресса, конфликта или усилия",
    goal: "recover",
    goals: ["recover", "calm"],
    durationSeconds: 270,
    intensity: "gentle",
    recommended: true,
    summary:
      "Ровный спокойный ритм для тела, которое только что было под нагрузкой. Без спешки, без давления.",
    benefits: ["вернуть равновесие", "снизить кортизол", "перейти из напряжения в покой"],
    safetyNote: safety.gentle,
    pattern: {
      rounds: 18,
      phases: [
        { name: "inhale", label: "Мягкий вдох",   shortLabel: "Вдох",  durationSeconds: 4, cueTone: "start" },
        { name: "pause",  label: "Лёгкая пауза",   shortLabel: "Пауза", durationSeconds: 2, cueTone: "shift" },
        { name: "exhale", label: "Полный выдох",    shortLabel: "Выдох", durationSeconds: 6, cueTone: "soft"  },
        { name: "rest",   label: "Отдых",           shortLabel: "Отдых", durationSeconds: 3, cueTone: "none"  }
      ]
    }
  },
  {
    id: "body-softening",
    title: "Мягкое тело",
    subtitle: "Поддержка при дискомфорте без давления",
    goal: "pain",
    goals: ["pain", "recover", "calm"],
    durationSeconds: 240,
    intensity: "gentle",
    recommended: true,
    evidenceLevel: "gentle",
    homePriority: 1,
    summary:
      "Мягкий вдох и длинный выдох помогают снизить общее напряжение вокруг дискомфорта. Это не лечение боли, а спокойная поддержка тела.",
    benefits: ["замедлиться", "смягчить напряжение", "дышать без борьбы"],
    safetyNote:
      "Если боль сильная, новая, резкая или сопровождается тревожными симптомами, остановитесь и обратитесь за медицинской помощью. Практика не заменяет лечение.",
    pattern: {
      rounds: 24,
      phases: [
        { name: "inhale", label: "Мягкий вдох", shortLabel: "Вдох", durationSeconds: 4, cueTone: "start" },
        { name: "exhale", label: "Длинный выдох", shortLabel: "Выдох", durationSeconds: 6, cueTone: "soft" }
      ]
    }
  },
  {
    id: "irritation-pause",
    title: "Пауза перед реакцией",
    subtitle: "Когда внутри закипает",
    goal: "irritation",
    goals: ["irritation", "calm", "focus"],
    durationSeconds: 180,
    intensity: "gentle",
    recommended: true,
    evidenceLevel: "gentle",
    homePriority: 1,
    summary:
      "Ровный вдох и более длинный выдох дают короткую паузу между импульсом и действием. Подходит, когда хочется ответить резко.",
    benefits: ["сбросить импульс", "сделать паузу", "вернуть контроль ответа"],
    safetyNote: safety.gentle,
    pattern: {
      rounds: 18,
      phases: [
        { name: "inhale", label: "Вдох", shortLabel: "Вдох", durationSeconds: 4, cueTone: "start" },
        { name: "exhale", label: "Выдох длиннее", shortLabel: "Выдох", durationSeconds: 6, cueTone: "soft" }
      ]
    }
  },
  {
    id: "fear-anchor",
    title: "Контакт с тревогой",
    subtitle: "Безопасное знакомство со страхом",
    goal: "fear",
    goals: ["fear", "calm"],
    durationSeconds: 192,
    intensity: "gentle",
    recommended: true,
    summary:
      "Вдох — замечаешь страх. Выдох — выбираешь ответ. Тревога — сигнал, не приказ.",
    benefits: ["встретить страх без побега", "вернуть контроль", "выдох раньше действия"],
    safetyNote:
      "Практика мягкая. Если дискомфорт нарастает — сделайте обычный вдох и остановитесь.",
    pattern: {
      rounds: 16,
      phases: [
        { name: "inhale", label: "Замечаю",     shortLabel: "Вдох",  durationSeconds: 4, cueTone: "start" },
        { name: "hold",   label: "Присутствую", shortLabel: "Пауза", durationSeconds: 2, cueTone: "shift" },
        { name: "exhale", label: "Отпускаю",    shortLabel: "Выдох", durationSeconds: 6, cueTone: "soft"  }
      ]
    }
  }
];

export function getPracticeById(id: string | string[] | undefined): BreathingPractice | undefined {
  const normalizedId = Array.isArray(id) ? id[0] : id;
  return breathingPractices.find((practice) => practice.id === normalizedId);
}
