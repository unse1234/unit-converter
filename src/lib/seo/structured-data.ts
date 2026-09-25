import { absoluteUrl, siteConfig } from '@/lib/site';

/**
 * Structured data.
 *
 * SEO_SPEC §10 allows structured data only where the schema genuinely matches
 * the content. That limits this file to three types:
 *
 *  - BreadcrumbList, because the hierarchy is real and reflected in the URL.
 *  - FAQPage, only on pages whose questions are answered from computed values.
 *  - WebSite with SearchAction, because /search is a real, working endpoint.
 *  - Organization, identifying the publisher behind the site.
 *
 * There is deliberately no Product, Review, Rating or HowTo markup: none of it
 * describes this content, and fabricating it is the kind of SEO hack the spec
 * rules out.
 */

export interface BreadcrumbEntry {
  name: string;
  /** Site-relative path. The final entry may omit it. */
  path?: string;
}

export function breadcrumbSchema(entries: BreadcrumbEntry[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: entries.map((entry, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: entry.name,
      ...(entry.path ? { item: absoluteUrl(entry.path) } : {}),
    })),
  };
}

export interface FaqEntry {
  question: string;
  answer: string;
}

export function faqSchema(entries: FaqEntry[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entries.map((entry) => ({
      '@type': 'Question',
      name: entry.question,
      acceptedAnswer: { '@type': 'Answer', text: entry.answer },
    })),
  };
}

/**
 * A page in a given language. Used on the localized pages, where it states the
 * page's language and ties it to the one site it belongs to.
 */
export function webPageSchema({
  name,
  description,
  path,
  language,
}: {
  name: string;
  description: string;
  path: string;
  language: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    description,
    url: absoluteUrl(path),
    inLanguage: language,
    isPartOf: { '@id': WEBSITE_ID },
  };
}

/** Stable node ids, so WebSite and Organization can reference each other. */
const ORGANIZATION_ID = `${siteConfig.url}/#organization`;
const WEBSITE_ID = `${siteConfig.url}/#website`;

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: siteConfig.name,
    alternateName: siteConfig.defaultTitle,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: siteConfig.locale,
    publisher: { '@id': ORGANIZATION_ID },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: siteConfig.name,
    url: siteConfig.url,
    logo: {
      '@type': 'ImageObject',
      url: absoluteUrl('/icon.svg'),
    },
    description: siteConfig.description,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: siteConfig.contactEmail,
      url: absoluteUrl('/contact'),
      availableLanguage: 'English',
    },
  };
}
