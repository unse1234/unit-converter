import { NotFoundContent } from '@/components/content/NotFoundContent';

/**
 * Rendered when a page inside the English site calls notFound(). Unmatched
 * URLs anywhere on the site are handled by app/global-not-found.tsx, which
 * shows the same content.
 */
export default function NotFound() {
  return <NotFoundContent />;
}
