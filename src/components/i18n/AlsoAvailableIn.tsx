import { siteLanguages, type SiteLanguage } from '@/i18n/config';
import { getEnglishPageAlternates } from '@/i18n/pages';
import { Section } from '@/components/ui/primitives';

/**
 * "Also available in" links on an English page that has translations.
 *
 * Visible links between language versions help people who landed on the wrong
 * one, and give crawlers the same map the hreflang tags declare. Renders
 * nothing for the many English pages that have no translation.
 */
export function AlsoAvailableIn({ path }: { path: string }) {
  const alternates = getEnglishPageAlternates(path);
  const names = new Map(siteLanguages().map((language) => [language.code, language.name]));
  const links = (Object.entries(alternates) as [SiteLanguage, string][]).filter(
    ([language]) => language !== 'en',
  );
  if (links.length === 0) return null;

  return (
    <Section title="Also available in">
      <ul className="flex flex-wrap gap-2">
        {links.map(([language, href]) => (
          <li key={language}>
            <a
              href={href}
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
