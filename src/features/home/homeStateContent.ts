import type { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import type { BreathingGoal } from "@/types/breathing";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

export type HomeStateContent = Readonly<{
  title: string;
  subtitle: string;
  icon: IoniconName;
}>;

export const HOME_STATE_ORDER: readonly BreathingGoal[] = [
  "calm",
  "focus",
  "recover",
  "sleep",
  "pain",
  "irritation",
] as const;

// fear сохранён в Record для полноты типа, но не в HOME_STATE_ORDER.
export const homeStateContent: Record<BreathingGoal, HomeStateContent> = {
  calm: {
    title: "Успокоиться",
    subtitle: "тревога, стресс, всё кипит",
    icon: "water-outline",
  },
  focus: {
    title: "Сосредоточиться",
    subtitle: "перед встречей или работой",
    icon: "locate-outline",
  },
  fear: {
    title: "Встретить страх",
    subtitle: "смелость и устойчивость",
    icon: "shield-outline",
  },
  recover: {
    title: "Восстановиться",
    subtitle: "после конфликта или нагрузки",
    icon: "refresh-outline",
  },
  sleep: {
    title: "Уснуть",
    subtitle: "не получается заснуть",
    icon: "moon-outline",
  },
  pain: {
    title: "Боль",
    subtitle: "дискомфорт или зажим в теле",
    icon: "body-outline",
  },
  irritation: {
    title: "Раздражение",
    subtitle: "злость, спор, хочется резко ответить",
    icon: "flame-outline",
  },
};

export const homePanicContent = {
  practiceId: "physiological-sigh",
  title: "Паника прямо сейчас",
  subtitle: "быстрый сброс · 90 сек",
  icon: "flash-outline" as IoniconName,
} as const;
