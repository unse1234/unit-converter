import Link from 'next/link';
import { getCategories } from '@/domain/units/registry';
import { SearchTrigger } from '@/components/search/SearchTrigger';
import { ThemeToggle } from '@/components/theme/theme';
import { SwapIcon } from '@/components/ui/icons';
import { MobileNav } from './MobileNav';

/**
 * Site header.
 *
 * Server-rendered apart from three small islands: search, the theme toggle and
 * the mobile drawer. Category links are plain anchors, so navigation works
 * before any JavaScript has loaded.
 */
export function SiteHeader() {
  const categories = getCategories();
  const featured = categories.slice(0, 5);

  return (
    <header className="bg-canvas/85 sticky top-0 z-40 shadow-[0_1px_0_0_var(--ds-border)] backdrop-blur-md">
      <div className="page-shell flex h-16 items-center gap-2">
        <Link
          href="/"
          className="text-fg mr-1 flex shrink-0 items-center gap-2 rounded-md text-[0.9375rem] font-medium tracking-tight"
        >
          <span
            aria-hidden="true"
            className="bg-fg text-canvas grid size-7 place-items-center rounded-md"
          >
            <SwapIcon size={16} strokeWidth={2} />
          </span>
          <span>UnitFlip</span>
        </Link>

        <nav aria-label="Categories" className="ml-2 hidden lg:block">
          <ul className="flex items-center gap-1">
            {featured.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/${category.slug}`}
                  className="text-fg-secondary hover:bg-hover hover:text-fg inline-flex h-9 items-center rounded-md px-3 text-sm transition-colors"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <SearchTrigger />
          <ThemeToggle />
          <MobileNav
            categories={categories.map((category) => ({
              slug: category.slug,
              name: category.name,
              icon: category.icon,
            }))}
          />
        </div>
      </div>
    </header>
  );
}
