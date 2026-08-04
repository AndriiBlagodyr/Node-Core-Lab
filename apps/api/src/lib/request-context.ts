/**
 * Foundation: AsyncLocalStorage request context (same idea as lab 06).
 *
 * IMPLEMENT:
 * - Store `{ requestId, ... }` in ALS.
 * - Enter store in request-id plugin; read from logger / services via `getRequestContext()`.
 *
 * @see apps/api/labs/06-async-local-storage.ts
 */

import { AsyncLocalStorage } from "node:async_hooks";

export type RequestContext = {
  requestId: string;
};

export const requestContext = new AsyncLocalStorage<RequestContext>();

export function getRequestContext(): RequestContext | undefined {
  return requestContext.getStore();
}

export function runWithRequestContext<T>(
  ctx: RequestContext,
  fn: () => T,
): T {
  return requestContext.run(ctx, fn);
}
