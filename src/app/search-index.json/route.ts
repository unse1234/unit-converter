import { buildSearchIndex } from '@/lib/search/build-index';

/**
 * The search index, served as a static JSON document.
 *
 * Generated at build time and cached hard: the catalog only changes when the
 * site is rebuilt. Serving it separately is what keeps the unit data out of
 * every page's JavaScript bundle — the search dialog fetches this once, on
 * first open, and reuses it for the rest of the session.
 */
export const dynamic = 'force-static';

export function GET() {
  return new Response(JSON.stringify(buildSearchIndex()), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
