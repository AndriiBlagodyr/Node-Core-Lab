"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import type { CreateJobRequest, Job, JobType } from "@repo/types";
import { jobsApi } from "@/lib/api/jobs";
import { useToast } from "@/components/ui/Toast";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Select, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

const schema = z.object({
  type: z.enum(["report.generate", "image.process", "data.export"]),
  scope: z.string().min(1, "Required"),
  format: z.enum(["pdf", "csv", "json"]),
  idempotencyKey: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function NewJobPage() {
  const router = useRouter();
  const toast = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "report.generate",
      scope: "weekly",
      format: "pdf",
    },
  });

  const mutation = useMutation<Job, Error, FormValues>({
    mutationFn: (v) => {
      const req: CreateJobRequest = {
        type: v.type as JobType,
        payload: { scope: v.scope, format: v.format },
      };
      if (v.idempotencyKey) req.idempotencyKey = v.idempotencyKey;
      return jobsApi.create(req);
    },
    onSuccess: (job) => {
      toast.success("Job queued", `Streaming live updates for ${job.id}`);
      router.push(`/jobs/${job.id}`);
    },
    onError: (err) => toast.error("Could not create job", err.message),
  });

  return (
    <>
      <PageHeader
        eyebrow="Module 4 · New job"
        title="Generate report"
        description="The same shape your /api/jobs POST will accept. Idempotency-Key is forwarded as a header so retries don't double-charge work."
      />

      <Card padded>
        <form
          onSubmit={handleSubmit((v) => mutation.mutate(v))}
          style={{ display: "grid", gap: 12, maxWidth: 520 }}
          noValidate
        >
          <Select
            label="Job type"
            error={errors.type?.message}
            {...register("type")}
          >
            <option value="report.generate">report.generate</option>
            <option value="image.process">image.process</option>
            <option value="data.export">data.export</option>
          </Select>
          <Input
            label="Scope"
            placeholder="weekly"
            error={errors.scope?.message}
            {...register("scope")}
          />
          <Select
            label="Format"
            error={errors.format?.message}
            {...register("format")}
          >
            <option value="pdf">pdf</option>
            <option value="csv">csv</option>
            <option value="json">json</option>
          </Select>
          <Input
            label="Idempotency key"
            hint="Optional. Pass the same key on retries to avoid duplicate jobs."
            error={errors.idempotencyKey?.message}
            {...register("idempotencyKey")}
          />

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              type="submit"
              loading={isSubmitting || mutation.isPending}
              size="lg"
            >
              Queue job
            </Button>
          </div>
        </form>
      </Card>
    </>
  );
}
