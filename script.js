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
    "1": [
        { nama: "An-Naas", ayat: 6, ms: 604 }, { nama: "Al-Falaq", ayat: 5, ms: 604 },
        { nama: "Al-Ikhlas", ayat: 4, ms: 604 }, { nama: "Al-Masad", ayat: 5, ms: 603 },
        { nama: "An-Nasr", ayat: 3, ms: 603 }, { nama: "Al-Kafirun", ayat: 6, ms: 603 },
        { nama: "Al-Kauthar", ayat: 3, ms: 602 }, { nama: "Al-Ma\u0027uun", ayat: 7, ms: 602 },
        { nama: "Quraisy", ayat: 4, ms: 602 }, { nama: "Al-Fil", ayat: 5, ms: 601 },
        { nama: "Al-Humazah", ayat: 9, ms: 601 }, { nama: "Al-\u0027Asr", ayat: 3, ms: 601 }
    ],
    "2": [
        { nama: "At-Takathur", ayat: 8, ms: 600 }, { nama: "Al-Qori\u0027ah", ayat: 11, ms: 600 },
        { nama: "Al-\u0027Aadiyaat", ayat: 11, ms: 599 }, { nama: "Az-Zalzalah", ayat: 8, ms: 599 },
        { nama: "Al-Bayyinah", ayat: 8, ms: 598 }, { nama: "Al-Qadr", ayat: 5, ms: 598 },
        { nama: "Al-\u0027Alaq", ayat: 19, ms: 597 }, { nama: "At-Tin", ayat: 8, ms: 597 },
        { nama: "Asy-Syarh", ayat: 8, ms: 596 }, { nama: "Adh-Dhuha", ayat: 11, ms: 596 }
    ],
    "3": [
        { nama: "Asy-Syams", ayat: 15, ms: 595 }, { nama: "Al-Lail", ayat: 21, ms: 595 },
        { nama: "Al-Balad", ayat: 20, ms: 594 }, { nama: "Al-Ghaasyiah", ayat: 26, ms: 592 },
        { nama: "Al-A\u0027laa", ayat: 19, ms: 591 }, { nama: "At-Tariq", ayat: 17, ms: 591 },
        { nama: "Al-Infithor", ayat: 19, ms: 587 }
    ],
    "4": [
        { nama: "Al-Buruj", ayat: 22, ms: 590 }, { nama: "Al-Insyiqaq", ayat: 25, ms: 589 },
        { nama: "At-Takwir", ayat: 29, ms: 586 }, { nama: "Abasa", ayat: 42, ms: 585 }
    ],
    "5": [
        { nama: "Al-Muthoffifin", ayat: 36, ms: 587 }, { nama: "Al-Fajr", ayat: 30, ms: 593 },
        { nama: "An-Nazi\u0027aat", ayat: 46, ms: 583 }, { nama: "An-Naba\u0027", ayat: 40, ms: 582 }
    ],
    "6": [
        { nama: "As-Sajadah", ayat: 30, ms: 415 }, { nama: "Al-Mulk", ayat: 30, ms: 562 },
        { nama: "Al-Insaan", ayat: 31, ms: 578 }, { nama: "Ar-Rahmaan", ayat: 78, ms: 531 },
        { nama: "Al-Waqi\u0027ah", ayat: 96, ms: 534 }, { nama: "Yaasin", ayat: 83, ms: 440 },
        { nama: "Ad-Dukhaan", ayat: 59, ms: 496 }, { nama: "Al-Hasyr", ayat: 24, ms: 545 },
        { nama: "Al-Jumu\u0027ah", ayat: 11, ms: 553 }, { nama: "Al-Kahfi", ayat: 110, ms: 293 }
    ],
    "7": [
        { nama: "Muraja\u0027ah Tahap 1", ayat: 1, ms: 601 },
        { nama: "Muraja\u0027ah Tahap 2", ayat: 1, ms: 596 },
        { nama: "Muraja\u0027ah Tahap 3", ayat: 1, ms: 587 },
        { nama: "Muraja\u0027ah Tahap 4", ayat: 1, ms: 585 },
        { nama: "Muraja\u0027ah Tahap 5", ayat: 1, ms: 582 },
        { nama: "Muraja\u0027ah Tahap 6", ayat: 1, ms: 1 },
        { nama: "Input Manual", ayat: 1, ms: 1 }
    ]
};

let surahTerpilih = "";

window.onload = () => {
    populatePeserta();
    renderSilibus(); 
};

