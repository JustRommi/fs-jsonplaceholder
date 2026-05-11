# PRD — Migrazione Frontend a Nuxt 3

## 1. Overview del progetto
Mini JSONPlaceholder è un progetto didattico realizzato durante il corso di Web Development. Replica semplificata in italiano di JSONPlaceholder, con backend Express + MySQL e frontend originalmente in HTML/CSS/JS vanilla. L'obiettivo è dimostrare le competenze acquisite durante l'anno — incluso l'uso metodico di strumenti AI come Claude — e fa parte del portfolio personale. Questa fase migra il frontend da vanilla JS a Nuxt 3, senza aggiungere nuove funzionalità.

## 2. Obiettivi della migrazione
La migrazione nasce come applicazione pratica della parte teorica sui framework web. Agire su un progetto già funzionante permette di capire concretamente cosa cambia introducendo un framework rispetto al vanilla JS.

- Imparare Nuxt 3 in contesto reale
- Strutturare il codice in modo professionale (routing file-based, componenti, composables)
- Produrre componenti riutilizzabili in progetti futuri
- Migliorare la leggibilità e manutenibilità del codice
- Rafforzare il portfolio con un progetto che mostra evoluzione tecnica

## 3. Stato attuale (as-is)
Il frontend è in `web/` e gira con `serve` su `localhost:8080`. Nessun build tool né framework.

- `index.html` — unica pagina, 3 sezioni toggle con classe CSS `.nascosta`
- `stile.css` — stili globali
- `js/api.js` — fetch wrapper verso `localhost:3000`
- `js/ui.js` — funzioni di rendering con template literals e DOM manipulation
- `js/app.js` — orchestratore: navigazione, form, delete, drill-down

Limiti: nessun routing reale, nessun componente riutilizzabile, navigazione gestita manualmente via JS.

## 4. Stato target (to-be)
App Nuxt 3 in modalità SPA. Routing file-based con pagine dinamiche per il drill-down.

- `pages/utenti/index.vue` — lista utenti
- `pages/utenti/[id]/post.vue` — post di un utente
- `pages/utenti/[id]/post/[postId]/commenti.vue` — commenti di un post

## 5. Pagine e feature da implementare

**Pages:**
- `pages/index.vue` — homepage con link alle 3 sezioni
- `pages/utenti/index.vue` — lista tutti gli utenti
- `pages/utenti/[id]/post.vue` — post di un utente (breadcrumb: Utenti → Utente X)
- `pages/utenti/[id]/post/[postId]/commenti.vue` — commenti di un post (breadcrumb: Utenti → Utente X → Post Y)

**Componenti:**
- `UtenteCard.vue` — card utente cliccabile
- `PostCard.vue` — card post cliccabile
- `CommentoCard.vue` — card commento
- `Breadcrumb.vue` — navigazione contestuale

**Composables:**
- `useApi.js` — wrapper fetch verso l'API Express

**Funzionalità mantenute:**
- CRUD completo per utenti, post, commenti
- Form creazione/modifica
- Filtri per città, userId, postId

## 6. Requisiti tecnici
- Framework: Nuxt 3, modalità SPA (`ssr: false`)
- Package manager: npm
- Nuxt su `localhost:8080`, API Express su `localhost:3000`
- Styling: CSS plain (migrazione di `stile.css`)
- Nessuna modifica al backend
- Node.js ≥ 18

## 7. Out of scope
- Nessuna modifica al backend
- Nessuna autenticazione
- Nessun framework CSS
- Nessun SSR/SSG
- Nessun testing automatizzato
- Nessuna nuova feature

## 8. Criteri di successo
- Tutte le pagine vanilla riprodotte in Nuxt
- Drill-down funzionante via routing dinamico
- CRUD completo funzionante per tutte e 3 le risorse
- Filtri funzionanti
- Codice organizzato in pagine, componenti e composables
- Nessuna manipolazione manuale del DOM
- App gira con `nuxt dev` senza errori

## 9. Struttura cartelle target
