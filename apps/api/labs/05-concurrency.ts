/**
 * Lab 05 — Concurrency Primitives
 *
 * Run:  pnpm --filter @app/api lab:05 <number>
 *
 * Experiment 4 (cluster) and 5 (spawn) spawn child processes — read output carefully.
 */

import { Worker } from "node:worker_threads";
import cluster from "node:cluster";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { availableParallelism } from "node:os";

function fib(n: number): number {
  return n <= 1 ? n : fib(n - 1) + fib(n - 2);
}

// ─── Experiment 1 — Worker Thread + MessagePort ─────────────────────────────
// What I expected:
// I expected the Worker Thread to execute the CPU-intensive Fibonacci
// calculation in a separate thread and send the result back to the main
// thread using MessagePort (parentPort.postMessage()).
//
// What actually happened:
// A new Worker Thread was created, calculated fib(40), and sent the result
// back to the main thread. The main thread received the value through the
// "message" event and printed it. The Worker then exited normally.
// === Experiment 1: Worker Thread ===

//   Computing fib(40) in a worker (~1–2s)...
//   fib(40) = 102334155
//
// Why:
// Worker Threads provide true parallel execution for JavaScript code.
// Each Worker has its own V8 instance, Event Loop, and JavaScript execution
// context. Communication between the main thread and the Worker happens
// through message passing using MessagePort (parentPort.postMessage()).
// This prevents CPU-intensive tasks from blocking the main Event Loop.

async function experiment1(): Promise<void> {
  console.log("\n=== Experiment 1: Worker Thread ===\n");
  console.log("  Computing fib(40) in a worker (~1–2s)...");

  const worker = new Worker(
    `const { parentPort, workerData } = require('worker_threads');
     function fib(n) {
       return n <= 1 ? n : fib(n - 1) + fib(n - 2);
     }
     parentPort.postMessage(fib(workerData.n));`,
    { eval: true, workerData: { n: 40 } }
  );

  worker.on("message", (result) => console.log(`  fib(40) = ${result}`));
  await new Promise<void>((resolve, reject) => {
    worker.on("error", reject);
    worker.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`worker exited with code ${code}`))
    );
  });
}

// ─── Experiment 2 — SharedArrayBuffer + Atomics ─────────────────────────────
// What I expected:
// I expected all Worker Threads to increment the same shared counter.
// Since Atomics.add() performs an atomic operation, the final value should
// equal the number of workers (4), regardless of their execution order.
//
// What actually happened:
// Four Worker Threads were created. Each worker incremented the shared
// counter exactly once using Atomics.add(). After all workers finished,
// the counter value was 4.
// counter: 4
//
// Why:
// SharedArrayBuffer allows multiple Worker Threads to access the same memory.
// Without synchronization, concurrent writes could cause race conditions.
// Atomics.add() guarantees that each increment is performed atomically, so
// no updates are lost even when multiple threads modify the value at the
// same time.

async function experiment2(): Promise<void> {
  console.log("\n=== Experiment 2: SharedArrayBuffer counter ===\n");
  const shared = new SharedArrayBuffer(4);
  const counter = new Int32Array(shared);

  const bump = (): Promise<void> =>
    new Promise((resolve) => {
      const w = new Worker(
        `const { parentPort, workerData } = require('worker_threads');
         Atomics.add(workerData, 0, 1);
         parentPort.postMessage('done');`,
        { eval: true, workerData: counter }
      );
      w.on("message", resolve);
    });

  await Promise.all(Array.from({ length: 4 }, bump));
  console.log("  counter:", Atomics.load(counter, 0));
}

// ─── Experiment 3 — Worker pool sketch ───────────────────────────────────────
// What I expected:
// I expected a small pool of Worker Threads to process multiple tasks.
// Each worker should receive a number, double it, and send the result back.
// Reusing workers should avoid the overhead of creating a new worker for
// every task.
//
// What actually happened:
// Two Worker Threads were created (or fewer if the machine has fewer CPU
// cores). Each worker received the value 21, returned 42, and the final
// output was:
//
// results: [42, 42]
//
// After processing the tasks, the workers were terminated.
//
// Why:
// A worker pool keeps a fixed number of Worker Threads alive and distributes
// tasks among them. Creating workers is relatively expensive, so reusing them
// improves performance when many CPU-intensive tasks need to be processed.

