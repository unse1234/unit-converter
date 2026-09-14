import { expect, test } from './fixtures';

test.describe('system dark preference', () => {
  test.use({ colorScheme: 'dark' });

  test('is applied on first load', async ({ page }) => {
    await page.goto('/length/meters-to-feet');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe(
      'rgb(10, 10, 10)',
    );
  });
});

test.describe('theme toggle', () => {
  test.use({ colorScheme: 'light' });

  test('cycles through the themes and remembers the choice', async ({ page }) => {
    await page.goto('/');
    const toggle = page.getByRole('button', { name: /^Theme:/ });

    await expect(toggle).toHaveAccessibleName('Theme: System. Switch to Light.');
    await toggle.click();
    await expect(toggle).toHaveAccessibleName('Theme: Light. Switch to Dark.');
    await toggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.getByRole('button', { name: /^Theme:/ })).toHaveAccessibleName(
      'Theme: Dark. Switch to System.',
    );
  });
});
