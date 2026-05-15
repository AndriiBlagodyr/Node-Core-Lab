"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import type {
  SearchItem,
  SearchRequest,
  SearchResponse,
  SearchSortField,
  SortDirection,
} from "@repo/types";
import { searchApi } from "@/lib/api/search";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Field";
import { Table, type Column } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import {
  EmptyState,
  ErrorState,
  SkeletonRows,
} from "@/components/ui/States";
import { Button } from "@/components/ui/Button";
import styles from "./search.module.css";

type StatusFilter = SearchItem["status"] | "all";

interface UrlState {
  q: string;
  status: StatusFilter;
  sortField: SearchSortField;
  sortDir: SortDirection;
}

function readUrlState(p: URLSearchParams): UrlState {
  const status = (p.get("status") ?? "all") as StatusFilter;
  return {
    q: p.get("q") ?? "",
    status:
      status === "draft" ||
      status === "published" ||
      status === "archived" ||
      status === "all"
        ? status
        : "all",
    sortField: (p.get("sf") as SearchSortField) ?? "createdAt",
    sortDir: (p.get("sd") as SortDirection) ?? "desc",
  };
}

const STATUS_TONE: Record<SearchItem["status"], "info" | "success" | "neutral"> = {
  draft: "info",
  published: "success",
  archived: "neutral",
};

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <Card padded>
          <SkeletonRows rows={6} />
        </Card>
      }
    >
      <SearchView />
    </Suspense>
  );
}

function SearchView() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const initial = readUrlState(new URLSearchParams(params.toString()));

  const [q, setQ] = useState(initial.q);
  const [status, setStatus] = useState<StatusFilter>(initial.status);
  const [sortField, setSortField] = useState<SearchSortField>(
    initial.sortField
  );
  const [sortDir, setSortDir] = useState<SortDirection>(initial.sortDir);

  const debouncedQ = useDebouncedValue(q, 300);

  // Sync URL with state for shareable links / refresh stability.
  useEffect(() => {
    const next = new URLSearchParams();
    if (debouncedQ) next.set("q", debouncedQ);
    if (status !== "all") next.set("status", status);
    if (sortField !== "createdAt") next.set("sf", sortField);
    if (sortDir !== "desc") next.set("sd", sortDir);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [debouncedQ, status, sortField, sortDir, pathname, router]);

  const request = useMemo<Omit<SearchRequest, "cursor">>(
    () => {
      const filters: NonNullable<SearchRequest["filters"]> = {};
      if (debouncedQ) filters.q = debouncedQ;
      if (status !== "all") filters.status = [status];
      return {
        filters,
        sort: { field: sortField, direction: sortDir },
        limit: 25,
      };
    },
    [debouncedQ, status, sortField, sortDir]
  );

  const query = useInfiniteQuery<SearchResponse>({
    queryKey: ["search", request],
    queryFn: ({ pageParam, signal }) => {
      const req: SearchRequest = {
        ...request,
        ...(pageParam ? { cursor: pageParam as string } : {}),
      };
      return searchApi.search(req);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.pagination.nextCursor ?? undefined,
  });

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      const first = entries[0];
      if (
        first?.isIntersecting &&
        query.hasNextPage &&
        !query.isFetchingNextPage
      ) {
        void query.fetchNextPage();
      }
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [query]);

  const columns: Column<SearchItem>[] = [
    {
      key: "title",
      header: "Title",
      sortKey: "title",
      render: (it) => (
        <div className={styles.titleCell}>
          <span className={styles.title}>{it.title}</span>
          <span className={styles.summary}>{it.summary}</span>
        </div>
      ),
    },
    {
      key: "kind",
      header: "Kind",
      width: "110px",
      render: (it) => <Badge>{it.kind}</Badge>,
    },
    {
      key: "tags",
      header: "Tags",
      render: (it) => (
        <div className={styles.tags}>
          {it.tags.slice(0, 3).map((t) => (
            <span key={t} className={styles.tag}>
              {t}
            </span>
          ))}
          {it.tags.length > 3 && (
            <span className={styles.tagMore}>+{it.tags.length - 3}</span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: "120px",
      render: (it) => (
        <Badge tone={STATUS_TONE[it.status]}>{it.status}</Badge>
      ),
    },
    {
      key: "score",
      header: "Score",
      sortKey: "score",
      width: "80px",
      align: "right",
      render: (it) => it.score.toFixed(1),
    },
    {
      key: "updatedAt",
      header: "Updated",
      sortKey: "updatedAt",
      width: "150px",
      render: (it) => new Date(it.updatedAt).toLocaleDateString(),
    },
  ];

  const allItems = useMemo(
    () => query.data?.pages.flatMap((p) => p.items) ?? [],
    [query.data]
  );
  const total = query.data?.pages[0]?.pagination.total ?? 0;

  return (
    <>
      <PageHeader
        eyebrow="Module 2 · Database Performance & Search"
        title="Search dashboard"
        description="Cursor pagination, sort, filter, and URL-synced state. Mock dataset is ~250 rows; the real backend will scale this to 1M+."
        actions={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQ("");
              setStatus("all");
              setSortField("createdAt");
              setSortDir("desc");
            }}
          >
            Reset filters
          </Button>
        }
      />

      <Card padded>
        <div className={styles.filters}>
          <Input
            label="Search"
            placeholder="Search by title, summary, or tag…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusFilter)}
          >
            <option value="all">All</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </Select>
          <Select
            label="Sort field"
            value={sortField}
            onChange={(e) => setSortField(e.target.value as SearchSortField)}
          >
            <option value="createdAt">Created</option>
            <option value="updatedAt">Updated</option>
            <option value="title">Title</option>
            <option value="score">Score</option>
          </Select>
          <Select
            label="Direction"
            value={sortDir}
            onChange={(e) => setSortDir(e.target.value as SortDirection)}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </Select>
        </div>
      </Card>

      <div className={styles.summaryBar}>
        <span>
          {query.isLoading
            ? "Loading…"
            : `${allItems.length} of ${total} item${total === 1 ? "" : "s"}`}
        </span>
        {query.isFetching && !query.isFetchingNextPage && (
          <span className={styles.refetching}>refreshing…</span>
        )}
      </div>

      {query.isLoading ? (
        <Card padded>
          <SkeletonRows rows={6} />
        </Card>
      ) : query.isError ? (
        <ErrorState retry={() => query.refetch()} />
      ) : allItems.length === 0 ? (
        <EmptyState
          title="No results"
          description="Try removing a filter or broadening your query."
        />
      ) : (
        <>
          <Table
            columns={columns}
            rows={allItems}
            rowKey={(r) => r.id}
            onRowClick={(r) => router.push(`/search/${r.id}`)}
            sort={{ field: sortField, direction: sortDir }}
            onSortChange={(field) => {
              if (field === sortField) {
                setSortDir((d) => (d === "asc" ? "desc" : "asc"));
              } else {
                setSortField(field as SearchSortField);
                setSortDir("desc");
              }
            }}
          />
          <div ref={sentinelRef} className={styles.sentinel}>
            {query.isFetchingNextPage
              ? "Loading more…"
              : query.hasNextPage
                ? "Scroll to load more"
                : "End of results"}
          </div>
        </>
      )}
    </>
  );
}
