import { convertUnits, getConversionRatio } from '@/domain/conversion/engine';
import { formatNumber } from '@/domain/conversion/format';
import type { UnitDefinition } from '@/types/units';

/**
 * Formula generation.
 *
 * Every conversion page states the arithmetic that produces its answer. The
 * text is derived from the same factors the engine uses, so a formula can
 * never drift from the result shown above it — the alternative, hand-writing
 * a formula string per pair, is exactly the duplication CLAUDE.md rules out.
 *
 * The generated form is chosen for familiarity. "°C = (°F − 32) × 5/9" and
 * "°F = °C × 1.8 + 32" are the same affine relation written two ways, and a
 * page that printed the unfamiliar one would be correct but useless.
 */

/** Renders a number as a simple fraction when one represents it exactly. */
export function asFraction(value: number, maxDenominator = 16): string | null {
  if (!Number.isFinite(value) || Number.isInteger(value)) return null;

  for (let denominator = 2; denominator <= maxDenominator; denominator += 1) {
    const numerator = value * denominator;
    if (Math.abs(numerator - Math.round(numerator)) < 1e-12) {
      return `${Math.round(numerator)}/${denominator}`;
    }
  }
  return null;
}

/** A constant is "clean" when it needs at most two decimal places. */
function isClean(value: number): boolean {
  return Math.abs(value - Math.round(value * 100) / 100) < 1e-9;
}

/** Formats a multiplier, preferring an exact fraction over a long decimal. */
function multiplier(value: number): string {
  const fraction = asFraction(value);
  if (fraction) return fraction;
  return formatNumber(value, { significantDigits: 10, useGrouping: false });
}

function constant(value: number): string {
  return formatNumber(Math.abs(value), { significantDigits: 10, useGrouping: false });
}

/**
 * True for units whose relation to the base unit is reciprocal rather than
 * proportional — fuel consumed per distance, against distance per fuel.
 */
export function isReciprocal(unit: UnitDefinition): boolean {
  return unit.conversionType === 'custom';
}

export interface ConversionFormula {
  /** The formula itself, e.g. "ft = m ÷ 0.3048". */
  expression: string;
  /** One or two sentences explaining what the numbers mean. */
  explanation: string;
  /** A worked example using a realistic value. */
  worked?: string;
}

/**
 * Builds the formula for a pair, choosing the shape that matches how the
 * conversion is normally written.
 */
