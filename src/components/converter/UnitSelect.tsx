'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { normalizeTerm } from '@/lib/search/search';
import type { UnitDefinition } from '@/types/units';
import { cn } from '@/lib/cn';
import { ChevronDownIcon, SearchIcon } from '@/components/ui/icons';

/**
 * Searchable unit selector.
 *
 * Implements the WAI-ARIA combobox-with-listbox pattern rather than using a
 * component library: this is the control the whole product turns on, and it
 * needs exact keyboard behaviour, alias-aware filtering and a mobile layout
 * that a generic select cannot provide.
 *
 * Keyboard: Enter, Space or the arrow keys open the list, typing filters it,
 * Up and Down move the active option, Home and End jump to the ends, Enter
 * selects, and Escape closes and returns focus to the trigger. The active
 * option is exposed through aria-activedescendant, so focus never leaves the
 * text field while moving through the list.
 *
 * Matching uses the same normalisation as site search, so "metre", "m" and
 * "meters" all find the same unit.
 */

export interface UnitSelectProps {
  label: string;
  units: UnitDefinition[];
  value: string;
  onChange: (unitId: string) => void;
  /** Rendered under the control; used for the unit's disclosure note. */
  hint?: string;
  id?: string;
}

function matches(unit: UnitDefinition, query: string): boolean {
  if (!query) return true;
  const haystack = [unit.name, unit.pluralName, unit.symbol, ...unit.aliases]
    .filter(Boolean)
    .map(normalizeTerm);
  return haystack.some((term) => term.includes(query));
}

