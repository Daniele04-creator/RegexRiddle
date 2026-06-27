import {
  ArrowRightIcon,
  BrainCircuitIcon,
  CheckCircle2Icon,
  EyeIcon,
  LightbulbIcon,
  LockKeyholeIcon,
  PencilLineIcon,
  TrophyIcon
} from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router";

import { routePaths } from "@/app/router";
import { PageContainer } from "@/components/layout/PageContainer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

const playSteps = [
  {
    title: "Scegli una sfida",
    description:
      "Ogni enigma ha un titolo, una difficolta e una piccola traccia iniziale.",
    icon: BrainCircuitIcon
  },
  {
    title: "Studia gli esempi",
    description:
      "Gli esempi accettati e rifiutati sono i tuoi primi indizi: usali per capire il pattern.",
    icon: EyeIcon
  },
  {
    title: "Scrivi la tua regex",
    description:
      "La soluzione deve coprire tutta la stringa, non solo un pezzo comodo.",
    icon: PencilLineIcon
  },
  {
    title: "Ricevi indizi",
    description:
      "Dopo ogni tentativo vedi quante prove hai superato e dove stai ancora lasciando buchi.",
    icon: LightbulbIcon
  },
  {
    title: "Risolvi e sali",
    description:
      "Chi completa piu enigmi con meno tentativi conquista la classifica.",
    icon: TrophyIcon
  }
];

export function HowItWorksPage() {
  return (
    <PageContainer className="py-10 sm:py-14">
      <section aria-labelledby="how-title" className="relative overflow-hidden rounded-lg border bg-card/82 p-6 sm:p-8">
        <div className="arcade-grid pointer-events-none absolute inset-0 opacity-45" />
        <div className="relative max-w-4xl">
          <Badge variant="secondary">Come funziona</Badge>
          <h1 id="how-title" className="mt-4 text-4xl font-semibold tracking-normal sm:text-5xl">
            Cinque mosse per risolvere un enigma regex
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
            RegexRiddle e' un gioco di deduzione: osservi pochi esempi,
            provi una regex e scopri se supera anche le prove nascoste.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link to={routePaths.challenges}>
                Esplora sfide
                <ArrowRightIcon aria-hidden="true" data-icon="inline-end" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to={routePaths.create}>Crea una sfida</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to={routePaths.leaderboard}>Classifica solver</Link>
            </Button>
          </div>
        </div>
      </section>

      <section aria-labelledby="steps-title" className="mt-12">
        <div className="mb-5 max-w-3xl">
          <Badge variant="outline">Flusso di gioco</Badge>
          <h2 id="steps-title" className="mt-3 text-3xl font-semibold">
            Dal catalogo alla classifica
          </h2>
        </div>
        <ol className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {playSteps.map((step, index) => (
            <motion.li
              initial={{ opacity: 0, y: 16 }}
              key={step.title}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              viewport={{ once: true, margin: "-80px" }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <Card className="h-full bg-card/90">
                <CardHeader>
                  <div className="mb-2 flex items-center gap-2">
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
        aria-labelledby="hidden-tests-title"
        className="mt-12 grid gap-5 lg:grid-cols-[minmax(0,1fr)_24rem]"
      >
        <Card className="bg-card/90">
          <CardHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-lg border bg-muted text-primary">
              <LockKeyholeIcon aria-hidden="true" />
            </div>
            <CardTitle>
              <h2 id="hidden-tests-title">Le prove nascoste fanno il gioco</h2>
            </CardTitle>
            <CardDescription>
              Gli esempi pubblici ti orientano, ma l'enigma si risolve solo
              quando la regex funziona anche sui casi che non vedi. Per questo
              ogni tentativo restituisce indizi numerici, non la risposta.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="bg-primary text-primary-foreground">
          <CardHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-lg border border-primary-foreground/30 bg-primary-foreground/12">
              <CheckCircle2Icon aria-hidden="true" />
            </div>
            <CardTitle>Regola d'oro</CardTitle>
            <CardDescription className="text-primary-foreground/80">
              La regex deve descrivere l'intera stringa. Se trova solo una
              sottoparte, l'enigma non e' ancora risolto.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>
    </PageContainer>
  );
}
