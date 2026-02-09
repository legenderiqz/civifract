import {
  gameState,
  setGameState,
  resetGameState,
  defaultInfoText,
  startResources,
  resourceChangeCount
} from "../core/data.js";

import {
  updateUI,
  updateInfoButtonPosition,
} from "../ui/ui.js";

import {
  randomEvent,
  checkAuthority,
  checkTurns,
  resetBars,
  lockBar,
  unlockBar,
  resetBtn,
  lockBtn,
  unlockBtn
} from "../core/logic.js";

import { showEvent } from "./events.js";

import { statsContainer } from "../main.js";

import { updateRelationsEachTurn, resetRelations } from "./relations.js"

let resources = {
    "Otorite": "authority",
    "Mutluluk": "happy",
    "Ekonomi": "economy",
    "Nüfus": "population",
    "Güvenlik": "security",
    "Bürokrasi": "bureaucracy"
  }
  
// ==========================  
// LOG + STORAGE + UI SUPPORT  
// ==========================  
let maxLogs = 6;

// Log yaz
export function writeLog(text, color = "black") {
  gameState.logs.push({ id: gameState.logID, text, color });
  if (gameState.logs.length > maxLogs) gameState.logs.shift();
  
  document.getElementById("log-panel").innerHTML =
    gameState.logs.map(l => `<div style="color:${l.color}">[${l.id}] ${l.text}</div>`).join("");
  
  gameState.logID++;
}

// Info'ya metin ekle
export function appendInfoLine(text) {
  const infos = document.getElementById("infos");
  const lineDiv = document.createElement("div");
  lineDiv.innerHTML = text;
  infos.appendChild(lineDiv);
  infos.appendChild(document.createElement("hr"));
  infos.scrollTop = infos.scrollHeight;
}

// Info kırmızı baloncuğunu göster
export function showInfoNotification() {
  const dot = document.querySelector("#info-btn .notification-dot");
  if (dot) dot.style.display = "inline-block";
}

// Oyunu kaydet
export function saveGame() {
  localStorage.setItem("civGameState", JSON.stringify(gameState));
} 

// Oyunu yükle 
export function loadGame() {
  const saved = localStorage.getItem("civGameState");
  if (saved) {
    setGameState(JSON.parse(saved));
    
    if (!gameState.gameRunning) {
      gameState.gameRunning = true;
      startGame();
      return;
    }
    // Paneli resetle
    document.getElementById("infos").innerHTML = defaultInfoText;
    
    // Flag’leri oyun durumuna göre ayarla
    gameState.securityActive = false;
    gameState.bureaActive = false;
    // Oyunun mevcut turuna göre paneli tekrar ekle
    
    
    if (gameState.lastInnovationDate === gameState.date) {
      document.getElementById("innovate-btn").style.backgroundColor = "#ACACAC";
    }
    
    if (gameState.lastRandomEventID) {
      showEvent(gameState.lastRandomEventID)
    }
    
    gameState.gameSpeed = 0;
    if (gameState.loseCount == null) gameState.loseCount = 0;
    if (gameState.playingTime == null) gameState.playingTime = 0;
    if (gameState.muted == null) gameState.muted = false;
    if (gameState.autoSave == null) gameState.autoSave = true;
    writeLog("Yönetim kaldığı yerden devam ediyor.");
  }
  resetBars();
  resetBtn();
  checkTurns();
  updateUI();
}


// Tarihi arttır ve güncelle
export function updateDate() {
  gameState.month++;
  if (gameState.month > 12) {
    gameState.month = 1;
    gameState.year++;
  } // Yıl arttırma  
  if (gameState.month <= 0) {
    gameState.year += Math.floor((gameState.month - 1) / 12);
    gameState.month = ((gameState.month - 1) % 12 + 12) % 12 + 1;
  } // Eksiye düşme önlemi  
  
  gameState.date = `${String(gameState.month).padStart(2, "0")}.${gameState.year}`;
  document.getElementById("date-text").textContent = gameState.descriptionToggle ? `Tarih: ${gameState.date}` : gameState.date;
  if (gameState.lastInnovationDate !== gameState.date) document.getElementById("innovate-btn").style.backgroundColor = "#7CC385";
  if (gameState.lastInnovationYear <= gameState.year && gameState.lastInnovationMonth == gameState.month) noInnovationDecrease();
  randomEvent();
  
  if (gameState.year >= 2046 && !gameState.winGame) {
    winGame();
  }
}

