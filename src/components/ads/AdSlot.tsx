import { cn } from '@/lib/cn';
import { siteConfig } from '@/lib/site';

/**
 * Advertising boundary.
 *
 * No ad provider code is included (none was requested). This component defines
 * *where* an ad may appear and the rules it must obey, so that adding a
 * provider later is a change in one file rather than a change to page layouts.
 *
 * The constraints this enforces, from PROJECT_REQUIREMENTS §12:
 *
 *  - Slots reserve their height up front, so a late-loading ad cannot push
 *    content and cost the page its CLS budget.
 *  - When ads are disabled the slot renders nothing at all — it does not leave
 *    a grey box or a gap. The page must look finished without ads.
 *  - Slot placement is restricted to the page edges. No slot is ever rendered
 *    inside the converter, between its controls, or above the result.
 *
 * Enabling ads is a deliberate act: NEXT_PUBLIC_ADS_ENABLED must be "true".
 */

export type AdPlacement =
  /** Below the converter, after the user has their answer. */
  | 'below-converter'
  /** Between content sections on long reference pages. */
  | 'in-content'
  /** Desktop sidebar, never shown on mobile where width is scarce. */
  | 'sidebar';

const placements: Record<AdPlacement, { className: string; minHeight: string }> = {
  'below-converter': { className: 'w-full', minHeight: '90px' },
  'in-content': { className: 'w-full', minHeight: '250px' },
  // Hidden below xl: a sidebar ad on a narrow screen would crowd the content.
  sidebar: { className: 'hidden xl:block w-[300px]', minHeight: '600px' },
};

export function AdSlot({ placement, className }: { placement: AdPlacement; className?: string }) {
  if (!siteConfig.adsEnabled) return null;

  const config = placements[placement];

  return (
    <aside
      aria-label="Advertisement"
      data-ad-placement={placement}
      className={cn('overflow-hidden', config.className, className)}
      // Reserving the height here is what keeps CLS at zero when a creative
      // arrives after paint.
      style={{ minHeight: config.minHeight }}
    />
  );
}
