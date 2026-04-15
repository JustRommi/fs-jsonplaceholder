// js/ui.js — Funzioni di rendering DOM
//
// Ogni funzione riceve dati + contenitore + callbacks.
// Nessuna chiamata API qui — solo costruzione HTML.

// ============================================================
// Helper
// ============================================================

function avatarIniziali(nome) {
  const parti = nome.trim().split(" ");
  const iniziali = parti.length >= 2
    ? (parti[0][0] + parti[1][0]).toUpperCase()
    : nome.slice(0, 2).toUpperCase();
  const palette = ["#c41e3a","#7b2fbe","#d4890a","#059669","#2563eb","#db2777","#0891b2","#b45309"];
  const colore = palette[nome.charCodeAt(0) % palette.length];
  return `<div class="avatar-iniziali" style="--av-bg:${colore}">${iniziali}</div>`;
}

function badgeSesso(sesso) {
  const classi = { M: "badge-m", F: "badge-f", Altro: "badge-altro" };
  return `<span class="badge-sesso ${classi[sesso] || "badge-altro"}">${sesso}</span>`;
}

function avatarUserId(userId) {
  const palette = ["#c41e3a","#2563eb","#7b2fbe","#059669","#d4890a","#db2777","#0891b2","#b45309"];
  const colore = palette[(userId - 1) % palette.length];
  return `<div class="avatar-iniziali" style="--av-bg:${colore}" title="Utente #${userId}">U${userId}</div>`;
}

function formattaData(timestamp) {
  const d = new Date(timestamp);
  const data = d.toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });
  const ora  = d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
  return `<span class="data-giorno">${data}</span><span class="data-ora">${ora}</span>`;
}

export function pulisciContenitore(contenitore) {
  contenitore.innerHTML = "";
}

export function mostraErrore(messaggio, contenitore) {
  const div = document.createElement("div");
  div.className = "errore";
  div.textContent = "✕ " + messaggio;
  contenitore.prepend(div);
  setTimeout(() => div.remove(), 4000);
}

export function mostraSuccesso(messaggio, contenitore) {
  const div = document.createElement("div");
  div.className = "toast-successo";
  div.textContent = "✓ " + messaggio;
  contenitore.prepend(div);
  setTimeout(() => div.remove(), 3000);
}

function mostraVuoto(contenitore, testo) {
  contenitore.innerHTML = `<p class="vuoto">${testo}</p>`;
}

// ============================================================
// Utenti
// ============================================================

/**
 * @param {Array} utenti
 * @param {HTMLElement} contenitore
 * @param {{ onVediPost: Function, onElimina: Function }} callbacks
 */
