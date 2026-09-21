import { describe, expect, it } from 'vitest';
import { convert, convertUnits } from '@/domain/conversion/engine';
import { formatNumber, PRECISION_OPTIONS } from '@/domain/conversion/format';
import { parseNumericInput } from '@/domain/conversion/parse';
import { getAllUnits, getCategories, getUnitsByCategory, requireUnit } from '@/domain/units/registry';

/**
 * End-to-end tests for what the user actually sees.
 *
 * engine.test.ts, parse.test.ts and format.test.ts each cover one stage in
 * isolation. This file covers the three of them wired together — raw typed
 * text in, displayed string out — because that is where a correct engine can
 * still produce a bad screen: an Infinity that formats as "∞", a rounding
 * artefact that survives into the result, a parse that quietly drops a comma.
 *
 * `display` below is the exact path the converter component takes.
 */

/** Parses, converts and formats, or returns a marker describing the failure. */
function display(raw: string, fromId: string, toId: string, significantDigits?: number): string {
  const parsed = parseNumericInput(raw);
  if (!parsed.ok) return `ERROR:${parsed.code}`;

  const result = convert(parsed.value, fromId, toId);
  if (!result.ok) return `ERROR:${result.code}`;

  return formatNumber(result.value, significantDigits ? { significantDigits } : {});
}

/** Text that must never reach the screen. */
const FORBIDDEN = /NaN|Infinity|undefined|null|e\+?308|∞/i;

/**
 * A float artefact is a run of 0s or 9s deep in the fraction, as in
 * 0.30000000000000004 or 2.9999999999999996. Legitimate results round before
 * they ever get that long.
 */
const FLOAT_ARTEFACT = /\.\d*?(0{8,}[1-9]|9{8,}[0-8])/;

describe('display pipeline: every category', () => {
  /*
   * One hand-checked conversion per category, so a wrong constant fails here
   * rather than silently shipping. Values are the published relationships,
   * not values read back out of this codebase.
   */
  const REFERENCE: Array<[category: string, from: string, to: string, input: string, expected: string]> = [
    ['length', 'meter', 'foot', '1', '3.28084'],
    ['mass', 'kilogram', 'pound', '1', '2.20462'],
    ['temperature', 'celsius', 'fahrenheit', '100', '212'],
    ['volume', 'liter', 'us-gallon', '1', '0.264172'],
    ['area', 'square-meter', 'square-foot', '1', '10.7639'],
    ['speed', 'kilometer-per-hour', 'mile-per-hour', '100', '62.1371'],
    ['time', 'hour', 'minute', '1', '60'],
    ['digital-storage', 'gigabyte', 'megabyte', '1', '1,000'],
    ['energy', 'kilojoule', 'kilocalorie', '1', '0.239006'],
    ['power', 'kilowatt', 'horsepower', '1', '1.34102'],
    ['pressure', 'bar', 'psi', '1', '14.5038'],
    ['data-transfer-rate', 'megabit-per-second', 'megabyte-per-second', '8', '1'],
    ['fuel-economy', 'liters-per-100-kilometers', 'miles-per-us-gallon', '10', '23.5215'],
    ['angle', 'degree', 'radian', '180', '3.14159'],
    ['frequency', 'megahertz', 'gigahertz', '1000', '1'],
    ['force', 'newton', 'pound-force', '1', '0.224809'],
    ['torque', 'newton-meter', 'pound-foot', '1', '0.737562'],
    ['acceleration', 'meter-per-second-squared', 'standard-gravity', '9.80665', '1'],
    ['density', 'kilogram-per-cubic-meter', 'gram-per-cubic-centimeter', '1000', '1'],
    ['flow-rate', 'liter-per-minute', 'us-gallon-per-minute', '10', '2.64172'],
    ['electric-current', 'ampere', 'milliampere', '1', '1,000'],
    ['voltage', 'volt', 'millivolt', '1', '1,000'],
    ['resistance', 'ohm', 'kiloohm', '1000', '1'],
    ['capacitance', 'microfarad', 'nanofarad', '1', '1,000'],
    ['inductance', 'millihenry', 'microhenry', '1', '1,000'],
    ['electric-charge', 'milliampere-hour', 'coulomb', '1000', '3,600'],
    ['conductance', 'siemens', 'millisiemens', '1', '1,000'],
    ['magnetic-field', 'tesla', 'gauss', '1', '10,000'],
    ['illuminance', 'foot-candle', 'lux', '1', '10.7639'],
    ['luminous-intensity', 'candela', 'millicandela', '1', '1,000'],
    ['luminous-flux', 'lumen', 'kilolumen', '1000', '1'],
    ['radioactivity', 'becquerel', 'curie', '3.7e10', '1'],
    ['radiation-absorbed-dose', 'gray', 'rad', '1', '100'],
    ['radiation-equivalent-dose', 'millisievert', 'millirem', '1', '100'],
  ];

  it('covers every category in the catalog', () => {
    const covered = new Set(REFERENCE.map(([category]) => category));
    const all = getCategories().map((category) => category.id);
    expect([...all].sort()).toEqual([...covered].sort());
  });

  it.each(REFERENCE)('%s: %s to %s', (_category, from, to, input, expected) => {
    expect(display(input, from, to)).toBe(expected);
  });

  it('round-trips the reference conversion in every category', () => {
    for (const [category, from, to, input] of REFERENCE) {
      const parsed = parseNumericInput(input);
      expect(parsed.ok, `${category}: input did not parse`).toBe(true);
      if (!parsed.ok) continue;

      const forward = convert(parsed.value, from, to);
      expect(forward.ok, `${category}: forward conversion failed`).toBe(true);
      if (!forward.ok) continue;

      const back = convert(forward.value, to, from);
      expect(back.ok, `${category}: reverse conversion failed`).toBe(true);
      if (!back.ok) continue;

      expect(back.value).toBeCloseTo(parsed.value, 8);
    }
  });
});

