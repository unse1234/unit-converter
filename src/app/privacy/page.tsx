import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { Prose, Section } from '@/components/ui/primitives';

export const metadata: Metadata = buildMetadata({
  title: 'Privacy',
  description:
    'What this site stores, what it does not collect, and how advertising and analytics are handled.',
  path: '/privacy',
});

/**
 * Privacy page.
 *
 * Describes the application as it is actually built. If advertising or
 * analytics are switched on later, this page must be updated in the same
 * change — that is a review requirement, not a suggestion.
 */
export default function PrivacyPage() {
  return (
    <div className="page-shell py-6 sm:py-8">
      <Breadcrumbs entries={[{ name: 'Home', path: '/' }, { name: 'Privacy' }]} />

      <div className="mt-5 max-w-[68ch]">
        <h1>Privacy</h1>
        <p className="text-fg-secondary mt-3">
          The short version: conversions happen in your browser, and nothing you type is sent to a
          server.
        </p>

        <div className="mt-8 space-y-10">
          <Section title="What stays on your device">
            <Prose>
              <p>
                Your theme preference, your saved conversions and your recent conversions are kept
                in your browser&rsquo;s local storage. They are readable only by this site, on this
                device, and they are never transmitted. Clearing your browser&rsquo;s site data
                removes them permanently.
              </p>
              <p>
                The values you convert are not stored, logged or transmitted. The conversion engine
                runs entirely in the page.
              </p>
            </Prose>
          </Section>

          <Section title="What is not collected">
            <Prose>
              <p>
                There are no accounts, so no names, email addresses or passwords are collected.
                There are no tracking cookies and no cross-site identifiers. The site does not sell
                or share personal information, because it does not collect any.
              </p>
            </Prose>
          </Section>

          <Section title="Analytics">
            <Prose>
              <p>
                The application includes an analytics interface, but no analytics provider is
                enabled in this deployment and no analytics requests are made. If one is enabled in
                future, it will record which pages and features are used — page views, which
                categories are opened, whether a result was copied — and never the values you type.
                This page will be updated before any such change goes live.
              </p>
            </Prose>
          </Section>

          <Section title="Advertising">
            <Prose>
              <p>
                No advertising is served in this deployment and no ad network code is loaded. The
                layout reserves space for advertising in future, but ads are never placed over the
                converter or between its controls, and the site works exactly the same when they are
                absent. If advertising is enabled, this page will be updated to name the provider
                and describe what it collects.
              </p>
            </Prose>
          </Section>

          <Section title="Hosting">
            <Prose>
              <p>
                Pages are static files served from a content delivery network. The hosting provider
                may keep standard server logs, such as IP addresses and request times, for security
                and operational purposes. That is the extent of the data this site can be associated
                with.
              </p>
            </Prose>
          </Section>
        </div>
      </div>
    </div>
  );
}
