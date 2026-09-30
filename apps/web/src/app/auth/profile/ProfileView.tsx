"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { User } from "@repo/types";
import { authApi } from "@/lib/api/auth";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Field";
import { ErrorState, SkeletonRows } from "@/components/ui/States";
import { PageHeader } from "@/components/ui/PageHeader";
import styles from "./profile.module.css";

const schema = z.object({
  name: z.string().min(2, "Name is too short"),
  avatarUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
});
type FormValues = z.infer<typeof schema>;

export function ProfileView() {
  const { user } = useAuth();
  const toast = useToast();
  const qc = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ["auth", "profile"],
    queryFn: () => authApi.getProfile(),
    initialData: user ?? undefined,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: {
      name: profileQuery.data?.name ?? "",
      avatarUrl: profileQuery.data?.avatarUrl ?? "",
    },
  });

  const updateMutation = useMutation<User, Error, FormValues>({
    mutationFn: (v) => {
      const update: { name: string; avatarUrl?: string } = { name: v.name };
      if (v.avatarUrl) update.avatarUrl = v.avatarUrl;
      return authApi.updateProfile(update);
    },
    onSuccess: (next) => {
      toast.success("Profile updated");
      reset({
        name: next.name,
        avatarUrl: next.avatarUrl ?? "",
      });
      qc.setQueryData(["auth", "profile"], next);
    },
    onError: (err) => toast.error("Could not update profile", err.message),
  });


  if (profileQuery.isLoading) {
    return (
      <Card padded>
        <SkeletonRows rows={5} />
      </Card>
    );
  }
  if (profileQuery.isError || !profileQuery.data) {
    return (
      <ErrorState
        title="Could not load profile"
        retry={() => profileQuery.refetch()}
      />
    );
  }

  const profile = profileQuery.data;

  return (
    <>
      <PageHeader
        eyebrow="Module 1 · Auth & Security"
        title="Profile"
        description="Backed by the same `User` type the backend will return from /auth/me."
      />

      <div className={styles.grid}>
        <Card title="Account">
          <div className={styles.account}>
            <div className={styles.row}>
              <span className={styles.label}>Email</span>
              <span>{profile.email}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Joined</span>
              <span>{new Date(profile.createdAt).toLocaleString()}</span>
            </div>
          </div>
        </Card>

        <Card
          title="Edit profile"
          actions={
            <Button
              type="submit"
              form="profile-form"
              size="sm"
              loading={updateMutation.isPending}
              disabled={!isDirty}
            >
              Save
            </Button>
          }
        >
          <form
            id="profile-form"
            onSubmit={handleSubmit((v) => updateMutation.mutate(v))}
            className={styles.form}
            noValidate
          >
            <Input
              label="Display name"
              error={errors.name?.message}
              {...register("name")}
            />
            <Input
              label="Avatar URL"
              hint="Optional. Will be used in the topbar avatar."
              error={errors.avatarUrl?.message}
              {...register("avatarUrl")}
            />
          </form>
        </Card>

      </div>
    </>
  );
}
