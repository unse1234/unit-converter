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
                English pages with conversion formulas, worked examples and a reference
                table. Conversion happens as you type — there is no button to press and nothing to
                wait for.
              </p>
            </Prose>
          </Section>

          <Section title="Where the numbers come from">
            <Prose>
              <p>
                Category and conversion pages link the definitions and conventions used for their
                units. References include the{' '}
                <a href="https://www.bipm.org/en/publications/si-brochure">BIPM SI Brochure</a>,{' '}
                <a href="https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors">NIST Special Publication 811</a>{' '}
                for customary factors, and{' '}
                <a href="https://physics.nist.gov/cuu/Units/binary.html">NIST guidance on binary prefixes</a>{' '}
                for digital units.
              </p>
              <p>
                Most of these are definitions, not measurements. An inch is exactly 2.54 centimetres
                and a pound is exactly 0.45359237 kilograms. Other values are conventional or
                approximate, such as Mach at a stated atmospheric condition and measured atomic
                mass. Calculations use JavaScript floating point arithmetic, which has finite
                precision. Displayed formulas and results may be rounded; the precision control
                changes the displayed result without changing the underlying calculation.
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
                Free to use, with no account and nothing to install. Nothing you type is sent
                anywhere — every conversion runs in your browser — and your favourites, recent
                conversions and theme choice are stored on your own device and never leave it.
                Advertising and analytics from Google keep the site running and do set cookies; the{' '}
                <Link href="/privacy-policy">privacy policy</Link> explains exactly what they
                collect and how to opt out.
              </p>
            </Prose>
          </Section>
        </div>
      </div>
    </div>
  );
}