export function UnitSelect({ label, units, value, onChange, hint, id }: UnitSelectProps) {
  const generatedId = useId();
  const baseId = id ?? generatedId;
  const listId = `${baseId}-listbox`;
  const labelId = `${baseId}-label`;
  const valueId = `${baseId}-value`;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = units.find((unit) => unit.id === value);

  const filtered = useMemo(() => {
    const normalized = normalizeTerm(query);
    return units.filter((unit) => matches(unit, normalized));
  }, [units, query]);

  const close = useCallback((returnFocus = true) => {
    setOpen(false);
    setQuery('');
    if (returnFocus) triggerRef.current?.focus();
  }, []);

  const openList = useCallback(() => {
    setOpen(true);
    const index = units.findIndex((unit) => unit.id === value);
    setActiveIndex(index >= 0 ? index : 0);
  }, [units, value]);

  const select = useCallback(
    (unitId: string) => {
      onChange(unitId);
      close();
    },
    [onChange, close],
  );

  // Move focus into the filter field as soon as the list opens.
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Keep the active option in view while arrowing through a long list.
  useEffect(() => {
    if (!open) return;
    const option = listRef.current?.querySelector<HTMLElement>('[data-active="true"]');
    option?.scrollIntoView({ block: 'nearest' });
  }, [open, activeIndex, filtered.length]);

  // A filtered list can be shorter than the last active index. Clamping during
  // render keeps aria-activedescendant pointing at an option that exists.
  const [lastCount, setLastCount] = useState(filtered.length);
  if (filtered.length !== lastCount) {
    setLastCount(filtered.length);
    setActiveIndex((current) => Math.min(current, Math.max(0, filtered.length - 1)));
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex((current) => (filtered.length === 0 ? 0 : (current + 1) % filtered.length));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex((current) =>
          filtered.length === 0 ? 0 : (current - 1 + filtered.length) % filtered.length,
        );
        break;
      case 'Home':
        event.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setActiveIndex(Math.max(0, filtered.length - 1));
        break;
      case 'Enter': {
        event.preventDefault();
        const unit = filtered[activeIndex];
        if (unit) select(unit.id);
        break;
      }
      case 'Escape':
        event.preventDefault();
        close();
        break;
      default:
        break;
    }
  };

  const hasOptions = filtered.length > 0;
  const activeOption = filtered[activeIndex];
  const activeOptionId = activeOption ? `${baseId}-option-${activeOption.id}` : undefined;

  return (
    <div
      className="relative"
      // Closes whenever focus leaves the control — Tab, a click elsewhere, or a
      // tap on another part of the page — without a document-level listener.
      onBlur={(event) => {
        if (open && !event.currentTarget.contains(event.relatedTarget as Node | null)) {
          close(false);
        }
      }}
    >
      <span id={labelId} className="text-fg-subtle mb-1.5 block text-xs font-medium">
        {label}
      </span>

      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${labelId} ${valueId}`}
        onClick={() => (open ? close() : openList())}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            openList();
          }
        }}
        className="bg-surface shadow-border hover:bg-hover flex h-12 w-full items-center gap-2 rounded-md px-3 text-left transition-colors duration-150"
      >
        <span id={valueId} className="min-w-0 flex-1">
          <span className="text-fg block truncate text-[0.9375rem] font-medium">
            {selected?.name ?? 'Select a unit'}
          </span>
          {selected?.symbol ? (
            <span className="text-fg-subtle block truncate text-xs">{selected.symbol}</span>
          ) : null}
        </span>
        <ChevronDownIcon size={16} className="text-fg-muted shrink-0" />
      </button>

      {hint ? <p className="text-fg-subtle mt-1.5 text-xs leading-snug">{hint}</p> : null}

      {open ? (
        <div
          className={cn(
            'bg-surface shadow-menu absolute z-50 mt-1 flex max-h-[min(22rem,60dvh)] w-full flex-col overflow-hidden rounded-xl',
            // On phones the panel becomes a sheet anchored to the bottom edge,
            // wide enough that unit names are not truncated and within reach
            // of a thumb.
            'max-sm:fixed max-sm:inset-x-3 max-sm:top-auto max-sm:bottom-3 max-sm:max-h-[70dvh] max-sm:w-auto',
          )}
        >
          <div className="relative shrink-0 shadow-[0_1px_0_0_var(--ds-border)]">
            <SearchIcon
              size={16}
              className="text-fg-muted pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
            />
            <input
              ref={inputRef}
              type="text"
              role="combobox"
              aria-expanded={hasOptions}
              aria-controls={listId}
              aria-autocomplete="list"
              aria-label={`Search ${label.toLowerCase()} units`}
              {...(hasOptions && activeOptionId ? { 'aria-activedescendant': activeOptionId } : {})}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={onKeyDown}
              placeholder="Search units, symbols or aliases"
              // 16px on phones: iOS zooms the page when a smaller input is focused.
              className="text-fg h-11 w-full bg-transparent pr-3 pl-9 text-base outline-none sm:text-sm"
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          {hasOptions ? (
            <ul
              ref={listRef}
              id={listId}
              role="listbox"
              aria-labelledby={labelId}
              // Pressing inside the list (padding, scrollbar) must not move focus
              // out of the filter field, or the blur handler would close it.
              onMouseDown={(event) => event.preventDefault()}
              className="scrollbar-thin overflow-y-auto overscroll-contain p-1"
            >
              {filtered.map((unit, index) => {
                const isActive = index === activeIndex;
                const isSelected = unit.id === value;
                return (
                  <li
                    key={unit.id}
                    id={`${baseId}-option-${unit.id}`}
                    role="option"
                    aria-selected={isSelected}
                    data-active={isActive}
                    // Selecting on click rather than pointerdown: on a touch
                    // screen a pointerdown begins every scroll gesture, so the
                    // list could not be scrolled without picking a unit.
                    onClick={() => select(unit.id)}
                    onPointerMove={() => setActiveIndex(index)}
                    className={cn(
                      'flex min-h-11 cursor-pointer items-center gap-2 rounded-md px-3 py-2',
                      isActive ? 'bg-hover' : '',
                    )}
                  >
                    <span
                      className={cn(
                        'min-w-0 flex-1 truncate text-sm',
                        isSelected ? 'text-fg font-medium' : 'text-fg-secondary',
                      )}
                    >
                      {unit.name}
                    </span>
                    {unit.symbol ? (
                      <span className="text-fg-subtle numeric shrink-0 text-xs">{unit.symbol}</span>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p role="status" className="text-fg-subtle px-3 py-6 text-center text-sm">
              No unit matches “{query}”.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
