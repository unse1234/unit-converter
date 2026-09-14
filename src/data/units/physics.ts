import {
  CURIE_IN_BECQUERELS,
  FOOT_CANDLE_IN_LUX,
  GAUSS_IN_TESLA,
  PHOT_IN_LUX,
  RAD_IN_GRAYS,
  REM_IN_SIEVERTS,
  RUTHERFORD_IN_BECQUERELS,
} from '../constants';
import { defineUnits } from '../define';

/**
 * Magnetic flux density. Base unit: tesla (SI).
 */
export const magneticFieldUnits = defineUnits('magnetic-field', 'tesla', [
  {
    id: 'tesla',
    name: 'tesla',
    symbol: 'T',
    aliases: ['teslas', 't'],
    system: 'si',
    factor: 1,
    seo: 'primary',
    description: 'The SI derived unit of magnetic flux density. An MRI scanner runs at 1.5–3 T.',
  },
  {
    id: 'millitesla',
    name: 'millitesla',
    symbol: 'mT',
    aliases: ['milliteslas', 'mt'],
    system: 'si',
    factor: 0.001,
    seo: 'primary',
  },
  {
    id: 'microtesla',
    name: 'microtesla',
    symbol: 'µT',
    aliases: ['microteslas', 'ut', 'µt'],
    system: 'si',
    factor: 1e-6,
    slug: 'microteslas',
    description: "Earth's magnetic field is roughly 25–65 µT at the surface.",
  },
  {
    id: 'nanotesla',
    name: 'nanotesla',
    symbol: 'nT',
    aliases: ['nanoteslas', 'nt', 'gamma'],
    system: 'si',
    factor: 1e-9,
  },
  {
    id: 'gauss',
    name: 'gauss',
    plural: 'gauss',
    symbol: 'G',
    aliases: ['gauss', 'gs', 'g (gauss)'],
    system: 'cgs',
    factor: GAUSS_IN_TESLA,
    slug: 'gauss',
    seo: 'primary',
    description: 'The CGS unit of magnetic flux density: exactly 10⁻⁴ tesla.',
  },
]);

/**
 * Illuminance. Base unit: lux (SI).
 *
 * UNIT_CATALOG §3.29 groups candela, lumen and lux together, but they measure
 * three different physical quantities: luminous intensity (cd), luminous flux
 * (lm) and illuminance (lx). Converting between them requires a solid angle or
 * an illuminated area, which is not a unit conversion. Rather than invent a
 * factor, they are three categories, and the pages explain the relationship.
 */
export const illuminanceUnits = defineUnits('illuminance', 'lux', [
  {
    id: 'lux',
    name: 'lux',
    plural: 'lux',
    symbol: 'lx',
    aliases: ['lx', 'lumen per square meter', 'lm/m2'],
    system: 'si',
    factor: 1,
    slug: 'lux',
    seo: 'primary',
    description: 'The SI unit of illuminance: one lumen per square metre.',
  },
  {
    id: 'foot-candle',
    name: 'foot-candle',
    plural: 'foot-candles',
    symbol: 'fc',
    aliases: ['footcandle', 'foot candles', 'fc', 'lumen per square foot', 'lm/ft2'],
    system: 'imperial',
    factor: FOOT_CANDLE_IN_LUX,
    slug: 'foot-candles',
    seo: 'primary',
    description: 'One lumen per square foot: about 10.764 lux. The US lighting-design unit.',
  },
  {
    id: 'phot',
    name: 'phot',
    symbol: 'ph',
    aliases: ['phots', 'ph'],
    system: 'cgs',
    factor: PHOT_IN_LUX,
    description: 'The CGS unit of illuminance: exactly 10,000 lux.',
  },
  {
    id: 'kilolux',
    name: 'kilolux',
    plural: 'kilolux',
    symbol: 'klx',
    aliases: ['klx'],
    system: 'si',
    factor: 1000,
    slug: 'kilolux',
    description: 'One thousand lux. Direct sunlight is about 100 klx.',
  },
]);

