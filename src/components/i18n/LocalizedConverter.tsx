'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { convertUnits } from '@/domain/conversion/engine';
import { parseNumericInput } from '@/domain/conversion/parse';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/cn';
import type { ConverterLabels } from '@/i18n/types';
import type { UnitDefinition } from '@/types/units';
import { Button } from '@/components/ui/Button';
import { CheckIcon, CopyIcon, SwapIcon } from '@/components/ui/icons';

/**
 * The converter on localized pages.
 *
 * A focused version of the English converter: the units a page is about (plus
 * a few close relatives), labels in the page's language and results in the
 * market's number format. Like the English one it converts on every
 * keystroke — there is no Convert button — and never navigates on change.
 *
 * It accepts both "2.54" and "2,54": parseNumericInput treats a lone comma as
 * a decimal comma, which is how Brazil, Italy, France and Indonesia type it.
 */

export interface ConverterUnitOption {
  unit: UnitDefinition;
  one: string;
  other: string;
  symbol: string;
}

function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);
}

export function LocalizedConverter({
  options,
  initialFrom,
  initialTo,
  initialValue = '1',
  numberLocale,
  labels,
  className,
}: {
  options: ConverterUnitOption[];
  initialFrom: string;
  initialTo: string;
  initialValue?: string;
  /** BCP 47 tag for the result, e.g. "pt-BR". */
  numberLocale: string;
  labels: ConverterLabels;
  className?: string;
}) {
  const [rawValue, setRawValue] = useState(initialValue);
  const [fromId, setFromId] = useState(initialFrom);
  const [toId, setToId] = useState(initialTo);
  const interacted = useRef(false);
  const baseId = useId();
  const { copy, status: copyStatus } = useCopyToClipboard();

  const from = options.find((option) => option.unit.id === fromId) ?? options[0];
  const to =
    options.find((option) => option.unit.id === toId) ??
    options.find((option) => option.unit.id !== from?.unit.id) ??
    options[0];

  const parsed = useMemo(() => parseNumericInput(rawValue), [rawValue]);
  const conversion = useMemo(
    () => (from && to && parsed.ok ? convertUnits(parsed.value, from.unit, to.unit) : null),
    [from, to, parsed],
  );

  const formatted = useMemo(() => {
    if (!conversion?.ok) return null;
    const value = conversion.value;
    // Outside this window a plain decimal is a wall of zeros.
    const scientific = Math.abs(value) >= 1e15 || (value !== 0 && Math.abs(value) < 1e-7);
    return new Intl.NumberFormat(numberLocale, {
      maximumSignificantDigits: 6,
      ...(scientific ? { notation: 'scientific' as const } : {}),
    }).format(value);
  }, [conversion, numberLocale]);

  const error =
    !parsed.ok && parsed.code !== 'EMPTY'
      ? labels.invalid
      : conversion && !conversion.ok
        ? conversion.code === 'OUT_OF_DOMAIN'
          ? labels.belowAbsoluteZero
          : labels.invalid
        : undefined;

  const announcement =
    formatted && parsed.ok && from && to && !error
      ? fill(labels.equals, {
          value: rawValue.trim(),
          from: Math.abs(parsed.value) === 1 ? from.one : from.other,
          result: formatted,
          to: conversion?.ok && Math.abs(conversion.value) === 1 ? to.one : to.other,
        })
      : '';
  const spoken = useDebouncedValue(announcement, 500);

  // One analytics event once the user pauses, never on arrival or per keystroke.
  useEffect(() => {
    if (!interacted.current || !conversion?.ok || !from || !to) return;
    const timer = setTimeout(() => {
      track('conversion_used', {
        category: from.unit.category,
        from_unit: from.unit.id,
        to_unit: to.unit.id,
      });
    }, 900);
    return () => clearTimeout(timer);
  }, [conversion, from, to]);

  if (!from || !to) return null;

  const changeUnit = (side: 'from' | 'to', id: string) => {
    interacted.current = true;
    // Picking the unit already on the other side swaps them.
    const other = side === 'from' ? to.unit.id : from.unit.id;
    if (id === other) {
      setFromId(to.unit.id);
      setToId(from.unit.id);
    } else if (side === 'from') setFromId(id);
    else setToId(id);
  };

  const inputId = `${baseId}-value`;
  const errorId = `${baseId}-error`;

  const select = (side: 'from' | 'to', value: string) => (
    <div>
      <label
        htmlFor={`${baseId}-${side}`}
        className="text-fg-subtle mb-1.5 block text-xs font-medium"
      >
        {side === 'from' ? labels.from : labels.to}
      </label>
      <select
        id={`${baseId}-${side}`}
        value={value}
        onChange={(event) => changeUnit(side, event.target.value)}
        className="bg-surface shadow-border text-fg h-12 w-full rounded-md px-3 text-base outline-none"
      >
        {options.map((option) => (
          <option key={option.unit.id} value={option.unit.id}>
            {`${option.other.charAt(0).toUpperCase()}${option.other.slice(1)} (${option.symbol})`}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className={cn('bg-surface shadow-medium rounded-2xl p-4 sm:p-6', className)}>
      <div className="grid gap-3 sm:gap-4">
        <div>
          <label htmlFor={inputId} className="text-fg-subtle mb-1.5 block text-xs font-medium">
            {labels.value}
          </label>
          <input
            id={inputId}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="done"
            value={rawValue}
            onChange={(event) => {
              interacted.current = true;
              setRawValue(event.target.value);
            }}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            placeholder={labels.placeholder}
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

        <div className="grid items-end gap-3 sm:grid-cols-[1fr_auto_1fr]">
          {select('from', from.unit.id)}
          <div className="flex justify-center">
            <Button
              variant="secondary"
              size="icon"
              onClick={() => {
                interacted.current = true;
                setFromId(to.unit.id);
                setToId(from.unit.id);
              }}
              aria-label={labels.swap}
              title={labels.swap}
              className="max-sm:rotate-90 sm:mb-1"
            >
              <SwapIcon size={18} />
            </Button>
          </div>
          {select('to', to.unit.id)}
        </div>

        <div className="bg-recessed rounded-xl p-4 sm:p-5">
          <div className="flex min-h-8 items-start justify-between gap-3">
            <span className="text-fg-subtle text-xs font-medium">{labels.result}</span>
            {formatted && !error ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void copy(formatted)}
                className="-mt-1 -mr-1"
              >
                {copyStatus === 'copied' ? (
                  <>
                    <CheckIcon size={15} className="text-success" />
                    {labels.copied}
                  </>
                ) : (
                  <>
                    <CopyIcon size={15} />
                    {labels.copy}
                  </>
                )}
              </Button>
            ) : null}
          </div>
          <div aria-hidden="true" className="mt-1 min-h-13" data-testid="result">
            {formatted && !error ? (
              <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="numeric text-fg text-3xl leading-tight font-semibold tracking-[-0.03em] break-all sm:text-4xl">
                  {formatted}
                </span>
                <span className="text-fg-secondary text-lg">{to.symbol}</span>
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
              {labels.copyFailed}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
