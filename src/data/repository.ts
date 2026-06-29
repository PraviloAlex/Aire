// Слой абстракции хранения: экраны зависят от Repository, а не от конкретного
// хранилища. Сегодня реализация локальная (AsyncStorage). Когда появится бэкенд,
// рядом встанет синхронизируемая реализация — экраны не меняются.
// updatedAt/deletedAt — основа offline-first синхрона (last-write-wins + tombstones).

export interface SyncableRecord {
  id: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

/** Хранилище коллекции записей (custom-паттерны, история сессий). */
export interface Repository<T extends SyncableRecord> {
  list(): Promise<readonly T[]>;
  get(id: string): Promise<T | null>;
  upsert(item: T): Promise<readonly T[]>;
  remove(id: string): Promise<readonly T[]>;
}

/** Хранилище одиночного значения на пользователя (активная программа, настройки). */
export interface SingletonRepository<T> {
  get(): Promise<T | null>;
  set(value: T): Promise<void>;
}

export function nowIso(): string {
  return new Date().toISOString();
}

/** Возвращает копию записи со свежим updatedAt (не мутирует вход). */
export function touch<T extends SyncableRecord>(item: T): T {
  return { ...item, updatedAt: nowIso() };
}
