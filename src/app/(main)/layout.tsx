import type { Metadata, Viewport } from 'next';
import { siteConfig } from '@/lib/site';
import { RootDocument, rootViewport } from '@/components/layout/RootDocument';
import { SiteFooter } from '@/components/navigation/SiteFooter';
import { SiteHeader } from '@/components/navigation/SiteHeader';

/**
 * The site-wide sharing image.
 *
 * A committed PNG in public/ rather than a next/og route. A static export
 * writes a generated image route to an EXTENSIONLESS file (out/opengraph-image),
 * which Cloudflare then serves without an image content type — social
 * scrapers reject it. A real .png has none of that ambiguity.
 *
 * Declared here so the defaults below carry it. A page that sets its own
 * `openGraph` object replaces the inherited image, which is why
 * lib/seo/metadata.ts re-declares it for every page that does.
 *
 * To redraw it: the source that produced it is in docs/social-image.md.
 */
const SOCIAL_IMAGE = {
  url: '/opengraph-image.png',
  width: 1200,
  height: 630,
  alt: `${siteConfig.name} — free online unit converter with formulas and reference tables`,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.defaultTitle,
    // Page titles supply their own subject; the site name is appended here so
    // no page has to repeat it and risk an over-long, keyword-stuffed title.
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: {
    type: 'website',
    siteName: siteConfig.name,
    title: siteConfig.defaultTitle,
    description: siteConfig.description,
    url: siteConfig.url,
    locale: siteConfig.locale.replace('-', '_'),
    images: [SOCIAL_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.defaultTitle,
    description: siteConfig.description,
    images: [SOCIAL_IMAGE.url],
  },
  icons: {
    // app/icon.svg exports with its extension intact. It is named here because
    // the file convention links it only from a single top-level root layout,
    // and the site now has one root layout per language. The Apple icon is a
    // public/ file.
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  manifest: '/manifest.webmanifest',
  // Preview and staging builds are noindexed; see siteConfig.indexable.
  robots: siteConfig.indexable
    ? { index: true, follow: true, googleBot: { index: true, follow: true } }
    : { index: false, follow: false },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = rootViewport;

/**
 * Root layout for the English site.
 *
 * Localized sections (/es, /pt…) have root layouts of their own so they can
 * declare their own <html lang>; see components/layout/RootDocument.tsx.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <RootDocument
      lang="en"
      skipLabel="Skip to main content"
      header={<SiteHeader />}
      footer={<SiteFooter />}
    >
      {children}
    </RootDocument>
  );
}
