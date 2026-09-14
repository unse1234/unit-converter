import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getConversionPairs, getPopularPairs } from '@/domain/conversion/pairs';
import {
  getCategories,
  getCategory,
  getCategoryBySlug,
  getCollectionBySlug,
  getCollections,
  getUnitsByCategory,
  getUnitsForCollection,
  requireUnit,
} from '@/domain/units/registry';
import { pairLabel } from '@/lib/seo/labels';
import { buildCategoryMetadata, buildCollectionMetadata } from '@/lib/seo/metadata';
import type { ConversionPair } from '@/types/conversion';
import type { UnitDefinition } from '@/types/units';
import { AdSlot } from '@/components/ads/AdSlot';
import { OnThisPage } from '@/components/content/OnThisPage';
import { PairDirectory } from '@/components/content/PairDirectory';
import { UnitReference } from '@/components/content/UnitReference';
import { Converter } from '@/components/converter/Converter';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { CategoryIcon } from '@/components/ui/icons';
import { LinkCard, Prose, Section } from '@/components/ui/primitives';

/**
 * Category page, also used for curated collections (Cooking, Typography).
 *
 * A collection borrows its parent category's units and conversion pages, so
 * one physical conversion never gets two canonical URLs (SEO_SPEC §17).
 *
 * More than a list of links: the page carries the converter, an explanation of
 * the category, the popular conversions, a reference table of every unit with
 * its exact definition, and a grouped directory of every conversion page.
 */

interface PageProps {
  params: Promise<{ category: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return [
    ...getCategories().map((category) => ({ category: category.slug })),
    ...getCollections().map((collection) => ({ category: collection.slug })),
  ];
}

interface Resolved {
  name: string;
  title: string;
  description: string;
  summary: string;
  icon: string;
  categoryId: string;
  /** The category that owns the conversion URLs; a collection's parent. */
  categorySlug: string;
  units: UnitDefinition[];
  defaultPair: readonly [string, string];
  isCollection: boolean;
}

async function resolve(params: PageProps['params']): Promise<Resolved | null> {
  const { category: slug } = await params;

  const category = getCategoryBySlug(slug);
  if (category) {
    return {
      name: category.name,
      title: category.title,
      description: category.description,
      summary: category.summary,
      icon: category.icon,
      categoryId: category.id,
      categorySlug: category.slug,
      units: getUnitsByCategory(category.id),
      defaultPair: category.defaultPair,
      isCollection: false,
    };
  }

  const collection = getCollectionBySlug(slug);
  if (collection) {
    const parent = getCategory(collection.categoryId);
    return {
      name: collection.name,
      title: collection.title,
      description: collection.description,
      summary: collection.summary,
      icon: collection.icon,
      categoryId: collection.categoryId,
      categorySlug: parent?.slug ?? collection.slug,
      units: getUnitsForCollection(collection),
      defaultPair: collection.defaultPair,
      isCollection: true,
    };
  }

  return null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category: slug } = await params;

  const category = getCategoryBySlug(slug);
  if (category) return buildCategoryMetadata(category, getUnitsByCategory(category.id).length);

  const collection = getCollectionBySlug(slug);
  if (collection) return buildCollectionMetadata(collection, collection.unitIds.length);

  return {};
}

