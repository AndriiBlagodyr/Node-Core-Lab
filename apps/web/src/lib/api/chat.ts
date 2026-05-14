import type {
  ChatHistoryResponse,
  ChatInboundEvent,
  ChatOutboundEvent,
  ChatUser,
  Conversation,
  ChatMessage,
  ConversationId,
} from "@repo/types";
import { env } from "@/lib/env";
import { http } from "./http";
import { delay, mockError, uid } from "@/lib/mocks/util";

export interface ChatApi {
  listConversations: () => Promise<Conversation[]>;
  getHistory: (
    conversationId: string,
    cursor?: string
  ) => Promise<ChatHistoryResponse>;
  listContacts: () => Promise<ChatUser[]>;
  /**
   * Returns a thin client that mirrors a WebSocket. The mock dispatches
   * events on a tiny event bus so the UI can develop without a backend.
   */
  connect: (handlers: ChatHandlers) => ChatConnection;
}

export interface ChatHandlers {
  onEvent: (e: ChatOutboundEvent) => void;
  onOpen?: () => void;
  onClose?: () => void;
}

export interface ChatConnection {
  send: (e: ChatInboundEvent) => void;
  close: () => void;
}

const realChat: ChatApi = {
  listConversations: () => http<Conversation[]>("/api/chat/conversations"),
  getHistory: (id, cursor) =>
    http<ChatHistoryResponse>(
      `/api/chat/conversations/${id}/messages${cursor ? `?cursor=${cursor}` : ""}`
    ),
  listContacts: () => http<ChatUser[]>("/api/chat/contacts"),
  connect(handlers) {
    const proto = env.apiBaseUrl.startsWith("https") ? "wss" : "ws";
    const wsUrl =
      env.apiBaseUrl.replace(/^https?/, proto) + "/api/chat/ws";
    const sock = new WebSocket(wsUrl);
    sock.onopen = () => handlers.onOpen?.();
    sock.onclose = () => handlers.onClose?.();
    sock.onmessage = (m) => {
      try {
        handlers.onEvent(JSON.parse(m.data) as ChatOutboundEvent);
      } catch {
        /* ignore */
      }
    };
    return {
      send: (e) => sock.send(JSON.stringify(e)),
      close: () => sock.close(),
    };
  },
};

const ME: ChatUser = {
  id: "u_demo",
  name: "You",
  online: true,
  lastSeenAt: new Date().toISOString(),
};

const contacts: ChatUser[] = [
  {
    id: "u_ada",
    name: "Ada Lovelace",
    online: true,
    lastSeenAt: new Date().toISOString(),
  },
  {
    id: "u_linus",
    name: "Linus Torvalds",
    online: false,
    lastSeenAt: new Date(Date.now() - 25 * 60_000).toISOString(),
  },
  {
    id: "u_grace",
    name: "Grace Hopper",
    online: true,
    lastSeenAt: new Date().toISOString(),
  },
];

interface MockConversation {
  id: ConversationId;
  participants: ChatUser[];
  messages: ChatMessage[];
}

const conversations: MockConversation[] = [
  {
    id: "c_ada",
    participants: [ME, contacts[0] as ChatUser],
    messages: [
      {
        id: "m1",
        conversationId: "c_ada",
        senderId: "u_ada",
        body: "Did you finish the event-loop lab?",
        createdAt: new Date(Date.now() - 12 * 60_000).toISOString(),
        deliveryStatus: "read",
      },
      {
        id: "m2",
        conversationId: "c_ada",
        senderId: "u_demo",
        body: "Yes — process.nextTick is wild.",
        createdAt: new Date(Date.now() - 10 * 60_000).toISOString(),
        deliveryStatus: "read",
      },
    ],
  },
  {
    id: "c_grace",
    participants: [ME, contacts[2] as ChatUser],
    messages: [
      {
        id: "m3",
        conversationId: "c_grace",
        senderId: "u_grace",
        body: "Backpressure question for you 👀",
        createdAt: new Date(Date.now() - 60 * 60_000).toISOString(),
        deliveryStatus: "delivered",
      },
    ],
  },
];

const handlersByConv = new Set<ChatHandlers>();

function broadcast(event: ChatOutboundEvent): void {
  for (const h of handlersByConv) {
    try {
      h.onEvent(event);
    } catch {
      /* ignore */
    }
  }
}

const mockChat: ChatApi = {
  async listConversations() {
    await delay(160);
    return conversations.map<Conversation>((c) => {
      const last = c.messages[c.messages.length - 1];
      const peer =
        c.participants.find((p) => p.id !== ME.id) ?? c.participants[0]!;
      const conv: Conversation = {
        id: c.id,
        kind: "direct",
        title: peer.name,
        participants: c.participants,
        unreadCount: c.messages.filter(
          (m) => m.senderId !== ME.id && m.deliveryStatus !== "read"
        ).length,
        updatedAt: last?.createdAt ?? new Date().toISOString(),
      };
      if (last) conv.lastMessage = last;
      return conv;
    });
  },
  async getHistory(conversationId) {
    await delay(140);
    const c = conversations.find((x) => x.id === conversationId);
    if (!c) throw mockError("not_found", "Conversation not found", 404);
    return {
      messages: c.messages.slice(),
      pagination: { nextCursor: null, hasMore: false },
    };
  },
  async listContacts() {
    await delay(140);
    return contacts.slice();
  },
  connect(handlers) {
    handlersByConv.add(handlers);
    setTimeout(() => handlers.onOpen?.(), 100);

    return {
      send(e) {
        if (e.event === "send") {
          const conv = conversations.find((c) => c.id === e.conversationId);
          if (!conv) return;
          const message: ChatMessage = {
            id: uid("m"),
            conversationId: e.conversationId,
            senderId: ME.id,
            body: e.body,
            createdAt: new Date().toISOString(),
            deliveryStatus: "sent",
            clientId: e.clientId,
          };
          conv.messages.push(message);
          broadcast({ event: "message", message });

          setTimeout(() => {
            message.deliveryStatus = "delivered";
            broadcast({ event: "message", message });
          }, 400);

          setTimeout(() => {
            const peer =
              conv.participants.find((p) => p.id !== ME.id) ?? conv.participants[0];
            if (!peer || !peer.online) return;
            const reply: ChatMessage = {
              id: uid("m"),
              conversationId: e.conversationId,
              senderId: peer.id,
              body: pickReply(e.body),
              createdAt: new Date().toISOString(),
              deliveryStatus: "sent",
            };
            broadcast({
              event: "typing",
              conversationId: e.conversationId,
              userId: peer.id,
              typing: true,
            });
            setTimeout(() => {
              broadcast({
                event: "typing",
                conversationId: e.conversationId,
                userId: peer.id,
                typing: false,
              });
              conv.messages.push(reply);
              broadcast({ event: "message", message: reply });
            }, 1100);
          }, 800);
        }
      },
      close() {
        handlersByConv.delete(handlers);
        handlers.onClose?.();
      },
    };
  },
};

function pickReply(body: string): string {
  const trimmed = body.toLowerCase().trim();
  if (trimmed.endsWith("?")) {
    return "Good question — let me think about it.";
  }
  if (trimmed.includes("event loop")) {
    return "The event loop is just six phases on repeat.";
  }
  return "Acknowledged ✅";
}

export const chatApi: ChatApi = env.apiMode === "mock" ? mockChat : realChat;

export const ME_USER_ID = "u_demo";
