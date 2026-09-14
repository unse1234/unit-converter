import { gzipSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { buildSearchIndex } from '@/lib/search/build-index';
import { getPreferredUnitId } from '@/lib/search/disambiguation';
import { findUnits, normalizeTerm, parseQuery, resolveUnit, search } from '@/lib/search/search';

const index = buildSearchIndex();

describe('normalizeTerm', () => {
  it('lowercases, trims and collapses whitespace', () => {
    expect(normalizeTerm('  Meters   To  FEET ')).toBe('meters to feet');
  });

  it('strips diacritics so accented spellings match', () => {
    expect(normalizeTerm('Réaumur')).toBe('reaumur');
  });

  it('keeps decimal points and grouping between digits', () => {
    expect(normalizeTerm('2.5 miles')).toBe('2.5 miles');
    expect(normalizeTerm('1,000 grams')).toBe('1,000 grams');
  });

  it('drops punctuation that is not part of a number', () => {
    expect(normalizeTerm('kg, lbs?')).toBe('kg lbs');
    expect(normalizeTerm('fl. oz.')).toBe('fl oz');
  });
});

describe('parseQuery', () => {
  it('splits a conversion query into two unit fragments', () => {
    expect(parseQuery('meters to feet')).toEqual({ from: 'meters', to: 'feet' });
  });

  it('accepts "in" and "into" as separators', () => {
    expect(parseQuery('kg in lbs')).toEqual({ from: 'kg', to: 'lbs' });
    expect(parseQuery('liters into gallons')).toEqual({ from: 'liters', to: 'gallons' });
  });

  it('extracts a leading value', () => {
    expect(parseQuery('10 kg to lbs')).toEqual({ value: 10, from: 'kg', to: 'lbs' });
  });

  it('keeps the decimal point of a value', () => {
    expect(parseQuery('2.5 miles to km')).toEqual({ value: 2.5, from: 'miles', to: 'km' });
  });

  it('reads grouped thousands and recipe fractions', () => {
    expect(parseQuery('1,000 grams to kg')).toEqual({ value: 1000, from: 'grams', to: 'kg' });
    expect(parseQuery('3/4 cup to ml')).toEqual({ value: 0.75, from: 'cup', to: 'ml' });
    expect(parseQuery('1 1/2 cups to ml')).toEqual({ value: 1.5, from: 'cups', to: 'ml' });
  });

  it('extracts a value written without a space', () => {
    expect(parseQuery('100f to c')).toEqual({ value: 100, from: 'f', to: 'c' });
  });

  it('extracts a value in scientific notation', () => {
    expect(parseQuery('1e3 m to ft')).toEqual({ value: 1000, from: 'm', to: 'ft' });
  });

  it('ignores filler words', () => {
    expect(parseQuery('convert kg to pounds')).toEqual({ from: 'kg', to: 'pounds' });
  });

  it('reverses "how many X in a Y" questions', () => {
    expect(parseQuery('how many feet in a meter')).toEqual({ from: 'meter', to: 'feet' });
    expect(parseQuery('how many ounces are in 3 pounds')).toEqual({
      value: 3,
      from: 'pounds',
      to: 'ounces',
    });
  });

  it('keeps a single-letter unit symbol that looks like an article', () => {
    // "a" is the ampere; only a leading "a " followed by a word is an article.
    expect(parseQuery('5 a to ma')).toEqual({ value: 5, from: 'a', to: 'ma' });
  });

  it('treats a single term as a unit lookup', () => {
    expect(parseQuery('fahrenheit')).toEqual({ from: 'fahrenheit' });
  });

  it('does not split off a bare number as a value', () => {
    expect(parseQuery('10').value).toBeUndefined();
  });
});

describe('resolveUnit', () => {
  it.each([
    ['meter', 'meter'],
    ['metre', 'meter'],
    ['m', 'meter'],
    ['meters', 'meter'],
    ['kilogram', 'kilogram'],
    ['kg', 'kilogram'],
    ['lbs', 'pound'],
    ['feet', 'foot'],
    ['ft', 'foot'],
    ['fahrenheit', 'fahrenheit'],
    ['°c', 'celsius'],
    ['mph', 'mile-per-hour'],
    ['kmh', 'kilometer-per-hour'],
  ])('resolves "%s" to %s', (query, expected) => {
    expect(resolveUnit(index, query)?.id).toBe(expected);
  });

  it('applies the documented rule for an ambiguous shorthand', () => {
    expect(getPreferredUnitId('gb')).toBe('gigabyte');
    expect(resolveUnit(index, 'gb')?.id).toBe('gigabyte');
  });

  it('still returns the losing interpretation as a match', () => {
    const ids = findUnits(index, 'gb', 8).map((unit) => unit.id);
    expect(ids).toContain('gigabyte');
    expect(ids).toContain('gigabit');
  });

  it('returns nothing for an empty or unknown term', () => {
    expect(findUnits(index, '')).toEqual([]);
    expect(resolveUnit(index, 'zzqx')).toBeUndefined();
  });
});

describe('search', () => {
  it('routes a direct conversion intent to the canonical page', () => {
    const [top] = search(index, 'kg to lbs');
    expect(top?.kind).toBe('conversion');
    expect(top?.href).toBe('/weight/kilograms-to-pounds');
  });

  it('routes full unit names to the same page as their symbols', () => {
    expect(search(index, 'meters to feet')[0]?.href).toBe('/length/meters-to-feet');
    expect(search(index, 'm to ft')[0]?.href).toBe('/length/meters-to-feet');
  });

  it('answers a question phrased backwards', () => {
    expect(search(index, 'how many feet in a meter')[0]?.href).toBe('/length/meters-to-feet');
  });

  it('carries a typed value through to the page', () => {
    expect(search(index, '10 kg to lbs')[0]?.href).toBe('/weight/kilograms-to-pounds?value=10');
    expect(search(index, '2.5 miles to km')[0]?.href).toBe('/length/miles-to-kilometers?value=2.5');
  });

  it('handles temperature shorthand', () => {
    expect(search(index, '100 f to c')[0]?.href).toBe(
      '/temperature/fahrenheit-to-celsius?value=100',
    );
  });

  it('handles recipe fractions', () => {
    expect(search(index, '1 1/2 cups to ml')[0]?.href).toBe(
      '/volume/us-cups-to-milliliters?value=1.5',
    );
  });

  it('falls back to the category converter when a pair has no page of its own', () => {
    const [top] = search(index, 'grams to troy ounces');
    expect(top?.kind).toBe('conversion');
    expect(top?.href).toBe('/weight?from=gram&to=troy-ounce');
  });

  it('never pairs units from different categories', () => {
    const results = search(index, 'meters to kilograms');
    expect(results.every((result) => result.kind !== 'conversion')).toBe(true);
  });

  it('offers a unit result for a single unit', () => {
    const results = search(index, 'fahrenheit');
    expect(
      results.some((result) => result.kind === 'unit' && result.href.startsWith('/temperature')),
    ).toBe(true);
  });

  it('finds a category by name', () => {
    const results = search(index, 'temperature');
    expect(
      results.some((result) => result.kind === 'category' && result.href === '/temperature'),
    ).toBe(true);
  });

  it('returns no results rather than a guess for nonsense', () => {
    expect(search(index, 'qwertyuiop')).toEqual([]);
  });

  it('never returns duplicate destinations', () => {
    const hrefs = search(index, 'meter', 20).map((result) => result.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it('respects the result limit', () => {
    expect(search(index, 'm', 3).length).toBeLessThanOrEqual(3);
  });
});

describe('search index', () => {
  it('contains every category and a record per unit', () => {
    expect(index.categories.length).toBeGreaterThanOrEqual(30);
    expect(index.units.length).toBeGreaterThan(300);
  });

  it('stays small to transfer', () => {
    // Downloaded the first time someone opens search. Descriptions, notes and
    // sources are left out; what is transferred is the compressed size.
    const gzipped = gzipSync(JSON.stringify(index)).length;
    expect(gzipped).toBeLessThan(25_000);
  });
});
