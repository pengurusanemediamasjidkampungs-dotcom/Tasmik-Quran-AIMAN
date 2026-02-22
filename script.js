/**
 * TASMIK QURAN DIGITAL 2026 - CORE ENGINE (ULTRA PRO V3.0)
 * ---------------------------------------------------
 * Integrasi: GitHub Pages + Google Apps Script + Telegram Bot
 * Versi Khusus: USTAZ AIMAN (Zon Muraja'ah + Manual Mode)
 */

// 1. KONFIGURASI GLOBAL
const CONFIG = {
    GAS_URL: "https://script.google.com/macros/s/AKfycbw5tyY3rrQFkGisxuE-pAc-Ii2Z4G2GYyUyvS6NeTSlrpKhlQ4aFEaWC-5ujnXCa9u1Ag/exec",
    BOT_TOKEN: "8154726215:AAG-Pa2UNRHBxP0-j3fffQJ0rMBE8hZt5Rw",
    CHAT_ID: "-1003513910680",
    FILES: {
        LELAKI: "./peserta_lelaki.hjson",
        PEREMPUAN: "./peserta_perempuan.hjson",
        SILIBUS: "./silibus.hjson"
    }
};

// 2. STATE MANAGEMENT
let state = {
    currentUstaz: "USTAZ AIMAN",
    dataPesertaLelaki: [],
    dataPesertaPerempuan: [],
    dataSilibus: {},
    isManualMode: false,
    selected: {
        peserta: "",
        jantina: "LELAKI",
        tahap: "1",
        surah: "",
        muka: "",
        tajwid: "5",
        fasohah: "5"
    },
    isRecording: false,
    audioBlob: null,
    mediaRecorder: null,
    audioChunks: []
};

// 3. INITIALIZATION
document.addEventListener('DOMContentLoaded', async () => {
    console.log("🚀 System Initializing for AIMAN...");
    await loadInitialData();
    setupEventListeners();
    setupModeSwitcher();
    renderTahapPicker();
    renderRatingPickers();
});

// 4. DATA LOADING
async function loadInitialData() {
    const ts = new Date().getTime(); 
    try {
        const [resL, resP, resS] = await Promise.all([
            fetch(`${CONFIG.FILES.LELAKI}?v=${ts}`),
            fetch(`${CONFIG.FILES.PEREMPUAN}?v=${ts}`),
            fetch(`${CONFIG.FILES.SILIBUS}?v=${ts}`)
        ]);

        state.dataPesertaLelaki = Hjson.parse(await resL.text());
        state.dataPesertaPerempuan = Hjson.parse(await resP.text());
        state.dataSilibus = Hjson.parse(await resS.text());

        renderPesertaPicker();
        console.log("✅ Data Loaded");
    } catch (err) {
        console.error("❌ Load Error:", err);
        alert("Gagal memuatkan data. Sila refresh.");
    }
}

// 5. UI RENDERING
function renderPesertaPicker() {
    const jantina = document.getElementById('jantina').value;
    state.selected.jantina = jantina;
    const senarai = jantina === "LELAKI" ? state.dataPesertaLelaki : state.dataPesertaPerempuan;
    const wrapper = document.getElementById('peserta-wrapper');
    wrapper.innerHTML = "";

    senarai.forEach((p, index) => {
        const item = createWheelItem(p.nama, () => {
            state.selected.peserta = p.nama;
            highlightSelected('peserta-wrapper', index);
        });
        wrapper.appendChild(item);
    });
}

function renderTahapPicker() {
    const wrapper = document.getElementById('tahap-wrapper');
    wrapper.innerHTML = "";
    const tahaps = ["1", "2", "3", "4", "5", "6", "7"];
    
    tahaps.forEach((t, index) => {
        const item = createWheelItem(`TAHAP ${t}`, () => {
            state.selected.tahap = t;
            highlightSelected('tahap-wrapper', index);
            
            // Logik Switcher Tahap 7
            const switcher = document.getElementById('mode-selector-container');
            if(t === "7") {
                switcher.classList.remove('d-none');
            } else {
                switcher.classList.add('d-none');
                setManualMode(false); // Reset ke auto jika tukar tahap lain
            }
            
            renderSurahPicker(t);
        });
        wrapper.appendChild(item);
        if(index === 0) item.click();
    });
}

function renderSurahPicker(tahap) {
    const wrapper = document.getElementById('surah-wrapper');
    wrapper.innerHTML = "";
    let senaraiSurah = state.dataSilibus[tahap] || [];

    senaraiSurah.forEach((s, index) => {
        const item = createWheelItem(s.nama, () => {
            state.selected.surah = s.nama;
            highlightSelected('surah-wrapper', index);
            
            // Auto-fill jika bukan manual mode
            if(!state.isManualMode) {
                document.getElementById('muka').value = s.ms;
                // Jika tahap 7, guna input ayat_range, jika lain guna ayat_mula/akhir (ikut UI asal)
                const inputAyat = document.getElementById('ayat_range') || document.getElementById('ayat_akhir');
                if(inputAyat) inputAyat.value = s.ayat;
                if(document.getElementById('ayat_mula')) document.getElementById('ayat_mula').value = 1;
            }
        });
        wrapper.appendChild(item);
    });
}

// 6. MODE SWITCHER LOGIC
function setupModeSwitcher() {
    const btnAuto = document.getElementById('btn-mode-auto');
    const btnManual = document.getElementById('btn-mode-manual');
    if(!btnAuto || !btnManual) return;

    btnAuto.onclick = () => setManualMode(false);
    btnManual.onclick = () => setManualMode(true);
}

