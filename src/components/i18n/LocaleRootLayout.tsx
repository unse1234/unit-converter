import type { ReactNode } from 'react';
import { LOCALE_DEFINITIONS, type Locale } from '@/i18n/config';
import { LOCALE_CONTENT } from '@/i18n/pages';
import { RootDocument } from '@/components/layout/RootDocument';
import { LocaleFooter, LocaleHeader } from './LocaleChrome';

/** The root layout of one language's section, with its own <html lang>. */
export function LocaleRootLayout({ locale, children }: { locale: Locale; children: ReactNode }) {
  return (
    <RootDocument
      lang={LOCALE_DEFINITIONS[locale].hreflang}
      skipLabel={LOCALE_CONTENT[locale].text.skipLink}
      header={<LocaleHeader locale={locale} />}
      footer={<LocaleFooter locale={locale} />}
    >
      {children}
    </RootDocument>
  );
}
