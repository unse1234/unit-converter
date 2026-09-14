import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { AlertIcon, InfoIcon } from './icons';

/**
 * Shared surface, text and feedback primitives.
 *
 * Every page composes these rather than styling itself, so spacing, elevation
 * and colour stay consistent across the site. They are all server components:
 * none of them needs client JavaScript.
 */

/* -------------------------------------------------------------------------- */
/* Surfaces                                                                    */
/* -------------------------------------------------------------------------- */

export function Card({
  as: Tag = 'div',
  className,
  children,
}: {
  as?: 'div' | 'section' | 'article' | 'aside';
  className?: string;
  children: ReactNode;
}) {
  return <Tag className={cn('bg-surface shadow-small rounded-xl', className)}>{children}</Tag>;
}

/** A section with a heading, used for the content blocks on every page. */
export function Section({
  title,
  description,
  id,
  headingLevel = 2,
  className,
  children,
}: {
  title: string;
  description?: string;
  id?: string;
  headingLevel?: 2 | 3;
  className?: string;
  children: ReactNode;
}) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  return (
    // scroll-mt clears the sticky header when the section is reached by an anchor link.
    <section id={id} className={cn('scroll-mt-24 space-y-4', className)}>
      <div className="space-y-1.5">
        <Heading>{title}</Heading>
        {description ? <p className="text-fg-secondary">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Text                                                                        */
/* -------------------------------------------------------------------------- */

export function Prose({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        'text-fg-secondary max-w-[68ch] space-y-4 leading-relaxed',
        '[&_a]:text-accent [&_a]:underline [&_a]:underline-offset-2',
        '[&_strong]:text-fg [&_strong]:font-medium',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Badge({
  tone = 'neutral',
  className,
  children,
}: {
  tone?: 'neutral' | 'accent' | 'success' | 'warning';
  className?: string;
  children: ReactNode;
}) {
  const tones = {
    neutral: 'bg-recessed text-fg-secondary',
    accent: 'bg-accent-subtle text-accent',
    success: 'bg-recessed text-success',
    warning: 'bg-recessed text-warning',
  } as const;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Inline formula or exact value, rendered in the monospace face. */
export function Formula({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <code
      className={cn(
        'bg-recessed text-fg inline-block rounded-md px-2 py-1 text-[0.9375rem] wrap-break-word',
        className,
      )}
    >
      {children}
    </code>
  );
}

/** A block-level formula, for the primary statement on a conversion page. */
export function FormulaBlock({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <div className="bg-recessed rounded-lg px-4 py-3">
      {label ? (
        <div className="text-fg-subtle mb-1.5 text-xs font-medium tracking-wide uppercase">
          {label}
        </div>
      ) : null}
      <code className="text-fg block font-mono text-base wrap-break-word">{children}</code>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Feedback                                                                    */
/* -------------------------------------------------------------------------- */

export function Alert({
  tone = 'info',
  title,
  className,
  children,
}: {
  tone?: 'info' | 'warning' | 'error';
  title?: string;
  className?: string;
  children: ReactNode;
}) {
  const tones = {
    info: { wrap: 'bg-recessed text-fg-secondary', icon: 'text-fg-subtle' },
    warning: { wrap: 'bg-recessed text-fg-secondary', icon: 'text-warning' },
    error: { wrap: 'bg-danger-subtle text-fg-secondary', icon: 'text-danger' },
  } as const;
  const Glyph = tone === 'info' ? InfoIcon : AlertIcon;

  return (
    <div
      className={cn('flex gap-3 rounded-lg px-4 py-3 text-sm', tones[tone].wrap, className)}
      role={tone === 'error' ? 'alert' : undefined}
    >
      <Glyph size={18} className={cn('mt-0.5 shrink-0', tones[tone].icon)} />
      <div className="space-y-1">
        {title ? <p className="text-fg font-medium">{title}</p> : null}
        <div>{children}</div>
      </div>
    </div>
  );
}

/**
 * Empty state. Used when a list has nothing in it yet — search with no
 * results, no favourites, no history.
 */
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="px-4 py-10 text-center">
      <p className="text-fg font-medium">{title}</p>
      {description ? (
        <p className="text-fg-subtle mx-auto mt-1 max-w-sm text-sm">{description}</p>
      ) : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

/** Non-spinning loading placeholder; respects reduced motion via globals.css. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('bg-recessed animate-pulse rounded-md', className)} aria-hidden="true" />
  );
}

/* -------------------------------------------------------------------------- */
/* Navigation                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * A link styled as a card, used in category grids.
 *
 * The title alone names the link and the summary is attached as its
 * description, so a screen reader's list of links reads "Length" rather than
 * the whole summary sentence for every card.
 */
export function LinkCard({
  href,
  title,
  description,
  icon,
  className,
}: {
  href: string;
  title: ReactNode;
  description?: string;
  icon?: ReactNode;
  className?: string;
}) {
  // Derived from the href, which appears in at most one card on a page.
  const idBase = `card-${href.replace(/[^a-zA-Z0-9]+/g, '-')}`;
  const titleId = `${idBase}-title`;
  const descriptionId = `${idBase}-description`;

  return (
    <Link
      href={href}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      className={cn(
        'bg-surface shadow-border hover:shadow-medium group flex gap-3 rounded-xl p-4',
        'transition-shadow duration-150',
        className,
      )}
    >
      {icon ? (
        <span className="text-fg-subtle group-hover:text-accent mt-0.5 shrink-0">{icon}</span>
      ) : null}
      <span className="min-w-0">
        <span id={titleId} className="text-fg block font-medium">
          {title}
        </span>
        {description ? (
          <span id={descriptionId} className="text-fg-subtle mt-0.5 block text-sm leading-snug">
            {description}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
