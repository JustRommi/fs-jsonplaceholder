// js/app.js — Modulo principale
//
// Importa api.js e ui.js, gestisce navigazione, form e drill-down.

import * as api from "./api.js";
import * as ui from "./ui.js";
import { mostraScheletro } from "./ui.js";

// ============================================================
// Stato drill-down
// ============================================================

let utenteSelezionato = null;
let postSelezionato = null;
let utenteInModifica = null;
let utentiCache = [];
let avatarBase64 = null; // foto caricata dall'utente
let paginaCorrente = 1;
const LIMITE = 3;

// ============================================================
// Riferimenti DOM
// ============================================================

const sezioni = {
  utenti: document.getElementById("sezione-utenti"),
  post: document.getElementById("sezione-post"),
  commenti: document.getElementById("sezione-commenti"),
  login: document.getElementById("sezione-login"),
};

const navBottoni = {
  utenti: document.getElementById("nav-utenti"),
  post: document.getElementById("nav-post"),
  commenti: document.getElementById("nav-commenti"),
  login: document.getElementById("nav-login"),
};

const liste = {
  utenti: document.getElementById("lista-utenti"),
  post: document.getElementById("lista-post"),
  commenti: document.getElementById("lista-commenti"),
};

const breadcrumbs = {
  post: document.getElementById("breadcrumb-post"),
  commenti: document.getElementById("breadcrumb-commenti"),
};

const titoli = {
  post: document.getElementById("titolo-post"),
  commenti: document.getElementById("titolo-commenti"),
};

// ============================================================
// Navigazione
// ============================================================

function mostraSezione(nome) {
  for (const [chiave, sezione] of Object.entries(sezioni)) {
    sezione.classList.toggle("nascosta", chiave !== nome);
    navBottoni[chiave].classList.toggle("attivo", chiave === nome);
  }
  // Anima il titolo h2 della sezione visibile
  const h2 = sezioni[nome].querySelector("h2");
  if (h2) {
    h2.classList.remove("titolo-animato");
    void h2.offsetWidth; // forza reflow per riavviare l'animazione
    h2.classList.add("titolo-animato");
  }
}

navBottoni.utenti.addEventListener("click", async () => {
  utenteSelezionato = null;
  paginaCorrente = 1;
  mostraSezione("utenti");
  await caricaUtenti();
});

navBottoni.post.addEventListener("click", async () => {
  utenteSelezionato = null;
  paginaCorrente = 1;
  breadcrumbs.post.innerHTML = "";
  titoli.post.innerHTML = `<span class="emoji-kuromi" style="animation-delay:0.2s">⚡</span> Post`;
  document.getElementById("post-userId").value = "";
  mostraSezione("post");
  await caricaPost();
});

navBottoni.commenti.addEventListener("click", async () => {
  postSelezionato = null;
  paginaCorrente = 1;
  breadcrumbs.commenti.innerHTML = "";
  titoli.commenti.innerHTML = `<span class="emoji-kuromi" style="animation-delay:0.4s">👁️</span> Commenti`;
  document.getElementById("commento-postId").value = "";
  mostraSezione("commenti");
  await caricaCommenti();
});

navBottoni.login.addEventListener("click", () => mostraSezione("login"));

document.getElementById("btn-logout").addEventListener("click", async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (refreshToken) await api.logout(refreshToken).catch(() => {});
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("utente");
  aggiornaStatoLogin();
  mostraSezione("utenti");
  caricaUtenti();
});

// ============================================================
// Modal conferma elimina
// ============================================================

function confermaElimina(messaggio = "Sei sicuro di voler eliminare?") {
  return new Promise((resolve) => {
    document.getElementById("modal-testo").textContent = messaggio;
    const modal = document.getElementById("modal-conferma");
    modal.classList.remove("nascosta");
    const btnSi = document.getElementById("modal-btn-conferma");
    const btnNo = document.getElementById("modal-btn-annulla");
    function cleanup(esito) {
      modal.classList.add("nascosta");
      btnSi.removeEventListener("click", onSi);
      btnNo.removeEventListener("click", onNo);
      resolve(esito);
    }
    const onSi = () => cleanup(true);
    const onNo = () => cleanup(false);
    btnSi.addEventListener("click", onSi);
    btnNo.addEventListener("click", onNo);
  });
}

