import { customConversions } from '../conversion/custom';
import { getPreferredUnitId } from '@/lib/search/disambiguation';
import {
  getAllUnits,
  getCategories,
  getCollections,
  getUnit,
  getUnitsByCategory,
} from './registry';

/**
 * Catalog integrity validation, required by UNIT_CATALOG §6.
 *
 * Run as a unit test so a bad data edit fails CI rather than shipping a wrong
 * conversion or a broken route. Kept in the domain layer so it can also be
 * wired into a build step or a future admin check.
 */

export interface CatalogIssue {
  severity: 'error' | 'warning';
  scope: string;
  message: string;
}

export function validateCatalog(): CatalogIssue[] {
  const issues: CatalogIssue[] = [];
  const error = (scope: string, message: string) =>
    issues.push({ severity: 'error', scope, message });
  const warn = (scope: string, message: string) =>
    issues.push({ severity: 'warning', scope, message });

  const units = getAllUnits();
  const categories = getCategories();
  const categoryIds = new Set(categories.map((category) => category.id));

  // Unit ids must be globally unique: they are used as stable keys everywhere.
  const seenIds = new Set<string>();
  for (const unit of units) {
    if (seenIds.has(unit.id)) error(unit.id, 'Duplicate unit id.');
    seenIds.add(unit.id);

    if (!categoryIds.has(unit.category)) {
      error(unit.id, `References unknown category "${unit.category}".`);
    }

    switch (unit.conversionType) {
      case 'linear':
      case 'affine': {
        if (typeof unit.factor !== 'number' || !Number.isFinite(unit.factor)) {
          error(unit.id, 'Linear and affine units need a finite factor.');
        } else if (unit.factor === 0) {
          error(unit.id, 'A zero factor would make the unit unconvertible.');
        }
        if (unit.conversionType === 'affine' && typeof unit.offset !== 'number') {
          error(unit.id, 'Affine units need an offset.');
        }
        break;
      }
      case 'custom': {
        if (!unit.customKey) {
          error(unit.id, 'Custom units need a customKey.');
        } else if (!(unit.customKey in customConversions)) {
          error(unit.id, `No custom conversion registered for "${unit.customKey}".`);
        }
        break;
      }
    }

    if (!unit.slug) error(unit.id, 'Missing URL slug.');
    if (!/^[a-z0-9-]+$/.test(unit.slug)) {
      error(unit.id, `Slug "${unit.slug}" must be lowercase letters, digits and hyphens.`);
    }
    if (!unit.name || !unit.pluralName) error(unit.id, 'Missing name or plural name.');
  }

  // Slugs only need to be unique within a category, since routes are scoped.
  for (const category of categories) {
    const categoryUnits = getUnitsByCategory(category.id);

    if (categoryUnits.length < 2) {
      error(category.id, 'A category needs at least two units to be convertible.');
    }

    const slugs = new Set<string>();
    for (const unit of categoryUnits) {
      if (slugs.has(unit.slug)) {
        error(category.id, `Duplicate unit slug "${unit.slug}" — routes would collide.`);
      }
      slugs.add(unit.slug);
    }

    const base = getUnit(category.baseUnit);
    if (!base) {
      error(category.id, `Base unit "${category.baseUnit}" does not exist.`);
    } else {
      if (base.category !== category.id) {
        error(category.id, `Base unit "${base.id}" belongs to category "${base.category}".`);
      }
      if (base.conversionType !== 'custom' && base.factor !== 1) {
        error(category.id, `Base unit "${base.id}" must have factor 1, found ${base.factor}.`);
      }
      if (base.conversionType === 'affine' && base.offset !== 0) {
        error(category.id, `Base unit "${base.id}" must have offset 0.`);
      }
    }

    // Every unit in a category must agree on which unit is the base.
    for (const unit of categoryUnits) {
      if (unit.baseUnit !== category.baseUnit) {
        error(
          unit.id,
          `Declares base "${unit.baseUnit}" but its category uses "${category.baseUnit}".`,
        );
      }
    }

    for (const unitId of category.defaultPair) {
      const unit = getUnit(unitId);
      if (!unit) error(category.id, `Default pair references unknown unit "${unitId}".`);
      else if (unit.category !== category.id) {
        error(category.id, `Default pair unit "${unitId}" is not in this category.`);
      }
    }
    if (category.defaultPair[0] === category.defaultPair[1]) {
      error(category.id, 'Default pair must use two different units.');
    }

    for (const relatedId of category.related) {
      if (!categoryIds.has(relatedId)) {
        error(category.id, `Related category "${relatedId}" does not exist.`);
      }
    }

    if (getUnitsByCategory(category.id).filter((unit) => unit.seo === 'primary').length < 2) {
      warn(category.id, 'Fewer than two primary units: no conversion pages will be generated.');
    }
  }

  // Category slugs must be unique, and must not collide with collection slugs.
  const routeSlugs = new Map<string, string>();
  for (const category of categories) {
    const existing = routeSlugs.get(category.slug);
    if (existing) error(category.id, `Route slug "${category.slug}" collides with ${existing}.`);
    routeSlugs.set(category.slug, `category ${category.id}`);
  }

  for (const collection of getCollections()) {
    const existing = routeSlugs.get(collection.slug);
    if (existing)
      error(collection.id, `Route slug "${collection.slug}" collides with ${existing}.`);
    routeSlugs.set(collection.slug, `collection ${collection.id}`);

    if (!categoryIds.has(collection.categoryId)) {
      error(collection.id, `References unknown category "${collection.categoryId}".`);
    }
    if (collection.unitIds.length < 2) {
      error(collection.id, 'A collection needs at least two units.');
    }
    for (const unitId of collection.unitIds) {
      const unit = getUnit(unitId);
      if (!unit) {
        error(collection.id, `References unknown unit "${unitId}".`);
      } else if (unit.category !== collection.categoryId) {
        error(
          collection.id,
          `Unit "${unitId}" is in category "${unit.category}", not "${collection.categoryId}".`,
        );
      }
    }
    for (const unitId of collection.defaultPair) {
      if (!collection.unitIds.includes(unitId)) {
        error(collection.id, `Default pair unit "${unitId}" is not in the collection.`);
      }
    }
  }

  // A term that matches two units in the same category needs a documented
  // resolution rule, otherwise search would have to guess (UNIT_CATALOG §6).
  for (const category of categories) {
    const termOwners = new Map<string, string[]>();
    for (const unit of getUnitsByCategory(category.id)) {
      const terms = [unit.name, unit.pluralName, unit.symbol, ...unit.aliases]
        .filter(Boolean)
        .map((term) => term.toLowerCase().trim());
      for (const term of new Set(terms)) {
        termOwners.set(term, [...(termOwners.get(term) ?? []), unit.id]);
      }
    }
    for (const [term, owners] of termOwners) {
      if (owners.length < 2) continue;

      const preferred = getPreferredUnitId(term);
      if (!preferred) {
        error(
          category.id,
          `Term "${term}" matches ${owners.join(', ')} with no resolution rule. ` +
            'Add one to lib/search/disambiguation.ts or make the alias unique.',
        );
      } else if (!owners.includes(preferred)) {
        error(
          category.id,
          `Resolution rule for "${term}" points at "${preferred}", which does not match it.`,
        );
      }
    }
  }

  return issues;
}

/** Errors only, for assertions that should not fail on warnings. */
export function getCatalogErrors(): CatalogIssue[] {
  return validateCatalog().filter((issue) => issue.severity === 'error');
}
