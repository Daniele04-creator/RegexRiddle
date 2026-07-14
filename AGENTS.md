# RegexRiddle - Istruzioni Operative

Fonte primaria: `Progetti - Tecnologie Web - 25-26.pdf`, Universita degli Studi di Napoli Federico II, corso Tecnologie Web, A.A. 2025/2026.

## Obiettivo Del Progetto

Realizzare `REGEXRIDDLE`, una piattaforma web full-stack moderna, sicura e responsive basata su sfide logiche e testuali con espressioni regolari.

Il progetto deve essere realizzato come applicazione web completa con:

- backend che espone una API, per esempio REST;
- frontend come Single Page Application;
- backend e frontend implementati con framework web;
- interfaccia responsive per viewport desktop, tablet e mobile;
- almeno 10 test End-to-End automatici;
- dati di esempio pronti per la demo e la discussione.

Non e consentito usare CMS come Wordpress, Strapi o strumenti equivalenti come base applicativa.

## Traccia RegexRiddle

Gli utenti registrati possono creare enigmi definendo una espressione regolare segreta.

Per ogni sfida l'autore deve inserire:

- una regex valida e segreta;
- un esempio di stringa che soddisfa la regex;
- un esempio di stringa che non soddisfa la regex;
- fino a 10 stringhe di controllo positive, cioe stringhe che soddisfano la regex;
- fino a 10 stringhe di controllo negative, cioe stringhe che non soddisfano la regex.

Le stringhe di controllo positive e negative sono segrete. Non devono essere mostrate ai solver e devono essere usate solo dal sistema per validare le regex proposte dagli utenti.

Gli altri utenti possono provare a risolvere una sfida proponendo una propria espressione regolare. Il sistema deve verificare la soluzione confrontando il comportamento della regex proposta con quello della regex originale sulle stringhe di controllo della sfida.

Dopo ogni tentativo il sistema deve mostrare solo il numero di stringhe di controllo positive e negative soddisfatte dalla regex proposta. Non deve esporre la regex originale, le stringhe di controllo o dettagli interni sufficienti a ricostruirli.

## Funzionalita Richieste

Funzionalita pubbliche, accessibili anche senza autenticazione:

- landing page dell'applicazione;
- pagina dedicata che spiega il funzionamento del gioco.

Funzionalita per utenti autenticati:

- personalizzazione dell'account;
- eventuale immagine/avatar utente;
- creazione di nuove sfide;
- tentativi di soluzione sulle sfide pubblicate da altri utenti;
- comparsa in classifica.

La classifica deve basarsi su:

- numero di enigmi risolti;
- minor numero medio di tentativi.

## Vincoli Di Sicurezza E Privacy

Il progetto deve essere trattato come applicazione web sicura.

Regole obbligatorie:

- non esporre mai ai client la regex originale di una sfida;
- non esporre mai le stringhe di controllo segrete;
- non loggare regex segrete, stringhe di controllo segrete, password, token, cookie, session id o credenziali;
- validare gli input lato server;
- autorizzare ogni endpoint protetto;
- impedire IDOR, mass assignment e accesso a risorse di altri utenti;
- proteggere l'autenticazione con sessioni server-side opache e cookie `HttpOnly` e `SameSite`;
- salvare password solo con hashing robusto, preferibilmente `Argon2id`;
- valutare le regex lato server con un motore sicuro e compatibile con l'obiettivo del progetto;
- evitare l'uso diretto di `RegExp` JavaScript su regex fornite dagli utenti se puo introdurre ReDoS o comportamento non controllato;
- usare messaggi di errore sicuri, senza dettagli interni o segreti.

## Vincoli Architetturali

La struttura del progetto deve mantenere separati backend e frontend, come richiesto dal PDF.

Struttura applicativa attesa:

