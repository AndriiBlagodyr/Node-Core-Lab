# Contract: File Streaming & Processing

> Stub. Fill this contract during Phase A of the Files module before any
> frontend or backend work begins. Use [`_template.md`](./_template.md) as the
> canonical structure.

## Status

- Phase A status: Not started.
- Last updated: TBD.
- Owners: backend, frontend.

## Linked Documents

- Backend module: [`backend-roadmap.md` → Module 3: File Streaming & Processing](../backend-roadmap.md#module-3-file-streaming--processing).
- Frontend module: [`frontend-roadmap.md` → Module 3: File Streaming & Processing](../frontend-roadmap.md#module-3-file-streaming--processing).
- Shared types: `packages/types/src/files.ts`.

## Scope (high level)

Multipart chunked uploads, resumable uploads, processing pipeline (image/video), private file access through signed URLs, and HTTP range streaming for video playback.

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
