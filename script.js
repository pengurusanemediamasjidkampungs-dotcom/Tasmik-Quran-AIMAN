/**
 * TASMIK QURAN DIGITAL 2026 - CORE ENGINE (ULTRA PRO V7.5)
 * ---------------------------------------------------
 * Integrasi: GitHub Pages + Google Apps Script (Backend)
 * Update: Auto-Jantina, Single-Pentashih, Optimized Wheel Picker
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
    currentUstaz: "USTAZ AIMAN", // Tetap kepada Ustaz Aiman
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
    
    // Set default jantina dari hidden input jika ada
    const jHidden = document.getElementById('jantina');
    if(jHidden) state.selected.jantina = jHidden.value;

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
        console.log("✅ Data HJSON Loaded Successfully");
    } catch (err) {
        console.error("❌ Load Error:", err.message);
    }
}

// 5. UI RENDERING
function renderPesertaPicker() {
    const jantina = state.selected.jantina;
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
        if(mukaInput) {
            mukaInput.classList.add('manual-active');
            mukaInput.focus();
        }
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
            if(i === 3) item.click(); // Default skor 3
        }
    });
}

function createWheelItem(content, onClick) {
    const div = document.createElement('div');
    div.className = 'wheel-item';
    div.innerHTML = content;
    div.onclick = (e) => { 
        onClick(); 
        div.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }); 
    };
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
    const status = document.getElementById('recordStatus');
    
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
            btn.innerHTML = '<i class="fa-solid fa-stop"></i>';
            btn.style.background = "#000"; // Warna hitam bila sedang rakam
            if(status) status.textContent = "Sedang Merakam...";
        } catch (err) { alert("Sila benarkan akses mikrofon!"); }
    } else {
        state.mediaRecorder.stop();
        state.isRecording = false;
        btn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
        btn.style.background = "#ff4757";
        if(status) status.textContent = "Rakaman Selesai.";
    }
}

// 7. SUBMISSION (SECURE FORWARDING)
async function hantarTasmik() {
    const btn = document.getElementById('submitBtn');
    const overlay = document.getElementById('statusOverlay');
    
    // Basic Validation
    const msValue = document.getElementById('muka')?.value;
    if(!state.selected.peserta || !msValue) {
        return alert("Sila pilih Nama Peserta dan masukkan Muka Surat!");
    }

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
        jantina: state.selected.jantina,
        tahap: "Tahap " + state.selected.tahap,
        surah: state.selected.surah,
        mukasurat: msValue,
        ayat_range: document.getElementById('ayat_range')?.value || "",
        tajwid: state.selected.tajwid,
        fasohah: state.selected.fasohah,
        ulasan: document.getElementById('catatan')?.value || "-",
        audioData: audioBase64
    };

    btn.disabled = true;
    if(overlay) overlay.classList.remove('d-none');

    try {
        await fetch(CONFIG.GAS_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify(payload)
        });
        
        // Timeout sikit untuk pastikan no-cors request sampai
        setTimeout(() => {
            alert("✅ Rekod " + payload.peserta + " berjaya dihantar!");
            location.reload();
        }, 1500);

    } catch (e) {
        alert("Ralat Sistem! Sila cuba lagi.");
        btn.disabled = false;
        if(overlay) overlay.classList.add('d-none');
    }
}

// 8. SETUP
function setupEventListeners() {
    const btnAuto = document.getElementById('btn-mode-auto');
    const btnManual = document.getElementById('btn-mode-manual');
    if(btnAuto) btnAuto.onclick = () => setMode(false);
    if(btnManual) btnManual.onclick = () => setMode(true);
}
