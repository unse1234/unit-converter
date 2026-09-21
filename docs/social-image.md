# Social sharing image and icons

`public/opengraph-image.png` (1200×630) and `public/apple-icon.png` (180×180) are
committed binary files, not generated at build time.

## Why they are not generated

Next can generate them from `app/opengraph-image.tsx` with `next/og`. Under
`output: 'export'` that route is written to `out/opengraph-image` — **with no
file extension**. Cloudflare Pages picks a content type from the extension, so
the file is served as something other than `image/png` and social scrapers
(Facebook, X, Slack, LinkedIn) reject it. The referenced URL also carries a
cache-busting query string, which some scrapers mishandle.

A committed `.png` has none of that ambiguity, and it removes two image
renders from every build.

## Regenerating them

They were produced by a `next/og` route whose source is preserved below.
To redraw them:

1. Save the source as `src/app/opengraph-image.tsx`.
2. Add `export const dynamic = 'force-static';` at the top, or the export build
   refuses to prerender it.
3. Run `npm run build`.
4. Copy the result: `cp out/opengraph-image public/opengraph-image.png`.
5. Delete `src/app/opengraph-image.tsx` again.

Do not leave the route in place alongside the public file — the route wins and
reintroduces the extensionless output.

### opengraph-image source

```tsx
import { ImageResponse } from 'next/og';
import { getCategories } from '@/domain/units/registry';
import { siteConfig } from '@/lib/site';

export const dynamic = 'force-static';
export const alt = `${siteConfig.name} — free online unit converter with formulas and reference tables`;
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
        <div style={{ fontSize: '40px', fontWeight: 600 }}>{siteConfig.name}</div>
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
```

### apple-icon source

```tsx
import { ImageResponse } from 'next/og';

export const dynamic = 'force-static';
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
```

## Note on the baked-in category count

The sharing image reads "across 34 categories". That number is frozen into the
PNG. If categories are added or removed, regenerate the image or the claim goes
stale — nothing in the build will warn you.
