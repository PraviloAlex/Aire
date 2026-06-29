import AsyncStorage from '@react-native-async-storage/async-storage';
import { PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from "react";
import type { CenterDisplayMode, OrbStyle, SessionCueSettings, SessionFont } from "@/types/breathing";

const SETTINGS_KEY = 'aire:settings';

type StoredSettings = Readonly<{
  cueSettings: SessionCueSettings;
  defaultDurationMinutes: number;
  centerDisplay: CenterDisplayMode;
  orbStyle: OrbStyle;
  sessionFont: SessionFont;
  defaultSoundscapeId: string;
  pulseEnabled: boolean;
}>;

type SettingsContextValue = Readonly<{
  cueSettings: SessionCueSettings;
  defaultDurationMinutes: number;
  centerDisplay: CenterDisplayMode;
  orbStyle: OrbStyle;
  sessionFont: SessionFont;
  defaultSoundscapeId: string;
  pulseEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  setHapticsEnabled: (enabled: boolean) => void;
  setVoiceEnabled: (enabled: boolean) => void;
  setAmbientEnabled: (enabled: boolean) => void;
  setDefaultDurationMinutes: (minutes: number) => void;
  setCenterDisplay: (mode: CenterDisplayMode) => void;
  setOrbStyle: (style: OrbStyle) => void;
  setSessionFont: (font: SessionFont) => void;
  setDefaultSoundscapeId: (id: string) => void;
  setPulseEnabled: (enabled: boolean) => void;
}>;

const SettingsContext = createContext<SettingsContextValue | null>(null);

const DEFAULT_CUE: SessionCueSettings = {
  soundEnabled: true,
  hapticsEnabled: false,
  voiceEnabled: false,
  ambientEnabled: false,
};
const DEFAULT_CENTER: CenterDisplayMode = "phase_count";
const DEFAULT_ORB: OrbStyle = "shader";
const DEFAULT_FONT: SessionFont = "serif";
const DEFAULT_SOUNDSCAPE_ID = "none";
const DEFAULT_PULSE_ENABLED = false;

export function isCenterDisplayMode(value: unknown): value is CenterDisplayMode {
  return value === "phase_count" || value === "phase" || value === "clean";
}

export function isOrbStyle(value: unknown): value is OrbStyle {
  return value === "shader" || value === "classic";
}

export function isSessionFont(value: unknown): value is SessionFont {
  return value === "serif" || value === "sans";
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

// Миграция: старые записи без voiceEnabled/ambientEnabled получают дефолты.
function migrateStoredCue(raw: SessionCueSettings): SessionCueSettings {
  return {
    soundEnabled: raw.soundEnabled,
    hapticsEnabled: raw.hapticsEnabled,
    voiceEnabled: raw.voiceEnabled ?? false,
    ambientEnabled: raw.ambientEnabled ?? false,
  };
}

export function SettingsProvider({ children }: PropsWithChildren) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [cueSettings, setCueSettings] = useState<SessionCueSettings>(DEFAULT_CUE);
  const [defaultDurationMinutes, setDefaultDurationMinutes] = useState(5);
  const [centerDisplay, setCenterDisplay] = useState<CenterDisplayMode>(DEFAULT_CENTER);
  const [orbStyle, setOrbStyle] = useState<OrbStyle>(DEFAULT_ORB);
  const [sessionFont, setSessionFont] = useState<SessionFont>(DEFAULT_FONT);
  const [defaultSoundscapeId, setDefaultSoundscapeId] = useState(DEFAULT_SOUNDSCAPE_ID);
  const [pulseEnabled, setPulseEnabled] = useState(DEFAULT_PULSE_ENABLED);

  useEffect(() => {
    AsyncStorage.getItem(SETTINGS_KEY)
      .then((raw) => {
        if (raw) {
          const parsed: unknown = JSON.parse(raw);
          if (isStoredSettings(parsed)) {
            setCueSettings(migrateStoredCue(parsed.cueSettings));
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
          // sessionFont добавлен позже — старые записи без него мигрируют на serif.
          const font = (parsed as Record<string, unknown>)?.['sessionFont'];
          if (isSessionFont(font)) {
            setSessionFont(font);
          }
          // defaultSoundscapeId добавлен позже — старые записи без него мигрируют на "none".
          const soundscapeId = (parsed as Record<string, unknown>)?.['defaultSoundscapeId'];
          if (typeof soundscapeId === 'string' && soundscapeId.length > 0) {
            setDefaultSoundscapeId(soundscapeId);
          }
          // pulseEnabled добавлен позже — старые записи без него мигрируют на false.
          const pulse = (parsed as Record<string, unknown>)?.['pulseEnabled'];
          if (typeof pulse === 'boolean') {
            setPulseEnabled(pulse);
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
    const data: StoredSettings = { cueSettings, defaultDurationMinutes, centerDisplay, orbStyle, sessionFont, defaultSoundscapeId, pulseEnabled };
    AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(data)).catch(() => {});
  }, [isLoaded, cueSettings, defaultDurationMinutes, centerDisplay, orbStyle, sessionFont, defaultSoundscapeId, pulseEnabled]);

  const value = useMemo<SettingsContextValue>(
    () => ({
      cueSettings,
      defaultDurationMinutes,
      centerDisplay,
      orbStyle,
      sessionFont,
      defaultSoundscapeId,
      pulseEnabled,
      setSoundEnabled: (enabled) =>
        setCueSettings((current) => ({ ...current, soundEnabled: enabled })),
      setHapticsEnabled: (enabled) =>
        setCueSettings((current) => ({ ...current, hapticsEnabled: enabled })),
      setVoiceEnabled: (enabled) =>
        setCueSettings((current) => ({ ...current, voiceEnabled: enabled })),
      setAmbientEnabled: (enabled) =>
        setCueSettings((current) => ({ ...current, ambientEnabled: enabled })),
      setDefaultDurationMinutes,
      setCenterDisplay,
      setOrbStyle,
      setSessionFont,
      setDefaultSoundscapeId,
      setPulseEnabled,
    }),
    [cueSettings, defaultDurationMinutes, centerDisplay, orbStyle, sessionFont, defaultSoundscapeId, pulseEnabled]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const value = useContext(SettingsContext);
  if (!value) throw new Error("useSettings must be used inside SettingsProvider");
  return value;
}
