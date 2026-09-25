import { convertUnits, getConversionRatio } from '@/domain/conversion/engine';
import { asFraction } from '@/lib/seo/formula';
import type { UnitDefinition } from '@/types/units';
import { LOCALE_DEFINITIONS, type Locale } from './config';

/**
 * Number and formula formatting for the localized pages.
 *
 * Numbers follow each market's convention — "2.54" in Mexico, "2,54" in
 * Brazil, Italy, France and Indonesia — because people search the way they
 * write ("1.5 pulgadas a cm", "2,54 cm"), and a page that answers in the
 * other notation reads as a translation.
 */

const formatters = new Map<string, Intl.NumberFormat>();

function formatter(locale: Locale, digits: number, grouping: boolean): Intl.NumberFormat {
  const key = `${locale}:${digits}:${grouping}`;
  let cached = formatters.get(key);
  if (!cached) {
    cached = new Intl.NumberFormat(LOCALE_DEFINITIONS[locale].numberLocale, {
      maximumSignificantDigits: digits,
      useGrouping: grouping,
    });
    formatters.set(key, cached);
  }
  return cached;
}

/** Formats a number for display in the language's notation. */
export function formatLocal(value: number, locale: Locale, digits = 6): string {
  if (!Number.isFinite(value)) return '—';
  if (Object.is(value, -0) || Math.abs(value) < 1e-12) return '0';
  // Four-digit numbers read better ungrouped in formulas and headings ("1000").
  return formatter(locale, digits, Math.abs(value) >= 10_000).format(value);
}

/**
 * A converted value as a page states it: two decimals from 10 upward ("11.34
 * kg"), four significant digits below ("0.4536 kg"), and at most two decimals
 * for temperatures ("37.78 °C"). The formulas keep full precision; this is only
 * how answers read.
 */
export function formatResult(value: number, locale: Locale, temperature = false): string {
  if (!Number.isFinite(value)) return '—';
  const rounded =
    temperature || Math.abs(value) >= 10
      ? Math.round(value * 100) / 100
      : Number(value.toPrecision(4));
  return formatLocal(rounded, locale, 12);
}

/**
 * A value as it appears in a URL segment. Decimals keep their digits with a
 * hyphen, since a dot or comma in a path segment is easy to break: 1.5 -> "1-5".
 */
export function slugValue(value: number): string {
  return String(value).replace('.', '-');
}

/** Replaces {n} in a pattern with the value, as written in the language. */
export function fillValue(pattern: string, value: number, locale: Locale): string {
  return pattern.replace('{n}', formatLocal(value, locale, 10));
}

/** Replaces {n} in a slug pattern with the slug form of the value. */
export function fillSlug(pattern: string, value: number): string {
  return pattern.replace('{n}', slugValue(value));
}

/** Number of significant digits needed to write a value exactly (up to 12). */
function exactDigits(value: number): number | null {
  for (let digits = 1; digits <= 12; digits += 1) {
    if (Math.abs(Number(value.toPrecision(digits)) - value) <= Math.abs(value) * 1e-12) {
      return digits;
    }
  }
  return null;
}

export type FormulaKind = 'multiply' | 'divide' | 'affine';

export interface LocalFormula {
  kind: FormulaKind;
  /** "cm = in × 2.54" */
  expression: string;
  /** The multiplier, e.g. "2.54", for multiply formulas. */
  factor: string | null;
  /** The divisor, e.g. "0.45359237", for divide formulas. */
  divisor: string | null;
  /** The working for one value: "6 × 2.54 = 15.24". */
  working: (value: number) => string;
}

/**
 * Builds the formula for a pair in the language's notation.
 *
 * A multiplier that is exact in a few digits (2.54, 0.3048) is stated as a
 * multiplication. When only the inverse is exact (kg -> lb is ÷ 0.45359237,
 * but × 2.20462262…), the formula divides instead, so it is never approximate
 * when an exact form exists. Temperature scales get their familiar affine form.
 */
