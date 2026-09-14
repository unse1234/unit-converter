'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type CopyStatus = 'idle' | 'copied' | 'error';

/**
 * Copy-to-clipboard with visible success and failure states.
 *
 * The Clipboard API rejects in real situations — an insecure origin, a denied
 * permission, a browser that gates it behind a user gesture — so failure is
 * surfaced to the user rather than swallowed. A fallback using a temporary
 * textarea covers older browsers that lack navigator.clipboard.
 */
export function useCopyToClipboard(resetAfterMs = 2000) {
  const [status, setStatus] = useState<CopyStatus>('idle');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [],
  );

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      let ok = false;
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
          ok = true;
        } else {
          const textarea = document.createElement('textarea');
          textarea.value = text;
          textarea.setAttribute('readonly', '');
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          ok = document.execCommand('copy');
          document.body.removeChild(textarea);
        }
      } catch {
        ok = false;
      }

      setStatus(ok ? 'copied' : 'error');
      timeoutRef.current = setTimeout(() => setStatus('idle'), resetAfterMs);
      return ok;
    },
    [resetAfterMs],
  );

  return { copy, status };
}
