"use client";

import { useState } from "react";
import type { SocialProvider } from "@repo/types";
import { authApi } from "@/lib/api/auth";
import styles from "./SocialButtons.module.css";

interface Props {
  mode: "signin" | "signup";
  returnTo: string;
}

interface ProviderUi {
  id: SocialProvider;
  label: (mode: Props["mode"]) => string;
  className: string;
  icon: string;
}

const PROVIDERS: ProviderUi[] = [
  {
    id: "google",
    label: (m) =>
      m === "signin" ? "Sign in with Google" : "Sign up with Google",
    className: "google",
    icon: "G",
  },
  {
    id: "github",
    label: (m) =>
      m === "signin" ? "Sign in with GitHub" : "Sign up with GitHub",
    className: "github",
    icon: "GH",
  },
];

export function SocialButtons({ mode, returnTo }: Props) {
  const [busy, setBusy] = useState<SocialProvider | null>(null);

  return (
    <div className={styles.row}>
      {PROVIDERS.map((p) => (
        <a
          key={p.id}
          href={authApi.getOAuthAuthorizeUrl(p.id, returnTo)}
          className={`${styles.btn} ${styles[p.className]}`}
          aria-disabled={busy !== null}
          onClick={() => setBusy(p.id)}
        >
          <span className={styles.icon} aria-hidden="true">
            {p.icon}
          </span>
          <span>{p.label(mode)}</span>
        </a>
      ))}
    </div>
  );
}
