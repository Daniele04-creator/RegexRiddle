import {
  ArrowRightIcon,
  CheckIcon,
  LockKeyholeIcon,
  PlayIcon,
  XIcon
} from "lucide-react";
import { Link } from "react-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const publicExamples = [
  { label: "AB-1942", state: "match" },
  { label: "ZX-7301", state: "match" },
  { label: "1942-AB", state: "miss" }
] as const;

const hiddenTests = ["", "", ""] as const;

export function RegexPreviewPanel() {
  return (
    <div
      aria-label="Sfida lampo RegexRiddle"
      className="relative overflow-hidden rounded-lg border border-primary/25 bg-lab-ink p-4 text-primary-foreground shadow-2xl shadow-primary/20"
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-accent to-lab-candy" />
      <div className="pointer-events-none absolute -right-16 -top-20 size-48 rounded-full bg-primary/20 blur-3xl" />
      <div className="relative flex items-center justify-between gap-3 border-b border-primary-foreground/12 pb-3">
        <div>
          <p className="text-sm font-semibold">Sfida lampo</p>
          <p className="text-xs text-primary-foreground/68">Codici reparto</p>
        </div>
        <Badge className="bg-accent text-accent-foreground">Medio</Badge>
      </div>

      <div className="relative mt-4 rounded-lg border border-primary-foreground/12 bg-primary-foreground/8 p-3">
        <p className="text-xs text-primary-foreground/65">La tua regex</p>
        <p className="mt-2 font-mono text-base font-semibold">
          [A-Z]&#123;2&#125;-\d&#123;4&#125;
        </p>
      </div>

      <div className="relative mt-4 grid gap-2 sm:grid-cols-3">
        {publicExamples.map((check) => (
          <div
            className="flex items-center justify-between rounded-lg border border-primary-foreground/12 bg-primary-foreground/8 px-3 py-2 text-sm"
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
              <Badge className="border-primary-foreground/20 bg-primary-foreground/8 text-primary-foreground" variant="outline">
                <XIcon aria-hidden="true" data-icon="inline-start" />
                fuori
              </Badge>
            ) : null}
          </div>
        ))}
      </div>

      <div className="relative mt-4 rounded-lg border border-primary-foreground/12 bg-primary-foreground/8 p-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold">2/3 prove superate</p>
          <div className="flex gap-1" aria-label="Tre prove nascoste">
            {hiddenTests.map((_, index) => (
              <span
                className="flex size-8 items-center justify-center rounded-md border border-primary-foreground/15 bg-primary-foreground/10"
                key={index}
              >
                <LockKeyholeIcon aria-hidden="true" />
              </span>
            ))}
          </div>
        </div>
        <div className="mt-3 h-2 rounded-full bg-primary-foreground/12">
          <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-primary to-accent" />
        </div>
      </div>

      <Button asChild className="relative mt-4 w-full">
        <Link to="/challenges">
          <PlayIcon aria-hidden="true" data-icon="inline-start" />
          Prova
          <ArrowRightIcon aria-hidden="true" data-icon="inline-end" />
        </Link>
      </Button>
    </div>
  );
}
