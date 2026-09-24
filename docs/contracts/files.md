# Contract: File Streaming & Processing

> Stub. Fill this contract during Phase A of the Files module before any
> frontend or backend work begins. Use [`_template.md`](./_template.md) as the
> canonical structure.

## Status

- Phase A status: Not started. DTOs and routes already exist in code (see below).
- Last updated: TBD.
- Owners: backend, frontend.

## Linked Documents

- Backend module: [`backend-roadmap.md` → Module 3: File Streaming & Processing](../backend-roadmap.md#module-3-file-streaming--processing).
- Frontend module: [`frontend-roadmap.md` → Module 3: File Streaming & Processing](../frontend-roadmap.md#module-3-file-streaming--processing).
- Shared types: `packages/types/src/files.ts`.

## Scope (high level)

Multipart chunked uploads, resumable uploads, processing pipeline (image/video), private file access through signed URLs, and HTTP range streaming for video playback.

## Starting Point (already in code)

Extract the contract from these sources instead of designing from scratch ([why](../project-roadmap.md#how-this-project-deviates)):

- DTOs: [`packages/types/src/files.ts`](../../packages/types/src/files.ts)
- Routes: `real*` object in [`apps/web/src/lib/api/files.ts`](../../apps/web/src/lib/api/files.ts)

Routes the frontend calls today (relative to `NEXT_PUBLIC_API_BASE_URL`):

- `POST /api/files/uploads`
- `POST /api/files/uploads/:sessionId/chunks (multipart: `chunk`, `chunkIndex`)`
- `POST /api/files/uploads/:sessionId/complete`
- `DELETE /api/files/uploads/:sessionId`
- `GET /api/files`
- `GET /api/files/:id`
- `GET /api/files/:id/status`
- `GET /api/files/:id/stream-url`

Known gaps to resolve before freezing:

- [ ] Chunks are sent as `multipart/form-data` with an index, not as `Content-Range` bodies. The backend roadmap assumes content-range, so pick one.
- [ ] The adapter has no "get upload progress" endpoint for resuming after a reload.

## To Fill in Phase A

- [ ] Overview.
- [ ] Domain model: `File`, `UploadSession`, `Chunk`, `ProcessingJob`.
- [ ] Endpoints: initiate upload, upload chunk, complete upload, cancel upload, get status, stream file, signed URL, processing status.
- [ ] Request and response DTOs for each endpoint.
- [ ] Chunk protocol: size limits, content-range header, hashing.
- [ ] Range request semantics for streaming.
- [ ] Signed URL format and TTL.
- [ ] Errors: invalid chunk, expired upload session, file too large, unsupported type.
- [ ] Events emitted on upload complete and processing done.
- [ ] Security notes: MIME validation, size enforcement, path traversal.
- [ ] Open questions.
