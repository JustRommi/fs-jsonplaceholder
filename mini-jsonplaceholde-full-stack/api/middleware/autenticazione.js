// middleware/autenticazione.js — Verifica il token JWT
//
// Un middleware Express è una funzione (req, res, next) che viene eseguita
// prima dell'handler finale. Può:
//   - chiamare next()         → passa al prossimo middleware/handler
//   - rispondere con res.json → blocca la catena
//
// Perché 401 e non 403?
//   401 = "non so chi sei" (token mancante o non valido)
//   403 = "so chi sei ma non puoi farlo" (ruolo insufficiente — Es. 12)

import jwt from "jsonwebtoken";

export function richiediAutenticazione(req, res, next) {
  const header = req.headers.authorization;

  // Il token deve arrivare nell'header: Authorization: Bearer <token>
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ errore: "Token mancante" });
  }

  const token = header.slice(7); // rimuove "Bearer "

  try {
    // jwt.verify controlla firma + scadenza. Lancia eccezione se non valido.
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.utente = payload; // { id, email, iat, exp } — disponibile negli handler successivi
    next();
  } catch {
    return res.status(401).json({ errore: "Token non valido o scaduto" });
  }
}

export function richiediRuolo(...ruoli) {
  return (req, res, next) => {
    if (!ruoli.includes(req.utente.ruolo))
      return res.status(403).json({ errore: "Permessi insufficienti" });
    next();
  };
}
