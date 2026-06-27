# Difesa orale

## Cosa contiene GOAL 08.6

Nel GOAL 08.6 ho trasformato la parte pubblica da demo tecnica a esperienza di gioco. La nuova direzione si chiama "Regex Lab Arcade": l'utente capisce subito che sceglie una sfida, studia esempi accettati e rifiutati, prova una regex, riceve indizi numerici e sale in classifica.

Ho rimosso dalle schermate pubbliche il gergo tecnico inutile: niente riferimenti a API, endpoint, backend, CSRF, cookie, DTO, framework, database, Docker o GOAL. Questi dettagli restano nella documentazione tecnica e nei test, ma non devono distrarre un visitatore o un docente durante la demo prodotto.

GOAL 08.6 aggiunge:

- hero ridisegnata con puzzle preview, esempi accettati/rifiutati, regex visuale e prove nascoste;
- copy da giocatore su home, come funziona, catalogo, dettaglio sfida, classifica, login, registrazione e creazione;
- card sfida piu' giocose con CTA "Gioca";
- feedback tentativo piu' chiaro: prove utili superate, falsi positivi rimasti e stato risolto;
- podio top 3 in leaderboard e spiegazione semplice del ranking;
- test anti-copy tecnico sulle pagine pubbliche principali;
- documentazione aggiornata per il tema Regex Lab Arcade.

Non cambia backend, contratti API, database, autenticazione, sessioni o semantica regex. La sicurezza resta la stessa: la regex dell'utente non viene valutata nel frontend, i controlli nascosti e la regex segreta non vengono mostrati, non uso localStorage/sessionStorage per token, non leggo document.cookie e non uso dangerouslySetInnerHTML.

La scelta importante da spiegare e': l'interfaccia pubblica parla come un gioco, mentre la documentazione e il codice mantengono in modo esplicito le garanzie tecniche. Questo rende il prodotto piu' vendibile e comprensibile senza indebolire la sicurezza.

## Cosa contiene GOAL 08.5

Nel GOAL 08.5 ho aggiunto la pagina pubblica "Come funziona", utile per la demo e per spiegare al docente full match, dialetto RE2, esempi pubblici, controlli segreti, feedback aggregato e classifica. Ho aggiunto anche una pagina account protetta: l'utente autenticato puo' aggiornare display name, bio e avatar URL, mentre username, email e password non vengono modificati in questo goal. L'aggiornamento usa la sessione rr_session, credentials include e header CSRF. Non uso JWT, non leggo document.cookie e non salvo token in localStorage o sessionStorage. Ho poi fatto un pass finale su responsive e accessibilita' delle pagine principali.

GOAL 08.5 aggiunge:

- route pubblica `/how-it-works`;
- route protetta `/account`;
- endpoint protetto `PATCH /api/auth/me`;
- validazione server-side per `displayName`, `bio` e `avatarUrl`;
- rifiuto di chiavi sconosciute e mass assignment;
- update cache TanStack Query del current user;
- nav pubblica con Home, Come funziona, Sfide, Classifica e Crea;
- link Account e Logout solo per utenti autenticati;
- test backend, frontend ed E2E per contratto account, UI, responsive e anti-leak.

Non aggiunge profilo/statistiche, cambio password, cambio email, upload avatar, edit/delete sfide, migration, JWT, storage token nel browser o valutazione regex nel frontend.

## Cosa contiene GOAL 08.4

Nel GOAL 08.4 ho aggiunto la UI reale di creazione sfide su `/create`. Un utente non autenticato vede il gate login/register; un utente autenticato vede una form protetta per titolo, descrizione, difficolta, regex segreta, flag supportati, esempi pubblici e controlli segreti. Il frontend invia il payload all'endpoint gia' esistente `POST /api/challenges`, con `credentials: include` e header CSRF. La regex segreta non viene valutata nel browser: coerenza di regex, esempi e controlli resta responsabilita' del backend con RE2 full match.

GOAL 08.4 aggiunge:

