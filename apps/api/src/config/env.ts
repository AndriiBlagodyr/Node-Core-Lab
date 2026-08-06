/**
 * Foundation: Zod env validation — fail fast before any side effects.
 *
 * @see docs/foundation.md
 * @see docs/architecture-roadmap.md §9 Configuration & Secrets
 */

import { config as loadDotenv } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const apiRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

loadDotenv({ path: resolve(apiRoot, ".env"), quiet: true });

const logLevels = [
  "fatal",
  "error",
  "warn",
  "info",
  "debug",
  "trace",
  "silent",
] as const;

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  HOST: z.string().min(1).default("127.0.0.1"),
  PORT: z.coerce.number().int().positive().default(8100),
  LOG_LEVEL: z.enum(logLevels).default("info"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  REDIS_URL: z.string().min(1, "REDIS_URL is required"),
  SMTP_URL: z.string().min(1, "SMTP_URL is required"),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | undefined;

/**
 * Parse and cache env once. Call from server/cli entrypoints before any I/O.
 */
export function loadEnv(): Env {
  if (cached) {
    return cached;
  }

  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const details = parsed.error.flatten().fieldErrors;
    console.error("Invalid environment configuration:", details);
    throw new Error("Invalid environment configuration");
  }

  cached = parsed.data;
  return cached;
}

/** Access env after `loadEnv()` has run. */
export function getEnv(): Env {
  if (!cached) {
    throw new Error("Environment not loaded. Call loadEnv() first.");
  }
  return cached;
}
