import {
  FOOT_IN_METERS,
  INCH_IN_METERS,
  KILOGRAM_FORCE_IN_NEWTONS,
  POUND_FORCE_IN_NEWTONS,
} from '../constants';
import { defineUnits } from '../define';

/**
 * Torque. Base unit: newton-metre.
 *
 * Torque shares its dimensions with energy but is a different quantity, so it
 * is a separate category. Convention writes torque as N·m or lbf·ft and energy
 * as J or ft·lbf.
 */
export const torqueUnits = defineUnits('torque', 'newton-meter', [
  {
    id: 'newton-meter',
    name: 'newton-meter',
    plural: 'newton-meters',
    symbol: 'N·m',
    aliases: ['newton metre', 'newton meters', 'nm', 'n-m', 'n m'],
    system: 'si',
    factor: 1,
    slug: 'newton-meters',
    seo: 'primary',
    description: 'The SI unit of torque: one newton applied at one metre from the axis.',
  },
  {
    id: 'kilonewton-meter',
    name: 'kilonewton-meter',
    plural: 'kilonewton-meters',
    symbol: 'kN·m',
    aliases: ['kilonewton meters', 'knm'],
    system: 'si',
    factor: 1000,
    slug: 'kilonewton-meters',
  },
  {
    id: 'millinewton-meter',
    name: 'millinewton-meter',
    plural: 'millinewton-meters',
    symbol: 'mN·m',
    aliases: ['millinewton meters', 'mnm'],
    system: 'si',
    factor: 0.001,
    slug: 'millinewton-meters',
  },
  {
    id: 'pound-foot',
    name: 'pound-foot',
    plural: 'pound-feet',
    symbol: 'lbf·ft',
    aliases: ['pound feet', 'foot pound torque', 'lb-ft', 'lbft', 'ft-lb torque', 'lbf ft'],
    system: 'imperial',
    factor: POUND_FORCE_IN_NEWTONS * FOOT_IN_METERS,
    slug: 'pound-feet',
    seo: 'primary',
    description: 'One pound-force applied at one foot from the axis. The US engine-torque unit.',
  },
  {
    id: 'pound-inch',
    name: 'pound-inch',
    plural: 'pound-inches',
    symbol: 'lbf·in',
    aliases: ['pound inches', 'inch pounds', 'in-lb', 'lb-in', 'lbf in'],
    system: 'imperial',
    factor: POUND_FORCE_IN_NEWTONS * INCH_IN_METERS,
    slug: 'pound-inches',
    seo: 'primary',
    description: 'Exactly one twelfth of a pound-foot. Used for small fasteners.',
  },
  {
    id: 'ounce-inch',
    name: 'ounce-inch',
    plural: 'ounce-inches',
    symbol: 'ozf·in',
    aliases: ['ounce inches', 'oz-in'],
    system: 'imperial',
    factor: (POUND_FORCE_IN_NEWTONS / 16) * INCH_IN_METERS,
    slug: 'ounce-inches',
    description: 'Used for small electric motor ratings.',
  },
  {
    id: 'kilogram-force-meter',
    name: 'kilogram-force meter',
    plural: 'kilogram-force meters',
    symbol: 'kgf·m',
    aliases: ['kilogram force meter', 'kgfm', 'kg-m', 'kgm'],
    system: 'metric',
    factor: KILOGRAM_FORCE_IN_NEWTONS,
    slug: 'kilogram-force-meters',
    seo: 'primary',
    description:
      'One kilogram-force applied at one metre. Common in Japanese vehicle specifications.',
  },
  {
    id: 'kilogram-force-centimeter',
    name: 'kilogram-force centimeter',
    plural: 'kilogram-force centimeters',
    symbol: 'kgf·cm',
    aliases: ['kilogram force centimeter', 'kg-cm', 'kgcm'],
    system: 'metric',
    factor: KILOGRAM_FORCE_IN_NEWTONS / 100,
    slug: 'kilogram-force-centimeters',
  },
  {
    id: 'dyne-centimeter',
    name: 'dyne-centimeter',
    plural: 'dyne-centimeters',
    symbol: 'dyn·cm',
    aliases: ['dyne centimeters', 'dyn cm'],
    system: 'cgs',
    factor: 1e-7,
    slug: 'dyne-centimeters',
  },
]);
