# Difesa orale

## Cosa contiene GOAL 02

GOAL 02 aggiunge le prime API applicative read-only per le sfide. Non e' ancora l'applicazione completa, ma ora il frontend puo' leggere un catalogo pubblico e il dettaglio pubblico di una sfida.

Il repository contiene:

- un monorepo `pnpm`;
- una SPA React in `apps/web`;
- una API Fastify in `apps/api`;
- test E2E Playwright in `apps/e2e`;
- un package condiviso in `packages/shared`;
- Docker Compose con web, API e PostgreSQL;
- Prisma come ORM nel backend;
- una migration iniziale versionata;
- un seed demo deterministico;
- API pubbliche `GET /api/challenges` e `GET /api/challenges/:id`;
- DTO pubblici condivisi per catalogo e dettaglio sfida;
- documentazione iniziale per architettura, sicurezza, test e piano di sviluppo.

La API espone `GET /health` e due endpoint pubblici read-only sulle sfide. La pagina web mostra ancora `RegexRiddle`, quindi serve come smoke test visuale senza anticipare la UI finale.

## Perche' serve

Prima di implementare feature come login, sfide e valutazione delle regex, il progetto deve avere una base verificabile: installazione, lint, typecheck, test, build, E2E e Docker.

In GOAL 02 questi controlli devono passare: migration, seed, verify, lint, typecheck, unit test, build ed E2E. Docker Compose avvia PostgreSQL, API e web.

Prisma e' l'ORM: descriviamo le tabelle in TypeScript/Prisma schema, generiamo un client tipizzato e applichiamo le modifiche al database con migration versionate.

Il seed crea utenti e sfide demo ripetibili. Serve per provare il progetto e per l'orale, ma non sostituisce le feature vere.

## Cosa non contiene ancora

Non ci sono ancora auth endpoints, creazione sfide da UI, attempt engine, leaderboard o regex evaluation.

Questa scelta e' intenzionale: GOAL 02 aggiunge solo lettura pubblica sicura, senza introdurre auth, mutazioni o valutazione regex troppo presto.

## Punto di sicurezza principale

Quando verra' implementata la valutazione delle regex, non bisogna usare `RegExp` JavaScript per input degli utenti. La valutazione dovra' essere server-side, con semantica full match e motore RE2-compatible.

I campi sensibili come pattern segreti e controlli segreti stanno nel database/backend. Il frontend vede solo dati pubblici; regex originale e controlli segreti restano nel database/server.

Gli endpoint di GOAL 02 usano DTO espliciti e select Prisma limitate. Le response pubbliche non contengono `secretPattern`, `ChallengeControl.value` o `Attempt.proposedPattern`.
