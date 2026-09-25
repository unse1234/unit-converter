import AxeBuilder from '@axe-core/playwright';
import { expect, test } from './fixtures';

/**
 * The localized sections: each language has its own <html lang>, hreflang
 * cluster and native-language converter, and meets the same WCAG bar as the
 * English pages.
 */

const PAGES = [
  '/es',
  '/es/longitud/pulgadas-a-cm',
  '/es/peso/25-libras-a-kilos',
  '/es/longitud/pies-y-pulgadas-a-cm',
  '/pt/tv/tamanho-tv-55-polegadas-em-cm',
  '/pt/area/alqueire-em-hectare',
  '/it/lunghezza/55-pollici-in-cm',
  '/fr/cuisine/cup-en-ml',
  '/id/berat/ons-ke-gram',
  '/id/tv',
];

for (const path of PAGES) {
  test(`${path} has no WCAG violations`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}

test('a localized page declares its language and its translations', async ({ page }) => {
  await page.goto('/pt/comprimento/polegadas-em-cm');
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt');
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute(
    'href',
    /\/length\/inches-to-centimeters$/,
  );
  await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1);
});

test('the localized converter answers in the local number format', async ({ page }) => {
  await page.goto('/pt/comprimento/polegadas-em-cm');
  const field = page.getByLabel('Valor', { exact: true });
  await field.fill('10');
  await expect(page.getByTestId('result')).toContainText('25,4');

  await page.getByRole('button', { name: 'Inverter unidades' }).click();
  await field.fill('2,54');
  await expect(page.getByTestId('result')).toContainText('1');
});

test('the English site links to every language', async ({ page }) => {
  await page.goto('/');
  for (const name of ['Español', 'Português', 'Italiano', 'Français', 'Bahasa Indonesia']) {
    await expect(page.locator(`footer a[lang]`, { hasText: name })).toHaveCount(1);
  }
});
