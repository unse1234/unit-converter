# Architecture decisions

Decisions that shape the codebase, including where the implementation interprets or departs from
the specifications in `unit-converter-spec/`. Each entry records the context and the reason, so a
later change can be made knowingly.

---

## 1. Static generation, no backend

**Decision.** Next.js App Router with every category and conversion page statically generated.
No server, database or authentication.

**Why.** The product's content is a pure function of the unit catalog, so there is nothing to compute
per request. Static HTML on a CDN is the cheapest and fastest way to meet the LCP target and scales to
thousands of pages. Only `/search` renders per request, because its output depends on the query.

**Consequence.** Pages must not read `searchParams` on the server — doing so opts the route out of
static generation. The converter reads query parameters on the client instead (decision 10).

## 2. A framework-free domain layer

**Decision.** `src/domain` and `src/data` never import React or Next. An ESLint rule enforces it.

**Why.** The engine must be testable in isolation, run during static generation and in the browser,
and be reusable behind a future public API (ARCHITECTURE §18).

## 3. Serialisable unit data; custom conversions by key

**Decision.** Unit records contain only data. Non-linear conversions are referenced by `customKey`
and resolved in `src/domain/conversion/custom.ts`.

**Why.** Server components pass a page's units to the client converter as props, which must be
serialisable. This also means a length page ships only length units, not the whole catalog.

## 4. Cooking and Typography are collections, not categories

**Context.** UNIT_CATALOG §3.32–3.33 lists them as categories, but their units are Volume and Length
units.

**Decision.** They are landing pages over a subset of the parent category's units, and link to the
parent category's canonical conversion pages.

**Why.** Separate categories would require either duplicate unit ids (so a cup could not be converted
to a litre) or a second URL for the same conversion, which SEO_SPEC §17 forbids.

## 5. Quantities that are not interconvertible are separate categories

**Context.** UNIT_CATALOG §3.29 groups candela, lumen and lux; §3.31 groups gray and sievert.

**Decision.** Luminous intensity, luminous flux and illuminance are three categories; absorbed dose
and equivalent dose are two.

**Why.** They measure different physical quantities. Converting between them needs a solid angle, an
area or a radiation weighting factor. Offering a factor would return a plausible number for an invalid
request, which CLAUDE.md prohibits.

## 6. Mass is served from `/weight`

**Decision.** Category id `mass`, URL slug `weight`, title "Weight & Mass".

**Why.** SEO_SPEC uses `/weight/`, matching how people search, while the units are units of mass.
Keeping id and slug separate allows both.

## 7. Conventional values are disclosed, not hidden

**Decision.** Units whose value is a convention carry a `note` shown beside the converter and on
their pages: Mach (ICAO sea level), month and year (Gregorian averages), calorie and BTU (named
definitions), pixel (CSS reference unit), candlepower.

**Why.** UNIT_CATALOG §3.6–3.7 and §4 require explicit definitions for units with no single value.

## 8. Which conversions get a page

**Decision.** Ordered pairs of `primary` units within a category, minus pairs whose factors differ by
more than 10¹² and an explicit exclusion list. Popular pairs are ranked with cross-system conversions
first.

**Why.** SEO_SPEC §3 and §13: coverage of real search intent, not URL count. Every page is also linked
from its category page's directory, so none is orphaned.

## 9. The converter never navigates on input

**Decision.** Changing a unit updates the converter in place. When the selection has its own page, a
link to it appears under the result. Swap exchanges the units and keeps the typed value.

**Why.** A control that loads a new page when its value changes is a change of context on input,
which WCAG 2.2 §3.2.2 prohibits; it would also move keyboard focus and discard the typed value. An
earlier version navigated on change and was replaced. Keeping the value on swap follows common
converter convention and avoids compounding display rounding.

## 10. Query parameters are read on the client

**Decision.** `?from`, `?to` and `?value` are read with `useSearchParams` inside a small component
under a Suspense boundary. Canonical URLs are always the clean path.

**Why.** Keeps pages statically generated (decision 1). Reading the router rather than
`window.location` is correct on client-side navigation, where the browser URL is only updated after
the new page has rendered.