function populatePeserta() {
    const select = document.getElementById('nama-select');
    if(!select) return;
    const sorted = [...dataPeserta].sort((a, b) => a.umur - b.umur); 
    select.innerHTML = sorted.map(p => 
        `<option value="${p.nama}">${p.nama} (${p.umur} Thn)</option>`
    ).join('');
}

// LOGIK RENDER BASE64 (MENGATASI RALAT TANDA CALIT)
function renderSilibus() {
    const tahap = document.getElementById('tahap-select').value;
    const surahGrid = document.getElementById('silibus-display'); 
    if(!surahGrid) return;
    const data = silibusData[tahap] || [];

    surahGrid.innerHTML = data.map((s) => {
        const safeData = btoa(unescape(encodeURIComponent(JSON.stringify(s))));
        return `
            <div class="num-btn" 
                 style="font-size:0.75rem; padding:12px 5px;" 
                 onclick="decodeKlik('${safeData}', this)">
                ${s.nama}
            </div>
        `;
    }).join('');
}

function decodeKlik(encodedData, elemen) {
    const decodedString = decodeURIComponent(escape(atob(encodedData)));
    const surahObj = JSON.parse(decodedString);
    pilihSurah(surahObj, elemen);
}

function pilihSurah(surahObj, elemen) {
    const parent = elemen.parentElement;
    parent.querySelectorAll('.num-btn').forEach(b => b.classList.remove('active'));
    elemen.classList.add('active');
    
    surahTerpilih = surahObj.nama;
    const msInput = document.getElementById('muka-surat-input');
    if(msInput) msInput.value = surahObj.ms;

    const mulaSelect = document.getElementById('ayat-mula-select');
    const akhirSelect = document.getElementById('ayat-akhir-select');
    
    if(mulaSelect && akhirSelect) {
        mulaSelect.innerHTML = '';
        akhirSelect.innerHTML = '';
        let julatAyat = (surahObj.ayat > 1) ? surahObj.ayat : 150;
        for (let i = 1; i <= julatAyat; i++) {
            mulaSelect.add(new Option(i, i));
            akhirSelect.add(new Option(i, i));
        }
        akhirSelect.value = (surahObj.ayat > 1) ? surahObj.ayat : 1;
    }
}

async function hantarRekod() {
    const namaPeserta = document.getElementById('nama-select').value;
    const tahap = document.getElementById('tahap-select').value;
    const tajwidVal = document.querySelector('input[name="tajwid"]:checked')?.value;
    const fasohahVal = document.querySelector('input[name="fasohah"]:checked')?.value;
    const msPilihan = document.getElementById('muka-surat-input').value;
    const ayatMula = document.getElementById('ayat-mula-select').value;
    const ayatAkhir = document.getElementById('ayat-akhir-select').value;

    if (!surahTerpilih) return alert("Sila pilih Surah!");
    if (!msPilihan) return alert("Sila isi Muka Surat!");
    if (!tajwidVal || !fasohahVal) return alert("Sila beri markah!");

    const payload = {
        ustaz: pembimbingInfo.nama,
        peserta: namaPeserta,
        jantina: pembimbingInfo.jantina,
        jenis_bacaan: (tahap === "7") ? "Muraja'ah" : "Tasmik",
        tahap: "TAHAP " + tahap,
        surah: surahTerpilih,
        mukasurat: msPilihan,
        ayat_range: `${ayatMula}-${ayatAkhir}`,
        tajwid: tajwidVal,
        fasohah: fasohahVal,
        ulasan: "Rekod Tasmik Smart 2050"
    };

    let queue = JSON.parse(localStorage.getItem('tasmik_queue')) || [];
    queue.push(payload);
    localStorage.setItem('tasmik_queue', JSON.stringify(queue));

    alert(`Rekod ${surahTerpilih} disimpan!`);
    if (navigator.onLine) await syncNow();
}

async function syncNow() {
    let queue = JSON.parse(localStorage.getItem('tasmik_queue')) || [];
    if (queue.length === 0) return;
    const statusText = document.getElementById('sync-status');
    if(statusText) statusText.innerText = "⏳ Menghantar data...";

    for (let i = 0; i < queue.length; i++) {
        try {
            await fetch(GAS_URL, {
                method: 'POST',
                mode: 'no-cors',
                body: JSON.stringify(queue[i])
            });
        } catch (e) { 
            if(statusText) statusText.innerText = "❌ Gagal hantar.";
            return;
        }
    }
    localStorage.removeItem('tasmik_queue');
    if(statusText) statusText.innerText = "✅ Semua data telah dihantar!";
}
