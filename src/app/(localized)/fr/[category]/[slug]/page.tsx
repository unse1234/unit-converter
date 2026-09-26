import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  conversionMetadata,
  conversionParams,
  findConversionPage,
  type ConversionRouteProps,
} from '@/i18n/routes';
import { LocaleConversionPage } from '@/components/i18n/LocalizedPages';

export const dynamicParams = false;

export function generateStaticParams() {
  return conversionParams('fr');
}

export function generateMetadata(props: ConversionRouteProps): Promise<Metadata> {
  return conversionMetadata('fr', props);
}

export default async function Page({ params }: ConversionRouteProps) {
  const { category, slug } = await params;
  const page = findConversionPage('fr', category, slug);
  if (!page) notFound();
  return <LocaleConversionPage page={page} />;
}
