/**
 * Authoritative conversion constants.
 *
 * UNIT_CATALOG §4 requires every constant to carry its source. Values marked
 * "exact" are definitions, not measurements, and must never be rounded here —
 * rounding is a display concern handled by the formatter.
 *
 * Sources:
 *  - BIPM, The International System of Units (SI Brochure, 9th ed., 2019)
 *  - International Yard and Pound Agreement (1959)
 *  - NIST Special Publication 811 (2008), Appendix B.9
 *  - ISO 80000-3 (space and time), ISO 80000-4 (mechanics)
 *  - IAU 2012 Resolution B2 (astronomical unit)
 *  - IEC 80000-13 (binary prefixes)
 *  - ICAO Standard Atmosphere, Doc 7488 (Mach reference speed)
 */

/* -------------------------------------------------------------------------- */
/* Length                                                                      */
/* -------------------------------------------------------------------------- */

/** Exact by the 1959 International Yard and Pound Agreement. */
export const INCH_IN_METERS = 0.0254;
export const FOOT_IN_METERS = 0.3048;
export const YARD_IN_METERS = 0.9144;
export const MILE_IN_METERS = 1609.344;

/** Exact by international agreement (BIPM); 1 nmi = 1852 m. */
export const NAUTICAL_MILE_IN_METERS = 1852;

/** Exact: 1 furlong = 220 yd, 1 chain = 22 yd, 1 rod = 5.5 yd. */
export const FURLONG_IN_METERS = 220 * YARD_IN_METERS;
export const CHAIN_IN_METERS = 22 * YARD_IN_METERS;
export const ROD_IN_METERS = 5.5 * YARD_IN_METERS;
export const FATHOM_IN_METERS = 2 * YARD_IN_METERS;

/** DTP point = 1/72 in exactly; pica = 12 points; CSS pixel = 1/96 in. */
export const POINT_IN_METERS = INCH_IN_METERS / 72;
export const PICA_IN_METERS = INCH_IN_METERS / 6;
export const CSS_PIXEL_IN_METERS = INCH_IN_METERS / 96;
/** Twip = 1/20 point, used by legacy word processors and Office formats. */
export const TWIP_IN_METERS = POINT_IN_METERS / 20;

/** Exact by IAU 2012 Resolution B2. */
export const ASTRONOMICAL_UNIT_IN_METERS = 149597870700;
/** Exact: Julian year (365.25 d) x speed of light in vacuum (299792458 m/s). */
export const LIGHT_YEAR_IN_METERS = 9460730472580800;
/** Exact by IAU definition: 1 pc = (648000/pi) au. */
export const PARSEC_IN_METERS = (ASTRONOMICAL_UNIT_IN_METERS * 648000) / Math.PI;

/* -------------------------------------------------------------------------- */
/* Mass                                                                        */
/* -------------------------------------------------------------------------- */

/** Exact by the 1959 International Yard and Pound Agreement (avoirdupois). */
export const POUND_IN_KILOGRAMS = 0.45359237;
export const OUNCE_IN_KILOGRAMS = POUND_IN_KILOGRAMS / 16;
export const GRAIN_IN_KILOGRAMS = POUND_IN_KILOGRAMS / 7000;
export const STONE_IN_KILOGRAMS = 14 * POUND_IN_KILOGRAMS;
export const SHORT_TON_IN_KILOGRAMS = 2000 * POUND_IN_KILOGRAMS;
export const LONG_TON_IN_KILOGRAMS = 2240 * POUND_IN_KILOGRAMS;
/** Metric carat, exact: 200 mg (CGPM 1907). */
export const CARAT_IN_KILOGRAMS = 0.0002;
/** Troy ounce, exact: 31.1034768 g (used for precious metals). */
export const TROY_OUNCE_IN_KILOGRAMS = 0.0311034768;
export const TROY_POUND_IN_KILOGRAMS = 12 * TROY_OUNCE_IN_KILOGRAMS;
/** Atomic mass unit, CODATA 2018 recommended value. */
export const ATOMIC_MASS_UNIT_IN_KILOGRAMS = 1.6605390666e-27;

