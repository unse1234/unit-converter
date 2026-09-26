import Link from 'next/link';
import { localeHomePath, siteLanguages, type Locale } from '@/i18n/config';
import { LOCALE_CONTENT, categoryPath, getLocaleCategories } from '@/i18n/pages';
import type { LocalCategory } from '@/i18n/types';
import { siteConfig } from '@/lib/site';
import { MobileNav } from '@/components/navigation/MobileNav';
import { ThemeToggle } from '@/components/theme/theme';
import { SwapIcon } from '@/components/ui/icons';
import { LanguageMenu } from './LanguageMenu';

/**
 * Header and footer of the localized sections.
 *
 * The same shape as the English ones, with the language's categories and
 * wording. The English search is left out: its index and results are English.
 */

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

function navCategories(locale: Locale) {
  const content = LOCALE_CONTENT[locale];
  return getLocaleCategories(locale).map((category) => ({
    category,
    href: categoryPath(locale, category),
    name: content.categories[category]?.name ?? category,
  }));
}

export function LocaleHeader({ locale }: { locale: Locale }) {
  const { text } = LOCALE_CONTENT[locale];
  const categories = navCategories(locale);

  return (
    <header className="bg-canvas/85 sticky top-0 z-40 shadow-[0_1px_0_0_var(--ds-border)] backdrop-blur-md">
      <div className="page-shell flex h-16 items-center gap-2">
        <Link
          href={localeHomePath(locale)}
          className="text-fg mr-1 flex shrink-0 items-center gap-2 rounded-md text-[0.9375rem] font-medium tracking-tight"
        >
          <span
            aria-hidden="true"
            className="bg-fg text-canvas grid size-7 place-items-center rounded-md"
          >
            <SwapIcon size={16} strokeWidth={2} />
          </span>
          <span>{siteConfig.name}</span>
        </Link>

        <nav aria-label={text.menuTitle} className="ml-2 hidden lg:block">
          <ul className="flex items-center gap-1">
            {categories.slice(0, 5).map((category) => (
              <li key={category.category}>
                <Link
                  href={category.href}
                  className="text-fg-secondary hover:bg-hover hover:text-fg inline-flex h-9 items-center rounded-md px-3 text-sm transition-colors"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <LanguageMenu current={locale} languages={siteLanguages()} label={text.languageMenu} />
          <ThemeToggle />
          <MobileNav
            labels={{ open: text.menuOpen, close: text.menuClose, title: text.menuTitle }}
            categories={categories.map((category) => ({
              slug: category.category,
              href: category.href,
              name: category.name,
              icon: CATEGORY_ICONS[category.category],
            }))}
          />
        </div>
      </div>
    </header>
  );
}

export function LocaleFooter({ locale }: { locale: Locale }) {
  const { text } = LOCALE_CONTENT[locale];
  const categories = navCategories(locale);

  const infoLinks = [
    { href: '/about', label: text.footerAbout },
    { href: '/contact', label: text.footerContact },
    { href: '/privacy-policy', label: text.footerPrivacy },
    { href: '/terms', label: text.footerTerms },
  ];

  return (
    <footer className="mt-16 shadow-[0_-1px_0_0_var(--ds-border)]">
      <div className="page-shell py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-fg text-sm font-medium">{siteConfig.name}</p>
            <p className="text-fg-subtle mt-2 max-w-xs text-sm leading-relaxed">
              {text.footerTagline}
            </p>
            <p className="mt-4 text-sm">
              <Link href="/" hrefLang="en" className="text-fg-secondary hover:text-accent">
                {text.englishSite}
              </Link>
            </p>
          </div>

          <div>
            <h2 className="text-fg text-sm font-medium">{text.footerCategories}</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {categories.map((category) => (
                <li key={category.category}>
                  <Link href={category.href} className="text-fg-secondary hover:text-accent">
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-fg text-sm font-medium">{text.footerLanguages}</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {siteLanguages().map((language) => (
                <li key={language.code}>
                  <a
                    href={language.href}
                    hrefLang={language.code}
                    lang={language.code}
                    aria-current={language.code === locale ? 'true' : undefined}
                    className="text-fg-secondary hover:text-accent"
                  >
                    {language.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="text-fg-subtle mt-10 flex flex-col gap-3 pt-6 text-sm shadow-[0_-1px_0_0_var(--ds-border)] sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}
          </p>
          <nav aria-label={text.footerAbout}>
            <ul className="flex flex-wrap items-center gap-x-5">
              {infoLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    hrefLang="en"
                    className="hover:text-accent inline-flex min-h-11 items-center"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
