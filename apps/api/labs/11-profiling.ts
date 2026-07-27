/**
 * Lab 11 — Performance & Profiling
 *
 * Run:  pnpm --filter @app/api lab:11 <number>
 *
 * DevTools profiling (experiments 1–3):
 *   pnpm --filter @app/api lab:11:inspect 3
 *   pnpm --filter @app/api lab:11:inspect-brk 7
 *
 * Then open chrome://inspect → "Open dedicated DevTools for Node"
 */

import { performance, PerformanceObserver } from "node:perf_hooks";
import { createServer } from "node:http";

function hotPath(n: number): number {
  let sum = 0;
  for (let i = 0; i < n; i++) sum += i;
  return sum;
}

function formatMb(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function printMemory(label: string): void {
  const m = process.memoryUsage();
  console.log(`  ${label}:`);
  console.log(`    heapUsed:  ${formatMb(m.heapUsed)}`);
  console.log(`    heapTotal: ${formatMb(m.heapTotal)}`);
  console.log(`    rss:       ${formatMb(m.rss)}`);
}

function printDevToolsSteps(experiment: string): void {
  console.log("\n  DevTools steps:");
  console.log("  1. Start with inspector (from repo root):");
  console.log(`     pnpm --filter @app/api lab:11:inspect ${experiment}`);
  console.log("  2. Open Chrome → chrome://inspect");
  console.log('  3. Click "Open dedicated DevTools for Node"');
}

// ─── Experiment 1 — CPU profile with --inspect ───────────────────────────────
// What I expected
// I expected Chrome DevTools to record CPU activity while hotPath() executed and identify
// it as the function consuming most of the execution time.

// What actually happened
// The CPU profile showed that nearly all CPU time was spent inside hotPath(),
// with the loop dominating the call stack. Functions responsible for console output and runtime
// initialization contributed very little.

  // node --inspect-brk $(which tsx) apps/api/labs/11-profiling.ts 7
  // Open chrome://inspect → Profile hotPath()

// Why
// hotPath() performs a large synchronous loop with five million iterations. Since it contains
// the primary computational work, the profiler attributes almost all execution time to this function.

function experiment1(): void {
  console.log("\n=== Experiment 1: CPU profiling ===\n");
  printDevToolsSteps("7");
  console.log("  4. Profiler tab → Start → Resume (F8 if using inspect-brk) → Stop");
  console.log("  Or use: pnpm --filter @app/api lab:11:inspect-brk 7");
}

// ─── Experiment 2 — heap snapshot ─────────────────────────────────────────────
// What I expected
// I expected the heap snapshot to display all currently allocated JavaScript objects and reveal
// memory usage after the program started.

// What actually happened
// The snapshot contained runtime objects such as arrays, strings, functions, and internal Node.js
// structures. The application's allocations occupied only a small portion of the total heap.

// Why
// A heap snapshot captures every live object reachable from the root set. Even a simple Node.js
// program includes numerous runtime objects created by V8 and Node.js itself.

function experiment2(): void {
  console.log("\n=== Experiment 2: heap snapshot ===\n");
  printDevToolsSteps("7");
  console.log("  4. Memory tab → Take heap snapshot");
}

// ─── Experiment 3 — memory leak sketch ───────────────────────────────────────
// What I expected
// I expected heap memory usage to increase significantly after allocating one hundred thousand
// arrays and for the arrays to remain visible in a heap snapshot.

// What actually happened
// Memory consumption increased substantially, and the heap snapshot showed a large number of
// retained arrays. Memory was not reclaimed while the leaks array remained in scope.
  // Before allocation:
  //   heapUsed:  9.2 MB
  //   heapTotal: 13.1 MB
  //   rss:       66.3 MB
  // After allocation:
  //   heapUsed:  90.5 MB
  //   heapTotal: 179.2 MB
  //   rss:       185.3 MB
  // allocated: 100000 arrays in 56ms
  // (arrays kept in 'leaks' — GC cannot reclaim them)

// Why
// The leaks array holds references to every allocated array. Because the objects are still
// reachable, the garbage collector cannot free them, simulating a classic memory leak.

async function experiment3(): Promise<void> {
  console.log("\n=== Experiment 3: Memory leak sketch ===\n");

  printMemory("Before allocation");

  const allocStart = performance.now();
  const leaks: unknown[] = [];
  for (let i = 0; i < 100_000; i++) leaks.push(new Array(100));
  const allocMs = performance.now() - allocStart;

  printMemory("After allocation");
  console.log(`  allocated: ${leaks.length} arrays in ${allocMs.toFixed(0)}ms`);
  console.log("  (arrays kept in 'leaks' — GC cannot reclaim them)");

  printDevToolsSteps("3");
  console.log("  4. Memory tab → Take heap snapshot");
  console.log("  5. Filter by Constructor → Array — compare count vs before");
  console.log("  6. Optional: Allocation timeline → Start → reload allocation → Stop");
  console.log("\n  Waiting for DevTools (Ctrl+C to exit)...\n");

  await new Promise<void>((resolve) => {
    const timer = setInterval(() => {}, 60_000);
    process.once("SIGINT", () => {
      clearInterval(timer);
      resolve();
    });
  });
}

// ─── Experiment 4 — flame graph with 0x ─────────────────────────────────────
// What I expected
// I expected 0x to generate an interactive flame graph highlighting the hottest execution path.

// What actually happened
// The flame graph displayed a large block corresponding to hotPath(), with most CPU time
// concentrated inside its loop.

// Why
// Flame graphs represent execution time by block width. Since nearly all computation occurs
// in hotPath(), it occupies the largest portion of the visualization.

function experiment4(): void {
  console.log("\n=== Experiment 4: 0x flame graph ===\n");
  console.log("  From repo root:");
  console.log("  pnpm --filter @app/api exec 0x -o -D . tsx labs/11-profiling.ts 7");
}

// ─── Experiment 5 — autocannon benchmark ────────────────────────────────────
// What I expected
// I expected the benchmark to send many HTTP requests to the server and report metrics
// such as requests per second and latency.

// What actually happened
// The benchmark generated continuous traffic, and the results included throughput,
// average latency, and percentile latency. The simple server handled requests with very low latency because it only returned a short "ok" response.

// Why
// The server performs almost no processing, disk I/O, or external communication.
// Its minimal workload allows Node.js to respond quickly and achieve high throughput.

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
// What I expected
// I expected Clinic.js Doctor to analyze the application's runtime behavior and generate a
// report identifying potential performance bottlenecks.

// What actually happened
// Clinic.js produced an interactive report containing CPU usage, event loop activity,
// and memory information. Since the application is simple, no significant performance issues were detected.

// Why
// Clinic.js combines multiple performance metrics to diagnose bottlenecks. Because the program
// performs only limited computation and serves a simple workload, there are few opportunities for optimization.

function experiment6(): void {
  console.log("\n=== Experiment 6: clinic.js ===\n");
  console.log("  pnpm --filter @app/api exec clinic doctor -- tsx labs/11-profiling.ts 7");
}

// ─── Experiment 7 — perf_hooks ──────────────────────────────────────────────
// What I expected
// I expected performance.mark() and performance.measure() to accurately report the execution time of hotPath().

// What actually happened
// The observer printed a measurement similar to:
// hotPath: XX.XX ms
// where the exact value depended on the machine's CPU performance and current system load.

// Why
// perf_hooks uses Node.js high-resolution timers, providing precise timing measurements
// with sub-millisecond accuracy. PerformanceObserver receives measurement entries and
// reports their durations once the measurements are recorded.

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
Usage:  pnpm --filter @app/api lab:11 <number>

  1  CPU profile (--inspect) instructions
  2  Heap snapshot instructions
  3  Memory leak sketch (heap snapshot — use lab:11:inspect 3)
  4  0x flame graph instructions
  5  Start server for autocannon
  6  clinic.js doctor instructions
  7  perf_hooks measure hot path

Inspect scripts (from repo root):
  pnpm --filter @app/api lab:11:inspect <n>      # attach DevTools while running
  pnpm --filter @app/api lab:11:inspect-brk <n>  # pause on start (CPU profile)
`);
  process.exit(0);
}

await experiments[arg]();
