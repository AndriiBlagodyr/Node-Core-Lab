import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import styles from "./page.module.css";

interface Module {
  num: string;
  title: string;
  href: string;
  contract: string;
  beTrack: string;
  pages: string[];
  status: "ready" | "stub";
}

const MODULES: Module[] = [
  {
    num: "1",
    title: "Auth & Security",
    href: "/auth/login",
    contract: "docs/contracts/auth.md",
    beTrack: "Backend Roadmap → Module 1",
    pages: ["Login", "Register", "Profile", "OAuth callback"],
    status: "ready",
  },
  {
    num: "2",
    title: "High-Performance Search",
    href: "/search",
    contract: "docs/contracts/search.md",
    beTrack: "Backend Roadmap → Module 2",
    pages: ["Dashboard table", "Item details"],
    status: "ready",
  },
  {
    num: "3",
    title: "File Streaming & Processing",
    href: "/files",
    contract: "docs/contracts/files.md",
    beTrack: "Backend Roadmap → Module 3",
    pages: ["Library", "Upload", "File details", "Video player"],
    status: "ready",
  },
  {
    num: "4",
    title: "Background Jobs & Workers",
    href: "/jobs",
    contract: "docs/contracts/jobs.md",
    beTrack: "Backend Roadmap → Module 4",
    pages: ["Dashboard", "Details (SSE)", "Generate report"],
    status: "ready",
  },
  {
    num: "5",
    title: "Real-time Chat & WebSockets",
    href: "/chat",
    contract: "docs/contracts/chat.md",
    beTrack: "Backend Roadmap → Module 5",
    pages: ["Sidebar", "Conversation", "Presence + typing"],
    status: "ready",
  },
];

export default function HomePage() {
  return (
    <>
      <PageHeader
        eyebrow="Node Core Lab"
        title="Frontend ready. Backend up to you."
        description="Each module below has fully working frontend pages backed by mock APIs that mirror the contracts in docs/contracts. Implement the Fastify backend module-by-module per the Node Fundamentals + Backend roadmap, flip NEXT_PUBLIC_API_MODE=real, and the same UI talks to your real service."
      />

      <div className={styles.grid}>
        {MODULES.map((m) => (
          <Card
            key={m.num}
            title={
              <span className={styles.cardTitle}>
                <Badge tone="info">Module {m.num}</Badge>
                {m.title}
              </span>
            }
            description={m.beTrack}
            actions={
              <Link href={m.href} className={styles.openLink}>
                Open →
              </Link>
            }
          >
            <ul className={styles.pages}>
              {m.pages.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <div className={styles.contract}>
              <span className={styles.contractLabel}>Contract</span>
              <code>{m.contract}</code>
            </div>
          </Card>
        ))}
      </div>

      <Card title="Suggested learning order" padded>
        <ol className={styles.steps}>
          <li>
            Start <code>docs/node-fundamentals-roadmap.md</code> →{" "}
            <em>Event Loop &amp; Timers</em> labs in <code>apps/api/labs/</code>
            .
          </li>
          <li>
            Build the Fastify <em>Foundation</em> from{" "}
            <code>docs/backend-roadmap.md</code>: env validation, route schemas,
            request-id, health/ready/live endpoints.
          </li>
          <li>
            Pick a frontend module above. Read the matching contract stub and
            fill it in (Phase A). The frontend is already aligned to the
            shared types in <code>packages/types</code>.
          </li>
          <li>
            Implement the Fastify routes (Phase C). The mock adapter mirrors
            the URLs the &quot;real&quot; client expects — see{" "}
            <code>apps/web/src/lib/api/*</code>.
          </li>
          <li>
            Set <code>NEXT_PUBLIC_API_MODE=real</code> in{" "}
            <code>apps/web/.env.local</code> to swap mocks for your backend
            (Phase D).
          </li>
        </ol>
      </Card>
    </>
  );
}
