# CLAUDE.md — Unit Converter Project

## Role

You are the lead engineer working on a production-grade unit conversion platform intended for public use, organic search traffic, and monetization.

Treat this as a real product, not a demo, tutorial, or throwaway prototype.

## Required Reading Order

Before making implementation decisions, read:

1. `PROJECT_REQUIREMENTS.md`
2. `DESIGN.md`
3. `UNIT_CATALOG.md`
4. `SEO_SPEC.md`
5. `ARCHITECTURE.md`

`README.md` is the project overview and setup reference.

If project requirements conflict with an implementation convenience, prefer the requirements unless there is a clear technical reason not to. Explain material deviations.

## Working Rules

### Inspect before changing

Before making a significant change:

1. Inspect the relevant repository structure.
2. Identify existing architecture and reusable code.
3. Identify dependencies already in use.
4. Check whether the requested capability already exists.
5. Propose the smallest coherent implementation.
6. Implement it.
7. Run the relevant type checks, linting, tests, and build checks.
8. Fix regressions before moving forward.

Do not rewrite working systems unnecessarily.

### Architecture rules

- Use TypeScript with strict type checking.
- Keep conversion logic independent from React/UI code.
- Keep unit data independent from presentation.
- Keep SEO generation independent from individual UI components.
- Prefer data-driven generation over duplicated pages/components.
- Prefer server/static rendering for SEO content and client interactivity only where needed.
- Avoid adding a backend or database unless a real requirement justifies it.
- Avoid dependencies that duplicate functionality already available in the platform or existing stack.
- Do not create one manually coded page/component per conversion pair.
- Do not hardcode conversion logic in UI components.

### Product-quality rules

A feature is not complete merely because the happy path works. Check:

- correctness
- accessibility
- responsive behavior
- loading states
- empty states
- error states
- keyboard interaction
- SEO implications
- performance implications
- test coverage
- maintainability

### Conversion accuracy

- Do not round intermediate calculations.
- Store authoritative constants in the unit/conversion data layer.
- Handle special/nonlinear conversions explicitly.
- Test zero, negative, decimal, very large, and very small inputs where applicable.
- Never silently return a plausible value when a conversion is unsupported or invalid.
- Make displayed precision a presentation decision, not a calculation shortcut.

### SEO rules

- Use clean, stable, human-readable canonical URLs.
- Do not make query-string URLs the primary SEO architecture.
- Do not generate thin pages solely by substituting keywords.
- Each indexable conversion page must provide useful conversion content around the interactive tool.
- Avoid accidental duplicate content and duplicate canonical URLs.
- Generate metadata, breadcrumbs, internal links, formulas, examples, and tables from structured data where practical.

### UI rules

- The converter is the primary product surface.
- Keep the interface visually clear and fast to understand.
- Do not let ads dominate the first interaction.
- Avoid unnecessary animation, excessive gradients, excessive glassmorphism, or decorative UI that reduces clarity.
- Design mobile intentionally rather than merely shrinking desktop.
- Support light, dark, and system themes.

### Performance rules

Target:

- LCP <= 2.5s
- INP <= 200ms
- CLS <= 0.1
- Lighthouse Performance 90+ mobile and 95+ desktop as a project target

Avoid unnecessary client-side JavaScript, large third-party bundles, blocking resources, and unoptimized assets.

### Accessibility rules

Target WCAG 2.2 AA.

Use semantic HTML, accessible labels, keyboard navigation, visible focus states, adequate contrast, touch-friendly controls, and reduced-motion support.

### Testing rules

At minimum, create/maintain tests for:

- conversion formulas
- conversion data integrity
- precision/formatting
- input validation
- unit search and aliases
- core converter interactions
- SEO route generation
- metadata/canonical generation
- critical responsive flows where practical

Every meaningful bug fix should include a regression test when practical.

### Verification commands

Use the actual repository scripts when available. At minimum, look for and run equivalent commands for:

- typecheck
- lint
- unit tests
- integration tests
- end-to-end tests
- production build

Never claim validation passed unless it actually ran and passed.

## Implementation Phases

Follow this sequence unless the repository state requires a different order:

1. Foundation and architecture
2. Conversion engine and authoritative data model
3. Core converter UX
4. Search, favorites, history, and utility interactions
5. SEO architecture and programmatic pages
6. Responsive/accessibility refinement
7. Performance optimization
8. Analytics and monetization readiness
9. Automated tests and production hardening
10. Final product audit

Do not jump directly to polish while core data correctness and architecture are unstable.

## Do Not

- Do not use fake conversion constants.
- Do not ship placeholder production data.
- Do not leave known broken routes.
- Do not leave silent TODO implementations in production paths.
- Do not add authentication unless required.
- Do not add a database unless required.
- Do not sacrifice core UX for advertising.
- Do not generate thousands of low-value SEO pages without useful content.
- Do not rewrite unrelated working modules.
- Do not hide errors with generic catch-all handling.

## Definition of Done

Before declaring the project production-ready, verify:

- TypeScript passes.
- Lint passes.
- Relevant tests pass.
- Production build passes.
- No known console errors remain.
- No hydration warnings/errors remain.
- Core routes work.
- Mobile and desktop layouts work.
- Keyboard navigation works for core flows.
- Conversion calculations are tested.
- Metadata and canonical URLs are generated correctly.
- Sitemap and robots.txt work.
- Error and 404 states work.
- No placeholder production content remains.
- No obvious performance regression remains.
- Documentation reflects the actual implementation.
