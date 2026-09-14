import type { Metadata } from 'next';
import Link from 'next/link';
import { search } from '@/lib/search/search';
import { buildSearchIndex } from '@/lib/search/build-index';
import { buildMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { EmptyState, Section } from '@/components/ui/primitives';

/**
 * Search results.
 *
 * A real page rather than a dialog-only feature, so results are linkable, work
 * without JavaScript, and make the WebSite SearchAction in the homepage's
 * structured data truthful.
 *
 * Marked noindex: these URLs are query-driven and would otherwise create
 * unlimited near-duplicate pages, which is exactly what SEO_SPEC §17 rules out.
 * They stay "follow", so the links here still pass through to real pages.
 */

export const metadata: Metadata = buildMetadata({
  title: 'Search units and conversions',
  description: 'Find any unit, symbol or conversion across every category.',
  path: '/search',
  noIndex: true,
});

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = typeof params.q === 'string' ? params.q : '';
  const results = query.trim() ? search(buildSearchIndex(), query, 25) : [];

  return (
    <div className="page-shell py-6 sm:py-8">
      <Breadcrumbs entries={[{ name: 'Home', path: '/' }, { name: 'Search' }]} />

      <div className="mt-5 max-w-3xl">
        <h1>Search</h1>

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

        <div className="mt-8">
          {query.trim().length === 0 ? (
            <p className="text-fg-subtle text-sm">
              Try a unit name, a symbol, or a full conversion such as “10 kg to lbs”.
            </p>
          ) : results.length === 0 ? (
            <EmptyState
              title={`No matches for “${query.trim()}”`}
              description="Check the spelling, or browse the categories listed in the footer."
            />
          ) : (
            <Section
              title={`${results.length} result${results.length === 1 ? '' : 's'}`}
              headingLevel={2}
            >
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
                        <span className="text-fg-subtle block truncate text-xs">
                          {result.detail}
                        </span>
                      </span>
                      <span className="text-fg-subtle shrink-0 text-xs">{result.categoryName}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}
