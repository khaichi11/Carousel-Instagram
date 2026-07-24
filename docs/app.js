import { parseBrief } from "./import-brief.js?v=22";
import { downloadPptx } from "./pptx-export.js?v=22";
import * as store from "./storage.js?v=23";
import { PRESETS, PRESET_CATEGORIES } from "./presets.js?v=24";
import { listPromptTemplates, loadTemplate, generatePrompt } from "./prompt-engine.js?v=2";
import * as pdfjsLib from "./vendor/pdf.min.mjs";
pdfjsLib.GlobalWorkerOptions.workerSrc = "./vendor/pdf.worker.min.mjs";

/* ---------------- Option definitions ---------------- */
const TYPES = [
  { id: "cover", label: "Cover" },
  { id: "highlight", label: "Highlight" },
  { id: "list", label: "List" },
  { id: "table", label: "Tabel" },
  { id: "compare", label: "Komparasi" },
  { id: "meme", label: "Meme" },
  { id: "figure", label: "Figur (Orang)" },
  { id: "cta", label: "CTA" },
];
const FIGURE_SIDES = [{ id: "right", label: "Kanan" }, { id: "left", label: "Kiri" }];
const FIGURE_LAYERS = [{ id: "back", label: "Di belakang teks" }, { id: "front", label: "Di depan teks" }];
const THEMES = [{ id: "dark", label: "Navy" }, { id: "light", label: "Terang" }];
// Background source per design — decoupled from the light/dark theme so any slide can
// show a background image (global from settings, or a custom one for this slide).
const BG_MODES = [{ id: "", label: "Tanpa" }, { id: "global", label: "Global" }, { id: "custom", label: "Custom" }];
// How a background photo fills the slide. "contain" = the WHOLE picture is visible
// (nothing cropped away) and the leftover area shows the slide's own background —
// that's the default, so geser X/Y moves the real picture instead of panning a crop.
// "cover" = the old fill-the-frame behaviour, kept for anyone who wants an edge-to-
// edge photo (and used automatically for projects saved before this option existed).
const BG_FITS = [{ id: "contain", label: "Utuh — gambar nggak dipotong" }, { id: "cover", label: "Isi penuh — dipotong biar full slide" }];
const ALIGNS = [{ id: "", label: "Auto" }, { id: "top", label: "Atas" }, { id: "center", label: "Tengah" }, { id: "bottom", label: "Bawah" }];
const FONTS = [
  { id: "Anton", label: "Anton" }, { id: "Bebas Neue", label: "Bebas Neue" }, { id: "Oswald", label: "Oswald" },
  { id: "Archivo Black", label: "Archivo Black" }, { id: "Montserrat", label: "Montserrat" },
];
const TEXTURES = [{ id: "", label: "Default" }, { id: "paper", label: "Paper" }, { id: "fabric", label: "Fabric" }, { id: "noise", label: "Noise" }, { id: "grain", label: "Grain" }, { id: "none", label: "Polos" }];
const TEXTURE_TONES = [{ id: "light", label: "Terang" }, { id: "dark", label: "Gelap" }];
const PATTERNS = [{ id: "", label: "Default" }, { id: "grid", label: "Grid" }, { id: "dots", label: "Dots" }, { id: "diagonal", label: "Garis" }, { id: "waves", label: "Waves" }, { id: "none", label: "Polos" }];

/* ---------------- Background overlay & image effects ----------------
 * Overlay = a colour/gradient sheet painted over the background (photo, theme
 * gradient, pattern) and under all content, with its own blend mode — the fix for a
 * photo that's too bright to read text on. Effects = a CSS filter chain on the
 * background photo itself (blur/brightness/contrast/saturation/grayscale).
 * Both live in one group ("Overlay & Efek") with the same Off / Global / Custom
 * source switch used by background colour and background image. */
const FX_MODES = [{ id: "", label: "Tanpa (mati)" }, { id: "global", label: "Global" }, { id: "custom", label: "Custom slide ini" }];
const OV_TYPES = [
  { id: "", label: "Tanpa overlay" },
  { id: "solid", label: "Warna rata" },
  { id: "linear", label: "Gradasi linear" },
  { id: "radial", label: "Gradasi radial" },
  { id: "vignette", label: "Vignette (gelap di pinggir)" },
];
const OV_BLENDS = [
  { id: "normal", label: "Normal" }, { id: "multiply", label: "Multiply (gelapkan)" },
  { id: "darken", label: "Darken" }, { id: "color-burn", label: "Color Burn (kontras gelap)" },
  { id: "overlay", label: "Overlay (kontras)" }, { id: "soft-light", label: "Soft Light (lembut)" },
  { id: "hard-light", label: "Hard Light" }, { id: "screen", label: "Screen (terangkan)" },
  { id: "lighten", label: "Lighten" }, { id: "luminosity", label: "Luminosity" },
];
// One-click starting points; each just fills the fields below, everything stays editable.
const OV_PRESETS = [
  { id: "darken", label: "🌑 Gelapkan", patch: { ovType: "solid", ovC1: "#000000", ovA1: 100, ovBlend: "multiply", ovOpacity: 45 } },
  { id: "darker", label: "⬛ Gelap Pekat", patch: { ovType: "solid", ovC1: "#000000", ovA1: 100, ovBlend: "multiply", ovOpacity: 70 } },
  { id: "bottom", label: "⬇ Gelap Bawah", patch: { ovType: "linear", ovAngle: 180, ovC1: "#000000", ovA1: 0, ovC2: "#050615", ovA2: 88, ovBlend: "normal", ovOpacity: 100 } },
  { id: "top", label: "⬆ Gelap Atas", patch: { ovType: "linear", ovAngle: 180, ovC1: "#050615", ovA1: 88, ovC2: "#000000", ovA2: 0, ovBlend: "normal", ovOpacity: 100 } },
  { id: "vignette", label: "⭕ Vignette", patch: { ovType: "vignette", ovC1: "#000000", ovA1: 85, ovBlend: "normal", ovOpacity: 100 } },
  { id: "navy", label: "🔵 Navy Duotone", patch: { ovType: "linear", ovAngle: 155, ovC1: "#2F318B", ovA1: 90, ovC2: "#101138", ovA2: 90, ovBlend: "multiply", ovOpacity: 85 } },
  { id: "warm", label: "🟡 Hangat", patch: { ovType: "linear", ovAngle: 155, ovC1: "#F7B400", ovA1: 70, ovC2: "#C24E00", ovA2: 70, ovBlend: "soft-light", ovOpacity: 100 } },
  { id: "bright", label: "☀ Terangkan", patch: { ovType: "solid", ovC1: "#FFFFFF", ovA1: 100, ovBlend: "screen", ovOpacity: 30 } },
];
// The shape of the overlay + effect fields, on a slide (custom mode) and in settings
// (global mode) alike. Kept in one place so defaults, reset and "off" agree.
function defaultFx() {
  return {
    ovType: "", ovC1: "#000000", ovC2: "#000000", ovA1: 100, ovA2: 0, ovAngle: 180,
    ovBlend: "multiply", ovOpacity: 45,
    bgBlur: 0, bgBrightness: 100, bgContrast: 100, bgSaturate: 100, bgGrayscale: 0,
  };
}

/* ---------------- Caption typography (regular-image & meme captions) ---------------- */
const CAP_FONTS = [{ id: "", label: "Default" }, { id: "Plus Jakarta Sans", label: "Plus Jakarta Sans" }, { id: "Archivo", label: "Archivo" }].concat(FONTS);
const CAP_WEIGHTS = [{ id: "400", label: "Reguler" }, { id: "600", label: "Semi Bold" }, { id: "700", label: "Bold" }, { id: "800", label: "Extra Bold" }, { id: "900", label: "Black" }];
const CAP_ALIGNS = [{ id: "left", label: "Kiri" }, { id: "center", label: "Tengah" }, { id: "right", label: "Kanan" }];
// Bumped well past the old fixed sizes (meme 40px/regular 26px) per request; still
// fully editable — this is only the starting point for Global + new slides.
function defaultCapStyle() {
  return { size: 38, weight: "800", font: "", color: "", align: "center", lineHeight: 132, letterSpacing: 0, marginTop: 24, marginBottom: 24, padding: 0 };
}
/* A slide either inherits the Global caption style wholesale, or defines its own —
 * same two-mode pattern as background colour/image so the mental model stays familiar. */
function resolveCapStyle(slide) { return slide.capStyleMode === "custom" ? slide.capStyle : state.settings.capStyle; }

const TYPE_FIELDS = {
  cover: [
    { key: "eyebrow", label: "Label kecil (opsional)", kind: "text", ph: "INFO RESMI!" },
    { key: "title", label: "Judul besar", kind: "textarea", rows: 2, ph: "Judul di sini — **kata** jadi highlight" },
    { key: "subtitle", label: "Subjudul (opsional)", kind: "textarea", rows: 2, ph: "Kalimat pendukung" },
    { key: "button", label: "Tombol (opsional)", kind: "text", ph: "Persiapkan dari sekarang!" },
  ],
  highlight: [
    { key: "eyebrow", label: "Label kecil (opsional)", kind: "text", ph: "PLOT TWIST 2026" },
    { key: "title", label: "Teks besar", kind: "textarea", rows: 3, ph: "Kalimat punchy, **kata penting** dikasih stabilo" },
    { key: "subtitle", label: "Teks kecil (opsional)", kind: "textarea", rows: 2, ph: "" },
    { key: "button", label: "Tombol (opsional)", kind: "text", ph: "" },
  ],
  list: [
    { key: "title", label: "Judul", kind: "text", ph: "3 Hal yang Wajib Dilihat" },
    { key: "items", label: "Poin (satu per baris)", kind: "textarea", rows: 6, ph: "📚 Tugas :: bukan cuma pas ujian\n🧠 Materi kuliah", hint: "Awali emoji buat ikon. Pakai :: buat pisah judul & penjelasan." },
  ],
  table: [
    { key: "title", label: "Judul", kind: "text", ph: "Kampus Paling Berprestasi" },
    { key: "items", label: "Baris tabel (satu per baris)", kind: "textarea", rows: 6, ph: "🎓 Universitas Gadjah Mada :: 669\n🏛️ ITB :: 640", hint: "Format: Nama :: Nilai. Nomor urut otomatis." },
  ],
  compare: [
    { key: "title", label: "Judul (opsional)", kind: "text", ph: "Yang dilihat vs yang dijalani" },
    { key: "colA", label: "Kolom kiri — judul", kind: "text", ph: "Yang orang lain lihat" },
    { key: "itemsA", label: "Kolom kiri — poin", kind: "textarea", rows: 4, ph: "🏫 Nama universitas\n🎓 Nama jurusan" },
    { key: "colB", label: "Kolom kanan — judul", kind: "text", ph: "Yang kamu jalani" },
    { key: "itemsB", label: "Kolom kanan — poin", kind: "textarea", rows: 4, ph: "📚 Tugas\n🧠 Materi kuliah" },
  ],
  meme: [
    { key: "capTop", label: "Caption atas (opsional)", kind: "text", ph: "Jalur mandiri be like:" },
    { key: "image", label: "Gambar Meme", kind: "image", hint: "Placeholder khusus meme — caption di atas & bawah gambar." },
    { key: "capBottom", label: "Caption bawah (opsional)", kind: "text", ph: "" },
  ],
  cta: [
    { key: "eyebrow", label: "Label kecil (opsional)", kind: "text", ph: "" },
    { key: "title", label: "Judul CTA", kind: "textarea", rows: 2, ph: "Bangun mimpimu, **#PastiBisa**" },
    { key: "subtitle", label: "Subjudul (opsional)", kind: "textarea", rows: 2, ph: "Kenali dirimu. Siapkan strategimu." },
    { key: "button", label: "Tombol (opsional)", kind: "text", ph: 'Komen "JOIN" 👇' },
  ],
  figure: [
    { key: "eyebrow", label: "Label kecil (opsional)", kind: "text", ph: "WAJIB TAHU" },
    { key: "title", label: "Judul", kind: "textarea", rows: 2, ph: "Judul di samping figur — **kata** jadi highlight" },
    { key: "subtitle", label: "Subjudul (opsional)", kind: "textarea", rows: 2, ph: "Kalimat pendukung" },
    { key: "button", label: "Tombol (opsional)", kind: "text", ph: "" },
    { key: "figureImage", label: "Gambar Orang (PNG transparan)", kind: "figure", hint: "Upload PNG transparan (guru, murid, presenter…). Tanpa upload, tampil siluet placeholder." },
  ],
};

/* ---------------- Default deck (Pasti Pintar brief, corrected) ---------------- */
const DEFAULT_SLIDES = [
  { type: "cover", theme: "dark", topic: "Hook", eyebrow: "STOP DULU", title: "Jangan Pilih Jurusan Cuma Karena **Gengsi**", subtitle: "Karena yang menjalani kuliahnya nanti… ya kamu. Bukan mereka." },
  { type: "compare", theme: "dark", topic: "Realita", title: "Yang Dilihat vs Yang Dijalani", colA: "Yang orang lain lihat", itemsA: "Nama universitas\nNama jurusan\nRanking kampus\nGaji", colB: "Yang kamu jalani", itemsB: "Tugas\nMateri kuliah\nBertahun belajar\nKarier nanti" },
  { type: "highlight", theme: "light", topic: "Populer ≠ Cocok", eyebrow: "REALITA", title: "Jurusan **populer** belum tentu **cocok** buat kamu.", subtitle: "Tertarik sama bidangnya, betah cara belajarnya, dan mau kerja di situ — itu yang nentuin." },
  { type: "highlight", theme: "dark", topic: '"Katanya…"', eyebrow: 'JANGAN KEMAKAN "KATANYA"', title: '"Katanya jurusan ini masa depannya bagus…"', subtitle: 'Tapi yang bakal ngerjain tugas dan skripsian — kamu. Bukan yang ngomong "katanya".' },
  { type: "highlight", theme: "light", topic: "Tanya Ini Dulu", eyebrow: "TANYA INI DULU", title: '**"Apakah aku mau menjalani prosesnya?"**', subtitle: 'Bukan cuma "aku mau jadi apa", tapi "aku bersedia belajar apa selama bertahun-tahun?"' },
  { type: "list", theme: "dark", topic: "3 Hal Penting", title: "3 Hal yang Wajib Dipikirin", items: "Minat :: apa yang bikin kamu penasaran?\nKemampuan :: apa yang jadi kekuatanmu?\nTujuan :: hidup seperti apa yang mau kamu bangun?" },
  { type: "highlight", theme: "dark", topic: "Reframing", eyebrow: "GANTI PERTANYAANNYA", title: "Jurusan **terbaik** ≠ jurusan **paling populer**", subtitle: '"Mana yang paling bergengsi?"\n"Mana yang paling cocok sama aku & masa depanku?"' },
  { type: "table", theme: "dark", topic: "Bukti", title: "Kampus Paling Berprestasi", items: "Universitas Gadjah Mada :: 669\nITS :: 666\nUniversitas Brawijaya :: 606\nUniversitas Indonesia :: 410\nIPB University :: 300" },
  { type: "list", theme: "light", topic: "Kenapa Penting", title: "Pilih yang Tepat, Bukan yang Keren", items: "Lebih termotivasi\nLebih konsisten\nLebih siap hadapi tantangan" },
  { type: "cta", theme: "dark", topic: "Closing", title: "Bangun Mimpimu, **#PastiBisa**", subtitle: "Kenali dirimu. Kenali targetmu. Siapkan strategimu.", button: "Save & share ke temanmu 👇" },
];

/* ---------------- State ---------------- */
function freshSlide(base) {
  base = base || {};
  // Migrate the old "photo" theme → dark theme + a background source.
  if (base.theme === "photo") { base = Object.assign({}, base, { theme: "dark", bgMode: base.bgImage ? "custom" : "global" }); }
  const s = Object.assign(
    defaultFx(),
    { id: crypto.randomUUID(), type: "cover", theme: "dark", align: "", topic: "", eyebrow: "", title: "", subtitle: "", button: "",
      fxMode: "",
      items: "", colA: "", itemsA: "", colB: "", itemsB: "", capTop: "", capBottom: "",
      textColor: "", titleColor: "", markColor: "", highlightTextColor: "", texture: "", textureTone: "light", textureOpacity: 60, pattern: "", image: null, imageCaption: "", bgImage: null, bgMode: "",
      bgColorMode: "", bgFillType: "solid", bgC1: "#2F318B", bgC2: "#101138", bgAngle: 155, bgFit: "contain",
      capStyleMode: "",
      figureImage: null, figureSide: "right", figureLayer: "back", figX: 50, figY: 50, figScale: 100, figRotate: 0, figFlip: false, figOpacity: 100,
      imgX: 50, imgY: 50, imgZoom: 100,
      bgX: 50, bgY: 50, bgZoom: 100, textureX: 50, textureY: 50, textureScale: 100, patternX: 50, patternY: 50, patternScale: 100, patternThickness: 2, _send: null },
    base
  );
  // Always give the slide its OWN caption-style object — Object.assign only shallow-
  // copies, so without this a duplicated slide (or one restored from storage) would
  // share the same nested object as its source and editing one would mutate both.
  s.capStyle = Object.assign(defaultCapStyle(), base.capStyle || {});
  return s;
}
const state = {
  bgImage: null,
  briefText: "",
  settings: Object.assign(defaultFx(), { igHandle: "pastipintar.utbk", website: "pastipintar.id", font: "Anton", customFontUrl: "", ratio: "4:5",
    bgFillType: "", bgC1: "#2F318B", bgC2: "#101138", bgAngle: 155, bgFit: "contain",
    bgX: 50, bgY: 50, bgScale: 100,
    capStyle: defaultCapStyle() }),
  slides: DEFAULT_SLIDES.map(freshSlide),
};
// Lets shared controls (transform sliders) bound to settings repaint every slide.
state.settings._send = () => { refreshAll(); markDirty(); };

let LOGO_DATAURL = "logo/logo.png";

/* ---------------- Helpers ---------------- */
function readFileAsDataUrl(file) { return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file); }); }
function resizeImage(dataUrl, maxDim) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxDim || height > maxDim) { const s = maxDim / Math.max(width, height); width = Math.round(width * s); height = Math.round(height * s); }
      const c = document.createElement("canvas"); c.width = width; c.height = height;
      c.getContext("2d").drawImage(img, 0, 0, width, height); resolve(c.toDataURL("image/png"));
    };
    // Fail gracefully instead of hanging the upload if the image can't be decoded.
    img.onerror = () => reject(new Error("Gambar tidak bisa dibaca (format tidak didukung?)."));
    img.src = dataUrl;
  });
}
async function loadImage(file, maxDim) { return resizeImage(await readFileAsDataUrl(file), maxDim); }
function guardImage(file) { if (!file.type.startsWith("image/")) { alert("File harus gambar (JPG/PNG)."); return false; } return true; }
function wireDropzone(zone, input, onFile) {
  zone.addEventListener("click", (e) => { if (e.target.closest(".link-btn")) return; input.click(); });
  input.addEventListener("change", () => { const f = input.files[0]; if (f) onFile(f); input.value = ""; });
  zone.addEventListener("dragover", (e) => { e.preventDefault(); zone.classList.add("dragover"); });
  zone.addEventListener("dragleave", () => zone.classList.remove("dragover"));
  zone.addEventListener("drop", (e) => { e.preventDefault(); zone.classList.remove("dragover"); const f = e.dataTransfer.files[0]; if (f) onFile(f); });
}
function downloadBlob(blob, name) { const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }

/* ================= Persistence & project management =================
 * Everything lives in IndexedDB (storage.js): autosaves are recovery rows capped at
 * 3, manual Save/Save As create permanent projects. The whole editor state — slides
 * (incl. uploads as data-URLs), settings, brief text, generated PNGs — round-trips
 * through snapshot()/applyProject(). */
const current = {
  savedId: null,             // id of the permanent project this session belongs to (null = never saved)
  draftId: store.newId("d"), // identity of this editing session for its autosave row
  name: "Tanpa Judul",
  createdAt: Date.now(),
  thumb: null,
  dirty: false,              // unsaved vs MANUAL save
  lastAuto: null, lastManual: null,
};
let restoring = false;       // suppress dirty-marking while a project is being applied
let autoTimer = null;
let storageWarned = false;

function snapshot() {
  const settings = Object.assign({}, state.settings);
  delete settings._send; // functions can't be structured-cloned into IndexedDB
  return {
    settings,
    bgImage: state.bgImage,
    briefText: state.briefText,
    slides: state.slides.map((s) => { const c = Object.assign({}, s); delete c._send; return c; }),
    pngs: lastPngs.slice(),
  };
}
function autoMeta() {
  return {
    id: "auto_" + (current.savedId || current.draftId), kind: "auto",
    of: current.savedId, name: current.name,
    createdAt: current.createdAt, updatedAt: Date.now(), autosavedAt: Date.now(),
    thumb: current.thumb, appVersion: 15,
  };
}
let autosaveFailCount = 0; // consecutive failures — drives the "autosave gagal" warning below
function updateSaveBadge() {
  const b = document.getElementById("saveBadge");
  if (!b) return;
  const t = (d) => d ? new Date(d).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "";
  // A failing autosave used to leave the badge frozen on its last successful
  // timestamp forever — indistinguishable from "still working" — so a broken backup
  // (storage full, connection dropped, browser storage evicted, …) went unnoticed
  // until the user lost work. Surface it explicitly instead of staying silent.
  if (autosaveFailCount > 0) {
    b.textContent = "⚠ Autosave gagal — perubahan belum ke-backup";
    b.className = "save-badge dirty";
  } else if (current.dirty) {
    b.textContent = current.lastAuto ? `• Belum disimpan — autosave ${t(current.lastAuto)}` : "• Belum disimpan";
    b.className = "save-badge dirty";
  } else if (current.lastManual) {
    b.textContent = `✓ Tersimpan ${t(current.lastManual)}`;
    b.className = "save-badge ok";
  } else {
    b.textContent = current.lastAuto ? `✓ Autosave ${t(current.lastAuto)}` : "";
    b.className = "save-badge ok";
  }
  const nameEl = document.getElementById("projectName");
  if (nameEl) nameEl.textContent = current.name + (current.dirty ? " •" : "");
}
function markDirty() {
  if (restoring) return;
  current.dirty = true;
  updateSaveBadge();
  clearTimeout(autoTimer);
  autoTimer = setTimeout(autosaveNow, 1500); // autosave shortly after the last edit
}
async function autosaveNow() {
  clearTimeout(autoTimer);
  try {
    await store.saveProject(autoMeta(), snapshot());
    current.lastAuto = Date.now();
    autosaveFailCount = 0;
    updateSaveBadge();
    checkStorage();
  } catch (e) {
    console.warn("Autosave gagal:", e);
    autosaveFailCount++;
    updateSaveBadge();
  }
}
setInterval(() => { if (current.dirty) autosaveNow(); }, 15000); // safety-net interval

