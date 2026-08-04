/**
 * Foundation: apply migrations (called from CLI and optionally on boot in dev).
 *
 * IMPLEMENT:
 * - Drizzle Kit migrate / Prisma migrate deploy using DATABASE_URL.
 * - Fail loudly on migration errors.
 */

export async function migrate(): Promise<void> {
  throw new Error("TODO(foundation): implement infrastructure/db/migrate.ts");
}
