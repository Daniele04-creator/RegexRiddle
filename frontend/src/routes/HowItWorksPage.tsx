import {
  ArrowRightIcon,
  EyeOffIcon,
  FlaskConicalIcon,
  GaugeIcon,
  ListChecksIcon,
  LockKeyholeIcon,
  ServerIcon,
  ShieldCheckIcon,
  TrophyIcon,
  UsersIcon
} from "lucide-react";
import { Link } from "react-router";

import { routePaths } from "@/app/router";
import { PageContainer } from "@/components/layout/PageContainer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const actorCards = [
  {
    title: "Per chi crea una sfida",
    description:
      "L'autore scrive una regex segreta, due esempi pubblici e controlli positivi/negativi che restano sul backend.",
    icon: FlaskConicalIcon
  },
  {
    title: "Per chi risolve",
    description:
      "Il solver vede solo titolo, descrizione, difficoltà ed esempi pubblici, poi invia una regex candidata.",
    icon: UsersIcon
  },
  {
    title: "Per la demo",
    description:
      "Il percorso consigliato è catalogo, dettaglio sfida, tentativo, feedback, classifica e pagina account.",
    icon: ListChecksIcon
  }
];

const ruleCards = [
  {
    title: "Full match",
    description:
      "Ogni controllo viene valutato come stringa intera: la regex deve coprire tutto l'input, non una sottostringa.",
    icon: GaugeIcon
  },
  {
    title: "RE2-compatible",
    description:
      "Il dialetto evita backreference e look-around non supportati, riducendo il rischio di catastrophic backtracking e ReDoS.",
    icon: ServerIcon
  },
  {
    title: "Flags i e m",
    description:
      "i rende il match case-insensitive; m abilita il comportamento multilinea dove supportato dal motore server-side.",
    icon: ShieldCheckIcon
  }
];

const securityCards = [
  {
    title: "Esempi pubblici",
    description:
      "Gli esempi positivi e negativi pubblici servono come indizi leggibili e sono visibili a tutti i solver.",
    icon: EyeOffIcon
  },
  {
    title: "Controlli segreti",
    description:
      "I controlli positivi e negativi nascosti restano server-only: il frontend non riceve regex segrete o valori nascosti.",
    icon: LockKeyholeIcon
  },
  {
    title: "Feedback aggregato",
    description:
      "Dopo un tentativo il solver vede quanti positivi sono stati riconosciuti e quanti negativi sono stati accettati per errore.",
    icon: ListChecksIcon
  }
];

const demoSteps = [
  "Apri il catalogo e scegli una sfida pubblica.",
  "Leggi esempi pubblici e descrizione senza vedere controlli nascosti.",
  "Accedi come demo_player e invia una regex candidata.",
  "Spiega il feedback aggregato positivi/negativi.",
  "Mostra la classifica: più sfide risolte, media tentativi più bassa, username alfabetico."
];

export function HowItWorksPage() {
  return (
    <PageContainer className="py-10 sm:py-14">
      <section aria-labelledby="how-title" className="max-w-4xl">
        <Badge variant="secondary">Come funziona</Badge>
        <h1 id="how-title" className="mt-4 text-4xl font-semibold tracking-normal">
          RegexRiddle spiegato per la demo
        </h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          RegexRiddle è un laboratorio di puzzle regex: chi crea nasconde la
          soluzione sul backend, chi risolve osserva esempi pubblici e riceve
          solo feedback aggregato sui tentativi.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild>
            <Link to={routePaths.challenges}>
              Esplora sfide
              <ArrowRightIcon aria-hidden="true" data-icon="inline-end" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to={routePaths.leaderboard}>
              <TrophyIcon aria-hidden="true" data-icon="inline-start" />
              Guarda classifica
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to={routePaths.create}>Crea una sfida</Link>
          </Button>
        </div>
      </section>

      <section aria-labelledby="actors-title" className="mt-12">
        <div className="mb-5 max-w-3xl">
          <h2 id="actors-title" className="text-2xl font-semibold">
            Creatori, solver e flusso demo
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            La divisione dei ruoli tiene separata la spiegazione pubblica dalla
            verità server-side usata per validare i tentativi.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {actorCards.map((item) => (
            <Card className="bg-card/88" key={item.title}>
              <CardHeader>
                <div className="mb-2 flex size-10 items-center justify-center rounded-lg border bg-muted text-primary">
                  <item.icon aria-hidden="true" />
                </div>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="rules-title" className="mt-12">
        <div className="mb-5 max-w-3xl">
          <h2 id="rules-title" className="text-2xl font-semibold">
            Full match e dialetto regex
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            I tentativi vengono valutati sul backend con semantica full-string e
            motore RE2-compatible. Il browser non costruisce né esegue regex
            utente.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {ruleCards.map((item) => (
            <Card className="bg-card/88" key={item.title}>
              <CardHeader>
                <div className="mb-2 flex size-10 items-center justify-center rounded-lg border bg-muted text-primary">
                  <item.icon aria-hidden="true" />
                </div>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="security-title" className="mt-12">
        <div className="mb-5 max-w-3xl">
          <h2 id="security-title" className="text-2xl font-semibold">
            Cosa resta pubblico e cosa resta segreto
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            La UI mostra solo materiale didattico e risultati aggregati. Le
            verifiche private non vengono serializzate verso il client.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {securityCards.map((item) => (
            <Card className="bg-card/88" key={item.title}>
              <CardHeader>
                <div className="mb-2 flex size-10 items-center justify-center rounded-lg border bg-muted text-primary">
                  <item.icon aria-hidden="true" />
                </div>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="leaderboard-title"
        className="mt-12 grid gap-5 lg:grid-cols-[minmax(0,1fr)_24rem]"
      >
        <Card className="bg-card/88">
          <CardHeader>
            <CardTitle>
              <h2 id="leaderboard-title">Classifica</h2>
            </CardTitle>
            <CardDescription>
              La classifica ordina i solver con regole pubbliche e ripetibili.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-sm leading-6 text-muted-foreground">
            <p>
              Il ranking privilegia chi risolve più sfide. A parità di sfide
              risolte conta la media tentativi più bassa; se serve un ulteriore
              spareggio viene usato l'username in ordine alfabetico.
            </p>
            <Separator />
            <p>
              La classifica non mostra email, id interni, tentativi raw o dati
              dei controlli nascosti.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/88">
          <CardHeader>
            <CardTitle>Demo consigliata</CardTitle>
            <CardDescription>
              Sequenza breve per spiegare prodotto, sicurezza e UX.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="flex list-decimal flex-col gap-3 pl-5 text-sm leading-6 text-muted-foreground">
              {demoSteps.map((step) => (
                <li className="break-words" key={step}>
                  {step}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </section>
    </PageContainer>
  );
}
