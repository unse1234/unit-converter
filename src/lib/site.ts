/**
 * Site-wide configuration.
 *
 * The canonical origin is never guessed. Every canonical URL, sitemap entry and
 * structured-data URL is built from it, so a wrong value would quietly point
 * search engines at the wrong host. Local previews use the same production
 * origin; next.config.ts rejects a conflicting legacy environment override.
 */

import { PRODUCTION_ORIGIN } from './site-origin';

/**
 * Whether search engines may index this deployment.
 *
 * A preview build serves the same content on a different host, which is
 * duplicate content by definition. SITE_NOINDEX=true serves noindex and a
 * disallow-all robots.txt for any such environment.
 */
function resolveIndexable(): boolean {
  return process.env.SITE_NOINDEX !== 'true';
}

export const siteConfig = {
  name: 'UnitFlip',
  url: PRODUCTION_ORIGIN,
  indexable: resolveIndexable(),
  /** The default <title>, used verbatim on the homepage. */
  defaultTitle: 'UnitFlip – Free Online Unit Converter',
  description:
    'Free online unit converter for length, weight, temperature, volume and 30 more categories. Conversion formulas, worked examples, assumptions and reference tables.',
  locale: 'en-US',
  /** Published on the contact page and used in structured data. */
  contactEmail: 'contact@unitflip.org',
  /** Ads and analytics are opt-in; the site is fully usable with both off. */
  adsEnabled: process.env.NEXT_PUBLIC_ADS_ENABLED === 'true',
  /** GA4 measurement id. Analytics loads only when this is set. */
  gaId: process.env.NEXT_PUBLIC_GA_ID?.trim() ?? '',
} as const;

/** Builds an absolute URL from a site-relative path. */
export function absoluteUrl(path: string): string {
  if (path.startsWith('//')) throw new Error('Expected a site-relative URL.');
  const url = new URL(path.startsWith('/') ? path : `/${path}`, siteConfig.url);
  if (url.origin !== siteConfig.url) throw new Error('Expected a site-relative URL.');
  return url.href;
}
