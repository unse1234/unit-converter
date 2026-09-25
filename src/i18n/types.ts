import type { Locale } from './config';

/**
 * Contracts for the localized sections.
 *
 * Each language supplies one LocaleContent object: its interface strings, its
 * native category and unit names, the sentence templates the page builder
 * fills in, and the list of pages it publishes. Pages are not written one by
 * one — a spec names a unit pair, the phrase people search for and the slug,
 * and the builder derives every number on the page from the conversion engine.
 */

/** The localized categories. A subset of the English ones, plus TV sizes. */
export type LocalCategory =
  'length' | 'mass' | 'temperature' | 'volume' | 'area' | 'speed' | 'cooking' | 'tv';

export interface UnitName {
  /** Singular, used with 1: "pulgada". */
  one: string;
  /** Plural: "pulgadas". */
  other: string;
  /** Symbol shown after numbers. Defaults to the catalog symbol. */
  symbol?: string;
}

export interface FaqEntry {
  question: string;
  answer: string;
}

export interface CategoryText {
  /** URL segment in the language: "longitud". */
  slug: string;
  /** Short navigation label: "Longitud". */
  name: string;
  /** H1 and <title> of the hub page: "Convertidor de longitud". */
  title: string;
  /** Meta description and introduction of the hub page. */
  description: string;
}

/**
 * Single-value pages for a pair ("6 pulgadas a cm"), one per value with
 * measured search demand. `{n}` is replaced by the value.
 */
export interface ValueSeries {
  list: number[];
  /** "{n}-pulgadas-a-cm". A decimal point becomes a hyphen: 1.5 -> "1-5". */
  slug: string;
  /** "{n} pulgadas a cm". */
  phrase: string;
  /** Singular forms for the value 1, when the plural would read wrongly. */
  one?: { slug: string; phrase: string };
  /** Research-backed titles for specific values; the template covers the rest. */
  titles?: Record<number, string>;
  descriptions?: Record<number, string>;
}

export interface PairSpec {
  category: Exclude<LocalCategory, 'tv'>;
  /** URL segment: "pulgadas-a-cm". Mirrors the query's own connector. */
  slug: string;
  /** Unit ids, from the catalog or from i18n/local-units.ts. */
  from: string;
  to: string;
  /** The search phrase the page targets: "pulgadas a cm". */
  phrase: string;
  /** Research-backed <title> and meta description. Templates fill any gap. */
  title?: string;
  description?: string;
  h1?: string;
  /** More units offered in the page's converter, e.g. the regional alqueires. */
  extraUnits?: string[];
  /** Values shown in the reference table. Defaults by category. */
  table?: number[];
  /** Questions people ask about this pair (People Also Ask, related searches). */
  faqs?: FaqEntry[];
  /** Extra explanatory paragraphs: regional values, false friends. */
  notes?: string[];
  values?: ValueSeries;
  /** Listed on the language's home page among the most searched conversions. */
  popular?: boolean;
}

export interface TvSpec {
  sizes: number[];
  /** "tamanho-tv-{n}-polegadas-em-cm". */
  slug: string;
  /** "tamanho tv {n} polegadas em cm". */
  phrase: string;
  titles?: Record<number, string>;
  descriptions?: Record<number, string>;
}

export interface HeightSpec {
  slug: string;
  phrase: string;
  title: string;
  description: string;
  h1: string;
  faqs: FaqEntry[];
}

/** Context handed to the sentence templates. Numbers arrive already formatted. */
export interface PairContext {
  phrase: string;
  from: UnitName;
  to: UnitName;
  fromSymbol: string;
  toSymbol: string;
  /** "1 in = 2.54 cm", or the formula for temperatures. */
  relation: string;
  /** "2.54": the result for one unit. Null for temperature scales. */
  factor: string | null;
  formula: string;
}

export interface ValueContext extends PairContext {
  value: string;
  result: string;
  /** Name of the source unit, singular or plural to match the value. */
  fromName: string;
  toName: string;
  /** "6 × 2.54 = 15.24" */
  working: string;
}

