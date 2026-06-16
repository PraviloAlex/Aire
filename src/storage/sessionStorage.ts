import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SessionRecord } from '@/types/breathing';

const HISTORY_KEY = 'aire:session_history';
const MAX_RECORDS = 100;

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export async function loadSessionHistory(): Promise<readonly SessionRecord[]> {
  const raw = await AsyncStorage.getItem(HISTORY_KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      if (__DEV__) console.warn('Session history: unexpected format, resetting');
      return [];
    }
    return parsed as SessionRecord[];
  } catch (e) {
    if (__DEV__) console.warn('Session history: parse failed, resetting', e);
    return [];
  }
}

export async function saveSessionRecord(record: SessionRecord): Promise<boolean> {
  try {
    const existing = await loadSessionHistory();
    const updated = [...existing, record].slice(-MAX_RECORDS);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return true;
  } catch {
    return false;
  }
}

export async function clearSessionHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
  } catch {
    // Storage errors are non-fatal
  }
}
