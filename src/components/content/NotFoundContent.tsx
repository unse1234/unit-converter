import Link from 'next/link';
import { getPopularPairs } from '@/domain/conversion/pairs';
import { getCategories, requireUnit } from '@/domain/units/registry';
import { pairLabel } from '@/lib/seo/labels';
import { CategoryIcon } from '@/components/ui/icons';
import { LinkCard, Section } from '@/components/ui/primitives';

/**
 * 404 page content.
 *
 * Rendered by app/global-not-found.tsx, exported as out/404.html, which
 * Cloudflare serves with a real 404 status for any unmatched path, and by the
 * English site's not-found boundary.
 *
 * Most people who land here mistyped a conversion URL, so the page leads with
 * a search field and the conversions people actually look for, rather than
 * with an apology. The form is a plain GET to /search: it works before any
 * JavaScript loads.
 */
export function NotFoundContent() {
  const categories = getCategories().slice(0, 6);

  // A cross-section of the highest-demand conversions, not one category's.
  const popular = ['length', 'mass', 'temperature', 'volume', 'speed', 'area', 'digital-storage']
    .flatMap((categoryId) => getPopularPairs(categoryId, 2))
    .slice(0, 12);

  return (
    <div className="page-shell py-12 sm:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-fg-subtle text-sm font-medium">404</p>
        <h1 className="mt-2">This page does not exist</h1>
        <p className="text-fg-secondary mt-4 text-lg leading-relaxed">
          The conversion you were looking for may have moved, or the address may have a typo. Try
          searching for it, or pick one of the converters below.
        </p>

        <form action="/search" method="get" role="search" className="mt-6">
          <label htmlFor="notfound-q" className="sr-only">
            Search units and conversions
          </label>
          <div className="flex gap-2">
            <input
              id="notfound-q"
              name="q"
              type="search"
              placeholder="kg to lbs"
              autoComplete="off"
              className="bg-surface shadow-border text-fg h-12 min-w-0 flex-1 rounded-md px-3 text-left outline-none"
            />
            <button
              type="submit"
              className="bg-fg text-canvas hover:bg-fg-secondary h-12 shrink-0 rounded-md px-5 text-sm font-medium transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        <p className="mt-4">
          <Link href="/" className="text-accent text-sm underline-offset-2 hover:underline">
            Or go to the converter on the home page
          </Link>
        </p>
      </div>

      <div className="mx-auto mt-14 max-w-4xl space-y-12">
        <Section
          title="Popular converters"
          description="The conversions people look up most often."
          headingLevel={2}
        >
          <ul className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
            {popular.map((pair) => (
              <li key={pair.id}>
                <Link
                  href={pair.path}
                  className="text-fg-secondary hover:text-accent hover:bg-hover block rounded-md px-3 py-2.5 text-sm transition-colors"
                >
                  {pairLabel(requireUnit(pair.fromUnitId), requireUnit(pair.toUnitId))}
                </Link>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Browse by category" headingLevel={2}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <LinkCard
                key={category.id}
                href={`/${category.slug}`}
                title={category.name}
                description={category.summary}
                icon={<CategoryIcon name={category.icon} size={20} />}
              />
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}
