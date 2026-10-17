/** Search signals always name the public site, including on local previews. */
export const PRODUCTION_ORIGIN = 'https://unitflip.org';

/** Reject configuration that could bake a different site into an exported build. */
export function assertProductionOrigin(configured?: string): void {
  if (!configured?.trim()) return;
  let url: URL;
  try {
    url = new URL(configured.trim());
  } catch {
    throw new Error('NEXT_PUBLIC_SITE_URL must be the production origin https://unitflip.org.');
  }
  if (
    url.origin !== PRODUCTION_ORIGIN ||
    url.pathname !== '/' ||
    url.search ||
    url.hash ||
    url.username ||
    url.password
  ) {
    throw new Error(
      'NEXT_PUBLIC_SITE_URL must be https://unitflip.org (or unset). Local previews also use production canonicals; set SITE_NOINDEX=true for an unindexable preview.',
    );
  }
}
