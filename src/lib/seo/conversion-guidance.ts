import type { UnitDefinition } from '@/types/units';

export interface ConversionSource {
  title: string;
  url: string;
}

export interface CategoryGuidance {
  guidance: string[];
  sources: ConversionSource[];
}

const SI: ConversionSource = {
  title: 'BIPM: International System of Units (SI Brochure)',
  url: 'https://www.bipm.org/en/publications/si-brochure',
};
const NIST: ConversionSource = {
  title: 'NIST SP 811: conversion factors by quantity',
  url: 'https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b9',
};
const NIST_NOTES: ConversionSource = {
  title: 'NIST SP 811: definitions and conversion-factor footnotes',
  url: 'https://www.nist.gov/pml/special-publication-811/nist-guide-si-footnotes',
};
const BINARY: ConversionSource = {
  title: 'NIST: prefixes for binary multiples',
  url: 'https://physics.nist.gov/cuu/Units/binary.html',
};
const CSS: ConversionSource = {
  title: 'W3C: CSS absolute length units',
  url: 'https://www.w3.org/TR/css-values-3/#absolute-lengths',
};
const CALENDAR: ConversionSource = {
  title: 'NIST: Gregorian and Julian year lengths',
  url: 'https://www.nist.gov/pml/time-and-frequency-division/popular-links/time-frequency-z/time-and-frequency-z-x-z',
};