- `backend/`: API, persistenza, autenticazione, logica sfide, validazione tentativi;
- `frontend/`: Single Page Application responsive;
- `e2e/`: test End-to-End automatici;
- `packages/` o moduli condivisi solo se utili a mantenere contratti e tipi comuni.

Non introdurre microservizi, provider cloud, code, cache distribuite o servizi esterni se non sono necessari alla traccia.

## Qualita Del Prodotto

Il docente valutera qualita dell'applicazione e discussione tecnica. Il codice deve quindi essere:

- leggibile;
- mantenibile;
- testabile;
- coerente nella struttura;
- spiegabile durante la discussione;
- privo di dipendenze inutili o troppo pesanti;
- pronto a una demo locale stabile.

L'app deve contenere dati di esempio utili a mostrare:

- creazione sfida;
- catalogo o navigazione delle sfide;
- tentativo errato con feedback numerico;
- tentativo corretto;
- account utente;
- classifica.

## Testing

Sono richiesti almeno 10 test End-to-End automatici.

Prima di dichiarare completata una modifica, eseguire i check pertinenti disponibili nel repository. Per questo progetto usare, quando applicabile:

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm e2e
pnpm check
```

Se un check non viene eseguito, riportare il motivo tecnico esatto.

## Consegna

Il PDF richiede la consegna di un singolo archivio `.zip`.

La consegna finale deve contenere:

- un PDF di massimo una pagina con nome, cognome, matricola, traccia scelta e tecnologie usate per backend e frontend;
- file sorgente e artefatti necessari all'esecuzione di backend e frontend, organizzati in directory distinte;
- un README con istruzioni dettagliate per eseguire frontend e backend.

Nota operativa: anche se in questa fase il repository viene ripulito dai documenti extra, il README resta un requisito del PDF per la consegna finale e dovra essere rigenerato prima di creare lo ZIP ufficiale.

Lo ZIP non deve includere dipendenze installate, per esempio:

- `node_modules/`;
- cache locali;
- screenshot non richiesti;
- archivi compressi annidati;
- file temporanei;
- segreti o file `.env` reali.

Il nome richiesto per lo ZIP e:

```text
${student.matricola}-${student.nome}-${student.cognome}.zip
```

La consegna va effettuata tramite Filesender di Ateneo all'indirizzo indicato nel PDF, con oggetto:

```text
[TECWEB] Consegna progetto 25/26 - ${student.matricola} ${student.nome} ${student.cognome}
```

Nel corpo del messaggio indicare la traccia svolta.

## Discussione

Durante la discussione lo studente dovra:

- mostrare una demo dell'applicazione;
- spiegare struttura del progetto e tecnologie usate;
- motivare le scelte progettuali;
- rispondere a domande tecniche;
- consentire al docente di interagire con l'applicazione;
- mostrare e spiegare il codice sorgente.

Se si usano tecnologie diverse da quelle viste a lezione, e preferibile rendere backend e frontend eseguibili tramite Docker.

## Anti-Plagio

Il progetto deve essere realizzato e compreso dallo studente.

Durante la discussione il progetto puo essere annullato se emerge che lo studente:

- non conosce l'organizzazione dei file sorgente;
- non sa spiegare il funzionamento del codice;
- non conosce le tecnologie usate;
- presenta un progetto identico o sostanzialmente copiato da altri.

Ogni modifica deve quindi mantenere il progetto semplice da spiegare e difendere.

## Regole Per Gli Agenti

- Lavorare nella root del progetto, senza creare directory annidate `RegexRiddle/`.
- Mantenere le modifiche piccole, motivate e coerenti con la traccia.
- Non aggiungere funzionalita fuori traccia se non richieste.
- Non aggiungere dipendenze pesanti senza motivazione forte.
- Non modificare `.env` reali e non introdurre segreti.
- Non versionare dipendenze installate, cache, screenshot o documenti temporanei.
- Non dichiarare check superati se non sono stati eseguiti realmente.
- Segnalare conflitti tra PDF, codice esistente e richieste nuove.
