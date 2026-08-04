/**
 * Foundation: route registration plugin (encapsulation boundary).
 *
 * IMPLEMENT:
 * - `app.register(healthRoutes)`
 * - Later modules register under versioned prefixes (e.g. /v1/auth) here or as child plugins.
 * - Do not put business logic in this file — only composition.
 */

import type { FastifyPluginAsync } from "fastify";

export const routesPlugin: FastifyPluginAsync = async (_app) => {
  // TODO(foundation): await app.register(healthRoutes)
  throw new Error("TODO(foundation): implement routes/index.ts");
};
