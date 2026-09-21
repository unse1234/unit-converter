# UnitFlip

A fast, accurate unit converter for the web: an instant converter on every page, exact conversion
factors from defining authorities, and a statically generated reference page for every conversion
people actually search for.

Production: **https://unitflip.org**

Built with Next.js (App Router, `output: 'export'`), React, TypeScript and Tailwind CSS. There is no
backend, no database and no server at runtime: `npm run build` writes a complete static site to
`out/`, which is deployed to Cloudflare Pages. The converter runs entirely in the browser.

The product specifications this implementation follows live in [`unit-converter-spec/`](./unit-converter-spec).
Decisions that interpret or deviate from them are recorded in [`docs/decisions.md`](./docs/decisions.md).

---

## Quick start

Requires Node.js 20.9 or later and npm.

```bash
npm install
cp .env.example .env.local      # Windows: copy .env.example .env.local
npm run dev                     # http://localhost:3000
```

Every environment variable is optional — a fresh clone builds and runs with none of them set.

## Scripts

| Command                    | What it does                                                  |
| -------------------------- | ------------------------------------------------------------- |
| `npm run dev`              | Development server with hot reload                            |
| `npm run build`            | Static export to `out/`                                       |
| `npm run preview`          | Serve `out/` locally on port 3100                             |
| `npm run typecheck`        | TypeScript, strict mode                                       |
| `npm run lint`             | ESLint, including the domain-layer import boundary            |
| `npm test`                 | Unit and integration tests (Vitest)                           |
| `npm run test:e2e`         | End-to-end tests against the production build (Playwright)    |
| `npm run test:e2e:install` | Installs the Chromium build Playwright uses (first run only)  |
| `npm run format`           | Formats the codebase with Prettier                            |
| `npm run validate`         | Typecheck, lint, unit tests and build, in that order          |

## Environment variables

All are optional. `NEXT_PUBLIC_*` values are inlined at build time, so changing one in Cloudflare
requires a redeploy before it takes effect.