// ============================================================
// Auth — login e stato
// ============================================================

function getUtenteLoggato() {
  return JSON.parse(localStorage.getItem("utente") || "null");
}

function aggiornaStatoLogin() {
  const utente = getUtenteLoggato();
  const stato = document.getElementById("stato-login");
  const btnLogout = document.getElementById("btn-logout");

  // Mostra il form "Nuovo Utente" solo agli admin
  document.querySelector(".accordion-utente").style.display =
    utente?.ruolo === "admin" ? "" : "none";

  if (utente) {
    stato.innerHTML = `Loggato come ${utente.nome}<span class="badge-ruolo">${utente.ruolo}</span>`;
    stato.classList.add("autenticato");
    btnLogout.classList.remove("nascosta");
  } else {
    stato.textContent = "Non sei autenticato";
    stato.classList.remove("autenticato");
    btnLogout.classList.add("nascosta");
  }
}

document.getElementById("form-login").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  try {
    const { accessToken, refreshToken, utente } = await api.login(email, password);
    localStorage.setItem("token", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("utente", JSON.stringify(utente));
    aggiornaStatoLogin();
    e.target.reset();
    mostraSezione("utenti");
    await caricaUtenti();
  } catch (errore) {
    // status 429 = tentativi esauriti → messaggio permanente (non sparisce)
    ui.mostraErrore(errore.message, sezioni.login, errore.status === 429);
  }
});

document.getElementById("ricerca-utenti").addEventListener("input", (e) => {
  const testo = e.target.value.toLowerCase();
  const righe = document.querySelectorAll("#lista-utenti tbody tr");
  righe.forEach((riga) => {
    const contenuto = riga.textContent.toLowerCase();
    riga.style.display = contenuto.includes(testo) ? "" : "none";
  });
});

function animaNumero(el, fine, durata = 600) {
  let corrente = 0;
  const step = 16;
  const inc = fine / (durata / step);
  const timer = setInterval(() => {
    corrente = Math.min(corrente + inc, fine);
    el.textContent = Math.round(corrente);
    if (corrente >= fine) clearInterval(timer);
  }, step);
}

async function aggiornaStatistiche() {
  const [utenti, post, commenti] = await Promise.all([
    api.ottieniUtenti(),
    api.ottieniPost(),
    api.ottieniCommenti(),
  ]);
  utentiCache = utenti;
  document.getElementById("statistiche").innerHTML = `
    <div class="stat-card">
      <span class="stat-icona">👤</span>
      <span class="stat-numero" id="stat-utenti">0</span>
      <span class="stat-label">Utenti</span>
    </div>
    <div class="stat-card">
      <span class="stat-icona">📝</span>
      <span class="stat-numero" id="stat-post">0</span>
      <span class="stat-label">Post</span>
    </div>
    <div class="stat-card">
      <span class="stat-icona">💬</span>
      <span class="stat-numero" id="stat-commenti">0</span>
      <span class="stat-label">Commenti</span>
    </div>
  `;
  animaNumero(document.getElementById("stat-utenti"), utenti.length);
  animaNumero(document.getElementById("stat-post"), post.length);
  animaNumero(document.getElementById("stat-commenti"), commenti.length);
}

// ============================================================
// Caricamento dati
// ============================================================

async function caricaUtenti() {
  try {
    mostraScheletro(liste.utenti, 10);
    const utenti = await api.ottieniUtenti();
    utentiCache = utenti;
    ui.mostraUtenti(
      utenti,
      liste.utenti,
      {
        onVediPost: vediPostDiUtente,
        onModifica: avviaModifica,
        onElimina: eliminaUtente,
      },
      getUtenteLoggato(),
    );
  } catch (err) {
    ui.mostraErrore(err.message, liste.utenti);
  }
}

