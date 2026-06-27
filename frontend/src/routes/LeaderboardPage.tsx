import { useSearchParams } from "react-router";
import { TrophyIcon } from "lucide-react";
import type { LeaderboardItemDTO } from "@regexriddle/shared";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/layout/PageContainer";
import { PaginationControls } from "@/features/challenges/components/PaginationControls";
import { LeaderboardMobileList } from "@/features/leaderboard/components/LeaderboardMobileList";
import { LeaderboardTable } from "@/features/leaderboard/components/LeaderboardTable";
import { useLeaderboardQuery } from "@/features/leaderboard/queries";
import { hasNextPage, readPositivePageParam } from "@/lib/pagination";

const LEADERBOARD_PAGE_LIMIT = 10;

export function LeaderboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = readPositivePageParam(searchParams.get("page"));
  const leaderboardQuery = useLeaderboardQuery({
    limit: LEADERBOARD_PAGE_LIMIT,
    page
  });
  const data = leaderboardQuery.data;
  const canGoPrevious = page > 1;
  const canGoNext =
    data !== undefined &&
    hasNextPage({ limit: data.limit, page: data.page, total: data.total });

  function updatePage(nextPage: number): void {
    const nextParams = new URLSearchParams(searchParams);

    if (nextPage <= 1) {
      nextParams.delete("page");
    } else {
      nextParams.set("page", String(nextPage));
    }

    setSearchParams(nextParams);
  }

  return (
    <PageContainer className="py-10 sm:py-14">
      <div className="max-w-3xl">
        <Badge variant="secondary">Classifica pubblica</Badge>
        <h1 className="mt-4 text-4xl font-semibold tracking-normal">
          Classifica solver
        </h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          I migliori solver salgono risolvendo piu sfide con meno tentativi.
        </p>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Formula di ranking</CardTitle>
          <CardDescription>
            Conta prima chi risolve piu sfide. A parita, vince chi usa meno
            tentativi.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="mt-6 flex flex-col gap-6" aria-live="polite">
        {leaderboardQuery.isPending ? <LeaderboardSkeleton /> : null}

        {leaderboardQuery.isError ? (
          <Card role="alert">
            <CardHeader>
              <CardTitle>Classifica non disponibile</CardTitle>
              <CardDescription>
                Non sono riuscito a caricare la leaderboard pubblica.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => void leaderboardQuery.refetch()} type="button">
                Riprova
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {data !== undefined && data.items.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Nessun solver in classifica</CardTitle>
              <CardDescription>
                La classifica aspetta il primo solver.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : null}

        {data !== undefined && data.items.length > 0 ? (
          <>
            <LeaderboardPodium items={data.items.slice(0, 3)} />
            <div className="hidden md:block">
              <LeaderboardTable items={data.items} />
            </div>
            <div className="md:hidden">
              <LeaderboardMobileList items={data.items} />
            </div>
            <PaginationControls
              canGoNext={canGoNext}
              canGoPrevious={canGoPrevious}
              label="Paginazione classifica solver"
              onNext={() => updatePage(page + 1)}
              onPrevious={() => updatePage(page - 1)}
              page={page}
              total={data.total}
            />
          </>
        ) : null}
      </div>
    </PageContainer>
  );
}

function LeaderboardPodium({ items }: { items: LeaderboardItemDTO[] }) {
  const title = items.length >= 3 ? "Podio top 3" : "Podio in formazione";

  return (
    <section aria-labelledby="podium-title">
      <h2 id="podium-title" className="sr-only">
        {title}
      </h2>
      <div className="grid gap-3 md:grid-cols-3">
        {items.map((item) => (
          <Card className="bg-card/90" key={item.user.username}>
            <CardHeader>
              <div className="mb-2 flex items-center justify-between gap-3">
                <Badge variant={item.rank === 1 ? "default" : "secondary"}>
                  #{item.rank}
                </Badge>
                <TrophyIcon aria-hidden="true" className="text-primary" />
              </div>
              <CardTitle>{item.user.displayName}</CardTitle>
              <CardDescription>
                @{item.user.username} - {item.solvedCount} sfide risolte
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}

function LeaderboardSkeleton() {
  return (
    <Card aria-label="Caricamento classifica" aria-busy="true">
      <CardHeader>
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {[1, 2, 3, 4].map((item) => (
          <Skeleton className="h-12 w-full" key={item} />
        ))}
      </CardContent>
    </Card>
  );
}
