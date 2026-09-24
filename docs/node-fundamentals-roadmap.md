# Node.js Fundamentals Roadmap

## Goal

Build deep, hands-on understanding of the Node.js runtime itself before touching any web framework. Each section is a small lab. The output of every lab is one or more standalone scripts under `apps/api/labs/` that you can run with `node` or `tsx` and explain to anyone.

## Status

✅ **All 12 labs are done.** Every script has "What I expected / What actually happened / Why" notes per experiment. Tasks are ticked from the code. Learning Outcomes are a self-check, so tick them only when you can explain them aloud without the lab open.

## How to Use This File

- Treat each item as a small experiment, not a feature.
- Every experiment carries a note in the script: "What I expected", "What actually happened", "Why".
- Before starting a backend module, re-read the labs listed in its "Uses labs" column in the [Stage Map](./project-roadmap.md#stage-map).
- `lab:11:inspect` uses POSIX `NODE_OPTIONS=...` syntax. On Windows PowerShell, run `$env:NODE_OPTIONS='--inspect'; pnpm --filter @app/api lab:11 <n>` instead.

## 1. Event Loop & Timers

Script: [`apps/api/labs/01-event-loop.ts`](../apps/api/labs/01-event-loop.ts) · Run: `pnpm --filter @app/api lab:01 <n>` · Used in: M4 (CPU work off the loop), M10 (event-loop lag metrics)

### Tasks

- [x] Diagram the event loop phases: timers, pending callbacks, idle/prepare, poll, check, close.
- [x] Lab: print the order of `setTimeout(fn, 0)`, `setImmediate`, `process.nextTick`, `Promise.resolve().then`, and a sync log.
- [x] Lab: trigger phase-skip behavior with `setImmediate` inside an I/O callback vs inside the main module.
- [x] Lab: starve the event loop with a long sync loop and observe delayed timers.
- [x] Lab: starve the microtask queue with infinite `process.nextTick` and observe a hung process.

### Learning Outcomes

- [x] Explain the difference between microtasks and macrotasks in Node.
- [x] Explain why `setImmediate` and `setTimeout(fn, 0)` can fire in different orders depending on context.
- [x] Explain when `process.nextTick` is dangerous.

## 2. libuv & Thread Pool

Script: [`apps/api/labs/02-libuv-thread-pool.ts`](../apps/api/labs/02-libuv-thread-pool.ts) · Run: `pnpm --filter @app/api lab:02 <n>` · Used in: M1 (argon2 hashing on the thread pool)

### Tasks

- [x] Lab: run multiple `crypto.pbkdf2` calls in parallel; measure how performance changes with `UV_THREADPOOL_SIZE=1,2,4,8`.
- [x] Lab: run multiple `fs.readFile` calls in parallel and observe thread pool saturation.
- [x] Lab: compare DNS resolution with `dns.lookup` (uses thread pool) vs `dns.resolve` (uses libuv async).

### Learning Outcomes

- [ ] List which built-in operations use the libuv thread pool.
- [ ] Explain how to detect thread pool saturation.

## 3. Streams & Backpressure

Script: [`apps/api/labs/03-streams.ts`](../apps/api/labs/03-streams.ts) · Run: `pnpm --filter @app/api lab:03 <n>` · Used in: M3

### Tasks

- [x] Lab: build a `Readable` stream from an array.
- [x] Lab: build a `Writable` stream that respects backpressure.
- [x] Lab: build a `Transform` stream that uppercases lines.
- [x] Lab: pipe a large file through gzip using `pipeline`.
- [x] Lab: reproduce backpressure failure by ignoring `write()` return value, then fix it.
- [x] Lab: convert a stream to async iterator and consume with `for await`.
- [x] Lab: build a `Duplex` stream that wraps an in-memory queue.

### Learning Outcomes

- [ ] Explain `highWaterMark` and how it relates to backpressure.
- [ ] Explain why `pipeline` is preferred over manual `pipe`.
- [ ] Explain when to choose object mode streams.

## 4. Buffers & Binary Data

Script: [`apps/api/labs/04-buffers.ts`](../apps/api/labs/04-buffers.ts) · Run: `pnpm --filter @app/api lab:04 <n>` · Used in: M3 (magic bytes, SHA-256)

### Tasks

- [x] Lab: build a Buffer of fixed size and write little-endian and big-endian integers.
- [x] Lab: parse the first bytes of a real file and identify the magic header.
- [x] Lab: convert between Buffer, `Uint8Array`, and `string` with different encodings.
- [x] Lab: stream a file and compute SHA-256 incrementally without loading it all into memory.

### Learning Outcomes

- [ ] Explain when to use `Buffer.alloc` vs `Buffer.allocUnsafe`.
- [ ] Explain encoding pitfalls between UTF-8, latin1, and base64.

## 5. Concurrency Primitives

Script: [`apps/api/labs/05-concurrency.ts`](../apps/api/labs/05-concurrency.ts) · Run: `pnpm --filter @app/api lab:05 <n>` · Used in: M3 (sharp in a worker), M4

### Tasks

- [x] Lab: spawn a Worker Thread to run a CPU-heavy function and pass data via `MessagePort`.
- [x] Lab: use `SharedArrayBuffer` and `Atomics` for cross-worker counters.
- [x] Lab: create a worker pool with N workers and a job queue.
- [x] Lab: use `cluster` to fork the process and load-balance an HTTP server.
- [x] Lab: use `child_process.spawn` to run `ffmpeg`-like external command and stream output.
- [x] Lab: compare CPU usage and latency of single-thread vs cluster vs worker pool for a given workload.

### Learning Outcomes

- [ ] Explain when to choose Worker Threads, Cluster, or `child_process`.
- [ ] Explain why CPU work in the main thread breaks request latency.
- [ ] Explain memory implications of cluster vs threads.

## 6. AsyncLocalStorage & async_hooks

Script: [`apps/api/labs/06-async-local-storage.ts`](../apps/api/labs/06-async-local-storage.ts) · Run: `pnpm --filter @app/api lab:06 <n>` · Used in: Foundation (`lib/request-context.ts`)

### Tasks

- [x] Lab: build a request-scoped logger with `AsyncLocalStorage` that propagates a `requestId` through async calls.
- [x] Lab: trace an async chain with `async_hooks` and print parent-child relations.
- [x] Lab: integrate `AsyncLocalStorage` with a fake DB call and assert context survives `await` and `setTimeout`.

### Learning Outcomes

- [ ] Explain how `AsyncLocalStorage` is implemented under the hood.
- [ ] Explain context loss scenarios (callbacks, `EventEmitter`, native code).

## 7. Module Systems

Script: [`apps/api/labs/07-module-systems.ts`](../apps/api/labs/07-module-systems.ts) · Run: `pnpm --filter @app/api lab:07 <n>` · Used in: M13

### Tasks

- [x] Lab: create a CommonJS package and import it from ESM.
- [x] Lab: create an ESM package with `exports` field and conditional exports.
- [x] Lab: reproduce the dual package hazard and fix it.
- [x] Lab: use top-level `await` in ESM and observe how it affects module loading.
- [x] Lab: load a JSON module via `import` assertions/attributes.

### Learning Outcomes

- [ ] Explain CJS module caching and circular dependencies.
- [ ] Explain ESM static analysis and why `require` cannot import ESM directly.
- [ ] Explain `exports`, `main`, `types`, and `imports` fields.

## 8. Error Handling

Script: [`apps/api/labs/08-error-handling.ts`](../apps/api/labs/08-error-handling.ts) · Run: `pnpm --filter @app/api lab:08 <n>` · Used in: Foundation (`domain/errors.ts`), M4 (AbortController)

### Tasks

- [x] Lab: trigger `unhandledRejection` and handle it.
- [x] Lab: trigger `uncaughtException` and decide whether to crash or recover.
- [x] Lab: use `AbortController` to cancel `fetch`, a stream, and a `setTimeout`.
- [x] Lab: build a custom `Error` hierarchy with discriminated codes.
- [x] Lab: wrap async functions to convert thrown errors into a `Result`/`Either` shape.

### Learning Outcomes

- [ ] Explain why `process.exit()` is dangerous in libraries.
- [ ] Explain the difference between operational and programmer errors.
- [ ] Explain why crashing on `uncaughtException` is often the safest option.

## 9. Networking Primitives

Script: [`apps/api/labs/09-networking.ts`](../apps/api/labs/09-networking.ts) · Run: `pnpm --filter @app/api lab:09 <n>` · Used in: M5

### Tasks

- [x] Lab: build a minimal TCP echo server with `net`.
- [x] Lab: build a minimal HTTP/1.1 server with `http`, parse a request manually.
- [x] Lab: build a UDP server with `dgram`.
- [x] Lab: write a tiny HTTP client that sends a chunked request body.

### Learning Outcomes

- [ ] Explain the lifecycle of a TCP socket in Node.
- [ ] Explain keep-alive, pipelining, and connection pooling.

## 10. Crypto

Script: [`apps/api/labs/10-crypto.ts`](../apps/api/labs/10-crypto.ts) · Run: `pnpm --filter @app/api lab:10 <n>` · Used in: M1, M7 (HMAC)

### Tasks

- [x] Lab: hash a password with `argon2` and compare with `bcrypt`. *(Done with built-in `scrypt`; argon2id is revisited in M1.)*
- [x] Lab: sign and verify a JWT manually using `crypto.createSign` without any library.
- [x] Lab: generate and rotate symmetric keys with `crypto.randomBytes`.
- [x] Lab: encrypt and decrypt a file with AES-256-GCM and a derived key.

### Learning Outcomes

- [ ] Explain why `Math.random` is not safe for tokens.
- [ ] Explain the difference between MAC, signature, and hash.

## 11. Performance & Profiling

Script: [`apps/api/labs/11-profiling.ts`](../apps/api/labs/11-profiling.ts) · Run: `pnpm --filter @app/api lab:11 <n>` · Used in: M10, M11

### Tasks

- [x] Lab: profile CPU with `--inspect` and Chrome DevTools.
- [x] Lab: capture and analyze a heap snapshot.
- [x] Lab: detect a memory leak in a long-running script.
- [x] Lab: produce a flame graph with `0x`.
- [x] Lab: benchmark an HTTP endpoint with `autocannon`.
- [x] Lab: run a `clinic.js doctor` session and explain its output.
- [x] Lab: use `perf_hooks` to measure a hot path.

### Learning Outcomes

- [ ] Explain how to find a CPU bottleneck in a real Node service.
- [ ] Explain how to find a memory leak using snapshots.
- [ ] Explain typical V8 deoptimization causes.

## 12. Process & OS

Script: [`apps/api/labs/12-process-os.ts`](../apps/api/labs/12-process-os.ts) · Run: `pnpm --filter @app/api lab:12 <n>` · Used in: Foundation (`server.ts`, `routes/health.ts`), M12

### Tasks

- [x] Lab: read environment, CPU, memory, and OS info via `os` and `process`.
- [x] Lab: handle `SIGINT`, `SIGTERM`, and `SIGHUP` correctly.
- [x] Lab: implement graceful shutdown for an HTTP server with in-flight requests.
- [x] Lab: implement health, readiness, and liveness probes for a sample server.

### Learning Outcomes

- [ ] Explain the difference between liveness and readiness.
- [ ] Explain why graceful shutdown matters in Kubernetes-like environments.

## Recommended Reading

- Node.js official docs: Event Loop, Streams, Worker Threads, AsyncLocalStorage.
- "Node.js Design Patterns" by Mario Casciaro.
- libuv documentation: design overview.
- V8 blog: hidden classes, inline caches, deopts.
