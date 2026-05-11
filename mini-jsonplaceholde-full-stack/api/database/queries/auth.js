// database/queries/auth.js — Query per i refresh token

import pool from "../connessione.js";

export async function salvaRefreshToken(token, userId, scadeIl) {
  await pool.query(
    "INSERT INTO refresh_tokens (token, userId, scadeIl) VALUES (?, ?, ?)",
    [token, userId, scadeIl]
  );
}

export async function trovaRefreshToken(token) {
  const [righe] = await pool.query(
    "SELECT * FROM refresh_tokens WHERE token = ? AND scadeIl > NOW()",
    [token]
  );
  return righe[0];
}

export async function eliminaRefreshToken(token) {
  await pool.query("DELETE FROM refresh_tokens WHERE token = ?", [token]);
}
