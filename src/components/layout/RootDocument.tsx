import type { Viewport } from 'next';
import type { ReactNode } from 'react';
import { GoogleAnalytics } from '@next/third-parties/google';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import { siteConfig } from '@/lib/site';
import { ThemeProvider, themeInitScript } from '@/components/theme/theme';
import '@/styles/globals.css';

/**
 * The <html> document shared by every root layout.
 *
 * The site has one root layout per language — (main) for English and one per
 * localized folder — because <html lang> can only be set by a root layout, and
 * a Spanish page must not ship as lang="en". They differ only in the language,
 * the header and the footer, so everything else lives here once.
 */

export const rootViewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Zoom is never capped: limiting it fails WCAG 1.4.4.
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export function RootDocument({
  lang,
  skipLabel,
  header,
  footer,
  children,
}: {
  lang: string;
  /** Text of the "skip to main content" link, in the page's language. */
  skipLabel: string;
  header: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}) {
  return (
    // suppressHydrationWarning: the inline script below sets data-theme on this
    // element before React hydrates, which is the point of it.
    <html
      lang={lang}
      dir="ltr"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      {/* A root layout's own <head>; the rule targets the Pages Router. */}
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <ThemeProvider>
          <a href="#main" className="skip-link">
            {skipLabel}
          </a>
          {header}
          <main id="main" className="flex-1 focus:outline-none" tabIndex={-1}>
            {children}
          </main>
          {footer}
        </ThemeProvider>
        {/*
          Nothing is requested from Google unless NEXT_PUBLIC_GA_ID is set at
          build time. With it unset the site loads no third-party script and
          sets no analytics cookie.
        */}
        {siteConfig.gaId ? <GoogleAnalytics gaId={siteConfig.gaId} /> : null}
      </body>
    </html>
  );
}
