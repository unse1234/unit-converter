/**
 * Small text helpers for generated page copy.
 */

/** Upper-cases the first character only, so "US gallons" and "°C" stay intact. */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Prefixes "a" or "an" by sound rather than spelling: "an inch", "an hour",
 * "an imperial unit", but "a US gallon".
 */
export function withArticle(phrase: string): string {
  const lower = phrase.toLowerCase();
  const vowelSound = /^(hour|honest|heir)/.test(lower) || /^[aeio]/.test(lower);
  return `${vowelSound ? 'an' : 'a'} ${phrase}`;
}
