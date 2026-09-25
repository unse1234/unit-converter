import type { Metadata } from 'next';
import type { Locale } from './config';
import { localizedPageMetadata } from './metadata';
import { categorySlug, getLocalizedPage, getLocalizedPages } from './pages';

/**
 * Route helpers shared by the per-language folders in app/(localized)/.
 *
 * Each language needs its own folder because each has its own root layout
 * (for <html lang>); these helpers keep those folders down to a few lines.
 */

export interface CategoryRouteProps {
  params: Promise<{ category: string }>;
}

export interface ConversionRouteProps {
  params: Promise<{ category: string; slug: string }>;
}

export function homePage(locale: Locale) {
  const page = getLocalizedPage(`/${locale}`);
  if (page?.kind !== 'home') throw new Error(`Missing home page for ${locale}`);
  return page;
}

export function homeMetadata(locale: Locale): Metadata {
  return localizedPageMetadata(homePage(locale));
}

export function categoryParams(locale: Locale) {
  return getLocalizedPages(locale)
    .filter((page) => page.kind === 'category')
    .map((page) => ({ category: categorySlug(locale, page.category) }));
}

export function conversionParams(locale: Locale) {
  return getLocalizedPages(locale)
    .filter((page) => page.kind !== 'home' && page.kind !== 'category')
    .map((page) => {
      const [, , category = '', slug = ''] = page.path.split('/');
      return { category, slug };
    });
}

export function findCategoryPage(locale: Locale, category: string) {
  const page = getLocalizedPage(`/${locale}/${category}`);
  return page?.kind === 'category' ? page : undefined;
}

export function findConversionPage(locale: Locale, category: string, slug: string) {
  const page = getLocalizedPage(`/${locale}/${category}/${slug}`);
  return page && page.kind !== 'home' && page.kind !== 'category' ? page : undefined;
}

export async function categoryMetadata(
  locale: Locale,
  { params }: CategoryRouteProps,
): Promise<Metadata> {
  const page = findCategoryPage(locale, (await params).category);
  return page ? localizedPageMetadata(page) : {};
}

export async function conversionMetadata(
  locale: Locale,
  { params }: ConversionRouteProps,
): Promise<Metadata> {
  const { category, slug } = await params;
  const page = findConversionPage(locale, category, slug);
  return page ? localizedPageMetadata(page) : {};
}
