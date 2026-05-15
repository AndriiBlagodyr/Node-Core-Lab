"use client";

import type { ReactNode } from "react";
import { QueryProvider } from "./QueryProvider";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import { ToastProvider } from "@/components/ui/Toast";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <ToastProvider>{children}</ToastProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
