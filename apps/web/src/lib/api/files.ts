import type {
  AppFile,
  CompleteUploadResponse,
  FileProcessingStatus,
  InitiateUploadRequest,
  InitiateUploadResponse,
  SignedFileUrl,
  UploadChunkResponse,
} from "@repo/types";
import { env } from "@/lib/env";
import { http } from "./http";
import { delay, mockError, uid } from "@/lib/mocks/util";

export interface FilesApi {
  initiateUpload: (
    input: InitiateUploadRequest
  ) => Promise<InitiateUploadResponse>;
  uploadChunk: (
    sessionId: string,
    chunkIndex: number,
    blob: Blob
  ) => Promise<UploadChunkResponse>;
  completeUpload: (sessionId: string) => Promise<CompleteUploadResponse>;
  cancelUpload: (sessionId: string) => Promise<void>;
  listFiles: () => Promise<AppFile[]>;
  getFile: (id: string) => Promise<AppFile>;
  getProcessingStatus: (id: string) => Promise<FileProcessingStatus>;
  getStreamUrl: (id: string) => Promise<SignedFileUrl>;
}

const realFiles: FilesApi = {
  initiateUpload: (input) =>
    http<InitiateUploadResponse>("/api/files/uploads", {
      method: "POST",
      body: input,
    }),
  uploadChunk: (sessionId, chunkIndex, blob) => {
    const fd = new FormData();
    fd.append("chunk", blob);
    fd.append("chunkIndex", String(chunkIndex));
    return http<UploadChunkResponse>(
      `/api/files/uploads/${sessionId}/chunks`,
      { method: "POST", body: fd }
    );
  },
  completeUpload: (sessionId) =>
    http<CompleteUploadResponse>(
      `/api/files/uploads/${sessionId}/complete`,
      { method: "POST" }
    ),
  cancelUpload: (sessionId) =>
    http(`/api/files/uploads/${sessionId}`, { method: "DELETE" }),
  listFiles: () => http<AppFile[]>("/api/files"),
  getFile: (id) => http<AppFile>(`/api/files/${id}`),
  getProcessingStatus: async (id) => {
    const file = await http<AppFile>(`/api/files/${id}/status`);
    return file.processingStatus;
  },
  getStreamUrl: (id) => http<SignedFileUrl>(`/api/files/${id}/stream-url`),
};

interface MockSession {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  totalChunks: number;
  receivedChunks: Set<number>;
  bytesReceived: number;
  expiresAt: string;
  cancelled: boolean;
}

const sessions = new Map<string, MockSession>();
const files: AppFile[] = [
  {
    id: "f_seed_1",
    filename: "introducing-the-event-loop.mp4",
    mimeType: "video/mp4",
    sizeBytes: 18_274_932,
    durationSec: 312,
    streamable: true,
    processingStatus: "ready",
    uploadedAt: new Date(Date.now() - 86_400_000).toISOString(),
    ownerId: "u_demo",
  },
  {
    id: "f_seed_2",
    filename: "node-streams-cheatsheet.pdf",
    mimeType: "application/pdf",
    sizeBytes: 412_311,
    streamable: false,
    processingStatus: "ready",
    uploadedAt: new Date(Date.now() - 3 * 86_400_000).toISOString(),
    ownerId: "u_demo",
  },
];

const mockFiles: FilesApi = {
  async initiateUpload(input) {
    await delay(180);
    if (input.sizeBytes <= 0) {
      throw mockError(
        "validation_error",
        "File size must be positive",
        400
      );
    }
    const chunkSize = input.preferredChunkSizeBytes ?? 1_048_576; // 1 MiB
    const totalChunks = Math.max(1, Math.ceil(input.sizeBytes / chunkSize));
    const session: MockSession = {
      id: uid("up"),
      filename: input.filename,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      totalChunks,
      receivedChunks: new Set(),
      bytesReceived: 0,
      expiresAt: new Date(Date.now() + 60 * 60_000).toISOString(),
      cancelled: false,
    };
    sessions.set(session.id, session);
    return {
      uploadSessionId: session.id,
      chunkSizeBytes: chunkSize,
      totalChunks,
      expiresAt: session.expiresAt,
    };
  },
  async uploadChunk(sessionId, chunkIndex, blob) {
    await delay(120 + Math.random() * 200);
    const s = sessions.get(sessionId);
    if (!s)
      throw mockError("not_found", `Upload session ${sessionId} not found`, 404);
    if (s.cancelled)
      throw mockError("conflict", "Upload session was cancelled", 409);
    s.receivedChunks.add(chunkIndex);
    s.bytesReceived = Math.min(s.sizeBytes, s.bytesReceived + blob.size);
    return {
      uploadSessionId: sessionId,
      receivedChunks: s.receivedChunks.size,
      totalChunks: s.totalChunks,
      bytesReceived: s.bytesReceived,
    };
  },
  async completeUpload(sessionId) {
    await delay(220);
    const s = sessions.get(sessionId);
    if (!s) throw mockError("not_found", "Upload session not found", 404);
    if (s.receivedChunks.size !== s.totalChunks) {
      throw mockError(
        "validation_error",
        `Missing chunks (${s.receivedChunks.size}/${s.totalChunks})`,
        400
      );
    }
    const file: AppFile = {
      id: uid("f"),
      filename: s.filename,
      mimeType: s.mimeType,
      sizeBytes: s.sizeBytes,
      streamable: s.mimeType.startsWith("video/"),
      processingStatus: "processing",
      uploadedAt: new Date().toISOString(),
      ownerId: "u_demo",
    };
    files.unshift(file);
    sessions.delete(sessionId);

    setTimeout(() => {
      const f = files.find((x) => x.id === file.id);
      if (f) f.processingStatus = "ready";
    }, 2000);
    return { file };
  },
  async cancelUpload(sessionId) {
    await delay(120);
    const s = sessions.get(sessionId);
    if (s) {
      s.cancelled = true;
      sessions.delete(sessionId);
    }
  },
  async listFiles() {
    await delay(180);
    return files.slice();
  },
  async getFile(id) {
    await delay(140);
    const f = files.find((x) => x.id === id);
    if (!f) throw mockError("not_found", `File ${id} not found`, 404);
    return f;
  },
  async getProcessingStatus(id) {
    await delay(120);
    const f = files.find((x) => x.id === id);
    if (!f) throw mockError("not_found", `File ${id} not found`, 404);
    return f.processingStatus;
  },
  async getStreamUrl(id) {
    await delay(140);
    const f = files.find((x) => x.id === id);
    if (!f) throw mockError("not_found", `File ${id} not found`, 404);
    return {
      url:
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      expiresAt: new Date(Date.now() + 5 * 60_000).toISOString(),
    };
  },
};

export const filesApi: FilesApi =
  env.apiMode === "mock" ? mockFiles : realFiles;
