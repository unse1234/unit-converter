/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getConversionPairs } from '@/domain/conversion/pairs';
import { getUnitsByCategory } from '@/domain/units/registry';

/*
 * The converter reads query parameters through next/navigation. Outside a Next
 * app there is no router, so the hook is replaced with a controllable stand-in.
 */
let currentSearch = '';
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(currentSearch),
}));

const { Converter } = await import('@/components/converter/Converter');

const lengthUnits = getUnitsByCategory('length');
const lengthPairSlugs = getConversionPairs('length').map((pair) => pair.slug);

function renderLength(props: Partial<Parameters<typeof Converter>[0]> = {}) {
  return render(
    <Converter
      units={lengthUnits}
      categoryId="length"
      categorySlug="length"
      initialFrom="meter"
      initialTo="foot"
      pairSlugs={lengthPairSlugs}
      {...props}
    />,
  );
}

/** The visible result text, e.g. "3.28084ft". */
function resultText(): string {
  return screen.getByTestId('result').textContent ?? '';
}

function valueInput(): HTMLInputElement {
  return screen.getByLabelText(/^Value in/) as HTMLInputElement;
}

beforeEach(() => {
  currentSearch = '';
  window.localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('converter workflow', () => {
  it('shows a result immediately, with no convert button', () => {
    renderLength();
    expect(resultText()).toContain('3.28084');
    expect(screen.queryByRole('button', { name: /^convert$/i })).toBeNull();
  });

  it('updates the result on every keystroke', async () => {
    const user = userEvent.setup();
    renderLength();

    await user.clear(valueInput());
    await user.type(valueInput(), '10');
    expect(resultText()).toContain('32.8084');
  });

  it('accepts negative values, decimals and scientific notation', async () => {
    const user = userEvent.setup();
    renderLength();

    await user.clear(valueInput());
    await user.type(valueInput(), '-2.5');
    expect(resultText()).toContain('-8.2021');

    await user.clear(valueInput());
    await user.type(valueInput(), '1e3');
    expect(resultText()).toContain('3,280.84');
  });

  it('shows an inline error for malformed input and no stale result', async () => {
    const user = userEvent.setup();
    renderLength();

    await user.clear(valueInput());
    await user.type(valueInput(), 'abc');

    expect(screen.getByRole('alert')).toHaveTextContent(/not a number/i);
    expect(valueInput()).toHaveAttribute('aria-invalid', 'true');
    expect(resultText()).not.toContain('3.28084');
  });

  it('treats an empty field as blank rather than as an error', async () => {
    const user = userEvent.setup();
    renderLength();

    await user.clear(valueInput());
    expect(screen.queryByRole('alert')).toBeNull();
    expect(resultText()).toBe('—');
  });

  it('clears the value with the Clear button', async () => {
    const user = userEvent.setup();
    renderLength();

    await user.click(screen.getByRole('button', { name: 'Clear' }));
    expect(valueInput().value).toBe('');
  });
});

describe('unit selection', () => {
  it('filters units by alias and selects with the keyboard', async () => {
    const user = userEvent.setup();
    renderLength();

    await user.click(screen.getByRole('button', { name: /^To/ }));
    const filter = screen.getByRole('combobox', { name: /search to units/i });
    await user.type(filter, 'inches');
    await user.keyboard('{Enter}');

    expect(screen.getByRole('button', { name: /^To inch/ })).toBeInTheDocument();
    expect(resultText()).toContain('39.3701');
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    renderLength();

    const trigger = screen.getByRole('button', { name: /^From/ });
    await user.click(trigger);
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(trigger).toHaveFocus();
  });

  it('swaps sides instead of converting a unit to itself', async () => {
    const user = userEvent.setup();
    renderLength();

    await user.click(screen.getByRole('button', { name: /^From/ }));
    // Named: the Digits <select> also has the combobox role.
    await user.type(screen.getByRole('combobox', { name: /search from units/i }), 'feet');
    await user.keyboard('{Enter}');

    expect(screen.getByRole('button', { name: /^From foot/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^To meter/ })).toBeInTheDocument();
  });

  it('offers a link to the page for a pair that has one', async () => {
    const user = userEvent.setup();
    renderLength({ pagePair: { from: 'meter', to: 'foot' } });

    // On the meters-to-feet page itself, no link back to the same page.
    expect(screen.queryByRole('link', { name: /formula and table/i })).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Swap units' }));
    expect(
      screen.getByRole('link', { name: /formula and table for feet to meters/i }),
    ).toHaveAttribute('href', '/length/feet-to-meters');
  });
});

describe('swap', () => {
  it('exchanges the units and keeps the typed value', async () => {
    const user = userEvent.setup();
    renderLength();

    await user.clear(valueInput());
    await user.type(valueInput(), '5');
    await user.click(screen.getByRole('button', { name: 'Swap units' }));

    expect(valueInput().value).toBe('5');
    expect(screen.getByRole('button', { name: /^From foot/ })).toBeInTheDocument();
    expect(resultText()).toContain('1.524');
  });

  it('round-trips without accumulating rounding error', async () => {
    const user = userEvent.setup();
    renderLength();

    const swap = screen.getByRole('button', { name: 'Swap units' });
    for (let i = 0; i < 6; i += 1) await user.click(swap);

    expect(valueInput().value).toBe('1');
    expect(resultText()).toContain('3.28084');
  });
});

describe('copy', () => {
  it('copies the plain result and confirms it', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });

    renderLength();
    await user.click(screen.getByRole('button', { name: /copy result/i }));

    expect(writeText).toHaveBeenCalledWith('3.28084');
    expect(await screen.findByText('Copied')).toBeInTheDocument();
  });

  it('tells the user when copying fails', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockRejectedValue(new Error('denied'));
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });

    renderLength();
    await user.click(screen.getByRole('button', { name: /copy result/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/could not copy/i);
  });
});

