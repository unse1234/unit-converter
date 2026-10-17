import type { MetadataRoute } from 'next';
import { getAllConversionPairs } from '@/domain/conversion/pairs';
import { getCategories, getCollections } from '@/domain/units/registry';
import {
  getEnglishPageAlternates,
  getLocalizedPages,
  getPageAlternates,
  hreflangMap,
} from '@/i18n/pages';
import { absoluteUrl, siteConfig } from '@/lib/site';

/**
 * XML sitemap, generated from the routes that actually exist.
 *
 * Built from the same data that generates the pages, so it cannot list a URL
 * that 404s or miss one that was added (SEO_SPEC §11). Only indexable pages
 * appear: /search is excluded because it is noindex, and no query-string URL
 * is ever listed.
 *
 * If the inventory ever reaches 50,000 URLs, split it with generateSitemaps.
 *
 * Localized pages are listed too, and every page with translations carries
 * its hreflang alternates (xhtml:link), the same set its <head> declares.
 */
// A static export prerenders this once at build time; nothing here reads a
// request, but the flag makes that explicit and keeps the export honest.
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  // A build timestamp is not a content modification date. Omit lastmod until
  // reliable per-page editorial dates are maintained.
  if (!siteConfig.indexable) return [];

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), changeFrequency: 'weekly', priority: 1 },
    { url: absoluteUrl('/about'), changeFrequency: 'yearly', priority: 0.3 },
    { url: absoluteUrl('/contact'), changeFrequency: 'yearly', priority: 0.3 },
    { url: absoluteUrl('/privacy-policy'), changeFrequency: 'yearly', priority: 0.2 },
    { url: absoluteUrl('/terms'), changeFrequency: 'yearly', priority: 0.2 },
  ];

  const categoryPages: MetadataRoute.Sitemap = getCategories().map((category) => ({
    url: absoluteUrl(`/${category.slug}`),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const collectionPages: MetadataRoute.Sitemap = getCollections().map((collection) => ({
    url: absoluteUrl(`/${collection.slug}`),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const conversionPages: MetadataRoute.Sitemap = getAllConversionPairs().map((pair) => ({
    url: absoluteUrl(pair.path),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const localizedPages: MetadataRoute.Sitemap = getLocalizedPages().map((page) => ({
    url: absoluteUrl(page.path),
    changeFrequency: 'monthly',
    priority: page.kind === 'home' ? 0.9 : page.kind === 'category' ? 0.7 : 0.6,
    ...withAlternates(hreflangMap(getPageAlternates(page), absoluteUrl)),
  }));

  const english = [...staticPages, ...categoryPages, ...collectionPages, ...conversionPages].map(
    (entry) => ({
      ...entry,
      ...withAlternates(
        hreflangMap(getEnglishPageAlternates(new URL(entry.url).pathname), absoluteUrl),
      ),
    }),
  );

  return [...english, ...localizedPages];
}

function withAlternates(languages: Record<string, string> | undefined) {
  return languages ? { alternates: { languages } } : {};
}