/** Reviewed quantity-specific guidance; no fallback paragraph for unreviewed categories. */
const CATEGORY_GUIDANCE: Record<string, CategoryGuidance> = {
  length: {
    guidance: [
      'Feet, inches, yards and miles use the international foot (0.3048 m). Older US survey-foot records use a different definition; check the survey document before applying these factors.',
    ],
    sources: [NIST, NIST_NOTES],
  },
  mass: {
    guidance: [
      'These units measure mass. Pounds and ounces mean avoirdupois unless the unit explicitly says troy; a fluid ounce measures volume and requires a density to relate it to mass.',
    ],
    sources: [NIST, NIST_NOTES],
  },
  temperature: {
    guidance: [
      'These formulas convert temperature readings. For a temperature difference, use only the scale factor: do not add or subtract the zero-point offset.',
    ],
    sources: [SI, NIST],
  },
  volume: {
    guidance: [
      'Choose the named US, Imperial or metric unit before converting a recipe or container size. A US liquid gallon is 3.785411784 L; an Imperial gallon is 4.54609 L. Volume alone cannot give ingredient mass without density.',
    ],
    sources: [NIST, NIST_NOTES],
  },
  area: {
    guidance: [
      'Area factors are squared length factors: 1 ft² = (0.3048 m)². The acre here uses international feet; historic US survey acres differ slightly.',
    ],
    sources: [NIST, NIST_NOTES],
  },
  speed: {
    guidance: [
      'Speed combines distance and elapsed time. Knots use the international nautical mile (1852 m), and mph uses the international statute mile (1609.344 m).',
    ],
    sources: [NIST, NIST_NOTES],
  },
  time: {
    guidance: [
      'A day here is a duration of 86,400 seconds. Unless explicitly labeled Julian, months and years use the mean Gregorian convention (365.2425 days per year; one twelfth per month), rather than the actual length of a particular calendar interval.',
    ],
    sources: [SI, CALENDAR],
  },
  'digital-storage': {
    guidance: [
      'Lowercase b means bit; uppercase B means byte (8 bits). Decimal kB, MB and GB use powers of 1000; binary KiB, MiB and GiB use powers of 1024. Choose the label that matches the source measurement.',
    ],
    sources: [BINARY],
  },
  energy: {
    guidance: [
      'Calories here are thermochemical (4.184 J), while BTU uses the International Table definition. A kilowatt-hour is energy (3.6 MJ), not power; a food Calorie is a kilocalorie.',
    ],
    sources: [NIST, NIST_NOTES, SI],
  },
  power: {
    guidance: [
      'Power is energy transferred per time: 1 W = 1 J/s. Mechanical, metric and electrical horsepower have different definitions; select the version stated on the equipment rating.',
    ],
    sources: [NIST, SI],
  },
  pressure: {
    guidance: [
      'Unit conversion preserves the pressure reference. Gauge pressure and absolute pressure are different readings; changing between them also needs the ambient pressure. Mercury and water-column units use the conventions stated in their unit notes.',
    ],
    sources: [NIST, NIST_NOTES],
  },
  'data-transfer-rate': {
    guidance: [
      'A byte per second is eight bits per second. Decimal Mbps and MB/s use powers of 1000; MiB/s uses a binary prefix. These are equivalent nominal rates; protocol overhead and network conditions affect achieved file-transfer speed.',
    ],
    sources: [BINARY, SI],
  },
  'fuel-economy': {
    guidance: [
      'Distance per fuel (mpg or km/L) increases with economy; fuel per distance (L/100 km) decreases. Converting between these forms is reciprocal, requires a positive value and depends on whether a gallon is US or Imperial.',
    ],
    sources: [
      {
        title: 'NIST SP 811, B.5: fuel economy and fuel consumption',
        url: 'https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors',
      },
      NIST,
    ],
  },
  angle: {
    guidance: [
      'One full turn is 360° = 2π rad = 400 gon. A minute or second of arc is an angular unit, distinct from time; decimal displays of factors involving π are approximate.',
    ],
    sources: [SI, NIST],
  },
  frequency: {
    guidance: [
      'Hertz counts complete cycles per second. This converter treats one revolution as one cycle, so 60 rpm = 1 Hz; angular frequency in radians per second would additionally involve 2π.',
    ],
    sources: [SI, NIST],
  },
  force: {
    guidance: [
      'Force is distinct from mass. Kilogram-force and pound-force use standard gravity, 9.80665 m/s²; calculating the weight of an actual mass at a location requires that location’s acceleration due to gravity.',
    ],
    sources: [NIST, NIST_NOTES],
  },
  torque: {
    guidance: [
      'Pound-foot and pound-inch here use pound-force. Although torque and energy share dimensions, torque describes a turning effect; these values do not become energy values without an angular displacement.',
    ],
    sources: [SI, NIST],
  },
  acceleration: {
    guidance: [
      'The g unit here means standard gravity, exactly 9.80665 m/s². It is a fixed reference, rather than the changing local gravitational acceleration.',
    ],
    sources: [NIST, NIST_NOTES],
  },
  density: {
    guidance: [
      'Density is mass divided by volume. Converting its units does not change the substance, temperature or pressure; converting a mass to a volume separately requires a density appropriate to those conditions.',
    ],
    sources: [SI, NIST],
  },
  'flow-rate': {
    guidance: [
      'These are volumetric flow rates. US and Imperial gallons per minute differ; gas volumes quoted at standard conditions also need their reference temperature and pressure before comparison with actual flow.',
    ],
    sources: [NIST],
  },
  'electric-current': {
    guidance: [
      'Milli means one thousandth and micro means one millionth of an ampere. Changing the unit does not convert an AC peak reading to RMS or an average reading; preserve the measurement convention.',
    ],
    sources: [SI],
  },
  voltage: {
    guidance: [
      'Voltage prefixes scale the same electric potential difference. A unit conversion preserves whether the reported voltage is RMS, peak, peak-to-peak or DC.',
    ],
    sources: [SI],
  },
  resistance: {
    guidance: [
      'Resistance units scale ohms (Ω = V/A). Conductance is the reciprocal quantity, measured in siemens; converting ohms to siemens requires taking a reciprocal rather than changing a prefix.',
    ],
    sources: [SI],
  },
  capacitance: {
    guidance: [
      'Capacitance is charge stored per potential difference: 1 F = 1 C/V. The microfarad, nanofarad and picofarad differ by factors of 1000; these unit changes preserve the component’s stated tolerance.',
    ],
    sources: [SI],
  },
  inductance: {
    guidance: [
      'Inductance is measured in henries (H = V·s/A). A millihenry is 1000 microhenries; this scales the rating without changing the current or frequency conditions under which it was measured.',
    ],
    sources: [SI],
  },
  'electric-charge': {
    guidance: [
      'Charge is current integrated over time: 1 Ah = 3600 C. Battery mAh is a charge rating; converting it to Wh additionally requires voltage and is not a charge-unit conversion.',
    ],
    sources: [SI, NIST],
  },
  conductance: {
    guidance: [
      'Conductance uses siemens (S = A/V), the reciprocal of ohms. Conductivity in S/m or µS/cm includes a length dimension and cannot be obtained from conductance alone without cell geometry.',
    ],
    sources: [SI],
  },
  'magnetic-field': {
    guidance: [
      'This category converts magnetic flux density B, in tesla or gauss: 1 G = 10⁻⁴ T. Magnetic field strength H, often stated in A/m or oersted, is a different quantity and requires material information to relate to B.',
    ],
    sources: [SI, NIST],
  },
  illuminance: {
    guidance: [
      'Illuminance is luminous flux arriving per surface area: 1 lx = 1 lm/m². Converting lux to lumens requires an area and a model of how the light is distributed.',
    ],
    sources: [SI, NIST],
  },
  'luminous-intensity': {
    guidance: [
      'Candela measures luminous intensity in a direction. Converting it to lumens requires a solid angle and the angular distribution of the source; it is not the same conversion as cd to mcd.',
    ],
    sources: [SI],
  },
  'luminous-flux': {
    guidance: [
      'Lumens measure total luminous flux. Lux measures flux per area and candela measures flux per solid angle; neither can be calculated from lumens alone without additional geometry.',
    ],
    sources: [SI],
  },
  radioactivity: {
    guidance: [
      'Activity counts decays: 1 Bq = 1 decay/s and 1 Ci = 3.7 × 10¹⁰ Bq. Activity alone does not determine absorbed or equivalent dose; the radionuclide, exposure pathway and geometry also matter.',
    ],
    sources: [SI, NIST],
  },
  'radiation-absorbed-dose': {
    guidance: [
      'Absorbed dose is deposited energy per mass: 1 Gy = 1 J/kg and 1 rad = 0.01 Gy. Converting to sieverts requires radiation weighting information, rather than a universal unit factor.',
    ],
    sources: [SI, NIST],
  },
  'radiation-equivalent-dose': {
    guidance: [
      'Sieverts and rem express weighted radiation dose: 1 rem = 0.01 Sv. This page changes units only; it does not determine weighting factors, effective dose or health risk from an absorbed dose.',
    ],
    sources: [SI, NIST],
  },
};

