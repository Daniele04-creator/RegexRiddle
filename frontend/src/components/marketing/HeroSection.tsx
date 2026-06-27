import { ArrowRightIcon, LogInIcon, TrophyIcon } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router";

import { HealthBadge } from "@/components/layout/HealthBadge";
import { RegexPreviewPanel } from "@/components/marketing/RegexPreviewPanel";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b">
      <div className="mx-auto grid min-h-[min(760px,calc(100svh-4rem))] w-full max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl"
          initial={{ opacity: 0, y: 18 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <HealthBadge />
            <span className="rounded-lg border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground">
              GOAL 08.2 auth UI
            </span>
          </div>
          <h1 className="max-w-4xl text-5xl font-semibold tracking-normal text-foreground sm:text-6xl lg:text-7xl">
            RegexRiddle
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
            Regex puzzle game for Web Technologies: explore public riddles,
            register or login with server-side sessions, and follow solver
            rankings without exposing hidden answers.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/challenges">
                Esplora sfide
                <ArrowRightIcon aria-hidden="true" data-icon="inline-end" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/leaderboard">
                <TrophyIcon aria-hidden="true" data-icon="inline-start" />
                Guarda classifica
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link to="/login">
                <LogInIcon aria-hidden="true" data-icon="inline-start" />
                Accedi
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
