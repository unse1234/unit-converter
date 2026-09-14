import type { ConversionType, MeasurementSystem, SeoTier, UnitDefinition } from '@/types/units';

/**
 * Authoring shape for a unit. Only the fields that differ from the category
 * defaults need to be supplied, which keeps the catalog files readable and
 * makes a wrong value easy to spot in review.
 */
export interface UnitInput {
  id: string;
  name: string;
  /** Defaults to `name` + "s". */
  plural?: string;
  /** Shorter heading name, e.g. "Celsius". Defaults to the plural. */
  titleName?: string;
  symbol: string;
  aliases?: string[];
  system?: MeasurementSystem;
  /** Multiplier toward the category base unit. Defaults to 1. */
  factor?: number;
  /** Additive term toward the base unit; presence implies an affine unit. */
  offset?: number;
  /** Overrides the inferred conversion type. */
  type?: ConversionType;
  /** Key into the engine custom-conversion registry; implies `custom`. */
  customKey?: string;
  /** Defaults to a slugified plural name. */
  slug?: string;
  description?: string;
  note?: string;
  source?: string;
  /** Defaults to "secondary": usable everywhere, but no generated page. */
  seo?: SeoTier;
}

/** Lowercase, hyphenated, ASCII-only slug suitable for a URL segment. */
export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/²/g, '2')
    .replace(/³/g, '3')
    .replace(/µ/g, 'u')
    .replace(/°/g, '')
    .replace(/×/g, 'x')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

/**
 * Expands compact unit inputs into full definitions, filling in the category,
 * base unit, conversion type, slug and sort order.
 */
export function defineUnits(
  category: string,
  baseUnit: string,
  inputs: readonly UnitInput[],
): UnitDefinition[] {
  return inputs.map((input, index) => {
    const pluralName = input.plural ?? `${input.name}s`;
    const conversionType: ConversionType =
      input.type ?? (input.customKey ? 'custom' : input.offset !== undefined ? 'affine' : 'linear');

    const unit: UnitDefinition = {
      id: input.id,
      category,
      name: input.name,
      pluralName,
      symbol: input.symbol,
      aliases: input.aliases ?? [],
      system: input.system ?? 'metric',
      baseUnit,
      conversionType,
      slug: input.slug ?? slugify(pluralName),
      seo: input.seo ?? 'secondary',
      sortOrder: index,
    };

    if (conversionType !== 'custom') {
      unit.factor = input.factor ?? 1;
      if (input.offset !== undefined) unit.offset = input.offset;
    }
    if (input.titleName) unit.titleName = input.titleName;
    if (input.customKey) unit.customKey = input.customKey;
    if (input.description) unit.description = input.description;
    if (input.note) unit.note = input.note;
    if (input.source) unit.source = input.source;

    return unit;
  });
}
