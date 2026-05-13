import { ApiClientError } from "@repo/types";
import { env } from "@/lib/env";

/**
 * Tiny typed `fetch` wrapper used by the "real" adapters. The mock adapters
 * never touch this; they construct responses in-process. We keep both
 * surfaces in lockstep so swapping is just `NEXT_PUBLIC_API_MODE=real`.
 *
 * Notes for the backend roadmap:
 *  - `credentials: "include"` is required for HttpOnly refresh-token cookies.
 *  - 401s should bubble up; the AuthProvider handles silent refresh + retry.
 *  - We do NOT store access tokens here. The backend sets them as
 *    short-lived cookies or returns them in JSON for in-memory use only.
 */

export interface HttpOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  /** When true, sends `Idempotency-Key` and skips automatic retry on 409. */
  idempotencyKey?: string;
}

interface ErrorBody {
  error?: { code?: string; message?: string; details?: Record<string, string[]> };
  message?: string;
  requestId?: string;
}

export async function http<T>(
  path: string,
  opts: HttpOptions = {}
): Promise<T> {
  const url = path.startsWith("http") ? path : `${env.apiBaseUrl}${path}`;

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(opts.headers ?? {}),
  };

  let body: BodyInit | undefined;
  if (opts.body !== undefined) {
    if (opts.body instanceof FormData) {
      body = opts.body;
    } else {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(opts.body);
    }
  }

  if (opts.idempotencyKey) {
    headers["Idempotency-Key"] = opts.idempotencyKey;
  }

  const requestInit: RequestInit = {
    method: opts.method ?? "GET",
    headers,
    credentials: "include",
  };
  if (body !== undefined) requestInit.body = body;
  if (opts.signal) requestInit.signal = opts.signal;
  const res = await fetch(url, requestInit);

  if (res.ok) {
    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  }

  let parsed: ErrorBody | undefined;
  try {
    parsed = (await res.json()) as ErrorBody;
  } catch {
    /* non-JSON error */
  }

  throw new ApiClientError({
    code: parsed?.error?.code ?? `http_${res.status}`,
    message: parsed?.error?.message ?? parsed?.message ?? res.statusText,
    status: res.status,
    ...(parsed?.error?.details ? { details: parsed.error.details } : {}),
    ...(parsed?.requestId ? { requestId: parsed.requestId } : {}),
  });
}
