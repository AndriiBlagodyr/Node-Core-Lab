/**
 * Thin localStorage wrapper used by the mock auth adapter so a "logged in"
 * state survives page reloads. SSR-safe (no-op on the server).
 */

const KEY_USER = "ncl.mock.user";

export interface PersistedMockUser {
  id: string;
  email: string;
  name: string;
}

export function readMockUser(): PersistedMockUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY_USER);
    return raw ? (JSON.parse(raw) as PersistedMockUser) : null;
  } catch {
    return null;
  }
}

export function writeMockUser(user: PersistedMockUser | null): void {
  if (typeof window === "undefined") return;
  if (user === null) {
    window.localStorage.removeItem(KEY_USER);
  } else {
    window.localStorage.setItem(KEY_USER, JSON.stringify(user));
  }
}
