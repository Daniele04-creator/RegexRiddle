import { Link } from "react-router";

import { routePaths } from "@/app/router";
import { Button } from "@/components/ui/button";
import { PlaceholderLayout } from "@/routes/PlaceholderLayout";

export function NotFoundPage() {
  return (
    <PlaceholderLayout
      badge="404"
      description="Questa pagina non esiste. Puoi tornare subito a una sfida o leggere le regole del gioco."
      title="Pagina non trovata"
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link to={routePaths.home}>Torna alla home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to={routePaths.howItWorks}>Come funziona</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link to={routePaths.challenges}>Sfide</Link>
        </Button>
      </div>
    </PlaceholderLayout>
  );
}
