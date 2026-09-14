import Link from 'next/link';
import { getCategories, getCollections } from '@/domain/units/registry';

/**
 * Site footer.
 *
 * Also the site's internal-link backbone: every category is reachable from
 * every page, so no category page is ever orphaned (SEO_SPEC §19). Links are
 * grouped into readable columns rather than dumped in one list.
 */
export function SiteFooter() {
  const categories = getCategories();
  const collections = getCollections();

  const columns = [
    { title: 'Popular', items: categories.slice(0, 8) },
    { title: 'Science & engineering', items: categories.slice(8, 20) },
    { title: 'Electrical & physics', items: categories.slice(20) },
  ];

  return (
    <footer className="mt-16 shadow-[0_-1px_0_0_var(--ds-border)]">
      <div className="page-shell py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-fg text-sm font-medium">Unit Converter</p>
            <p className="text-fg-subtle mt-2 max-w-xs text-sm leading-relaxed">
              Exact conversion factors, clear formulas and reference tables. No sign-up, and it
              works on any device.
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {collections.map((collection) => (
                <li key={collection.id}>
                  <Link
                    href={`/${collection.slug}`}
                    className="text-fg-secondary hover:text-accent"
                  >
                    {collection.name} conversions
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h2 className="text-fg text-sm font-medium">{column.title}</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {column.items.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/${category.slug}`}
                      className="text-fg-secondary hover:text-accent"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="text-fg-subtle mt-10 flex flex-col gap-3 pt-6 text-sm shadow-[0_-1px_0_0_var(--ds-border)] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Unit Converter</p>
          <nav aria-label="Site information">
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              <li>
                <Link href="/about" className="hover:text-accent">
                  About
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-accent">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-accent">
                  Search
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
