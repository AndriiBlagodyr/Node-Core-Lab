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

// console.log("\n=== Experiment 1: Execution order ===\n"); - sync operation
// console.log("5. sync log"); - sync operation
// process.nextTick(() => console.log("3. process.nextTick")); - VIP Process priority
//  Promise.resolve().then(() => console.log("4. Promise.resolve().then")); - Microtask order
// setTimeout(() => console.log("1. setTimeout(fn, 0)"), 0); AND setImmediate(() => console.log("2. setImmediate")); Or via verse depending on the processor speed

// What actually happened:

// . sync log
// 4. Promise.resolve().then
// 3. process.nextTick
// 2. setImmediate
// 1. setTimeout(fn, 0)
// Why:
// nextTick should be before Promise but it depends on the running environment. In this case, the Promise resolved before the nextTick callback was executed. The order of setTimeout and setImmediate can vary depending on the environment and timing, but in this run, setImmediate executed before setTimeout.

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

// console.log("\n=== Experiment 2: I/O callback context ===\n"); - sync operation
// console.log("--- From main module (order may vary between runs) ---"); - sync operation
// setTimeout(() => console.log("  main: setTimeout"), 0); - Timer phase
// setImmediate(() => console.log("  main: setImmediate")); - Check phase
// readFile Poll phase
// Inside Poll: console.log("\n--- Inside I/O callback (setImmediate always first) ---"); - sync operation
// Inside Poll: setImmediate(() => console.log("  io: setImmediate")); Check after Poll
// Inside Poll: setTimeout(() => console.log("  io: setTimeout"), 0);


// What actually happened:
// --- From main module (order may vary between runs) ---
//   main: setImmediate
//   main: setTimeout

// --- Inside I/O callback (setImmediate always first) ---
//   io: setImmediate
//   io: setTimeout

// Why:

import { readFile } from "node:fs";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);

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

// console.log("\n=== Experiment 3: Starving the event loop ===\n"); - sync operation
// setTimeout is added to the timer queue and will fire after 100ms, but the sync loop will block the event loop for ~2 seconds, so the timer callback will be delayed until after the sync loop completes.
// console.log("  Blocking the main thread for ~2 seconds..."); - sync operation
// while (Date.now() - start < BLOCK_MS) { /* busy wait — nothing can run */ } - sync operation
// console.log(`  Sync loop done at: ${Date.now() - start}ms`); - sync operation
// console.log("  The timer callback above will fire AFTER this, delayed by the sync block."); - sync operation
// console.log(`  setTimeout(100ms) fired at: ${Date.now() - start}ms (expected ~100ms)`); After 2 seconds and 100ms, the setTimeout callback will finally fire, but it will be delayed by the sync block, so it will log a time of ~2000ms instead of the expected ~100ms.


// Why: At first the sync code is running. while  sync loop blocks main thread for 2 seconds
// So setTimeout will be executed after the sync loop is done, which is why it logs a time of ~2000ms instead of the expected ~100ms.

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

// console.log("\n=== Experiment 4: Microtask starvation (will hang — Ctrl+C to stop) ===\n"); - sync operation
// every 500 000 tick message  : console.log(`  nextTick count: ${count.toLocaleString()}`);

// console.log("  This setTimeout will NEVER fire because nextTick starves the queue."); - never be called
// What actually happened:
// Why: setTimeout will never be executed because process.nextTick keeps adding new callbacks to the microtask queue, preventing the event loop from moving on to the timer phase where setTimeout would be executed.
// 

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
