# Event Loop Notes (Lab 01)

Reference note for [Node.js Fundamentals → §1 Event Loop & Timers](../node-fundamentals-roadmap.md#1-event-loop--timers). The per-experiment "expected / happened / why" notes live in the lab script itself.

Lab script: [`apps/api/labs/01-event-loop.ts`](../../apps/api/labs/01-event-loop.ts)

## Diagram — event loop phases

Draw or describe the six phases in order:

1. **timers** — `setTimeout`, `setInterval`
2. **pending callbacks** — I/O callbacks deferred from previous cycle
3. **idle, prepare** — internal libuv work
4. **poll** — fetch new I/O events; execute I/O callbacks
5. **check** — `setImmediate` callbacks
6. **close callbacks** — e.g. `socket.on('close')`

Between each phase, Node drains the **microtask queue** (`process.nextTick`, Promise `.then`).
