'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { track } from '@/lib/analytics';
import { createPersistentStore } from '@/lib/persistent-store';
import { STORAGE_KEYS } from '@/lib/storage';

/**
 * Favourites and recent conversions.
 *
 * Both live in localStorage: they are per-device conveniences, not data the
 * product needs a server or an account for (PROJECT_REQUIREMENTS §4.3).
 *
 * Entries carry their own display label and href. Resolving unit ids to names
 * in the browser would mean shipping the whole unit catalog to every page just
 * to render a list of six links, so the label is captured at write time.
 *
 * The stores are module-level, so every component that reads favourites sees
 * the same list and updates together.
 */

export interface ConversionRef {
  category: string;
  from: string;
  to: string;
}

export interface SavedConversion extends ConversionRef {
  /** Human-readable pair, e.g. "meters to feet". */
  label: string;
  /** Where to reopen this conversion. */
  href: string;
}

export interface HistoryEntry extends SavedConversion {
  /** The value that was converted, kept exactly as typed. */
  value: string;
  at: number;
}

const MAX_HISTORY = 6;
const MAX_FAVORITES = 24;

export function conversionKey(ref: ConversionRef): string {
  return `${ref.category}:${ref.from}:${ref.to}`;
}

/** Drops anything that is not a well-formed entry, e.g. from an older version. */
function sanitize<T extends SavedConversion>(value: unknown): T[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (entry): entry is T =>
      typeof entry === 'object' &&
      entry !== null &&
      typeof (entry as ConversionRef).category === 'string' &&
      typeof (entry as ConversionRef).from === 'string' &&
      typeof (entry as ConversionRef).to === 'string' &&
      typeof (entry as SavedConversion).label === 'string' &&
      typeof (entry as SavedConversion).href === 'string',
  );
}

const EMPTY: never[] = [];

const favoritesStore = createPersistentStore<SavedConversion[]>(
  STORAGE_KEYS.favorites,
  EMPTY,
  sanitize,
);

const historyStore = createPersistentStore<HistoryEntry[]>(STORAGE_KEYS.history, EMPTY, sanitize);

const precisionStore = createPersistentStore<number | null>(
  STORAGE_KEYS.precision,
  null,
  (value) => (typeof value === 'number' && Number.isFinite(value) ? value : null),
);

export function useFavorites() {
  const favorites = useSyncExternalStore(
    favoritesStore.subscribe,
    favoritesStore.getSnapshot,
    favoritesStore.getServerSnapshot,
  );

  const isFavorite = useCallback(
    (ref: ConversionRef) => favorites.some((entry) => conversionKey(entry) === conversionKey(ref)),
    [favorites],
  );

  const toggleFavorite = useCallback((entry: SavedConversion) => {
    const current = favoritesStore.get();
    const key = conversionKey(entry);
    const exists = current.some((item) => conversionKey(item) === key);

    favoritesStore.set(
      exists
        ? current.filter((item) => conversionKey(item) !== key)
        : [entry, ...current].slice(0, MAX_FAVORITES),
    );

    track(exists ? 'favorite_removed' : 'favorite_added', {
      category: entry.category,
      from_unit: entry.from,
      to_unit: entry.to,
    });
  }, []);

  return { favorites, isFavorite, toggleFavorite };
}

export function useHistory() {
  const history = useSyncExternalStore(
    historyStore.subscribe,
    historyStore.getSnapshot,
    historyStore.getServerSnapshot,
  );

  /**
   * Records a completed conversion. One entry per unit pair: repeating a
   * conversion updates the existing entry instead of filling the list with
   * near-identical rows.
   */
  const record = useCallback((entry: Omit<HistoryEntry, 'at'>) => {
    const key = conversionKey(entry);
    const current = historyStore.get();
    historyStore.set(
      [
        { ...entry, at: Date.now() },
        ...current.filter((item) => conversionKey(item) !== key),
      ].slice(0, MAX_HISTORY),
    );
  }, []);

  const clear = useCallback(() => historyStore.set(EMPTY), []);

  return { history, record, clear };
}

/** Display precision, remembered across visits. */
export function usePrecision(fallback: number) {
  const stored = useSyncExternalStore(
    precisionStore.subscribe,
    precisionStore.getSnapshot,
    precisionStore.getServerSnapshot,
  );

  const setPrecision = useCallback((next: number) => {
    precisionStore.set(next);
    track('precision_changed', { precision: next });
  }, []);

  return [stored ?? fallback, setPrecision] as const;
}
