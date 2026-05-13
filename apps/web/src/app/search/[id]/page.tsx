"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { searchApi } from "@/lib/api/search";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ErrorState, SkeletonRows } from "@/components/ui/States";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import styles from "./details.module.css";

export default function ItemDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const query = useQuery({
    queryKey: ["search", "item", id],
    queryFn: () => searchApi.getItem(id),
    enabled: id.length > 0,
  });

  return (
    <>
      <PageHeader
        eyebrow="Module 2 · Item details"
        title={query.data?.title ?? "Loading…"}
        description={query.data?.summary}
        actions={
          <Link href="/search">
            <Button variant="secondary" size="sm">
              ← Back to search
            </Button>
          </Link>
        }
      />

      {query.isLoading ? (
        <Card padded>
          <SkeletonRows rows={6} />
        </Card>
      ) : query.isError ? (
        <ErrorState
          title="Could not load this item"
          retry={() => query.refetch()}
        />
      ) : (
        <Card padded>
          <dl className={styles.dl}>
            <dt>Kind</dt>
            <dd>
              <Badge>{query.data?.kind}</Badge>
            </dd>
            <dt>Status</dt>
            <dd>
              <Badge tone="info">{query.data?.status}</Badge>
            </dd>
            <dt>Author</dt>
            <dd>{query.data?.authorName}</dd>
            <dt>Score</dt>
            <dd>{query.data?.score.toFixed(2)}</dd>
            <dt>Tags</dt>
            <dd className={styles.tags}>
              {query.data?.tags.map((t) => (
                <span key={t} className={styles.tag}>
                  {t}
                </span>
              ))}
            </dd>
            <dt>Created</dt>
            <dd>
              {query.data
                ? new Date(query.data.createdAt).toLocaleString()
                : ""}
            </dd>
            <dt>Updated</dt>
            <dd>
              {query.data
                ? new Date(query.data.updatedAt).toLocaleString()
                : ""}
            </dd>
            <dt>Item ID</dt>
            <dd>
              <code>{id}</code>
            </dd>
          </dl>
        </Card>
      )}
    </>
  );
}
