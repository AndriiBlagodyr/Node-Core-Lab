/**
 * Foundation: OpenAPI / Swagger from route schemas.
 *
 * IMPLEMENT:
 * - @fastify/swagger + @fastify/swagger-ui (or equivalent).
 * - Generate docs from Zod/JSON Schema on routes.
 * - Serve UI at /docs (dev only or protected later).
 */

import type { FastifyPluginAsync } from "fastify";

export const swaggerPlugin: FastifyPluginAsync = async (_app) => {
  // TODO(foundation): register swagger + swagger-ui
  throw new Error("TODO(foundation): implement plugins/swagger.ts");
};