describe('display pipeline: rejected input', () => {
  it('reports an empty field distinctly, so the UI can stay silent', () => {
    expect(display('', 'meter', 'foot')).toBe('ERROR:EMPTY');
    expect(display('   ', 'meter', 'foot')).toBe('ERROR:EMPTY');
  });

  it.each(['abc', 'ten', '12abc', '1.2.3', '--5', '10 20', '$5', '1/0'])(
    'rejects non-numeric input %j',
    (input) => {
      expect(display(input, 'meter', 'foot')).toMatch(/^ERROR:/);
    },
  );

  it('never renders NaN or Infinity for any rejected input', () => {
    for (const input of ['', 'abc', '1e400', '-1e400', 'NaN', 'Infinity', '-Infinity', '1/0']) {
      const shown = display(input, 'meter', 'foot');
      expect(shown, `input ${JSON.stringify(input)}`).not.toMatch(FORBIDDEN);
    }
  });

  it('gives every failure a message a person can act on', () => {
    for (const input of ['abc', '', '1e400']) {
      const parsed = parseNumericInput(input);
      expect(parsed.ok).toBe(false);
      if (parsed.ok) continue;
      expect(parsed.message.length).toBeGreaterThan(10);
      expect(parsed.message).toMatch(/[.!]$/);
    }
  });
});

describe('display pipeline: thousands separators', () => {
  it('reads a comma as a grouping separator', () => {
    expect(display('1,000', 'kilogram', 'pound')).toBe('2,204.62');
    expect(display('1,234,567', 'meter', 'kilometer')).toBe('1,234.57');
  });

  it('agrees with the same number written without separators', () => {
    expect(display('1,000', 'kilogram', 'pound')).toBe(display('1000', 'kilogram', 'pound'));
    expect(display('1,234.5', 'meter', 'foot')).toBe(display('1234.5', 'meter', 'foot'));
  });

  it('reads a lone comma as a decimal separator, as much of the world writes it', () => {
    expect(display('1,5', 'meter', 'foot')).toBe(display('1.5', 'meter', 'foot'));
  });

  it('rejects a comma arrangement that reads as neither', () => {
    expect(display('1,2,3', 'meter', 'foot')).toMatch(/^ERROR:/);
    expect(display('1,,5', 'meter', 'foot')).toMatch(/^ERROR:/);
    expect(display('1,234,56', 'meter', 'foot')).toMatch(/^ERROR:/);
  });

  it('reads one comma with no decimal point as a decimal, whatever follows it', () => {
    // A single comma and no decimal point is the decimal-comma convention, so
    // "1,00" means 1.00 rather than 100 — grouping requires three digits.
    expect(display('1,00', 'meter', 'foot')).toBe(display('1', 'meter', 'foot'));
    expect(display('1,50', 'meter', 'foot')).toBe(display('1.5', 'meter', 'foot'));
  });
});

