import AsyncStorage from '@react-native-async-storage/async-storage';
import { PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from "react";
import type { CenterDisplayMode, OrbStyle, SessionCueSettings } from "@/types/breathing";

const SETTINGS_KEY = 'aire:settings';

type StoredSettings = Readonly<{
  cueSettings: SessionCueSettings;
  defaultDurationMinutes: number;
  centerDisplay: CenterDisplayMode;
  orbStyle: OrbStyle;
}>;

type SettingsContextValue = Readonly<{
  cueSettings: SessionCueSettings;
  defaultDurationMinutes: number;
  centerDisplay: CenterDisplayMode;
  orbStyle: OrbStyle;
  setSoundEnabled: (enabled: boolean) => void;
  setHapticsEnabled: (enabled: boolean) => void;
  setDefaultDurationMinutes: (minutes: number) => void;
  setCenterDisplay: (mode: CenterDisplayMode) => void;
  setOrbStyle: (style: OrbStyle) => void;
}>;

const SettingsContext = createContext<SettingsContextValue | null>(null);

const DEFAULT_CUE: SessionCueSettings = { soundEnabled: true, hapticsEnabled: false };
const DEFAULT_CENTER: CenterDisplayMode = "phase_count";
const DEFAULT_ORB: OrbStyle = "shader";

export function isCenterDisplayMode(value: unknown): value is CenterDisplayMode {
  return value === "phase_count" || value === "phase" || value === "clean";
}

export function isOrbStyle(value: unknown): value is OrbStyle {
  return value === "shader" || value === "classic";
}

export function isStoredSettings(value: unknown): value is StoredSettings {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  const cue = v['cueSettings'];
  if (!cue || typeof cue !== 'object') return false;
  const c = cue as Record<string, unknown>;
  return (
    typeof c['soundEnabled'] === 'boolean' &&
    typeof c['hapticsEnabled'] === 'boolean' &&
    typeof v['defaultDurationMinutes'] === 'number'
  );
}

export function SettingsProvider({ children }: PropsWithChildren) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [cueSettings, setCueSettings] = useState<SessionCueSettings>(DEFAULT_CUE);
  const [defaultDurationMinutes, setDefaultDurationMinutes] = useState(5);
  const [centerDisplay, setCenterDisplay] = useState<CenterDisplayMode>(DEFAULT_CENTER);
  const [orbStyle, setOrbStyle] = useState<OrbStyle>(DEFAULT_ORB);

  useEffect(() => {
    AsyncStorage.getItem(SETTINGS_KEY)
      .then((raw) => {
        if (raw) {
          const parsed: unknown = JSON.parse(raw);
          if (isStoredSettings(parsed)) {
            setCueSettings(parsed.cueSettings);
            setDefaultDurationMinutes(parsed.defaultDurationMinutes);
          }
          // centerDisplay добавлен позже — старые записи без него мигрируют на дефолт.
          const center = (parsed as Record<string, unknown>)?.['centerDisplay'];
          if (isCenterDisplayMode(center)) {
            setCenterDisplay(center);
          }
          // orbStyle добавлен позже — старые записи без него мигрируют на дефолт.
          const orb = (parsed as Record<string, unknown>)?.['orbStyle'];
          if (isOrbStyle(orb)) {
            setOrbStyle(orb);
          }
        }
      })
      .catch((e) => {
        if (__DEV__) console.warn('Settings load failed', e);
      })
      .finally(() => setIsLoaded(true));
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    const data: StoredSettings = { cueSettings, defaultDurationMinutes, centerDisplay, orbStyle };
    AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(data)).catch(() => {});
  }, [isLoaded, cueSettings, defaultDurationMinutes, centerDisplay, orbStyle]);

  const value = useMemo<SettingsContextValue>(
    () => ({
      cueSettings,
      defaultDurationMinutes,
      centerDisplay,
      orbStyle,
      setSoundEnabled: (enabled) =>
        setCueSettings((current) => ({ ...current, soundEnabled: enabled })),
      setHapticsEnabled: (enabled) =>
        setCueSettings((current) => ({ ...current, hapticsEnabled: enabled })),
      setDefaultDurationMinutes,
      setCenterDisplay,
      setOrbStyle,
    }),
    [cueSettings, defaultDurationMinutes, centerDisplay, orbStyle]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const value = useContext(SettingsContext);
  if (!value) throw new Error("useSettings must be used inside SettingsProvider");
  return value;
}
