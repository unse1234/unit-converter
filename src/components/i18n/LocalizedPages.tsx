import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  LOCALE_DEFINITIONS,
  localeHomePath,
  siteLanguages,
  type Locale,
  type SiteLanguage,
} from '@/i18n/config';
import {
  buildPairContent,
  heightRows,
  isScreenSize,
  localizeUnit,
  nearbyValues,
  pageLabel,
  relatedPairs,
  screenContext,
  screenRows,
  valueContext,
  valueLinks,
  valueTableRows,
  type TableRow,
} from '@/i18n/content';
import { formatLocal } from '@/i18n/format';
import { pageTitleAndDescription } from '@/i18n/metadata';
import {
  LOCALE_CONTENT,
  categoryPath,
  findPairPage,
  getCategoryPages,
  getLocaleCategories,
  getLocalizedPages,
  getPageAlternates,
  type LocalizedPage,
} from '@/i18n/pages';
import type { FaqEntry, LocalCategory, PairSpec } from '@/i18n/types';
import { getUnit } from '@/domain/units/registry';
import { faqSchema, webPageSchema } from '@/lib/seo/structured-data';
import { AdSlot } from '@/components/ads/AdSlot';
import { FaqList } from '@/components/content/FaqList';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { JsonLd } from '@/components/seo/JsonLd';
import { Card, FormulaBlock, LinkCard, Prose, Section } from '@/components/ui/primitives';
import { CategoryIcon, ChevronRightIcon } from '@/components/ui/icons';
import { HeightConverter } from './HeightConverter';
import { LocalizedConverter, type ConverterUnitOption } from './LocalizedConverter';

/**
 * Page templates for the localized sections.
 *
 * One template per page kind — home, category, pair, single value, TV size,
 * height — rendered from the registry in i18n/pages.ts. As on the English site,
 * nothing is written per conversion: a new page is a new spec.
 */

type PageOf<K extends LocalizedPage['kind']> = Extract<LocalizedPage, { kind: K }>;

const CATEGORY_ICONS: Record<LocalCategory, string> = {
  length: 'ruler',
  mass: 'scale',
  temperature: 'thermometer',
  volume: 'beaker',
  area: 'square',
  speed: 'gauge',
  cooking: 'beaker',
  tv: 'square',
};

/* -------------------------------------------------------------------------- */
/* Shared pieces                                                               */
/* -------------------------------------------------------------------------- */

function converterOptions(locale: Locale, ids: string[]): ConverterUnitOption[] {
  return [...new Set(ids)].map((id) => {
    const { unit, name, symbol } = localizeUnit(locale, id);
    return { unit, one: name.one, other: name.other, symbol };
  });
}

function Converter({
  locale,
  spec,
  initialValue,
}: {
  locale: Locale;
  spec: PairSpec;
  initialValue?: number;
}) {
  return (
    <LocalizedConverter
      options={converterOptions(locale, [spec.from, spec.to, ...(spec.extraUnits ?? [])])}
      initialFrom={spec.from}
      initialTo={spec.to}
      initialValue={initialValue === undefined ? undefined : formatLocal(initialValue, locale, 10)}
      numberLocale={LOCALE_DEFINITIONS[locale].numberLocale}
      labels={LOCALE_CONTENT[locale].text.converter}
    />
  );
}

function breadcrumbTrail(page: LocalizedPage) {
  const content = LOCALE_CONTENT[page.locale];
  const home = { name: content.text.home, path: localeHomePath(page.locale) };
  if (page.kind === 'home') return [home];
  const category = {
    name: content.categories[page.category]?.name ?? page.category,
    path: categoryPath(page.locale, page.category),
  };
  if (page.kind === 'category') return [home, { name: category.name }];
  return [home, category, { name: pageLabel(page) }];
}

function PageJsonLd({ page }: { page: LocalizedPage }) {
  const { title, description } = pageTitleAndDescription(page);
  return (
    <JsonLd
      data={webPageSchema({
        name: title,
        description,
        path: page.path,
        language: LOCALE_DEFINITIONS[page.locale].hreflang,
      })}
    />
  );
}