/* -------------------------------------------------------------------------- */
/* Area                                                                        */
/* -------------------------------------------------------------------------- */

/** Exact: 1 acre = 4840 square yards. */
export const ACRE_IN_SQUARE_METERS = 4840 * YARD_IN_METERS * YARD_IN_METERS;
/** Exact: 1 ha = 10 000 m^2. */
export const HECTARE_IN_SQUARE_METERS = 10000;
export const ARE_IN_SQUARE_METERS = 100;

/* -------------------------------------------------------------------------- */
/* Volume                                                                      */
/* -------------------------------------------------------------------------- */

/** Exact: 1 US liquid gallon = 231 in^3. */
export const US_GALLON_IN_CUBIC_METERS = 231 * INCH_IN_METERS ** 3;
/** Exact by UK Weights and Measures Act 1985: 1 imp gal = 4.54609 L. */
export const IMPERIAL_GALLON_IN_CUBIC_METERS = 0.00454609;

export const US_QUART_IN_CUBIC_METERS = US_GALLON_IN_CUBIC_METERS / 4;
export const US_PINT_IN_CUBIC_METERS = US_GALLON_IN_CUBIC_METERS / 8;
export const US_CUP_IN_CUBIC_METERS = US_GALLON_IN_CUBIC_METERS / 16;
export const US_FLUID_OUNCE_IN_CUBIC_METERS = US_GALLON_IN_CUBIC_METERS / 128;
export const US_TABLESPOON_IN_CUBIC_METERS = US_FLUID_OUNCE_IN_CUBIC_METERS / 2;
export const US_TEASPOON_IN_CUBIC_METERS = US_FLUID_OUNCE_IN_CUBIC_METERS / 6;

export const IMPERIAL_QUART_IN_CUBIC_METERS = IMPERIAL_GALLON_IN_CUBIC_METERS / 4;
export const IMPERIAL_PINT_IN_CUBIC_METERS = IMPERIAL_GALLON_IN_CUBIC_METERS / 8;
export const IMPERIAL_FLUID_OUNCE_IN_CUBIC_METERS = IMPERIAL_GALLON_IN_CUBIC_METERS / 160;
/** Imperial tablespoon = 5/8 imperial fluid ounce. */
export const IMPERIAL_TABLESPOON_IN_CUBIC_METERS = IMPERIAL_FLUID_OUNCE_IN_CUBIC_METERS * 0.625;

/** US "legal" cup used on nutrition labels (FDA 21 CFR 101.9): exactly 240 mL. */
export const US_LEGAL_CUP_IN_CUBIC_METERS = 0.00024;
/** Metric cup (AU/NZ/CA recipe standard): exactly 250 mL. */
export const METRIC_CUP_IN_CUBIC_METERS = 0.00025;
/** Metric tablespoon: exactly 15 mL. Australian tablespoon: exactly 20 mL. */
export const METRIC_TABLESPOON_IN_CUBIC_METERS = 0.000015;
export const AUSTRALIAN_TABLESPOON_IN_CUBIC_METERS = 0.00002;
/** Metric teaspoon: exactly 5 mL. */
export const METRIC_TEASPOON_IN_CUBIC_METERS = 0.000005;

/** Oil barrel, exact: 42 US gallons. */
export const OIL_BARREL_IN_CUBIC_METERS = 42 * US_GALLON_IN_CUBIC_METERS;

/* -------------------------------------------------------------------------- */
/* Time                                                                        */
/* -------------------------------------------------------------------------- */

export const MINUTE_IN_SECONDS = 60;
export const HOUR_IN_SECONDS = 3600;
export const DAY_IN_SECONDS = 86400;
export const WEEK_IN_SECONDS = 7 * DAY_IN_SECONDS;
/**
 * Mean Gregorian year: 365.2425 days. Calendar years are 365 or 366 days, so
 * this is an average, not a fixed SI quantity. Disclosed on the unit (see
 * UNIT_CATALOG §3.7) rather than presented as exact.
 */
