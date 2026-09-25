import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  categoryMetadata,
  categoryParams,
  findCategoryPage,
  type CategoryRouteProps,
} from '@/i18n/routes';
import { LocaleCategoryPage } from '@/components/i18n/LocalizedPages';

export const dynamicParams = false;

export function generateStaticParams() {
  return categoryParams('pt');
}

export function generateMetadata(props: CategoryRouteProps): Promise<Metadata> {
  return categoryMetadata('pt', props);
}

export default async function Page({ params }: CategoryRouteProps) {
  const page = findCategoryPage('pt', (await params).category);
  if (!page) notFound();
  return <LocaleCategoryPage page={page} />;
}
