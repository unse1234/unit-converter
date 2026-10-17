import { parseNumericInput } from '@/domain/conversion/parse';
import type { ParseResult } from '@/types/conversion';

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Prefer the page's decimal/grouping convention, retaining fractions and scientific input. */
export function parseLocalizedNumericInput(raw: string, numberLocale: string): ParseResult {
  const parts = new Intl.NumberFormat(numberLocale).formatToParts(12345.6);
  const decimal = parts.find((part) => part.type === 'decimal')?.value ?? '.';
  const group = (parts.find((part) => part.type === 'group')?.value ?? ',').replace(
    /[\u00a0\u202f\u2009]/g,
    ' ',
  );
  let input = raw.replace(/[\u00a0\u202f\u2009]/g, ' ').trim();
  const grouped = new RegExp(
    `^[+-]?\\d{1,3}(?:${escapeRegex(group)}\\d{3})+(?:${escapeRegex(decimal)}\\d*)?(?:[eE][+-]?\\d+)?$`,
  );

  if (grouped.test(input)) input = input.split(group).join('');
  if (decimal !== '.' && input.includes(decimal)) {
    // Three digits after a comma are still decimals in these locales: 1,234 = 1.234.
    input = input.replace(decimal, '.');
  }
  return parseNumericInput(input);
}
