/**
 * Compact records used by search.
 *
 * The full catalog carries descriptions, notes and sources that search never
 * reads. Shipping all of that to the browser would cost far more than the
 * feature is worth, so search runs over this reduced shape, which is served as
 * a small static JSON document and fetched only when the user opens search.
 */

export interface SearchUnitRecord {
  id: string;
  category: string;
  name: string;
  plural: string;
  symbol: string;
  slug: string;
  aliases: string[];
  /** True when the unit has generated conversion pages. */
  primary: boolean;
}

export interface SearchCategoryRecord {
  id: string;
  slug: string;
  name: string;
  title: string;
  summary: string;
  icon: string;
  /** Slugs of every generated conversion page in this category. */
  pairSlugs: string[];
}

export interface SearchIndex {
  units: SearchUnitRecord[];
  categories: SearchCategoryRecord[];
}

export type SearchResult =
  | {
      kind: 'conversion';
      /** Href to open, already including any parsed value. */
      href: string;
      label: string;
      detail: string;
      categoryName: string;
      score: number;
    }
  | {
      kind: 'unit';
      href: string;
      label: string;
      detail: string;
      categoryName: string;
      score: number;
    }
  | {
      kind: 'category';
      href: string;
      label: string;
      detail: string;
      categoryName: string;
      score: number;
    };
