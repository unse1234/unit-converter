import type { ConversionSource } from '@/lib/seo/conversion-guidance';

/** Server-rendered references, kept beside the definitions they support. */
export function ConversionSources({ sources }: { sources: ConversionSource[] }) {
  return (
    <ul className="space-y-2 text-sm">
      {sources.map((source) => (
        <li key={source.url}>
          <a href={source.url} className="text-accent underline underline-offset-2">
            {source.title}
          </a>
        </li>
      ))}
    </ul>
  );
}
