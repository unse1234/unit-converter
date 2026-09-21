import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests run against the static export (`npm run build` first),
 * served as plain files — which is exactly what Cloudflare Pages serves.
 * Development mode has different rendering, no minification and extra
 * warnings, and `next start` does not work with `output: 'export'` at all.
 *
 * `serve` is used rather than a Next server so the tests exercise the real
 * artefact, including the extensionless-versus-.html resolution that a static
 * host performs.
 *
 * Port 3100 keeps the test server clear of a dev server on 3000.
 */
const PORT = Number(process.env.PORT ?? 3100);
const baseURL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './test-results',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  timeout: 45_000,
  expect: { timeout: 7_000 },
  use: {
    baseURL,
    locale: 'en-US',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    // `serve` maps /length to out/length.html and /404.html to unmatched
    // paths, the same way Cloudflare Pages does.
    command: `npx --yes serve out -l ${PORT} --no-clipboard`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
