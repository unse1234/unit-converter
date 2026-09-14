'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useHydrated } from '@/hooks/useHydrated';
import { Button } from '@/components/ui/Button';
import { SearchIcon } from '@/components/ui/icons';

/**
 * Opens site search.
 *
 * The dialog and the search index are both loaded on demand: neither is in the
 * initial bundle, so search costs nothing until someone actually wants it.
 */
const SearchDialog = dynamic(() => import('./SearchDialog').then((mod) => mod.SearchDialog), {
  ssr: false,
});

export function SearchTrigger() {
  const [open, setOpen] = useState(false);
  const hydrated = useHydrated();

  // Cmd/Ctrl+K, and "/" when not already typing somewhere.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT' ||
        target?.isContentEditable;

      if (
        (event.key === 'k' && (event.metaKey || event.ctrlKey)) ||
        (event.key === '/' && !typing)
      ) {
        event.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <>
      {/* Icon only on phones, where header width is scarce. */}
      <Button
        variant="ghost"
        size="icon"
        className="sm:hidden"
        aria-label="Search units and conversions"
        onClick={() => setOpen(true)}
      >
        <SearchIcon size={18} />
      </Button>

      {/*
        A field-like button from sm upward. Deliberately a plain <button> with
        its own classes rather than a restyled <Button>: overriding a
        component's display, colour or weight from the call site produces two
        competing utilities, and which one wins depends on stylesheet order
        rather than on the class list — that is how this control once stayed
        visible on phones and pushed the header off-screen.
      */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="bg-surface text-fg-subtle shadow-border hover:bg-hover hidden h-10 w-56 items-center gap-2 rounded-md px-3 text-sm transition-colors sm:inline-flex"
      >
        <SearchIcon size={16} />
        <span className="flex-1 text-left">Search units…</span>
        {hydrated ? (
          <kbd className="bg-recessed text-fg-subtle rounded px-1.5 py-0.5 font-mono text-[0.6875rem]">
            /
          </kbd>
        ) : null}
      </button>

      {open ? <SearchDialog onClose={() => setOpen(false)} /> : null}
    </>
  );
}
