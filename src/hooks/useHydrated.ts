'use client';

import { useSyncExternalStore } from 'react';

/** Never fires: hydration happens once and never reverts. */
const neverChanges = () => () => {};
const onClient = () => true;
const onServer = () => false;

/**
 * False during server rendering and the hydration pass, true afterwards.
 *
 * Used where markup must not depend on client-only state until React has
 * hydrated — a keyboard-shortcut hint, or a control whose label reflects a
 * stored preference. Doing this with useState plus an effect works but causes
 * a second render pass; useSyncExternalStore lets React fold the change into
 * the hydration commit instead.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(neverChanges, onClient, onServer);
}
