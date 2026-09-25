import type { Metadata } from 'next';
import { homeMetadata } from '@/i18n/routes';
import { LocaleHomePage } from '@/components/i18n/LocalizedPages';

export const metadata: Metadata = homeMetadata('it');

export default function Page() {
  return <LocaleHomePage locale="it" />;
}
