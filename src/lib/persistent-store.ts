import { writeStorage } from './storage';

/**
 * A localStorage-backed external store, read through useSyncExternalStore.
 *
 * Reading persisted state in an effect and calling setState causes a cascading
 * render and gives every component its own copy, so two components showing
 * favourites would not see each other's changes. Modelling storage as what it
 * is — an external store — fixes both, and hydrates correctly: React renders
 * the server snapshot first and switches to the client snapshot afterwards.
 *
 * getSnapshot must return a referentially stable value or React re-renders in a
 * loop, so the parsed value is cached and only replaced when the stored text
 * actually changes.
 */
export interface PersistentStore<T> {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => T;
  getServerSnapshot: () => T;
  set: (next: T) => void;
  get: () => T;
}

export function createPersistentStore<T>(
  key: string,
  fallback: T,
  /** Rejects malformed persisted data, e.g. written by an older version. */
  validate: (value: unknown) => T = (value) => value as T,
): PersistentStore<T> {
  let cache: T = fallback;
  // The raw stored text behind `cache`; undefined until the first read.
  let cachedRaw: string | null | undefined;
  const listeners = new Set<() => void>();

  function readRaw(): string | null {
    try {
      return window.localStorage.getItem(key);
    } catch {
      // Storage can throw (private browsing, blocked site data); treat as empty.
      return null;
    }
  }

  /** Refreshes the cache from storage. Returns true when the value changed. */
  function load(): boolean {
    const raw = readRaw();
    if (raw === cachedRaw) return false;
    cachedRaw = raw;
    if (raw === null) {
      cache = fallback;
    } else {
      try {
        cache = validate(JSON.parse(raw));
      } catch {
        cache = fallback;
      }
    }
    return true;
  }

  function emit() {
    for (const listener of listeners) listener();
  }

  function getSnapshot(): T {
    if (cachedRaw === undefined) load();
    return cache;
  }

  // The server has no storage, so it always renders the neutral fallback.
  function getServerSnapshot(): T {
    return fallback;
  }

  function subscribe(listener: () => void) {
    // Storage may have changed while nothing was listening — for example on a
    // page with no converter. React re-reads the snapshot after subscribing, so
    // refreshing here is enough for a newly mounted component to see it.
    if (listeners.size === 0) load();
    listeners.add(listener);

    // Another tab changing the same key keeps every open tab in agreement.
    const onStorage = (event: StorageEvent) => {
      if (event.key !== null && event.key !== key) return;
      if (load()) emit();
    };
    window.addEventListener('storage', onStorage);

    return () => {
      listeners.delete(listener);
      window.removeEventListener('storage', onStorage);
    };
  }

  function set(next: T) {
    cache = next;
    cachedRaw = JSON.stringify(next);
    writeStorage(key, next);
    emit();
  }

  return { subscribe, getSnapshot, getServerSnapshot, set, get: getSnapshot };
}
