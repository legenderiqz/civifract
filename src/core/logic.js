import { 
	gameState,
	setGameState,
	resetGameState,
	securityInfo1,
	securityInfo2,
	bureaInfo1,
	bureaInfo2
} from "./data.js";

import { 
	updateUI,
	updateInfoButtonPosition 
} from "../ui/ui.js";

import { 
	intervalID, 
	writeLog,
	appendInfoLine,
	showInfoNotification,
	noInnovationDecrease,
	endGame
} from "../services/services.js";

import {
	showEvent,
	pickRandomEvent,
	currentEvent
} from "../services/events.js"

// ==========================  
// GAME LOGIC  
// ==========================  
// Yenilik etkilerini uygula
export function applyInnovation(effects, message, color = "green") {  
  if (effects.Nüfus) gameState.population += effects.Nüfus;  
  if (effects.Ekonomi) gameState.economy += effects.Ekonomi;  
  if (effects.Mutluluk) gameState.happy += effects.Mutluluk;  
  if (effects.Otorite) gameState.authority += effects.Otorite;  
  if (effects.Güvenlik && gameState.turns >= 8) gameState.security += effects.Güvenlik;  
  if (effects.Bürokrasi && gameState.turns >= 14) gameState.bureaucracy += effects.Bürokrasi;  
  writeLog(message, color);  
}  

// Pasif efektler
export function applyPassiveEffects() {  
  if (gameState.economy < 35) writeLog("Ekonomi zayıf, halk huzursuz.", "yellow"), gameState.happy -= 3;  
  if (gameState.happy < 30) writeLog("Halk mutsuz, otorite sarsılıyor.", "yellow"), gameState.authority -= 3;  
  if (gameState.authority < 30) writeLog("Otorite zayıf, ekonomi zarar görüyor.", "yellow"), gameState.economy -= 3;  

  if (gameState.happy > 65 && gameState.economy > 55) gameState.population += 2;  
  else if (gameState.happy < 30 || gameState.economy < 30) writeLog("Yönetim yetersiz, göçler başladı.", "yellow"), gameState.population -= 5;  

  if (gameState.economy > 80 && gameState.authority > 80) writeLog("Hızlı büyüme halkta baskı yarattı.", "yellow"), gameState.happy -= 5;  
  if (gameState.security < 30) writeLog("Güvenlik yetersiz, otorite düşüyor.", "yellow"), gameState.authority -= 2;  
  if (gameState.security > 80) writeLog("Güvenlik nefes aldırmıyor, mutluluk düştü.", "yellow"), gameState.happy -= 2;  
  if (gameState.bureaucracy < 30) writeLog("Bürokrasi az, ekonomi zorlanıyor.", "yellow"), gameState.economy -= 2;  
  if (gameState.bureaucracy > 80) writeLog("Bürokrasi çok fazla, mutluluk düşüyor.", "yellow"), gameState.happy -= 2;  
}  

// Otorite Kontrolü, oyun bitirme için
export function checkAuthority() {  
  let criticalCount = 0;  
  if (gameState.happy <= 0) criticalCount++;  
  if (gameState.economy <= 0) criticalCount++;  
  if (gameState.security <= 0 && gameState.turns >= 8) criticalCount++;  
  if (gameState.bureaucracy <= 0 && gameState.turns >= 14) criticalCount++;  

  if (criticalCount >= 1) {  
    gameState.authority -= 20;  
    writeLog("Devlet sistemi çöküyor, bir alan iflas etti.", "red");  
  }  
    
  if (gameState.authority <= 15) {  
    gameState.lowAuthorityTurns++;  
    if (gameState.lowAuthorityTurns === 1) writeLog("Devlet otoritesi kritik seviyede.", "red");  
    else if (gameState.lowAuthorityTurns === 2) gameState.happy -= 10, writeLog("Devasa protestolar başladı.", "red");  
    else if (gameState.lowAuthorityTurns === 3) gameState.happy -= 10, writeLog("Devlet çöküşün eşiğinde...", "red");  
    else if (gameState.lowAuthorityTurns >= 4) endGame("İktidar devrildi, ordu yönetime el koydu.");  
  } else gameState.lowAuthorityTurns = 0;  
}  

