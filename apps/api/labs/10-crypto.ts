/**
 * Lab 10 — Crypto
 *
 * Run:  npx tsx apps/api/labs/10-crypto.ts <number>
 */

import {
  randomBytes,
  scryptSync,
  createSign,
  createVerify,
  createCipheriv,
  createDecipheriv,
  generateKeyPairSync,
} from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// ─── Experiment 1 — password hashing (scrypt; compare with argon2/bcrypt) ───
// What I expected:
// What actually happened:
// Why:

function experiment1(): void {
  console.log("\n=== Experiment 1: scrypt password hash ===\n");
  const password = "correct-horse-battery-staple";
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  console.log("  salt:", salt.toString("hex").slice(0, 16) + "...");
  console.log("  hash:", hash.toString("hex").slice(0, 16) + "...");
  console.log("  Roadmap also mentions argon2/bcrypt — try npm packages later.");
}

// ─── Experiment 2 — sign/verify without jwt library ─────────────────────────
// What I expected:
// What actually happened:
// Why:

function experiment2(): void {
  console.log("\n=== Experiment 2: createSign / createVerify ===\n");
  const { privateKey, publicKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
  });
  const payload = "user-123";
  const sign = createSign("RSA-SHA256");
  sign.update(payload);
  const signature = sign.sign(privateKey, "hex");

  const verify = createVerify("RSA-SHA256");
  verify.update(payload);
  console.log("  valid:", verify.verify(publicKey, signature, "hex"));
}

// ─── Experiment 3 — key rotation sketch ───────────────────────────────────────
// What I expected:
// What actually happened:
// Why:

function experiment3(): void {
  console.log("\n=== Experiment 3: symmetric key rotation ===\n");
  const keys = [randomBytes(32), randomBytes(32)];
  console.log("  key v1:", keys[0]!.toString("hex").slice(0, 12) + "...");
  console.log("  key v2:", keys[1]!.toString("hex").slice(0, 12) + "...");
  console.log("  Decrypt with key id stored alongside ciphertext in real apps.");
}

// ─── Experiment 4 — AES-256-GCM file encrypt/decrypt ──────────────────────────
// What I expected:
// What actually happened:
// Why:

function experiment4(): void {
  console.log("\n=== Experiment 4: AES-256-GCM ===\n");
  const key = randomBytes(32);
  const iv = randomBytes(12);
  const plain = readFileSync(fileURLToPath(import.meta.url), "utf8").slice(0, 200);

  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plain), cipher.final()]);
  const tag = cipher.getAuthTag();

  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

  console.log("  round-trip ok:", decrypted.toString("utf8") === plain);
}

const experiments: Record<string, () => void> = {
  "1": experiment1,
  "2": experiment2,
  "3": experiment3,
  "4": experiment4,
};

const arg = process.argv[2];

if (!arg || !experiments[arg]) {
  console.log(`
Usage:  npx tsx apps/api/labs/10-crypto.ts <number>

  1  scrypt password hash (compare with argon2/bcrypt later)
  2  RSA sign/verify without JWT library
  3  Symmetric key rotation sketch
  4  AES-256-GCM encrypt/decrypt
`);
  process.exit(0);
}

experiments[arg]();
