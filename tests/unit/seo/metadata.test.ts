import { describe, expect, it } from 'vitest';
import robots from '@/app/robots';
import sitemap from '@/app/sitemap';
import { getAllConversionPairs } from '@/domain/conversion/pairs';
import { getCategories, getCollections, requireUnit } from '@/domain/units/registry';
import {
  buildCategoryMetadata,
  buildConversionMetadata,
  buildMetadata,
  conversionPageDescription,
  conversionPageTitle,
} from '@/lib/seo/metadata';
import { breadcrumbSchema, faqSchema, websiteSchema } from '@/lib/seo/structured-data';
import { absoluteUrl, siteConfig } from '@/lib/site';

const pairs = getAllConversionPairs();

describe('conversion page metadata', () => {
  it('builds the title and canonical for meters to feet', () => {
    const pair = pairs.find((candidate) => candidate.path === '/length/meters-to-feet');
    expect(pair).toBeDefined();
    if (!pair) return;

    const metadata = buildConversionMetadata(pair, requireUnit('meter'), requireUnit('foot'));
    expect(metadata.title).toBe('Meters to Feet Converter');
    expect(metadata.alternates?.canonical).toBe(absoluteUrl('/length/meters-to-feet'));
    expect(metadata.openGraph?.url).toBe(absoluteUrl('/length/meters-to-feet'));
    expect(String(metadata.description)).toContain('1 meter = 3.28084 feet');
  });

  it('keeps acronyms and system names intact in titles', () => {
    expect(conversionPageTitle(requireUnit('us-gallon'), requireUnit('liter'))).toBe(
      'US Gallons to Liters Converter',
    );
    expect(conversionPageTitle(requireUnit('btu'), requireUnit('joule'))).toBe(
      'British Thermal Units to Joules Converter',
    );
  });

  it('names temperature scales the way people search for them', () => {
    expect(conversionPageTitle(requireUnit('celsius'), requireUnit('fahrenheit'))).toBe(
      'Celsius to Fahrenheit Converter',
    );
  });

  it('keeps small words lowercase in titles', () => {
    expect(
      conversionPageTitle(
        requireUnit('liters-per-100-kilometers'),
        requireUnit('miles-per-us-gallon'),
      ),
    ).toBe('Liters per 100 Kilometers to Miles per US Gallon Converter');
  });

  it('leads a temperature description with its formula, not a one-degree ratio', () => {
    expect(conversionPageDescription(requireUnit('celsius'), requireUnit('fahrenheit'))).toMatch(
      /^°F = °C × 9\/5 \+ 32\. Convert Celsius to Fahrenheit instantly/,
    );
  });

  it('gives every generated page a unique title', () => {
    const titles = pairs.map((pair) =>
      conversionPageTitle(requireUnit(pair.fromUnitId), requireUnit(pair.toUnitId)),
    );
    const duplicates = titles.filter((title, index) => titles.indexOf(title) !== index);
    expect(duplicates).toEqual([]);
  });

  it('gives every generated page a unique description', () => {
    const descriptions = pairs.map((pair) =>
      conversionPageDescription(requireUnit(pair.fromUnitId), requireUnit(pair.toUnitId)),
    );
    expect(new Set(descriptions).size).toBe(descriptions.length);
  });

  it('keeps titles and descriptions within search-result limits', () => {
    for (const pair of pairs) {
      const from = requireUnit(pair.fromUnitId);
      const to = requireUnit(pair.toUnitId);
      // The layout template appends " | Unit Converter" (17 characters).
      expect(conversionPageTitle(from, to).length + 17).toBeLessThanOrEqual(90);
      expect(conversionPageDescription(from, to).length).toBeLessThanOrEqual(200);
    }
  });

  it('never emits placeholder values', () => {
    for (const pair of pairs) {
      const text = conversionPageDescription(
        requireUnit(pair.fromUnitId),
        requireUnit(pair.toUnitId),
      );
      expect(text).not.toMatch(/undefined|NaN|null|\[object/);
    }
  });
});

describe('category metadata', () => {
  it('canonicalises to the clean category path', () => {
    for (const category of getCategories()) {
      const metadata = buildCategoryMetadata(category, 10);
      expect(metadata.alternates?.canonical).toBe(absoluteUrl(`/${category.slug}`));
    }
  });

  it('serves the mass category from /weight', () => {
    const mass = getCategories().find((category) => category.id === 'mass');
    expect(mass && buildCategoryMetadata(mass, 10).alternates?.canonical).toBe(
      absoluteUrl('/weight'),
    );
  });
});

describe('noindex pages', () => {
  it('marks a page noindex but still followable', () => {
    const metadata = buildMetadata({
      title: 'Search',
      description: 'x',
      path: '/search',
      noIndex: true,
    });
    expect(metadata.robots).toEqual({ index: false, follow: true });
  });

  it('leaves normal pages without a robots override', () => {
    const metadata = buildMetadata({ title: 'About', description: 'x', path: '/about' });
    expect(metadata.robots).toBeUndefined();
  });
});

describe('sitemap', () => {
  const entries = sitemap();
  const urls = entries.map((entry) => entry.url);

  it('lists every category, collection and conversion page exactly once', () => {
    const expected = 1 + 2 + getCategories().length + getCollections().length + pairs.length;
    expect(entries.length).toBe(expected);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it('uses absolute URLs on the canonical origin with no query strings', () => {
    for (const url of urls) {
      expect(url.startsWith(siteConfig.url)).toBe(true);
      expect(url).not.toContain('?');
      // Only the homepage ends in a slash: an origin's root cannot omit it.
      if (url !== `${siteConfig.url}/`) expect(url).not.toMatch(/\/$/);
    }
  });

  it('excludes the noindexed search page', () => {
    expect(urls).not.toContain(absoluteUrl('/search'));
  });

  it('includes the core conversion pages', () => {
    expect(urls).toContain(absoluteUrl('/length/meters-to-feet'));
    expect(urls).toContain(absoluteUrl('/temperature/celsius-to-fahrenheit'));
    expect(urls).toContain(absoluteUrl('/cooking'));
  });
});

describe('robots.txt', () => {
  it('allows crawling, blocks search results and points at the sitemap', () => {
    const result = robots();
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    expect(rules[0]?.allow).toBe('/');
    expect(rules[0]?.disallow).toEqual(['/search']);
    expect(result.sitemap).toBe(absoluteUrl('/sitemap.xml'));
  });
});

describe('structured data', () => {
  it('numbers breadcrumb positions and omits the item URL on the current page', () => {
    const schema = breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Length', path: '/length' },
      { name: 'Meters to feet' },
    ]);
    expect(schema.itemListElement.map((item) => item.position)).toEqual([1, 2, 3]);
    expect(schema.itemListElement[0]).toHaveProperty('item', absoluteUrl('/'));
    expect(schema.itemListElement[2]).not.toHaveProperty('item');
  });

  it('builds FAQ entries from question and answer pairs', () => {
    const schema = faqSchema([{ question: 'Q?', answer: 'A.' }]);
    expect(schema.mainEntity[0]).toEqual({
      '@type': 'Question',
      name: 'Q?',
      acceptedAnswer: { '@type': 'Answer', text: 'A.' },
    });
  });

  it('points the site search action at the real search route', () => {
    expect(websiteSchema().potentialAction.target.urlTemplate).toBe(
      `${siteConfig.url}/search?q={search_term_string}`,
    );
  });
});
