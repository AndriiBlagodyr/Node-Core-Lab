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
    beTrack: "Roadmap → Module 1",
    pages: ["Login", "Register", "Profile"],
    status: "ready",
  },
  {
    num: "2",
    title: "High-Performance Search",
    href: "/search",
    contract: "docs/contracts/search.md",
    beTrack: "Roadmap → Module 2",
    pages: ["Dashboard table", "Item details"],
    status: "ready",
  },
  {
    num: "3",
    title: "Background Jobs & Workers",
    href: "/jobs",
    contract: "docs/contracts/jobs.md",
    beTrack: "Roadmap → Module 3",
    pages: ["Dashboard", "Details (SSE)", "Generate report"],
    status: "ready",
  },
  {
    num: "4",
    title: "Real-time Chat & WebSockets",
    href: "/chat",
    contract: "docs/contracts/chat.md",
    beTrack: "Roadmap → Module 4",
    pages: ["Sidebar", "Conversation", "Presence + typing"],
    status: "ready",
  },
];

export default function HomePage() {
  return (
    <>
      <PageHeader
        eyebrow="Node Core Lab"
        title="Test client for the backend."
        description="Each module below has working pages backed by mock APIs that mirror the contracts in docs/contracts. Implement the Fastify module per docs/roadmap.md, set NEXT_PUBLIC_API_MODE=real, and the same pages talk to your service."
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

      <Card title="How to use" padded>
        <ol className={styles.steps}>
          <li>
            Follow <code>docs/roadmap.md</code>: Foundation, then modules 1–4
            in order.
          </li>
          <li>
            Freeze the module&apos;s contract in <code>docs/contracts/</code>,
            then implement the routes in <code>apps/api</code>.
          </li>
          <li>
            Set <code>NEXT_PUBLIC_API_MODE=real</code> in{" "}
            <code>apps/web/.env.local</code> and use these pages to exercise
            your API.
          </li>
        </ol>
      </Card>
    </>
  );
}
