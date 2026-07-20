/**
 * Lab 11 — Performance & Profiling
 *
 * Run:  npx tsx apps/api/labs/11-profiling.ts <number>
 *
 * Experiments 1–4 and 6 are manual/tooling labs — this file prints steps + runnable demos.
 */

import { performance, PerformanceObserver } from "node:perf_hooks";
import { createServer } from "node:http";

function hotPath(n: number): number {
  let sum = 0;
  for (let i = 0; i < n; i++) sum += i;
  return sum;
}

// ─── Experiment 1 — CPU profile with --inspect ───────────────────────────────
// What I expected:
// What actually happened:
// Why:

function experiment1(): void {
  console.log("\n=== Experiment 1: CPU profiling ===\n");
  console.log("  node --inspect-brk $(which tsx) apps/api/labs/11-profiling.ts 7");
  console.log("  Open chrome://inspect → Profile hotPath()");
}

// ─── Experiment 2 — heap snapshot ─────────────────────────────────────────────
// What I expected:
// What actually happened:
// Why:

function experiment2(): void {
  console.log("\n=== Experiment 2: heap snapshot ===\n");
  console.log("  node --inspect $(which tsx) apps/api/labs/11-profiling.ts 7");
  console.log("  DevTools → Memory → Take snapshot");
}

// ─── Experiment 3 — memory leak sketch ───────────────────────────────────────
// What I expected:
// What actually happened:
// Why:

function experiment3(): void {
  console.log("\n=== Experiment 3: leak sketch ===\n");
  const leaks: unknown[] = [];
  for (let i = 0; i < 100_000; i++) leaks.push(new Array(100));
  console.log("  allocated arrays:", leaks.length, "— snapshot heap before/after");
}

// ─── Experiment 4 — flame graph with 0x ─────────────────────────────────────
// What I expected:
// What actually happened:
// Why:

function experiment4(): void {
  console.log("\n=== Experiment 4: 0x flame graph ===\n");
  console.log("  npx 0x -o -D . $(which tsx) apps/api/labs/11-profiling.ts 7");
}

// ─── Experiment 5 — autocannon benchmark ────────────────────────────────────
// What I expected:
// What actually happened:
// Why:

async function experiment5(): Promise<void> {
  console.log("\n=== Experiment 5: HTTP server for autocannon ===\n");
  const server = createServer((_req, res) => {
    res.end("ok");
  });
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as { port: number }).port;
  console.log(`  npx autocannon http://127.0.0.1:${port}`);
  console.log("  Press Ctrl+C after benchmark, then close server.");
}

// ─── Experiment 6 — clinic.js doctor ────────────────────────────────────────
// What I expected:
// What actually happened:
// Why:

function experiment6(): void {
  console.log("\n=== Experiment 6: clinic.js ===\n");
  console.log("  npx clinic doctor -- tsx apps/api/labs/11-profiling.ts 7");
}

// ─── Experiment 7 — perf_hooks ──────────────────────────────────────────────
// What I expected:
// What actually happened:
// Why:

function experiment7(): void {
  console.log("\n=== Experiment 7: perf_hooks ===\n");
  performance.mark("start");
  hotPath(5_000_000);
  performance.mark("end");
  performance.measure("hotPath", "start", "end");
  const obs = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log(`  ${entry.name}: ${entry.duration.toFixed(2)}ms`);
    }
  });
  obs.observe({ entryTypes: ["measure"] });
  performance.measure("hotPath", "start", "end");
  obs.disconnect();
}

const experiments: Record<string, () => void | Promise<void>> = {
  "1": experiment1,
  "2": experiment2,
  "3": experiment3,
  "4": experiment4,
  "5": experiment5,
  "6": experiment6,
  "7": experiment7,
};

const arg = process.argv[2];

if (!arg || !experiments[arg]) {
  console.log(`
Usage:  npx tsx apps/api/labs/11-profiling.ts <number>

  1  CPU profile (--inspect) instructions
  2  Heap snapshot instructions
  3  Memory leak sketch
  4  0x flame graph instructions
  5  Start server for autocannon
  6  clinic.js doctor instructions
  7  perf_hooks measure hot path
`);
  process.exit(0);
}

await experiments[arg]();
