/**
 * Foundation: health / readiness / liveness probes.
 *
 * IMPLEMENT:
 * - GET /live  — process is up (no dependency checks).
 * - GET /ready — DB (and later Redis) connections OK; 503 if not.
 * - GET /health — optional aggregate status for humans/ops.
 *
 * Matches lab 12 and K8s-style probes (backend foundation checklist).
 */

import type { FastifyPluginAsync } from "fastify";

export const healthRoutes: FastifyPluginAsync = async (_app) => {
  // TODO(foundation): register /live, /ready, /health with typed schemas
  throw new Error("TODO(foundation): implement routes/health.ts");
};
