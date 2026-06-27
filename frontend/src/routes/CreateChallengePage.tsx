import { AlertCircleIcon } from "lucide-react";

import {
  Alert,
  AlertDescription,
  AlertTitle
} from "@/components/ui/alert";
import { PageContainer } from "@/components/layout/PageContainer";
import { Skeleton } from "@/components/ui/skeleton";
import { ChallengeCreateForm } from "@/features/challenge-authoring/components/ChallengeCreateForm";
import { ChallengeCreateGate } from "@/features/challenge-authoring/components/ChallengeCreateGate";
import { useCurrentUserQuery } from "@/features/auth/queries";

export function CreateChallengePage() {
  const currentUserQuery = useCurrentUserQuery();
  const currentUser = currentUserQuery.data ?? null;

  return (
    <PageContainer className="py-10 sm:py-14">
      <div className="mb-8 max-w-3xl">
        <p className="text-sm font-medium text-primary">Authoring</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-normal">
          Crea una sfida
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Pubblica un riddle regex con esempi pubblici e controlli segreti. La
          valutazione della regex resta sul backend.
        </p>
      </div>

      {currentUserQuery.isLoading ? (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <Skeleton className="h-[42rem] rounded-lg" />
          <Skeleton className="h-52 rounded-lg" />
        </div>
      ) : currentUserQuery.isError ? (
        <Alert className="max-w-2xl" variant="destructive">
          <AlertCircleIcon aria-hidden="true" />
          <AlertTitle>Sessione non verificata</AlertTitle>
          <AlertDescription>
            Non posso verificare lo stato di login. Ricarica la pagina o riprova
            tra poco.
          </AlertDescription>
        </Alert>
      ) : currentUser ? (
        <ChallengeCreateForm currentUser={currentUser} />
      ) : (
        <ChallengeCreateGate />
      )}
    </PageContainer>
  );
}
