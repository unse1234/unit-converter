'use client';

import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { useHydrated } from '@/hooks/useHydrated';
import { createPersistentStore } from '@/lib/persistent-store';
import { STORAGE_KEYS } from '@/lib/storage';
import { Button } from '@/components/ui/Button';
import { MonitorIcon, MoonIcon, SunIcon } from '@/components/ui/icons';

/**
 * Theme preference: light, dark, or follow the operating system.
 *
 * The resolved theme is written to `data-theme` on <html>, which the custom
 * variant in globals.css keys off. themeInitScript applies the stored choice
 * before first paint, so there is no flash of the wrong theme.
 *
 * The preference is an external store rather than context state: it lives in
 * localStorage, it can change in another tab, and every consumer must agree.
 */

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const themeStore = createPersistentStore<ThemePreference>(STORAGE_KEYS.theme, 'system', (value) =>
  value === 'light' || value === 'dark' ? value : 'system',
);

/**
 * Runs before hydration. Kept as a raw string because it must execute
 * synchronously in <head>, ahead of React. It touches only documentElement, so
 * it cannot cause a hydration mismatch in the body.
 */
export const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem(${JSON.stringify(STORAGE_KEYS.theme)});
    var preference = stored ? JSON.parse(stored) : 'system';
    var dark = preference === 'dark' ||
      (preference !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
`.trim();

function systemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(resolved: ResolvedTheme) {
  document.documentElement.setAttribute('data-theme', resolved);
}

/**
 * Keeps the document in sync with the OS while the preference is "system".
 *
 * Mounted once by the layout. There is no context: the preference lives in the
 * store, so a provider would only add indirection.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const preference = useSyncExternalStore(
    themeStore.subscribe,
    themeStore.getSnapshot,
    themeStore.getServerSnapshot,
  );

  useEffect(() => {
    if (preference !== 'system') {
      applyTheme(preference);
      return;
    }

    applyTheme(systemTheme());
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyTheme(media.matches ? 'dark' : 'light');
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [preference]);

  return <>{children}</>;
}

export function useTheme() {
  const preference = useSyncExternalStore(
    themeStore.subscribe,
    themeStore.getSnapshot,
    themeStore.getServerSnapshot,
  );

  const setPreference = useCallback((next: ThemePreference) => {
    themeStore.set(next);
    applyTheme(next === 'system' ? systemTheme() : next);
  }, []);

  return { preference, setPreference };
}

const ORDER: ThemePreference[] = ['light', 'dark', 'system'];

const LABELS: Record<ThemePreference, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
};

/**
 * Cycles light -> dark -> system.
 *
 * One button rather than a menu: it is a single tap on mobile, and the
 * accessible name states both the current setting and what pressing it will
 * do, so the cycle is not a guessing game for screen reader users.
 */
export function ThemeToggle() {
  const { preference, setPreference } = useTheme();
  const hydrated = useHydrated();

  const current = ORDER.indexOf(preference);
  const next = ORDER[(current + 1) % ORDER.length] ?? 'light';
  const Glyph = preference === 'light' ? SunIcon : preference === 'dark' ? MoonIcon : MonitorIcon;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setPreference(next)}
      // Until hydration the stored preference is unknown, so the label stays
      // generic rather than announcing something that may be wrong.
      aria-label={
        hydrated ? `Theme: ${LABELS[preference]}. Switch to ${LABELS[next]}.` : 'Change theme'
      }
      title={hydrated ? `Theme: ${LABELS[preference]}` : 'Change theme'}
    >
      <Glyph size={18} />
    </Button>
  );
}
