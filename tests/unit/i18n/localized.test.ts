import { describe, expect, it } from 'vitest';
import { LOCALES, LOCALE_DEFINITIONS, type SiteLanguage } from '@/i18n/config';
import { buildPairContent, screenContext, valueContext } from '@/i18n/content';
import { buildLocalFormula, formatLocal } from '@/i18n/format';
import { requireLocalizableUnit } from '@/i18n/local-units';
import { parseLocalizedNumericInput } from '@/i18n/parse';
import { localizedPageMetadata, pageTitleAndDescription } from '@/i18n/metadata';
import {
  LOCALE_CONTENT,
  getEnglishPageAlternates,
  getLocalizedPage,
  getLocalizedPages,
  getPageAlternates,
} from '@/i18n/pages';

describe('localized page registry', () => {
  const pages = getLocalizedPages();

  it('publishes every launch language with a home page', () => {
    for (const locale of LOCALES) {
      expect(getLocalizedPage(`/${locale}`)?.kind).toBe('home');
    }
  });

  it('uses lowercase ASCII slugs under the language folder', () => {
    for (const page of pages) {
      expect(page.path.startsWith(`/${page.locale}`)).toBe(true);
      expect(page.path).toMatch(/^\/[a-z]{2}(\/[a-z0-9-]+){0,2}$/);
    }
  });

  it('builds the content and metadata of every page without error', () => {
    for (const page of pages) {
      const { title, description } = pageTitleAndDescription(page);
      expect(title.length).toBeGreaterThan(0);
      expect(description.length).toBeGreaterThan(0);
      if (page.kind === 'pair') buildPairContent(page.locale, page.spec);
    }
  });

  it('gives every page a unique title and description within its language', () => {
    for (const locale of LOCALES) {
      const meta = getLocalizedPages(locale).map(pageTitleAndDescription);
      expect(new Set(meta.map((item) => item.title)).size).toBe(meta.length);
      expect(new Set(meta.map((item) => item.description)).size).toBe(meta.length);
    }
  });

  it('keeps hreflang clusters reciprocal', () => {
    for (const page of pages) {
      const alternates = getPageAlternates(page);
      expect(alternates[page.locale]).toBe(page.path);
      for (const [language, path] of Object.entries(alternates) as [SiteLanguage, string][]) {
        if (language === 'en') {
          expect(getEnglishPageAlternates(path)).toEqual(alternates);
        } else {
          const other = getLocalizedPage(path);
          expect(other).toBeDefined();
          expect(getPageAlternates(other!)).toEqual(alternates);
        }
      }
    }
  });

  it('uses each translated URL as its canonical, with valid self-referencing hreflang', () => {
    for (const page of pages) {
      const metadata = localizedPageMetadata(page);
      expect(metadata.alternates?.canonical).toBe(`https://unitflip.org${page.path}`);
      const languages = metadata.alternates?.languages as Record<string, string> | undefined;
      if (languages) {
        expect(languages[LOCALE_DEFINITIONS[page.locale].hreflang]).toBe(
          `https://unitflip.org${page.path}`,
        );
        for (const code of Object.keys(languages))
          expect(code).toMatch(/^(en|es|pt|it|fr|id|x-default)$/);
      }
    }
  });

  it('does not fabricate English equivalents or Open Graph translations for local units', () => {
    const page = getLocalizedPage('/id/berat/ons-ke-gram')!;
    expect(getPageAlternates(page)).toEqual({ id: page.path });
    expect(localizedPageMetadata(page).alternates?.languages).toBeUndefined();
    expect(localizedPageMetadata(page).openGraph).toMatchObject({ alternateLocale: [] });
  });

  it('links the English inch page to all five translations, English as x-default', () => {
    const alternates = getEnglishPageAlternates('/length/inches-to-centimeters');
    expect(alternates).toEqual({
      en: '/length/inches-to-centimeters',
      es: '/es/longitud/pulgadas-a-cm',
      pt: '/pt/comprimento/polegadas-em-cm',
      it: '/it/lunghezza/pollici-in-cm',
      fr: '/fr/longueur/pouces-en-cm',
      id: '/id/panjang/inch-ke-cm',
    });

    const page = getLocalizedPage('/es/longitud/pulgadas-a-cm')!;
    const languages = localizedPageMetadata(page).alternates?.languages as Record<string, string>;
    expect(languages['x-default']).toMatch(/\/length\/inches-to-centimeters$/);
  });

  it('does not build a single-value page where a TV-size page answers the query', () => {
    expect(getLocalizedPage('/pt/comprimento/55-polegadas-em-cm')).toBeUndefined();
    expect(getLocalizedPage('/pt/tv/tamanho-tv-55-polegadas-em-cm')?.kind).toBe('tv');
    expect(getLocalizedPage('/it/lunghezza/55-pollici-in-cm')?.kind).toBe('value');
  });
});

