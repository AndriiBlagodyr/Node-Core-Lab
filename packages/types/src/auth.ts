import type { Iso8601 } from "./common";

export type UserId = string;

export interface User {
  id: UserId;
  email: string;
  name: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
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
  /** Optional TOTP code if 2FA is enabled. */
  totpCode?: string;
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

export type SocialProvider = "google" | "github";

export interface LinkedAccount {
  provider: SocialProvider;
  providerEmail: string;
  linkedAt: Iso8601;
}
