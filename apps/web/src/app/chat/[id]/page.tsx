"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  ChatConnection,
  ChatHandlers,
} from "@/lib/api/chat";
import type {
  ChatMessage,
  ChatOutboundEvent,
  ConversationId,
} from "@repo/types";
import { ME_USER_ID, chatApi } from "@/lib/api/chat";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  ErrorState,
  SkeletonRows,
} from "@/components/ui/States";
import styles from "./conversation.module.css";

interface OptimisticMessage extends ChatMessage {
  isLocal?: boolean;
}

export default function ConversationPage() {
  const params = useParams<{ id: string }>();
  const conversationId = (params?.id ?? "") as ConversationId;
  const qc = useQueryClient();

  const conversationsQuery = useQuery({
    queryKey: ["chat", "conversations"],
    queryFn: () => chatApi.listConversations(),
  });
  const conversation = useMemo(
    () =>
      conversationsQuery.data?.find((c) => c.id === conversationId) ?? null,
    [conversationsQuery.data, conversationId]
  );
  const peer = useMemo(() => {
    if (!conversation) return null;
    return (
      conversation.participants.find((p) => p.id !== ME_USER_ID) ??
      conversation.participants[0] ??
      null
    );
  }, [conversation]);

  const historyQuery = useQuery({
    queryKey: ["chat", "history", conversationId],
    queryFn: () => chatApi.getHistory(conversationId),
    enabled: conversationId.length > 0,
  });

  const [messages, setMessages] = useState<OptimisticMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [peerTyping, setPeerTyping] = useState(false);
  const [connected, setConnected] = useState(false);
  const connRef = useRef<ChatConnection | null>(null);

  useEffect(() => {
    if (historyQuery.data) {
      setMessages(historyQuery.data.messages.slice());
    }
  }, [historyQuery.data]);

  useEffect(() => {
    if (!conversationId) return;
    const handlers: ChatHandlers = {
      onOpen: () => setConnected(true),
      onClose: () => setConnected(false),
      onEvent: (e: ChatOutboundEvent) => {
        if (e.event === "message") {
          if (e.message.conversationId !== conversationId) return;
          setMessages((prev) => {
            const dedupeIdx = e.message.clientId
              ? prev.findIndex((m) => m.clientId === e.message.clientId)
              : prev.findIndex((m) => m.id === e.message.id);
            if (dedupeIdx >= 0) {
              const next = prev.slice();
              next[dedupeIdx] = { ...e.message };
              return next;
            }
            return [...prev, { ...e.message }];
          });
          void qc.invalidateQueries({ queryKey: ["chat", "conversations"] });
        }
        if (e.event === "typing") {
          if (e.conversationId !== conversationId) return;
          if (e.userId !== ME_USER_ID) setPeerTyping(e.typing);
        }
      },
    };
    const conn = chatApi.connect(handlers);
    connRef.current = conn;
    return () => {
      conn.close();
      connRef.current = null;
    };
  }, [conversationId, qc]);

  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, peerTyping]);

  const send = (e?: FormEvent) => {
    e?.preventDefault();
    const body = draft.trim();
    if (!body || !connRef.current) return;
    const clientId = crypto.randomUUID();
    const optimistic: OptimisticMessage = {
      id: `local_${clientId}`,
      conversationId,
      senderId: ME_USER_ID,
      body,
      createdAt: new Date().toISOString(),
      deliveryStatus: "sending",
      clientId,
      isLocal: true,
    };
    setMessages((prev) => [...prev, optimistic]);
    setDraft("");
    connRef.current.send({
      event: "send",
      conversationId,
      body,
      clientId,
    });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  if (!conversationId) return null;
  if (historyQuery.isLoading || conversationsQuery.isLoading) {
    return (
      <Card padded>
        <SkeletonRows rows={6} />
      </Card>
    );
  }
  if (historyQuery.isError) {
    return <ErrorState retry={() => historyQuery.refetch()} />;
  }

  return (
    <Card padded={false} className={styles.frame}>
      <header className={styles.header}>
        <div className={styles.identity}>
          <div className={styles.avatar} aria-hidden="true">
            {peer?.name.slice(0, 1).toUpperCase()}
            {peer?.online && <span className={styles.online} />}
          </div>
          <div>
            <div className={styles.name}>{conversation?.title}</div>
            <div className={styles.status}>
              {peer?.online ? "Online" : "Offline"}
            </div>
          </div>
        </div>
        <Badge tone={connected ? "success" : "warning"}>
          {connected ? "connected" : "reconnecting"}
        </Badge>
      </header>

      <div ref={containerRef} className={styles.scroll}>
        <ul className={styles.messages}>
          {messages.map((m) => {
            const mine = m.senderId === ME_USER_ID;
            return (
              <li
                key={m.id}
                className={`${styles.bubbleRow} ${mine ? styles.mine : ""}`}
              >
                <div className={styles.bubble}>
                  <div className={styles.bubbleBody}>{m.body}</div>
                  <div className={styles.bubbleMeta}>
                    {new Date(m.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {mine && (
                      <span className={styles.deliveryStatus}>
                        · {m.deliveryStatus}
                      </span>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
          {peerTyping && (
            <li className={styles.bubbleRow}>
              <div className={styles.bubbleTyping} aria-live="polite">
                <span className={styles.dot} />
                <span className={styles.dot} />
                <span className={styles.dot} />
              </div>
            </li>
          )}
        </ul>
      </div>

      <form className={styles.composer} onSubmit={send}>
        <textarea
          className={styles.input}
          placeholder="Write a message…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          rows={2}
        />
        <Button type="submit" disabled={!draft.trim() || !connected}>
          Send
        </Button>
      </form>
    </Card>
  );
}
