export interface PageSection {
  id: string;
  label: string;
}

/**
 * In-page navigation for long reference pages, shown in the desktop side
 * column. Plain anchor links: no scroll-tracking script and no layout cost.
 */
export function OnThisPage({ items }: { items: PageSection[] }) {
  if (items.length < 2) return null;

  return (
    <nav aria-label="On this page">
      <p className="text-fg-subtle mb-2 text-xs font-medium">On this page</p>
      <ul className="space-y-0.5 text-sm">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="text-fg-secondary hover:text-fg block rounded-sm py-1.5 transition-colors"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
