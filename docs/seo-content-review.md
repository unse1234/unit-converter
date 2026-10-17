# Conversion accuracy and content review

Reviewed 2026-10-16 (Asia/Karachi). This is an engineering review of unit definitions, arithmetic and visible explanations, not a metrology, clinical or engineering certification. Route counts and HTTP/indexing evidence are recorded separately in the URL audit reports.

## Confirmed defects and changes

| Before                                                                                                                                                                         | After                                                                                                                                                                                                                | Evidence                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Fraction recognition accepted tiny nonzero numbers as `0/2`; an eV → J formula could therefore instruct multiplication by zero even though the interactive answer was nonzero. | Fraction recognition requires a nonzero numerator and a relative error check. Scientific factors remain scientific numbers (`1.602176634e-19`, `1e-12`).                                                             | Focused regression and the SI elementary-charge definition.                                                        |
| Coulomb → mAh could show `C ÷ 18/5`, whose ordinary arithmetic precedence gives the wrong result.                                                                              | Fractional divisors are grouped: `mAh = C ÷ (18/5)`.                                                                                                                                                                 | 1 Ah = 3600 C, so 1 mAh = 3.6 C; all generated pair formulas are evaluated independently in a regression.          |
| `therm` claimed the US natural-gas convention but used 100,000 International Table BTU (105,505,585.262 J).                                                                    | The existing therm ID/URLs use the stated US convention, 105,480,400 J, with an explicit variant disclosure.                                                                                                         | NIST SP 811 B.8/B.9 and footnote 24 distinguish therm (US) from therm (EC).                                        |
| `mmHg` claimed the NIST conventional definition but stored the different density-derived 133.322387415 Pa value.                                                               | Uses conventional 133.3224 Pa; inHg derives from 25.4 mmHg and agrees with the NIST rounded 3386.389 Pa entry.                                                                                                       | NIST SP 811 conventional manometer entries and footnote 12. The relative mmHg change is approximately 9.44 × 10⁻⁸. |
| inH₂O used 249.0889 Pa but described a 4 °C water-column unit.                                                                                                                 | Names the conventional inH₂O definition.                                                                                                                                                                             | NIST lists conventional 249.0889 Pa separately from its 4 °C entry, approximately 249.082 Pa.                      |
| Atomic mass unit used CODATA 2018 without an uncertainty disclosure.                                                                                                           | Uses CODATA 2022, 1.66053906892 × 10⁻²⁷ kg; the unit note includes its standard uncertainty, 0.00000000052 × 10⁻²⁷ kg.                                                                                               | Current NIST CODATA complete listing.                                                                              |
| The engine returned identical units before checking the temperature domain; negative fuel values also produced plausible results.                                              | Domain checks precede identity shortcuts and fuel economy/consumption requires positive input.                                                                                                                       | Regressions reject −1 K → K, −300 °C → °C, and negative reciprocal fuel values.                                    |
| Exact absolute zero (−459.67 °F) left a −2.84 × 10⁻¹⁴ K floating-point residue and was refused.                                                                                | An arithmetic error bound clamps only cancellation residue at the zero boundary; small negative kelvin inputs remain invalid.                                                                                        | Regressions check the exact boundary, a reading below it and −10⁻²⁰ K.                                             |
| Rounded values were written as exact equalities and generated FAQ sections repeated the statement, formula, ten-unit table row and reverse conversion.                         | Rounded direct statements use ≈; repeated FAQ content is removed. Temperature pages retain the useful difference-versus-reading question. Definitions, formulas, worked arithmetic, tables and reverse links remain. | Visible shared content and focused content regressions.                                                            |
| Category/unit descriptions overclaimed universal exactness, confused conductance with conductivity, and included unsourced clinical exposure examples.                         | More specific descriptions, explicit quantity distinctions and removal of the clinical examples.                                                                                                                     | SI derived-quantity definitions and the scope of this review.                                                      |

The shared precision disclosure distinguishes table rounding (8 significant digits), formula constants (up to 10), worked answers (6), converter default (6, adjustable), exact definitions, measured constants and chosen conventions. Rounded worked answers also use ≈; exactly represented answers retain equality. More displayed digits do not improve the precision of an input measurement.

## Primary sources checked

