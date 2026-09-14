import {
  IMPERIAL_GALLON_IN_LITERS,
  MILE_IN_KILOMETERS,
  US_GALLON_IN_LITERS,
} from '@/data/constants';

/**
 * Named conversion functions for units that are not linear or affine.
 *
 * Unit records stay serialisable so a server component can hand a client
 * component exactly the units it needs. Non-linear behaviour therefore lives
 * here, keyed by `customKey`, rather than as functions on the data.
 *
 * Each entry converts to and from the category's base unit. Every function must
 * be a true inverse of its partner, which the unit tests assert by round-trip.
 */
export interface CustomConversion {
  /** Converts a value in this unit into the category base unit. */
  toBase: (value: number) => number;
  /** Converts a value in the category base unit into this unit. */
  fromBase: (value: number) => number;
  /** Human-readable formula, rendered on conversion pages. */
  describe: (baseUnitSymbol: string) => string;
}

/** Kilometres per litre travelled, given litres consumed per 100 kilometres. */
const litersPer100Kilometers: CustomConversion = {
  toBase: (value) => 100 / value,
  fromBase: (base) => 100 / base,
  describe: () => 'km/L = 100 ÷ (L/100 km)',
};

/** Kilometres per litre, given US gallons consumed per 100 miles. */
const usGallonsPer100Miles: CustomConversion = {
  toBase: (value) => (100 / value) * (MILE_IN_KILOMETERS / US_GALLON_IN_LITERS),
  fromBase: (base) => 100 / (base * (US_GALLON_IN_LITERS / MILE_IN_KILOMETERS)),
  describe: () => 'km/L = (100 ÷ gal/100 mi) × 1.609344 ÷ 3.785411784',
};

/** Kilometres per litre, given imperial gallons consumed per 100 miles. */
const imperialGallonsPer100Miles: CustomConversion = {
  toBase: (value) => (100 / value) * (MILE_IN_KILOMETERS / IMPERIAL_GALLON_IN_LITERS),
  fromBase: (base) => 100 / (base * (IMPERIAL_GALLON_IN_LITERS / MILE_IN_KILOMETERS)),
  describe: () => 'km/L = (100 ÷ imp gal/100 mi) × 1.609344 ÷ 4.54609',
};

export const customConversions: Record<string, CustomConversion> = {
  litersPer100Kilometers,
  usGallonsPer100Miles,
  imperialGallonsPer100Miles,
};

export function getCustomConversion(key: string): CustomConversion | undefined {
  return customConversions[key];
}
