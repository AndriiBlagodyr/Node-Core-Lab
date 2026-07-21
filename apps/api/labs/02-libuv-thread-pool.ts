/**
 * Lab 02 — libuv & Thread Pool
 *
 * Run:  pnpm --filter @app/api lab:02 <number>
 *
 * For experiment 1, re-run with different pool sizes:
 *   UV_THREADPOOL_SIZE=1 pnpm --filter @app/api lab:02 1
 *   UV_THREADPOOL_SIZE=4 pnpm --filter @app/api lab:02 1
 */

import { pbkdf2 } from "node:crypto";
import { readFile } from "node:fs/promises";
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
// Doubling UV_THREADPOOL_SIZE would roughly halve total time, until concurrent work
// is no longer the bottleneck (8 parallel tasks with pool size 8).

// What actually happened:
// UV_THREADPOOL_SIZE=1  → 186ms
// UV_THREADPOOL_SIZE=2  → 94ms
// UV_THREADPOOL_SIZE=4  → 60ms
// UV_THREADPOOL_SIZE=8  → 33ms
// UV_THREADPOOL_SIZE=16 → 36ms
// Increasing from 8 to 16 did not improve time.

// Why:
// Each pbkdf2 call uses a libuv thread-pool worker. With pool size N, at most N
// calls run at once; the rest queue. Doubling the pool roughly halves total time
// while work is still queued. With 8 tasks and pool size 8, all tasks run in
// parallel, so pool size 16 adds nothing. This limit is about task count and pool
// size, not CPU core count (this machine has 10 logical cores).

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
// Increasing UV_THREADPOOL_SIZE would reduce total read time, similar to experiment 1.

// What actually happened:
// UV_THREADPOOL_SIZE=1  → 12 parallel readFile calls: 2ms
// UV_THREADPOOL_SIZE=2  → 12 parallel readFile calls: 2ms
// UV_THREADPOOL_SIZE=16 → 12 parallel readFile calls: 2ms
// UV_THREADPOOL_SIZE=32 → 12 parallel readFile calls: 2ms
// Pool size had no visible effect.

// Why:
// This setup did not demonstrate thread-pool saturation. __filename is a small
// (~4KB) file, so each read finishes almost instantly. Node does not cache file
// contents in JS between readFile calls, but repeated reads of the same path hit
// the OS page cache in RAM, so disk I/O disappears after the first read. To see
// saturation, use many large files (or more concurrent reads than pool size)
// before the OS cache warms up.

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
// dns.resolve would be faster than dns.lookup because resolve avoids the thread pool.

// What actually happened:
// lookup("nodejs.org"):  93.4ms → 104.16.212.131
// resolve("nodejs.org"):  8.4ms → 104.16.213.131
// resolve was much faster. Different IPs are normal (CDN round-robin).

// Why:
// dns.lookup uses getaddrinfo, a blocking syscall offloaded to the libuv thread
// pool. dns.resolve uses c-ares (async DNS) and does not consume a pool worker
// the same way. The gap is also partly due to order: lookup ran first (cold DNS),
// so resolve may have benefited from DNS caching. Re-run with swapped order or
// multiple iterations for a fairer comparison.

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
Usage:  pnpm --filter @app/api lab:02 <number>

  1  Parallel pbkdf2 (try UV_THREADPOOL_SIZE=1,2,4,8)
  2  Parallel fs.readFile saturation
  3  dns.lookup vs dns.resolve
`);
  process.exit(0);
}

await experiments[arg]();

// ─── Learning outcomes (Lab 02) ─────────────────────────────────────────────
// Thread-pool operations (common examples): fs.* callback APIs, crypto.pbkdf2,
// crypto.scrypt, dns.lookup, zlib (callback/sync), some child_process paths.
//
// Detecting saturation: total time stops improving when pool size ≥ concurrent
// blocking work; latency grows when all pool threads are busy; under load, slow
// pbkdf2 / file I/O / dns.lookup is a signal to raise UV_THREADPOOL_SIZE or
// offload work (workers, fewer blocking calls).

