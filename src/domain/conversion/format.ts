import type { FormatOptions } from '@/types/conversion';
import type { UnitDefinition } from '@/types/units';

/**
 * Display formatting.
 *
 * Formatting is deliberately separate from conversion: the engine returns full
 * double precision and this module decides how many of those digits a human
 * should see. Changing display precision never changes a computed value.
 */

export const DEFAULT_SIGNIFICANT_DIGITS = 6;

/** Precision choices offered in the converter UI. */
export const PRECISION_OPTIONS = [2, 4, 6, 8, 10, 15] as const;

const DEFAULTS: Required<Omit<FormatOptions, 'decimalPlaces'>> & { decimalPlaces: number | null } =
  {
    significantDigits: DEFAULT_SIGNIFICANT_DIGITS,
    decimalPlaces: null,
    useGrouping: true,
    locale: 'en-US',
    // Outside this window a plain decimal is a wall of zeros, and scientific
    // notation is easier to read and to check.
    scientificBelow: 1e-7,
    scientificAbove: 1e15,
  };

/** A formatted number, split so the UI can render exponents as superscript. */
export interface FormattedNumber {
  /** Machine-friendly text, safe to copy, e.g. "1.23457e+21" or "3.28084". */
  plain: string;
  /** Mantissa when scientific notation was used. */
  mantissa?: string;
  /** Base-10 exponent when scientific notation was used. */
  exponent?: number;
  scientific: boolean;
}

function clampDigits(digits: number): number {
  if (!Number.isFinite(digits)) return DEFAULT_SIGNIFICANT_DIGITS;
  return Math.min(21, Math.max(1, Math.round(digits)));
}

/** Removes trailing zeros from a decimal mantissa: "1.230" -> "1.23". */
function trimTrailingZeros(text: string): string {
  if (!text.includes('.')) return text;
  return text.replace(/\.?0+$/, '');
}

/**
 * Formats a value for display, choosing scientific notation when a plain
 * decimal would be unreadable.
 */
export function formatNumberParts(value: number, options: FormatOptions = {}): FormattedNumber {
  const opts = { ...DEFAULTS, ...options };

  if (!Number.isFinite(value)) {
    return { plain: '—', scientific: false };
  }
  if (value === 0) {
    return { plain: '0', scientific: false };
  }

  const magnitude = Math.abs(value);
  const digits = clampDigits(opts.significantDigits);

  const useScientific =
    opts.decimalPlaces === null &&
    (magnitude >= opts.scientificAbove || magnitude < opts.scientificBelow);

  if (useScientific) {
    const exponential = value.toExponential(digits - 1);
    const [rawMantissa = '0', rawExponent = '0'] = exponential.split('e');
    const mantissa = trimTrailingZeros(rawMantissa);
    const exponent = Number(rawExponent);
    return {
      plain: `${mantissa}e${exponent >= 0 ? '+' : ''}${exponent}`,
      mantissa,
      exponent,
      scientific: true,
    };
  }

  const formatter = new Intl.NumberFormat(opts.locale, {
    useGrouping: opts.useGrouping,
    ...(opts.decimalPlaces !== null
      ? { minimumFractionDigits: opts.decimalPlaces, maximumFractionDigits: opts.decimalPlaces }
      : { maximumSignificantDigits: digits }),
  });

  return { plain: formatter.format(value), scientific: false };
}

/** Convenience wrapper returning just the display string. */
export function formatNumber(value: number, options: FormatOptions = {}): string {
  return formatNumberParts(value, options).plain;
}

/**
 * Formats a conversion result for display.
 *
 * Named to match the engine API described in ARCHITECTURE.md §4.
 */
export function formatConversionResult(value: number, options: FormatOptions = {}): string {
  return formatNumber(value, options);
}

/** Chooses the singular or plural name based on the value. */
export function unitLabel(value: number, unit: UnitDefinition): string {
  return Math.abs(value) === 1 ? unit.name : unit.pluralName;
}

/** "3.28084 ft" — value plus symbol, for compact display. */
export function formatWithSymbol(
  value: number,
  unit: UnitDefinition,
  options: FormatOptions = {},
): string {
  const formatted = formatNumber(value, options);
  return unit.symbol ? `${formatted} ${unit.symbol}` : `${formatted} ${unitLabel(value, unit)}`;
}

/** "3.28084 feet" — value plus full name, for prose. */
export function formatWithName(
  value: number,
  unit: UnitDefinition,
  options: FormatOptions = {},
): string {
  return `${formatNumber(value, options)} ${unitLabel(value, unit)}`;
}

/**
 * Compact exact-relationship text used in page content, e.g. "0.3048".
 * Uses more digits than the UI default because these statements are reference
 * material rather than a quick answer.
 */
export function formatExact(value: number): string {
  return formatNumber(value, { significantDigits: 12, useGrouping: false });
}
