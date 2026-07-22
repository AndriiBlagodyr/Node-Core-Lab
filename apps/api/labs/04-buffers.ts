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
// Writing with writeUInt32LE() should store the value in little-endian order,
// and writing with writeUInt32BE() should store it in big-endian order.
// Reading the values back with the matching methods should return the original numbers.
//
// What actually happened:
// Console output:
//   hex: 0403020105060708
//   LE @0: 1020304
//   BE @4: 5060708
//
// The first 4 bytes were written as 04 03 02 01 in little-endian order,
// and the next 4 bytes were written as 05 06 07 08 in big-endian order.
//
// Why:
// Endianness defines the order in which bytes are stored for a numeric value.
// Little-endian stores the least significant byte first, while big-endian stores
// the most significant byte first. The same byte order must be used when reading
// and writing the data, otherwise the value will be interpreted incorrectly.

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
// I expected to see the first bytes of the file, which are often used as a
// simple header or signature. Since this is a TypeScript source file rather than
// a binary format, I expected the first bytes to represent the opening text of
// the file.
//
// What actually happened:
// The output was:
//
// first 16 bytes (hex): 2f2a2a0d0a202a204c616220303420e2
// first 16 bytes (utf8 preview): /**
//  *
//
// The bytes correspond to the opening comment characters in the file ("/**"),
// followed by the newline and spacing used in the source file.
//
// Why:
// readFileSync() without an encoding returns a Buffer containing the raw bytes
// of the file. subarray(0, 16) selects the first 16 bytes, and toString("hex")
// shows them in hexadecimal form. toString("utf8") interprets the same bytes as
// UTF-8 text.
//
// The first bytes of a file are often referred to as magic bytes or a magic
// header. Binary formats use them to identify the file type, but a plain text
// source file simply begins with its own text content.

function experiment2(): void {
  console.log("\n=== Experiment 2: file magic header ===\n");
  const head = readFileSync(__filename).subarray(0, 16);
  console.log("  first 16 bytes (hex):", head.toString("hex"));
  console.log("  first 16 bytes (utf8 preview):", head.toString("utf8", 0, 8));
}

// ─── Experiment 3 — encodings ───────────────────────────────────────────────
// What I expected:
// I expected Buffer.from() to convert the string into UTF-8 bytes.
// Because UTF-8 uses a variable number of bytes per character, the byte count
// should be larger than the character count for this string. I also expected
// the round-trip through Uint8Array to preserve the original text.
//
// What actually happened:
// The output was:
//
// utf8 bytes: 10 chars: 7
// base64: Y2Fmw6kg8J+agA==
// round-trip: café 🚀
//
// The string has 7 visible characters, but its UTF-8 representation uses 10 bytes.
// The conversion through Uint8Array preserved the original text.
//
// Why:
// Buffer stores raw bytes, while JavaScript strings store text. UTF-8 is a
// variable-length encoding, so some characters require more than one byte.
//
// In this example:
// - ASCII characters such as c, a, f, and space use 1 byte each.
// - "é" uses 2 bytes.
// - "🚀" uses 4 bytes.
//
// Base64 is a text representation of binary data and is often used when binary
// data needs to be transmitted through systems that expect text.
// Uint8Array uses the same bytes, so converting between Buffer and Uint8Array
// preserves the data.

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
// I expected the file to be processed incrementally using a stream so that the
// hash could be computed chunk by chunk instead of loading the entire file into
// memory at once.
//
// What actually happened:
// The file was read with createReadStream(), and each chunk was passed to
// hash.update(). After the stream finished, digest("hex") returned the final
// SHA-256 hash:
//
// digest: 0eaa7ddc65f615a516593f6b1d7b0746a40e0d4cf90b1ab6c0f1dc587f8a2c70
//
// Why:
// Hashing works by processing data sequentially. The hash object keeps internal
// state and updates it as each chunk arrives, which makes this approach memory
// efficient for large files.
//
// createReadStream() reads the file in multiple Buffer chunks, so the file does
// not need to be fully loaded into memory before hashing begins. Calling
// hash.digest("hex") finalizes the computation and returns the final hash.

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
