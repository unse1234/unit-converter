import type { UnitDefinition } from './units';

/**
 * Why a conversion could not be performed.
 *
 * The engine never returns a plausible-looking number for a request it cannot
 * satisfy (CLAUDE.md, "Conversion accuracy"). Every failure is one of these.
 */
export type ConversionErrorCode =
  'UNKNOWN_UNIT' | 'CATEGORY_MISMATCH' | 'INVALID_VALUE' | 'NOT_FINITE_RESULT' | 'OUT_OF_DOMAIN';

export interface ConversionFailure {
  ok: false;
  code: ConversionErrorCode;
  /** Human-readable, user-safe message. Never contains internals. */
  message: string;
}

export interface ConversionSuccess {
  ok: true;
  /** Full-precision result. Formatting is a separate, later decision. */
  value: number;
  from: UnitDefinition;
  to: UnitDefinition;
}

export type ConversionResult = ConversionSuccess | ConversionFailure;

/** Parsed user input. `raw` is preserved so the field can echo what was typed. */
export interface ParsedValue {
  ok: boolean;
  value: number;
  raw: string;
}

export type ParseFailureCode = 'EMPTY' | 'MALFORMED' | 'NOT_FINITE';

export interface ParseSuccess {
  ok: true;
  value: number;
}

export interface ParseFailure {
  ok: false;
  code: ParseFailureCode;
  message: string;
}

export type ParseResult = ParseSuccess | ParseFailure;

export interface FormatOptions {
  /**
   * Significant digits kept in the displayed value. Display precision only —
   * it never affects the computed result.
   */
  significantDigits?: number;
  /** Fixed number of decimal places. Takes priority over significantDigits. */
  decimalPlaces?: number | null;
  /** Group the integer part with locale separators. */
  useGrouping?: boolean;
  /** BCP-47 locale for digit grouping and decimal marks. */
  locale?: string;
  /**
   * Below/above these magnitudes, scientific notation is more readable than a
   * long run of zeros.
   */
  scientificBelow?: number;
  scientificAbove?: number;
}

/** A conversion pair that is important enough to have its own indexed page. */
export interface ConversionPair {
  /** Stable id, e.g. "length:meter:foot". */
  id: string;
  categoryId: string;
  fromUnitId: string;
  toUnitId: string;
  /** URL segment, e.g. "meters-to-feet". */
  slug: string;
  /** Canonical path, e.g. "/length/meters-to-feet". */
  path: string;
}
