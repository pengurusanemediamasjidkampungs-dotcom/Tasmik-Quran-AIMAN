// ==========================================
// CONFIGURATION
// ==========================================
const GAS_URL = "https://script.google.com/macros/s/AKfycbw5tyY3rrQFkGisxuE-pAc-Ii2Z4G2GYyUyvS6NeTSlrpKhlQ4aFEaWC-5ujnXCa9u1Ag/exec";

const pembimbingInfo = {
    nama: "MUHAMMAD AIMAN BIN MOHD RAFEE",
    jantina: "PEREMPUAN" // Bot Perempuan akan digunakan secara automatik
};

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

const silibusData = {
    "1": [
        { nama: "An-Naas", ayat: "1-6", ms: 604 }, { nama: "Al-Falaq", ayat: "1-5", ms: 604 },
        { nama: "Al-Ikhlas", ayat: "1-4", ms: 604 }, { nama: "Al-Masad", ayat: "1-5", ms: 603 },
        { nama: "An-Nasr", ayat: "1-3", ms: 603 }, { nama: "Al-Kafirun", ayat: "1-6", ms: 603 },
        { nama: "Al-Kauthar", ayat: "1-3", ms: 602 }, { nama: "Al-Ma'uun", ayat: "1-7", ms: 602 },
        { nama: "Quraisy", ayat: "1-4", ms: 602 }, { nama: "Al-Fil", ayat: "1-5", ms: 601 },
        { nama: "Al-Humazah", ayat: "1-9", ms: 601 }, { nama: "Al-'Asr", ayat: "1-3", ms: 601 }
    ],
    // ... Tambah Tahap 2-5 seperti sebelumnya ...
    "6": [
        { nama: "Al-Mulk", ayat: "1-30", ms: 562 }, { nama: "Yaasin", ayat: "1-83", ms: 440 },
        { nama: "Al-Kahfi", ayat: "1-110", ms: 293 }
    ]
};

// ==========================================
// FUNCTIONS
// ==========================================

window.onload = () => {
    populatePeserta();
    renderSilibus();
};

function populatePeserta() {
    const select = document.getElementById('nama-select');
    const sorted = dataPeserta.sort((a, b) => a.umur - b.umur); // Smart Sorting
    select.innerHTML = sorted.map(p => `<option value="${p.nama}">${p.nama} (${p.umur} Thn)</option>`).join('');
}

function renderSilibus() {
    const tahap = document.getElementById('tahap-select').value;
    const grid = document.getElementById('silibus-display');
    const data = silibusData[tahap] || [];

    grid.innerHTML = data.map(s => `
        <div class="surah-card glass-card">
            <div class="tahap-badge">TAHAP ${tahap}</div>
            <h3>${s.nama}</h3>
            <p>M/S ${s.ms} | Ayat ${s.ayat}</p>
            
            <div class="skor-input">
                <label>Tajwid (1-5):</label>
                <input type="number" id="t-${s.nama}" min="1" max="5" value="5">
                <label>Fasohah (1-5):</label>
                <input type="number" id="f-${s.nama}" min="1" max="5" value="5">
            </div>

            <button class="btn-check" onclick="hantarRekod('${s.nama}', '${tahap}', '${s.ms}', '${s.ayat}')">
                SIMPAN & NOTIFY
            </button>
        </div>
    `).join('');
}

async function hantarRekod(surah, tahap, ms, ayat) {
    const namaPeserta = document.getElementById('nama-select').value;
    const tajwid = document.getElementById(`t-${surah}`).value;
    const fasohah = document.getElementById(`f-${surah}`).value;

    // Mematuhi format JSON yang diperlukan oleh Code.gs anda
    const payload = {
        ustaz: pembimbingInfo.nama,
        peserta: namaPeserta,
        jantina: pembimbingInfo.jantina,
        jenis_bacaan: "Tasmik",
        tahap: "TAHAP " + tahap,
        surah: surah,
        mukasurat: ms,
        ayat_range: ayat,
        tajwid: tajwid,
        fasohah: fasohah,
        ulasan: "Selesai tasmik secara digital."
    };

    // Simpan Offline
    let queue = JSON.parse(localStorage.getItem('tasmik_queue')) || [];
    queue.push(payload);
    localStorage.setItem('tasmik_queue', JSON.stringify(queue));

    alert("Rekod disimpan dalam telefon!");
    
    // Sync ke GAS
    if (navigator.onLine) {
        await syncNow();
    }
}

async function syncNow() {
    let queue = JSON.parse(localStorage.getItem('tasmik_queue')) || [];
    if (queue.length === 0) return;

    for (let item of queue) {
        try {
            await fetch(GAS_URL, {
                method: 'POST',
                mode: 'no-cors',
                body: JSON.stringify(item)
            });
        } catch (e) { console.log("Sync delay..."); }
    }
    localStorage.removeItem('tasmik_queue');
    alert("Semua rekod telah dihantar ke Telegram & Google Sheets!");
}
