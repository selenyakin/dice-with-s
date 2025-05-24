// Canvas ve temel elemanları alıyoruz
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreBoard = document.getElementById("scoreBoard");

// Ses efektlerini hazırlıyoruz
const clearSound = new Audio("assets/next-level.mp3"); // Temizleme sesi
const gameOverMusic = new Audio("assets/gameover.mp3"); // Oyun bitiş müziği

// Oyun tahtası ayarları
const SATIR_SAYISI = 4; // Toplam satır sayısı
const SUTUN_SAYISI = 4; // Toplam sütun sayısı
const KUTU_BOYUTU = 100; // Her bir kutunun boyutu
const ZAR_RENKLERI = ["#FBB45C", "#FE7A66", "#7D4282", "#45AAB4", "#F9637C", "#1E3D69"]; // Zar renkleri

// Oyun verileri
let grid = []; // Oyun tahtası
let sonrakiZarlar = []; // Sıradaki zarlar
let suruklenenZar = null; // Taşınan zar
let suruklemeOffsetX = 0; // Fare ile zar arası mesafe (yatay)
let suruklemeOffsetY = 0; // Fare ile zar arası mesafe (dikey)
let skor = 0; // Oyuncu puanı
let oyunBitti = false; // Oyun durumu

// Oyunu başlatıyoruz
oyunuBaslat();

// Fare olaylarını dinliyoruz
canvas.addEventListener("mousedown", fareTiklandi);
canvas.addEventListener("mousemove", fareHareketEtti);
canvas.addEventListener("mouseup", fareBirakildi);

// Müzik bitince oyunu sıfırla
gameOverMusic.addEventListener("ended", () => {
  oyunuSifirla();
});

/// JavaScript kısmı (mevcut kodlarınıza ekleyin)
const helpButton = document.getElementById('helpButton');
const rulesPopup = document.getElementById('rulesPopup');
const closeRules = document.getElementById('closeRules');

// Yardım butonu tıklama
helpButton.addEventListener('click', () => {
    rulesPopup.style.display = 'block';
});

// Kapatma butonu
closeRules.addEventListener('click', () => {
    rulesPopup.style.display = 'none';
});

// Dışarı tıklayınca kapat
window.addEventListener('click', (e) => {
    if (e.target === rulesPopup) {
        rulesPopup.style.display = 'none';
    }
});

// Oyunu başlatma fonksiyonu
function oyunuBaslat() {
  // Boş bir oyun tahtası oluşturuyoruz
  grid = Array(SATIR_SAYISI).fill(null).map(() => Array(SUTUN_SAYISI).fill(null));
  
  // Başlangıç değerlerini ayarlıyoruz
  skor = 0;
  oyunBitti = false;
  sonrakiZarlar = [];
  
  // İlk zarları oluşturuyoruz
  sonrakiZarlariOlustur();
  
  // Skoru güncelliyoruz
  skoruGuncelle();
  
  // Ekranı çiziyoruz
  ekraniYenidenCiz();
}

// Oyunu sıfırlama fonksiyonu
function resetGame() {
  // Müzikleri sıfırlıyoruz
  gameOverMusic.pause();
  gameOverMusic.currentTime = 0;
  
  // Arka plan müziğini kontrol ediyoruz
  if (bgMusic.paused) {
    bgMusic.currentTime = 0;
    bgMusic.play();
  }
  
  // Oyunu yeniden başlatıyoruz
  oyunuSifirla();
}

function oyunuSifirla() {
    // Oyun bitti ekranını gizliyoruz
    const overlay = document.getElementById("gameOverOverlay");
    overlay.style.display = "none";
    // Oyunu baştan başlatıyoruz
    oyunuBaslat();
}

// Yeni zar oluşturma fonksiyonu
function rastgeleZarOlustur() {
  // Zarların konumunu ayarlıyoruz
  const bosluk = 10;
  const toplamGenislik = 3 * KUTU_BOYUTU + 2 * bosluk;
  const baslangicX = (canvas.width - toplamGenislik) / 2;
  const indeks = sonrakiZarlar.length;

  // %15 şansla joker zar veriyoruz
  const jokerMi = Math.random() < 0.15;

  if (jokerMi) {
    // Joker zar özellikleri
    return {
      deger: 0, // Joker değeri
      renk: "joker", // Özel renk
      x: baslangicX + indeks * (KUTU_BOYUTU + bosluk),
      y: SATIR_SAYISI * KUTU_BOYUTU + 10,
      genislik: KUTU_BOYUTU,
      yukseklik: KUTU_BOYUTU,
      surukleniyor: false,
      yerlestirildi: false,
      jokerMi: true
    };
  } else {
    // Normal zar özellikleri
    return {
      deger: Math.floor(Math.random() * 6) + 1, // 1-6 arası değer
      renk: ZAR_RENKLERI[Math.floor(Math.random() * ZAR_RENKLERI.length)], // Rastgele renk
      x: baslangicX + indeks * (KUTU_BOYUTU + bosluk),
      y: SATIR_SAYISI * KUTU_BOYUTU + 10,
      genislik: KUTU_BOYUTU,
      yukseklik: KUTU_BOYUTU,
      surukleniyor: false,
      yerlestirildi: false,
      jokerMi: false
    };
  }
}

