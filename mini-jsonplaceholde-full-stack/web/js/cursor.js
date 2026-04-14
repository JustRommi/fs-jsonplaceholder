// cursor.js — Cursore personalizzato con particelle

const cursore = document.createElement("div");
cursore.id = "cursore-kuromi";
cursore.textContent = "🩸";
document.body.appendChild(cursore);

let SIMBOLI = ["⚡", "✦", "✧", "⋆", "△", "╋", "◈", "·", "×", "◆"];
let COLORI   = ["#c41e3a", "#ff2244", "#8b0000", "#ff6666", "#ffffff"];

// Espone funzione per il tema-switcher
window.aggiornaCursore = function(icona, simboli, colori) {
  cursore.textContent = icona;
  SIMBOLI = simboli;
  COLORI  = colori;
};

document.addEventListener("mousemove", (e) => {
  cursore.style.left = e.clientX + "px";
  cursore.style.top  = e.clientY + "px";
  creaParticella(e.clientX, e.clientY);
});

document.addEventListener("click", (e) => {
  for (let i = 0; i < 10; i++) creaParticella(e.clientX, e.clientY, true);
});

function creaParticella(x, y, burst = false) {
  if (!burst && Math.random() > 0.35) return;

  const el = document.createElement("div");
  el.className = "scintilla-kuromi";
  el.textContent = SIMBOLI[Math.floor(Math.random() * SIMBOLI.length)];
  el.style.color    = COLORI[Math.floor(Math.random() * COLORI.length)];
  el.style.left     = x + "px";
  el.style.top      = y + "px";
  el.style.fontSize = (burst ? 0.6 + Math.random() * 0.9 : 0.4 + Math.random() * 0.5) + "rem";
  el.style.fontWeight = "bold";

  const angle = Math.random() * Math.PI * 2;
  const dist  = burst ? 40 + Math.random() * 60 : 15 + Math.random() * 35;
  el.style.setProperty("--dx", Math.cos(angle) * dist + "px");
  el.style.setProperty("--dy", Math.sin(angle) * dist + "px");

  document.body.appendChild(el);
  setTimeout(() => el.remove(), burst ? 800 : 600);
}
