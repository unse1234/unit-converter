import { describe, expect, it } from 'vitest';
import { getAllConversionPairs } from '@/domain/conversion/pairs';
import { convertUnits } from '@/domain/conversion/engine';
import { formatNumber } from '@/domain/conversion/format';
import { getCategories, requireUnit } from '@/domain/units/registry';
import { buildConversionContent } from '@/lib/seo/conversion-content';
import { displayRelation, getCategoryGuidance } from '@/lib/seo/conversion-guidance';

describe('reviewed content coverage', () => {
  it('covers every category with useful assumptions and primary references', () => {
    expect(getCategories()).toHaveLength(34);
    for (const category of getCategories()) {
      const guidance = getCategoryGuidance(category.id);
      expect(guidance.guidance.length, category.id).toBeGreaterThan(0);
      expect(guidance.sources.length, category.id).toBeGreaterThan(0);
      for (const source of guidance.sources) {
        expect(source.url).toMatch(
          /^https:\/\/(www\.bipm\.org|www\.nist\.gov|physics\.nist\.gov)\//,
        );
      }
    }
  });

  it('keeps tables, worked arithmetic and formulas usable throughout the generated pair inventory', () => {
    for (const pair of getAllConversionPairs()) {
      const from = requireUnit(pair.fromUnitId);
      const to = requireUnit(pair.toUnitId);
      const content = buildConversionContent(from, to);
      expect(content.table.length, pair.path).toBeGreaterThan(0);
      expect(content.formula, pair.path).not.toBeNull();
      expect(content.formula?.expression, pair.path).not.toMatch(/\b0\/\d/);
      expect(content.sources.length, pair.path).toBeGreaterThan(0);
      for (const row of content.table) {
        const converted = convertUnits(row.from, from, to);
        expect(converted.ok, pair.path).toBe(true);
        if (converted.ok)
          expect(row.toLabel).toBe(formatNumber(converted.value, { significantDigits: 8 }));
      }
      // Evaluate the displayed arithmetic independently of formula construction.
      // All expressions are generated from trusted numeric catalog data.
      const expression = content.formula?.expression.split(' = ')[1];
      expect(expression, pair.path).toBeTruthy();
      if (!expression) continue;
      const arithmetic = expression
        .replace(from.symbol, '(25)')
        .replaceAll('×', '*')
        .replaceAll('÷', '/')
        .replaceAll('−', '-');
      expect(arithmetic, pair.path).toMatch(/^[\d\s.eE+\-*/()]+$/);
      const displayed = new Function(`return (${arithmetic});`)() as number;
      const converted = convertUnits(25, from, to);
      if (converted.ok && converted.value !== 0) {
        expect(Math.abs(displayed / converted.value - 1), pair.path).toBeLessThan(1e-8);
      }
    }
  });

  it('does not confuse binary arithmetic noise with meaningful display rounding', () => {
    expect(displayRelation(0.3048)).toBe('=');
    expect(displayRelation(0.30000000000000004)).toBe('=');
    expect(displayRelation(1 / 0.3048)).toBe('≈');
    expect(displayRelation(1.602176634e-19, 6)).toBe('≈');
  });
});
