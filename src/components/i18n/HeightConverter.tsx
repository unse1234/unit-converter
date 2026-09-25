'use client';

import { useId, useState } from 'react';
import { parseNumericInput } from '@/domain/conversion/parse';
import type { ConverterLabels } from '@/i18n/types';

/**
 * Height in feet and inches to centimetres.
 *
 * Heights are written as two numbers (5'11"), which a single-value converter
 * cannot take, so this page has its own two-field calculator. Both fields
 * accept decimals; the result updates as the user types.
 */
export function HeightConverter({
  numberLocale,
  labels,
}: {
  numberLocale: string;
  labels: ConverterLabels;
}) {
  const [feet, setFeet] = useState('5');
  const [inches, setInches] = useState('11');
  const id = useId();

  const parse = (raw: string) => {
    if (raw.trim() === '') return 0;
    const parsed = parseNumericInput(raw);
    return parsed.ok && parsed.value >= 0 ? parsed.value : null;
  };

  const feetValue = parse(feet);
  const inchValue = parse(inches);
  const valid = feetValue !== null && inchValue !== null;
  const cm = valid ? (feetValue * 12 + inchValue) * 2.54 : null;

  const format = (value: number, digits: number) =>
    new Intl.NumberFormat(numberLocale, { maximumFractionDigits: digits }).format(value);

  const field = (key: 'feet' | 'inches', value: string, onChange: (next: string) => void) => (
    <div>
      <label htmlFor={`${id}-${key}`} className="text-fg-subtle mb-1.5 block text-xs font-medium">
        {key === 'feet' ? labels.feet : labels.inches}
      </label>
      <input
        id={`${id}-${key}`}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={valid ? undefined : true}
        className="bg-surface shadow-border text-fg numeric h-12 w-full rounded-md px-3 text-lg font-medium outline-none"
      />
    </div>
  );

  return (
    <div className="bg-surface shadow-medium grid gap-4 rounded-2xl p-4 sm:p-6">
      <div className="grid grid-cols-2 gap-3">
        {field('feet', feet, setFeet)}
        {field('inches', inches, setInches)}
      </div>
      <div className="bg-recessed rounded-xl p-4 sm:p-5">
        <span className="text-fg-subtle text-xs font-medium">{labels.result}</span>
        <p className="mt-1 min-h-13" aria-live="polite">
          {cm !== null ? (
            <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="numeric text-fg text-3xl leading-tight font-semibold tracking-[-0.03em] sm:text-4xl">
                {format(cm, 2)} cm
              </span>
              <span className="text-fg-secondary text-lg">{format(cm / 100, 2)} m</span>
            </span>
          ) : (
            <span role="alert" className="text-danger text-sm">
              {labels.invalid}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
