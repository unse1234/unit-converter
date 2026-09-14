/**
 * Guarded access to localStorage.
 *
 * Storage throws rather than returning null in several real situations —
 * Safari private browsing, blocked third-party contexts, browsers configured
 * to reject site data — so every access is wrapped. A failure here is never
 * user-visible: the feature degrades to "nothing remembered" and the app keeps
 * working, which is the right trade for preferences and history.
 */

export const STORAGE_KEYS = {
  theme: 'uc:theme',
  favorites: 'uc:favorites',
  history: 'uc:history',
  precision: 'uc:precision',
} as const;

export function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeStorage(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota exceeded or storage unavailable: preferences simply do not persist.
  }
}

export function removeStorage(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Nothing to do; the caller's in-memory state is still correct.
  }
}
