// ==========================  
// GAME STATE  
// ==========================  
export const initialState = {  
  population: 100,  
  happy: 70,  
  economy: 50,  
  authority: 50,  
  security: 50,  
  lowAuthorityTurns: 0,  
  year: 2026,  
  month: 1,  
  date: "01.2026",  
  turns: 0,  
  logs: [],  
  gameRunning: true,  
  descriptionToggle: false,  
  bureaucracy: 50,  
  logID: 0,  
  lastInnovationDate: "",  
  lastInnovationYear: 2026,  
  lastInnovationMonth: 1,  
  gameSpeed: 0,
  autoSave: true,
  lastRandomEventID: null,
  securityActive: false,
  bureaActive: false,
  playingTime: 0,
  muted: false,
  loseCount: 0,
  innovationCount: 0,
  countriesActive: false,
  winGame: false
};  
  
export let gameState = { ...initialState };  

export function resetGameState() {
  const keepKeys = ["playingTime", "muted", "autoSave", "loseCount"]; // sıfırlanmasını istemediğin alanlar

  Object.keys(gameState).forEach(key => {
    if (!keepKeys.includes(key)) {
      gameState[key] = initialState[key];
    }
  });
}

export function setGameState(value) {
  Object.assign(gameState, value);
}

// ==========================  
// DATA  
// ==========================  
export const topBarMap = {  
  population: "Nüfus",  
  happy: "Mutluluk",  
  economy: "Ekonomi",  
  authority: "Otorite",  
  security: "Güvenlik",  
  bureaucracy: "Bürokrasi",  
};  
  
export const effectEmojis = {  
  "Nüfus": "<i class='fa-solid fa-users'></i>",  
  "Mutluluk": "<i class='fa-solid fa-smile'></i>",  
  "Ekonomi": "<i class='fa-solid fa-money-bill-wave'></i>",  
  "Otorite": "<i class='fa-solid fa-scale-balanced'></i>",  
  "Güvenlik": "<i class='fa-solid fa-shield-halved'></i>",  
  "Bürokrasi": "<i class='fa-solid fa-landmark'></i>"  
};

  
export const innovations = [  
  {  
    text: "Yeni Konutlar",  
    color: "#EBCB8B",  
    effects: { Nüfus: 10, Ekonomi: -5, Güvenlik: 10 },  
    message: "Yenilik: Yeni konutlar inşa edildi."  
  },  
  {  
    text: "Vergi Reformu",  
    color: "#B39DDB",  
    effects: { Ekonomi: 10, Mutluluk: -10, Otorite: -10, Bürokrasi: 5 },  
    message: "Yenilik: Vergi reformu yapıldı."  
  },  
  {  
    text: "Kültürel Festival",  
    color: "#8FBCE6",  
    effects: { Mutluluk: 13, Ekonomi: -5, Güvenlik: -3, Bürokrasi: -5 },  
    message: "Yenilik: Kültürel festival düzenlendi."  
  },  
  {  
    text: "Altyapı Yatırımı",  
    color: "#F0B77A",  
    effects: { Ekonomi: 5, Otorite: 5, Mutluluk: -3, Bürokrasi: 3 },  
    message: "Yenilik: Altyapı yatırımı yapıldı."  
  },  
  {  
    text: "Çevre Yenileme",  
    color: "#A3C9A8",  
    effects: { Mutluluk: 5, Nüfus: 5, Ekonomi: -5 },  
    message: "Yenilik: Çevre düzenlemesi yapıldı."  
  },  
  {  
    text: "Mülteci Alımı",  
    color: "#bfc7c9",  
    effects: { Mutluluk: -10, Nüfus: 15, Otorite: 10, Güvenlik: -5 },  
    message: "Yenilik: Mülteciler alındı."  
  }  
];  

