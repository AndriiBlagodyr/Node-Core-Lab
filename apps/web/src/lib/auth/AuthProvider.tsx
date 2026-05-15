"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ApiClientError, type Session, type User } from "@repo/types";
import { authApi } from "@/lib/api/auth";

type Status = "loading" | "authenticated" | "unauthenticated";

interface AuthApi {
  status: Status;
  session: Session | null;
  user: User | null;
  refresh: () => Promise<void>;
  setSession: (s: Session | null) => void;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthApi | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");
  const [session, setSessionState] = useState<Session | null>(null);

  const refresh = useCallback(async () => {
    try {
      const next = await authApi.refreshSession();
      setSessionState(next);
      setStatus("authenticated");
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 401) {
        setSessionState(null);
        setStatus("unauthenticated");
        return;
      }
      setSessionState(null);
      setStatus("unauthenticated");
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setSessionState(null);
      setStatus("unauthenticated");
    }
  }, []);

  const setSession = useCallback((s: Session | null) => {
    setSessionState(s);
    setStatus(s ? "authenticated" : "unauthenticated");
  }, []);

  const api = useMemo<AuthApi>(
    () => ({
      status,
      session,
      user: session?.user ?? null,
      refresh,
      setSession,
      logout,
    }),
    [status, session, refresh, setSession, logout]
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthApi {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
