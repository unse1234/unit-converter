import { IMPERIAL_GALLON_IN_LITERS, MILE_IN_KILOMETERS, US_GALLON_IN_LITERS } from '../constants';
import { defineUnits } from '../define';

/**
 * Fuel economy. Base unit: kilometre per litre.
 *
 * This category mixes two opposite quantities. Distance-per-volume units
 * (km/L, mpg) are linear against the base. Volume-per-distance units
 * (L/100 km, gal/100 mi) are *inverse*: doubling the value halves the economy.
 * Those are declared `custom` and resolved by named functions in the engine's
 * custom registry, which UNIT_CATALOG §3.18 requires. A treating-them-as-linear
 * shortcut would silently produce wrong numbers.
 *
 * Zero is rejected rather than approximated: a car that consumes 0 L/100 km has
 * no finite fuel economy, and the engine surfaces that as an error.
 */
export const fuelEconomyUnits = defineUnits('fuel-economy', 'kilometer-per-liter', [
  {
    id: 'kilometer-per-liter',
    name: 'kilometer per liter',
    plural: 'kilometers per liter',
    symbol: 'km/L',
    aliases: ['kilometres per litre', 'kilometers per liter', 'km/l', 'kmpl', 'kpl'],
    system: 'metric',
    factor: 1,
    slug: 'kilometers-per-liter',
    seo: 'primary',
    description: 'Distance travelled per litre of fuel. Higher is better.',
  },
  {
    id: 'liters-per-100-kilometers',
    name: 'liter per 100 kilometers',
    plural: 'liters per 100 kilometers',
    symbol: 'L/100 km',
    aliases: [
      'litres per 100 km',
      'liters per 100 km',
      'l/100km',
      'l/100 km',
      'lp100km',
      'fuel consumption',
    ],
    system: 'metric',
    customKey: 'litersPer100Kilometers',
    slug: 'liters-per-100-kilometers',
    seo: 'primary',
    description: 'Fuel used to travel 100 kilometres. Lower is better. The European standard.',
    note: 'An inverse measure: 5 L/100 km is twice as efficient as 10 L/100 km, not half.',
  },
  {
    id: 'miles-per-us-gallon',
    name: 'mile per US gallon',
    plural: 'miles per US gallon',
    symbol: 'mpg (US)',
    aliases: ['mpg', 'miles per gallon', 'us mpg', 'mpg us', 'miles per us gallon'],
    system: 'us',
    factor: MILE_IN_KILOMETERS / US_GALLON_IN_LITERS,
    slug: 'miles-per-us-gallon',
    seo: 'primary',
    description: 'Distance per US gallon. The US fuel-economy standard.',
    note: 'US mpg figures are about 17% lower than imperial mpg for the same car, because the US gallon is smaller.',
  },
  {
    id: 'miles-per-imperial-gallon',
    name: 'mile per imperial gallon',
    plural: 'miles per imperial gallon',
    symbol: 'mpg (imp)',
    aliases: ['imperial mpg', 'uk mpg', 'miles per imperial gallon', 'mpg imp'],
    system: 'imperial',
    factor: MILE_IN_KILOMETERS / IMPERIAL_GALLON_IN_LITERS,
    slug: 'miles-per-imperial-gallon',
    seo: 'primary',
    description: 'Distance per imperial gallon. The UK fuel-economy standard.',
  },
  {
    id: 'miles-per-liter',
    name: 'mile per liter',
    plural: 'miles per liter',
    symbol: 'mi/L',
    aliases: ['miles per litre', 'miles per liter', 'mi/l'],
    system: 'other',
    factor: MILE_IN_KILOMETERS,
    slug: 'miles-per-liter',
  },
  {
    id: 'us-gallons-per-100-miles',
    name: 'US gallon per 100 miles',
    plural: 'US gallons per 100 miles',
    symbol: 'gal/100 mi',
    aliases: ['gallons per 100 miles', 'gal/100mi', 'gphm'],
    system: 'us',
    customKey: 'usGallonsPer100Miles',
    slug: 'us-gallons-per-100-miles',
    description: 'Fuel used per 100 miles. Lower is better. Shown on US window stickers.',
    note: 'An inverse measure, like L/100 km.',
  },
  {
    id: 'kilometers-per-us-gallon',
    name: 'kilometer per US gallon',
    plural: 'kilometers per US gallon',
    symbol: 'km/gal',
    aliases: ['kilometers per gallon', 'km/gal'],
    system: 'other',
    factor: 1 / US_GALLON_IN_LITERS,
    slug: 'kilometers-per-us-gallon',
  },
]);