describe('precision', () => {
  it('changes the displayed digits without changing the value', async () => {
    const user = userEvent.setup();
    renderLength();

    await user.selectOptions(screen.getByLabelText('Digits'), '10');
    expect(resultText()).toContain('3.280839895');

    await user.selectOptions(screen.getByLabelText('Digits'), '2');
    expect(resultText()).toContain('3.3');
  });
});

describe('favourites', () => {
  it('saves a conversion, lists it, and removes it', async () => {
    const user = userEvent.setup();
    renderLength();

    const save = screen.getByRole('button', { name: 'Save' });
    expect(save).toHaveAttribute('aria-pressed', 'false');
    await user.click(save);
    expect(save).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('button', { name: /saved & recent/i }));
    const link = screen.getByRole('link', { name: 'Meters to feet' });
    expect(link).toHaveAttribute('href', '/length/meters-to-feet');

    await user.click(screen.getByRole('button', { name: 'Remove meters to feet from saved' }));
    expect(screen.queryByRole('link', { name: 'Meters to feet' })).toBeNull();
    expect(save).toHaveAttribute('aria-pressed', 'false');
  });

  it('persists across a remount', async () => {
    const user = userEvent.setup();
    const first = renderLength();
    await user.click(screen.getByRole('button', { name: 'Save' }));
    first.unmount();

    renderLength();
    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('recent conversions', () => {
  it('records a conversion only after the user interacts', () => {
    vi.useFakeTimers();
    renderLength();

    act(() => vi.advanceTimersByTime(2000));
    expect(window.localStorage.getItem('uc:history')).toBeNull();

    fireEvent.change(valueInput(), { target: { value: '25' } });
    act(() => vi.advanceTimersByTime(1000));

    const stored = JSON.parse(window.localStorage.getItem('uc:history') ?? '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({
      label: '25 meters to feet',
      href: '/length/meters-to-feet?value=25',
    });
  });

  it('keeps one entry per unit pair', () => {
    vi.useFakeTimers();
    renderLength();

    for (const value of ['2', '3', '4']) {
      fireEvent.change(valueInput(), { target: { value } });
      act(() => vi.advanceTimersByTime(1000));
    }

    const stored = JSON.parse(window.localStorage.getItem('uc:history') ?? '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].value).toBe('4');
  });

  it('can be cleared', async () => {
    window.localStorage.setItem(
      'uc:history',
      JSON.stringify([
        {
          category: 'length',
          from: 'meter',
          to: 'foot',
          value: '5',
          label: '5 meters to feet',
          href: '/length/meters-to-feet?value=5',
          at: 1,
        },
      ]),
    );
    const user = userEvent.setup();
    renderLength();

    await user.click(screen.getByRole('button', { name: /saved & recent/i }));
    const region = screen.getByRole('link', { name: '5 meters to feet' }).closest('section');
    expect(region).not.toBeNull();

    await user.click(within(region as HTMLElement).getByRole('button', { name: 'Clear recent' }));
    expect(screen.queryByRole('link', { name: '5 meters to feet' })).toBeNull();
  });
});

describe('URL parameters', () => {
  it('applies from, to and value from the query string', () => {
    currentSearch = 'from=kilometer&to=mile&value=42.195';
    renderLength();

    expect(valueInput().value).toBe('42.195');
    expect(screen.getByRole('button', { name: /^From kilometer/ })).toBeInTheDocument();
    expect(resultText()).toContain('26.2188');
  });

  it('ignores unknown unit ids', () => {
    currentSearch = 'from=not-a-unit&to=kilogram';
    renderLength();

    expect(screen.getByRole('button', { name: /^From meter/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^To foot/ })).toBeInTheDocument();
  });

  it('avoids a unit-to-itself pair when only one side is given', () => {
    currentSearch = 'from=foot';
    renderLength();

    expect(screen.getByRole('button', { name: /^From foot/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^To meter/ })).toBeInTheDocument();
  });
});

describe('domain errors', () => {
  it('explains a temperature below absolute zero instead of showing a number', async () => {
    const user = userEvent.setup();
    render(
      <Converter
        units={getUnitsByCategory('temperature')}
        categoryId="temperature"
        categorySlug="temperature"
        initialFrom="celsius"
        initialTo="fahrenheit"
        pairSlugs={[]}
      />,
    );

    await user.clear(valueInput());
    await user.type(valueInput(), '-300');
    expect(resultText()).toMatch(/absolute zero/i);
    expect(screen.queryByRole('button', { name: /copy result/i })).toBeNull();
  });
});
