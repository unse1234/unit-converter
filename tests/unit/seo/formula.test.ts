import { describe, expect, it } from 'vitest';
import { requireUnit } from '@/domain/units/registry';
import { buildConversionContent } from '@/lib/seo/conversion-content';
import { asFraction, buildFormula } from '@/lib/seo/formula';

function expression(fromId: string, toId: string): string {
  const formula = buildFormula(requireUnit(fromId), requireUnit(toId));
  if (!formula) throw new Error(`No formula for ${fromId} -> ${toId}`);
  return formula.expression;
}

function content(fromId: string, toId: string) {
  return buildConversionContent(requireUnit(fromId), requireUnit(toId));
}

describe('asFraction', () => {
  it('recognises simple fractions', () => {
    expect(asFraction(5 / 9)).toBe('5/9');
    expect(asFraction(1.8)).toBe('9/5');
    expect(asFraction(0.75)).toBe('3/4');
    expect(asFraction(1.25)).toBe('5/4');
  });

  it('returns null for integers and for values with no simple fraction', () => {
    expect(asFraction(3)).toBeNull();
    expect(asFraction(3.280839895013123)).toBeNull();
    expect(asFraction(1.602176634e-19)).toBeNull();
    expect(asFraction(1e-12)).toBeNull();
  });
});

describe('worked-example display precision', () => {
  it('marks a rounded answer as approximate', () => {
    expect(buildFormula(requireUnit('meter'), requireUnit('foot'))?.worked).toBe(
      '32.8084 ft ≈ 10 ÷ 0.3048',
    );
  });

  it('keeps equality when the displayed answer is exact', () => {
    expect(buildFormula(requireUnit('foot'), requireUnit('meter'))?.worked).toBe(
      '3.048 m = 10 × 0.3048',
    );
  });
});

describe('temperature formulas use the familiar arrangement', () => {
  it('writes Celsius to Fahrenheit as a multiply-then-add', () => {
    expect(expression('celsius', 'fahrenheit')).toBe('°F = °C × 9/5 + 32');
  });

  it('writes Fahrenheit to Celsius as a subtract-then-multiply', () => {
    expect(expression('fahrenheit', 'celsius')).toBe('°C = (°F − 32) × 5/9');
  });

  it('writes the Kelvin conversions as a simple shift', () => {
    expect(expression('celsius', 'kelvin')).toBe('K = °C + 273.15');
    expect(expression('kelvin', 'celsius')).toBe('°C = K − 273.15');
  });

  it('writes Fahrenheit to Kelvin with the 459.67 offset', () => {
    expect(expression('fahrenheit', 'kelvin')).toBe('K = (°F + 459.67) × 5/9');
  });

  it('writes Celsius to Réaumur as a pure scale, with no offset term', () => {
    expect(expression('celsius', 'reaumur')).toBe('°Ré = °C × 4/5');
  });
});

describe('proportional formulas', () => {
  it('prefers exact division when the target factor is an exact decimal', () => {
    expect(expression('meter', 'foot')).toBe('ft = m ÷ 0.3048');
  });

  it('uses multiplication when that is the exact form', () => {
    expect(expression('kilometer', 'meter')).toBe('m = km × 1000');
    expect(expression('gigabyte', 'megabyte')).toBe('MB = GB × 1000');
  });

  it('states the relationship for cross-system mass units', () => {
    expect(expression('kilogram', 'pound')).toBe('lb = kg ÷ 0.45359237');
  });

  it('groups a fractional denominator so the displayed arithmetic preserves precedence', () => {
    expect(expression('coulomb', 'milliampere-hour')).toBe('mAh = C ÷ (18/5)');
  });
});

describe('fuel economy formulas are reciprocal', () => {
  it('writes mpg to L/100 km as a division', () => {
    expect(expression('miles-per-us-gallon', 'liters-per-100-kilometers')).toBe(
      'L/100 km = 235.2145833 ÷ mpg (US)',
    );
  });

  it('writes L/100 km to mpg with the same constant', () => {
    expect(expression('liters-per-100-kilometers', 'miles-per-us-gallon')).toBe(
      'mpg (US) = 235.2145833 ÷ L/100 km',
    );
  });

  it('treats two reciprocal units as an ordinary multiplication', () => {
    expect(expression('liters-per-100-kilometers', 'us-gallons-per-100-miles')).toMatch(
      /^gal\/100 mi = L\/100 km × /,
    );
  });
});

