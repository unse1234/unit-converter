import { convertUnits } from '@/domain/conversion/engine';
import { formatNumber, unitLabel } from '@/domain/conversion/format';
import { getUnit } from '@/domain/units/registry';
import { capitalize, withArticle } from '@/lib/text';
import type { UnitDefinition } from '@/types/units';
import { buildFormula, isReciprocal, type ConversionFormula } from './formula';
import { pairPhrase, unitHeadingName } from './labels';

/**
 * Page content generated from the conversion data.
 *
 * SEO_SPEC §13 draws the line clearly: a programmatic page must not be a
 * template with the unit names substituted. Everything below is computed from
 * the pair itself — the exact relationship, the formula, the table values, the
 * answers in the FAQ — so two pages differ in substance, not just wording.
 *
 * Where a page has nothing genuine to add, it adds nothing. Questions are only
 * asked when the data answers them truthfully: "how many X are in a Y" is only
 * meaningful for proportional units, so temperature pages ask about reference
 * temperatures instead, and no question is invented to fill space.
 */

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
  /** Lead statement: "1 meter = 3.2808399 feet", or the formula for non-proportional pairs. */
  statement: string;
  /** The same relationship the other way round. */
  reverseStatement: string;
  formula: ConversionFormula | null;
  /** Opening paragraph, specific to this pair. */
  intro: string;
  table: ConversionTableRow[];
  faqs: FaqItem[];
  /** Disclosure notes carried by either unit, shown verbatim. */
  notes: string[];
}

/**
 * Sample values for the conversion table, chosen per category so the table
 * shows quantities people actually deal in.
 */
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
    // Consumption figures (L/100 km) and economy figures (mpg, km/L) live in
    // different ranges; a table of 4 mpg would be as unhelpful as 60 L/100 km.
    return isReciprocal(from)
      ? [3, 4, 5, 6, 7, 8, 9, 10, 12, 15]
      : [10, 15, 20, 25, 30, 35, 40, 50, 60];
  }
  return TABLE_VALUES[from.category] ?? DEFAULT_TABLE_VALUES;
}

/** True when "1 A = n B" fully describes the pair. */
function isProportional(from: UnitDefinition, to: UnitDefinition): boolean {
  return from.conversionType === 'linear' && to.conversionType === 'linear';
}

/** "1 meter = 3.2808399 feet", or null when the conversion fails. */
export function exactStatement(
  from: UnitDefinition,
  to: UnitDefinition,
  value = 1,
  digits = 9,
): string | null {
  const result = convertUnits(value, from, to);
  if (!result.ok) return null;

  return `${formatNumber(value)} ${unitLabel(value, from)} = ${formatNumber(result.value, {
    significantDigits: digits,
  })} ${unitLabel(result.value, to)}`;
}

/** A measurement system's name as it reads in a sentence. */
function systemName(unit: UnitDefinition): string | null {
  switch (unit.system) {
    case 'us':
      return 'US customary';
    case 'imperial':
      return 'imperial';
    case 'si':
    case 'metric':
      return 'metric';
    case 'binary':
      return 'binary (IEC)';
    default:
      return null;
  }
}

/** A temperature given in Celsius, expressed in another temperature unit: "32 °F". */
function inTemperatureUnit(celsius: number, unit: UnitDefinition): string | null {
  const reference = getUnit('celsius');
  if (!reference) return null;
  const result = convertUnits(celsius, reference, unit);
  return result.ok ? `${formatNumber(result.value)} ${unit.symbol}` : null;
}

function buildIntro(from: UnitDefinition, to: UnitDefinition): string {
  const sentences: string[] = [];

  if (isProportional(from, to)) {
    const one = convertUnits(1, from, to);
    if (one.ok) {
      const magnitude = Math.abs(one.value);
      const lead =
        magnitude >= 1000
          ? `A single ${from.name} is worth a great many ${to.pluralName}`
          : `${capitalize(withArticle(from.name))} is the ${magnitude >= 1 ? 'larger' : 'smaller'} unit`;
      sentences.push(
        `${lead}: 1 ${from.name} equals ${formatNumber(one.value, { significantDigits: 9 })} ${unitLabel(one.value, to)}.`,
      );
    }
  } else if (from.category === 'temperature') {
    sentences.push(
      'Temperature scales differ in where they put zero as well as in the size of a degree, so the conversion needs an addition as well as a multiplication. Multiplying alone gives the wrong answer.',
    );
    const freezeFrom = inTemperatureUnit(0, from);
    const freezeTo = inTemperatureUnit(0, to);
    const boilFrom = inTemperatureUnit(100, from);
    const boilTo = inTemperatureUnit(100, to);
    if (freezeFrom && freezeTo && boilFrom && boilTo) {
      sentences.push(
        `Water freezes at ${freezeFrom} (${freezeTo}) and boils at ${boilFrom} (${boilTo}) at standard atmospheric pressure.`,
      );
    }
  } else if (isReciprocal(from) !== isReciprocal(to)) {
    sentences.push(
      `A lower figure in ${from.pluralName} means a higher figure in ${to.pluralName}, because one scale is the reciprocal of the other.`,
    );
  } else {
    sentences.push(
      'Both units express fuel used over a fixed distance, so the conversion is a single multiplication.',
    );
  }

  const fromSystem = systemName(from);
  const toSystem = systemName(to);
  if (fromSystem && toSystem && fromSystem !== toSystem) {
    sentences.push(
      `The ${from.name} is ${withArticle(fromSystem)} unit and the ${to.name} is ${withArticle(toSystem)} unit, so this converts between the two systems.`,
    );
  }

  sentences.push(
    'Type any value into the converter above for an instant answer, or use the formula and table below.',
  );

  return sentences.join(' ');
}