/** Links to the same page in the site's other languages. */
function OtherLanguages({ page }: { page: LocalizedPage }) {
  const alternates = getPageAlternates(page);
  const names = new Map(siteLanguages().map((language) => [language.code, language.name]));
  const links = (Object.entries(alternates) as [SiteLanguage, string][]).filter(
    ([language]) => language !== page.locale,
  );
  if (links.length === 0) return null;

  return (
    <Section title={LOCALE_CONTENT[page.locale].text.otherLanguages}>
      <ul className="flex flex-wrap gap-2">
        {links.map(([language, path]) => (
          <li key={language}>
            <a
              href={path}
              hrefLang={language}
              lang={language}
              className="bg-surface shadow-border text-fg-secondary hover:text-accent inline-flex min-h-10 items-center rounded-md px-3 text-sm"
            >
              {names.get(language)}
            </a>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function LinkList({ items }: { items: { href: string; label: string; detail?: string }[] }) {
  return (
    <ul className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            className="text-fg-secondary hover:text-accent hover:bg-hover block rounded-md px-3 py-2.5 text-sm transition-colors"
          >
            {item.label}
            {item.detail ? (
              <span className="text-fg-subtle numeric block text-xs">{item.detail}</span>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** A reference table. Scrolls inside its own box so the page never scrolls sideways. */
function DataTable({
  caption,
  headers,
  rows,
}: {
  caption: string;
  headers: string[];
  rows: { key: string; cells: ReactNode[] }[];
}) {
  return (
    <div className="bg-surface shadow-border overflow-x-auto rounded-xl">
      <table className="w-full border-collapse text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="shadow-[0_1px_0_0_var(--ds-border)]">
            {headers.map((header) => (
              <th
                key={header}
                scope="col"
                className="text-fg-subtle px-4 py-3 text-left font-medium"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className="shadow-[0_1px_0_0_var(--ds-border)] last:shadow-none">
              {row.cells.map((cell, index) =>
                index === 0 ? (
                  <th
                    key={index}
                    scope="row"
                    className="text-fg-secondary numeric px-4 py-2.5 text-left font-normal"
                  >
                    {cell}
                  </th>
                ) : (
                  <td key={index} className="text-fg numeric px-4 py-2.5 font-medium">
                    {cell}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function linked(text: string, href?: string): ReactNode {
  return href ? (
    <Link href={href} className="text-accent underline-offset-2 hover:underline">
      {text}
    </Link>
  ) : (
    text
  );
}

function ConversionTable({
  locale,
  spec,
  rows,
  caption,
}: {
  locale: Locale;
  spec: PairSpec;
  rows: TableRow[];
  caption: string;
}) {
  const from = localizeUnit(locale, spec.from);
  const to = localizeUnit(locale, spec.to);
  const header = (unit: typeof from) =>
    `${unit.name.other.charAt(0).toUpperCase()}${unit.name.other.slice(1)} (${unit.symbol})`;
  return (
    <DataTable
      caption={caption}
      headers={[header(from), header(to)]}
      rows={rows.map((row) => ({
        key: row.from,
        cells: [linked(row.from, row.href), row.to],
      }))}
    />
  );
}

function ScreenTable({ locale }: { locale: Locale }) {
  const { text } = LOCALE_CONTENT[locale];
  return (
    <div className="space-y-3">
      <DataTable
        caption={text.screenTableHeading}
        headers={[text.screenSize, text.screenDiagonal, text.screenWidth, text.screenHeight]}
        rows={screenRows(locale).map((row) => ({
          key: row.size,
          cells: [
            linked(`${row.size}"`, row.href),
            `${row.diagonal} cm`,
            `${row.width} cm`,
            `${row.height} cm`,
          ],
        }))}
      />
      <p className="text-fg-subtle text-sm">{text.screenNote}</p>
    </div>
  );
}

function Faqs({ title, items }: { title: string; items: FaqEntry[] }) {
  if (items.length === 0) return null;
  return (
    <Section id="faq" title={title}>
      <FaqList items={items} />
      <JsonLd data={faqSchema(items)} />
    </Section>
  );
}

function PageShell({
  page,
  children,
  heading,
  lead,
}: {
  page: LocalizedPage;
  heading: string;
  lead: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="page-shell py-6 sm:py-8">
      <PageJsonLd page={page} />
      <Breadcrumbs entries={breadcrumbTrail(page)} />
      <div className="mt-5 grid gap-10 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
          <header className="mb-5">
            <h1>{heading}</h1>
            <div className="text-fg-secondary mt-3 max-w-[62ch] text-lg leading-relaxed">
              {lead}
            </div>
          </header>
          {children}
        </div>
        <div className="hidden xl:block">
          <div className="sticky top-24">
            <AdSlot placement="sidebar" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Pair page                                                                   */
/* -------------------------------------------------------------------------- */

function PairPage({ page }: { page: PageOf<'pair'> }) {
  const { locale, spec } = page;
  const { text, categories } = LOCALE_CONTENT[locale];
  const content = buildPairContent(locale, spec);
  const values = valueLinks(locale, spec);
  const related = relatedPairs(locale, spec);
  const categoryName = categories[spec.category]?.name ?? '';

  return (
    <PageShell
      page={page}
      heading={spec.h1 ?? text.pairH1(content.ctx)}
      lead={<p>{text.pairLead(content.ctx)}</p>}
    >
      <Converter locale={locale} spec={spec} />
      <AdSlot placement="below-converter" className="mt-6" />

      <div className="mt-10 space-y-10">
        <Section id="how-to" title={text.howToHeading(content.ctx)}>
          <Prose>
            <p>{content.explanation}</p>
          </Prose>
          <FormulaBlock label={text.formulaLabel}>{content.formula.expression}</FormulaBlock>
          <FormulaBlock label={text.exampleLabel}>
            {`${content.example.value} ${content.from.symbol} → ${content.example.working} ${content.to.symbol}`}
          </FormulaBlock>
          {(spec.notes ?? []).map((note) => (
            <Card key={note} className="p-4">
              <p className="text-fg-secondary text-sm leading-relaxed">{note}</p>
            </Card>
          ))}
        </Section>

        {values.length > 0 ? (
          <Section
            id="values"
            title={text.valuesHeading(content.ctx)}
            description={text.valuesDescription(content.ctx)}
          >
            <LinkList
              items={values.map((value) => ({
                href: value.href,
                label: value.label,
                detail: value.answer,
              }))}
            />
          </Section>
        ) : null}

        <Section
          id="table"
          title={text.tableHeading(content.ctx)}
          description={text.tableDescription(content.ctx)}
        >
          <ConversionTable
            locale={locale}
            spec={spec}
            rows={content.table}
            caption={text.tableHeading(content.ctx)}
          />
        </Section>

        {spec.from === 'inch' && spec.to === 'centimeter' ? (
          <Section id="screens" title={text.screenTableHeading}>
            <ScreenTable locale={locale} />
          </Section>
        ) : null}

        <AdSlot placement="in-content" />

        <Faqs title={text.faqHeading} items={content.faqs} />

        {related.length > 0 ? (
          <Section id="related" title={text.relatedHeading}>
            <LinkList items={related} />
            <p className="text-sm">
              <Link
                href={categoryPath(locale, spec.category)}
                className="text-accent underline-offset-2 hover:underline"
              >
                {text.allInCategory(categoryName)}
              </Link>
            </p>
          </Section>
        ) : null}

        <OtherLanguages page={page} />
      </div>
    </PageShell>
  );
}

/* -------------------------------------------------------------------------- */
/* Single-value page                                                           */
/* -------------------------------------------------------------------------- */

function ValuePage({ page }: { page: PageOf<'value'> }) {
  const { locale, spec, value } = page;
  const { text } = LOCALE_CONTENT[locale];
  const ctx = { ...valueContext(locale, spec, value), phrase: page.phrase };
  const pair = findPairPage(locale, spec.from, spec.to);
  const nearby = valueTableRows(locale, spec, nearbyValues(spec, value));
  const screen = isScreenSize(spec, value) ? screenContext(locale, value) : null;
  const siblings = valueLinks(locale, spec).filter((link) => link.href !== page.path);

  return (
    <PageShell
      page={page}
      heading={text.valueH1(ctx)}
      lead={
        <p>
          <strong className="text-fg">{text.valueAnswer(ctx)}</strong>
        </p>
      }
    >
      <FormulaBlock label={text.workingLabel}>{`${ctx.working} ${ctx.toSymbol}`}</FormulaBlock>

      <div className="mt-6">
        <Converter locale={locale} spec={spec} initialValue={value} />
      </div>
      <AdSlot placement="below-converter" className="mt-6" />

      <div className="mt-10 space-y-10">
        {screen ? (
          <Section id="screen" title={text.screenHeading(screen)}>
            <Prose>
              <p>{text.screenIntro(screen)}</p>
            </Prose>
            <ScreenTable locale={locale} />
          </Section>
        ) : null}

        <Section id="nearby" title={text.nearbyHeading(ctx)}>
          <ConversionTable
            locale={locale}
            spec={spec}
            rows={nearby}
            caption={text.nearbyHeading(ctx)}
          />
        </Section>

        <Faqs
          title={text.faqHeading}
          items={[...text.valueFaqs(ctx), ...(screen ? text.tvFaqs(screen) : [])]}
        />

        {siblings.length > 0 ? (
          <Section id="values" title={text.valuesHeading(ctx)}>
            <LinkList
              items={siblings.map((link) => ({
                href: link.href,
                label: link.label,
                detail: link.answer,
              }))}
            />
          </Section>
        ) : null}

        {pair ? (
          <p>
            <Link
              href={pair.path}
              className="text-accent inline-flex items-center gap-1 text-sm underline-offset-2 hover:underline"
            >
              {text.backToPair(ctx)}
              <ChevronRightIcon size={14} />
            </Link>
          </p>
        ) : null}

        <OtherLanguages page={page} />
      </div>
    </PageShell>
  );
}

/* -------------------------------------------------------------------------- */
/* TV-size page                                                                */
/* -------------------------------------------------------------------------- */

const INCH_TO_CM: PairSpec = {
  category: 'length',
  slug: '',
  from: 'inch',
  to: 'centimeter',
  phrase: '',
  extraUnits: ['millimeter', 'meter'],
};

function TvPage({ page }: { page: PageOf<'tv'> }) {
  const { locale, size } = page;
  const { text } = LOCALE_CONTENT[locale];
  const ctx = { ...screenContext(locale, size), phrase: page.phrase };
  const pair = findPairPage(locale, 'inch', 'centimeter');
  const others = getCategoryPages(locale, 'tv').filter((other) => other.path !== page.path);

  return (
    <PageShell page={page} heading={text.tvH1(ctx)} lead={<p>{text.screenIntro(ctx)}</p>}>
      <DataTable
        caption={text.screenHeading(ctx)}
        headers={[text.screenDiagonal, text.screenWidth, text.screenHeight]}
        rows={[
          { key: 'size', cells: [`${ctx.diagonal} cm`, `${ctx.width} cm`, `${ctx.height} cm`] },
        ]}
      />

      <div className="mt-6">
        <Converter locale={locale} spec={INCH_TO_CM} initialValue={size} />
      </div>
      <AdSlot placement="below-converter" className="mt-6" />

      <div className="mt-10 space-y-10">
        <Section id="screens" title={text.screenTableHeading}>
          <ScreenTable locale={locale} />
        </Section>

        <Faqs title={text.faqHeading} items={text.tvFaqs(ctx)} />

        {others.length > 0 ? (
          <Section id="related" title={text.relatedHeading}>
            <LinkList
              items={others.map((other) => ({ href: other.path, label: pageLabel(other) }))}
            />
          </Section>
        ) : null}

        {pair ? (
          <p>
            <Link
              href={pair.path}
              className="text-accent inline-flex items-center gap-1 text-sm underline-offset-2 hover:underline"
            >
              {pageLabel(pair)}
              <ChevronRightIcon size={14} />
            </Link>
          </p>
        ) : null}

        <OtherLanguages page={page} />
      </div>
    </PageShell>
  );
}

/* -------------------------------------------------------------------------- */
/* Height page                                                                 */
/* -------------------------------------------------------------------------- */

function HeightPage({ page }: { page: PageOf<'height'> }) {
  const { locale, spec } = page;
  const { text } = LOCALE_CONTENT[locale];
  const related = getCategoryPages(locale, 'length')
    .filter((other) => other.kind === 'pair')
    .slice(0, 6);

  return (
    <PageShell page={page} heading={spec.h1} lead={<p>{spec.description}</p>}>
      <HeightConverter
        numberLocale={LOCALE_DEFINITIONS[locale].numberLocale}
        labels={text.converter}
      />
      <AdSlot placement="below-converter" className="mt-6" />

      <div className="mt-10 space-y-10">
        <Section id="table" title={text.heightTableHeading}>
          <DataTable
            caption={text.heightTableHeading}
            headers={[text.heightColumn, 'cm', 'm']}
            rows={heightRows(locale).map((row) => ({
              key: row.label,
              cells: [row.label, row.cm, row.meters],
            }))}
          />
        </Section>

        <Faqs title={text.faqHeading} items={spec.faqs} />

        <Section id="related" title={text.relatedHeading}>
          <LinkList
            items={related.map((other) => ({ href: other.path, label: pageLabel(other) }))}
          />
        </Section>

        <OtherLanguages page={page} />
      </div>
    </PageShell>
  );
}

export function LocaleConversionPage({ page }: { page: LocalizedPage }) {
  switch (page.kind) {
    case 'pair':
      return <PairPage page={page} />;
    case 'value':
      return <ValuePage page={page} />;
    case 'tv':
      return <TvPage page={page} />;
    case 'height':
      return <HeightPage page={page} />;
    default:
      return null;
  }
}

/* -------------------------------------------------------------------------- */
/* Category page                                                               */
/* -------------------------------------------------------------------------- */

export function LocaleCategoryPage({ page }: { page: PageOf<'category'> }) {
  const { locale, category } = page;
  const content = LOCALE_CONTENT[locale];
  const { text } = content;
  const categoryText = content.categories[category];
  const pages = getCategoryPages(locale, category);
  const pairs = pages.filter((item): item is PageOf<'pair'> => item.kind === 'pair');
  const first = pairs[0];

  return (
    <PageShell
      page={page}
      heading={categoryText?.title ?? ''}
      lead={<p>{categoryText?.description}</p>}
    >
      {first ? (
        <Converter
          locale={locale}
          spec={{
            ...first.spec,
            extraUnits: pairs.flatMap((pair) => [
              pair.spec.from,
              pair.spec.to,
              ...(pair.spec.extraUnits ?? []),
            ]),
          }}
        />
      ) : null}
      {category === 'tv' ? <ScreenTable locale={locale} /> : null}
      <AdSlot placement="below-converter" className="mt-6" />

      <div className="mt-10 space-y-10">
        <Section title={text.categoryPairsHeading(categoryText?.name ?? '')}>
          <LinkList
            items={pages
              .filter((item) => item.kind !== 'value')
              .map((item) => ({ href: item.path, label: pageLabel(item) }))}
          />
        </Section>

        {pairs
          .filter((pair) => pair.spec.values)
          .map((pair) => {
            const links = valueLinks(locale, pair.spec);
            if (links.length === 0) return null;
            return (
              <Section key={pair.path} title={pageLabel(pair)} headingLevel={2}>
                <LinkList
                  items={links.map((link) => ({
                    href: link.href,
                    label: link.label,
                    detail: link.answer,
                  }))}
                />
              </Section>
            );
          })}

        <OtherLanguages page={page} />
      </div>
    </PageShell>
  );
}

/* -------------------------------------------------------------------------- */
/* Home page                                                                   */
/* -------------------------------------------------------------------------- */

export function LocaleHomePage({ locale }: { locale: Locale }) {
  const content = LOCALE_CONTENT[locale];
  const { text } = content;
  const pages = getLocalizedPages(locale);
  const home = pages.find((item): item is PageOf<'home'> => item.kind === 'home');
  const pairs = pages.filter((item): item is PageOf<'pair'> => item.kind === 'pair');
  const popular = pairs.filter((pair) => pair.spec.popular);
  const first = popular[0] ?? pairs[0];

  // Local and kitchen units, and the height calculator.
  const special = pages.filter(
    (item) => item.kind === 'height' || (item.kind === 'pair' && isLocalUnitPage(item)),
  );
  const tvPages = pages.filter((item) => item.kind === 'tv');

  return (
    <>
      {home ? <PageJsonLd page={home} /> : null}
      <section className="page-shell pt-8 pb-10 sm:pt-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:items-center lg:gap-12">
          <div>
            <h1 className="max-w-[18ch]">{text.homeH1}</h1>
            <p className="text-fg-secondary mt-4 max-w-[52ch] text-lg leading-relaxed">
              {text.homeIntro}
            </p>
            <ul className="text-fg-subtle mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {text.homeBullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </div>
          {first ? <Converter locale={locale} spec={first.spec} /> : null}
        </div>
      </section>

      <div className="page-shell">
        <AdSlot placement="below-converter" />
      </div>

      <div className="page-shell space-y-12 pb-8">
        <Section title={text.popularHeading} description={text.popularDescription}>
          <LinkList
            items={[...popular, ...pairs.filter((pair) => !pair.spec.popular)]
              .slice(0, 12)
              .map((pair) => ({ href: pair.path, label: pageLabel(pair) }))}
          />
        </Section>

        <Section title={text.categoriesHeading}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {getLocaleCategories(locale).map((category) => (
              <LinkCard
                key={category}
                href={categoryPath(locale, category)}
                title={content.categories[category]?.name ?? category}
                description={content.categories[category]?.description}
                icon={<CategoryIcon name={CATEGORY_ICONS[category]} size={20} />}
              />
            ))}
          </div>
        </Section>

        {special.length > 0 ? (
          <Section title={text.localUnitsHeading} description={text.localUnitsDescription}>
            <LinkList
              items={special.map((item) => ({ href: item.path, label: pageLabel(item) }))}
            />
          </Section>
        ) : null}

        {tvPages.length > 0 ? (
          <Section title={text.screenTableHeading}>
            <LinkList
              items={tvPages.map((item) => ({ href: item.path, label: pageLabel(item) }))}
            />
          </Section>
        ) : null}

        <Section title={text.languagesHeading} description={text.languagesDescription}>
          <LanguageCards current={locale} />
        </Section>
      </div>
    </>
  );
}

/** Kitchen pages, and pages about a traditional unit that is not in the English catalog. */
function isLocalUnitPage(page: PageOf<'pair'>): boolean {
  return page.category === 'cooking' || !getUnit(page.spec.from) || !getUnit(page.spec.to);
}

/** One card per site language, used on every home page. */
export function LanguageCards({ current }: { current: SiteLanguage }) {
  const languages = siteLanguages().filter((language) => language.code !== current);
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {languages.map((language) => {
        const sample =
          language.code === 'en'
            ? 'Inches to centimeters, pounds to kilograms…'
            : getLocalizedPages(language.code)
                .filter(
                  (item): item is PageOf<'pair'> => item.kind === 'pair' && !!item.spec.popular,
                )
                .slice(0, 2)
                .map((item) => item.spec.phrase)
                .join(', ') + '…';
        return (
          <li key={language.code}>
            <a
              href={language.href}
              hrefLang={language.code}
              className="bg-surface shadow-border hover:shadow-medium block rounded-xl p-4 transition-shadow duration-150"
            >
              <span lang={language.code} className="text-fg block font-medium">
                {language.name}
              </span>
              <span lang={language.code} className="text-fg-subtle mt-0.5 block text-sm">
                {sample}
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
