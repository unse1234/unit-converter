import { describe, expect, it } from 'vitest';
import { isValidNumericInput, parseNumericInput } from '@/domain/conversion/parse';

function parsed(raw: string): number {
  const result = parseNumericInput(raw);
  if (!result.ok) throw new Error(`Expected "${raw}" to parse, got ${result.code}`);
  return result.value;
}

describe('parseNumericInput', () => {
  it('parses integers and decimals', () => {
    expect(parsed('10')).toBe(10);
    expect(parsed('2.5')).toBe(2.5);
    expect(parsed('0.001')).toBe(0.001);
    expect(parsed('.5')).toBe(0.5);
  });

  it('parses zero and negative numbers', () => {
    expect(parsed('0')).toBe(0);
    expect(parsed('-40')).toBe(-40);
    expect(parsed('-2.5')).toBe(-2.5);
  });

  it('accepts a leading plus sign', () => {
    expect(parsed('+12')).toBe(12);
  });

  it('parses scientific notation', () => {
    expect(parsed('1.5e3')).toBe(1500);
    expect(parsed('1E6')).toBe(1000000);
    expect(parsed('2.5e-4')).toBe(0.00025);
  });

  it('normalises Unicode minus signs pasted from documents', () => {
    expect(parsed('−40')).toBe(-40);
    expect(parsed('–5')).toBe(-5);
  });

  it('strips grouping separators', () => {
    expect(parsed('1,000')).toBe(1000);
    expect(parsed('1,234,567.89')).toBe(1234567.89);
  });

  it('treats a lone comma as a decimal separator', () => {
    expect(parsed('1,5')).toBe(1.5);
  });

  it('parses recipe fractions', () => {
    expect(parsed('1/2')).toBe(0.5);
    expect(parsed('3/4')).toBe(0.75);
    expect(parsed('1 1/2')).toBe(1.5);
    expect(parsed('-1/2')).toBe(-0.5);
    expect(parsed('2 3/4')).toBe(2.75);
  });

  it('trims surrounding and non-breaking whitespace', () => {
    expect(parsed('  42  ')).toBe(42);
    expect(parsed(' 42')).toBe(42);
  });

  it('rejects an empty value with a distinct code', () => {
    const result = parseNumericInput('');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('EMPTY');

    const whitespace = parseNumericInput('   ');
    expect(whitespace.ok).toBe(false);
    if (!whitespace.ok) expect(whitespace.code).toBe('EMPTY');
  });

  it('rejects malformed input', () => {
    for (const bad of ['abc', '10kg', '1.2.3', '--5', '1e', 'e5', '10 20', '∞']) {
      const result = parseNumericInput(bad);
      expect(result.ok, `expected "${bad}" to be rejected`).toBe(false);
      if (!result.ok) expect(result.code).toBe('MALFORMED');
    }
  });

  it('rejects division by zero in a fraction', () => {
    const result = parseNumericInput('1/0');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('MALFORMED');
  });

  it('rejects values too large to represent', () => {
    const result = parseNumericInput('1e400');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('NOT_FINITE');
  });

  it('never returns NaN from a successful parse', () => {
    for (const input of ['10', '-2.5', '1/3', '1,000', '1e-9']) {
      expect(Number.isNaN(parsed(input))).toBe(false);
    }
  });

  it('exposes a boolean helper for the input field', () => {
    expect(isValidNumericInput('10')).toBe(true);
    expect(isValidNumericInput('abc')).toBe(false);
  });
});
