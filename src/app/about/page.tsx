import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllConversionPairs } from '@/domain/conversion/pairs';
import { getAllUnits, getCategories } from '@/domain/units/registry';
import { buildMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { Prose, Section } from '@/components/ui/primitives';

export const metadata: Metadata = buildMetadata({
  title: 'About',
  description:
    'How this converter works, where its conversion constants come from, and how ambiguous units are handled.',
  path: '/about',
});

/**
 * About page.
 *
 * Exists to answer the question a careful user actually has — "can I trust
 * this number?" — by stating where the constants come from and how ambiguous
 * units are treated.
 */
export default function AboutPage() {
  const unitCount = getAllUnits().length;
  const categoryCount = getCategories().length;
  const pageCount = getAllConversionPairs().length;

  return (
    <div className="page-shell py-6 sm:py-8">
      <Breadcrumbs entries={[{ name: 'Home', path: '/' }, { name: 'About' }]} />

      <div className="mt-5 max-w-[68ch]">
        <h1>About this converter</h1>

        <div className="mt-8 space-y-10">
          <Section title="What it covers">
            <Prose>
              <p>
                {unitCount} units across {categoryCount} categories, with {pageCount} conversion
                pages that each carry the exact factor, the formula, worked examples and a reference
                table. Conversion happens as you type — there is no button to press and nothing to
                wait for.
              </p>
            </Prose>
          </Section>

          <Section title="Where the numbers come from">
            <Prose>
              <p>
                Every constant is taken from a defining authority rather than copied from another
                converter. The main sources are the <strong>BIPM SI Brochure</strong>, the{' '}
                <strong>1959 International Yard and Pound Agreement</strong>,{' '}
                <strong>NIST Special Publication 811</strong>, <strong>ISO 80000</strong>,{' '}
                <strong>IEC 80000-13</strong> for binary units, and <strong>IAU resolutions</strong>{' '}
                for astronomical distances.
              </p>
              <p>
                Most of these are definitions, not measurements. An inch is exactly 2.54 centimetres
                and a pound is exactly 0.45359237 kilograms, so the conversions between metric and
                imperial units here are exact, not approximations. Calculations run at full double
                precision with no intermediate rounding; the number of digits you see is a display
                setting and changing it never changes the underlying result.
              </p>
            </Prose>
          </Section>

          <Section title="Units that are not as fixed as they look">
            <Prose>
              <p>
                Several widely used units have no single universal value, and this converter says so
                on the page rather than quietly picking one. A month and a year are averages of the
                Gregorian calendar. Mach depends on air temperature, so the sea-level ICAO Standard
                Atmosphere value is used. A gallon, a cup and a tablespoon differ between the US,
                imperial and metric systems, so each is a separate unit with its system in its name.
              </p>
              <p>
                Some conversions are refused outright because they are not unit conversions at all.
                Candela, lumen and lux measure three different quantities; converting between them
                needs a solid angle or an area. Gray and sievert share a dimension but require a
                radiation weighting factor. Rather than invent a factor, the converter keeps these
                in separate categories and explains why.
              </p>
            </Prose>
          </Section>

          <Section title="Privacy and cost">
            <Prose>
              <p>
                No account, no tracking cookies, and nothing you type is sent anywhere — every
                conversion runs in your browser. Favourites, recent conversions and your theme
                choice are stored on your own device and never leave it. See the{' '}
                <Link href="/privacy">privacy page</Link> for details.
              </p>
            </Prose>
          </Section>
        </div>
      </div>
    </div>
  );
}
