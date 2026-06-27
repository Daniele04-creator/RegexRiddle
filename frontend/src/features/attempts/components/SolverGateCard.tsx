import { ArrowRightIcon, LockKeyholeIcon, ShieldAlertIcon } from "lucide-react";
import { Link } from "react-router";

import { routePaths } from "@/app/router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

interface SolverGateCardProps {
  mode: "author" | "guest" | "session-error";
}

export function SolverGateCard({ mode }: SolverGateCardProps) {
  const isAuthor = mode === "author";
  const isSessionError = mode === "session-error";
  const title = isAuthor
    ? "Sei l'autore di questa sfida"
    : isSessionError
      ? "Sessione non verificata"
      : "Accedi per risolvere";
  const description = isAuthor
    ? "Gli autori non possono risolvere le proprie sfide."
    : isSessionError
      ? "Non riesco a verificare la sessione in modo affidabile. Accedi di nuovo e riprova."
      : "I tentativi sono protetti da sessione HttpOnly.";

  return (
    <Card className="bg-card/88">
      <CardHeader>
        <div className="flex items-start gap-3">
          {isAuthor ? (
            <ShieldAlertIcon
              aria-hidden="true"
              className="mt-1 size-5 shrink-0 text-amber-600"
            />
          ) : (
            <LockKeyholeIcon
              aria-hidden="true"
              className="mt-1 size-5 shrink-0 text-primary"
            />
          )}
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-muted-foreground">
          La verifica resta server-side con RE2 full match e feedback aggregato.
        </p>
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        {isAuthor ? (
          <Button asChild variant="outline">
            <Link to={routePaths.challenges}>
              Torna al catalogo
              <ArrowRightIcon aria-hidden="true" data-icon="inline-end" />
            </Link>
          </Button>
        ) : (
          <>
            <Button asChild>
              <Link to={routePaths.login}>Accedi</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to={routePaths.register}>Registrati</Link>
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