| Variable                  | Default                | Purpose                                                                                                                                       |
| ------------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_GA_ID`       | empty                  | GA4 measurement id (`G-XXXXXXXXXX`). Empty means no Google script, no cookie and no request. Set it and `<GoogleAnalytics>` renders in the layout. |
| `NEXT_PUBLIC_SITE_URL`    | `https://unitflip.org` | Canonical origin, no trailing slash. Canonical URLs, the sitemap, robots.txt and structured data are built from it.                            |
| `SITE_NOINDEX`            | `false`                | `true` serves `noindex` and a disallow-all robots.txt. Use on any preview or staging deployment.                                               |
| `NEXT_PUBLIC_ADS_ENABLED` | `false`                | `true` renders ad slots. See [Monetization](#analytics-and-monetization).                                                                      |

## Testing

**Unit and integration** — `npm test`

- `tests/unit` covers the conversion engine, formatting, input parsing, catalog integrity, search,
  generated page content, formulas, metadata, the sitemap and robots.txt. These run in Node.
- `tests/integration` renders the converter in jsdom and exercises typing, unit selection, swap,
  copy, precision, favourites, recent conversions, URL parameters and error states.

**End to end** — `npm run build && npm run test:e2e`

Runs against a production server on port 3100, in a desktop Chrome project and a Pixel 7 mobile
project. Every test fails if the page logs a console error, which catches hydration mismatches and
Content-Security-Policy violations. The suites cover:

- pages, canonical URLs, 404s and URL normalisation
- the converter, keyboard-only use and the search dialog
- light, dark and system themes
- horizontal overflow at 320–1920 px, touch target sizes and the phone layout
- automated WCAG 2.2 A/AA checks (axe) on every page type and interactive state
- a JavaScript transfer budget and cumulative layout shift

## Project structure

```text
src/
  app/                    Routes, metadata, sitemap, robots, manifest, icons, error boundaries
    [category]/           Category and collection pages
      [conversion]/       Conversion pages — one template for every pair
  components/
    converter/            The interactive converter (the only substantial client component)
    content/              Server-rendered page content: tables, FAQ, directories
    navigation/           Header, footer, breadcrumbs, mobile menu
    search/               Search dialog, loaded on demand
    seo/                  JSON-LD
    ads/                  Ad slot boundary (renders nothing unless enabled)
    theme/                Light / dark / system preference
    ui/                   Design-system primitives and icons
  data/                   The unit catalog: constants, units, categories, collections
  domain/                 Framework-free core — no React, no Next (enforced by lint)
    conversion/           Engine, formatting, parsing, custom conversions, page-pair rules
    units/                Registry and catalog validation
  hooks/                  Client hooks: favourites, history, precision, clipboard
  lib/                    SEO, search, analytics, monitoring, storage, site configuration
  styles/globals.css      Design tokens and base styles
public/
  _headers                Cloudflare response headers, including the CSP
  _redirects              Cloudflare redirects: www, old URLs, trailing slashes
  ads.txt                 AdSense placeholder — add your publisher line after approval
  opengraph-image.png     Social sharing image (see docs/social-image.md)
  apple-icon.png          iOS home-screen icon
tests/                    unit/, integration/, e2e/
docs/decisions.md         Architecture decisions and deviations from the specification
unit-converter-spec/      Product specifications
```

## How conversion works

Every unit is data. A unit states how it relates to its category's **base unit**, and the engine
converts `value → base → target`. That keeps the catalog at _N_ unit definitions instead of _N²_
pair definitions: a new unit is a data change, not a code change.

- **Linear** units have a `factor`: `base = value × factor`.
- **Affine** units (temperature) add an `offset`: `base = value × factor + offset`.
- **Custom** units (fuel consumption such as L/100 km, which is reciprocal) name a function pair in
  `src/domain/conversion/custom.ts`.

Constants live in `src/data/constants.ts`, each with its source (BIPM, NIST SP 811, the 1959
International Yard and Pound Agreement, IEC 80000-13, IAU). Exact definitions are never rounded.
Calculations run at full double precision; the number of digits shown is a display setting
(`src/domain/conversion/format.ts`) and changing it never changes a result.

Physically invalid requests return an error instead of a number: temperatures below absolute zero,
zero fuel economy, or units from different categories.

`src/domain/units/validate.ts` checks the catalog — unique ids and slugs, valid base units, required
fields per conversion type, and a documented resolution rule for every ambiguous alias. It runs as
part of `npm test`.

## How the SEO pages are generated

- A conversion page exists for every ordered pair of units marked `seo: 'primary'` in the same
  category, except pairs whose factors differ by more than 10¹² and pairs listed in
  `EXCLUDED_PAIRS` (`src/domain/conversion/pairs.ts`). Other units work in the converter and appear
  on their category page but get no page of their own, which avoids thin, near-duplicate URLs.
- One template, `src/app/[category]/[conversion]/page.tsx`, renders every pair via
  `generateStaticParams`. Nothing is written per conversion.
- Page content is computed from the data (`src/lib/seo/conversion-content.ts`, `formula.ts`): the
  exact relationship or formula, a worked example, a table sized to the category, questions the
  data can answer truthfully, and unit notes. Titles and descriptions come from
  `src/lib/seo/metadata.ts`.
- Every page's canonical URL is its clean path. Query parameters (`?value=10`) prefill the converter
  but never create another indexable URL, and trailing slashes redirect to the slashless form via
  `public/_redirects`.
- The sitemap and robots.txt are generated from the same data, so they cannot list a page that does
  not exist.
- Structured data is limited to what the pages genuinely contain: `BreadcrumbList` on every page
  with a trail, `FAQPage` on conversion pages whose questions are answered from computed values,
  and `WebSite` (with a `SearchAction` for the real `/search` route) plus `Organization` on the
  homepage.
- Cooking and Typography are _collections_: landing pages over Volume and Length units whose links
  point at the canonical pages in those categories, so no conversion has two URLs.

## Extending the catalog

### Add a unit

1. If it needs a new constant, add it to `src/data/constants.ts` with its source.
2. Add an entry to the category's file in `src/data/units/`: `id`, `name`, `plural` (if irregular),
   `symbol`, `aliases`, `system`, and `factor` (plus `offset` for affine units, or `customKey`).
   Add `description`, and a `note` if the unit's value is a convention rather than a definition.
3. Set `seo: 'primary'` only if people search for it. That creates a page for every pairing with the
   category's other primary units.
4. If an alias or symbol matches another unit in the category, add a rule to
   `src/lib/search/disambiguation.ts`. The catalog test fails until you do.
5. Run `npm test`. Catalog validation and round-trip tests cover the new unit automatically; add an
   explicit expected-value test in `tests/unit/conversion/engine.test.ts` for important units.

### Add a category

1. Create `src/data/units/<category>.ts` using `defineUnits(categoryId, baseUnitId, [...])`. The base
   unit must have factor 1.
2. Register the array in `src/data/units/index.ts`.
3. Add a `CategoryDefinition` to `src/data/categories.ts`: slug, name, summary, an authored
   description, base unit, related categories, icon and default pair.
4. For non-linear units, add named functions to `src/domain/conversion/custom.ts`, and any physical
   limits to `src/domain/conversion/domain-rules.ts`.
5. Run the tests. Routes, navigation, the sitemap and the search index pick the category up without
   further changes.

### Add a conversion page

Mark both units `seo: 'primary'`. To keep a specific pair from getting a page, add it (both
directions) to `EXCLUDED_PAIRS` in `src/domain/conversion/pairs.ts`. No component is involved.

## Analytics and monetization

- Google Analytics 4 loads through `<GoogleAnalytics>` from `@next/third-parties` in the root
  layout, and **only** when `NEXT_PUBLIC_GA_ID` is set at build time. Unset, the site makes no
  request to Google and sets no cookie.
- Components call `track(event, payload)` from `src/lib/analytics`. Events and payloads are typed in
  `events.ts`; payload keys are snake_case because that is how GA4 stores them, and payloads never
  include values the user typed. The main event is `conversion_used`, with `from_unit` and
  `to_unit`, emitted from the converter's 900 ms debounce rather than on every keystroke.
- Ad placements are `AdSlot` components (`src/components/ads/AdSlot.tsx`): below the converter,
  between content sections, and in the desktop side column. Slots reserve their height to avoid
  layout shift, render nothing when disabled, and are never placed inside the converter.
- `public/ads.txt` is a placeholder. Add the line AdSense gives you after approval.
- Enabling another ad vendor means adding its origins to the Content-Security-Policy in
  `public/_headers` and updating `/privacy-policy` in the same change.

## Deployment — Cloudflare Pages

The build produces a complete static site in `out/`. Nothing renders per request.

| Setting            | Value           |
| ------------------ | --------------- |
| Framework preset   | Next.js (Static HTML Export) |
| Build command      | `npm run build` |
| Output directory   | `out`           |
| Node version       | 20.9 or later   |

Because there is no server, two Next features are replaced by Cloudflare's own files:

- **Response headers**, including the Content-Security-Policy, live in `public/_headers`.
  `next.config.ts`'s `headers()` is never called by an export.
- **Redirects** live in `public/_redirects`, covering the `www` host, the old `/privacy` URL and
  trailing slashes.

Both are copied verbatim into `out/`. Changing a security header means editing `public/_headers`.

Errors from the error boundaries go through `src/lib/monitoring.ts`; connect a monitoring service by
replacing its `deliver` function.

### What static export rules out

Do not add any of these without moving the site off a static export first: API routes, server
actions, middleware/proxy, ISR or `revalidate`, `cookies()`/`headers()`, `searchParams` in a server
component, or `next/image` optimisation (`images.unoptimized` is on).

## Toolchain notes

- **TypeScript 5.9**, not 7: `typescript-eslint` does not yet support the TypeScript 7 API.
- **ESLint 9**, not 10: the React plugin bundled with `eslint-config-next` uses APIs removed in ESLint 10.

Revisit both when those packages add support.