// Sonraki zarları oluşturma
function sonrakiZarlariOlustur() {
  sonrakiZarlar = []; // Önce listeyi temizliyoruz
  // 3 yeni zar ekliyoruz
  for (let i = 0; i < 3; i++) {
    sonrakiZarlar.push(rastgeleZarOlustur());
  }
}

// Oyun tahtasını çizme fonksiyonu
function gridCiz() {
  // Önce canvas'ı temizliyoruz
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Arka planı beyaz yapıyoruz
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, SUTUN_SAYISI * KUTU_BOYUTU, SATIR_SAYISI * KUTU_BOYUTU);

  // Grid çizgilerini çiziyoruz
  ctx.strokeStyle = "#aaa";
  // Dikey çizgiler
  for (let i = 0; i <= SUTUN_SAYISI; i++) {
    ctx.beginPath();
    ctx.moveTo(i * KUTU_BOYUTU, 0);
    ctx.lineTo(i * KUTU_BOYUTU, SATIR_SAYISI * KUTU_BOYUTU);
    ctx.stroke();
  }
  // Yatay çizgiler
  for (let i = 0; i <= SATIR_SAYISI; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * KUTU_BOYUTU);
    ctx.lineTo(SUTUN_SAYISI * KUTU_BOYUTU, i * KUTU_BOYUTU);
    ctx.stroke();
  }
}

