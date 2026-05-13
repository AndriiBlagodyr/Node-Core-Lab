import type {
  CreateJobRequest,
  Job,
  JobLogEntry,
  JobSseEvent,
  JobStatus,
} from "@repo/types";
import { env } from "@/lib/env";
import { http } from "./http";
import { delay, mockError, uid } from "@/lib/mocks/util";

export interface JobsApi {
  list: () => Promise<Job[]>;
  get: (id: string) => Promise<Job>;
  getLogs: (id: string) => Promise<JobLogEntry[]>;
  create: (req: CreateJobRequest) => Promise<Job>;
  retry: (id: string) => Promise<Job>;
  cancel: (id: string) => Promise<Job>;
  /**
   * Subscribe to job events. The "real" adapter will use `EventSource`; the
   * mock fires synthetic events on a timer. Returns an unsubscribe function.
   */
  subscribe: (id: string, onEvent: (e: JobSseEvent) => void) => () => void;
}

const realJobs: JobsApi = {
  list: () => http<Job[]>("/api/jobs"),
  get: (id) => http<Job>(`/api/jobs/${id}`),
  getLogs: (id) => http<JobLogEntry[]>(`/api/jobs/${id}/logs`),
  create: (req) => {
    const opts: { method: "POST"; body: CreateJobRequest; idempotencyKey?: string } = {
      method: "POST",
      body: req,
    };
    if (req.idempotencyKey) opts.idempotencyKey = req.idempotencyKey;
    return http<Job>("/api/jobs", opts);
  },
  retry: (id) => http<Job>(`/api/jobs/${id}/retry`, { method: "POST" }),
  cancel: (id) => http<Job>(`/api/jobs/${id}/cancel`, { method: "POST" }),
  subscribe: (id, onEvent) => {
    const url = `${env.apiBaseUrl}/api/jobs/${id}/events`;
    const es = new EventSource(url, { withCredentials: true });
    es.onmessage = (m) => {
      try {
        onEvent(JSON.parse(m.data) as JobSseEvent);
      } catch {
        /* ignore malformed event */
      }
    };
    return () => es.close();
  },
};

interface InternalJob extends Job {
  logs: JobLogEntry[];
  /** When set, indicates a running tick interval id. */
  tickHandle?: ReturnType<typeof setInterval>;
}

const jobs = new Map<string, InternalJob>();

function seed(): void {
  if (jobs.size > 0) return;
  const now = Date.now();
  const samples: InternalJob[] = [
    {
      id: "j_seed_1",
      type: "report.generate",
      status: "completed",
      progress: 100,
      attempt: 1,
      maxAttempts: 3,
      createdAt: new Date(now - 86_400_000).toISOString(),
      startedAt: new Date(now - 86_400_000 + 1000).toISOString(),
      finishedAt: new Date(now - 86_400_000 + 60_000).toISOString(),
      payload: { format: "pdf", scope: "weekly" },
      artifactUrl: "/api/files/f_seed_2",
      logs: [
        {
          at: new Date(now - 86_400_000 + 1000).toISOString(),
          level: "info",
          message: "Job picked up by worker",
        },
        {
          at: new Date(now - 86_400_000 + 60_000).toISOString(),
          level: "info",
          message: "Generated weekly.pdf",
        },
      ],
    },
    {
      id: "j_seed_2",
      type: "image.process",
      status: "failed",
      progress: 35,
      attempt: 3,
      maxAttempts: 3,
      createdAt: new Date(now - 7200_000).toISOString(),
      startedAt: new Date(now - 7200_000 + 500).toISOString(),
      finishedAt: new Date(now - 7100_000).toISOString(),
      errorMessage: "Source image is corrupted",
      payload: { fileId: "f_seed_x" },
      logs: [
        {
          at: new Date(now - 7200_000 + 500).toISOString(),
          level: "info",
          message: "Decoding image",
        },
        {
          at: new Date(now - 7100_000).toISOString(),
          level: "error",
          message: "EBADMAGIC",
        },
      ],
    },
  ];
  for (const j of samples) jobs.set(j.id, j);
}
seed();

const subscribers = new Map<string, Set<(e: JobSseEvent) => void>>();

function emit(jobId: string, event: JobSseEvent): void {
  subscribers.get(jobId)?.forEach((cb) => {
    try {
      cb(event);
    } catch {
      /* ignore subscriber errors */
    }
  });
}

