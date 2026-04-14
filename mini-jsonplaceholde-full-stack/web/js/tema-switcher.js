// tema-switcher.js — Switcher temi anime

const TEMI = {
  jjk: {
    nome: "Jujutsu Kaisen",
    icona: "⚡",
    sfondo: "https://wallpapercave.com/wp/wp14267766.jpg",
    overlay: ["rgba(8,0,0,0.70)", "rgba(8,0,0,0.50)", "rgba(8,0,0,0.75)"],
    css: {
      "--colore-primario":        "#c41e3a",
      "--colore-primario-scuro":  "#8b0000",
      "--colore-pericolo":        "#ff4444",
      "--colore-pericolo-scuro":  "#cc0000",
      "--colore-sfondo":          "#080808",
      "--colore-card":            "rgba(10, 5, 5, 0.82)",
      "--colore-bordo":           "rgba(196, 30, 58, 0.35)",
      "--colore-testo":           "#f0e6e6",
      "--colore-testo-chiaro":    "#a89090",
      "--ombra":                  "0 2px 16px rgba(196, 30, 58, 0.25)",
    },
    fontTitoli: "oswald",
    emoji: ["⚡", "🩸", "🩸", "⚡", "👁️"],
    cursore: {
      icona:   "🩸",
      simboli: ["⚡", "✦", "✧", "⋆", "△", "╋", "◈", "·", "×", "◆"],
      colori:  ["#c41e3a", "#ff2244", "#8b0000", "#ff6666", "#ffffff"],
    },
  },

  onepiece: {
    nome: "One Piece",
    icona: "⚓",
    sfondo: "img/sfondo-onepiece.avif",
    overlay: ["rgba(0,10,30,0.60)", "rgba(0,10,30,0.40)", "rgba(0,10,30,0.65)"],
    bgSize: "cover",
    bgPos: "center center",
    css: {
      "--colore-primario":        "#d4890a",
      "--colore-primario-scuro":  "#a36200",
      "--colore-pericolo":        "#e84545",
      "--colore-pericolo-scuro":  "#c02020",
      "--colore-sfondo":          "#00060f",
      "--colore-card":            "rgba(5, 10, 25, 0.82)",
      "--colore-bordo":           "rgba(212, 137, 10, 0.40)",
      "--colore-testo":           "#fff5e0",
      "--colore-testo-chiaro":    "#c8a96e",
      "--ombra":                  "0 2px 16px rgba(212, 137, 10, 0.25)",
    },
    fontTitoli: "oswald",
    emoji: ["⚓", "🏴‍☠️", "⚓", "🏴‍☠️", "🌊"],
    cursore: {
      icona:   "⚓",
      simboli: ["⚓", "✦", "⋆", "★", "·", "×", "◆", "🌊"],
      colori:  ["#d4890a", "#ffd700", "#ff8c00", "#ffffff", "#e8c56a"],
    },
  },

  naruto: {
    nome: "Naruto",
    icona: "🍃",
    sfondo: "img/sfondo-naruto.jpg",
    overlay: ["rgba(10,5,0,0.55)", "rgba(10,5,0,0.35)", "rgba(10,5,0,0.60)"],
    bgSize: "cover",
    bgPos: "center center",
    css: {
      "--colore-primario":        "#e85d04",
      "--colore-primario-scuro":  "#c44b00",
      "--colore-pericolo":        "#dc2626",
      "--colore-pericolo-scuro":  "#b91c1c",
      "--colore-sfondo":          "#0a0500",
      "--colore-card":            "rgba(10, 8, 0, 0.82)",
      "--colore-bordo":           "rgba(232, 93, 4, 0.35)",
      "--colore-testo":           "#fff3e0",
      "--colore-testo-chiaro":    "#c4956a",
      "--ombra":                  "0 2px 16px rgba(232, 93, 4, 0.25)",
    },
    fontTitoli: "oswald",
    emoji: ["🍃", "🌀", "🍃", "⚡", "🌀"],
    cursore: {
      icona:   "🍃",
      simboli: ["⚡", "✦", "✧", "⋆", "·", "×", "🍃", "🌀"],
      colori:  ["#e85d04", "#ff8c00", "#ffd700", "#ffffff", "#ff6600"],
    },
  },

  kuromi: {
    nome: "Kuromi",
    icona: "🖤",
    sfondo: "img/sfondo-kuromi.jpg",
    overlay: ["rgba(10,0,20,0.45)", "rgba(10,0,20,0.30)", "rgba(10,0,20,0.50)"],
    bgSize: "cover",
    bgPos: "center center",
    css: {
      "--colore-primario":        "#9b5de5",
      "--colore-primario-scuro":  "#7c3aed",
      "--colore-pericolo":        "#f72585",
      "--colore-pericolo-scuro":  "#c9184a",
      "--colore-sfondo":          "#0d0d0d",
      "--colore-card":            "rgba(26, 10, 46, 0.82)",
      "--colore-bordo":           "rgba(155, 93, 229, 0.35)",
      "--colore-testo":           "#f8f0ff",
      "--colore-testo-chiaro":    "#c4b5fd",
      "--ombra":                  "0 2px 16px rgba(155, 93, 229, 0.25)",
    },
    fontTitoli: "nunito",
    emoji: ["🖤", "💜", "💀", "💜", "🌙"],
    cursore: {
      icona:   "🖤",
      simboli: ["✦", "✧", "⋆", "★", "·", "💜", "🌟"],
      colori:  ["#9b5de5", "#c77dff", "#f72585", "#ffffff", "#e0aaff"],
    },
  },

  hellokitty: {
    nome: "Hello Kitty",
    icona: "🎀",
    sfondo: "https://wallpapercave.com/wp/wp14556437.jpg",
    overlay: ["rgba(20,0,15,0.60)", "rgba(20,0,15,0.40)", "rgba(20,0,15,0.65)"],
    css: {
      "--colore-primario":        "#ff69b4",
      "--colore-primario-scuro":  "#e91e8c",
      "--colore-pericolo":        "#ff1493",
      "--colore-pericolo-scuro":  "#c71585",
      "--colore-sfondo":          "#1a000f",
      "--colore-card":            "rgba(30, 0, 20, 0.78)",
      "--colore-bordo":           "rgba(255, 105, 180, 0.40)",
      "--colore-testo":           "#fff0f8",
      "--colore-testo-chiaro":    "#ffb3d9",
      "--ombra":                  "0 2px 16px rgba(255, 105, 180, 0.30)",
    },
    fontTitoli: "nunito",
    emoji: ["🎀", "💗", "🎀", "🌸", "💗"],
    cursore: {
      icona:   "🎀",
      simboli: ["✦", "✧", "⋆", "★", "·", "🌸", "💗"],
      colori:  ["#ff69b4", "#ff1493", "#ffb6c1", "#ffffff", "#ff85c8"],
    },
  },

  hxh: {
    nome: "Hunter × Hunter",
    icona: "⚡",
    sfondo: "https://wallpapercave.com/wp/wp14491168.jpg",
    overlay: ["rgba(5,0,15,0.60)", "rgba(5,0,15,0.40)", "rgba(5,0,15,0.65)"],
    bgSize: "contain",
    bgPos: "center center",
    css: {
      "--colore-primario":        "#7b2fbe",
      "--colore-primario-scuro":  "#5c1a99",
      "--colore-pericolo":        "#e63946",
      "--colore-pericolo-scuro":  "#c1121f",
      "--colore-sfondo":          "#05000f",
      "--colore-card":            "rgba(5, 5, 20, 0.82)",
      "--colore-bordo":           "rgba(123, 47, 190, 0.35)",
      "--colore-testo":           "#f0eaff",
      "--colore-testo-chiaro":    "#a78bca",
      "--ombra":                  "0 2px 16px rgba(123, 47, 190, 0.25)",
    },
    fontTitoli: "oswald",
    emoji: ["⚡", "🎯", "⚡", "🎯", "💜"],
    cursore: {
      icona:   "⚡",
      simboli: ["⚡", "✦", "✧", "⋆", "·", "×", "◆", "🎯"],
      colori:  ["#7b2fbe", "#a855f7", "#ffd700", "#ffffff", "#c084fc"],
    },
  },
};

