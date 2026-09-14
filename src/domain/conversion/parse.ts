import type { ParseResult } from '@/types/conversion';

/**
 * Parsing of user-typed numbers.
 *
 * Accepts what people actually type: plain integers and decimals, negatives,
 * scientific notation, thousands separators, and the fractions that appear in
 * recipes ("1/2", "1 1/2"). Anything else is rejected with a specific reason
 * rather than being coerced into a number that was never entered.
 */

const GROUPED_THOUSANDS = /^-?\d{1,3}(,\d{3})+(\.\d+)?$/;
const SIMPLE_FRACTION = /^(-?)(\d+)\s*\/\s*(\d+)$/;
const MIXED_FRACTION = /^(-?)(\d+)\s+(\d+)\s*\/\s*(\d+)$/;
const NUMERIC = /^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/;

/** Normalises Unicode minus signs and whitespace that phones and docs insert. */
function normalize(raw: string): string {
  return raw.replace(/[−–—]/g, '-').replace(/[   ]/g, ' ').trim();
}

export function parseNumericInput(raw: string): ParseResult {
  const input = normalize(raw);

  if (input.length === 0) {
    return { ok: false, code: 'EMPTY', message: 'Enter a value to convert.' };
  }

  const mixed = MIXED_FRACTION.exec(input);
  if (mixed) {
    const [, sign, whole = '0', numerator = '0', denominator = '1'] = mixed;
    const denom = Number(denominator);
    if (denom === 0) {
      return {
        ok: false,
        code: 'MALFORMED',
        message: 'A fraction cannot have zero on the bottom.',
      };
    }
    const magnitude = Number(whole) + Number(numerator) / denom;
    return { ok: true, value: sign === '-' ? -magnitude : magnitude };
  }

  const fraction = SIMPLE_FRACTION.exec(input);
  if (fraction) {
    const [, sign, numerator = '0', denominator = '1'] = fraction;
    const denom = Number(denominator);
    if (denom === 0) {
      return {
        ok: false,
        code: 'MALFORMED',
        message: 'A fraction cannot have zero on the bottom.',
      };
    }
    const magnitude = Number(numerator) / denom;
    return { ok: true, value: sign === '-' ? -magnitude : magnitude };
  }

  let candidate = input;

  if (GROUPED_THOUSANDS.test(candidate)) {
    // "1,234,567.89" — commas are grouping separators.
    candidate = candidate.replace(/,/g, '');
  } else if (candidate.includes(',') && !candidate.includes('.')) {
    // "1,5" — a single comma with no decimal point is a decimal comma.
    const commaCount = (candidate.match(/,/g) ?? []).length;
    if (commaCount === 1) candidate = candidate.replace(',', '.');
  }

  // Internal whitespace is not stripped: "10 20" is a typo, not 1020.
  if (!NUMERIC.test(candidate)) {
    return {
      ok: false,
      code: 'MALFORMED',
      message: 'That is not a number. Try something like 10, 2.5 or 1.5e3.',
    };
  }

  const value = Number(candidate);

  if (!Number.isFinite(value)) {
    return {
      ok: false,
      code: 'NOT_FINITE',
      message: 'That number is too large to convert.',
    };
  }

  return { ok: true, value };
}

/** True when the text is a value the converter can work with. */
export function isValidNumericInput(raw: string): boolean {
  return parseNumericInput(raw).ok;
}
