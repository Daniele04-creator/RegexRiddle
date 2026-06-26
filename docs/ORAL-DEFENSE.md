# Difesa orale

## Cosa contiene GOAL 00

GOAL 00 non e' ancora l'applicazione completa. E' lo scheletro tecnico che permette di lavorare in modo ordinato sulle milestone successive.

Il repository contiene:

- un monorepo `pnpm`;
- una SPA React in `apps/web`;
- una API Fastify in `apps/api`;
- test E2E Playwright in `apps/e2e`;
- un package condiviso in `packages/shared`;
- Docker Compose con web, API e PostgreSQL;
- documentazione iniziale per architettura, sicurezza, test e piano di sviluppo.

La API espone solo `GET /health`. La pagina web mostra `RegexRiddle`, quindi serve come smoke test visuale senza anticipare la UI finale.

## Perche' serve

Prima di implementare feature come login, sfide e valutazione delle regex, il progetto deve avere una base verificabile: installazione, lint, typecheck, test, build, E2E e Docker.

In GOAL 00 questi controlli passano: `pnpm check` verifica lint, typecheck, unit test, build ed E2E; Docker Compose avvia PostgreSQL, API e web.

## Cosa non contiene ancora

Non ci sono ancora auth, schema database, creazione sfide, attempt engine, leaderboard o regex evaluation.

Questa scelta e' intenzionale: GOAL 00 deve dimostrare che l'infrastruttura funziona senza introdurre logica applicativa fragile troppo presto.

## Punto di sicurezza principale

Quando verra' implementata la valutazione delle regex, non bisogna usare `RegExp` JavaScript per input degli utenti. La valutazione dovra' essere server-side, con semantica full match e motore RE2-compatible.
