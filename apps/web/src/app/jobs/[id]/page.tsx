"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { Job, JobLogEntry, JobSseEvent } from "@repo/types";
import { jobsApi } from "@/lib/api/jobs";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import {
  ErrorState,
  SkeletonRows,
} from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";
import { formatRelative } from "@/lib/format";
import styles from "./details.module.css";

export default function JobDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const qc = useQueryClient();
  const toast = useToast();

  const jobQuery = useQuery<Job>({
    queryKey: ["jobs", "one", id],
    queryFn: () => jobsApi.get(id),
    enabled: id.length > 0,
  });

  const logsQuery = useQuery<JobLogEntry[]>({
    queryKey: ["jobs", "logs", id],
    queryFn: () => jobsApi.getLogs(id),
    enabled: id.length > 0,
  });

  const [liveProgress, setLiveProgress] = useState<number | null>(null);
  const [liveStatus, setLiveStatus] = useState<Job["status"] | null>(null);
  const [liveLogs, setLiveLogs] = useState<JobLogEntry[]>([]);
  const [streamConnected, setStreamConnected] = useState(false);

  useEffect(() => {
    if (!id) return;
    setStreamConnected(true);
    const unsub = jobsApi.subscribe(id, (e: JobSseEvent) => {
      if (e.event === "progress") setLiveProgress(e.progress);
      if (e.event === "status") setLiveStatus(e.status);
      if (e.event === "log") setLiveLogs((prev) => [...prev, e.entry]);
      if (e.event === "completed") {
        setLiveStatus("completed");
        setLiveProgress(100);
        void qc.invalidateQueries({ queryKey: ["jobs", "one", id] });
        void qc.invalidateQueries({ queryKey: ["jobs", "logs", id] });
        void qc.invalidateQueries({ queryKey: ["jobs", "list"] });
      }
      if (e.event === "failed") {
        setLiveStatus("failed");
        toast.error("Job failed", e.errorMessage);
        void qc.invalidateQueries({ queryKey: ["jobs", "one", id] });
      }
    });
    return () => {
      setStreamConnected(false);
      unsub();
    };
  }, [id, qc, toast]);

  const retryMutation = useMutation({
    mutationFn: () => jobsApi.retry(id),
    onSuccess: () => {
      toast.success("Retry queued");
      setLiveProgress(0);
      setLiveLogs([]);
      void qc.invalidateQueries({ queryKey: ["jobs", "one", id] });
    },
    onError: (err: Error) => toast.error("Retry failed", err.message),
  });

  const cancelMutation = useMutation({
    mutationFn: () => jobsApi.cancel(id),
    onSuccess: () => {
      toast.info("Job cancelled");
      void qc.invalidateQueries({ queryKey: ["jobs", "one", id] });
    },
    onError: (err: Error) => toast.error("Cancel failed", err.message),
  });

  const status = liveStatus ?? jobQuery.data?.status;
  const progress =
    liveProgress !== null ? liveProgress : (jobQuery.data?.progress ?? 0);

  const allLogs = [...(logsQuery.data ?? []), ...liveLogs];

  return (
    <>
      <PageHeader
        eyebrow={`Module 4 · Job ${id}`}
        title={jobQuery.data?.type ?? "Loading…"}
        description="Live updates use SSE in production. The mock dispatches synthetic events on a timer."
        actions={
          <Link href="/jobs">
            <Button variant="secondary" size="sm">
              ← Dashboard
            </Button>
          </Link>
        }
      />

      {jobQuery.isLoading ? (
        <Card padded>
          <SkeletonRows rows={5} />
        </Card>
      ) : jobQuery.isError ? (
        <ErrorState retry={() => jobQuery.refetch()} />
      ) : jobQuery.data ? (
        <div className={styles.grid}>
          <Card title="Live status">
            <div className={styles.statusBlock}>
              <div className={styles.statusRow}>
                {status && <Badge tone={status}>{status}</Badge>}
                <span className={styles.streamPill}>
                  {streamConnected
                    ? "● live stream connected"
                    : "○ stream disconnected"}
                </span>
              </div>
              <Progress
                value={progress}
                label="Progress"
                tone={
                  status === "failed"
                    ? "danger"
                    : status === "completed"
                      ? "success"
                      : "info"
                }
              />
              <div className={styles.actions}>
                {(status === "failed" || status === "cancelled") && (
                  <Button
                    onClick={() => retryMutation.mutate()}
                    loading={retryMutation.isPending}
                  >
                    Retry
                  </Button>
                )}
                {(status === "queued" ||
                  status === "running" ||
                  status === "retrying") && (
                  <Button
                    variant="secondary"
                    onClick={() => cancelMutation.mutate()}
                    loading={cancelMutation.isPending}
                  >
                    Cancel
                  </Button>
                )}
                {jobQuery.data.artifactUrl && status === "completed" && (
                  <a
                    href={jobQuery.data.artifactUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button variant="secondary">Download artifact</Button>
                  </a>
                )}
              </div>
            </div>
          </Card>

          <Card title="Metadata">
            <dl className={styles.dl}>
              <dt>Job ID</dt>
              <dd>
                <code>{jobQuery.data.id}</code>
              </dd>
              <dt>Attempt</dt>
              <dd>
                {jobQuery.data.attempt} / {jobQuery.data.maxAttempts}
              </dd>
              <dt>Created</dt>
              <dd>{formatRelative(jobQuery.data.createdAt)}</dd>
              {jobQuery.data.startedAt && (
                <>
                  <dt>Started</dt>
                  <dd>{formatRelative(jobQuery.data.startedAt)}</dd>
                </>
              )}
              {jobQuery.data.finishedAt && (
                <>
                  <dt>Finished</dt>
                  <dd>{formatRelative(jobQuery.data.finishedAt)}</dd>
                </>
              )}
              <dt>Payload</dt>
              <dd>
                <pre className={styles.pre}>
                  {JSON.stringify(jobQuery.data.payload, null, 2)}
                </pre>
              </dd>
            </dl>
          </Card>

          <Card title="Logs" padded>
            {logsQuery.isLoading ? (
              <SkeletonRows rows={4} />
            ) : (
              <ul className={styles.logs}>
                {allLogs.length === 0 ? (
                  <li className={styles.logEmpty}>No logs yet.</li>
                ) : (
                  allLogs.map((entry, i) => (
                    <li key={i} className={styles.logRow}>
                      <span
                        className={`${styles.logLevel} ${styles[`lvl_${entry.level}`]}`}
                      >
                        {entry.level}
                      </span>
                      <span className={styles.logTime}>
                        {new Date(entry.at).toLocaleTimeString()}
                      </span>
                      <span className={styles.logMessage}>{entry.message}</span>
                    </li>
                  ))
                )}
              </ul>
            )}
          </Card>
        </div>
      ) : null}
    </>
  );
}
