/**
 * Lab 12 — Process & OS
 *
 * Run:  pnpm --filter @app/api lab:12 <number>
 *
 * Experiment 2 registers signal handlers. Experiment 3 starts a server — Ctrl+C to test shutdown.
 */

import { hostname, platform, totalmem, freemem, cpus } from "node:os";
import { createServer } from "node:http";

// ─── Experiment 1 — os + process info ───────────────────────────────────────
// What I expected
// I expected the program to display information about the operating system, hardware,
// and the currently running Node.js process, including the platform, hostname, CPU count,
//  available memory, Node.js version, process ID, and uptime.

// What actually happened
// The application printed the current platform, hostname, number of CPU cores, free and
// total system memory, Node.js version, process ID, and the process uptime. The reported
// values matched the characteristics of the machine on which the program was executed.

  // platform: darwin hostname: MacBook-Pro-Andrii.local
  // cpus: 10 mem free/total MB: 133.513216 / 34359.738368
  // node: v24.14.1 pid: 72200 uptime: 0.4s

// Why
// The os module retrieves information directly from the operating system, while the global
// process object provides runtime information about the current Node.js process. These APIs
// expose system and process metadata for diagnostics and monitoring.

function experiment1(): void {
  console.log("\n=== Experiment 1: os + process ===\n");
  console.log("  platform:", platform(), "hostname:", hostname());
  console.log("  cpus:", cpus().length, "mem free/total MB:", freemem() / 1e6, "/", totalmem() / 1e6);
  console.log("  node:", process.version, "pid:", process.pid, "uptime:", process.uptime().toFixed(1) + "s");
}

// ─── Experiment 2 — signal handlers ─────────────────────────────────────────
// What I expected
// I expected the application to register handlers for SIGINT, SIGTERM, and SIGHUP, and
// to print a message whenever one of these signals was received.

// What actually happened
// Pressing Ctrl+C generated a SIGINT signal, and the application printed received SIGINT.
// Sending SIGTERM or SIGHUP from another terminal also triggered their respective handlers.

// Send signals or press Ctrl+C. Exit manually after observing.

// Why
// Signals are operating system notifications delivered to running processes. Registering
// listeners with process.on() allows the application to intercept these signals and execute
// custom logic before termination or reconfiguration.

function experiment2(): void {
  console.log("\n=== Experiment 2: signals ===\n");
  for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"] as const) {
    process.on(sig, () => console.log(`  received ${sig}`));
  }
  console.log("  Send signals or press Ctrl+C. Exit manually after observing.");
}

// ─── Experiment 3 — graceful HTTP shutdown ────────────────────────────────────
// What I expected
// I expected the HTTP server to stop accepting new connections after receiving a
// termination signal while allowing any active requests to finish before shutting down completely.

// What actually happened
// When Ctrl+C was pressed, the server logged the number of in-flight requests,
// stopped accepting new connections using server.close(), completed any pending requests,
// printed server closed, and exited cleanly.

// http://127.0.0.1:50969/ — Ctrl+C to shutdown

// Why
// The server.close() method prevents new connections while keeping existing ones active
// until they complete. This enables a graceful shutdown, minimizing interrupted requests
// and ensuring resources are released properly before the process exits.

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
// What I expected
// I expected the /health/live endpoint to always indicate that the application was running,
// while the /health/ready endpoint would initially report not-ready and later switch to
// ready after initialization.

// What actually happened
// Requests to /health/live always returned alive. Immediately after startup, /health/ready
// returned not-ready with an HTTP 503 status. After the initialization delay, it returned ready with an HTTP 200 status.

  // live:    curl http://127.0.0.1:51608/health/live
  // ready:   curl http://127.0.0.1:51608/health/ready

// Why
// The liveness endpoint simply verifies that the application process is running.
// The readiness endpoint reflects whether initialization has completed and whether
// the application is prepared to handle requests. This distinction is commonly used
// by orchestration platforms such as Kubernetes to determine when traffic should be
// routed to an application.

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
Usage:  pnpm --filter @app/api lab:12 <number>

  1  os + process info
  2  SIGINT / SIGTERM / SIGHUP handlers
  3  Graceful HTTP shutdown (Ctrl+C)
  4  Liveness + readiness probe routes
`);
  process.exit(0);
}

await experiments[arg]();
