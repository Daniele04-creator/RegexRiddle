import {
  FlaskConicalIcon,
  ListChecksIcon,
  LockKeyholeIcon,
  ServerIcon,
  ShieldCheckIcon,
  TrophyIcon
} from "lucide-react";
import { motion } from "motion/react";

import { PageContainer } from "@/components/layout/PageContainer";
import { FeatureCard } from "@/components/marketing/FeatureCard";
import { HeroSection } from "@/components/marketing/HeroSection";
import { Badge } from "@/components/ui/badge";

const howItWorks = [
  {
    title: "Creators publish riddles",
    description:
      "A challenge has public examples and hidden server-side checks. The secret pattern never becomes client data.",
    icon: FlaskConicalIcon
  },
  {
    title: "Solvers submit candidates",
    description:
      "Future attempt UI will send candidate patterns to the API. This milestone only prepares the shell.",
    icon: ListChecksIcon
  },
  {
    title: "Leaderboard rewards precision",
    description:
      "The backend already ranks solved challenges and lower average attempts through public aggregates.",
    icon: TrophyIcon
  }
];

const securityItems = [
  {
    title: "Server-side RE2",
    description: "Regex evaluation stays on the backend with full-match semantics.",
    icon: ServerIcon
  },
  {
    title: "Secrets stay hidden",
    description: "Secret patterns, controls, and submitted candidates are not rendered.",
    icon: ShieldCheckIcon
  },
  {
    title: "Cookie-first auth",
    description: "Auth remains based on the HttpOnly rr_session cookie, not browser token storage.",
    icon: LockKeyholeIcon
  }
];

export function HomePage() {
  return (
    <>
      <HeroSection />
      <PageContainer className="py-12 sm:py-16">
        <section aria-labelledby="how-it-works-title">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Badge variant="outline">How it works</Badge>
              <h2 id="how-it-works-title" className="mt-3 text-3xl font-semibold">
                Pattern puzzles with server-side truth
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground">
              The UI foundation shows the product model without pretending that
              later gameplay screens are already implemented.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {howItWorks.map((item, index) => (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                key={item.title}
                transition={{ delay: index * 0.06, duration: 0.35 }}
                viewport={{ once: true, margin: "-80px" }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                <FeatureCard {...item} />
              </motion.div>
            ))}
          </div>
        </section>

        <section aria-labelledby="security-title" className="mt-14">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <Badge variant="secondary">Security by design</Badge>
              <h2 id="security-title" className="mt-3 text-3xl font-semibold">
                Safe foundation before feature UI
              </h2>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                The browser gets public examples and public aggregates. The
                sensitive regex workflow stays inside backend services.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {securityItems.map((item) => (
                <FeatureCard key={item.title} {...item} />
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="milestone-title" className="mt-14 rounded-lg border bg-card/82 p-6">
          <Badge variant="outline">Current milestone</Badge>
          <h2 id="milestone-title" className="mt-3 text-2xl font-semibold">
            Backend ready, frontend foundation now in place
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            GOAL 08.0 adds design tokens, routing, app shell, Query provider,
            same-origin API plumbing, proxy behavior, placeholder pages,
            accessibility baseline, and tests. Real auth, attempt, creation,
            catalog, and leaderboard UIs remain later GOAL 08.x work.
          </p>
        </section>
      </PageContainer>
    </>
  );
}
