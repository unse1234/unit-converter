import type { Metadata } from 'next';
import Link from 'next/link';
import { buildMetadata } from '@/lib/seo/metadata';
import { siteConfig } from '@/lib/site';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { Prose, Section } from '@/components/ui/primitives';

export const metadata: Metadata = buildMetadata({
  title: 'Privacy Policy',
  description: `How ${siteConfig.name} handles your data, which cookies are set, and how Google Analytics and Google AdSense are involved.`,
  path: '/privacy-policy',
});

/**
 * Privacy policy.
 *
 * Covers the site as deployed, including the third parties that run on it.
 * Google requires an accessible policy that names AdSense, mentions cookies
 * and links to the relevant opt-outs before an AdSense account is approved, so
 * those sections must stay while advertising is enabled.
 */
export default function PrivacyPolicyPage() {
  const host = siteConfig.url.replace(/^https?:\/\//, '');
  const mailto = `mailto:${siteConfig.contactEmail}`;

  return (
    <div className="page-shell py-6 sm:py-8">
      <Breadcrumbs entries={[{ name: 'Home', path: '/' }, { name: 'Privacy Policy' }]} />

      <div className="mt-5 max-w-[68ch]">
        <h1>Privacy Policy</h1>
        <p className="text-fg-secondary mt-3">
          The short version: your conversions happen in your browser, and the values you type are
          never sent to us. This page explains everything else, including the third-party services
          that run on this site.
        </p>

        <div className="mt-8 space-y-10">
          <Section title="Who we are">
            <Prose>
              <p>
                {siteConfig.name} is a free unit-conversion website at {host}. You can reach us at{' '}
                <a href={mailto}>{siteConfig.contactEmail}</a> with any question about this policy.
              </p>
            </Prose>
          </Section>

          <Section title="What stays on your device">
            <Prose>
              <p>
                Your theme preference, saved conversions, recent conversions and precision setting
                are kept in your browser&rsquo;s local storage. They are readable only by this site,
                on this device, and are never transmitted to us. Clearing your browser&rsquo;s site
                data removes them permanently.
              </p>
              <p>
                The values you convert are not stored, logged or transmitted. The conversion engine
                runs entirely in the page.
              </p>
            </Prose>
          </Section>

          <Section title="What we do not collect">
            <Prose>
              <p>
                There are no accounts, so we collect no names, email addresses or passwords. We do
                not operate a mailing list, and we do not sell or share personal information,
                because we hold none. If you email us, we keep that message only for as long as it
                takes to answer you.
              </p>
            </Prose>
          </Section>

          <Section title="Cookies and similar technologies">
            <Prose>
              <p>
                {siteConfig.name} sets no cookies of its own. The preferences described above use
                local storage, which is not transmitted with requests the way a cookie is.
              </p>
              <p>
                The third-party services below may set cookies or read device identifiers in your
                browser. Analytics cookies measure how the site is used; advertising cookies help
                select ads and limit how often the same one is repeated. You can block or delete
                cookies in your browser settings at any time, and the converter keeps working either
                way.
              </p>
            </Prose>
          </Section>

          <Section title="Google Analytics">
            <Prose>
              <p>
                We use Google Analytics 4, provided by Google LLC, to understand which pages and
                features people use. It records page views and a small number of interaction events
                — that a conversion was performed, which units were involved, whether a result was
                copied, whether search was used.
              </p>
              <p>
                It never receives the values you type. Google Analytics does collect technical
                information such as an approximate location derived from your IP address, your
                device type, browser and referring page, and it sets cookies to recognise a
                returning browser. Google Analytics 4 anonymises IP addresses by default.
              </p>
              <p>
                You can opt out across all sites with Google&rsquo;s{' '}
                <a
                  href="https://tools.google.com/dlpage/gaoptout"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                >
                  Google Analytics Opt-out Browser Add-on
                </a>
                . Google describes its own handling of this data in its{' '}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                >
                  Privacy Policy
                </a>
                .
              </p>
            </Prose>
          </Section>

          <Section title="Google AdSense and third-party ad vendors">
            <Prose>
              <p>
                This site is supported by advertising served through Google AdSense. Google is a
                third-party vendor and uses cookies to serve ads here. Google&rsquo;s use of
                advertising cookies enables it and its partners to serve ads to you based on your
                visit to this site and to other sites on the internet.
              </p>
              <p>
                Third-party vendors and ad networks other than Google may also serve ads on this
                site. They may likewise use cookies, web beacons or similar technologies to measure
                ad performance and to personalise what you are shown. We do not control these
                vendors and we do not receive the personal data they collect.
              </p>
              <p>
                You can opt out of personalised advertising by Google in your{' '}
                <a
                  href="https://www.google.com/settings/ads"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                >
                  Google Ads Settings
                </a>
                , and opt out of personalised advertising from many other vendors at{' '}
                <a
                  href="https://www.aboutads.info/choices/"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                >
                  aboutads.info/choices
                </a>{' '}
                or{' '}
                <a
                  href="https://optout.networkadvertising.org/"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                >
                  the NAI opt-out page
                </a>
                . Google&rsquo;s advertising practices are set out in{' '}
                <a
                  href="https://policies.google.com/technologies/ads"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                >
                  How Google uses information from sites that use its services
                </a>
                .
              </p>
            </Prose>
          </Section>

          <Section title="Hosting and server logs">
            <Prose>
              <p>
                Pages are static files served from a content delivery network. The hosting provider
                may keep standard server logs, such as IP addresses, request times and user agents,
                for security and operational purposes. That is the extent of the data this site can
                be associated with.
              </p>
            </Prose>
          </Section>

          <Section title="Children">
            <Prose>
              <p>
                This is a general-purpose reference tool and is not directed at children under 13.
                We do not knowingly collect personal information from children.
              </p>
            </Prose>
          </Section>

          <Section title="Your rights">
            <Prose>
              <p>
                Depending on where you live, you may have the right to access, correct or delete
                personal data held about you, or to object to its processing. Because we hold no
                personal data ourselves, most such requests are best directed to Google, whose
                services collect it. You can still write to us at{' '}
                <a href={mailto}>{siteConfig.contactEmail}</a> and we will help where we can.
              </p>
            </Prose>
          </Section>

          <Section title="Changes to this policy">
            <Prose>
              <p>
                If we add, change or remove a third-party service, this page is updated in the same
                change that ships it. See also our <Link href="/terms">terms of use</Link> and the{' '}
                <Link href="/about">about page</Link> for how the conversions themselves are
                produced.
              </p>
            </Prose>
          </Section>
        </div>
      </div>
    </div>
  );
}