// Otomatik zaman akışı
export let intervalID = null;
export function startTimeFlow() {
  if (intervalID) {
    clearInterval(intervalID);
    intervalID = null;
  }
  if (gameState.gameSpeed === 0) return;
  
  const intervalTime = gameState.gameSpeed === 1 ? 1500 : 750;
  
  intervalID = setInterval(() => {
    if (!gameState.gameRunning) return;
    updateUI();
    updateDate();
  }, intervalTime);
}

// Oyun hızı ayarla
export function setGameSpeed(speed) {
  gameState.gameSpeed = speed;
  startTimeFlow();
}

// Oyunu başlat
export function startGame() {
  resetGameState();

  gameState.logs = [];
  gameState.securityActive = false;
  gameState.bureaActive = false;
  lockBar("security-bar");
  lockBar("burea-bar");
  lockBtn("countries-btn")
  
  document.getElementById("innovation-overlay").classList.remove("active");
  document.getElementById("replay-menu").classList.remove("active");
  document.getElementById("infos").innerHTML = defaultInfoText;

  const timeButtons = document.querySelectorAll(".time-btn");
  timeButtons.forEach(b => b.classList.remove("selected"));
  const timeStopBtn = document.getElementById("time-stop");
  timeStopBtn.classList.add("selected");
  gameState.gameSpeed = parseInt(timeStopBtn.dataset.speed);
  startTimeFlow();

  Object.keys(startResources).forEach(key => {
    resourceChangeCount[key] = 0;
    updateUIColor(key, 0);
  });

  writeLog("Yeni bir lider seçildi.");
  updateInfoButtonPosition();
  gameState.gameRunning = true;
  resetRelations();
  resetBars();
  resetBtn();
  checkTurns();
  updateUI();
}

// Oyunu bitir
export function endGame(reason) {
  clearInterval(intervalID);
  intervalID = null;
  writeLog(reason, "darkred");
  document.getElementById("replay-menu").classList.add("active");
  document.getElementById("statistics").innerHTML =
    `Geçilen Turlar: ${gameState.turns} 
    <br> İktidarda Kalınan Süre: <br> ${gameState.year - 2026} Yıl ${gameState.month - 1} Ay 
    <br> Görülen Haberler: ${gameState.logID - 1}`;
  gameState.loseCount++;
  gameState.gameRunning = false;
}

// Oyunu Kazan
export function winGame() {
  gameState.winGame = true;
  clearInterval(intervalID);
  intervalID = null;
  writeLog("20 yıl başarılı yönetim sağladın.", "green")
  document.getElementById("win-menu").classList.add("active");
  document.getElementById("win-statistics").innerHTML =
    `Geçilen Turlar: ${gameState.turns} 
    <br> İktidarda Kalınan Süre: <br> ${gameState.year - 2026} Yıl ${gameState.month - 1} Ay 
    <br> Görülen Haberler: ${gameState.logID - 1}`;
  gameState.gameRunning = false;
}

export function closeWinMenu() {
  gameState.gameRunning = true;
  document.getElementById("win-menu").classList.remove("active");
  const timeButtons = document.querySelectorAll(".time-btn");
  timeButtons.forEach(b => b.classList.remove("selected"));
  const timeStopBtn = document.getElementById("time-stop");
  timeStopBtn.classList.add("selected");
  gameState.gameSpeed = parseInt(timeStopBtn.dataset.speed);
  startTimeFlow();
}

// Bir yıl yenilik olmaması
export function noInnovationDecrease() {
  writeLog("Bir yıldır yenilik yok, ülke kötüleşiyor.", "red");
  gameState.happy -= 5;
  gameState.authority -= 5;
  gameState.economy -= 5;
  checkAuthority();
  updateUI();
}

// Kaynak renklerini ayarla
export function applyColorConditions(effects) {
  for (let key in effects) {
    if (!startResources.hasOwnProperty(key)) continue;
    
    const change = effects[key];
    startResources[key] += change;
    
    // Artış/düşüş sayısını güncelle
    if (change > 0) {
      resourceChangeCount[key] = Math.min(resourceChangeCount[key] + 1, 3); // maksimum 3
    } else if (change < 0) {
      resourceChangeCount[key] = Math.max(resourceChangeCount[key] - 1, -3); // minimum -3
    }
    
    // Renk güncelle
    updateUIColor(key, resourceChangeCount[key]);
  }
}