async function manualSave(asNew) {
  let name = current.name;
  if (asNew || !current.savedId) {
    name = prompt("Nama project:", asNew && current.savedId ? current.name + " (salinan)" : current.name);
    if (name == null) return false;
    name = name.trim() || "Tanpa Judul";
  }
  const id = (asNew || !current.savedId) ? store.newId("p") : current.savedId;
  const createdAt = (asNew || !current.savedId) ? Date.now() : current.createdAt;
  await ensureThumb();
  await store.saveProject({
    id, kind: "saved", name, createdAt, updatedAt: Date.now(),
    autosavedAt: current.lastAuto, thumb: current.thumb, appVersion: 15,
  }, snapshot());
  // the old draft's autosave row now belongs to the saved id
  if (!current.savedId || asNew) await store.deleteProject("auto_" + (current.savedId || current.draftId)).catch(() => {});
  current.savedId = id; current.name = name; current.createdAt = createdAt;
  current.dirty = false; current.lastManual = Date.now();
  updateSaveBadge();
  refreshProjectPanel();
  store.sweepAssets().catch(() => {});
  return true;
}

/* Thumbnail: reuse the first generated PNG (downscaled); never renders extra. */
function ensureThumb() {
  return new Promise((res) => {
    if (!lastPngs.length) return res();
    const img = new Image();
    img.onload = () => {
      const w = 180, h = Math.round(w * img.height / img.width);
      const c = document.createElement("canvas"); c.width = w; c.height = h;
      c.getContext("2d").drawImage(img, 0, 0, w, h);
      current.thumb = c.toDataURL("image/jpeg", 0.7);
      res();
    };
    img.onerror = () => res();
    img.src = lastPngs[0];
  });
}

function applyProject(meta, content) {
  restoring = true;
  try {
    current.savedId = meta.kind === "saved" ? meta.id : (meta.of || null);
    current.draftId = meta.kind === "auto" ? meta.id.replace(/^auto_/, "") : store.newId("d");
    current.name = meta.name || "Tanpa Judul";
    current.createdAt = meta.createdAt || Date.now();
    current.thumb = meta.thumb || null;
    current.dirty = false;
    current.lastAuto = meta.autosavedAt || null;
    current.lastManual = meta.kind === "saved" ? meta.updatedAt : null;
    // Projects saved before the background-fit option existed were always rendered
    // with the photo cover-cropped to fill the slide. Pin them to "cover" so they
    // still look exactly as saved — only new work gets the uncropped default.
    if (!(meta.appVersion >= 14)) {
      if (content.settings && !content.settings.bgFit) content.settings.bgFit = "cover";
      (content.slides || []).forEach((s) => { if (s && !s.bgFit) s.bgFit = "cover"; });
    }
    // The footer handle used to default to the bare "pastipintar"; the account is
    // @pastipintar.utbk. Projects saved with the old default carry the stale value
    // inside them (it overrides the app default on load), so rename it once here.
    // Gated on the save version, so anyone who deliberately types "pastipintar"
    // AFTER this build keeps it — the rename only ever touches older saves.
    if (!(meta.appVersion >= 15) && content.settings &&
        (content.settings.igHandle || "").trim().toLowerCase() === "pastipintar") {
      content.settings.igHandle = "pastipintar.utbk";
    }
    Object.assign(state.settings, content.settings || {});
    state.bgImage = content.bgImage || null;
    state.briefText = content.briefText || "";
    state.slides = (content.slides && content.slides.length ? content.slides : DEFAULT_SLIDES).map(freshSlide);
    lastPngs = (content.pngs || []).filter(Boolean);
    syncGlobalInputs();
    renderSlides();
    renderGallery();
  } finally { restoring = false; }
  updateSaveBadge();
}
function newProject() {
  restoring = true;
  try {
    current.savedId = null; current.draftId = store.newId("d");
    current.name = "Tanpa Judul"; current.createdAt = Date.now();
    current.thumb = null; current.dirty = false; current.lastAuto = null; current.lastManual = null;
    state.bgImage = null; state.briefText = "";
    Object.assign(state.settings, defaultFx(), { bgFillType: "", bgC1: "#2F318B", bgC2: "#101138", bgAngle: 155, bgFit: "contain", bgX: 50, bgY: 50, bgScale: 100, capStyle: defaultCapStyle() });
    state.slides = DEFAULT_SLIDES.map(freshSlide);
    lastPngs = [];
    syncGlobalInputs();
    renderSlides();
    renderGallery();
  } finally { restoring = false; }
  updateSaveBadge();
}

/* Warn (Save / Don't save / Cancel — two-step with native dialogs) before an action
 * that leaves unsaved manual changes behind. Returns true when it's ok to proceed. */
async function confirmLeave() {
  if (typeof generating !== "undefined" && generating) { alert("Tunggu proses generate selesai dulu."); return false; }
  if (!current.dirty) return true;
  await autosaveNow(); // recovery copy is always fresh
  if (confirm("Ada perubahan yang belum disimpan permanen (autosave aman).\n\nSimpan dulu sebagai project?")) {
    return await manualSave(false);
  }
  return confirm("Lanjut TANPA menyimpan permanen? (Masih bisa dipulihkan dari Autosave)");
}
window.addEventListener("beforeunload", (e) => {
  if (current.dirty) {
    autosaveNow(); // best-effort flush
    e.preventDefault();
    e.returnValue = "";
  }
});

async function checkStorage() {
  if (storageWarned) return;
  const est = await store.storageEstimate();
  if (est && est.quota && est.usage / est.quota > 0.85) {
    storageWarned = true;
    const b = document.getElementById("saveBadge");
    if (b) { b.textContent = "⚠ Penyimpanan browser hampir penuh — hapus project lama"; b.className = "save-badge dirty"; }
  }
}

/* ---- project manager panel (Recent autosaves + Saved projects) ---- */
async function refreshProjectPanel() {
  const box = document.getElementById("projectPanel");
  if (!box || box.style.display === "none") return;
  const listEl = document.getElementById("projectLists");
  const metas = await store.listMeta();
  const autos = metas.filter((m) => m.kind === "auto");
  const saved = metas.filter((m) => m.kind === "saved");
  const t = (d) => d ? new Date(d).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "-";
  const row = (m, actions) => {
    const div = document.createElement("div"); div.className = "proj-row";
    const th = m.thumb ? `<img class="proj-thumb" src="${m.thumb}" alt="">` : '<div class="proj-thumb ph"></div>';
    div.innerHTML = `${th}<div class="proj-info"><strong>${m.name || "Tanpa Judul"}</strong><span>${m.kind === "auto" ? "autosave " : "diubah "}${t(m.kind === "auto" ? m.autosavedAt : m.updatedAt)}</span></div><div class="proj-actions"></div>`;
    const act = div.querySelector(".proj-actions");
    actions.forEach(([label, fn, danger]) => {
      const b = document.createElement("button"); b.className = "link-btn" + (danger ? " danger" : ""); b.textContent = label;
      b.addEventListener("click", fn); act.appendChild(b);
    });
    return div;
  };
  const openMeta = async (m) => {
    if (!(await confirmLeave())) return;
    const proj = await store.loadProject(m.id);
    if (proj) { applyProject(proj.meta, proj.content); refreshProjectPanel(); }
  };
  listEl.innerHTML = "";
  const h1 = document.createElement("h3"); h1.textContent = "Autosave terakhir (pemulihan, maks. 3)"; listEl.appendChild(h1);
  if (!autos.length) listEl.appendChild(Object.assign(document.createElement("p"), { className: "hint", textContent: "Belum ada autosave." }));
  autos.forEach((m) => listEl.appendChild(row(m, [
    ["Lanjutkan", () => openMeta(m)],
    ["Hapus", async () => { if (confirm(`Hapus autosave "${m.name}"?`)) { await store.deleteProject(m.id); store.sweepAssets().catch(() => {}); refreshProjectPanel(); } }, true],
  ])));
  const h2 = document.createElement("h3"); h2.textContent = "Project tersimpan (permanen)"; listEl.appendChild(h2);
  if (!saved.length) listEl.appendChild(Object.assign(document.createElement("p"), { className: "hint", textContent: "Belum ada — pakai tombol Simpan." }));
  saved.forEach((m) => listEl.appendChild(row(m, [
    ["Buka", () => openMeta(m)],
    ["Ganti nama", async () => {
      const n = prompt("Nama baru:", m.name); if (n == null) return;
      await store.updateMeta(m.id, { name: n.trim() || m.name });
      if (current.savedId === m.id) { current.name = n.trim() || m.name; updateSaveBadge(); }
      refreshProjectPanel();
    }],
    ["Duplikat", async () => {
      const proj = await store.loadProject(m.id); if (!proj) return;
      await store.saveProject(Object.assign({}, m, { id: store.newId("p"), name: m.name + " (salinan)", createdAt: Date.now(), updatedAt: Date.now() }), proj.content);
      refreshProjectPanel();
    }],
    ["Export", async () => {
      const json = await store.exportProject(m.id); if (!json) return;
      downloadBlob(new Blob([JSON.stringify(json)], { type: "application/json" }), (m.name || "project").replace(/[^\w\- ]+/g, "") + ".carousel.json");
    }],
    ["Hapus", async () => {
      if (!confirm(`Hapus permanen project "${m.name}"?`)) return;
      await store.deleteProject(m.id);
      if (current.savedId === m.id) { current.savedId = null; current.dirty = true; updateSaveBadge(); }
      store.sweepAssets().catch(() => {});
      refreshProjectPanel();
    }, true],
  ])));
}
function wireProjectUI() {
  const panel = document.getElementById("projectPanel");
  document.getElementById("projectsBtn").addEventListener("click", () => {
    panel.style.display = panel.style.display === "none" ? "block" : "none";
    refreshProjectPanel();
  });
  document.getElementById("saveBtn").addEventListener("click", () => manualSave(false));
  document.getElementById("saveAsBtn").addEventListener("click", () => manualSave(true));
  document.getElementById("newProjectBtn").addEventListener("click", async () => {
    if (!(await confirmLeave())) return;
    newProject(); refreshProjectPanel();
  });
  const impInput = document.getElementById("projectImportInput");
  document.getElementById("projectImportBtn").addEventListener("click", () => impInput.click());
  impInput.addEventListener("change", async () => {
    const f = impInput.files[0]; impInput.value = "";
    if (!f) return;
    try {
      const json = JSON.parse(await f.text());
      const meta = await store.importProject(json, store.newId("p"));
      refreshProjectPanel();
      if (confirm(`Project "${meta.name}" di-import. Buka sekarang?`)) {
        if (!(await confirmLeave())) return;
        const proj = await store.loadProject(meta.id);
        if (proj) applyProject(proj.meta, proj.content);
      }
    } catch (e) { alert("Import gagal: " + (e.message || e)); }
  });
}

/* Sync the Pengaturan-Global inputs from state (after restore / new project). */
function syncGlobalInputs() {
  igInput.value = state.settings.igHandle || "";
  webInput.value = state.settings.website || "";
  ratioSelect.value = state.settings.ratio || "4:5";
  customFontInput.value = state.settings.customFontUrl || "";
  [...fontRow.children].forEach((c) => c.classList.toggle("active", !state.settings.customFontUrl && c.textContent === state.settings.font));
  if (state.bgImage) { bgThumb.src = state.bgImage; bgThumb.style.display = "block"; bgPlaceholder.style.display = "none"; bgRemoveBtn.style.display = "inline-block"; }
  else { bgThumb.style.display = "none"; bgPlaceholder.style.display = "flex"; bgRemoveBtn.style.display = "none"; }
  const ed = document.getElementById("briefEditor");
  if (ed) { ed.value = state.briefText || ""; ed.dispatchEvent(new Event("__sync")); }
  renderGlobalBgEditor();
  renderGlobalCapEditor();
}
/* Global caption typography (Pengaturan Global) — the default every slide's caption
 * uses unless that slide sets its own "Custom slide ini" override. */
function renderGlobalCapEditor() {
  const host = document.getElementById("globalCapStyle");
  if (!host) return;
  host.innerHTML = "";
  host.appendChild(buildCaptionEditor(state.settings.capStyle, () => { refreshAll(); markDirty(); }));
}

