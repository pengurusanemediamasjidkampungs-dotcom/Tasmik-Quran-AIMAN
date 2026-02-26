// ==========================================
// 1. DATA PESERTA & KONFIGURASI
// ==========================================
const dataPeserta = [
    { nama: "NUR SYAURAH BINTI ESRIFADLI", umur: 13 },
    { nama: "NUR DHIA HUSNA BINTI HAMIZAN", umur: 13 },
    { nama: "NUR DAMIA HUMAIRA BINTI MD KHAIRUL AZHAR", umur: 12 },
    { nama: "NUR ALYA FATINI BINTI MOHAMAD SSIBAH", umur: 11 },
    { nama: "ZAHIYYATUL HUSNA BINTI NORIZAM", umur: 10 },
    { nama: "NUR AESHA HUMAIRA BINTI MUHAMMAD AZFAR", umur: 9 },
    { nama: "ADAWIYAH HUMAIRA BINTI SHAHRIN", umur: 9 },
    { nama: "HIDAYATUL ZAHIROH BINTI NORIZAM", umur: 9 },
    { nama: "NUR DIYANA HUWAINAA BINTI MD KHAIRUL AZHAR", umur: 8 }
];

const GAS_URL = "https://script.google.com/macros/s/AKfycbw5tyY3rrQFkGisxuE-pAc-Ii2Z4G2GYyUyvS6NeTSlrpKhlQ4aFEaWC-5ujnXCa9u1Ag/exec";

const pembimbingInfo = {
    nama: "MUHAMMAD AIMAN BIN MOHD RAFEE",
    jantina: "PEREMPUAN"
};

const silibusData = {
    "1": [{ nama: "An-Naas", ayat: "1-6", ms: 604 }, { nama: "Al-Falaq", ayat: "1-5", ms: 604 }, { nama: "Al-Ikhlas", ayat: "1-4", ms: 604 }, { nama: "Al-Masad", ayat: "1-5", ms: 603 }, { nama: "An-Nasr", ayat: "1-3", ms: 603 }, { nama: "Al-Kafirun", ayat: "1-6", ms: 603 }, { nama: "Al-Kauthar", ayat: "1-3", ms: 602 }, { nama: "Al-Ma'uun", ayat: "1-7", ms: 602 }, { nama: "Quraisy", ayat: "1-4", ms: 602 }, { nama: "Al-Fil", ayat: "1-5", ms: 601 }, { nama: "Al-Humazah", ayat: "1-9", ms: 601 }, { nama: "Al-'Asr", ayat: "1-3", ms: 601 }],
    "2": [{ nama: "At-Takathur", ayat: "1-8", ms: 600 }, { nama: "Al-Qori'ah", ayat: "1-11", ms: 600 }, { nama: "Al-'Aadiyaat", ayat: "1-11", ms: 599 }, { nama: "Az-Zalzalah", ayat: "1-8", ms: 599 }, { nama: "Al-Bayyinah", ayat: "1-8", ms: 598 }, { nama: "Al-Qadr", ayat: "1-5", ms: 598 }, { nama: "Al-'Alaq", ayat: "1-19", ms: 597 }, { nama: "At-Tin", ayat: "1-8", ms: 597 }, { nama: "Asy-Syarh", ayat: "1-8", ms: 596 }, { nama: "Adh-Dhuha", ayat: "1-11", ms: 596 }],
    "3": [{ nama: "Asy-Syams", ayat: "1-15", ms: 595 }, { nama: "Al-Lail", ayat: "1-21", ms: 595 }, { nama: "Al-Balad", ayat: "1-20", ms: 594 }, { nama: "Al-Ghaasyiah", ayat: "1-26", ms: 592 }, { nama: "Al-A'laa", ayat: "1-19", ms: 591 }, { nama: "At-Tariq", ayat: "1-17", ms: 591 }, { nama: "Al-Infithor", ayat: "1-19", ms: 587 }],
    "4": [{ nama: "Al-Buruj", ayat: "1-22", ms: 590 }, { nama: "Al-Insyiqaq", ayat: "1-25", ms: 589 }, { nama: "At-Takwir", ayat: "1-29", ms: 586 }, { nama: "Abasa", ayat: "1-42", ms: 585 }],
    "5": [{ nama: "Al-Muthoffifin", ayat: "1-36", ms: 587 }, { nama: "Al-Fajr", ayat: "1-30", ms: 593 }, { nama: "An-Nazi'aat", ayat: "1-46", ms: 583 }, { nama: "An-Naba'", ayat: "1-40", ms: 582 }],
    "6": [{ nama: "As-Sajadah", ayat: "1-30", ms: 415 }, { nama: "Al-Mulk", ayat: "1-30", ms: 562 }, { nama: "Al-Insaan", ayat: "1-31", ms: 578 }, { nama: "Ar-Rahmaan", ayat: "1-78", ms: 531 }, { nama: "Al-Waqi'ah", ayat: "1-96", ms: 534 }, { nama: "Yaasin", ayat: "1-83", ms: 440 }, { nama: "Ad-Dukhaan", ayat: "1-59", ms: 496 }, { nama: "Al-Hasyr", ayat: "1-24", ms: 545 }, { nama: "Al-Jumu'ah", ayat: "1-11", ms: 553 }, { nama: "Al-Kahfi", ayat: "1-110", ms: 293 }],
    "7": [{ nama: "Muraja'ah T1", ayat: "Juz Amma", ms: "601" }, { nama: "Muraja'ah T2", ayat: "Juz Amma", ms: "596" }, { nama: "Input Manual", ayat: "-", ms: "-" }]
};

