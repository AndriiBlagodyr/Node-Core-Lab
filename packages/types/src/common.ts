/**
 * Shared response envelope and error contract.
 * Mirrors the API design rules in `docs/architecture-roadmap.md`:
 *   { data, error, meta }
 *
 * The frontend always reads `data` on success and `error` on failure, so the
 * shape is stable across every module and across mock/real adapters.
 */

export interface ApiEnvelope<TData> {
  data: TData;
  meta?: ApiMeta | undefined;
}

export interface ApiMeta {
  requestId?: string;
  pagination?: CursorPaginationMeta;
}

export interface CursorPaginationMeta {
  nextCursor: string | null;
  hasMore: boolean;
  total?: number;
}

/**
 * Stable, machine-readable error codes. Backend will own this list; the
 * frontend treats them as opaque strings, but documents the well-known ones
 * so we can render UX-correct messages without hard-coded English text.
 */
export type ApiErrorCode =
  | "validation_error"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "rate_limited"
  | "dependency_error"
  | "unknown_error";

export interface ApiError {
  code: ApiErrorCode | string;
  message: string;
  /** Field-level validation errors keyed by dotted JSON path. */
  details?: Record<string, string[]>;
  requestId?: string;
}

/** Stable error thrown by the API client; pages render against this shape. */
export class ApiClientError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details: Record<string, string[]> | undefined;
  readonly requestId: string | undefined;

  constructor(opts: {
    code: string;
    message: string;
    status: number;
    details?: Record<string, string[]>;
    requestId?: string;
  }) {
    super(opts.message);
    this.name = "ApiClientError";
    this.code = opts.code;
    this.status = opts.status;
    this.details = opts.details;
    this.requestId = opts.requestId;
  }
}

export type Iso8601 = string;
