/**
 * Error reporting.
 *
 * The single place errors are sent. The site is a static export with no server
 * behind it, so every report originates in the browser, from the error
 * boundaries in app/error.tsx and app/global-error.tsx. No monitoring vendor
 * is configured, so reports go to the console.
 *
 * Adding a provider (Sentry, Datadog, a log drain) means replacing `deliver`
 * and nothing else. Keep reports free of user input: a converted value or a
 * search query is not needed to diagnose a failure.
 */

export type ErrorContext = Record<string, string | undefined>;

function deliver(error: unknown, context: ErrorContext): void {
  console.error('[error]', error, context);
}

export function reportError(error: unknown, context: ErrorContext = {}): void {
  try {
    deliver(error, context);
  } catch {
    // A failing reporter must never turn one error into two.
  }
}