export default async function CategoryPage({ params }: PageProps) {
  const resolved = await resolve(params);
  if (!resolved) notFound();

  // A collection links only to conversions between the units it shows; the
  // pages themselves belong to the parent category.
  const unitIds = new Set(resolved.units.map((unit) => unit.id));
  const inView = (pair: ConversionPair) =>
    unitIds.has(pair.fromUnitId) && unitIds.has(pair.toUnitId);

  const categoryPairs = getConversionPairs(resolved.categoryId);
  const pagePairs = categoryPairs.filter(inView);
  const popular = getPopularPairs(resolved.categoryId, categoryPairs.length)
    .filter(inView)
    .slice(0, 8);

  const relatedCategories = resolved.isCollection
    ? getCategories().filter((category) => category.id === resolved.categoryId)
    : (getCategory(resolved.categoryId)?.related ?? [])
        .map((id) => getCategory(id))
        .filter((category): category is NonNullable<typeof category> => Boolean(category));

  const relatedTitle = resolved.isCollection ? 'Full category' : 'Related categories';

  const sections = [
    { id: 'about', label: 'About' },
    ...(popular.length > 0 ? [{ id: 'popular', label: 'Popular conversions' }] : []),
    { id: 'units', label: 'All units' },
    ...(pagePairs.length > 0 ? [{ id: 'conversions', label: 'All conversion pages' }] : []),
    ...(relatedCategories.length > 0 ? [{ id: 'related', label: relatedTitle }] : []),
  ];

  return (
    <div className="page-shell py-6 sm:py-8">
      <Breadcrumbs entries={[{ name: 'Home', path: '/' }, { name: resolved.name }]} />

      <div className="mt-5 grid gap-10 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
          <header className="mb-5">
            <div className="text-fg-subtle mb-3 flex items-center gap-2">
              <CategoryIcon name={resolved.icon} size={22} />
              <span className="text-sm">{resolved.units.length} units</span>
            </div>
            <h1>{resolved.title} Converter</h1>
            <p className="text-fg-secondary mt-3 max-w-[60ch] text-lg leading-relaxed">
              {resolved.summary}
            </p>
          </header>

          {/*
            ?from, ?to and ?value are applied by the converter on the client,
            which keeps this route statically generated. The canonical URL is
            always the clean path, so no parameters can create a second page.
          */}
          <Converter
            units={resolved.units}
            categoryId={resolved.categoryId}
            categorySlug={resolved.categorySlug}
            initialFrom={resolved.defaultPair[0]}
            initialTo={resolved.defaultPair[1]}
            pairSlugs={categoryPairs.map((pair) => pair.slug)}
          />

          <AdSlot placement="below-converter" className="mt-6" />

          <div className="mt-10 space-y-10">
            <Section id="about" title={`About ${resolved.name.toLowerCase()} units`}>
              <Prose>
                <p>{resolved.description}</p>
              </Prose>
            </Section>

            {popular.length > 0 ? (
              <Section
                id="popular"
                title="Popular conversions"
                description="The conversions people look up most in this category."
              >
                <ul className="grid gap-1 sm:grid-cols-2">
                  {popular.map((pair) => (
                    <li key={pair.id}>
                      <Link
                        href={pair.path}
                        className="text-fg-secondary hover:text-accent hover:bg-hover block rounded-md px-3 py-2 text-sm transition-colors"
                      >
                        {pairLabel(requireUnit(pair.fromUnitId), requireUnit(pair.toUnitId))}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Section>
            ) : null}

            <Section
              id="units"
              title="All units"
              description="Every unit in this category with its exact definition."
            >
              <UnitReference units={resolved.units} />
            </Section>

            {pagePairs.length > 0 ? (
              <Section
                id="conversions"
                title="All conversion pages"
                description="Each page has the formula, worked examples and a reference table."
              >
                <PairDirectory pairs={pagePairs} />
              </Section>
            ) : null}

            {relatedCategories.length > 0 ? (
              <Section id="related" title={relatedTitle}>
                <div className="grid gap-3 sm:grid-cols-2">
                  {relatedCategories.map((category) => (
                    <LinkCard
                      key={category.id}
                      href={`/${category.slug}`}
                      title={`${category.name} converter`}
                      description={category.summary}
                      icon={<CategoryIcon name={category.icon} size={18} />}
                    />
                  ))}
                </div>
              </Section>
            ) : null}
          </div>
        </div>

        {/* Desktop side column: in-page navigation, and the only place a sidebar ad may go. */}
        <div className="hidden xl:block">
          <div className="sticky top-24 space-y-8">
            <OnThisPage items={sections} />
            <AdSlot placement="sidebar" />
          </div>
        </div>
      </div>
    </div>
  );
}