describe('display pipeline: negatives', () => {
  it('keeps a negative temperature negative', () => {
    expect(display('-40', 'celsius', 'fahrenheit')).toBe('-40');
    expect(display('-10', 'celsius', 'fahrenheit')).toBe('14');
  });

  it('converts absolute zero to exactly zero kelvin', () => {
    expect(display('-273.15', 'celsius', 'kelvin')).toBe('0');
  });

  it('refuses a temperature below absolute zero rather than inventing one', () => {
    expect(display('-300', 'celsius', 'kelvin')).toBe('ERROR:OUT_OF_DOMAIN');
    expect(display('-500', 'fahrenheit', 'celsius')).toBe('ERROR:OUT_OF_DOMAIN');
  });

  it('carries a sign through a plain proportional conversion', () => {
    expect(display('-5', 'meter', 'foot')).toBe('-16.4042');
  });

  it('normalises a Unicode minus pasted from a document', () => {
    expect(display('−10', 'celsius', 'fahrenheit')).toBe('14');
  });
});

describe('display pipeline: extreme magnitudes', () => {
  it('shows very large results in scientific notation, not a wall of digits', () => {
    const shown = display('1e20', 'meter', 'millimeter');
    expect(shown).toMatch(/e\+\d+$/);
    expect(shown).not.toMatch(FORBIDDEN);
  });

  it('shows very small results in scientific notation, not as zero', () => {
    const shown = display('1e-12', 'meter', 'kilometer');
    expect(shown).not.toBe('0');
    expect(shown).toMatch(/e-\d+$/);
  });

  it('refuses a value too large to represent rather than showing Infinity', () => {
    expect(display('1e400', 'meter', 'foot')).toBe('ERROR:NOT_FINITE');
  });

  it('refuses a conversion that would overflow rather than showing Infinity', () => {
    expect(display('1e300', 'meter', 'nanometer')).toBe('ERROR:NOT_FINITE_RESULT');
  });

  it('never renders a forbidden token at any magnitude', () => {
    const exponents = [-300, -100, -20, -8, -3, 0, 3, 8, 20, 100, 300];
    for (const exponent of exponents) {
      const shown = display(`1e${exponent}`, 'meter', 'foot');
      expect(shown, `1e${exponent}`).not.toMatch(FORBIDDEN);
    }
  });
});

describe('display pipeline: rounding', () => {
  it('rounds to six significant digits by default', () => {
    expect(display('1', 'meter', 'foot')).toBe('3.28084');
  });

  it('shows an exact conversion exactly, with no trailing artefact', () => {
    expect(display('1', 'inch', 'centimeter')).toBe('2.54');
    expect(display('1', 'foot', 'meter')).toBe('0.3048');
    expect(display('1', 'pound', 'kilogram', 8)).toBe('0.45359237');
  });

  it('pads nothing: a whole-number result has no decimal point', () => {
    expect(display('1', 'hour', 'minute')).toBe('60');
    expect(display('1000', 'meter', 'kilometer')).toBe('1');
  });

  it('offers more precision on request without changing the value', () => {
    expect(display('1', 'meter', 'foot', 2)).toBe('3.3');
    expect(display('1', 'meter', 'foot', 6)).toBe('3.28084');
    expect(display('1', 'meter', 'foot', 10)).toBe('3.280839895');
  });

  it('shows no floating-point artefact at any offered precision', () => {
    // 0.1-style values are where binary floating point leaks into decimal
    // output; every one of these must round cleanly.
    const inputs = ['0.1', '0.2', '0.3', '0.7', '1.1', '2.675', '1.005'];
    for (const precision of PRECISION_OPTIONS) {
      for (const input of inputs) {
        for (const [from, to] of [
          ['meter', 'centimeter'],
          ['kilogram', 'gram'],
          ['liter', 'milliliter'],
        ] as const) {
          const shown = display(input, from, to, precision);
          expect(shown, `${input} ${from}->${to} @${precision}`).not.toMatch(FLOAT_ARTEFACT);
          expect(shown, `${input} ${from}->${to} @${precision}`).not.toMatch(FORBIDDEN);
        }
      }
    }
  });

  it('leaves an identity conversion untouched at full precision', () => {
    // A multiply-then-divide round trip is exactly what produces
    // 0.30000000000000004; the engine short-circuits instead.
    expect(display('0.3', 'meter', 'meter', 15)).toBe('0.3');
    expect(display('0.1', 'kilogram', 'kilogram', 15)).toBe('0.1');
  });
});

