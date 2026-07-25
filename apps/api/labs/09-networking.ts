/**
 * Lab 09 — Networking Primitives
 *
 * Run:  pnpm --filter @app/api lab:09 <number>
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
// The TCP server would accept client connections and echo back every
// received message unchanged.

// What actually happened:
// The server accepted TCP connections, and every chunk received through
// the "data" event was immediately written back to the client.
// echo server on port 58505 — try: nc localhost 58505

// Why:
// TCP provides a reliable bidirectional byte stream. The server listens
// for incoming data on the socket and sends the same bytes back using
// socket.write(), implementing a simple echo server.

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
// The HTTP server would respond to every GET request with status 200
// and the text "hello http".

// What actually happened:
// The server logged the request method and URL, then returned a plain
// text response with HTTP status 200 and body "hello http".
// http://127.0.0.1:58878/

// Why:
// The node:http module parses the HTTP request, creates IncomingMessage
// and ServerResponse objects, and automatically handles the HTTP protocol
// over an underlying TCP connection.

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
// The UDP socket would start listening for datagrams and print every
// received message together with the sender's address.

// What actually happened:
// The socket successfully bound to a random port and became ready to
// receive UDP packets. Since no datagram was sent before closing, no
// "message" event was triggered.
// UDP listening on 60110

// Why:
// UDP is connectionless, so binding only opens the socket for receiving
// datagrams. Messages appear only if another process explicitly sends
// a UDP packet to the listening port.

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
// The HTTP client would send a GET request, receive the server response,
// print the body, and finish after the response ended.

// What actually happened:
// The request was sent after req.end(). The client received the response
// as a stream, printed "ok", waited for the "end" event, and then closed
// the server.
// body: ok

// Why:
// In Node.js, HTTP responses are Readable Streams. Even a very small
// response is delivered through "data" and "end" events, allowing the
// same API to efficiently handle both tiny and very large responses.

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
Usage:  pnpm --filter @app/api lab:09 <number>

  1  TCP echo server
  2  Minimal HTTP/1.1 server
  3  UDP socket
  4  HTTP client request
`);
  process.exit(0);
}

await experiments[arg]();
