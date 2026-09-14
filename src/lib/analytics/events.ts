/**
 * The product's analytics vocabulary.
 *
 * Every event the app can emit is declared here with its payload type, so a
 * typo or a missing field is a compile error rather than a silently missing
 * metric. PROJECT_REQUIREMENTS §13 lists the events; the types below add the
 * minimum context needed to make each one useful.
 *
 * Privacy: payloads carry unit ids, category ids and interaction context only.
 * No values the user typed, no identifiers, nothing that could single out a
 * person. Adding a field that does is a review-blocking change.
 */
export interface AnalyticsEvents {
  page_view: { path: string };
  conversion_started: { category: string; from: string; to: string };
  conversion_completed: { category: string; from: string; to: string };
  category_changed: { category: string };
  unit_changed: { category: string; side: 'from' | 'to'; unit: string };
  swap_clicked: { category: string; from: string; to: string };
  result_copied: { category: string; from: string; to: string };
  search_used: { resultCount: number; matched: boolean };
  favorite_added: { category: string; from: string; to: string };
  favorite_removed: { category: string; from: string; to: string };
  recent_conversion_used: { category: string; from: string; to: string };
  precision_changed: { precision: number };
}

export type AnalyticsEventName = keyof AnalyticsEvents;
