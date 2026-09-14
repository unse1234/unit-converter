import { NextResponse, type NextRequest } from 'next/server';

/**
 * Redirects any URL containing capital letters to its lowercase form.
 *
 * Paths are case-sensitive, so /Length/Meters-To-Feet would otherwise be a
 * second address for an existing page — and on a case-insensitive file system
 * the prerendered file is even served under it. SEO_SPEC §17 rules out
 * duplicate URLs for case variations; a permanent redirect folds them into the
 * canonical URL and still takes the visitor where they meant to go.
 *
 * The matcher restricts this to paths that contain an uppercase letter, so it
 * does not run for ordinary requests. Build assets are excluded because their
 * hashed file names contain capitals legitimately.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const lowercase = pathname.toLowerCase();
  if (lowercase === pathname) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = lowercase;
  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: ['/((?!_next/).*[A-Z].*)'],
};
