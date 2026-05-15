import type { SearchItem } from "@repo/types";

const TAG_POOL = [
  "node",
  "fastify",
  "postgres",
  "redis",
  "auth",
  "streams",
  "cache",
  "queue",
  "websocket",
  "observability",
  "testing",
  "drizzle",
  "performance",
  "search",
  "files",
  "jobs",
];

const TITLE_PARTS_A = [
  "Refactoring",
  "Designing",
  "Profiling",
  "Hardening",
  "Scaling",
  "Migrating",
  "Benchmarking",
  "Documenting",
  "Testing",
  "Caching",
];
const TITLE_PARTS_B = [
  "the auth flow",
  "the queue worker",
  "the search index",
  "the upload pipeline",
  "the chat layer",
  "the cache strategy",
  "the rate limiter",
  "the request context",
  "the migration script",
  "the OAuth callback",
];

function pseudoRandom(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function pickFrom<T>(arr: T[], rnd: () => number): T {
  return arr[Math.floor(rnd() * arr.length)] as T;
}

/** Deterministic, large-ish dataset used by the mock Search adapter. */
export function buildSearchDataset(count = 250): SearchItem[] {
  const rnd = pseudoRandom(42);
  const items: SearchItem[] = [];
  const now = Date.now();
  for (let i = 0; i < count; i++) {
    const tagCount = 1 + Math.floor(rnd() * 4);
    const tags = new Set<string>();
    while (tags.size < tagCount) tags.add(pickFrom(TAG_POOL, rnd));
    const created = now - Math.floor(rnd() * 90) * 86_400_000;
    const updated = created + Math.floor(rnd() * 86_400_000 * 5);
    const kindRoll = rnd();
    const kind: SearchItem["kind"] =
      kindRoll < 0.4 ? "article" : kindRoll < 0.75 ? "project" : "product";
    const statusRoll = rnd();
    const status: SearchItem["status"] =
      statusRoll < 0.7
        ? "published"
        : statusRoll < 0.9
          ? "draft"
          : "archived";
    items.push({
      id: `it_${(i + 1).toString().padStart(4, "0")}`,
      kind,
      title: `${pickFrom(TITLE_PARTS_A, rnd)} ${pickFrom(TITLE_PARTS_B, rnd)}`,
      summary:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus euismod, urna eu efficitur dignissim.",
      tags: Array.from(tags),
      status,
      score: Math.round(rnd() * 1000) / 10,
      authorName: pickFrom(
        ["Ada Lovelace", "Linus Torvalds", "Grace Hopper", "Brendan Eich"],
        rnd
      ),
      createdAt: new Date(created).toISOString(),
      updatedAt: new Date(updated).toISOString(),
    });
  }
  return items;
}
