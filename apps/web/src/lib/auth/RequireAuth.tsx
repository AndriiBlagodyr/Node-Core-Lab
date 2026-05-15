"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { SkeletonRows } from "@/components/ui/States";

/**
 * Client-side gate. Redirects to `/auth/login?next=...` if the visitor isn't
 * authenticated once auth status is known. The backend will eventually own
 * the source of truth via the refresh-token cookie, but this component
 * handles the UX immediately so pages can ship without it.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      const next = encodeURIComponent(pathname);
      router.replace(`/auth/login?next=${next}`);
    }
  }, [status, router, pathname]);

  if (status === "loading") {
    return (
      <div style={{ padding: 24 }}>
        <SkeletonRows rows={6} />
      </div>
    );
  }
  if (status === "unauthenticated") {
    return null;
  }
  return <>{children}</>;
}
