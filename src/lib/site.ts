/**
 * Site-wide configuration.
 *
 * The canonical origin is never guessed. Every canonical URL, sitemap entry and
 * structured-data URL is built from it, so a wrong value would quietly point
 * search engines at the wrong host. next.config.ts refuses to run a production
 * build without one; the localhost fallback below only applies to development.
 */

const DEVELOPMENT_URL = 'http://localhost:3000';

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

/**
 * Resolution order:
 *  1. NEXT_PUBLIC_SITE_URL — set explicitly for production.
 *  2. On Vercel production, the project's production domain.
 *  3. On any other Vercel deployment, that deployment's own host.
 *  4. localhost, for `next dev`.
 */
function resolveSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return stripTrailingSlash(configured);

  const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (process.env.VERCEL_ENV === 'production' && productionHost) {
    return `https://${stripTrailingSlash(productionHost)}`;
  }

  const deploymentHost = process.env.VERCEL_URL?.trim();
  if (deploymentHost) return `https://${stripTrailingSlash(deploymentHost)}`;

  return DEVELOPMENT_URL;
}

/**
 * Whether search engines may index this deployment.
 *
 * Preview deployments serve the same content on a different host, which is
 * duplicate content by definition, so they are noindexed. SITE_NOINDEX forces
 * the same on any other staging environment.
 */
function resolveIndexable(): boolean {
  if (process.env.SITE_NOINDEX === 'true') return false;
  if (process.env.VERCEL_ENV) return process.env.VERCEL_ENV === 'production';
  return true;
}

export const siteConfig = {
  name: 'Unit Converter',
  url: resolveSiteUrl(),
  indexable: resolveIndexable(),
  description:
    'Fast, accurate unit conversion for length, weight, temperature, volume and 30 more categories. Exact conversion factors, formulas and reference tables.',
  locale: 'en-US',
  /** Ads and analytics are opt-in; the site is fully usable with both off. */
  adsEnabled: process.env.NEXT_PUBLIC_ADS_ENABLED === 'true',
  analyticsProvider: process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER ?? '',
} as const;

/** Builds an absolute URL from a site-relative path. */
export function absoluteUrl(path: string): string {
  return `${siteConfig.url}${path.startsWith('/') ? path : `/${path}`}`;
}
