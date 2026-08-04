/**
 * Foundation: database client (Drizzle preferred for SQL learning; Prisma OK — write an ADR).
 *
 * IMPLEMENT:
 * - Create pool/client from env.DATABASE_URL.
 * - Export typed `db` used only from repositories (architecture layering).
 * - Close on graceful shutdown (server.ts signals).
 *
 * @see docs/adr/_template.md — write ORM choice ADR before locking this in
 */

export type DbClient = {
  /** Placeholder until ORM is chosen and wired. */
  ping: () => Promise<void>;
  close: () => Promise<void>;
};

export async function createDbClient(_databaseUrl: string): Promise<DbClient> {
  throw new Error(
    "TODO(foundation): implement infrastructure/db/client.ts (Drizzle or Prisma)",
  );
}
