# Node.js Fundamentals Roadmap

## Goal

Build deep, hands-on understanding of the Node.js runtime itself before touching any web framework. Each section is a small lab. The output of every lab is one or more standalone scripts under `apps/api/labs/` that you can run with `node` or `tsx` and explain to anyone.

## How to Use This File

- Treat each item as a small experiment, not a feature.
- For every lab, write a short note at the top of the script: "What I expected", "What actually happened", "Why".
- Do not move to the next module of the backend roadmap until the related fundamentals lab is done.

## 1. Event Loop & Timers

### Tasks

- [X] Diagram the event loop phases: timers, pending callbacks, idle/prepare, poll, check, close.
- [X] Lab: print the order of `setTimeout(fn, 0)`, `setImmediate`, `process.nextTick`, `Promise.resolve().then`, and a sync log.
- [X] Lab: trigger phase-skip behavior with `setImmediate` inside an I/O callback vs inside the main module.
- [X] Lab: starve the event loop with a long sync loop and observe delayed timers.
- [X] Lab: starve the microtask queue with infinite `process.nextTick` and observe a hung process.

### Learning Outcomes

- [X] Explain the difference between microtasks and macrotasks in Node.
- [X] Explain why `setImmediate` and `setTimeout(fn, 0)` can fire in different orders depending on context.
- [X] Explain when `process.nextTick` is dangerous.

## 2. libuv & Thread Pool

### Tasks

- [ ] Lab: run multiple `crypto.pbkdf2` calls in parallel; measure how performance changes with `UV_THREADPOOL_SIZE=1,2,4,8`.
- [ ] Lab: run multiple `fs.readFile` calls in parallel and observe thread pool saturation.
- [ ] Lab: compare DNS resolution with `dns.lookup` (uses thread pool) vs `dns.resolve` (uses libuv async).

### Learning Outcomes

- [ ] List which built-in operations use the libuv thread pool.
- [ ] Explain how to detect thread pool saturation.

## 3. Streams & Backpressure

### Tasks

- [ ] Lab: build a `Readable` stream from an array.
- [ ] Lab: build a `Writable` stream that respects backpressure.
- [ ] Lab: build a `Transform` stream that uppercases lines.
- [ ] Lab: pipe a large file through gzip using `pipeline`.
- [ ] Lab: reproduce backpressure failure by ignoring `write()` return value, then fix it.
- [ ] Lab: convert a stream to async iterator and consume with `for await`.
- [ ] Lab: build a `Duplex` stream that wraps an in-memory queue.

### Learning Outcomes

- [ ] Explain `highWaterMark` and how it relates to backpressure.
- [ ] Explain why `pipeline` is preferred over manual `pipe`.
- [ ] Explain when to choose object mode streams.

## 4. Buffers & Binary Data

### Tasks

- [ ] Lab: build a Buffer of fixed size and write little-endian and big-endian integers.
- [ ] Lab: parse the first bytes of a real file and identify the magic header.
- [ ] Lab: convert between Buffer, `Uint8Array`, and `string` with different encodings.
- [ ] Lab: stream a file and compute SHA-256 incrementally without loading it all into memory.

### Learning Outcomes

- [ ] Explain when to use `Buffer.alloc` vs `Buffer.allocUnsafe`.
- [ ] Explain encoding pitfalls between UTF-8, latin1, and base64.

## 5. Concurrency Primitives

### Tasks

- [ ] Lab: spawn a Worker Thread to run a CPU-heavy function and pass data via `MessagePort`.
- [ ] Lab: use `SharedArrayBuffer` and `Atomics` for cross-worker counters.
- [ ] Lab: create a worker pool with N workers and a job queue.
- [ ] Lab: use `cluster` to fork the process and load-balance an HTTP server.
- [ ] Lab: use `child_process.spawn` to run `ffmpeg`-like external command and stream output.
- [ ] Lab: compare CPU usage and latency of single-thread vs cluster vs worker pool for a given workload.

### Learning Outcomes

- [ ] Explain when to choose Worker Threads, Cluster, or `child_process`.
- [ ] Explain why CPU work in the main thread breaks request latency.
- [ ] Explain memory implications of cluster vs threads.

## 6. AsyncLocalStorage & async_hooks

### Tasks

