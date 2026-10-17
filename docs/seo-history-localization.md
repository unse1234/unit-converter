# SEO history, localization, and evidence boundaries

Investigation date: 2026-10-16 (Asia/Karachi). Public observations are snapshots, not Search Console inspection data. The user subsequently supplied the affected URL examples, all using `http://unitflip.org`. Page-level impressions and Google-selected canonical inspection data were not supplied.

## Checkout and deployment inventory

The starting local `main` was `7c21083`, two commits behind already cached `origin/main` (`4837a91`). The latter merges `359975d`, dated 2026-09-25, which added five localized sections and moved English routes into `(main)` without changing their public paths. The parent task fast-forwarded to `4837a91` before implementing changes. No new remote deployment was performed.

The public sitemap fetched on 2026-10-16 contains **1,187 URLs**, matching the multilingual source inventory. The starting checkout would have generated only **827 English URLs**. Treating it as the current deployed inventory would have omitted **360 already published localized URLs** from the next deployment. This is a confirmed checkout/deployment mismatch and a prevented regression; it does not establish why impressions dropped.

| Language         | Published preferred URLs |
| ---------------- | -----------------------: |
| English          |                      827 |
| Spanish `/es`    |                       86 |
| Portuguese `/pt` |                       78 |
| Italian `/it`    |                       87 |
| French `/fr`     |                       60 |
| Indonesian `/id` |                       49 |
| Total            |                    1,187 |

English includes 34 conversion categories, 2 collection hubs, 5 informational/home pages, and 786 direction-specific conversion pages. Search, the search-index JSON, robots, manifest, assets, and 404 documents are utility routes rather than additional organic landing pages. Localized pages include language homes, category hubs, pair conversions, selected fixed-value conversions, 16:9 TV-size calculations, and a feet-and-inches height calculator. They are authored subsets, not translations of every English route.

Earlier relevant changes: `21228c8` changed Cloudflare redirects on 2026-09-21; `9ba2d08` disabled workers.dev URLs later that day; `359975d` added locale roots, canonical/hreflang generation, sitemap alternates, and global not-found handling on 2026-09-25. Git timestamps indicate available implementation history; they do not prove a deployment date or a Google recrawl date.

## Public sample and confirmed localization defects

The sitemap and robots were fetched once. A separate eight-URL sample used concurrency 2 and a browser-like audit User-Agent. The seven valid localized pages returned 200 with one absolute self-canonical, index/follow directives, translated title/description/H1, and the expected HTML language. The invalid localized route returned 404. The saved observations are in `seo-live-sitemap-baseline.json` and `seo-live-localization-baseline.json`. A default Python User-Agent initially received 403; the audit User-Agent succeeded, so that first response does not establish a Googlebot block.

Examples checked include Spanish inches-to-centimeters and 6-inch answers, Portuguese centimeters-to-inches and alqueires, Italian 55-inch screen dimensions, French cups-to-milliliters, and Indonesian ons-to-grams. None of these declared an English canonical. This sample does not exclude a defect elsewhere and cannot identify Google's selected canonical.

After receiving the affected examples, six of those exact HTTP paths were checked with concurrency 2: `/length/inches-to-meters`, `/id/tv`, `/fr/temperature`, `/fuel-economy/miles-per-us-gallon-to-liters-per-100-kilometers`, `/es/longitud/pies-y-pulgadas-a-cm`, and `/pressure/bars-to-mmhg`. Every first response was a Cloudflare **301 directly to the same path on HTTPS**. Each HTTPS destination returned **200**, one matching self-canonical, index/follow directives, and its expected language. Evidence is recorded in `seo-gsc-sample.json`.

This confirms intended HTTP-to-HTTPS consolidation in the representative affected examples, which should be preserved. It does not establish the Google-selected canonical for the historical crawl or explain the impressions change. The affected HTTP variants should not be made independently self-canonical/indexable to reduce an exclusion count; investigation should prioritize their HTTPS destinations and actual performance data.

The source review established the following defects independently of search performance:

- A Portuguese/Italian/French/Indonesian `1,234` input was interpreted as 1234 rather than 1.234; localized grouping such as `1.234,5` failed. The locale parser now prioritizes the page's decimal and grouping convention while preserving fractions and scientific notation. The same parser is used by the height calculator.
- A loose numerical tolerance could label rounded twelve-digit multipliers exact. Kilograms-to-pounds now uses division by the exact stored pound definition; worked examples use `≈` when their displayed answer is rounded. Exactness here describes the displayed constant relative to the stored engine factor, not a claim that every historical/conventional definition is universally exact.
- Generated FAQs repeated the answer, formula, and worked example on pair/value/TV pages. Repeated generated FAQs were removed from rendering; authored questions about actual unit distinctions remain.
- Open Graph locale lists advertised all launch languages even where no equivalent page existed. They now derive from the actual equivalence registry.
- The Portuguese cup note stated 240 ml as universal across Brazilian recipes. It now explicitly identifies the convention this calculator uses and asks readers to check the recipe/utensil.

## Localization preservation and usefulness

