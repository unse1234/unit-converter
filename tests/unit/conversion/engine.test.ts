import { describe, expect, it } from 'vitest';
import { convert, convertUnits, fromBaseValue, toBaseValue } from '@/domain/conversion/engine';
import { formatNumber } from '@/domain/conversion/format';
import { getAllUnits, getUnitsByCategory, requireUnit } from '@/domain/units/registry';

/** Asserts a conversion succeeded and returns the value. */
function value(result: ReturnType<typeof convert>): number {
  if (!result.ok) throw new Error(`Expected success, got ${result.code}: ${result.message}`);
  return result.value;
}

describe('linear conversions', () => {
  it('converts meters to feet', () => {
    // 1 / 0.3048 exactly.
    expect(value(convert(1, 'meter', 'foot'))).toBeCloseTo(3.280839895013123, 12);
    expect(value(convert(100, 'meter', 'foot'))).toBeCloseTo(328.0839895013123, 10);
  });

  it('converts feet to meters', () => {
    expect(value(convert(1, 'foot', 'meter'))).toBe(0.3048);
    expect(value(convert(10, 'foot', 'meter'))).toBeCloseTo(3.048, 12);
  });

  it('converts kilometers to miles', () => {
    expect(value(convert(1, 'kilometer', 'mile'))).toBeCloseTo(0.621371192237334, 12);
    expect(value(convert(42.195, 'kilometer', 'mile'))).toBeCloseTo(26.218757456454306, 9);
  });

  it('converts kilograms to pounds', () => {
    expect(value(convert(1, 'kilogram', 'pound'))).toBeCloseTo(2.2046226218487757, 12);
    expect(value(convert(70, 'kilogram', 'pound'))).toBeCloseTo(154.32358352941432, 9);
  });

  it('converts pounds to kilograms', () => {
    expect(value(convert(1, 'pound', 'kilogram'))).toBe(0.45359237);
    expect(value(convert(150, 'pound', 'kilogram'))).toBeCloseTo(68.0388555, 9);
  });

  it('converts liters to US gallons', () => {
    expect(value(convert(1, 'liter', 'us-gallon'))).toBeCloseTo(0.2641720523581484, 12);
    expect(value(convert(1, 'us-gallon', 'liter'))).toBeCloseTo(3.785411784, 12);
  });

  it('distinguishes US and imperial gallons', () => {
    const us = value(convert(1, 'us-gallon', 'liter'));
    const imperial = value(convert(1, 'imperial-gallon', 'liter'));
    expect(us).toBeCloseTo(3.785411784, 12);
    expect(imperial).toBeCloseTo(4.54609, 12);
    expect(imperial).toBeGreaterThan(us);
  });

  it('converts square meters to square feet', () => {
    expect(value(convert(1, 'square-meter', 'square-foot'))).toBeCloseTo(10.763910416709722, 10);
    expect(value(convert(100, 'square-meter', 'square-foot'))).toBeCloseTo(1076.3910416709722, 8);
  });

  it('converts km/h to mph', () => {
    expect(value(convert(1, 'kilometer-per-hour', 'mile-per-hour'))).toBeCloseTo(
      0.621371192237334,
      12,
    );
    expect(value(convert(100, 'kilometer-per-hour', 'mile-per-hour'))).toBeCloseTo(62.13711922, 7);
  });

  it('converts inches to centimeters exactly', () => {
    expect(value(convert(1, 'inch', 'centimeter'))).toBeCloseTo(2.54, 12);
    expect(value(convert(12, 'inch', 'foot'))).toBeCloseTo(1, 12);
  });

  it('converts digital storage using decimal prefixes', () => {
    expect(value(convert(1, 'gigabyte', 'megabyte'))).toBe(1000);
    expect(value(convert(1, 'byte', 'bit'))).toBe(8);
  });

  it('keeps binary prefixes distinct from decimal ones', () => {
    expect(value(convert(1, 'gibibyte', 'byte'))).toBe(1073741824);
    expect(value(convert(1, 'gigabyte', 'byte'))).toBe(1000000000);
    // A 1 TB drive reported in binary units.
    expect(value(convert(1, 'terabyte', 'gibibyte'))).toBeCloseTo(931.3225746154785, 9);
  });
});

