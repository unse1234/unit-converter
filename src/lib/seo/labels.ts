import { capitalize } from '@/lib/text';
import type { UnitDefinition } from '@/types/units';

/**
 * How units are named in headings, links and breadcrumbs.
 *
 * Most units read naturally by their plural ("meters to feet"). Temperature
 * scales do not: people search "celsius to fahrenheit", not "degrees Celsius
 * to degrees Fahrenheit", so those units carry a shorter heading name.
 */
export function unitHeadingName(unit: UnitDefinition): string {
  return unit.titleName ?? unit.pluralName;
}

/** For use inside a sentence: "meters to feet", "Celsius to Fahrenheit". */
export function pairPhrase(from: UnitDefinition, to: UnitDefinition): string {
  return `${unitHeadingName(from)} to ${unitHeadingName(to)}`;
}

/** For a link, breadcrumb or heading on its own: "Meters to feet". */
export function pairLabel(from: UnitDefinition, to: UnitDefinition): string {
  return capitalize(pairPhrase(from, to));
}
