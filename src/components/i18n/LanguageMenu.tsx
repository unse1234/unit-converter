'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { ChevronDownIcon, GlobeIcon } from '@/components/ui/icons';

export interface LanguageLink {
  /** hreflang / lang value: "en", "es"… */
  code: string;
  /** The language's own name: "Español". */
  name: string;
  href: string;
}

/**
 * Language menu in the header.
 *
 * A disclosure button over a plain list of links, so every language is also
 * reachable as ordinary anchors in the footer without JavaScript. Each link
 * names its language in that language and carries hreflang and lang, which
 * tells screen readers to switch voice and crawlers what the target is.
 *
 * Moving between languages crosses root layouts, which is a full page load, so
 * the menu never needs to close itself on navigation.
 */
export function LanguageMenu({
  current,
  languages,
  label,
}: {
  /** Code of the page's own language. */
  current: string;
  languages: LanguageLink[];
  /** Accessible name of the button, in the page's language. */
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const currentName = languages.find((language) => language.code === current)?.name ?? current;

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`${label}: ${currentName}`}
        title={label}
        onClick={() => setOpen((value) => !value)}
        className="text-fg-secondary hover:bg-hover hover:text-fg inline-flex h-10 items-center gap-1.5 rounded-md px-2.5 text-sm transition-colors"
      >
        <GlobeIcon size={18} />
        {/* The code and chevron drop out on phones, where the header is tight. */}
        <span className="uppercase max-sm:hidden">{current}</span>
        <ChevronDownIcon size={14} className="max-sm:hidden" />
      </button>

      <ul
        id={listId}
        hidden={!open}
        className="bg-surface shadow-modal absolute right-0 z-50 mt-1 min-w-48 rounded-lg p-1"
      >
        {languages.map((language) => {
          const active = language.code === current;
          return (
            <li key={language.code}>
              <a
                href={language.href}
                hrefLang={language.code}
                lang={language.code}
                aria-current={active ? 'true' : undefined}
                className={cn(
                  'flex min-h-10 items-center rounded-md px-3 text-sm transition-colors',
                  active ? 'bg-recessed text-fg font-medium' : 'text-fg-secondary hover:bg-hover',
                )}
              >
                {language.name}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
