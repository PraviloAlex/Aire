import { Platform } from "react-native";
import type { BreathingGoal } from "@/types/breathing";

export type ColorPalette = {
  background:   string;
  surface:      string;
  surfaceMid:   string;
  surfaceMuted: string;
  text:         string;
  textMuted:    string;
  border:       string;
  danger:       string;
  calm:         string;
  focus:        string;
  fear:         string;
  recover:      string;
  sleep:        string;
  pain:         string;
  irritation:   string;
  sos:          string;
};

export const colors: ColorPalette = {
  // Выровнено под эталон KukuPaste: тёплый коричнево-чёрный фон, видимые поверхности.
  background:   "#151210",
  surface:      "#1E1A14",
  surfaceMid:   "#252015",
  surfaceMuted: "#181410",
  text:         "#F1ECE3",
  textMuted:    "rgba(241,236,227,0.46)",
  border:       "rgba(255,255,255,0.09)",
  danger:       "#E57373",
  calm:         "#4FC3D4",
  focus:        "#4A8FE0",
  fear:         "#D4854A",
  recover:      "#4AA88A",
  sleep:        "#7C6BB5",
  pain:         "#5FA6C8",
  irritation:   "#D06A45",
  sos:          "#F25B23",
} as const;

export const fearColors: ColorPalette = {
  ...colors,
  surface:    "rgba(212,133,74,0.10)",
  surfaceMid: "rgba(212,133,74,0.18)",
  border:     "rgba(212,133,74,0.25)",
} as const;

export const spacing = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  24,
  xxl: 40,
} as const;

export const radius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  pill: 999,
} as const;

export const typography = {
  hero:       48,
  title:      34,
  heading:    26,
  subheading: 20,
  body:       14,
  caption:    13,
} as const;

export const stateColors: Record<BreathingGoal, string> = {
  calm:    colors.calm,
  focus:   colors.focus,
  fear:    colors.fear,
  recover: colors.recover,
  sleep:   colors.sleep,
  pain:    colors.pain,
  irritation: colors.irritation,
};

export const fontFamily: { display?: string; body?: string } = {
  display: Platform.OS === "web" ? "Manrope, system-ui, sans-serif" : undefined,
  body:    Platform.OS === "web" ? "Manrope, system-ui, sans-serif" : undefined,
};
