import { ImageResponse } from 'next/og';
import { getCategories } from '@/domain/units/registry';

/**
 * Social sharing image, generated once at build time and inherited by every
 * page that does not provide its own. Built from the design tokens rather than
 * a stored bitmap, so it stays in step with the product.
 */
export const alt = 'Unit Converter — exact conversions with formulas and reference tables';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  const categoryCount = getCategories().length;

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '80px',
        background: '#fafafa',
        color: '#171717',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '16px',
            background: '#171717',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            width="44"
            height="44"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fafafa"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 4v16m0 0-3.5-3.5M7 20l3.5-3.5" />
            <path d="M17 20V4m0 0-3.5 3.5M17 4l3.5 3.5" />
          </svg>
        </div>
        <div style={{ fontSize: '40px' }}>Unit Converter</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: '80px', letterSpacing: '-0.04em', lineHeight: 1.05 }}>
          Convert any unit, instantly.
        </div>
        <div style={{ fontSize: '34px', color: '#4d4d4d', marginTop: '28px' }}>
          {`Exact factors, formulas and reference tables across ${categoryCount} categories.`}
        </div>
      </div>
    </div>,
    size,
  );
}
