import type { Metadata } from 'next';
import Link from 'next/link';
import { buildMetadata } from '@/lib/seo/metadata';
import { siteConfig } from '@/lib/site';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { Prose, Section } from '@/components/ui/primitives';

export const metadata: Metadata = buildMetadata({
  title: 'Terms of Use',
  description: `The terms that apply when you use ${siteConfig.name}, including accuracy, acceptable use and liability.`,
  path: '/terms',
});

/**
 * Terms of use.
 *
 * Deliberately short and readable. The important clause is the accuracy one:
 * the conversions here are exact where the underlying definitions are exact,
 * but the site cannot carry liability for how a result is used.
 */
export default function TermsPage() {
  const mailto = `mailto:${siteConfig.contactEmail}`;

  return (
    <div className="page-shell py-6 sm:py-8">
      <Breadcrumbs entries={[{ name: 'Home', path: '/' }, { name: 'Terms of Use' }]} />

      <div className="mt-5 max-w-[68ch]">
        <h1>Terms of Use</h1>
        <p className="text-fg-secondary mt-3">
          By using {siteConfig.name} you agree to what follows. It is short, and there is nothing
          surprising in it.
        </p>

        <div className="mt-8 space-y-10">
          <Section title="Using the site">
            <Prose>
              <p>
                {siteConfig.name} is free to use, for personal and commercial purposes alike. No
                account is required and nothing needs to be installed. You may link to any page
                here without asking.
              </p>
            </Prose>
          </Section>

          <Section title="Accuracy, and its limits">
            <Prose>
              <p>
                We take accuracy seriously. Conversion factors are taken from defining authorities
                — the BIPM SI Brochure, the 1959 International Yard and Pound Agreement, NIST SP
                811, ISO 80000 and IEC 80000-13 among them — and calculations run at full double
                precision with no intermediate rounding. Where a definition is exact, the
                conversion is exact.
              </p>
              <p>
                Even so, the site is provided &ldquo;as is&rdquo;, without warranty of any kind.
                Displayed results are rounded for readability, some units genuinely have no single
                universal value, and software has bugs. Do not rely on this site as the sole
                authority for medical dosing, structural engineering, navigation, legal or
                financial calculations, or anything else where an error carries real cost. Check a
                primary source and, where it matters, check it twice.
              </p>
              <p>
                If you find a wrong result, please <Link href="/contact">tell us</Link>. Corrections
                are the fastest changes we make.
              </p>
            </Prose>
          </Section>

          <Section title="Acceptable use">
            <Prose>
              <p>
                Please do not attempt to disrupt the site or the people using it. That includes
                automated traffic heavy enough to degrade service for others, attempts to
                circumvent security measures, and scraping the site wholesale in order to republish
                it. Ordinary, considerate automated access is fine.
              </p>
            </Prose>
          </Section>

          <Section title="Intellectual property">
            <Prose>
              <p>
                Conversion factors are facts and definitions; nobody owns them, and we make no
                claim over them. The design, written explanations, page copy and code of this site
                are ours. You are welcome to quote a short passage with a link back, but please do
                not reproduce the site&rsquo;s content in bulk.
              </p>
            </Prose>
          </Section>

          <Section title="Third-party links and advertising">
            <Prose>
              <p>
                This site links to external sources and carries advertising served by third
                parties. We do not control those destinations and are not responsible for their
                content or their practices. What those services collect is described in the{' '}
                <Link href="/privacy-policy">privacy policy</Link>.
              </p>
            </Prose>
          </Section>

          <Section title="Liability">
            <Prose>
              <p>
                To the fullest extent permitted by law, {siteConfig.name} and its operator are not
                liable for any loss or damage arising from your use of this site or from reliance
                on any result it produces. Some jurisdictions do not allow certain limitations of
                liability, in which case those limitations apply to you only so far as the law
                allows.
              </p>
            </Prose>
          </Section>

          <Section title="Availability and changes">
            <Prose>
              <p>
                We do not guarantee that the site will be available without interruption, and we
                may change, add or remove units, pages and features at any time. These terms may
                also change; the version on this page is always the one in force.
              </p>
            </Prose>
          </Section>

          <Section title="Contact">
            <Prose>
              <p>
                Questions about these terms can go to{' '}
                <a href={mailto}>{siteConfig.contactEmail}</a>.
              </p>
            </Prose>
          </Section>
        </div>
      </div>
    </div>
  );
}
