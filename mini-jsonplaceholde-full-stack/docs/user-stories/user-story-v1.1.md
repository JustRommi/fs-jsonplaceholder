# User Story v1.1 — Migrazione Frontend a Nuxt 3

## Contesto
Migrazione del frontend di Mini JSONPlaceholder da vanilla HTML/CSS/JS a Nuxt 3 (SPA mode).
Backend Express + MySQL invariato. Ogni feature è sviluppata su branch separato, testata e poi mergiata su main.

---

## Branch completati

### `docs/prd` ✅
Creazione del file `docs/prd.md` con il Product Requirements Document completo della migrazione.
Compilato sezione per sezione con: overview, obiettivi, stato as-is, stato to-be, pagine/feature, requisiti tecnici, out of scope, criteri di successo, struttura cartelle target.

---

### `feat/nuxt-setup` ✅
Inizializzazione Nuxt 3 nella cartella `web/`.

**File creati:**
- `web/package.json` — aggiornato con dipendenza `nuxt: 3.13.2` (versione pinned per compatibilità Windows)
- `web/nuxt.config.ts` — `ssr: false`, porta 8080, `compatibilityDate: 2026-05-11`, HMR su porta 24678
- `web/app.vue` — template base con `<NuxtPage />`
- `web/pages/index.vue` — homepage minimale

**Problemi risolti:**
- Errore "Vite Node IPC socket path not configured" su Windows → risolto pinnando Nuxt a 3.13.2 (la 3.21.x ha un bug IPC su Windows)
- `.nuxt/` non era in `.gitignore` → aggiunto

---

### `feat/composables` ✅
Migrazione di `js/api.js` al formato composable Nuxt 3.

**File creati:**
- `web/composables/useApi.js` — espone `useApi()` con tutte le funzioni API: login, logout, ottieniUtenti, creaUtente, modificaUtente, eliminaUtente, ottieniPost, creaPost, eliminaPost, ottieniCommenti, creaCommento, eliminaCommento
- Gestione automatica Bearer token da localStorage
- Auto-refresh del token su 401
- Logout forzato se refresh fallisce

---

### `feat/pages-utenti` (sotto-prompt A) ✅
Prima versione della pagina lista utenti — solo visualizzazione e navigazione.

**File creati:**
- `web/components/AvatarUtente.vue` — mostra foto profilo (se presente), immagine personaggio Mario (se il nome corrisponde), oppure div con iniziali e colore dalla palette
- `web/pages/utenti/index.vue` — tabella utenti completa: avatar, nome, email, città, CF, badge sesso, data nascita, telefono, data creazione, pulsante "Vedi Post"

**Fix aggiuntivi nel branch:**
- `web/assets/stile.css` — rimossi temi anime (JJK, Kuromi, HxH, Naruto, One Piece), rimossi cursori custom, ripristinato `cursor: default`
- `web/public/img/` — immagini statiche spostate in `public/` per Nuxt
- `web/app.vue` — aggiunto `@import '~/assets/stile.css'`
- `.gitignore` — aggiunti `.nuxt`, `.output`, `dist`, `.claude/worktrees`

---

### `feat/utenti-crud` ✅
CRUD completo per gli utenti.

**File creati:**
- `web/components/ModalConferma.vue` — modal di conferma riutilizzabile, espone `apri(messaggio)` che restituisce una Promise (true/false)

**File modificati:**
- `web/pages/utenti/index.vue` — aggiunto:
  - Form accordion crea/modifica utente (nome, email, città, CF, sesso, data nascita, telefono, password)
  - Validazione codice fiscale con regex
  - Bottoni modifica (✏️) ed elimina (🗑️) nella colonna azioni
  - Delete con ModalConferma
  - Toast di successo temporaneo
  - Stato `utenteLoggato` da localStorage (elimina visibile solo agli admin)

---

### `feat/auth` ✅
Autenticazione: login, logout, stato utente globale.

**File creati:**
- `web/composables/useAuth.js` — gestisce lo stato globale dell'utente con `useState`, espone `utente`, `setUtente`, `eseguiLogout`
- `web/layouts/default.vue` — layout con navbar: link Utenti, link Login, nome utente loggato con badge ruolo, pulsante Logout
- `web/pages/login.vue` — form login con email/password, chiama `useApi().login()`, salva token/refreshToken/utente in localStorage, redirect a /utenti

**File modificati:**
- `web/app.vue` — aggiunto `<NuxtLayout>` attorno a `<NuxtPage />`

---

### `feat/pages-post` ✅
Pagina post filtrati per utente, con drill-down verso i commenti.

**File creati:**
- `web/pages/utenti/[id]/post.vue` — tabella post con:
  - Breadcrumb: Utenti → Post di [nome]
  - Skeleton loading
  - Tabella: avatar autore, titolo, corpo, data, azioni
  - Click su riga → espande testo completo
  - Paginazione (3 post per pagina)
  - Form accordion crea nuovo post
  - Elimina post con ModalConferma
  - Navigazione a `/utenti/[id]/post/[postId]/commenti`

---

## Branch da completare

| Branch | Feature |
|--------|---------|
| `feat/pages-commenti` | Pagina commenti con form + delete |
| `feat/breadcrumb` | Componente Breadcrumb riutilizzabile |
| `feat/styling` | Rifinitura CSS finale |

---

## Stack attuale

- **Framework:** Nuxt 3.13.2, SPA mode (`ssr: false`)
- **Vue:** 3.x (auto-import di ref, reactive, computed, onMounted, useState, useRoute, useRouter)
- **Styling:** CSS plain (`web/assets/stile.css`)
- **API:** Express su `localhost:3000`, Nuxt su `localhost:8080`
- **Auth:** JWT con access token + refresh token in localStorage
- **Struttura pagine:**
  - `/` → index
  - `/utenti` → lista utenti
  - `/utenti/[id]/post` → post di un utente
  - `/utenti/[id]/post/[postId]/commenti` → commenti di un post (da fare)
  - `/login` → form login
