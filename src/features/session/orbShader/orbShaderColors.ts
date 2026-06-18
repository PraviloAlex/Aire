import { stateOrbColors } from "@/theme/gradients";
import type { BreathingGoal } from "@/types/breathing";

export type OrbRgb = readonly [number, number, number];

export type OrbShaderColors = Readonly<{
  c1: OrbRgb; // ядро/яркий свет
  c2: OrbRgb; // средний тон/свечение
  c3: OrbRgb; // тёмная сердцевина/край
}>;

// Перенос hex() из прототипа: "#rrggbb" → [r,g,b] в диапазоне 0..1.
export function hexToRgb(hex: string): OrbRgb {
  const clean = hex.replace("#", "");
  return [
    parseInt(clean.slice(0, 2), 16) / 255,
    parseInt(clean.slice(2, 4), 16) / 255,
    parseInt(clean.slice(4, 6), 16) / 255,
  ];
}

// Цвета шейдера на состояние из токенов орба: c1=ядро, c2=свечение, c3=тёмный край.
export function getOrbShaderColors(goal: BreathingGoal): OrbShaderColors {
  const tones = stateOrbColors[goal];
  return {
    c1: hexToRgb(tones.core),
    c2: hexToRgb(tones.glow),
    c3: hexToRgb(tones.edge),
  };
}
