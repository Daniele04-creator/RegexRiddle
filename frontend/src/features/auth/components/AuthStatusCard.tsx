import type { PublicUserDTO } from "@regexriddle/shared";
import { CheckCircle2Icon, LogInIcon } from "lucide-react";
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

interface AuthStatusCardProps {
  mode: "login" | "register";
  user: PublicUserDTO;
}

export function AuthStatusCard({ mode, user }: AuthStatusCardProps) {
  const title =
    mode === "login" ? "Sessione gia attiva" : "Account gia autenticato";

  return (
    <Card className="max-w-xl bg-card/88">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2Icon aria-hidden="true" />
          {title}
        </CardTitle>
        <CardDescription>
          Sei autenticato come {user.displayName} (@{user.username}).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-muted-foreground">
          Puoi continuare a esplorare il catalogo pubblico oppure passare alla
          sezione protetta di creazione.
        </p>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-3">
        <Button asChild>
          <Link to={routePaths.challenges}>
            <LogInIcon aria-hidden="true" data-icon="inline-start" />
            Vai alle sfide
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to={routePaths.create}>Apri area creazione</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
