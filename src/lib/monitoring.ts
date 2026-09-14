/**
 * Error reporting.
 *
 * The single place errors are sent, on the server and in the browser. No
 * monitoring vendor is configured, so reports go to the console, where the
 * hosting platform's log capture picks up server-side ones.
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
