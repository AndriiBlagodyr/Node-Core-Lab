/**
 * Lab 07 — Module Systems
 *
 * Run:  pnpm --filter @app/api lab:07 <number>
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
// An ES module should be able to use a CommonJS module and call its exported function.
//
// What actually happened:
// The CommonJS module was successfully loaded via createRequire(), and add(2, 3) returned 5.
// cjs.add(2,3): 5
//
// Why:
// ES modules do not have the built-in require() function, but createRequire() creates a CommonJS-compatible
// require bound to the current module. This allows ESM code to consume existing CommonJS packages.

function experiment1(): void {
  console.log("\n=== Experiment 1: ESM imports CJS ===\n");
  const cjs = require("./07-module-systems/cjs-add.cjs");
  console.log("  cjs.add(2,3):", cjs.add(2, 3));
}

// ─── Experiment 2 — conditional exports ─────────────────────────────────────
// What I expected:
// Importing the package should resolve its public entry point and expose the greet() function.
//
// What actually happened:
// The package loaded successfully using import(), and greet("Node") returned the expected greeting.
// greet(): hello Node
//
// Why:
// ES modules resolve package entry points through the package.json "exports" field. Conditional exports allow
// Node.js to provide different entry files depending on whether the package is imported via import or require.

async function experiment2(): Promise<void> {
  console.log("\n=== Experiment 2: conditional exports package ===\n");
  const pkg = await import("./07-module-systems/esm-pkg/index.js");
  console.log("  greet():", pkg.greet("Node"));
}

// ─── Experiment 3 — dual package hazard notes ───────────────────────────────
// What I expected:
// The package.json should define an "exports" field to control which modules are exposed.
//
// What actually happened:
// The package configuration was printed, along with a reminder about the dual package hazard.
//
// Why:
// If a package exposes separate CommonJS and ES Module implementations, Node may load two independent copies
// of the same package—one for require() and one for import(). This can break shared state and singleton objects.
// The "exports" field helps define a consistent public API and avoid this issue.

function experiment3(): void {
  console.log("\n=== Experiment 3: dual package hazard ===\n");
  const pkgPath = join(__dirname, "07-module-systems/esm-pkg/package.json");
  console.log(readFileSync(pkgPath, "utf8"));
  console.log("  Read Node docs on `exports` field to avoid duplicate instances.");
}

// ─── Experiment 4 — top-level await ─────────────────────────────────────────
// What I expected:
// Importing the module should wait until its top-level await completes before continuing execution.
//
// What actually happened:
// The import paused until the module finished its asynchronous initialization, then loadedAt was available.
//
// loadedAt: 2026-07-23T12:24:34.041Z

//   Read Node docs on `exports` field to avoid duplicate instances.
// Why:
// ES Modules support Top-Level Await. Node delays module evaluation and any dependent imports until the awaited
// operation completes, ensuring the module is fully initialized before it is used.

async function experiment4(): Promise<void> {
  console.log("\n=== Experiment 4: top-level await in imported module ===\n");
  const mod = await import("./07-module-systems/tla.mjs");
  console.log("  loadedAt:", mod.loadedAt);
}

// ─── Experiment 5 — import JSON ─────────────────────────────────────────────
// What I expected:
// The JSON file should be imported as a JavaScript object.
//
// What actually happened:
// The JSON file was successfully imported, and its contents were available through the module's default export.
//
// > @app/api@0.0.0 lab:07 /Users/andriiblagodyr/MyDocuments/Projects/Node-Core-Lab/apps/api
// > tsx labs/07-module-systems.ts "5"


// === Experiment 5: import JSON ===

//   sample: { lab: 'module-systems', version: 1 }
// Why:
// Modern Node.js supports JSON modules, but they must be imported with an import attribute
// (`with: { type: "json" }`). The parsed JSON object is exposed as the module's default export.
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
Usage:  pnpm --filter @app/api lab:07 <number>

  1  Import CommonJS from ESM (createRequire)
  2  ESM package with exports field
  3  Dual package hazard (read package.json)
  4  Top-level await module
  5  Import JSON with import attributes
`);
  process.exit(0);
}

await experiments[arg]();
