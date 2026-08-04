/**
 * Foundation: process entrypoint.
 *
 * IMPLEMENT:
 * 1. loadEnv() first (fail fast).
 * 2. buildApp() then app.listen({ host, port }).
 * 3. Handle SIGINT/SIGTERM: stop accepting → drain → close db/redis → exit
 *    (same ideas as lab 12 graceful shutdown).
 */

async function main(): Promise<void> {
  // TODO(foundation): loadEnv → buildApp → listen → signal handlers
  throw new Error("TODO(foundation): implement src/server.ts");
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
