import { useSearchParams } from "react-router";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChallengeCard } from "@/features/challenges/components/ChallengeCard";
import { PaginationControls } from "@/features/challenges/components/PaginationControls";
import { useChallengesQuery } from "@/features/challenges/queries";
import { hasNextPage, readPositivePageParam } from "@/lib/pagination";
import { PageContainer } from "@/components/layout/PageContainer";

const CHALLENGE_PAGE_LIMIT = 9;

export function ChallengesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = readPositivePageParam(searchParams.get("page"));
  const challengesQuery = useChallengesQuery({
    limit: CHALLENGE_PAGE_LIMIT,
    page
  });
  const data = challengesQuery.data;
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
        <p className="text-sm font-medium text-primary">Catalogo sfide</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-normal">
          Scegli il tuo prossimo enigma
        </h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          Ogni card mostra indizi pubblici, difficolta e risultati della
          community. Apri una sfida e prova a battere le prove nascoste.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-6" aria-live="polite">
        {challengesQuery.isPending ? <ChallengeCatalogSkeleton /> : null}

        {challengesQuery.isError ? (
          <Card role="alert">
            <CardHeader>
              <CardTitle>Catalogo non disponibile</CardTitle>
              <CardDescription>
                Non riesco a mostrare le sfide in questo momento. Riprova tra
                poco.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => void challengesQuery.refetch()} type="button">
                Riprova
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {data !== undefined && data.items.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Nessuna sfida pubblica</CardTitle>
              <CardDescription>
                Il laboratorio aspetta il primo enigma. Accedi e pubblica una
                sfida con esempi visibili e prove nascoste.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : null}

        {data !== undefined && data.items.length > 0 ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {data.items.map((challenge) => (
                <ChallengeCard challenge={challenge} key={challenge.id} />
              ))}
            </div>
            <PaginationControls
              canGoNext={canGoNext}
              canGoPrevious={canGoPrevious}
              label="Paginazione catalogo sfide"
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

function ChallengeCatalogSkeleton() {
  return (
    <div aria-label="Caricamento sfide" aria-busy="true" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <Card key={item}>
          <CardHeader>
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-36" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
