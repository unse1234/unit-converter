import { convertUnits } from '@/domain/conversion/engine';
import { asFraction } from '@/lib/seo/formula';
import type { UnitDefinition } from '@/types/units';
import type { Locale } from './config';
import {
  buildLocalFormula,
  formatLocal,
  formatResult,
  screenDimensions,
  type LocalFormula,
} from './format';
import { requireLocalizableUnit } from './local-units';
import {
  LOCALE_CONTENT,
  findPairPage,
  findValuePage,
  getCategoryPages,
  type LocalizedPage,
} from './pages';
import type {
  FaqEntry,
  LocalCategory,
  PairContext,
  PairSpec,
  ScreenContext,
  UnitName,
  ValueContext,
} from './types';

/**
 * Builds the content of a localized page from its spec.
 *
 * Every number on the page comes from the conversion engine and is formatted in
 * the language's notation, and every sentence comes from the language's
 * templates. Nothing numeric is typed by hand, so a page cannot state a value
 * that disagrees with its own converter.
 */

export interface LocalizedUnit {
  unit: UnitDefinition;
  name: UnitName;
  symbol: string;
}

export function localizeUnit(locale: Locale, id: string): LocalizedUnit {
  const unit = requireLocalizableUnit(id);
  const name = LOCALE_CONTENT[locale].units[id];
  if (!name) throw new Error(`Missing ${locale} name for unit: ${id}`);
  return { unit, name, symbol: name.symbol ?? unit.symbol };
}

function convertValue(value: number, from: UnitDefinition, to: UnitDefinition): number {
  const result = convertUnits(value, from, to);
  if (!result.ok) throw new Error(`Cannot convert ${from.id} to ${to.id}: ${result.message}`);
  return result.value;
}

/** Singular for exactly one, plural otherwise — the rule in all five languages. */
function nameFor(value: number, name: UnitName): string {
  return Math.abs(value) === 1 ? name.one : name.other;
}

/** Recipe fractions read as fractions ("1/4 taza"), everything else as decimals. */
function formatAmount(value: number, locale: Locale, category: LocalCategory): string {
  if (category === 'cooking' && value > 0 && value < 1) {
    const fraction = asFraction(value, 4);
    if (fraction) return fraction;
  }
  return formatLocal(value, locale, 10);
}

/* -------------------------------------------------------------------------- */
/* Pair pages                                                                  */
/* -------------------------------------------------------------------------- */

const DEFAULT_TABLES: Record<LocalCategory, number[]> = {
  length: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 24, 25, 30, 36, 40, 50, 100],
  mass: [1, 2, 3, 5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 150, 200],
  temperature: [-40, -20, -10, 0, 10, 20, 30, 37, 40, 50, 60, 80, 100],
  volume: [1, 2, 3, 4, 5, 10, 15, 20, 25, 50, 100],
  area: [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000],
  speed: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 120],
  cooking: [0.25, 1 / 3, 0.5, 2 / 3, 0.75, 1, 1.5, 2, 3, 4],
  tv: [24, 32, 43, 50, 55, 65, 75, 85],
};

/** Diagonals shown in the screen-size tables. */
export const SCREEN_SIZES = [24, 27, 32, 40, 43, 50, 55, 58, 65, 70, 75, 85];

export interface TableRow {
  from: string;
  to: string;
  /** Link to the value's own page, when it has one. */
  href?: string;
}

export interface PairContent {
  from: LocalizedUnit;
  to: LocalizedUnit;
  ctx: PairContext;
  formula: LocalFormula;
  explanation: string;
  example: ValueContext;
  table: TableRow[];
  faqs: FaqEntry[];
}

