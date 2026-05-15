"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Job, JobStatus } from "@repo/types";
import { jobsApi } from "@/lib/api/jobs";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { Table, type Column } from "@/components/ui/Table";
import {
  EmptyState,
  ErrorState,
  SkeletonRows,
} from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";
import { formatRelative } from "@/lib/format";
import styles from "./jobs.module.css";

const ACTIVE: JobStatus[] = ["queued", "running", "retrying"];

export default function JobsDashboardPage() {
  const qc = useQueryClient();
  const toast = useToast();

  const jobsQuery = useQuery<Job[]>({
    queryKey: ["jobs", "list"],
    queryFn: () => jobsApi.list(),
    refetchInterval: (q) => {
      const data = q.state.data;
      const hasActive = data?.some((j) => ACTIVE.includes(j.status));
      return hasActive ? 1500 : 5000;
    },
  });

  const retryMutation = useMutation({
    mutationFn: (id: string) => jobsApi.retry(id),
    onSuccess: () => {
      toast.success("Retry queued");
      void qc.invalidateQueries({ queryKey: ["jobs", "list"] });
    },
    onError: (err: Error) => toast.error("Retry failed", err.message),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => jobsApi.cancel(id),
    onSuccess: () => {
      toast.info("Job cancelled");
      void qc.invalidateQueries({ queryKey: ["jobs", "list"] });
    },
    onError: (err: Error) => toast.error("Cancel failed", err.message),
  });

  const columns: Column<Job>[] = [
    {
      key: "type",
      header: "Type",
      render: (j) => <code className={styles.code}>{j.type}</code>,
    },
    {
      key: "status",
      header: "Status",
      width: "130px",
      render: (j) => <Badge tone={j.status}>{j.status}</Badge>,
    },
    {
      key: "progress",
      header: "Progress",
      width: "180px",
      render: (j) => (
        <div className={styles.progressCell}>
          <Progress
            value={j.progress}
            tone={
              j.status === "failed"
                ? "danger"
                : j.status === "completed"
                  ? "success"
                  : "info"
            }
          />
        </div>
      ),
    },
    {
      key: "attempts",
      header: "Attempts",
      width: "100px",
      align: "right",
      render: (j) => `${j.attempt}/${j.maxAttempts}`,
    },
    {
      key: "created",
      header: "Created",
      width: "140px",
      render: (j) => formatRelative(j.createdAt),
    },
    {
      key: "actions",
      header: "",
      width: "200px",
      align: "right",
      render: (j) => (
        <div className={styles.rowActions}>
          {(j.status === "failed" || j.status === "cancelled") && (
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                retryMutation.mutate(j.id);
              }}
              loading={
                retryMutation.isPending && retryMutation.variables === j.id
              }
            >
              Retry
            </Button>
          )}
          {ACTIVE.includes(j.status) && (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                cancelMutation.mutate(j.id);
              }}
              loading={
                cancelMutation.isPending && cancelMutation.variables === j.id
              }
            >
              Cancel
            </Button>
          )}
          <Link href={`/jobs/${j.id}`} className={styles.detailsLink}>
            Open →
          </Link>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Module 4 · Background Jobs & Workers"
        title="Jobs dashboard"
        description="Live progress via SSE (mock simulates ticks every 800ms). Retry and cancel are wired to the same endpoints the BullMQ worker will own."
        actions={
          <Link href="/jobs/new">
            <Button>Generate report</Button>
          </Link>
        }
      />

      {jobsQuery.isLoading ? (
        <Card padded>
          <SkeletonRows rows={5} height={32} />
        </Card>
      ) : jobsQuery.isError ? (
        <ErrorState retry={() => jobsQuery.refetch()} />
      ) : jobsQuery.data && jobsQuery.data.length === 0 ? (
        <EmptyState
          title="No jobs yet"
          description="Generate a report to see queued → running → completed lifecycle."
          action={
            <Link href="/jobs/new">
              <Button>New job</Button>
            </Link>
          }
        />
      ) : (
        <Table
          columns={columns}
          rows={jobsQuery.data ?? []}
          rowKey={(j) => j.id}
        />
      )}
    </>
  );
}
