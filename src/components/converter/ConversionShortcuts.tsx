'use client';

import Link from 'next/link';
import { useId } from 'react';
import {
  conversionKey,
  type HistoryEntry,
  type SavedConversion,
} from '@/hooks/useConversionMemory';
import { track } from '@/lib/analytics';
import { capitalize } from '@/lib/text';
import { Button } from '@/components/ui/Button';
import { CloseIcon } from '@/components/ui/icons';

/**
 * Saved and recent conversions.
 *
 * Both are links, so opening one is an explicit navigation the user chose, and
 * each works in a new tab. Entries carry their own label and href, captured when
 * they were saved, so this list never needs the unit catalog.
 */
export function ConversionShortcuts({
  saved,
  recent,
  onRemoveSaved,
  onClearRecent,
}: {
  saved: SavedConversion[];
  recent: HistoryEntry[];
  onRemoveSaved: (entry: SavedConversion) => void;
  onClearRecent: () => void;
}) {
  const savedHeadingId = useId();
  const recentHeadingId = useId();

  if (saved.length === 0 && recent.length === 0) {
    return (
      <p className="text-fg-subtle text-sm">
        Nothing here yet. Conversions you save with the star, and the ones you run, will be listed
        here on this device.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <section aria-labelledby={savedHeadingId}>
        <h2 id={savedHeadingId} className="text-fg-subtle text-xs font-medium tracking-normal">
          Saved
        </h2>
        {saved.length === 0 ? (
          <p className="text-fg-subtle mt-2 text-sm">
            Use the star to save a conversion you come back to.
          </p>
        ) : (
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {saved.map((entry) => (
              <li
                key={conversionKey(entry)}
                className="shadow-border flex min-h-9 items-center rounded-full pl-3"
              >
                <Link
                  href={entry.href}
                  className="text-fg-secondary hover:text-fg rounded-sm py-1.5 text-sm"
                >
                  {capitalize(entry.label)}
                </Link>
                <button
                  type="button"
                  onClick={() => onRemoveSaved(entry)}
                  aria-label={`Remove ${entry.label} from saved`}
                  className="text-fg-subtle hover:text-fg hover:bg-hover ml-1 grid size-9 place-items-center rounded-full"
                >
                  <CloseIcon size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {recent.length > 0 ? (
        <section aria-labelledby={recentHeadingId}>
          <div className="flex items-center justify-between gap-2">
            <h2 id={recentHeadingId} className="text-fg-subtle text-xs font-medium tracking-normal">
              Recent
            </h2>
            <Button variant="ghost" size="sm" onClick={onClearRecent}>
              Clear recent
            </Button>
          </div>
          <ul className="mt-1 flex flex-wrap gap-1.5">
            {recent.map((entry) => (
              <li key={conversionKey(entry)}>
                <Link
                  href={entry.href}
                  onClick={() =>
                    track('recent_conversion_used', {
                      category: entry.category,
                      from_unit: entry.from,
                      to_unit: entry.to,
                    })
                  }
                  className="text-fg-secondary shadow-border hover:bg-hover hover:text-fg inline-flex min-h-9 items-center rounded-full px-3 text-sm transition-colors"
                >
                  {entry.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