// ==========================================
// 2. INITIALIZATION
// ==========================================
let surahTerpilih = "";

window.onload = () => {
    populatePeserta();
    janaGridNombor();
    renderSilibus(); // Papar tahap 1 secara default
};

// --- JANA GRID MUKA SURAT & AYAT ---
function janaGridNombor() {
    const mukaGrid = document.getElementById('muka-surat-grid');
    const ayatGrid = document.getElementById('ayat-grid');

    for (let i = 1; i <= 604; i++) {
        let btn = document.createElement('div');
        btn.className = 'num-btn';
        btn.innerText = i;
        btn.onclick = function() {
            pilihItem('muka-surat', i, btn);
        };
        mukaGrid.appendChild(btn);
    }

    for (let i = 1; i <= 150; i++) {
        let btn = document.createElement('div');
        btn.className = 'num-btn';
        btn.innerText = i;
        btn.onclick = function() {
            pilihItem('ayat', i, btn);
        };
        ayatGrid.appendChild(btn);
    }
}

function pilihItem(jenis, nilai, elemen) {
    const parent = elemen.parentElement;
    parent.querySelectorAll('.num-btn').forEach(b => b.classList.remove('active'));
    elemen.classList.add('active');
    document.getElementById(jenis + '-input').value = nilai;
}

// --- RENDER SILIBUS (GAYA GRID KEMAS) ---
function renderSilibus() {
    const tahap = document.getElementById('tahap-select').value;
    const surahGrid = document.getElementById('silibus-display'); 
    const data = silibusData[tahap] || [];

    // Kita tukar paparan surah kepada Grid Butang supaya kemas
    surahGrid.className = "number-grid"; 
    surahGrid.innerHTML = data.map(s => `
        <div class="num-btn" style="font-size:0.75rem; padding:15px 5px;" onclick="pilihSurah('${s.nama}', this)">
            ${s.nama}
        </div>
    `).join('');
}

function pilihSurah(nama, elemen) {
    const parent = elemen.parentElement;
    parent.querySelectorAll('.num-btn').forEach(b => b.classList.remove('active'));
    elemen.classList.add('active');
    surahTerpilih = nama;
}

function populatePeserta() {
    const select = document.getElementById('nama-select');
    const sorted = [...dataPeserta].sort((a, b) => a.umur - b.umur); 
    select.innerHTML = sorted.map(p => 
        `<option value="${p.nama}">${p.nama} (${p.umur} Thn)</option>`
    ).join('');
}

// --- FUNGSI HANTAR DATA ---
async function hantarRekod() {
    const namaPeserta = document.getElementById('nama-select').value;
    const tahap = document.getElementById('tahap-select').value;
    
    // Ambil markah dari Radio Button
    const tajwidElement = document.querySelector('input[name="tajwid"]:checked');
    const fasohahElement = document.querySelector('input[name="fasohah"]:checked');
    
    const msPilihan = document.getElementById('muka-surat-input').value;
    const ayatPilihan = document.getElementById('ayat-input').value;

    // Validasi
    if (!surahTerpilih) return alert("Sila pilih Surah!");
    if (!msPilihan || !ayatPilihan) return alert("Sila pilih Muka Surat & Ayat!");
    if (!tajwidElement || !fasohahElement) return alert("Sila berikan markah Tajwid & Fasohah!");

    const payload = {
        ustaz: pembimbingInfo.nama,
        peserta: namaPeserta,
        jantina: pembimbingInfo.jantina,
        jenis_bacaan: (tahap === "7") ? "Muraja'ah" : "Tasmik",
        tahap: "TAHAP " + tahap,
        surah: surahTerpilih,
        mukasurat: msPilihan,
        ayat_range: ayatPilihan,
        tajwid: tajwidElement.value,
        fasohah: fasohahElement.value,
        ulasan: "Rekod Tasmik Smart 2050"
    };

    // Simpan Offline & Sync
    let queue = JSON.parse(localStorage.getItem('tasmik_queue')) || [];
    queue.push(payload);
    localStorage.setItem('tasmik_queue', JSON.stringify(queue));

    alert(`Alhamdulillah! Rekod ${surahTerpilih} disimpan untuk ${namaPeserta}.`);
    
    if (navigator.onLine) await syncNow();
}

async function syncNow() {
    let queue = JSON.parse(localStorage.getItem('tasmik_queue')) || [];
    if (queue.length === 0) return;

    for (let i = 0; i < queue.length; i++) {
        try {
            await fetch(GAS_URL, {
                method: 'POST',
                mode: 'no-cors',
                body: JSON.stringify(queue[i])
            });
        } catch (e) { console.error("Sync error:", e); }
    }
    localStorage.removeItem('tasmik_queue');
}
