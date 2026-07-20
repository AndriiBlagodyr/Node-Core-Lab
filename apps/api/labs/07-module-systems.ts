/**
 * Lab 07 — Module Systems
 *
 * Run:  npx tsx apps/api/labs/07-module-systems.ts <number>
 *
 * Supporting files live in labs/07-module-systems/
 */

import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// ─── Experiment 1 — import CJS from ESM ─────────────────────────────────────
// What I expected:
// What actually happened:
// Why:

function experiment1(): void {
  console.log("\n=== Experiment 1: ESM imports CJS ===\n");
  const cjs = require("./07-module-systems/cjs-add.cjs");
  console.log("  cjs.add(2,3):", cjs.add(2, 3));
}

// ─── Experiment 2 — conditional exports ─────────────────────────────────────
// What I expected:
// What actually happened:
// Why:

async function experiment2(): Promise<void> {
  console.log("\n=== Experiment 2: conditional exports package ===\n");
  const pkg = await import("./07-module-systems/esm-pkg/index.js");
  console.log("  greet():", pkg.greet("Node"));
}

// ─── Experiment 3 — dual package hazard notes ───────────────────────────────
// What I expected:
// What actually happened:
// Why:

function experiment3(): void {
  console.log("\n=== Experiment 3: dual package hazard ===\n");
  const pkgPath = join(__dirname, "07-module-systems/esm-pkg/package.json");
  console.log(readFileSync(pkgPath, "utf8"));
  console.log("  Read Node docs on `exports` field to avoid duplicate instances.");
}

// ─── Experiment 4 — top-level await ─────────────────────────────────────────
// What I expected:
// What actually happened:
// Why:

async function experiment4(): Promise<void> {
  console.log("\n=== Experiment 4: top-level await in imported module ===\n");
  const mod = await import("./07-module-systems/tla.mjs");
  console.log("  loadedAt:", mod.loadedAt);
}

// ─── Experiment 5 — import JSON ─────────────────────────────────────────────
// What I expected:
// What actually happened:
// Why:

async function experiment5(): Promise<void> {
  console.log("\n=== Experiment 5: import JSON ===\n");
  const data = await import("./07-module-systems/sample.json", {
    with: { type: "json" },
  });
  console.log("  sample:", data.default);
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
Usage:  npx tsx apps/api/labs/07-module-systems.ts <number>

  1  Import CommonJS from ESM (createRequire)
  2  ESM package with exports field
  3  Dual package hazard (read package.json)
  4  Top-level await module
  5  Import JSON with import attributes
`);
  process.exit(0);
}

await experiments[arg]();
