import { describe, expect, it } from 'vitest';
import { getAllConversionPairs, getConversionPairs } from '@/domain/conversion/pairs';
import {
  getAllUnits,
  getCategories,
  getCollections,
  getUnitsByCategory,
} from '@/domain/units/registry';
import { validateCatalog } from '@/domain/units/validate';

describe('catalog integrity', () => {
  it('has no validation errors', () => {
    const errors = validateCatalog().filter((issue) => issue.severity === 'error');
    expect(errors, errors.map((e) => `${e.scope}: ${e.message}`).join('\n')).toEqual([]);
  });

  it('leaves no ambiguous search term without a resolution rule', () => {
    const unresolved = validateCatalog().filter((issue) =>
      issue.message.includes('no resolution rule'),
    );
    expect(unresolved.map((issue) => issue.message)).toEqual([]);
  });

  it('covers every category required by UNIT_CATALOG', () => {
    const slugs = new Set([
      ...getCategories().map((category) => category.slug),
      ...getCollections().map((collection) => collection.slug),
    ]);

    for (const required of [
      'length',
      'weight',
      'temperature',
      'area',
      'volume',
      'speed',
      'time',
      'pressure',
      'energy',
      'power',
      'angle',
      'frequency',
      'force',
      'torque',
      'acceleration',
      'density',
      'flow-rate',
      'fuel-economy',
      'digital-storage',
      'data-transfer-rate',
      'electric-current',
      'voltage',
      'resistance',
      'capacitance',
      'inductance',
      'magnetic-field',
      'electric-charge',
      'conductance',
      'radioactivity',
      'typography',
      'cooking',
    ]) {
      expect(slugs.has(required), `missing category route: ${required}`).toBe(true);
    }
  });

  it('gives every unit at least one alias for search', () => {
    const missing = getAllUnits().filter((unit) => unit.aliases.length === 0 && !unit.symbol);
    expect(missing.map((unit) => unit.id)).toEqual([]);
  });

  it('documents a source or note for non-obvious constants', () => {
    // Every unit whose value is conventional rather than exact must disclose it.
    const conventional = ['mach', 'month', 'year', 'calorie', 'btu', 'pixel', 'candlepower'];
    for (const id of conventional) {
      const unit = getAllUnits().find((candidate) => candidate.id === id);
      expect(unit, `missing unit ${id}`).toBeDefined();
      expect(unit?.note ?? unit?.source, `${id} must disclose its convention`).toBeTruthy();
    }
  });

  it('names the measurement system on every ambiguous volume unit', () => {
    const ambiguous = ['gallon', 'quart', 'pint', 'cup', 'fluid-ounce', 'tablespoon', 'teaspoon'];
    for (const unit of getUnitsByCategory('volume')) {
      const isAmbiguous = ambiguous.some((term) => unit.id.includes(term));
      if (!isAmbiguous) continue;
      expect(
        /US|imperial|metric|Australian/.test(unit.name),
        `${unit.id} must name its system, got "${unit.name}"`,
      ).toBe(true);
    }
  });
});

describe('generated conversion pages', () => {
  const pairs = getAllConversionPairs();

  it('generates a useful number of pages', () => {
    expect(pairs.length).toBeGreaterThan(300);
  });

  it('produces unique paths', () => {
    const paths = new Set(pairs.map((pair) => pair.path));
    expect(paths.size).toBe(pairs.length);
  });

  it('uses lowercase hyphenated URLs with no query strings', () => {
    for (const pair of pairs) {
      expect(pair.path).toMatch(/^\/[a-z0-9-]+\/[a-z0-9-]+-to-[a-z0-9-]+$/);
    }
  });

  it('generates both directions for core conversions', () => {
    const paths = new Set(pairs.map((pair) => pair.path));
    for (const path of [
      '/length/meters-to-feet',
      '/length/feet-to-meters',
      '/length/kilometers-to-miles',
      '/length/miles-to-kilometers',
      '/weight/kilograms-to-pounds',
      '/weight/pounds-to-kilograms',
      '/temperature/celsius-to-fahrenheit',
      '/temperature/fahrenheit-to-celsius',
      '/volume/liters-to-us-gallons',
      '/area/square-meters-to-square-feet',
      '/speed/kilometers-per-hour-to-miles-per-hour',
    ]) {
      expect(paths.has(path), `missing generated page: ${path}`).toBe(true);
    }
  });

  it('never pairs a unit with itself', () => {
    for (const pair of pairs) {
      expect(pair.fromUnitId).not.toBe(pair.toUnitId);
    }
  });

  it('only pairs units that share a category', () => {
    for (const pair of pairs) {
      const units = getUnitsByCategory(pair.categoryId).map((unit) => unit.id);
      expect(units).toContain(pair.fromUnitId);
      expect(units).toContain(pair.toUnitId);
    }
  });

  it('skips pairs whose scales are too far apart to be useful', () => {
    const lengthPaths = new Set(getConversionPairs('length').map((pair) => pair.path));
    // Both are primary units, but nobody searches this.
    expect(lengthPaths.has('/length/nanometers-to-miles')).toBe(false);
  });
});
