import { ArrowRightIcon, BookOpenIcon } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router";

import { RegexPreviewPanel } from "@/components/marketing/RegexPreviewPanel";
import { Button } from "@/components/ui/button";

const regexChips = ["[a-z]", "\\d+", "^", "$"];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b">
      <div className="arcade-grid pointer-events-none absolute inset-0 opacity-45" />
      <div className="pointer-events-none absolute inset-x-0 top-8 mx-auto hidden max-w-6xl justify-end gap-2 px-8 lg:flex">
        {regexChips.map((chip, index) => (
          <span
            className="rounded-lg border bg-card/78 px-3 py-1 font-mono text-sm text-muted-foreground shadow-sm"
            key={chip}
            style={{ transform: `translateY(${(index % 2) * 12}px)` }}
          >
            {chip}
          </span>
        ))}
      </div>
      <div className="mx-auto grid min-h-[min(660px,calc(100svh-4rem))] w-full max-w-6xl items-center gap-8 px-4 py-9 sm:px-6 sm:py-10 lg:grid-cols-[0.94fr_1.06fr] lg:px-8">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="relative max-w-3xl"
          initial={{ opacity: 0, y: 18 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <p className="text-sm font-semibold uppercase tracking-normal text-primary">
            RegexRiddle
          </p>
          <h1 className="mt-4 max-w-4xl text-5xl font-semibold tracking-normal text-foreground sm:text-6xl lg:text-7xl">
            Trova la{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-lab-candy bg-clip-text text-transparent">
              regex
            </span>{" "}
            nascosta
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
            Hai pochi esempi, qualche indizio e prove segrete da battere.
            Scrivi la soluzione giusta e scala la classifica.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/challenges">
                Gioca una sfida
                <ArrowRightIcon aria-hidden="true" data-icon="inline-end" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/how-it-works">
                <BookOpenIcon aria-hidden="true" data-icon="inline-start" />
                Come funziona
              </Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          animate={{ opacity: 1, scale: 1, y: 0 }}
          initial={{ opacity: 0, scale: 0.97, y: 16 }}
          transition={{ delay: 0.12, duration: 0.5, ease: "easeOut" }}
        >
          <RegexPreviewPanel />
        </motion.div>
      </div>
    </section>
  );
}