describe('generated page content', () => {
  it('distinguishes rounded relationships from exact displayed values', () => {
    const meters = content('meter', 'foot');
    // Trailing zeros are stripped, so the exact 0.3048 shows as-is.
    expect(meters.statement).toBe('1 meter ≈ 3.2808399 feet');
    expect(meters.reverseStatement).toBe('1 foot = 0.3048 meters');
  });

  it('builds a conversion table with correct values', () => {
    const row = content('kilogram', 'pound').table.find((entry) => entry.from === 10);
    expect(row?.toLabel).toBe('22.046226');
  });

  it('uses a temperature-appropriate table range', () => {
    const celsius = content('celsius', 'fahrenheit');
    expect(celsius.table[0]?.from).toBe(-40);
    expect(celsius.table.find((row) => row.from === 100)?.toLabel).toBe('212');
  });

  it('does not repeat the formula and table as artificial FAQs', () => {
    const meters = content('meter', 'foot');
    expect(meters.faqs).toEqual([]);
  });

  it('carries unit disclosures as notes rather than invented questions', () => {
    const years = content('year', 'day');
    expect(years.notes.some((note) => note.includes('365.2425'))).toBe(true);
    expect(years.faqs.some((faq) => years.notes.includes(faq.answer))).toBe(false);
  });

  it('has no notes when neither unit carries one', () => {
    expect(content('meter', 'centimeter').notes).toEqual([]);
  });

  it('produces distinct content for different pairs', () => {
    const a = content('meter', 'foot');
    const b = content('kilometer', 'mile');
    expect(a.statement).not.toBe(b.statement);
    expect(a.table).not.toEqual(b.table);
    expect(a.formula?.expression).not.toBe(b.formula?.expression);
  });

  it('never emits placeholder text', () => {
    for (const [fromId, toId] of [
      ['meter', 'foot'],
      ['celsius', 'fahrenheit'],
      ['liters-per-100-kilometers', 'miles-per-us-gallon'],
      ['gigabyte', 'mebibyte'],
    ] as const) {
      const text = JSON.stringify(content(fromId, toId));
      expect(text).not.toContain('undefined');
      expect(text).not.toContain('NaN');
      expect(text).not.toContain('[object');
    }
  });
});

describe('temperature page content', () => {
  const celsius = content('celsius', 'fahrenheit');

  it('leads with the formula rather than a misleading one-degree ratio', () => {
    expect(celsius.statement).toBe('°F = °C × 9/5 + 32');
    expect(celsius.reverseStatement).toBe('°C = (°F − 32) × 5/9');
  });

  it('never asks how many degrees are "in" a degree', () => {
    expect(celsius.faqs.some((faq) => /how many/i.test(faq.question))).toBe(false);
  });

  it('keeps useful reference temperatures in the table', () => {
    expect(celsius.table.find((row) => row.from === 0)?.toLabel).toBe('32');
    expect(celsius.table.find((row) => row.from === 37)?.toLabel).toBe('98.6');
  });

  it('explains that a degree is a different size on each scale', () => {
    const size = celsius.faqs.find((faq) => faq.question.startsWith('Is a change of 1 °C'));
    expect(size?.answer).toMatch(/^No\. A change of 1 °C is a change of 1\.8 °F/);
  });

  it('says so when both scales share a degree size', () => {
    const size = content('celsius', 'kelvin').faqs.find((faq) =>
      faq.question.startsWith('Is a change of 1 °C'),
    );
    expect(size?.answer).toMatch(/^Yes\./);
  });

  it('explains the distinction between readings and temperature differences', () => {
    expect(content('fahrenheit', 'kelvin').intro).toContain('do not add or subtract');
  });
});

describe('fuel economy page content', () => {
  it('leads with the reciprocal formula', () => {
    expect(content('liters-per-100-kilometers', 'miles-per-us-gallon').statement).toBe(
      'mpg (US) = 235.2145833 ÷ L/100 km',
    );
  });

  it('sizes the table to consumption figures for L/100 km', () => {
    expect(content('liters-per-100-kilometers', 'miles-per-us-gallon').table[0]?.from).toBe(3);
  });

  it('sizes the table to economy figures for mpg', () => {
    const mpg = content('miles-per-us-gallon', 'liters-per-100-kilometers');
    expect(mpg.table[0]?.from).toBe(10);
    expect(mpg.table.map((row) => row.from)).toContain(30);
  });

  it('does not ask how many of one unit are in the other', () => {
    const mpg = content('miles-per-us-gallon', 'liters-per-100-kilometers');
    expect(mpg.faqs.some((faq) => /how many/i.test(faq.question))).toBe(false);
  });
});

describe('precision and evidence', () => {
  it('does not turn a small scientific multiplier into zero', () => {
    expect(expression('electronvolt', 'joule')).toBe('J = eV × 1.602176634e-19');
    expect(expression('picofarad', 'farad')).toBe('F = pF × 1e-12');
  });

  it('provides visible precision guidance and authoritative sources', () => {
    const pair = content('meter', 'foot');
    expect(pair.precisionNote).toContain('8 significant digits');
    expect(pair.sources.some((source) => new URL(source.url).hostname === 'www.nist.gov')).toBe(
      true,
    );
    expect(pair.formula?.explanation).not.toContain('exactly');
  });
});
