import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SessionRecord } from '@/types/breathing';
import { nowIso, type Repository } from '@/data/repository';

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
    const updated = [...existing, { ...record, updatedAt: nowIso() }].slice(-MAX_RECORDS);
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

async function writeHistory(records: readonly SessionRecord[]): Promise<void> {
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(records.slice(-MAX_RECORDS)));
}

// Repository-обёртка над историей сессий (мягкое удаление через deletedAt).
export const sessionRepository: Repository<SessionRecord> = {
  async list() {
    const all = await loadSessionHistory();
    return all.filter((r) => !r.deletedAt);
  },
  async get(id) {
    const all = await loadSessionHistory();
    return all.find((r) => r.id === id && !r.deletedAt) ?? null;
  },
  async upsert(item) {
    const all = await loadSessionHistory();
    const stamped: SessionRecord = { ...item, updatedAt: nowIso() };
    const idx = all.findIndex((r) => r.id === item.id);
    const next = idx >= 0 ? all.map((r) => (r.id === item.id ? stamped : r)) : [...all, stamped];
    await writeHistory(next);
    return next.filter((r) => !r.deletedAt);
  },
  async remove(id) {
    const all = await loadSessionHistory();
    const ts = nowIso();
    const next = all.map((r) => (r.id === id ? { ...r, deletedAt: ts, updatedAt: ts } : r));
    await writeHistory(next);
    return next.filter((r) => !r.deletedAt);
  },
};
