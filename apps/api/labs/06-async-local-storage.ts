/**
 * Lab 06 — AsyncLocalStorage & async_hooks
 *
 * Run:  npx tsx apps/api/labs/06-async-local-storage.ts <number>
 */

import { AsyncLocalStorage } from "node:async_hooks";
import { createHook } from "node:async_hooks";

const store = new AsyncLocalStorage<{ requestId: string }>();

// ─── Experiment 1 — request-scoped logger ───────────────────────────────────
// What I expected:
// What actually happened:
// Why:

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
// What actually happened:
// Why:

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
// What actually happened:
// Why:

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
Usage:  npx tsx apps/api/labs/06-async-local-storage.ts <number>

  1  Request-scoped logger with AsyncLocalStorage
  2  Trace async parent/child with async_hooks
  3  Context survives await and setTimeout
`);
  process.exit(0);
}

await experiments[arg]();
