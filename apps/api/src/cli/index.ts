/**
 * Foundation: small CLI for scripts and migrations.
 *
 * IMPLEMENT commands, e.g.:
 *   pnpm --filter @app/api cli migrate
 *   pnpm --filter @app/api cli seed
 *   pnpm --filter @app/api cli --help
 *
 * Parse argv simply (node:util parseArgs) or a tiny CLI lib.
 */

async function main(argv: string[]): Promise<void> {
  const command = argv[0];

  switch (command) {
    case "migrate":
      throw new Error("TODO(foundation): wire cli → infrastructure/db/migrate");
    case "seed":
      throw new Error("TODO(foundation): wire cli → infrastructure/db/seed");
    case "help":
    case undefined:
      console.log(`Usage: cli <command>

Commands:
  migrate   Apply database migrations
  seed      Run database seeds
  help      Show this help
`);
      return;
    default:
      console.error(`Unknown command: ${command}`);
      process.exitCode = 1;
  }
}

main(process.argv.slice(2)).catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