function setManualMode(isManual) {
    state.isManualMode = isManual;
    const btnAuto = document.getElementById('btn-mode-auto');
    const btnManual = document.getElementById('btn-mode-manual');
    const inputAyat = document.getElementById('ayat_range');
    const inputMuka = document.getElementById('muka');

    if(isManual) {
        btnManual.classList.add('active');
        btnAuto.classList.remove('active');
        inputAyat.classList.add('manual-active');
        inputAyat.value = "";
        inputMuka.value = "";
        inputAyat.focus();
    } else {
        btnAuto.classList.add('active');
        btnManual.classList.remove('active');
        inputAyat.classList.remove('manual-active');
        // Trigger balik auto-fill dari surah terpilih
        renderSurahPicker(state.selected.tahap);
    }
}

// 7. RATING & UTILS
function renderRatingPickers() {
    ['tajwid', 'fasohah'].forEach(type => {
        const wrapper = document.getElementById(`${type}-wrapper`);
        if(!wrapper) return;
        wrapper.innerHTML = "";
        for(let i=1; i<=5; i++) {
            const item = createWheelItem(i, () => {
                state.selected[type] = i.toString();
                highlightSelected(`${type}-wrapper`, i-1);
            });
            wrapper.appendChild(item);
            if(i === 5) item.click(); // Default 5 star
        }
    });
}

function createWheelItem(content, onClick) {
    const div = document.createElement('div');
    div.className = 'wheel-item';
    div.innerHTML = content;
    div.onclick = () => {
        onClick();
        div.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    };
    return div;
}

function highlightSelected(wrapperId, index) {
    const el = document.getElementById(wrapperId);
    if(!el) return;
    Array.from(el.children).forEach(item => item.classList.remove('selected'));
    if(el.children[index]) el.children[index].classList.add('selected');
}

// 8. RECORDING ENGINE
async function toggleRecording() {
    const btn = document.getElementById('recordBtn');
    const statusText = document.getElementById('recordStatus');

    if (!state.isRecording) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            state.mediaRecorder = new MediaRecorder(stream);
            state.audioChunks = [];
            state.mediaRecorder.ondataavailable = e => state.audioChunks.push(e.data);
            state.mediaRecorder.onstop = () => {
                state.audioBlob = new Blob(state.audioChunks, { type: 'audio/ogg; codecs=opus' });
                document.getElementById('audioPlayback').src = URL.createObjectURL(state.audioBlob);
                document.getElementById('audio-container').classList.remove('d-none');
                statusText.innerText = "RAKAMAN SEDIA";
            };
            state.mediaRecorder.start();
            state.isRecording = true;
            btn.classList.add('recording');
            statusText.innerText = "MERAKAM...";
        } catch (err) { alert("Mikrofon diperlukan!"); }
    } else {
        state.mediaRecorder.stop();
        state.isRecording = false;
        btn.classList.remove('recording');
        statusText.innerText = "KLIK UNTUK RAKAM";
    }
}

// 9. SUBMISSION
async function hantarTasmik() {
    const btn = document.getElementById('submitBtn');
    const payload = {
        ustaz: state.currentUstaz,
        peserta: state.selected.peserta,
        jenis_bacaan: document.getElementById('jenis_bacaan').value,
        tahap: "Tahap " + state.selected.tahap,
        surah: state.selected.surah,
        mukasurat: document.getElementById('muka').value,
        ayat: document.getElementById('ayat_range') ? document.getElementById('ayat_range').value : `${document.getElementById('ayat_mula').value}-${document.getElementById('ayat_akhir').value}`,
        tajwid: state.selected.tajwid,
        fasohah: state.selected.fasohah,
        ulasan: document.getElementById('catatan').value || "-"
    };

    if (!payload.peserta || !payload.mukasurat) return alert("Sila lengkapkan pilihan!");
    
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> MENGHANTAR...';

    try {
        // 1. Google Sheets
        await fetch(CONFIG.GAS_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(payload) });

        // 2. Telegram
        const formData = new FormData();
        formData.append('chat_id', CONFIG.CHAT_ID);
        const caption = `🎙️ *REKOD TASMIK DIGITAL (AIMAN)*\n` +
                        `──────────────────\n` +
                        `👤 *Nama:* ${payload.peserta}\n` +
                        `📖 *Surah:* ${payload.surah}\n` +
                        `📄 *Muka:* ${payload.mukasurat}\n` +
                        `🔢 *Ayat:* ${payload.ayat}\n` +
                        `✨ *T:* ${payload.tajwid} | *F:* ${payload.fasohah}\n` +
                        `🎙️ *Ustaz:* AIMAN`;
        
        if (state.audioBlob) {
            formData.append('voice', state.audioBlob, 'tasmik.ogg');
            formData.append('caption', caption);
            formData.append('parse_mode', 'Markdown');
            await fetch(`https://api.telegram.org/bot${CONFIG.BOT_TOKEN}/sendVoice`, { method: 'POST', body: formData });
        } else {
            // Hantar text sahaja jika tiada audio
            await fetch(`https://api.telegram.org/bot${CONFIG.BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ chat_id: CONFIG.CHAT_ID, text: caption, parse_mode: 'Markdown' })
            });
        }

        alert("✅ Rekod Berjaya Dihantar!");
        location.reload();
    } catch (err) {
        alert("Ralat! Sila cuba lagi.");
        btn.disabled = false;
    }
}

function setupEventListeners() {
    document.getElementById('jantina').addEventListener('change', renderPesertaPicker);
}

window.onload = loadInitialData;
