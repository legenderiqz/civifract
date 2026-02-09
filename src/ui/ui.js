import { 
	gameState,
	effectEmojis,
	innovations,
	problems
} from "../core/data.js";  

import {
	intervalID,
	saveGame,
	startTimeFlow,
	writeLog,
	endGame,
	applyColorConditions
} from "../services/services.js";

import {
  updateRelationsEachTurn
} from "../services/relations.js";

import { 
  applyInnovation, 
  applyPassiveEffects, 
  checkAuthority, 
  checkTurns,
  resetBars
} from "../core/logic.js"; 

import { 
	topBar,
	infoBtn,
	innovateBtn
} from "../main.js";

// ==========================  
// DEĞİŞKENLER & CONSTS
// ==========================  
const dateText = document.getElementById("date-text");
const population = document.getElementById("population");
const happy = document.getElementById("happy");
const economy = document.getElementById("economy");
const authority = document.getElementById("authority");
const security = document.getElementById("security");
const burea = document.getElementById("bureaucracy");
const container = document.getElementById("problem-cards");
  
let innovationHeight = 180;
// ==========================  
// UI GÜNCELLEMELERİ  
// ==========================  
export function updateUI() {  
  if (!gameState.gameRunning) return;  
  
  gameState.population = Math.max(0, Math.min(300, gameState.population));  
  gameState.happy = Math.max(0, Math.min(100, gameState.happy));  
  gameState.economy = Math.max(0, Math.min(100, gameState.economy));  
  gameState.authority = Math.max(0, Math.min(100, gameState.authority));  
  gameState.security = Math.max(0, Math.min(100, gameState.security));  
  gameState.bureaucracy = Math.max(0, Math.min(100, gameState.bureaucracy));  
  
  dateText.textContent = 
    gameState.descriptionToggle ? `Tarih: ${gameState.date}` : gameState.date;  
  
  population.textContent =  
    gameState.descriptionToggle ? `Nüfus: \n ${gameState.population}` : gameState.population;  
  
  happy.textContent =  
    gameState.descriptionToggle ? `Mutluluk: \n ${gameState.happy}` : gameState.happy;  
  
  economy.textContent =  
    gameState.descriptionToggle ? `Ekonomi: \n ${gameState.economy}` : gameState.economy;  
  
  authority.textContent =  
    gameState.descriptionToggle ? `Otorite: \n ${gameState.authority}` : gameState.authority;  
  
  security.textContent =  
    gameState.descriptionToggle ? `Güvenlik: \n ${gameState.security}` : gameState.security;  
  
  burea.textContent =  
    gameState.descriptionToggle ? `Bürokrasi: \n ${gameState.bureaucracy}` : gameState.bureaucracy;  

  updateProblems();
  
  if (gameState.lastInnovationDate === gameState.date) {
    document.getElementById("innovate-btn").style.backgroundColor = "#ACACAC";  
    return;  
  }
  
  const statsGrid = document.getElementById("stats-grid");
  const securityVisible = !document.getElementById("security-bar").classList.contains("hidden");
  const bureaVisible = !document.getElementById("burea-bar").classList.contains("hidden");

  if (securityVisible || bureaVisible) {
    statsGrid.style.gridTemplateColumns = "repeat(3, 1fr)";
  } else {
    statsGrid.style.gridTemplateColumns = "repeat(2, 1fr)";
  }
}


export function updateProblems() {
  container.innerHTML = "";

  const activeProblems = [];

  // önce yüksek problemleri al
  const keysWithHighProblem = new Set();

  problems.forEach(problem => {
    const value = gameState[problem.key];
    if (value === undefined) return;
    if (problem.minTurn && gameState.turns < problem.minTurn) return;

    if (problem.type === "high" && value < problem.threshold) {
      activeProblems.push(problem);
      keysWithHighProblem.add(problem.key);
    }
  });

  // düşük problemleri yalnızca yüksek problem yoksa ekle
  problems.forEach(problem => {
    const value = gameState[problem.key];
    if (value === undefined) return;
    if (problem.minTurn && gameState.turns < problem.minTurn) return;
    if (problem.type === "low" && value < problem.threshold && !keysWithHighProblem.has(problem.key)) {
      activeProblems.push(problem);
    }
  });

  // Önceliğe göre sırala (yüksek öncelik yukarı)
  activeProblems.sort((a, b) => b.priority - a.priority);

  // Kartları oluştur
  activeProblems.forEach(p => {
    const card = document.createElement("div");
    card.className = "problem-card";
    card.textContent = p.text;
    card.style.border = p.type === "low" ? "2px solid yellow" : "2px solid red";
    container.appendChild(card);
  });
  
  // aktif problem yoksa "Hiç sorun yok" kartı ekle
  if (activeProblems.length === 0) {
    const card = document.createElement("div");
    card.classList.add("problem-card");
    card.textContent = "Hiç sorun yok";
    card.style.border = "2px solid black";
    container.appendChild(card);
  }
}
  
