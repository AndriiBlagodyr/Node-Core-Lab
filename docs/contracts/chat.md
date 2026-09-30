# Contract: Real-time Chat & WebSockets

> Stub. Freeze this contract in step 1 of [Module 4](../roadmap.md#module-4-chat) before writing routes. Use [`_template.md`](./_template.md) for the final structure.

## Status

- Status: Not started. DTOs and routes already exist in code (see below).
- Last updated: TBD.

## Scope (high level)

Direct messages and group conversations, presence, typing indicators, read receipts, and reliable reconnect with replay since the last seen message id.

## Starting Point (already in code)

- DTOs: [`packages/types/src/chat.ts`](../../packages/types/src/chat.ts)
- Routes: `real*` object in [`apps/web/src/lib/api/chat.ts`](../../apps/web/src/lib/api/chat.ts)

Routes the client calls today (relative to `NEXT_PUBLIC_API_BASE_URL`):

- `GET /api/chat/conversations`
- `GET /api/chat/conversations/:id/messages?cursor=`
- `GET /api/chat/contacts`
- `WS /api/chat/ws` (plain WebSocket, JSON `ChatInboundEvent` / `ChatOutboundEvent`)

## Open Questions

- [ ] No REST send-message or mark-read endpoints are called; sending happens only over the WebSocket. Confirm that, or add a REST fallback.
- [ ] Socket auth: a browser `WebSocket` can't send an `Authorization` header. Module 4 plans cookie auth on upgrade; confirm it.

## To Fill

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
