import {
  DYNE_IN_NEWTONS,
  KILOGRAM_FORCE_IN_NEWTONS,
  POUNDAL_IN_NEWTONS,
  POUND_FORCE_IN_NEWTONS,
} from '../constants';
import { defineUnits } from '../define';

/**
 * Force. Base unit: newton (SI).
 *
 * Pound-force lives here and pound-mass lives in the Weight category, with
 * distinct ids and explicit names. UNIT_CATALOG §4 calls out exactly this
 * ambiguity: the two are only numerically related through standard gravity.
 */
export const forceUnits = defineUnits('force', 'newton', [
  {
    id: 'newton',
    name: 'newton',
    symbol: 'N',
    aliases: ['newtons', 'n'],
    system: 'si',
    factor: 1,
    seo: 'primary',
    description: 'The SI derived unit of force: the force that accelerates 1 kg at 1 m/s².',
  },
  {
    id: 'kilonewton',
    name: 'kilonewton',
    symbol: 'kN',
    aliases: ['kilonewtons', 'kn'],
    system: 'si',
    factor: 1000,
    seo: 'primary',
    description: 'One thousand newtons. Used for structural loads.',
  },
  {
    id: 'meganewton',
    name: 'meganewton',
    symbol: 'MN',
    aliases: ['meganewtons'],
    system: 'si',
    factor: 1e6,
  },
  {
    id: 'millinewton',
    name: 'millinewton',
    symbol: 'mN',
    aliases: ['millinewtons'],
    system: 'si',
    factor: 0.001,
  },
  {
    id: 'pound-force',
    name: 'pound-force',
    plural: 'pounds-force',
    symbol: 'lbf',
    aliases: ['pound force', 'pounds force', 'lbf', 'lb-f'],
    system: 'imperial',
    factor: POUND_FORCE_IN_NEWTONS,
    slug: 'pounds-force',
    seo: 'primary',
    description:
      'The force exerted by one pound of mass under standard gravity: 4.4482216152605 N.',
    note: 'A force, not a mass. The pound of mass is in the Weight category.',
  },
  {
    id: 'kilogram-force',
    name: 'kilogram-force',
    plural: 'kilograms-force',
    symbol: 'kgf',
    aliases: ['kilogram force', 'kgf', 'kilopond', 'kp'],
    system: 'metric',
    factor: KILOGRAM_FORCE_IN_NEWTONS,
    slug: 'kilograms-force',
    seo: 'primary',
    description: 'The force exerted by one kilogram under standard gravity: exactly 9.80665 N.',
  },
  {
    id: 'gram-force',
    name: 'gram-force',
    plural: 'grams-force',
    symbol: 'gf',
    aliases: ['gram force', 'gf', 'pond'],
    system: 'metric',
    factor: KILOGRAM_FORCE_IN_NEWTONS / 1000,
    slug: 'grams-force',
  },
  {
    id: 'ounce-force',
    name: 'ounce-force',
    plural: 'ounces-force',
    symbol: 'ozf',
    aliases: ['ounce force', 'ozf'],
    system: 'imperial',
    factor: POUND_FORCE_IN_NEWTONS / 16,
    slug: 'ounces-force',
  },
  {
    id: 'dyne',
    name: 'dyne',
    symbol: 'dyn',
    aliases: ['dynes', 'dyn'],
    system: 'cgs',
    factor: DYNE_IN_NEWTONS,
    description: 'The CGS unit of force: exactly 10 micronewtons.',
  },
  {
    id: 'poundal',
    name: 'poundal',
    symbol: 'pdl',
    aliases: ['poundals', 'pdl'],
    system: 'imperial',
    factor: POUNDAL_IN_NEWTONS,
    description: 'The force that accelerates one pound of mass at 1 ft/s².',
  },
]);
