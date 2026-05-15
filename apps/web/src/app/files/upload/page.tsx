"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiClientError } from "@repo/types";
import { filesApi } from "@/lib/api/files";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { formatBytes } from "@/lib/format";
import styles from "./upload.module.css";

type UploadState =
  | { phase: "idle" }
  | {
      phase: "initiating" | "uploading" | "completing";
      sessionId?: string;
      sentBytes: number;
      totalBytes: number;
      sentChunks: number;
      totalChunks: number;
      paused?: boolean;
      cancelRequested?: boolean;
    }
  | { phase: "done"; fileId: string }
  | { phase: "error"; message: string };

export default function UploadPage() {
  const router = useRouter();
  const toast = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<UploadState>({ phase: "idle" });
  const inputRef = useRef<HTMLInputElement>(null);
  const pauseRef = useRef(false);
  const cancelRef = useRef(false);

  const reset = () => {
    setFile(null);
    setState({ phase: "idle" });
    pauseRef.current = false;
    cancelRef.current = false;
    if (inputRef.current) inputRef.current.value = "";
  };

  const start = useCallback(async () => {
    if (!file) return;
    pauseRef.current = false;
    cancelRef.current = false;
    setState({
      phase: "initiating",
      sentBytes: 0,
      totalBytes: file.size,
      sentChunks: 0,
      totalChunks: 0,
    });

    let sessionId: string | undefined;
    try {
      const session = await filesApi.initiateUpload({
        filename: file.name,
        mimeType: file.type || "application/octet-stream",
        sizeBytes: file.size,
      });
      sessionId = session.uploadSessionId;

      const chunkSize = session.chunkSizeBytes;
      const totalChunks = session.totalChunks;
      let sentBytes = 0;
      let sentChunks = 0;

      setState({
        phase: "uploading",
        sessionId,
        sentBytes,
        totalBytes: file.size,
        sentChunks,
        totalChunks,
      });

      for (let i = 0; i < totalChunks; i++) {
        if (cancelRef.current) {
          await filesApi.cancelUpload(sessionId);
          setState({ phase: "idle" });
          toast.info("Upload cancelled");
          return;
        }
        while (pauseRef.current && !cancelRef.current) {
          await new Promise((r) => setTimeout(r, 200));
        }

        const start = i * chunkSize;
        const end = Math.min(file.size, start + chunkSize);
        const blob = file.slice(start, end);
        const result = await filesApi.uploadChunk(sessionId, i, blob);
        sentChunks = result.receivedChunks;
        sentBytes = result.bytesReceived;
        setState({
          phase: "uploading",
          sessionId,
          sentBytes,
          totalBytes: file.size,
          sentChunks,
          totalChunks,
        });
      }

      setState((prev) =>
        prev.phase === "uploading"
          ? { ...prev, phase: "completing" }
          : prev
      );
      const completed = await filesApi.completeUpload(sessionId);
      setState({ phase: "done", fileId: completed.file.id });
      toast.success("Upload complete", "Processing has started.");
    } catch (err) {
      const msg =
        err instanceof ApiClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Unknown error";
      setState({ phase: "error", message: msg });
      toast.error("Upload failed", msg);
    }
  }, [file, toast]);

  const togglePause = () => {
    pauseRef.current = !pauseRef.current;
    setState((s) =>
      s.phase === "uploading" ? { ...s, paused: pauseRef.current } : s
    );
  };

  const cancel = () => {
    cancelRef.current = true;
  };

  return (
    <>
      <PageHeader
        eyebrow="Module 3 · Upload"
        title="Upload a file"
        description="Multipart upload with pause/resume/cancel controls. Real backend will use HTTP Content-Range and incremental SHA-256."
      />

      <Card padded>
        {state.phase === "idle" && (
          <div className={styles.dropzone}>
            <input
              ref={inputRef}
              type="file"
              className={styles.fileInput}
              id="file-input"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <label htmlFor="file-input" className={styles.dropzoneLabel}>
              <span className={styles.dropzoneIcon} aria-hidden="true">
                ⬆
              </span>
              <span className={styles.dropzoneText}>
                {file
                  ? `${file.name} (${formatBytes(file.size)})`
                  : "Click to choose a file"}
              </span>
              <span className={styles.dropzoneHint}>
                Or drop it here. Any size — we&apos;ll chunk it for you.
              </span>
            </label>
            <div className={styles.actions}>
              <Button onClick={start} disabled={!file} size="lg">
                Start upload
              </Button>
            </div>
          </div>
        )}

        {(state.phase === "initiating" ||
          state.phase === "uploading" ||
          state.phase === "completing") && (
          <div className={styles.progressView}>
            <div className={styles.progressHeader}>
              <span>{file?.name}</span>
              <Badge
                tone={state.phase === "completing" ? "warning" : "info"}
              >
                {state.phase === "initiating"
                  ? "preparing"
                  : state.phase === "completing"
                    ? "finalizing"
                    : state.paused
                      ? "paused"
                      : "uploading"}
              </Badge>
            </div>
            <Progress
              value={(state.sentBytes / Math.max(1, state.totalBytes)) * 100}
              label={`${formatBytes(state.sentBytes)} of ${formatBytes(
                state.totalBytes
              )}`}
            />
            <div className={styles.chunkInfo}>
              chunks: {state.sentChunks} / {state.totalChunks}
            </div>
            <div className={styles.actions}>
              <Button
                variant="secondary"
                size="sm"
                onClick={togglePause}
                disabled={state.phase !== "uploading"}
              >
                {state.paused ? "Resume" : "Pause"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={cancel}
                disabled={state.phase === "completing"}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {state.phase === "done" && (
          <div className={styles.doneView}>
            <h3 className={styles.doneTitle}>Upload complete</h3>
            <p className={styles.doneDesc}>
              The backend is processing the file. Status updates poll
              automatically.
            </p>
            <div className={styles.actions}>
              <Button onClick={() => router.push(`/files/${state.fileId}`)}>
                Open file
              </Button>
              <Button variant="secondary" onClick={reset}>
                Upload another
              </Button>
            </div>
          </div>
        )}

        {state.phase === "error" && (
          <div className={styles.errorView}>
            <h3 className={styles.errorTitle}>Upload failed</h3>
            <p className={styles.errorDesc}>{state.message}</p>
            <Button variant="secondary" onClick={reset}>
              Try again
            </Button>
          </div>
        )}
      </Card>
    </>
  );
}
