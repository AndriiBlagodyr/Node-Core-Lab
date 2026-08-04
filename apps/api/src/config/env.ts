/**
 * Foundation: Zod env validation — fail fast before any side effects.
 *
 * IMPLEMENT:
 * - Define a Zod schema for all process.env keys used by the API.
 * - Call `schema.parse(process.env)` once and export a typed `env` object.
 * - Document every variable in docs/env.md and apps/api/.env.example.
 *
 * @see docs/foundation.md
 * @see docs/architecture-roadmap.md §9 Configuration & Secrets
 */

export type Env = {
  NODE_ENV: "development" | "test" | "production";
  HOST: string;
  PORT: number;
  LOG_LEVEL: string;
  DATABASE_URL: string;
  REDIS_URL: string;
  SMTP_URL: string;
};

/**
 * Placeholder until Zod validation is wired.
 * Replace with: `export const env = envSchema.parse(process.env)`
 */
export function loadEnv(): Env {
  throw new Error(
    "TODO(foundation): implement Zod env validation in src/config/env.ts",
  );
}
