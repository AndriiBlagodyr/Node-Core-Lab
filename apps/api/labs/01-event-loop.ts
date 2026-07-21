/**
 * Lab 01 — Event Loop & Timers
 *
 * Run:  pnpm --filter @app/api lab:01
 *
 * Before running each experiment, write down what you EXPECT the output
 * order to be. Then run it and compare. Update the "What actually happened"
 * and "Why" sections after each run.
 */

import { readFile } from "node:fs";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);

// ─── Experiment 1 ────────────────────────────────────────────────────────────
// Print the order of setTimeout, setImmediate, process.nextTick,
// Promise.resolve().then, and a sync log.
//
// What I expected:
// sync log first, then microtasks (nextTick, then Promise), then macrotasks
// (setTimeout vs setImmediate order may vary in the main module).

// What actually happened (Node v24 + tsx):
// 5. sync log
// 4. Promise.resolve().then
// 3. process.nextTick
// 2. setImmediate
// 1. setTimeout(fn, 0)

// Why:
// All synchronous code runs first (5). Microtasks run before any timer/check
// phase. Promise ran before nextTick in this ESM/tsx run; in a minimal CJS
// script, nextTick often runs before Promise — compare both if curious.
// setImmediate before setTimeout here is normal in the main module: neither
// is inside an I/O callback, so phase ordering can differ by runtime and loop
// iteration. The stable rule: microtasks always finish before macrotasks.

function experiment1() {
  console.log("\n=== Experiment 1: Execution order ===\n");

  setTimeout(() => console.log("1. setTimeout(fn, 0)"), 0);

  setImmediate(() => console.log("2. setImmediate"));

  process.nextTick(() => console.log("3. process.nextTick"));

  Promise.resolve().then(() => console.log("4. Promise.resolve().then"));

  console.log("5. sync log");
}


// ─── Experiment 2 ────────────────────────────────────────────────────────────
// setImmediate inside an I/O callback vs inside the main module.
// In the main module the order of setTimeout(0) and setImmediate is
// non-deterministic. Inside an I/O callback, setImmediate always fires first.
//
// What I expected:
// Main module: setTimeout(0) vs setImmediate order may vary between runs.
// Inside readFile I/O callback: setImmediate always before setTimeout(0).

// What actually happened:
// Main module:
//   main: setImmediate
//   main: setTimeout
// Inside I/O callback:
//   io: setImmediate
//   io: setTimeout

// Why:
// Outside I/O, the event loop may not have entered the poll phase yet, so
// setTimeout(0) and setImmediate can race — order is not guaranteed.
// Inside the readFile callback, the poll phase just finished I/O, so the check
// phase runs next: setImmediate fires before the timers phase re-processes
// setTimeout(0). This is the canonical "phase skip" behavior the lab targets.

function experiment2() {
  console.log("\n=== Experiment 2: I/O callback context ===\n");

  console.log("--- From main module (order may vary between runs) ---");
  setTimeout(() => console.log("  main: setTimeout"), 0);
  setImmediate(() => console.log("  main: setImmediate"));

  readFile(__filename, () => {
    console.log("\n--- Inside I/O callback (setImmediate always first) ---");
    setTimeout(() => console.log("  io: setTimeout"), 0);
    setImmediate(() => console.log("  io: setImmediate"));
  });
}

// ─── Experiment 3 ────────────────────────────────────────────────────────────
// Starve the event loop with a long sync loop and observe delayed timers.
//
// What I expected:
// setTimeout(100ms) would log ~100ms, but the 2s sync loop would delay it.

// What actually happened:
// Sync loop blocked ~2000ms. setTimeout(100ms) fired at ~2000ms (not ~100ms).
// Timer callback ran only after the sync while-loop released the main thread.

// Why:
// Timers are macrotasks — their callbacks run only when the event loop gets a
// turn. A long synchronous while-loop on the main thread prevents the loop from
// processing timers, I/O, or other callbacks. The 100ms deadline elapsed during
// the block, but the callback could not run until sync work finished (~2000ms).
// This is why CPU-heavy sync work hurts server latency.

function experiment3() {
  console.log("\n=== Experiment 3: Starving the event loop ===\n");

  const BLOCK_MS = 2000;

  setTimeout(() => {
    console.log(`  setTimeout(100ms) fired at: ${Date.now() - start}ms (expected ~100ms)`);
  }, 100);

  const start = Date.now();
  console.log("  Blocking the main thread for ~2 seconds...");

  while (Date.now() - start < BLOCK_MS) {
    // busy wait — nothing can run
  }

  console.log(`  Sync loop done at: ${Date.now() - start}ms`);
  console.log("  The timer callback above will fire AFTER this, delayed by the sync block.");
}

// ─── Experiment 4 ────────────────────────────────────────────────────────────
// Starve the microtask queue with infinite process.nextTick.
// WARNING: this will hang the process. Kill it with Ctrl+C after observing.
//
// What I expected:
// nextTick count logs every 500k iterations; setTimeout(0) never fires.

// What actually happened:
// nextTick count increases indefinitely. setTimeout callback never logged.
// Process hangs until Ctrl+C.

// Why:
// process.nextTick schedules work on the nextTick queue, which Node drains
// completely before moving to the next event-loop phase. Recursive nextTick
// refills that queue forever, so the loop never reaches the timers phase where
// setTimeout would run. Same risk in production: excessive nextTick starves I/O
// and timers. Prefer setImmediate for deferral when you do not need pre-microtask
// priority.

function experiment4() {
  console.log("\n=== Experiment 4: Microtask starvation (will hang — Ctrl+C to stop) ===\n");

  let count = 0;

  setTimeout(() => {
    console.log("  This setTimeout will NEVER fire because nextTick starves the queue.");
  }, 0);

  function recurse(): void {
    count++;
    if (count % 500_000 === 0) {
      console.log(`  nextTick count: ${count.toLocaleString()}`);
    }
    process.nextTick(recurse);
  }

  recurse();
}

// ─── Runner ──────────────────────────────────────────────────────────────────

const experiments: Record<string, () => void> = {
  "1": experiment1,
  "2": experiment2,
  "3": experiment3,
  "4": experiment4,
};

const arg = process.argv[2];

if (!arg || !experiments[arg]) {
  console.log(`
Usage:  pnpm --filter @app/api lab:01 <number>

  1  Execution order (setTimeout, setImmediate, nextTick, Promise, sync)
  2  setImmediate inside I/O callback vs main module
  3  Starving the event loop with a sync loop
  4  Microtask starvation with infinite nextTick (will hang)
`);
  process.exit(0);
}

experiments[arg]();

// ─── Learning outcomes (Lab 01) ─────────────────────────────────────────────
// Microtasks: process.nextTick queue + Promise reactions — run after current
// sync code, before the next macrotask phase.
// Macrotasks: setTimeout/setInterval (timers phase), setImmediate (check phase),
// I/O callbacks (poll phase).
// setImmediate vs setTimeout(0): order depends on context; after I/O, setImmediate
// wins. process.nextTick is dangerous when recursive — starves the event loop.