export function pairContext(locale: Locale, spec: PairSpec) {
  const from = localizeUnit(locale, spec.from);
  const to = localizeUnit(locale, spec.to);
  const formula = buildLocalFormula(from.unit, to.unit, locale, from.symbol, to.symbol);
  if (!formula) throw new Error(`No formula for ${spec.from} -> ${spec.to}`);

  const factor =
    formula.kind === 'affine' ? null : formatLocal(convertValue(1, from.unit, to.unit), locale, 8);

  const ctx: PairContext = {
    phrase: spec.phrase,
    from: from.name,
    to: to.name,
    fromSymbol: from.symbol,
    toSymbol: to.symbol,
    relation: factor ? `1 ${from.symbol} = ${factor} ${to.symbol}` : formula.expression,
    factor,
    formula: formula.expression,
  };

  return { from, to, formula, ctx };
}

export function valueContext(locale: Locale, spec: PairSpec, value: number): ValueContext {
  const { from, to, formula, ctx } = pairContext(locale, spec);
  const result = convertValue(value, from.unit, to.unit);
  return {
    ...ctx,
    value: formatAmount(value, locale, spec.category),
    result: formatResult(result, locale, spec.category === 'temperature'),
    fromName: nameFor(value, from.name),
    toName: nameFor(result, to.name),
    working: formula.working(value),
  };
}

/** The value used for worked examples: the first searched value, or 10. */
function exampleValue(spec: PairSpec): number {
  const values = spec.values?.list.filter((value) => value > 1);
  if (values && values.length > 0) return values[Math.min(1, values.length - 1)] ?? 10;
  if (spec.category === 'temperature') return spec.from === 'celsius' ? 25 : 100;
  if (spec.category === 'cooking') return 2;
  return 10;
}

function tableRows(locale: Locale, spec: PairSpec, values: number[]): TableRow[] {
  const from = requireLocalizableUnit(spec.from);
  const to = requireLocalizableUnit(spec.to);
  return values.map((value) => ({
    from: formatAmount(value, locale, spec.category),
    to: formatResult(convertValue(value, from, to), locale, spec.category === 'temperature'),
    href: findValuePage(locale, spec.from, spec.to, value)?.path,
  }));
}

export function buildPairContent(locale: Locale, spec: PairSpec): PairContent {
  const text = LOCALE_CONTENT[locale].text;
  const { from, to, formula, ctx } = pairContext(locale, spec);

  const explanation =
    formula.kind === 'multiply'
      ? text.multiplyExplanation(ctx)
      : formula.kind === 'divide'
        ? text.divideExplanation({ ...ctx, divisor: formula.divisor ?? '' })
        : text.affineExplanation(ctx);

  const example = valueContext(locale, spec, exampleValue(spec));

  const tableValues = spec.table ?? defaultTable(spec);

  return {
    from,
    to,
    ctx,
    formula,
    explanation,
    example,
    table: tableRows(locale, spec, tableValues),
    faqs: [...text.pairFaqs({ ...ctx, example }), ...(spec.faqs ?? [])],
  };
}

function defaultTable(spec: PairSpec): number[] {
  if (spec.category === 'temperature' && spec.from === 'fahrenheit') {
    return [-40, 0, 32, 50, 60, 70, 75, 80, 90, 98.6, 100, 200, 212, 350, 400];
  }
  return DEFAULT_TABLES[spec.category];
}

/** Links to a pair's single-value pages, with their answers. */
export function valueLinks(locale: Locale, spec: PairSpec) {
  const pages = getCategoryPages(locale, spec.category).filter(
    (page): page is Extract<LocalizedPage, { kind: 'value' }> =>
      page.kind === 'value' && page.spec === spec,
  );
  return pages.map((page) => {
    const ctx = valueContext(locale, spec, page.value);
    return {
      href: page.path,
      label: page.phrase,
      answer: `${ctx.value} ${ctx.fromSymbol} = ${ctx.result} ${ctx.toSymbol}`,
    };
  });
}