/* ---------------- Slide render data ---------------- */
// Custom background fill: build the CSS for solid / linear / radial, from either the
// slide's own colours ("custom") or the global ones in settings ("global").
function fillCss(type, c1, c2, angle) {
  if (type === "solid") return c1;
  if (type === "linear") return `linear-gradient(${angle != null ? angle : 155}deg, ${c1}, ${c2})`;
  if (type === "radial") return `radial-gradient(circle at 50% 38%, ${c1}, ${c2})`;
  return "";
}
function resolveBgFill(slide) {
  if (slide.bgColorMode === "custom") return fillCss(slide.bgFillType || "solid", slide.bgC1 || "#2F318B", slide.bgC2 || "#101138", slide.bgAngle);
  if (slide.bgColorMode === "global" && state.settings.bgFillType) {
    return fillCss(state.settings.bgFillType, state.settings.bgC1 || "#2F318B", state.settings.bgC2 || "#101138", state.settings.bgAngle);
  }
  return "";
}
/* ---- Background overlay & image effects (resolved for the renderer) ---- */
// Per-stop alpha lets a gradient fade to fully transparent — the "dark at the bottom
// only" look that a single opacity value can't express.
function rgbaOf(hex, alphaPct) {
  const [r, g, b] = hexToRgbArr(hex || "#000000");
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(100, alphaPct == null ? 100 : alphaPct)) / 100})`;
}
function overlayCss(o) {
  const c1 = rgbaOf(o.ovC1 || "#000000", o.ovA1);
  const c2 = rgbaOf(o.ovC2 || "#000000", o.ovA2);
  switch (o.ovType) {
    case "solid": return c1;
    case "linear": return `linear-gradient(${o.ovAngle == null ? 180 : o.ovAngle}deg, ${c1}, ${c2})`;
    case "radial": return `radial-gradient(circle at 50% 50%, ${c1}, ${c2})`;
    // Transparent core → the picked colour at the rim, so the photo stays visible in
    // the middle while the edges (and any text over them) get darker.
    case "vignette": return `radial-gradient(ellipse at 50% 50%, ${rgbaOf(o.ovC1 || "#000000", 0)} 42%, ${c1} 100%)`;
    default: return "";
  }
}
function fxFilterCss(o) {
  const parts = [];
  if (o.bgBlur) parts.push(`blur(${o.bgBlur}px)`);
  if (o.bgBrightness != null && o.bgBrightness !== 100) parts.push(`brightness(${o.bgBrightness}%)`);
  if (o.bgContrast != null && o.bgContrast !== 100) parts.push(`contrast(${o.bgContrast}%)`);
  if (o.bgSaturate != null && o.bgSaturate !== 100) parts.push(`saturate(${o.bgSaturate}%)`);
  if (o.bgGrayscale) parts.push(`grayscale(${o.bgGrayscale}%)`);
  return parts.join(" ");
}
const NO_FX = { overlay: "", blend: "", opacity: 1, filter: "", blur: 0 };
function resolveFx(slide) {
  const src = slide.fxMode === "custom" ? slide : slide.fxMode === "global" ? state.settings : null;
  if (!src) return NO_FX;
  return {
    overlay: overlayCss(src),
    blend: src.ovBlend || "normal",
    opacity: (src.ovOpacity == null ? 100 : src.ovOpacity) / 100,
    filter: fxFilterCss(src),
    blur: src.bgBlur || 0,
  };
}
function slideData(slide, idx, logo) {
  const fx = resolveFx(slide);
  return {
    bgFill: resolveBgFill(slide),
    bgOverlay: fx.overlay, bgOverlayBlend: fx.blend, bgOverlayOpacity: fx.opacity,
    bgFilter: fx.filter, bgBlur: fx.blur,
    figureImage: slide.figureImage, figureSide: slide.figureSide, figureLayer: slide.figureLayer,
    figX: slide.figX, figY: slide.figY, figScale: slide.figScale, figRotate: slide.figRotate, figFlip: slide.figFlip, figOpacity: slide.figOpacity,
    type: slide.type, theme: slide.theme, align: slide.align, topic: slide.topic,
    eyebrow: slide.eyebrow, title: slide.title, subtitle: slide.subtitle, button: slide.button,
    items: slide.items, colA: slide.colA, itemsA: slide.itemsA, colB: slide.colB, itemsB: slide.itemsB,
    capTop: slide.capTop, capBottom: slide.capBottom, image: slide.image, imageCaption: slide.imageCaption,
    capStyle: resolveCapStyle(slide),
    bgImage: slide.bgMode === "custom" ? (slide.bgImage || null) : slide.bgMode === "global" ? (state.bgImage || null) : null,
    textColor: slide.textColor, titleColor: slide.titleColor, markColor: slide.markColor, highlightTextColor: slide.highlightTextColor,
    texture: slide.texture, textureTone: slide.textureTone, textureOpacity: slide.textureOpacity, pattern: slide.pattern,
    // Global-mode slides inherit the GLOBAL image transform (position + zoom) so
    // every slide shows the background identically; custom mode keeps its own.
    // (The ?? fallbacks also fix the Size slider: it writes *Scale, renderer reads *Zoom.)
    bgX: slide.bgMode === "global" ? (state.settings.bgX ?? 50) : slide.bgX,
    bgY: slide.bgMode === "global" ? (state.settings.bgY ?? 50) : slide.bgY,
    bgZoom: slide.bgMode === "global" ? (state.settings.bgScale ?? 100) : (slide.bgScale ?? slide.bgZoom),
    bgFit: slide.bgMode === "global" ? (state.settings.bgFit || "contain") : (slide.bgFit || "contain"),
    imgX: slide.imgX, imgY: slide.imgY, imgZoom: slide.imgScale ?? slide.imgZoom,
    textureX: slide.textureX, textureY: slide.textureY, textureScale: slide.textureScale, 
    patternX: slide.patternX, patternY: slide.patternY, patternScale: slide.patternScale, patternThickness: slide.patternThickness,
    font: state.settings.font, customFontUrl: state.settings.customFontUrl, ratio: state.settings.ratio,
    logo: logo || LOGO_DATAURL, index: idx + 1, total: state.slides.length,
    igHandle: state.settings.igHandle, website: state.settings.website,
  };
}

/* ================= Background colour system =================
 * Full colour control: native picker + HEX + RGB inputs, eyedropper (when the
 * browser has window.EyeDropper), recent & favourite swatches (localStorage), and
 * solid / linear / radial fill types. One editor is reused for the GLOBAL background
 * (Pengaturan Global) and for each slide's CUSTOM background. */
const FILL_TYPES = [{ id: "solid", label: "Warna solid" }, { id: "linear", label: "Gradasi linear" }, { id: "radial", label: "Gradasi radial" }];
const RECENT_KEY = "cs-recent-colors", FAV_KEY = "cs-fav-colors";
const readColors = (k) => { try { return JSON.parse(localStorage.getItem(k)) || []; } catch (e) { return []; } };
const writeColors = (k, arr) => { try { localStorage.setItem(k, JSON.stringify(arr.slice(0, 12))); } catch (e) {} };
const pushRecent = (hex) => { const a = readColors(RECENT_KEY).filter((c) => c !== hex); a.unshift(hex); writeColors(RECENT_KEY, a); };
const hexToRgbArr = (hex) => { const h = (hex || "#000000").replace("#", ""); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) || 0); };
const rgbArrToHex = (r, g, b) => "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v || 0))).toString(16).padStart(2, "0")).join("");
const validHex = (s) => /^#?[0-9a-fA-F]{6}$/.test(s || "");

function buildColorControl(obj, key, labelText, onChange, swatchTarget) {
  const wrap = document.createElement("div"); wrap.className = "cp-slot";
  wrap.innerHTML =
    `<div class="cp-label">${labelText}</div>` +
    `<div class="cp-row"><input type="color" class="cp-pick"/><input type="text" class="cp-hex" maxlength="7" spellcheck="false"/>` +
    `<span class="cp-rgb">R<input type="number" class="cp-num r" min="0" max="255"> G<input type="number" class="cp-num g" min="0" max="255"> B<input type="number" class="cp-num b" min="0" max="255"></span>` +
    `<button type="button" class="link-btn cp-eye" title="Ambil warna dari layar">Pipet</button>` +
    `<button type="button" class="link-btn cp-fav" title="Simpan warna ini ke favorit">+ Favorit</button></div>`;
  const pick = wrap.querySelector(".cp-pick"), hexIn = wrap.querySelector(".cp-hex");
  const rIn = wrap.querySelector(".r"), gIn = wrap.querySelector(".g"), bIn = wrap.querySelector(".b");
  const apply = (hex, from, commit) => {
    if (!validHex(hex)) return;
    hex = hex.startsWith("#") ? hex : "#" + hex;
    obj[key] = hex.toLowerCase();
    if (from !== "pick") pick.value = obj[key];
    if (from !== "hex") hexIn.value = obj[key];
    const [r, g, b] = hexToRgbArr(obj[key]);
    if (from !== "rgb") { rIn.value = r; gIn.value = g; bIn.value = b; }
    if (commit) pushRecent(obj[key]);
    if (swatchTarget) swatchTarget.focusKey = key;
    onChange();
  };
  apply(obj[key] || "#2f318b", "init", false);
  pick.addEventListener("input", () => apply(pick.value, "pick", false));
  pick.addEventListener("change", () => apply(pick.value, "pick", true));
  hexIn.addEventListener("input", () => apply(hexIn.value, "hex", false));
  hexIn.addEventListener("change", () => apply(hexIn.value, "hex", true));
  [rIn, gIn, bIn].forEach((inp) => inp.addEventListener("input", () => apply(rgbArrToHex(+rIn.value, +gIn.value, +bIn.value), "rgb", false)));
  const eye = wrap.querySelector(".cp-eye");
  if (window.EyeDropper) {
    eye.addEventListener("click", async () => {
      try { const res = await new window.EyeDropper().open(); apply(res.sRGBHex, "eye", true); } catch (e) { /* cancelled */ }
    });
  } else eye.style.display = "none";
  wrap.querySelector(".cp-fav").addEventListener("click", () => {
    const favs = readColors(FAV_KEY);
    if (!favs.includes(obj[key])) { favs.unshift(obj[key]); writeColors(FAV_KEY, favs); }
    if (swatchTarget && swatchTarget.render) swatchTarget.render();
  });
  wrap.__apply = (hex) => apply(hex, "swatch", true);
  return wrap;
}

/* Full background editor: fill type + colour slot(s) + angle + swatches. */
function buildBgFillEditor(obj, onChange, opts) {
  opts = opts || {};
  const box = document.createElement("div"); box.className = "bgfill-editor";
  const typeOptions = (opts.allowNone ? [{ id: "", label: "Tanpa (default tema)" }] : []).concat(FILL_TYPES);
  const shared = { focusKey: "bgC1", render: null };
  let c1, c2, angleRow, swatchBox;
  const rerenderVisibility = () => {
    const t = obj.bgFillType;
    c1.style.display = t ? "" : "none";
    c2.style.display = (t === "linear" || t === "radial") ? "" : "none";
    angleRow.style.display = t === "linear" ? "" : "none";
    swatchBox.style.display = t ? "" : "none";
  };
  box.appendChild(dropdown(typeOptions, obj.bgFillType || "", (id) => { obj.bgFillType = id; rerenderVisibility(); onChange(); }));
  c1 = buildColorControl(obj, "bgC1", obj.bgFillType === "solid" ? "Warna" : "Warna 1", onChange, shared);
  c2 = buildColorControl(obj, "bgC2", "Warna 2", onChange, shared);
  box.appendChild(c1); box.appendChild(c2);
  angleRow = document.createElement("div"); angleRow.className = "cp-slot";
  angleRow.innerHTML = `<div class="cp-label">Arah gradasi</div><div class="slider-with-num"><input type="range" min="0" max="360" value="${obj.bgAngle != null ? obj.bgAngle : 155}"/><input type="number" class="num-input" min="0" max="360" value="${obj.bgAngle != null ? obj.bgAngle : 155}"/></div>`;
  const ar = angleRow.querySelector("input[type=range]"), an = angleRow.querySelector("input[type=number]");
  const setAngle = (v, from) => { const val = Math.max(0, Math.min(360, parseInt(v, 10) || 0)); obj.bgAngle = val; if (from !== "r") ar.value = val; if (from !== "n") an.value = val; onChange(); };
  ar.addEventListener("input", () => setAngle(ar.value, "r"));
  an.addEventListener("input", () => setAngle(an.value, "n"));
  box.appendChild(angleRow);

  swatchBox = document.createElement("div"); swatchBox.className = "cp-swatches";
  shared.render = () => {
    const mk = (hex, extraTitle) => {
      const s = document.createElement("button"); s.type = "button"; s.className = "cp-swatch"; s.style.background = hex;
      s.title = hex + (extraTitle || "");
      s.addEventListener("click", () => { (shared.focusKey === "bgC2" ? c2 : c1).__apply(hex); });
      return s;
    };
    swatchBox.innerHTML = "";
    const recent = readColors(RECENT_KEY), favs = readColors(FAV_KEY);
    if (favs.length) {
      const l = document.createElement("span"); l.className = "cp-swlabel"; l.textContent = "★ Favorit:"; swatchBox.appendChild(l);
      favs.forEach((h) => {
        const s = mk(h, " — dblclick hapus dari favorit");
        s.addEventListener("dblclick", () => { writeColors(FAV_KEY, readColors(FAV_KEY).filter((x) => x !== h)); shared.render(); });
        swatchBox.appendChild(s);
      });
    }
    if (recent.length) {
      const l = document.createElement("span"); l.className = "cp-swlabel"; l.textContent = "Terakhir:"; swatchBox.appendChild(l);
      recent.forEach((h) => swatchBox.appendChild(mk(h)));
    }
  };
  shared.render();
  box.appendChild(swatchBox);
  rerenderVisibility();
  return box;
}

/* ================= Background overlay & image-effect editor =================
 * One widget, reused for the GLOBAL overlay (Pengaturan Global) and for a slide's
 * own CUSTOM overlay — same deal as buildBgFillEditor. `obj` is whichever object
 * owns the overlay/effect fields. Repaints itself in place when a preset or the type
 * changes (so the visible controls always match the chosen overlay type) without
 * touching the surrounding card. */
const OV_KEYS = ["ovType", "ovC1", "ovC2", "ovA1", "ovA2", "ovAngle", "ovBlend", "ovOpacity"];
function buildBgFxEditor(obj, onChange) {
  const box = document.createElement("div"); box.className = "bgfill-editor";
  const paint = () => {
    box.innerHTML = "";

    const presetLbl = document.createElement("div"); presetLbl.className = "cp-label"; presetLbl.textContent = "Preset cepat";
    box.appendChild(presetLbl);
    box.appendChild(chipRow(OV_PRESETS, null, (id) => {
      const p = OV_PRESETS.find((x) => x.id === id);
      if (!p) return;
      // Start from the neutral overlay defaults so leftovers from the previous preset
      // (e.g. a gradient's second colour) can't leak into the new one. Image effects
      // are deliberately left alone — they're a separate concern from the overlay.
      const base = defaultFx();
      OV_KEYS.forEach((k) => { obj[k] = base[k]; });
      Object.assign(obj, p.patch);
      paint(); onChange();
    }));

    const r1 = document.createElement("div"); r1.className = "opt-row";
    r1.appendChild(labeled("Jenis overlay", dropdown(OV_TYPES, obj.ovType || "", (id) => { obj.ovType = id; paint(); onChange(); })));
    r1.appendChild(labeled("Mode blend", dropdown(OV_BLENDS, obj.ovBlend || "normal", (id) => { obj.ovBlend = id; onChange(); })));
    box.appendChild(r1);

    if (obj.ovType) {
      const isGrad = obj.ovType === "linear" || obj.ovType === "radial";
      box.appendChild(buildColorControl(obj, "ovC1", isGrad ? "Warna 1" : "Warna overlay", onChange));
      box.appendChild(buildObjSlider(obj, "ovA1", isGrad ? "Kepekatan warna 1 (%) — 0 = transparan" : "Kepekatan warna (%)", 0, 100, 100, onChange));
      if (isGrad) {
        box.appendChild(buildColorControl(obj, "ovC2", "Warna 2", onChange));
        box.appendChild(buildObjSlider(obj, "ovA2", "Kepekatan warna 2 (%) — 0 = transparan", 0, 100, 0, onChange));
      }
      if (obj.ovType === "linear") box.appendChild(buildObjSlider(obj, "ovAngle", "Arah gradasi (°)", 0, 360, 180, onChange));
      box.appendChild(buildObjSlider(obj, "ovOpacity", "Kekuatan overlay (%)", 0, 100, 45, onChange));
    }

    const fxLbl = document.createElement("div"); fxLbl.className = "cp-label"; fxLbl.style.marginTop = "10px";
    fxLbl.textContent = "Efek gambar background (blur & warna)";
    box.appendChild(fxLbl);
    box.appendChild(buildObjSlider(obj, "bgBlur", "Blur (px)", 0, 40, 0, onChange));
    box.appendChild(buildObjSlider(obj, "bgBrightness", "Kecerahan (%)", 20, 150, 100, onChange));
    box.appendChild(buildObjSlider(obj, "bgContrast", "Kontras (%)", 50, 150, 100, onChange));
    box.appendChild(buildObjSlider(obj, "bgSaturate", "Saturasi (%)", 0, 200, 100, onChange));
    box.appendChild(buildObjSlider(obj, "bgGrayscale", "Hitam-putih (%)", 0, 100, 0, onChange));
    const hint = document.createElement("span"); hint.className = "field-hint";
    hint.textContent = "Blur & efek warna hanya kena ke gambar background; overlay tetap jalan walau slide cuma pakai warna tema.";
    box.appendChild(hint);

    const reset = document.createElement("button");
    reset.type = "button"; reset.className = "link-btn"; reset.textContent = "↺ Reset overlay & efek";
    reset.addEventListener("click", () => { Object.assign(obj, defaultFx(), { ovType: "" }); paint(); onChange(); });
    box.appendChild(reset);
  };
  paint();
  return box;
}

/* The global background editor in Pengaturan Global (rebuilt on restore). */
function renderGlobalBgEditor() {
  const host = document.getElementById("globalBgFill");
  if (!host) return;
  host.innerHTML = "";
  host.appendChild(buildBgFillEditor(state.settings, () => { refreshAll(); markDirty(); }, { allowNone: true }));
  const applyAll = document.createElement("button");
  applyAll.type = "button"; applyAll.className = "link-btn"; applyAll.textContent = "Terapkan warna ini ke semua slide";
  applyAll.addEventListener("click", () => { state.slides.forEach((s) => { s.bgColorMode = "global"; }); renderSlides(); });
  host.appendChild(applyAll);
  // Global background IMAGE modes: apply to every slide, or release back to the
  // theme default — a slide's own custom image is never deleted by switching.
  const imgActions = document.getElementById("bgGlobalActions");
  if (imgActions) {
    imgActions.innerHTML = "";
    const applyImg = document.createElement("button");
    applyImg.type = "button"; applyImg.className = "link-btn"; applyImg.textContent = "Pakai gambar ini di semua slide";
    applyImg.addEventListener("click", () => {
      if (!state.bgImage) { alert("Upload dulu gambar background globalnya."); return; }
      state.slides.forEach((s) => { s.bgMode = "global"; });
      renderSlides();
    });
    const releaseImg = document.createElement("button");
    releaseImg.type = "button"; releaseImg.className = "link-btn"; releaseImg.textContent = "Lepas dari semua slide";
    releaseImg.title = "Kembali ke tampilan tema; gambar custom milik tiap slide tetap tersimpan";
    releaseImg.addEventListener("click", () => { state.slides.forEach((s) => { if (s.bgMode === "global") s.bgMode = ""; }); renderSlides(); });
    imgActions.appendChild(applyImg); imgActions.appendChild(releaseImg);
  }
  // Global overlay & image effects — inherited by every slide whose overlay mode is
  // "Global"; the apply-all button switches every slide over in one click.
  const fxHost = document.getElementById("globalBgFx");
  if (fxHost) {
    fxHost.innerHTML = "";
    fxHost.appendChild(buildBgFxEditor(state.settings, () => { refreshAll(); markDirty(); }));
    // One-click "make the text readable everywhere except the cover": ensure the
    // global overlay actually darkens+blurs (fill in a sensible readable preset only
    // if nothing is set yet, so a custom global overlay is respected), then switch
    // every slide to global overlay EXCEPT slide 1 — the cover stays clear so its
    // photo shows off, the rest get the scrim so their text is legible.
    const readableExceptCover = document.createElement("button");
    readableExceptCover.type = "button"; readableExceptCover.className = "btn btn-secondary"; readableExceptCover.style.fontSize = "12.5px";
    readableExceptCover.textContent = "⚡ Blur + gelapkan semua slide (kecuali cover)";
    readableExceptCover.title = "Slide 1 tetap jernih; slide 2-dst dikasih blur + overlay gelap biar teksnya kebaca";
    readableExceptCover.addEventListener("click", () => {
      const st = state.settings;
      if (!st.ovType && !st.bgBlur) { // nothing configured yet → apply a readable default
        Object.assign(st, { ovType: "solid", ovC1: "#000000", ovA1: 100, ovBlend: "multiply", ovOpacity: 42, bgBlur: 6 });
      }
      state.slides.forEach((s, i) => { s.fxMode = i === 0 ? "" : "global"; });
      renderGlobalBgEditor();
      renderSlides();
    });
    fxHost.appendChild(readableExceptCover);
    const applyFx = document.createElement("button");
    applyFx.type = "button"; applyFx.className = "link-btn"; applyFx.textContent = "Terapkan ke semua slide (termasuk cover)";
    applyFx.addEventListener("click", () => { state.slides.forEach((s) => { s.fxMode = "global"; }); renderSlides(); });
    const clearFx = document.createElement("button");
    clearFx.type = "button"; clearFx.className = "link-btn"; clearFx.textContent = "Matikan di semua slide";
    clearFx.title = "Overlay slide yang custom tetap tersimpan, cuma dimatikan";
    clearFx.addEventListener("click", () => { state.slides.forEach((s) => { s.fxMode = ""; }); renderSlides(); });
    const row = document.createElement("div"); row.className = "chip-row"; row.style.marginTop = "6px";
    row.appendChild(applyFx); row.appendChild(clearFx);
    fxHost.appendChild(row);
  }
  // Global image position/zoom — inherited live by every slide in global mode.
  const tHost = document.getElementById("bgGlobalTransform");
  if (tHost) {
    tHost.innerHTML = "";
    tHost.appendChild(labeled("Ukuran gambar", dropdown(BG_FITS, state.settings.bgFit || "contain", (id) => { state.settings.bgFit = id; refreshAll(); markDirty(); }),
      "Utuh = seluruh gambar kelihatan (sisanya jadi warna background). Isi penuh = dipotong biar menuhin slide."));
    tHost.appendChild(buildTransformControls(state.settings, "bg", "Posisi & zoom gambar global (berlaku untuk semua slide global)", { alignments: true }));
  }
  updateGlobalPreview();
}

/* ---------------- Global settings ---------------- */
const bgDropzone = document.getElementById("bgDropzone"), bgFileInput = document.getElementById("bgFileInput");
const bgThumb = document.getElementById("bgThumb"), bgPlaceholder = document.getElementById("bgPlaceholder"), bgRemoveBtn = document.getElementById("bgRemoveBtn");
wireDropzone(bgDropzone, bgFileInput, async (file) => {
  if (!guardImage(file)) return;
  try { state.bgImage = await loadImage(file, 1600); }
  catch (e) { alert(e.message || "Gambar gagal dimuat."); return; }
  bgThumb.src = state.bgImage; bgThumb.style.display = "block"; bgPlaceholder.style.display = "none"; bgRemoveBtn.style.display = "inline-block";
  refreshAll();
});
bgRemoveBtn.addEventListener("click", (e) => { e.stopPropagation(); state.bgImage = null; bgThumb.style.display = "none"; bgPlaceholder.style.display = "flex"; bgRemoveBtn.style.display = "none"; refreshAll(); });

/* ---- Live preview of the GLOBAL background (sticky, next to the controls) ----
 * Renders a sample slide with bgMode "global" so image position/zoom/fit and the
 * overlay/effects are visible immediately — no scrolling down to the slide cards.
 * Two views: "Slide isi" (with the global overlay, to check text readability) and
 * "Cover" (no overlay, to check the photo shows off clearly on slide 1). */
const globalBgPreview = document.getElementById("globalBgPreview");
let gbpReady = false, gbpMode = "content";
// Uses the REAL slide content so the preview shows the user's actual text, not
// placeholders: "Cover" clones slide 1 (no overlay — image clear), "Slide isi" clones
// the first non-cover slide (with the global overlay, to check text readability).
// Both are forced to bgMode "global" so they display the global background image.
function gbpSample() {
  const slides = state.slides || [];
  if (gbpMode === "cover") {
    const base = slides[0] || { type: "cover", theme: "dark", title: "Judul cover" };
    return Object.assign({}, base, { bgMode: "global", fxMode: "" });
  }
  // Prefer a slide whose text sits directly on the background (highlight/cta/figure) so
  // the overlay's effect on readability is actually visible; fall back to any non-cover.
  const onBg = { highlight: 1, cta: 1, figure: 1 };
  const content = slides.find((s) => s.type !== "cover" && onBg[s.type]) ||
    slides.find((s) => s.type !== "cover") || slides[1] || slides[0] ||
    { type: "highlight", theme: "dark", title: "Teks slide isi tetap **kebaca**" };
  return Object.assign({}, content, { bgMode: "global", fxMode: "global" });
}
function updateGlobalPreview() {
  if (!globalBgPreview || !gbpReady || !globalBgPreview.contentWindow) return;
  const data = slideData(gbpSample(), gbpMode === "cover" ? 0 : 1);
  let ratioH = 1350;
  if (state.settings.ratio === "1:1") ratioH = 1080;
  else if (state.settings.ratio === "3:4") ratioH = 1440;
  else if (state.settings.ratio === "9:16") ratioH = 1920;
  const scale = 200 / 1080;
  globalBgPreview.style.height = ratioH + "px";
  globalBgPreview.style.transform = "scale(" + scale + ")";
  globalBgPreview.parentElement.style.height = Math.round(ratioH * scale) + "px";
  globalBgPreview.contentWindow.postMessage({ type: "render", data }, "*");
}
if (globalBgPreview) {
  const markGbpReady = () => { if (gbpReady) return; gbpReady = true; updateGlobalPreview(); };
  globalBgPreview.addEventListener("load", markGbpReady);
  // The <iframe src="template.html"> is static markup, so it can finish loading BEFORE
  // this module attaches the listener above — in which case "load" never fires for us
  // and the preview would stay blank. Poll readyState as a fallback until it's ready.
  (function pollGbp(n) {
    try { if (globalBgPreview.contentDocument && globalBgPreview.contentDocument.readyState === "complete") { markGbpReady(); return; } } catch (e) { /* not accessible yet */ }
    if (n > 0) setTimeout(() => pollGbp(n - 1), 100);
  })(40);
  const setGbpMode = (mode) => {
    gbpMode = mode;
    document.getElementById("gbpModeContent").classList.toggle("active", mode === "content");
    document.getElementById("gbpModeCover").classList.toggle("active", mode === "cover");
    updateGlobalPreview();
  };
  document.getElementById("gbpModeContent").addEventListener("click", () => setGbpMode("content"));
  document.getElementById("gbpModeCover").addEventListener("click", () => setGbpMode("cover"));
}

const igInput = document.getElementById("igInput"), webInput = document.getElementById("webInput");
igInput.value = state.settings.igHandle; webInput.value = state.settings.website;
igInput.addEventListener("input", () => { state.settings.igHandle = igInput.value; refreshAll(); });
webInput.addEventListener("input", () => { state.settings.website = webInput.value; refreshAll(); });

/* ---------------- Import ---------------- */
const importDropzone = document.getElementById("importDropzone"), importFileInput = document.getElementById("importFileInput");
const importStatus = document.getElementById("importStatus"), importSub = document.getElementById("importSub");

async function pdfToText(arrayBuffer) {
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let out = "";
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    let line = "";
    for (const item of content.items) {
      line += item.str;
      if (item.hasEOL) { out += line + "\n"; line = ""; }
    }
    if (line) out += line + "\n";
    out += "\n";
  }
  return out;
}
/* Build slides from brief text (used by the text editor button AND file import). */
function buildSlidesFromText(text, label) {
  if (state.slides.some((s) => s.title || s.items || s.subtitle || s.itemsA)) {
    if (!confirm("Buat slide dari teks ini? Slide sekarang akan diganti (autosave aman).")) return false;
  }
  const slides = parseBrief(text);
  state.slides = slides.map(freshSlide);
  renderSlides();
  importStatus.textContent = `✓ ${slides.length} slide kebentuk${label ? " dari " + label : ""}`;
  document.getElementById("slidesList").scrollIntoView({ behavior: "smooth", block: "start" });
  return true;
}
/* File import now feeds the TEXT EDITOR first (UTF-8 .txt/.md, or text extracted
 * from a PDF), so the content stays editable before building — and is persisted
 * with the project like manually typed text. */
async function importBrief(file) {
  const name = (file.name || "").toLowerCase();
  if (!/\.(pdf|txt|md)$/.test(name)) { importStatus.textContent = "Format harus .pdf/.txt/.md"; return; }
  importStatus.innerHTML = '<span class="spinner"></span> Membaca…'; importSub.textContent = file.name;
  try {
    let text;
    if (name.endsWith(".pdf")) text = await pdfToText(await file.arrayBuffer());
    else text = await file.text();
    if (!text.trim()) throw new Error("Nggak ada teks kebaca. Kalau PDF hasil scan/gambar, teksnya nggak bisa diambil.");
    const ed = document.getElementById("briefEditor");
    if (ed.value.trim() && ed.value.trim() !== text.trim() &&
        !confirm("Isi editor teks akan diganti dengan isi file ini. Lanjut?")) {
      importStatus.textContent = "Dibatalkan — isi editor tidak diubah."; return;
    }
    ed.value = text; state.briefText = text; ed.dispatchEvent(new Event("__sync")); markDirty();
    const textTab = document.querySelector('.input-tab[data-mode="text"]');
    if (textTab) textTab.click(); // show the editable text
    importStatus.textContent = "✓ Teks dimuat ke editor";
    if (confirm(`Teks dari "${file.name}" sudah dimuat ke editor.\n\nLangsung buat slide sekarang? (Batal = edit dulu di editor)`)) {
      buildSlidesFromText(text, file.name);
    }
  } catch (err) { importStatus.textContent = "Error: " + err.message; }
}
wireDropzone(importDropzone, importFileInput, importBrief);

/* ---- text-editor input mode ---- */
const briefEditor = document.getElementById("briefEditor");
const briefCount = document.getElementById("briefCount");
function briefGrow() {
  briefEditor.style.height = "auto";
  briefEditor.style.height = Math.min(560, Math.max(180, briefEditor.scrollHeight + 4)) + "px";
  briefCount.textContent = briefEditor.value.length ? briefEditor.value.length.toLocaleString("id-ID") + " karakter" : "";
}
briefEditor.addEventListener("input", () => { state.briefText = briefEditor.value; briefGrow(); markDirty(); });
briefEditor.addEventListener("__sync", briefGrow);
document.getElementById("buildFromTextBtn").addEventListener("click", () => {
  const text = briefEditor.value;
  if (!text.trim()) { alert("Editornya masih kosong — tulis atau import dulu."); return; }
  try { buildSlidesFromText(text, "editor"); }
  catch (e) { alert("Teks belum bisa diparse: " + e.message); }
});
document.getElementById("loadExampleToEditorBtn").addEventListener("click", async () => {
  if (briefEditor.value.trim() && !confirm("Ganti isi editor dengan contoh format?")) return;
  try {
    briefEditor.value = await (await fetch("contoh-brief.txt")).text();
    state.briefText = briefEditor.value; briefGrow(); markDirty();
  } catch (e) { alert("Gagal memuat contoh."); }
});
// Mode switch — switching NEVER clears content, it just shows the other pane.
document.querySelectorAll(".input-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".input-tab").forEach((t2) => t2.classList.toggle("active", t2 === tab));
    document.getElementById("inputTextPane").style.display = tab.dataset.mode === "text" ? "block" : "none";
    document.getElementById("inputFilePane").style.display = tab.dataset.mode === "file" ? "block" : "none";
    if (tab.dataset.mode === "text") briefGrow();
  });
});

/* ---- Clipboard & toast helpers ---- */
async function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(text);
  } else {
    const ta = document.createElement("textarea"); ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    document.execCommand("copy"); document.body.removeChild(ta);
  }
}
function showToast(message) {
  const t = document.createElement("div");
  t.className = "copy-toast";
  t.textContent = message;
  t.style.cssText = "position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--navy-deep);color:#fff;padding:12px 22px;border-radius:999px;font-weight:700;font-size:13.5px;box-shadow:0 10px 30px rgba(0,0,0,0.25);z-index:2000;animation:toastIn 0.2s ease;";
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = "0"; t.style.transition = "opacity 0.25s ease"; setTimeout(() => t.remove(), 260); }, 2200);
}

/* ---- GPT Prompt Generator: form-based prompt builder with multiple templates ---- */
const pgModal = document.getElementById("promptGeneratorModal");
const pgTopic = document.getElementById("pgTopic");
const pgAudience = document.getElementById("pgAudience");
const pgSlides = document.getElementById("pgSlides");
const pgGoal = document.getElementById("pgGoal");
const pgTone = document.getElementById("pgTone");
const pgExtra = document.getElementById("pgExtra");
const pgTemplate = document.getElementById("pgTemplate");
// Quick-fill: paste a "==== topik: …" block to populate the Form Cepat fields.
const pgBulk = document.getElementById("pgBulk");
const pgBulkStatus = document.getElementById("pgBulkStatus");
const pgPreviewBox = document.getElementById("pgPreviewBox");
const pgPreview = document.getElementById("pgPreview");
const pgCharCount = document.getElementById("pgCharCount");
// Editor-naskah mode (second tab): paste a brainstorm / draft and wrap it in an
// Indonesian prompt that already carries the brief-format rules.
const pgEditorTemplate = document.getElementById("pgEditorTemplate");
const pgEditorNote = document.getElementById("pgEditorNote");
const pgMaterial = document.getElementById("pgMaterial");
const pgMaterialCount = document.getElementById("pgMaterialCount");
const pgEdSlides = document.getElementById("pgEdSlides");
const pgEdTone = document.getElementById("pgEdTone");
// Image-prompt section (shared by both tabs).
const pgImgInclude = document.getElementById("pgImgInclude");
const pgImgStyle = document.getElementById("pgImgStyle");
// The fixed base style every generated image shares, so all characters look like one
// consistent set. Editable in the UI; ChatGPT appends topic-specific action/scene.
const PG_IMG_STYLE_DEFAULT = "A cozy cinematic 3D animated character with large expressive eyes, soft facial features, warm lighting, smooth stylized proportions, high-quality CGI, colorful yet natural palette, friendly expression, polished family-animation aesthetic, original character design, no text, no logos, not based on any existing character.";
let pgCurrentTemplateText = "";
let pgMode = "form";

const PG_EDITOR_NOTES = {
  "editor-format": "Naskah kamu dipecah & dipadatkan jadi slide, isinya tetap punya kamu — nggak ditambah-tambahin.",
  "editor-kembangkan": "Poin-poin mentah dikembangkan jadi naskah carousel utuh (hook → isi → CTA).",
  "editor-rapikan": "Naskah yang formatnya udah bener tapi kepanjangan/berantakan — dirapikan tanpa ganti isi.",
};
// Skeleton pasted into the editor by "Sisipkan kerangka format" — the shape ChatGPT
// is asked to return, so it doubles as a manual writing template.
const PG_FORMAT_SKELETON = [
  "=== Slide ===",
  "layout: cover",
  "theme: dark",
  "topik: Hook",
  "eyebrow: STOP DULU",
  "judul: Judul pembuka yang bikin **berhenti scroll**",
  "sub: Satu kalimat pendukung yang jelas.",
  "",
  "=== Slide ===",
  "layout: list",
  "theme: dark",
  "topik: Isi",
  "judul: 3 hal yang wajib kamu tahu",
  "- 🎯 Poin pertama :: penjelasan singkatnya",
  "- 💡 Poin kedua :: penjelasan singkatnya",
  "- 🔥 Poin ketiga :: penjelasan singkatnya",
  "",
  "=== Slide ===",
  "layout: compare",
  "theme: dark",
  "judul: Salah vs Benar",
  "kiri: Yang sering dilakukan",
  "- ❌ Kebiasaan yang keliru",
  "kanan: Yang seharusnya",
  "- ✅ Cara yang benar",
  "",
  "=== Slide ===",
  "layout: cta",
  "theme: dark",
  "topik: Closing",
  "judul: Mulai dari sekarang, **#PastiBisa**",
  "sub: Simpan carousel ini biar nggak lupa.",
  "tombol: Save & share ke temanmu 👇",
  "",
].join("\n");

function initPromptGenerator() {
  pgTemplate.innerHTML = "";
  listPromptTemplates("form").forEach((t) => {
    const opt = document.createElement("option");
    opt.value = t.id; opt.textContent = t.label;
    pgTemplate.appendChild(opt);
  });
  pgEditorTemplate.innerHTML = "";
  listPromptTemplates("editor").forEach((t) => {
    const opt = document.createElement("option");
    opt.value = t.id; opt.textContent = t.label;
    pgEditorTemplate.appendChild(opt);
  });
  if (!pgImgStyle.value) pgImgStyle.value = PG_IMG_STYLE_DEFAULT;
  syncPgEditorNote();
  syncPgMaterialCount();
}
function syncPgEditorNote() { pgEditorNote.textContent = PG_EDITOR_NOTES[pgEditorTemplate.value] || ""; }
function syncPgMaterialCount() {
  pgMaterialCount.textContent = pgMaterial.value.length.toLocaleString("id-ID") + " karakter";
}
/* Switching tabs never clears anything — both panes keep whatever was typed, and the
 * generated-prompt box is hidden so a stale prompt from the other mode can't be
 * mistaken for this one's output. */
function setPromptMode(mode) {
  pgMode = mode === "editor" ? "editor" : "form";
  document.querySelectorAll(".pg-tab").forEach((t) => t.classList.toggle("active", t.dataset.pgMode === pgMode));
  document.getElementById("pgFormPane").style.display = pgMode === "form" ? "grid" : "none";
  document.getElementById("pgEditorPane").style.display = pgMode === "editor" ? "grid" : "none";
  pgPreviewBox.style.display = "none";
}

/* ---- Form Cepat quick-fill: paste a "==== topik: …" block → fill the fields ----
 * Each entry maps the field's input to the keys accepted for it (Indonesian first,
 * a couple of English aliases). The parser is deliberately forgiving so a block
 * copied straight out of ChatGPT works without hand-cleaning. */
const PG_BULK_MAP = [
  { el: () => pgTopic, name: "topik", keys: ["topik", "topic", "tema", "judul"] },
  { el: () => pgAudience, name: "audience", keys: ["audience", "target audience", "target", "audiens", "sasaran"] },
  { el: () => pgSlides, name: "slide", keys: ["slide", "slides", "jumlah slide", "jumlah"] },
  { el: () => pgGoal, name: "tujuan", keys: ["tujuan", "goal", "objektif"] },
  { el: () => pgTone, name: "tone", keys: ["tone", "nada", "gaya"] },
  { el: () => pgExtra, name: "instruksi", keys: ["instruksi", "instruksi tambahan", "tambahan", "catatan", "extra", "notes"] },
];
// key (lowercased) -> map entry, built once from the alias lists above.
const PG_BULK_KEYS = (() => { const m = {}; PG_BULK_MAP.forEach((f) => f.keys.forEach((k) => { m[k] = f; })); return m; })();
const PG_BULK_SKELETON = [
  "==== topik: Cara menghadapi UTBK tanpa burnout",
  "==== audience: Pelajar SMA, pejuang UTBK",
  "==== slide: 5-7",
  "==== tujuan: Edukasi & motivasi",
  "==== tone: Motivasi edukatif, santai",
  "==== instruksi: Kasih contoh nyata, hindari bahasa kaku",
].join("\n");
// Blank template + instruction for ChatGPT to fill — copied to the clipboard so the
// user can paste it into ChatGPT, get it filled, then paste the result back.
const PG_BULK_COPY_TEMPLATE = [
  "Tolong bantu isi format brief carousel di bawah ini berdasarkan ide/topik saya.",
  "Aturan: jawab HANYA blok formatnya, jangan tambah penjelasan lain. Pertahankan",
  "nama field dan tanda \"==== \" persis seperti ini, isi setelah tanda titik dua.",
  "",
  "==== topik: ",
  "==== audience: ",
  "==== slide: ",
  "==== tujuan: ",
  "==== tone: ",
  "==== instruksi: ",
  "",
  "Ide/topik saya: [tulis topik kamu di sini]",
].join("\n");

/* Parse the bulk block into { field.name -> value }. A line starts a new field when,
 * after stripping any leading run of = # * - and spaces, its text before the first
 * ":" is a known key; otherwise the line is appended to the current field (so a
 * multi-line "instruksi" value survives). Returns { values, count }. */
function parsePgBulk(text) {
  const values = {};
  let current = null;
  (text || "").split(/\r?\n/).forEach((raw) => {
    const line = raw.replace(/^[\s=#*\-–—]+/, "");
    const ci = line.indexOf(":");
    if (ci > 0) {
      const key = line.slice(0, ci).trim().toLowerCase();
      const entry = PG_BULK_KEYS[key];
      if (entry) {
        current = entry.name;
        values[current] = (line.slice(ci + 1).trim());
        return;
      }
    }
    // continuation line for the field in progress (keeps blank lines out of the front)
    if (current && raw.trim()) values[current] += (values[current] ? "\n" : "") + raw.trim();
  });
  return { values, count: Object.keys(values).length };
}
function fillFormFromBulk() {
  const { values, count } = parsePgBulk(pgBulk.value);
  if (!count) {
    pgBulkStatus.textContent = "Nggak ada baris berformat yang kebaca. Pakai pola “topik: …”, satu field per baris.";
    return;
  }
  PG_BULK_MAP.forEach((f) => { if (values[f.name] != null) f.el().value = values[f.name]; });
  const filled = PG_BULK_MAP.filter((f) => values[f.name] != null).map((f) => f.name);
  pgBulkStatus.textContent = "✓ Terisi: " + filled.join(", ") + ". Cek lagi di bawah, lalu klik Generate Prompt.";
  pgTopic.scrollIntoView({ behavior: "smooth", block: "nearest" });
}
// Serialize whatever is currently in the form back into the bulk format, so the user
// can tweak it as text (or hand it to ChatGPT as the template to fill).
function bulkFromForm() {
  const lines = PG_BULK_MAP.map((f) => "==== " + f.name + ": " + (f.el().value.trim() || "")).join("\n");
  pgBulk.value = lines;
  pgBulkStatus.textContent = "Diambil dari form. Edit teksnya, lalu klik “Isi form dari teks”.";
}

function openPromptGenerator() {
  pgModal.style.display = "flex";
  pgModal.setAttribute("aria-hidden", "false");
  (pgMode === "editor" ? pgMaterial : pgTopic).focus();
}

function closePromptGenerator() {
  pgModal.style.display = "none";
  pgModal.setAttribute("aria-hidden", "true");
}

function resetPromptGenerator() {
  // Only the pane you're looking at gets cleared — resetting the form shouldn't wipe a
  // long naskah you pasted in the other tab (and vice-versa).
  if (pgMode === "editor") {
    pgMaterial.value = "";
    pgEdSlides.value = "";
    pgEdTone.value = "";
    pgEditorTemplate.selectedIndex = 0;
    syncPgEditorNote();
    syncPgMaterialCount();
  } else {
    pgTopic.value = "";
    pgAudience.value = "";
    pgSlides.value = "";
    pgGoal.value = "";
    pgTone.value = "";
    pgExtra.value = "";
    pgTemplate.selectedIndex = 0;
    pgBulk.value = "";
    pgBulkStatus.textContent = "";
  }
  pgPreview.value = "";
  pgPreviewBox.style.display = "none";
  pgCharCount.textContent = "0 karakter";
  pgCurrentTemplateText = "";
}

function readFormInputs() {
  const topic = pgTopic.value.trim();
  if (!topic) { pgTopic.focus(); showToast("Topik wajib diisi."); return null; }
  return {
    _tplId: pgTemplate.value,
    topic,
    targetAudience: pgAudience.value.trim(),
    slides: pgSlides.value.trim(),
    goal: pgGoal.value.trim(),
    tone: pgTone.value.trim(),
    extraInstructions: pgExtra.value.trim(),
  };
}
function readEditorInputs() {
  const material = pgMaterial.value.trim();
  if (!material) { pgMaterial.focus(); showToast("Naskahnya masih kosong — tempel dulu di editor."); return null; }
  return {
    _tplId: pgEditorTemplate.value,
    material,
    slides: pgEdSlides.value.trim(),
    tone: pgEdTone.value.trim(),
  };
}

/* Image-prompt instructions appended to the generated prompt when the checkbox is on.
 * Tells ChatGPT to emit exactly ONE English image prompt, at the very bottom of the
 * whole script, as a single "//" comment line — the "//" makes the brief importer
 * ignore it (so it never becomes a phantom slide), while it stays readable when the
 * output is copied by hand. Built from the fixed base style + a scene representing
 * the carousel's overall topic (e.g. a "pusing/stress" carousel → a character
 * clutching their head looking overwhelmed). */
function buildImagePromptBlock() {
  const base = (pgImgStyle.value.trim() || PG_IMG_STYLE_DEFAULT);
  return [
    "",
    "=== INSTRUKSI PROMPT GAMBAR (WAJIB) ===",
    "Setelah SELURUH naskah slide selesai, di PALING BAWAH tambahkan HANYA SATU baris",
    "prompt gambar berbahasa INGGRIS, diawali persis dengan \"// gambar: \".",
    "Cuma SATU baris untuk seluruh carousel — JANGAN bikin prompt gambar di tiap slide,",
    "dan JANGAN taruh di dalam slide mana pun.",
    "Wajib diawali \"//\" supaya diabaikan importer (nggak jadi slide), tapi tetap bisa saya copy.",
    "",
    "Prompt gambar itu HARUS diawali base style tetap ini (jangan diubah):",
    base,
    "",
    "Lalu tambahkan koma dan satu adegan yang mewakili tema keseluruhan carousel:",
    "karakternya lagi ngapain, ekspresi, dan suasananya (mis. tema \"pusing\" →",
    "\"a character clutching their head, overwhelmed, papers flying around\"). Aturan:",
    "- Prompt gambarnya dalam bahasa Inggris walau teks slide Bahasa Indonesia.",
    "- Hanya satu baris, taruh paling bawah, setelah slide terakhir.",
    "- Tanpa teks, tanpa logo, tanpa merek/karakter yang sudah ada.",
    "",
    "Contoh (SATU baris saja, di paling bawah): // gambar: " + base + ", a character clutching their head looking overwhelmed, soft warm indoor lighting",
  ].join("\n");
}

async function runPromptGenerator() {
  const inputs = pgMode === "editor" ? readEditorInputs() : readFormInputs();
  if (!inputs) return; // validation already told the user what's missing
  pgCurrentTemplateText = await loadTemplate(inputs._tplId);
  if (!pgCurrentTemplateText) { showToast("Gagal memuat template prompt."); return; }
  let generated = generatePrompt(pgCurrentTemplateText, inputs);
  if (pgImgInclude.checked) generated += "\n" + buildImagePromptBlock();
  pgPreview.value = generated;
  pgPreviewBox.style.display = "block";
  pgCharCount.textContent = generated.length.toLocaleString("id-ID") + " karakter";
  pgPreview.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

async function copyGeneratedPrompt() {
  const text = pgPreview.value.trim();
  if (!text) { await runPromptGenerator(); }
  try {
    await copyToClipboard(pgPreview.value.trim());
    showToast("Prompt copied successfully.");
  } catch (e) {
    showToast("Gagal menyalin prompt.");
  }
}

async function openChatGPT() {
  const text = pgPreview.value.trim();
  if (!text) { await runPromptGenerator(); }
  try {
    await copyToClipboard(pgPreview.value.trim());
    showToast("Prompt copied. Paste it into ChatGPT.");
  } catch (e) {
    showToast("Gagal menyalin prompt.");
  }
  window.open("https://chat.openai.com/", "_blank", "noopener,noreferrer");
}

document.querySelectorAll(".pg-tab").forEach((t) => t.addEventListener("click", () => setPromptMode(t.dataset.pgMode)));
// Form-Cepat quick-fill controls.
document.getElementById("pgBulkFillBtn").addEventListener("click", fillFormFromBulk);
document.getElementById("pgBulkCopyBtn").addEventListener("click", async () => {
  try { await copyToClipboard(PG_BULK_COPY_TEMPLATE); showToast("Format tersalin — paste ke ChatGPT, minta diisiin, lalu tempel balik ke sini."); }
  catch (e) { pgBulk.value = PG_BULK_COPY_TEMPLATE; showToast("Format ditaruh di kotak — copy manual dari situ."); }
});
document.getElementById("pgBulkSkeletonBtn").addEventListener("click", () => {
  pgBulk.value = PG_BULK_SKELETON;
  pgBulkStatus.textContent = "Contoh format dimuat. Ganti isinya, lalu klik “Isi form dari teks”.";
  pgBulk.focus();
});
document.getElementById("pgBulkFromFormBtn").addEventListener("click", bulkFromForm);
document.getElementById("pgImgResetBtn").addEventListener("click", () => { pgImgStyle.value = PG_IMG_STYLE_DEFAULT; showToast("Base style gambar dikembalikan ke default."); });
pgEditorTemplate.addEventListener("change", syncPgEditorNote);
pgMaterial.addEventListener("input", syncPgMaterialCount);
document.getElementById("pgInsertFormatBtn").addEventListener("click", () => {
  const cur = pgMaterial.value;
  pgMaterial.value = cur.trim() ? cur.replace(/\s*$/, "\n\n") + PG_FORMAT_SKELETON : PG_FORMAT_SKELETON;
  syncPgMaterialCount();
  pgMaterial.focus();
  pgMaterial.scrollTop = pgMaterial.scrollHeight;
});
// Round-trip with the main content editor: pull what's already there to clean it up,
// or push the (already formatted) naskah back so it can be turned into slides.
document.getElementById("pgFromBriefBtn").addEventListener("click", () => {
  const text = briefEditor.value;
  if (!text.trim()) { showToast("Editor Konten masih kosong."); return; }
  if (pgMaterial.value.trim() && !confirm("Ganti isi editor naskah dengan isi Editor Konten?")) return;
  pgMaterial.value = text;
  syncPgMaterialCount();
  showToast("Naskah diambil dari Editor Konten.");
});
document.getElementById("pgToBriefBtn").addEventListener("click", () => {
  const text = pgMaterial.value;
  if (!text.trim()) { showToast("Naskahnya masih kosong."); return; }
  if (briefEditor.value.trim() && !confirm("Isi Editor Konten akan diganti dengan naskah ini. Lanjut?")) return;
  briefEditor.value = text;
  state.briefText = text;
  briefEditor.dispatchEvent(new Event("__sync"));
  markDirty();
  closePromptGenerator();
  const textTab = document.querySelector('.input-tab[data-mode="text"]');
  if (textTab) textTab.click();
  briefEditor.scrollIntoView({ behavior: "smooth", block: "center" });
  showToast("Naskah masuk ke Editor Konten — tinggal klik “Buat Slide dari Teks”.");
});
document.getElementById("openPromptGeneratorBtn").addEventListener("click", openPromptGenerator);
document.getElementById("pgCloseBtn").addEventListener("click", closePromptGenerator);
document.getElementById("pgBackdrop")?.addEventListener("click", closePromptGenerator);
document.getElementById("pgResetBtn").addEventListener("click", resetPromptGenerator);
document.getElementById("pgGenerateBtn").addEventListener("click", runPromptGenerator);
document.getElementById("pgCopyBtn").addEventListener("click", copyGeneratedPrompt);
document.getElementById("pgOpenChatGptBtn").addEventListener("click", openChatGPT);
pgModal.addEventListener("click", (e) => { if (e.target === pgModal || e.target.classList.contains("pg-backdrop")) closePromptGenerator(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && pgModal.style.display === "flex") closePromptGenerator(); });
initPromptGenerator();

/* ---- template gallery (additive presets; existing layouts untouched) ---- */
function renderTemplateGallery() {
  const host = document.getElementById("templateGallery");
  const catRow = document.getElementById("templateCats");
  if (!host || !catRow) return;
  let activeCat = PRESET_CATEGORIES[0].id;
  const paint = () => {
    catRow.innerHTML = "";
    PRESET_CATEGORIES.forEach((c) => {
      const b = document.createElement("button");
      b.className = "chip sm" + (c.id === activeCat ? " active" : "");
      b.textContent = c.label;
      b.addEventListener("click", () => { activeCat = c.id; paint(); });
      catRow.appendChild(b);
    });
    host.innerHTML = "";
    PRESETS.filter((p) => p.cat === activeCat).forEach((p) => {
      const cardT = document.createElement("div"); cardT.className = "tpl-card";
      cardT.innerHTML = `<strong>${p.name}</strong><span>${p.desc}</span><span class="tpl-n">${p.slides.length} slide</span>`;
      const useBtn = document.createElement("button"); useBtn.type = "button"; useBtn.className = "btn btn-ghost btn-sm"; useBtn.textContent = "Pakai template";
      useBtn.addEventListener("click", () => {
        if (!confirm(`Pakai template "${p.name}"? Slide sekarang akan diganti (autosave aman).`)) return;
        state.slides = p.slides.map((s) => freshSlide(Object.assign({}, s)));
        renderSlides();
        document.getElementById("slidesList").scrollIntoView({ behavior: "smooth", block: "start" });
      });
      cardT.appendChild(useBtn);
      host.appendChild(cardT);
    });
  };
  paint();
}

// example viewer
const showExampleBtn = document.getElementById("showExampleBtn"), exampleBox = document.getElementById("exampleBox"), exampleCode = document.getElementById("exampleCode");
let exampleLoaded = false;
showExampleBtn.addEventListener("click", async () => {
  const show = exampleBox.style.display === "none";
  exampleBox.style.display = show ? "grid" : "none";
  showExampleBtn.textContent = show ? "Tutup contoh" : "Lihat contoh format";
  if (show && !exampleLoaded) {
    try { exampleCode.textContent = await (await fetch("contoh-brief.txt")).text(); exampleLoaded = true; }
    catch (e) { exampleCode.textContent = "Gagal memuat contoh."; }
  }
});

/* ---------------- Build slide card ---------------- */
const slidesListEl = document.getElementById("slidesList");
function labeled(labelText, node, hint) {
  const w = document.createElement("div"); w.className = "field";
  const l = document.createElement("label"); l.textContent = labelText; w.appendChild(l); w.appendChild(node);
  if (hint) { const h = document.createElement("span"); h.className = "field-hint"; h.textContent = hint; w.appendChild(h); }
  return w;
}
function chipRow(options, current, onPick, extraClass) {
  const row = document.createElement("div"); row.className = "chip-row";
  options.forEach((o) => {
    const b = document.createElement("button");
    b.className = "chip sm" + (extraClass ? " " + extraClass(o) : "") + ((current || "") === o.id ? " active" : "");
    b.innerHTML = o.emoji ? `<span>${o.emoji}</span>${o.label}` : o.label;
    b.addEventListener("click", () => onPick(o.id));
    row.appendChild(b);
  });
  return row;
}
// Chip row with a visual preview swatch per option (texture/pattern presets).
// `kind` is "texture" or "pattern"; the swatch CSS keys off data-<kind>.
function swatchChipRow(options, current, onPick, kind, tone) {
  const row = document.createElement("div"); row.className = "chip-row";
  options.forEach((o) => {
    const b = document.createElement("button");
    b.className = "chip sm has-swatch" + ((current || "") === o.id ? " active" : "");
    const sw = document.createElement("span");
    sw.className = "swatch";
    sw.setAttribute("data-" + kind, o.id || "default");
    // Texture swatches show the real generated texture (in the chosen tone) on a mid
    // tone so both light and dark detail read.
    if (kind === "texture" && window.CarouselTextures) {
      const url = window.CarouselTextures.get(o.id, tone);
      if (url) { sw.style.backgroundImage = `url('${url}')`; sw.style.backgroundSize = "34px"; sw.style.backgroundColor = "#8890b0"; }
    }
    b.appendChild(sw);
    b.appendChild(document.createTextNode(o.label));
    b.addEventListener("click", () => {
      // Move the active highlight to the clicked chip immediately (these chips only
      // re-send to the preview, they don't rebuild the card, so update it here).
      [...row.children].forEach((c) => c.classList.remove("active"));
      b.classList.add("active");
      onPick(o.id);
    });
    row.appendChild(b);
  });
  return row;
}
// Compact dropdown selector (declutters the UI vs. long button rows).
function dropdown(options, current, onPick) {
  const sel = document.createElement("select"); sel.className = "select-input";
  options.forEach((o) => {
    const op = document.createElement("option"); op.value = o.id;
    op.textContent = (o.emoji ? o.emoji + " " : "") + o.label;
    if ((current || "") === o.id) op.selected = true;
    sel.appendChild(op);
  });
  sel.addEventListener("change", () => onPick(sel.value));
  return sel;
}
// `defColor` = the swatch shown while the field is still on "Default" — it should
// look like what the slide actually renders (e.g. dark ink for stabilo TEXT, not gold).
function colorField(slide, key, labelText, defColor) {
  const wrap = document.createElement("div"); wrap.className = "color-field";
  const input = document.createElement("input"); input.type = "color"; input.value = slide[key] || defColor || "#F7B400";
  const def = document.createElement("button"); def.type = "button"; def.className = "chip sm" + (slide[key] ? "" : " active"); def.textContent = "Default";
  input.addEventListener("input", () => { slide[key] = input.value; def.classList.remove("active"); slide._send && slide._send(); });
  def.addEventListener("click", () => { slide[key] = ""; def.classList.add("active"); slide._send && slide._send(); });
  wrap.appendChild(input); wrap.appendChild(def);
  return labeled(labelText, wrap);
}
function buildImageDropzone(slide, key, onChange, subtitle) {
  const dz = document.createElement("div"); dz.className = "dropzone small";
  dz.innerHTML = `<img class="thumb" style="display:none" /><div class="placeholder">+</div><div class="info"><strong>Drag &amp; drop gambar</strong><span>${subtitle || "klik buat pilih file"}</span></div><div class="actions"><button type="button" class="link-btn danger" style="display:none">Hapus</button></div>`;
  const input = document.createElement("input"); input.type = "file"; input.accept = "image/*"; input.style.display = "none"; dz.appendChild(input);
  const thumb = dz.querySelector(".thumb"), placeholder = dz.querySelector(".placeholder"), removeBtn = dz.querySelector(".link-btn");
  function setImg(url) {
    slide[key] = url;
    if (url) { thumb.src = url; thumb.style.display = "block"; placeholder.style.display = "none"; removeBtn.style.display = "inline-block"; }
    else { thumb.style.display = "none"; placeholder.style.display = "flex"; removeBtn.style.display = "none"; }
    onChange();
  }
  if (slide[key]) setImg(slide[key]);
  wireDropzone(dz, input, async (file) => { if (!guardImage(file)) return; try { setImg(await loadImage(file, 1400)); } catch (e) { alert(e.message || "Gambar gagal dimuat."); } });
  removeBtn.addEventListener("click", (e) => { e.stopPropagation(); setImg(null); });
  return dz;
}

function buildTransformControls(slide, prefix, label, opts) {
  opts = opts || {};
  const wrap = document.createElement("div"); wrap.className = "transform-ctrls";
  wrap.style.display = "flex"; wrap.style.gap = "10px"; wrap.style.marginTop = "4px"; wrap.style.fontSize = "12px";

  // Each addSlider registers a reset() so the shared "↺ Reset" button can restore
  // every field in this group back to its default number in one click.
  const resets = [];
  // Each control = a slider + a synced numeric input (type or drag; they stay in sync).
  const addSlider = (key, text, min, max, def) => {
    const div = document.createElement("div"); div.style.flex = "1";
    // Use ?? (not ||) so a stored 0 — a valid edge position — is shown as 0, not
    // snapped back to the default (which made the top/left slider extremes dead).
    const cur = slide[prefix + key] ?? def;
    div.innerHTML =
      `<div style="color:var(--text-soft);margin-bottom:2px">${text}</div>` +
      `<div class="slider-with-num"><input type="range" min="${min}" max="${max}" value="${cur}"/>` +
      `<input type="number" class="num-input" min="${min}" max="${max}" value="${cur}"/></div>`;
    const range = div.querySelector('input[type="range"]');
    const num = div.querySelector('input[type="number"]');
    const apply = (v, from) => {
      let val = parseInt(v, 10);
      if (!Number.isFinite(val)) return;
      val = Math.max(min, Math.min(max, val));
      slide[prefix + key] = val;
      if (from !== "range") range.value = val;
      if (from !== "num") num.value = val;
      slide._send && slide._send();
    };
    range.addEventListener("input", () => apply(range.value, "range"));
    num.addEventListener("input", () => apply(num.value, "num"));
    resets.push(() => { slide[prefix + key] = def; range.value = def; num.value = def; });
    wrap.appendChild(div);
  };

  addSlider("X", "X", 0, 100, 50);
  addSlider("Y", "Y", 0, 100, 50);
  addSlider("Scale", "Size", 10, 300, 100);

  // Quick-alignment chips (Canva-style) for image/background/figure positioning.
  let alignRow = null;
  if (opts.alignments) {
    alignRow = document.createElement("div"); alignRow.className = "transform-align-row";
    alignRow.style.cssText = "display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;";
    const setAlign = (x, y) => {
      slide[prefix + "X"] = x; slide[prefix + "Y"] = y;
      slide._send && slide._send();
    };
    const alignBtn = (text, x, y) => {
      const b = document.createElement("button"); b.type = "button"; b.className = "chip sm";
      b.textContent = text; b.style.fontSize = "11px";
      b.addEventListener("click", () => setAlign(x, y));
      return b;
    };
    alignRow.appendChild(alignBtn("↖ Kiri Atas", 0, 0));
    alignRow.appendChild(alignBtn("↑ Atas", 50, 0));
    alignRow.appendChild(alignBtn("↗ Kanan Atas", 100, 0));
    alignRow.appendChild(alignBtn("← Kiri", 0, 50));
    alignRow.appendChild(alignBtn("+ Tengah", 50, 50));
    alignRow.appendChild(alignBtn("→ Kanan", 100, 50));
    alignRow.appendChild(alignBtn("↙ Kiri Bawah", 0, 100));
    alignRow.appendChild(alignBtn("↓ Bawah", 50, 100));
    alignRow.appendChild(alignBtn("↘ Kanan Bawah", 100, 100));
  }

  // "↺ Reset" restores X/Y/Size for this group to their defaults (50 / 50 / 100).
  const resetBtn = document.createElement("button");
  resetBtn.type = "button"; resetBtn.className = "link-btn"; resetBtn.textContent = "↺ Reset";
  resetBtn.title = "Kembalikan posisi & ukuran ke default";
  resetBtn.style.cssText = "font-size:11.5px";
  resetBtn.addEventListener("click", () => { resets.forEach((r) => r()); slide._send && slide._send(); });

  const container = document.createElement("div");
  // Header row: optional label on the left, the Reset button on the right (always shown,
  // so every transform group — image, background, figure, texture, pattern — can reset).
  const head = document.createElement("div");
  head.style.cssText = "display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:6px";
  const lb = document.createElement("div"); lb.style.cssText = "font-size:11.5px;color:var(--text-soft)";
  lb.textContent = label || "";
  head.appendChild(lb); head.appendChild(resetBtn);
  container.appendChild(head);
  container.appendChild(wrap);
  if (alignRow) container.appendChild(alignRow);
  return container;
}
// One labelled slider + synced numeric input for a single slide property.
function buildSingleSlider(slide, key, text, min, max, def, unit) {
  const div = document.createElement("div"); div.style.marginTop = "6px"; div.style.fontSize = "12px";
  const cur = slide[key] != null ? slide[key] : def;
  div.innerHTML =
    `<div style="color:var(--text-soft);margin-bottom:2px">${text}</div>` +
    `<div class="slider-with-num"><input type="range" min="${min}" max="${max}" value="${cur}"/>` +
    `<input type="number" class="num-input" min="${min}" max="${max}" value="${cur}"/></div>`;
  const range = div.querySelector('input[type="range"]'), num = div.querySelector('input[type="number"]');
  const apply = (v, from) => {
    let val = parseInt(v, 10); if (!Number.isFinite(val)) return;
    val = Math.max(min, Math.min(max, val));
    slide[key] = val;
    if (from !== "range") range.value = val;
    if (from !== "num") num.value = val;
    slide._send && slide._send();
  };
  range.addEventListener("input", () => apply(range.value, "range"));
  num.addEventListener("input", () => apply(num.value, "num"));
  return div;
}
// Generic version of buildSingleSlider: writes to any object/onChange pair instead
// of a slide's own _send (used by the caption editor, which edits either the
// Global caption-style object or a per-slide one with the same widget).
function buildObjSlider(obj, key, text, min, max, def, onChange) {
  const div = document.createElement("div"); div.style.marginTop = "6px"; div.style.fontSize = "12px";
  const cur = obj[key] != null ? obj[key] : def;
  div.innerHTML =
    `<div style="color:var(--text-soft);margin-bottom:2px">${text}</div>` +
    `<div class="slider-with-num"><input type="range" min="${min}" max="${max}" value="${cur}"/>` +
    `<input type="number" class="num-input" min="${min}" max="${max}" value="${cur}"/></div>`;
  const range = div.querySelector('input[type="range"]'), num = div.querySelector('input[type="number"]');
  const apply = (v, from) => {
    let val = parseInt(v, 10); if (!Number.isFinite(val)) return;
    val = Math.max(min, Math.min(max, val));
    obj[key] = val;
    if (from !== "range") range.value = val;
    if (from !== "num") num.value = val;
    onChange();
  };
  range.addEventListener("input", () => apply(range.value, "range"));
  num.addEventListener("input", () => apply(num.value, "num"));
  return div;
}
// Optional colour field (native picker + "Default" chip that clears to "" = inherit
// theme colour). Deliberately simpler than buildColorControl (no eyedropper/hex/rgb/
// swatches): buildColorControl eagerly WRITES a resolved hex into obj[key] the moment
// it's built (fine for background fills, which are never blank) — reusing it here
// would silently convert a caption's "inherit theme colour" into a fixed colour the
// instant the card renders, before the user touched anything.
function buildOptionalColorField(obj, key, labelText, onChange) {
  const wrap = document.createElement("div"); wrap.className = "color-field";
  const input = document.createElement("input"); input.type = "color"; input.value = obj[key] || "#F7B400";
  const def = document.createElement("button"); def.type = "button"; def.className = "chip sm" + (obj[key] ? "" : " active"); def.textContent = "Default";
  input.addEventListener("input", () => { obj[key] = input.value; def.classList.remove("active"); onChange(); });
  def.addEventListener("click", () => { obj[key] = ""; def.classList.add("active"); onChange(); });
  wrap.appendChild(input); wrap.appendChild(def);
  return labeled(labelText, wrap);
}

/* Full caption typography editor: size, weight, font, alignment, colour, line
 * height, letter spacing, top/bottom margin (distance from the image) and padding.
 * Reused identically for Global caption settings and a per-slide override — `cs` is
 * whichever object owns the fields, `onChange` persists + repaints appropriately. */
function buildCaptionEditor(cs, onChange) {
  const wrap = document.createElement("div"); wrap.className = "cap-editor";

  const r1 = document.createElement("div"); r1.className = "opt-row";
  r1.appendChild(labeled("Ketebalan", dropdown(CAP_WEIGHTS, String(cs.weight), (id) => { cs.weight = id; onChange(); })));
  r1.appendChild(labeled("Perataan", dropdown(CAP_ALIGNS, cs.align, (id) => { cs.align = id; onChange(); })));
  wrap.appendChild(r1);

  const r2 = document.createElement("div"); r2.className = "opt-row";
  r2.appendChild(labeled("Font", dropdown(CAP_FONTS, cs.font, (id) => { cs.font = id; onChange(); })));
  r2.appendChild(buildOptionalColorField(cs, "color", "Warna Font", onChange));
  wrap.appendChild(r2);

  const r3 = document.createElement("div"); r3.className = "opt-row";
  r3.appendChild(buildObjSlider(cs, "size", "Ukuran font (px)", 14, 72, 38, onChange));
  r3.appendChild(buildObjSlider(cs, "lineHeight", "Tinggi baris (%)", 100, 220, 132, onChange));
  wrap.appendChild(r3);

  const r4 = document.createElement("div"); r4.className = "opt-row";
  r4.appendChild(buildObjSlider(cs, "letterSpacing", "Spasi huruf (px)", -4, 16, 0, onChange));
  r4.appendChild(buildObjSlider(cs, "padding", "Padding (px)", 0, 60, 0, onChange));
  wrap.appendChild(r4);

  const r5 = document.createElement("div"); r5.className = "opt-row";
  r5.appendChild(buildObjSlider(cs, "marginTop", "Margin atas — jarak dari gambar (px)", 0, 140, 24, onChange));
  r5.appendChild(buildObjSlider(cs, "marginBottom", "Margin bawah (px)", 0, 140, 24, onChange));
  wrap.appendChild(r5);

  return wrap;
}
// Mode switch (per slide): inherit the Global caption style, or define this slide's
// own. Rebuilds the card on mode switch (new controls appear/disappear); the editor
// itself only re-sends the preview, so typing in a slider never reloads other cards.
function buildCaptionStyleBlock(slide, hintText) {
  const box = document.createElement("div");
  const modes = [{ id: "", label: "Ikut Pengaturan Global" }, { id: "custom", label: "Custom slide ini" }];
  box.appendChild(dropdown(modes, slide.capStyleMode, (id) => { slide.capStyleMode = id; rebuildCard(slide); }));
  if (slide.capStyleMode === "custom") {
    const note = document.createElement("div"); note.className = "field-hint";
    note.textContent = "Gaya caption slide ini terpisah dari Pengaturan Global.";
    box.appendChild(note);
    box.appendChild(buildCaptionEditor(slide.capStyle, () => slide._send && slide._send()));
  }
  return labeled("Gaya Caption", box, hintText);
}

/* ---------------- Preview lightbox: click a slide's live preview to see it big,
 * with an X (or backdrop click / Escape) to close. One shared overlay + iframe is
 * created lazily and reused for every slide (rendered via the same postMessage
 * protocol as the small in-card previews), instead of a separate iframe per card. */
let lightboxOverlay = null, lightboxFrame = null, lightboxWrap = null, lightboxFrameReady = false;

/* ---------------- PNG gallery lightbox: click a generated PNG thumbnail to see
 * it full-screen with zoom, pan, and keyboard/mouse dismissal. */
let imgLightboxOverlay = null, imgLightboxImg = null, imgLightboxScale = 1, imgLightboxPanning = false, imgLightboxStart = { x: 0, y: 0 }, imgLightboxTranslate = { x: 0, y: 0 };
function ensureLightbox() {
  if (lightboxOverlay) return;
  lightboxOverlay = document.createElement("div");
  lightboxOverlay.className = "lightbox-overlay";
  lightboxWrap = document.createElement("div"); lightboxWrap.className = "lightbox-frame-wrap";
  lightboxFrame = document.createElement("iframe"); lightboxFrame.className = "lightbox-frame"; lightboxFrame.src = "template.html";
  lightboxFrame.addEventListener("load", () => { lightboxFrameReady = true; });
  lightboxWrap.appendChild(lightboxFrame);
  const closeBtn = document.createElement("button");
  closeBtn.type = "button"; closeBtn.className = "lightbox-close"; closeBtn.setAttribute("aria-label", "Tutup");
  closeBtn.innerHTML = "&times;";
  closeBtn.addEventListener("click", closeSlideLightbox);
  lightboxOverlay.appendChild(lightboxWrap);
  lightboxOverlay.appendChild(closeBtn);
  // Click on the dark backdrop (not the frame itself) also closes it.
  lightboxOverlay.addEventListener("click", (e) => { if (e.target === lightboxOverlay) closeSlideLightbox(); });
  document.body.appendChild(lightboxOverlay);
}
function onLightboxKeydown(e) { if (e.key === "Escape") closeSlideLightbox(); }
function closeSlideLightbox() {
  if (!lightboxOverlay) return;
  lightboxOverlay.classList.remove("open");
  document.removeEventListener("keydown", onLightboxKeydown);
}
function showSlideLightbox(slide, idx) {
  ensureLightbox();
  let w = 1080, h = 1350;
  if (state.settings.ratio === "1:1") h = 1080;
  else if (state.settings.ratio === "3:4") h = 1440;
  else if (state.settings.ratio === "9:16") h = 1920;
  const maxW = window.innerWidth * 0.86, maxH = window.innerHeight * 0.86;
  let wrapW = maxW, wrapH = wrapW * (h / w);
  if (wrapH > maxH) { wrapH = maxH; wrapW = wrapH * (w / h); }
  lightboxWrap.style.width = Math.round(wrapW) + "px";
  lightboxWrap.style.height = Math.round(wrapH) + "px";
  lightboxFrame.style.width = w + "px";
  lightboxFrame.style.height = h + "px";
  lightboxFrame.style.transform = "scale(" + (wrapW / w) + ")";
  const send = () => { if (lightboxFrame.contentWindow) lightboxFrame.contentWindow.postMessage({ type: "render", data: slideData(slide, idx) }, "*"); };
  if (lightboxFrameReady) send();
  else lightboxFrame.addEventListener("load", send, { once: true });
  lightboxOverlay.classList.add("open");
  document.addEventListener("keydown", onLightboxKeydown);
}

function ensureImageLightbox() {
  if (imgLightboxOverlay) return;
  imgLightboxOverlay = document.createElement("div");
  imgLightboxOverlay.className = "img-lightbox-overlay";
  imgLightboxOverlay.style.cssText = "display:none;position:fixed;inset:0;z-index:1001;background:rgba(10,10,26,0.92);align-items:center;justify-content:center;overflow:hidden;";
  const wrap = document.createElement("div");
  wrap.className = "img-lightbox-wrap";
  wrap.style.cssText = "position:relative;max-width:92vw;max-height:92vh;cursor:grab;";
  imgLightboxImg = document.createElement("img");
  imgLightboxImg.style.cssText = "max-width:100%;max-height:92vh;display:block;border-radius:10px;box-shadow:0 24px 70px rgba(0,0,0,0.55);transform-origin:center center;transition:transform 0.15s ease;";
  wrap.appendChild(imgLightboxImg);
  imgLightboxOverlay.appendChild(wrap);
  const closeBtn = document.createElement("button");
  closeBtn.type = "button"; closeBtn.className = "lightbox-close"; closeBtn.setAttribute("aria-label", "Tutup");
  closeBtn.innerHTML = "&times;";
  closeBtn.addEventListener("click", closeImageLightbox);
  imgLightboxOverlay.appendChild(closeBtn);
  const hint = document.createElement("div");
  hint.className = "img-lightbox-hint";
  hint.textContent = "Scroll / pinch untuk zoom · drag untuk geser · ESC atau klik luar untuk tutup";
  imgLightboxOverlay.appendChild(hint);
  document.body.appendChild(imgLightboxOverlay);

  imgLightboxOverlay.addEventListener("click", (e) => { if (e.target === imgLightboxOverlay) closeImageLightbox(); });
  imgLightboxOverlay.addEventListener("wheel", (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    imgLightboxScale = Math.max(1, Math.min(6, imgLightboxScale * delta));
    updateImageLightboxTransform();
  }, { passive: false });
  wrap.addEventListener("mousedown", (e) => {
    if (imgLightboxScale <= 1) return;
    imgLightboxPanning = true; imgLightboxStart = { x: e.clientX - imgLightboxTranslate.x, y: e.clientY - imgLightboxTranslate.y };
    wrap.style.cursor = "grabbing";
  });
  window.addEventListener("mousemove", (e) => {
    if (!imgLightboxPanning) return;
    imgLightboxTranslate = { x: e.clientX - imgLightboxStart.x, y: e.clientY - imgLightboxStart.y };
    updateImageLightboxTransform();
  });
  window.addEventListener("mouseup", () => { imgLightboxPanning = false; wrap.style.cursor = "grab"; });
}
function updateImageLightboxTransform() {
  if (!imgLightboxImg) return;
  imgLightboxImg.style.transform = `translate(${imgLightboxTranslate.x}px, ${imgLightboxTranslate.y}px) scale(${imgLightboxScale})`;
}
function onImageLightboxKeydown(e) { if (e.key === "Escape") closeImageLightbox(); }
function closeImageLightbox() {
  if (!imgLightboxOverlay) return;
  imgLightboxOverlay.classList.remove("open");
  imgLightboxOverlay.style.display = "none";
  imgLightboxScale = 1; imgLightboxTranslate = { x: 0, y: 0 };
  if (imgLightboxImg) imgLightboxImg.style.transform = "scale(1)";
  document.removeEventListener("keydown", onImageLightboxKeydown);
}
function showImageLightbox(src) {
  ensureImageLightbox();
  imgLightboxImg.src = src;
  imgLightboxScale = 1; imgLightboxTranslate = { x: 0, y: 0 };
  updateImageLightboxTransform();
  imgLightboxOverlay.style.display = "flex";
  imgLightboxOverlay.classList.add("open");
  document.addEventListener("keydown", onImageLightboxKeydown);
}

function buildCard(slide, idx) {
  const card = document.createElement("div"); card.className = "slide-card" + (slide.id === activeCardId ? "" : " collapsed"); card.dataset.id = slide.id;
  const top = document.createElement("div"); top.className = "slide-card-top";
  const typeLabel = (TYPES.find((t) => t.id === slide.type) || {}).label || slide.type;
  const miniText = (slide.title || slide.capTop || slide.items || "").replace(/\*\*/g, "").split("\n")[0].slice(0, 48);
  top.innerHTML = `<span class="tag">Slide ${idx + 1}</span><span class="mini">${typeLabel}${miniText ? " · " + miniText.replace(/</g, "&lt;") : ""}</span><div class="tools">
    <button class="icon-btn move-up" title="Naik">↑</button><button class="icon-btn move-down" title="Turun">↓</button>
    <button class="icon-btn dup" title="Duplikat">⧉</button><button class="icon-btn danger remove" title="Hapus">✕</button></div>`;
  // Clicking the header expands this slide (accordion) — the tools keep working.
  top.addEventListener("click", (e) => { if (e.target.closest(".tools")) return; setActiveCard(slide.id); });
  card.appendChild(top);

  const grid = document.createElement("div"); grid.className = "card-grid"; card.appendChild(grid);
  const col = document.createElement("div"); col.className = "fields-col"; grid.appendChild(col);

  // Dropdowns must NEVER re-render the whole editor (that reloaded all 10 preview
  // iframes and looked like the app resetting — incl. right after Generate). A
  // layout/tone change rebuilds ONLY this card; theme/align just repaint the preview.
  const headRow = document.createElement("div"); headRow.className = "opt-row three";
  headRow.appendChild(labeled("Layout", dropdown(TYPES, slide.type, (id) => { slide.type = id; rebuildCard(slide); })));
  headRow.appendChild(labeled("Tema", dropdown(THEMES, slide.theme, (id) => { slide.theme = id; slide._send && slide._send(); })));
  headRow.appendChild(labeled("Posisi Teks", dropdown(ALIGNS, slide.align, (id) => { slide.align = id; slide._send && slide._send(); })));
  col.appendChild(headRow);

  // Advanced appearance settings live in a collapsed group so a card stays compact;
  // everything inside is unchanged functionally.
  const adv = document.createElement("details"); adv.className = "adv";
  adv.innerHTML = "<summary>Tampilan lanjutan — warna, texture &amp; background</summary>";
  const advInner = document.createElement("div"); advInner.className = "inner"; adv.appendChild(advInner);

  const styleRow = document.createElement("div"); styleRow.className = "opt-row";

  const texWrap = document.createElement("div");
  texWrap.appendChild(swatchChipRow(TEXTURES, slide.texture, (id) => { slide.texture = id; slide._send && slide._send(); }, "texture", slide.textureTone));
  // Light/Dark tone (independent of theme) + apply-to-all-slides
  const texTools = document.createElement("div"); texTools.className = "chip-row"; texTools.style.marginTop = "6px"; texTools.style.alignItems = "center";
  texTools.appendChild(dropdown(TEXTURE_TONES, slide.textureTone || "light", (id) => { slide.textureTone = id; rebuildCard(slide); }));
  const applyAllTex = document.createElement("button");
  applyAllTex.type = "button"; applyAllTex.className = "link-btn"; applyAllTex.textContent = "Terapkan ke semua";
  applyAllTex.title = "Pakai texture, tone & posisi ini di semua slide";
  applyAllTex.addEventListener("click", () => {
    state.slides.forEach((s) => { s.texture = slide.texture; s.textureTone = slide.textureTone; s.textureX = slide.textureX; s.textureY = slide.textureY; s.textureScale = slide.textureScale; });
    renderSlides();
  });
  texTools.appendChild(applyAllTex);
  texWrap.appendChild(texTools);
  texWrap.appendChild(buildSingleSlider(slide, "textureOpacity", "Opacity", 0, 100, 60));
  texWrap.appendChild(buildTransformControls(slide, "texture", ""));
  styleRow.appendChild(labeled("Texture", texWrap));

  const patWrap = document.createElement("div");
  patWrap.appendChild(swatchChipRow(PATTERNS, slide.pattern, (id) => { slide.pattern = id; slide._send && slide._send(); }, "pattern"));
  const patTools = document.createElement("div"); patTools.className = "chip-row"; patTools.style.marginTop = "6px";
  const applyAllPat = document.createElement("button");
  applyAllPat.type = "button"; applyAllPat.className = "link-btn"; applyAllPat.textContent = "Terapkan ke semua";
  applyAllPat.title = "Pakai pattern & posisi ini di semua slide";
  applyAllPat.addEventListener("click", () => {
    state.slides.forEach((s) => { s.pattern = slide.pattern; s.patternX = slide.patternX; s.patternY = slide.patternY; s.patternScale = slide.patternScale; s.patternThickness = slide.patternThickness; });
    renderSlides();
  });
  patTools.appendChild(applyAllPat);
  patWrap.appendChild(patTools);
  patWrap.appendChild(buildSingleSlider(slide, "patternThickness", "Tebal Garis", 1, 8, 2));
  patWrap.appendChild(buildTransformControls(slide, "pattern", ""));
  styleRow.appendChild(labeled("Garis / Pattern", patWrap));

  advInner.appendChild(styleRow);

  const colorRow = document.createElement("div"); colorRow.className = "opt-row";
  colorRow.appendChild(colorField(slide, "textColor", "Warna Teks Reguler"));
  colorRow.appendChild(colorField(slide, "titleColor", "Warna Judul"));
  advInner.appendChild(colorRow);
  const colorRow2 = document.createElement("div"); colorRow2.className = "opt-row";
  colorRow2.appendChild(colorField(slide, "markColor", "Background Stabilo"));
  colorRow2.appendChild(colorField(slide, "highlightTextColor", "Teks Stabilo", "#101138"));
  advInner.appendChild(colorRow2);
  const resetColorsBtn = document.createElement("button");
  resetColorsBtn.type = "button"; resetColorsBtn.className = "link-btn";
  resetColorsBtn.textContent = "Reset warna teks";
  resetColorsBtn.addEventListener("click", () => {
    slide.textColor = "";
    slide.titleColor = "";
    slide.markColor = "";
    slide.highlightTextColor = "";
    rebuildCard(slide);
  });
  advInner.appendChild(resetColorsBtn);

  // Background COLOUR per slide: theme default / global / custom override — with a
  // clear indicator of which source this slide is using.
  const bgcWrap = document.createElement("div");
  const bgcModes = [{ id: "", label: "Tema (default)" }, { id: "global", label: "Global" }, { id: "custom", label: "Custom slide ini" }];
  bgcWrap.appendChild(dropdown(bgcModes, slide.bgColorMode, (id) => { slide.bgColorMode = id; rebuildCard(slide); }));
  if (slide.bgColorMode === "global") {
    const note = document.createElement("div"); note.className = "field-hint";
    note.textContent = state.settings.bgFillType
      ? "Slide ini memakai background warna global (diatur di Pengaturan Global)."
      : "Mode global aktif, tapi background global belum diatur di Pengaturan Global.";
    bgcWrap.appendChild(note);
  } else if (slide.bgColorMode === "custom") {
    const note = document.createElement("div"); note.className = "field-hint";
    note.textContent = "Slide ini memakai background warnanya sendiri (menimpa global).";
    bgcWrap.appendChild(note);
    bgcWrap.appendChild(buildBgFillEditor(slide, () => slide._send && slide._send()));
  }
  advInner.appendChild(labeled("Warna Background", bgcWrap, "Solid / gradasi. Tema = gradasi bawaan tema."));

  const topicInp = document.createElement("input"); topicInp.type = "text"; topicInp.value = slide.topic || ""; topicInp.placeholder = "mis. Realita — badge kanan atas";
  topicInp.addEventListener("input", () => { slide.topic = topicInp.value; slide._send && slide._send(); });
  col.appendChild(labeled("Topik Slide", topicInp, "Kosongin kalau nggak mau badge."));

  (TYPE_FIELDS[slide.type] || []).forEach((f) => {
    if (f.kind === "image") {
      // Dedicated meme-image placeholder (meme layout).
      const imgWrap = document.createElement("div");
      imgWrap.appendChild(buildImageDropzone(slide, f.key, () => slide._send && slide._send(), "gambar meme — caption di atas & bawah"));
      imgWrap.appendChild(buildTransformControls(slide, "img", "Posisi Gambar", { alignments: true }));
      col.appendChild(labeled(f.label, imgWrap, f.hint));
      return;
    }
    if (f.kind === "figure") {
      // Human-figure layer: transparent PNG + side/layer + move/scale/rotate/flip/opacity.
      const wrapF = document.createElement("div");
      wrapF.appendChild(buildImageDropzone(slide, "figureImage", () => slide._send && slide._send(), "PNG transparan — guru, murid, presenter…"));
      const rowF = document.createElement("div"); rowF.className = "opt-row";
      rowF.appendChild(labeled("Posisi Figur", dropdown(FIGURE_SIDES, slide.figureSide, (id) => { slide.figureSide = id; slide._send && slide._send(); })));
      rowF.appendChild(labeled("Layer", dropdown(FIGURE_LAYERS, slide.figureLayer, (id) => { slide.figureLayer = id; slide._send && slide._send(); })));
      wrapF.appendChild(rowF);
      wrapF.appendChild(buildTransformControls(slide, "fig", "Geser & Skala Figur", { alignments: true }));
      wrapF.appendChild(buildSingleSlider(slide, "figRotate", "Rotasi (°)", -180, 180, 0));
      wrapF.appendChild(buildSingleSlider(slide, "figOpacity", "Opacity", 0, 100, 100));
      const flipBtn = document.createElement("button");
      flipBtn.type = "button"; flipBtn.className = "chip sm" + (slide.figFlip ? " active" : "");
      flipBtn.textContent = "↔ Flip horizontal"; flipBtn.style.marginTop = "6px";
      flipBtn.addEventListener("click", () => { slide.figFlip = !slide.figFlip; flipBtn.classList.toggle("active", slide.figFlip); slide._send && slide._send(); });
      wrapF.appendChild(flipBtn);
      col.appendChild(labeled(f.label, wrapF, f.hint));
      return;
    }
    const inp = f.kind === "textarea" ? document.createElement("textarea") : document.createElement("input");
    if (f.kind === "textarea") inp.rows = f.rows || 3; else inp.type = "text";
    inp.value = slide[f.key] || ""; inp.placeholder = f.ph || "";
    inp.addEventListener("input", () => { slide[f.key] = inp.value; slide._send && slide._send(); });
    col.appendChild(labeled(f.label, inp, f.hint));
  });
  // Meme caption typography (size/weight/font/colour/alignment/spacing/margins) —
  // applies to both the top and bottom caption of this slide.
  if (slide.type === "meme") {
    advInner.appendChild(buildCaptionStyleBlock(slide, "Berlaku untuk caption atas & bawah meme."));
  }

  // Regular-image placeholder (non-meme layouts): an ordinary image shown inside the
  // slide, with an optional caption displayed underneath it.
  if (slide.type !== "meme") {
    const imgWrap = document.createElement("div");
    imgWrap.appendChild(buildImageDropzone(slide, "image", () => slide._send && slide._send(), "gambar biasa di dalam slide"));
    imgWrap.appendChild(buildTransformControls(slide, "img", "Posisi Gambar", { alignments: true }));
    const capInput = document.createElement("input"); capInput.type = "text";
    capInput.value = slide.imageCaption || ""; capInput.placeholder = "Caption di bawah gambar (opsional)";
    capInput.style.marginTop = "8px";
    capInput.addEventListener("input", () => { slide.imageCaption = capInput.value; slide._send && slide._send(); });
    imgWrap.appendChild(capInput);
    advInner.appendChild(labeled("Gambar (opsional)", imgWrap, "Muncul di dalam slide, dengan caption di bawahnya."));
    advInner.appendChild(buildCaptionStyleBlock(slide, "Berlaku untuk caption di bawah gambar."));
  }

  // Background IMAGE source: none / global (inherits Pengaturan Global) / custom
  // override for this slide only — switching modes keeps this slide's own image,
  // so nothing is lost when toggling between global and custom.
  const bgWrap = document.createElement("div");
  bgWrap.appendChild(dropdown(BG_MODES, slide.bgMode, (id) => { slide.bgMode = id; rebuildCard(slide); }));
  if (slide.bgMode === "custom") {
    const note = document.createElement("div"); note.className = "field-hint";
    note.textContent = "Slide ini memakai gambar background-nya sendiri (menimpa global).";
    bgWrap.appendChild(note);
    bgWrap.appendChild(buildImageDropzone(slide, "bgImage", () => slide._send && slide._send(), "background khusus slide ini"));
    bgWrap.appendChild(labeled("Ukuran gambar", dropdown(BG_FITS, slide.bgFit || "contain", (id) => { slide.bgFit = id; slide._send && slide._send(); }),
      "Utuh = seluruh gambar kelihatan (sisanya jadi warna background). Isi penuh = dipotong biar menuhin slide."));
    bgWrap.appendChild(buildTransformControls(slide, "bg", "Posisi Background", { alignments: true }));
  } else if (slide.bgMode === "global") {
    const note = document.createElement("div"); note.className = "field-hint";
    note.textContent = state.bgImage
      ? "Slide ini mengikuti gambar, posisi & zoom background global (atur di Pengaturan Global — berlaku serentak untuk semua slide global)."
      : "Mode global aktif — upload gambarnya di Pengaturan Global.";
    bgWrap.appendChild(note);
  }
  advInner.appendChild(labeled("Background Gambar", bgWrap, "Global = ikut Pengaturan Global. Custom = gambar khusus slide ini."));

  // Overlay + image effects for this slide's background: off / follow global /
  // custom. Same three-mode pattern as background colour & image above.
  const fxWrap = document.createElement("div");
  fxWrap.appendChild(dropdown(FX_MODES, slide.fxMode, (id) => { slide.fxMode = id; rebuildCard(slide); }));
  if (slide.fxMode === "custom") {
    const note = document.createElement("div"); note.className = "field-hint";
    note.textContent = "Slide ini punya overlay & efek sendiri (menimpa global).";
    fxWrap.appendChild(note);
    fxWrap.appendChild(buildBgFxEditor(slide, () => slide._send && slide._send()));
  } else if (slide.fxMode === "global") {
    const note = document.createElement("div"); note.className = "field-hint";
    note.textContent = state.settings.ovType || fxFilterCss(state.settings)
      ? "Slide ini mengikuti overlay & efek global (atur di Pengaturan Global)."
      : "Mode global aktif, tapi overlay & efek global belum diatur di Pengaturan Global.";
    fxWrap.appendChild(note);
  }
  advInner.appendChild(labeled("Overlay & Efek Background", fxWrap, "Gelapkan background yang kesilauan (multiply/darken), kasih gradasi, atau blur biar teks kebaca."));

  col.appendChild(adv);

  const prev = document.createElement("div"); prev.className = "preview-col";
  const frameWrap = document.createElement("div"); frameWrap.className = "preview-frame-wrap";
  const frame = document.createElement("iframe"); frame.className = "preview-frame"; frame.src = "template.html";
  frameWrap.appendChild(frame);
  const zoomHint = document.createElement("div"); zoomHint.className = "preview-zoom-hint"; zoomHint.textContent = "🔍 Perbesar";
  frameWrap.appendChild(zoomHint);
  frameWrap.title = "Klik untuk perbesar";
  frameWrap.addEventListener("click", () => showSlideLightbox(slide, idx));
  prev.appendChild(frameWrap);
  const cap = document.createElement("span"); cap.className = "preview-cap"; cap.textContent = "Live preview"; prev.appendChild(cap);
  grid.appendChild(prev);

  let ready = false;
  function send() {
    if (ready) {
      // A replaced card's iframe can linger in a closure for one tick — never let a
      // stale frame throw (it would abort the refresh loop for the other slides).
      if (!frame.isConnected || !frame.contentWindow) return;
      const w = 1080;
      let h = 1350;
      if (state.settings.ratio === "1:1") h = 1080;
      else if (state.settings.ratio === "3:4") h = 1440;
      else if (state.settings.ratio === "9:16") h = 1920;
      frame.style.width = w + "px";
      frame.style.height = h + "px";
      const wrapW = 240;
      const wrapH = Math.round(wrapW * (h / w));
      frameWrap.style.width = wrapW + "px";
      frameWrap.style.height = wrapH + "px";
      frame.style.transform = "scale(" + (wrapW / w) + ")";

      frame.contentWindow.postMessage({ type: "render", data: slideData(slide, idx) }, "*"); 
    }
  }
  frame.addEventListener("load", () => { ready = true; send(); });
  // _send = an actual user edit (marks the project dirty & schedules autosave);
  // the bare send() on iframe load repaints without touching dirty state.
  slide._send = () => { markDirty(); send(); };

  top.querySelector(".move-up").addEventListener("click", () => moveSlide(slide.id, -1));
  top.querySelector(".move-down").addEventListener("click", () => moveSlide(slide.id, 1));
  top.querySelector(".dup").addEventListener("click", () => dupSlide(slide.id));
  top.querySelector(".remove").addEventListener("click", () => removeSlide(slide.id));
  return card;
}

function moveSlide(id, dir) { const i = state.slides.findIndex((s) => s.id === id), j = i + dir; if (j < 0 || j >= state.slides.length) return; const [it] = state.slides.splice(i, 1); state.slides.splice(j, 0, it); renderSlides(); }
function dupSlide(id) { const i = state.slides.findIndex((s) => s.id === id); const copy = freshSlide(Object.assign({}, state.slides[i], { id: undefined, _send: null })); copy.id = crypto.randomUUID(); state.slides.splice(i + 1, 0, copy); renderSlides(); }
function removeSlide(id) { if (state.slides.length <= 1) { alert("Minimal 1 slide."); return; } state.slides = state.slides.filter((s) => s.id !== id); renderSlides(); }
/* Accordion: one slide expanded at a time; the rest collapse to a slim header.
 * The navigator strip above the list jumps/highlights without re-rendering. */
let activeCardId = null;
function setActiveCard(id, scroll) {
  activeCardId = id;
  [...slidesListEl.children].forEach((c) => c.classList.toggle("collapsed", c.dataset.id !== id));
  const nav = document.getElementById("slideNav");
  if (nav) [...nav.children].forEach((ch) => ch.classList.toggle("active", ch.dataset.id === id));
  if (scroll) {
    const el = slidesListEl.querySelector('.slide-card[data-id="' + id + '"]');
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}
/* The sticky slide navigator sits right below the sticky header — measure the real
 * header height (it varies with viewport/text wrap) into a CSS variable. */
function syncHeaderHeight() {
  const h = document.querySelector(".app-header");
  const sticky = h && getComputedStyle(h).position === "sticky";
  document.documentElement.style.setProperty("--header-h", (sticky ? h.offsetHeight : 0) + "px");
}
window.addEventListener("resize", syncHeaderHeight);
function renderSlideNav() {
  syncHeaderHeight();
  const nav = document.getElementById("slideNav");
  if (!nav) return;
  nav.innerHTML = "";
  state.slides.forEach((s, i) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "nav-chip" + (s.id === activeCardId ? " active" : ""); b.dataset.id = s.id;
    const tl = (TYPES.find((t) => t.id === s.type) || {}).label || s.type;
    b.innerHTML = `<span class="n">${i + 1}</span>${tl}`;
    b.title = (s.title || s.capTop || "").replace(/\*\*/g, "").slice(0, 80);
    b.addEventListener("click", () => setActiveCard(s.id, true));
    nav.appendChild(b);
  });
}
function renderSlides() {
  markDirty();
  if (!state.slides.some((s) => s.id === activeCardId)) activeCardId = state.slides[0] && state.slides[0].id;
  slidesListEl.innerHTML = "";
  state.slides.forEach((s, i) => slidesListEl.appendChild(buildCard(s, i)));
  renderSlideNav();
}
// Replace ONE card in place — dropdown changes must not rebuild the other cards
// (that reloaded every preview iframe and looked like a full app reset).
// We also preserve the open/closed state of any <details> groups so the settings
// panel doesn't disappear from under the user while they're editing.
function rebuildCard(slide) {
  const idx = state.slides.findIndex((s) => s.id === slide.id);
  const old = slidesListEl.querySelector('.slide-card[data-id="' + slide.id + '"]');
  if (idx < 0 || !old) { renderSlides(); return; }
  markDirty();
  activeCardId = slide.id; // the card being edited stays the expanded one
  const detailsState = [...old.querySelectorAll("details.adv")].map((d) => d.open);
  const newCard = buildCard(slide, idx);
  newCard.querySelectorAll("details.adv").forEach((d, i) => { if (detailsState[i]) d.open = true; });
  slidesListEl.replaceChild(newCard, old);
  renderSlideNav();
}
function refreshAll() { state.slides.forEach((s) => { try { s._send && s._send(); } catch (e) { console.warn("refresh slide gagal:", e); } }); updateGlobalPreview(); }

/* ---------------- Font selector (global) ---------------- */
const fontRow = document.getElementById("fontRow");
const customFontInput = document.getElementById("customFontInput");
FONTS.forEach((f) => {
  const b = document.createElement("button"); b.className = "chip sm" + (state.settings.font === f.id ? " active" : ""); b.textContent = f.label;
  b.style.fontFamily = "'" + f.id + "', sans-serif";
  b.addEventListener("click", () => {
    state.settings.font = f.id;
    state.settings.customFontUrl = "";
    customFontInput.value = "";
    [...fontRow.children].forEach((c) => c.classList.remove("active"));
    b.classList.add("active");
    refreshAll();
  });
  fontRow.appendChild(b);
});
customFontInput.addEventListener("input", () => {
  const url = customFontInput.value.trim();
  state.settings.customFontUrl = url;
  if (url) {
    [...fontRow.children].forEach((c) => c.classList.remove("active"));
    const match = url.match(/family=([^:&]+)/);
    if (match) {
      state.settings.font = match[1].replace(/\+/g, ' ');
    }
  } else {
    // revert to Anton if emptied
    state.settings.font = "Anton";
    fontRow.children[0].classList.add("active");
  }
  refreshAll();
});

const ratioSelect = document.getElementById("ratioSelect");
ratioSelect.value = state.settings.ratio;
ratioSelect.addEventListener("change", () => { state.settings.ratio = ratioSelect.value; refreshAll(); });


/* ---------------- Add / reset ---------------- */
document.getElementById("addSlideBtn").addEventListener("click", () => {
  state.slides.push(freshSlide({ type: "cover", theme: "dark", title: "Judul Slide Baru **Disini**", subtitle: "Tulis isi slide di sini." }));
  renderSlides(); slidesListEl.lastElementChild.scrollIntoView({ behavior: "smooth", block: "center" });
});
document.getElementById("resetBtn").addEventListener("click", () => {
  if (!confirm("Reset semua slide ke draft awal?")) return;
  state.bgImage = null; bgThumb.style.display = "none"; bgPlaceholder.style.display = "flex"; bgRemoveBtn.style.display = "none";
  state.slides = DEFAULT_SLIDES.map(freshSlide); renderSlides();
});

/* ---------------- Export: PNG ---------------- */
const exportStage = document.getElementById("exportStage");
const generateBtn = document.getElementById("generateBtn"), generateBtnTop = document.getElementById("generateBtnTop");
const downloadZipBtn = document.getElementById("downloadZipBtn"), downloadPptxBtn = document.getElementById("downloadPptxBtn");
const statusMsg = document.getElementById("statusMsg"), gallerySection = document.getElementById("gallerySection"), gallery = document.getElementById("gallery");
let lastPngs = [];

function waitImages(el) {
  // Only wait on images that actually have a source — a src-less <img> (e.g. the
  // background-photo placeholder when no bg is set) never fires load/error and would
  // otherwise hang the export forever.
  const imgs = [...el.querySelectorAll("img")].filter((im) => im.getAttribute("src"));
  return Promise.all(imgs.map((im) => (im.complete && im.naturalWidth) ? Promise.resolve() : new Promise((r) => { im.onload = im.onerror = r; })));
}

/* Fonts load lazily per weight; document.fonts.ready alone can resolve BEFORE a
 * newly-rendered stage triggers its font requests. Rendering/measuring with the
 * fallback font then produces wrong wraps and wrong highlight positions. Explicitly
 * request every family+weight the stage uses and wait for them. */
async function ensureStageFonts(stage) {
  const wanted = new Set();
  stage.querySelectorAll(EDIT_SEL + ",mark,.lead,.rlogo,.cmp-ic").forEach((n) => {
    const cs = getComputedStyle(n);
    const fam = cs.fontFamily.split(",")[0].replace(/['"]/g, "").trim();
    if (fam) wanted.add(`${cs.fontWeight} 32px "${fam}"`);
  });
  try { await Promise.all([...wanted].map((f) => document.fonts.load(f))); } catch (e) { /* fallback below */ }
  await document.fonts.ready;
}

/* Precompute a font-embed CSS string from our SAME-ORIGIN fonts.css, inlining each
 * woff2 as a data URL. Passing this to html-to-image makes it use these fonts and
 * NOT scan document stylesheets — which is what crashes export when a cross-origin
 * Google Fonts <link> is present (SecurityError reading cssRules). Cached after first
 * build. Returns null on failure so html-to-image falls back to its own embedding. */
let _fontEmbedCSS;
async function getFontEmbedCSS() {
  if (_fontEmbedCSS !== undefined) return _fontEmbedCSS;
  try {
    const cssText = await (await fetch("fonts.css")).text();
    const re = /url\(['"]?([^'")]+\.woff2)['"]?\)/g;
    const urls = [...new Set([...cssText.matchAll(re)].map((m) => m[1]))];
    const map = {};
    await Promise.all(urls.map(async (u) => {
      try {
        const buf = await (await fetch(u)).arrayBuffer();
        const bytes = new Uint8Array(buf); let bin = "";
        for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
        map[u] = "data:font/woff2;base64," + btoa(bin);
      } catch (e) { /* skip this font */ }
    }));
    _fontEmbedCSS = cssText.replace(re, (m, u) => (map[u] ? `url(${map[u]})` : m));
  } catch (e) {
    _fontEmbedCSS = null;
  }
  return _fontEmbedCSS;
}

/* html-to-image rasterizes a CLONE of the DOM inside an SVG, where text re-flows.
 * On knife-edge lines (content width == column width) the clone can wrap differently
 * than the live preview. Pin the browser's actual line breaks into the text as real
 * newlines (+ pre-wrap) so the raster cannot re-wrap. Runs on the throwaway export
 * stage only, after fonts are loaded and fit is applied. */
function pinLineBreaks(root) {
  // A break between two text nodes only needs pinning when nothing already forces
  // it there — an explicit <br> or a block boundary (e.g. the .lead block) would
  // otherwise double up with the added newline and create a blank line.
  const blockOf = (n) => {
    let e = n.parentElement;
    while (e && getComputedStyle(e).display.indexOf("inline") === 0) e = e.parentElement;
    return e;
  };
  const hasBrBetween = (a, b) => {
    const rg = document.createRange();
    rg.setStartAfter(a); rg.setEndBefore(b);
    const frag = rg.cloneContents();
    return !!frag.querySelector("br");
  };
  root.querySelectorAll(EDIT_SEL).forEach((el) => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    const range = document.createRange();
    let lineTop = null, lineH = 0, mutated = false;
    textNodes.forEach((tn, ti) => {
      const text = tn.textContent;
      const re = /\s+|\S+/g;
      const breaks = []; // token start indices where a new rendered line begins
      let m;
      while ((m = re.exec(text))) {
        if (!m[0].trim()) continue;
        let r0 = null;
        try { range.setStart(tn, m.index); range.setEnd(tn, m.index + m[0].length); r0 = range.getClientRects()[0]; } catch (e) {}
        if (!r0) continue;
        if (lineTop == null) { lineTop = r0.top; lineH = r0.height; }
        else if (r0.top > lineTop + Math.max(lineH, r0.height) * 0.6) {
          lineTop = r0.top; lineH = r0.height;
          breaks.push(m.index);
        } else lineH = Math.max(lineH, r0.height);
      }
      for (let i = breaks.length - 1; i >= 0; i--) {
        const bi = breaks[i];
        if (bi > 0) {
          // replace the whitespace run before the token with a hard newline
          let ws = bi - 1;
          while (ws >= 0 && /\s/.test(tn.textContent[ws])) ws--;
          tn.textContent = tn.textContent.slice(0, ws + 1) + "\n" + tn.textContent.slice(bi);
          mutated = true;
        } else if (ti > 0 && !textNodes[ti - 1].parentElement.closest("mark")
          && blockOf(textNodes[ti - 1]) === blockOf(tn) && !hasBrBetween(textNodes[ti - 1], tn)) {
          // break at a node boundary: put the newline in the previous plain node
          // (skipped inside <mark> — a trailing newline there would draw a padded stub)
          textNodes[ti - 1].textContent = textNodes[ti - 1].textContent.replace(/\s+$/, "") + "\n";
          mutated = true;
        }
      }
    });
    if (mutated && !/pre/.test(getComputedStyle(el).whiteSpace)) el.style.whiteSpace = "pre-wrap";
  });
}

/* Rasterize the export stage to PNG, resilient to font/resource embedding errors:
 * use our same-origin font CSS; if html-to-image still throws (e.g. an odd remote
 * resource), retry once skipping font embedding so export never hard-fails. */
async function stageToPng(w, h, extraOpts) {
  const fontEmbedCSS = await getFontEmbedCSS();
  const base = { width: w, height: h, pixelRatio: 1, cacheBust: true };
  if (fontEmbedCSS) base.fontEmbedCSS = fontEmbedCSS;
  const opts = Object.assign(base, extraOpts || {});
  try {
    return await window.htmlToImage.toPng(exportStage, opts);
  } catch (e) {
    return await window.htmlToImage.toPng(exportStage, Object.assign({}, opts, { skipFonts: true }));
  }
}
async function renderPng(data) {
  window.renderStage(exportStage, data);
  const w = parseInt(exportStage.style.width) || 1080;
  const h = parseInt(exportStage.style.height) || 1350;
  exportStage.parentElement.style.width = w + "px";
  exportStage.parentElement.style.height = h + "px";
  await waitImages(exportStage);
  await ensureStageFonts(exportStage);
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  window.refitStage(exportStage); // re-fit now that the real fonts are loaded
  pinLineBreaks(exportStage);     // freeze line breaks so the raster clone can't re-wrap
  return await stageToPng(w, h);
}
let generating = false;
async function generatePng() {
  generateBtn.disabled = generateBtnTop.disabled = true;
  generating = true;
  statusMsg.className = "status-msg";
  // Render into a TEMP array and commit to lastPngs only on full success — the
  // existing gallery stays visible and intact throughout, so a failed run (or a
  // subsequent autosave) can never wipe previously generated slides.
  try {
    const out = [];
    for (let i = 0; i < state.slides.length; i++) {
      statusMsg.textContent = `Render slide ${i + 1}/${state.slides.length}…`;
      out.push(await renderPng(slideData(state.slides[i], i)));
    }
    lastPngs = out;
    renderGallery();
    gallerySection.scrollIntoView({ behavior: "smooth", block: "start" });
    statusMsg.textContent = `Selesai! ${lastPngs.length} PNG dibuat.`; statusMsg.className = "status-msg ok";
    // Generated results are part of the project: persist + refresh the thumbnail.
    await ensureThumb();
    markDirty();
  } catch (err) {
    statusMsg.textContent = "Error: " + err.message + " — hasil generate sebelumnya tetap utuh."; statusMsg.className = "status-msg error"; console.error(err);
    renderGallery(); // old lastPngs untouched → old gallery stays
  }
  finally { generating = false; generateBtn.disabled = generateBtnTop.disabled = false; }
}
/* Gallery from lastPngs — also used to RESTORE generated results with a project. */
function renderGallery() {
  gallery.innerHTML = "";
  lastPngs.forEach((src, i) => {
    const item = document.createElement("div"); item.className = "gallery-item";
    const thumb = document.createElement("img"); thumb.src = src; thumb.alt = `Slide ${i + 1}`; thumb.style.cursor = "zoom-in";
    thumb.addEventListener("click", () => showImageLightbox(src));
    const footer = document.createElement("div"); footer.className = "gi-footer";
    footer.innerHTML = `<span>Slide ${i + 1}</span><a class="link-btn" href="${src}" download="slide-${i + 1}.png">Download</a>`;
    item.appendChild(thumb); item.appendChild(footer);
    gallery.appendChild(item);
  });
  const has = lastPngs.length > 0;
  gallerySection.style.display = has ? "block" : "none";
  downloadZipBtn.style.display = has ? "inline-flex" : "none";
}
generateBtn.addEventListener("click", generatePng);
generateBtnTop.addEventListener("click", generatePng);

downloadZipBtn.addEventListener("click", async () => {
  if (!lastPngs.length) return;
  const zip = new window.JSZip();
  lastPngs.forEach((p, i) => zip.file(`slide-${i + 1}.png`, p.split(",")[1], { base64: true }));
  downloadBlob(await zip.generateAsync({ type: "blob" }), "carousel.zip");
});

/* ---------------- Export: PPTX (editable, layered — Canva-first) ----------------
 * Every content element becomes its own EDITABLE native PPTX object — nothing is
 * flattened together. Each text block is a real text box (fonts named so Canva maps
 * them to its own Anton/Bebas/etc.), stabilo words keep a run-level highlight,
 * cards/boxes/badges are shapes, badge numbers are text, images are pictures. Only
 * the background (gradient/photo/texture/pattern/pills/logo/footer) is one raster
 * underneath. So 10 on-slide elements → 10 separate editable objects in Canva. */
function rgbToHex(rgb) {
  const m = String(rgb).match(/[\d.]+/g);
  if (!m) return "000000";
  return m.slice(0, 3).map((v) => Math.round(+v).toString(16).padStart(2, "0")).join("");
}
function contrastHex(hex) {
  const h = (hex || "").replace("#", "") || "F7B400";
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6 ? "101138" : "FFFFFF";
}
/* Extract PPTX text runs from a rendered node, splitting them at the browser's
 * ACTUAL wrapped lines (each word measured via Range). The exported text carries a
 * hard break wherever the preview wrapped, so PowerPoint/Canva — whose substituted
 * fonts have different metrics — can't reflow it differently. That reflow was what
 * knocked the stabilo highlight boxes off their words. Nested ".ic" chips are
 * skipped: they're exported separately as their own shape + text box. */
function extractRuns(node, upper) {
  const segs = [];
  (function walk(n, mark, bold, fontSize) {
    n.childNodes.forEach((c) => {
      if (c.nodeType === 3) { if (c.textContent) segs.push({ tn: c, mark, bold, fontSize }); }
      else if (c.nodeType === 1) {
        const tag = c.tagName.toLowerCase();
        if (tag === "br") segs.push({ br: true });
        else if (c.classList && c.classList.contains("ic")) return;
        else if (tag === "mark") walk(c, true, bold, fontSize);
        else if (c.classList && c.classList.contains("lead")) walk(c, mark, true, parseFloat(getComputedStyle(c).fontSize));
        else walk(c, mark, bold, fontSize);
      }
    });
  })(node, false, false, 0);

  const runs = [];
  const range = document.createRange();
  let cur = null, lineTop = null, lineH = 0, pendingWs = false, sinceBreak = false, justBroke = false;

  const flush = () => { if (cur && cur.text) runs.push(cur); cur = null; };
  const markBreak = () => { flush(); if (runs.length) runs[runs.length - 1].br = true; };
  // soft break = the browser wrapped; hard break = an explicit <br> (may be a blank line)
  const softBreak = () => { pendingWs = false; markBreak(); sinceBreak = false; };
  const hardBreak = () => {
    pendingWs = false;
    if (sinceBreak) markBreak(); else { flush(); runs.push({ text: "", br: true }); }
    sinceBreak = false; justBroke = true; lineTop = null;
  };
  const addText = (t, seg) => {
    if (!t) return;
    if (upper) t = t.toUpperCase();
    if (cur && (cur.mark !== !!seg.mark || cur.bold !== !!seg.bold || (cur.fontSize || 0) !== (seg.fontSize || 0))) flush();
    if (!cur) { cur = { text: "", mark: !!seg.mark, bold: !!seg.bold }; if (seg.fontSize) cur.fontSize = seg.fontSize; }
    cur.text += t;
    if (t.trim()) sinceBreak = true;
  };
  const placeToken = (text, top, h, seg) => {
    if (lineTop == null) { lineTop = top; lineH = h; }
    else if (top > lineTop + Math.max(lineH, h) * 0.6) {
      if (!justBroke) softBreak();
      lineTop = top; lineH = h;
    } else lineH = Math.max(lineH, h);
    justBroke = false;
    if (pendingWs) { if (cur) cur.text += " "; else addText(" ", seg); pendingWs = false; }
    addText(text, seg);
  };

  segs.forEach((seg) => {
    if (seg.br) { hardBreak(); return; }
    const text = seg.tn.textContent;
    const re = /\s+|\S+/g;
    let m;
    while ((m = re.exec(text))) {
      const tok = m[0];
      if (!tok.trim()) { if (cur || runs.length) pendingWs = true; continue; }
      let rl = null;
      try {
        range.setStart(seg.tn, m.index); range.setEnd(seg.tn, m.index + tok.length);
        rl = range.getClientRects();
      } catch (e) { /* keep token on the current line */ }
      if (!rl || !rl.length) { placeToken(tok, lineTop == null ? 0 : lineTop, lineH, seg); continue; }
      if (rl.length === 1) { placeToken(tok, rl[0].top, rl[0].height, seg); continue; }
      // token wrapped mid-word (word-break) — split per character
      for (let ci = 0; ci < tok.length; ci++) {
        let rr = null;
        try { range.setStart(seg.tn, m.index + ci); range.setEnd(seg.tn, m.index + ci + 1); rr = range.getClientRects()[0]; } catch (e) {}
        placeToken(tok[ci], rr ? rr.top : (lineTop || 0), rr ? rr.height : lineH, seg);
      }
    }
  });
  flush();
  return runs;
}

// Every text element → its own editable text box (incl. footer handles + badge/rank text).
const EDIT_SEL = ".eyebrow,.display,.statement,.subtitle,.pill-btn,.section-title,.list-txt,.list-ic,.trow .name,.trow .val,.rank,.cmp-head,.cmp-tx,.meme-cap,.img-caption,.counter,.handles .ht,.handles .ic";
const MID_CLASSES = ["eyebrow", "pill-btn", "counter", "meme-cap", "name", "val", "cmp-head", "list-ic", "rank", "ic", "ht"];
const CENTER_CLASSES = ["list-ic", "rank", "meme-cap", "counter", "pill-btn", "eyebrow", "ic", "val"];
// Cards/boxes/badges/pills/image-frames/logo chip → editable shapes.
const SHAPE_SEL = ".card, .table-card, .text-card, .cmp-col, .trow, .meme-frame, .list-ic, .rank, .eyebrow, .pill-btn, .counter, .trow .val, .cmp-head, .handles .ic, .logo-chip";

function collectPptx(stage, markHex, data, igIconPng) {
  const sr = stage.getBoundingClientRect();
  const els = [], blocks = [], images = [];
  const safeNum = (v, fb = 0) => Number.isFinite(v) ? v : fb;
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  // fitStage may have scaled the body content down (transform: scale). Client rects
  // include that scale but computed styles (font-size, padding) do NOT — capture the
  // factor so exported sizes match what's actually rendered.
  const wrapEl = stage.querySelector(".stage-body > :first-child");
  let fitScale = 1;
  if (wrapEl) {
    const tf = getComputedStyle(wrapEl).transform;
    const mm = tf && tf !== "none" ? tf.match(/matrix\(([-\d.e]+),\s*([-\d.e]+)/) : null;
    if (mm) fitScale = Math.hypot(parseFloat(mm[1]), parseFloat(mm[2])) || 1;
  }
  const scaleFor = (node) => (wrapEl && node !== wrapEl && wrapEl.contains(node)) ? fitScale : 1;
  // A node's own rotation (the tilted eyebrow chip) — exported as real PPTX rotation.
  const rotationOf = (node) => {
    const tf = getComputedStyle(node).transform;
    if (!tf || tf === "none") return 0;
    const mm = tf.match(/matrix\(([-\d.e]+),\s*([-\d.e]+)/);
    if (!mm) return 0;
    const deg = Math.atan2(parseFloat(mm[2]), parseFloat(mm[1])) * 180 / Math.PI;
    return Math.abs(deg) < 0.3 ? 0 : deg;
  };
  // For rotated nodes getBoundingClientRect is the axis-aligned envelope; use the
  // unrotated box at the same centre and let PPTX apply the rotation itself.
  const boxOf = (node, r, k) => {
    const rot = rotationOf(node);
    if (!rot) return { x: r.left - sr.left, y: r.top - sr.top, w: r.width, h: r.height, rot: 0 };
    const w = node.offsetWidth * k, h = node.offsetHeight * k;
    return { x: r.left - sr.left + (r.width - w) / 2, y: r.top - sr.top + (r.height - h) / 2, w, h, rot };
  };

  // Text containing stabilo marks is exported as SEGMENTED text boxes: each marked
  // word (per rendered line) becomes its own box centred on its highlight rect, and
  // plain fragments are anchored at their measured x. A single flowing text box can't
  // guarantee that: when PowerPoint/Canva substitute a font with different glyph
  // widths, words drift horizontally inside the line and slip out of the fixed
  // highlight rectangles. Per-fragment anchoring keeps them glued for ANY font.
  const emitSegmented = (node, cs, k) => {
    const upper = cs.textTransform === "uppercase";
    const fontPx = clamp(safeNum(parseFloat(cs.fontSize), 18) * k, 8, 220);
    const lsRaw = cs.letterSpacing;
    const letterSpacingPx = (lsRaw && lsRaw !== "normal") ? parseFloat(lsRaw) * k : 0;
    const font = cs.fontFamily.split(",")[0].replace(/['"]/g, "").trim();
    const weight = parseInt(cs.fontWeight) || 400;
    const baseColor = rgbToHex(cs.color);
    // display/section-title use a condensed ALL-CAPS display font (Anton/Bebas/Oswald)
    // that PowerPoint/Canva/LibreOffice can't render (never embedded in practice) — the
    // substituted fallback renders the same uppercase text ~35-55% WIDER, so highlight
    // boxes sized to the original glyph width overflow (e.g. the last letter spilling
    // outside its stabilo box). Give those elements much more horizontal slack.
    const isCondensedDisplay = node.classList.contains("display") || node.classList.contains("section-title");

    const flat = [];
    (function walk(n, mk, bold, fontSize) {
      n.childNodes.forEach((c) => {
        if (c.nodeType === 3) { if (c.textContent) flat.push({ tn: c, mk, bold, fontSize }); }
        else if (c.nodeType === 1) {
          const tag = c.tagName.toLowerCase();
          if (tag === "br" || (c.classList && c.classList.contains("ic"))) return;
          if (tag === "mark") walk(c, c, bold, fontSize);
          else if (c.classList && c.classList.contains("lead")) walk(c, mk, true, parseFloat(getComputedStyle(c).fontSize));
          else walk(c, mk, bold, fontSize);
        }
      });
    })(node, null, false, 0);

    const range = document.createRange();
    const segs = [];
    let cur = null, lineTop = null, lineH = 0;
    const startSeg = (p) => { cur = { text: p.text, mk: p.mk, bold: p.bold, fontSize: p.fontSize, l: p.l, r: p.r, t: p.t, b: p.b }; segs.push(cur); };
    const addPiece = (p) => {
      const newLine = lineTop == null || p.t > lineTop + Math.max(lineH, p.b - p.t) * 0.6;
      if (newLine) { lineTop = p.t; lineH = p.b - p.t; startSeg(p); return; }
      lineH = Math.max(lineH, p.b - p.t);
      if (!cur || cur.mk !== p.mk || cur.bold !== p.bold || cur.fontSize !== p.fontSize) { startSeg(p); return; }
      cur.text += (p.glue ? "" : " ") + p.text;
      cur.l = Math.min(cur.l, p.l); cur.r = Math.max(cur.r, p.r);
      cur.t = Math.min(cur.t, p.t); cur.b = Math.max(cur.b, p.b);
    };
    flat.forEach((sg) => {
      const text = sg.tn.textContent;
      const re = /\s+|\S+/g; let m;
      while ((m = re.exec(text))) {
        const tok = m[0];
        if (!tok.trim()) continue;
        let rl = [];
        try { range.setStart(sg.tn, m.index); range.setEnd(sg.tn, m.index + tok.length); rl = Array.from(range.getClientRects()); } catch (e) {}
        if (rl.length <= 1) {
          if (rl[0]) addPiece({ text: tok, mk: sg.mk, bold: sg.bold, fontSize: sg.fontSize, l: rl[0].left, r: rl[0].right, t: rl[0].top, b: rl[0].bottom });
        } else {
          for (let ci = 0; ci < tok.length; ci++) {
            try {
              range.setStart(sg.tn, m.index + ci); range.setEnd(sg.tn, m.index + ci + 1);
              const rr = range.getClientRects()[0];
              if (rr) addPiece({ text: tok[ci], mk: sg.mk, bold: sg.bold, fontSize: sg.fontSize, l: rr.left, r: rr.right, t: rr.top, b: rr.bottom, glue: ci > 0 });
            } catch (e) { /* keep remaining chars */ }
          }
        }
      }
    });

    segs.forEach((sgm) => {
      if (!sgm.text.trim()) return;
      const x = sgm.l - sr.left, y = sgm.t - sr.top, w = sgm.r - sgm.l, h = sgm.b - sgm.t;
      if (w < 1 || h < 2) return;
      const isMark = !!sgm.mk;
      // colour comes from the RENDERED style (dark-theme statement marks stay white)
      const color = isMark ? rgbToHex(getComputedStyle(sgm.mk).color) : baseColor;
      const padH = 6 * k;
      // No meaningful cap for condensed-display fragments: these boxes are invisible
      // and a full headline fragment can be 800-1700px wide, so a small flat cap gets
      // hit long before the % factor does (that's what let "JANGAN PILIH JURUSAN" /
      // "GENGSI" overflow even with the factor bumped up).
      const slackFactor = isCondensedDisplay ? 0.75 : 0.3;
      const slackCap = isCondensedDisplay ? 1400 : 160;
      const slack = Math.min(slackCap, Math.max(24, w * slackFactor));
      els.push({
        x: safeNum(isMark ? x - slack / 2 : x - 2), y: safeNum(y - padH / 2),
        w: safeNum(w + slack), h: safeNum(h + padH),
        rotate: 0,
        runs: [{ text: upper ? sgm.text.toUpperCase() : sgm.text, bold: sgm.bold, fontSize: sgm.fontSize ? sgm.fontSize * k : 0 }],
        font, size: sgm.fontSize ? clamp(sgm.fontSize * k, 8, 220) : fontPx, weight,
        color,
        align: isMark ? "center" : "left",
        valign: "middle",
        lineh: 1.0, linePx: 0,
        charSpacing: clamp(safeNum(letterSpacingPx, 0), -2, 8),
        markText: color, markFill: "",
      });
    });
  };

  // ---- editable text boxes ----
  stage.querySelectorAll(EDIT_SEL).forEach((node) => {
    const r = node.getBoundingClientRect();
    if (r.width < 3 || r.height < 3) return;
    const cs = getComputedStyle(node);
    if (node.querySelector("mark")) { emitSegmented(node, cs, scaleFor(node)); return; }
    const runs = extractRuns(node, cs.textTransform === "uppercase");
    if (!runs.length) return;
    const k = scaleFor(node);
    const box = boxOf(node, r, k);
    const lsRaw = cs.letterSpacing;
    const letterSpacingPx = (lsRaw && lsRaw !== "normal") ? parseFloat(lsRaw) * k : 0;
    const isDisplay = node.classList.contains("display") || node.classList.contains("statement") || node.classList.contains("section-title");
    // display/section-title use a condensed ALL-CAPS display font (Anton/Bebas/Oswald)
    // that's essentially never actually rendered by the viewer (Canva never honours
    // embedded PPTX fonts; PowerPoint/LibreOffice only do if the exact font happens to
    // be installed locally) — the substituted fallback is both notably wider AND has
    // taller line metrics at the same point size, so these get extra slack below.
    const isCondensedDisplay = node.classList.contains("display") || node.classList.contains("section-title");
    const isBadge = node.classList.contains("list-ic") || node.classList.contains("rank");
    const isSmall = node.classList.contains("eyebrow") || node.classList.contains("pill-btn") || node.classList.contains("counter");
    const padW = (isBadge ? 0 : isDisplay ? 12 : isSmall ? 8 : 6) * k;
    const padH = (isBadge ? 0 : isDisplay ? 12 : isSmall ? 6 : 6) * k;
    const fontPx = clamp(safeNum(parseFloat(cs.fontSize), 18) * k, 8, 220);
    const linePxRaw = parseFloat(cs.lineHeight);
    // small safety margin on the line pitch so a substituted font's taller ascent/
    // descent (typical for fallback UI fonts vs. a tight condensed display face)
    // doesn't overlap the next line — a few px of extra drift beats visible overlap.
    const linePx = (Number.isFinite(linePxRaw) ? linePxRaw : fontPx * 1.15) * k * (isCondensedDisplay ? 1.08 : 1);
    runs.forEach((run) => { if (run.fontSize) run.fontSize *= k; });
    const elemMarkHex = (markHex || (isDisplay ? "F7B400" : "FFD65A")).replace("#", "");
    const centered = CENTER_CLASSES.some((c) => node.classList.contains(c));
    const align = centered ? "center" : (cs.textAlign.indexOf("center") >= 0 ? "center" : (cs.textAlign.indexOf("right") >= 0 || cs.textAlign.indexOf("end") >= 0) ? "right" : "left");
    // Widen the box (anchored on its alignment) so a slightly wider substituted font
    // can't re-wrap the hard-broken lines; the box itself is invisible. Measured
    // against real fallback fonts, condensed-display uppercase text comes out
    // ~35-55% wider, so it needs far more slack than body/badge text or it silently
    // re-wraps and overlaps the next line.
    let bx = box.x - padW / 2, bw = box.w + padW;
    const slackFactor = isCondensedDisplay ? 0.75 : 0.18;
    const slackCap = isCondensedDisplay ? 1400 : 140;
    const slack = Math.min(slackCap, Math.max(16, bw * slackFactor));
    if (align === "center") { bx -= slack / 2; bw += slack; }
    else if (align === "right") { bx -= slack; }
    bw += align === "center" ? 0 : slack;
    els.push({
      x: safeNum(bx), y: safeNum(box.y - padH / 2),
      w: safeNum(bw), h: safeNum(box.h + padH),
      rotate: box.rot,
      runs,
      font: cs.fontFamily.split(",")[0].replace(/['"]/g, "").trim(),
      size: fontPx,
      weight: parseInt(cs.fontWeight) || 400,
      color: rgbToHex(cs.color),
      align,
      valign: (isBadge || MID_CLASSES.some((c) => node.classList.contains(c))) ? "middle" : "top",
      lineh: clamp(safeNum(linePx / fontPx, 1.15), 0.7, 2.5),
      linePx: safeNum(linePx, fontPx * 1.15),
      charSpacing: clamp(safeNum(letterSpacingPx, 0), -2, 8),
      // Honour a user-picked stabilo TEXT colour (it's what the preview/PNG shows);
      // otherwise fall back to the auto-contrast colour against the highlight fill.
      markText: (data && data.highlightTextColor || "").replace("#", "") || contrastHex(elemMarkHex), markFill: elemMarkHex,
      // Last-resort safety net: if the substituted font is even wider/taller than the
      // measured margin above accounts for, let PowerPoint shrink the text to fit
      // its box instead of overflowing/overlapping the next element.
      autofit: isCondensedDisplay,
    });
  });

  // ---- editable shapes (cards, boxes, badges, image frames) ----
  stage.querySelectorAll(SHAPE_SEL).forEach((node) => {
    const r = node.getBoundingClientRect();
    if (r.width < 3 || r.height < 3) return;
    const cs = getComputedStyle(node);
    let bgStr = cs.backgroundColor;
    let fillHex = rgbToHex(bgStr);
    let fillAlpha = 1;
    const m = bgStr.match(/rgba\([^,]+,[^,]+,[^,]+,\s*([^)]+)\)/);
    if (m) fillAlpha = parseFloat(m[1]);

    // Gradient fills (gold badges, dark table rows) resolve to a transparent
    // backgroundColor + a backgroundImage gradient; average the stops for a solid tint.
    if (fillAlpha === 0 && cs.backgroundImage && cs.backgroundImage !== "none") {
      const stops = cs.backgroundImage.match(/rgba?\([^)]*\)/g);
      const acc = [0, 0, 0]; let cnt = 0;
      (stops || []).forEach((s) => {
        const p = s.match(/[\d.]+/g);
        const a = p && p.length >= 4 ? parseFloat(p[3]) : 1;
        if (p && p.length >= 3 && a > 0.05) { acc[0] += +p[0]; acc[1] += +p[1]; acc[2] += +p[2]; cnt++; }
      });
      if (cnt) { fillHex = acc.map((v) => Math.round(v / cnt).toString(16).padStart(2, "0")).join(""); fillAlpha = 1; }
      else { fillHex = "FFFFFF"; fillAlpha = 0.9; }
    }

    if (fillAlpha <= 0 && (!cs.backgroundImage || cs.backgroundImage === "none")) return;

    const k = scaleFor(node);
    const box = boxOf(node, r, k);
    blocks.push({
      x: safeNum(box.x), y: safeNum(box.y),
      w: safeNum(box.w), h: safeNum(box.h),
      rotate: box.rot,
      fill: { color: fillHex, transparency: Math.round((1 - fillAlpha) * 100) },
      roundness: (parseFloat(cs.borderRadius) || 0) * k
    });
  });

  // ---- highlighter (stabilo): a separate rounded box BEHIND each marked word, so it
  //      stays an independently editable rectangle in PowerPoint. One box per visual
  //      line fragment (a mark that wraps produces several client rects). Emitted after
  //      the cards so it sits above them and below the text. ----
  stage.querySelectorAll("mark").forEach((mk) => {
    const isDisplay = !!mk.closest(".display, .statement, .section-title");
    const mkCs = getComputedStyle(mk);
    // Use the ACTUAL rendered highlight colour: solid background (display marks) or
    // the first opaque stop of the band gradient (statement/list marks use gold-soft,
    // not gold — hardcoding one hex made exported boxes the wrong shade).
    let fill = (markHex || "").replace("#", "");
    if (!fill) {
      const bc = mkCs.backgroundColor;
      const bcAlpha = (bc.match(/rgba\([^,]+,[^,]+,[^,]+,\s*([^)]+)\)/) || [])[1];
      if (bc && bc !== "transparent" && (bcAlpha === undefined || parseFloat(bcAlpha) > 0.05)) fill = rgbToHex(bc);
      else {
        const stops = (mkCs.backgroundImage || "").match(/rgba?\([^)]*\)/g) || [];
        const solid = stops.find((s) => { const p = s.match(/[\d.]+/g); return p && (p.length < 4 || parseFloat(p[3]) > 0.05); });
        fill = solid ? rgbToHex(solid) : (isDisplay ? "F7B400" : "FFD65A");
      }
    }
    const k = scaleFor(mk);
    const mkRadius = (parseFloat(mkCs.borderRadius) || (isDisplay ? 8 : 5)) * k;
    const useBand = !mk.closest(".display");
    const padTop = (parseFloat(mkCs.paddingTop) || 0) * k;
    const padBottom = (parseFloat(mkCs.paddingBottom) || 0) * k;
    const padLeft = (parseFloat(mkCs.paddingLeft) || 0) * k;
    const padRight = (parseFloat(mkCs.paddingRight) || 0) * k;
    // Measure only the marked text content via Range; this avoids exporting a
    // rectangle that spans the rest of the line in wrapped headings.
    const rg = document.createRange();
    rg.selectNodeContents(mk);
    const rects = rg.getClientRects();
    for (let i = 0; i < rects.length; i++) {
      const r = rects[i];
      if (r.width < 3 || r.height < 3) continue;
      const x = r.left - sr.left - padLeft;
      const y = r.top - sr.top - padTop;
      const w = r.width + padLeft + padRight;
      const h = r.height + padTop + padBottom;
      const insetY = useBand ? h * 0.14 : 0;
      const hh = useBand ? Math.max(2, h * 0.72) : h;
      blocks.push({
        x: safeNum(x), y: safeNum(y + insetY),
        w: safeNum(w), h: safeNum(hh),
        fill: { color: fill, transparency: 0 },
        roundness: mkRadius
      });
    }
  });

  // ---- editable images (meme + regular) placed at their visible object-fit:contain
  //      rect (plus pan/zoom), so they stay real, movable pictures in Canva. ----
  stage.querySelectorAll(".meme-frame img").forEach((node) => {
    const frame = node.parentElement;
    const fr = frame.getBoundingClientRect();
    const fcs = getComputedStyle(frame);
    const bw = parseFloat(fcs.borderLeftWidth) || 0;
    const ix = fr.left - sr.left + bw, iy = fr.top - sr.top + bw;
    const iw = fr.width - 2 * bw, ih = fr.height - 2 * bw;
    if (iw < 3 || ih < 3) return;
    const nw = node.naturalWidth || iw, nh = node.naturalHeight || ih;
    const na = nw / nh, fa = iw / ih;
    let dw, dh;
    if (na > fa) { dw = iw; dh = iw / na; } else { dh = ih; dw = ih * na; }
    // pan/zoom (shared imgX/imgY/imgZoom), origin = frame-inner centre
    const s = (data && data.imgZoom ? data.imgZoom : 100) / 100;
    const tx = ((data && data.imgX != null ? data.imgX : 50) - 50) / 100 * iw;
    const ty = ((data && data.imgY != null ? data.imgY : 50) - 50) / 100 * ih;
    dw *= s; dh *= s;
    const cx = ix + iw / 2 + tx, cy = iy + ih / 2 + ty;
    images.push({ src: node.src, x: safeNum(cx - dw / 2), y: safeNum(cy - dh / 2), w: safeNum(dw), h: safeNum(dh) });
  });

  // Logo stays a separate editable image instead of getting baked into background.
  stage.querySelectorAll(".logo-chip img").forEach((node) => {
    const r = node.getBoundingClientRect();
    if (r.width < 3 || r.height < 3 || !node.src) return;
    images.push({
      src: node.src,
      x: safeNum(r.left - sr.left), y: safeNum(r.top - sr.top),
      w: safeNum(r.width), h: safeNum(r.height)
    });
  });

  // Human-figure PNG (figure layout) — an editable, movable picture with its
  // rotation/flip carried over; the AABB comes from the rendered transform.
  stage.querySelectorAll("img.figure-img").forEach((node) => {
    const r = node.getBoundingClientRect();
    if (r.width < 3 || r.height < 3 || !node.src) return;
    const k = scaleFor(node);
    const sc = ((data && data.figScale) || 100) / 100;
    const w = node.offsetWidth * sc * k, h = node.offsetHeight * sc * k;
    const cx = r.left + r.width / 2 - sr.left, cy = r.top + r.height / 2 - sr.top;
    images.push({
      src: node.src,
      x: safeNum(cx - w / 2), y: safeNum(cy - h / 2),
      w: safeNum(w), h: safeNum(h),
      rotate: (data && data.figRotate) || 0,
      flipH: !!(data && data.figFlip),
      transparency: data && data.figOpacity != null ? Math.round(100 - data.figOpacity) : 0,
    });
  });

  // Instagram glyph in the footer chip (an inline SVG in the DOM) — exported as a
  // small PNG so it stays a real object next to the gold chip shape.
  if (igIconPng) {
    stage.querySelectorAll(".handles .ic svg").forEach((node) => {
      const r = node.getBoundingClientRect();
      if (r.width < 3) return;
      images.push({ src: igIconPng, x: safeNum(r.left - sr.left), y: safeNum(r.top - sr.top), w: safeNum(r.width), h: safeNum(r.height) });
    });
  }

  return { els, blocks, images };
}

/* Rasterize the footer's inline IG SVG once (currentColor resolved to the rendered
 * colour) so the PPTX gets a crisp PNG glyph. Cached for the whole export. */
let _igIconPng;
async function getIgIconPng(stage) {
  if (_igIconPng !== undefined) return _igIconPng;
  const svg = stage.querySelector(".handles .ic svg");
  if (!svg) return (_igIconPng = "");
  try {
    const color = getComputedStyle(svg.closest(".ic")).color;
    const xml = new XMLSerializer().serializeToString(svg).replace(/currentColor/g, color);
    const img = new Image();
    await new Promise((res, rej) => {
      img.onload = res; img.onerror = rej;
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(xml.replace("<svg ", '<svg width="96" height="96" '));
    });
    const c = document.createElement("canvas"); c.width = 96; c.height = 96;
    c.getContext("2d").drawImage(img, 0, 0, 96, 96);
    _igIconPng = c.toDataURL("image/png");
  } catch (e) { _igIconPng = ""; }
  return _igIconPng;
}
async function renderSlideForPptx(data) {
  window.renderStage(exportStage, data);
  const w = parseInt(exportStage.style.width) || 1080;
  const h = parseInt(exportStage.style.height) || 1350;
  exportStage.parentElement.style.width = w + "px";
  exportStage.parentElement.style.height = h + "px";
  await waitImages(exportStage);
  await ensureStageFonts(exportStage);
  // Extra frame delay for layout to settle (especially for compare/list cards)
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r))));
  window.refitStage(exportStage); // re-fit with real fonts before measuring
  const markHex = (data.markColor || "").replace("#", "") || null;
  const igPng = await getIgIconPng(exportStage);
  const { els, blocks, images } = collectPptx(exportStage, markHex, data, igPng);

  // Pixel-perfect PPTX: the slide background is a full raster of the rendered
  // stage (text, shapes, images and all). Editable objects are then layered on
  // top as transparent overlays so users can still click/select/edit in
  // PowerPoint / Canva, but the visible output is guaranteed to match the Live
  // Preview regardless of font substitution or metric differences.
  const bg = await stageToPng(w, h);

  return { bg, els, blocks, images, width: w, height: h };
}
downloadPptxBtn.addEventListener("click", async () => {
  downloadPptxBtn.disabled = true;
  statusMsg.className = "status-msg";
  try {
    const specs = [];
    for (let i = 0; i < state.slides.length; i++) {
      statusMsg.textContent = `Bikin PPTX — slide ${i + 1}/${state.slides.length}…`;
      try {
        specs.push(await renderSlideForPptx(slideData(state.slides[i], i)));
      } catch (e) {
        throw new Error(`Gagal di slide ${i + 1} (render): ${e.stack || e.message}`);
      }
    }
    statusMsg.textContent = "Menyusun file PPTX…";
    // Version + time in the filename so a fresh export can't be confused with an
    // older download of the same name sitting in the Downloads folder.
    const t = new Date();
    const fname = `carousel-pastipintar.utbk-v15-${String(t.getHours()).padStart(2, "0")}${String(t.getMinutes()).padStart(2, "0")}.pptx`;
    try {
      await downloadPptx(specs, fname);
    } catch (e) {
      throw new Error(`Gagal saat menyusun PPTX (PptxGenJS): ${e.stack || e.message}`);
    }
    statusMsg.textContent = `PPTX selesai (build v15) → ${fname}. Tampilan pixel-perfect sama kayak preview — teks & gambar tetap editable di Canva/PowerPoint.`; statusMsg.className = "status-msg ok";
  } catch (err) { statusMsg.textContent = "Error PPTX: " + err.message; statusMsg.className = "status-msg error"; console.error(err); }
  finally { downloadPptxBtn.disabled = false; }
});

/* ---------------- Init ---------------- */
(async function init() {
  try {
    const blob = await (await fetch("logo/logo.png")).blob();
    LOGO_DATAURL = await new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(blob); });
  } catch (e) { /* keep url fallback */ }
  wireProjectUI();
  renderTemplateGallery();
  // Auto-restore the most recently touched project (saved or autosave recovery).
  let restored = false;
  try {
    const metas = await store.listMeta();
    if (metas.length) {
      const proj = await store.loadProject(metas[0].id);
      if (proj && proj.content && proj.content.slides) {
        applyProject(proj.meta, proj.content);
        restored = true;
      }
    }
  } catch (e) { console.warn("Restore project gagal:", e); }
  if (!restored) {
    restoring = true;
    try { syncGlobalInputs(); renderSlides(); renderGallery(); } finally { restoring = false; }
  }
  updateSaveBadge();
  // Console/debug handle (also used by the automated tests).
  window.__cs = { state, current, renderSlides, refreshAll, autosaveNow, manualSave, rebuildCard };
})();
