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
// A rejected Promise without a .catch() should trigger the "unhandledRejection" event.
//
// What actually happened:
// The process emitted the "unhandledRejection" event, and the registered handler logged the rejection reason.

  // caught unhandledRejection: Error: boom-rejection
  //   at Object.experiment1 (/Users/andriiblagodyr/MyDocuments/Projects/Node-Core-Lab/apps/api/labs/08-error-handling.ts:27:18)
  //   at <anonymous> (/Users/andriiblagodyr/MyDocuments/Projects/Node-Core-Lab/apps/api/labs/08-error-handling.ts:154:22)
  //   at ModuleJob.run (node:internal/modules/esm/module_job:430:25)
  //   at async onImport.tracePromise.__proto__ (node:internal/modules/esm/loader:661:26)
  //   at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:101:5)
//
// Why:
// Promise.reject() creates a rejected Promise. Since no catch handler was attached, Node.js treated it as an
// unhandled rejection and emitted the "unhandledRejection" process event. This event can be used for logging,
// but rejected Promises should normally be handled close to where they occur.

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
// Throwing an uncaught synchronous error should trigger the "uncaughtException" event.
//
// What actually happened:
// The thrown Error was caught by the process-level "uncaughtException" handler, which logged the message.

  // caught uncaughtException: boom-sync
  // In production, prefer crash + restart after logging.
//
// Why:
// A synchronous exception that is not handled by a try/catch bubbles to the top of the event loop.
// Node emits the "uncaughtException" event before exiting. In production, the recommended approach is to
// log the error, gracefully shut down the application, and let a process manager restart it.

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
// Calling abort() should cancel the pending asynchronous operation.
//
// What actually happened:
// The delayed Promise was rejected with an AbortError after the AbortController aborted the operation.

// timeout aborted: AbortError
//
// Why:
// AbortController provides a standard cancellation mechanism for asynchronous APIs. When abort() is called,
// APIs that support AbortSignal reject their Promise with an AbortError, allowing the caller to stop waiting
// and release resources early.

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
// A custom error class should behave like a normal Error while exposing additional application-specific data.
//
// What actually happened:
// The AppError instance contained both the standard Error properties (name, message) and the custom "code" field.

// code: validation_error name: AppError
//
// Why:
// Extending the built-in Error class allows applications to create a structured error hierarchy.
// Custom errors make it easier to distinguish different failure types using instanceof and to attach metadata
// such as error codes or HTTP status codes.

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
// The function should return either a successful result or an error object instead of throwing exceptions.
//
// What actually happened:
// The successful call returned { ok: true, value: 42 }, while the failing call returned
// { ok: false, error: Error(...) }.

//   success: { ok: true, value: 42 }
//   failure: {
//   ok: false,
//   error: Error: failed
//       at mayFail (/Users/andriiblagodyr/MyDocuments/Projects/Node-Core-Lab/apps/api/labs/08-error-handling.ts:132:21)
//       at Object.experiment5 (/Users/andriiblagodyr/MyDocuments/Projects/Node-Core-Lab/apps/api/labs/08-error-handling.ts:142:35)
//       at async <anonymous> (/Users/andriiblagodyr/MyDocuments/Projects/Node-Core-Lab/apps/api/labs/08-error-handling.ts:168:1)
// }
//
// Why:
// The Result (or Either) pattern represents both success and failure as regular return values.
// This avoids exception-based control flow and forces callers to explicitly handle both outcomes, improving
// predictability and making business logic easier to test.

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