/** Temperatures worth asking about, with what they mean. */
const REFERENCE_TEMPERATURES = [
  { celsius: 0, meaning: 'the freezing point of water' },
  { celsius: 100, meaning: 'the boiling point of water at sea level' },
  { celsius: 37, meaning: 'a commonly quoted normal body temperature' },
];

/** Questions that the data answers truthfully, and no others. */
function buildFaqs(
  from: UnitDefinition,
  to: UnitDefinition,
  formula: ConversionFormula | null,
): FaqItem[] {
  const faqs: FaqItem[] = [];
  const toName = unitHeadingName(to);

  if (isProportional(from, to)) {
    const one = exactStatement(from, to, 1);
    if (one) {
      faqs.push({
        question: `How many ${to.pluralName} are in ${withArticle(from.name)}?`,
        answer: `${one}. To convert any number of ${from.pluralName}, multiply by the same figure.`,
      });
    }
  }

  if (formula) {
    faqs.push({
      question: `How do you convert ${pairPhrase(from, to)}?`,
      answer: `Use ${formula.expression}. ${formula.explanation}`,
    });
  }

  if (from.category === 'temperature') {
    const celsius = getUnit('celsius');
    for (const point of celsius ? REFERENCE_TEMPERATURES : []) {
      const inFrom = convertUnits(point.celsius, celsius as UnitDefinition, from);
      const inTo = convertUnits(point.celsius, celsius as UnitDefinition, to);
      if (!inFrom.ok || !inTo.ok) continue;
      faqs.push({
        question: `What is ${formatNumber(inFrom.value)} ${from.symbol} in ${toName}?`,
        answer: `${formatNumber(inFrom.value)} ${unitLabel(inFrom.value, from)} = ${formatNumber(inTo.value)} ${unitLabel(inTo.value, to)}, ${point.meaning}.`,
      });
    }

    // The offset applies to temperatures, not to differences between them —
    // the most common temperature-conversion mistake.
    const degreeRatio = (from.factor ?? 1) / (to.factor ?? 1);
    faqs.push({
      question: `Is a change of 1 ${from.symbol} the same as a change of 1 ${to.symbol}?`,
      answer:
        Math.abs(degreeRatio - 1) < 1e-12
          ? `Yes. Both scales use degrees of the same size, so a change of 1 ${from.symbol} is a change of 1 ${to.symbol}; only their zero points differ.`
          : `No. A change of 1 ${from.symbol} is a change of ${formatNumber(degreeRatio)} ${to.symbol}. The offset in the formula applies to temperatures, not to the difference between two temperatures.`,
    });
  } else {
    const ten = exactStatement(from, to, 10);
    if (ten) {
      faqs.push({
        question: `What is 10 ${from.pluralName} in ${to.pluralName}?`,
        answer: `${ten}.`,
      });
    }
  }

  if (isProportional(from, to)) {
    const reverse = exactStatement(to, from, 1);
    if (reverse) {
      faqs.push({
        question: `How many ${from.pluralName} are in ${withArticle(to.name)}?`,
        answer: `${reverse}, the same relationship in the other direction.`,
      });
    }
  }

  return faqs;
}

export function buildConversionContent(
  from: UnitDefinition,
  to: UnitDefinition,
): ConversionContent {
  const formula = buildFormula(from, to);
  const proportional = isProportional(from, to);

  const table: ConversionTableRow[] = [];
  for (const value of tableValues(from)) {
    const result = convertUnits(value, from, to);
    if (!result.ok) continue;
    table.push({
      from: value,
      fromLabel: formatNumber(value),
      toLabel: formatNumber(result.value, { significantDigits: 8 }),
    });
  }

  // "1 °C = 33.8 °F" is true but misleading: it invites multiplying by 33.8.
  // Pairs without a single ratio lead with their formula instead.
  const statement = proportional
    ? exactStatement(from, to, 1)
    : (formula?.expression ?? exactStatement(from, to, 1));
  const reverseStatement = proportional
    ? exactStatement(to, from, 1)
    : (buildFormula(to, from)?.expression ?? exactStatement(to, from, 1));

  return {
    statement: statement ?? pairPhrase(from, to),
    reverseStatement: reverseStatement ?? pairPhrase(to, from),
    formula,
    intro: buildIntro(from, to),
    table,
    faqs: buildFaqs(from, to, formula),
    notes: [from.note, to.note].filter((note): note is string => Boolean(note)),
  };
}
