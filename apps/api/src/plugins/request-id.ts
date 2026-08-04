/**
 * Foundation: requestId plugin.
 *
 * IMPLEMENT:
 * - Read incoming `x-request-id` or generate UUID.
 * - Set response header `x-request-id`.
 * - Enter AsyncLocalStorage via runWithRequestContext.
 * - Bind requestId on the Pino child logger for the request.
 *
 * Register as a Fastify plugin with encapsulation in mind.
 */

import type { FastifyPluginAsync } from "fastify";

export const requestIdPlugin: FastifyPluginAsync = async (_app) => {
  // TODO(foundation): implement request id + ALS propagation
  throw new Error("TODO(foundation): implement plugins/request-id.ts");
};
