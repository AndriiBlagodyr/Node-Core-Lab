/**
 * Foundation: global error handler.
 *
 * IMPLEMENT:
 * - setErrorHandler that maps AppError → { statusCode, code, message, details? }.
 * - Log operational errors at warn/error with stable `code`; treat unknowns as 500.
 * - Do not leak stack traces or internal messages in production.
 *
 * Prefer registering early so all routes share one mapper.
 */

import type { FastifyPluginAsync } from "fastify";

export const errorHandlerPlugin: FastifyPluginAsync = async (_app) => {
  // TODO(foundation): setErrorHandler using domain/errors AppError
  throw new Error("TODO(foundation): implement plugins/error-handler.ts");
};
