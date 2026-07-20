/**
 * Lab 02 — libuv & Thread Pool
 *
 * Run:  npx tsx apps/api/labs/02-libuv-thread-pool.ts <number>
 *
 * For experiment 1, re-run with different pool sizes:
 *   UV_THREADPOOL_SIZE=1 npx tsx apps/api/labs/02-libuv-thread-pool.ts 1
 *   UV_THREADPOOL_SIZE=4 npx tsx apps/api/labs/02-libuv-thread-pool.ts 1
 */

import { pbkdf2 } from "node:crypto";
import { readFile } from "node:fs";
import { lookup, resolve } from "node:dns/promises";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const pbkdf2Async = promisify(pbkdf2);
const __filename = fileURLToPath(import.meta.url);

function timeMs(start: bigint): number {
  return Number(process.hrtime.bigint() - start) / 1e6;
}

// ─── Experiment 1 ────────────────────────────────────────────────────────────
// Run multiple crypto.pbkdf2 calls in parallel; compare UV_THREADPOOL_SIZE.
//
// What I expected:
// What actually happened:
// Why:

async function experiment1(): Promise<void> {
  const poolSize = process.env.UV_THREADPOOL_SIZE ?? "4 (default)";
  console.log(`\n=== Experiment 1: pbkdf2 parallel (UV_THREADPOOL_SIZE=${poolSize}) ===\n`);

  const tasks = 8;
  const start = process.hrtime.bigint();

  await Promise.all(
    Array.from({ length: tasks }, (_, i) =>
      pbkdf2Async("password", `salt-${i}`, 100_000, 32, "sha512")
    )
  );

  console.log(`  Completed ${tasks} pbkdf2 calls in ${timeMs(start).toFixed(0)}ms`);
  console.log("  Re-run with UV_THREADPOOL_SIZE=1,2,4,8 and compare totals.");
}

// ─── Experiment 2 ────────────────────────────────────────────────────────────
// Run multiple fs.readFile calls in parallel and observe thread pool saturation.
//
// What I expected:
// What actually happened:
// Why:

async function experiment2(): Promise<void> {
  console.log("\n=== Experiment 2: parallel fs.readFile ===\n");

  const start = process.hrtime.bigint();
  await Promise.all(
    Array.from({ length: 12 }, () => readFile(__filename, "utf8"))
  );
  console.log(`  12 parallel readFile calls: ${timeMs(start).toFixed(0)}ms`);
}

// ─── Experiment 3 ────────────────────────────────────────────────────────────
// dns.lookup (thread pool) vs dns.resolve (libuv async resolver).
//
// What I expected:
// What actually happened:
// Why:

async function experiment3(): Promise<void> {
  console.log("\n=== Experiment 3: dns.lookup vs dns.resolve ===\n");
  const host = "nodejs.org";

  let start = process.hrtime.bigint();
  const lookupResult = await lookup(host);
  console.log(`  lookup("${host}"): ${timeMs(start).toFixed(1)}ms →`, lookupResult.address);

  start = process.hrtime.bigint();
  const resolveResult = await resolve(host);
  console.log(`  resolve("${host}"): ${timeMs(start).toFixed(1)}ms →`, resolveResult[0]);
}

const experiments: Record<string, () => void | Promise<void>> = {
  "1": experiment1,
  "2": experiment2,
  "3": experiment3,
};

const arg = process.argv[2];

if (!arg || !experiments[arg]) {
  console.log(`
Usage:  npx tsx apps/api/labs/02-libuv-thread-pool.ts <number>

  1  Parallel pbkdf2 (try UV_THREADPOOL_SIZE=1,2,4,8)
  2  Parallel fs.readFile saturation
  3  dns.lookup vs dns.resolve
`);
  process.exit(0);
}

await experiments[arg]();
