/**
 * Renders a JSON-LD block.
 *
 * The payload is always built by lib/seo/structured-data.ts from values the
 * page itself renders, never from user input, so this is not an injection
 * surface. `<` is still escaped so a string value can never close the script
 * tag early.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
