/**
 * Lab 08 — Error Handling
 *
 * Run:  pnpm --filter @app/api lab:08 <number>
 *
 * Experiment 2 triggers uncaughtException — process may exit unless handled.
 */

import { setTimeout as delay } from "node:timers/promises";

// ─── Experiment 1 — unhandledRejection ──────────────────────────────────────
// What I expected:
// What actually happened:
// Why:

async function experiment1(): Promise<void> {
  console.log("\n=== Experiment 1: unhandledRejection ===\n");
  process.once("unhandledRejection", (reason) => {
    console.log("  caught unhandledRejection:", reason);
  });
  Promise.reject(new Error("boom-rejection"));
  await delay(50);
}

// ─── Experiment 2 — uncaughtException ─────────────────────────────────────────
// What I expected:
// What actually happened:
// Why:

function experiment2(): void {
  console.log("\n=== Experiment 2: uncaughtException ===\n");
  process.once("uncaughtException", (err) => {
    console.log("  caught uncaughtException:", err.message);
    console.log("  In production, prefer crash + restart after logging.");
  });
  throw new Error("boom-sync");
}

// ─── Experiment 3 — AbortController ─────────────────────────────────────────
// What I expected:
// What actually happened:
// Why:

async function experiment3(): Promise<void> {
  console.log("\n=== Experiment 3: AbortController ===\n");
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 10);
  try {
    await delay(100, undefined, { signal: ac.signal });
  } catch (err) {
    console.log("  timeout aborted:", (err as Error).name);
  } finally {
    clearTimeout(timer);
  }
}

// ─── Experiment 4 — custom Error hierarchy ──────────────────────────────────
// What I expected:
// What actually happened:
// Why:

class AppError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

function experiment4(): void {
  console.log("\n=== Experiment 4: AppError hierarchy ===\n");
  const err = new AppError("validation_error", "email invalid");
  console.log("  code:", err.code, "name:", err.name);
}

// ─── Experiment 5 — Result/Either wrapper ───────────────────────────────────
// What I expected:
// What actually happened:
// Why:

type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

async function mayFail(fail: boolean): Promise<Result<number>> {
  try {
    if (fail) throw new Error("failed");
    return { ok: true, value: 42 };
  } catch (error) {
    return { ok: false, error: error as Error };
  }
}

async function experiment5(): Promise<void> {
  console.log("\n=== Experiment 5: Result wrapper ===\n");
  console.log("  success:", await mayFail(false));
  console.log("  failure:", await mayFail(true));
}

const experiments: Record<string, () => void | Promise<void>> = {
  "1": experiment1,
  "2": experiment2,
  "3": experiment3,
  "4": experiment4,
  "5": experiment5,
};

const arg = process.argv[2];

if (!arg || !experiments[arg]) {
  console.log(`
Usage:  pnpm --filter @app/api lab:08 <number>

  1  unhandledRejection handler
  2  uncaughtException handler
  3  AbortController cancels timer
  4  Custom Error hierarchy
  5  Result/Either async wrapper
`);
  process.exit(0);
}

await experiments[arg]();