describe('affine conversions (temperature)', () => {
  it('converts Celsius to Fahrenheit', () => {
    expect(value(convert(0, 'celsius', 'fahrenheit'))).toBeCloseTo(32, 10);
    expect(value(convert(100, 'celsius', 'fahrenheit'))).toBeCloseTo(212, 10);
    expect(value(convert(37, 'celsius', 'fahrenheit'))).toBeCloseTo(98.6, 10);
    expect(value(convert(-40, 'celsius', 'fahrenheit'))).toBeCloseTo(-40, 10);
  });

  it('converts Fahrenheit to Celsius', () => {
    expect(value(convert(32, 'fahrenheit', 'celsius'))).toBeCloseTo(0, 10);
    expect(value(convert(212, 'fahrenheit', 'celsius'))).toBeCloseTo(100, 10);
    expect(value(convert(98.6, 'fahrenheit', 'celsius'))).toBeCloseTo(37, 10);
  });

  it('converts Kelvin to Celsius', () => {
    expect(value(convert(273.15, 'kelvin', 'celsius'))).toBeCloseTo(0, 10);
    expect(value(convert(0, 'kelvin', 'celsius'))).toBeCloseTo(-273.15, 10);
    expect(value(convert(310.15, 'kelvin', 'celsius'))).toBeCloseTo(37, 10);
  });

  it('converts Celsius to Kelvin', () => {
    expect(value(convert(0, 'celsius', 'kelvin'))).toBeCloseTo(273.15, 10);
    expect(value(convert(-273.15, 'celsius', 'kelvin'))).toBeCloseTo(0, 10);
  });

  it('converts Rankine and Réaumur', () => {
    expect(value(convert(0, 'celsius', 'rankine'))).toBeCloseTo(491.67, 8);
    expect(value(convert(100, 'celsius', 'reaumur'))).toBeCloseTo(80, 10);
    expect(value(convert(80, 'reaumur', 'fahrenheit'))).toBeCloseTo(212, 8);
  });

  it('displays the familiar exact answers after formatting', () => {
    // Float noise in the affine round trip must not survive to the screen.
    expect(formatNumber(value(convert(100, 'celsius', 'fahrenheit')))).toBe('212');
    expect(formatNumber(value(convert(212, 'fahrenheit', 'celsius')))).toBe('100');
    expect(formatNumber(value(convert(37, 'celsius', 'fahrenheit')))).toBe('98.6');
  });

  it('rejects temperatures below absolute zero', () => {
    const result = convert(-300, 'celsius', 'fahrenheit');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('OUT_OF_DOMAIN');
  });

  it('accepts negative temperatures that are physically valid', () => {
    expect(value(convert(-273, 'celsius', 'kelvin'))).toBeCloseTo(0.15, 10);
    expect(value(convert(-459, 'fahrenheit', 'rankine'))).toBeCloseTo(0.67, 8);
  });
});

describe('custom conversions (fuel economy)', () => {
  it('converts L/100 km to mpg (US) as an inverse relationship', () => {
    expect(value(convert(10, 'liters-per-100-kilometers', 'miles-per-us-gallon'))).toBeCloseTo(
      23.52145833333333,
      9,
    );
    expect(value(convert(5, 'liters-per-100-kilometers', 'miles-per-us-gallon'))).toBeCloseTo(
      47.04291666666666,
      9,
    );
  });

  it('halving consumption doubles economy', () => {
    const at10 = value(convert(10, 'liters-per-100-kilometers', 'miles-per-us-gallon'));
    const at5 = value(convert(5, 'liters-per-100-kilometers', 'miles-per-us-gallon'));
    expect(at5 / at10).toBeCloseTo(2, 10);
  });

  it('converts mpg (US) to L/100 km', () => {
    expect(value(convert(30, 'miles-per-us-gallon', 'liters-per-100-kilometers'))).toBeCloseTo(
      7.840486111111111,
      9,
    );
  });

  it('keeps US and imperial mpg distinct', () => {
    const usMpg = value(convert(10, 'liters-per-100-kilometers', 'miles-per-us-gallon'));
    const impMpg = value(convert(10, 'liters-per-100-kilometers', 'miles-per-imperial-gallon'));
    expect(impMpg).toBeGreaterThan(usMpg);
    expect(impMpg / usMpg).toBeCloseTo(4.54609 / 3.785411784, 9);
  });

  it('round-trips through the base unit', () => {
    const kmPerLiter = value(convert(8, 'liters-per-100-kilometers', 'kilometer-per-liter'));
    expect(kmPerLiter).toBeCloseTo(12.5, 12);
    expect(
      value(convert(kmPerLiter, 'kilometer-per-liter', 'liters-per-100-kilometers')),
    ).toBeCloseTo(8, 10);
  });

  it('rejects zero, which has no finite economy', () => {
    const result = convert(0, 'liters-per-100-kilometers', 'miles-per-us-gallon');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('OUT_OF_DOMAIN');
  });
});

