import type { MetadataRoute } from 'next';
import { absoluteUrl, siteConfig } from '@/lib/site';

/**
 * robots.txt.
 *
 * Crawling is fully open, including CSS and JavaScript, which a crawler needs
 * in order to render the page (SEO_SPEC §12).
 *
 * /search is deliberately *not* disallowed here. It must stay crawlable for
 * Google to read the noindex tag it carries — a path blocked in robots.txt is
 * never fetched, so its noindex is never seen and the URL can still surface in
 * results. The meta tag is what keeps those pages out of the index.
 *
 * Preview and staging builds disallow everything, so a second copy of the site
 * on another host is never crawled as duplicate content.
 */
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  if (!siteConfig.indexable) {
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }

  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: siteConfig.url,
  };
}
