/**
 * Lab 03 — Streams & Backpressure
 *
 * Run:  pnpm --filter @app/api lab:03 <number>
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
// Three chunks printed in order: alpha, beta, gamma.

// What actually happened:
//   chunk: alpha
//   chunk: beta
//   chunk: gamma

// Why:
// Readable.from() wraps an iterable in a Readable stream. Listening to the
// "data" event puts the stream in flowing mode: chunks are emitted as they
// become available, then "end" fires when the source is exhausted.

async function experiment1(): Promise<void> {
  console.log("\n=== Experiment 1: Readable from array ===\n");
  const src = Readable.from(["alpha\n", "beta\n", "gamma\n"]);
  src.on("data", (chunk) => process.stdout.write(`  chunk: ${chunk}`));
  await new Promise<void>((resolve) => src.on("end", resolve));
}

// ─── Experiment 2 — Writable with backpressure ──────────────────────────────
// What I expected:
// write() would return false once the internal buffer exceeds highWaterMark (4
// bytes). Without pausing, every write would log backpressure.

// What actually happened:
// backpressure at write 0 … backpressure at write 19 (all 20 writes).
// Slow async write (setTimeout 10ms) keeps the buffer full; we never pause.

// Why:
// highWaterMark: 4 sets the buffer threshold in bytes. Each "line-N\n" is 7
// bytes, so the first write already exceeds the limit and write() returns
// false. This code ignores false and keeps calling write(), so chunks queue in
// memory instead of waiting for "drain". That is the backpressure failure this
// lab demonstrates — fix in experiment 5 (experiment2Fixed).

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
// HELLO and WORLD on separate lines.

// What actually happened:
// HELLO
// WORLD

// Why:
// Transform runs chunk-by-chunk (streaming), not after buffering the whole
// input. The transform keeps a partial-line buffer: split on "\n", uppercase
// complete lines, keep the last fragment until more data or flush().

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
// A .gz file written under the OS temp directory, then deleted.

// What actually happened:
// Wrote /var/folders/.../T/lab03-gzip-<timestamp>.gz (path varies by OS/run).

// Why:
// pipeline(readable, transform, writable) wires the chain and forwards errors;
// promisify(pipeline) resolves when all streams finish. createReadStream reads
// this lab file, createGzip compresses chunks as they flow, createWriteStream
// writes to disk. unlinkSync removes the temp file after the demo. Prefer
// pipeline over manual .pipe() because it handles cleanup and error propagation.

async function experiment4(): Promise<void> {
  console.log("\n=== Experiment 4: pipeline + gzip ===\n");
  const outPath = join(tmpdir(), `lab03-gzip-${Date.now()}.gz`);
  await pipelineAsync(createReadStream(__filename), createGzip(), createWriteStream(outPath));
  console.log(`  Wrote ${outPath}`);
  unlinkSync(outPath);
}

// ─── Experiment 5 — backpressure failure vs fix ────────────────────────────
// What I expected:
// Experiment 2 (broken): ignoring write() === false buffers all chunks in memory.
// Fixed version: pause when write() returns false; resume on "drain".

// What actually happened:
// Broken (lab:03 2): backpressure logged on writes 0–19; no pause/resume.
// Fixed (lab:03 5): pauses at backpressure, resumes after drain, finishes cleanly.

// Why:
// write() returns false when the stream's internal buffer is at or above
// highWaterMark — that is a hard signal to stop producing data, not a hint.
// Ignoring it lets the producer outrun the consumer and grow memory without
// bound under load. The fix: stop writing when false, call writeNext() again
// on "drain" when the buffer empties.

async function experiment2Fixed(): Promise<void> {
  console.log("\n=== Experiment 5 (fix): Writable backpressure ===\n");

  const out = new Writable({
    highWaterMark: 4,
    write(chunk, _enc, cb) {
      setTimeout(cb, 10);
    },
  });

  out.on("drain", () => console.log("  [EVENT] drain: buffer is empty now!"));

  let i = 0;
  const totalWrites = 20;

  await new Promise<void>((resolve) => {
    function writeNext() {
      let ok = true;

      while (i < totalWrites && ok) {
        ok = out.write(`line-${i}\n`);

        if (!ok) {
          console.log(`  backpressure at write ${i} -> PAUSING source`);
        }
        i++;
      }

      if (i < totalWrites) {
        out.once("drain", () => {
          console.log("  [FIX] Resuming write after drain");
          writeNext();
        });
      } else {
        out.end();
      }
    }

    out.on("finish", () => resolve());
    writeNext();
  });

  console.log("  All writes successfully finished securely!");
}

async function experiment5(): Promise<void> {
  console.log("\n=== Experiment 5: backpressure failure vs fix ===\n");
  console.log("  Broken pattern: see experiment 2 (ignores write() return value).");
  console.log("  Running fixed pattern below...\n");
  await experiment2Fixed();
}

// ─── Experiment 6 — for await on stream ─────────────────────────────────────
// What I expected:
// one, two, three printed one per line.

// What actually happened:
//   one
//   two
//   three

// Why:
// Readable streams implement Symbol.asyncIterator. for await...of consumes
// chunks asynchronously: each iteration waits for the next chunk, then pauses
// until the loop body finishes. Cleaner than manual "data" handlers for
// sequential processing; backpressure is respected when the consumer is slow.

async function experiment6(): Promise<void> {
  console.log("\n=== Experiment 6: for await...of ===\n");
  const src = Readable.from(["one", "two", "three"]);
  for await (const chunk of src) {
    console.log(`  ${chunk}`);
  }
}

// ─── Experiment 7 — Duplex in-memory queue ──────────────────────────────────
// What I expected:
// "queued-message" written to stdout via the Duplex read side.

// What actually happened:
// queued-message

// Why:
// A Duplex stream has separate read and write sides. write() stores chunks in
// an in-memory queue; read() shifts from the queue into the readable side.
// duplex.end() feeds the writable side; .pipe(process.stdout) pulls from the
// readable side — one stream object, two independent buffers/interfaces.

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
Usage:  pnpm --filter @app/api lab:03 <number>

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

// ─── Learning outcomes (Lab 03) ─────────────────────────────────────────────
// highWaterMark: buffer threshold (bytes or object count in object mode). When
// internal buffer ≥ highWaterMark, write() returns false → pause the producer.
// pipeline: preferred over raw pipe — forwards errors and cleans up on failure.
// Object mode: { objectMode: true } when chunks are JS objects, not Buffers;
// use for discrete records; byte mode for files/network binary data.

