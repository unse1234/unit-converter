import type { NextConfig } from 'next';
import { PHASE_PRODUCTION_BUILD } from 'next/constants';
import { assertProductionOrigin } from './src/lib/site-origin';

/**
 * Build configuration for a static export deployed to Cloudflare Workers assets.
 *
 * `output: 'export'` writes a plain HTML/CSS/JS tree to out/ with no Node
 * server behind it. That rules out several Next features, and the ones this
 * project used have been moved rather than dropped:
 *
 *  - Response headers, including the Content-Security-Policy, now live in
 *    public/_headers. next.config's headers() is never called by an export.
 *  - Legacy redirects live in public/_redirects; URL normalization is in the Worker.
 *
 * Both files are read by Cloudflare Workers assets. Changing a security header
 * means editing public/_headers, not this file.
 */

/**
 * Refuses a build whose legacy origin setting conflicts with the public site.
 *
 * Canonical URLs, the sitemap and structured data are all generated from it at
 * build time. The default is the production domain, so a plain `npm run build`
 * on Cloudflare works with no environment variable set; the check still guards
 * against someone overriding it with a malformed value.
 */
function assertSiteUrl() {
  assertProductionOrigin(process.env.NEXT_PUBLIC_SITE_URL);
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
    // Workers normalizes known HTML routes with permanent redirects.
    trailingSlash: false,
    experimental: {
      optimizePackageImports: ['geist'],
      // The site has one root layout per language, so the 404 for unmatched
      // URLs comes from app/global-not-found.tsx rather than a root layout.
      globalNotFound: true,
    },
  };
}
