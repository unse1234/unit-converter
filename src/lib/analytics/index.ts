import { siteConfig } from '@/lib/site';
import type { AnalyticsEventName, AnalyticsEvents } from './events';

/**
 * Analytics facade.
 *
 * Components call `track` and know nothing about the provider. The GA4 script
 * itself is loaded by <GoogleAnalytics> in the root layout; this module only
 * pushes events onto the dataLayer queue it creates.
 *
 * With NEXT_PUBLIC_GA_ID unset, every call is a no-op: no network request, no
 * third-party script, no cookie, and no effect on Core Web Vitals.
 */

export type { AnalyticsEventName, AnalyticsEvents } from './events';

type Adapter = <E extends AnalyticsEventName>(event: E, payload: AnalyticsEvents[E]) => void;

/** Discards everything. The default when no measurement id is configured. */
const noopAdapter: Adapter = () => {};

/**
 * Pushes onto GA4's dataLayer, in the shape gtag.js expects.
 *
 * gtag reads each queued entry as the argument list of a gtag() call, so an
 * event is pushed as ["event", name, params] rather than as a plain object —
 * an object with an `event` key is Tag Manager's format and gtag would ignore
 * it. This is the same push @next/third-parties' own sendGAEvent performs.
 *
 * Queueing directly rather than calling window.gtag means an event fired
 * before the GA script finishes loading is still delivered: the array exists
 * from the moment the inline snippet runs, and GA drains it on load.
 */
const googleAnalyticsAdapter: Adapter = (event, payload) => {
  if (typeof window === 'undefined') return;
  const target = window as unknown as { dataLayer?: unknown[] };
  target.dataLayer = target.dataLayer ?? [];
  target.dataLayer.push(['event', event, payload]);
};

const adapter: Adapter = siteConfig.gaId ? googleAnalyticsAdapter : noopAdapter;

/** Records a product event. Safe to call from anywhere, including the server. */
export function track<E extends AnalyticsEventName>(event: E, payload: AnalyticsEvents[E]): void {
  try {
    adapter(event, payload);
  } catch {
    // Analytics must never break a conversion. Failures are swallowed here and
    // nowhere else — this is the one place where that is the correct behaviour.
  }
}
