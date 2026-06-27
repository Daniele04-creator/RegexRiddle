import { LockKeyholeIcon } from "lucide-react";

import { PageContainer } from "@/components/layout/PageContainer";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthStatusCard } from "@/features/auth/components/AuthStatusCard";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { useCurrentUserQuery } from "@/features/auth/queries";

export function LoginPage() {
  const currentUserQuery = useCurrentUserQuery();

  return (
    <PageContainer className="py-10 sm:py-14">
      <div className="max-w-3xl">
        <Badge variant="secondary">Auth UI live</Badge>
        <h1 className="mt-4 flex items-center gap-3 text-4xl font-semibold tracking-normal">
          <LockKeyholeIcon aria-hidden="true" />
          Login
        </h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          Accedi con le API backend esistenti. Il frontend aggiorna la sessione
          tramite GET /api/auth/me e non conserva token nel browser.
        </p>
      </div>
      <div className="mt-8">
        {currentUserQuery.isLoading ? (
          <div className="max-w-xl rounded-lg border bg-card/88 p-6" aria-busy="true">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="mt-4 h-12 w-full" />
            <Skeleton className="mt-3 h-12 w-full" />
          </div>
        ) : currentUserQuery.data ? (
          <AuthStatusCard mode="login" user={currentUserQuery.data} />
        ) : (
          <LoginForm />
        )}
      </div>
    </PageContainer>
  );
}
