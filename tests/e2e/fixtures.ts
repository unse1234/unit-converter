import { test as base, expect } from '@playwright/test';

/**
 * Shared fixtures.
 *
 * Every test fails if the page logs an error or throws. Hydration mismatches,
 * Content-Security-Policy violations and runtime exceptions are all reported to
 * the console, so this turns each of them into a failing test instead of a
 * warning nobody reads.
 */
export const test = base.extend<{
  allowedConsoleErrors: RegExp[];
  failOnConsoleErrors: void;
}>({
  allowedConsoleErrors: [[], { option: true }],

  failOnConsoleErrors: [
    async ({ page, allowedConsoleErrors }, use) => {
      const errors: string[] = [];

      page.on('console', (message) => {
        if (message.type() !== 'error') return;
        const text = message.text();
        if (allowedConsoleErrors.some((pattern) => pattern.test(text))) return;
        errors.push(text);
      });
      page.on('pageerror', (error) => errors.push(error.message));

      await use();

      expect(errors, 'the page logged errors').toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

/** The converter's value field. Its accessible name includes the unit. */
export const valueField = /^Value in/;
