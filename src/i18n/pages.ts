import { getAllConversionPairs } from '@/domain/conversion/pairs';
import { getCategory, getCollectionBySlug } from '@/domain/units/registry';
import {
  LOCALES,
  LOCALE_DEFINITIONS,
  localeHomePath,
  type Locale,
  type SiteLanguage,
} from './config';
import { fillSlug, fillValue } from './format';
import { es } from './locales/es';
import { fr } from './locales/fr';
import { id } from './locales/id';
import { it } from './locales/it';
import { pt } from './locales/pt';
import type { HeightSpec, LocalCategory, LocaleContent, PairSpec, TvSpec } from './types';

/**
 * The page registry for the localized sections.
 *
 * Expands each language's specs into concrete pages with their paths, and
 * groups pages that are translations of each other into hreflang clusters.
 * Routes, the sitemap, hreflang tags and every internal link read from here,
 * so none of them can point at a page that is not built.
 */

export const LOCALE_CONTENT: Record<Locale, LocaleContent> = { es, pt, it, fr, id };

/** Order in which categories appear in navigation. */
const CATEGORY_ORDER: LocalCategory[] = [
  'length',
  'mass',
  'temperature',
  'volume',
  'tv',
  'area',
  'speed',
  'cooking',
];

interface PageBase {
  locale: Locale;
  /** Site-relative path, e.g. "/es/longitud/pulgadas-a-cm". */
  path: string;
  /** Pages sharing a cluster are the same content in different languages. */
  cluster: string;
}

export type LocalizedPage =
  | (PageBase & { kind: 'home' })
  | (PageBase & { kind: 'category'; category: LocalCategory })
  | (PageBase & { kind: 'pair'; category: LocalCategory; spec: PairSpec })
  | (PageBase & {
      kind: 'value';
      category: LocalCategory;
      spec: PairSpec;
      value: number;
      phrase: string;
    })
  | (PageBase & { kind: 'tv'; category: 'tv'; spec: TvSpec; size: number; phrase: string })
  | (PageBase & { kind: 'height'; category: 'length'; spec: HeightSpec });

export type ConversionLikePage = Exclude<LocalizedPage, { kind: 'home' } | { kind: 'category' }>;

export function categorySlug(locale: Locale, category: LocalCategory): string {
  const text = LOCALE_CONTENT[locale].categories[category];
  if (!text) throw new Error(`Missing category text: ${locale}/${category}`);
  return text.slug;
}

export function categoryPath(locale: Locale, category: LocalCategory): string {
  return `/${locale}/${categorySlug(locale, category)}`;
}

/** The value a single-value page targets, or null when the spec has none. */
function valuePhraseAndSlug(spec: PairSpec, value: number, locale: Locale) {
  const series = spec.values;
  if (!series) return null;
  if (value === 1 && series.one) return { phrase: series.one.phrase, slug: series.one.slug };
  return { phrase: fillValue(series.phrase, value, locale), slug: fillSlug(series.slug, value) };
}

function buildLocalePages(locale: Locale): LocalizedPage[] {
  const content = LOCALE_CONTENT[locale];
  const pages: LocalizedPage[] = [];
  const tvSizes = new Set(content.tv?.sizes ?? []);

  for (const spec of content.pairs) {
    const base = categoryPath(locale, spec.category);
    pages.push({
      kind: 'pair',
      locale,
      category: spec.category,
      spec,
      path: `${base}/${spec.slug}`,
      cluster: `pair:${spec.from}:${spec.to}`,
    });

    for (const value of spec.values?.list ?? []) {
      // A TV-size page answers the same query; one page per intent.
      if (spec.from === 'inch' && spec.to === 'centimeter' && tvSizes.has(value)) continue;
      const target = valuePhraseAndSlug(spec, value, locale);
      if (!target) continue;
      pages.push({
        kind: 'value',
        locale,
        category: spec.category,
        spec,
        value,
        phrase: target.phrase,
        path: `${base}/${target.slug}`,
        cluster: `value:${spec.from}:${spec.to}:${value}`,
      });
    }
  }

  if (content.tv) {
    const base = categoryPath(locale, 'tv');
    for (const size of content.tv.sizes) {
      pages.push({
        kind: 'tv',
        locale,
        category: 'tv',
        spec: content.tv,
        size,
        phrase: fillValue(content.tv.phrase, size, locale),
        path: `${base}/${fillSlug(content.tv.slug, size)}`,
        // A TV-size page and a "55 pollici in cm" page answer the same question.
        cluster: `value:inch:centimeter:${size}`,
      });
    }
  }

  if (content.height) {
    pages.push({
      kind: 'height',
      locale,
      category: 'length',
      spec: content.height,
      path: `${categoryPath(locale, 'length')}/${content.height.slug}`,
      cluster: 'height',
    });
  }

  const used = new Set(pages.map((page) => (page.kind === 'home' ? null : page.category)));
  const categories = CATEGORY_ORDER.filter((category) => used.has(category));

  return [
    { kind: 'home', locale, path: localeHomePath(locale), cluster: 'home' },
    ...categories.map((category): LocalizedPage => ({
      kind: 'category',
      locale,
      category,
      path: categoryPath(locale, category),
      cluster: `category:${category}`,
    })),
    ...pages,
  ];
}

