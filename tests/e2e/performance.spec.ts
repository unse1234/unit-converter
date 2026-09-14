import { expect, test } from './fixtures';

/*
 * Guards against regressions in what users actually download and experience.
 * The thresholds sit a little above the measured values: they are meant to
 * fail when something heavy is added, not to chase single bytes.
 */

/** Compressed JavaScript transferred before the page is interactive. */
const JS_BUDGET_BYTES = 200_000;

declare global {
  interface Window {
    __cls: number;
    __lcp: number;
  }
}

for (const path of ['/', '/length/meters-to-feet', '/volume']) {
  test(`${path} stays within the JavaScript budget`, async ({ page }) => {
    await page.goto(path, { waitUntil: 'networkidle' });

    const transferred = await page.evaluate(() =>
      performance
        .getEntriesByType('resource')
        .filter((entry) => (entry as PerformanceResourceTiming).initiatorType === 'script')
        .reduce((sum, entry) => sum + (entry as PerformanceResourceTiming).transferSize, 0),
    );

    test.info().annotations.push({ type: 'js-transfer-bytes', description: String(transferred) });
    expect(transferred).toBeGreaterThan(0);
    expect(transferred).toBeLessThan(JS_BUDGET_BYTES);
  });

  test(`${path} does not shift layout while loading`, async ({ page }) => {
    await page.addInitScript(() => {
      window.__cls = 0;
      window.__lcp = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as (PerformanceEntry & {
          value: number;
          hadRecentInput: boolean;
        })[]) {
          if (!entry.hadRecentInput) window.__cls += entry.value;
        }
      }).observe({ type: 'layout-shift', buffered: true });
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        window.__lcp = entries[entries.length - 1]?.startTime ?? 0;
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    });

    await page.goto(path, { waitUntil: 'networkidle' });
    // Let hydration and any post-hydration updates settle.
    await page.evaluate(() => new Promise((resolve) => setTimeout(resolve, 1000)));

    const { cls, lcp } = await page.evaluate(() => ({ cls: window.__cls, lcp: window.__lcp }));
    test
      .info()
      .annotations.push(
        { type: 'cls', description: cls.toFixed(4) },
        { type: 'lcp-ms', description: lcp.toFixed(0) },
      );
    expect(cls).toBeLessThan(0.1);
  });
}
