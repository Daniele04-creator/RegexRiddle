# Difesa orale

## Cosa contiene GOAL 01

GOAL 01 aggiunge il livello dati allo scheletro tecnico. Non e' ancora l'applicazione completa, ma ora il progetto ha database, schema, migration e dati demo.

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
- documentazione iniziale per architettura, sicurezza, test e piano di sviluppo.

La API espone solo `GET /health`. La pagina web mostra `RegexRiddle`, quindi serve come smoke test visuale senza anticipare la UI finale.

## Perche' serve

Prima di implementare feature come login, sfide e valutazione delle regex, il progetto deve avere una base verificabile: installazione, lint, typecheck, test, build, E2E e Docker.

In GOAL 01 questi controlli passano: migration, seed, verify, lint, typecheck, unit test, build ed E2E. Docker Compose avvia PostgreSQL, API e web.

Prisma e' l'ORM: descriviamo le tabelle in TypeScript/Prisma schema, generiamo un client tipizzato e applichiamo le modifiche al database con migration versionate.

Il seed crea utenti e sfide demo ripetibili. Serve per provare il progetto e per l'orale, ma non sostituisce le feature vere.

## Cosa non contiene ancora

Non ci sono ancora auth endpoints, API sfide, creazione sfide da UI, attempt engine, leaderboard o regex evaluation.

Questa scelta e' intenzionale: GOAL 00 deve dimostrare che l'infrastruttura funziona senza introdurre logica applicativa fragile troppo presto.

## Punto di sicurezza principale

Quando verra' implementata la valutazione delle regex, non bisogna usare `RegExp` JavaScript per input degli utenti. La valutazione dovra' essere server-side, con semantica full match e motore RE2-compatible.

I campi sensibili come pattern segreti e controlli segreti stanno nel database/backend. GOAL 01 non aggiunge endpoint che li espongono e gli script di verifica stampano solo conteggi.
