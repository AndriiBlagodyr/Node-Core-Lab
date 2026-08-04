/**
 * Foundation: build the Fastify application (no listen here).
 *
 * IMPLEMENT:
 * 1. Create Fastify with Pino logger + redaction paths.
 * 2. Register Zod type provider / validator compiler.
 * 3. Register plugins: request-id, error-handler, swagger (order matters).
 * 4. Register routesPlugin.
 * 5. Optionally decorate app with db/redis once infrastructure exists.
 *
 * Keep listen()/signals in server.ts so tests can inject(app) without binding a port.
 */

import type { FastifyInstance } from "fastify";

export async function buildApp(): Promise<FastifyInstance> {
  // TODO(foundation): create Fastify, configure logger, register plugins + routes
  throw new Error("TODO(foundation): implement src/app.ts");
}