describe('research keywords and titles', () => {
  const title = (path: string) => pageTitleAndDescription(getLocalizedPage(path)!).title;

  it('uses the researched titles on the head-term pages', () => {
    expect(title('/es/longitud/pulgadas-a-cm')).toBe(
      'Pulgadas a cm: convertidor y tabla (1 in = 2.54 cm)',
    );
    expect(title('/es/peso/libras-a-kilos')).toBe('Libras a kilos: convertidor lb a kg con tabla');
    expect(title('/pt/area/alqueire-em-hectare')).toBe(
      'Alqueire em hectare e m²: paulista, mineiro e baiano',
    );
    expect(title('/id/berat/ons-ke-gram')).toBe(
      '1 Ons Berapa Gram? 100 g (Ons Indonesia) vs 28,35 g',
    );
    expect(title('/fr/longueur/pouces-en-cm')).toBe(
      'Pouces en cm : convertisseur et tableau (1 po = 2,54 cm)',
    );
  });

  it('generates single-value titles that match the research pattern', () => {
    expect(title('/es/longitud/6-pulgadas-a-cm')).toBe('6 pulgadas a cm: 6 in = 15.24 cm');
    expect(title('/es/peso/25-libras-a-kilos')).toBe('25 libras a kilos: 25 lb = 11.34 kg');
    expect(title('/pt/peso/100-libras-em-kg')).toBe('100 libras em kg: 100 lb = 45,36 kg');
    expect(title('/it/peso/200-libbre-in-kg')).toBe('200 libbre in kg: 200 lb = 90,72 kg');
    expect(title('/id/panjang/10-inch-berapa-cm')).toBe('10 inch berapa cm? 10 in = 25,4 cm');
    expect(title('/es/longitud/1-5-pulgadas-a-cm')).toBe('1.5 pulgadas a cm: 1.5 in = 3.81 cm');
  });

  it('uses the question form for Indonesian single-value pages', () => {
    const indonesian = getLocalizedPages('id').filter((page) => page.kind === 'value');
    expect(indonesian.length).toBeGreaterThan(0);
    for (const page of indonesian) expect(page.path).toMatch(/-berapa-/);
  });
});

