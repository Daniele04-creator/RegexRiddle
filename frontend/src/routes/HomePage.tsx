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
    title: "Walk through the rules",
    description:
      "The how-it-works page explains full match, RE2-compatible regexes, secret controls, and feedback.",
    icon: FlaskConicalIcon
  },
  {
    title: "Solvers submit candidates",
    description:
      "Attempt UI is live on challenge detail pages and sends candidates to the protected API.",
    icon: ListChecksIcon
  },
  {
    title: "Account settings stay scoped",
    description:
      "Authenticated users can update display name, bio, and avatar URL without touching email or password.",
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
    description: "Hidden checks and submitted candidates are not rendered.",
    icon: ShieldCheckIcon
  },
  {
    title: "Cookie-first auth",
    description: "Auth uses an HttpOnly session cookie, not browser token storage.",
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
              The public catalog, challenge detail, leaderboard, login,
              registration, logout, session restoration, gameplay, challenge
              authoring, how-it-works, and account settings are wired to
              existing APIs.
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
                Safe gameplay without browser regex evaluation
              </h2>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                The browser gets public examples, public aggregates, and a
                current-user DTO. Sensitive regex workflows stay inside backend
                services.
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
            Frontend authoring is now connected
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            GOAL 08.5 adds `/how-it-works` for demo walkthroughs and `/account`
            for scoped current-user settings. Regex verification, auth sessions,
            and secret challenge data stay server-side.
          </p>
        </section>
      </PageContainer>
    </>
  );
}
