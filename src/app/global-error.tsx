'use client';

/**
 * Last-resort error boundary, used when the root layout itself fails.
 *
 * It must render its own <html> and <body>, and it cannot rely on the design
 * system or the theme provider — those are exactly what may have failed — so
 * the few styles it needs are inline.
 */
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100dvh',
          display: 'grid',
          placeItems: 'center',
          padding: '2rem',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          background: '#fafafa',
          color: '#171717',
        }}
      >
        <main style={{ maxWidth: '32rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 600, letterSpacing: '-0.03em', margin: 0 }}>
            Something went wrong
          </h1>
          <p style={{ marginTop: '1rem', lineHeight: 1.6, color: '#4d4d4d' }}>
            The page could not be loaded. Please reload, or return to the homepage.
          </p>
          {/*
            This boundary catches failures in the root layout itself, which is
            where the router lives. A plain anchor triggers a full document load
            and is the only navigation guaranteed to work here, so next/link is
            deliberately not used.
          */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/"
            style={{
              display: 'inline-block',
              marginTop: '1.5rem',
              padding: '0.75rem 1.25rem',
              borderRadius: '6px',
              background: '#171717',
              color: '#fafafa',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            Go to the converter
          </a>
          {error.digest ? (
            <p style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: '#8f8f8f' }}>
              Reference: {error.digest}
            </p>
          ) : null}
        </main>
      </body>
    </html>
  );
}