async function caricaPost(userId) {
  try {
    // Se la cache è vuota la riempiamo prima di caricare i post
    if (utentiCache.length === 0) {
      utentiCache = await api.ottieniUtenti();
    }

    mostraScheletro(liste.post, 5);
    const risultato = await api.ottieniPost(userId, paginaCorrente, LIMITE);

    const post = risultato.dati ?? risultato;
    const meta = risultato.meta ?? null;

    ui.mostraPost(
      post,
      liste.post,
      {
        onVediCommenti: vediCommentiDiPost,
        onElimina: eliminaPost,
      },
      utentiCache,
      getUtenteLoggato(),
    );

    aggiornaPaginazione(meta, userId);
  } catch (err) {
    ui.mostraErrore(err.message, liste.post);
  }
}

async function caricaCommenti(postId) {
  try {
    mostraScheletro(liste.commenti, 6);
    const commenti = await api.ottieniCommenti(postId);
    ui.mostraCommenti(commenti, liste.commenti, {
      onElimina: eliminaCommento,
    });
  } catch (err) {
    ui.mostraErrore(err.message, liste.commenti);
  }
}

// ============================================================
// Drill-down
// ============================================================

async function vediPostDiUtente(utente) {
  utenteSelezionato = { id: utente.id, nome: utente.nome };
  titoli.post.textContent = `Post di ${utente.nome}`;
  breadcrumbs.post.innerHTML = `<a id="torna-utenti">Utenti</a> &rarr; Post di ${utente.nome}`;
  document.getElementById("post-userId").value = utente.id;

  document
    .getElementById("torna-utenti")
    .addEventListener("click", async () => {
      utenteSelezionato = null;
      mostraSezione("utenti");
      await caricaUtenti();
    });

  mostraSezione("post");
  await caricaPost(utente.id);
}

async function vediCommentiDiPost(post) {
  postSelezionato = { id: post.id, titolo: post.titolo };
  titoli.commenti.textContent = `Commenti al post: ${post.titolo}`;
  breadcrumbs.commenti.innerHTML = `<a id="torna-post">Post</a> &rarr; Commenti`;
  document.getElementById("commento-postId").value = post.id;

  document.getElementById("torna-post").addEventListener("click", async () => {
    postSelezionato = null;
    mostraSezione("post");
    if (utenteSelezionato) {
      await caricaPost(utenteSelezionato.id);
    } else {
      breadcrumbs.post.innerHTML = "";
      titoli.post.innerHTML = `<span class="emoji-kuromi" style="animation-delay:0.2s">⚡</span> Post`;
      await caricaPost();
    }
  });

  mostraSezione("commenti");
  await caricaCommenti(post.id);
}

// ============================================================
// Eliminazione
// ============================================================

async function eliminaUtente(id) {
  if (!await confermaElimina("Eliminare questo utente?")) return;
  try {
    await api.eliminaUtente(id);
    await caricaUtenti();
    await aggiornaStatistiche();
    ui.mostraSuccesso("Utente eliminato", liste.utenti);
  } catch (err) {
    ui.mostraErrore(err.message, liste.utenti);
  }
}

async function eliminaPost(id) {
  if (!await confermaElimina("Eliminare questo post?")) return;
  try {
    await api.eliminaPost(id);
    await caricaPost(utenteSelezionato?.id);
    await aggiornaStatistiche();
    ui.mostraSuccesso("Post eliminato", liste.post);
  } catch (err) {
    ui.mostraErrore(err.message, liste.post);
  }
}

async function eliminaCommento(id) {
  if (!await confermaElimina("Eliminare questo commento?")) return;
  try {
    await api.eliminaCommento(id);
    await caricaCommenti(postSelezionato?.id);
    await aggiornaStatistiche();
    ui.mostraSuccesso("Commento eliminato", liste.commenti);
  } catch (err) {
    ui.mostraErrore(err.message, liste.commenti);
  }
}