export function writeDescriptions() {  
  gameState.descriptionToggle = !gameState.descriptionToggle;  
  updateUI();  
}  
  
// ==========================  
// YARDIMCI UI FONKSİYONLARI  
// ==========================  
export function shuffle(array) {  
  const arr = [...array];  
  for (let i = arr.length - 1; i > 0; i--) {  
    const j = Math.floor(Math.random() * (i + 1));  
    [arr[i], arr[j]] = [arr[j], arr[i]];  
  }  
  return arr;  
}  
  
export function formatEffects(effects) {  
  const order = ["Otorite", "Ekonomi", "Mutluluk", "Nüfus", "Güvenlik", "Bürokrasi"];  
  return order  
    .filter(key => effects[key] !== undefined)  
    .map(key => {  
      if (key === "Güvenlik" && gameState.turns < 8) return "";  
      if (key === "Bürokrasi" && gameState.turns < 14) return "";  
      const sign = effects[key] > 0 ? "+" : "";  
      return `${gameState.descriptionToggle ? effectEmojis[key] + " " + key + ":" + "<br>" : effectEmojis[key] + " :"} ${sign}${effects[key]}`;
    })  
    .filter(e => e !== "")  
    .join("<br>");  
}  

export function setInnovationHeight() {
  if (gameState.descriptionToggle) {
    innovationHeight = 250;
  } else {
    innovationHeight = 180;
  }
  document.querySelectorAll(".menu button").forEach(btn => {
    btn.style.height = innovationHeight + "px";
  });
}
  

  
// ==========================  
// YENİLİK SEÇİMİ UI  
// ==========================  
export function openInnovationMenu() {  
  const overlay = document.getElementById("innovation-overlay");  
  const buttons = overlay.querySelectorAll(".menu button");  
  if (!gameState.gameRunning) return;  
  if (gameState.lastInnovationDate === gameState.date) {
    document.getElementById("innovate-btn").style.backgroundColor = "#ACACAC";  
    return;  
  }
  if (gameState.lastInnovationYear === gameState.year &&
    gameState.lastInnovationMonth === gameState.month) return;
  
  if (intervalID) clearInterval(intervalID);  
  
  let available = [...innovations];  
  
  if (gameState.turns >= 8) {  
    available.push({  
      text: "Nükleer Santral",  
      color: "#FF6F61",  
      effects: { Mutluluk: -5, Ekonomi: 20, Güvenlik: -15 },  
      message: "Yenilik: Nükleer santral kuruldu."  
    });  
  }  
  
  if (gameState.turns >= 14) {  
    available.push({  
      text: "Bürokratik Reform",  
      color: "#9E9E9E",  
      effects: { Bürokrasi: 15, Ekonomi: -5, Mutluluk: -10 },  
      message: "Yenilik: Bürokratik yapı yeniden düzenlendi."  
    });  
  }  
  
  const selected = shuffle(available).slice(0, 3);  
  
  selected.forEach((inv, i) => { 
    if (!buttons[i]) return;
    buttons[i].innerHTML = `  
      <div class="effectsTitle">${inv.text}</div>  
      <div class="effectsText">${formatEffects(inv.effects)}</div>  
    `;  
    buttons[i].style.backgroundColor = inv.color;  
    buttons[i].onclick = () => chooseInnovation(inv);  
  });  
  
  overlay.classList.remove("hidden");  
  overlay.classList.add("active");  
  setInnovationHeight()
  
  gameState.lastInnovationDate = gameState.date;  
  gameState.lastInnovationYear = gameState.year;  
  gameState.lastInnovationMonth = gameState.month;  
}  
  
function chooseInnovation(inv) {  
  if (!gameState.gameRunning) return;  
  
  gameState.turns++;  
  // Her tur sonunda çağır
  updateRelationsEachTurn();
  gameState.innovationCount++;
  applyColorConditions(inv.effects);
  applyInnovation(inv.effects, inv.message);  
  applyPassiveEffects();  
  checkAuthority();  
  startTimeFlow()
  updateUI();  
  
  document.getElementById("innovation-overlay").classList.remove("active");  
  document.getElementById("innovate-btn").style.backgroundColor = "#ACACAC";  
  
  checkTurns();  
  saveGame();
}

export function updateInfoButtonPosition() {
  const topBarEl = document.getElementById("top-bar");
  const infoBtnEl = document.getElementById("info-btn");
  const setBtnEl = document.getElementById("set-btn");
  if (!topBarEl || !infoBtnEl || !setBtnEl) return;

  const topBarHeight = topBarEl.offsetHeight;
  infoBtnEl.style.top = (topBarHeight + 5) + "px";
  setBtnEl.style.top = (topBarHeight + 5) + "px";
}