export const events = [
  {
    title: "Komşu ülke sınır ihlali yaptı",
    options: [
      { 
        text: "Diplomasi uygula", 
        effects: {Otorite: 5, Ekonomi: -5}, 
        message: "Sınır ihlaline karşı diplomasi uygulandı." 
      },
      { 
        text: "Asker gönder", 
        effects: {Ekonomi: -5, Mutluluk: 5}, 
        message: "Sınır ihlaline karşı asker gönderildi." 
      }
    ]
  },
  {
    title: "Halk isyan etmeyi durdurmuyor.",
    options: [
      { 
        text: "Gösteriyi bastır", 
        effects: {Otorite: 5, Mutluluk: -5}, 
        message: "İsyan bastırıldı, halk mutsuz." 
      },
      { 
        text: "Sorunu dinle", 
        effects: {Mutluluk: 5, Otorite: -5}, 
        message: "Halkın sesi duyuldu, otorite biraz sarsıldı." 
      }
    ]
  },
  {
    title: "Sanayide patlama yaşandı",
    options: [
      { 
        text: "Yatırımı artır", 
        effects: {Ekonomi: 10, Mutluluk: -5}, 
        message: "Sanayi patlamasına karşın yatırım arttı." 
      },
      { 
        text: "Çevreyi koru", 
        effects: {Mutluluk: 10, Ekonomi: -5}, 
        message: "Sanayi patlamasına karşı çevre korundu." 
      }
    ]
  },
  {
  title: "Yeni teknoloji şirketi için yatırım lazım.",
  options: [
    { 
      text: "Destekle", 
      effects: {Ekonomi: 10, Mutluluk: -5, Otorite: -2}, 
      message: "Yeni teknoloji şirketi desteklendi." 
    },
    { 
      text: "Engelle", 
      effects: {Mutluluk: 5, Otorite: 2, Ekonomi: -8}, 
      message: "Yeni teknoloji şirketinin önü kesildi." 
    }
  ]
}
];
  
export const defaultInfoText = [
   ` <i class="fa-solid fa-lightbulb" style="color:#FFD700"></i> Yenilikler yap ve otoriteni koru.
    </div>
    <hr>
    <div class="info-line">
      <i class="fa-solid fa-arrow-down" style="color:#FF3B30"></i> 
      <i class="fa-solid fa-scale-balanced"></i> Otorite → <strong style="color:#FF3B30">Oyunu kaybedersin</strong>
    </div>
    <hr>
    <div class="info-line">
      <i class="fa-solid fa-arrow-down" style="color:#FF3B30"></i> 
      <i class="fa-solid fa-money-bill-wave"></i> Ekonomi → 
      <i class="fa-solid fa-arrow-down" style="color:#FF3B30"></i> 
      <i class="fa-solid fa-smile"></i> Mutluluk
    </div>
    <hr>
    <div class="info-line">
      <i class="fa-solid fa-arrow-down" style="color:#FF3B30"></i> 
      <i class="fa-solid fa-smile"></i> Mutluluk → 
      <i class="fa-solid fa-arrow-down" style="color:#FF3B30"></i> 
      <i class="fa-solid fa-scale-balanced"></i> Otorite
    </div>
    <hr>
    <div class="info-line">
      <i class="fa-solid fa-arrow-down" style="color:#FF3B30"></i> 
      <i class="fa-solid fa-smile"></i> Mutluluk veya 
      <i class="fa-solid fa-arrow-down" style="color:#FF3B30"></i> 
      <i class="fa-solid fa-money-bill-wave"></i> Ekonomi <br> → 
      <i class="fa-solid fa-arrow-down" style="color:#FF3B30"></i> 
      <i class="fa-solid fa-users"></i> Nüfus
    </div>
    <hr>
    <div class="info-line">
      <i class="fa-solid fa-arrow-up" style="color:#33CB06"></i> 
      <i class="fa-solid fa-smile"></i> Mutluluk + 
      <i class="fa-solid fa-arrow-up" style="color:#33CB06"></i> 
      <i class="fa-solid fa-money-bill-wave"></i> Ekonomi <br> → 
      <i class="fa-solid fa-arrow-up" style="color:#33CB06"></i> 
      <i class="fa-solid fa-users"></i> Nüfus
    </div>
    <hr>
    <div class="info-line">
      <i class="fa-solid fa-arrow-up" style="color:#33CB06"></i> 
      <i class="fa-solid fa-money-bill-wave"></i> Ekonomi + 
      <i class="fa-solid fa-arrow-up" style="color:#33CB06"></i> 
      <i class="fa-solid fa-scale-balanced"></i> Otorite <br> → 
      <i class="fa-solid fa-arrow-up" style="color:#33CB06"></i> 
      <i class="fa-solid fa-smile"></i> Mutluluk
    </div>
    <hr>`
];
  
export const securityInfo1 = [
  `<i class="fa-solid fa-arrow-down" style="color:#FF3B30"></i> <i class="fa-solid fa-shield-halved"></i> Güvenlik → <i class="fa-solid fa-arrow-down" style="color:#FF3B30"></i> <i class="fa-solid fa-scale-balanced"></i> Otorite`
];

export const securityInfo2 = [
  `<i class="fa-solid fa-arrow-up" style="color:#33CB06"></i> <i class="fa-solid fa-shield-halved"></i> Güvenlik → <i class="fa-solid fa-arrow-down" style="color:#FF3B30"></i> <i class="fa-solid fa-smile"></i> Mutluluk`
];
  
export const bureaInfo1 = [
  `<i class="fa-solid fa-arrow-down" style="color:#FF3B30"></i> <i class="fa-solid fa-landmark"></i> Bürokrasi → <i class="fa-solid fa-arrow-down" style="color:#FF3B30"></i> <i class="fa-solid fa-money-bill-wave"></i> Ekonomi`
];

