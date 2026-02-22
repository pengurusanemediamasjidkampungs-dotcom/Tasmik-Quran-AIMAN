/**
 * TASMIK QURAN DIGITAL 2026 - CORE ENGINE (ULTRA PRO V7.0)
 * ---------------------------------------------------
 * Integrasi: GitHub Pages + Google Apps Script (Backend)
 * Security: Telegram Token moved to GAS (Server-Side)
 * Updates: Tahap 7 Support & Audio Base64 Forwarding
 */

// 1. KONFIGURASI GLOBAL
const CONFIG = {
    GAS_URL: "https://script.google.com/macros/s/AKfycbw5tyY3rrQFkGisxuE-pAc-Ii2Z4G2GYyUyvS6NeTSlrpKhlQ4aFEaWC-5ujnXCa9u1Ag/exec",
    FILES: {
        LELAKI: "./peserta_lelaki.hjson",
        PEREMPUAN: "./peserta_perempuan.hjson",
        SILIBUS: "./silibus.hjson"
    }
};

// 2. STATE MANAGEMENT
let state = {
    currentUstaz: localStorage.getItem('ustaz_nama') || "USTAZ AIMAN",
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
        tajwid: "3",
        fasohah: "3"
    },
    isRecording: false,
    audioBlob: null,
    mediaRecorder: null,
    audioChunks: []
};

// 3. INITIALIZATION
document.addEventListener('DOMContentLoaded', async () => {
    console.log("🚀 AIMAN PRO System Initializing...");
    updateUstazUI();
    await loadInitialData();
    setupEventListeners();
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
        console.log("✅ Data HJSON Loaded");
    } catch (err) {
        console.error("❌ Load Error:", err.message);
    }
}

// 5. UI RENDERING
function renderPesertaPicker() {
    const jantina = document.getElementById('jantina')?.value || "LELAKI";
    const senarai = jantina === "LELAKI" ? state.dataPesertaLelaki : state.dataPesertaPerempuan;
    const wrapper = document.getElementById('peserta-wrapper');
    if(!wrapper) return;
    wrapper.innerHTML = "";

    senarai.forEach((p, index) => {
        const item = createWheelItem(p.nama, () => {
            state.selected.peserta = p.nama;
            highlightSelected('peserta-wrapper', index);
        });
        wrapper.appendChild(item);
        if(index === 0) item.click();
    });
}

function renderTahapPicker() {
    const wrapper = document.getElementById('tahap-wrapper');
    if(!wrapper) return;
    wrapper.innerHTML = "";

    const senaraiTahap = ["1", "2", "3", "4", "5", "6", "7"];
    
    senaraiTahap.forEach((t, index) => {
        const item = createWheelItem(`TAHAP ${t}`, () => {
            state.selected.tahap = t;
            highlightSelected('tahap-wrapper', index);
            
            // Logik Tahap 7 (Muraja'ah)
            const modeContainer = document.getElementById('mode-selector-container');
            if (t === "7") {
                modeContainer.classList.remove('d-none');
                setMode(false); // Default Auto
            } else {
                modeContainer.classList.add('d-none');
                setMode(false);
                renderSurahPicker(t);
            }
        });
        wrapper.appendChild(item);
        if(index === 0) item.click();
    });
}

function setMode(manual) {
    state.isManualMode = manual;
    const btnAuto = document.getElementById('btn-mode-auto');
    const btnManual = document.getElementById('btn-mode-manual');
    const surahInput = document.getElementById('surah-wrapper');
    const mukaInput = document.getElementById('muka');

    if (manual) {
        btnManual.classList.add('active');
        btnAuto.classList.remove('active');
        mukaInput.classList.add('manual-active');
        // Tukar Surah Picker kepada "Input Manual" jika perlu atau biarkan
    } else {
        btnAuto.classList.add('active');
        btnManual.classList.remove('active');
        mukaInput.classList.remove('manual-active');
        renderSurahPicker(state.selected.tahap);
    }
}

function renderSurahPicker(tahap) {
    const wrapper = document.getElementById('surah-wrapper');
    if(!wrapper) return;
    wrapper.innerHTML = "";
    
    let senaraiSurah = state.dataSilibus[tahap] || [];

    senaraiSurah.forEach((s, index) => {
        const item = createWheelItem(`${s.nama} <small>(m/s ${s.ms})</small>`, () => {
            state.selected.surah = s.nama;
            document.getElementById('muka').value = s.ms;
            document.getElementById('ayat_range').value = `1-${s.ayat || '?'}`;
            highlightSelected('surah-wrapper', index);
        });
        wrapper.appendChild(item);
        if(index === 0) item.click();
    });
}

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
    div.onclick = () => { onClick(); div.scrollIntoView({ behavior: 'smooth', inline: 'center' }); };
    return div;
}

function highlightSelected(wrapperId, index) {
    const items = document.getElementById(wrapperId).children;
    Array.from(items).forEach(item => item.classList.remove('selected'));
    if(items[index]) items[index].classList.add('selected');
}

// 6. AUDIO ENGINE
async function toggleRecording() {
    const btn = document.getElementById('recordBtn');
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
            };
            state.mediaRecorder.start();
            state.isRecording = true;
            btn.classList.add('recording');
        } catch (err) { alert("Mikrofon ralat!"); }
    } else {
        state.mediaRecorder.stop();
        state.isRecording = false;
        btn.classList.remove('recording');
    }
}

// 7. SUBMISSION (SECURE FORWARDING)
async function hantarTasmik() {
    const btn = document.getElementById('submitBtn');
    const overlay = document.getElementById('statusOverlay');
    
    let audioBase64 = null;
    if (state.audioBlob) {
        audioBase64 = await new Promise(r => {
            const reader = new FileReader();
            reader.onloadend = () => r(reader.result.split(',')[1]);
            reader.readAsDataURL(state.audioBlob);
        });
    }

    const payload = {
        ustaz: state.currentUstaz,
        peserta: state.selected.peserta,
        tahap: "Tahap " + state.selected.tahap,
        surah: state.selected.surah,
        mukasurat: document.getElementById('muka').value,
        ayat_range: document.getElementById('ayat_range').value,
        tajwid: state.selected.tajwid,
        fasohah: state.selected.fasohah,
        ulasan: document.getElementById('catatan').value,
        audioData: audioBase64
    };

    if(!payload.peserta || !payload.mukasurat) return alert("Lengkapkan borang!");

    btn.disabled = true;
    overlay.classList.remove('d-none');

    try {
        await fetch(CONFIG.GAS_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify(payload)
        });
        alert("✅ Rekod berjaya dihantar!");
        location.reload();
    } catch (e) {
        alert("Ralat!");
        btn.disabled = false;
        overlay.classList.add('d-none');
    }
}

// 8. UTILS
function updateUstazUI() {
    const floatSmall = document.querySelector('.pentashih-float small');
    if(floatSmall) floatSmall.innerHTML = `PENTASHIH<br>${state.currentUstaz.replace("USTAZ ", "")}`;
}

function toggleUstaz() {
    state.currentUstaz = state.currentUstaz.includes("AIMAN") ? "USTAZ NUAIM" : "USTAZ AIMAN";
    localStorage.setItem('ustaz_nama', state.currentUstaz);
    updateUstazUI();
}

function setupEventListeners() {
    document.getElementById('jantina').addEventListener('change', renderPesertaPicker);
    document.getElementById('btn-mode-auto').onclick = () => setMode(false);
    document.getElementById('btn-mode-manual').onclick = () => setMode(true);
}