export function buildLocalFormula(
  from: UnitDefinition,
  to: UnitDefinition,
  locale: Locale,
  fromSymbol: string,
  toSymbol: string,
): LocalFormula | null {
  const f = (value: number, digits = 10) => formatLocal(value, locale, digits);
  const temperature = from.conversionType === 'affine' || to.conversionType === 'affine';
  const result = (value: number) => {
    const converted = convertUnits(value, from, to);
    return converted.ok ? formatResult(converted.value, locale, temperature) : '—';
  };

  const ratio = getConversionRatio(from, to);

  if (ratio !== null) {
    const ratioDigits = exactDigits(ratio);
    const inverseDigits = exactDigits(1 / ratio);

    if (ratioDigits === null && inverseDigits !== null) {
      const divisor = f(1 / ratio, 12);
      return {
        kind: 'divide',
        expression: `${toSymbol} = ${fromSymbol} ÷ ${divisor}`,
        factor: f(ratio, 6),
        divisor,
        working: (value) => `${f(value)} ÷ ${divisor} = ${result(value)}`,
      };
    }

    const exact = ratioDigits !== null;
    const factor = exact ? f(ratio, 12) : f(ratio, 8);
    const equals = exact ? '=' : '≈';
    return {
      kind: 'multiply',
      expression: `${toSymbol} ${equals} ${fromSymbol} × ${factor}`,
      factor,
      divisor: null,
      working: (value) => `${f(value)} × ${factor} ${equals} ${result(value)}`,
    };
  }

  if (from.conversionType !== 'affine' && to.conversionType !== 'affine') return null;

  const fromFactor = from.factor ?? 1;
  const toFactor = to.factor ?? 1;
  const fromOffset = from.offset ?? 0;
  const toOffset = to.offset ?? 0;

  const scale = fromFactor / toFactor;
  const shift = (fromOffset - toOffset) / toFactor;
  const inner = (fromOffset - toOffset) / fromFactor;
  const sign = (value: number) => (value < 0 ? '−' : '+');
  const scaleText = asFraction(scale) ?? f(scale);
  const isClean = (value: number) => Math.abs(value - Math.round(value * 100) / 100) < 1e-9;

  if (Math.abs(scale - 1) < 1e-12) {
    return {
      kind: 'affine',
      expression: `${toSymbol} = ${fromSymbol} ${sign(shift)} ${f(Math.abs(shift))}`,
      factor: null,
      divisor: null,
      working: (value) => `${f(value)} ${sign(shift)} ${f(Math.abs(shift))} = ${result(value)}`,
    };
  }

  if (isClean(shift)) {
    return {
      kind: 'affine',
      expression: `${toSymbol} = ${fromSymbol} × ${scaleText} ${sign(shift)} ${f(Math.abs(shift))}`,
      factor: null,
      divisor: null,
      working: (value) =>
        `${f(value)} × ${scaleText} ${sign(shift)} ${f(Math.abs(shift))} = ${result(value)}`,
    };
  }

  return {
    kind: 'affine',
    expression: `${toSymbol} = (${fromSymbol} ${sign(inner)} ${f(Math.abs(inner))}) × ${scaleText}`,
    factor: null,
    divisor: null,
    working: (value) =>
      `(${f(value)} ${sign(inner)} ${f(Math.abs(inner))}) × ${scaleText} = ${result(value)}`,
  };
}

/**
 * Screen dimensions for a diagonal in inches, for a 16:9 panel.
 * Width and height follow from the diagonal by Pythagoras: 16² + 9² = 337.
 */
export function screenDimensions(inches: number) {
  const diagonal = inches * 2.54;
  const hypotenuse = Math.sqrt(16 * 16 + 9 * 9);
  return {
    diagonal,
    width: (diagonal * 16) / hypotenuse,
    height: (diagonal * 9) / hypotenuse,
  };
}
