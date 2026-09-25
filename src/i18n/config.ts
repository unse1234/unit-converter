/**
 * The languages UnitFlip is published in, besides English.
 *
 * The five launch languages come from the multilingual market research
 * (docs/multilingual-seo.md): Spanish first (Mexico, Spain, Colombia on one
 * build), then Brazilian Portuguese, Italian, French and Indonesian. Each gets
 * its own folder (/es/, /pt/…), its own native-language slugs and an hreflang
 * cluster with the English page it translates.
 *
 * English stays at the root with no prefix, so no existing URL changes.
 */

export const LOCALES = ['es', 'pt', 'it', 'fr', 'id'] as const;

export type Locale = (typeof LOCALES)[number];

/** Every language the site is published in, English included. */
export type SiteLanguage = 'en' | Locale;

export interface LocaleDefinition {
  code: Locale;
  /** Value for <html lang> and the hreflang attribute. */
  hreflang: string;
  /** Open Graph locale for the primary market. */
  ogLocale: string;
  /**
   * BCP 47 tag used to format numbers. Mexico, the primary Spanish market,
   * writes a decimal point ("1.5 pulgadas a cm"); the others use a comma.
   */
  numberLocale: string;
  /** The language's own name, as shown in the language menu. */
  nativeName: string;
  /** The primary market, for the language page's introduction. */
  markets: string;
}

export const LOCALE_DEFINITIONS: Record<Locale, LocaleDefinition> = {
  es: {
    code: 'es',
    hreflang: 'es',
    ogLocale: 'es_MX',
    numberLocale: 'es-MX',
    nativeName: 'Español',
    markets: 'México, España y Colombia',
  },
  pt: {
    code: 'pt',
    hreflang: 'pt',
    ogLocale: 'pt_BR',
    numberLocale: 'pt-BR',
    nativeName: 'Português',
    markets: 'Brasil e Portugal',
  },
  it: {
    code: 'it',
    hreflang: 'it',
    ogLocale: 'it_IT',
    numberLocale: 'it-IT',
    nativeName: 'Italiano',
    markets: 'Italia',
  },
  fr: {
    code: 'fr',
    hreflang: 'fr',
    ogLocale: 'fr_FR',
    numberLocale: 'fr-FR',
    nativeName: 'Français',
    markets: 'France',
  },
  id: {
    code: 'id',
    hreflang: 'id',
    ogLocale: 'id_ID',
    numberLocale: 'id-ID',
    nativeName: 'Bahasa Indonesia',
    markets: 'Indonesia',
  },
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** Site-relative path of a language's home page. */
export function localeHomePath(language: SiteLanguage): string {
  return language === 'en' ? '/' : `/${language}`;
}

/** Every site language with its own name and home page, English first. */
export function siteLanguages(): { code: SiteLanguage; name: string; href: string }[] {
  return [
    { code: 'en', name: 'English', href: '/' },
    ...LOCALES.map((code) => ({
      code,
      name: LOCALE_DEFINITIONS[code].nativeName,
      href: localeHomePath(code),
    })),
  ];
}