export const bureaInfo2 = [
  `<i class="fa-solid fa-arrow-up" style="color:#33CB06"></i> <i class="fa-solid fa-landmark"></i> Bürokrasi → <i class="fa-solid fa-arrow-down" style="color:#FF3B30"></i> <i class="fa-solid fa-smile"></i> Mutluluk`
];


// Başlangıç kaynakları ve artış/düşüş sayaçları
export const startResources = {
  Otorite: 50,
  Ekonomi: 50,
  Mutluluk: 50,
  Nüfus: 50,
  Güvenlik: 50,
  Bürokrasi: 50
};

// Geçici artış/düşüş sayacı: +1 her artış, -1 her düşüş
export const resourceChangeCount = {
  Otorite: 0,
  Ekonomi: 0,
  Mutluluk: 0,
  Nüfus: 0,
  Güvenlik: 0,
  Bürokrasi: 0
};
  
export const borders = {
  "date-text": "#00BFFF",       // Tarih - kırmızımsı
  "time-control": "#00BFFF",    // Zaman - yeşil
  "authority-bar": "#00BFFF",   // Otorite - sarı
  "happy-bar": "#00BFFF",       // Mutluluk - yeşil
  "economy-bar": "#00BFFF",     // Ekonomi - mavi
  "population-bar": "#00BFFF",  // Nüfus - pembe
  "security-bar": "#00BFFF",    // Güvenlik - mor
  "burea-bar": "#00BFFF"        // Bürokrasi - turuncu
};

/* 
export const bordersOld = {
  "date-text": "#FF6F61",       // Tarih - kırmızımsı
  "time-control": "#6FCF97",    // Zaman - yeşil
  "authority-bar": "#333333",   // Otorite - sarı
  "happy-bar": "#33CB06",       // Mutluluk - yeşil
  "economy-bar": "#00BFFF",     // Ekonomi - mavi
  "population-bar": "#FF69B4",  // Nüfus - pembe
  "security-bar": "#8A2BE2",    // Güvenlik - mor
  "burea-bar": "#FFA500"        // Bürokrasi - turuncu
}; 
*/

export const problems = [
  {
    key: "happy",
    text: "Son zamanlarda halk mutsuz. \n - Mutluluk",
    type: "low",
    priority: 3,
    threshold: 30   // value < 30 → küçük problem
  },
  {
    key: "happy",
    text: "Halk ülkeden nefret ediyor! \n -- Mutluluk",
    type: "high",
    priority: 6,
    threshold: 15   // value < 15 → büyük problem
  },
  {
    key: "economy",
    text: "Ekonomi zayıfladı. \n - Ekonomi",
    type: "low",
    priority: 2,
    threshold: 35
  },
  {
    key: "economy",
    text: "Ekonomi çöküşte, enflasyon fırladı! \n -- Ekonomi",
    type: "high",
    priority: 5,
    threshold: 15
  },
  {
    key: "authority",
    text: "Devlet otoritesi az. \n - Otorite",
    type: "low",
    priority: 4,
    threshold: 35
  },
  {
    key: "authority",
    text: "Otorite kritik seviyede! \n -- Otorite",
    type: "high",
    priority: 7,
    threshold: 15
  },
  {
    key: "security",
    text: "Sokaklar güvensiz, suçlular dışarıda. \n - Güvenlik",
    type: "low",
    priority: 1,
    threshold: 35,
    minTurn: 8
  },
  {
    key: "security",
    text: "Can güvenliği yok, korku var! \n -- Güvenlik",
    type: "high",
    priority: 4,
    threshold: 15,
    minTurn: 8
  },
  {
    key: "bureaucracy",
    text: "Bürokrasi yeterli değil. \n - Bürokrasi",
    type: "low",
    priority: 1,
    threshold: 35,
    minTurn: 14
  },
  {
    key: "bureaucracy",
    text: "Bürokrasi yönetimi bloke ediyor! \n - Bürokrasi",
    type: "high",
    priority: 3,
    threshold: 15,
    minTurn: 14
  }
];

export const countries = {
  frosthelm: {
    id: "frosthelm",
    name: "Frosthelm",
    relation: 50,
    atWar: false,
    lastActionTurn: null
  },
  aurivale: {
    id: "aurivale",
    name: "Aurivale",
    relation: 30,
    atWar: false,
    lastActionTurn: null
  },
  duskwatch: {
    id: "duskwatch",
    name: "Duskwatch",
    relation: 80,
    atWar: false,
    lastActionTurn: null
  }
};

// import { updateUI } from "../ui/ui.js";  