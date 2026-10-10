# RegexRiddle

**Esame 30/30 in Tecnologie Web.**

RegexRiddle è un gioco di enigmi basati sulle espressioni regolari: ogni giocatore
crea sfide con esempi pubblici e controlli segreti, oppure prova a risolvere quelle
degli altri. Una soluzione è corretta quando riconosce tutti i controlli positivi
e nessuno dei negativi.

## Cosa richiedeva la traccia

La traccia **WebTech’s RegexRiddle** richiedeva:

1. Un’applicazione full-stack con back-end e front-end realizzati tramite
   framework web, API, interfaccia responsive e almeno **10 test End-to-End
   automatici**.
2. Una landing page e una pagina che spiega il gioco, accessibili anche senza
   registrazione.
3. Registrazione, accesso e personalizzazione dell’account, con possibilità di
   caricare un avatar.
4. Creazione di enigmi con una regex valida e segreta, un esempio positivo e uno
   negativo pubblici, fino a **10 stringhe di controllo positive e 10 negative**
   riservate al sistema.
5. Tentativi di soluzione tramite una regex proposta dal giocatore, confrontando
   il suo comportamento con quello atteso sulle stringhe di controllo.
6. Feedback dopo ogni tentativo con il numero di controlli **positivi e negativi
   soddisfatti** dalla regex proposta.
7. Una classifica basata sul numero di enigmi risolti e, a parità di soluzioni,
   sul minor numero medio di tentativi.

I sorgenti sono organizzati in `backend/` e `frontend/`; `shared/` contiene i
contratti comuni ed `e2e/` i test. Il repository include le istruzioni di avvio e
la scheda PDF con autore, matricola, traccia e tecnologie.

## Schermate dell’applicazione

### Landing page

Presentazione del gioco e accesso alla spiegazione delle regole.