function startTicking(j: InternalJob): void {
  if (j.tickHandle) return;
  j.startedAt = j.startedAt ?? new Date().toISOString();
  j.status = "running";
  emit(j.id, {
    event: "status",
    jobId: j.id,
    status: "running",
    at: new Date().toISOString(),
  });

  const handle = setInterval(() => {
    j.progress = Math.min(100, j.progress + 5 + Math.random() * 8);
    emit(j.id, {
      event: "progress",
      jobId: j.id,
      progress: j.progress,
      at: new Date().toISOString(),
    });
    if (j.progress >= 100) {
      j.progress = 100;
      j.status = "completed";
      j.finishedAt = new Date().toISOString();
      const log: JobLogEntry = {
        at: j.finishedAt,
        level: "info",
        message: "Done",
      };
      j.logs.push(log);
      emit(j.id, { event: "log", jobId: j.id, entry: log });
      const completedEvent: JobSseEvent = j.artifactUrl
        ? {
            event: "completed",
            jobId: j.id,
            artifactUrl: j.artifactUrl,
            at: j.finishedAt,
          }
        : { event: "completed", jobId: j.id, at: j.finishedAt };
      emit(j.id, completedEvent);
      clearInterval(handle);
      delete j.tickHandle;
    }
  }, 800);
  j.tickHandle = handle;
}

const mockJobs: JobsApi = {
  async list() {
    await delay(140);
    return Array.from(jobs.values())
      .map((j) => ({ ...j, logs: undefined }) as Job)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async get(id) {
    await delay(120);
    const j = jobs.get(id);
    if (!j) throw mockError("not_found", `Job ${id} not found`, 404);
    return { ...j, logs: undefined } as Job;
  },
  async getLogs(id) {
    await delay(100);
    const j = jobs.get(id);
    if (!j) throw mockError("not_found", `Job ${id} not found`, 404);
    return j.logs.slice();
  },
  async create(req) {
    await delay(220);
    const j: InternalJob = {
      id: uid("j"),
      type: req.type,
      status: "queued",
      progress: 0,
      attempt: 1,
      maxAttempts: 3,
      createdAt: new Date().toISOString(),
      payload: req.payload,
      logs: [
        {
          at: new Date().toISOString(),
          level: "info",
          message: "Job queued",
        },
      ],
      artifactUrl: req.type === "report.generate" ? "/api/files/f_seed_2" : undefined,
    };
    jobs.set(j.id, j);
    setTimeout(() => startTicking(j), 600);
    return { ...j, logs: undefined } as Job;
  },
  async retry(id) {
    await delay(180);
    const j = jobs.get(id);
    if (!j) throw mockError("not_found", `Job ${id} not found`, 404);
    if (!["failed", "cancelled"].includes(j.status)) {
      throw mockError(
        "conflict",
        `Cannot retry job in status ${j.status}`,
        409
      );
    }
    j.status = "queued";
    j.progress = 0;
    j.attempt += 1;
    delete j.errorMessage;
    delete j.finishedAt;
    j.logs.push({
      at: new Date().toISOString(),
      level: "info",
      message: "Retry requested",
    });
    setTimeout(() => startTicking(j), 400);
    return { ...j, logs: undefined } as Job;
  },
  async cancel(id) {
    await delay(140);
    const j = jobs.get(id);
    if (!j) throw mockError("not_found", `Job ${id} not found`, 404);
    if (j.tickHandle) {
      clearInterval(j.tickHandle);
      delete j.tickHandle;
    }
    if (["completed", "failed", "cancelled"].includes(j.status)) {
      return { ...j, logs: undefined } as Job;
    }
    j.status = "cancelled";
    j.finishedAt = new Date().toISOString();
    j.logs.push({
      at: j.finishedAt,
      level: "warn",
      message: "Cancelled by user",
    });
    emit(j.id, {
      event: "status",
      jobId: j.id,
      status: "cancelled",
      at: j.finishedAt,
    });
    return { ...j, logs: undefined } as Job;
  },
  subscribe(id, onEvent) {
    let set = subscribers.get(id);
    if (!set) {
      set = new Set();
      subscribers.set(id, set);
    }
    set.add(onEvent);

    const j = jobs.get(id);
    if (j && (j.status === "queued" || j.status === "running")) {
      startTicking(j);
    }

    return () => {
      const s = subscribers.get(id);
      if (!s) return;
      s.delete(onEvent);
      if (s.size === 0) subscribers.delete(id);
    };
  },
};

export const jobsApi: JobsApi = env.apiMode === "mock" ? mockJobs : realJobs;

export function jobStatusTone(status: JobStatus) {
  return status;
}
