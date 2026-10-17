# Reusable URL audit

`npm run audit:seo` inventories **all exported HTML routes and all sitemap URLs**, including pages missing from either source. It parses initial HTML without executing JavaScript. The JSON retains page metadata, language, form/content availability, exact main-text hashes, canonical and hreflang target checks, robots directives, HTTP response headers, redirects, links and investigative duplication signals.

Use the actual Workers assets runtime for the production HTTP check:

```powershell
# Build with the intended production origin first; see .env.example.
npm run build
npm run preview:workers -- --ip 127.0.0.1 --port 3100
```

In another terminal:

```powershell
npm run audit:seo -- --base http://127.0.0.1:3100 --concurrency 3 --output docs/seo-audit-after.json --fail-on-errors
```

`preview:workers` pins Wrangler 4.151.1. It runs `wrangler.jsonc`, the Worker entry point, `out/`, `_headers`, and `_redirects`; the auditor does not implement an approximate edge server. Dashboard redirect rules, DNS, TLS and CDN caching still require public-deployment checks. An HTTP run fetches the server's robots.txt and sitemap.xml and maps production-domain canonical/hreflang paths onto the supplied server for target verification. Production-domain declarations remain required even when auditing localhost.

Artifact-only inspection deliberately leaves HTTP statuses, headers and redirects unknown:

```powershell
npm run audit:seo -- --dir out --output docs/seo-audit-artifact.json
```

For a modest public sample, explicitly choose routes and cap network requests. Target and redirect requests count toward the cap:

```powershell
npm run audit:seo -- --base https://unitflip.org --urls '/,/length,/length/meters-to-feet,/length/feet-to-meters,/es,/pt,/it,/fr,/id,/length/,/length.html,/_seo-audit-invalid-route' --concurrency 3 --max-requests 60 --output docs/seo-audit-live.json
```

The tool uses `parse5`, already installed through the existing `jsdom` development dependency. It requires Node 20.9+ and repository dependencies. No additional package was installed. `--origin` changes the expected production origin for another deployment; `--dir` changes the export directory. Default concurrency is four, bounded at twelve. `--no-probes` suppresses the small additional normalization/invalid-route sample in a full HTTP run. `--fail-on-errors` fails on errors while retaining warnings for review.

`--affected-file` reads one affected URL per line and defaults to `docs/search-console-affected-urls.txt` when present. Each supplied URL is mapped to its same-path production HTTPS page and includes that page's audit status, canonical, language, indexability and sitemap membership. This mapping makes no additional request to each supplied HTTP URL. All 97 user-supplied examples use HTTP; their exclusion from the HTTPS sitemap is intentional. Original-protocol redirect evidence is recorded separately by the live investigation.

Run focused tool regressions with `node --test scripts/audit-seo.test.mjs`. They cover root URL equivalence, the intentionally noindex search utility, and HTTP robots/sitemap failures that must not silently fall back to valid artifacts.

## Reading the report

- `inventory` distinguishes preferred content, export-only URLs, sitemap-only URLs and noncontent error documents. Category/collection types use the repository's collection catalog; `/search` is a utility page.
- Per-page `status` is the original response; `finalStatus`, `finalUrl`, `redirectDestination`, and `redirectChain` preserve the subsequent response. Artifact runs never infer these from filenames.
- `canonicalCount` counts HTML canonicals; `headerCanonical` records separate HTTP Link declarations. Root URLs with or without an explicit final slash compare as equivalent WHATWG URLs.
- `robots` records page directives, `xRobotsTag` records response directives, and `crawlable` checks generic and Googlebot robots.txt rules. Target validity requires successful, crawlable, indexable destinations. Query and fragment targets are flagged for investigation.
- Hreflang checks cover absolute production URLs, language-tag syntax, successful targets, self-references, reciprocity, and agreement with sitemap alternates. The report cannot establish translation quality; that requires content review.
- Internal links are checked against the complete generated/sitemap/asset inventory. The full HTTP run separately fetches every generated/sitemap page. A public sample validates only sampled pages and their canonical/hreflang targets; unvisited sitemap URLs are inventory evidence, not independently verified responses.
- `suspiciousDuplicates` groups exact title, description, and initial-main-text matches. These are review signals, **not** proof of harmful duplication or instructions to consolidate URLs. No similarity threshold changes indexing behavior.
- Probe failures are separate from preferred content. Known equivalent spellings should permanently redirect; unknown routes should return 404. Converter query state should survive HTTP resolution while its HTML canonical points at the landing page.

## Captured evidence

`seo-audit-before.json` is an explicitly stale existing export, modified September 21, 2026. It contains 828 preferred English routes, including the noindex search page; 827 sitemap entries; and localhost canonical/robots/sitemap declarations. The git commit at audit time is **not** the build commit. Those declarations establish a local artifact/build configuration hazard and must not be presented as the live site's canonical state or the cause of Search Console exclusions.

`seo-audit-live.json` is the unchanged public deployment sampled October 16, 2026. It used 45 requests, including canonical/hreflang verification, sitemap and robots. The public sitemap contains 1,187 preferred URLs. Tested English content and all five locale home pages declare one appropriate production canonical. The root declaration `https://unitflip.org` is equivalent to `https://unitflip.org/`; the report's root-equivalence/reciprocity analysis was corrected offline from the recorded parsed metadata without another public crawl. Temporary 307 redirects for slash, `.html` and percent-encoded spellings, successful privacy redirect, and real invalid-route 404 responses are retained as response evidence. The guessed long fuel-economy slug in the sample is an invalid URL probe, not an omitted sitemap URL.

Public HTML shows the publisher's declarations. Google's selected canonical, historic impressions and the cause of the reported drop require Search Console data. Nothing in these reports claims that Google's classification has changed.
