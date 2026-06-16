export type FearCopy = Readonly<{
  preparation: string;
  hint: string;
  grounding: readonly string[];
}>;

export const fearCopy: FearCopy = {
  preparation: "Ты здесь. Это пройдёт. Просто оставайся.",
  hint: "Останься. Не убегай.",
  grounding: [
    "Страх — сигнал, не приказ.",
    "Выдох первым. Потом выбор.",
    "Ты можешь остаться здесь.",
    "Не убегай. Просто дыши.",
    "Тревога — волна. Она спадёт.",
    "Ты больше, чем этот момент.",
  ],
};
