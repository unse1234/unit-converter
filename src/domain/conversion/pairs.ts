import type { ConversionPair } from '@/types/conversion';
import type { CategoryDefinition, UnitDefinition } from '@/types/units';
import { getCategories, getCategory, getPrimaryUnits, getUnit } from '../units/registry';
import { getConversionRatio } from './engine';

/**
 * Which conversions get their own indexable page.
 *
 * SEO_SPEC §3 is explicit that the goal is useful search coverage rather than
 * URL count, so pages are not generated for every theoretical combination.
 * Two gates apply:
 *
 *  1. Both units must be marked `seo: 'primary'` in the catalog — the units
 *     people actually search for. Everything else still works in the converter
 *     and is listed on the category page; it simply has no landing page.
 *
 *  2. A scale guard drops pairs whose factors differ by more than 10^12. Those
 *     produce answers nobody looks for ("bits to terabytes") and would read as
 *     filler next to the pages that matter.
 *
 * Explicit exclusions handle the remaining cases where two popular units make
 * an unhelpful pair.
 */

/** Largest factor ratio that still makes a useful landing page. */
const MAX_RATIO = 1e12;

/**
 * Pairs that pass both gates but are still not worth a page, as
 * `categoryId:fromUnitId:toUnitId`. Both directions must be listed.
 */
const EXCLUDED_PAIRS = new Set<string>([
  // Numerically identical by definition — a page would say "multiply by 1".
  'density:gram-per-cubic-centimeter:gram-per-milliliter',
  'density:gram-per-milliliter:gram-per-cubic-centimeter',
]);

function pairId(categoryId: string, from: string, to: string): string {
  return `${categoryId}:${from}:${to}`;
}

function isIndexable(category: CategoryDefinition, from: UnitDefinition, to: UnitDefinition) {
  if (from.id === to.id) return false;
  if (EXCLUDED_PAIRS.has(pairId(category.id, from.id, to.id))) return false;

  const ratio = getConversionRatio(from, to);
  // A null ratio means a non-linear pair (temperature, fuel economy). Those
  // categories are small and every pair in them is a real search intent.
  if (ratio === null) return true;

  const magnitude = Math.abs(ratio);
  return magnitude <= MAX_RATIO && magnitude >= 1 / MAX_RATIO;
}

function buildPair(
  category: CategoryDefinition,
  from: UnitDefinition,
  to: UnitDefinition,
): ConversionPair {
  const slug = `${from.slug}-to-${to.slug}`;
  return {
    id: pairId(category.id, from.id, to.id),
    categoryId: category.id,
    fromUnitId: from.id,
    toUnitId: to.id,
    slug,
    path: `/${category.slug}/${slug}`,
  };
}

const pairsByCategory = new Map<string, ConversionPair[]>();
const pairBySlugKey = new Map<string, ConversionPair>();
const allPairs: ConversionPair[] = [];

for (const category of getCategories()) {
  const units = getPrimaryUnits(category.id);
  const pairs: ConversionPair[] = [];

  for (const from of units) {
    for (const to of units) {
      if (!isIndexable(category, from, to)) continue;
      const pair = buildPair(category, from, to);
      pairs.push(pair);
      pairBySlugKey.set(`${category.id}/${pair.slug}`, pair);
      allPairs.push(pair);
    }
  }

  pairsByCategory.set(category.id, pairs);
}

/** Every indexable conversion pair in a category. */
export function getConversionPairs(categoryId: string): ConversionPair[] {
  return pairsByCategory.get(categoryId) ?? [];
}

/** Every indexable conversion pair on the site. */
export function getAllConversionPairs(): ConversionPair[] {
  return allPairs;
}

export function getConversionPair(categoryId: string, slug: string): ConversionPair | undefined {
  return pairBySlugKey.get(`${categoryId}/${slug}`);
}

/** The reverse direction of a pair, when that direction is also indexable. */
export function getReversePair(pair: ConversionPair): ConversionPair | undefined {
  const category = getCategory(pair.categoryId);
  if (!category) return undefined;
  const from = getUnit(pair.toUnitId);
  const to = getUnit(pair.fromUnitId);
  if (!from || !to) return undefined;
  return pairBySlugKey.get(`${category.id}/${from.slug}-to-${to.slug}`);
}

/**
 * Conversions to link from a pair's page, ordered by how closely they relate:
 * the reverse direction, then pairs sharing the source unit, then pairs
 * sharing the target unit, then the rest of the category.
 */
export function getRelatedPairs(pair: ConversionPair, limit = 8): ConversionPair[] {
  const candidates = getConversionPairs(pair.categoryId).filter((other) => other.id !== pair.id);
  const reverse = getReversePair(pair);

  const scored = candidates
    .filter((other) => other.id !== reverse?.id)
    .map((other) => {
      let score = 0;
      if (other.fromUnitId === pair.fromUnitId) score += 3;
      if (other.toUnitId === pair.toUnitId) score += 2;
      if (other.toUnitId === pair.fromUnitId) score += 1;
      if (other.fromUnitId === pair.toUnitId) score += 1;
      return { other, score };
    })
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.other);

  return [...(reverse ? [reverse] : []), ...scored].slice(0, limit);
}

/** Groups systems the way search intent does: metric on one side, customary on the other. */
function systemGroup(unit: UnitDefinition): string {
  if (unit.system === 'si' || unit.system === 'metric') return 'metric';
  if (unit.system === 'imperial' || unit.system === 'us') return 'customary';
  return unit.system;
}

/**
 * The most prominent pairs in a category, for category pages and the homepage.
 *
 * Ranked rather than taken in catalog order: cross-system conversions carry far
 * more search demand than same-system ones ("meters to feet" over "meters to
 * centimeters"), and units earlier in the category are the better known ones.
 */
export function getPopularPairs(categoryId: string, limit = 6): ConversionPair[] {
  const primaries = getPrimaryUnits(categoryId);
  const rank = new Map(primaries.map((unit, index) => [unit.id, index]));
  const count = primaries.length;

  return [...getConversionPairs(categoryId)]
    .map((pair) => {
      const from = getUnit(pair.fromUnitId);
      const to = getUnit(pair.toUnitId);
      if (!from || !to) return { pair, score: -1 };

      const crossSystem = systemGroup(from) !== systemGroup(to) ? 10 : 0;
      const prominence =
        count - (rank.get(from.id) ?? count) + (count - (rank.get(to.id) ?? count));

      return { pair, score: crossSystem + prominence };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.pair);
}
