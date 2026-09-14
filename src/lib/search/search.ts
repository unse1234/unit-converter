import { parseNumericInput } from '@/domain/conversion/parse';
import { getPreferredUnitId } from './disambiguation';
import type { SearchIndex, SearchResult, SearchUnitRecord } from './types';

/**
 * Unit and conversion search.
 *
 * Handles the shapes people actually type (SEO_SPEC §14):
 *
 *   "meters to feet"             a conversion intent
 *   "10 kg to lbs"               a conversion intent carrying a value
 *   "how many feet in a meter"   the same intent, phrased backwards
 *   "fahrenheit"                 a single unit
 *
 * Pure functions over a plain index, so the identical code backs the
 * server-rendered /search page and the client search dialog.
 */

/** Words that separate the two sides of a conversion query. */
const SEPARATORS = ['->', '=>', ' to ', ' in ', ' into ', ' as ', ' = ', '>'];

/** Filler that carries no meaning for matching. */
const STOP_WORDS = [
  'convert',
  'conversion',
  'calculator',
  'how',
  'many',
  'much',
  'what',
  'is',
  'are',
  'there',
];

export function normalizeTerm(term: string): string {
  return (
    term
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[!?]/g, '')
      // A decimal point or thousands separator between digits is meaningful
      // ("2.5 miles"); anywhere else a period or comma is punctuation.
      .replace(/(?<!\d)[.,]|[.,](?!\d)/g, '')
      .trim()
      .replace(/\s+/g, ' ')
  );
}

/** Every string a unit can be matched by. */
function termsFor(unit: SearchUnitRecord): string[] {
  return [unit.name, unit.plural, unit.symbol, ...unit.aliases].filter(Boolean).map(normalizeTerm);
}

interface ScoredUnit {
  unit: SearchUnitRecord;
  score: number;
  /** The fragment is one of the unit's own names, symbols or aliases. */
  exact: boolean;
}

/**
 * Scores one unit against a normalised query fragment.
 * Returns 0 when it does not match at all.
 */
function scoreUnit(terms: string[], unit: SearchUnitRecord, query: string): number {
  let best = 0;

  for (const term of terms) {
    if (term === query) {
      best = Math.max(best, 100);
    } else if (term.startsWith(query)) {
      // Longer terms are weaker matches for a short query.
      best = Math.max(best, 70 - Math.min(20, term.length - query.length));
    } else if (query.length >= 3 && term.includes(query)) {
      best = Math.max(best, 35);
    }
  }

  if (best === 0) return 0;

  // A documented winner for an ambiguous shorthand outranks its rivals.
  const preferred = getPreferredUnitId(query);
  if (preferred) best += preferred === unit.id ? 15 : -15;

  // Units with their own pages are the ones people are usually looking for.
  if (unit.primary) best += 5;

  return best;
}

