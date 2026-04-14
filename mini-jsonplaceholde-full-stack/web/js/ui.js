// js/ui.js — Funzioni di rendering DOM
//
// Ogni funzione riceve dati + contenitore + callbacks.
// Nessuna chiamata API qui — solo costruzione HTML.

// ============================================================
// Helper
// ============================================================

function formattaData(timestamp) {
  return new Date(timestamp).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function pulisciContenitore(contenitore) {
  contenitore.innerHTML = "";
}

export function mostraErrore(messaggio, contenitore) {
  const div = document.createElement("div");
  div.className = "errore";
  div.textContent = messaggio;
  contenitore.prepend(div);

  // Rimuovi dopo 4 secondi
  setTimeout(() => div.remove(), 4000);
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
        <th>#</th>
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

  utenti.forEach((utente) => {
    const riga = document.createElement("tr");
    riga.innerHTML = `
      <td>${utente.id}</td>
      <td class="td-nome">${utente.nome}</td>
      <td>${utente.email}</td>
      <td>${utente.citta || "—"}</td>
      <td class="td-cf">${utente.codiceFiscale}</td>
      <td>${utente.sesso}</td>
      <td>${utente.dataNascita ? utente.dataNascita.slice(0, 10) : "—"}</td>
      <td>${utente.telefono || "—"}</td>
      <td class="td-data">${formattaData(utente.creatoIl)}</td>
      <td class="td-azioni">
        <button class="btn-primario" data-azione="vedi-post">Post</button>
        <button class="btn-pericolo" data-azione="elimina">Elimina</button>
      </td>
    `;

    riga.querySelector('[data-azione="vedi-post"]').addEventListener("click", () => {
      callbacks.onVediPost(utente);
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
export function mostraPost(post, contenitore, callbacks) {
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
        <th>#</th>
        <th>Titolo</th>
        <th>Corpo</th>
        <th>Creato il</th>
        <th>Azioni</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = tabella.querySelector("tbody");

  post.forEach((p) => {
    const riga = document.createElement("tr");
    riga.innerHTML = `
      <td>${p.id}</td>
      <td class="td-nome">${p.titolo}</td>
      <td class="td-corpo">${p.corpo}</td>
      <td class="td-data">${formattaData(p.creatoIl)}</td>
      <td class="td-azioni">
        <button class="btn-primario" data-azione="vedi-commenti">Commenti</button>
        <button class="btn-pericolo" data-azione="elimina">Elimina</button>
      </td>
    `;

    riga.querySelector('[data-azione="vedi-commenti"]').addEventListener("click", () => {
      callbacks.onVediCommenti(p);
    });

    riga.querySelector('[data-azione="elimina"]').addEventListener("click", () => {
      callbacks.onElimina(p.id);
    });

    tbody.appendChild(riga);
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
        <th>#</th>
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

  commenti.forEach((c) => {
    const riga = document.createElement("tr");
    riga.innerHTML = `
      <td>${c.id}</td>
      <td class="td-nome">${c.nome}</td>
      <td>${c.email}</td>
      <td class="td-corpo">${c.corpo}</td>
      <td class="td-data">${formattaData(c.creatoIl)}</td>
      <td class="td-azioni">
        <button class="btn-pericolo" data-azione="elimina">Elimina</button>
      </td>
    `;

    riga.querySelector('[data-azione="elimina"]').addEventListener("click", () => {
      callbacks.onElimina(c.id);
    });

    tbody.appendChild(riga);
  });

  contenitore.appendChild(tabella);
}
