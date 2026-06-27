import {
  ArrowRightIcon,
  EyeIcon,
  LightbulbIcon,
  PencilLineIcon,
  TrophyIcon
} from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router";

import { PageContainer } from "@/components/layout/PageContainer";
import { HeroSection } from "@/components/marketing/HeroSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

const recommendedChallenge = {
  accepted: "regex-riddle-2026",
  difficulty: "Difficile",
  href: "/challenges/aaaaaaaa-0010-4000-8000-000000000010",
  rejected: "-regex-riddle",
  title: "Slug URL"
};

const playSteps = [
  {
    description: "Parti da cosa passa e cosa resta fuori.",
    icon: EyeIcon,
    title: "Osserva gli esempi"
  },
  {
    description: "Scrivi una soluzione che copra tutta la stringa.",
    icon: PencilLineIcon,
    title: "Scrivi la regex"
  },
  {
    description: "Leggi gli indizi, correggi il pattern e chiudi l'enigma.",
    icon: LightbulbIcon,
    title: "Usa gli indizi"
  }
];

export function HomePage() {
  return (
    <>
      <HeroSection />
      <PageContainer className="py-10 sm:py-12">
        <section
          aria-labelledby="recommended-title"
          className="grid gap-5 lg:grid-cols-[0.78fr_1.22fr] lg:items-stretch"
        >
          <div className="flex flex-col justify-center gap-3">
            <p className="text-sm font-semibold uppercase tracking-normal text-primary">
              Sfida consigliata
            </p>
            <h2 id="recommended-title" className="text-3xl font-semibold">
              Apri un enigma e inizia dai casi visibili
            </h2>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground">
              Una sfida concreta basta per capire il gioco: confronti esempi,
              provi una regex e usi gli indizi per arrivare alla soluzione.
            </p>
          </div>

          <Card className="bg-card/90">
            <CardHeader>
              <CardTitle>{recommendedChallenge.title}</CardTitle>
              <CardDescription>
                Trova il pattern giusto per uno slug leggibile.
              </CardDescription>
              <CardAction>
                <Badge>{recommendedChallenge.difficulty}</Badge>
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border bg-background/80 p-3">
                  <p className="text-xs text-muted-foreground">Esempio accettato</p>
                  <p className="mt-2 font-mono text-sm">
                    {recommendedChallenge.accepted}
                  </p>
                </div>
                <div className="rounded-lg border bg-background/80 p-3">
                  <p className="text-xs text-muted-foreground">Esempio rifiutato</p>
                  <p className="mt-2 font-mono text-sm">
                    {recommendedChallenge.rejected}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button asChild>
                <Link to={recommendedChallenge.href}>
                  Gioca questa
                  <ArrowRightIcon aria-hidden="true" data-icon="inline-end" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </section>

        <section aria-labelledby="steps-title" className="mt-10">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <h2 id="steps-title" className="text-3xl font-semibold">
              Come si gioca
            </h2>
            <p className="max-w-lg text-sm leading-6 text-muted-foreground">
              Tre mosse, poi contano logica e tentativi.
            </p>
          </div>
          <ol className="grid gap-4 md:grid-cols-3">
            {playSteps.map((step, index) => (
              <motion.li
                initial={{ opacity: 0, y: 14 }}
                key={step.title}
                transition={{ delay: index * 0.05, duration: 0.28 }}
                viewport={{ once: true, margin: "-80px" }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                <Card className="h-full bg-card/86">
                  <CardHeader>
                    <div className="mb-2 flex items-center gap-3">
                      <Badge variant="secondary">{index + 1}</Badge>
                      <div className="flex size-10 items-center justify-center rounded-lg border bg-muted text-primary">
                        <step.icon aria-hidden="true" />
                      </div>
                    </div>
                    <CardTitle>{step.title}</CardTitle>
                    <CardDescription>{step.description}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.li>
            ))}
          </ol>
        </section>

        <section
          aria-labelledby="leaderboard-title"
          className="mt-10 rounded-lg border bg-card/88 p-5"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex size-11 items-center justify-center rounded-lg border bg-muted text-primary">
                <TrophyIcon aria-hidden="true" />
              </div>
              <div>
                <h2 id="leaderboard-title" className="text-2xl font-semibold">
                  Classifica
                </h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Risolvi piu enigmi con meno tentativi.
                </p>
              </div>
            </div>
            <Button asChild variant="outline">
              <Link to="/leaderboard">Vedi classifica</Link>
            </Button>
          </div>
        </section>
      </PageContainer>
    </>
  );
}
