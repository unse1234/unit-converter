import Link from 'next/link';
import { JsonLd } from '@/components/seo/JsonLd';
import { ChevronRightIcon } from '@/components/ui/icons';
import { breadcrumbSchema, type BreadcrumbEntry } from '@/lib/seo/structured-data';

/**
 * Breadcrumb trail.
 *
 * Renders the visible trail and the matching BreadcrumbList structured data
 * from the same array, so the two can never disagree — markup that describes
 * a hierarchy the page does not show is exactly what SEO_SPEC §10 warns off.
 */
export function Breadcrumbs({ entries }: { entries: BreadcrumbEntry[] }) {
  return (
    <>
      <nav aria-label="Breadcrumb">
        <ol className="text-fg-subtle flex flex-wrap items-center gap-1 text-sm">
          {entries.map((entry, index) => {
            const isLast = index === entries.length - 1;
            return (
              <li key={entry.name} className="flex items-center gap-1">
                {index > 0 ? (
                  <ChevronRightIcon size={14} className="text-fg-muted shrink-0" />
                ) : null}
                {entry.path && !isLast ? (
                  // Vertical padding brings the tap target to 24px (WCAG 2.2 §2.5.8).
                  <Link
                    href={entry.path}
                    className="hover:text-accent inline-block rounded-sm py-0.5"
                  >
                    {entry.name}
                  </Link>
                ) : (
                  <span
                    aria-current={isLast ? 'page' : undefined}
                    className={isLast ? 'text-fg-secondary' : undefined}
                  >
                    {entry.name}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd data={breadcrumbSchema(entries)} />
    </>
  );
}
