"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Sidebar.module.css";

interface NavItem {
  href: string;
  label: string;
  module: string;
  contract: string;
}

const NAV: NavItem[] = [
  { href: "/", label: "Overview", module: "—", contract: "—" },
  {
    href: "/auth/login",
    label: "Auth",
    module: "Module 1",
    contract: "auth.md",
  },
  {
    href: "/search",
    label: "Search",
    module: "Module 2",
    contract: "search.md",
  },
  {
    href: "/files",
    label: "Files",
    module: "Module 3",
    contract: "files.md",
  },
  {
    href: "/jobs",
    label: "Jobs",
    module: "Module 4",
    contract: "jobs.md",
  },
  {
    href: "/chat",
    label: "Chat",
    module: "Module 5",
    contract: "chat.md",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar} aria-label="Primary navigation">
      <div className={styles.brand}>
        <span className={styles.logo} aria-hidden="true">
          NC
        </span>
        <div>
          <div className={styles.brandTitle}>Node Core Lab</div>
          <div className={styles.brandSubtitle}>Frontend → Backend roadmap</div>
        </div>
      </div>

      <nav className={styles.nav}>
        {NAV.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.link} ${active ? styles.linkActive : ""}`}
            >
              <span className={styles.linkLabel}>{item.label}</span>
              <span className={styles.linkMeta}>
                {item.module} · {item.contract}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <div className={styles.kbd}>API mode</div>
        <div className={styles.apiMode}>
          {process.env.NEXT_PUBLIC_API_MODE ?? "mock"}
        </div>
      </div>
    </aside>
  );
}
