import type { Iso8601 } from "./common";

export type FileId = string;
export type UploadSessionId = string;

export type FileProcessingStatus =
  | "pending"
  | "processing"
  | "ready"
  | "failed";

export interface AppFile {
  id: FileId;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  sha256?: string;
  processingStatus: FileProcessingStatus;
  uploadedAt: Iso8601;
  ownerId: string;
  /** Optional: only populated for video files. */
  durationSec?: number;
  /** Whether the file can be streamed via HTTP range requests. */
  streamable: boolean;
}

export interface InitiateUploadRequest {
  filename: string;
  mimeType: string;
  sizeBytes: number;
  /** Recommended chunk size from client (server may override). */
  preferredChunkSizeBytes?: number;
}

export interface InitiateUploadResponse {
  uploadSessionId: UploadSessionId;
  chunkSizeBytes: number;
  totalChunks: number;
  expiresAt: Iso8601;
}

export interface UploadChunkResponse {
  uploadSessionId: UploadSessionId;
  receivedChunks: number;
  totalChunks: number;
  bytesReceived: number;
}

export interface CompleteUploadResponse {
  file: AppFile;
}

export interface SignedFileUrl {
  url: string;
  expiresAt: Iso8601;
}
