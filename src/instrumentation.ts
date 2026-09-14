import type { Instrumentation } from 'next';
import { reportError } from '@/lib/monitoring';

/**
 * Server-side error hook.
 *
 * Next calls this for errors thrown while rendering a page, a route handler or
 * a server action. Routing every one through reportError keeps monitoring in a
 * single place.
 */
export const onRequestError: Instrumentation.onRequestError = (error, request, context) => {
  reportError(error, {
    method: request.method,
    path: request.path,
    routePath: context.routePath,
    routeType: context.routeType,
  });
};
