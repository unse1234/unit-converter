import type { FaqItem } from '@/lib/seo/conversion-content';

/**
 * FAQ list.
 *
 * Plain headings and paragraphs rather than an accordion. The answers are page
 * content, visible without interaction and indexed as ordinary text, and a
 * heading placed inside a <summary> loses its heading role because summary
 * children are presentational — screen reader users could no longer jump
 * between questions.
 */
export function FaqList({ items }: { items: FaqItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.question} className="bg-surface shadow-border rounded-xl px-4 py-3">
          <h3 className="text-base font-medium">{item.question}</h3>
          <p className="text-fg-secondary mt-1.5 text-sm leading-relaxed">{item.answer}</p>
        </div>
      ))}
    </div>
  );
}
