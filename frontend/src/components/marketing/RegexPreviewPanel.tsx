import { CheckIcon, LockKeyholeIcon, PlayIcon, XIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const checks = [
  { label: "AB-1942", state: "match" },
  { label: "ZX-7301", state: "match" },
  { label: "1942-AB", state: "miss" },
  { label: "3 prove nascoste", state: "hidden" }
] as const;

export function RegexPreviewPanel() {
  return (
    <div
      aria-label="Anteprima puzzle RegexRiddle"
      className="relative overflow-hidden rounded-lg border bg-card p-4 shadow-2xl shadow-primary/12"
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-accent to-lab-candy" />
      <div className="flex items-center justify-between gap-3 border-b pb-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Puzzle preview</p>
          <p className="text-xs text-muted-foreground">
            Enigma: codici reparto
          </p>
        </div>
        <Badge variant="secondary">Livello medio</Badge>
      </div>

      <div className="mt-4 rounded-lg border bg-background/90 p-3 font-mono text-sm">
        <span className="text-muted-foreground">regex:</span>{" "}
        <span className="font-semibold text-foreground">[A-Z]&#123;2&#125;-\d&#123;4&#125;</span>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {checks.map((check) => (
          <div
            className="flex items-center justify-between rounded-lg border bg-background/90 px-3 py-2 text-sm text-foreground"
            key={check.label}
          >
            <span className="font-mono">{check.label}</span>
            {check.state === "match" ? (
              <Badge className="bg-lab-success text-primary-foreground">
                <CheckIcon aria-hidden="true" data-icon="inline-start" />
                passa
              </Badge>
            ) : null}
            {check.state === "miss" ? (
              <Badge variant="outline">
                <XIcon aria-hidden="true" data-icon="inline-start" />
                fuori
              </Badge>
            ) : null}
            {check.state === "hidden" ? (
              <Badge variant="secondary">
                <LockKeyholeIcon aria-hidden="true" data-icon="inline-start" />
                bloccate
              </Badge>
            ) : null}
          </div>
        ))}
      </div>

      <Button className="mt-4 w-full" disabled type="button">
        <PlayIcon aria-hidden="true" data-icon="inline-start" />
        Prova soluzione
      </Button>
    </div>
  );
}
