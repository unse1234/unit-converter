import type { Metadata, Viewport } from 'next';
import { NotFoundContent } from '@/components/content/NotFoundContent';
import { RootDocument, rootViewport } from '@/components/layout/RootDocument';
import { SiteFooter } from '@/components/navigation/SiteFooter';
import { SiteHeader } from '@/components/navigation/SiteHeader';
import { siteConfig } from '@/lib/site';

/**
 * The 404 page for any URL that matches no route.
 *
 * The site has several root layouts (English plus one per language), so there
 * is no single layout a root not-found.tsx could render inside. Next renders
 * this file as a complete document instead, and the static export writes it to
 * out/404.html.
 */

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: `Page not found | ${siteConfig.name}`,
  robots: { index: false, follow: true },
  icons: { icon: [{ url: '/icon.svg', type: 'image/svg+xml' }] },
};

export const viewport: Viewport = rootViewport;

export default function GlobalNotFound() {
  return (
    <RootDocument
      lang="en"
      skipLabel="Skip to main content"
      header={<SiteHeader />}
      footer={<SiteFooter />}
    >
      <NotFoundContent />
    </RootDocument>
  );
}
