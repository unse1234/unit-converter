# UnitFlip SEO remediation tracker

Started: 2026-10-16 (Asia/Karachi). Scope: implement and verify repository changes; deployment and Google's reassessment are separate steps.

## Evidence and constraints

- Working tree started clean at `7c21083`.
- Framework: Next.js App Router, static `out/` export; Cloudflare Workers assets configured in `wrangler.jsonc`.
- The user supplied 97 unique affected URLs, all HTTP variants; six representative aliases redirect directly to their successful HTTPS equivalents. Google-selected canonical inspection fields and page-level performance data remain unavailable. Public declarations cannot establish Google's selected canonical or explain the reported traffic decline by themselves.
- Inventory and history are established: the stale starting checkout lacked 360 published localized URLs. Fast-forwarding to cached upstream preserved the current 1,187 preferred sitemap URLs before implementation.

## Implementation batches

- [x] Read request; inspect framework, route/data structure and hosting configuration.
- [x] Establish complete generated/exported/sitemap inventory and recent routing/deployment evidence.
- [x] Capture baseline audit and modest public-site sample; separate confirmed issues from hypotheses.
- [x] Fix shared canonical, routing, sitemap and indexing signal defects, preserving valuable URLs.
- [x] Review conversion constants against primary references; improve category and direction-specific content through shared rendering.
- [x] Verify actual localization inventory, self/reciprocal relationships and language coverage.
- [x] Add focused regressions and reusable machine-readable full URL audit.
- [x] Run unit/integration checks, lint, typecheck, production build, full URL audit and desktop/mobile interaction QA.
- [x] Record before/after evidence, intentional exceptions, remaining specialist/deployment work and Search Console follow-up.

## Sources to consult

Current official Google Search Central guidance on canonical consolidation, helpful content, localized versions and structured data; primary standards references for conversion constants. URLs and supporting findings will be recorded in the final report.

## Progress notes

Initial inspection found shared metadata/sitemap configuration in `src/lib/site.ts` and catalog-driven category/pair routes. The initial checkout was English-only; the history/live comparison below established the actual multilingual deployment before edits.

The cached upstream branch was two commits ahead, adding the published multilingual implementation.
Fast-forwarded cleanly from `7c21083` to `4837a91` before implementation to preserve existing public URLs.
Live sitemap: 1,187 preferred URLs, including 360 localized pages (es86, pt78, it87, fr60, id49).
The stale September 21 local export has 827 sitemap URLs and localhost signals; it is explicitly an
artifact baseline, not evidence of current production metadata. A modest live sample (45 HTTP requests
including targets) found correct declared content canonicals and language relationships; no evidence
yet establishes Google's selected canonical or the cause of the reported impressions drop.

Implemented production-origin guard; permanent normalization for proven HTML equivalents with query
state retained; omitted invented sitemap dates; focused numerical/formula/domain and locale parsing
fixes; reviewed category-specific assumptions/reference sections; removed repetitive generated FAQs.
Production build (including the Windows router-payload postbuild repair), unit/integration checks,
TypeScript and ESLint have passed. Full Workers HTTP audit passed: 1,187 sitemap URLs, 1,202 URL
checks, no reported errors/warnings or broken internal targets, and all 97 supplied HTTPS
destinations successful/indexable with matching canonicals. Browser checks and visual review are
complete; the remaining intermittent hydration observation is explicitly documented in the QA
report. Final unit/integration run: 362 passed. Final visual/interaction sweep: 23/23 passed.

The subsequently supplied affected list contains 97 unique HTTP URLs. Six representative originals
returned 301 directly to the same-path HTTPS page; all six destinations returned 200, one matching
self-canonical and index/follow directives (`seo-gsc-sample.json`, concurrency 2). Preserve this
intentional protocol consolidation. The reported crawl dates do not establish exclusion-onset dates
or causality for the impressions decline; preferred HTTPS inspection/performance evidence is still needed.

The user confirmed that the affected Search Console report uses the Domain property `unitflip.org`.
An HTTP-only URL-prefix property scope is therefore not the explanation for the impressions drop.

Delivery: `seo-remediation-report.md`, `seo-rendered-qa.md`, `seo-audit-after.json`, the content and
localization reviews, and baseline/live snapshots. Implementation/verification are complete;
production deployment, DNS checks, Google inspection/recrawl and the documented hydration follow-up
remain external or subsequent steps. No recovery/ranking/indexing outcome is promised.
