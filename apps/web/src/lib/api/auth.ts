import type {
  LinkedAccount,
  LoginRequest,
  RegisterRequest,
  Session,
  SocialProvider,
  UpdateProfileRequest,
  User,
} from "@repo/types";
import { env } from "@/lib/env";
import { http } from "./http";
import { delay, mockError } from "@/lib/mocks/util";
import { readMockUser, writeMockUser } from "@/lib/mocks/store";

/**
 * Auth API surface. Both adapters expose the same methods so swapping the
 * `NEXT_PUBLIC_API_MODE` env flag is the only change required when the
 * Fastify backend ships in Module 1 (Backend Roadmap).
 */
export interface AuthApi {
  login: (input: LoginRequest) => Promise<Session>;
  register: (input: RegisterRequest) => Promise<Session>;
  logout: () => Promise<void>;
  getProfile: () => Promise<User>;
  updateProfile: (input: UpdateProfileRequest) => Promise<User>;
  refreshSession: () => Promise<Session>;
  getOAuthAuthorizeUrl: (
    provider: SocialProvider,
    returnTo: string
  ) => string;
  getLinkedAccounts: () => Promise<LinkedAccount[]>;
  linkSocialAccount: (provider: SocialProvider) => Promise<void>;
  unlinkSocialAccount: (provider: SocialProvider) => Promise<void>;
}

/** Real adapter — points at the future Fastify backend. */
const realAuth: AuthApi = {
  login: (input) =>
    http<Session>("/auth/login", { method: "POST", body: input }),
  register: (input) =>
    http<Session>("/auth/register", { method: "POST", body: input }),
  logout: () => http("/auth/logout", { method: "POST" }),
  getProfile: () => http<User>("/auth/me"),
  updateProfile: (input) =>
    http<User>("/auth/me", { method: "PATCH", body: input }),
  refreshSession: () => http<Session>("/auth/refresh", { method: "POST" }),
  getOAuthAuthorizeUrl: (provider, returnTo) =>
    `${env.apiBaseUrl}/auth/oauth/${provider}/start?returnTo=${encodeURIComponent(
      returnTo
    )}`,
  getLinkedAccounts: () => http<LinkedAccount[]>("/auth/linked-accounts"),
  linkSocialAccount: (provider) =>
    http(`/auth/linked-accounts/${provider}`, { method: "POST" }),
  unlinkSocialAccount: (provider) =>
    http(`/auth/linked-accounts/${provider}`, { method: "DELETE" }),
};

/** In-memory mock state. Survives across imports during dev. */
const linkedAccountsState: LinkedAccount[] = [];

function buildSession(user: User): Session {
  return {
    user,
    accessTokenExpiresInSec: 60 * 15,
    issuedAt: new Date().toISOString(),
  };
}

const mockAuth: AuthApi = {
  async login(input) {
    await delay(450);
    if (!input.email || !input.password) {
      throw mockError(
        "validation_error",
        "Email and password are required",
        400,
        {
          email: input.email ? [] : ["Required"],
          password: input.password ? [] : ["Required"],
        }
      );
    }
    if (input.password === "wrong") {
      throw mockError("unauthorized", "Invalid email or password", 401);
    }
    if (input.password === "lockout") {
      throw mockError(
        "rate_limited",
        "Too many failed attempts. Try again later.",
        429
      );
    }
    const user: User = {
      id: "u_demo",
      email: input.email,
      name: input.email.split("@")[0] ?? "Demo User",
      emailVerified: true,
      twoFactorEnabled: false,
      createdAt: new Date().toISOString(),
    };
    writeMockUser({ id: user.id, email: user.email, name: user.name });
    return buildSession(user);
  },
  async register(input) {
    await delay(550);
    if (input.email === "taken@example.com") {
      throw mockError("conflict", "Email is already in use", 409, {
        email: ["This email is already registered"],
      });
    }
    const user: User = {
      id: "u_demo",
      email: input.email,
      name: input.name,
      emailVerified: false,
      twoFactorEnabled: false,
      createdAt: new Date().toISOString(),
    };
    writeMockUser({ id: user.id, email: user.email, name: user.name });
    return buildSession(user);
  },
  async logout() {
    await delay(150);
    writeMockUser(null);
  },
  async getProfile() {
    await delay(150);
    const u = readMockUser();
    if (!u) throw mockError("unauthorized", "Not signed in", 401);
    return {
      id: u.id,
      email: u.email,
      name: u.name,
      emailVerified: true,
      twoFactorEnabled: false,
      createdAt: new Date(Date.now() - 86_400_000).toISOString(),
    };
  },
  async updateProfile(input) {
    await delay(300);
    const u = readMockUser();
    if (!u) throw mockError("unauthorized", "Not signed in", 401);
    const next = { ...u, ...input } as typeof u;
    writeMockUser(next);
    return {
      id: next.id,
      email: next.email,
      name: next.name,
      emailVerified: true,
      twoFactorEnabled: false,
      createdAt: new Date().toISOString(),
    };
  },
  async refreshSession() {
    await delay(120);
    const u = readMockUser();
    if (!u) throw mockError("unauthorized", "Session expired", 401);
    return buildSession({
      id: u.id,
      email: u.email,
      name: u.name,
      emailVerified: true,
      twoFactorEnabled: false,
      createdAt: new Date().toISOString(),
    });
  },
  getOAuthAuthorizeUrl(provider, returnTo) {
    return `/auth/callback/${provider}?mock=1&returnTo=${encodeURIComponent(
      returnTo
    )}`;
  },
  async getLinkedAccounts() {
    await delay(160);
    return linkedAccountsState.slice();
  },
  async linkSocialAccount(provider) {
    await delay(220);
    if (!linkedAccountsState.find((a) => a.provider === provider)) {
      linkedAccountsState.push({
        provider,
        providerEmail: `you@${provider}.com`,
        linkedAt: new Date().toISOString(),
      });
    }
  },
  async unlinkSocialAccount(provider) {
    await delay(180);
    const idx = linkedAccountsState.findIndex((a) => a.provider === provider);
    if (idx >= 0) linkedAccountsState.splice(idx, 1);
  },
};

export const authApi: AuthApi = env.apiMode === "mock" ? mockAuth : realAuth;
