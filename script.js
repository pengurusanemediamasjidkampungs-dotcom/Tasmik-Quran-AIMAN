/**
 * TASMIK QURAN DIGITAL 2026 - CORE ENGINE (ULTRA PRO V8.2)
 * ---------------------------------------------------
 * Khusus: REPO USTAZ AIMAN
 * Fix: Pathing issue & Jantina Fallback
 */

// 1. KONFIGURASI GLOBAL
const CONFIG = {
    GAS_URL: "https://script.google.com/macros/s/AKfycbw5tyY3rrQFkGisxuE-pAc-Ii2Z4G2GYyUyvS6NeTSlrpKhlQ4aFEaWC-5ujnXCa9u1Ag/exec",
    FILES: {
        // Dibuang ./ untuk kestabilan akses di GitHub Pages
        PESERTA: "peserta_kumpulan_aiman.hjson", 
        SILIBUS: "silibus.hjson"
    }
};

// 2. STATE MANAGEMENT
let state = {
    currentUstaz: "USTAZ AIMAN",
    dataPeserta: [],
    dataSilibus: {},
    isManualMode: false,
    selected: {
        peserta: "",
        jantina: "PEREMPUAN", // Default memandangkan senarai Aiman adalah perempuan
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
    console.log("🚀 System Aiman Initializing...");
    setupEventListeners();
    await loadInitialData();
    renderTahapPicker();
    renderRatingPickers();
});

// 4. DATA LOADING
async function loadInitialData() {
    const ts = new Date().getTime(); 
    try {
        const [resP, resS] = await Promise.all([
            fetch(`${CONFIG.FILES.PESERTA}?v=${ts}`),
            fetch(`${CONFIG.FILES.SILIBUS}?v=${ts}`)
        ]);

        if(!resP.ok) throw new Error("Gagal akses fail peserta_kumpulan_aiman.hjson");
        if(!resS.ok) throw new Error("Gagal akses fail silibus.hjson");

        const textP = await resP.text();
        const textS = await resS.text();

        state.dataPeserta = Hjson.parse(textP);
        state.dataSilibus = Hjson.parse(textS);

        console.log("✅ Data Berjaya Dimuatkan");
        renderPesertaPicker();

    } catch (err) {
        console.error("❌ Ralat:", err.message);
        // Paparkan ralat pada skrin untuk memudahkan debug
        const wrapper = document.getElementById('peserta-wrapper');
        if(wrapper) wrapper.innerHTML = `<div style="color:red; padding:10px;">Ralat: ${err.message}</div>`;
    }
}

// 5. UI RENDERING
function renderPesertaPicker() {
    const wrapper = document.getElementById('peserta-wrapper');
    if(!wrapper || !state.dataPeserta) return;
    wrapper.innerHTML = "";

    state.dataPeserta.forEach((p, index) => {
        const item = createWheelItem(p.nama, () => {
            state.selected.peserta = p.nama;
            // Ambil jantina dari fail, jika tiada guna default
            state.selected.jantina = p.jantina || "PEREMPUAN"; 
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
            } else {
                if(modeContainer) modeContainer.classList.add('d-none');
                setMode(false);
                renderSurahPicker(t);
            }
        });
        wrapper.appendChild(item);
        if(index === 0) item.click();
    });
}

function renderSurahPicker(tahap) {
    const wrapper = document.getElementById('surah-wrapper');
    if(!wrapper || !state.dataSilibus[tahap]) return;
    wrapper.innerHTML = "";
    
    state.dataSilibus[tahap].forEach((s, index) => {
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
            if(i === 3) item.click(); 
        }
    });
}

function createWheelItem(content, onClick) {
    const div = document.createElement('div');
    div.className = 'wheel-item';
    div.innerHTML = content;
    div.onclick = () => { 
        onClick(); 
        div.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }); 
    };
    return div;
}

function highlightSelected(wrapperId, index) {
    const el = document.getElementById(wrapperId);
    if(!el) return;
    Array.from(el.children).forEach(item => item.classList.remove('selected'));
    if(el.children[index]) el.children[index].classList.add('selected');
}

function setMode(manual) {
    state.isManualMode = manual;
    const btnAuto = document.getElementById('btn-mode-auto');
    const btnManual = document.getElementById('btn-mode-manual');
    const mukaInput = document.getElementById('muka');

    if (manual) {
        btnManual?.classList.add('active');
        btnAuto?.classList.remove('active');
        mukaInput?.classList.add('manual-active');
    } else {
        btnAuto?.classList.add('active');
        btnManual?.classList.remove('active');
        mukaInput?.classList.remove('manual-active');
        renderSurahPicker(state.selected.tahap);
    }
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
                document.getElementById('audio-container')?.classList.remove('d-none');
            };
            state.mediaRecorder.start();
            state.isRecording = true;
            btn.innerHTML = '<i class="fa-solid fa-stop"></i>';
            btn.style.background = "#000";
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

// 7. SUBMISSION
async function hantarTasmik() {
    const btn = document.getElementById('submitBtn');
    const overlay = document.getElementById('statusOverlay');
    const msValue = document.getElementById('muka')?.value;

    if(!state.selected.peserta || !msValue) return alert("Pilih Peserta & Masukkan Muka Surat!");

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
    overlay?.classList.remove('d-none');

    try {
        await fetch(CONFIG.GAS_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(payload) });
        setTimeout(() => { alert("✅ Rekod berjaya dihantar!"); location.reload(); }, 1500);
    } catch (e) {
        alert("Ralat penghantaran!");
        btn.disabled = false;
        overlay?.classList.add('d-none');
    }
}

function setupEventListeners() {
    document.getElementById('btn-mode-auto').onclick = () => setMode(false);
    document.getElementById('btn-mode-manual').onclick = () => setMode(true);
}
