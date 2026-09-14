import type { ConversionTableRow } from '@/lib/seo/conversion-content';
import { capitalize } from '@/lib/text';
import type { UnitDefinition } from '@/types/units';

/**
 * Reference conversion table.
 *
 * Wrapped in its own horizontally scrollable container so a wide table never
 * makes the page itself scroll sideways on a phone — the rule from
 * PROJECT_REQUIREMENTS §9 that no horizontal overflow occurs in normal use.
 */
export function ConversionTable({
  rows,
  from,
  to,
}: {
  rows: ConversionTableRow[];
  from: UnitDefinition;
  to: UnitDefinition;
}) {
  if (rows.length === 0) return null;

  const heading = (unit: UnitDefinition) =>
    `${capitalize(unit.pluralName)}${unit.symbol ? ` (${unit.symbol})` : ''}`;

  return (
    <div className="bg-surface shadow-border overflow-x-auto rounded-xl">
      <table className="w-full border-collapse text-sm">
        <caption className="sr-only">
          {capitalize(from.pluralName)} converted to {to.pluralName}
        </caption>
        <thead>
          <tr className="shadow-[0_1px_0_0_var(--ds-border)]">
            <th scope="col" className="text-fg-subtle px-4 py-3 text-left font-medium">
              {heading(from)}
            </th>
            <th scope="col" className="text-fg-subtle px-4 py-3 text-left font-medium">
              {heading(to)}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.from} className="shadow-[0_1px_0_0_var(--ds-border)] last:shadow-none">
              <th
                scope="row"
                className="text-fg-secondary numeric px-4 py-2.5 text-left font-normal"
              >
                {row.fromLabel}
              </th>
              <td className="text-fg numeric px-4 py-2.5 font-medium">{row.toLabel}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