- form reale `/create` collegata a `POST /api/challenges`;
- gate login/register per utenti guest;
- validazione client di forma, lunghezze, flag `i`/`m`, numero controlli, duplicati e contraddizioni semplici;
- editor controlli segreti con minimo 3 e massimo 10 per tipo;
- mutation TanStack Query protetta con CSRF centralizzato nell'API client;
- reset dei campi segreti dopo creazione riuscita;
- card di successo con solo DTO pubblico e link al dettaglio;
- mapping sicuro per errori `400`, `401`, `403` e `422`;
- test frontend e E2E per stati UI, payload, errori, responsive, anti-leak e storage.

Non aggiunge modifiche backend, modifiche database, profilo, statistiche, edit/delete, JWT, storage token nel browser o valutazione regex nel frontend.

## Cosa contiene GOAL 08.3

Nel GOAL 08.3 ho aggiunto la UI di gioco nel dettaglio sfida. Un utente non autenticato vede l'invito ad accedere; un autore vede che non puo' risolvere la propria sfida; un utente autenticato non autore puo' inviare una regex candidata. Il frontend manda solo pattern candidato e flag supportati all'endpoint protetto POST /api/challenges/:id/attempts, con credentials include e header CSRF. La regex non viene valutata nel browser: viene valutata dal backend con RE2 full match. La risposta contiene solo conteggi aggregati, quindi la regex segreta, i controlli nascosti e il pattern proposto non vengono esposti nelle response pubbliche.

GOAL 08.3 aggiunge:

- pannello tentativi reale in `/challenges/:id`;
- gate login/register per utenti guest;
- stato autore bloccato;
- form candidato con React Hook Form e Zod;
- selettore flag `i` e `m`;
- mutation TanStack Query verso `POST /api/challenges/:id/attempts`;
- feedback aggregato per soluzione corretta e tentativo errato;
- mapping sicuro per errori `401`, `403`, `404`, `409` e `422`;
- invalidazione di dettaglio sfida, catalogo e leaderboard quando serve;
- test frontend e E2E per stati UI, feedback, errori, responsive e anti-leak.

Non aggiunge creazione sfide da UI, profilo, statistiche, edit/delete, modifiche backend, modifiche database, JWT, storage token nel browser o valutazione regex nel frontend.

## Cosa contiene GOAL 08.2

Nel GOAL 08.2 ho collegato il frontend alle API di autenticazione gia' presenti. Login e registrazione non ricevono token JSON: il backend imposta un cookie HttpOnly chiamato `rr_session`. Il frontend non legge il cookie e non salva token in localStorage o sessionStorage. Per sapere se l'utente e' autenticato chiama GET /api/auth/me con credentials include. TanStack Query mantiene lo stato utente in memoria e lo aggiorna dopo login, registrazione e logout.

GOAL 08.2 aggiunge:

- form reale `/login` collegato a `POST /api/auth/login`;
- form reale `/register` collegato a `POST /api/auth/register`;
- logout collegato a `POST /api/auth/logout`;
- ripristino sessione tramite `GET /api/auth/me`;
- header e menu mobile con stato guest/autenticato;
- placeholder `/create` protetto: guest vede richiesta login, utente autenticato vede il placeholder GOAL 08.4;
- test frontend e E2E per login, logout, registrazione, conflitto, anti-leak, storage e placeholder protetto.

Non aggiunge invio tentativi, creazione sfide da UI, profilo, statistiche, edit/delete, JWT, storage token nel browser o valutazione regex nel frontend.

## Cosa contiene GOAL 08.1

Nel GOAL 08.1 ho collegato le pagine pubbliche della SPA alle API gia' presenti. Il catalogo legge GET /api/challenges, il dettaglio legge GET /api/challenges/:id e la classifica legge GET /api/leaderboard. Uso TanStack Query perche' questi dati sono server state: vengono caricati, messi in cache e aggiornati senza gestire stato manuale complesso. La UI mostra solo dati pubblici: esempi pubblici, autore pubblico e statistiche aggregate. Regex segreta, controlli nascosti e pattern proposti non arrivano mai nel frontend e non vengono renderizzati.

GOAL 08.1 aggiunge:

- catalogo pubblico `/challenges` con dati reali e paginazione;
- dettaglio pubblico `/challenges/:id`;
- classifica pubblica `/leaderboard`;
- hook TanStack Query per catalogo, dettaglio e leaderboard;
- tabella leaderboard accessibile su desktop/tablet;
- lista leaderboard impilata su mobile;
- stati loading, error, empty e success;
- test frontend e E2E per UI pubblica, paginazione e anti-leak.