describe('numeric edge cases', () => {
  it('converts zero', () => {
    expect(value(convert(0, 'meter', 'foot'))).toBe(0);
    expect(value(convert(0, 'kilogram', 'pound'))).toBe(0);
  });

  it('converts negative values where they are meaningful', () => {
    expect(value(convert(-5, 'meter', 'foot'))).toBeCloseTo(-16.404199475, 8);
    expect(value(convert(-2.5, 'kilogram', 'gram'))).toBeCloseTo(-2500, 10);
  });

  it('converts decimals', () => {
    expect(value(convert(0.5, 'meter', 'centimeter'))).toBeCloseTo(50, 10);
    expect(value(convert(2.54, 'centimeter', 'inch'))).toBeCloseTo(1, 12);
  });

  it('converts very large values without overflowing', () => {
    const result = value(convert(1e15, 'meter', 'kilometer'));
    expect(result).toBe(1e12);
    expect(Number.isFinite(result)).toBe(true);
  });

  it('converts very small values without underflowing to zero', () => {
    const result = value(convert(1e-12, 'meter', 'nanometer'));
    expect(result).toBeCloseTo(0.001, 15);
    expect(result).not.toBe(0);
  });

  it('handles astronomical magnitudes', () => {
    expect(value(convert(1, 'light-year', 'meter'))).toBe(9460730472580800);
    expect(value(convert(1, 'parsec', 'light-year'))).toBeCloseTo(3.2615637769, 8);
  });

  it('rejects NaN and infinity', () => {
    expect(convert(Number.NaN, 'meter', 'foot').ok).toBe(false);
    expect(convert(Number.POSITIVE_INFINITY, 'meter', 'foot').ok).toBe(false);
    expect(convert(Number.NEGATIVE_INFINITY, 'meter', 'foot').ok).toBe(false);
  });

  it('returns the input unchanged for an identity conversion', () => {
    expect(value(convert(123.456, 'meter', 'meter'))).toBe(123.456);
    // Same size, different names: no multiply-then-divide artefact.
    expect(value(convert(1.5, 'gram-per-cubic-centimeter', 'gram-per-milliliter'))).toBe(1.5);
  });
});

describe('invalid conversions', () => {
  it('rejects unknown units', () => {
    const result = convert(1, 'meter', 'not-a-unit');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('UNKNOWN_UNIT');
  });

  it('refuses to convert across categories', () => {
    const result = convert(1, 'meter', 'kilogram');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('CATEGORY_MISMATCH');
  });

  it('refuses candela to lumen, which is not a unit conversion', () => {
    const result = convert(1, 'candela', 'lumen');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('CATEGORY_MISMATCH');
  });

  it('refuses gray to sievert, which needs a weighting factor', () => {
    const result = convert(1, 'gray', 'sievert');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('CATEGORY_MISMATCH');
  });

  it('never returns a value alongside an error', () => {
    const result = convert(1, 'meter', 'kilogram');
    expect(result).not.toHaveProperty('value');
  });
});

describe('round trips', () => {
  it('returns to the original value for every unit in the catalog', () => {
    for (const unit of getAllUnits()) {
      const base = toBaseValue(12.5, unit);
      const back = fromBaseValue(base, unit);
      expect(back).toBeCloseTo(12.5, 8);
    }
  });

  it('round-trips every pair within a sample of categories', () => {
    const sampled = ['length', 'mass', 'temperature', 'volume', 'speed', 'pressure', 'energy'];
    for (const categoryId of sampled) {
      const units = getUnitsByCategory(categoryId);
      for (const from of units) {
        for (const to of units) {
          const forward = convertUnits(25, from, to);
          expect(forward.ok).toBe(true);
          if (!forward.ok) continue;

          const backward = convertUnits(forward.value, to, from);
          expect(backward.ok).toBe(true);
          if (!backward.ok) continue;

          // Relative tolerance: extreme factor spans lose absolute precision.
          expect(backward.value).toBeCloseTo(25, 6);
        }
      }
    }
  });
});

describe('base unit consistency', () => {
  it('leaves a base unit value unchanged', () => {
    expect(toBaseValue(42, requireUnit('meter'))).toBe(42);
    expect(toBaseValue(42, requireUnit('kilogram'))).toBe(42);
    expect(toBaseValue(42, requireUnit('kelvin'))).toBe(42);
  });
});
