import { describe, expect, it } from 'vitest';
import { convert } from '@/domain/conversion/engine';

/**
 * Independent reference values, not imported catalog factors. References and
 * derivations are recorded in docs/seo-content-review.md. Prefix relations
 * follow the BIPM SI Brochure; customary factors follow NIST SP 811.
 */
const REFERENCES: [string, number, string, string, number][] = [
  ['length', 1, 'inch', 'centimeter', 2.54],
  ['mass', 1, 'pound', 'kilogram', 0.45359237],
  ['temperature', 32, 'fahrenheit', 'celsius', 0],
  ['volume', 1, 'us-gallon', 'liter', 3.785411784],
  ['area', 1, 'square-foot', 'square-meter', 0.09290304],
  ['speed', 1, 'knot', 'kilometer-per-hour', 1.852],
  ['time', 1, 'hour', 'second', 3600],
  ['digital-storage', 1, 'mebibyte', 'byte', 1048576],
  ['energy', 1, 'calorie', 'joule', 4.184],
  ['power', 1, 'horsepower', 'watt', 745.6998715822702],
  ['pressure', 1, 'atmosphere', 'pascal', 101325],
  ['data-transfer-rate', 100, 'megabit-per-second', 'megabyte-per-second', 12.5],
  ['fuel-economy', 30, 'miles-per-us-gallon', 'liters-per-100-kilometers', 7.840486111111111],
  ['angle', 180, 'degree', 'radian', Math.PI],
  ['frequency', 60, 'rpm', 'hertz', 1],
  ['force', 1, 'pound-force', 'newton', 4.4482216152605],
  ['torque', 1, 'pound-foot', 'newton-meter', 1.3558179483314004],
  ['acceleration', 1, 'standard-gravity', 'meter-per-second-squared', 9.80665],
  ['density', 1, 'gram-per-cubic-centimeter', 'kilogram-per-cubic-meter', 1000],
  ['flow-rate', 1, 'us-gallon-per-minute', 'liter-per-minute', 3.785411784],
  ['electric-current', 1, 'ampere', 'milliampere', 1000],
  ['voltage', 1, 'kilovolt', 'volt', 1000],
  ['resistance', 1, 'kiloohm', 'ohm', 1000],
  ['capacitance', 1, 'picofarad', 'farad', 1e-12],
  ['inductance', 1, 'millihenry', 'microhenry', 1000],
  ['electric-charge', 1, 'ampere-hour', 'coulomb', 3600],
  ['conductance', 1, 'siemens', 'microsiemens', 1000000],
  ['magnetic-field', 1, 'gauss', 'tesla', 1e-4],
  ['illuminance', 1, 'foot-candle', 'lux', 10.763910416709722],
  ['luminous-intensity', 1, 'candela', 'millicandela', 1000],
  ['luminous-flux', 1, 'kilolumen', 'lumen', 1000],
  ['radioactivity', 1, 'curie', 'becquerel', 37000000000],
  ['radiation-absorbed-dose', 1, 'rad', 'gray', 0.01],
  ['radiation-equivalent-dose', 1, 'rem', 'sievert', 0.01],
];

describe('independently sourced reference conversions', () => {
  it.each(REFERENCES)('%s: %s %s to %s', (_category, input, from, to, expected) => {
    const result = convert(input, from, to);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    if (expected === 0) expect(Math.abs(result.value)).toBeLessThan(1e-10);
    else expect(result.value / expected).toBeCloseTo(1, 12);
  });

  it('keeps the US therm distinct from 100,000 International Table BTU', () => {
    const therm = convert(1, 'therm', 'joule');
    const btu = convert(100000, 'btu', 'joule');
    expect(therm.ok && therm.value).toBe(105480400);
    expect(btu.ok && btu.value).toBeCloseTo(105505585.262, 5);
    expect(therm.ok && btu.ok && therm.value === btu.value).toBe(false);
  });

  it('uses the documented conventional mercury and water pressure units', () => {
    const mercury = convert(1, 'mmhg', 'pascal');
    const water = convert(1, 'inh2o', 'pascal');
    expect(mercury.ok && mercury.value).toBe(133.3224);
    expect(water.ok && water.value).toBe(249.0889);
  });

  it('uses the current measured atomic mass constant rather than treating it as exact', () => {
    const result = convert(1, 'atomic-mass-unit', 'kilogram');
    expect(result.ok && result.value).toBe(1.66053906892e-27);
  });

  it('distinguishes Imperial volume and Celsius offset conventions', () => {
    const gallon = convert(1, 'imperial-gallon', 'liter');
    const kelvin = convert(0, 'celsius', 'kelvin');
    expect(gallon.ok && gallon.value).toBeCloseTo(4.54609, 12);
    expect(kelvin.ok && kelvin.value).toBe(273.15);
  });

  it('validates physical domains before identity shortcuts', () => {
    expect(convert(-1, 'kelvin', 'kelvin').ok).toBe(false);
    expect(convert(-300, 'celsius', 'celsius').ok).toBe(false);
    expect(convert(-5, 'liters-per-100-kilometers', 'liters-per-100-kilometers').ok).toBe(false);
    expect(convert(-30, 'miles-per-us-gallon', 'liters-per-100-kilometers').ok).toBe(false);
  });

  it('accepts exact absolute zero despite affine cancellation without admitting negative kelvin', () => {
    const result = convert(-459.67, 'fahrenheit', 'kelvin');
    expect(result.ok && result.value).toBe(0);
    expect(convert(-459.670001, 'fahrenheit', 'kelvin').ok).toBe(false);
    expect(convert(-1e-20, 'kelvin', 'kelvin').ok).toBe(false);
  });
});
