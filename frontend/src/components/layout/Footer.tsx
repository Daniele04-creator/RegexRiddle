import { Link } from "react-router";

import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="mt-16">
      <Separator />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 text-sm text-muted-foreground sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <p className="font-semibold text-foreground">RegexRiddle</p>
          <p>Enigmi regex, prove nascoste e classifica solver.</p>
        </div>
        <nav aria-label="Footer navigation" className="flex flex-wrap gap-4">
          <Link className="transition hover:text-foreground" to="/how-it-works">
            Come funziona
          </Link>
          <Link className="transition hover:text-foreground" to="/challenges">
            Sfide
          </Link>
          <Link className="transition hover:text-foreground" to="/leaderboard">
            Classifica
          </Link>
        </nav>
      </div>
    </footer>
  );
}
