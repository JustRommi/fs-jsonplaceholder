// composables/useApi.js — Wrapper fetch verso l'API Express
// Migrazione di js/api.js al formato composable Nuxt 3

const BASE_URL = "http://localhost:3000/api";

async function rinnovaToken() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return false;
  try {
    const risposta = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!risposta.ok) return false;
    const { accessToken } = await risposta.json();
    localStorage.setItem("token", accessToken);
    return true;
  } catch {
    return false;
  }
}

async function chiamataApi(percorso, opzioni = {}, _retry = false) {
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const risposta = await fetch(`${BASE_URL}${percorso}`, { ...opzioni, headers });
  const dati = await risposta.json();

  if (risposta.status === 401 && !_retry) {
    const rinnovato = await rinnovaToken();
    if (rinnovato) return chiamataApi(percorso, opzioni, true);
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("utente");
    window.location.reload();
    return;
  }

  if (!risposta.ok) {
    const errore = new Error(dati.errore || "Errore sconosciuto");
    errore.status = risposta.status;
    throw errore;
  }

  return dati;
}

export function useApi() {
  // Auth
  const login = (email, password) =>
    chiamataApi("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });

  const logout = (refreshToken) =>
    chiamataApi("/auth/logout", { method: "POST", body: JSON.stringify({ refreshToken }) });

  // Utenti
  const ottieniUtenti = () => chiamataApi("/utenti");

  const creaUtente = (dati) =>
    chiamataApi("/utenti", { method: "POST", body: JSON.stringify(dati) });

  const modificaUtente = (id, dati) =>
    chiamataApi(`/utenti/${id}`, { method: "PUT", body: JSON.stringify(dati) });

  const eliminaUtente = (id) =>
    chiamataApi(`/utenti/${id}`, { method: "DELETE" });

  // Post
  const ottieniPost = (userId, pagina, limite) => {
    const params = new URLSearchParams();
    if (userId) params.append("userId", userId);
    if (pagina) params.append("pagina", pagina);
    if (limite) params.append("limite", limite);
    const query = params.toString() ? `?${params.toString()}` : "";
    return chiamataApi(`/post${query}`);
  };

  const creaPost = (dati) =>
    chiamataApi("/post", { method: "POST", body: JSON.stringify(dati) });

  const eliminaPost = (id) =>
    chiamataApi(`/post/${id}`, { method: "DELETE" });

  // Commenti
  const ottieniCommenti = (postId) => {
    const query = postId ? `?postId=${postId}` : "";
    return chiamataApi(`/commenti${query}`);
  };

  const creaCommento = (dati) =>
    chiamataApi("/commenti", { method: "POST", body: JSON.stringify(dati) });

  const eliminaCommento = (id) =>
    chiamataApi(`/commenti/${id}`, { method: "DELETE" });

  return {
    login, logout,
    ottieniUtenti, creaUtente, modificaUtente, eliminaUtente,
    ottieniPost, creaPost, eliminaPost,
    ottieniCommenti, creaCommento, eliminaCommento,
  };
}