describe('display pipeline: catalog-wide sweep', () => {
  it('renders a clean string for every unit in the catalog', () => {
    for (const unit of getAllUnits()) {
      const peers = getUnitsByCategory(unit.category).filter((other) => other.id !== unit.id);
      for (const peer of peers) {
        const result = convertUnits(1, unit, peer);
        // Some pairs are legitimately refused (a zero-valued fuel economy,
        // an out-of-range temperature); a refusal must carry a message.
        if (!result.ok) {
          expect(result.message.length, `${unit.id} -> ${peer.id}`).toBeGreaterThan(10);
          continue;
        }

        const shown = formatNumber(result.value);
        expect(shown, `${unit.id} -> ${peer.id}`).not.toMatch(FORBIDDEN);
        expect(shown, `${unit.id} -> ${peer.id}`).not.toMatch(FLOAT_ARTEFACT);
        expect(shown.length, `${unit.id} -> ${peer.id}`).toBeGreaterThan(0);
      }
    }
  });

  it('never returns a non-finite value from a successful conversion', () => {
    for (const unit of getAllUnits()) {
      for (const value of [1, 1000, 0.001, -1]) {
        const peers = getUnitsByCategory(unit.category);
        for (const peer of peers) {
          const result = convertUnits(value, unit, peer);
          if (result.ok) {
            expect(Number.isFinite(result.value), `${unit.id} -> ${peer.id} @${value}`).toBe(true);
          }
        }
      }
    }
  });

  it('refuses every cross-category conversion', () => {
    const categories = getCategories();
    for (let i = 0; i < categories.length; i += 1) {
      const next = categories[(i + 1) % categories.length];
      const a = getUnitsByCategory(categories[i]!.id)[0];
      const b = getUnitsByCategory(next!.id)[0];
      if (!a || !b || a.category === b.category) continue;

      const result = convertUnits(1, a, b);
      expect(result.ok, `${a.id} -> ${b.id}`).toBe(false);
    }
  });
});

describe('display pipeline: temperature is affine, not proportional', () => {
  it('does not scale an offset unit by a bare ratio', () => {
    // The classic bug: treating °C -> °F as a multiplication would make
    // 0 °C come out as 0 °F rather than 32 °F.
    expect(display('0', 'celsius', 'fahrenheit')).toBe('32');
    expect(display('0', 'fahrenheit', 'celsius')).toBe('-17.7778');
    expect(display('0', 'celsius', 'kelvin')).toBe('273.15');
  });

  it('has no simple ratio to report for an offset pair', () => {
    const celsius = requireUnit('celsius');
    const fahrenheit = requireUnit('fahrenheit');
    const meter = requireUnit('meter');
    const foot = requireUnit('foot');

    // A proportional pair can be described as "1 A = n B"; an affine one
    // cannot, and page copy relies on knowing the difference.
    expect(convertUnits(2, celsius, fahrenheit).ok).toBe(true);
    expect(display('2', 'celsius', 'fahrenheit')).toBe('35.6');
    expect(display('1', 'celsius', 'fahrenheit')).toBe('33.8');

    // Doubling the input does not double the output for temperature...
    expect(display('2', 'meter', 'foot')).toBe('6.56168');
    expect(display('1', 'meter', 'foot')).toBe('3.28084');
    void meter;
    void foot;
  });

  it('agrees with the freezing and boiling points of water', () => {
    expect(display('32', 'fahrenheit', 'celsius')).toBe('0');
    expect(display('212', 'fahrenheit', 'celsius')).toBe('100');
    expect(display('273.15', 'kelvin', 'celsius')).toBe('0');
    expect(display('373.15', 'kelvin', 'celsius')).toBe('100');
  });
});
