import type { ReactNode } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ChatLayout } from "./components/ChatLayout";

export default function ChatRootLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PageHeader
        eyebrow="Module 5 · Real-time Chat & WebSockets"
        title="Chat"
        description="Direct messages with presence, typing, and optimistic sends. The mock adapter wires a fake WebSocket bus so the same UI works against the real ws server later."
      />
      <ChatLayout>{children}</ChatLayout>
    </>
  );
}
