"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ApiClientError, type Session } from "@repo/types";
import { authApi } from "@/lib/api/auth";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { SkeletonRows } from "@/components/ui/States";
import { SocialButtons } from "../components/SocialButtons";
import styles from "../auth.module.css";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.center}>
          <SkeletonRows rows={5} />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/";
  const { setSession } = useAuth();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const mutation = useMutation<Session, Error, FormValues>({
    mutationFn: (values) => authApi.login(values),
    onSuccess: (session) => {
      setSession(session);
      toast.success("Signed in", `Welcome back, ${session.user.name}`);
      router.replace(next);
    },
    onError: (err) => {
      if (err instanceof ApiClientError) {
        if (err.details) {
          for (const [field, msgs] of Object.entries(err.details)) {
            if (msgs[0]) {
              setError(field as keyof FormValues, { message: msgs[0] });
            }
          }
        }
        toast.error("Sign in failed", err.message);
      } else {
        toast.error("Sign in failed", err.message);
      }
    },
  });

  return (
    <div className={styles.center}>
      <PageHeader
        eyebrow="Module 1 · Auth & Security"
        title="Sign in"
        description="Mock backend rules: any email works. Use password 'wrong' to see a 401, 'lockout' to see rate-limit handling."
      />

      <Card padded>
        <form
          onSubmit={handleSubmit((v) => mutation.mutate(v))}
          className={styles.form}
          noValidate
        >
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password")}
          />

          <Button
            type="submit"
            loading={mutation.isPending}
            fullWidth
            size="lg"
          >
            Sign in
          </Button>
        </form>

        <div className={styles.divider}>
          <span>or continue with</span>
        </div>

        <SocialButtons mode="signin" returnTo={next} />

        <div className={styles.altRow}>
          <span>New here?</span>
          <Link href={`/auth/register?next=${encodeURIComponent(next)}`}>
            Create an account
          </Link>
        </div>
      </Card>
    </div>
  );
}
