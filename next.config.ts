import type { NextConfig } from 'next';
import { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } from 'next/constants';

/**
 * Content Security Policy.
 *
 * script-src allows 'unsafe-inline' deliberately. A nonce-based policy needs a
 * fresh nonce per response, which means rendering every page per request and
 * giving up static generation for several hundred pages. The trade-off is
 * acceptable here: the site renders no user-supplied HTML, and the only inline
 * scripts are Next's own payload and the theme initialiser. Every other
 * directive is locked to this origin.
 *
 * When an analytics or ad provider is enabled, its origins must be added here
 * explicitly — nothing third-party can load until they are.
 */
function contentSecurityPolicy(isDevelopment: boolean): string {
  return [
    "default-src 'self'",
    // React's development build relies on eval for its debugging features.
    `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    // Development adds the hot-reload websocket.
    `connect-src 'self'${isDevelopment ? ' ws: wss:' : ''}`,
    "manifest-src 'self'",
    "worker-src 'self' blob:",
    "frame-ancestors 'self'",
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'",
  ].join('; ');
}

function securityHeaders(isDevelopment: boolean) {
  return [
    { key: 'Content-Security-Policy', value: contentSecurityPolicy(isDevelopment) },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    {
      key: 'Permissions-Policy',
      value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
    },
    // Browsers ignore this header over plain HTTP, so it is harmless locally.
    // Deliberately without includeSubDomains or preload: both are commitments
    // that affect the rest of the domain and belong to whoever owns it.
    ...(isDevelopment ? [] : [{ key: 'Strict-Transport-Security', value: 'max-age=63072000' }]),
  ];
}

/**
 * Refuses to produce a production build without a canonical origin.
 *
 * Canonical URLs, the sitemap and structured data are all generated from it at
 * build time. Building without one would bake in a fallback host, which is the
 * kind of mistake that stays invisible until search results point at it.
 */
function assertSiteUrl() {
  // Static-generation workers load this file again; report once per build.
  if (process.env.__SITE_URL_CHECKED === 'true') return;
  process.env.__SITE_URL_CHECKED = 'true';

  const url =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '');

  if (!url) {
    throw new Error(
      'NEXT_PUBLIC_SITE_URL must be set for a production build. Canonical URLs, the sitemap and ' +
        'structured data are generated from it. For a local build, copy .env.example to .env.local.',
    );
  }

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

  const isDevelopment = phase === PHASE_DEVELOPMENT_SERVER;

  return {
    reactStrictMode: true,
    poweredByHeader: false,
    // /length and /length/ would otherwise both resolve. Keep a single form.
    trailingSlash: false,
    experimental: {
      optimizePackageImports: ['geist'],
    },
    async headers() {
      return [{ source: '/:path*', headers: securityHeaders(isDevelopment) }];
    },
  };
}
