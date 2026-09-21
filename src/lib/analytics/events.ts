/**
 * The product's analytics vocabulary.
 *
 * Every event the app can emit is declared here with its payload type, so a
 * typo or a missing field is a compile error rather than a silently missing
 * metric.
 *
 * Payload keys are snake_case because that is what GA4 stores; a camelCase key
 * would arrive as a differently named custom dimension.
 *
 * Privacy: payloads carry unit ids, category ids and interaction context only.
 * No values the user typed, no identifiers, nothing that could single out a
 * person. Adding a field that does is a review-blocking change.
 */
export interface AnalyticsEvents {
  /** A completed conversion, sent once the user stops typing. */
  conversion_used: { from_unit: string; to_unit: string; category: string };
  conversion_started: { category: string; from_unit: string; to_unit: string };
  category_changed: { category: string };
  unit_changed: { category: string; side: 'from' | 'to'; unit: string };
  swap_clicked: { category: string; from_unit: string; to_unit: string };
  result_copied: { category: string; from_unit: string; to_unit: string };
  search_used: { result_count: number; matched: boolean };
  favorite_added: { category: string; from_unit: string; to_unit: string };
  favorite_removed: { category: string; from_unit: string; to_unit: string };
  recent_conversion_used: { category: string; from_unit: string; to_unit: string };
  precision_changed: { precision: number };
}

export type AnalyticsEventName = keyof AnalyticsEvents;