/** Luminous intensity. Base unit: candela (SI). */
export const luminousIntensityUnits = defineUnits('luminous-intensity', 'candela', [
  {
    id: 'candela',
    name: 'candela',
    symbol: 'cd',
    aliases: ['candelas', 'cd'],
    system: 'si',
    factor: 1,
    seo: 'primary',
    description: 'The SI base unit of luminous intensity: luminous power per unit solid angle.',
  },
  {
    id: 'millicandela',
    name: 'millicandela',
    symbol: 'mcd',
    aliases: ['millicandelas', 'mcd'],
    system: 'si',
    factor: 0.001,
    seo: 'primary',
    description: 'One thousandth of a candela. The usual rating unit for indicator LEDs.',
  },
  {
    id: 'kilocandela',
    name: 'kilocandela',
    symbol: 'kcd',
    aliases: ['kilocandelas', 'kcd'],
    system: 'si',
    factor: 1000,
  },
  {
    id: 'candlepower',
    name: 'candlepower',
    plural: 'candlepower',
    symbol: 'cp',
    aliases: ['candle power', 'cp'],
    system: 'other',
    factor: 1,
    slug: 'candlepower',
    description: 'A historical unit, taken as equal to the candela in modern usage.',
    note: 'Older candlepower standards differed by a few percent; modern usage treats 1 cp as 1 cd.',
  },
]);

/** Luminous flux. Base unit: lumen (SI). */
export const luminousFluxUnits = defineUnits('luminous-flux', 'lumen', [
  {
    id: 'lumen',
    name: 'lumen',
    symbol: 'lm',
    aliases: ['lumens', 'lm'],
    system: 'si',
    factor: 1,
    seo: 'primary',
    description: 'The SI unit of luminous flux: total visible light emitted by a source.',
  },
  {
    id: 'kilolumen',
    name: 'kilolumen',
    symbol: 'klm',
    aliases: ['kilolumens', 'klm'],
    system: 'si',
    factor: 1000,
    seo: 'primary',
    description: 'One thousand lumens. Projector brightness is often quoted in kilolumens.',
  },
  {
    id: 'millilumen',
    name: 'millilumen',
    symbol: 'mlm',
    aliases: ['millilumens'],
    system: 'si',
    factor: 0.001,
  },
]);

/** Radioactivity. Base unit: becquerel (SI). */
export const radioactivityUnits = defineUnits('radioactivity', 'becquerel', [
  {
    id: 'becquerel',
    name: 'becquerel',
    symbol: 'Bq',
    aliases: ['becquerels', 'bq'],
    system: 'si',
    factor: 1,
    seo: 'primary',
    description: 'The SI unit of radioactivity: one nuclear decay per second.',
  },
  {
    id: 'kilobecquerel',
    name: 'kilobecquerel',
    symbol: 'kBq',
    aliases: ['kilobecquerels', 'kbq'],
    system: 'si',
    factor: 1000,
  },
  {
    id: 'megabecquerel',
    name: 'megabecquerel',
    symbol: 'MBq',
    aliases: ['megabecquerels', 'mbq'],
    system: 'si',
    factor: 1e6,
    seo: 'primary',
  },
  {
    id: 'gigabecquerel',
    name: 'gigabecquerel',
    symbol: 'GBq',
    aliases: ['gigabecquerels', 'gbq'],
    system: 'si',
    factor: 1e9,
  },
  {
    id: 'curie',
    name: 'curie',
    symbol: 'Ci',
    aliases: ['curies', 'ci'],
    system: 'other',
    factor: CURIE_IN_BECQUERELS,
    seo: 'primary',
    description: 'The legacy unit of radioactivity: exactly 3.7 × 10¹⁰ becquerels.',
  },
  {
    id: 'millicurie',
    name: 'millicurie',
    symbol: 'mCi',
    aliases: ['millicuries', 'mci'],
    system: 'other',
    factor: CURIE_IN_BECQUERELS / 1000,
  },
  {
    id: 'microcurie',
    name: 'microcurie',
    symbol: 'µCi',
    aliases: ['microcuries', 'uci'],
    system: 'other',
    factor: CURIE_IN_BECQUERELS / 1e6,
    slug: 'microcuries',
  },
  {
    id: 'rutherford',
    name: 'rutherford',
    symbol: 'Rd',
    aliases: ['rutherfords', 'rd'],
    system: 'other',
    factor: RUTHERFORD_IN_BECQUERELS,
    description: 'An obsolete unit equal to exactly one megabecquerel.',
  },
]);

