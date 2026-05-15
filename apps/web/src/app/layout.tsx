import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppProviders } from "@/lib/providers/AppProviders";
import { AppShell } from "@/components/shell/AppShell";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Node Core Lab",
  description:
    "Senior-level Node.js learning monorepo. Frontend mocks the API while you build the Fastify backend module by module.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