All existing localized routes remain available. Their canonical URLs stay in the same language. Hreflang clusters use existing equivalents only, include self and reciprocal references when a cluster has multiple languages, and include English/x-default only when an English equivalent exists. A local-only Indonesian ons or Brazilian alqueire page intentionally has no fabricated English alternate. Portuguese TV pages and Italian/French inch-value pages share a cluster when they answer the same diagonal/16:9 screen-size task; generic inch values without TV context do not acquire unrelated homepage alternates.

Localized category hubs now provide linked numerical comparisons in addition to navigation and their working converter. Conversion and category pages expose translated assumptions, precision behavior, and visible references in initial HTML. Distinctions cover international feet, ordinary versus troy ounces, regional mass/area conventions, absolute versus difference temperatures, US versus Imperial volume, ingredient density, and the 16:9 screen assumption. Regional references supplement BIPM/NIST sources; they are not attributed to SI standards.

Fixed-value pages are retained because they provide an initialized task-specific converter, visible calculation, nearby-value table, and links to the general pair. Screen-size and mixed feet/inches pages provide additional geometry or input behavior. Forward/reverse pairs retain their own task direction, formula, examples, and navigation. No similarity score is used to mass-consolidate or noindex these pages. Their ongoing organic value should be reviewed using actual page-level Search Console evidence.

Remaining editorial limits: translations are authored text, not certified translations. Native-language editorial review is recommended for legacy research-based titles and the new explanatory prose. Informational/footer destinations remain English and declare `hreflang="en"`; full localized legal/contact pages were not fabricated. Shared theme-toggle accessibility text is English in localized chrome. Regional conventions must be checked against a user's actual recipe, land record, or trade document; the references below support the calculator's named conventions rather than a universal legal definition.

Focused verification: `npm run test -- tests/unit/i18n/localized.test.ts` passed **19/19 tests**, covering the complete localized metadata registry, canonical self-references, reciprocal clusters, absence of fabricated translations, locale number parsing, formulas, regional units, and screen dimensions. The parent task owns the final whole-site build, full URL audit, browser checks, and their consolidated results.

## Official Google guidance consulted

- [Canonical consolidation](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls): use consistent preferred URLs across redirects, canonical tags, internal links, and sitemaps; keep canonical metadata stable in source HTML and preserve a same-language canonical for translated content. Canonical signals express a preference rather than proof of Google's choice.
- [Localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions): use fully qualified URLs for actual equivalent language pages, including reciprocal/self references. Translated main content is not automatically duplicate content; language annotations alone do not translate a page.
- [Helpful, reliable content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content): prioritize successfully completing the visitor's conversion task, accurate distinctions, original utility, and clear sourcing. Added word count or repeated keyword FAQs do not establish usefulness.
- [Structured data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies): markup must reflect visible, relevant content and satisfy the feature's requirements. Existing visible WebPage/Breadcrumb information is appropriate; retaining visible authored FAQ content does not promise FAQ rich-result eligibility or display.
- [Canonical troubleshooting](https://developers.google.com/search/docs/crawling-indexing/canonicalization-troubleshooting): the URL Inspection tool is needed to check Google's selected canonical. Public HTML only shows the site's declaration.

## Regional definitions checked

- [Karawang education lesson](https://karawangkab.go.id/berita/sturada-894-fm-siarkan-pjj-untuk-siswa-sd-kelas-2-dan-5-0) supports the everyday Indonesian ons convention of 100 g.
- [Indonesian education ministry mathematics module](https://repositori.kemdikbud.go.id/18693/1/MTK%20Paket%20A%20Kesehatan%20Masyarakat%20Modul%205_sip%20for%20ISBN.pdf) gives the kuintal convention of 100 kg.
- [Embrapa livestock study](https://www.alice.cnptia.embrapa.br/alice/handle/doc/194817) uses the 15 kg carcass arroba convention.
- [eduCAPES applied education material, PDF page 10](https://educapes.capes.gov.br/bitstream/capes/921958/2/Produto%20educacional%20Kelli.pdf#page=10) lists the named paulista/mineiro/baiano alqueire values (24,200 / 48,400 / 96,800 m²) and explains regional variation. This is educational support, not land-title advice.
- [Goiânia education material](https://sme.goiania.go.gov.br/conexaoescola/eaja/matematica-medidas-de-capacidade-padronizadas-e-nao-padronizadas/) demonstrates a 240 ml tea cup convention. It does not establish the capacity of every physical cup.

## Search Console follow-up after deployment

1. Export affected URLs and the prior/current page-level performance data. Identify the previously valuable preferred pages and separate aliases/query variants from distinct conversions and translations.
2. Inspect each priority affected URL and its declared destination in URL Inspection. Compare Google-selected and user-declared canonicals, last crawl, crawl response, and rendered content; also inspect each language's actual equivalent.
3. After deploying and verifying the new responses/canonicals, submit the updated sitemap if needed and request indexing for a small number of important corrected pages.
4. Monitor the same page-level impressions/clicks and canonical classifications after recrawling. Do not treat the exclusion count or one improved HTML response as proof that Google has reassessed every URL; no recovery timeframe or indexing guarantee is made.
