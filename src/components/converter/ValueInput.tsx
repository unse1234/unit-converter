'use client';

import { useId } from 'react';
import { cn } from '@/lib/cn';

/**
 * The numeric input.
 *
 * inputMode="decimal" gives phones a numeric keypad while still allowing
 * minus signs, scientific notation and recipe fractions, which a
 * type="number" field would reject outright. Validation is therefore done by
 * the domain parser, and the error is announced through aria-describedby.
 */
export function ValueInput({
  value,
  onChange,
  unitLabel,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  unitLabel: string;
  error?: string;
}) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="text-fg-subtle mb-1.5 block text-xs font-medium">
        Value
      </label>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        spellCheck={false}
        enterKeyHint="done"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={`Value in ${unitLabel}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        placeholder="Enter a value"
        className={cn(
          'bg-surface text-fg numeric h-12 w-full rounded-md px-3 text-lg font-medium',
          'transition-shadow duration-150 outline-none',
          error ? 'shadow-[0_0_0_1px_var(--ds-danger)]' : 'shadow-border',
        )}
      />
      {error ? (
        <p id={errorId} role="alert" className="text-danger mt-1.5 text-xs leading-snug">
          {error}
        </p>
      ) : null}
    </div>
  );
}
