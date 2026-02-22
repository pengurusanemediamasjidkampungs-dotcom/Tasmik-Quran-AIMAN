/**
 * TASMIK QURAN DIGITAL 2026 - REPO AIMAN
 */

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

let state = {
    currentUstaz: "IMAM AIMAN", 
    dataPesertaLelaki: [],
    dataPesertaPerempuan: [],
    dataSilibus: {},
    selected: {
        peserta: "",
        jantina: "PEREMPUAN", // Default Perempuan untuk Imam Aiman
        tahap: "1",
        surah: "",
        muka: "",
        tajwid: "3",
        fasohah: "3"
    },
    isRecording: false, audioBlob: null, mediaRecorder: null, audioChunks: []
};

document.addEventListener('DOMContentLoaded', async () => {
    updateUstazUI();
    await loadInitialData();
    setupEventListeners();
    renderTahapPicker();
    renderRatingPickers();
});

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
    } catch (err) { console.error("Data Load Error"); }
}

function renderPesertaPicker() {
    const jantina = document.getElementById('jantina').value;
    state.selected.jantina = jantina;
    const senarai = jantina === "LELAKI" ? state.dataPesertaLelaki : state.dataPesertaPerempuan;
    const wrapper = document.getElementById('peserta-wrapper');
    if(!wrapper) return;
    wrapper.innerHTML = "";

    senarai.forEach((p, index) => {
        // Paparan dengan umur (Format Baru)
        const displayLabel = p.umur ? `${p.nama} (${p.umur} thn)` : p.nama;
        
        const item = createWheelItem(displayLabel, () => {
            state.selected.peserta = p.nama;
            highlightSelected('peserta-wrapper', index);
        });
        wrapper.appendChild(item);
        if(index === 0) item.click();
    });
}

// --- FUNGSI TAHAP & SURAH ---
function renderTahapPicker() {
    const wrapper = document.getElementById('tahap-wrapper');
    const tahapList = ["1", "2", "3", "4", "5", "6"];
    wrapper.innerHTML = "";
    tahapList.forEach((t, index) => {
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
    wrapper.innerHTML = "";
    const senarai = state.dataSilibus[tahap] || [];
    senarai.forEach((s, index) => {
        const item = createWheelItem(`${s.nama} <small>(m/s ${s.ms})</small>`, () => {
            state.selected.surah = s.nama;
            document.getElementById('muka').value = s.ms;
            document.getElementById('ayat_mula').value = 1;
            document.getElementById('ayat_akhir').value = s.ayat;
            highlightSelected('surah-wrapper', index);
        });
        wrapper.appendChild(item);
        if(index === 0) item.click();
    });
}

function renderRatingPickers() {
    ['tajwid', 'fasohah'].forEach(type => {
        const wrapper = document.getElementById(`${type}-wrapper`);
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
    div.onclick = () => { onClick(); div.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' }); };
    return div;
}

function highlightSelected(id, idx) {
    const items = document.getElementById(id).children;
    Array.from(items).forEach(it => it.classList.remove('selected'));
    if(items[idx]) items[idx].classList.add('selected');
}

// --- RECORDING & SUBMIT ---
async function toggleRecording() {
    const btn = document.getElementById('recordBtn');
    if (!state.isRecording) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        state.mediaRecorder = new MediaRecorder(stream);
        state.audioChunks = [];
        state.mediaRecorder.ondataavailable = e => state.audioChunks.push(e.data);
        state.mediaRecorder.onstop = () => {
            state.audioBlob = new Blob(state.audioChunks, { type: 'audio/ogg' });
            document.getElementById('audioPlayback').src = URL.createObjectURL(state.audioBlob);
            document.getElementById('audio-container').classList.remove('d-none');
        };
        state.mediaRecorder.start();
        state.isRecording = true;
        btn.classList.add('recording');
    } else {
        state.mediaRecorder.stop();
        state.isRecording = false;
        btn.classList.remove('recording');
    }
}

async function hantarTasmik() {
    const btn = document.getElementById('submitBtn');
    const payload = {
        ustaz: state.currentUstaz,
        peserta: state.selected.peserta,
        jenis_bacaan: document.getElementById('jenis_bacaan').value,
        tahap: "Tahap " + state.selected.tahap,
        surah: state.selected.surah,
        mukasurat: document.getElementById('muka').value,
        ayat_mula: document.getElementById('ayat_mula').value,
        ayat_akhir: document.getElementById('ayat_akhir').value,
        tajwid: state.selected.tajwid,
        fasohah: state.selected.fasohah,
        ulasan: document.getElementById('catatan').value || "-"
    };

    if (!payload.peserta) return alert("Pilih Nama!");
    btn.disabled = true;

    try {
        await fetch(CONFIG.GAS_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(payload) });
        if (state.audioBlob) {
            const fd = new FormData();
            fd.append('chat_id', CONFIG.CHAT_ID);
            fd.append('voice', state.audioBlob, `tasmik.ogg`);
            fd.append('caption', `🎙️ *TASMIK DIGITAL*\n👤 ${payload.peserta}\n📖 ${payload.surah}\n✨ T:${payload.tajwid} F:${payload.fasohah}\n👤 Ustaz: ${payload.ustaz}`);
            fd.append('parse_mode', 'Markdown');
            await fetch(`https://api.telegram.org/bot${CONFIG.BOT_TOKEN}/sendVoice`, { method: 'POST', body: fd });
        }
        alert("✅ Berjaya!");
        location.reload();
    } catch (e) { alert("Ralat!"); btn.disabled = false; }
}

function updateUstazUI() {
    document.getElementById('ustazNameDisplay').textContent = state.currentUstaz;
}

function setupEventListeners() {
    document.getElementById('jantina').addEventListener('change', renderPesertaPicker);
}
