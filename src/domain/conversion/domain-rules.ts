/**
 * Physical constraints that a value must satisfy to be meaningful.
 *
 * These run on the value once it has been expressed in the category base unit,
 * so a single rule covers every unit in the category. The engine reports a
 * violation as an error rather than returning a number that looks plausible.
 */
export interface DomainRule {
  /** Lowest valid value in base units, inclusive. */
  minBase?: number;
  /** Values that cannot be converted at all, e.g. zero for inverse units. */
  disallowZero?: boolean;
  /** Message shown when the rule is violated. Must be user-safe. */
  message: string;
}

const rules: Record<string, DomainRule> = {
  temperature: {
    minBase: 0,
    message: 'Temperatures below absolute zero (−273.15 °C, −459.67 °F, 0 K) do not exist.',
  },
  'fuel-economy': {
    disallowZero: true,
    message: 'Fuel economy cannot be zero: a vehicle that uses no fuel has no finite economy.',
  },
};

export function getDomainRule(categoryId: string): DomainRule | undefined {
  return rules[categoryId];
}
