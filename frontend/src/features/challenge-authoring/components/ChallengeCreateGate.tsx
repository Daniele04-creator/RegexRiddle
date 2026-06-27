import { LockKeyholeIcon, LogInIcon, UserPlusIcon } from "lucide-react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

export function ChallengeCreateGate() {
  return (
    <Card className="max-w-2xl bg-card/88">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LockKeyholeIcon aria-hidden="true" />
          Accedi per creare una sfida
        </CardTitle>
        <CardDescription>
          La creazione e' protetta: l'autore viene preso dalla sessione server e
          la richiesta usa il controllo CSRF gia previsto dall'API.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-muted-foreground">
          Puoi esplorare il catalogo senza login. Per pubblicare una nuova sfida
          serve una sessione valida.
        </p>
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-3 sm:flex-row">
        <Button asChild>
          <Link to="/login">
            <LogInIcon aria-hidden="true" data-icon="inline-start" />
            Accedi
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/register">
            <UserPlusIcon aria-hidden="true" data-icon="inline-start" />
            Registrati
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
