import { expect, test, valueField } from './fixtures';

test.describe('search', () => {
  test('routes a conversion query with a value to its page', async ({ page, isMobile }) => {
    await page.goto('/');

    if (isMobile) {
      await page.getByRole('button', { name: 'Search units and conversions' }).click();
    } else {
      await page.keyboard.press('/');
    }

    const input = page.getByRole('combobox', { name: 'Search units and conversions' });
    await input.fill('10 kg to lbs');
    await expect(page.getByRole('option').first()).toContainText('kilograms to pounds');
    await input.press('Enter');

    await expect(page).toHaveURL(/\/weight\/kilograms-to-pounds\?value=10$/);
    await expect(page.getByLabel(valueField)).toHaveValue('10');
    await expect(page.getByTestId('result')).toHaveText(/^22\.0462\s*lb$/);
  });

  test('understands aliases and symbols', async ({ page }) => {
    await page.goto('/search?q=metre');
    await expect(page.getByRole('link', { name: /^meters \(m\)/ })).toBeVisible();

    await page.goto('/search?q=how+many+feet+in+a+meter');
    await expect(page.getByRole('link', { name: /meters to feet/ }).first()).toHaveAttribute(
      'href',
      '/length/meters-to-feet',
    );
  });

  test('shows an empty state for a query with no matches', async ({ page }) => {
    await page.goto('/search?q=qwertyuiop');
    await expect(page.getByText('No matches for “qwertyuiop”')).toBeVisible();
  });

  test('keeps the results page out of the index', async ({ page }) => {
    await page.goto('/search?q=kg');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  });
});
