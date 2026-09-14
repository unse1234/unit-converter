'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { reportError } from '@/lib/monitoring';
import { Button } from '@/components/ui/Button';

/**
 * Route-level error boundary.
 *
 * Shows a plain, actionable message. The error's own text and stack are never
 * rendered: they leak implementation detail to users and describe the
 * internals to an attacker (ARCHITECTURE.md §13). The digest is shown because
 * it is a safe, opaque id a support conversation can refer to.
 */
export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error, { boundary: 'route', digest: error.digest });
  }, [error]);

  return (
    <div className="page-shell py-16">
      <div className="mx-auto max-w-xl text-center">
        <h1>Something went wrong</h1>
        <p className="text-fg-secondary mt-4 text-lg">
          This page failed to load. Try again, or start from the homepage.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button variant="primary" size="lg" onClick={reset}>
            Try again
          </Button>
          <Link
            href="/"
            className="bg-surface shadow-border hover:bg-hover inline-flex h-12 items-center rounded-md px-5 text-sm font-medium transition-colors"
          >
            Go to the converter
          </Link>
        </div>
        {error.digest ? (
          <p className="text-fg-subtle mt-6 font-mono text-xs">Reference: {error.digest}</p>
        ) : null}
      </div>
    </div>
  );
}
