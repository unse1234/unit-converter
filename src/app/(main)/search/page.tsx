import type { Metadata } from 'next';
import { Suspense } from 'react';
import { buildMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { SearchResults } from '@/components/search/SearchResults';

/**
 * Search results.
 *
 * A real page rather than a dialog-only feature, so results are linkable and
 * the WebSite SearchAction in the homepage's structured data is truthful.
 *
 * The query is read on the client. A static export has no server to read
 * ?q= on, so this page ships as one HTML file and SearchResults resolves the
 * query string in the browser, against the same static index the search dialog
 * uses.
 *
 * Marked noindex: these URLs are query-driven and would otherwise create
 * unlimited near-duplicate pages. They stay "follow", so the links here still
 * pass through to real pages.
 */

export const metadata: Metadata = buildMetadata({
  title: 'Search units and conversions',
  description: 'Find any unit, symbol or conversion across every category.',
  path: '/search',
  noIndex: true,
});

export default function SearchPage() {
  return (
    <div className="page-shell py-6 sm:py-8">
      <Breadcrumbs entries={[{ name: 'Home', path: '/' }, { name: 'Search' }]} />

      <div className="mt-5 max-w-3xl">
        <h1>Search</h1>
        {/* useSearchParams needs a Suspense boundary on a prerendered page. */}
        <Suspense fallback={null}>
          <SearchResults />
        </Suspense>
      </div>
    </div>
  );
}
