import { expect, test } from './fixtures';

const examples = [
  {
    path: '/length/meters-to-feet',
    lang: 'en',
    input: /^Value in/,
    value: '10',
    result: /32\.8084/,
  },
  { path: '/length/feet-to-meters', lang: 'en', input: /^Value in/, value: '10', result: /3\.048/ },
  {
    path: '/temperature/celsius-to-fahrenheit',
    lang: 'en',
    input: /^Value in/,
    value: '100',
    result: /212/,
  },
  {
    path: '/pt/comprimento/polegadas-em-cm',
    lang: 'pt',
    input: /^Valor$/,
    value: '1,234',
    result: /3,13436/,
  },
];

for (const example of examples) {
  test(`${example.path}: canonical survives hydration and conversion input`, async ({ page }) => {
    const response = await page.goto(`${example.path}?utm_source=regression`);
    expect(response?.status()).toBe(200);
    const source = await response!.text();
    expect(source.match(/rel="canonical"/g)).toHaveLength(1);
    expect(source).toContain(`href="https://unitflip.org${example.path}"`);
    await expect(page.locator('html')).toHaveAttribute('lang', example.lang);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.getByRole('main')).toBeVisible();
    await page.getByLabel(example.input).fill(example.value);
    await expect(page.getByTestId('result')).toContainText(example.result);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      `https://unitflip.org${example.path}`,
    );
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  });
}

test('a combined known variant redirects once and retains converter state', async ({ request }) => {
  const response = await request.get('/LENGTH/METERS-TO-FEET.HTML/?value=10&utm_source=test', {
    maxRedirects: 0,
  });
  expect(response.status()).toBe(308);
  const location = new URL(response.headers().location!);
  expect(location.pathname).toBe('/length/meters-to-feet');
  expect(location.searchParams.get('value')).toBe('10');
  expect(location.searchParams.get('utm_source')).toBe('test');
  const final = await request.get(location.href, { maxRedirects: 0 });
  expect(final.status()).toBe(200);
});

test('search is a crawlable noindex utility with no conflicting googlebot index rule', async ({
  page,
}) => {
  await page.goto('/search?q=feet');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  const googlebot = await page
    .locator('meta[name="googlebot"]')
    .evaluateAll((nodes) => nodes[0]?.getAttribute('content') ?? null);
  expect(googlebot ?? '').not.toMatch(/(?:^|,)\s*index\s*(?:,|$)/);
});

test('category and pair links navigate with working static router payloads', async ({ page }) => {
  let documentRequests = 0;
  page.on('request', (request) => {
    if (request.isNavigationRequest() && request.frame() === page.mainFrame()) documentRequests++;
  });
  await page.goto('/');
  await page.getByRole('main').getByRole('link', { name: 'Length', exact: true }).click();
  await expect(page).toHaveURL('/length');
  await page.getByRole('link', { name: 'Meters to feet', exact: true }).first().click();
  await expect(page).toHaveURL('/length/meters-to-feet');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Meters to Feet Converter');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://unitflip.org/length/meters-to-feet',
  );
  expect(documentRequests).toBe(1);
});
