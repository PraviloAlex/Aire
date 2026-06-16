import type { BreathingGoal, LearnArticle } from "@/types/breathing";

export const learnArticles: readonly LearnArticle[] = [
  {
    id: "breath-basics",
    title: "Как начать без ошибок",
    category: "Основы",
    readingTime: "2 мин",
    readSeconds: 120,
    goals: ["calm", "focus", "recover", "sleep", "pain", "irritation"],
    body: "Мягкость — лучший старт. Дышите без борьбы, не гонитесь за идеальной техникой и выбирайте ритм, который не вызывает дискомфорт. Один спокойный повтор лучше десяти форсированных.",
  },
  {
    id: "anxiety-reset",
    title: "Когда накрывает тревога",
    category: "Состояние",
    readingTime: "1 мин",
    readSeconds: 60,
    goals: ["fear", "calm", "irritation"],
    body: "Помогает простая структура: короткий вдох, более длинный выдох, взгляд на одну точку и несколько спокойных повторов. Не надо ждать, когда станет лучше — просто продолжайте дышать.",
  },
  {
    id: "consistency-not-intensity",
    title: "Регулярность важнее интенсивности",
    category: "Практика",
    readingTime: "1 мин",
    readSeconds: 60,
    goals: ["calm", "focus", "recover", "sleep", "pain", "irritation"],
    body: "Три минуты каждый день дадут больше, чем полчаса раз в неделю. Нервная система учится через повторение, не через усилие. Небольшая практика сегодня — лучше чем идеальная когда-нибудь.",
  },
  {
    id: "active-breath",
    title: "Активные техники: когда осторожно",
    category: "Внимание",
    readingTime: "1 мин",
    readSeconds: 60,
    goals: ["focus", "fear"],
    body: "Бодрящие практики стоит делать осторожно. Если тело отвечает напряжением или головокружением — это сигнал, не слабость. Выберите спокойный ровный ритм вместо форсированного.",
  },
  {
    id: "rest-signal",
    title: "Усталость — сигнал, не слабость",
    category: "Восстановление",
    readingTime: "1 мин",
    readSeconds: 60,
    goals: ["sleep", "recover"],
    body: "Когда тело просит покоя — это не провал. Нервная система восстанавливается в моменты тишины, не в погоне за продуктивностью. Одна пауза сегодня — это инвестиция в завтра.",
  },
  {
    id: "fear-as-information",
    title: "Страх как информация",
    category: "Состояние",
    readingTime: "1 мин",
    readSeconds: 60,
    goals: ["fear"],
    body: "Страх — это не враг. Это сигнал нервной системы: что-то важное. Когда вы дышите через него, а не убегаете — вы тренируете способность оставаться там, где трудно. Это и есть настоящий контроль.",
  },
];

export function getArticleById(id: string): LearnArticle | undefined {
  return learnArticles.find((a) => a.id === id);
}

export function getCardForGoal(goal: BreathingGoal): LearnArticle | undefined {
  const matching = learnArticles.filter((a) => a.goals.includes(goal));
  if (matching.length === 0) return learnArticles[0];
  const dayIndex = Math.floor(Date.now() / 86_400_000);
  return matching[dayIndex % matching.length];
}
