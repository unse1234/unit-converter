import { convertUnits } from '@/domain/conversion/engine';
import { formatNumber, unitLabel } from '@/domain/conversion/format';
import type { UnitDefinition } from '@/types/units';
import {
  CONVERSION_PRECISION_NOTE,
  displayRelation,
  getConversionGuidance,
  type ConversionSource,
} from './conversion-guidance';
import { buildFormula, isReciprocal, type ConversionFormula } from './formula';
import { pairPhrase } from './labels';

export interface ConversionTableRow {
  from: number;
  fromLabel: string;
  toLabel: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface ConversionContent {
  statement: string;
  reverseStatement: string;
  formula: ConversionFormula | null;
  intro: string;
  table: ConversionTableRow[];
  faqs: FaqItem[];
  notes: string[];
  precisionNote: string;
  sources: ConversionSource[];
}

const TABLE_VALUES: Record<string, number[]> = {
  temperature: [-40, -20, -10, 0, 10, 20, 25, 30, 37, 50, 100],
  time: [1, 2, 5, 10, 15, 30, 60, 90, 120],
  angle: [1, 5, 10, 30, 45, 60, 90, 180, 360],
  'digital-storage': [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024],
  'data-transfer-rate': [1, 5, 10, 25, 50, 100, 250, 500, 1000],
};
const DEFAULT_TABLE_VALUES = [1, 2, 3, 4, 5, 10, 20, 25, 50, 100, 250, 500, 1000];

function tableValues(from: UnitDefinition): number[] {
  if (from.category === 'fuel-economy') {
    return isReciprocal(from)
      ? [3, 4, 5, 6, 7, 8, 9, 10, 12, 15]
      : [10, 15, 20, 25, 30, 35, 40, 50, 60];
  }
  return TABLE_VALUES[from.category] ?? DEFAULT_TABLE_VALUES;
}

/** A numeric relationship, using ≈ when the displayed result is rounded. */
export function exactStatement(
  from: UnitDefinition,
  to: UnitDefinition,
  value = 1,
  digits = 9,
): string | null {
  const result = convertUnits(value, from, to);
  if (!result.ok) return null;
  return `${formatNumber(value)} ${unitLabel(value, from)} ${displayRelation(result.value, digits)} ${formatNumber(
    result.value,
    {
      significantDigits: digits,
    },
  )} ${unitLabel(result.value, to)}`;
}

/** Add a question only for a distinction not already answered by the formula/table. */
function temperatureDifference(from: UnitDefinition, to: UnitDefinition): FaqItem[] {
  if (from.category !== 'temperature') return [];
  const ratio = (from.factor ?? 1) / (to.factor ?? 1);
  return [
    {
      question: `Is a change of 1 ${from.symbol} the same as a change of 1 ${to.symbol}?`,
      answer:
        Math.abs(ratio - 1) < 1e-12
          ? `Yes. A change of 1 ${from.symbol} is a change of 1 ${to.symbol}. Their degree sizes are equal; their zero points differ.`
          : `No. A change of 1 ${from.symbol} is a change of ${formatNumber(ratio)} ${to.symbol}. Apply only the scale factor to a temperature difference; the offset applies to temperature readings.`,
    },
  ];
}

export function buildConversionContent(
  from: UnitDefinition,
  to: UnitDefinition,
): ConversionContent {
  const formula = buildFormula(from, to);
  const guidance = getConversionGuidance(from, to);
  const proportional = from.conversionType === 'linear' && to.conversionType === 'linear';
  const table: ConversionTableRow[] = [];
  for (const value of tableValues(from)) {
    const result = convertUnits(value, from, to);
    if (result.ok)
      table.push({
        from: value,
        fromLabel: formatNumber(value),
        toLabel: formatNumber(result.value, { significantDigits: 8 }),
      });
  }

  // Offset and reciprocal pairs lead with arithmetic, not a misleading 1-unit ratio.
  const statement = proportional ? exactStatement(from, to) : formula?.expression;
  const reverseStatement = proportional
    ? exactStatement(to, from)
    : buildFormula(to, from)?.expression;
  return {
    statement: statement ?? pairPhrase(from, to),
    reverseStatement: reverseStatement ?? pairPhrase(to, from),
    formula,
    intro: guidance.guidance[0] ?? '',
    table,
    faqs: temperatureDifference(from, to),
    notes: [
      ...new Set(
        [from.note, to.note, ...guidance.guidance.slice(1)].filter((note): note is string =>
          Boolean(note),
        ),
      ),
    ],
    precisionNote: CONVERSION_PRECISION_NOTE,
    sources: guidance.sources,
  };
}