export function getCategoryGuidance(categoryId: string): CategoryGuidance {
  return CATEGORY_GUIDANCE[categoryId] ?? { guidance: [], sources: [] };
}

/** Sources shared with translated pages; guidance remains authored English. */
export function getConversionGuidance(from: UnitDefinition, to: UnitDefinition): CategoryGuidance {
  const category = getCategoryGuidance(from.category);
  const sources = [...category.sources];
  const ids = [from.id, to.id];
  if (ids.some((id) => ['pixel', 'point', 'pica', 'twip'].includes(id))) sources.push(CSS);
  if (ids.includes('atomic-mass-unit'))
    sources.push({
      title: 'NIST CODATA 2022: fundamental physical constants',
      url: 'https://physics.nist.gov/cuu/Constants/Table/allascii.txt',
    });
  return { guidance: category.guidance, sources };
}

/** Ignore arithmetic noise, but label genuine display rounding as approximate. */
export function displayRelation(value: number, digits = 9): '=' | '≈' {
  const rounded = Number(value.toPrecision(digits));
  return Math.abs(rounded - value) <= Math.abs(value) * 5e-15 ? '=' : '≈';
}

export const CONVERSION_PRECISION_NOTE =
  'Table results are rounded to 8 significant digits; formula constants may be rounded to 10. Worked example answers use 6 significant digits. The converter starts at 6 significant digits and lets you change display precision. Calculations use the stored factors without intermediate rounding. Exact unit definitions do not make an input measurement more precise; conventional and measured factors follow the assumptions stated here.';
