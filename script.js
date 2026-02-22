/**
 * TASMIK QURAN DIGITAL 2026 - CORE ENGINE (ULTRA PRO V7.0)
 * ---------------------------------------------------
 * Integrasi: GitHub Pages + Google Apps Script (Backend)
 * Security: SEMUA TOKEN DIALIHKAN KE GAS (SERVER-SIDE)
 */

// 1. KONFIGURASI GLOBAL
const CONFIG = {
    // Pastikan URL GAS ini adalah yang terkini selepas New Deployment
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
    console.log("🚀 System Initializing...");
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
    const jSelect = document.getElementById('jantina');
    const jantina = jSelect ? jSelect.value : "LELAKI";
    state.selected.jantina = jantina; // Simpan jantina dalam state
    
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
            
            // Logik Mode Selector (Khusus Tahap 7)
            const modeContainer = document.getElementById('mode-selector-container');
            if (t === "7" && modeContainer) {
                modeContainer.classList.remove('d-none');
                setMode(false); 
            } else if (modeContainer) {
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
    const mukaInput = document.getElementById('muka');

    if (manual) {
        if(btnManual) btnManual.classList.add('active');
        if(btnAuto) btnAuto.classList.remove('active');
        if(mukaInput) mukaInput.classList.add('manual-active');
    } else {
        if(btnAuto) btnAuto.classList.add('active');
        if(btnManual) btnManual.classList.remove('active');
        if(mukaInput) mukaInput.classList.remove('manual-active');
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
            const mukaEl = document.getElementById('muka');
            const ayatEl = document.getElementById('ayat_range');
            if(mukaEl) mukaEl.value = s.ms;
            if(ayatEl) ayatEl.value = `1-${s.ayat || '?'}`;
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
            if(i === 5) item.click();
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
    const el = document.getElementById(wrapperId);
    if(!el) return;
    const items = el.children;
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
                const playback = document.getElementById('audioPlayback');
                if(playback) playback.src = URL.createObjectURL(state.audioBlob);
                const container = document.getElementById('audio-container');
                if(container) container.classList.remove('d-none');
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
        jantina: state.selected.jantina, // Data penting untuk pemilihan Bot di GAS
        tahap: "Tahap " + state.selected.tahap,
        surah: state.selected.surah,
        mukasurat: document.getElementById('muka')?.value || "",
        ayat_range: document.getElementById('ayat_range')?.value || "",
        tajwid: state.selected.tajwid,
        fasohah: state.selected.fasohah,
        ulasan: document.getElementById('catatan')?.value || "-",
        audioData: audioBase64
    };

    if(!payload.peserta || !payload.mukasurat) return alert("Lengkapkan maklumat!");

    btn.disabled = true;
    if(overlay) overlay.classList.remove('d-none');

    try {
        await fetch(CONFIG.GAS_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify(payload)
        });
        alert("✅ Rekod & Audio berjaya dihantar!");
        location.reload();
    } catch (e) {
        alert("Ralat sistem!");
        btn.disabled = false;
        if(overlay) overlay.classList.add('add-none');
    }
}

// 8. UTILS
function updateUstazUI() {
    const display = document.getElementById('ustazNameDisplay');
    if(display) display.textContent = state.currentUstaz;
    const floatSmall = document.querySelector('.pentashih-float small');
    if(floatSmall) floatSmall.innerHTML = `PENTASHIH<br>${state.currentUstaz.replace("USTAZ ", "")}`;
}

function toggleUstaz() {
    state.currentUstaz = state.currentUstaz.includes("AIMAN") ? "USTAZ NUAIM" : "USTAZ AIMAN";
    localStorage.setItem('ustaz_nama', state.currentUstaz);
    updateUstazUI();
}

function setupEventListeners() {
    const jSelect = document.getElementById('jantina');
    if(jSelect) jSelect.addEventListener('change', renderPesertaPicker);
    
    const btnAuto = document.getElementById('btn-mode-auto');
    const btnManual = document.getElementById('btn-mode-manual');
    if(btnAuto) btnAuto.onclick = () => setMode(false);
    if(btnManual) btnManual.onclick = () => setMode(true);
}
