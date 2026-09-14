'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Reports the page's query parameters to the converter.
 *
 * Kept as its own component so that useSearchParams — which forces its
 * Suspense boundary to render on the client for a static page — only affects
 * this empty component and not the converter's server-rendered markup.
 *
 * Reading the router's parameters rather than window.location matters on
 * client-side navigation: the browser URL is updated during the commit, after
 * the new page has rendered, so window.location can still hold the previous
 * page's query at that point.
 */
export function UrlParamsReader({ onParams }: { onParams: (params: URLSearchParams) => void }) {
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  useEffect(() => {
    if (query) onParams(new URLSearchParams(query));
  }, [query, onParams]);

  return null;
}
