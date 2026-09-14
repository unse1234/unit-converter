import type { Metadata } from 'next';
import Link from 'next/link';
import { getConversionPairs, getPopularPairs } from '@/domain/conversion/pairs';
import {
  getCategories,
  getCategory,
  getUnitsByCategory,
  requireUnit,
} from '@/domain/units/registry';
import { pairLabel } from '@/lib/seo/labels';
import { buildMetadata } from '@/lib/seo/metadata';
import { websiteSchema } from '@/lib/seo/structured-data';
import { siteConfig } from '@/lib/site';
import { AdSlot } from '@/components/ads/AdSlot';
import { Converter } from '@/components/converter/Converter';
import { JsonLd } from '@/components/seo/JsonLd';
import { CategoryIcon } from '@/components/ui/icons';
import { LinkCard, Section } from '@/components/ui/primitives';

export const metadata: Metadata = buildMetadata({
  title: `${siteConfig.name} — Fast, accurate unit conversion`,
  absoluteTitle: true,
  description: siteConfig.description,
  path: '/',
});

/**
 * Homepage.
 *
 * The converter is the page: it sits above the fold with no marketing preamble
 * in front of it, because someone arriving here wants to convert something.
 * Everything underneath is discovery — the conversions people look for most,
 * then the full category list.
 *
 * Length is the opening category because it carries the most search demand;
 * the unit picker changes it in one interaction.
 */
export default function HomePage() {
  const categories = getCategories();
  const length = getCategory('length');
  const lengthUnits = getUnitsByCategory('length');

  // A cross-section of the highest-intent conversions, not just one category.
  const featuredPairs = ['length', 'mass', 'temperature', 'volume', 'speed', 'digital-storage']
    .flatMap((categoryId) => getPopularPairs(categoryId, 2))
    .slice(0, 12);

  return (
    <>
      <JsonLd data={websiteSchema()} />

      <section className="page-shell pt-8 pb-10 sm:pt-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:items-center lg:gap-12">
          <div>
            <h1 className="max-w-[14ch]">Convert any unit, instantly.</h1>
            <p className="text-fg-secondary mt-4 max-w-[52ch] text-lg leading-relaxed">
              Exact conversion factors for length, weight, temperature, volume and{' '}
              {categories.length - 4} other categories. Type a value and the answer appears — no
              button, no sign-up, no waiting.
            </p>
            <ul className="text-fg-subtle mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <li>Exact, sourced constants</li>
              <li>Formulas and reference tables</li>
              <li>No sign-up, nothing to install</li>
            </ul>
          </div>

          {length && lengthUnits.length > 0 ? (
            <Converter
              units={lengthUnits}
              categoryId={length.id}
              categorySlug={length.slug}
              initialFrom={length.defaultPair[0]}
              initialTo={length.defaultPair[1]}
              pairSlugs={getConversionPairs(length.id).map((pair) => pair.slug)}
            />
          ) : null}
        </div>
      </section>

      <div className="page-shell">
        <AdSlot placement="below-converter" />
      </div>

      <div className="page-shell space-y-12 pb-8">
        <Section
          title="Popular conversions"
          description="The conversions people look up most often."
        >
          <ul className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
            {featuredPairs.map((pair) => (
              <li key={pair.id}>
                <Link
                  href={pair.path}
                  className="text-fg-secondary hover:text-accent hover:bg-hover block rounded-md px-3 py-2.5 text-sm transition-colors"
                >
                  {pairLabel(requireUnit(pair.fromUnitId), requireUnit(pair.toUnitId))}
                </Link>
              </li>
            ))}
          </ul>
        </Section>

        <Section
          title="All categories"
          description={`${categories.length} categories, each with its full unit list, formulas and reference tables.`}
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <LinkCard
                key={category.id}
                href={`/${category.slug}`}
                title={category.name}
                description={category.summary}
                icon={<CategoryIcon name={category.icon} size={20} />}
              />
            ))}
          </div>
        </Section>
      </div>
    </>
  );
}