Non aggiunge login, registrazione, logout, tentativi, creazione sfide, profilo, statistiche o edit/delete.

## Cosa contiene GOAL 08.0

Nel GOAL 08.0 ho trasformato il frontend da semplice smoke app a vera base SPA. Ho configurato Tailwind, shadcn/ui, routing client-side, TanStack Query e un proxy same-origin verso il backend. Il design system si chiama Regex Lab ed e' documentato in DESIGN.md. Non ho ancora implementato login, tentativi o creazione sfide: ho preparato la struttura in modo sicuro, responsive e accessibile. L'autenticazione resta basata su cookie HttpOnly, quindi il frontend non salva token in localStorage o sessionStorage.

GOAL 08.0 aggiunge:

- design system Regex Lab documentato in `DESIGN.md`;
- Tailwind CSS v4 tramite `@tailwindcss/vite`;
- shadcn/ui inizializzato dentro `frontend/`;
- routing SPA con React Router;
- provider TanStack Query;
- API client same-origin con `credentials: "include"`;
- proxy Vite per `/api/*` e `/health`;
- proxy Docker del server web verso `API_ORIGIN`;
- app shell con header, nav, main, footer e skip link;
- landing page fondativa e pagine placeholder;
- baseline responsive e accessibile;
- test frontend e E2E per routing, proxy, anti-leak e storage auth.

Non aggiunge UI reale di login, registrazione, tentativi, creazione sfide, catalogo dati o leaderboard dati. Quelle parti restano per i GOAL 08.x successivi.

## Cosa contiene GOAL 07

GOAL 07 aggiunge la leaderboard pubblica dei solutori sopra i dati di soluzione gia' presenti.

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
- endpoint pubblico `GET /api/leaderboard`;
- DTO pubblici per risultato tentativo con soli conteggi aggregati;
- documentazione iniziale per architettura, sicurezza, test e piano di sviluppo.

La API espone `GET /health`, due endpoint pubblici read-only sulle sfide, un endpoint pubblico per la leaderboard, quattro endpoint auth backend, un endpoint protetto per creare sfide e un endpoint protetto per inviare tentativi.

La creazione sfide e' protetta: solo utenti autenticati possono creare una sfida. Il client manda regex segreta, esempi pubblici e controlli segreti, ma il backend valida tutto con RE2 full match prima di salvare. L'autore non viene preso dal body: viene preso dalla sessione `rr_session`. La risposta torna come DTO pubblico e non contiene ne' la regex segreta ne' i valori dei controlli.

La leaderboard non legge i tentativi grezzi e non mostra regex. Usa la tabella `Solution`, cioe' le sfide effettivamente risolte. Per ogni utente calcolo quante sfide ha risolto e la media dei tentativi usati. Ordino prima per numero di enigmi risolti in modo decrescente, poi per media tentativi crescente. La risposta e' pubblica ma contiene solo dati aggregati e identita' pubblica, non email, password hash, token, regex segrete, controlli o pattern proposti.

## Perche' serve

Il backend carica i controlli segreti, valuta la regex dell'utente con RE2 full match, salva solo conteggi aggregati e non manda mai i controlli al frontend.

In GOAL 07 questi controlli devono passare: seed, verify, lint, typecheck, unit test, build ed E2E. Docker Compose avvia PostgreSQL, API e web.

Il progetto e' un monorepo pnpm, ma per chiarezza di consegna ho separato le directory principali in backend, frontend ed e2e. Il codice condiviso resta in packages/shared. Docker Compose orchestra backend, frontend e PostgreSQL.

Prisma e' l'ORM: descriviamo le tabelle in TypeScript/Prisma schema, generiamo un client tipizzato e applichiamo le modifiche al database con migration versionate.

Il seed crea utenti e sfide demo ripetibili. Serve per provare il progetto e per l'orale, ma non sostituisce le feature vere.

## Cosa non contiene ancora

Non ci sono ancora profilo/statistiche o edit/delete.

Questa scelta e' intenzionale: GOAL 08.5 aggiunge solo impostazioni account correnti e lascia profilo/statistiche, cambio password/email, upload avatar e gestione edit/delete sfide ai goal successivi.

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
