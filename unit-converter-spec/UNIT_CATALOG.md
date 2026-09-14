# UNIT_CATALOG.md — Unit Taxonomy and Data Model

## 1. Purpose

This document defines the initial unit taxonomy and the data contract used by the conversion engine.

The catalog is intentionally data-driven. The implementation should not encode each conversion pair as a separate UI path.

## 2. Required Unit Data Shape

Each unit should support fields equivalent to:

```ts
interface UnitDefinition {
  id: string;
  category: string;
  name: string;
  pluralName?: string;
  symbol?: string;
  aliases: string[];
  system?: string;
  baseUnit: string;
  factor?: number;
  offset?: number;
  conversionType: "linear" | "affine" | "custom";
  description?: string;
  sortOrder?: number;
}
```

A conversion definition may additionally support:

```ts
interface ConversionDefinition {
  id: string;
  category: string;
  fromUnit: string;
  toUnit: string;
  formulaDescription?: string;
  seoEnabled?: boolean;
}
```

## 3. Categories

The initial product should cover the following categories.

### 3.1 Length

Core units:

- meter (m)
- kilometer (km)
- centimeter (cm)
- millimeter (mm)
- micrometer (µm)
- nanometer (nm)
- inch (in)
- foot (ft)
- yard (yd)
- mile (mi)
- nautical mile (nmi)
- point (pt)
- pica (pc)
- furlong
- chain
- rod
- astronomical unit (AU)
- light-year (ly)
- parsec (pc)

### 3.2 Mass / Weight

- microgram (µg)
- milligram (mg)
- gram (g)
- kilogram (kg)
- metric ton / tonne (t)
- ounce (oz)
- pound (lb)
- stone (st)
- US short ton
- imperial long ton
- carat (ct)

### 3.3 Temperature

- Celsius (°C)
- Fahrenheit (°F)
- Kelvin (K)
- Rankine (°R)
- Réaumur (°Ré)

Temperature must use explicit affine/custom formulas rather than blindly applying a linear factor model.

### 3.4 Area

- square meter (m²)
- square kilometer (km²)
- square centimeter (cm²)
- square millimeter (mm²)
- square inch (in²)
- square foot (ft²)
- square yard (yd²)
- square mile (mi²)
- hectare (ha)
- acre

### 3.5 Volume

- cubic meter (m³)
- cubic kilometer (km³)
- cubic centimeter (cm³)
- cubic millimeter (mm³)
- liter (L)
- milliliter (mL)
- US gallon (gal)
- imperial gallon
- US quart
- imperial quart
- US pint
- imperial pint
- US fluid ounce
- imperial fluid ounce
- cup
- tablespoon
- teaspoon
- cubic inch
- cubic foot
- cubic yard
- barrel

Where a unit is culturally ambiguous, the name must identify the measurement system.

### 3.6 Speed

- meter per second (m/s)
- kilometer per hour (km/h)
- mile per hour (mph)
- foot per second (ft/s)
- knot (kn)
- Mach (with explicit convention/limitation in content if variable)

### 3.7 Time

- nanosecond
- microsecond
- millisecond
- second
- minute
- hour
- day
- week
- month
- year
- decade
- century
- millennium

Months and years require an explicit definition because their duration is not a fixed SI quantity. Do not falsely imply a universal exact duration where one does not exist.

### 3.8 Pressure

- pascal (Pa)
- kilopascal (kPa)
- megapascal (MPa)
- bar
- millibar (mbar)
- atmosphere (atm)
- psi
- torr
- mmHg
- inHg

### 3.9 Energy

- joule (J)
- kilojoule (kJ)
- megajoule (MJ)
- watt-hour (Wh)
- kilowatt-hour (kWh)
- calorie (cal)
- kilocalorie (kcal)
- British thermal unit (BTU)
- electronvolt (eV)
- foot-pound force (ft·lbf)

Where calorie variants exist, define them precisely.

### 3.10 Power

- watt (W)
- kilowatt (kW)
- megawatt (MW)
- horsepower (hp)
- BTU per hour (BTU/h)
- foot-pound per second where justified

### 3.11 Angle

- degree (°)
- radian (rad)
- gradian (gon)
- arcminute (′)
- arcsecond (″)

### 3.12 Frequency

- hertz (Hz)
- kilohertz (kHz)
- megahertz (MHz)
- gigahertz (GHz)
- rpm (revolutions per minute)

### 3.13 Force

