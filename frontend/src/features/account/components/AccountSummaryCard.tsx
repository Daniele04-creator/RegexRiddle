import type { PublicUserDTO } from "@regexriddle/shared";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AvatarPreview } from "@/features/account/components/AvatarPreview";

interface AccountSummaryCardProps {
  user: PublicUserDTO;
}

function formatAccountDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Data non disponibile";
  }

  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "medium"
  }).format(date);
}

export function AccountSummaryCard({ user }: AccountSummaryCardProps) {
  return (
    <Card className="bg-card/88">
      <CardHeader>
        <div className="flex min-w-0 items-start gap-4">
          <AvatarPreview avatarUrl={user.avatarUrl} displayName={user.displayName} />
          <div className="min-w-0">
            <CardTitle className="break-words">{user.displayName}</CardTitle>
            <CardDescription className="break-words">@{user.username}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm leading-6 text-muted-foreground">
          Questa scheda mostra solo i dati dell'utente autenticato. Nessuna
          statistica profilo, password o sessione viene renderizzata.
        </p>
        <Separator />
        <dl className="grid gap-4 text-sm">
          <div className="min-w-0">
            <dt className="font-medium">Username</dt>
            <dd className="mt-1 break-words text-muted-foreground">
              @{user.username}
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="font-medium">Email</dt>
            <dd className="mt-1 break-words text-muted-foreground">{user.email}</dd>
          </div>
          <div className="min-w-0">
            <dt className="font-medium">Creato il</dt>
            <dd className="mt-1 text-muted-foreground">
              {formatAccountDate(user.createdAt)}
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="font-medium">Bio</dt>
            <dd className="mt-1 break-words text-muted-foreground">
              {user.bio ?? "Nessuna bio impostata."}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
