/**
 * Lab 05 — Concurrency Primitives
 *
 * Run:  npx tsx apps/api/labs/05-concurrency.ts <number>
 *
 * Experiment 4 (cluster) and 5 (spawn) spawn child processes — read output carefully.
 */

import { Worker, isMainThread, parentPort, workerData } from "node:worker_threads";
import cluster from "node:cluster";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { availableParallelism } from "node:os";

function fib(n: number): number {
  return n <= 1 ? n : fib(n - 1) + fib(n - 1);
}

// ─── Experiment 1 — Worker Thread + MessagePort ─────────────────────────────
// What I expected:
// What actually happened:
// Why:

async function experiment1(): Promise<void> {
  if (!isMainThread) {
    parentPort?.postMessage(fib(workerData.n));
    return;
  }

  console.log("\n=== Experiment 1: Worker Thread ===\n");
  const worker = new Worker(new URL(import.meta.url), { workerData: { n: 40 } });
  worker.on("message", (result) => console.log(`  fib(40) = ${result}`));
  await new Promise<void>((resolve) => worker.on("exit", resolve));
}

// ─── Experiment 2 — SharedArrayBuffer + Atomics ─────────────────────────────
// What I expected:
// What actually happened:
// Why:

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
// What actually happened:
// Why:

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
// What actually happened:
// Why:

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
// What actually happened:
// Why:

async function experiment5(): Promise<void> {
  console.log("\n=== Experiment 5: spawn echo ===\n");
  const child = spawn("echo", ["hello-from-spawn"]);
  child.stdout.on("data", (d) => process.stdout.write(`  stdout: ${d}`));
  await new Promise<void>((resolve) => child.on("close", resolve));
}

// ─── Experiment 6 — compare approaches (notes) ────────────────────────────
// What I expected:
// What actually happened:
// Why:

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
Usage:  npx tsx apps/api/labs/05-concurrency.ts <number>

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