/** Related pairs: the reverse direction first, then the rest of the category. */
export function relatedPairs(locale: Locale, spec: PairSpec, limit = 8) {
  const reverse = findPairPage(locale, spec.to, spec.from);
  const others = getCategoryPages(locale, spec.category).filter(
    (page) => page.kind === 'pair' || page.kind === 'height',
  );
  const ordered = [...(reverse ? [reverse] : []), ...others.filter((page) => page !== reverse)];
  return ordered
    .filter((page) => !(page.kind === 'pair' && page.spec === spec))
    .slice(0, limit)
    .map((page) => ({ href: page.path, label: pageLabel(page) }));
}

/** The link text for a page: its search phrase. */
export function pageLabel(page: LocalizedPage): string {
  switch (page.kind) {
    case 'pair':
    case 'height':
      return capitalizePhrase(page.spec.phrase);
    case 'value':
    case 'tv':
      return capitalizePhrase(page.phrase);
    case 'category':
      return LOCALE_CONTENT[page.locale].categories[page.category]?.name ?? page.category;
    case 'home':
      return LOCALE_CONTENT[page.locale].text.home;
  }
}

function capitalizePhrase(phrase: string): string {
  return phrase.charAt(0).toUpperCase() + phrase.slice(1);
}

/* -------------------------------------------------------------------------- */
/* Screen sizes                                                                */
/* -------------------------------------------------------------------------- */

export function screenContext(locale: Locale, inches: number): ScreenContext {
  const { diagonal, width, height } = screenDimensions(inches);
  const cm = (value: number) => formatLocal(Math.round(value * 10) / 10, locale);
  return {
    size: formatLocal(inches, locale),
    diagonal: cm(diagonal),
    width: cm(width),
    height: cm(height),
  };
}

/** Screen-size table rows, linking each size to its page where one exists. */
export function screenRows(locale: Locale) {
  return SCREEN_SIZES.map((size) => ({
    ...screenContext(locale, size),
    href: findValuePage(locale, 'inch', 'centimeter', size)?.path,
  }));
}

/**
 * Inch values from 13 up are almost always screen diagonals — laptops, monitors
 * and TVs — so those pages also give the screen's width and height.
 */
export function isScreenSize(spec: PairSpec, value: number): boolean {
  return spec.from === 'inch' && spec.to === 'centimeter' && value >= 13;
}

/* -------------------------------------------------------------------------- */
/* Single-value pages                                                          */
/* -------------------------------------------------------------------------- */

/** Values around the page's own, for the "nearby values" table. */
export function nearbyValues(spec: PairSpec, value: number): number[] {
  const searched = spec.values?.list ?? [];
  const step = value >= 100 ? 10 : value >= 20 ? 5 : 1;
  const around = [-3, -2, -1, 1, 2, 3].map((offset) => value + offset * step);
  const candidates = [...new Set([...around, ...searched])]
    .filter((candidate) => candidate > 0 || spec.category === 'temperature')
    .filter((candidate) => candidate !== value);
  return candidates
    .sort((a, b) => Math.abs(a - value) - Math.abs(b - value))
    .slice(0, 8)
    .sort((a, b) => a - b);
}

export function valueTableRows(locale: Locale, spec: PairSpec, values: number[]) {
  return tableRows(locale, spec, values);
}

/* -------------------------------------------------------------------------- */
/* Height (feet and inches)                                                    */
/* -------------------------------------------------------------------------- */

export function heightRows(locale: Locale) {
  const rows: { label: string; cm: string; meters: string }[] = [];
  for (let totalInches = 58; totalInches <= 78; totalInches += 1) {
    const feet = Math.floor(totalInches / 12);
    const inches = totalInches % 12;
    const cm = totalInches * 2.54;
    rows.push({
      label: `${feet}'${inches}"`,
      cm: `${formatLocal(Math.round(cm * 10) / 10, locale)} cm`,
      meters: `${formatLocal(Math.round(cm) / 100, locale)} m`,
    });
  }
  return rows;
}