export interface ScreenContext {
  size: string;
  diagonal: string;
  width: string;
  height: string;
}

export interface ConverterLabels {
  value: string;
  placeholder: string;
  from: string;
  to: string;
  swap: string;
  result: string;
  copy: string;
  copied: string;
  copyFailed: string;
  invalid: string;
  belowAbsoluteZero: string;
  /** Screen-reader sentence, with {value}, {from}, {result} and {to} filled in. */
  equals: string;
  feet: string;
  inches: string;
}

export interface LocaleText {
  /* Site chrome ------------------------------------------------------- */
  skipLink: string;
  home: string;
  menuOpen: string;
  menuClose: string;
  menuTitle: string;
  languageMenu: string;
  /** Heading of the "this page in other languages" block. */
  otherLanguages: string;
  /** Link text to the full English converter. */
  englishSite: string;
  footerTagline: string;
  footerCategories: string;
  footerLanguages: string;
  footerAbout: string;
  footerPrivacy: string;
  footerTerms: string;
  footerContact: string;

  /* Home page ---------------------------------------------------------- */
  homeTitle: string;
  homeDescription: string;
  homeH1: string;
  homeIntro: string;
  homeBullets: string[];
  popularHeading: string;
  popularDescription: string;
  categoriesHeading: string;
  localUnitsHeading: string;
  localUnitsDescription: string;
  languagesHeading: string;
  languagesDescription: string;

  /* Converter ---------------------------------------------------------- */
  /** Plain strings only: these are handed to a client component. */
  converter: ConverterLabels;

  /* Conversion pages --------------------------------------------------- */
  pairH1: (ctx: PairContext) => string;
  pairTitle: (ctx: PairContext) => string;
  pairDescription: (ctx: PairContext) => string;
  pairLead: (ctx: PairContext) => string;
  howToHeading: (ctx: PairContext) => string;
  multiplyExplanation: (ctx: PairContext) => string;
  divideExplanation: (ctx: PairContext & { divisor: string }) => string;
  affineExplanation: (ctx: PairContext) => string;
  formulaLabel: string;
  exampleLabel: string;
  tableHeading: (ctx: PairContext) => string;
  tableDescription: (ctx: PairContext) => string;
  valuesHeading: (ctx: PairContext) => string;
  valuesDescription: (ctx: PairContext) => string;
  faqHeading: string;
  relatedHeading: string;
  allInCategory: (category: string) => string;
  /** Heading of the conversion list on a category page: "Conversiones de longitud". */
  categoryPairsHeading: (category: string) => string;
  pairFaqs: (ctx: PairContext & { example: ValueContext }) => FaqEntry[];

  /* Single-value pages ------------------------------------------------- */
  valueH1: (ctx: ValueContext) => string;
  valueTitle: (ctx: ValueContext) => string;
  valueDescription: (ctx: ValueContext) => string;
  valueAnswer: (ctx: ValueContext) => string;
  workingLabel: string;
  nearbyHeading: (ctx: ValueContext) => string;
  backToPair: (ctx: PairContext) => string;
  valueFaqs: (ctx: ValueContext) => FaqEntry[];

  /* Screen sizes ------------------------------------------------------- */
  screenHeading: (ctx: ScreenContext) => string;
  screenIntro: (ctx: ScreenContext) => string;
  screenDiagonal: string;
  screenWidth: string;
  screenHeight: string;
  screenSize: string;
  screenTableHeading: string;
  screenNote: string;
  tvH1: (ctx: ScreenContext & { phrase: string }) => string;
  tvTitle: (ctx: ScreenContext & { phrase: string }) => string;
  tvDescription: (ctx: ScreenContext & { phrase: string }) => string;
  tvFaqs: (ctx: ScreenContext) => FaqEntry[];

  /* Height page -------------------------------------------------------- */
  heightTableHeading: string;
  heightColumn: string;
}

export interface LocaleContent {
  locale: Locale;
  text: LocaleText;
  categories: Partial<Record<LocalCategory, CategoryText>>;
  units: Record<string, UnitName>;
  pairs: PairSpec[];
  tv?: TvSpec;
  height?: HeightSpec;
}
