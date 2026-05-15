import { ApiClientError } from "@repo/types";

/** Simulate variable network latency so loading states are visible. */
export function delay(ms = 250): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** Build a typed `ApiClientError` so mock and real failures look identical. */
export function mockError(
  code: string,
  message: string,
  status: number,
  details?: Record<string, string[]>
): ApiClientError {
  return new ApiClientError({
    code,
    message,
    status,
    ...(details ? { details } : {}),
  });
}

/** Tiny base64 cursor encoder/decoder used by mock pagination. */
export function encodeCursor(payload: object): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64");
}
export function decodeCursor<T>(cursor: string): T {
  return JSON.parse(Buffer.from(cursor, "base64").toString("utf8")) as T;
}

/** Stable id generator for in-memory mocks. */
export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
