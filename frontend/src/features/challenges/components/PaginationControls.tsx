import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

interface PaginationControlsProps {
  canGoNext: boolean;
  canGoPrevious: boolean;
  label: string;
  onNext: () => void;
  onPrevious: () => void;
  page: number;
  total: number;
}

export function PaginationControls({
  canGoNext,
  canGoPrevious,
  label,
  onNext,
  onPrevious,
  page,
  total
}: PaginationControlsProps) {
  return (
    <nav
      aria-label={label}
      className="flex flex-col gap-3 rounded-lg border bg-card/82 p-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-sm text-muted-foreground">
        Pagina <span className="font-medium text-foreground">{page}</span>
        <span aria-hidden="true"> · </span>
        {formatTotal(total)}
      </p>
      <div className="flex gap-2">
        <Button
          disabled={!canGoPrevious}
          onClick={onPrevious}
          type="button"
          variant="outline"
        >
          <ChevronLeftIcon aria-hidden="true" data-icon="inline-start" />
          Precedente
        </Button>
        <Button disabled={!canGoNext} onClick={onNext} type="button" variant="outline">
          Successiva
          <ChevronRightIcon aria-hidden="true" data-icon="inline-end" />
        </Button>
      </div>
    </nav>
  );
}

function formatTotal(total: number): string {
  return total === 1 ? "1 risultato" : `${total} risultati`;
}
