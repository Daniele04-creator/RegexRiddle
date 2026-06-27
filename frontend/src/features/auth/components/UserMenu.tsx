import { LogOutIcon, PlusIcon, UserRoundIcon } from "lucide-react";
import { Link } from "react-router";

import { routePaths } from "@/app/router";
import {
  Alert,
  AlertDescription,
  AlertTitle
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUserQuery, useLogoutMutation } from "@/features/auth/queries";
import { cn } from "@/lib/utils";

interface UserMenuProps {
  className?: string;
  onNavigate?: () => void;
  orientation?: "desktop" | "mobile";
}

export function UserMenu({
  className,
  onNavigate,
  orientation = "desktop"
}: UserMenuProps) {
  const currentUserQuery = useCurrentUserQuery();
  const logoutMutation = useLogoutMutation();
  const isMobile = orientation === "mobile";

  if (currentUserQuery.isLoading) {
    return (
      <div
        aria-label="Verifica sessione"
        className={cn(
          isMobile ? "flex flex-col gap-2" : "flex items-center gap-2",
          className
        )}
      >
        <Skeleton className={isMobile ? "h-10 w-full" : "h-9 w-32"} />
        <Skeleton className={isMobile ? "h-10 w-full" : "h-9 w-24"} />
      </div>
    );
  }

  if (!currentUserQuery.data) {
    return (
      <div
        className={cn(
          isMobile ? "flex flex-col gap-2" : "flex items-center gap-2",
          className
        )}
      >
        <Button asChild className={isMobile ? "justify-start" : undefined} variant="outline">
          <Link onClick={onNavigate} to={routePaths.login}>
            Accedi
          </Link>
        </Button>
        <Button asChild className={isMobile ? "justify-start" : undefined}>
          <Link onClick={onNavigate} to={routePaths.register}>
            Registrati
          </Link>
        </Button>
      </div>
    );
  }

  const user = currentUserQuery.data;

  return (
    <div
      className={cn(
        isMobile ? "flex flex-col gap-3" : "flex items-center gap-2",
        className
      )}
    >
      <div
        className={cn(
          "min-w-0 rounded-lg border bg-card px-3 py-2",
          isMobile ? "w-full" : "max-w-56"
        )}
      >
        <p className="truncate text-sm font-medium">{user.displayName}</p>
        <p className="truncate text-xs text-muted-foreground">@{user.username}</p>
      </div>
      <Button asChild className={isMobile ? "justify-start" : undefined} variant="outline">
        <Link onClick={onNavigate} to={routePaths.create}>
          <PlusIcon aria-hidden="true" data-icon="inline-start" />
          Crea sfida
        </Link>
      </Button>
      <Button
        className={isMobile ? "justify-start" : undefined}
        disabled={logoutMutation.isPending}
        onClick={() => {
          logoutMutation.mutate(undefined, {
            onSuccess: onNavigate
          });
        }}
        type="button"
        variant="secondary"
      >
        <LogOutIcon aria-hidden="true" data-icon="inline-start" />
        {logoutMutation.isPending ? "Logout…" : "Logout"}
      </Button>
      {logoutMutation.isError ? (
        <Alert className={isMobile ? undefined : "absolute right-4 top-20 max-w-sm"} variant="destructive">
          <UserRoundIcon aria-hidden="true" />
          <AlertTitle>Logout non riuscito</AlertTitle>
          <AlertDescription>Riprova senza ricaricare la pagina.</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