## 11. Search runs on a static index fetched on demand

**Decision.** `/search-index.json` is a statically generated compact index, fetched when the search
dialog first opens. The same search code backs the `/search` page.

**Why.** Keeps the catalog out of every page's JavaScript. Ambiguous shorthand (`mb`, `pc`, `mV`) is
resolved by documented rules in `src/lib/search/disambiguation.ts`; an unresolved ambiguity fails the
catalog test (UNIT_CATALOG §6).

## 12. Local preferences are external stores

**Decision.** Favourites, recent conversions, precision and theme live in localStorage and are read
through `useSyncExternalStore` (`src/lib/persistent-store.ts`).

**Why.** Every component sees the same state, other tabs stay in sync, hydration is correct, and there
is no effect-driven double render. Saved and recent lists sit behind a disclosure, because rendering
them on load would shift the page on every visit.

## 13. Design system deviations from DESIGN.md

**Context.** `DESIGN.md` is a reference for Vercel's design language rather than a converter design,
and documents a light palette only.

**Decisions.**

- A dark palette derived from the same achromatic scale, to meet CLAUDE.md's light/dark/system
  requirement.
- A content type scale starting at 16px. DESIGN.md's `p: 12px` is a marketing-page measurement and
  would fail readability and contrast needs for long reference content.
- Body-size links use `#0062D1` (5.1:1 on the canvas) rather than `#0072F5` (4.1:1); `#0072F5` remains
  the focus ring. `#8F8F8F` is used only for decorative elements, never for text.

Kept from DESIGN.md: shadow-as-border, the double-ring focus indicator, the 4px spacing scale, the
400/500/600 weight rule, Geist, and colour-only interaction feedback.

## 14. No UI component, icon or class-merging libraries

**Decision.** A hand-built accessible combobox, a local set of inline icons, and a minimal `cn` helper
without `tailwind-merge`.

**Why.** The unit selector is the product's core control and needs exact keyboard and mobile
behaviour; the icon set is a dozen glyphs. The rule that replaces `tailwind-merge`: never override a
component's display, colour or weight utilities from a call site, because two competing utilities are
resolved by stylesheet order, not class order. A header button once stayed visible on phones for
exactly this reason.

## 15. Content-Security-Policy allows inline scripts

**Decision.** `script-src 'self' 'unsafe-inline'`; every other directive is locked to the site's own
origin.

**Why.** A nonce-based policy needs per-request rendering, which would end static generation for every
page. The site renders no user-supplied HTML, and its inline scripts are Next's payload and the theme
initialiser. Providers added later must be allowed explicitly.

## 16. Canonical origin is required; previews are noindex

**Decision.** Production builds fail without `NEXT_PUBLIC_SITE_URL`. Vercel preview deployments and
`SITE_NOINDEX=true` serve `noindex` and a disallow-all robots.txt.

**Why.** Canonical URLs, the sitemap and structured data are baked in at build time; a guessed origin
would silently point search engines elsewhere, and a crawlable preview is duplicate content.

## 17. Uppercase URLs redirect to lowercase

**Decision.** `src/proxy.ts` sends a 308 for any path containing capitals; its matcher only matches
such paths.

**Why.** SEO_SPEC §17 rules out duplicate URLs for case variations. Case-insensitive file systems can
otherwise serve the prerendered page under a capitalised URL.

## 18. Generated content says only what the data supports

**Decision.** Conversion pages lead with the exact ratio for proportional units, and with the formula
for temperature and fuel economy. "How many X are in a Y" is asked only for proportional pairs.
Temperature pages answer questions about reference temperatures and degree size instead. Unit notes
are shown as notes, not turned into questions.

**Why.** "1 °C = 33.8 °F" is true but invites multiplying by 33.8. SEO_SPEC §13 and the instruction
not to create fake FAQs rule out questions whose answers do not match them.

## 19. Toolchain versions

**Decision.** TypeScript 5.9 and ESLint 9.

**Why.** `typescript-eslint` does not support the TypeScript 7 API, and the React plugin bundled with
`eslint-config-next` uses APIs removed in ESLint 10.