- [ ] Lab: build a request-scoped logger with `AsyncLocalStorage` that propagates a `requestId` through async calls.
- [ ] Lab: trace an async chain with `async_hooks` and print parent-child relations.
- [ ] Lab: integrate `AsyncLocalStorage` with a fake DB call and assert context survives `await` and `setTimeout`.

### Learning Outcomes

- [ ] Explain how `AsyncLocalStorage` is implemented under the hood.
- [ ] Explain context loss scenarios (callbacks, `EventEmitter`, native code).

## 7. Module Systems

### Tasks

- [ ] Lab: create a CommonJS package and import it from ESM.
- [ ] Lab: create an ESM package with `exports` field and conditional exports.
- [ ] Lab: reproduce the dual package hazard and fix it.
- [ ] Lab: use top-level `await` in ESM and observe how it affects module loading.
- [ ] Lab: load a JSON module via `import` assertions/attributes.

### Learning Outcomes

- [ ] Explain CJS module caching and circular dependencies.
- [ ] Explain ESM static analysis and why `require` cannot import ESM directly.
- [ ] Explain `exports`, `main`, `types`, and `imports` fields.

## 8. Error Handling

### Tasks

- [ ] Lab: trigger `unhandledRejection` and handle it.
- [ ] Lab: trigger `uncaughtException` and decide whether to crash or recover.
- [ ] Lab: use `AbortController` to cancel `fetch`, a stream, and a `setTimeout`.
- [ ] Lab: build a custom `Error` hierarchy with discriminated codes.
- [ ] Lab: wrap async functions to convert thrown errors into a `Result`/`Either` shape.

### Learning Outcomes

- [ ] Explain why `process.exit()` is dangerous in libraries.
- [ ] Explain the difference between operational and programmer errors.
- [ ] Explain why crashing on `uncaughtException` is often the safest option.

## 9. Networking Primitives

### Tasks

- [ ] Lab: build a minimal TCP echo server with `net`.
- [ ] Lab: build a minimal HTTP/1.1 server with `http`, parse a request manually.
- [ ] Lab: build a UDP server with `dgram`.
- [ ] Lab: write a tiny HTTP client that sends a chunked request body.

### Learning Outcomes

- [ ] Explain the lifecycle of a TCP socket in Node.
- [ ] Explain keep-alive, pipelining, and connection pooling.

## 10. Crypto

### Tasks

- [ ] Lab: hash a password with `argon2` and compare with `bcrypt`.
- [ ] Lab: sign and verify a JWT manually using `crypto.createSign` without any library.
- [ ] Lab: generate and rotate symmetric keys with `crypto.randomBytes`.
- [ ] Lab: encrypt and decrypt a file with AES-256-GCM and a derived key.

### Learning Outcomes

- [ ] Explain why `Math.random` is not safe for tokens.
- [ ] Explain the difference between MAC, signature, and hash.

## 11. Performance & Profiling

### Tasks

- [ ] Lab: profile CPU with `--inspect` and Chrome DevTools.
- [ ] Lab: capture and analyze a heap snapshot.
- [ ] Lab: detect a memory leak in a long-running script.
- [ ] Lab: produce a flame graph with `0x`.
- [ ] Lab: benchmark an HTTP endpoint with `autocannon`.
- [ ] Lab: run a `clinic.js doctor` session and explain its output.
- [ ] Lab: use `perf_hooks` to measure a hot path.

### Learning Outcomes

- [ ] Explain how to find a CPU bottleneck in a real Node service.
- [ ] Explain how to find a memory leak using snapshots.
- [ ] Explain typical V8 deoptimization causes.

## 12. Process & OS

### Tasks

- [ ] Lab: read environment, CPU, memory, and OS info via `os` and `process`.
- [ ] Lab: handle `SIGINT`, `SIGTERM`, and `SIGHUP` correctly.
- [ ] Lab: implement graceful shutdown for an HTTP server with in-flight requests.
- [ ] Lab: implement health, readiness, and liveness probes for a sample server.

### Learning Outcomes

- [ ] Explain the difference between liveness and readiness.
- [ ] Explain why graceful shutdown matters in Kubernetes-like environments.

## Recommended Reading

- Node.js official docs: Event Loop, Streams, Worker Threads, AsyncLocalStorage.
- "Node.js Design Patterns" by Mario Casciaro.
- libuv documentation: design overview.
- V8 blog: hidden classes, inline caches, deopts.
