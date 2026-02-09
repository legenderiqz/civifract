import { events, gameState } from "../core/data.js";
import { writeLog, endGame } from "./services.js";
import { checkAuthority, applyPassiveEffects, applyInnovation } from "../core/logic.js";
import { updateUI } from "../ui/ui.js";

// Rastgele olay seç
export function pickRandomEvent() {
  const idx = Math.floor(Math.random() * events.length);
  return events[idx];
}

// Olay paneli elementleri
const panel = document.getElementById("event-panel");
const titleEl = document.getElementById("event-title");
const optionBtns = panel.querySelectorAll(".event-btn");

// Şu anki aktif olay
export let currentEvent = null;

// Olayı göster
export function showEvent(event) {
  if (currentEvent && event) return;

  currentEvent = event || null;

  if (!event) {
    titleEl.textContent = "Aktif bir olay yok...";
    optionBtns.forEach(btn => btn.classList.add("hidden"));
    panel.style.backgroundColor = "#eee";
    animatePanelHeightShrink();
    return;
  }

  const eventColors = [
    "#FFD700", "#FFB347", "#FF6F61",
    "#6FCF97", "#56CCF2", "#F2994A"
  ];

  titleEl.textContent = event.title;
  const randomColor = eventColors[Math.floor(Math.random() * eventColors.length)];
  panel.style.backgroundColor = randomColor;

  event.options.forEach((opt, i) => {
    const btn = optionBtns[i];
    btn.querySelector(".option-text").textContent = opt.text;
    btn.querySelector(".option-effects").textContent = Object.entries(opt.effects)
      .map(([k,v]) => `${k}: ${v>0?'+':''}${v}`)
      .join(" ");

    btn.onclick = () => {
      gameState.lastRandomEventID = null;
      applyInnovation(opt.effects, opt.message);
      applyPassiveEffects();
      checkAuthority();
      updateUI();
      currentEvent = null;
      showEvent(null);
    };

    btn.classList.remove("hidden");
  });

  animatePanelHeightGrow(); // 🔥 artık büyürken de animasyon var
}

function animatePanelHeight() {
  panel.style.height = "auto";
  const target = panel.scrollHeight;
  panel.style.height = target + "px";
}

function animatePanelHeightGrow() {
  const currentHeight = panel.offsetHeight;
  panel.style.height = currentHeight + "px"; // mevcut yüksekliği sabitle

  requestAnimationFrame(() => {
    const targetHeight = panel.scrollHeight;
    panel.style.height = targetHeight + "px"; // animasyonlu büyü
  });
}

function animatePanelHeightShrink() {
  const currentHeight = panel.offsetHeight;
  panel.style.height = currentHeight + "px";

  requestAnimationFrame(() => {
    panel.style.height = "70px"; // boş hal
  });
}