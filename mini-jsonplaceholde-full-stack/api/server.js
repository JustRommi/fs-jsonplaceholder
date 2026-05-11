// server.js — Entry point del Mini JSONPlaceholder
// Versione aggiornata con supporto MySQL

import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import routeUtenti from "./routes/utenti.js";
import routePost from "./routes/post.js";
import routeCommenti from "./routes/commenti.js";
import routeAuth from "./routes/auth.js";

const app = express();
const PORT = 3000;

// ============================================================
// Middleware globali
// ============================================================

// Imposta header HTTP di sicurezza (anti-clickjacking, anti-sniffing, ecc.)
app.use(helmet());

// Permette le richieste solo dal frontend — non più da qualsiasi origine
app.use(cors({ origin: process.env.CORS_ORIGIN }));

// Max 5 tentativi di login ogni 15 minuti — difesa brute force
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { errore: "Troppi tentativi, riprova tra 15 minuti" },
});
app.use("/api/auth/login", loginLimiter);

// Parsa automaticamente il body JSON delle richieste
app.use(express.json({ limit: "10mb" }));

// Mini logger: stampa ogni richiesta nel terminale
app.use((req, res, next) => {
    const ora = new Date().toLocaleTimeString("it-IT");
    console.log(`[${ora}] ${req.method} ${req.url}`);
    next();
});

// ============================================================
// Montaggio delle route
// ============================================================

// Ogni file in routes/ gestisce un gruppo di endpoint.
// app.use("/prefisso", router) dice a Express:
//   "tutte le route definite in questo router partono da /prefisso"
//
// Quindi se in utenti.js definiamo router.get("/", ...)
// l'endpoint completo sarà GET /api/utenti
//
// E se definiamo router.get("/:id", ...)
// l'endpoint completo sarà GET /api/utenti/:id

app.use("/api/auth", routeAuth);
app.use("/api/utenti", routeUtenti);
app.use("/api/post", routePost);
app.use("/api/commenti", routeCommenti);

// ============================================================
// Route di benvenuto (home page)
// ============================================================

app.get("/", (req, res) => {
    res.json({
        messaggio: "Benvenuto nel Mini JSONPlaceholder! 🚀",
        endpoint: {
            utenti: "/api/utenti",
            post: "/api/post",
            commenti: "/api/commenti"
        },
        suggerimento: "Usa Thunder Client o la console del browser per testare le API"
    });
});

// ============================================================
// Avvio del server
// ============================================================

app.listen(PORT, () => {
    console.log("╔══════════════════════════════════════════╗");
    console.log("║   🚀 Mini JSONPlaceholder avviato!       ║");
    console.log(`║   http://localhost:${PORT}                  ║`);
    console.log("╠══════════════════════════════════════════╣");
    console.log("║   Endpoint:                              ║");
    console.log("║   GET /api/utenti                        ║");
    console.log("║   GET /api/post                          ║");
    console.log("║   GET /api/commenti                      ║");
    console.log("╚══════════════════════════════════════════╝");
    console.log("");
});
