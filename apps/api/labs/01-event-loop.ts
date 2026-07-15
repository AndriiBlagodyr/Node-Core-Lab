/**
 * Lab 01 — Event Loop & Timers
 *
 * Run:  npx tsx apps/api/labs/01-event-loop.ts
 *
 * Before running each experiment, write down what you EXPECT the output
 * order to be. Then run it and compare. Update the "What actually happened"
 * and "Why" sections after each run.
 */

// ─── Experiment 1 ────────────────────────────────────────────────────────────
// Print the order of setTimeout, setImmediate, process.nextTick,
// Promise.resolve().then, and a sync log.
//
// What I expected:
// What actually happened:
// Why:

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
// What actually happened:
// Why:

import { readFile } from "node:fs";

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
// What actually happened:
// Why:

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
// What actually happened:
// Why:

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
Usage:  npx tsx apps/api/labs/01-event-loop.ts <number>

  1  Execution order (setTimeout, setImmediate, nextTick, Promise, sync)
  2  setImmediate inside I/O callback vs main module
  3  Starving the event loop with a sync loop
  4  Microtask starvation with infinite nextTick (will hang)
`);
  process.exit(0);
}

experiments[arg]();
