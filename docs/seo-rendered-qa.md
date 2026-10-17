# Rendered QA — 2026-10-17

## Findings

Two deployment defects found by browser checks were fixed: Windows-exported router payloads had
filenames different from the client's requests, and Assets exposed an encoding redirect for `$d$`
payload keys. The build now repairs the filenames and the Worker fetches the encoded resource
internally. All 1,549 required payload copies exist; three audited data requests returned direct
200 text responses. Client navigation from home to category to pair uses one document load.

**Remaining observation:** two checks logged React recoverable hydration error #418 while a full
crawl and two browser workers ran concurrently: desktop `/length` and mobile `/search?q=feet`.
Both passed isolated reruns, and 20 subsequent repetitions across desktop/mobile passed without
errors. The final 23-state visual/interaction sweep also recorded no errors or warnings. The
component/root cause is unconfirmed; this is not presented as fixed or as a cause of the Search
Console issue. No canonical change was observed. Keep production console checks and an isolated
hydration investigation on the follow-up list; errors have not been suppressed in the fixtures.

## Summary and environment

The flow under test is: open a conversion/category page, confirm its language and initial content,
change input or follow a category/pair link, and verify the result and preferred canonical.

- Final production export served at `http://127.0.0.1:3100` through Wrangler 4.151.1 and the actual
  Worker/assets/header/redirect configuration.
- Browser plugin not available; regular installed Playwright 1.63.0/Chromium was used.
- Automated projects: Desktop Chrome and Pixel 7. Geometry checks covered widths 320, 375, 390,
  414, 768, 1024, 1280, 1440 and 1920 across six representative routes.
- Separate final inspection: 16 desktop states at 1440×900 and seven mobile states at 390×844.
  The screenshots were visually inspected for clipping, overlap, legibility and usable controls.

## Changes verified

The English converter, formulas, reference tables, source/precision sections and related links
retain the existing design. Forward/reverse routes remain distinct. Temperature offsets and the
absolute-zero boundary work. Volume systems, reciprocal fuel economy, decimal/binary storage,
calendar assumptions, pressure and charge formulas were checked. English plus all five localized
sections were represented; fixed-value, screen-size and mixed-height pages were also covered by
the browser suite.

## Checks

| Check                                              | Final inspected states                                                                        |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Page identity, title, one H1 and expected language | 23/23 passed                                                                                  |
| Meaningful main content / no blank page            | 23/23 passed                                                                                  |
| Framework error overlay                            | None in inspected states                                                                      |
| Console errors and warnings                        | Zero in the final 23 states; intermittent concurrent-run observation above remains documented |
| Canonical before/after input                       | Stable, one production URL in tested interactions                                             |
| Horizontal overflow                                | None in 23 inspected states; separate geometry suite passed all nine widths                   |
| Screenshot evidence                                | Desktop converter/formula/sources, Indonesian table, Portuguese mobile result inspected       |
| Interaction proof                                  | Numeric results below and client-navigation regression passed                                 |
| Accessibility                                      | Existing WCAG-tagged light/dark/interactive/localized axe checks passed in both projects      |
| Loading checks                                     | Existing JS-transfer budget and layout-shift checks passed in both projects                   |

## Interaction loop and command outcomes

- `/length/meters-to-feet`: entering `10` displays `32.8084 ft`; the heading/canonical remain about
  meters-to-feet. The rounded static worked example correctly uses `≈`.
- `/temperature/fahrenheit-to-kelvin`: entering `-459.67` displays `0 K` rather than a domain error.
- `/pt/comprimento/polegadas-em-cm`: entering `1,234` displays `3,13436 cm`, preserving Portuguese
  decimal notation and the same page canonical.
- Home → Length → Meters to feet changes content/canonical through working router payloads,
  without falling back to another document load. Desktop and mobile checks passed.

The full 172-case browser run produced 152 passes, 18 intentional device-specific skips, and two
failures from an obsolete homepage assertion expecting one JSON-LD block. The actual visible
publisher/site schemas are Organization and WebSite. The assertion now validates those types;
both failed cases passed on rerun. No schema was removed to satisfy a count.

After the final precision text change, the 42-case page/SEO rerun produced 39 passes, one
device-specific skip and the two intermittent recoveries described above. Both isolated reruns
passed, followed by all 20 diagnostic repetitions and all 23 final inspected states.

Key commands:

```powershell
npm run test:e2e -- --workers=2
npm run test:e2e -- tests/e2e/pages.spec.ts tests/e2e/seo-signals.spec.ts --workers=2
npm run test:e2e -- tests/e2e/pages.spec.ts tests/e2e/seo-signals.spec.ts --grep 'explains the category|search is a crawlable' --repeat-each=5 --workers=1
```

The temporary inspection script and per-state JSON remain outside the repository at
`C:/Users/Unse/AppData/Local/Temp/unitflip-seo-qa/inspect.mjs` and `results.json`.

## Remaining limits

No production deployment, DNS/dashboard change or Search Console inspection was performed. Native
Safari/Firefox, assistive-technology testing and mobile clipboard permissions were not covered.
Native-language editorial review remains appropriate. The Browser plugin can simplify future
in-app visual review; the current evidence uses the repository's Playwright workflow.

## Screenshots

![Desktop formula with approximate worked answer](C:/Users/Unse/AppData/Local/Temp/unitflip-seo-qa/desktop-formula.png)
![Desktop definitions and sources](C:/Users/Unse/AppData/Local/Temp/unitflip-seo-qa/desktop-sources.png)
![Portuguese mobile decimal input and result](C:/Users/Unse/AppData/Local/Temp/unitflip-seo-qa/mobile-portuguese-result.png)
![Indonesian screen-size table](C:/Users/Unse/AppData/Local/Temp/unitflip-seo-qa/desktop-indonesian.png)
