/**
 * Frontend env. Validated at module-load so misconfig fails fast in the
 * browser console — same idea as `env.ts` in the backend roadmap.
 *
 * Only `NEXT_PUBLIC_*` values are reachable here.
 */

export type ApiMode = "mock" | "real";

function parseMode(raw: string | undefined): ApiMode {
  if (raw === "real") return "real";
  return "mock";
}

export const env = {
  apiMode: parseMode(process.env.NEXT_PUBLIC_API_MODE),
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8100",
};
