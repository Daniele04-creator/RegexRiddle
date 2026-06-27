import { UserPlusIcon } from "lucide-react";

import { PageContainer } from "@/components/layout/PageContainer";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthStatusCard } from "@/features/auth/components/AuthStatusCard";
import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { useCurrentUserQuery } from "@/features/auth/queries";

export function RegisterPage() {
  const currentUserQuery = useCurrentUserQuery();

  return (
    <PageContainer className="py-10 sm:py-14">
      <div className="max-w-3xl">
        <Badge variant="secondary">Auth UI live</Badge>
        <h1 className="mt-4 flex items-center gap-3 text-4xl font-semibold tracking-normal">
          <UserPlusIcon aria-hidden="true" />
          Register
        </h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          Registra un account con sessione server-side. Il form normalizza
          username/email e manda solo i campi previsti dal contratto auth.
        </p>
      </div>
      <div className="mt-8">
        {currentUserQuery.isLoading ? (
          <div className="max-w-2xl rounded-lg border bg-card/88 p-6" aria-busy="true">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="mt-4 h-12 w-full" />
            <Skeleton className="mt-3 h-12 w-full" />
            <Skeleton className="mt-3 h-12 w-3/4" />
          </div>
        ) : currentUserQuery.data ? (
          <AuthStatusCard mode="register" user={currentUserQuery.data} />
        ) : (
          <RegisterForm />
        )}
      </div>
    </PageContainer>
  );
}
