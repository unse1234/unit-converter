# Multilingual SEO

How the multilingual market research (UnitFlip Multilingual Market Research, 25–26 Sep 2026) is
implemented, and what it deliberately leaves for later.

## Languages and structure

| Language            | Folder | Primary market          | Numbers | Connector             |
| ------------------- | ------ | ----------------------- | ------- | --------------------- |
| Spanish             | `/es`  | Mexico, Spain, Colombia | `2.54`  | a (`pies a metros`)   |
| Portuguese (Brazil) | `/pt`  | Brazil (and Portugal)   | `2,54`  | em / para             |
| Italian             | `/it`  | Italy                   | `2,54`  | in                    |
| French              | `/fr`  | France                  | `2,54`  | en                    |
| Indonesian          | `/id`  | Indonesia               | `2,54`  | ke, and "berapa" form |

- Every language has a home page, category hubs, pair pages, single-value pages ("6 pulgadas a cm")
  and, where the research found demand, TV-size and local-unit pages.
- `hreflang` links every page to its translations, with English as `x-default` when an English page
  exists. English pages that have translations link back and show "Also available in".
- The sitemap lists every localized URL with its `xhtml:link` alternates.
- A language menu sits in every header, a language list in every footer, and the English homepage
  has a "UnitFlip in your language" section.

## Where the research lives in the code

| Research section                     | Implemented in                                                         |
| ------------------------------------ | ---------------------------------------------------------------------- |
| §2 terminology, local units          | Unit names and copy in `src/i18n/locales/<code>.ts`                    |
| §2.15–16 high-value, long-tail terms | `phrase`, `values.list` and `faqs` on each pair spec                   |
| §4 keyword → URL, title, description | `slug`, `title` and `description` on the specs; templates for the rest |
| §5 English pages to localize         | The `pairs` list of each language                                      |
| §8 gaps                              | Single-value pages, TV sizes, alqueire, ons, arroba, cups, height      |

Local units (not in the English catalog) are defined in `src/i18n/local-units.ts`: Indonesian ons
(100 g), kuintal (100 kg), Brazilian arroba (15 kg) and the alqueire paulista, mineiro and baiano
(24,200, 48,400 and 96,800 m²).

## Adding a page or a language

- **A pair:** add a spec to the language's `pairs`. Its `values.list` creates single-value pages.
- **A language:** add it to `LOCALES` in `src/i18n/config.ts`, write `src/i18n/locales/<code>.ts`,
  register it in `src/i18n/pages.ts`, and copy one of the `src/app/(localized)/<code>` folders.
- `npm test` checks that every page builds, titles and descriptions are unique per language, and
  hreflang clusters are reciprocal.

## Not built yet (and why)

- **Tumbak, bata, ru, ubin (Indonesia) and fanega (Spain, Colombia):** their values differ by
  region; the research asks for official regional values before publishing.
- **Cups to grams by ingredient:** needs an ingredient density table from a trusted source.
- **Section 6 conversions** (technical categories, stone, yards…): no demand signal in any launch
  market.
- **Germany, Poland, Thailand, Japan, Vietnam, Turkey, Arabic:** CONSIDER in the research. Add them
  once the five launch languages show impressions in Search Console.
- Pull the full single-value lists from Keyword Planner once 2-Step Verification is on, and extend
  only the pairs whose first pages earn impressions.
