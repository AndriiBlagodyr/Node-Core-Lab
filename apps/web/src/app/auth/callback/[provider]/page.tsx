"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ApiClientError } from "@repo/types";
import { authApi } from "@/lib/api/auth";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ErrorState, SkeletonRows } from "@/components/ui/States";
import { PageHeader } from "@/components/ui/PageHeader";

type Stage = "exchanging" | "ok" | "failed";

/**
 * Receives the redirect from the backend OAuth start endpoint.
 *
 * Real flow (Backend Module 1):
 *  - Backend handled `state` + PKCE, exchanged the code, set the
 *    HttpOnly refresh cookie, then bounced us here.
 *  - We just need to confirm the session and route to `returnTo`.
 *
 * Mock flow:
 *  - This page receives `?mock=1` and pretends the exchange just happened by
 *    minting a session for "you@<provider>.com".
 */
export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <Card padded>
            <SkeletonRows rows={3} height={16} />
          </Card>
        </div>
      }
    >
      <OAuthCallback />
    </Suspense>
  );
}

function OAuthCallback() {
  const router = useRouter();
  const params = useParams<{ provider: string }>();
  const search = useSearchParams();
  const { setSession, refresh } = useAuth();
  const toast = useToast();

  const [stage, setStage] = useState<Stage>("exchanging");
  const [error, setError] = useState<string | null>(null);

  const provider = (params?.provider ?? "unknown") as string;
  const returnTo = search.get("returnTo") ?? "/";
  const mock = search.get("mock") === "1";
  const errorParam = search.get("error");

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        if (errorParam) {
          throw new ApiClientError({
            code: "oauth_error",
            message: `Provider returned an error: ${errorParam}`,
            status: 400,
          });
        }

        if (mock) {
          const session = await authApi.login({
            email: `you@${provider}.com`,
            password: "mock-oauth",
          });
          if (cancelled) return;
          setSession(session);
        } else {
          await refresh();
        }

        if (cancelled) return;
        setStage("ok");
        toast.success(`Signed in with ${provider}`);
        router.replace(returnTo);
      } catch (err) {
        if (cancelled) return;
        setStage("failed");
        if (err instanceof ApiClientError) setError(err.message);
        else if (err instanceof Error) setError(err.message);
        else setError("Unknown error");
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [errorParam, mock, provider, returnTo, refresh, setSession, router, toast]);

  return (
    <div style={{ maxWidth: 520, margin: "0 auto" }}>
      <PageHeader
        eyebrow="OAuth callback"
        title={`Finishing sign in with ${provider}`}
        description="Exchanging the authorization code for a session. The backend verifies state, PKCE, and the ID token before we land here."
      />
      <Card padded>
        {stage === "exchanging" && <SkeletonRows rows={3} height={16} />}
        {stage === "ok" && <p>Signed in. Redirecting…</p>}
        {stage === "failed" && (
          <ErrorState
            title="Could not finish sign in"
            description={error ?? undefined}
            retry={() => router.replace("/auth/login")}
          />
        )}
        {stage !== "exchanging" && (
          <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.replace("/auth/login")}
            >
              Back to login
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
