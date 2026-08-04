/**
 * Foundation + Architecture: domain error hierarchy.
 *
 * IMPLEMENT:
 * - Base `AppError` with `code`, `httpStatus`, `cause`, `details`.
 * - Subclasses: ValidationError, AuthError, NotFoundError, ConflictError,
 *   RateLimitError, DependencyError.
 * - Error handler plugin maps these to HTTP JSON envelopes.
 *
 * @see docs/architecture-roadmap.md §4 Error Handling Strategy
 */

export type AppErrorCode = string;

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly httpStatus: number;
  readonly details?: unknown;
  override readonly cause?: unknown;

  constructor(
    message: string,
    options: {
      code: AppErrorCode;
      httpStatus: number;
      cause?: unknown;
      details?: unknown;
    },
  ) {
    super(message);
    this.name = "AppError";
    this.code = options.code;
    this.httpStatus = options.httpStatus;
    this.cause = options.cause;
    this.details = options.details;
  }
}

// TODO(foundation): add ValidationError, NotFoundError, ConflictError, etc.
