import type { MetadataRoute } from 'next';
import { absoluteUrl, siteConfig } from '@/lib/site';

/**
 * robots.txt.
 *
 * Crawling is open, including CSS and JavaScript, which a crawler needs to
 * render the page (SEO_SPEC §12). /search is disallowed because its result
 * pages are query-driven; they also carry a noindex tag, and that tag — not
 * this file — is what keeps them out of the index.
 *
 * Preview and staging deployments disallow everything, so a second copy of the
 * site on another host is never crawled as duplicate content.
 */
export default function robots(): MetadataRoute.Robots {
  if (!siteConfig.indexable) {
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }

  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/search'] }],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: siteConfig.url,
  };
}
