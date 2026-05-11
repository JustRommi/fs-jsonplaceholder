// scripts/genera-hash.js — Genera hash bcrypt per il seed
// Esegui con: node scripts/genera-hash.js
// Copia l'output nel seed.sql

import bcrypt from "bcrypt";

const hash = await bcrypt.hash("password123", 10);
console.log("Hash per 'password123':");
console.log(hash);
