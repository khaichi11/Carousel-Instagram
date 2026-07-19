import { parseBrief } from "./import-brief.js";
import { downloadPptx } from "./pptx-export.js?v=9";
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
  { id: "cta", label: "CTA" },
];
const THEMES = [{ id: "dark", label: "Navy" }, { id: "light", label: "Terang" }];
// Background source per design — decoupled from the light/dark theme so any slide can
// show a background image (global from settings, or a custom one for this slide).
const BG_MODES = [{ id: "", label: "Tanpa" }, { id: "global", label: "Global" }, { id: "custom", label: "Custom" }];
const ALIGNS = [{ id: "", label: "Auto" }, { id: "top", label: "Atas" }, { id: "center", label: "Tengah" }, { id: "bottom", label: "Bawah" }];
const FONTS = [
  { id: "Anton", label: "Anton" }, { id: "Bebas Neue", label: "Bebas Neue" }, { id: "Oswald", label: "Oswald" },
  { id: "Archivo Black", label: "Archivo Black" }, { id: "Montserrat", label: "Montserrat" },
];
const TEXTURES = [{ id: "", label: "Default" }, { id: "paper", label: "Paper" }, { id: "fabric", label: "Fabric" }, { id: "noise", label: "Noise" }, { id: "grain", label: "Grain" }, { id: "none", label: "Polos" }];
const TEXTURE_TONES = [{ id: "light", label: "Terang" }, { id: "dark", label: "Gelap" }];
const PATTERNS = [{ id: "", label: "Default" }, { id: "grid", label: "Grid" }, { id: "dots", label: "Dots" }, { id: "diagonal", label: "Garis" }, { id: "waves", label: "Waves" }, { id: "none", label: "Polos" }];

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
  return Object.assign(
    { id: crypto.randomUUID(), type: "cover", theme: "dark", align: "", topic: "", eyebrow: "", title: "", subtitle: "", button: "",
      items: "", colA: "", itemsA: "", colB: "", itemsB: "", capTop: "", capBottom: "",
      textColor: "", titleColor: "", markColor: "", texture: "", textureTone: "light", textureOpacity: 60, pattern: "", image: null, imageCaption: "", bgImage: null, bgMode: "",
      imgX: 50, imgY: 50, imgZoom: 100,
      bgX: 50, bgY: 50, bgZoom: 100, textureX: 50, textureY: 50, textureScale: 100, patternX: 50, patternY: 50, patternScale: 100, _send: null },
    base
  );
}
const state = { bgImage: null, settings: { igHandle: "pastipintar", website: "pastipintar.id", font: "Anton", customFontUrl: "", ratio: "4:5" }, slides: DEFAULT_SLIDES.map(freshSlide) };

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

