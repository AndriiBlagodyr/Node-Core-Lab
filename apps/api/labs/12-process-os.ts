/**
 * Lab 12 — Process & OS
 *
 * Run:  npx tsx apps/api/labs/12-process-os.ts <number>
 *
 * Experiment 2 registers signal handlers. Experiment 3 starts a server — Ctrl+C to test shutdown.
 */

import { hostname, platform, totalmem, freemem, cpus } from "node:os";
import { createServer } from "node:http";

// ─── Experiment 1 — os + process info ───────────────────────────────────────
// What I expected:
// What actually happened:
// Why:

function experiment1(): void {
  console.log("\n=== Experiment 1: os + process ===\n");
  console.log("  platform:", platform(), "hostname:", hostname());
  console.log("  cpus:", cpus().length, "mem free/total MB:", freemem() / 1e6, "/", totalmem() / 1e6);
  console.log("  node:", process.version, "pid:", process.pid, "uptime:", process.uptime().toFixed(1) + "s");
}

// ─── Experiment 2 — signal handlers ─────────────────────────────────────────
// What I expected:
// What actually happened:
// Why:

function experiment2(): void {
  console.log("\n=== Experiment 2: signals ===\n");
  for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"] as const) {
    process.on(sig, () => console.log(`  received ${sig}`));
  }
  console.log("  Send signals or press Ctrl+C. Exit manually after observing.");
}

// ─── Experiment 3 — graceful HTTP shutdown ────────────────────────────────────
// What I expected:
// What actually happened:
// Why:

async function experiment3(): Promise<void> {
  console.log("\n=== Experiment 3: graceful shutdown ===\n");
  let inflight = 0;
  const server = createServer((_req, res) => {
    inflight++;
    setTimeout(() => {
      res.end("done\n");
      inflight--;
    }, 200);
  });

  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as { port: number }).port;
  console.log(`  http://127.0.0.1:${port}/ — Ctrl+C to shutdown`);

  const shutdown = () => {
    console.log("  closing server, inflight:", inflight);
    server.close(() => {
      console.log("  server closed");
      process.exit(0);
    });
  };
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}

// ─── Experiment 4 — health / readiness / liveness ───────────────────────────
// What I expected:
// What actually happened:
// Why:

async function experiment4(): Promise<void> {
  console.log("\n=== Experiment 4: probe endpoints ===\n");
  let ready = false;
  setTimeout(() => {
    ready = true;
  }, 300);

  const server = createServer((req, res) => {
    if (req.url === "/health/live") return res.end("alive\n");
    if (req.url === "/health/ready") return res.end(ready ? "ready\n" : "not-ready\n", ready ? 200 : 503);
    res.statusCode = 404;
    res.end("not found\n");
  });

  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as { port: number }).port;
  console.log(`  live:    curl http://127.0.0.1:${port}/health/live`);
  console.log(`  ready:   curl http://127.0.0.1:${port}/health/ready`);
  setTimeout(() => server.close(), 800);
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
Usage:  npx tsx apps/api/labs/12-process-os.ts <number>

  1  os + process info
  2  SIGINT / SIGTERM / SIGHUP handlers
  3  Graceful HTTP shutdown (Ctrl+C)
  4  Liveness + readiness probe routes
`);
  process.exit(0);
}

await experiments[arg]();
