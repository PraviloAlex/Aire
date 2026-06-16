import { PropsWithChildren, createContext, useContext, useMemo, useState } from "react";
import { type ColorPalette, colors, fearColors, radius, spacing, typography, stateColors } from "@/theme/tokens";

export type ThemeMode = "default" | "fear";

type ThemeContextValue = Readonly<{
  mode: ThemeMode;
  colors: ColorPalette;
  radius: typeof radius;
  spacing: typeof spacing;
  typography: typeof typography;
  stateColors: typeof stateColors;
  setMode: (mode: ThemeMode) => void;
}>;

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const [mode, setMode] = useState<ThemeMode>("default");

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      colors: mode === "fear" ? fearColors : colors,
      radius,
      spacing,
      typography,
      stateColors,
      setMode,
    }),
    [mode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme must be used inside ThemeProvider");
  return value;
}
