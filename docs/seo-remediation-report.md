# UnitFlip SEO remediation — 2026-10-16–17

## Main finding and evidence limits

The supplied Search Console examples are **HTTP URLs**, not the preferred HTTPS URLs.
The cleaned list has 97 unique URLs (`search-console-affected-urls.txt`); duplicate pasted rows were
deduplicated and two accidentally concatenated URLs were separated. Six representative examples
were checked publicly: every HTTP URL returned a direct 301 to the same path on HTTPS; every HTTPS
destination returned 200, with one matching self-canonical and index/follow directives. This is
consistent with intentional HTTP-to-HTTPS consolidation. Do not try to index both protocols or
remove those canonical preferences merely to reduce the exclusion count.

Examples include English inches-to-meters, Indonesian TV, French temperature, US mpg-to-L/100 km,
Spanish mixed feet/inches, and bars-to-mmHg. Raw evidence is in `seo-gsc-sample.json`. Dates supplied
by the user range from September 22–28, 2026; these are reported crawl dates, not proof of when
exclusions began or what caused a traffic change.

**No confirmed cause of the impressions decline has been established.** The provided list does
not contain Google-selected canonical inspection fields or page-level performance data. Public
HTML reveals the declared canonical only. Inspect preferred HTTPS pages in Search Console and
compare performance within the same property/date/country/device filters. The user confirmed the
affected report is in the **Domain property `unitflip.org`**, which covers both protocols. An
HTTP-only URL-prefix reporting scope therefore does not explain this decline
([Google property guidance](https://support.google.com/webmasters/answer/34592?hl=en)).

## Confirmed defects corrected

| Finding                                       | Evidence / before                                                                                                                                                 | Implemented behavior                                                                                                               |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Stale checkout versus published site          | Started at `7c21083`; cached upstream `4837a91` and live sitemap already included five languages                                                                  | Fast-forwarded before edits, preserving 360 published localized URLs                                                               |
| Build-origin contamination risk               | Saved September 21 export contained localhost canonicals/sitemap; old build guard only warned                                                                     | Canonical origin is always `https://unitflip.org`; production builds reject conflicting legacy configuration                       |
| Weak path normalization / outdated tests      | Live slash and `.html` variants 307; known case variants 404; old tests used `serve`, which does not implement Workers behavior                                   | Workers returns a single 308 for proven HTML equivalents and preserves query state; tests use real Wrangler assets runtime         |
| Windows static-export prefetch files          | Installed Next 16.3.5 export feeds Windows separators to a slash-only filename encoder: nested segment files do not match the dotted URLs requested by the client | A guarded postbuild step copies only generated segment resources to the expected names; Linux exports are unchanged                |
| Router payload encoding redirect              | Assets redirects literal `$d$` keys to percent-encoded spellings; on an HTTP preview the production CSP upgrades that redirect to unsupported local HTTPS         | The Worker fetches the encoded data-asset spelling internally, preserving request headers/query and returning the payload directly |
| Invented modification dates                   | Every sitemap URL used build-time `new Date()`                                                                                                                    | Omit `lastmod` until trustworthy content dates exist                                                                               |
| Incorrect visible tiny-factor formulas        | Fraction tolerance could render small positive constants as `0/2`                                                                                                 | Relative fraction checks reject zero approximations; full pair arithmetic sweep added                                              |
| Divisor precedence                            | Coulombs-to-mAh could display `C ÷ 18/5`                                                                                                                          | Fractional divisors are parenthesized                                                                                              |
| Convention/data mismatches                    | US therm factor used BTU IT; conventional mmHg and water-column labels disagreed with stated source; older atomic mass value                                      | Correct named conventions, update CODATA value/uncertainty and add independent fixtures                                            |
| Domain checks bypassed by identity conversion | Same-unit shortcut preceded physical-domain validation                                                                                                            | Invalid temperatures and nonpositive fuel-economy inputs are consistently checked                                                  |
| Localized numeric ambiguity                   | `1,234` could mean 1234 in comma-decimal locales; grouped decimal input failed                                                                                    | Parse each page's decimal/grouping convention, including mixed-height input                                                        |
| Unsupported precision and repetitive content  | Blanket “exact” claims and repeated generated FAQs                                                                                                                | Mark display rounding, state category assumptions, show visible sources, retain authored distinctions                              |

The localhost export is **stale local artifact evidence**, not evidence that the current public
site serves localhost tags. The sample of live content did not reveal an English/translated
canonical collision. Temporary redirects and case handling were technical improvements; neither
is proven to explain the Search Console report or the traffic drop.
The prefetch packaging defect was reproduced against the **local Windows export**. It caused browser
console 404s during verification; it has not been established on the Linux-built public deployment.

## Inventory and page purpose

The existing sitemap has 1,187 preferred URLs: 827 English and 360 localized (es86, pt78, it87,
fr60, id49). English coverage comprises 34 categories, 2 collections, 786 directional conversion
pages, home and four informational pages. `/search` remains a noindex utility; JSON, robots,
manifest, assets and error documents are not organic landing pages.

Forward/reverse tasks retain separate paths, initialized converters, direction-specific formulas,
examples, tables and relevant links. Category/collection hubs retain their navigation purpose and
gain assumptions and comparisons. Localized fixed-value, TV-size and mixed-height pages retain
their distinct initialized tasks; no mass consolidation/noindex decision was made from text
similarity. Hreflang only references existing equivalents with appropriate self/reciprocal links.
Query parameters represent converter state on an existing landing page; they remain usable while
the editorial page keeps its clean canonical. Material fixed-value/geometry content retains its
published path. Tracking parameters are not included in canonical URLs or sitemaps.

Content/source review: `seo-content-review.md`. Localization, history, regional definitions and
remaining translation gaps: `seo-history-localization.md`. The conversion sweep validates generated
examples against the engine; separate NIST/BIPM/standards fixtures validate named constants and
formulas independently. These are distinct checks.

## Validation and reproducible audit

Final unit/integration checks: **362 passed across 13 files**, run serially with a longer timeout
because the initial concurrent checks exceeded this machine's resources. This includes the
router-payload encoding and rounded worked-answer regressions. TypeScript and ESLint passed.
The final production build generated **1,195 static outputs** and automatically
ran the postbuild repair, copying **1,549 router payloads** to their browser-requested names.
Tool regressions: **9 passed** (five auditor checks and four packaging checks).

The complete final HTTP audit passed on 2026-10-17 against Wrangler 4.151.1 at
`http://127.0.0.1:3100` with concurrency 3:

| Audit check                                        | Result                                                                                                        |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Sitemap URLs                                       | 1,187 unique, all preferred and successful                                                                    |
| Exported HTML                                      | 1,190 files: 1,187 organic pages, search utility and two error artifacts                                      |
| Audited URLs                                       | 1,202, including utility, query, alias and invalid-route checks                                               |
| Reported errors / warnings                         | 0 / 0                                                                                                         |
| Broken internal URL targets                        | 0                                                                                                             |
| Exact title/description/main-text duplicate groups | 0; this does not rule out meaningful similarities                                                             |
| Supplied affected URLs                             | 97/97 mapped to audited, indexable HTTPS pages with matching canonicals and sitemap membership                |
| Router payload packaging                           | 1,549 expected flattened files present; three representative HTTP payloads returned direct 200 text responses |

Declared canonical and reciprocal/self hreflang checks passed, including agreement with sitemap
alternates. Initial HTML contains the converter/content. The final visual/interaction sweep passed
**23/23 states**, with no console errors/warnings or horizontal overflow. Existing accessibility,
responsive, interaction, JavaScript-transfer and layout-shift checks were exercised in desktop and
mobile projects. Full outcomes, screenshots and the intermittent hydration observation are in
`seo-rendered-qa.md`; the browser runs are not represented as an unconditional zero-warning result.

- `npm run typecheck`
- `npm run lint`
- `npm run test -- --maxWorkers=1 --testTimeout=120000`
- Production build with `NEXT_PUBLIC_SITE_URL=https://unitflip.org`
- `npm run preview:workers -- --ip 127.0.0.1 --port 3100`
- `npm run audit:seo -- --base http://127.0.0.1:3100 --output docs/seo-audit-after.json`
- `npm run test:e2e -- --workers=2`

Intentional exceptions: `/search` has a clean self-canonical and noindex, remains crawlable, and is
absent from the sitemap. Known equivalent path variants permanently redirect; the sampled invalid
routes return real 404s. HTTP source variants remain outside the HTTPS sitemap. The 14 URL probes
are checks, not additional landing pages. No organic page was consolidated or noindexed from a
similarity score. All observed local exceptions are intentional; production edge/DNS and Google
inspection remain separate verification steps.

Audit provenance matters: `seo-audit-before.json` is the old local artifact; `seo-audit-live.json`
is a modest public sample, not a public full crawl. `seo-audit-after.json` covers the entire final
local production inventory through the actual Workers runtime. The audit reports HTTP redirects,
HTML/header robots, metadata, initial HTML, canonical/hreflang targets, sitemap relationships,
internal links and suspicious duplication. Duplication is a review signal, not a removal rule.

## Affected implementation files

- Preferred URLs and hosting: `src/lib/site-origin.ts`, `src/lib/site.ts`, `src/lib/seo/metadata.ts`,
  `src/app/sitemap.ts`, `src/hosting/worker.ts`, `next.config.ts`, `wrangler.jsonc`, and Cloudflare
  header/redirect configuration.
- Conversion accuracy and useful English content: `src/domain/conversion/{engine,domain-rules}.ts`,
  the reviewed constants/unit/category data, `src/lib/seo/{formula,conversion-content,conversion-guidance}.ts`,
  English category/pair/home/about routes, `ConversionSources.tsx` and `UnitReference.tsx`.
- Localized content and behavior: `src/i18n/{parse,format,content,guidance,metadata}.ts`, the
  Portuguese convention note, and the localized page/converter/height components.
- Verification and packaging: `scripts/audit-seo.mjs`, `scripts/fix-static-segments.mjs`, their
  regression fixtures, numerical/content/metadata/locale tests, browser regressions,
  `playwright.config.ts`, package scripts and generated-cache ignores.
- Evidence: this report, the tracked remediation plan, content/localization reviews, affected URL
  list and machine-readable baseline/live/final audit snapshots. No new dependency was installed.

## Deployment and remaining work

Changes are prepared locally; no production deployment or Search Console write was performed.
Use the existing Workers deployment pipeline with the updated `wrangler.jsonc`, Worker entry point
and `out/` build together. Recheck production responses after deployment. `www.unitflip.org` returned
`ENOTFOUND` in this environment; host redirect code cannot correct missing DNS/custom-domain routing.
Verify that hostname in Cloudflare before relying on it. Worker normalization adds a small request
handler for HTML routes, with probes only for path variants. Scripts, styles, fonts, images and
crawler/utility assets bypass it through selective Assets routing. No paid service was added;
HTML requests now invoke the existing Workers runtime and are subject to its existing plan limits.
Cloudflare dashboard rules/DNS remain outside repository verification.

Native-language editorial review remains appropriate for translated terminology and prose. Regional
recipe, land-area and trade-unit conventions must match the actual source record; the calculator
does not establish a universal legal definition or supply medical/radiation risk interpretation.
No expert endorsement, certified translation or guaranteed search eligibility is claimed.

Two transient local React hydration recoveries occurred during concurrent crawl/browser work.
Isolated reruns and 20 repetitions passed, and the final 23 inspected states were clear. Their
root cause is unconfirmed and remains a follow-up item; no evidence connects them to the reported
exclusions or impressions decline. Canonical stability assertions passed.

## Search Console follow-up

1. Continue using the confirmed Domain property `unitflip.org`; keep the same filters when comparing impressions and inspect HTTPS page-level performance.
2. Inspect a few supplied HTTP aliases **and their HTTPS destinations**. Compare user-declared and
   Google-selected canonical, last crawl, indexing eligibility, response and rendered content.
   If the HTTPS target is indexed and selected canonical, the HTTP exclusion is intentional.
3. After deployment, verify the updated sitemap, submit it if needed, and request indexing for a
   few important corrected **HTTPS pages**, not the HTTP aliases.
4. Monitor page-level impressions/clicks and inspection results after Google recrawls. Leave
   intentional duplicates consolidated. No immediate recovery, rankings or universal indexing
   is promised; the Search Console issue cannot be called resolved before reassessment.

Guidance consulted: [canonical consolidation](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls),
[canonical troubleshooting](https://developers.google.com/search/docs/crawling-indexing/canonicalization-troubleshooting),
[helpful content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content),
[localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions),
[structured data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies),
[Cloudflare HTML handling](https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/).
Visible authored structured data is retained only where supported; FAQ or other markup does not
promise rich results for a conversion site.
