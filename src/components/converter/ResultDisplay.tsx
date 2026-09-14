'use client';

import type { FormattedNumber } from '@/domain/conversion/format';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import type { CopyStatus } from '@/hooks/useCopyToClipboard';
import type { UnitDefinition } from '@/types/units';
import { Button } from '@/components/ui/Button';
import { CheckIcon, CopyIcon } from '@/components/ui/icons';

/**
 * The result.
 *
 * The visual centre of the page, so it gets the largest type on the screen and
 * tabular figures, which stop the number shifting sideways as digits change.
 *
 * Screen readers get a separate, complete sentence ("5 meters equals 16.4042
 * feet") in a polite live region, debounced so typing "12345" produces one
 * announcement rather than five. The visual version is hidden from assistive
 * technology so the result is not read twice. Keystroke-driven updates would
 * otherwise be silent, because nothing else signals that a conversion ran.
 */
export function ResultDisplay({
  formatted,
  unit,
  error,
  announcement,
  onCopy,
  copyStatus,
}: {
  formatted: FormattedNumber | null;
  unit: UnitDefinition;
  error?: string;
  announcement: string;
  onCopy: () => void;
  copyStatus: CopyStatus;
}) {
  const spoken = useDebouncedValue(announcement, 500);

  return (
    <div className="bg-recessed rounded-xl p-4 sm:p-5">
      <div className="flex min-h-8 items-start justify-between gap-3">
        <span className="text-fg-subtle text-xs font-medium">Result</span>
        {formatted && !error ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCopy}
            aria-label={`Copy result, ${formatted.plain} ${unit.symbol || unit.pluralName}`}
            className="-mt-1 -mr-1"
          >
            {copyStatus === 'copied' ? (
              <>
                <CheckIcon size={15} className="text-success" />
                Copied
              </>
            ) : (
              <>
                <CopyIcon size={15} />
                Copy
              </>
            )}
          </Button>
        ) : null}
      </div>

      <div aria-hidden="true" className="mt-1 min-h-13" data-testid="result">
        {error ? (
          <span className="text-fg-secondary text-base">{error}</span>
        ) : formatted ? (
          <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="numeric text-fg text-3xl leading-tight font-semibold tracking-[-0.03em] break-all sm:text-4xl">
              {formatted.scientific ? (
                <>
                  {formatted.mantissa}
                  <span className="text-fg-secondary"> × 10</span>
                  <sup className="text-[0.6em]">{formatted.exponent}</sup>
                </>
              ) : (
                formatted.plain
              )}
            </span>
            <span className="text-fg-secondary text-lg">{unit.symbol || unit.pluralName}</span>
          </span>
        ) : (
          <span className="text-fg-subtle text-lg">—</span>
        )}
      </div>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {spoken}
      </p>

      {copyStatus === 'error' ? (
        <p role="alert" className="text-danger mt-2 text-xs">
          Could not copy automatically. Select the number and copy it manually.
        </p>
      ) : null}
    </div>
  );
}
