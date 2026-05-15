"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { filesApi } from "@/lib/api/files";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  ErrorState,
  SkeletonRows,
} from "@/components/ui/States";
import styles from "./play.module.css";

export default function VideoPlayerPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  const fileQuery = useQuery({
    queryKey: ["files", "one", id],
    queryFn: () => filesApi.getFile(id),
    enabled: id.length > 0,
  });

  const urlQuery = useQuery({
    queryKey: ["files", "stream-url", id],
    queryFn: () => filesApi.getStreamUrl(id),
    enabled: !!fileQuery.data?.streamable,
    staleTime: 60_000,
  });

  return (
    <>
      <PageHeader
        eyebrow="Module 3 · Video player"
        title={fileQuery.data?.filename ?? "Loading…"}
        description="Signed, short-TTL URL. Real backend supports HTTP range requests so seeking does not re-download the file."
        actions={
          <Link href={`/files/${id}`}>
            <Button variant="secondary" size="sm">
              ← Details
            </Button>
          </Link>
        }
      />

      <Card padded>
        {fileQuery.isLoading || urlQuery.isLoading ? (
          <SkeletonRows rows={5} height={32} />
        ) : fileQuery.isError ? (
          <ErrorState retry={() => fileQuery.refetch()} />
        ) : !fileQuery.data?.streamable ? (
          <p className={styles.notStreamable}>
            This file is not streamable. Open the details page to download.
          </p>
        ) : urlQuery.isError ? (
          <ErrorState
            title="Could not get a stream URL"
            retry={() => urlQuery.refetch()}
          />
        ) : urlQuery.data ? (
          <div className={styles.player}>
            <video
              controls
              preload="metadata"
              className={styles.video}
              src={urlQuery.data.url}
            >
              <track kind="captions" />
              Your browser does not support video playback.
            </video>
            <div className={styles.meta}>
              URL expires{" "}
              {new Date(urlQuery.data.expiresAt).toLocaleTimeString()}
            </div>
          </div>
        ) : null}
      </Card>
    </>
  );
}
