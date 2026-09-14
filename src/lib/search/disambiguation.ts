/**
 * Resolution rules for terms that match more than one unit in a category.
 *
 * Some shorthand is genuinely ambiguous — "mb" is both megabit and megabyte,
 * "pc" is both pica and parsec — usually because two SI symbols differ only by
 * case and a search box is case-insensitive.
 *
 * UNIT_CATALOG §6 requires that aliases do not create ambiguous matches
 * "without resolution rules". This file is that rule set. It does not hide the
 * alternatives: search still returns every match, so the user sees both. This
 * only decides which one is ranked first and which one a typed shorthand
 * resolves to when the user presses Enter.
 *
 * Each entry records why the winner was chosen. An unresolved collision is a
 * catalog validation error, so adding an ambiguous alias without a rule fails
 * the build rather than quietly guessing.
 */
export const PREFERRED_FOR_TERM: Record<string, string> = {
  // Both are written "pc". The parsec owns the exact symbol in modern usage;
  // pica is still reachable by name and from the Typography page.
  pc: 'parsec',

  // Case-collapsed SI symbols in digital storage. In everyday speech the
  // byte-based unit is meant: people say "500 GB drive", not gigabit.
  b: 'byte',
  kb: 'kilobyte',
  mb: 'megabyte',
  gb: 'gigabyte',
  tb: 'terabyte',
  pb: 'petabyte',
  kib: 'kibibyte',
  mib: 'mebibyte',
  gib: 'gibibyte',
  tib: 'tebibyte',
  pib: 'pebibyte',

  // Transfer rates go the other way: bandwidth is quoted in bits per second,
  // which is also what the lowercase "b" in "mb/s" correctly denotes.
  'kb/s': 'kilobit-per-second',
  'mb/s': 'megabit-per-second',
  'gb/s': 'gigabit-per-second',

  // MW (megawatt) and mW (milliwatt). Megawatt is the far more common query.
  mw: 'megawatt',

  // MN (meganewton) and mN (millinewton). Millinewtons appear in everyday
  // measurement work; meganewtons are rare outside structural engineering.
  mn: 'millinewton',

  // MV (megavolt) and mV (millivolt). Millivolts dominate real usage.
  mv: 'millivolt',

  // MΩ (megaohm) and mΩ (milliohm). Megaohm is the common datasheet value.
  mω: 'megaohm',
};

/** The unit id a shorthand term resolves to, if a rule exists for it. */
export function getPreferredUnitId(term: string): string | undefined {
  return PREFERRED_FOR_TERM[term.trim().toLowerCase()];
}

/** True when an ambiguous term has a documented winner. */
export function hasResolutionRule(term: string): boolean {
  return getPreferredUnitId(term) !== undefined;
}
