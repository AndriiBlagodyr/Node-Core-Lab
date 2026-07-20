/**
 * Lab 03 — Streams & Backpressure
 *
 * Run:  npx tsx apps/api/labs/03-streams.ts <number>
 */

import {
  Readable,
  Writable,
  Transform,
  Duplex,
  pipeline,
} from "node:stream";
import { promisify } from "node:util";
import { createGzip } from "node:zlib";
import { createReadStream, createWriteStream, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const pipelineAsync = promisify(pipeline);
const __filename = fileURLToPath(import.meta.url);

// ─── Experiment 1 — Readable from array ─────────────────────────────────────
// What I expected:
// What actually happened:
// Why:

async function experiment1(): Promise<void> {
  console.log("\n=== Experiment 1: Readable from array ===\n");
  const src = Readable.from(["alpha\n", "beta\n", "gamma\n"]);
  src.on("data", (chunk) => process.stdout.write(`  chunk: ${chunk}`));
  await new Promise<void>((resolve) => src.on("end", resolve));
}

// ─── Experiment 2 — Writable with backpressure ──────────────────────────────
// What I expected:
// What actually happened:
// Why:

async function experiment2(): Promise<void> {
  console.log("\n=== Experiment 2: Writable backpressure ===\n");
  const out = new Writable({
    highWaterMark: 4,
    write(chunk, _enc, cb) {
      setTimeout(cb, 10);
    },
  });
  out.on("drain", () => console.log("  drain event"));
  for (let i = 0; i < 20; i++) {
    const ok = out.write(`line-${i}\n`);
    if (!ok) console.log(`  backpressure at write ${i}`);
  }
  out.end();
  await new Promise<void>((resolve) => out.on("finish", resolve));
}

// ─── Experiment 3 — Transform uppercases lines ─────────────────────────────
// What I expected:
// What actually happened:
// Why:

async function experiment3(): Promise<void> {
  console.log("\n=== Experiment 3: Transform stream ===\n");
  let buffer = "";
  const upper = new Transform({
    transform(chunk, _enc, cb) {
      buffer += chunk.toString();
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) this.push(line.toUpperCase() + "\n");
      cb();
    },
    flush(cb) {
      if (buffer) this.push(buffer.toUpperCase());
      cb();
    },
  });
  upper.pipe(process.stdout);
  upper.end("hello\nworld\n");
  await new Promise<void>((resolve) => upper.on("finish", resolve));
}

// ─── Experiment 4 — pipeline + gzip ─────────────────────────────────────────
// What I expected:
// What actually happened:
// Why:

async function experiment4(): Promise<void> {
  console.log("\n=== Experiment 4: pipeline + gzip ===\n");
  const outPath = join(tmpdir(), `lab03-gzip-${Date.now()}.gz`);
  await pipelineAsync(createReadStream(__filename), createGzip(), createWriteStream(outPath));
  console.log(`  Wrote ${outPath}`);
  unlinkSync(outPath);
}

// ─── Experiment 5 — backpressure failure vs fix ────────────────────────────
// What I expected:
// What actually happened:
// Why:

function experiment5(): void {
  console.log("\n=== Experiment 5: ignoring write() return value ===\n");
  console.log("  Read experiment2 output — compare with checking `write()` return value.");
  console.log("  Fix: pause source when write() returns false; resume on 'drain'.");
}

// ─── Experiment 6 — for await on stream ─────────────────────────────────────
// What I expected:
// What actually happened:
// Why:

async function experiment6(): Promise<void> {
  console.log("\n=== Experiment 6: for await...of ===\n");
  const src = Readable.from(["one", "two", "three"]);
  for await (const chunk of src) {
    console.log(`  ${chunk}`);
  }
}

// ─── Experiment 7 — Duplex in-memory queue ──────────────────────────────────
// What I expected:
// What actually happened:
// Why:

async function experiment7(): Promise<void> {
  console.log("\n=== Experiment 7: Duplex queue ===\n");
  const queue: string[] = [];
  const duplex = new Duplex({
    read() {
      if (queue.length === 0) {
        this.push(null);
        return;
      }
      this.push(queue.shift());
    },
    write(chunk, _enc, cb) {
      queue.push(chunk.toString());
      cb();
    },
  });
  duplex.pipe(process.stdout);
  duplex.end("queued-message\n");
  await new Promise<void>((resolve) => duplex.on("finish", resolve));
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
Usage:  npx tsx apps/api/labs/03-streams.ts <number>

  1  Readable from array
  2  Writable with backpressure
  3  Transform (uppercase lines)
  4  pipeline + gzip
  5  Backpressure failure vs fix (notes)
  6  for await...of
  7  Duplex in-memory queue
`);
  process.exit(0);
}

await experiments[arg]();