/**
 * Absorbed radiation dose. Base unit: gray (SI).
 *
 * Kept separate from equivalent dose. Gray and sievert have the same dimensions
 * (J/kg) but measure different things: converting absorbed dose to equivalent
 * dose requires a radiation weighting factor that depends on the radiation
 * type, so it is not a fixed conversion and is not offered as one.
 */
export const absorbedDoseUnits = defineUnits('radiation-absorbed-dose', 'gray', [
  {
    id: 'gray',
    name: 'gray',
    symbol: 'Gy',
    aliases: ['grays', 'gy'],
    system: 'si',
    factor: 1,
    seo: 'primary',
    description: 'The SI unit of absorbed dose: one joule of radiation energy per kilogram.',
  },
  {
    id: 'milligray',
    name: 'milligray',
    symbol: 'mGy',
    aliases: ['milligrays', 'mgy'],
    system: 'si',
    factor: 0.001,
    seo: 'primary',
  },
  {
    id: 'microgray',
    name: 'microgray',
    symbol: 'µGy',
    aliases: ['micrograys', 'ugy'],
    system: 'si',
    factor: 1e-6,
    slug: 'micrograys',
  },
  {
    id: 'rad',
    name: 'rad',
    symbol: 'rad',
    aliases: ['rads', 'radiation absorbed dose'],
    system: 'other',
    factor: RAD_IN_GRAYS,
    seo: 'primary',
    description: 'The legacy unit of absorbed dose: exactly 0.01 gray.',
    note: 'Unrelated to the radian, the unit of angle.',
  },
  {
    id: 'millirad',
    name: 'millirad',
    symbol: 'mrad',
    aliases: ['millirads'],
    system: 'other',
    factor: RAD_IN_GRAYS / 1000,
  },
]);

/** Equivalent radiation dose. Base unit: sievert (SI). */
export const equivalentDoseUnits = defineUnits('radiation-equivalent-dose', 'sievert', [
  {
    id: 'sievert',
    name: 'sievert',
    symbol: 'Sv',
    aliases: ['sieverts', 'sv'],
    system: 'si',
    factor: 1,
    seo: 'primary',
    description: 'The SI unit of equivalent dose: absorbed dose weighted for biological effect.',
  },
  {
    id: 'millisievert',
    name: 'millisievert',
    symbol: 'mSv',
    aliases: ['millisieverts', 'msv'],
    system: 'si',
    factor: 0.001,
    seo: 'primary',
    description: 'One thousandth of a sievert. A chest X-ray is roughly 0.1 mSv.',
  },
  {
    id: 'microsievert',
    name: 'microsievert',
    symbol: 'µSv',
    aliases: ['microsieverts', 'usv', 'µsv'],
    system: 'si',
    factor: 1e-6,
    slug: 'microsieverts',
    seo: 'primary',
  },
  {
    id: 'rem',
    name: 'rem',
    symbol: 'rem',
    aliases: ['rems', 'roentgen equivalent man'],
    system: 'other',
    factor: REM_IN_SIEVERTS,
    seo: 'primary',
    description: 'The legacy unit of equivalent dose: exactly 0.01 sievert.',
  },
  {
    id: 'millirem',
    name: 'millirem',
    symbol: 'mrem',
    aliases: ['millirems', 'mrem'],
    system: 'other',
    factor: REM_IN_SIEVERTS / 1000,
    seo: 'primary',
  },
]);
