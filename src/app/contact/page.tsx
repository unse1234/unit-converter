import type { Metadata } from 'next';
import Link from 'next/link';
import { buildMetadata } from '@/lib/seo/metadata';
import { siteConfig } from '@/lib/site';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { Prose, Section } from '@/components/ui/primitives';

export const metadata: Metadata = buildMetadata({
  title: 'Contact',
  description: `Report a wrong conversion factor, request a unit or ask a question about ${siteConfig.name}.`,
  path: '/contact',
});

/**
 * Contact page.
 *
 * A mailto link rather than a form: the site is a static export with no
 * backend, and a form that silently discards submissions would be worse than
 * no form at all.
 */
export default function ContactPage() {
  const mailto = `mailto:${siteConfig.contactEmail}`;

  return (
    <div className="page-shell py-6 sm:py-8">
      <Breadcrumbs entries={[{ name: 'Home', path: '/' }, { name: 'Contact' }]} />

      <div className="mt-5 max-w-[68ch]">
        <h1>Contact</h1>
        <p className="text-fg-secondary mt-3 text-lg leading-relaxed">
          Questions, corrections and requests are all welcome. One person reads this address, so
          replies are not instant, but every message is read.
        </p>

        <div className="mt-8">
          <a
            href={mailto}
            className="bg-fg text-canvas hover:bg-fg-secondary inline-flex h-11 items-center rounded-md px-5 text-sm font-medium transition-colors"
          >
            Email {siteConfig.contactEmail}
          </a>
        </div>

        <div className="mt-10 space-y-10">
          <Section title="Reporting a wrong conversion">
            <Prose>
              <p>
                This is the message we most want to receive. Please include the page address, the
                value you entered, the result you were shown and the result you expected. If you
                have a source for the correct factor — a standards document, a national metrology
                institute, a published definition — include that too, and the fix goes in much
                faster.
              </p>
              <p>
                Every constant on this site comes from a defining authority rather than from
                another converter; the <Link href="/about">about page</Link> lists the sources.
              </p>
            </Prose>
          </Section>

          <Section title="Requesting a unit or a conversion page">
            <Prose>
              <p>
                Tell us the unit, the category it belongs to, and where you ran into it. Units used
                in a real trade, science or region are the ones most likely to be added. Not every
                pair of units gets its own page — pairs at wildly different scales are left out on
                purpose — but every unit in the catalog is available in the converter itself.
              </p>
            </Prose>
          </Section>

          <Section title="Accessibility problems">
            <Prose>
              <p>
                If something here does not work with a screen reader, a keyboard alone, or at a
                zoom level you need, that is a bug and we want to hear about it. Please say which
                assistive technology and browser you were using.
              </p>
            </Prose>
          </Section>

          <Section title="Privacy requests">
            <Prose>
              <p>
                The site holds no personal data about you, so there is usually nothing for us to
                retrieve or erase. The <Link href="/privacy-policy">privacy policy</Link> explains
                what the third-party services on this site collect and how to opt out of them.
              </p>
            </Prose>
          </Section>
        </div>
      </div>
    </div>
  );
}
