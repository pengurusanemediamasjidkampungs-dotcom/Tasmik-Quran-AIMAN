/**
 * TASMIK QURAN DIGITAL 2026 - CORE ENGINE (ULTRA PRO V8.2)
 * ---------------------------------------------------
 * Khusus: REPO USTAZ AIMAN
 * Update: Fix Path & UI alignment
 */

// 1. KONFIGURASI GLOBAL
const CONFIG = {
    GAS_URL: "https://script.google.com/macros/s/AKfycbw5tyY3rrQFkGisxuE-pAc-Ii2Z4G2GYyUyvS6NeTSlrpKhlQ4aFEaWC-5ujnXCa9u1Ag/exec",
    FILES: {
        // Buang "./" supaya GitHub Pages lebih mudah cari fail
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
        jantina: "PEREMPUAN", // Default Perempuan untuk kumpulan Aiman
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

        if(!resP.ok || !resS.ok) throw new Error("Fail pangkalan data tidak dapat diakses.");

        const textP = await resP.text();
        const textS = await resS.text();

        state.dataPeserta = Hjson.parse(textP);
        state.dataSilibus = Hjson.parse(textS);

        renderPesertaPicker();

    } catch (err) {
        console.error("❌ Ralat:", err.message);
        alert("Ralat: Fail " + CONFIG.FILES.PESERTA + " tidak ditemui di pelayan.");
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
            renderSurahPicker(t);
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
            btn.style.background = "#000";
        } catch (err) { alert("Sila benarkan akses mikrofon!"); }
    } else {
        state.mediaRecorder.stop();
        state.isRecording = false;
        btn.style.background = "#ff4757";
    }
}

async function hantarTasmik() {
    const btn = document.getElementById('submitBtn');
    const msValue = document.getElementById('muka').value;

    if(!state.selected.peserta || !msValue) return alert("Pilih Peserta & Muka Surat!");

    btn.disabled = true;
    document.getElementById('statusOverlay').classList.remove('d-none');

    let audioBase64 = null;
    if (state.audioBlob) {
        const reader = new FileReader();
        audioBase64 = await new Promise(r => {
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
        ayat_range: document.getElementById('ayat_range').value,
        tajwid: state.selected.tajwid,
        fasohah: state.selected.fasohah,
        ulasan: document.getElementById('catatan').value || "-",
        audioData: audioBase64
    };

    try {
        await fetch(CONFIG.GAS_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(payload) });
        alert("✅ Rekod berjaya dihantar!");
        location.reload();
    } catch (e) {
        alert("Ralat penghantaran!");
        btn.disabled = false;
        document.getElementById('statusOverlay').classList.add('d-none');
    }
}

function setupEventListeners() {
    // Kosong buat masa ini jika tiada butang mod manual
}
