import type { Iso8601, CursorPaginationMeta } from "./common";
import type { UserId } from "./auth";

export type ConversationId = string;
export type MessageId = string;

export interface ChatUser {
  id: UserId;
  name: string;
  avatarUrl?: string;
  online: boolean;
  lastSeenAt: Iso8601;
}

export interface Conversation {
  id: ConversationId;
  kind: "direct" | "group";
  title: string;
  participants: ChatUser[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  updatedAt: Iso8601;
}

export type MessageDeliveryStatus =
  | "sending"
  | "sent"
  | "delivered"
  | "read"
  | "failed";

export interface ChatMessage {
  id: MessageId;
  conversationId: ConversationId;
  senderId: UserId;
  body: string;
  createdAt: Iso8601;
  deliveryStatus: MessageDeliveryStatus;
  /** Optional client-generated id for optimistic dedupe. */
  clientId?: string;
}

export interface ChatHistoryResponse {
  messages: ChatMessage[];
  pagination: CursorPaginationMeta;
}

/**
 * Outbound socket events sent from server to client.
 * Discriminated union — pages match on `event`.
 */
export type ChatOutboundEvent =
  | { event: "message"; message: ChatMessage }
  | {
      event: "typing";
      conversationId: ConversationId;
      userId: UserId;
      typing: boolean;
    }
  | { event: "presence"; userId: UserId; online: boolean; at: Iso8601 }
  | {
      event: "read";
      conversationId: ConversationId;
      userId: UserId;
      lastReadMessageId: MessageId;
    }
  | { event: "error"; code: string; message: string };

/** Inbound events the frontend sends. */
export type ChatInboundEvent =
  | {
      event: "send";
      conversationId: ConversationId;
      body: string;
      clientId: string;
    }
  | { event: "typing"; conversationId: ConversationId; typing: boolean }
  | { event: "read"; conversationId: ConversationId; messageId: MessageId };