// Tek bir kaynak için renk güncelle
export function updateUIColor(resourceName, count) {
  const el = document.querySelector(`#${resources[String(resourceName)]}-bar`); // her kaynak için bar id'si
  if (!el) return;
  
  let color = "#f0ede4"; // varsayılan
  
  if (count > 1) {
    color = count <= 3 ? "#A8E6CF" : "#56C596"; // +1 açık mint yeşili, +2 orta yeşil
  } else if (count < -1) {
    color = count >= -3 ? "#FFD97D" : "#FF6B6B"; // -1 yumuşak sarı, -2 pastel kırmızı
  }
  
  el.style.backgroundColor = color;
}

let playTimeInterval;
export function startPlayingTime() {
  if (playTimeInterval) clearInterval(playTimeInterval);
  
  playTimeInterval = setInterval(() => {
    gameState.playingTime += 1; // saniye arttır
  }, 1000);
}

export function writeStats() {
  statsTime()
  statsTurns()
  statsInnovationCount()
  statsLoseCount()
}

export function statsTime() {
  if (!statsContainer) return;

  const lineId = "line-playing-time"; // her satır için kendine özel id
  let lineDiv = document.getElementById(lineId);

  if (!lineDiv) {
    lineDiv = document.createElement("div");
    lineDiv.id = lineId;
    statsContainer.appendChild(lineDiv);
  }

  lineDiv.className = "stats-line";

  // playingTime formatlama
  const totalSeconds = gameState.playingTime || 0;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let formattedTime;
  if (hours > 0) {
    formattedTime = `${hours}sa ${minutes}dk ${seconds}sn`;
  } else if (minutes > 0) {
    formattedTime = `${minutes}dk ${seconds}sn`;
  } else {
    formattedTime = `${seconds}sn`;
  }

  lineDiv.textContent = `Oynanan Süre: ${formattedTime}`;
}

export function statsTurns() {
  if (!statsContainer) return;
  
  const lineId = "line-turns"; // her satır için kendine özel id
  let lineDiv = document.getElementById(lineId);

  if (!lineDiv) {
    lineDiv = document.createElement("div");
    lineDiv.id = lineId;
    statsContainer.appendChild(lineDiv);
  }
  lineDiv.className = "stats-line";
  lineDiv.textContent = `Geçilen Tur: ${gameState.turns}`;
}

export function statsLoseCount() {
  if (!statsContainer) return;
  
  const lineId = "line-lose-count"; // her satır için kendine özel id
  let lineDiv = document.getElementById(lineId);

  if (!lineDiv) {
    lineDiv = document.createElement("div");
    lineDiv.id = lineId;
    statsContainer.appendChild(lineDiv);
  }
  lineDiv.className = "stats-line";
  const loseCount = gameState.loseCount ?? 0;
  lineDiv.textContent = `Ömür Boyu Kaybetmeler: ${loseCount}`;
}

export function statsInnovationCount() {
  if (!statsContainer) return;
  
  const lineId = "line-innovation-count"; // her satır için kendine özel id
  let lineDiv = document.getElementById(lineId);

  if (!lineDiv) {
    lineDiv = document.createElement("div");
    lineDiv.id = lineId;
    statsContainer.appendChild(lineDiv);
  }
  lineDiv.className = "stats-line";
  const innovationCount = gameState.innovationCount ?? 0;
  lineDiv.textContent = `Yapılan Yenilikler: ${innovationCount}`;
}


// [DEBUG] gameState ayarla
export function debugSetState(key, value) {
  gameState[key] = value;
  updateUI();
}

// [DEBUG] önemli değerleri sıfırla
export function debugKillGame() {
  gameState.happy = 0;
  gameState.economy = 0;
  gameState.security = 0;
  gameState.bureaucracy = 0;
  updateUI();
}

// [DEBUG] Zaman ekle
export function debugAddTime(years = 0, months = 0) {
  gameState.year += years;
  gameState.month += months - 1;
}

export function debugAddTurns(turns) {
  gameState.turns += turns;
}