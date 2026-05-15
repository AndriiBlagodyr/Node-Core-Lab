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

const schema = z
  .object({
    name: z.string().min(2, "Name is too short"),
    email: z.string().email("Enter a valid email"),
    password: z
      .string()
      .min(8, "Use at least 8 characters")
      .regex(/[A-Z]/, "Add at least one uppercase letter")
      .regex(/[0-9]/, "Add at least one number"),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.center}>
          <SkeletonRows rows={6} />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
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
    defaultValues: { name: "", email: "", password: "", confirm: "" },
  });

  const mutation = useMutation<Session, Error, FormValues>({
    mutationFn: (v) =>
      authApi.register({ name: v.name, email: v.email, password: v.password }),
    onSuccess: (session) => {
      setSession(session);
      toast.success(
        "Account created",
        "Verify your email to unlock 2FA and account-level operations."
      );
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
        toast.error("Sign up failed", err.message);
      } else {
        toast.error("Sign up failed", err.message);
      }
    },
  });

  return (
    <div className={styles.center}>
      <PageHeader
        eyebrow="Module 1 · Auth & Security"
        title="Create your account"
        description="Mock rule: try 'taken@example.com' to see the conflict (409) state."
      />

      <Card padded>
        <form
          onSubmit={handleSubmit((v) => mutation.mutate(v))}
          className={styles.form}
          noValidate
        >
          <Input
            label="Full name"
            placeholder="Ada Lovelace"
            autoComplete="name"
            error={errors.name?.message}
            {...register("name")}
          />
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
            autoComplete="new-password"
            hint="At least 8 characters, with one uppercase letter and one number."
            error={errors.password?.message}
            {...register("password")}
          />
          <Input
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            error={errors.confirm?.message}
            {...register("confirm")}
          />

          <Button
            type="submit"
            loading={mutation.isPending}
            fullWidth
            size="lg"
          >
            Create account
          </Button>
        </form>

        <div className={styles.divider}>
          <span>or continue with</span>
        </div>

        <SocialButtons mode="signup" returnTo={next} />

        <div className={styles.altRow}>
          <span>Already have an account?</span>
          <Link href={`/auth/login?next=${encodeURIComponent(next)}`}>
            Sign in
          </Link>
        </div>
      </Card>
    </div>
  );
}
