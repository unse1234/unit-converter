import type { Metadata, Viewport } from 'next';
import { localeRootMetadata } from '@/i18n/metadata';
import { rootViewport } from '@/components/layout/RootDocument';
import { LocaleRootLayout } from '@/components/i18n/LocaleRootLayout';

export const metadata: Metadata = localeRootMetadata('id');
export const viewport: Viewport = rootViewport;

export default function Layout({ children }: { children: React.ReactNode }) {
  return <LocaleRootLayout locale="id">{children}</LocaleRootLayout>;
}
