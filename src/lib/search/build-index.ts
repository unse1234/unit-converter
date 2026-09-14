import { getConversionPairs } from '@/domain/conversion/pairs';
import { getAllUnits, getCategories } from '@/domain/units/registry';
import type { SearchIndex } from './types';

/**
 * Builds the compact search index from the catalog.
 *
 * Server-side only: it pulls in the full catalog, which is exactly what should
 * not reach the browser. The result is served as a static JSON document that
 * the search dialog fetches the first time it opens.
 */
export function buildSearchIndex(): SearchIndex {
  return {
    units: getAllUnits().map((unit) => ({
      id: unit.id,
      category: unit.category,
      name: unit.name,
      plural: unit.pluralName,
      symbol: unit.symbol,
      slug: unit.slug,
      aliases: unit.aliases,
      primary: unit.seo === 'primary',
    })),
    categories: getCategories().map((category) => ({
      id: category.id,
      slug: category.slug,
      name: category.name,
      title: category.title,
      summary: category.summary,
      icon: category.icon,
      pairSlugs: getConversionPairs(category.id).map((pair) => pair.slug),
    })),
  };
}