async function experiment3(): Promise<void> {
  console.log("\n=== Experiment 3: worker pool sketch ===\n");
  const poolSize = Math.min(2, availableParallelism());
  const workers = Array.from(
    { length: poolSize },
    () =>
      new Worker(
        `const { parentPort } = require('worker_threads');
         parentPort.on('message', (n) => parentPort.postMessage(n * 2));`,
        { eval: true }
      )
  );

  const run = (w: Worker, n: number) =>
    new Promise<number>((resolve) => {
      w.once("message", resolve);
      w.postMessage(n);
    });

  const results = await Promise.all([run(workers[0]!, 21), run(workers[1]!, 21)]);
  console.log("  results:", results);
  await Promise.all(workers.map((w) => w.terminate()));
}

// ─── Experiment 4 — cluster HTTP server ─────────────────────────────────────
// What I expected:
// I expected the primary process to create two worker processes. Each worker
// should start its own HTTP server instance and listen on a port. The workers
// should run independently and exit after a short delay.
//
// What actually happened:
// The primary process forked two worker processes. Each worker started an HTTP
// server, printed its process ID, and then exited after 500 ms.

//   worker 59350 listening
//   worker 59349 listening
//
// Why:
// The Cluster module creates multiple Node.js processes, each with its own
// Event Loop and V8 instance. This allows a server to utilize multiple CPU
// cores and improve throughput for incoming requests. The primary process
// manages the workers but does not handle requests itself.
async function experiment4(): Promise<void> {
  if (cluster.isPrimary) {
    console.log("\n=== Experiment 4: cluster (primary) ===\n");
    cluster.fork();
    cluster.fork();
    cluster.on("exit", () => process.exit(0));
    return;
  }

  createServer((_req, res) => {
    res.end(`worker ${process.pid}\n`);
  }).listen(0, () => {
    console.log(`  worker ${process.pid} listening`);
    setTimeout(() => process.exit(0), 500);
  });
}

// ─── Experiment 5 — child_process.spawn ─────────────────────────────────────
// What I expected:
// I expected spawn() to start an external process ("echo"), capture its
// standard output, print "hello-from-spawn", and exit successfully.
//
// What actually happened:
// A child process was created, executed the "echo" command, printed:
//
// stdout: hello-from-spawn
//
// and then terminated. The main process waited for the "close" event before
// continuing.
//
// Why:
// spawn() starts a new operating system process asynchronously. The parent
// process communicates with the child through standard streams (stdin,
// stdout, stderr), making it suitable for executing external programs
// without blocking the Event Loop.

async function experiment5(): Promise<void> {
  console.log("\n=== Experiment 5: spawn echo ===\n");
  const child = spawn("echo", ["hello-from-spawn"]);
  child.stdout.on("data", (d) => process.stdout.write(`  stdout: ${d}`));
  await new Promise<void>((resolve) => child.on("close", resolve));
}

// ─── Experiment 6 — compare approaches (notes) ──────────────────────────────
// What I expected:
// I expected Worker Threads, Cluster, and Child Processes to solve different
// concurrency problems. Worker Threads should improve CPU-bound performance,
// Cluster should improve server scalability, and spawn() should execute
// external programs.
//
// What actually happened:
// The experiments demonstrated different concurrency models:
// - Worker Threads executed JavaScript in parallel.
// - Cluster created multiple Node.js processes.
// - spawn() executed an external operating system command.
//
// Main thread fib(35): measure with Date.now()
//   Worker thread fib(35): compare latency
//   Document when to pick workers vs cluster vs spawn.
//
// Why:
// Each concurrency primitive has a different purpose:
//
// • Worker Threads:
//   - CPU-intensive JavaScript work
//   - lightweight compared to processes
//   - optional shared memory via SharedArrayBuffer
//
// • Cluster:
//   - scale HTTP servers across CPU cores
//   - separate Node.js processes
//   - process isolation and fault tolerance
//
// • spawn():
//   - run external executables
//   - communicate through stdin/stdout/stderr
//   - suitable for integrating with system tools

function experiment6(): void {
  console.log("\n=== Experiment 6: compare concurrency models ===\n");
  console.log("  Main thread fib(35): measure with Date.now()");
  console.log("  Worker thread fib(35): compare latency");
  console.log("  Document when to pick workers vs cluster vs spawn.");
}

const experiments: Record<string, () => void | Promise<void>> = {
  "1": experiment1,
  "2": experiment2,
  "3": experiment3,
  "4": experiment4,
  "5": experiment5,
  "6": experiment6,
};

const arg = process.argv[2];

if (!arg || !experiments[arg]) {
  console.log(`
Usage:  pnpm --filter @app/api lab:05 <number>

  1  Worker Thread + MessagePort
  2  SharedArrayBuffer + Atomics
  3  Worker pool sketch
  4  cluster HTTP server (forks workers)
  5  child_process.spawn
  6  Compare models (notes + your measurements)
`);
  process.exit(0);
}

await experiments[arg]();
