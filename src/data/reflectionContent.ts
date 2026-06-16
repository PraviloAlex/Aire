import type { ReflectionRating } from "@/types/breathing";

export type RatingFace = Readonly<{
  label: string;
  icon: string;
}>;

export const ratingFaces: Record<ReflectionRating, RatingFace> = {
  worse:       { label: "Хуже",         icon: "sad-outline" },
  same:        { label: "Так же",        icon: "remove-outline" },
  better:      { label: "Лучше",        icon: "happy-outline" },
  much_better: { label: "Намного\nлучше", icon: "heart-outline" },
};

export const RATING_ORDER: readonly ReflectionRating[] = [
  "worse",
  "same",
  "better",
  "much_better",
];

export const reflectionTriggers: readonly string[] = [
  "Работа",
  "Люди",
  "Здоровье",
  "Деньги",
  "Сон",
  "Другое",
];