/* ---------------- Slide render data ---------------- */
function slideData(slide, idx, logo) {
  return {
    type: slide.type, theme: slide.theme, align: slide.align, topic: slide.topic,
    eyebrow: slide.eyebrow, title: slide.title, subtitle: slide.subtitle, button: slide.button,
    items: slide.items, colA: slide.colA, itemsA: slide.itemsA, colB: slide.colB, itemsB: slide.itemsB,
    capTop: slide.capTop, capBottom: slide.capBottom, image: slide.image, imageCaption: slide.imageCaption,
    bgImage: slide.bgMode === "custom" ? (slide.bgImage || null) : slide.bgMode === "global" ? (state.bgImage || null) : null,
    textColor: slide.textColor, titleColor: slide.titleColor, markColor: slide.markColor,
    texture: slide.texture, textureTone: slide.textureTone, textureOpacity: slide.textureOpacity, pattern: slide.pattern,
    bgX: slide.bgX, bgY: slide.bgY, bgZoom: slide.bgZoom, 
    imgX: slide.imgX, imgY: slide.imgY, imgZoom: slide.imgZoom,
    textureX: slide.textureX, textureY: slide.textureY, textureScale: slide.textureScale, 
    patternX: slide.patternX, patternY: slide.patternY, patternScale: slide.patternScale,
    font: state.settings.font, customFontUrl: state.settings.customFontUrl, ratio: state.settings.ratio,
    logo: logo || LOGO_DATAURL, index: idx + 1, total: state.slides.length,
    igHandle: state.settings.igHandle, website: state.settings.website,
  };
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
async function importBrief(file) {
  const name = (file.name || "").toLowerCase();
  if (!/\.(pdf|txt|md)$/.test(name)) { importStatus.textContent = "Format harus .pdf/.txt/.md"; return; }
  if (state.slides.some((s) => s.title || s.items || s.subtitle || s.itemsA)) {
    if (!confirm("Import akan mengganti semua slide sekarang. Lanjut?")) return;
  }
  importStatus.innerHTML = '<span class="spinner"></span> Membaca…'; importSub.textContent = file.name;
  try {
    let text;
    if (name.endsWith(".pdf")) text = await pdfToText(await file.arrayBuffer());
    else text = await file.text();
    if (!text.trim()) throw new Error("Nggak ada teks kebaca. Kalau PDF hasil scan/gambar, teksnya nggak bisa diambil.");
    const slides = parseBrief(text);
    state.slides = slides.map(freshSlide);
    renderSlides();
    importStatus.textContent = `✓ ${slides.length} slide kebentuk`;
    document.getElementById("slidesList").scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (err) { importStatus.textContent = "Error: " + err.message; }
}
wireDropzone(importDropzone, importFileInput, importBrief);

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
function colorField(slide, key, labelText) {
  const wrap = document.createElement("div"); wrap.className = "color-field";
  const input = document.createElement("input"); input.type = "color"; input.value = slide[key] || "#F7B400";
  const def = document.createElement("button"); def.type = "button"; def.className = "chip sm" + (slide[key] ? "" : " active"); def.textContent = "Default";
  input.addEventListener("input", () => { slide[key] = input.value; def.classList.remove("active"); slide._send && slide._send(); });
  def.addEventListener("click", () => { slide[key] = ""; def.classList.add("active"); slide._send && slide._send(); });
  wrap.appendChild(input); wrap.appendChild(def);
  return labeled(labelText, wrap);
}
function buildImageDropzone(slide, key, onChange, subtitle) {
  const dz = document.createElement("div"); dz.className = "dropzone small";
  dz.innerHTML = `<img class="thumb" style="display:none" /><div class="placeholder">➕</div><div class="info"><strong>Drag &amp; drop gambar</strong><span>${subtitle || "klik buat pilih file"}</span></div><div class="actions"><button type="button" class="link-btn danger" style="display:none">Hapus</button></div>`;
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

function buildTransformControls(slide, prefix, label) {
  const wrap = document.createElement("div"); wrap.className = "transform-ctrls";
  wrap.style.display = "flex"; wrap.style.gap = "10px"; wrap.style.marginTop = "4px"; wrap.style.fontSize = "12px";

  // Each control = a slider + a synced numeric input (type or drag; they stay in sync).
  const addSlider = (key, text, min, max, def) => {
    const div = document.createElement("div"); div.style.flex = "1";
    const cur = slide[prefix + key] || def;
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
    wrap.appendChild(div);
  };

  addSlider("X", "X", 0, 100, 50);
  addSlider("Y", "Y", 0, 100, 50);
  addSlider("Scale", "Size", 10, 300, 100);

  const container = document.createElement("div");
  if (label) { const lb = document.createElement("div"); lb.style.cssText = "font-size:11.5px;color:var(--text-soft);margin-top:6px"; lb.textContent = label; container.appendChild(lb); }
  container.appendChild(wrap);
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

function buildCard(slide, idx) {
  const card = document.createElement("div"); card.className = "slide-card"; card.dataset.id = slide.id;
  const top = document.createElement("div"); top.className = "slide-card-top";
  top.innerHTML = `<span class="tag">Slide ${idx + 1}</span><div class="tools">
    <button class="icon-btn move-up" title="Naik">↑</button><button class="icon-btn move-down" title="Turun">↓</button>
    <button class="icon-btn dup" title="Duplikat">⧉</button><button class="icon-btn danger remove" title="Hapus">✕</button></div>`;
  card.appendChild(top);

  const grid = document.createElement("div"); grid.className = "card-grid"; card.appendChild(grid);
  const col = document.createElement("div"); col.className = "fields-col"; grid.appendChild(col);

  const headRow = document.createElement("div"); headRow.className = "opt-row";
  headRow.appendChild(labeled("Layout", dropdown(TYPES, slide.type, (id) => { slide.type = id; renderSlides(); })));
  headRow.appendChild(labeled("Tema", dropdown(THEMES, slide.theme, (id) => { slide.theme = id; renderSlides(); })));
  col.appendChild(headRow);

  const optRow = document.createElement("div"); optRow.className = "opt-row";
  optRow.appendChild(labeled("Posisi Teks", dropdown(ALIGNS, slide.align, (id) => { slide.align = id; renderSlides(); })));
  col.appendChild(optRow);

  const styleRow = document.createElement("div"); styleRow.className = "opt-row";
  
  const texWrap = document.createElement("div");
  texWrap.appendChild(swatchChipRow(TEXTURES, slide.texture, (id) => { slide.texture = id; slide._send && slide._send(); }, "texture", slide.textureTone));
  // Light/Dark tone (independent of theme) + apply-to-all-slides
  const texTools = document.createElement("div"); texTools.className = "chip-row"; texTools.style.marginTop = "6px"; texTools.style.alignItems = "center";
  texTools.appendChild(dropdown(TEXTURE_TONES, slide.textureTone || "light", (id) => { slide.textureTone = id; renderSlides(); }));
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
    state.slides.forEach((s) => { s.pattern = slide.pattern; s.patternX = slide.patternX; s.patternY = slide.patternY; s.patternScale = slide.patternScale; });
    renderSlides();
  });
  patTools.appendChild(applyAllPat);
  patWrap.appendChild(patTools);
  patWrap.appendChild(buildTransformControls(slide, "pattern", ""));
  styleRow.appendChild(labeled("Garis / Pattern", patWrap));
  
  col.appendChild(styleRow);

  const colorRow = document.createElement("div"); colorRow.className = "opt-row";
  colorRow.appendChild(colorField(slide, "titleColor", "Warna Judul"));
  colorRow.appendChild(colorField(slide, "textColor", "Warna Teks"));
  col.appendChild(colorRow);
  const colorRow2 = document.createElement("div"); colorRow2.className = "opt-row";
  colorRow2.appendChild(colorField(slide, "markColor", "Warna Stabilo"));
  col.appendChild(colorRow2);

  const topicInp = document.createElement("input"); topicInp.type = "text"; topicInp.value = slide.topic || ""; topicInp.placeholder = "mis. Realita — badge kanan atas";
  topicInp.addEventListener("input", () => { slide.topic = topicInp.value; slide._send && slide._send(); });
  col.appendChild(labeled("Topik Slide", topicInp, "Kosongin kalau nggak mau badge."));

  (TYPE_FIELDS[slide.type] || []).forEach((f) => {
    if (f.kind === "image") {
      // Dedicated meme-image placeholder (meme layout).
      const imgWrap = document.createElement("div");
      imgWrap.appendChild(buildImageDropzone(slide, f.key, () => slide._send && slide._send(), "gambar meme — caption di atas & bawah"));
      imgWrap.appendChild(buildTransformControls(slide, "img", "Posisi Gambar"));
      col.appendChild(labeled(f.label, imgWrap, f.hint));
      return;
    }
    const inp = f.kind === "textarea" ? document.createElement("textarea") : document.createElement("input");
    if (f.kind === "textarea") inp.rows = f.rows || 3; else inp.type = "text";
    inp.value = slide[f.key] || ""; inp.placeholder = f.ph || "";
    inp.addEventListener("input", () => { slide[f.key] = inp.value; slide._send && slide._send(); });
    col.appendChild(labeled(f.label, inp, f.hint));
  });

  // Regular-image placeholder (non-meme layouts): an ordinary image shown inside the
  // slide, with an optional caption displayed underneath it.
  if (slide.type !== "meme") {
    const imgWrap = document.createElement("div");
    imgWrap.appendChild(buildImageDropzone(slide, "image", () => slide._send && slide._send(), "gambar biasa di dalam slide"));
    imgWrap.appendChild(buildTransformControls(slide, "img", "Posisi Gambar"));
    const capInput = document.createElement("input"); capInput.type = "text";
    capInput.value = slide.imageCaption || ""; capInput.placeholder = "Caption di bawah gambar (opsional)";
    capInput.style.marginTop = "8px";
    capInput.addEventListener("input", () => { slide.imageCaption = capInput.value; slide._send && slide._send(); });
    imgWrap.appendChild(capInput);
    col.appendChild(labeled("Gambar (opsional)", imgWrap, "Muncul di dalam slide, dengan caption di bawahnya."));
  }

  // Background source: None / Global (from Pengaturan Global) / Custom (this slide).
  // Works on any theme — an image background overlays the navy/light gradient.
  const bgWrap = document.createElement("div");
  bgWrap.appendChild(dropdown(BG_MODES, slide.bgMode, (id) => { slide.bgMode = id; renderSlides(); }));
  if (slide.bgMode === "custom") {
    bgWrap.appendChild(buildImageDropzone(slide, "bgImage", () => slide._send && slide._send(), "background khusus slide ini"));
    bgWrap.appendChild(buildTransformControls(slide, "bg", "Posisi Background"));
  } else if (slide.bgMode === "global") {
    const note = document.createElement("div"); note.className = "field-hint";
    note.textContent = state.bgImage ? "Pakai background global dari Pengaturan Global." : "Belum ada background global — upload di Pengaturan Global dulu.";
    bgWrap.appendChild(note);
    bgWrap.appendChild(buildTransformControls(slide, "bg", "Posisi Background"));
  }
  col.appendChild(labeled("Background", bgWrap, "Global = ikut Pengaturan Global. Custom = gambar khusus slide ini."));

  const prev = document.createElement("div"); prev.className = "preview-col";
  const frameWrap = document.createElement("div"); frameWrap.className = "preview-frame-wrap";
  const frame = document.createElement("iframe"); frame.className = "preview-frame"; frame.src = "template.html";
  frameWrap.appendChild(frame); prev.appendChild(frameWrap);
  const cap = document.createElement("span"); cap.className = "preview-cap"; cap.textContent = "Live preview"; prev.appendChild(cap);
  grid.appendChild(prev);

  let ready = false;
  function send() { 
    if (ready) {
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
  slide._send = send;

  top.querySelector(".move-up").addEventListener("click", () => moveSlide(slide.id, -1));
  top.querySelector(".move-down").addEventListener("click", () => moveSlide(slide.id, 1));
  top.querySelector(".dup").addEventListener("click", () => dupSlide(slide.id));
  top.querySelector(".remove").addEventListener("click", () => removeSlide(slide.id));
  return card;
}

function moveSlide(id, dir) { const i = state.slides.findIndex((s) => s.id === id), j = i + dir; if (j < 0 || j >= state.slides.length) return; const [it] = state.slides.splice(i, 1); state.slides.splice(j, 0, it); renderSlides(); }
function dupSlide(id) { const i = state.slides.findIndex((s) => s.id === id); const copy = freshSlide(Object.assign({}, state.slides[i], { id: undefined, _send: null })); copy.id = crypto.randomUUID(); state.slides.splice(i + 1, 0, copy); renderSlides(); }
function removeSlide(id) { if (state.slides.length <= 1) { alert("Minimal 1 slide."); return; } state.slides = state.slides.filter((s) => s.id !== id); renderSlides(); }
function renderSlides() { slidesListEl.innerHTML = ""; state.slides.forEach((s, i) => slidesListEl.appendChild(buildCard(s, i))); }
function refreshAll() { state.slides.forEach((s) => s._send && s._send()); }

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
  await document.fonts.ready;
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  window.refitStage(exportStage); // re-fit now that the real fonts are loaded
  return await stageToPng(w, h);
}
async function generatePng() {
  generateBtn.disabled = generateBtnTop.disabled = true;
  statusMsg.className = "status-msg"; downloadZipBtn.style.display = "none"; gallerySection.style.display = "none";
  try {
    lastPngs = [];
    for (let i = 0; i < state.slides.length; i++) {
      statusMsg.textContent = `Render slide ${i + 1}/${state.slides.length}…`;
      lastPngs.push(await renderPng(slideData(state.slides[i], i)));
    }
    gallery.innerHTML = "";
    lastPngs.forEach((src, i) => {
      const item = document.createElement("div"); item.className = "gallery-item";
      item.innerHTML = `<a href="${src}" target="_blank"><img src="${src}" alt="Slide ${i + 1}" /></a><div class="gi-footer"><span>Slide ${i + 1}</span><a class="link-btn" href="${src}" download="slide-${i + 1}.png">Download</a></div>`;
      gallery.appendChild(item);
    });
    gallerySection.style.display = "block"; gallerySection.scrollIntoView({ behavior: "smooth", block: "start" });
    statusMsg.textContent = `Selesai! ${lastPngs.length} PNG dibuat.`; statusMsg.className = "status-msg ok";
    downloadZipBtn.style.display = "inline-flex";
  } catch (err) { statusMsg.textContent = "Error: " + err.message; statusMsg.className = "status-msg error"; console.error(err); }
  finally { generateBtn.disabled = generateBtnTop.disabled = false; }
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
function extractRuns(node, upper) {
  const runs = [];
  const push = (t, o) => { if (t) runs.push(Object.assign({ text: upper ? t.toUpperCase() : t }, o)); };
  (function walk(n, mark, bold) {
    n.childNodes.forEach((c) => {
      if (c.nodeType === 3) push(c.textContent, { mark, bold });
      else if (c.nodeType === 1) {
        const tag = c.tagName.toLowerCase();
        if (tag === "br") { if (runs.length) runs[runs.length - 1].br = true; }
        else if (tag === "mark") walk(c, true, bold);
        else if (c.classList && c.classList.contains("lead")) {
          const leadCs = getComputedStyle(c);
          const prevLen = runs.length;
          walk(c, mark, true);
          for (let i = prevLen; i < runs.length; i++) runs[i].fontSize = parseFloat(leadCs.fontSize);
          if (runs.length) runs[runs.length - 1].br = true;
        } else walk(c, mark, bold);
      }
    });
  })(node, false, false);
  return runs;
}

// Every text element → its own editable text box (incl. footer handles + badge/rank text).
const EDIT_SEL = ".eyebrow,.display,.statement,.subtitle,.pill-btn,.section-title,.list-txt,.list-ic,.trow .name,.trow .val,.rank,.cmp-head,.cmp-tx,.meme-cap,.img-caption,.counter,.handles .h,.handles .ic";
const MID_CLASSES = ["eyebrow", "pill-btn", "counter", "meme-cap", "name", "val", "cmp-head", "list-ic", "rank", "ic", "h"];
const CENTER_CLASSES = ["list-ic", "rank", "meme-cap", "counter", "pill-btn", "eyebrow", "ic"];
// Cards/boxes/badges/pills/image-frames/logo chip → editable shapes.
const SHAPE_SEL = ".card, .table-card, .text-card, .cmp-col, .trow, .meme-frame, .list-ic, .rank, .eyebrow, .pill-btn, .counter, .trow .val, .cmp-head, .handles .ic, .logo-chip";

function collectPptx(stage, markHex, data) {
  const sr = stage.getBoundingClientRect();
  const els = [], blocks = [], images = [];
  const safeNum = (v, fb = 0) => Number.isFinite(v) ? v : fb;
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  // ---- editable text boxes ----
  stage.querySelectorAll(EDIT_SEL).forEach((node) => {
    const r = node.getBoundingClientRect();
    if (r.width < 3 || r.height < 3) return;
    const cs = getComputedStyle(node);
    const runs = extractRuns(node, cs.textTransform === "uppercase");
    if (!runs.length) return;
    const lsRaw = cs.letterSpacing;
    const letterSpacingPx = (lsRaw && lsRaw !== "normal") ? parseFloat(lsRaw) : 0;
    const isDisplay = node.classList.contains("display") || node.classList.contains("statement") || node.classList.contains("section-title");
    const isBadge = node.classList.contains("list-ic") || node.classList.contains("rank");
    const isSmall = node.classList.contains("eyebrow") || node.classList.contains("pill-btn") || node.classList.contains("counter");
    const padW = isBadge ? 0 : isDisplay ? 12 : isSmall ? 8 : 6;
    const padH = isBadge ? 0 : isDisplay ? 12 : isSmall ? 6 : 6;
    const elemMarkHex = (markHex || (isDisplay ? "F7B400" : "FFD65A")).replace("#", "");
    const centered = CENTER_CLASSES.some((c) => node.classList.contains(c));
    els.push({
      x: safeNum(r.left - sr.left - padW / 2), y: safeNum(r.top - sr.top - padH / 2),
      w: safeNum(r.width + padW), h: safeNum(r.height + padH),
      runs,
      font: cs.fontFamily.split(",")[0].replace(/['"]/g, "").trim(),
      size: clamp(safeNum(parseFloat(cs.fontSize), 18), 8, 220),
      weight: parseInt(cs.fontWeight) || 400,
      color: rgbToHex(cs.color),
      align: centered ? "center" : (cs.textAlign.indexOf("center") >= 0 ? "center" : (cs.textAlign.indexOf("right") >= 0 || cs.textAlign.indexOf("end") >= 0) ? "right" : "left"),
      valign: (isBadge || MID_CLASSES.some((c) => node.classList.contains(c))) ? "middle" : "top",
      lineh: clamp(safeNum(parseFloat(cs.lineHeight) / parseFloat(cs.fontSize), 1.15), 0.8, 2.5),
      charSpacing: clamp(safeNum(letterSpacingPx, 0), -2, 8),
      markText: contrastHex(elemMarkHex), markFill: elemMarkHex,
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

    blocks.push({
      x: safeNum(r.left - sr.left), y: safeNum(r.top - sr.top),
      w: safeNum(r.width), h: safeNum(r.height),
      fill: { color: fillHex, transparency: Math.round((1 - fillAlpha) * 100) },
      roundness: parseFloat(cs.borderRadius) || 0
    });
  });

  // ---- highlighter (stabilo): a separate rounded box BEHIND each marked word, so it
  //      stays an independently editable rectangle in PowerPoint. One box per visual
  //      line fragment (a mark that wraps produces several client rects). Emitted after
  //      the cards so it sits above them and below the text. ----
  stage.querySelectorAll("mark").forEach((mk) => {
    const isDisplay = !!mk.closest(".display, .statement, .section-title");
    const fill = (markHex || (isDisplay ? "F7B400" : "FFD65A")).replace("#", "");
    const mkCs = getComputedStyle(mk);
    const mkRadius = parseFloat(mkCs.borderRadius) || (isDisplay ? 8 : 5);
    const useBand = !mk.closest(".display");
    const padTop = parseFloat(mkCs.paddingTop) || 0;
    const padBottom = parseFloat(mkCs.paddingBottom) || 0;
    const padLeft = parseFloat(mkCs.paddingLeft) || 0;
    const padRight = parseFloat(mkCs.paddingRight) || 0;
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

  return { els, blocks, images };
}
async function renderSlideForPptx(data) {
  window.renderStage(exportStage, data);
  const w = parseInt(exportStage.style.width) || 1080;
  const h = parseInt(exportStage.style.height) || 1350;
  exportStage.parentElement.style.width = w + "px";
  exportStage.parentElement.style.height = h + "px";
  await waitImages(exportStage);
  await document.fonts.ready;
  // Extra frame delay for layout to settle (especially for compare/list cards)
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r))));
  window.refitStage(exportStage); // re-fit with real fonts before measuring
  const markHex = (data.markColor || "").replace("#", "") || null;
  const { els, blocks, images } = collectPptx(exportStage, markHex, data);

  // Single background raster underneath (gradient/photo/texture/pattern + baked
  // pills/logo/footer). All words, cards, badges and images are hidden here and
  // re-emitted above as separate editable objects.
  exportStage.classList.add("pptx-bg");
  const bg = await stageToPng(w, h);
  exportStage.classList.remove("pptx-bg");

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
    try {
      await downloadPptx(specs, "carousel-pastipintar.pptx");
    } catch (e) {
      throw new Error(`Gagal saat menyusun PPTX (PptxGenJS): ${e.stack || e.message}`);
    }
    statusMsg.textContent = "PPTX selesai! Tampilannya sama kayak render, semua teks editable (upload ke Canva / buka di PowerPoint)."; statusMsg.className = "status-msg ok";
  } catch (err) { statusMsg.textContent = "Error PPTX: " + err.message; statusMsg.className = "status-msg error"; console.error(err); }
  finally { downloadPptxBtn.disabled = false; }
});

/* ---------------- Init ---------------- */
(async function init() {
  try {
    const blob = await (await fetch("logo/logo.png")).blob();
    LOGO_DATAURL = await new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(blob); });
  } catch (e) { /* keep url fallback */ }
  renderSlides();
})();
