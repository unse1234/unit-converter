import Link from 'next/link';
import { getCategories } from '@/domain/units/registry';
import { CategoryIcon } from '@/components/ui/icons';
import { LinkCard } from '@/components/ui/primitives';

/**
 * 404 page.
 *
 * Returns a real 404 status, and gives the visitor somewhere to go rather than
 * a dead end — most people who land here mistyped a conversion URL, so the
 * popular categories are the useful next step.
 */
export default function NotFound() {
  const categories = getCategories().slice(0, 6);

  return (
    <div className="page-shell py-16">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-fg-subtle text-sm font-medium">404</p>
        <h1 className="mt-2">This page does not exist</h1>
        <p className="text-fg-secondary mt-4 text-lg">
          The conversion you were looking for may have moved, or the address may have a typo. Every
          conversion is still reachable from its category.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="bg-fg text-canvas hover:bg-fg-secondary inline-flex h-11 items-center rounded-md px-5 text-sm font-medium transition-colors"
          >
            Go to the converter
          </Link>
          <Link
            href="/search"
            className="bg-surface shadow-border hover:bg-hover inline-flex h-11 items-center rounded-md px-5 text-sm font-medium transition-colors"
          >
            Search units
          </Link>
        </div>
      </div>

      <div className="mx-auto mt-12 grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
    </div>
  );
}
