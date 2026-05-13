# Contract: Real-time Chat & WebSockets

> Stub. Fill this contract during Phase A of the Chat module before any
> frontend or backend work begins. Use [`_template.md`](./_template.md) as the
> canonical structure.

## Status

- Phase A status: Not started.
- Last updated: TBD.
- Owners: backend, frontend.

## Linked Documents

- Backend module: [`backend-roadmap.md` → Module 5: Real-time Chat & WebSockets](../backend-roadmap.md#module-5-real-time-chat--websockets).
- Frontend module: [`frontend-roadmap.md` → Module 5: Real-time Chat & WebSockets](../frontend-roadmap.md#module-5-real-time-chat--websockets).
- Shared types: `packages/types/src/chat.ts`.

## Scope (high level)

Direct messages and group conversations, presence, typing indicators, read receipts, and reliable reconnect with replay since the last seen message id.

## To Fill in Phase A

- [ ] Overview.
- [ ] Domain model: `Conversation`, `Participant`, `Message`, `ReadReceipt`, `Presence`.
- [ ] REST endpoints: list conversations, get history, send message (fallback), mark read, list contacts.
- [ ] WebSocket channel: connect URL, auth, heartbeat.
- [ ] Inbound socket events: send message, typing, read, ping.
- [ ] Outbound socket events: message, typing, presence, read receipt, error.
- [ ] Reconnect protocol: replay since `lastMessageId`.
- [ ] Pagination for history (cursor).
- [ ] Errors: unauthorized socket, room not found, rate limited.
- [ ] Open questions.
