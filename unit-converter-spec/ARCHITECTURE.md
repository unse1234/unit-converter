# ARCHITECTURE.md — Technical Architecture

## 1. Recommended Stack

Recommended default stack:

- Next.js
- React
- TypeScript
- Tailwind CSS
- accessible headless/UI primitives where useful
- a small icon library
- a test runner appropriate to the repository
- Playwright or equivalent for E2E testing

The project should remain as server-rendered/static as practical for SEO content while using client components only where interactivity requires them.

## 2. High-Level Architecture

```text
                 ┌──────────────────────────┐
                 │       SEO / ROUTES       │
                 │ category + conversion   │
                 └────────────┬─────────────┘
                              │
                              ▼
                 ┌──────────────────────────┐
                 │       PAGE CONTENT        │
                 │ metadata / formula /     │
                 │ examples / links         │
                 └────────────┬─────────────┘
                              │
                              ▼
                 ┌──────────────────────────┐
                 │      CONVERTER UI        │
                 │ input / selectors /      │
                 │ result / copy / swap     │
                 └────────────┬─────────────┘
                              │
                              ▼
                 ┌──────────────────────────┐
                 │     CONVERSION ENGINE    │
                 │ normalize → convert →    │
                 │ format                   │
                 └────────────┬─────────────┘
                              │
                              ▼
                 ┌──────────────────────────┐
                 │       UNIT DATA          │
                 │ categories / units /     │
                 │ constants / metadata     │
                 └──────────────────────────┘
```

## 3. Data Layer

Unit and category definitions must be source-controlled structured data.

Possible organization:

```text
src/data/
  categories.ts
  units/
    length.ts
    mass.ts
    temperature.ts
    volume.ts
    ...
  conversions/
    special.ts
  seo/
    conversion-content.ts
```

Do not store unit definitions in React components.

## 4. Conversion Engine

The engine should expose functions conceptually equivalent to:

```ts
convert(value, fromUnitId, toUnitId)
formatConversionResult(value, options)
getUnit(unitId)
getUnitsByCategory(categoryId)
searchUnits(query)
```

The engine must be independently testable without rendering React.

## 5. Conversion Types

### Linear

For ordinary ratio-based units:

```text
base = value * factor
result = base / targetFactor
```

### Affine

For units involving scale and offset such as temperature:

```text
base = value * factor + offset
result = (base - targetOffset) / targetFactor
```

### Custom

For nonlinear/inverse/definition-sensitive conversions such as fuel economy.

These must use explicit named functions with tests.

## 6. Routing

Use data-driven dynamic routes.

Conceptual routes:

```text
app/
  page.tsx
  [category]/
    page.tsx
    [conversion]/
      page.tsx
```

Actual implementation may differ, but the principles must remain:

- route from structured data
- generate static metadata
- generate canonical URLs
- validate routes before rendering

## 7. Rendering Strategy

Prefer:

- static generation for stable conversion landing pages
- server rendering where dynamic server behavior is required
- client rendering for interactive converter state only

The interactive converter must not force the entire SEO page to become an unnecessarily large client bundle.

## 8. Components

Conceptual components:

```text
components/
  converter/
    Converter.tsx
    ValueInput.tsx
    UnitSelect.tsx
    SwapButton.tsx
    ResultDisplay.tsx
    PrecisionControl.tsx
  search/
  navigation/
  content/
  seo/
  ads/
  theme/
  ui/
```

Use composition rather than a monolithic converter component.

## 9. State Management

Avoid global state unless it materially simplifies shared behavior.

Local component state is appropriate for the active conversion.

Local persistence can be used for:

- recent conversions
- favorites
- theme preference where needed

If persistent cross-page state becomes complex, use a small focused state solution rather than introducing a heavy application-wide architecture prematurely.

## 10. Search Architecture

Search should use a normalized index over unit names, symbols, aliases, categories, and known conversion pairs.

Normalization should support:

- lower/upper case normalization
- whitespace normalization
- common aliases
- symbol recognition
- common natural-language forms

Do not create a new SEO URL for each alias.

## 11. Analytics Architecture

Expose a small application-level event API:

```ts
track(eventName, payload)
```

Only the analytics adapter should know the provider-specific implementation.

## 12. Ad Architecture

Expose reusable ad slot boundaries.

Requirements:

- ad slots can render nothing safely
- layout does not collapse unpredictably when ads load
- no ad is embedded inside core converter controls
- ad provider-specific code is isolated

## 13. Error Boundaries

Provide:

- application-level error boundary
- route-level not-found handling
- clear converter validation states
- graceful search failure behavior

Do not expose internal stack traces to end users.

## 14. Security

Use standard web security practices:

- HTTPS in production
- secure headers where appropriate
- Content Security Policy when compatible with chosen services
- no secrets in client bundles
- dependency auditing
- controlled third-party scripts

## 15. Performance Architecture

Use:

- static assets
- optimized fonts
- image optimization where images exist
- minimal client components
- code splitting
- caching
- CDN deployment

Avoid loading analytics, ads, or noncritical scripts before the core UI is useful.

## 16. Testing Architecture

Recommended structure:

```text
tests/
  unit/
    conversion/
    formatting/
    search/
  integration/
  e2e/
```

Keep conversion engine tests independent from browser tests.

## 17. Deployment

The architecture should be deployable on a modern CDN/serverless/edge-friendly platform.

The application should not require a persistent Node process merely to perform static conversion pages.

## 18. Future API

A public conversion API may be added later.

The internal conversion engine should therefore remain framework-agnostic enough that it could be reused behind an API route in the future.

Do not implement the public API in the initial release unless explicitly requested.

## 19. Directory Blueprint

A reasonable baseline:

```text
src/
  app/
    page.tsx
    [category]/
      page.tsx
      [conversion]/
        page.tsx
    not-found.tsx
    robots.ts
    sitemap.ts
  components/
    converter/
    navigation/
    search/
    content/
    seo/
    ads/
    ui/
  lib/
    conversion/
    search/
    seo/
    analytics/
    formatting/
  data/
    categories/
    units/
    conversions/
  types/

public/

tests/
```

The actual tree may evolve. Avoid forcing this exact structure when repository conventions make another clean structure more appropriate.
