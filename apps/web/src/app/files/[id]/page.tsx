"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { filesApi } from "@/lib/api/files";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  ErrorState,
  SkeletonRows,
} from "@/components/ui/States";
import { Button } from "@/components/ui/Button";
import { formatBytes, formatDuration } from "@/lib/format";
import styles from "./details.module.css";

const STATUS_TONE = {
  pending: "info",
  processing: "warning",
  ready: "success",
  failed: "danger",
} as const;

export default function FileDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  const fileQuery = useQuery({
    queryKey: ["files", "one", id],
    queryFn: () => filesApi.getFile(id),
    enabled: id.length > 0,
    refetchInterval: (q) =>
      q.state.data?.processingStatus === "processing" ? 1500 : false,
  });

  return (
    <>
      <PageHeader
        eyebrow="Module 3 · File details"
        title={fileQuery.data?.filename ?? "Loading…"}
        description="Mirrors the response shape of /api/files/:id. Stream URL is signed and short-lived."
        actions={
          <Link href="/files">
            <Button variant="secondary" size="sm">
              ← Back to library
            </Button>
          </Link>
        }
      />

      {fileQuery.isLoading ? (
        <Card padded>
          <SkeletonRows rows={5} />
        </Card>
      ) : fileQuery.isError ? (
        <ErrorState retry={() => fileQuery.refetch()} />
      ) : fileQuery.data ? (
        <Card padded>
          <dl className={styles.dl}>
            <dt>Status</dt>
            <dd>
              <Badge tone={STATUS_TONE[fileQuery.data.processingStatus]}>
                {fileQuery.data.processingStatus}
              </Badge>
            </dd>
            <dt>MIME type</dt>
            <dd>
              <code>{fileQuery.data.mimeType}</code>
            </dd>
            <dt>Size</dt>
            <dd>{formatBytes(fileQuery.data.sizeBytes)}</dd>
            {fileQuery.data.durationSec !== undefined && (
              <>
                <dt>Duration</dt>
                <dd>{formatDuration(fileQuery.data.durationSec)}</dd>
              </>
            )}
            <dt>Streamable</dt>
            <dd>{fileQuery.data.streamable ? "Yes" : "No"}</dd>
            <dt>Uploaded</dt>
            <dd>{new Date(fileQuery.data.uploadedAt).toLocaleString()}</dd>
            <dt>File ID</dt>
            <dd>
              <code>{fileQuery.data.id}</code>
            </dd>
          </dl>

          {fileQuery.data.streamable && (
            <div className={styles.cta}>
              <Link href={`/files/${fileQuery.data.id}/play`}>
                <Button>Open video player</Button>
              </Link>
            </div>
          )}
        </Card>
      ) : null}
    </>
  );
}
