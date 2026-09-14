import { expect, test, valueField } from './fixtures';

test.describe('homepage', () => {
  test('leads with a working converter', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Convert any unit, instantly.',
    );
    await expect(page.getByLabel(valueField)).toHaveValue('1');
    await expect(page.getByTestId('result')).toHaveText(/^3\.28084\s*ft$/);

    await page.getByLabel(valueField).fill('10');
    await expect(page.getByTestId('result')).toHaveText(/^32\.8084\s*ft$/);
  });

  test('links to every category', async ({ page }) => {
    await page.goto('/');
    for (const name of ['Length', 'Temperature', 'Fuel Economy', 'Radioactivity']) {
      await expect(page.getByRole('main').getByRole('link', { name, exact: true })).toBeVisible();
    }
  });

  test('has a canonical URL and structured data', async ({ page }) => {
    await page.goto('/');
    // The site root, with or without its trailing slash (the same URL).
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      /^https?:\/\/[^/]+\/?$/,
    );
    await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);
  });
});

test.describe('category page', () => {
  test('explains the category and links every unit and conversion page', async ({ page }) => {
    await page.goto('/length');

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Length & Distance Converter');
    await expect(page.getByRole('heading', { name: 'All units' })).toBeVisible();
    await expect(page.getByRole('table')).toContainText('nautical mile');
    await expect(
      page.getByRole('link', { name: 'Meters to feet', exact: true }).first(),
    ).toHaveAttribute('href', '/length/meters-to-feet');

    // Every conversion page is linked from its category, so none is orphaned.
    const directoryLinks = page.locator('#conversions a[href^="/length/"]');
    expect(await directoryLinks.count()).toBeGreaterThan(50);
  });

  test('serves mass units from /weight', async ({ page }) => {
    await page.goto('/weight');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Weight & Mass Converter');
    await expect(page.getByTestId('result')).toContainText('2.20462');
  });

  test('collection pages link to canonical conversions in the parent category', async ({
    page,
  }) => {
    await page.goto('/cooking');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Cooking & Recipe Measurements Converter',
    );
    await expect(
      page.getByRole('link', { name: 'US cups to milliliters', exact: true }).first(),
    ).toHaveAttribute('href', '/volume/us-cups-to-milliliters');
  });
});

test.describe('conversion page', () => {
  test('carries the formula, table, questions and breadcrumbs', async ({ page }) => {
    await page.goto('/length/meters-to-feet');

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Meters to Feet Converter');
    await expect(page.locator('code', { hasText: 'ft = m ÷ 0.3048' }).first()).toBeVisible();
    await expect(page.getByRole('table')).toContainText('32.808399');
    await expect(page.getByRole('heading', { name: 'Frequently asked questions' })).toBeVisible();

    const breadcrumb = page.getByRole('navigation', { name: 'Breadcrumb' });
    await expect(breadcrumb.getByRole('link', { name: 'Length' })).toHaveAttribute(
      'href',
      '/length',
    );
    await expect(breadcrumb).toContainText('Meters to feet');
  });

  test('keeps a clean canonical when opened with a query string', async ({ page }) => {
    await page.goto('/length/meters-to-feet?value=10');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      /\/length\/meters-to-feet$/,
    );
    await expect(page.getByLabel(valueField)).toHaveValue('10');
  });

  test('temperature pages lead with the formula', async ({ page }) => {
    await page.goto('/temperature/fahrenheit-to-celsius');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Fahrenheit to Celsius Converter',
    );
    await expect(page.getByRole('main').locator('header p')).toHaveText('°C = (°F − 32) × 5/9');
  });

  test('lists its sections for desktop readers', async ({ page, isMobile }) => {
    test.skip(isMobile, 'The side column appears at desktop widths');
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/length/meters-to-feet');

    const onThisPage = page.getByRole('navigation', { name: 'On this page' });
    await onThisPage.getByRole('link', { name: 'Conversion table' }).click();
    await expect(page).toHaveURL(/#table$/);
  });
});

test.describe('URL normalisation', () => {
  test('redirects a differently cased URL to its lowercase form', async ({ request }) => {
    const response = await request.get('/Length/Meters-To-Feet', { maxRedirects: 0 });
    expect(response.status()).toBe(308);
    expect(response.headers().location).toMatch(/\/length\/meters-to-feet$/);
  });

  test('redirects a trailing slash to the canonical form', async ({ request }) => {
    const response = await request.get('/length/meters-to-feet/', { maxRedirects: 0 });
    expect(response.status()).toBe(308);
    expect(response.headers().location).toMatch(/\/length\/meters-to-feet$/);
  });
});

test.describe('not found', () => {
  // Chromium reports the 404 document response itself as a console error.
  test.use({ allowedConsoleErrors: [/status of 404/] });

  test('an unknown conversion returns 404 with a way forward', async ({ page }) => {
    const response = await page.goto('/length/not-a-conversion');
    expect(response?.status()).toBe(404);

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('This page does not exist');
    await page.getByRole('link', { name: 'Go to the converter' }).click();
    await expect(page).toHaveURL('/');
  });

  test('an unknown category returns 404', async ({ page }) => {
    const response = await page.goto('/not-a-category');
    expect(response?.status()).toBe(404);
  });
});
