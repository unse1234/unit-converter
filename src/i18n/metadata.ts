import type { Metadata } from 'next';
import { capitalize } from '@/lib/text';
import { absoluteUrl, siteConfig } from '@/lib/site';
import { LOCALES, LOCALE_DEFINITIONS, type Locale } from './config';
import { buildPairContent, screenContext, valueContext } from './content';
import { LOCALE_CONTENT, getPageAlternates, hreflangMap, type LocalizedPage } from './pages';

/**
 * Metadata for the localized pages: titles and descriptions in the language,
 * the canonical URL, the hreflang cluster and the Open Graph locale.
 */

const SOCIAL_IMAGE = {
  url: '/opengraph-image.png',
  width: 1200,
  height: 630,
  alt: `${siteConfig.name}`,
};

/** Defaults for every page in a language's root layout. */
export function localeRootMetadata(locale: Locale): Metadata {
  const { text } = LOCALE_CONTENT[locale];
  return {
    metadataBase: new URL(siteConfig.url),
    title: { default: text.homeTitle, template: `%s | ${siteConfig.name}` },
    description: text.homeDescription,
    applicationName: siteConfig.name,
    icons: {
      icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
      apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
    },
    manifest: '/manifest.webmanifest',
    robots: siteConfig.indexable
      ? { index: true, follow: true, googleBot: { index: true, follow: true } }
      : { index: false, follow: false },
    formatDetection: { telephone: false },
  };
}

/** The <title> (without the site name) and meta description of a page. */
export function pageTitleAndDescription(page: LocalizedPage): {
  title: string;
  description: string;
  absolute?: boolean;
} {
  const content = LOCALE_CONTENT[page.locale];
  const { text } = content;

  switch (page.kind) {
    case 'home':
      return { title: text.homeTitle, description: text.homeDescription, absolute: true };

    case 'category': {
      const category = content.categories[page.category];
      return { title: category?.title ?? '', description: category?.description ?? '' };
    }

    case 'pair': {
      const { ctx } = buildPairContent(page.locale, page.spec);
      return {
        title: page.spec.title ?? text.pairTitle(ctx),
        description: page.spec.description ?? text.pairDescription(ctx),
      };
    }

    case 'value': {
      const ctx = { ...valueContext(page.locale, page.spec, page.value), phrase: page.phrase };
      return {
        title: page.spec.values?.titles?.[page.value] ?? text.valueTitle(ctx),
        description: page.spec.values?.descriptions?.[page.value] ?? text.valueDescription(ctx),
      };
    }

    case 'tv': {
      const ctx = { ...screenContext(page.locale, page.size), phrase: page.phrase };
      return {
        title: page.spec.titles?.[page.size] ?? text.tvTitle(ctx),
        description: page.spec.descriptions?.[page.size] ?? text.tvDescription(ctx),
      };
    }

    case 'height':
      return { title: page.spec.title, description: page.spec.description };
  }
}

export function localizedPageMetadata(page: LocalizedPage): Metadata {
  const { title, description, absolute } = pageTitleAndDescription(page);
  const url = absoluteUrl(page.path);
  const languages = hreflangMap(getPageAlternates(page), absoluteUrl);
  const definition = LOCALE_DEFINITIONS[page.locale];

  return {
    title: absolute ? { absolute: title } : capitalize(title),
    description,
    alternates: { canonical: url, ...(languages ? { languages } : {}) },
    openGraph: {
      type: 'website',
      title,
      description,
      url,
      siteName: siteConfig.name,
      locale: definition.ogLocale,
      alternateLocale: LOCALES.filter((code) => code !== page.locale).map(
        (code) => LOCALE_DEFINITIONS[code].ogLocale,
      ),
      images: [{ ...SOCIAL_IMAGE, alt: `${siteConfig.name} — ${title}` }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [SOCIAL_IMAGE.url] },
  };
}
