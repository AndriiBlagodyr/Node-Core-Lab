# Contract: Real-time Chat & WebSockets

> Stub. Fill this contract during Phase A of the Chat module before any
> frontend or backend work begins. Use [`_template.md`](./_template.md) as the
> canonical structure.

## Status

- Phase A status: Not started. DTOs and routes already exist in code (see below).
- Last updated: TBD.
- Owners: backend, frontend.

## Linked Documents

- Backend module: [`backend-roadmap.md` → Module 5: Real-time Chat & WebSockets](../backend-roadmap.md#module-5-real-time-chat--websockets).
- Frontend module: [`frontend-roadmap.md` → Module 5: Real-time Chat & WebSockets](../frontend-roadmap.md#module-5-real-time-chat--websockets).
- Shared types: `packages/types/src/chat.ts`.

## Scope (high level)

Direct messages and group conversations, presence, typing indicators, read receipts, and reliable reconnect with replay since the last seen message id.

## Starting Point (already in code)

Extract the contract from these sources instead of designing from scratch ([why](../project-roadmap.md#how-this-project-deviates)):

- DTOs: [`packages/types/src/chat.ts`](../../packages/types/src/chat.ts)
- Routes: `real*` object in [`apps/web/src/lib/api/chat.ts`](../../apps/web/src/lib/api/chat.ts)

Routes the frontend calls today (relative to `NEXT_PUBLIC_API_BASE_URL`):

- `GET /api/chat/conversations`
- `GET /api/chat/conversations/:id/messages?cursor=`
- `GET /api/chat/contacts`
- `WS /api/chat/ws (plain WebSocket, JSON `ChatInboundEvent` / `ChatOutboundEvent`)`

Known gaps to resolve before freezing:

- [ ] No REST send-message or mark-read endpoints are called; the backend roadmap lists both as fallbacks.
- [ ] Socket auth: a browser `WebSocket` can't send an `Authorization` header. Choose cookie or short-lived query token.

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