function aggiornaPaginazione(meta, userId) {
  let contenitore = document.getElementById("paginazione-post");
  if (!contenitore) {
    contenitore = document.createElement("div");
    contenitore.id = "paginazione-post";
    liste.post.after(contenitore);
  }

  if (!meta || meta.pagine <= 1) {
    contenitore.innerHTML = "";
    return;
  }

  contenitore.innerHTML = `
        <button id="btn-precedente" ${meta.pagina <= 1 ? "disabled" : ""}>← Precedente</button>
        <span>Pagina ${meta.pagina} di ${meta.pagine}</span>
        <button id="btn-successiva" ${meta.pagina >= meta.pagine ? "disabled" : ""}>Successiva →</button>
    `;

  contenitore
    .querySelector("#btn-precedente")
    ?.addEventListener("click", async () => {
      paginaCorrente--;
      await caricaPost(userId);
    });

  contenitore
    .querySelector("#btn-successiva")
    ?.addEventListener("click", async () => {
      paginaCorrente++;
      await caricaPost(userId);
    });
}

// ============================================================
// Modifica Utente
// ============================================================

function avviaModifica(utente) {
  utenteInModifica = utente;

  // Pre-compila il form con i dati dell'utente
  document.getElementById("utente-nome").value = utente.nome || "";
  document.getElementById("utente-email").value = utente.email || "";
  document.getElementById("utente-citta").value = utente.citta || "";
  document.getElementById("utente-cf").value = utente.codiceFiscale || "";
  document.getElementById("utente-sesso").value = utente.sesso || "";
  document.getElementById("utente-nascita").value = utente.dataNascita
    ? utente.dataNascita.slice(0, 10)
    : "";
  document.getElementById("utente-telefono").value = utente.telefono || "";

  // Cambia il testo del bottone submit e mostra Annulla
  document.getElementById("submit-utente").textContent = "Salva Modifiche";
  document.getElementById("annulla-modifica").classList.remove("nascosta");

  // Apre l'accordion del form
  document.querySelector(".accordion-utente").setAttribute("open", "");

  // Scrolla al form
  document
    .querySelector(".accordion-utente")
    .scrollIntoView({ behavior: "smooth", block: "start" });
}

function annullaModifica() {
  utenteInModifica = null;
  document.getElementById("form-utente").reset();
  document.getElementById("submit-utente").textContent = "Crea Utente";
  document.getElementById("annulla-modifica").classList.add("nascosta");
  resetAvatar();
}

document
  .getElementById("annulla-modifica")
  .addEventListener("click", annullaModifica);

// ============================================================
// Form — Creazione / Modifica
// ============================================================

document.getElementById("form-utente").addEventListener("submit", async (e) => {
  e.preventDefault();
  const nome = document.getElementById("utente-nome").value.trim();
  const email = document.getElementById("utente-email").value.trim();
  const citta = document.getElementById("utente-citta").value.trim();
  const codiceFiscale = document
    .getElementById("utente-cf")
    .value.trim()
    .toUpperCase();
  const sesso = document.getElementById("utente-sesso").value;
  const dataNascita = document.getElementById("utente-nascita").value || null;
  const telefono =
    document.getElementById("utente-telefono").value.trim() || null;
  const password = document.getElementById("utente-password").value;

  const regexCF = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/;
  if (!regexCF.test(codiceFiscale)) {
    ui.mostraErrore("Codice fiscale non valido", liste.utenti);
    return;
  }

  const dati = {
    nome,
    email,
    citta,
    codiceFiscale,
    sesso,
    dataNascita,
    telefono,
  };

  try {
    if (utenteInModifica) {
      await api.modificaUtente(utenteInModifica.id, { ...dati, avatar: avatarBase64 ?? utenteInModifica.avatar });
      annullaModifica();
      await caricaUtenti();
      await aggiornaStatistiche();
      ui.mostraSuccesso("Utente modificato con successo!", liste.utenti);
    } else {
      await api.creaUtente({ ...dati, password, avatar: avatarBase64 });
      e.target.reset();
      resetAvatar();
      await caricaUtenti();
      await aggiornaStatistiche();
      ui.mostraSuccesso("Utente creato con successo!", liste.utenti);
    }
  } catch (err) {
    ui.mostraErrore(err.message, liste.utenti);
  }
});

