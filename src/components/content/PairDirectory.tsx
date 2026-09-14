import Link from 'next/link';
import { requireUnit } from '@/domain/units/registry';
import { pairLabel, unitHeadingName } from '@/lib/seo/labels';
import type { ConversionPair } from '@/types/conversion';

/**
 * Every conversion page in a category, grouped by the unit converted from.
 *
 * Links each generated page directly from its category page, so none is
 * orphaned and every one is two clicks from the homepage. Grouping keeps a
 * category with ninety pages readable instead of a wall of links
 * (SEO_SPEC §18).
 */
export function PairDirectory({ pairs }: { pairs: ConversionPair[] }) {
  const groups = new Map<string, ConversionPair[]>();
  for (const pair of pairs) {
    groups.set(pair.fromUnitId, [...(groups.get(pair.fromUnitId) ?? []), pair]);
  }

  return (
    <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
      {[...groups.entries()].map(([fromId, group]) => {
        const from = requireUnit(fromId);
        return (
          <div key={fromId}>
            <h3 className="text-sm font-medium tracking-normal">From {unitHeadingName(from)}</h3>
            <ul className="mt-1.5">
              {group.map((pair) => (
                <li key={pair.id}>
                  <Link
                    href={pair.path}
                    className="text-fg-secondary hover:text-accent inline-block py-1 text-sm"
                  >
                    {pairLabel(from, requireUnit(pair.toUnitId))}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