describe('localized numbers', () => {
  it("writes numbers in each market's notation", () => {
    expect(formatLocal(2.54, 'es')).toBe('2.54');
    expect(formatLocal(2.54, 'pt')).toBe('2,54');
    expect(formatLocal(2.54, 'it')).toBe('2,54');
    expect(formatLocal(2.54, 'fr')).toBe('2,54');
    expect(formatLocal(2.54, 'id')).toBe('2,54');
  });

  it('states exact formulas, dividing when only the inverse is exact', () => {
    const inch = requireLocalizableUnit('inch');
    const cm = requireLocalizableUnit('centimeter');
    expect(buildLocalFormula(inch, cm, 'es', 'in', 'cm')?.expression).toBe('cm = in × 2.54');
    expect(buildLocalFormula(cm, inch, 'pt', 'cm', 'pol')?.expression).toBe('pol = cm ÷ 2,54');

    const f = requireLocalizableUnit('fahrenheit');
    const c = requireLocalizableUnit('celsius');
    expect(buildLocalFormula(f, c, 'it', '°F', '°C')?.expression).toBe('°C = (°F − 32) × 5/9');
    expect(buildLocalFormula(c, f, 'fr', '°C', '°F')?.expression).toBe('°F = °C × 9/5 + 32');
  });

  it('avoids calling a rounded kilogram-to-pound multiplier exact', () => {
    const kg = requireLocalizableUnit('kilogram');
    const lb = requireLocalizableUnit('pound');
    const formula = buildLocalFormula(kg, lb, 'pt', 'kg', 'lb');
    expect(formula?.expression).toBe('lb = kg ÷ 0,45359237');
    expect(formula?.working(1)).toBe('1 ÷ 0,45359237 ≈ 2,205');
    const inch = requireLocalizableUnit('inch');
    const cm = requireLocalizableUnit('centimeter');
    expect(buildLocalFormula(inch, cm, 'es', 'in', 'cm')?.working(6)).toBe('6 × 2.54 = 15.24');
  });

  it('computes the local units from their definitions', () => {
    const es = LOCALE_CONTENT.id.pairs.find((pair) => pair.slug === 'ons-ke-gram')!;
    expect(valueContext('id', es, 5).result).toBe('500');

    const alqueire = LOCALE_CONTENT.pt.pairs.find((pair) => pair.slug === 'alqueire-em-hectare')!;
    expect(buildPairContent('pt', alqueire).ctx.factor).toBe('2,42');
    expect(valueContext('pt', { ...alqueire, from: 'alqueire-mineiro' }, 1).result).toBe('4,84');

    const arroba = LOCALE_CONTENT.pt.pairs.find((pair) => pair.slug === 'arroba-em-kg')!;
    expect(valueContext('pt', arroba, 20).result).toBe('300');
  });

  it('gives TV dimensions for a 16:9 screen', () => {
    expect(screenContext('pt', 55)).toEqual({
      size: '55',
      diagonal: '139,7',
      width: '121,8',
      height: '68,5',
    });
    expect(screenContext('fr', 65)).toMatchObject({ diagonal: '165,1', width: '143,9' });
  });
});

describe('localized input parsing', () => {
  it('interprets a three-place decimal comma according to the page language', () => {
    for (const locale of ['pt-BR', 'it-IT', 'fr-FR', 'id-ID']) {
      expect(parseLocalizedNumericInput('1,234', locale)).toEqual({ ok: true, value: 1.234 });
    }
    expect(parseLocalizedNumericInput('1,234', 'es-MX')).toEqual({ ok: true, value: 1234 });
  });

  it('accepts grouped values, fractions and scientific notation without merging malformed groups', () => {
    expect(parseLocalizedNumericInput('1.234,5', 'pt-BR')).toEqual({ ok: true, value: 1234.5 });
    expect(parseLocalizedNumericInput('1 234,5', 'fr-FR')).toEqual({ ok: true, value: 1234.5 });
    expect(parseLocalizedNumericInput('1,234.5', 'es-MX')).toEqual({ ok: true, value: 1234.5 });
    expect(parseLocalizedNumericInput('1 1/2', 'pt-BR')).toEqual({ ok: true, value: 1.5 });
    expect(parseLocalizedNumericInput('2,5e3', 'it-IT')).toEqual({ ok: true, value: 2500 });
    expect(parseLocalizedNumericInput('2.54', 'pt-BR')).toEqual({ ok: true, value: 2.54 });
    expect(parseLocalizedNumericInput('1.23.456,7', 'pt-BR').ok).toBe(false);
    expect(parseLocalizedNumericInput('10 20', 'fr-FR').ok).toBe(false);
  });
});
