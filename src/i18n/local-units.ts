import { defineUnits } from '@/data/define';
import { getUnit } from '@/domain/units/registry';
import type { UnitDefinition } from '@/types/units';

/**
 * Traditional units that exist only in the localized sections.
 *
 * They are real, searched-for units in one market — "1 ons berapa gram" has
 * more than 10,000 searches a month in Indonesia, and alqueire has 17 phrases
 * above 1,000 a month in Brazil — but they mean nothing to the English site, so
 * they are kept out of the global catalog and its generated English pages.
 *
 * Each is expressed against the catalog's base unit for its category (kg for
 * mass, m² for area), so the ordinary conversion engine handles them.
 *
 * Values:
 *  - ons (Indonesia): 100 g, the everyday Indonesian ons ("1 ons = 100 gram").
 *  - kuintal: 100 kg.
 *  - arroba (Brazil): 15 kg, the unit Brazilian cattle and carcass prices use.
 *  - alqueire: a regional land unit. Paulista 24,200 m² (2.42 ha), mineiro
 *    48,400 m² (4.84 ha), baiano 96,800 m² (9.68 ha).
 */

const mass = defineUnits('mass', 'kilogram', [
  {
    id: 'ons-id',
    name: 'ons',
    plural: 'ons',
    symbol: 'ons',
    factor: 0.1,
    system: 'other',
    slug: 'ons',
    description: 'The Indonesian ons: 100 grams.',
  },
  {
    id: 'kuintal',
    name: 'kuintal',
    plural: 'kuintal',
    symbol: 'kw',
    factor: 100,
    system: 'other',
    slug: 'kuintal',
    description: 'The kuintal (quintal): 100 kilograms.',
  },
  {
    id: 'arroba-br',
    name: 'arroba',
    symbol: '@',
    factor: 15,
    system: 'other',
    slug: 'arrobas',
    description: 'The Brazilian arroba used in the cattle trade: 15 kilograms.',
  },
]);

const area = defineUnits('area', 'square-meter', [
  {
    id: 'alqueire-paulista',
    name: 'alqueire paulista',
    plural: 'alqueires paulistas',
    symbol: 'alq. paulista',
    factor: 24_200,
    system: 'other',
    slug: 'alqueires-paulistas',
    description: 'Regional land unit of São Paulo, Paraná and the South-East: 24,200 m².',
  },
  {
    id: 'alqueire-mineiro',
    name: 'alqueire mineiro',
    plural: 'alqueires mineiros',
    symbol: 'alq. mineiro',
    factor: 48_400,
    system: 'other',
    slug: 'alqueires-mineiros',
    description: 'Regional land unit of Minas Gerais, Rio de Janeiro and Goiás: 48,400 m².',
  },
  {
    id: 'alqueire-baiano',
    name: 'alqueire baiano',
    plural: 'alqueires baianos',
    symbol: 'alq. baiano',
    factor: 96_800,
    system: 'other',
    slug: 'alqueires-baianos',
    description: 'Regional land unit of Bahia and the North-East: 96,800 m².',
  },
]);

const LOCAL_UNITS = new Map<string, UnitDefinition>(
  [...mass, ...area].map((unit) => [unit.id, unit]),
);

/** Resolves a unit id from the catalog or from the local units above. */
export function getLocalizableUnit(id: string): UnitDefinition | undefined {
  return getUnit(id) ?? LOCAL_UNITS.get(id);
}

export function requireLocalizableUnit(id: string): UnitDefinition {
  const unit = getLocalizableUnit(id);
  if (!unit) throw new Error(`Unknown unit in localized content: ${id}`);
  return unit;
}
