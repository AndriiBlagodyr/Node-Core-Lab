# Event Loop Notes (Lab 01)

Optional notes for [Node.js Fundamentals → §1 Event Loop & Timers](../node-fundamentals-roadmap.md).

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

## Experiment notes

Copy the blocks from the lab file after each run.

### Experiment 1 — execution order

- What I expected:
- What actually happened:
- Why:

### Experiment 2 — I/O callback vs main module

- What I expected:
- What actually happened:
- Why:

### Experiment 3 — starving the event loop

- What I expected:
- What actually happened:
- Why:

### Experiment 4 — microtask starvation

- What I expected:
- What actually happened:
- Why:

## Learning outcomes (check when you can explain aloud)

- [ ] Microtasks vs macrotasks in Node
- [ ] Why `setImmediate` and `setTimeout(fn, 0)` order depends on context
- [ ] When `process.nextTick` is dangerous
