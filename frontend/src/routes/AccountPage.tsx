import { AlertCircleIcon, SettingsIcon } from "lucide-react";

import { PageContainer } from "@/components/layout/PageContainer";
import {
  Alert,
  AlertDescription,
  AlertTitle
} from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AccountGate } from "@/features/account/components/AccountGate";
import { AccountSettingsForm } from "@/features/account/components/AccountSettingsForm";
import { AccountSummaryCard } from "@/features/account/components/AccountSummaryCard";
import { useCurrentUserQuery } from "@/features/auth/queries";

function AccountLoadingState() {
  return (
    <div
      aria-busy="true"
      aria-label="Caricamento account"
      className="grid gap-5 lg:grid-cols-[22rem_minmax(0,1fr)]"
    >
      <Skeleton className="h-80 rounded-lg" />
      <Skeleton className="h-[32rem] rounded-lg" />
    </div>
  );
}

export function AccountPage() {
  const currentUserQuery = useCurrentUserQuery();
  const currentUser = currentUserQuery.data ?? null;

  return (
    <PageContainer className="py-10 sm:py-14">
      <div className="mb-8 max-w-3xl">
        <Badge variant="secondary">Account</Badge>
        <h1 className="mt-4 flex items-center gap-3 text-4xl font-semibold tracking-normal">
          <SettingsIcon aria-hidden="true" />
          Impostazioni account
        </h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          Gestisci il profilo visibile del tuo account corrente. La sessione
          resta server-side e il frontend non legge cookie né salva token.
        </p>
      </div>

      {currentUserQuery.isLoading ? (
        <AccountLoadingState />
      ) : currentUserQuery.isError ? (
        <Alert className="max-w-2xl" variant="destructive">
          <AlertCircleIcon aria-hidden="true" />
          <AlertTitle>Account non disponibile</AlertTitle>
          <AlertDescription>
            Non posso verificare la sessione. Ricarica la pagina o riprova tra
            poco.
          </AlertDescription>
        </Alert>
      ) : currentUser ? (
        <div className="grid gap-5 lg:grid-cols-[22rem_minmax(0,1fr)] lg:items-start">
          <AccountSummaryCard user={currentUser} />
          <AccountSettingsForm user={currentUser} />
        </div>
      ) : (
        <AccountGate />
      )}
    </PageContainer>
  );
}
