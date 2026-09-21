'use client';

import Link from 'next/link';
import { Suspense, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { convertUnits } from '@/domain/conversion/engine';
import {
  DEFAULT_SIGNIFICANT_DIGITS,
  formatNumberParts,
  unitLabel,
} from '@/domain/conversion/format';
import { parseNumericInput } from '@/domain/conversion/parse';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import {
  useFavorites,
  useHistory,
  usePrecision,
  type SavedConversion,
} from '@/hooks/useConversionMemory';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/cn';
import { pairPhrase, unitHeadingName } from '@/lib/seo/labels';
import type { UnitDefinition } from '@/types/units';
import { Button } from '@/components/ui/Button';
import { ChevronRightIcon, HistoryIcon, StarIcon, SwapIcon } from '@/components/ui/icons';
import { ConversionShortcuts } from './ConversionShortcuts';
import { PrecisionControl } from './PrecisionControl';
import { ResultDisplay } from './ResultDisplay';
import { UnitSelect } from './UnitSelect';
import { UrlParamsReader } from './UrlParamsReader';
import { ValueInput } from './ValueInput';

/**
 * The converter.
 *
 * The product's primary surface, and the only substantial client component on
 * a page. It receives just the units for its own category as plain data, so a
 * length page never ships the mass catalog.
 *
 * Conversion is instant: there is no Convert button, because there is nothing
 * for one to do. Every keystroke re-runs a pure function over numbers already
 * in memory.
 *
 * Changing a unit never navigates. A select that loads a different page when it
 * changes is a change of context on input, which WCAG 2.2 §3.2.2 forbids, and
 * it would also drop keyboard focus and the typed value. Instead, when the
 * current selection has its own conversion page, a link to it appears under the
 * result, so the reference content is one deliberate click away.
 */

export interface ConverterProps {
  units: UnitDefinition[];
  categoryId: string;
  /** Slug of the category that owns the conversion URLs for these units. */
  categorySlug: string;
  initialFrom: string;
  initialTo: string;
  /** Slugs of every conversion page in the category. */
  pairSlugs: string[];
  /** The pair a conversion page is about; its own link is not offered. */
  pagePair?: { from: string; to: string };
  className?: string;
}

export function Converter({
  units,
  categoryId,
  categorySlug,
  initialFrom,
  initialTo,
  pairSlugs,
  pagePair,
  className,
}: ConverterProps) {
  const [rawValue, setRawValue] = useState('1');
  const [fromId, setFromId] = useState(initialFrom);
  const [toId, setToId] = useState(initialTo);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [precision, setPrecision] = usePrecision(DEFAULT_SIGNIFICANT_DIGITS);

  // History and analytics describe what the user did, not what the page
  // showed on arrival, so nothing is recorded until they interact.
  const interactedRef = useRef(false);
  const shortcutsId = useId();

  const { copy, status: copyStatus } = useCopyToClipboard();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const { history, record, clear: clearHistory } = useHistory();

  /*
   * If the page's pair changes while this instance stays mounted, reset the
   * selection. Adjusting state during render is React's documented alternative
   * to an effect here; it avoids an extra render and a flash of the old pair.
   */
  const propsKey = `${initialFrom}:${initialTo}`;
  const [lastPropsKey, setLastPropsKey] = useState(propsKey);
  if (propsKey !== lastPropsKey) {
    setLastPropsKey(propsKey);
    setFromId(initialFrom);
    setToId(initialTo);
  }

  /**
   * Applies ?from, ?to and ?value, used by search results, shared links and the
   * saved and recent lists. Unknown ids are ignored rather than trusted.
   */
  const applyUrlParams = useCallback(
    (params: URLSearchParams) => {
      const known = (id: string | null) => (id && units.some((unit) => unit.id === id) ? id : null);
      const otherThan = (id: string) => units.find((unit) => unit.id !== id)?.id;

      const nextFrom = known(params.get('from'));
      const nextTo = known(params.get('to'));
      const nextValue = params.get('value')?.trim();

      if (nextFrom && nextTo && nextFrom !== nextTo) {
        setFromId(nextFrom);
        setToId(nextTo);
      } else if (nextFrom) {
        setFromId(nextFrom);
        setToId((current) => (current === nextFrom ? (otherThan(nextFrom) ?? current) : current));
      } else if (nextTo) {
        setToId(nextTo);
        setFromId((current) => (current === nextTo ? (otherThan(nextTo) ?? current) : current));
      }

      // Capped so a crafted URL cannot fill the field with an essay.
      if (nextValue) setRawValue(nextValue.slice(0, 64));
    },
    [units],
  );

  const from = units.find((unit) => unit.id === fromId) ?? units[0];
  const to =
    units.find((unit) => unit.id === toId) ??
    units.find((unit) => unit.id !== from?.id) ??
    units[0];

  const parsed = useMemo(() => parseNumericInput(rawValue), [rawValue]);

  const conversion = useMemo(() => {
    if (!from || !to || !parsed.ok) return null;
    return convertUnits(parsed.value, from, to);
  }, [from, to, parsed]);

  const formatted = useMemo(() => {
    if (!conversion?.ok) return null;
    return formatNumberParts(conversion.value, { significantDigits: precision });
  }, [conversion, precision]);

  // An empty field is a blank slate, not a mistake, so it shows no error.
  const inputError = !parsed.ok && parsed.code !== 'EMPTY' ? parsed.message : undefined;
  const conversionError = conversion && !conversion.ok ? conversion.message : undefined;

  const pairSlug = from && to ? `${from.slug}-to-${to.slug}` : '';
  const pairPageHref = pairSlugs.includes(pairSlug) ? `/${categorySlug}/${pairSlug}` : null;
  const isPagePair = pagePair?.from === from?.id && pagePair?.to === to?.id;

  /** Where this exact selection can be reopened: its own page, or the category converter. */
  const selectionHref =
    pairPageHref ??
    (from && to
      ? `/${categorySlug}?from=${encodeURIComponent(from.id)}&to=${encodeURIComponent(to.id)}`
      : `/${categorySlug}`);

  /* ------------------------------------------------------------------ */
  /* Side effects                                                        */
  /* ------------------------------------------------------------------ */

  // Record a finished conversion once the user pauses, so holding a key down
  // does not fill the history with every intermediate value.
  useEffect(() => {
    if (!interactedRef.current || !conversion?.ok || !parsed.ok || !from || !to) return;

    const timer = setTimeout(() => {
      const value = rawValue.trim();
      const separator = selectionHref.includes('?') ? '&' : '?';
      record({
        category: categoryId,
        from: from.id,
        to: to.id,
        value,
        label: `${value} ${unitLabel(parsed.value, from)} to ${unitHeadingName(to)}`,
        href:
          value === '1'
            ? selectionHref
            : `${selectionHref}${separator}value=${encodeURIComponent(value)}`,
      });
      track('conversion_used', { category: categoryId, from_unit: from.id, to_unit: to.id });
    }, 900);

    return () => clearTimeout(timer);
  }, [conversion, parsed, from, to, rawValue, selectionHref, categoryId, record]);

  /* ------------------------------------------------------------------ */
  /* Actions                                                             */
  /* ------------------------------------------------------------------ */

  const noteInteraction = useCallback(() => {
    if (interactedRef.current || !from || !to) return;
    interactedRef.current = true;
    track('conversion_started', { category: categoryId, from_unit: from.id, to_unit: to.id });
  }, [from, to, categoryId]);

  const changeValue = useCallback(
    (next: string) => {
      noteInteraction();
      setRawValue(next);
    },
    [noteInteraction],
  );

  const changeUnit = useCallback(
    (side: 'from' | 'to', unitId: string) => {
      if (!from || !to) return;
      noteInteraction();
      track('unit_changed', { category: categoryId, side, unit: unitId });

      // Choosing the unit that is already on the other side swaps the two,
      // rather than producing a unit-to-itself conversion.
      const other = side === 'from' ? to.id : from.id;
      if (unitId === other) {
        setFromId(to.id);
        setToId(from.id);
        return;
      }

      if (side === 'from') setFromId(unitId);
      else setToId(unitId);
    },
    [from, to, categoryId, noteInteraction],
  );

  /**
   * Swaps the units and keeps the typed value, the convention most converters
   * follow: the usual reason to swap is having picked the wrong direction.
   * Carrying the rounded result across instead would compound display rounding
   * with every swap.
   */
  const swap = useCallback(() => {
    if (!from || !to) return;
    noteInteraction();
    track('swap_clicked', { category: categoryId, from_unit: from.id, to_unit: to.id });
    setFromId(to.id);
    setToId(from.id);
  }, [from, to, categoryId, noteInteraction]);

  const onCopy = useCallback(() => {
    if (!formatted || !from || !to) return;
    void copy(formatted.plain);
    track('result_copied', { category: categoryId, from_unit: from.id, to_unit: to.id });
  }, [formatted, copy, categoryId, from, to]);

  if (!from || !to) return null;

  const saved: SavedConversion = {
    category: categoryId,
    from: from.id,
    to: to.id,
    label: pairPhrase(from, to),
    href: selectionHref,
  };
  const starred = isFavorite(saved);

  const announcement = conversionError
    ? conversionError
    : formatted && parsed.ok
      ? `${rawValue.trim()} ${unitLabel(parsed.value, from)} equals ${formatted.plain} ${unitLabel(
          Number(formatted.plain.replace(/,/g, '')),
          to,
        )}`
      : '';

  return (
    <div className={cn('bg-surface shadow-medium rounded-2xl p-4 sm:p-6', className)}>
      {/*
        useSearchParams needs a Suspense boundary on a statically generated
        page. The reader renders nothing, so the fallback is empty and the
        converter itself is still part of the static HTML.
      */}
      <Suspense fallback={null}>
        <UrlParamsReader onParams={applyUrlParams} />
      </Suspense>

      <div className="grid gap-3 sm:gap-4">
        <ValueInput
          value={rawValue}
          onChange={changeValue}
          unitLabel={from.pluralName}
          error={inputError}
        />

        {/*
          On phones the selectors stack with the swap button between them,
          reading top to bottom as "from, swap, to". From sm upward they sit
          side by side with the button in the middle column.
        */}
        <div className="grid items-start gap-3 sm:grid-cols-[1fr_auto_1fr]">
          <UnitSelect
            label="From"
            units={units}
            value={from.id}
            onChange={(id) => changeUnit('from', id)}
            hint={from.note}
          />

          <div className="flex justify-center sm:mt-6">
            <Button
              variant="secondary"
              size="icon"
              onClick={swap}
              aria-label="Swap units"
              title="Swap units"
              className="max-sm:rotate-90"
            >
              <SwapIcon size={18} />
            </Button>
          </div>

          <UnitSelect
            label="To"
            units={units}
            value={to.id}
            onChange={(id) => changeUnit('to', id)}
            hint={to.note}
          />
        </div>

        <ResultDisplay
          formatted={formatted}
          unit={to}
          error={conversionError}
          announcement={announcement}
          onCopy={onCopy}
          copyStatus={copyStatus}
        />

        {pairPageHref && !isPagePair ? (
          <Link
            href={pairPageHref}
            className="text-accent inline-flex min-h-6 items-center gap-1 justify-self-start rounded-sm text-sm underline-offset-2 hover:underline"
          >
            Formula and table for {pairPhrase(from, to)}
            <ChevronRightIcon size={14} />
          </Link>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <div className="flex flex-wrap items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleFavorite(saved)}
              aria-pressed={starred}
            >
              <StarIcon
                size={15}
                filled={starred}
                className={starred ? 'text-warning' : undefined}
              />
              Save
            </Button>
            <Button
              variant="ghost"
              size="sm"
              aria-expanded={shortcutsOpen}
              aria-controls={shortcutsId}
              onClick={() => setShortcutsOpen((open) => !open)}
            >
              <HistoryIcon size={15} />
              Saved &amp; recent
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => changeValue('')}
              disabled={rawValue.length === 0}
            >
              Clear
            </Button>
          </div>

          <PrecisionControl value={precision} onChange={setPrecision} />
        </div>
      </div>

      {/*
        Collapsed by default and opened by the user. Saved and recent lists
        come from local storage and only exist after hydration; rendering them
        inline on load would push the page content down on every visit and
        cost the page its layout-stability budget.
      */}
      <div
        id={shortcutsId}
        hidden={!shortcutsOpen}
        className="mt-5 pt-4 shadow-[0_-1px_0_0_var(--ds-border)]"
      >
        {shortcutsOpen ? (
          <ConversionShortcuts
            saved={favorites}
            recent={history}
            onRemoveSaved={toggleFavorite}
            onClearRecent={clearHistory}
          />
        ) : null}
      </div>
    </div>
  );
}
