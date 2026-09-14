import { describe, expect, it } from 'vitest';
import {
  formatExact,
  formatNumber,
  formatNumberParts,
  formatWithName,
  formatWithSymbol,
  unitLabel,
} from '@/domain/conversion/format';
import { requireUnit } from '@/domain/units/registry';

describe('formatNumber', () => {
  it('applies six significant digits by default', () => {
    expect(formatNumber(3.280839895013123)).toBe('3.28084');
    expect(formatNumber(2.2046226218487757)).toBe('2.20462');
  });

  it('drops trailing zeros instead of padding', () => {
    expect(formatNumber(212)).toBe('212');
    expect(formatNumber(2.5)).toBe('2.5');
    expect(formatNumber(100.0)).toBe('100');
  });

  it('formats zero plainly', () => {
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(-0)).toBe('0');
  });

  it('keeps negative values negative', () => {
    expect(formatNumber(-16.404199475)).toBe('-16.4042');
  });

  it('groups thousands for readability', () => {
    expect(formatNumber(1609.344)).toBe('1,609.34');
    expect(formatNumber(1000000, { significantDigits: 7 })).toBe('1,000,000');
  });

  it('can disable grouping for machine-readable output', () => {
    expect(formatNumber(1609.344, { useGrouping: false, significantDigits: 7 })).toBe('1609.344');
  });

  it('honours an explicit decimal place count', () => {
    expect(formatNumber(3.280839895, { decimalPlaces: 2 })).toBe('3.28');
    expect(formatNumber(3.2, { decimalPlaces: 4 })).toBe('3.2000');
    expect(formatNumber(0, { decimalPlaces: 2 })).toBe('0');
  });

  it('honours a custom significant digit count', () => {
    expect(formatNumber(3.280839895013123, { significantDigits: 3 })).toBe('3.28');
    expect(formatNumber(3.280839895013123, { significantDigits: 10 })).toBe('3.280839895');
  });

  it('switches to scientific notation for very large values', () => {
    const parts = formatNumberParts(9.4607304725808e21);
    expect(parts.scientific).toBe(true);
    expect(parts.mantissa).toBe('9.46073');
    expect(parts.exponent).toBe(21);
    expect(parts.plain).toBe('9.46073e+21');
  });

  it('switches to scientific notation for very small values', () => {
    const parts = formatNumberParts(1.23e-9);
    expect(parts.scientific).toBe(true);
    expect(parts.exponent).toBe(-9);
    expect(parts.plain).toBe('1.23e-9');
  });

  it('stays decimal within the readable window', () => {
    expect(formatNumberParts(1e14).scientific).toBe(false);
    expect(formatNumberParts(0.000001).scientific).toBe(false);
  });

  it('renders a placeholder rather than Infinity or NaN', () => {
    expect(formatNumber(Number.POSITIVE_INFINITY)).toBe('—');
    expect(formatNumber(Number.NaN)).toBe('—');
  });

  it('clamps an out-of-range precision request instead of throwing', () => {
    expect(() => formatNumber(1.23456, { significantDigits: 0 })).not.toThrow();
    expect(() => formatNumber(1.23456, { significantDigits: 99 })).not.toThrow();
  });
});

describe('unit labels', () => {
  const meter = requireUnit('meter');
  const foot = requireUnit('foot');

  it('uses the singular name only for exactly one', () => {
    expect(unitLabel(1, meter)).toBe('meter');
    expect(unitLabel(-1, meter)).toBe('meter');
    expect(unitLabel(0, meter)).toBe('meters');
    expect(unitLabel(2, meter)).toBe('meters');
  });

  it('uses irregular plurals from the catalog', () => {
    expect(unitLabel(2, foot)).toBe('feet');
  });

  it('formats with symbol and with name', () => {
    expect(formatWithSymbol(3.28084, foot)).toBe('3.28084 ft');
    expect(formatWithName(3.28084, foot)).toBe('3.28084 feet');
    expect(formatWithName(1, foot)).toBe('1 foot');
  });
});

describe('formatExact', () => {
  it('keeps more digits for reference statements', () => {
    expect(formatExact(0.3048)).toBe('0.3048');
    expect(formatExact(3.280839895013123)).toBe('3.28083989501');
  });

  it('omits grouping so the value can be copied into code', () => {
    expect(formatExact(1609.344)).toBe('1609.344');
  });
});
