import type { Iso8601 } from "./common";

export type UserId = string;

export interface User {
  id: UserId;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: Iso8601;
}

export interface Session {
  user: User;
  /**
   * Access token lifetime, in seconds, as reported by the backend. The
   * frontend only uses this to schedule a silent refresh; it does NOT store
   * the access token in `localStorage` (refresh token lives in HttpOnly
   * cookie set by the backend).
   */
  accessTokenExpiresInSec: number;
  issuedAt: Iso8601;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface UpdateProfileRequest {
  name?: string;
  avatarUrl?: string;
}
