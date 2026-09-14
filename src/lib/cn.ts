/**
 * Joins class names, dropping falsy values.
 *
 * Deliberately not `clsx` + `tailwind-merge`, which would add two dependencies
 * to resolve conflicting utilities. The rule instead: never pass a class that
 * competes with one a component already sets (display, colour, weight, size).
 * Two such utilities are resolved by stylesheet order, not by the order in the
 * class list, so the override silently may or may not apply. Wrap the
 * component, or add a variant, instead.
 */
export type ClassValue = string | false | null | undefined;

export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ');
}
