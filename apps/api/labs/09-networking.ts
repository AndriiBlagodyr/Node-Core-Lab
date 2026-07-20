/**
 * Lab 09 — Networking Primitives
 *
 * Run:  npx tsx apps/api/labs/09-networking.ts <number>
 */

import { createServer as createTcpServer } from "node:net";
import { createServer as createHttpServer } from "node:http";
import { createSocket } from "node:dgram";
import { request } from "node:http";

function listenRandom(server: { listen: (port: number, cb: () => void) => void }): Promise<number> {
  return new Promise((resolve) => {
    server.listen(0, () => {
      const addr = (server as unknown as { address: () => { port: number } }).address();
      resolve(addr.port);
    });
  });
}

// ─── Experiment 1 — TCP echo ────────────────────────────────────────────────
// What I expected:
// What actually happened:
// Why:

async function experiment1(): Promise<void> {
  console.log("\n=== Experiment 1: TCP echo ===\n");
  const server = createTcpServer((socket) => {
    socket.on("data", (data) => socket.write(data));
  });
  const port = await listenRandom(server);
  console.log(`  echo server on port ${port} — try: nc localhost ${port}`);
  setTimeout(() => server.close(), 500);
}

// ─── Experiment 2 — minimal HTTP server ─────────────────────────────────────
// What I expected:
// What actually happened:
// Why:

async function experiment2(): Promise<void> {
  console.log("\n=== Experiment 2: HTTP/1.1 server ===\n");
  const server = createHttpServer((req, res) => {
    console.log(`  ${req.method} ${req.url}`);
    res.writeHead(200, { "content-type": "text/plain" });
    res.end("hello http\n");
  });
  const port = await listenRandom(server);
  console.log(`  http://127.0.0.1:${port}/`);
  setTimeout(() => server.close(), 500);
}

// ─── Experiment 3 — UDP server ──────────────────────────────────────────────
// What I expected:
// What actually happened:
// Why:

async function experiment3(): Promise<void> {
  console.log("\n=== Experiment 3: UDP ===\n");
  const socket = createSocket("udp4");
  socket.on("message", (msg, rinfo) => {
    console.log(`  got "${msg}" from ${rinfo.address}:${rinfo.port}`);
  });
  await new Promise<void>((resolve) => socket.bind(0, resolve));
  const port = socket.address().port;
  console.log(`  UDP listening on ${port}`);
  socket.close();
}

// ─── Experiment 4 — chunked HTTP client ─────────────────────────────────────
// What I expected:
// What actually happened:
// Why:

async function experiment4(): Promise<void> {
  console.log("\n=== Experiment 4: HTTP client ===\n");
  const server = createHttpServer((_req, res) => {
    res.end("ok\n");
  });
  const port = await listenRandom(server);

  await new Promise<void>((resolve, reject) => {
    const req = request(
      { hostname: "127.0.0.1", port, method: "GET", path: "/" },
      (res) => {
        res.setEncoding("utf8");
        res.on("data", (c) => console.log("  body:", c.trim()));
        res.on("end", resolve);
      }
    );
    req.on("error", reject);
    req.end();
  });

  server.close();
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
Usage:  npx tsx apps/api/labs/09-networking.ts <number>

  1  TCP echo server
  2  Minimal HTTP/1.1 server
  3  UDP socket
  4  HTTP client request
`);
  process.exit(0);
}

await experiments[arg]();