export function buildFormula(from: UnitDefinition, to: UnitDefinition): ConversionFormula | null {
  const fromLabel = from.symbol || from.pluralName;
  const toLabel = to.symbol || to.pluralName;

  /* ---------------------------------------------------------------- */
  /* Reciprocal relations (fuel economy)                               */
  /* ---------------------------------------------------------------- */

  if (isReciprocal(from) || isReciprocal(to)) {
    const unit = convertUnits(1, from, to);
    if (!unit.ok) return null;

    // One reciprocal side makes the relation itself reciprocal; two cancel out
    // into an ordinary proportional one.
    if (isReciprocal(from) !== isReciprocal(to)) {
      const numerator = constant(unit.value);
      // A value typical of the source unit: a consumption figure for L/100 km,
      // an economy figure for mpg or km/L.
      const sample = isReciprocal(from) ? 8 : 30;
      return {
        expression: `${toLabel} = ${numerator} ÷ ${fromLabel}`,
        explanation: `These units run in opposite directions: one measures distance per unit of fuel and the other fuel per unit of distance. Dividing ${numerator} by the ${from.name} figure gives the ${to.name} figure, and dividing it back returns the original — which is why a lower number is better on one scale and worse on the other.`,
        worked: `${formatNumber(unit.value / sample)} ${toLabel} = ${numerator} ÷ ${sample}`,
      };
    }

    return {
      expression: `${toLabel} = ${fromLabel} × ${multiplier(unit.value)}`,
      explanation: `Both units measure fuel used over a fixed distance, so the conversion is a single multiplication by ${multiplier(unit.value)}.`,
    };
  }

  /* ---------------------------------------------------------------- */
  /* Affine relations (temperature)                                    */
  /* ---------------------------------------------------------------- */

  if (from.conversionType === 'affine' || to.conversionType === 'affine') {
    const fromFactor = from.factor ?? 1;
    const toFactor = to.factor ?? 1;
    const fromOffset = from.offset ?? 0;
    const toOffset = to.offset ?? 0;

    // result = value × scale + shift, equivalently (value + inner) × scale.
    const scale = fromFactor / toFactor;
    const shift = (fromOffset - toOffset) / toFactor;
    const inner = (fromOffset - toOffset) / fromFactor;

    const sign = (value: number) => (value < 0 ? '−' : '+');

    if (Math.abs(shift) < 1e-12) {
      return {
        expression: `${toLabel} = ${fromLabel} × ${multiplier(scale)}`,
        explanation: `Both scales share the same zero point, so only the size of one degree differs: one ${from.name} step equals ${multiplier(scale)} ${to.name} steps.`,
      };
    }

    if (Math.abs(scale - 1) < 1e-12) {
      return {
        expression: `${toLabel} = ${fromLabel} ${sign(shift)} ${constant(shift)}`,
        explanation: `The two scales use degrees of the same size, so converting is only a shift of the zero point by ${constant(shift)}.`,
        worked: `${formatNumber(20 * scale + shift)} ${toLabel} = 20 ${sign(shift)} ${constant(shift)}`,
      };
    }

    // Prefer whichever arrangement produces the rounder constant.
    if (isClean(shift) || !isClean(inner)) {
      return {
        expression: `${toLabel} = ${fromLabel} × ${multiplier(scale)} ${sign(shift)} ${constant(shift)}`,
        explanation: `Multiplying by ${multiplier(scale)} converts the size of a degree, and the ${sign(shift) === '+' ? 'addition' : 'subtraction'} of ${constant(shift)} lines up the two zero points, which sit at different temperatures.`,
        worked: `${formatNumber(20 * scale + shift)} ${toLabel} = 20 × ${multiplier(scale)} ${sign(shift)} ${constant(shift)}`,
      };
    }

    return {
      expression: `${toLabel} = (${fromLabel} ${sign(inner)} ${constant(inner)}) × ${multiplier(scale)}`,
      explanation: `The ${sign(inner) === '+' ? 'addition' : 'subtraction'} of ${constant(inner)} aligns the two zero points, then multiplying by ${multiplier(scale)} converts the size of a degree.`,
      worked: `${formatNumber((68 + inner) * scale)} ${toLabel} = (68 ${sign(inner)} ${constant(inner)}) × ${multiplier(scale)}`,
    };
  }

  /* ---------------------------------------------------------------- */
  /* Proportional relations (everything else)                          */
  /* ---------------------------------------------------------------- */

  const ratio = getConversionRatio(from, to);
  if (ratio === null) return null;

  const fromFactor = from.factor ?? 1;
  const toFactor = to.factor ?? 1;

  // Dividing by the target factor is exact whenever that factor is an exact
  // decimal, so "m ÷ 0.3048" beats "m × 3.280839895…" as the stated formula.
  const preferDivision = fromFactor === 1 && toFactor !== 1 && !Number.isInteger(1 / toFactor);

  const expression = preferDivision
    ? `${toLabel} = ${fromLabel} ÷ ${multiplier(toFactor)}`
    : `${toLabel} = ${fromLabel} × ${multiplier(ratio)}`;

  const exactness = preferDivision
    ? `One ${to.name} is exactly ${multiplier(toFactor)} ${from.pluralName}, so dividing by that figure converts in one step.`
    : `One ${from.name} is ${multiplier(ratio)} ${to.pluralName}, so a single multiplication converts any value.`;

  const example = convertUnits(10, from, to);

  return {
    expression,
    explanation: exactness,
    ...(example.ok
      ? {
          worked: preferDivision
            ? `${formatNumber(example.value)} ${toLabel} = 10 ÷ ${multiplier(toFactor)}`
            : `${formatNumber(example.value)} ${toLabel} = 10 × ${multiplier(ratio)}`,
        }
      : {}),
  };
}
