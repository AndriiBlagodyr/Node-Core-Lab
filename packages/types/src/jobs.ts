import type { Iso8601 } from "./common";

export type JobId = string;

export type JobStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "cancelled"
  | "retrying";

export type JobType = "report.generate" | "image.process" | "data.export";

export interface Job {
  id: JobId;
  type: JobType;
  status: JobStatus;
  progress: number;
  attempt: number;
  maxAttempts: number;
  createdAt: Iso8601;
  startedAt?: Iso8601;
  finishedAt?: Iso8601;
  errorMessage?: string;
  /** Free-form payload shape; mirrors backend's per-type schema. */
  payload: Record<string, unknown>;
  /** Optional artifact URL once the job completes (e.g., generated report). */
  artifactUrl?: string;
}

export interface CreateJobRequest {
  type: JobType;
  payload: Record<string, unknown>;
  /** Idempotency key passed via header `Idempotency-Key`. */
  idempotencyKey?: string;
}

export interface JobLogEntry {
  at: Iso8601;
  level: "debug" | "info" | "warn" | "error";
  message: string;
}

/**
 * Server-Sent Event shape streamed on `GET /api/jobs/:id/events`.
 * Discriminated by `event` so the frontend can dispatch on event type.
 */
export type JobSseEvent =
  | { event: "status"; jobId: JobId; status: JobStatus; at: Iso8601 }
  | { event: "progress"; jobId: JobId; progress: number; at: Iso8601 }
  | { event: "log"; jobId: JobId; entry: JobLogEntry }
  | {
      event: "completed";
      jobId: JobId;
      artifactUrl?: string;
      at: Iso8601;
    }
  | { event: "failed"; jobId: JobId; errorMessage: string; at: Iso8601 };
