/**
 * Lab 04 — Buffers & Binary Data
 *
 * Run:  pnpm --filter @app/api lab:04 <number>
 */

import { createHash } from "node:crypto";
import { createReadStream, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);

// ─── Experiment 1 — endian integers ─────────────────────────────────────────
// What I expected:
// What actually happened:
// Why:

function experiment1(): void {
  console.log("\n=== Experiment 1: little vs big endian ===\n");
  const buf = Buffer.alloc(8);
  buf.writeUInt32LE(0x01020304, 0);
  buf.writeUInt32BE(0x05060708, 4);
  console.log("  hex:", buf.toString("hex"));
  console.log("  LE @0:", buf.readUInt32LE(0).toString(16));
  console.log("  BE @4:", buf.readUInt32BE(4).toString(16));
}

// ─── Experiment 2 — magic bytes ─────────────────────────────────────────────
// What I expected:
// What actually happened:
// Why:

function experiment2(): void {
  console.log("\n=== Experiment 2: file magic header ===\n");
  const head = readFileSync(__filename).subarray(0, 16);
  console.log("  first 16 bytes (hex):", head.toString("hex"));
  console.log("  first 16 bytes (utf8 preview):", head.toString("utf8", 0, 8));
}

// ─── Experiment 3 — encodings ───────────────────────────────────────────────
// What I expected:
// What actually happened:
// Why:

function experiment3(): void {
  console.log("\n=== Experiment 3: Buffer / Uint8Array / string encodings ===\n");
  const text = "café 🚀";
  const utf8 = Buffer.from(text, "utf8");
  const u8 = new Uint8Array(utf8);
  console.log("  utf8 bytes:", utf8.length, "chars:", text.length);
  console.log("  base64:", utf8.toString("base64"));
  console.log("  round-trip:", Buffer.from(u8).toString("utf8"));
}

// ─── Experiment 4 — incremental SHA-256 ─────────────────────────────────────
// What I expected:
// What actually happened:
// Why:

async function experiment4(): Promise<void> {
  console.log("\n=== Experiment 4: streaming SHA-256 ===\n");
  const hash = createHash("sha256");
  await new Promise<void>((resolve, reject) => {
    createReadStream(__filename)
      .on("data", (chunk) => hash.update(chunk))
      .on("end", resolve)
      .on("error", reject);
  });
  console.log("  digest:", hash.digest("hex"));
}

const experiments: Record<string, () => void | Promise<void>> = {
  "1": experiment1,
  "2": experiment2,
  "3": experiment3,
  "4": experiment4,
};

const arg = process.argv[2];

if (!arg || !experiments[arg]) {
  console.log(`
Usage:  pnpm --filter @app/api lab:04 <number>

  1  Little-endian vs big-endian integers
  2  Read magic bytes from this file
  3  Buffer, Uint8Array, encodings
  4  Incremental SHA-256 over a file stream
`);
  process.exit(0);
}

await experiments[arg]();