export const GREGORIAN_YEAR_IN_SECONDS = 365.2425 * DAY_IN_SECONDS;
/** Mean Gregorian month = year / 12 = 30.436875 days. Also an average. */
export const MONTH_IN_SECONDS = GREGORIAN_YEAR_IN_SECONDS / 12;
/** Julian year, exactly 365.25 days. Used in astronomy. */
export const JULIAN_YEAR_IN_SECONDS = 365.25 * DAY_IN_SECONDS;
/** Fortnight = 14 days. */
export const FORTNIGHT_IN_SECONDS = 14 * DAY_IN_SECONDS;

/* -------------------------------------------------------------------------- */
/* Speed                                                                       */
/* -------------------------------------------------------------------------- */

export const KNOT_IN_METERS_PER_SECOND = NAUTICAL_MILE_IN_METERS / HOUR_IN_SECONDS;
/**
 * Mach 1 is not a fixed speed: it tracks the local speed of sound, which
 * depends on temperature. This is the ICAO Standard Atmosphere value at sea
 * level and 15 degrees Celsius (340.29 m/s). The dependence is disclosed in the
 * unit note and in page content.
 */
export const MACH_AT_SEA_LEVEL_IN_METERS_PER_SECOND = 340.29;
/** Speed of light in vacuum, exact by SI definition. */
export const SPEED_OF_LIGHT_IN_METERS_PER_SECOND = 299792458;

/* -------------------------------------------------------------------------- */
/* Force, pressure, energy, power                                              */
/* -------------------------------------------------------------------------- */

/** Standard gravity, exact by CGPM 1901: 9.80665 m/s^2. */
export const STANDARD_GRAVITY = 9.80665;
/** Exact: 1 lbf = 0.45359237 kg x 9.80665 m/s^2. */
export const POUND_FORCE_IN_NEWTONS = POUND_IN_KILOGRAMS * STANDARD_GRAVITY;
export const KILOGRAM_FORCE_IN_NEWTONS = STANDARD_GRAVITY;
/** Exact: 1 dyn = 1e-5 N. */
export const DYNE_IN_NEWTONS = 1e-5;
export const POUNDAL_IN_NEWTONS = POUND_IN_KILOGRAMS * FOOT_IN_METERS;

/** Exact by CGPM 1954: 1 atm = 101 325 Pa. */
export const ATMOSPHERE_IN_PASCALS = 101325;
/** Exact: 1 psi = 1 lbf / in^2. */
export const PSI_IN_PASCALS = POUND_FORCE_IN_NEWTONS / INCH_IN_METERS ** 2;
/** Exact: 1 Torr = 1/760 atm. */
export const TORR_IN_PASCALS = ATMOSPHERE_IN_PASCALS / 760;
/** Conventional millimetre of mercury (NIST SP 811): 133.322387415 Pa exactly. */
export const MMHG_IN_PASCALS = 133.322387415;
/** Conventional inch of mercury at 0 degrees Celsius: 25.4 x mmHg. */
export const INHG_IN_PASCALS = MMHG_IN_PASCALS * 25.4;
/** Conventional inch of water at 4 degrees Celsius (NIST SP 811). */
export const INH2O_IN_PASCALS = 249.0889;

/** Exact: thermochemical calorie = 4.184 J. */
export const CALORIE_TH_IN_JOULES = 4.184;
/** Exact: International Table calorie = 4.1868 J. */
export const CALORIE_IT_IN_JOULES = 4.1868;
/** International Table BTU (NIST SP 811): 1055.05585262 J. */
export const BTU_IT_IN_JOULES = 1055.05585262;
/** Exact by SI 2019 redefinition: 1 eV = 1.602176634e-19 J. */
export const ELECTRONVOLT_IN_JOULES = 1.602176634e-19;
/** Exact: 1 ft.lbf = 0.3048 m x 4.4482216152605 N. */
export const FOOT_POUND_IN_JOULES = FOOT_IN_METERS * POUND_FORCE_IN_NEWTONS;
/** Exact: 1 erg = 1e-7 J. */
export const ERG_IN_JOULES = 1e-7;
/** Tonne of TNT, conventional: 1e9 cal_th = 4.184 GJ. */
export const TON_TNT_IN_JOULES = 4.184e9;
/** Therm (US): exactly 100 000 BTU_IT by NIST convention. */
export const THERM_IN_JOULES = 100000 * BTU_IT_IN_JOULES;

