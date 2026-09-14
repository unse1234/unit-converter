/**
 * Core data contracts for the unit catalog.
 *
 * Everything here must stay JSON-serialisable: unit records cross the React
 * Server Component boundary, so a page can hand the client converter exactly
 * the units it needs instead of shipping the whole catalog in the bundle.
 * That rules out storing conversion functions on a unit. Non-linear behaviour
 * is referenced by `customKey` and resolved in the engine's function registry.
 */

/** How a unit relates to its category's base unit. */
export type ConversionType = 'linear' | 'affine' | 'custom';

/** Measurement system a unit belongs to, used for grouping and disambiguation. */
export type MeasurementSystem =
  'si' | 'metric' | 'imperial' | 'us' | 'binary' | 'astronomical' | 'cgs' | 'other';

/**
 * Whether a unit takes part in generated, indexable conversion pages.
 *
 * `primary`   — real search demand; ordered pairs of primary units become pages.
 * `secondary` — supported in the converter and listed on the category page,
 *               but no generated landing page (avoids thin/near-duplicate URLs).
 */
export type SeoTier = 'primary' | 'secondary';

export interface UnitDefinition {
  /** Stable, URL-safe canonical identifier. Never reused or renamed. */
  id: string;
  /** Owning category id. A unit belongs to exactly one category. */
  category: string;
  /** Singular display name, e.g. "meter". */
  name: string;
  /** Plural display name, e.g. "meters". */
  pluralName: string;
  /**
   * Shorter name for headings, titles and links where the full name is
   * unwieldy: "Celsius" rather than "degrees Celsius". Defaults to pluralName.
   */
  titleName?: string;
  /** Display symbol, e.g. "m". May be empty for units without one. */
  symbol: string;
  /**
   * Alternate spellings, symbols and natural-language forms used by search.
   * Aliases never create their own URL (SEO_SPEC §17).
   */
  aliases: string[];
  system: MeasurementSystem;
  /** Id of the category base unit this definition is expressed against. */
  baseUnit: string;
  conversionType: ConversionType;
  /** Multiplier toward the base unit. Required for linear and affine units. */
  factor?: number;
  /** Additive term toward the base unit. Used by affine units. */
  offset?: number;
  /** Key into the engine's custom-conversion registry. Required when custom. */
  customKey?: string;
  /** URL slug used in conversion routes, e.g. "meters". Defaults to plural name. */
  slug: string;
  /** Short factual description shown in unit info sections. */
  description?: string;
  /**
   * Disclosure for units whose value is conventional rather than exact
   * (Mach, month, calorie, pixel...). Surfaced in page content — never hidden.
   */
  note?: string;
  /** Authority for the constant, rendered in documentation and unit info. */
  source?: string;
  seo: SeoTier;
  sortOrder: number;
}

export interface CategoryDefinition {
  /** Stable category id, e.g. "length". */
  id: string;
  /** URL slug, e.g. "length". Kept separate so ids can differ from URLs. */
  slug: string;
  /** Short label used in navigation, e.g. "Length". */
  name: string;
  /** Page title fragment, e.g. "Length & Distance". */
  title: string;
  /** One-sentence summary used in metadata and category cards. */
  summary: string;
  /** Authored introduction paragraph(s) for the category page. */
  description: string;
  /** Id of the unit every other unit in the category is expressed against. */
  baseUnit: string;
  /** Physical quantity, e.g. "length (L)". Shown in the category info panel. */
  quantity: string;
  /** Ids of related categories, used for internal linking. */
  related: string[];
  /** Icon key resolved by the local icon set. */
  icon: string;
  /** Ranking for navigation and homepage ordering; lower is more prominent. */
  sortOrder: number;
  /** Default units pre-selected when the converter opens on this category. */
  defaultPair: [from: string, to: string];
}

/**
 * A curated view over a subset of an existing category's units.
 *
 * UNIT_CATALOG §3.32/§3.33 list Typography and Cooking as categories, but their
 * units are already Length and Volume units. Defining them as separate
 * categories would either duplicate unit definitions (two ids for one physical
 * quantity, so `cup -> liter` could not be computed) or create two canonical
 * URLs for the same conversion, which SEO_SPEC §17 forbids. They are therefore
 * modelled as collections: real landing pages with their own content, whose
 * conversion links point at the canonical pages in the parent category.
 */
export interface CollectionDefinition {
  id: string;
  slug: string;
  name: string;
  title: string;
  summary: string;
  description: string;
  /** Parent category supplying the units and the canonical conversion URLs. */
  categoryId: string;
  /** Ordered subset of the parent category's unit ids. */
  unitIds: string[];
  defaultPair: [from: string, to: string];
  icon: string;
  sortOrder: number;
}
