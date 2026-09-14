import type { ConversionFailure, ConversionResult } from '@/types/conversion';
import type { UnitDefinition } from '@/types/units';
import { getUnit } from '../units/registry';
import { getCustomConversion } from './custom';
import { getDomainRule } from './domain-rules';

/**
 * The conversion engine.
 *
 * Every conversion goes through the category base unit: normalise to base,
 * then denormalise into the target. That keeps the data as N unit definitions
 * instead of N² pair definitions, and means a new unit is a data change with
 * no code change at all.
 *
 * Nothing here rounds. Rounding is a presentation decision and lives in
 * format.ts; the engine returns full double precision so that chained or
 * downstream calculations do not accumulate display error.
 *
 * This module imports no UI framework and can run anywhere.
 */

function fail(code: ConversionFailure['code'], message: string): ConversionFailure {
  return { ok: false, code, message };
}

/** Expresses a value in the category's base unit. */
export function toBaseValue(value: number, unit: UnitDefinition): number {
  if (unit.conversionType === 'custom') {
    const custom = unit.customKey ? getCustomConversion(unit.customKey) : undefined;
    if (!custom) throw new Error(`Missing custom conversion for unit: ${unit.id}`);
    return custom.toBase(value);
  }
  const factor = unit.factor ?? 1;
  const offset = unit.offset ?? 0;
  return value * factor + offset;
}

/** Expresses a base-unit value in the given unit. */
export function fromBaseValue(base: number, unit: UnitDefinition): number {
  if (unit.conversionType === 'custom') {
    const custom = unit.customKey ? getCustomConversion(unit.customKey) : undefined;
    if (!custom) throw new Error(`Missing custom conversion for unit: ${unit.id}`);
    return custom.fromBase(base);
  }
  const factor = unit.factor ?? 1;
  const offset = unit.offset ?? 0;
  return (base - offset) / factor;
}

/**
 * Converts between two resolved units.
 *
 * Prefer this over `convert` when the unit records are already in hand — page
 * templates and the client converter both have them, and it avoids a lookup.
 */
export function convertUnits(
  value: number,
  from: UnitDefinition,
  to: UnitDefinition,
): ConversionResult {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return fail('INVALID_VALUE', 'Enter a number to convert.');
  }
  if (!Number.isFinite(value)) {
    return fail('INVALID_VALUE', 'The value must be a finite number.');
  }
  if (from.category !== to.category) {
    return fail(
      'CATEGORY_MISMATCH',
      `${from.name} and ${to.name} measure different quantities, so they cannot be converted.`,
    );
  }

  const rule = getDomainRule(from.category);

  if (rule?.disallowZero && value === 0) {
    return fail('OUT_OF_DOMAIN', rule.message);
  }

  // Identical scale and offset: return the input untouched rather than letting
  // a multiply-then-divide round trip introduce a trailing-digit artefact.
  if (
    from.id === to.id ||
    (from.conversionType !== 'custom' &&
      to.conversionType !== 'custom' &&
      from.factor === to.factor &&
      (from.offset ?? 0) === (to.offset ?? 0))
  ) {
    return { ok: true, value, from, to };
  }

  const base = toBaseValue(value, from);

  if (rule?.minBase !== undefined && base < rule.minBase) {
    return fail('OUT_OF_DOMAIN', rule.message);
  }
  if (rule?.disallowZero && base === 0) {
    return fail('OUT_OF_DOMAIN', rule.message);
  }

  const result = fromBaseValue(base, to);

  if (!Number.isFinite(result)) {
    return fail(
      'NOT_FINITE_RESULT',
      'That conversion does not produce a finite result. Try a different value.',
    );
  }

  return { ok: true, value: result, from, to };
}

/** Converts between two units identified by id. */
export function convert(value: number, fromUnitId: string, toUnitId: string): ConversionResult {
  const from = getUnit(fromUnitId);
  if (!from) return fail('UNKNOWN_UNIT', `Unknown unit: ${fromUnitId}`);

  const to = getUnit(toUnitId);
  if (!to) return fail('UNKNOWN_UNIT', `Unknown unit: ${toUnitId}`);

  return convertUnits(value, from, to);
}

/**
 * The multiplier from one unit to another, or null when the pair is not a
 * simple ratio (temperature and fuel economy, where "1 unit = N units" is not
 * a meaningful statement).
 *
 * Used by page content to state the exact relationship.
 */
export function getConversionRatio(from: UnitDefinition, to: UnitDefinition): number | null {
  if (from.category !== to.category) return null;
  if (from.conversionType !== 'linear' || to.conversionType !== 'linear') return null;

  const fromFactor = from.factor ?? 1;
  const toFactor = to.factor ?? 1;
  if (toFactor === 0) return null;

  return fromFactor / toFactor;
}

/** True when "1 A = n B" describes the pair completely. */
export function hasSimpleRatio(from: UnitDefinition, to: UnitDefinition): boolean {
  return getConversionRatio(from, to) !== null;
}
