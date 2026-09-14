import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getAllConversionPairs,
  getConversionPair,
  getConversionPairs,
  getRelatedPairs,
} from '@/domain/conversion/pairs';
import {
  getCategoryBySlug,
  getUnit,
  getUnitsByCategory,
  requireUnit,
} from '@/domain/units/registry';
import { buildConversionContent } from '@/lib/seo/conversion-content';
import { pairLabel, pairPhrase } from '@/lib/seo/labels';
import { buildConversionMetadata, conversionPageTitle } from '@/lib/seo/metadata';
import { faqSchema } from '@/lib/seo/structured-data';
import { AdSlot } from '@/components/ads/AdSlot';
import { ConversionTable } from '@/components/content/ConversionTable';
import { FaqList } from '@/components/content/FaqList';
import { OnThisPage } from '@/components/content/OnThisPage';
import { Converter } from '@/components/converter/Converter';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { JsonLd } from '@/components/seo/JsonLd';
import { Card, FormulaBlock, Prose, Section } from '@/components/ui/primitives';

/**
 * Conversion page.
 *
 * One template serves every indexable conversion on the site. Adding a pair is
 * a data change: no component is written per conversion, which is the rule in
 * CLAUDE.md and the only way this stays maintainable at several hundred pages.
 *
 * Statically generated at build time, so each page is plain HTML on a CDN with
 * one interactive island — the converter — hydrating on top.
 */

interface PageProps {
  params: Promise<{ category: string; conversion: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllConversionPairs().map((pair) => {
    const [, category = '', conversion = ''] = pair.path.split('/');
    return { category, conversion };
  });
}

/** Resolves the route to a pair, or null when the URL is not a real page. */
async function resolve(params: PageProps['params']) {
  const { category: categorySlug, conversion } = await params;
  const category = getCategoryBySlug(categorySlug);
  if (!category) return null;

  const pair = getConversionPair(category.id, conversion);
  if (!pair) return null;

  const from = getUnit(pair.fromUnitId);
  const to = getUnit(pair.toUnitId);
  if (!from || !to) return null;

  return { category, pair, from, to };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolved = await resolve(params);
  if (!resolved) return {};
  return buildConversionMetadata(resolved.pair, resolved.from, resolved.to);
}

export default async function ConversionPage({ params }: PageProps) {
  const resolved = await resolve(params);
  if (!resolved) notFound();

  const { category, pair, from, to } = resolved;
  const content = buildConversionContent(from, to);
  const related = getRelatedPairs(pair, 8);
  const phrase = pairPhrase(from, to);

  const sections = [
    { id: 'how-to-convert', label: 'How to convert' },
    { id: 'table', label: 'Conversion table' },
    ...(content.faqs.length > 0 ? [{ id: 'questions', label: 'Questions' }] : []),
    { id: 'units', label: 'About the units' },
    ...(related.length > 0 ? [{ id: 'related', label: 'Related conversions' }] : []),
  ];

  return (
    <div className="page-shell py-6 sm:py-8">
      <Breadcrumbs
        entries={[
          { name: 'Home', path: '/' },
          { name: category.name, path: `/${category.slug}` },
          { name: pairLabel(from, to) },
        ]}
      />

      <div className="mt-5 grid gap-10 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
          <header className="mb-5">
            <h1>{conversionPageTitle(from, to)}</h1>
            <p className="text-fg-secondary mt-3 max-w-[60ch] text-lg leading-relaxed">
              {content.statement}
            </p>
          </header>

          <Converter
            units={getUnitsByCategory(category.id)}
            categoryId={category.id}
            categorySlug={category.slug}
            initialFrom={from.id}
            initialTo={to.id}
            pairSlugs={getConversionPairs(category.id).map((item) => item.slug)}
            pagePair={{ from: from.id, to: to.id }}
          />

          <AdSlot placement="below-converter" className="mt-6" />

          <div className="mt-10 space-y-10">
            <Section id="how-to-convert" title={`How to convert ${phrase}`}>
              <Prose>
                <p>{content.intro}</p>
              </Prose>

              {content.formula ? (
                <div className="space-y-3">
                  <FormulaBlock label="Formula">{content.formula.expression}</FormulaBlock>
                  <Prose>
                    <p>{content.formula.explanation}</p>
                  </Prose>
                  {content.formula.worked ? (
                    <FormulaBlock label="Example">{content.formula.worked}</FormulaBlock>
                  ) : null}
                </div>
              ) : null}

              {content.notes.length > 0 ? (
                <div className="space-y-3">
                  {content.notes.map((note) => (
                    <Card key={note} className="p-4">
                      <p className="text-fg-secondary text-sm leading-relaxed">{note}</p>
                    </Card>
                  ))}
                </div>
              ) : null}
            </Section>

            <Section
              id="table"
              title={`${pairLabel(from, to)} conversion table`}
              description={`Common values in ${from.pluralName}, converted to ${to.pluralName}.`}
            >
              <ConversionTable rows={content.table} from={from} to={to} />
            </Section>

            {content.faqs.length > 0 ? (
              <Section id="questions" title="Frequently asked questions">
                <FaqList items={content.faqs} />
                <JsonLd data={faqSchema(content.faqs)} />
              </Section>
            ) : null}

            <Section id="units" title="About these units">
              <div className="grid gap-4 sm:grid-cols-2">
                {[from, to].map((unit) => (
                  <Card key={unit.id} className="p-4">
                    <h3 className="text-base">
                      {unit.name}
                      {unit.symbol ? (
                        <span className="text-fg-subtle ml-2 font-normal">{unit.symbol}</span>
                      ) : null}
                    </h3>
                    {unit.description ? (
                      <p className="text-fg-secondary mt-2 text-sm leading-relaxed">
                        {unit.description}
                      </p>
                    ) : null}
                    {unit.source ? (
                      <p className="text-fg-subtle mt-2 text-xs">Defined by {unit.source}.</p>
                    ) : null}
                  </Card>
                ))}
              </div>
            </Section>

            {related.length > 0 ? (
              <Section
                id="related"
                title="Related conversions"
                description={`Other ${category.name.toLowerCase()} conversions people look up.`}
              >
                <ul className="grid gap-1 sm:grid-cols-2">
                  {related.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={item.path}
                        className="text-fg-secondary hover:text-accent hover:bg-hover block rounded-md px-3 py-2 text-sm transition-colors"
                      >
                        {pairLabel(requireUnit(item.fromUnitId), requireUnit(item.toUnitId))}
                      </Link>
                    </li>
                  ))}
                </ul>
                <p className="text-fg-subtle text-sm">
                  Or see every{' '}
                  <Link
                    href={`/${category.slug}`}
                    className="text-accent underline underline-offset-2"
                  >
                    {category.name.toLowerCase()} unit and conversion
                  </Link>
                  .
                </p>
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
