// routes/auth.js — Endpoint di autenticazione
//
// POST /api/auth/registrazione — crea un nuovo utente e restituisce i token
// POST /api/auth/login         — verifica email + password e restituisce i token
// POST /api/auth/refresh       — rinnova l'access token tramite refresh token
// POST /api/auth/logout        — invalida il refresh token

import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { creaUtente, trovaUtentePerEmail } from "../database/queries/utenti.js";
import {
  salvaRefreshToken,
  trovaRefreshToken,
  eliminaRefreshToken,
} from "../database/queries/auth.js";

const router = Router();

// ============================================================
// Helper: firma access token (breve durata)
// ============================================================

function firmaAccessToken(utente) {
  return jwt.sign(
    { id: utente.id, email: utente.email, ruolo: utente.ruolo },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
}

// ============================================================
// Helper: firma refresh token e lo salva nel DB
// ============================================================

async function firmaEsalvaRefreshToken(utente) {
  const token = jwt.sign(
    { id: utente.id },
    process.env.REFRESH_SECRET,
    { expiresIn: process.env.REFRESH_EXPIRES_IN }
  );
  // Calcola la data di scadenza da salvare nel DB
  const scadeIl = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 giorni
  await salvaRefreshToken(token, utente.id, scadeIl);
  return token;
}

// ============================================================
// POST /api/auth/registrazione
// ============================================================

router.post("/registrazione", async (req, res) => {
  try {
    const { nome, email, citta, codiceFiscale, sesso, dataNascita, telefono, password } = req.body;

    if (!nome || !email || !codiceFiscale || !sesso || !password) {
      return res.status(400).json({
        errore: "I campi 'nome', 'email', 'codiceFiscale', 'sesso' e 'password' sono obbligatori",
      });
    }
    if (password.length < 8) {
      return res.status(400).json({ errore: "La password deve essere di almeno 8 caratteri" });
    }

    const utente = await creaUtente({ nome, email, citta, codiceFiscale, sesso, dataNascita, telefono, password });
    const accessToken = firmaAccessToken(utente);
    const refreshToken = await firmaEsalvaRefreshToken(utente);

    res.status(201).json({ accessToken, refreshToken, utente });
  } catch (errore) {
    console.error("Errore POST /api/auth/registrazione:", errore);
    res.status(500).json({ errore: "Errore interno del server" });
  }
});

// ============================================================
// POST /api/auth/login
// ============================================================

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ errore: "Email e password sono obbligatorie" });
    }

    const utente = await trovaUtentePerEmail(email);
    if (!utente) {
      return res.status(401).json({ errore: "Credenziali non valide" });
    }

    const valida = await bcrypt.compare(password, utente.password);
    if (!valida) {
      return res.status(401).json({ errore: "Credenziali non valide" });
    }

    const accessToken = firmaAccessToken(utente);
    const refreshToken = await firmaEsalvaRefreshToken(utente);

    res.json({
      accessToken,
      refreshToken,
      utente: { id: utente.id, nome: utente.nome, email: utente.email, ruolo: utente.ruolo },
    });
  } catch (errore) {
    console.error("Errore POST /api/auth/login:", errore);
    res.status(500).json({ errore: "Errore interno del server" });
  }
});

// ============================================================
// POST /api/auth/refresh — Rinnova l'access token
// ============================================================

router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ errore: "Refresh token mancante" });
    }

    // Verifica firma JWT
    let payload;
    try {
      payload = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    } catch {
      return res.status(401).json({ errore: "Refresh token non valido" });
    }

    // Verifica che esista nel DB (non sia stato revocato)
    const record = await trovaRefreshToken(refreshToken);
    if (!record) {
      return res.status(401).json({ errore: "Refresh token scaduto o revocato" });
    }

    // Emette nuovo access token
    const accessToken = jwt.sign(
      { id: payload.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({ accessToken });
  } catch (errore) {
    console.error("Errore POST /api/auth/refresh:", errore);
    res.status(500).json({ errore: "Errore interno del server" });
  }
});

// ============================================================
// POST /api/auth/logout — Invalida il refresh token
// ============================================================

router.post("/logout", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await eliminaRefreshToken(refreshToken);
    }
    res.json({ messaggio: "Logout effettuato" });
  } catch (errore) {
    console.error("Errore POST /api/auth/logout:", errore);
    res.status(500).json({ errore: "Errore interno del server" });
  }
});

export default router;