// Zar çizme fonksiyonu
function zarCiz(x, y, boyut, deger, renk, surukleniyorMu = false) {
  // Joker zarı özel çiziyoruz
  if (renk === "joker") {
    ctx.fillStyle = "#FFD700"; // Altın rengi
  } else {
    ctx.fillStyle = renk; // Normal renk
  }
  
  // Zar çerçevesi
  ctx.strokeStyle = "#222";
  ctx.lineWidth = 3;
  ctx.fillRect(x + 5, y + 5, boyut - 10, boyut - 10);
  ctx.strokeRect(x + 5, y + 5, boyut - 10, boyut - 10);

  // Joker zarına özel yazı
  if (renk === "joker") {
    ctx.fillStyle = "black";
    ctx.font = `${boyut / 2}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("J", x + boyut / 2, y + boyut / 2);
    return;
  }

  // Normal zar noktaları
  ctx.fillStyle = "white";
  const noktaYariCap = boyut / 12;
  const merkezX = x + boyut / 2;
  const merkezY = y + boyut / 2;
  const offset = boyut / 4;

  // Her zar değeri için nokta pozisyonları
  const pozisyonlar = {
    1: [[0, 0]],
    2: [[-1, -1], [1, 1]],
    3: [[-1, -1], [0, 0], [1, 1]],
    4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
    5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]],
    6: [[-1, -1], [0, -1], [1, -1], [-1, 1], [0, 1], [1, 1]]
  };

  // Noktaları çiziyoruz
  pozisyonlar[deger].forEach(([dx, dy]) => {
    ctx.beginPath();
    ctx.arc(merkezX + dx * offset, merkezY + dy * offset, noktaYariCap, 0, Math.PI * 2);
    ctx.fill();
  });

  // Sürüklenen zarı şeffaf yapıyoruz
  if (surukleniyorMu) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.fillRect(x + 5, y + 5, boyut - 10, boyut - 10);
  }
}

// Fare pozisyonunu alma fonksiyonu
function farePozisyonuAl(evt) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

// Grid pozisyonunu hesaplama
function gridPozisyonuAl(x, y) {
  return {
    gx: Math.floor(x / KUTU_BOYUTU),
    gy: Math.floor(y / KUTU_BOYUTU)
  };
}

// Hamlenin geçerli olup olmadığını kontrol
function gecerliHamleMi(x, y, zar) {
  // Grid dışına yerleştirme yapılamaz
  if (x < 0 || x >= SUTUN_SAYISI || y < 0 || y >= SATIR_SAYISI) return false;
  
  // Dolu hücreye yerleştirme yapılamaz
  if (grid[y][x] !== null) return false;

  // Joker her yere konabilir
  if (zar.jokerMi) return true;
  
  // İlk hamlede her yere konabilir
  if (grid.flat().every(hucre => hucre === null)) return true;

  // Komşu hücreleri kontrol ediyoruz
  const yonler = [[0, -1], [0, 1], [-1, 0], [1, 0]];
  let komsular = [];
  
  for (let [dx, dy] of yonler) {
    const nx = x + dx;
    const ny = y + dy;
    if (nx >= 0 && nx < SUTUN_SAYISI && ny >= 0 && ny < SATIR_SAYISI) {
      const komsu = grid[ny][nx];
      if (komsu !== null) komsular.push(komsu);
    }
  }

  // Komşu yoksa yerleştirilebilir
  if (komsular.length === 0) {
    return true;
  } 
  // 1 komşu varsa renk veya değer eşleşmeli
  else if (komsular.length === 1) {
    const n = komsular[0];
    return (n.renk === zar.renk) || (n.deger === zar.deger) || n.jokerMi || zar.jokerMi;
  }
  // 2 komşu varsa özel kurallar geçerli
  else if (komsular.length === 2) {
    const [n1, n2] = komsular;
    const komsularFarkli = (n1.renk !== n2.renk) && (n1.deger !== n2.deger);
    
    if (komsularFarkli) {
      const kosul1 = (zar.renk === n1.renk && zar.deger !== n1.deger) &&
                    (zar.deger === n2.deger && zar.renk !== n2.renk);
      const kosul2 = (zar.deger === n1.deger && zar.renk !== n1.renk) &&
                    (zar.renk === n2.renk && zar.deger !== n2.deger);
      return kosul1 || kosul2 || n1.jokerMi || n2.jokerMi || zar.jokerMi;
    } else {
      return komsular.every(n => (n.renk === zar.renk) || (n.deger === zar.deger) || n.jokerMi || zar.jokerMi);
    }
  } 
  // 3-4 komşu varsa hepsiyle uyumlu olmalı
  else {
    return komsular.every(n => (n.renk === zar.renk) || (n.deger === zar.deger) || n.jokerMi || zar.jokerMi);
  }
}

// Satır/sütun temizleme fonksiyonu
function satirSutunTemizle(x, y) {
  let temizlenenSatirSutun = 0;

  // Satır doluysa temizle
  if (grid[y].every(hucre => hucre !== null)) {
    for (let i = 0; i < SUTUN_SAYISI; i++) grid[y][i] = null;
    temizlenenSatirSutun++;
  }

  // Sütun doluysa temizle
  let sutunDolu = true;
  for (let i = 0; i < SATIR_SAYISI; i++) {
    if (grid[i][x] === null) {
      sutunDolu = false;
      break;
    }
  }
  if (sutunDolu) {
    for (let i = 0; i < SATIR_SAYISI; i++) grid[i][x] = null;
    temizlenenSatirSutun++;
  }

  // Temizleme yapıldıysa puan ver ve ses çal
  if (temizlenenSatirSutun > 0) {
    clearSound.currentTime = 0;
    clearSound.play();
    skor += temizlenenSatirSutun * 10;
    skoruGuncelle();
  }
}

// Oyunun bitip bitmediğini kontrol
function oyunBittiMiKontrol() {
  // Tüm hücreler doluysa oyun biter
  if (grid.flat().every(hucre => hucre !== null)) {
    oyunBittiMesajiGoster();
    gameOverMusic.currentTime = 0;
    gameOverMusic.play();
    return true;
  }

  // Hamle yapılabilecek yer var mı diye kontrol
  for (let zar of sonrakiZarlar) {
    for (let y = 0; y < SATIR_SAYISI; y++) {
      for (let x = 0; x < SUTUN_SAYISI; x++) {
        if (grid[y][x] === null && gecerliHamleMi(x, y, zar)) return false;
      }
    }
  }

  // Hiç hamle yapılamıyorsa oyun biter
  oyunBittiMesajiGoster();
  gameOverMusic.currentTime = 0;
  gameOverMusic.play();
  return true;
}

// Oyun bitti mesajını göster
function oyunBittiMesajiGoster() {
    const overlay = document.getElementById("gameOverOverlay");
    const mesaj = document.getElementById("gameOverMessage");
    mesaj.textContent = "Oyun Bitti! Skorunuz: " + skor;
    overlay.style.display = "flex";

    gameOverMusic.currentTime = 0;
    gameOverMusic.play();
}

// Fare tıklama olayı
function fareTiklandi(evt) {
  if (oyunBitti) return;
  
  const pos = farePozisyonuAl(evt);
  
  // Tıklanan zarı buluyoruz
  for (let i = sonrakiZarlar.length - 1; i >= 0; i--) {
    const z = sonrakiZarlar[i];
    if (pos.x >= z.x && pos.x <= z.x + z.genislik && 
        pos.y >= z.y && pos.y <= z.y + z.yukseklik) {
      suruklenenZar = z;
      suruklemeOffsetX = pos.x - z.x;
      suruklemeOffsetY = pos.y - z.y;
      z.surukleniyor = true;
      return;
    }
  }
}

// Fare hareket olayı
function fareHareketEtti(evt) {
  if (!suruklenenZar || !suruklenenZar.surukleniyor) return;
  
  const pos = farePozisyonuAl(evt);
  // Zarı fareyle birlikte hareket ettiriyoruz
  suruklenenZar.x = pos.x - suruklemeOffsetX;
  suruklenenZar.y = pos.y - suruklemeOffsetY;
  
  ekraniYenidenCiz();
}

// Fare bırakma olayı
function fareBirakildi(evt) {
  if (!suruklenenZar) return;
  
  suruklenenZar.surukleniyor = false;
  const pos = farePozisyonuAl(evt);
  const { gx, gy } = gridPozisyonuAl(pos.x, pos.y);

  // Geçerli bir hamle mi kontrol ediyoruz
  if (gecerliHamleMi(gx, gy, suruklenenZar)) {
    // Zarı grid'e yerleştiriyoruz
    grid[gy][gx] = {
      deger: suruklenenZar.deger,
      renk: suruklenenZar.renk,
      jokerMi: suruklenenZar.jokerMi || false
    };
    
    // Yerleştirilen zarı listeden çıkarıyoruz
    sonrakiZarlar = sonrakiZarlar.filter(z => z !== suruklenenZar);

    // Satır/sütun kontrolü yapıyoruz
    satirSutunTemizle(gx, gy);
    skoruGuncelle();

    // Zarlar bittiyse yenilerini oluşturuyoruz
    if (sonrakiZarlar.length === 0) sonrakiZarlariOlustur();

    // Oyun bitti mi kontrol ediyoruz
    if (oyunBittiMiKontrol()) {
      oyunBitti = true;
    }
  } else {
    // Geçersiz hamlede zarları eski yerine koyuyoruz
    sonrakiZarlarPozisyonunuSifirla();
  }
  
  suruklenenZar = null;
  ekraniYenidenCiz();
}

// Zarları başlangıç pozisyonuna alma
function sonrakiZarlarPozisyonunuSifirla() {
  const bosluk = 10;
  const toplamGenislik = 3 * KUTU_BOYUTU + 2 * bosluk;
  const baslangicX = (canvas.width - toplamGenislik) / 2;
  
  for (let i = 0; i < sonrakiZarlar.length; i++) {
    sonrakiZarlar[i].x = baslangicX + i * (KUTU_BOYUTU + bosluk);
    sonrakiZarlar[i].y = SATIR_SAYISI * KUTU_BOYUTU + 10;
  }
}

// Skoru güncelleme
function skoruGuncelle() {
  scoreBoard.textContent = "Skor: " + skor;
}

// Ekranı yeniden çizme
function ekraniYenidenCiz() {
  // Önce grid'i çiziyoruz
  gridCiz();
  
  // Grid üzerindeki zarları çiziyoruz
  for (let y = 0; y < SATIR_SAYISI; y++) {
    for (let x = 0; x < SUTUN_SAYISI; x++) {
      const zar = grid[y][x];
      if (zar !== null) {
        zarCiz(x * KUTU_BOYUTU, y * KUTU_BOYUTU, KUTU_BOYUTU, zar.deger, zar.renk);
      }
    }
  }
  
  // Sonraki zarları çiziyoruz
  sonrakiZarlar.forEach(z => {
    zarCiz(z.x, z.y, z.genislik, z.deger, z.renk, z.surukleniyor);
  });
}

// Arka plan müziği ayarları
const bgMusic = new Audio("assets/music.mp3");
bgMusic.loop = true;

// Sayfaya tıklayınca müziği başlat
window.addEventListener("click", () => {
  if (bgMusic.paused) {
    bgMusic.play();
  }
});