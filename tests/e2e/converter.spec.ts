import { expect, test, valueField } from './fixtures';

test.describe('converter', () => {
  test('selects a unit by searching and stays on the page', async ({ page }) => {
    await page.goto('/length/meters-to-feet');

    await page.getByRole('button', { name: /^To/ }).click();
    await page.getByRole('combobox', { name: 'Search to units' }).fill('inch');
    await page.getByRole('option', { name: /^inch/ }).click();

    await expect(page.getByTestId('result')).toHaveText(/^39\.3701\s*in$/);
    // Changing a unit never navigates (WCAG 3.2.2 On Input).
    await expect(page).toHaveURL(/\/length\/meters-to-feet$/);

    const guide = page.getByRole('link', { name: 'Formula and table for meters to inches' });
    await guide.click();
    await expect(page).toHaveURL(/\/length\/meters-to-inches$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Meters to Inches Converter');
  });

  test('swap reverses the units and keeps the value', async ({ page }) => {
    await page.goto('/length/meters-to-feet');
    await page.getByLabel(valueField).fill('5');
    await page.getByRole('button', { name: 'Swap units' }).click();

    await expect(page.getByLabel(valueField)).toHaveValue('5');
    await expect(page.getByTestId('result')).toHaveText(/^1\.524\s*m$/);
  });

  test('explains invalid input instead of showing a number', async ({ page }) => {
    await page.goto('/temperature/celsius-to-fahrenheit');

    await page.getByLabel(valueField).fill('12abc');
    // Filtered: Next.js also renders an (empty) role="alert" route announcer.
    await expect(page.getByRole('alert').filter({ hasText: 'not a number' })).toBeVisible();

    await page.getByLabel(valueField).fill('-500');
    await expect(page.getByTestId('result')).toContainText('absolute zero');
  });

  test('opens a shared link with its values applied', async ({ page }) => {
    await page.goto('/weight?from=kilogram&to=pound&value=70');
    await expect(page.getByLabel(valueField)).toHaveValue('70');
    await expect(page.getByTestId('result')).toHaveText(/^154\.324\s*lb$/);
  });

  test('copies the result', async ({ page, context, isMobile }) => {
    test.skip(isMobile, 'Clipboard permissions are granted on the desktop project');
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/length/meters-to-feet');

    await page.getByRole('button', { name: /^Copy result/ }).click();
    await expect(page.getByRole('button', { name: /^Copy result/ })).toContainText('Copied');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('3.28084');
  });

  test('saved and recent conversions follow the user across pages', async ({ page }) => {
    await page.goto('/length/meters-to-feet');
    await page.getByLabel(valueField).fill('25');
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    // Recent entries are recorded after a short pause in typing.
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem('uc:history') ?? ''))
      .toContain('25 meters to feet');

    await page.goto('/weight');
    await page.getByRole('button', { name: 'Saved & recent' }).click();
    await expect(page.getByRole('link', { name: 'Meters to feet', exact: true })).toBeVisible();

    await page.getByRole('link', { name: '25 meters to feet' }).click();
    await expect(page).toHaveURL(/\/length\/meters-to-feet\?value=25$/);
    await expect(page.getByLabel(valueField)).toHaveValue('25');
  });
});

test.describe('keyboard', () => {
  test.skip(({ isMobile }) => isMobile, 'Keyboard-only use is exercised on desktop');

  test('completes a conversion without a pointer', async ({ page }) => {
    await page.goto('/length/meters-to-feet');

    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
    await page.keyboard.press('Enter');

    const value = page.getByLabel(valueField);
    for (let step = 0; step < 10; step += 1) {
      if (await value.evaluate((element) => element === document.activeElement)) break;
      await page.keyboard.press('Tab');
    }
    await expect(value).toBeFocused();
    await page.keyboard.press('ControlOrMeta+a');
    await page.keyboard.type('5');

    await page.keyboard.press('Tab');
    const from = page.getByRole('button', { name: /^From/ });
    await expect(from).toBeFocused();

    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('combobox', { name: 'Search from units' })).toBeFocused();
    await page.keyboard.type('yard');
    await page.keyboard.press('Enter');

    await expect(from).toBeFocused();
    await expect(from).toHaveAccessibleName(/yard/);
    await expect(page.getByTestId('result')).toHaveText(/^15\s*ft$/);

    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Swap units' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('result')).toHaveText(/^1\.66667\s*yd$/);
  });

  test('Escape closes the unit list and restores focus', async ({ page }) => {
    await page.goto('/weight');
    const to = page.getByRole('button', { name: /^To/ });
    await to.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('listbox')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByRole('listbox')).toBeHidden();
    await expect(to).toBeFocused();
  });
});