export function mostraUtenti(utenti, contenitore, callbacks) {
  pulisciContenitore(contenitore);

  if (utenti.length === 0) {
    mostraVuoto(contenitore, "Nessun utente trovato");
    return;
  }

  const tabella = document.createElement("table");
  tabella.className = "tabella-utenti";
  tabella.innerHTML = `
    <thead>
      <tr>
        <th></th>
        <th>Nome</th>
        <th>Email</th>
        <th>Città</th>
        <th>CF</th>
        <th>Sesso</th>
        <th>Nato il</th>
        <th>Telefono</th>
        <th>Creato il</th>
        <th>Azioni</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = tabella.querySelector("tbody");

  utenti.forEach((utente, indice) => {
    const riga = document.createElement("tr");
    riga.classList.add("riga-entrata");
    riga.style.animationDelay = `${indice * 0.05}s`;
    riga.innerHTML = `
      <td>${avatarIniziali(utente.nome)}</td>
      <td class="td-nome">${utente.nome}</td>
      <td>${utente.email}</td>
      <td>${utente.citta || "—"}</td>
      <td class="td-cf">${utente.codiceFiscale}</td>
      <td>${badgeSesso(utente.sesso)}</td>
      <td>${utente.dataNascita ? utente.dataNascita.slice(0, 10) : "—"}</td>
      <td>${utente.telefono || "—"}</td>
      <td class="td-data td-data-multi">${formattaData(utente.creatoIl)}</td>
      <td class="td-azioni">
        <div class="azioni-wrap">
          <button class="btn-primario" data-azione="vedi-post">Post</button>
          <button class="btn-secondario" data-azione="modifica">Modifica</button>
          <button class="btn-pericolo" data-azione="elimina">Elimina</button>
        </div>
      </td>
    `;

    riga.querySelector('[data-azione="vedi-post"]').addEventListener("click", () => {
      callbacks.onVediPost(utente);
    });

    riga.querySelector('[data-azione="modifica"]').addEventListener("click", () => {
      callbacks.onModifica(utente);
    });

    riga.querySelector('[data-azione="elimina"]').addEventListener("click", () => {
      callbacks.onElimina(utente.id);
    });

    tbody.appendChild(riga);
  });

  contenitore.appendChild(tabella);
}

// ============================================================
// Post
// ============================================================

/**
 * @param {Array} post
 * @param {HTMLElement} contenitore
 * @param {{ onVediCommenti: Function, onElimina: Function }} callbacks
 */
export function mostraPost(post, contenitore, callbacks, utenti = []) {
  pulisciContenitore(contenitore);

  if (post.length === 0) {
    mostraVuoto(contenitore, "Nessun post trovato");
    return;
  }

  const tabella = document.createElement("table");
  tabella.className = "tabella-utenti";
  tabella.innerHTML = `
    <thead>
      <tr>
        <th>Autore</th>
        <th>Titolo</th>
        <th>Corpo</th>
        <th>Creato il</th>
        <th>Azioni</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = tabella.querySelector("tbody");

  post.forEach((p, indice) => {
    const riga = document.createElement("tr");
    riga.className = "riga-cliccabile riga-entrata";
    riga.style.animationDelay = `${indice * 0.05}s`;
    const autore = utenti.find(u => u.id === p.userId);
    const avatarPost = autore ? avatarIniziali(autore.nome) : avatarUserId(p.userId);
    riga.innerHTML = `
      <td>${avatarPost}</td>
      <td class="td-nome">${p.titolo}</td>
      <td class="td-corpo">${p.corpo}</td>
      <td class="td-data td-data-multi">${formattaData(p.creatoIl)}</td>
      <td class="td-azioni">
        <div class="azioni-wrap">
          <button class="btn-primario" data-azione="vedi-commenti">Commenti</button>
          <button class="btn-pericolo" data-azione="elimina">Elimina</button>
        </div>
      </td>
    `;

    const rigaEspansa = document.createElement("tr");
    rigaEspansa.className = "riga-espansa nascosta";
    rigaEspansa.innerHTML = `
      <td colspan="5">
        <div class="commento-espanso">
          <span class="commento-espanso-label">📝 Testo completo</span>
          <p>${p.corpo}</p>
        </div>
      </td>
    `;

    riga.addEventListener("click", (e) => {
      if (e.target.closest("[data-azione]")) return;
      rigaEspansa.classList.toggle("nascosta");
      riga.classList.toggle("riga-aperta");
    });

    riga.querySelector('[data-azione="vedi-commenti"]').addEventListener("click", () => {
      callbacks.onVediCommenti(p);
    });

    riga.querySelector('[data-azione="elimina"]').addEventListener("click", () => {
      callbacks.onElimina(p.id);
    });

    tbody.appendChild(riga);
    tbody.appendChild(rigaEspansa);
  });

  contenitore.appendChild(tabella);
}

// ============================================================
// Commenti
// ============================================================

/**
 * @param {Array} commenti
 * @param {HTMLElement} contenitore
 * @param {{ onElimina: Function }} callbacks
 */
export function mostraCommenti(commenti, contenitore, callbacks) {
  pulisciContenitore(contenitore);

  if (commenti.length === 0) {
    mostraVuoto(contenitore, "Nessun commento trovato");
    return;
  }

  const tabella = document.createElement("table");
  tabella.className = "tabella-utenti";
  tabella.innerHTML = `
    <thead>
      <tr>
        <th>Autore</th>
        <th>Nome</th>
        <th>Email</th>
        <th>Corpo</th>
        <th>Creato il</th>
        <th>Azioni</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = tabella.querySelector("tbody");

  commenti.forEach((c, indice) => {
    const riga = document.createElement("tr");
    riga.className = "riga-cliccabile riga-entrata";
    riga.style.animationDelay = `${indice * 0.05}s`;
    riga.innerHTML = `
      <td>${avatarIniziali(c.nome)}</td>
      <td class="td-nome">${c.nome}</td>
      <td>${c.email}</td>
      <td class="td-corpo">${c.corpo}</td>
      <td class="td-data td-data-multi">${formattaData(c.creatoIl)}</td>
      <td class="td-azioni">
        <div class="azioni-wrap">
          <button class="btn-pericolo" data-azione="elimina">Elimina</button>
        </div>
      </td>
    `;

    // Riga espansa con testo completo
    const rigaEspansa = document.createElement("tr");
    rigaEspansa.className = "riga-espansa nascosta";
    rigaEspansa.innerHTML = `
      <td colspan="6">
        <div class="commento-espanso">
          <span class="commento-espanso-label">💬 Commento completo</span>
          <p>${c.corpo}</p>
          <small>— ${c.nome} &lt;${c.email}&gt;</small>
        </div>
      </td>
    `;

    // Click sulla riga (non sul bottone elimina) → espandi/chiudi
    riga.addEventListener("click", (e) => {
      if (e.target.closest("[data-azione]")) return;
      rigaEspansa.classList.toggle("nascosta");
      riga.classList.toggle("riga-aperta");
    });

    riga.querySelector('[data-azione="elimina"]').addEventListener("click", () => {
      callbacks.onElimina(c.id);
    });

    tbody.appendChild(riga);
    tbody.appendChild(rigaEspansa);
  });

  contenitore.appendChild(tabella);
}