// ============================================================
// Applica tema
// ============================================================

function applicaTema(id) {
  const tema = TEMI[id];
  if (!tema) return;

  // 1. Variabili CSS
  const root = document.documentElement;
  for (const [prop, val] of Object.entries(tema.css)) {
    root.style.setProperty(prop, val);
  }

  // 2. Sfondo body
  const [c1, c2, c3] = tema.overlay;
  document.body.style.backgroundImage = `
    linear-gradient(to bottom, ${c1} 0%, ${c2} 40%, ${c3} 100%),
    url('${tema.sfondo}')
  `;
  document.body.style.backgroundSize    = tema.bgSize    || "cover";
  document.body.style.backgroundPosition = tema.bgPos   || "center top";

  // 3. Emoji titoli [h1-sx, h1-dx, utenti, post, commenti]
  const emojis = document.querySelectorAll(".emoji-kuromi");
  tema.emoji.forEach((e, i) => { if (emojis[i]) emojis[i].textContent = e; });

  // 4. Font titoli
  document.body.setAttribute("data-tema-font", tema.fontTitoli);

  // 5. Cursore
  if (window.aggiornaCursore) {
    window.aggiornaCursore(tema.cursore.icona, tema.cursore.simboli, tema.cursore.colori);
  }

  // 6. Bottone attivo nel popup
  document.querySelectorAll(".tema-opzione").forEach(btn => {
    btn.classList.toggle("tema-attivo", btn.dataset.tema === id);
  });

  // 7. Salva preferenza
  localStorage.setItem("tema-selezionato", id);
}

// ============================================================
// Crea UI switcher
// ============================================================

function creaUI() {
  const wrapper = document.createElement("div");
  wrapper.id = "tema-switcher";
  wrapper.innerHTML = `
    <button id="tema-btn">🎨 Tema</button>
    <div id="tema-popup" class="nascosta">
      ${Object.entries(TEMI).map(([id, t]) =>
        `<button class="tema-opzione" data-tema="${id}">${t.icona} ${t.nome}</button>`
      ).join("")}
    </div>
  `;
  document.body.appendChild(wrapper);

  document.getElementById("tema-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    document.getElementById("tema-popup").classList.toggle("nascosta");
  });

  document.addEventListener("click", () => {
    document.getElementById("tema-popup")?.classList.add("nascosta");
  });

  wrapper.querySelectorAll(".tema-opzione").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      applicaTema(btn.dataset.tema);
      document.getElementById("tema-popup").classList.add("nascosta");
    });
  });
}

// ============================================================
// Avvio
// ============================================================

creaUI();
const temaIniziale = localStorage.getItem("tema-selezionato") || "jjk";
applicaTema(temaIniziale);