- [BIPM SI Brochure, current edition page](https://www.bipm.org/en/publications/si-brochure), including the English edition currently identified as 9th edition/version 4.01, updated in 2026: SI base/derived units, prefixes, Celsius/kelvin relationship and the exact elementary charge. This supersedes the pre-2019 electronvolt precision in the older SP 811 tables.
- [NIST SP 811 Appendix B.8](https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b8) and [B.9 by quantity](https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b9): customary, mechanical, electrical, light, radiation and conventional pressure factors. Many printed factors are rounded; their printed digits must not all be treated as an exact definition.
- [NIST SP 811 footnotes](https://www.nist.gov/pml/special-publication-811/nist-guide-si-footnotes): exact pound/lbf/BTU definitions, manometer conventions, survey-foot distinctions, and therm variants.
- [NIST SP 811 B.5](https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors): reciprocal mpg (US) ↔ L/100 km relation. The stored unrounded constant follows 100 × 3.785411784 / 1.609344 = 235.214583333…; NIST prints 235.215.
- [NIST binary prefixes](https://physics.nist.gov/cuu/Units/binary.html): byte/bit and decimal/binary distinctions.
- [NIST Gregorian/Julian year explanation](https://www.nist.gov/pml/time-and-frequency-division/popular-links/time-frequency-z/time-and-frequency-z-x-z): 365.2425-day Gregorian mean versus 365.25-day Julian year.
- [NIST CODATA 2022 complete listing](https://physics.nist.gov/cuu/Constants/Table/allascii.txt): current atomic mass constant and uncertainty, and exact elementary charge.
- [W3C CSS absolute lengths](https://www.w3.org/TR/css-values-3/#absolute-lengths): relationships of in, px, pt and pc, and the reference-unit caveat.
- [FDA household-measure guidance](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/guidance-industry-guidelines-determining-metric-equivalents-household-measures), General Information item 9, and [21 CFR 101.9, 2025 annual edition](https://www.govinfo.gov/content/pkg/CFR-2025-title21-vol2/pdf/CFR-2025-title21-vol2-sec101-9.pdf), printed page 29 / PDF page 4, paragraph (b)(5)(viii): the 240 mL cup is specifically a nutrition-labeling convention, distinct from the US customary cup. The current eCFR endpoint was gated; the FDA guidance currently published on its official website and the official annual CFR independently support the catalog convention.
- [IAU 2012 Resolution B2, hosted by the Paris Observatory/SYRTE](https://syrte.obspm.fr/IAU_resolutions/Res_IAU2012_B2.pdf), recommendation 1: the astronomical unit is exactly 149,597,870,700 m. This is the adopted-resolution PDF linked by [the resolution author’s institutional explanation](https://syrte.obspm.fr/IAU_resolutions/IAUResol_2012.html).
- [IAU 2015 resolutions, official archive PDF](https://iauarchive.eso.org/static/resolutions/IAU2015_English.pdf), Resolution B2 note 4, PDF page 5: the parsec is exactly (648000/π) au. The relevant PDF page was visually checked after text refetches intermittently returned HTTP 400. The [current IAU resolution index](https://www.iau.org/Iau/Publications/List-of-Resolutions.aspx) also lists the adopted 2012 and 2015 documents, although its Google Drive viewer exposed only a loading shell to the text reader.

## Coverage and independent numerical checks

`tests/unit/conversion/reference-values.test.ts` contains a primary-reference check for each of the 34 categories. Values are literal reference values or independently derived from published definitions, not imported catalog factors. Relative comparisons prevent a tiny nonzero expected value from passing merely because an absolute tolerance would also admit zero.

| Category           | Representative independent check                | Additional visible guidance                         |
| ------------------ | ----------------------------------------------- | --------------------------------------------------- |
| Length             | 1 in = 2.54 cm                                  | International versus survey foot                    |
| Mass               | 1 lb = 0.45359237 kg                            | Avoirdupois, troy, mass versus fluid volume         |
| Temperature        | 32 °F = 0 °C; 0 °C = 273.15 K                   | Offset versus interval; absolute-zero validation    |
| Volume             | 1 US gal = 3.785411784 L; 1 imp gal = 4.54609 L | Named volume systems; density required for mass     |
| Area               | 1 ft² = 0.09290304 m²                           | Squared factors and historic survey acres           |
| Speed              | 1 kn = 1.852 km/h                               | Nautical versus statute mile                        |
| Time               | 1 h = 3600 s                                    | Mean calendar conventions and actual date intervals |
| Digital storage    | 1 MiB = 1048576 B                               | b/B and decimal/binary prefix distinction           |
| Energy             | 1 cal_th = 4.184 J                              | Calorie, BTU and therm variants; kWh is energy      |
| Power              | 1 mechanical hp = 745.6998715822702 W           | Horsepower definitions and energy per time          |
| Pressure           | 1 atm = 101325 Pa                               | Gauge/absolute reference; manometer conventions     |
| Data transfer      | 100 Mbps = 12.5 MB/s                            | Nominal units versus achieved network speed         |
| Fuel economy       | 30 mpg US ≈ 7.840486111 L/100 km                | Reciprocal relation and gallon choice               |
| Angle              | 180° = π rad                                    | Arc units versus time; irrational decimal factors   |
| Frequency          | 60 rpm = 1 Hz                                   | Cycles versus angular frequency                     |
| Force              | 1 lbf = 4.4482216152605 N                       | Standard gravity versus actual mass weight          |
| Torque             | 1 lbf·ft = 1.3558179483314004 N·m               | Torque and energy are different quantities          |
| Acceleration       | 1 g₀ = 9.80665 m/s²                             | Fixed standard versus local gravity                 |
| Density            | 1 g/cm³ = 1000 kg/m³                            | Substance, temperature and pressure preserved       |
| Flow rate          | 1 US gal/min = 3.785411784 L/min                | Gallon variant; actual/standard gas conditions      |
| Electric current   | 1 A = 1000 mA                                   | Preserve AC/DC and measurement convention           |
| Voltage            | 1 kV = 1000 V                                   | Preserve RMS, peak and DC convention                |
| Resistance         | 1 kΩ = 1000 Ω                                   | Conductance is a reciprocal quantity                |
| Capacitance        | 1 pF = 10⁻¹² F                                  | Prefix scale and component tolerance                |
| Inductance         | 1 mH = 1000 µH                                  | Rating conditions remain unchanged                  |
| Electric charge    | 1 Ah = 3600 C                                   | Charge versus battery energy                        |
| Conductance        | 1 S = 10⁶ µS                                    | Conductance versus conductivity                     |
| Magnetic field     | 1 G = 10⁻⁴ T                                    | Flux density B versus field strength H              |
| Illuminance        | 1 fc ≈ 10.76391042 lx                           | Surface area needed to relate lux to lumens         |
| Luminous intensity | 1 cd = 1000 mcd                                 | Direction/solid angle needed for flux               |
| Luminous flux      | 1 klm = 1000 lm                                 | Flux versus intensity/illuminance                   |
| Radioactivity      | 1 Ci = 3.7 × 10¹⁰ Bq                            | Activity alone cannot determine dose                |
| Absorbed dose      | 1 rad = 0.01 Gy                                 | Radiation weighting needed to relate to Sv          |
| Equivalent dose    | 1 rem = 0.01 Sv                                 | Preserve dose quantity; no risk interpretation      |

`tests/unit/seo/content-coverage.test.ts` covers every generated English ordered pair: nonempty tables/formulas/references, table display agreement with the engine, and independently evaluated displayed arithmetic at a valid input. Those checks establish internal consistency; they do not substitute for the independent reference fixtures above.

## Page purpose decisions

- Retain existing forward/reverse pair pages. They initialize different input/output units, state the appropriate direction, give source-unit tables and worked arithmetic, and link to the reverse task. A shared category caveat is relevant context, not the sole purpose of a pair page.
- Retain all 34 category hubs. They combine a working converter, unit/system comparisons, explicit assumptions, references and links to the existing pair inventory.
- Retain Cooking and Typography collections. They present useful subsets and defaults without duplicating their parent-category pair URLs. Cooking explicitly requires named regional measures and density for mass-to-volume tasks. Typography includes W3C references and the physical-display caveat.
- Retain converter-only secondary units as utility choices within their category. This change adds no new pair pages for them.
- No English route was identified as a true equivalent of a differently directed conversion merely because the two formulas are related. No route is deleted or given noindex on a text-similarity threshold.
- The localized page review, including fixed-value recipe/TV pages and density/aspect-ratio assumptions, is documented in `seo-history-localization.md` and implemented in the localized content layer.

## Limits and remaining review work

The review verifies representative independently sourced values in every category and all generated formulas/tables against the engine. It does not claim a complete specialist certification of every secondary unit or every real-world application. In particular:

- Mach retains its disclosed fixed 340.29 m/s sea-level/15 °C convention; it is not a general atmospheric solver. Boiler horsepower, historical candlepower, historical typography and regional culinary measures retain their disclosed conventions. Their application to a particular equipment document or historical recipe may need domain-specific checking.
- Astronomical unit and parsec definitions were independently checked against the adopted IAU resolution documents above. A light-year uses the stated Julian year and exact SI vacuum speed of light; it is a distance, not an elapsed-time conversion.
- The US legal cup factor was independently checked against the FDA guidance and official annual CFR above. This confirms the stated labeling convention; it does not make it a universal recipe cup.
- A generic unit converter cannot infer ingredient density, gas reference conditions, radiation weighting, real device pixel pitch, pressure reference, voltage measurement convention or measurement uncertainty. The content now explains the relevant missing quantity rather than silently inventing it.
- English references are rendered as links in initial HTML. Standards document titles may remain in their published language on localized pages; that is different from presenting English explanatory body copy as translated content.

Final command outcomes belong in the delivery report: focused checks initially exposed the tiny-factor/precedence regressions and two test-fixture mistakes; the source and fixtures were corrected. A fresh serial full test run subsequently passed all 359 tests. Production build, complete URL audit and desktop/mobile checks are coordinated separately to avoid competing build processes.
