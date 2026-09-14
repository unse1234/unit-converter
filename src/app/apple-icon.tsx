import { ImageResponse } from 'next/og';

/**
 * Home-screen icon for iOS, which does not accept SVG. Drawn with the same
 * swap glyph as icon.svg and generated as a static PNG at build time.
 */
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#171717',
      }}
    >
      <svg
        width="112"
        height="112"
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
    </div>,
    size,
  );
}
