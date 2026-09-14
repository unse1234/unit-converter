import { convertUnits } from '@/domain/conversion/engine';
import { formatNumber } from '@/domain/conversion/format';
import { requireUnit } from '@/domain/units/registry';
import type { UnitDefinition } from '@/types/units';

const SYSTEM_LABELS: Record<string, string> = {
  si: 'SI',
  metric: 'Metric',
  imperial: 'Imperial',
  us: 'US customary',
  binary: 'Binary (IEC)',
  astronomical: 'Astronomical',
  cgs: 'CGS',
  other: 'Other',
};

/**
 * Reference table of every unit in a category.
 *
 * Gives the category page substance beyond a link list: each row states the
 * unit's symbol, system, and exact value in the category's base unit, which is
 * the fact a reader is usually after when they land on a category rather than
 * a specific conversion.
 */
export function UnitReference({ units }: { units: UnitDefinition[] }) {
  const first = units[0];
  if (!first) return null;

  const base = requireUnit(first.baseUnit);

  return (
    <div className="bg-surface shadow-border overflow-x-auto rounded-xl">
      <table className="w-full border-collapse text-sm">
        <caption className="sr-only">
          Units with their symbols, systems and value in {base.pluralName}
        </caption>
        <thead>
          <tr className="shadow-[0_1px_0_0_var(--ds-border)]">
            <th scope="col" className="text-fg-subtle px-4 py-3 text-left font-medium">
              Unit
            </th>
            <th scope="col" className="text-fg-subtle px-4 py-3 text-left font-medium">
              Symbol
            </th>
            <th
              scope="col"
              className="text-fg-subtle hidden px-4 py-3 text-left font-medium sm:table-cell"
            >
              System
            </th>
            <th scope="col" className="text-fg-subtle px-4 py-3 text-left font-medium">
              1 unit in {base.symbol || base.pluralName}
            </th>
          </tr>
        </thead>
        <tbody>
          {units.map((unit) => {
            const inBase = convertUnits(1, unit, base);
            return (
              <tr key={unit.id} className="shadow-[0_1px_0_0_var(--ds-border)] last:shadow-none">
                <th scope="row" className="text-fg px-4 py-2.5 text-left font-medium">
                  {unit.name}
                </th>
                <td className="text-fg-secondary px-4 py-2.5">{unit.symbol || '—'}</td>
                <td className="text-fg-subtle hidden px-4 py-2.5 sm:table-cell">
                  {SYSTEM_LABELS[unit.system] ?? unit.system}
                </td>
                <td className="text-fg-secondary numeric px-4 py-2.5">
                  {inBase.ok ? formatNumber(inBase.value, { significantDigits: 8 }) : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
