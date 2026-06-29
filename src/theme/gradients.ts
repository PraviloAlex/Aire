import type { BreathingGoal } from "@/types/breathing";

export type OrbColors = Readonly<{
  core: string;
  mid: string;
  edge: string;
  glow: string;
}>;

// Светящийся орб на состояние: ядро → середина → тёмный край + цвет ореола.
export const stateOrbColors: Record<BreathingGoal, OrbColors> = {
  calm: { core: "#8CE6F5", mid: "#2887AA", edge: "#0C283E", glow: "#4FC3D4" },
  focus: { core: "#8FB6F5", mid: "#2F5FA5", edge: "#0C2038", glow: "#4A8FE0" },
  fear: { core: "#F5A06E", mid: "#B4502A", edge: "#3C140F", glow: "#D4854A" },
  recover: { core: "#8FE0C4", mid: "#2F8267", edge: "#0C2C22", glow: "#4AA88A" },
  sleep: { core: "#C8A8E8", mid: "#7248A0", edge: "#1E1030", glow: "#9468C0" },
  pain: { core: "#A8D8EA", mid: "#3A7EA0", edge: "#0D2A3A", glow: "#5FA6C8" },
  irritation: { core: "#F0A078", mid: "#B24F2C", edge: "#35120C", glow: "#D06A45" },
};

export type ScreenTones = Readonly<{ top: string; mid: string; base: string }>;

// Атмосферный фон Home — тёплое оранжевое свечение из верхнего угла, как у KukuPaste.
export const homeScreenTones: ScreenTones = {
  top: "#33200E",
  mid: "#1C1612",
  base: "#151210",
};

// Атмосферный фон сессии — лёгкий тон под состояние; fear заметно теплее и темнее.
export const sessionScreenTones: Record<BreathingGoal, ScreenTones> = {
  calm: { top: "#11324A", mid: "#0A1620", base: "#060B12" },
  focus: { top: "#11294A", mid: "#0A131F", base: "#060A12" },
  fear: { top: "#3A1410", mid: "#1A0A0A", base: "#0A0506" },
  recover: { top: "#0F3328", mid: "#0A1813", base: "#06100B" },
  sleep: { top: "#2C1640", mid: "#160C20", base: "#09060F" },
  pain: { top: "#123043", mid: "#0A1720", base: "#060B12" },
  irritation: { top: "#3A1810", mid: "#1A0D08", base: "#090504" },
};
