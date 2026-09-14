'use client';

import { useId } from 'react';
import { PRECISION_OPTIONS } from '@/domain/conversion/format';

/**
 * Display precision.
 *
 * Changes how many significant digits are shown and nothing else — the
 * conversion itself is always computed at full double precision, so raising
 * the setting reveals digits that were already there rather than recomputing.
 *
 * A native select: it is one control, it is keyboard- and screen-reader-ready
 * for free, and it opens as a native picker on mobile.
 */
export function PrecisionControl({
  value,
  onChange,
}: {
  value: number;
  onChange: (precision: number) => void;
}) {
  const id = useId();

  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="text-fg-subtle text-xs font-medium whitespace-nowrap">
        Digits
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="bg-surface text-fg-secondary shadow-border h-9 rounded-md px-2 text-sm outline-none"
      >
        {PRECISION_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
