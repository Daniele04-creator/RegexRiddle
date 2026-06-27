import { LogInIcon, UserPlusIcon } from "lucide-react";
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

export function AccountGate() {
  return (
    <Card className="max-w-2xl bg-card/88">
      <CardHeader>
        <CardTitle>Accedi per gestire l'account</CardTitle>
        <CardDescription>
          Aggiorna nome visibile, bio e avatar del tuo profilo solver.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-muted-foreground">
          Puoi esplorare sfide e classifica anche da guest. Per personalizzare
          il profilo devi prima accedere.
        </p>
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-3 sm:flex-row">
        <Button asChild>
          <Link to={routePaths.login}>
            <LogInIcon aria-hidden="true" data-icon="inline-start" />
            Accedi
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to={routePaths.register}>
            <UserPlusIcon aria-hidden="true" data-icon="inline-start" />
            Registrati
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
