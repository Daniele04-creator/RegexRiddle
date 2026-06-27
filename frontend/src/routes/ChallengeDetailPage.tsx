import { ArrowLeftIcon } from "lucide-react";
import { Link, useParams } from "react-router";

import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AttemptPanel } from "@/features/attempts/components/AttemptPanel";
import { ChallengeExamples } from "@/features/challenges/components/ChallengeExamples";
import { ChallengeStats } from "@/features/challenges/components/ChallengeStats";
import { DifficultyBadge } from "@/features/challenges/components/DifficultyBadge";
import { formatDate } from "@/features/challenges/format";
import { useChallengeDetailQuery } from "@/features/challenges/queries";
import { ApiClientError } from "@/lib/api-client";

export function ChallengeDetailPage() {
  const { challengeId } = useParams();
  const id = challengeId ?? "";
  const challengeQuery = useChallengeDetailQuery(id);
  const challenge = challengeQuery.data;
  const isNotFound =
    challengeQuery.error instanceof ApiClientError && challengeQuery.error.status === 404;

  return (
    <PageContainer className="py-10 sm:py-14">
      <Button asChild variant="ghost">
        <Link to="/challenges">
          <ArrowLeftIcon aria-hidden="true" data-icon="inline-start" />
          Torna al catalogo
        </Link>
      </Button>

      {challengeQuery.isPending ? <ChallengeDetailSkeleton /> : null}

      {challengeQuery.isError ? (
        <Card className="mt-8" role="alert">
          <CardHeader>
            <CardTitle>
              {isNotFound ? "Sfida non trovata" : "Dettaglio non disponibile"}
            </CardTitle>
            <CardDescription>
              {isNotFound
                ? "La sfida richiesta non esiste o non e' piu' pubblica."
                : "Non sono riuscito a caricare questa sfida pubblica."}
            </CardDescription>
          </CardHeader>
          <CardFooter className="gap-2">
            <Button asChild variant="outline">
              <Link to="/challenges">Catalogo sfide</Link>
            </Button>
            <Button onClick={() => void challengeQuery.refetch()} type="button">
              Riprova
            </Button>
          </CardFooter>
        </Card>
      ) : null}

      {challenge !== undefined ? (
        <article className="mt-8 grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <DifficultyBadge difficulty={challenge.difficulty} />
              <span className="text-sm text-muted-foreground">
                {challenge.author.displayName} @{challenge.author.username}
              </span>
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-normal">
              {challenge.title}
            </h1>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              {challenge.description}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Statistiche pubbliche</CardTitle>
              <CardDescription>Tentativi e soluzioni della community.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChallengeStats
                attemptsTotal={challenge.stats.attemptsTotal}
                solutionsTotal={challenge.stats.solutionsTotal}
              />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Esempi pubblici</CardTitle>
              <CardDescription>
                Gli esempi sono indizi pubblici. Le prove nascoste decidono se
                hai risolto l'enigma.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChallengeExamples
                negative={challenge.publicNegativeExample}
                positive={challenge.publicPositiveExample}
              />
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Creata il {formatDate(challenge.createdAt)} - aggiornata il{" "}
                {formatDate(challenge.updatedAt)}
              </p>
            </CardFooter>
          </Card>

          <section
            aria-labelledby="attempt-panel-title"
            className="lg:col-span-2"
          >
            <div className="mb-3">
              <h2 id="attempt-panel-title" className="text-2xl font-semibold">
                Prova a risolvere
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                Scrivi una regex, invia il tentativo e ricevi un indizio
                numerico sulle prove superate.
              </p>
            </div>
            <AttemptPanel challenge={challenge} />
          </section>
        </article>
      ) : null}
    </PageContainer>
  );
}

function ChallengeDetailSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Caricamento dettaglio sfida"
      className="mt-8 grid gap-6 lg:grid-cols-[1fr_22rem]"
    >
      <div className="flex flex-col gap-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-24 w-full" />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
