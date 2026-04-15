// database/queries/post.js — Query SQL per la risorsa Post
//
// Stessa struttura di queries/utenti.js — ogni funzione esegue una query SQL.

import pool from "../connessione.js";

// ============================================================
// SELECT — Lettura
// ============================================================

/**
 * Restituisce tutti i post. Se viene passato un userId, filtra per quello.
 *
 * SQL senza filtro:  SELECT * FROM post
 * SQL con filtro:    SELECT * FROM post WHERE userId = ?
 */
export async function trovaPost(userId, pagina, limite) {
  // Costruisci la WHERE clause
  const whereClause = userId ? "WHERE userId = ?" : "";
  const whereValori = userId ? [userId] : [];

  // Se arrivano pagina e limite → paginazione
  if (pagina && limite) {
    const offset = (pagina - 1) * limite;

    const [righe] = await pool.query(
      `SELECT * FROM post ${whereClause} LIMIT ? OFFSET ?`,
      [...whereValori, limite, offset],
    );

    const [[{ totale }]] = await pool.query(
      `SELECT COUNT(*) as totale FROM post ${whereClause}`,
      whereValori,
    );

    return {
      dati: righe,
      meta: {
        pagina,
        limite,
        totale,
        pagine: Math.ceil(totale / limite),
      },
    };
  }

  // Senza paginazione → comportamento originale
  const [righe] = await pool.query(
    `SELECT * FROM post ${whereClause}`,
    whereValori,
  );
  return righe;
}

/**
 * Cerca un singolo post per ID.
 *
 * SQL: SELECT * FROM post WHERE id = ?
 */
export async function trovaPostPerId(id) {
  const [righe] = await pool.query("SELECT * FROM post WHERE id = ?", [id]);
  return righe[0];
}

// ============================================================
// INSERT — Creazione
// ============================================================

/**
 * Crea un nuovo post nel database.
 *
 * SQL: INSERT INTO post (userId, titolo, corpo) VALUES (?, ?, ?)
 */
export async function creaPost({ userId, titolo, corpo }) {
  const [risultato] = await pool.query(
    "INSERT INTO post (userId, titolo, corpo) VALUES (?, ?, ?)",
    [userId, titolo, corpo],
  );

  return { id: risultato.insertId, userId, titolo, corpo };
}

// ============================================================
// UPDATE — Modifica
// ============================================================

/**
 * Sostituisce completamente un post (PUT).
 *
 * SQL: UPDATE post SET userId = ?, titolo = ?, corpo = ? WHERE id = ?
 */
export async function sostituisciPost(id, { userId, titolo, corpo }) {
  const [risultato] = await pool.query(
    "UPDATE post SET userId = ?, titolo = ?, corpo = ? WHERE id = ?",
    [userId, titolo, corpo, id],
  );

  if (risultato.affectedRows === 0) return null;
  return { id, userId, titolo, corpo };
}

/**
 * Aggiorna parzialmente un post (PATCH).
 *
 * SQL dinamico: UPDATE post SET <campo> = ?, ... WHERE id = ?
 */
export async function aggiornaPost(id, dati) {
  const campiPermessi = ["userId", "titolo", "corpo"];
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
    await pool.query(
      `UPDATE post SET ${aggiornamenti.join(", ")} WHERE id = ?`,
      valori,
    );
  }

  return trovaPostPerId(id);
}

// ============================================================
// DELETE — Eliminazione
// ============================================================

/**
 * Elimina un post per ID.
 *
 * SQL: DELETE FROM post WHERE id = ?
 */
export async function eliminaPost(id) {
  const post = await trovaPostPerId(id);
  if (!post) return null;

  await pool.query("DELETE FROM post WHERE id = ?", [id]);
  return post;
}
