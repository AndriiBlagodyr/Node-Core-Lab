"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthProvider";
import styles from "./Topbar.module.css";

export function Topbar() {
  const { session, status, logout } = useAuth();

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <span className={styles.crumb}>Workspace</span>
        <span className={styles.crumbSep}>/</span>
        <span className={styles.crumbActive}>Frontend (mock-first)</span>
      </div>
      <div className={styles.right}>
        {status === "loading" && (
          <span className={styles.muted}>checking session…</span>
        )}
        {status === "authenticated" && session && (
          <>
            <Link href="/auth/profile" className={styles.userChip}>
              <span className={styles.avatar} aria-hidden="true">
                {session.user.name.slice(0, 1).toUpperCase()}
              </span>
              <span>{session.user.name}</span>
            </Link>
            <button
              type="button"
              onClick={() => logout()}
              className={styles.logout}
            >
              Sign out
            </button>
          </>
        )}
        {status === "unauthenticated" && (
          <Link href="/auth/login" className={styles.signin}>
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
