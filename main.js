// console.log("main.js baş çalıştı")
import { 
	gameState,
	topBarMap,
	effectEmojis,
	innovations,
	borders,
	countries
} from "./core/data.js";

import { 
  debugAddTime, 
  debugSetState, 
  debugKillGame, 
  debugAddTurns,
  startGame, 
  saveGame,
  loadGame, 
  endGame,
  startPlayingTime,
  setGameSpeed,
  writeStats,
  closeWinMenu
} from "./services/services.js";  

import { 
  updateUI, 
  writeDescriptions, 
  openInnovationMenu, 
  updateInfoButtonPosition 
} from "./ui/ui.js";

import { 
  unlockBar,
  resetBars,
  unlockBtn,
  resetBtn
} from "./core/logic.js"

import { 
  updateRelationsEachTurn, 
  initRelations,
  setWar,
  resetRelations,
  increaseRelation,
  decreaseRelation
} from './services/relations.js';

// ==========================  
// ELEMENTLER & CONSTS
// ==========================  
export const innovateBtn = document.getElementById("innovate-btn");  
const replayBtn = document.getElementById("replay-btn");  
const winBtn = document.getElementById("win-btn");  
const settingsBtn = document.getElementById("settings-btn");  
const setOverlay = document.getElementById("settings-overlay");  
const setClose = document.getElementById("set-close");
const setReset = document.getElementById("set-reset");
const timeButtons = document.querySelectorAll(".time-btn");
const infoOverlay = document.getElementById("info-overlay");
const infoClose = document.getElementById("info-close");
const autoSave = document.getElementById("auto-save");
const eventHandle = document.getElementById("event-handle");
const eventPanel = document.getElementById("event-panel");
const infoLine = document.getElementById("info-line");
const statsBtn = document.getElementById("stats-btn");
const statsOverlay = document.getElementById("stats-overlay");
const statsClose = document.getElementById("stats-close")
export const statsContainer = document.getElementById("stats-text");
export const topBar = document.getElementById("top-bar");  
export const infoBtn = document.getElementById("info-btn");
const BASE_SOUND_PATH = "./assets/sounds/";
const sfxToggleBtn = document.getElementById("sfx-toggle");
const countriesBtn = document.getElementById("countries-btn");
const countriesOverlay = document.getElementById("countries-overlay");
const countriesClose = document.getElementById("countries-close");

// ==========================  
// GLOBAL INTERVAL & LET VARIABLES
// ==========================  
let loopIntervalID = null;
let eventToggle = false;

// ==========================  
// GAME LOOP  
// ==========================  
function gameLoop(on = true) {
  // Önce var olan interval’i temizle
  if (loopIntervalID) {
    clearInterval(loopIntervalID);
    loopIntervalID = null;
  }

  if (!on) return; // kapatmak için
  if (!gameState.gameRunning) return; 

  const loopIntervalTime = 750;

  loopIntervalID = setInterval(() => {
    if (!gameState.gameRunning) return;
    updateUI();
    saveGame();
  }, loopIntervalTime);
}

// ==========================  
// BUTON EVENTLERİ  
// ==========================  

infoBtn.onclick = () => {
  infoOverlay.classList.add("active");
  const dot = infoBtn.querySelector(".notification-dot");
  if (dot) dot.style.display = "none";
};

infoClose.onclick = () => infoOverlay.classList.remove("active");  

innovateBtn.onclick = () => openInnovationMenu();  
replayBtn.onclick = () => startGame();
winBtn.onclick = () => closeWinMenu();
setReset.onclick = () => startGame();

settingsBtn.onclick = () => {
  setOverlay.classList.add("active");
  autoSave.textContent = `Oto Kayıt: ${gameState.autoSave ? "Açık" : "Kapalı"}`;
  sfxToggleBtn.textContent = `Ses Efektleri: ${gameState.muted ? "Kapalı" : "Açık"}`;
}

setClose.onclick = () => {
  setOverlay.classList.remove("active");  
}

statsBtn.onclick = () => {
  setOverlay.classList.remove("active");
  statsOverlay.classList.add("active");
  writeStats()
}

statsClose.onclick = () => {
  setOverlay.classList.add("active");  
  statsOverlay.classList.remove("active");
}

countriesBtn.onclick = () => {
  if (gameState.turns >= 20 && gameState.countriesActive) {
    countriesOverlay.classList.add("active");
  }
}

