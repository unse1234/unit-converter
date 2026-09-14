import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';

/** Automated WCAG 2.2 A/AA checks. They catch a subset of issues; manual review covers the rest. */
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

async function violations(page: Page): Promise<string[]> {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  return results.violations.map(
    (violation) =>
      `${violation.id} [${violation.impact}] ${violation.help} — ${violation.nodes
        .slice(0, 3)
        .map((node) => node.target.join(' '))
        .join(' | ')}`,
  );
}

const PAGES = [
  '/',
  '/length',
  '/cooking',
  '/length/meters-to-feet',
  '/temperature/celsius-to-fahrenheit',
  '/fuel-economy/liters-per-100-kilometers-to-miles-per-us-gallon',
  '/search?q=kg',
  '/about',
  '/privacy',
];

test.describe('light theme', () => {
  test.use({ colorScheme: 'light' });

  for (const path of PAGES) {
    test(`${path} has no WCAG violations`, async ({ page }) => {
      await page.goto(path);
      expect(await violations(page)).toEqual([]);
    });
  }
});

test.describe('dark theme', () => {
  test.use({ colorScheme: 'dark' });

  for (const path of ['/', '/length/meters-to-feet', '/search?q=kg']) {
    test(`${path} has no WCAG violations`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
      expect(await violations(page)).toEqual([]);
    });
  }
});

test.describe('interactive states', () => {
  test('the open unit list', async ({ page }) => {
    await page.goto('/length/meters-to-feet');
    await page.getByRole('button', { name: /^To/ }).click();
    await expect(page.getByRole('listbox')).toBeVisible();
    expect(await violations(page)).toEqual([]);
  });

  test('the saved and recent panel', async ({ page }) => {
    await page.goto('/length/meters-to-feet');
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await page.getByRole('button', { name: 'Saved & recent' }).click();
    expect(await violations(page)).toEqual([]);
  });

  test('the search dialog', async ({ page, isMobile }) => {
    await page.goto('/');
    await page
      .getByRole('button', { name: isMobile ? 'Search units and conversions' : /^Search units/ })
      .click();
    await page.getByRole('combobox', { name: 'Search units and conversions' }).fill('meter');
    await expect(page.getByRole('option').first()).toBeVisible();
    expect(await violations(page)).toEqual([]);
  });

  test('the mobile category menu', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'The menu only exists below the desktop breakpoint');
    await page.goto('/');
    await page.getByRole('button', { name: 'Open category menu' }).click();
    await expect(page.getByRole('dialog', { name: 'Categories' })).toBeVisible();
    expect(await violations(page)).toEqual([]);
  });

  test('invalid input', async ({ page }) => {
    await page.goto('/length/meters-to-feet');
    await page.getByLabel(/^Value in/).fill('abc');
    // Filtered: Next.js also renders an (empty) role="alert" route announcer.
    await expect(page.getByRole('alert').filter({ hasText: 'not a number' })).toBeVisible();
    expect(await violations(page)).toEqual([]);
  });
});