function scoreUnits(index: SearchIndex, query: string, limit: number): ScoredUnit[] {
  const normalized = normalizeTerm(query);
  if (!normalized) return [];

  return index.units
    .map((unit) => {
      const terms = termsFor(unit);
      return {
        unit,
        score: scoreUnit(terms, unit, normalized),
        exact: terms.includes(normalized),
      };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/** All units matching a fragment, best first. */
export function findUnits(index: SearchIndex, query: string, limit = 8): SearchUnitRecord[] {
  return scoreUnits(index, query, limit).map((entry) => entry.unit);
}

/** The single best unit for a fragment, or undefined. */
export function resolveUnit(index: SearchIndex, query: string): SearchUnitRecord | undefined {
  return findUnits(index, query, 1)[0];
}

/**
 * When a fragment names a unit exactly, near-misses are dropped: "kg" should
 * not also produce kilogram-force pairs just because "kgf" starts with "kg".
 */
function preferExact(entries: ScoredUnit[]): SearchUnitRecord[] {
  const exact = entries.filter((entry) => entry.exact);
  return (exact.length > 0 ? exact : entries).map((entry) => entry.unit);
}

export interface ParsedQuery {
  /** Numeric value typed before the units, e.g. 10 in "10 kg to lbs". */
  value?: number;
  /** Left-hand unit fragment. */
  from: string;
  /** Right-hand unit fragment, when the query expressed a conversion. */
  to?: string;
}

/**
 * A leading quantity: a mixed fraction ("1 1/2"), a fraction ("3/4"), or a
 * number with optional grouping, decimals and exponent ("1,000", "2.5", "1e3").
 * Parsing the matched text is left to the domain parser, so search accepts
 * exactly what the converter's own input field accepts.
 */
const LEADING_VALUE = /^(-?\d+\s+\d+\s*\/\s*\d+|-?\d[\d.,]*(?:\s*\/\s*\d+)?(?:e[+-]?\d+)?)\s*(.*)$/;

const stripArticle = (fragment: string) => fragment.replace(/^(a|an|one)\s+/, '').trim();

/**
 * Splits a raw query into an optional value and one or two unit fragments.
 */
export function parseQuery(raw: string): ParsedQuery {
  let text = normalizeTerm(raw);

  // "how many feet in a meter" asks for meters converted to feet.
  const reversed = /^how (many|much)\b/.test(text);

  for (const word of STOP_WORDS) {
    text = text.replace(new RegExp(`\\b${word}\\b`, 'g'), ' ');
  }
  text = text.replace(/\s+/g, ' ').trim();

  let from = text;
  let to: string | undefined;

  for (const separator of SEPARATORS) {
    const position = text.indexOf(separator);
    if (position === -1) continue;
    from = stripArticle(text.slice(0, position));
    to = stripArticle(text.slice(position + separator.length));
    break;
  }

  if (reversed && to) [from, to] = [to, from];

  let value: number | undefined;
  const match = LEADING_VALUE.exec(from);
  if (match) {
    const [, token = '', rest = ''] = match;
    const parsed = parseNumericInput(token);
    // A bare number with no unit after it is not a quantity of anything.
    if (parsed.ok && rest.trim().length > 0) {
      value = parsed.value;
      from = rest.trim();
    }
  }

  return { ...(value !== undefined ? { value } : {}), from, ...(to ? { to } : {}) };
}

function conversionHref(
  index: SearchIndex,
  from: SearchUnitRecord,
  to: SearchUnitRecord,
  value?: number,
): string {
  const category = index.categories.find((entry) => entry.id === from.category);
  if (!category) return '/';

  const pairSlug = `${from.slug}-to-${to.slug}`;
  const valueQuery = value !== undefined ? `?value=${encodeURIComponent(String(value))}` : '';

  // Prefer the canonical conversion page when one exists. Otherwise open the
  // category converter with both units preselected; that page always
  // canonicalises to its clean path, so the query string is never indexed.
  if (category.pairSlugs.includes(pairSlug)) {
    return `/${category.slug}/${pairSlug}${valueQuery}`;
  }

  const params = new URLSearchParams({ from: from.id, to: to.id });
  if (value !== undefined) params.set('value', String(value));
  return `/${category.slug}?${params.toString()}`;
}

/**
 * Full search: conversions first, then units, then categories.
 */
export function search(index: SearchIndex, raw: string, limit = 10): SearchResult[] {
  const trimmed = raw.trim();
  if (trimmed.length === 0) return [];

  const parsed = parseQuery(trimmed);
  const results: SearchResult[] = [];
  const categoryName = (categoryId: string) =>
    index.categories.find((entry) => entry.id === categoryId)?.name ?? '';

  // A two-sided query is an explicit conversion intent: answer it directly.
  if (parsed.to) {
    const fromCandidates = preferExact(scoreUnits(index, parsed.from, 4));
    const toCandidates = preferExact(scoreUnits(index, parsed.to, 4));

    for (const from of fromCandidates) {
      for (const to of toCandidates) {
        if (from.category !== to.category || from.id === to.id) continue;
        results.push({
          kind: 'conversion',
          href: conversionHref(index, from, to, parsed.value),
          label: `${from.plural} to ${to.plural}`,
          detail:
            parsed.value !== undefined
              ? `Convert ${parsed.value} ${parsed.value === 1 ? from.name : from.plural}`
              : `Open the ${from.symbol || from.name} to ${to.symbol || to.name} converter`,
          categoryName: categoryName(from.category),
          score: 200 - results.length,
        });
      }
    }
  }

  // Single units: offer the unit's category converter.
  for (const unit of findUnits(index, parsed.from, 6)) {
    const category = index.categories.find((entry) => entry.id === unit.category);
    if (!category) continue;
    results.push({
      kind: 'unit',
      href: `/${category.slug}?from=${encodeURIComponent(unit.id)}`,
      label: `${unit.plural}${unit.symbol ? ` (${unit.symbol})` : ''}`,
      detail: `Convert ${unit.plural} in ${category.name}`,
      categoryName: category.name,
      score: 100 - results.length,
    });
  }

  // Category names, so "temperature" or "storage" lands somewhere useful.
  const normalized = normalizeTerm(trimmed);
  for (const category of index.categories) {
    const haystack = normalizeTerm(`${category.name} ${category.title}`);
    if (!haystack.includes(normalized)) continue;
    results.push({
      kind: 'category',
      href: `/${category.slug}`,
      label: category.title,
      detail: category.summary,
      categoryName: category.name,
      score: haystack === normalized ? 90 : 40,
    });
  }

  const seen = new Set<string>();
  return results
    .sort((a, b) => b.score - a.score)
    .filter((result) => {
      if (seen.has(result.href)) return false;
      seen.add(result.href);
      return true;
    })
    .slice(0, limit);
}