let allPages: LocalizedPage[] | null = null;
let byPath: Map<string, LocalizedPage> | null = null;
let byCluster: Map<string, LocalizedPage[]> | null = null;

function index() {
  if (!allPages) {
    allPages = LOCALES.flatMap(buildLocalePages);
    byPath = new Map();
    byCluster = new Map();
    for (const page of allPages) {
      if (byPath.has(page.path)) throw new Error(`Duplicate localized path: ${page.path}`);
      byPath.set(page.path, page);
      const members = byCluster.get(page.cluster) ?? [];
      members.push(page);
      byCluster.set(page.cluster, members);
    }
  }
  return { allPages, byPath: byPath!, byCluster: byCluster! };
}

export function getLocalizedPages(locale?: Locale): LocalizedPage[] {
  const pages = index().allPages;
  return locale ? pages.filter((page) => page.locale === locale) : pages;
}

export function getLocalizedPage(path: string): LocalizedPage | undefined {
  return index().byPath.get(path);
}

export function getLocaleCategories(locale: Locale): LocalCategory[] {
  return getLocalizedPages(locale)
    .filter(
      (page): page is Extract<LocalizedPage, { kind: 'category' }> => page.kind === 'category',
    )
    .map((page) => page.category);
}

/** The conversion pages in one category of one language, in authored order. */
export function getCategoryPages(locale: Locale, category: LocalCategory): ConversionLikePage[] {
  return getLocalizedPages(locale).filter(
    (page): page is ConversionLikePage =>
      page.kind !== 'home' && page.kind !== 'category' && page.category === category,
  );
}

/** Finds the page for a pair in a language, if that language publishes it. */
export function findPairPage(locale: Locale, from: string, to: string) {
  return index()
    .byCluster.get(`pair:${from}:${to}`)
    ?.find((page) => page.locale === locale) as
    Extract<LocalizedPage, { kind: 'pair' }> | undefined;
}

/** Finds the single-value or TV page for a value, if one exists in the language. */
export function findValuePage(locale: Locale, from: string, to: string, value: number) {
  return index()
    .byCluster.get(`value:${from}:${to}:${value}`)
    ?.find((page) => page.locale === locale);
}

/* -------------------------------------------------------------------------- */
/* hreflang                                                                    */
/* -------------------------------------------------------------------------- */

let englishByCluster: Map<string, string> | null = null;
let clusterByEnglishPath: Map<string, string> | null = null;

/** The English page each cluster translates, where one exists. */
function englishIndex() {
  if (!englishByCluster || !clusterByEnglishPath) {
    englishByCluster = new Map([['home', '/']]);

    for (const category of CATEGORY_ORDER) {
      const english =
        category === 'cooking'
          ? getCollectionBySlug('cooking')?.slug
          : category === 'tv'
            ? undefined
            : getCategory(category)?.slug;
      if (english) englishByCluster.set(`category:${category}`, `/${english}`);
    }

    for (const pair of getAllConversionPairs()) {
      englishByCluster.set(`pair:${pair.fromUnitId}:${pair.toUnitId}`, pair.path);
    }

    // Only clusters with at least one localized page matter.
    const clusters = index().byCluster;
    clusterByEnglishPath = new Map();
    for (const [cluster, path] of englishByCluster) {
      if (clusters.has(cluster)) clusterByEnglishPath.set(path, cluster);
      else englishByCluster.delete(cluster);
    }
  }
  return { englishByCluster, clusterByEnglishPath };
}

/**
 * Every language version of a cluster, keyed by site language. English is
 * included when an English page translates the cluster.
 */
function clusterAlternates(cluster: string): Partial<Record<SiteLanguage, string>> {
  const alternates: Partial<Record<SiteLanguage, string>> = {};
  const english = englishIndex().englishByCluster.get(cluster);
  if (english) alternates.en = english;
  for (const page of index().byCluster.get(cluster) ?? []) alternates[page.locale] = page.path;
  return alternates;
}

/** All language versions of a localized page, including itself. */
export function getPageAlternates(page: LocalizedPage) {
  return clusterAlternates(page.cluster);
}

/** Language versions of an English page; empty when it has no translation. */
export function getEnglishPageAlternates(path: string): Partial<Record<SiteLanguage, string>> {
  const cluster = englishIndex().clusterByEnglishPath.get(path);
  return cluster ? clusterAlternates(cluster) : {};
}

/**
 * The hreflang map for <link rel="alternate">, as absolute or relative URLs.
 * x-default points at English when the cluster has an English page, which is
 * the version for every language the site is not published in.
 */
export function hreflangMap(
  alternates: Partial<Record<SiteLanguage, string>>,
  toUrl: (path: string) => string,
): Record<string, string> | undefined {
  const entries = Object.entries(alternates) as [SiteLanguage, string][];
  if (entries.length < 2) return undefined;

  const map: Record<string, string> = {};
  for (const [language, path] of entries) {
    map[language === 'en' ? 'en' : LOCALE_DEFINITIONS[language].hreflang] = toUrl(path);
  }
  if (alternates.en) map['x-default'] = toUrl(alternates.en);
  return map;
}
