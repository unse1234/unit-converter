/** Keep file hosting in Workers assets; normalize only proven HTML equivalents. */
interface AssetEnvironment {
  ASSETS: { fetch(request: Request): Promise<Response> };
}

const PRODUCTION_HOST = 'unitflip.org';

export function preferredContentPath(pathname: string): string | null {
  let path: string;
  try {
    // Encoded path separators change routing semantics; never guess at them.
    if (/%2f|%5c/i.test(pathname)) return null;
    path = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  path = path.replace(/\/index(?:\.html)?\/?$/i, '/').replace(/\.html\/?$/i, '');
  if (!/^\/[a-z0-9/-]*$/i.test(path)) return null;
  path =
    path
      .toLowerCase()
      .replace(/\/{2,}/g, '/')
      .replace(/\/+$/, '') || '/';
  return path === '/privacy' ? '/privacy-policy' : path;
}

export async function handleRequest(request: Request, env: AssetEnvironment): Promise<Response> {
  if (request.method !== 'GET' && request.method !== 'HEAD') return env.ASSETS.fetch(request);
  const url = new URL(request.url);
  // Next requests literal "$d$" segment keys. Assets redirects their dollar
  // signs to percent-encoded spellings; fetch that spelling internally so the
  // router receives its data directly (also avoids HTTPS upgrades in previews).
  if (/\/__next\.[^/]+\.txt$/.test(url.pathname) && url.pathname.includes('$')) {
    url.pathname = url.pathname.replaceAll('$', '%24');
    return env.ASSETS.fetch(new Request(url, request));
  }
  const canonicalHost =
    url.hostname === PRODUCTION_HOST || url.hostname === `www.${PRODUCTION_HOST}`;
  const preferred = preferredContentPath(url.pathname);
  let normalizedPath: string | null = null;

  if (preferred !== null && preferred !== url.pathname) {
    const target = new URL(url);
    target.pathname = preferred;
    // A redirect is safe only if this spelling resolves directly to real HTML.
    // Arbitrary/invalid paths keep their 404 instead of becoming soft 404s.
    const probe = await env.ASSETS.fetch(new Request(target, { method: 'HEAD' }));
    if (probe.status === 200 && probe.headers.get('content-type')?.includes('text/html')) {
      normalizedPath = preferred;
    }
  }

  if (
    normalizedPath ||
    (canonicalHost && (url.protocol !== 'https:' || url.hostname !== PRODUCTION_HOST))
  ) {
    if (normalizedPath) url.pathname = normalizedPath;
    if (canonicalHost) {
      url.protocol = 'https:';
      url.host = PRODUCTION_HOST;
    }
    // Keep converter state and unknown parameters; HTML declares the clean
    // landing-page canonical. Value/pair-specific editorial pages have paths.
    return Response.redirect(url.href, 308);
  }
  return env.ASSETS.fetch(request);
}

const worker = { fetch: handleRequest };
export default worker;
