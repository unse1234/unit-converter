import { categories } from '@/data/categories';
import { collections } from '@/data/collections';
import { allUnits } from '@/data/units';
import type { CategoryDefinition, CollectionDefinition, UnitDefinition } from '@/types/units';

/**
 * Indexed access to the unit catalog.
 *
 * The indexes are built once when the module is first imported. The catalog is
 * a few hundred static records, so this is cheap, and it keeps every lookup an
 * O(1) map read instead of a repeated linear scan through page rendering.
 *
 * This module is framework-agnostic by design: it imports no React and no Next
 * APIs, so the same code runs in the browser, during static generation, in unit
 * tests, and behind a future API route.
 */

const unitById = new Map<string, UnitDefinition>();
const unitsByCategory = new Map<string, UnitDefinition[]>();
const unitBySlugKey = new Map<string, UnitDefinition>();
const categoryById = new Map<string, CategoryDefinition>();
const categoryBySlug = new Map<string, CategoryDefinition>();
const collectionBySlug = new Map<string, CollectionDefinition>();

for (const category of categories) {
  categoryById.set(category.id, category);
  categoryBySlug.set(category.slug, category);
  unitsByCategory.set(category.id, []);
}

for (const collection of collections) {
  collectionBySlug.set(collection.slug, collection);
}

for (const unit of allUnits) {
  unitById.set(unit.id, unit);
  unitBySlugKey.set(`${unit.category}/${unit.slug}`, unit);
  const bucket = unitsByCategory.get(unit.category);
  if (bucket) bucket.push(unit);
  else unitsByCategory.set(unit.category, [unit]);
}

for (const bucket of unitsByCategory.values()) {
  bucket.sort((a, b) => a.sortOrder - b.sortOrder);
}

/** Every category, ordered for navigation. */
export function getCategories(): CategoryDefinition[] {
  return [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getCategory(categoryId: string): CategoryDefinition | undefined {
  return categoryById.get(categoryId);
}

export function getCategoryBySlug(slug: string): CategoryDefinition | undefined {
  return categoryBySlug.get(slug);
}

export function getCollections(): CollectionDefinition[] {
  return [...collections].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getCollectionBySlug(slug: string): CollectionDefinition | undefined {
  return collectionBySlug.get(slug);
}

export function getUnit(unitId: string): UnitDefinition | undefined {
  return unitById.get(unitId);
}

/** Throws when the id is unknown. For code paths where absence is a bug. */
export function requireUnit(unitId: string): UnitDefinition {
  const unit = unitById.get(unitId);
  if (!unit) throw new Error(`Unknown unit id: ${unitId}`);
  return unit;
}

export function getUnitsByCategory(categoryId: string): UnitDefinition[] {
  return unitsByCategory.get(categoryId) ?? [];
}

/** Units that get their own generated landing pages. */
export function getPrimaryUnits(categoryId: string): UnitDefinition[] {
  return getUnitsByCategory(categoryId).filter((unit) => unit.seo === 'primary');
}

/** Resolves a URL segment such as "meters" within a category. */
export function getUnitBySlug(categoryId: string, slug: string): UnitDefinition | undefined {
  return unitBySlugKey.get(`${categoryId}/${slug}`);
}

/** The units a collection page exposes, in the collection's own order. */
export function getUnitsForCollection(collection: CollectionDefinition): UnitDefinition[] {
  return collection.unitIds
    .map((id) => unitById.get(id))
    .filter((unit): unit is UnitDefinition => unit !== undefined);
}

export function getAllUnits(): UnitDefinition[] {
  return allUnits;
}

/** True when both units can be converted between: same category. */
export function isConvertible(from: UnitDefinition, to: UnitDefinition): boolean {
  return from.category === to.category;
}
