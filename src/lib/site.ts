/**
 * Site-wide configuration.
 *
 * The canonical origin is never guessed. Every canonical URL, sitemap entry and
 * structured-data URL is built from it, so a wrong value would quietly point
 * search engines at the wrong host. It defaults to the production domain and
 * can be overridden for local work; next.config.ts validates any override.
 */

/** The production origin. No trailing slash. */
const PRODUCTION_URL = 'https://unitflip.org';

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

/**
 * Resolution order:
 *  1. NEXT_PUBLIC_SITE_URL — set it to http://localhost:3000 for local work.
 *  2. The production domain.
 */
function resolveSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return configured ? stripTrailingSlash(configured) : PRODUCTION_URL;
}

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
  url: resolveSiteUrl(),
  indexable: resolveIndexable(),
  /** The default <title>, used verbatim on the homepage. */
  defaultTitle: 'UnitFlip – Free Online Unit Converter',
  description:
    'Free online unit converter for length, weight, temperature, volume and 30 more categories. Exact conversion factors, formulas, worked examples and reference tables.',
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
  return `${siteConfig.url}${path.startsWith('/') ? path : `/${path}`}`;
}