/** Mechanical horsepower, exact: 550 ft.lbf/s. */
export const MECHANICAL_HORSEPOWER_IN_WATTS = 550 * FOOT_POUND_IN_JOULES;
/** Metric horsepower (PS), exact: 75 kgf.m/s. */
export const METRIC_HORSEPOWER_IN_WATTS = 75 * KILOGRAM_FORCE_IN_NEWTONS;
/** Electrical horsepower, conventional: exactly 746 W. */
export const ELECTRICAL_HORSEPOWER_IN_WATTS = 746;
/** Boiler horsepower (ASME), conventional: 9809.5 W. */
export const BOILER_HORSEPOWER_IN_WATTS = 9809.5;

/* -------------------------------------------------------------------------- */
/* Angle                                                                       */
/* -------------------------------------------------------------------------- */

export const DEGREE_IN_RADIANS = Math.PI / 180;
export const GRADIAN_IN_RADIANS = Math.PI / 200;
export const ARCMINUTE_IN_RADIANS = DEGREE_IN_RADIANS / 60;
export const ARCSECOND_IN_RADIANS = DEGREE_IN_RADIANS / 3600;
export const TURN_IN_RADIANS = 2 * Math.PI;
/** NATO mil: 1/6400 of a turn. */
export const MIL_NATO_IN_RADIANS = TURN_IN_RADIANS / 6400;

/* -------------------------------------------------------------------------- */
/* Digital information (IEC 80000-13)                                          */
/* -------------------------------------------------------------------------- */

export const BYTE_IN_BITS = 8;
/** Decimal (SI) prefixes: powers of 1000. */
export const KILO = 1e3;
export const MEGA = 1e6;
export const GIGA = 1e9;
export const TERA = 1e12;
export const PETA = 1e15;
/** Binary (IEC) prefixes: powers of 1024. Never labelled as decimal. */
export const KIBI = 1024;
export const MEBI = 1024 ** 2;
export const GIBI = 1024 ** 3;
export const TEBI = 1024 ** 4;
export const PEBI = 1024 ** 5;

/* -------------------------------------------------------------------------- */
/* Radiation and radioactivity                                                 */
/* -------------------------------------------------------------------------- */

/** Exact: 1 Ci = 3.7e10 Bq. */
export const CURIE_IN_BECQUERELS = 3.7e10;
/** Exact: 1 Rd = 1e6 Bq. */
export const RUTHERFORD_IN_BECQUERELS = 1e6;
/** Exact: 1 rad = 0.01 Gy; 1 rem = 0.01 Sv. */
export const RAD_IN_GRAYS = 0.01;
export const REM_IN_SIEVERTS = 0.01;

/* -------------------------------------------------------------------------- */
/* Illuminance                                                                 */
/* -------------------------------------------------------------------------- */

/** Exact: 1 foot-candle = 1 lm/ft^2 = 1 / 0.09290304 lx. */
export const FOOT_CANDLE_IN_LUX = 1 / (FOOT_IN_METERS * FOOT_IN_METERS);
/** Exact: 1 phot = 10 000 lx. */
export const PHOT_IN_LUX = 10000;

/* -------------------------------------------------------------------------- */
/* Magnetic flux density                                                       */
/* -------------------------------------------------------------------------- */

/** Exact: 1 G = 1e-4 T. */
export const GAUSS_IN_TESLA = 1e-4;

/* -------------------------------------------------------------------------- */
/* Fuel economy                                                                */
/* -------------------------------------------------------------------------- */

/** Kilometres travelled per US gallon, used by the mpg (US) inverse relation. */
export const US_GALLON_IN_LITERS = US_GALLON_IN_CUBIC_METERS * 1000;
export const IMPERIAL_GALLON_IN_LITERS = IMPERIAL_GALLON_IN_CUBIC_METERS * 1000;
export const MILE_IN_KILOMETERS = MILE_IN_METERS / 1000;