document.getElementById("form-post").addEventListener("submit", async (e) => {
  e.preventDefault();
  const userId = parseInt(document.getElementById("post-userId").value);
  const titolo = document.getElementById("post-titolo").value.trim();
  const corpo = document.getElementById("post-corpo").value.trim();

  try {
    await api.creaPost({ userId, titolo, corpo });
    e.target.reset();
    if (utenteSelezionato) {
      document.getElementById("post-userId").value = utenteSelezionato.id;
    }
    await caricaPost(utenteSelezionato?.id);
    await aggiornaStatistiche();
    ui.mostraSuccesso("Post creato con successo!", liste.post);
  } catch (err) {
    ui.mostraErrore(err.message, liste.post);
  }
});

document
  .getElementById("form-commento")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const postId = parseInt(document.getElementById("commento-postId").value);
    const nome = document.getElementById("commento-nome").value.trim();
    const email = document.getElementById("commento-email").value.trim();
    const corpo = document.getElementById("commento-corpo").value.trim();

    try {
      await api.creaCommento({ postId, nome, email, corpo });
      e.target.reset();
      if (postSelezionato) {
        document.getElementById("commento-postId").value = postSelezionato.id;
      }
      await caricaCommenti(postSelezionato?.id);
      await aggiornaStatistiche();
      ui.mostraSuccesso("Commento creato con successo!", liste.commenti);
    } catch (err) {
      ui.mostraErrore(err.message, liste.commenti);
    }
  });

// ============================================================
// Bottone Torna su
// ============================================================

const tornaSuBtn = document.createElement("button");
tornaSuBtn.id = "torna-su";
tornaSuBtn.title = "Torna in cima";
tornaSuBtn.textContent = "↑";
document.body.appendChild(tornaSuBtn);

window.addEventListener("scroll", () => {
  tornaSuBtn.classList.toggle("visibile", window.scrollY > 250);
});

tornaSuBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// ============================================================
// Upload foto profilo
// ============================================================

document.getElementById("utente-avatar").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    avatarBase64 = ev.target.result;
    const preview = document.getElementById("preview-avatar");
    preview.src = avatarBase64;
    preview.classList.remove("nascosta");
  };
  reader.readAsDataURL(file);
});

function resetAvatar() {
  avatarBase64 = null;
  const preview = document.getElementById("preview-avatar");
  preview.src = "";
  preview.classList.add("nascosta");
  document.getElementById("utente-avatar").value = "";
}

// ============================================================
// Contatore caratteri nelle textarea
// ============================================================

["post-corpo", "commento-corpo"].forEach((id) => {
  const textarea = document.getElementById(id);
  const counter = document.createElement("small");
  counter.className = "contatore-caratteri";
  counter.textContent = "0 caratteri";
  textarea.after(counter);
  textarea.addEventListener("input", () => {
    counter.textContent = `${textarea.value.length} caratteri`;
  });
});

// ============================================================
// Mostra/nascondi password
// ============================================================

document.querySelectorAll(".btn-mostra-password").forEach((btn) => {
  btn.addEventListener("click", () => {
    const input = document.getElementById(btn.dataset.target);
    const visibile = input.type === "text";
    input.type = visibile ? "password" : "text";
    btn.textContent = visibile ? "👁️" : "🙈";
  });
});

// ============================================================
// Avvio — Carica la lista utenti all'apertura
// ============================================================

aggiornaStatoLogin();
caricaUtenti();
aggiornaStatistiche();
