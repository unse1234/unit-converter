import type { Page } from '@playwright/test';
import { expect, test, valueField } from './fixtures';

const PATHS = [
  '/',
  '/length',
  '/length/meters-to-feet',
  '/volume/us-gallons-to-liters',
  '/cooking',
  '/fuel-economy',
];

const WIDTHS = [320, 375, 390, 414, 768, 1024, 1280, 1440, 1920];

/**
 * Elements that extend past the right or left edge of the viewport without a
 * scroll container of their own to hold them. The body clips horizontal
 * overflow, so measuring scrollWidth would hide exactly the content that is
 * being cut off; this checks element geometry instead.
 */
function findOverflow(page: Page) {
  return page.evaluate(() => {
    const viewport = document.documentElement.clientWidth;
    const offenders: string[] = [];

    for (const element of Array.from(document.body.querySelectorAll<HTMLElement>('*'))) {
      const rect = element.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      if (rect.right <= viewport + 1 && rect.left >= -1) continue;

      let ancestor = element.parentElement;
      let contained = false;
      while (ancestor && ancestor !== document.body) {
        const overflowX = getComputedStyle(ancestor).overflowX;
        if (overflowX !== 'visible') {
          contained = true;
          break;
        }
        ancestor = ancestor.parentElement;
      }
      if (contained) continue;

      const label = `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''}.${String(
        element.className,
      )
        .split(' ')
        .slice(0, 3)
        .join('.')}`;
      offenders.push(`${label} (left ${Math.round(rect.left)}, right ${Math.round(rect.right)})`);
    }
    return offenders.slice(0, 8);
  });
}

test.describe('layout across widths', () => {
  test.skip(({ isMobile }) => isMobile, 'The width sweep runs once, in the desktop project');

  for (const width of WIDTHS) {
    test(`nothing overflows horizontally at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const path of PATHS) {
        await page.goto(path);
        expect.soft(await findOverflow(page), `${path} at ${width}px`).toEqual([]);
      }
    });
  }
});

test.describe('phone layout', () => {
  test.skip(({ isMobile }) => !isMobile, 'Phone-specific checks');

  test('the converter is on screen without scrolling', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    for (const path of ['/', '/weight', '/length/meters-to-feet']) {
      await page.goto(path);
      const box = await page.getByLabel(valueField).boundingBox();
      expect(box, path).not.toBeNull();
      expect((box?.y ?? Infinity) + (box?.height ?? 0), path).toBeLessThanOrEqual(667);
    }
  });

  test('controls meet the 24px minimum target size', async ({ page }) => {
    await page.goto('/length/meters-to-feet');
    const undersized = await page.evaluate(() => {
      const selector =
        'header a, header button, main button, main input, main select, nav[aria-label="Breadcrumb"] a';
      return Array.from(document.querySelectorAll<HTMLElement>(selector))
        .map((element) => ({ element, rect: element.getBoundingClientRect() }))
        .filter(({ rect }) => rect.width > 0 && rect.height > 0)
        .filter(({ rect }) => rect.width < 24 || rect.height < 24)
        .map(
          ({ element, rect }) =>
            `${element.tagName.toLowerCase()} "${(
              element.getAttribute('aria-label') ??
              element.textContent ??
              ''
            )
              .trim()
              .slice(0, 30)}" ${Math.round(rect.width)}×${Math.round(rect.height)}`,
        );
    });
    expect(undersized).toEqual([]);
  });

  test('the unit list opens as a sheet and a unit can be tapped', async ({ page }) => {
    await page.goto('/length/meters-to-feet');
    await page.getByRole('button', { name: /^To/ }).tap();

    const list = page.getByRole('listbox');
    await expect(list).toBeVisible();
    const box = await list.boundingBox();
    const viewport = page.viewportSize();
    // Anchored to the bottom of the screen, within thumb reach.
    expect((box?.y ?? 0) + (box?.height ?? 0)).toBeGreaterThan((viewport?.height ?? 0) * 0.6);

    await page.getByRole('option', { name: /^centimeter/ }).tap();
    await expect(page.getByTestId('result')).toHaveText(/^100\s*cm$/);
  });

  test('the category menu opens and navigates', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Open category menu' }).tap();
    const menu = page.getByRole('dialog', { name: 'Categories' });
    await expect(menu).toBeVisible();

    await menu.getByRole('link', { name: 'Temperature' }).tap();
    await expect(page).toHaveURL('/temperature');
    await expect(menu).toBeHidden();
  });
});
