/**
 * Lab 06 — AsyncLocalStorage & async_hooks
 *
 * Run:  pnpm --filter @app/api lab:06 <number>
 */

import { AsyncLocalStorage } from "node:async_hooks";
import { createHook } from "node:async_hooks";

const store = new AsyncLocalStorage<{ requestId: string }>();

// ─── Experiment 1 — request-scoped logger ───────────────────────────────────
// What I expected:
// AsyncLocalStorage would preserve the requestId across asynchronous
// operations, so every log inside the request would print the same requestId.
//
// What actually happened:
// All log messages, including those inside fakeDbQuery() after an await,
// printed "req-abc" as the requestId.
// [req-abc] handler start
// [req-abc] db query finished
// [req-abc] handler end
//
// Why:
// AsyncLocalStorage creates an asynchronous context with store.run().
// Every async operation (Promises, async/await, timers, etc.) created within
// that context automatically inherits the same store, allowing request-scoped
// data to be accessed anywhere with getStore().

function log(message: string): void {
  const ctx = store.getStore();
  console.log(`  [${ctx?.requestId ?? "no-ctx"}] ${message}`);
}

async function fakeDbQuery(): Promise<string> {
  await new Promise((r) => setTimeout(r, 10));
  log("db query finished");
  return "row";
}

async function experiment1(): Promise<void> {
  console.log("\n=== Experiment 1: AsyncLocalStorage logger ===\n");
  await store.run({ requestId: "req-abc" }, async () => {
    log("handler start");
    await fakeDbQuery();
    log("handler end");
  });
}

// ─── Experiment 2 — async_hooks trace ───────────────────────────────────────
// What I expected:
// async_hooks would record relationships between asynchronous resources,
// showing that every resource has a parent (triggerAsyncId).
//
// What actually happened:
// The hook collected several asyncId → triggerAsyncId pairs, demonstrating
// how Node.js links asynchronous resources together.
// async ids sampled: [ [ 24, 0 ], [ 25, 0 ], [ 26, 24 ], [ 28, 27 ], [ 30, 29 ] ]
//
// Why:
// Every asynchronous operation in Node.js receives a unique asyncId.
// triggerAsyncId identifies the resource that created it, allowing Node.js
// to build a parent-child chain of async resources. AsyncLocalStorage relies
// on this mechanism to propagate context.

async function experiment2(): Promise<void> {
  console.log("\n=== Experiment 2: async_hooks parent/child ===\n");
  const parents = new Map<number, number>();

  const hook = createHook({
    init(asyncId, _type, triggerAsyncId) {
      if (triggerAsyncId !== undefined) parents.set(asyncId, triggerAsyncId);
    },
  });
  hook.enable();

  await new Promise<void>((resolve) => {
    setTimeout(() => {
      console.log("  async ids sampled:", [...parents.entries()].slice(0, 5));
      hook.disable();
      resolve();
    }, 5);
  });
}

// ─── Experiment 3 — context survives await + setTimeout ───────────────────
// What I expected:
// The AsyncLocalStorage context would remain available after both await and
// setTimeout, so every log would use the same requestId.
//
// What actually happened:
// All log messages printed "req-xyz", including those executed after
// Promise.resolve() and inside setTimeout().
// [req-xyz] before await
// [req-xyz] after await
// [req-xyz] inside setTimeout
//
// Why:
// Both Promise-based async/await and timer callbacks create asynchronous
// resources that inherit the current AsyncLocalStorage context. Node.js
// propagates the store automatically using async_hooks, so the context
// remains available throughout the entire asynchronous execution chain.

async function experiment3(): Promise<void> {
  console.log("\n=== Experiment 3: context survives async chain ===\n");
  await store.run({ requestId: "req-xyz" }, async () => {
    log("before await");
    await Promise.resolve();
    log("after await");
    await new Promise<void>((resolve) =>
      setTimeout(() => {
        log("inside setTimeout");
        resolve();
      }, 5)
    );
  });
}

const experiments: Record<string, () => void | Promise<void>> = {
  "1": experiment1,
  "2": experiment2,
  "3": experiment3,
};

const arg = process.argv[2];

if (!arg || !experiments[arg]) {
  console.log(`
Usage:  pnpm --filter @app/api lab:06 <number>

  1  Request-scoped logger with AsyncLocalStorage
  2  Trace async parent/child with async_hooks
  3  Context survives await and setTimeout
`);
  process.exit(0);
}

await experiments[arg]();
