"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { LinkedAccount, SocialProvider, User } from "@repo/types";
import { authApi } from "@/lib/api/auth";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";
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

  const linkedQuery = useQuery({
    queryKey: ["auth", "linked-accounts"],
    queryFn: () => authApi.getLinkedAccounts(),
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

  const linkMutation = useMutation<void, Error, SocialProvider>({
    mutationFn: (p) => authApi.linkSocialAccount(p),
    onSuccess: (_, p) => {
      toast.success(`Linked ${p}`);
      void qc.invalidateQueries({ queryKey: ["auth", "linked-accounts"] });
    },
    onError: (err) => toast.error("Link failed", err.message),
  });

  const unlinkMutation = useMutation<void, Error, SocialProvider>({
    mutationFn: (p) => authApi.unlinkSocialAccount(p),
    onSuccess: (_, p) => {
      toast.info(`Unlinked ${p}`);
      void qc.invalidateQueries({ queryKey: ["auth", "linked-accounts"] });
    },
    onError: (err) => toast.error("Unlink failed", err.message),
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
              {profile.emailVerified ? (
                <Badge tone="success">verified</Badge>
              ) : (
                <Badge tone="warning">unverified</Badge>
              )}
            </div>
            <div className={styles.row}>
              <span className={styles.label}>2FA</span>
              <span>
                {profile.twoFactorEnabled ? "Enabled" : "Not configured"}
              </span>
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

        <Card
          title="Linked social accounts"
          description="Connect Google or GitHub to sign in without a password. Linking is by verified email only."
        >
          {linkedQuery.isLoading && <SkeletonRows rows={3} />}
          {linkedQuery.isError && (
            <ErrorState retry={() => linkedQuery.refetch()} />
          )}
          {linkedQuery.data && (
            <ul className={styles.linkList}>
              {(["google", "github"] as SocialProvider[]).map((p) => {
                const linked = linkedQuery.data.find((a) => a.provider === p);
                return (
                  <li key={p} className={styles.linkRow}>
                    <span className={styles.linkProvider}>{p}</span>
                    {linked ? (
                      <LinkedRow
                        account={linked}
                        onUnlink={() => unlinkMutation.mutate(p)}
                        busy={unlinkMutation.isPending}
                      />
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => linkMutation.mutate(p)}
                        loading={
                          linkMutation.isPending &&
                          linkMutation.variables === p
                        }
                      >
                        Link
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}

function LinkedRow({
  account,
  onUnlink,
  busy,
}: {
  account: LinkedAccount;
  onUnlink: () => void;
  busy: boolean;
}) {
  return (
    <div className={styles.linkedInfo}>
      <span className={styles.linkedEmail}>{account.providerEmail}</span>
      <Button size="sm" variant="ghost" onClick={onUnlink} loading={busy}>
        Unlink
      </Button>
    </div>
  );
}
