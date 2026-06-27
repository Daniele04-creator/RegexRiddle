# Difesa orale

## Cosa contiene GOAL 06

GOAL 06 aggiunge la creazione protetta delle sfide sopra il motore regex sicuro server-side.

Il repository contiene:

- un monorepo `pnpm`;
- una SPA React in `frontend`;
- una API Fastify in `backend`;
- test E2E Playwright in `e2e`;
- un package condiviso in `packages/shared`;
- Docker Compose con web, API e PostgreSQL;
- Prisma come ORM nel backend;
- una migration iniziale versionata;
- un seed demo deterministico;
- API pubbliche `GET /api/challenges` e `GET /api/challenges/:id`;
- API auth `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`;
- DTO pubblici condivisi per catalogo e dettaglio sfida;
- DTO pubblici per utente autenticato;
- motore regex interno basato su `re2-wasm`;
- semantica full match con ancore assolute RE2;
- endpoint `POST /api/challenges` protetto da sessione e CSRF guard v1;
- endpoint `POST /api/challenges/:id/attempts` protetto da sessione e CSRF guard v1;
- DTO pubblici per risultato tentativo con soli conteggi aggregati;
- documentazione iniziale per architettura, sicurezza, test e piano di sviluppo.

La API espone `GET /health`, due endpoint pubblici read-only sulle sfide, quattro endpoint auth backend, un endpoint protetto per creare sfide e un endpoint protetto per inviare tentativi.

La creazione sfide e' protetta: solo utenti autenticati possono creare una sfida. Il client manda regex segreta, esempi pubblici e controlli segreti, ma il backend valida tutto con RE2 full match prima di salvare. L'autore non viene preso dal body: viene preso dalla sessione `rr_session`. La risposta torna come DTO pubblico e non contiene ne' la regex segreta ne' i valori dei controlli.

## Perche' serve

Il backend carica i controlli segreti, valuta la regex dell'utente con RE2 full match, salva solo conteggi aggregati e non manda mai i controlli al frontend.

In GOAL 06 questi controlli devono passare: seed, verify, lint, typecheck, unit test, build ed E2E. Docker Compose avvia PostgreSQL, API e web.

Il progetto e' un monorepo pnpm, ma per chiarezza di consegna ho separato le directory principali in backend, frontend ed e2e. Il codice condiviso resta in packages/shared. Docker Compose orchestra backend, frontend e PostgreSQL.

Prisma e' l'ORM: descriviamo le tabelle in TypeScript/Prisma schema, generiamo un client tipizzato e applichiamo le modifiche al database con migration versionate.

Il seed crea utenti e sfide demo ripetibili. Serve per provare il progetto e per l'orale, ma non sostituisce le feature vere.

## Cosa non contiene ancora

Non ci sono ancora frontend auth UI, creazione sfide da UI, leaderboard o UI di gioco.

Questa scelta e' intenzionale: GOAL 06 aggiunge solo il workflow backend per creare sfide, senza introdurre UI o feature di classifica.

## Punto di sicurezza principale

La valutazione delle regex non usa `RegExp` JavaScript per input degli utenti. La valutazione e' server-side, con semantica full match e motore RE2-compatible.

I campi sensibili come pattern segreti e controlli segreti stanno nel database/backend. Il frontend vede solo dati pubblici; regex originale e controlli segreti restano nel database/server.

Gli endpoint di GOAL 02 usano DTO espliciti e select Prisma limitate. Le response pubbliche non contengono `secretPattern`, `ChallengeControl.value` o `Attempt.proposedPattern`.

Per l'autenticazione non usiamo JWT e non mettiamo token in `localStorage`. Il server genera un token opaco casuale, salva nel database solo il suo hash SHA-256 e invia il token in un cookie `rr_session` con `HttpOnly` e `SameSite=Lax`.

Le password sono salvate con Argon2id. Le API auth restituiscono solo l'utente pubblico e non espongono `passwordHash`, `sessionTokenHash`, token o valore del cookie.

Per le regex non usiamo `RegExp` JavaScript sui pattern utente. Usiamo RE2 tramite `re2-wasm`, che evita il backtracking esponenziale tipico dei casi ReDoS. Il match e' full-string: una soluzione deve coprire tutta la stringa di controllo, non solo una sottostringa.

Il motore restituisce solo conteggi aggregati come `positiveMatched`, `negativeMatched` e `isCorrect`. `positiveMatched` conta i controlli positivi soddisfatti, `negativeMatched` conta i controlli negativi che la regex ha erroneamente accettato, e una soluzione e' corretta solo se tutti i positivi passano e zero negativi passano. Non restituisce controlli segreti, regex segrete o pattern candidati.

L'endpoint creazione sfide richiede cookie `rr_session`, `Content-Type: application/json` e header `X-RegexRiddle-CSRF: 1`. Se la regex segreta, gli esempi pubblici o i controlli segreti non sono coerenti, il backend risponde `422` e non salva la sfida.

L'endpoint tentativi richiede gli stessi requisiti di sessione, JSON e CSRF. Se la regex candidata e' invalida o non compatibile con RE2, il backend risponde `422` e non salva nessun tentativo.
