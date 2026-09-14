'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { search } from '@/lib/search/search';
import type { SearchIndex, SearchResult } from '@/lib/search/types';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/cn';
import { EmptyState } from '@/components/ui/primitives';
import { SearchIcon } from '@/components/ui/icons';

/**
 * Site search dialog.
 *
 * Uses the native <dialog> element, so focus trapping, Escape-to-close and
 * background inertness come from the platform. The list follows the ARIA
 * combobox pattern: focus stays in the text field and the active option is
 * announced through aria-activedescendant.
 *
 * The index is fetched once from a static JSON document, cached in module
 * scope for the session, and shared by every later open.
 */

let cachedIndex: SearchIndex | null = null;
let inflight: Promise<SearchIndex> | null = null;

async function loadIndex(): Promise<SearchIndex> {
  if (cachedIndex) return cachedIndex;
  if (!inflight) {
    inflight = fetch('/search-index.json')
      .then((response) => {
        if (!response.ok) throw new Error(`Search index request failed: ${response.status}`);
        return response.json() as Promise<SearchIndex>;
      })
      .then((index) => {
        cachedIndex = index;
        return index;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

type LoadState = 'loading' | 'ready' | 'error';

export function SearchDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const [index, setIndex] = useState<SearchIndex | null>(cachedIndex);
  const [state, setState] = useState<LoadState>(cachedIndex ? 'ready' : 'loading');
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    dialogRef.current?.showModal();
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (cachedIndex) return;

    loadIndex()
      .then((loaded) => {
        if (cancelled) return;
        setIndex(loaded);
        setState('ready');
      })
      .catch(() => {
        if (!cancelled) setState('error');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Adjusting state during render is React's documented alternative to an
  // effect when state must reset because an input changed; it avoids the extra
  // render pass an effect would cause.
  const [lastQuery, setLastQuery] = useState(query);
  if (query !== lastQuery) {
    setLastQuery(query);
    setActiveIndex(0);
  }

  const results: SearchResult[] = useMemo(() => {
    if (!index || query.trim().length === 0) return [];
    return search(index, query, 10);
  }, [index, query]);

  useEffect(() => {
    const option = listRef.current?.querySelector<HTMLElement>('[data-active="true"]');
    option?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, results.length]);

  // Report search usage once the user pauses, not on every keystroke.
  useEffect(() => {
    if (query.trim().length < 2) return;
    const timer = setTimeout(
      () => track('search_used', { resultCount: results.length, matched: results.length > 0 }),
      700,
    );
    return () => clearTimeout(timer);
  }, [query, results.length]);

  const go = useCallback(
    (result: SearchResult) => {
      dialogRef.current?.close();
      router.push(result.href);
    },
    [router],
  );

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (results.length === 0) return;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex((current) => (current + 1) % results.length);
        break;
      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex((current) => (current - 1 + results.length) % results.length);
        break;
      case 'Enter': {
        event.preventDefault();
        const result = results[activeIndex];
        if (result) go(result);
        break;
      }
      default:
        break;
    }
  };

  const activeId = results[activeIndex] ? `search-option-${activeIndex}` : undefined;

  return (
    <dialog
      ref={dialogRef}
      aria-label="Search units and conversions"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) dialogRef.current?.close();
      }}
      className="bg-surface text-fg shadow-modal m-0 mx-auto mt-[8vh] w-[min(36rem,92vw)] max-w-none overflow-hidden rounded-2xl p-0 backdrop:bg-black/40"
    >
      <div className="relative shadow-[0_1px_0_0_var(--ds-border)]">
        <SearchIcon
          size={18}
          className="text-fg-muted pointer-events-none absolute top-1/2 left-4 -translate-y-1/2"
        />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={results.length > 0}
          aria-controls="search-results"
          aria-autocomplete="list"
          {...(activeId ? { 'aria-activedescendant': activeId } : {})}
          aria-label="Search units and conversions"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Try “kg to lbs”, “metre” or “10 c to f”"
          className="text-fg h-14 w-full bg-transparent pr-4 pl-11 text-base outline-none"
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      <div className="max-h-[min(26rem,60dvh)] overflow-y-auto overscroll-contain">
        {state === 'loading' ? (
          <p className="text-fg-subtle px-4 py-8 text-center text-sm">Loading units…</p>
        ) : state === 'error' ? (
          <div className="px-4 py-8">
            <EmptyState
              title="Search is unavailable"
              description="The unit index could not be loaded. Check your connection, or browse the categories in the footer."
            />
          </div>
        ) : query.trim().length === 0 ? (
          <p className="text-fg-subtle px-4 py-8 text-center text-sm">
            Search for a unit, a symbol, or a whole conversion.
          </p>
        ) : results.length === 0 ? (
          <EmptyState
            title={`No matches for “${query.trim()}”`}
            description="Try a unit name or symbol, such as kilogram, kg, or °C."
          />
        ) : (
          <ul id="search-results" role="listbox" aria-label="Search results" className="p-2">
            {results.map((result, position) => {
              const isActive = position === activeIndex;
              return (
                <li
                  key={result.href}
                  id={`search-option-${position}`}
                  role="option"
                  aria-selected={isActive}
                  data-active={isActive}
                  // Keep focus in the search field when pressing a result, and
                  // navigate on click: a pointerdown also starts touch scrolls.
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => go(result)}
                  onPointerMove={() => setActiveIndex(position)}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5',
                    isActive ? 'bg-hover' : '',
                  )}
                >
                  <span className="min-w-0 flex-1">
                    <span className="text-fg block truncate text-sm font-medium">
                      {result.label}
                    </span>
                    <span className="text-fg-subtle block truncate text-xs">{result.detail}</span>
                  </span>
                  <span className="text-fg-subtle shrink-0 text-xs">{result.categoryName}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </dialog>
  );
}
