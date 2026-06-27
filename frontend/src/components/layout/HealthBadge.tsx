import { ActivityIcon, WifiIcon, WifiOffIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { useHealthQuery } from "@/features/health/useHealthQuery";

export function HealthBadge() {
  const healthQuery = useHealthQuery();

  if (healthQuery.isLoading) {
    return (
      <Badge aria-live="polite" variant="outline">
        <ActivityIcon aria-hidden="true" data-icon="inline-start" />
        Controllo...
      </Badge>
    );
  }

  if (healthQuery.isError || healthQuery.data?.status !== "ok") {
    return (
      <Badge aria-live="polite" variant="destructive">
        <WifiOffIcon aria-hidden="true" data-icon="inline-start" />
        Non pronto
      </Badge>
    );
  }

  return (
    <Badge aria-live="polite" variant="secondary">
      <WifiIcon aria-hidden="true" data-icon="inline-start" />
      Pronto a giocare
    </Badge>
  );
}
