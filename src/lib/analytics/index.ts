import { siteConfig } from '@/lib/site';
import type { AnalyticsEventName, AnalyticsEvents } from './events';

/**
 * Analytics facade.
 *
 * Components call `track` and know nothing about the provider. Swapping or
 * adding a vendor means editing the adapter below and nothing else, which is
 * what ARCHITECTURE.md §11 asks for.
 *
 * No provider ships by default. With NEXT_PUBLIC_ANALYTICS_PROVIDER unset,
 * every call is a no-op: no network request, no third-party script, no cookie
 * banner obligation, and no effect on Core Web Vitals.
 */

export type { AnalyticsEventName, AnalyticsEvents } from './events';

type Adapter = <E extends AnalyticsEventName>(event: E, payload: AnalyticsEvents[E]) => void;

/** Discards everything. The default. */
const noopAdapter: Adapter = () => {};

/** Logs to the console during development so events can be verified. */
const debugAdapter: Adapter = (event, payload) => {
  // eslint-disable-next-line no-console
  console.info('[analytics]', event, payload);
};

/**
 * Hands events to a provider script that exposes a global queue. Nothing
 * loads that script yet — this is the seam a real provider plugs into, and it
 * fails silently when the global is absent.
 */
const globalQueueAdapter: Adapter = (event, payload) => {
  if (typeof window === 'undefined') return;
  const queue = (window as unknown as { __analyticsQueue?: unknown[] }).__analyticsQueue;
  if (Array.isArray(queue)) queue.push({ event, payload, at: Date.now() });
};

function selectAdapter(): Adapter {
  switch (siteConfig.analyticsProvider) {
    case 'debug':
      return debugAdapter;
    case 'queue':
      return globalQueueAdapter;
    default:
      return noopAdapter;
  }
}

const adapter = selectAdapter();

/** Records a product event. Safe to call from anywhere, including the server. */
export function track<E extends AnalyticsEventName>(event: E, payload: AnalyticsEvents[E]): void {
  try {
    adapter(event, payload);
  } catch {
    // Analytics must never break a conversion. Failures are swallowed here and
    // nowhere else — this is the one place where that is the correct behaviour.
  }
}
