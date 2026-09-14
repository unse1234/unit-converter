import type { CollectionDefinition } from '@/types/units';

/**
 * Curated views over an existing category's units.
 *
 * UNIT_CATALOG §3.32 and §3.33 list Typography and Cooking as categories, but
 * their units are already Length and Volume units. Defining them as separate
 * categories would mean either duplicate unit ids for one physical quantity
 * (so `cups -> liters` could not be computed at all) or two canonical URLs for
 * the same conversion, which SEO_SPEC §17 forbids.
 *
 * They are therefore landing pages with their own content and their own
 * converter defaults, while every conversion link points at the canonical page
 * in the parent category.
 */
export const collections: CollectionDefinition[] = [
  {
    id: 'cooking',
    slug: 'cooking',
    name: 'Cooking',
    title: 'Cooking & Recipe Measurements',
    summary: 'Convert cups, tablespoons, teaspoons, millilitres and fluid ounces between systems.',
    description:
      'Recipe measurements are the most quietly inconsistent units in daily use. A cup is 236.6 mL in US customary measure, 240 mL on a US nutrition label and 250 mL in Australia and New Zealand. A tablespoon is 15 mL in most metric kitchens but 20 mL in Australia and 14.8 mL in the US. These conversions use the exact definition for each system, and every unit below says which system it belongs to — so a recipe scales correctly instead of approximately.',
    categoryId: 'volume',
    unitIds: [
      'us-teaspoon',
      'metric-teaspoon',
      'us-tablespoon',
      'metric-tablespoon',
      'imperial-tablespoon',
      'australian-tablespoon',
      'us-cup',
      'us-legal-cup',
      'metric-cup',
      'us-fluid-ounce',
      'imperial-fluid-ounce',
      'milliliter',
      'liter',
      'us-pint',
      'imperial-pint',
      'us-quart',
      'us-gallon',
    ],
    defaultPair: ['us-cup', 'milliliter'],
    icon: 'beaker',
    sortOrder: 1,
  },
  {
    id: 'typography',
    slug: 'typography',
    name: 'Typography',
    title: 'Typography & Print Measurements',
    summary: 'Convert points, picas, pixels, inches and millimetres used in type and layout.',
    description:
      'Typographic units are all defined against the inch. A DTP point is exactly 1/72 inch, a pica is 12 points, and the CSS reference pixel is exactly 1/96 inch — which makes 1 pixel exactly 0.75 point, the conversion behind every px-to-pt question in design software. Note that a pixel is a reference unit: its physical size on screen depends on the display’s pixel density.',
    categoryId: 'length',
    unitIds: ['point', 'pica', 'pixel', 'twip', 'inch', 'millimeter', 'centimeter'],
    defaultPair: ['pixel', 'point'],
    icon: 'type',
    sortOrder: 2,
  },
];
