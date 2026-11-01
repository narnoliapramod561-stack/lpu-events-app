import AsyncStorage from '@react-native-async-storage/async-storage';

export const CACHE_VERSION = 1;
const KEY_PREFIX = '@lpu-events/cache/';

interface StoredEntry<T> {
  version: number;
  savedAt: number;
  expiresAt: number;
  staleUntil: number;
  revision?: string;
  data: T;
}

export interface CacheRead<T> {
  data: T;
  stale: boolean;
  revision?: string;
}

export class NativeCache {
  private readonly memory = new Map<string, StoredEntry<unknown>>();

  async read<T>(
    key: string,
    validate: (value: unknown) => value is T,
    options: { allowStale?: boolean; revision?: string } = {},
  ): Promise<CacheRead<T> | null> {
    const now = Date.now();
    let fromStorage = false;
    let entry = this.memory.get(key) as StoredEntry<T> | undefined;
    if (!entry) {
      try {
        const raw = await AsyncStorage.getItem(`${KEY_PREFIX}${key}`);
        if (raw) {
          entry = JSON.parse(raw) as StoredEntry<T>;
          this.memory.set(key, entry);
          fromStorage = true;
        }
      } catch {
        return null;
      }
    }

    if (!entry || entry.version !== CACHE_VERSION || !validate(entry.data)) {
      this.memory.delete(key);
      return null;
    }
    if (options.revision && entry.revision && options.revision !== entry.revision) {
      return null;
    }
    const expired = entry.expiresAt <= now;
    const stale = fromStorage || expired;
    if (expired && (!options.allowStale || entry.staleUntil <= now)) {
      return null;
    }
    return { data: entry.data, stale, revision: entry.revision };
  }

  async write<T>(key: string, data: T, ttlMs: number, staleTtlMs: number, revision?: string): Promise<void> {
    const now = Date.now();
    const entry: StoredEntry<T> = {
      version: CACHE_VERSION,
      savedAt: now,
      expiresAt: now + Math.max(ttlMs, 2),
      staleUntil: now + Math.max(ttlMs, 2) + staleTtlMs,
      revision,
      data,
    };
    this.memory.set(key, entry);
    try {
      await AsyncStorage.setItem(`${KEY_PREFIX}${key}`, JSON.stringify(entry));
    } catch {
      // Persistence is an optimization; the in-memory tier remains usable.
    }
  }

  async remove(key: string): Promise<void> {
    this.memory.delete(key);
    try {
      await AsyncStorage.removeItem(`${KEY_PREFIX}${key}`);
    } catch {
      // A failed invalidation must not break public reads.
    }
  }

  clearMemory(): void {
    this.memory.clear();
  }
}
