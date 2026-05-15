"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { chatApi } from "@/lib/api/chat";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SkeletonRows } from "@/components/ui/States";
import { formatRelative } from "@/lib/format";
import styles from "./ChatLayout.module.css";

export function ChatLayout({ children }: { children: ReactNode }) {
  const params = useParams<{ id?: string }>();
  const activeId = params?.id;

  const conversationsQuery = useQuery({
    queryKey: ["chat", "conversations"],
    queryFn: () => chatApi.listConversations(),
  });

  return (
    <div className={styles.frame}>
      <Card padded className={styles.sidebarCard}>
        <h3 className={styles.sidebarTitle}>Conversations</h3>
        {conversationsQuery.isLoading ? (
          <SkeletonRows rows={4} height={48} />
        ) : conversationsQuery.data && conversationsQuery.data.length > 0 ? (
          <ul className={styles.list}>
            {conversationsQuery.data.map((c) => {
              const peer =
                c.participants.find((p) => p.name !== "You") ??
                c.participants[0]!;
              const active = activeId === c.id;
              return (
                <li key={c.id}>
                  <Link
                    href={`/chat/${c.id}`}
                    className={`${styles.row} ${active ? styles.rowActive : ""}`}
                  >
                    <span className={styles.avatar} aria-hidden="true">
                      {peer.name.slice(0, 1).toUpperCase()}
                      {peer.online && <span className={styles.online} />}
                    </span>
                    <span className={styles.body}>
                      <span className={styles.name}>{c.title}</span>
                      <span className={styles.preview}>
                        {c.lastMessage?.body ?? "No messages yet"}
                      </span>
                    </span>
                    <span className={styles.meta}>
                      <span className={styles.time}>
                        {c.lastMessage
                          ? formatRelative(c.lastMessage.createdAt)
                          : ""}
                      </span>
                      {c.unreadCount > 0 && (
                        <Badge tone="info">{c.unreadCount}</Badge>
                      )}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className={styles.empty}>No conversations yet</p>
        )}
      </Card>

      <div className={styles.main}>{children}</div>
    </div>
  );
}
