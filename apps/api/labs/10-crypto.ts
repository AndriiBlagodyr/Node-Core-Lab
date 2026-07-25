/**
 * Lab 10 — Crypto
 *
 * Run:  pnpm --filter @app/api lab:10 <number>
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
// The same password would be transformed into a secure hash using a random
// salt, producing a different hash each time while remaining suitable for
// password verification.

// What actually happened:
// A random salt was generated, and scrypt produced a 64-byte hash. Running
// the experiment again generated a different salt and therefore a different
// hash, even though the password was unchanged.

// salt: 4c1dd02af15cc001...
// hash: ca56a7b52522201d...
// Roadmap also mentions argon2/bcrypt — try npm packages later.

// Why:
// Scrypt combines the password with a random salt and performs a
// computationally and memory-intensive key derivation. The random salt
// prevents identical passwords from producing identical hashes, while the
// algorithm's cost slows brute-force attacks.

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
// A message signed with the private RSA key would successfully verify using
// the corresponding public key.

// What actually happened:
// The payload was signed with createSign(), and createVerify() confirmed
// that the signature was valid when verified with the matching public key.
// valid: true

// Why:
// RSA digital signatures use asymmetric cryptography. Only the private key
// can generate a valid signature, while anyone with the corresponding
// public key can verify the authenticity and integrity of the message.

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
// Multiple encryption keys would represent different key versions, allowing
// applications to encrypt new data with the latest key while still
// decrypting older data using previous keys.

// What actually happened:
// Two random 256-bit symmetric keys were generated to simulate different
// key versions. The example prints abbreviated key values and notes that a
// key identifier should be stored with encrypted data.

// key v1: 839d32d6af5b...
// key v2: 3c9f031bac59...
// Decrypt with key id stored alongside ciphertext in real apps.

// Why:
// Key rotation limits the impact of a compromised key and supports periodic
// replacement. Storing a key ID with the ciphertext allows applications to
// select the correct key for decryption after new keys have been introduced.

function experiment3(): void {
  console.log("\n=== Experiment 3: symmetric key rotation ===\n");
  const keys = [randomBytes(32), randomBytes(32)];
  console.log("  key v1:", keys[0]!.toString("hex").slice(0, 12) + "...");
  console.log("  key v2:", keys[1]!.toString("hex").slice(0, 12) + "...");
  console.log("  Decrypt with key id stored alongside ciphertext in real apps.");
}

// ─── Experiment 4 — AES-256-GCM file encrypt/decrypt ──────────────────────────
// What I expected:
// The file content would be encrypted using AES-256-GCM and successfully
// decrypted back to its original form using the same key, IV, and
// authentication tag.

// What actually happened:
// The plaintext was encrypted, an authentication tag was generated, and the
// decrypted output matched the original input, resulting in a successful
// round-trip.

// round-trip ok: true

// Why:
// AES-256-GCM provides authenticated encryption. Besides encrypting the
// data, it generates an authentication tag that verifies integrity during
// decryption. If the ciphertext, key, IV, or tag were modified, decryption
// would fail.

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
Usage:  pnpm --filter @app/api lab:10 <number>

  1  scrypt password hash (compare with argon2/bcrypt later)
  2  RSA sign/verify without JWT library
  3  Symmetric key rotation sketch
  4  AES-256-GCM encrypt/decrypt
`);
  process.exit(0);
}

experiments[arg]();
