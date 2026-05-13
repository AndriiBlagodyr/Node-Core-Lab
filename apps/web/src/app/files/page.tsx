"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { filesApi } from "@/lib/api/files";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  EmptyState,
  ErrorState,
  SkeletonRows,
} from "@/components/ui/States";
import { Button } from "@/components/ui/Button";
import { formatBytes } from "@/lib/format";
import styles from "./files.module.css";

const STATUS_TONE = {
  pending: "info",
  processing: "warning",
  ready: "success",
  failed: "danger",
} as const;

export default function FileLibraryPage() {
  const filesQuery = useQuery({
    queryKey: ["files", "list"],
    queryFn: () => filesApi.listFiles(),
    refetchInterval: (q) => {
      const data = q.state.data;
      const stillProcessing = data?.some(
        (f) => f.processingStatus === "processing"
      );
      return stillProcessing ? 1500 : false;
    },
  });

  return (
    <>
      <PageHeader
        eyebrow="Module 3 · File Streaming & Processing"
        title="File library"
        description="Chunked uploads, processing status, and HTTP-range video streaming. The mock adapter simulates 1 MiB chunks and a 2-second processing pipeline."
        actions={
          <Link href="/files/upload">
            <Button>Upload files</Button>
          </Link>
        }
      />

      {filesQuery.isLoading ? (
        <Card padded>
          <SkeletonRows rows={4} height={48} />
        </Card>
      ) : filesQuery.isError ? (
        <ErrorState retry={() => filesQuery.refetch()} />
      ) : filesQuery.data && filesQuery.data.length === 0 ? (
        <EmptyState
          title="No files yet"
          description="Upload your first file to see chunked progress + processing states."
          action={
            <Link href="/files/upload">
              <Button>Upload</Button>
            </Link>
          }
        />
      ) : (
        <div className={styles.grid}>
          {filesQuery.data?.map((f) => (
            <Card key={f.id} padded>
              <div className={styles.row}>
                <div className={styles.thumb} aria-hidden="true">
                  {f.mimeType.startsWith("video/")
                    ? "▶"
                    : f.mimeType.includes("pdf")
                      ? "PDF"
                      : "📄"}
                </div>
                <div className={styles.info}>
                  <Link
                    href={
                      f.streamable ? `/files/${f.id}/play` : `/files/${f.id}`
                    }
                    className={styles.name}
                  >
                    {f.filename}
                  </Link>
                  <div className={styles.meta}>
                    <span>{formatBytes(f.sizeBytes)}</span>
                    <span>·</span>
                    <span>{f.mimeType}</span>
                    <span>·</span>
                    <span>
                      uploaded {new Date(f.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Badge tone={STATUS_TONE[f.processingStatus]}>
                  {f.processingStatus}
                </Badge>
                <Link href={`/files/${f.id}`} className={styles.detailsLink}>
                  Details →
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