- newton (N)
- kilonewton (kN)
- dyne
- kilogram-force (kgf)
- pound-force (lbf)

### 3.14 Torque

- newton-meter (N·m)
- pound-foot (lb·ft)
- pound-inch (lb·in)
- kilogram-force meter (kgf·m)

### 3.15 Acceleration

- meter per second squared (m/s²)
- foot per second squared (ft/s²)
- standard gravity (g₀)

### 3.16 Density

- kilogram per cubic meter (kg/m³)
- gram per cubic centimeter (g/cm³)
- gram per milliliter (g/mL)
- pound per cubic foot (lb/ft³)
- pound per gallon where useful

### 3.17 Flow Rate

- cubic meter per second
- cubic meter per hour
- liter per second
- liter per minute
- liter per hour
- gallon per minute (US)
- cubic foot per minute (CFM)

### 3.18 Fuel Economy

- kilometers per liter
- liters per 100 kilometers
- miles per gallon (US)
- miles per gallon (Imperial)

Fuel-economy conversions require inverse relationships and therefore should not be treated as ordinary linear units.

### 3.19 Digital Information

Separate decimal and binary definitions.

Decimal:

- bit
- byte
- kilobit
- kilobyte
- megabit
- megabyte
- gigabit
- gigabyte
- terabit
- terabyte
- petabit
- petabyte

Binary:

- kibibit
- kibibyte
- mebibit
- mebibyte
- gibibit
- gibibyte
- tebibit
- tebibyte
- pebibit
- pebibyte

Do not label binary units as decimal units.

### 3.20 Data Transfer Rate

- bit/s
- kbit/s
- Mbit/s
- Gbit/s
- byte/s
- kB/s
- MB/s
- GB/s
- KiB/s
- MiB/s
- GiB/s

### 3.21 Electric Current

- ampere (A)
- milliampere (mA)
- microampere (µA)
- kiloampere (kA)

### 3.22 Voltage

- volt (V)
- millivolt (mV)
- microvolt (µV)
- kilovolt (kV)
- megavolt (MV)

### 3.23 Resistance

- ohm (Ω)
- milliohm (mΩ)
- kiloohm (kΩ)
- megaohm (MΩ)

### 3.24 Capacitance

- farad (F)
- millifarad (mF)
- microfarad (µF)
- nanofarad (nF)
- picofarad (pF)

### 3.25 Inductance

- henry (H)
- millihenry (mH)
- microhenry (µH)
- nanohenry (nH)

### 3.26 Magnetic Field

- tesla (T)
- millitesla (mT)
- microtesla (µT)
- gauss (G)

### 3.27 Electric Charge

- coulomb (C)
- millicoulomb (mC)
- microcoulomb (µC)

### 3.28 Conductance

- siemens (S)
- millisiemens (mS)
- microsiemens (µS)

### 3.29 Luminous Intensity / Illumination

- candela (cd)
- lumen (lm)
- lux (lx)

### 3.30 Radioactivity

- becquerel (Bq)
- kilobecquerel (kBq)
- megabecquerel (MBq)
- curie (Ci)

### 3.31 Radiation Dose

- gray (Gy)
- milligray (mGy)
- sievert (Sv)
- millisievert (mSv)
- rem

### 3.32 Typography

- point
- pica
- pixel where explicitly treated as display/reference unit, not a physical universal measurement

### 3.33 Cooking Volume

- teaspoon
- tablespoon
- cup
- US cup
- imperial cup
- US fluid ounce
- imperial fluid ounce
- pint
- quart
- gallon

Ambiguous culinary units must explicitly identify the measurement system in names/content.

## 4. Data Quality Rules

- Every unit must have a canonical ID.
- Every unit must have aliases where users commonly search alternate spellings.
- SI prefixes should be represented as explicit units only when they materially improve usability; do not generate endless unnecessary unit pages.
- Every constant must be documented with its source or authority in code/data comments or project documentation.
- Avoid misleading names such as using `pound` without clarifying mass vs force where ambiguity exists.
- For units with multiple definitions by region/system, use separate IDs.

## 5. Expansion Rule

Adding a unit should require data changes and tests, not new UI architecture.

Adding a supported category should require:

- category metadata
- unit definitions
- conversion implementation if nonlinear/custom
- tests
- SEO/content metadata where indexable

## 6. Validation

The project must include validation that:

- every referenced unit exists
- every category has valid units
- aliases do not create accidental ambiguous matches without resolution rules
- base-unit relationships are valid
- conversion types have required fields
