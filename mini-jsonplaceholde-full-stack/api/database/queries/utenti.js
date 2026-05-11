// database/queries/utenti.js — Query SQL per la risorsa Utenti

import pool from "../connessione.js";
import bcrypt from "bcrypt";

const CAMPI_PUBBLICI =
  "id, nome, email, citta, codiceFiscale, sesso, dataNascita, telefono, avatar, creatoIl";

export async function trovaUtenti(citta) {
  if (citta) {
    const [righe] = await pool.query(
      `SELECT ${CAMPI_PUBBLICI} FROM utenti WHERE LOWER(citta) = LOWER(?)`,
      [citta],
    );
    return righe;
  }
  const [righe] = await pool.query(`SELECT ${CAMPI_PUBBLICI} FROM utenti`);
  return righe;
}

export async function trovaUtentePerId(id) {
  const [righe] = await pool.query(
    `SELECT ${CAMPI_PUBBLICI} FROM utenti WHERE id = ?`,
    [id],
  );
  return righe[0];
}

export async function creaUtente({
  nome, email, citta, codiceFiscale, sesso, dataNascita, telefono, password, avatar,
}) {
  const hash = await bcrypt.hash(password, 10);
  const [risultato] = await pool.query(
    "INSERT INTO utenti (nome, email, citta, codiceFiscale, sesso, dataNascita, telefono, password, avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [nome, email, citta || "", codiceFiscale, sesso, dataNascita || null, telefono || null, hash, avatar || null],
  );
  return {
    id: risultato.insertId, nome, email,
    citta: citta || "", codiceFiscale, sesso,
    dataNascita: dataNascita || null, telefono: telefono || null, avatar: avatar || null,
  };
}

export async function sostituisciUtente(
  id,
  { nome, email, citta, codiceFiscale, sesso, dataNascita, telefono, avatar },
) {
  const [risultato] = await pool.query(
    "UPDATE utenti SET nome=?, email=?, citta=?, codiceFiscale=?, sesso=?, dataNascita=?, telefono=?, avatar=? WHERE id=?",
    [nome, email, citta || "", codiceFiscale, sesso, dataNascita || null, telefono || null, avatar || null, id],
  );
  if (risultato.affectedRows === 0) return null;
  return { id, nome, email, citta: citta || "", codiceFiscale, sesso, dataNascita, telefono, avatar: avatar || null };
}

export async function aggiornaUtente(id, dati) {
  const campiPermessi = ["nome", "email", "citta", "codiceFiscale", "sesso", "dataNascita", "telefono", "avatar"];
  const aggiornamenti = [];
  const valori = [];
  for (const campo of campiPermessi) {
    if (dati[campo] !== undefined) {
      aggiornamenti.push(`${campo} = ?`);
      valori.push(dati[campo]);
    }
  }
  if (aggiornamenti.length > 0) {
    valori.push(id);
    await pool.query(`UPDATE utenti SET ${aggiornamenti.join(", ")} WHERE id = ?`, valori);
  }
  return trovaUtentePerId(id);
}

export async function trovaUtentePerEmail(email) {
  const [righe] = await pool.query(
    "SELECT id, nome, email, password, ruolo FROM utenti WHERE email = ?",
    [email],
  );
  return righe[0];
}

export async function eliminaUtente(id) {
  const utente = await trovaUtentePerId(id);
  if (!utente) return null;
  await pool.query("DELETE FROM utenti WHERE id = ?", [id]);
  return utente;
}
