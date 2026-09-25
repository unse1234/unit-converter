'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { CategoryIcon, CloseIcon, MenuIcon } from '@/components/ui/icons';

interface NavCategory {
  slug: string;
  name: string;
  icon: string;
  /** Defaults to /{slug}. Localized sections pass their own paths. */
  href?: string;
}

/** Interface text, in the page's language. English by default. */
interface MobileNavLabels {
  open: string;
  close: string;
  title: string;
}

const ENGLISH_LABELS: MobileNavLabels = {
  open: 'Open category menu',
  close: 'Close menu',
  title: 'Categories',
};

/**
 * Mobile category drawer.
 *
 * Built on the native <dialog> element so focus trapping, Escape handling and
 * inertness of the background come from the platform rather than from a
 * dependency or hand-rolled key handling.
 */
export function MobileNav({
  categories,
  labels = ENGLISH_LABELS,
}: {
  categories: NavCategory[];
  labels?: MobileNavLabels;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const close = useCallback(() => {
    dialogRef.current?.close();
    setOpen(false);
  }, []);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        aria-label={labels.open}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          dialogRef.current?.showModal();
          setOpen(true);
        }}
      >
        <MenuIcon size={18} />
      </Button>

      <dialog
        ref={dialogRef}
        aria-label={labels.title}
        onClose={() => setOpen(false)}
        onClick={(event) => {
          // A click on the backdrop lands on the dialog element itself.
          if (event.target === dialogRef.current) close();
        }}
        className="bg-surface text-fg shadow-modal m-0 ml-auto h-dvh max-h-none w-[min(20rem,85vw)] max-w-none p-0 backdrop:bg-black/40"
      >
        <div className="flex h-16 items-center justify-between px-4 shadow-[0_1px_0_0_var(--ds-border)]">
          <h2 className="text-base font-medium">{labels.title}</h2>
          <Button variant="ghost" size="icon" onClick={close} aria-label={labels.close}>
            <CloseIcon size={18} />
          </Button>
        </div>

        <nav className="h-[calc(100dvh-4rem)] scrollbar-thin overflow-y-auto overscroll-contain p-2">
          <ul>
            {categories.map((category) => {
              const href = category.href ?? `/${category.slug}`;
              const active = pathname === href;
              return (
                <li key={category.slug}>
                  <Link
                    href={href}
                    aria-current={active ? 'page' : undefined}
                    // Closing here rather than by watching the pathname: the
                    // drawer is dismissed by the interaction that navigates.
                    onClick={close}
                    className={`flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                      active
                        ? 'bg-recessed text-fg font-medium'
                        : 'text-fg-secondary hover:bg-hover'
                    }`}
                  >
                    <CategoryIcon
                      name={category.icon}
                      size={18}
                      className="text-fg-subtle shrink-0"
                    />
                    {category.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </dialog>
    </>
  );
}