// Rastgele Olaylar
export function randomEvent() {  
	if (!currentEvent && Math.random() < 0.1) {
	  gameState.lastRandomEventID = pickRandomEvent();
  	showEvent(gameState.lastRandomEventID);
	}
	
  if (Math.floor(Math.random() * 6) + 1 !== 1) return;  
  const eventID = Math.floor(Math.random() * 6) + 1;  

  switch (eventID) {
    case 1: 
      if ([5,6,7,8].includes(gameState.month)) gameState.economy -= 1, writeLog("Aşırı kuraklık yaşandı.");
      else gameState.happy -= 1, writeLog("Sel felaketi yaşandı.");
      break;
    case 2: gameState.authority += 1, writeLog("Muhalefet skandal bir konuşma yaptı."); break;
    case 3: gameState.authority -= 1, writeLog("Hükümete karşı protesto yürüşü yapıldı."); break;
    case 4: gameState.population -= 5, gameState.happy += 1, writeLog("Bazı mülteciler ülkelerine döndü."); break;
    case 5: gameState.population -= 2, gameState.happy -= 2, writeLog("Yaşanan şiddet olayları gündemi sarstı."); break;
    case 6: gameState.happy += 3, writeLog("Milli takımın kazandığı maç ses getirdi!"); break;
  }
}

//const securBar = document.getElementById("security-bar");  
//const bureaBar = document.getElementById("burea-bar");  

export function checkTurns() {  
  // --- GÜVENLİK ---
  if (gameState.turns >= 8 && !gameState.securityActive) {
    unlockBar("security-bar");
    if (gameState.turns === 8) gameState.security = 50;
    appendInfoLine(securityInfo1);
    appendInfoLine(securityInfo2);
    showInfoNotification();
    gameState.securityActive = true;
  } 
  else if (gameState.turns < 8 && gameState.securityActive) {
    lockBar("security-bar");
    gameState.securityActive = false;
  }

  // --- BÜROKRASİ ---
  if (gameState.turns >= 14 && !gameState.bureaActive) {
    unlockBar("burea-bar");
    if (gameState.turns === 14) gameState.bureaucracy = 50;
    appendInfoLine(bureaInfo1);
    appendInfoLine(bureaInfo2);
    showInfoNotification();
    gameState.bureaActive = true;
  } 
  else if (gameState.turns < 14 && gameState.bureaActive) {
    lockBar("burea-bar");
    gameState.bureaActive = false;
  }

  // --- ÜLKELER BUTONU ---
  if (gameState.turns >= 20 && !gameState.countriesActive) {
    unlockBtn("countries-btn");
    gameState.countriesActive = true;
  } 
  else if (gameState.turns < 20 && gameState.countriesActive) {
    lockBtn("countries-btn");
    gameState.countriesActive = false;
  }

  updateUI();  
  updateInfoButtonPosition();
}

// Yıllık düşüşü buradan yönet
export function noInnovationDecreaseHandler() {  
  noInnovationDecrease();  
}

export function unlockBar(barId) {
  const bar = document.getElementById(barId);
  if (!bar) return;

  const lock = bar.querySelector(".locked");
  if (!lock) return;

  // overlay’i tamamen kaldırmadan görünmez yap
  lock.classList.add("hidden");  
  lock.style.opacity = 0;
  lock.style.pointerEvents = "none";
}

export function lockBar(barId) {
  const bar = document.getElementById(barId);
  if (!bar) return;

  const lock = bar.querySelector(".locked");
  if (!lock) return;

  // görünür yap
  lock.classList.remove("hidden");  
  lock.style.opacity = 1;
  lock.style.pointerEvents = "auto";
  lock.style.display = "flex";
}


export function resetBars() {
  const securityOverlay = document.querySelector("#security-bar .locked");
  const bureaOverlay = document.querySelector("#burea-bar .locked");

  if (securityOverlay) {
    securityOverlay.classList.remove("hidden");
    securityOverlay.style.opacity = 1;
    securityOverlay.style.pointerEvents = "auto";
    securityOverlay.style.display = "flex";
  }

  if (bureaOverlay) {
    bureaOverlay.classList.remove("hidden");
    bureaOverlay.style.opacity = 1;
    bureaOverlay.style.pointerEvents = "auto";
    bureaOverlay.style.display = "flex";
  }

  gameState.securityActive = false;
  gameState.bureaActive = false;
  gameState.security = 50;
  gameState.bureaucracy = 50;
}

export function unlockBtn(btnId) {
  const btn = document.getElementById(btnId);
  if (!btn) return;

  const lock = btn.querySelector(".btn-locked");
  if (!lock) return;

  lock.style.display = "none"; // kilidi gizle
}

export function lockBtn(btnId) {
  const btn = document.getElementById(btnId);
  if (!btn) return;

  const lock = btn.querySelector(".btn-locked");
  if (!lock) return;

  lock.style.display = "flex"; // kilidi göster
}

export function resetBtn() {
  const lock = document.querySelector("#countries-btn .btn-locked");
  if (lock) lock.style.display = "flex";
  gameState.countriesActive = false;
}

