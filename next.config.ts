import type { NextConfig } from 'next';
import { PHASE_PRODUCTION_BUILD } from 'next/constants';

/**
 * Build configuration for a static export deployed to Cloudflare Pages.
 *
 * `output: 'export'` writes a plain HTML/CSS/JS tree to out/ with no Node
 * server behind it. That rules out several Next features, and the ones this
 * project used have been moved rather than dropped:
 *
 *  - Response headers, including the Content-Security-Policy, now live in
 *    public/_headers. next.config's headers() is never called by an export.
 *  - Redirects live in public/_redirects for the same reason.
 *
 * Both files are served by Cloudflare Pages itself. Changing a security header
 * means editing public/_headers, not this file.
 */

/**
 * Refuses to produce a production build without a canonical origin.
 *
 * Canonical URLs, the sitemap and structured data are all generated from it at
 * build time. The default is the production domain, so a plain `npm run build`
 * on Cloudflare works with no environment variable set; the check still guards
 * against someone overriding it with a malformed value.
 */
function assertSiteUrl() {
  // Static-generation workers load this file again; report once per build.
  if (process.env.__SITE_URL_CHECKED === 'true') return;
  process.env.__SITE_URL_CHECKED = 'true';

  const url = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!url) return;

  try {
    new URL(url);
  } catch {
    throw new Error(`NEXT_PUBLIC_SITE_URL is not a valid absolute URL: "${url}"`);
  }

  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(url)) {
    console.warn(
      `Building with NEXT_PUBLIC_SITE_URL=${url}. Correct for local testing; a deployed build ` +
        'must use the public domain.',
    );
  }
}

export default function nextConfig(phase: string): NextConfig {
  if (phase === PHASE_PRODUCTION_BUILD) assertSiteUrl();

  return {
    output: 'export',
    reactStrictMode: true,
    poweredByHeader: false,
    // No Next image optimiser exists in an export; images are served as-is.
    images: { unoptimized: true },
    // /length and /length/ would otherwise both resolve. Keep a single form.
    // public/_redirects strips the trailing slash so only one URL is canonical.
    trailingSlash: false,
    experimental: {
      optimizePackageImports: ['geist'],
      // The site has one root layout per language, so the 404 for unmatched
      // URLs comes from app/global-not-found.tsx rather than a root layout.
      globalNotFound: true,
    },
  };
}
