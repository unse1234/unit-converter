'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { search } from '@/lib/search/search';
import type { SearchIndex } from '@/lib/search/types';
import { track } from '@/lib/analytics';
import { EmptyState, Section } from '@/components/ui/primitives';

/**
 * Results for the /search page.
 *
 * A static export has no server to read ?q= on, so the query is resolved in
 * the browser against the same static index the search dialog fetches. The
 * form still submits with a plain GET, so the URL stays shareable and the back
 * button works.
 */

let cachedIndex: SearchIndex | null = null;

async function loadIndex(): Promise<SearchIndex> {
  if (cachedIndex) return cachedIndex;
  const response = await fetch('/search-index.json');
  if (!response.ok) throw new Error(`Search index request failed: ${response.status}`);
  cachedIndex = (await response.json()) as SearchIndex;
  return cachedIndex;
}

type LoadState = 'loading' | 'ready' | 'error';

export function SearchResults() {
  const params = useSearchParams();
  const query = params.get('q') ?? '';
  const trimmed = query.trim();

  const [index, setIndex] = useState<SearchIndex | null>(cachedIndex);
  const [state, setState] = useState<LoadState>(cachedIndex ? 'ready' : 'loading');

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

  const results = useMemo(() => {
    if (!index || !trimmed) return [];
    return search(index, trimmed, 25);
  }, [index, trimmed]);

  // One event per query, once results are actually known.
  useEffect(() => {
    if (state !== 'ready' || !trimmed) return;
    track('search_used', { result_count: results.length, matched: results.length > 0 });
  }, [state, trimmed, results.length]);

  return (
    <>
      <form action="/search" method="get" role="search" className="mt-5">
        <label htmlFor="q" className="text-fg-subtle mb-1.5 block text-xs font-medium">
          Unit, symbol or conversion
        </label>
        <div className="flex gap-2">
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="kg to lbs"
            className="bg-surface shadow-border text-fg h-12 min-w-0 flex-1 rounded-md px-3 outline-none"
            autoComplete="off"
          />
          <button
            type="submit"
            className="bg-fg text-canvas hover:bg-fg-secondary h-12 shrink-0 rounded-md px-5 text-sm font-medium transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      <div className="mt-8" aria-live="polite">
        {trimmed.length === 0 ? (
          <p className="text-fg-subtle text-sm">
            Try a unit name, a symbol, or a full conversion such as “10 kg to lbs”.
          </p>
        ) : state === 'loading' ? (
          <p className="text-fg-subtle text-sm">Searching…</p>
        ) : state === 'error' ? (
          <EmptyState
            title="Search is unavailable"
            description="The search index could not be loaded. Reload the page, or browse the categories listed in the footer."
          />
        ) : results.length === 0 ? (
          <EmptyState
            title={`No matches for “${trimmed}”`}
            description="Check the spelling, or browse the categories listed in the footer."
          />
        ) : (
          <Section title={`${results.length} result${results.length === 1 ? '' : 's'}`} headingLevel={2}>
            <ul className="space-y-1">
              {results.map((result) => (
                <li key={result.href}>
                  <Link
                    href={result.href}
                    className="hover:bg-hover flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="text-fg block truncate text-sm font-medium">
                        {result.label}
                      </span>
                      <span className="text-fg-subtle block truncate text-xs">{result.detail}</span>
                    </span>
                    <span className="text-fg-subtle shrink-0 text-xs">{result.categoryName}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>
    </>
  );
}