countriesClose.onclick = () => {
  countriesOverlay.classList.remove("active");  
}

autoSave.onclick = () => {
  gameState.autoSave = !gameState.autoSave;
  autoSave.textContent = `Oto Kayıt: ${gameState.autoSave ? "Açık" : "Kapalı"}`;
  gameLoop(gameState.autoSave);
}

topBar.onclick = () => writeDescriptions();  

timeButtons.forEach(btn => {  
  btn.addEventListener("click", (e) => {  
    e.stopPropagation();  
    timeButtons.forEach(b => b.classList.remove("selected"));  
    btn.classList.add("selected");  
    setGameSpeed(parseInt(btn.dataset.speed));  
    // speed değişirse interval’i yeniden ayarla
    gameLoop(gameState.autoSave);
  });  
});  

sfxToggleBtn.onclick = () => {
  gameState.muted = !gameState.muted;
  sfxToggleBtn.textContent = gameState.muted ? "Ses Efektleri: Kapalı" : "Ses Efektleri: Açık";
}

// Event handle
eventHandle.onclick = () => {
  if (!gameState.gameRunning) return;
  eventToggle = !eventToggle;

  if (eventToggle) {
    eventPanel.classList.add("open");
  } else {
    eventPanel.classList.remove("open");
  }

  playSound(eventHandle.dataset.sound || "click.wav", 0.2);
};

// panel açma fonksiyonu
function openEventPanel() {
  // scrollHeight’e göre yüksekliği belirle
  const targetHeight = eventPanel.scrollHeight;
  eventPanel.style.height = eventPanel.offsetHeight + "px"; // mevcut yüksekliği sabitle

  eventPanel.classList.add("open"); // transform animasyonu başlar

  requestAnimationFrame(() => {
    eventPanel.style.height = targetHeight + "px"; // yükseklik animasyonu
  });
}

// panel kapama fonksiyonu
function closeEventPanel() {
  eventPanel.classList.remove("open"); // ekrandan sağa kay
  // sadece boş paneli küçült
  if (eventPanel.scrollHeight <= 70) {
    eventPanel.style.height = "70px";
  } else {
    // doluysa yükseklik aynı kalsın
    eventPanel.style.height = eventPanel.scrollHeight + "px";
  }
}

// başlangıçta panel boşsa 70px’e set et
eventPanel.style.height = "70px";

// Tüm butonlar
document.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  playSound(btn.dataset.sound || "click.wav", 0.3);
});

// Dinamik olarak border ekle
for (const [id, color] of Object.entries(borders)) {
  const el = document.getElementById(id);
  if (el) el.style.border = `2px solid ${color}`;
}

function playSound(filename, volume = 0.3) {
  if (!filename) return;
  const audio = new Audio(BASE_SOUND_PATH + filename);
  audio.volume = volume;
  if (!gameState.muted) audio.play().catch(() => {}); // tarayıcı engellerse sessizce geç
}


// ==========================  
// WINDOW EVENTS  
// ==========================  
window.debugSetState = debugSetState;  
window.debugKillGame = debugKillGame;  
window.debugAddTime = debugAddTime;  
window.debugAddTurns = debugAddTurns;
window.addEventListener("resize", updateInfoButtonPosition);
// ==========================  
// OYUN BAŞLANGICI  
// ==========================  
updateUI();
updateInfoButtonPosition();
loadGame();
gameLoop(gameState.autoSave); // auto-save durumuna göre başlat
startPlayingTime();
initRelations();
// console.log("main.js son çalıştı")
document.body.classList.add("loading");

const startTime = performance.now();

window.addEventListener("load", () => {
  const loading = document.getElementById("loading-screen");
  if (!loading) return;

  const elapsed = performance.now() - startTime;
  const remaining = Math.max(2000 - elapsed, 0); // en az 1 saniye

  setTimeout(() => {
    loading.classList.add("hidden");
    document.body.classList.remove("loading");
    setTimeout(() => loading.remove(), 300);
  }, remaining);
});

window.addEventListener("DOMContentLoaded", () => {
  if (gameState.turns >= 8) unlockBar("security-bar");
  if (gameState.turns >= 12) unlockBar("burea-bar");
  if (gameState.turns >= 20) unlockBtn("countries-btn");
});

// Örnek: bir butona tıklayınca ilişki artır
