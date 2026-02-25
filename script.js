// ==========================================
// CONFIGURATION & DATA
// ==========================================
const GAS_URL = "URL_WEB_APP_GAS_ANDA"; // Masukkan URL GAS anda di sini

// Data Peserta (Berdasarkan senarai Kumpulan Perempuan anda)
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

// Data Silibus Tasmik 
const silibusData = {
    "1": [
        { nama: "An-Naas", ayat: 6, ms: 604 }, { nama: "Al-Falaq", ayat: 5, ms: 604 },
        { nama: "Al-Ikhlas", ayat: 4, ms: 604 }, { nama: "Al-Masad", ayat: 5, ms: 603 },
        { nama: "An-Nasr", ayat: 3, ms: 603 }, { nama: "Al-Kafirun", ayat: 6, ms: 603 },
        { nama: "Al-Kauthar", ayat: 3, ms: 602 }, { nama: "Al-Ma'uun", ayat: 7, ms: 602 },
        { nama: "Quraisy", ayat: 4, ms: 602 }, { nama: "Al-Fil", ayat: 5, ms: 601 },
        { nama: "Al-Humazah", ayat: 9, ms: 601 }, { nama: "Al-'Asr", ayat: 3, ms: 601 }
    ],
    "2": [
        { nama: "At-Takathur", ayat: 8, ms: 600 }, { nama: "Al-Qori'ah", ayat: 11, ms: 600 },
        { nama: "Al-'Aadiyaat", ayat: 11, ms: 599 }, { nama: "Az-Zalzalah", ayat: 8, ms: 599 },
        { nama: "Al-Bayyinah", ayat: 8, ms: 598 }, { nama: "Al-Qadr", ayat: 5, ms: 598 },
        { nama: "Al-'Alaq", ayat: 19, ms: 597 }, { nama: "At-Tin", ayat: 8, ms: 597 },
        { nama: "Asy-Syarh", ayat: 8, ms: 596 }, { nama: "Adh-Dhuha", ayat: 11, ms: 596 }
    ],
    "3": [
        { nama: "Asy-Syams", ayat: 15, ms: 595 }, { nama: "Al-Lail", ayat: 21, ms: 595 },
        { nama: "Al-Balad", ayat: 20, ms: 594 }, { nama: "Al-Ghaasyiah", ayat: 26, ms: 592 },
        { nama: "Al-A'laa", ayat: 19, ms: 591 }, { nama: "At-Tariq", ayat: 17, ms: 591 },
        { nama: "Al-Infithor", ayat: 19, ms: 587 }
    ],
    "4": [
        { nama: "Al-Buruj", ayat: 22, ms: 590 }, { nama: "Al-Insyiqaq", ayat: 25, ms: 589 },
        { nama: "At-Takwir", ayat: 29, ms: 586 }, { nama: "Abasa", ayat: 42, ms: 585 }
    ],
    "5": [
        { nama: "Al-Muthoffifin", ayat: 36, ms: 587 }, { nama: "Al-Fajr", ayat: 30, ms: 593 },
        { nama: "An-Nazi'aat", ayat: 46, ms: 583 }, { nama: "An-Naba'", ayat: 40, ms: 582 }
    ],
    "6": [
        { nama: "As-Sajadah", ayat: 30, ms: 415 }, { nama: "Al-Mulk", ayat: 30, ms: 562 },
        { nama: "Al-Insaan", ayat: 31, ms: 578 }, { nama: "Ar-Rahmaan", ayat: 78, ms: 531 },
        { nama: "Al-Waqi'ah", ayat: 96, ms: 534 }, { nama: "Yaasin", ayat: 83, ms: 440 },
        { nama: "Ad-Dukhaan", ayat: 59, ms: 496 }, { nama: "Al-Hasyr", ayat: 24, ms: 545 },
        { nama: "Al-Jumu'ah", ayat: 11, ms: 553 }, { nama: "Al-Kahfi", ayat: 110, ms: 293 }
    ]
};

// ==========================================
// CORE FUNCTIONS
// ==========================================

// 1. Inisialisasi Aplikasi
window.onload = () => {
    registerServiceWorker();
    populatePesertaDropdown();
    renderSilibus();
};

// 2. Register Service Worker (PWA Offline)
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(() => console.log("PWA: Service Worker Aktif"))
            .catch(err => console.error("PWA: Gagal", err));
    }
}

// 3. Papar Senarai Peserta (Sorted by Umur - Smart Algorithm)
function populatePesertaDropdown() {
    const select = document.getElementById('nama-select');
    // Algorithm: Susun umur dari paling muda [cite: 2026-01-24]
    const sortedPeserta = dataPeserta.sort((a, b) => a.umur - b.umur);

    select.innerHTML = sortedPeserta.map(p => 
        `<option value="${p.nama}" data-umur="${p.umur}">${p.nama} (${p.umur} Thn)</option>`
    ).join('');
}

// 4. Render Kad Silibus (Tahap 1-6)
function renderSilibus() {
    const tahap = document.getElementById('tahap-select').value;
    const grid = document.getElementById('silibus-display');
    const data = silibusData[tahap] || [];

    grid.innerHTML = data.map(s => `
        <div class="surah-card glass-card">
            <div class="tahap-badge">TAHAP ${tahap}</div>
            <h3>${s.nama}</h3>
            <p>${s.ayat} Ayat | M/S ${s.ms}</p>
            <button class="btn-check" onclick="simpanRekod('${s.nama}', '${tahap}')">Tanda Selesai</button>
        </div>
    `).join('');
}

// 5. Simpan Rekod (Offline First)
function simpanRekod(surah, tahap) {
    const select = document.getElementById('nama-select');
    const nama = select.value;
    const umur = select.options[select.selectedIndex].getAttribute('data-umur');

    const record = {
        pembimbing: "MUHAMMAD AIMAN BIN MOHD RAFEE",
        nama: nama,
        umur: umur,
        tahap: tahap,
        surah: surah,
        tarikh: new Date().toLocaleString('ms-MY')
    };

    // Simpan ke Cache LocalStorage
    let queue = JSON.parse(localStorage.getItem('tasmik_sync_queue')) || [];
    queue.push(record);
    localStorage.setItem('tasmik_sync_queue', JSON.stringify(queue));

    alert(`Tasmik ${surah} untuk ${nama} disimpan!`);
    syncKeGAS(); // Cuba hantar jika ada internet
}

// 6. Sync ke Google Apps Script (Cloud)
async function syncKeGAS() {
    if (!navigator.onLine) return;

    let queue = JSON.parse(localStorage.getItem('tasmik_sync_queue')) || [];
    if (queue.length === 0) return;

    try {
        // Gunakan mode: 'no-cors' untuk GAS
        await fetch(GAS_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify(queue)
        });
        
        localStorage.removeItem('tasmik_sync_queue');
        console.log("Sync Berjaya!");
    } catch (err) {
        console.error("Sync Gagal:", err);
    }
}

// Pantau status internet
window.addEventListener('online', syncKeGAS);