![Landing page di RegexRiddle](https://github.com/Daniele04-creator/RegexRiddle/releases/download/documentation/landing.png)

### Catalogo degli enigmi

Sfide con difficoltà, autore ed esempi pubblici, filtro e navigazione del catalogo.

![Catalogo degli enigmi di RegexRiddle](https://github.com/Daniele04-creator/RegexRiddle/releases/download/documentation/catalogo.png)

### Tentativo e feedback

Nella sfida del PIN, il tentativo `.*` riconosce anche i controlli negativi:
2 positivi su 2 e 2 negativi su 2. Per risolvere l’enigma, i negativi soddisfatti
devono essere zero.

![Tentativo con feedback sui controlli positivi e negativi](https://github.com/Daniele04-creator/RegexRiddle/releases/download/documentation/tentativo.png)

Le schermate provengono dall’applicazione con i dati dimostrativi del seed.

## Traccia e scelte implementative

[Consulta la scheda del progetto e delle scelte tecnologiche (PDF)](technologies.pdf).

La scheda, di una pagina, riporta autore, matricola, traccia scelta e tecnologie
utilizzate per back-end, front-end, database e test. Le regole di implementazione
sono descritte anche nella sezione finale di questo README.

## Eseguire il progetto

Servono **Node.js >=24.14.0**, **pnpm >=11.7.0** e **Docker Desktop** per il database,
oppure un server PostgreSQL già disponibile. I comandi seguenti sono per PowerShell.

### 1. Scaricare e configurare

```powershell
git clone https://github.com/Daniele04-creator/RegexRiddle.git
cd RegexRiddle
pnpm install --frozen-lockfile
Copy-Item .env.example .env
Copy-Item .env.example backend/.env
```

Copiare i file `.env` solo al primo avvio, per conservare eventuali impostazioni
locali. I valori di esempio servono per la demo locale; usare credenziali proprie
se si espone il progetto su un server.

### 2. Preparare il database

Avviare PostgreSQL e attendere il controllo di disponibilità del container:

```powershell
docker compose up -d --wait db
pnpm db:generate
pnpm --dir backend exec prisma migrate deploy
pnpm db:seed
```

Il seed inserisce utenti, sfide, tentativi, soluzioni e classifica dimostrativi.
Usare un database dedicato al progetto. `migrate deploy` applica le migrazioni già
versionate; `pnpm db:migrate` serve durante lo sviluppo per crearne di nuove.

Con PostgreSQL installato senza Docker, creare un database vuoto e aggiornare
`DATABASE_URL` in **entrambi** i file `.env` e `backend/.env`, poi eseguire i tre
comandi pnpm sopra, senza avviare il container `db`.

### 3. Avviare back-end e front-end

Nel primo terminale, dalla directory principale:

```powershell
pnpm dev:backend
```

In un secondo terminale, dalla stessa directory:

```powershell
pnpm dev:frontend
```

Aprire **[http://127.0.0.1:5173](http://127.0.0.1:5173)**.
Il back-end risponde su `http://127.0.0.1:4000`; il controllo di disponibilità è
`http://127.0.0.1:4000/health`. Il proxy Angular inoltra `/api` e `/health` al
back-end. Lasciare entrambi i terminali aperti durante l’utilizzo.

### Account dimostrativi

| Username | Password |
| --- | --- |
| `chiara_rossi` | `Password123!` |
| `luca_bianchi` | `Password123!` |
| `davide_mancini` | `Password123!` |

<details>
<summary>Alternativa: eseguire tutto con Docker Compose</summary>

Dopo aver scaricato il repository e creato il file `.env` nella directory
principale, avviare database, migrazioni, back-end e front-end:

```powershell
docker compose up --build -d
```

Al primo avvio, inserire i dati dimostrativi:

```powershell
docker compose run --rm migrate pnpm --dir backend db:seed
```

Aprire **[http://127.0.0.1:5174](http://127.0.0.1:5174)**.
In questa modalità il back-end è interno alla rete Docker e viene raggiunto dal
proxy del front-end.

```powershell
docker compose ps
docker compose down
```

`down` arresta lo stack conservando il database. Aggiungere `-v` elimina anche
il volume PostgreSQL e tutti i dati locali.

La configurazione Compose è stata validata. L’avvio completo dei container non
è stato verificato nell’ambiente locale, dove il motore Docker non era disponibile;
l’applicazione è stata verificata con PostgreSQL 17 installato localmente.

</details>

## Verifiche automatiche

Con le dipendenze installate e PostgreSQL raggiungibile tramite `DATABASE_URL`:

```powershell
pnpm --dir e2e exec playwright install chromium
pnpm check
```

`check` esegue audit delle dipendenze, generazione Prisma, controllo TypeScript,
build, test unitari e test End-to-End su Chromium. L’ultima verifica completa ha
superato **33 test unitari e 20 test E2E**, con prove desktop e mobile.

| Comando | Controllo |
| --- | --- |
| `pnpm audit` | Vulnerabilità delle dipendenze, incluse quelle di sviluppo |
| `pnpm typecheck` | Tipi TypeScript di tutti i package |
| `pnpm build` | Compilazione del progetto |
| `pnpm test:unit` | Regole delle regex, controlli e paginazione |
| `pnpm e2e` | Flussi del gioco, autorizzazione, profilo e layout responsive |

I test E2E avviano automaticamente back-end e front-end: le porte `4000` e `5173`
devono essere libere, oppure configurate tramite `API_PORT` e `WEB_PORT`.
Usare un database dedicato alle verifiche. Ogni esecuzione crea uno schema
`e2e_<uuid>`, applica le migrazioni e inserisce il seed senza modificare `public`.
L’utente PostgreSQL deve poter creare schemi. Gli schemi di prova rimangono
ispezionabili; il rapporto JSON è in `e2e/test-results/results.json`.

<details>
<summary>Regole e scelte implementative</summary>

- Ogni sfida contiene da 1 a 10 controlli per tipo, tutti distinti. Il server
  convalida la coerenza di esempi e controlli prima della pubblicazione.
- La regex originale viene usata per la convalida e non memorizzata: le etichette
  dei controlli conservano il comportamento atteso. Le risposte API restituiscono
  solo i conteggi dei controlli, senza rivelarne le stringhe.
- RE2-WASM valuta l’**intera stringa**. I pattern si inseriscono senza delimitatori
  `/…/`, per esempio `[0-9]+`, `a|ab` o `(?i)abc`. La
  [sintassi RE2](https://github.com/google/re2/wiki/Syntax) non supporta lookaround
  e backreference. Una regex invalida è rifiutata e non conta come tentativo.
- Non è richiesta uguaglianza testuale con la regex dell’autore. Una soluzione
  deve soddisfare tutti i controlli positivi e zero negativi. L’autore non può
  tentare la propria sfida.
- Le statistiche e le soluzioni del profilo si aggiornano nella stessa sessione.
  La classifica mostra i primi 100 giocatori con almeno una soluzione, ordinati
  per soluzioni decrescenti e media dei tentativi sulle sfide risolte crescente;
  lo username rende deterministici i pareggi completi.
- Il catalogo ordina dal più recente e non tronca le sfide oltre la centesima.
  `GET /api/challenges` accetta `difficulty=EASY|MEDIUM|HARD`, `page` (default 1)
  e `pageSize` (default 24, massimo 100); restituisce `items`, `total`, `page`,
  `pageSize`, `totalPages`. Cambiare filtro riporta alla prima pagina.
- Gli indici `(createdAt DESC, id DESC)` e `(difficulty, createdAt DESC, id DESC)`
  riducono il costo della selezione ordinata. La migrazione conserva i dati e può
  bloccare temporaneamente le scritture durante la creazione degli indici.
  Su 50.000 sfide sintetiche, con cache riscaldata, la query della prima pagina è
  passata da circa 18 ms a meno di 0,1 ms: la misura riguarda la query, non l’intera
  risposta HTTP. Conteggi esatti e offset elevati mantengono un costo proporzionale
  alle righe da visitare. Il conteggio filtrato ha mostrato un piccolo aumento
  di costo. Riferimenti: PostgreSQL su
  [ordinamento](https://www.postgresql.org/docs/17/indexes-ordering.html) e
  [indici multicolonna](https://www.postgresql.org/docs/17/indexes-multicolumn.html).
- La convalida di nuove sfide si interrompe al primo controllo incompatibile;
  i tentativi esaminano tutti i controlli per dare conteggi precisi. Il formatter
  italiano delle date viene creato una sola volta, senza cache di dati.
- Le regressioni verificano anche flag, newline, Unicode e quote RE2, segretezza,
  avatar, statistiche senza reload, cataloghi oltre 100 sfide e layout a 320 px
  con scrollbar e stringhe della lunghezza massima consentita.
- Due override circoscritti in `pnpm-workspace.yaml` aggiornano dipendenze fissate
  da Prisma e andranno rimossi quando Prisma incorpora le versioni corrette.
  Per `deepmerge-ts` 8, vedere la
  [correzione di sicurezza](https://github.com/RebeccaStevens/deepmerge-ts/security/advisories/GHSA-ggr8-5vv4-36mx)
  e la [release](https://github.com/RebeccaStevens/deepmerge-ts/releases/tag/v8.0.0).
  La configurazione Prisma usa oggetti semplici, senza le API modificate.

</details>

## Risoluzione dei problemi

- **Il back-end non parte:** controllare `backend/.env`, `DATABASE_URL`,
  disponibilità di PostgreSQL e applicazione delle migrazioni con
  `pnpm --dir backend exec prisma migrate deploy`.
- **Il front-end non carica i dati:** aprire `http://127.0.0.1:4000/health` e
  verificare che il back-end sia attivo.
- **Porta occupata:** arrestare il processo o container che la utilizza. Le porte
  predefinite sono `5173` (front-end locale), `5174` (front-end Docker), `4000`
  (back-end locale) e `55432` (PostgreSQL Docker).
