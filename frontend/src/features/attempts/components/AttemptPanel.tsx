import type { ChallengeDetailDTO } from "@regexriddle/shared";

import {
  Card,
  CardContent,
  CardHeader
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AttemptForm } from "@/features/attempts/components/AttemptForm";
import { SolverGateCard } from "@/features/attempts/components/SolverGateCard";
import { useCurrentUserQuery } from "@/features/auth/queries";

interface AttemptPanelProps {
  challenge: ChallengeDetailDTO;
}

export function AttemptPanel({ challenge }: AttemptPanelProps) {
  const currentUserQuery = useCurrentUserQuery();
  const currentUser = currentUserQuery.data;

  if (currentUserQuery.isPending) {
    return <AttemptPanelSkeleton />;
  }

  if (currentUserQuery.isError) {
    return <SolverGateCard mode="session-error" />;
  }

  if (currentUser == null) {
    return <SolverGateCard mode="guest" />;
  }

  const isAuthor = currentUser.username === challenge.author.username;

  if (isAuthor) {
    return <SolverGateCard mode="author" />;
  }

  return <AttemptForm challengeId={challenge.id} isAuthor={isAuthor} />;
}

function AttemptPanelSkeleton() {
  return (
    <Card aria-busy="true" aria-label="Caricamento area tentativi">
      <CardHeader>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-12 w-full" />
      </CardContent>
    </Card>
  );
}
