import { ConstructionIcon, LockKeyholeIcon } from "lucide-react";
import { Link } from "react-router";

import { routePaths } from "@/app/router";
import { PageContainer } from "@/components/layout/PageContainer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
import { useCurrentUserQuery } from "@/features/auth/queries";

export function RequireAuthPlaceholder() {
  const currentUserQuery = useCurrentUserQuery();

  if (currentUserQuery.isLoading) {
    return (
      <PageContainer className="py-10 sm:py-14">
        <div className="max-w-3xl">
          <Badge variant="secondary">Area protetta</Badge>
          <h1 className="mt-4 text-4xl font-semibold tracking-normal">
            Create a challenge
          </h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Verifico la sessione prima di mostrare lo stato corretto.
          </p>
        </div>
        <Card className="mt-8 max-w-2xl bg-card/88" aria-busy="true">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full max-w-md" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-3/4" />
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  if (!currentUserQuery.data) {
    return (
      <PageContainer className="py-10 sm:py-14">
        <div className="max-w-3xl">
          <Badge variant="secondary">Area protetta</Badge>
          <h1 className="mt-4 text-4xl font-semibold tracking-normal">
            Create a challenge
          </h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Le pagine pubbliche restano accessibili. Per creare una sfida serve
            una sessione valida.
          </p>
        </div>
        <Card className="mt-8 max-w-2xl bg-card/88">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LockKeyholeIcon aria-hidden="true" />
              Accedi per creare una sfida
            </CardTitle>
            <CardDescription>
              La creazione dal browser arrivera nel GOAL 08.4. In questo goal
              mostriamo solo il gate di autenticazione.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <LockKeyholeIcon aria-hidden="true" />
              <AlertTitle>Sessione richiesta</AlertTitle>
              <AlertDescription>
                Login e registrazione usano un cookie HttpOnly gestito dal
                backend. Il frontend non legge cookie e non conserva token.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to={routePaths.login}>Accedi</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to={routePaths.register}>Registrati</Link>
            </Button>
          </CardFooter>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-10 sm:py-14">
      <div className="max-w-3xl">
        <Badge variant="secondary">Area protetta</Badge>
        <h1 className="mt-4 text-4xl font-semibold tracking-normal">
          Create a challenge
        </h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          {`Sei autenticato come ${currentUserQuery.data.displayName} (@${currentUserQuery.data.username}).`}
        </p>
      </div>
      <Card className="mt-8 max-w-2xl bg-card/88">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ConstructionIcon aria-hidden="true" />
            Creazione sfida in arrivo nel GOAL 08.4.
          </CardTitle>
          <CardDescription>
            Il backend protetto per creare sfide esiste gia, ma questo
            milestone non introduce il form autore.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm leading-6 text-muted-foreground">
            Nessun pattern o controllo segreto viene inviato dal frontend in
            GOAL 08.2. La UI resta un placeholder protetto.
          </p>
          <Alert>
            <LockKeyholeIcon aria-hidden="true" />
            <AlertTitle>Contratto preservato</AlertTitle>
            <AlertDescription>
              La sessione corrente arriva da GET /api/auth/me. Il browser non
              legge cookie e non memorizza token.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
