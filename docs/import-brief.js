/**
 * Parses a "brief" (plain text extracted from PDF/TXT/MD) into slide objects
 * matching the editor schema.
 *
 * Supports two styles, mixable:
 *
 *  A) RECOMMENDED (explicit) — best & most predictable result:
 *
 *     === Slide ===
 *     layout: cover            (cover | highlight | list | table | meme | cta)
 *     theme: photo             (dark | light | photo)
 *     align: bottom            (top | center | bottom)  [optional]
 *     topik: Hook
 *     judul: Jangan pilih jurusan cuma karena **gengsi**
 *     sub: Karena yang menjalani kuliahnya nanti… kamu.
 *     tombol: Baca sampai habis
 *
 *     === Slide ===
 *     layout: list
 *     theme: dark
 *     topik: Realita
 *     judul: Orang lain cuma lihat kulitnya
 *     - 🏫 Nama universitas
 *     - 🎓 Nama jurusan
 *
 *     For "table": each row is `Nama :: Nilai`  (or `Nama | Nilai`).
 *
 *  B) LOOSE — just paste your brief. Each slide starts with a header line
 *     like "Slide 1 — Hook". Layout/theme are auto-detected. Bulleted or
 *     emoji lines become list items; plain lines become title + subtitle.
 */

const VALID_TYPES = ["cover", "highlight", "list", "table", "compare", "meme", "cta"];
const VALID_THEMES = ["dark", "light", "photo"];
const VALID_ALIGNS = ["", "top", "center", "bottom"];

const FIELD_ALIASES = {
  layout: "type", tipe: "type", type: "type",
  theme: "theme", tema: "theme",
  align: "align", posisi: "align",
  topik: "topic", topic: "topic",
  judul: "title", title: "title", hook: "title",
  sub: "subtitle", subtitle: "subtitle", subjudul: "subtitle", body: "subtitle", isi: "subtitle",
  tombol: "button", button: "button", cta: "button",
  captop: "capTop", capatas: "capTop",
  capbottom: "capBottom", capbawah: "capBottom",
  eyebrow: "eyebrow", label: "eyebrow",
  kiri: "colA", left: "colA", kolomkiri: "colA",
  kanan: "colB", right: "colB", kolomkanan: "colB",
};

const BULLET_RE = /^\s*(?:[-•*–—▪●]|\d+[.)])\s+/;
const EMOJI_LEAD_RE = /^\s*(\p{Extended_Pictographic}(️)?(‍\p{Extended_Pictographic}(️)?)*)/u;
const HEADER_RE = /^[ \t]*slide\b[ \t]*\d*\s*(.*)$/i;

function stripBullet(line) {
  return line.replace(BULLET_RE, "").trim();
}
function isBulletLine(line) {
  return BULLET_RE.test(line) || EMOJI_LEAD_RE.test(line);
}
function looksNumeric(s) {
  return /\d/.test(s) && /^\D*[\d.,]+\D*$/.test(s.replace(/\s+/g, " ").trim());
}

function splitChunks(text) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const chunks = [];
  let cur = null;

  const isSeparator = (l) => /^\s*(===+.*===+|-{3,}|\*{3,}|#{1,3}\s*slide)\s*$/i.test(l);

  for (let raw of lines) {
    const line = raw.replace(/\s+$/g, "");
    if (/^\s*\/\//.test(line)) continue; // "//" lines are comments (legend in contoh)
    const headerM = line.match(HEADER_RE);
    const sep = isSeparator(line);

    if (headerM) {
      if (cur) chunks.push(cur);
      // topic = whatever trails "Slide N", minus leading separators
      let topic = (headerM[1] || "").replace(/^[\s—–:|.\-]+/, "").trim();
      cur = { topic, lines: [] };
      continue;
    }
    if (sep) {
      if (cur) chunks.push(cur);
      cur = { topic: "", lines: [] };
      continue;
    }
    if (!cur) cur = { topic: "", lines: [] };
    cur.lines.push(line);
  }
  if (cur) chunks.push(cur);

  // drop empty leading chunk (preamble before first header) if it has no content
  return chunks.filter((c) => c.topic || c.lines.some((l) => l.trim()));
}

function parseChunk(chunk) {
  const fields = {};
  const bullets = [];
  const colBullets = { colA: [], colB: [] };
  const groups = [];      // auto-compare: "Judul kolom:" lines each followed by poin
  const loose = [];
  let afterColon = false; // lines indented under a "…:" line count as bullets
  let curCol = null;      // 'colA' | 'colB' when inside a compare column
  let curGroup = null;

  const pushBullet = (b) => {
    if (curCol) colBullets[curCol].push(b);
    else {
      bullets.push(b);
      if (curGroup) curGroup.items.push(b);
    }
  };

  for (const line of chunk.lines) {
    const t = line.trim();
    if (!t) { loose.push(""); afterColon = false; continue; }

    // explicit "key: value"
    const kv = t.match(/^([a-zA-Z]+)\s*[:=]\s*(.*)$/);
    if (kv && FIELD_ALIASES[kv[1].toLowerCase()]) {
      const key = FIELD_ALIASES[kv[1].toLowerCase()];
      fields[key] = kv[2].trim();
      if (key === "colA") curCol = "colA";
      else if (key === "colB") curCol = "colB";
      else curGroup = null;
      afterColon = true; // header line introduces its column's items
      continue;
    }
    const indented = /^\s+\S/.test(line);
    if (isBulletLine(t) || (afterColon && indented)) {
      pushBullet(stripBullet(t));
      continue;
    }
    // A short line ending with ":" starts a column group — two of these (each with
    // their own poin) turn the slide into an automatic comparison.
    if (/^[^:]{2,60}:$/.test(t)) {
      curGroup = { head: t.replace(/:\s*$/, "").trim(), items: [] };
      groups.push(curGroup);
      loose.push(t);
      afterColon = true;
      continue;
    }
    loose.push(t);
    afterColon = /:\s*$/.test(t); // this line introduces a list
  }

  const looseText = loose.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  const looseLines = loose.filter((l) => l.trim());

  return { fields, bullets, colBullets, groups: groups.filter((g) => g.items.length), loose: looseText, looseLines, topic: chunk.topic };
}

export function parseBrief(text) {
  const chunks = splitChunks(text);
  const n = chunks.length;
  if (n === 0) throw new Error("Nggak nemu slide di file. Pastikan tiap slide diawali baris seperti 'Slide 1 — Judul'.");

  const slides = chunks.map((chunk, i) => {
    const p = parseChunk(chunk);
    const f = p.fields;
    const isFirst = i === 0;
    const isLast = i === n - 1;

    // ---- type ----
    let type = VALID_TYPES.includes((f.type || "").toLowerCase()) ? f.type.toLowerCase() : null;
    if (!type) {
      if ((f.colA || p.colBullets.colA.length) && (f.colB || p.colBullets.colB.length)) {
        type = "compare";
      } else if (p.groups.length >= 2) {
        // two "Judul kolom:" groups with their own poin → automatic comparison
        type = "compare";
      } else if (f.capTop || f.capBottom || /\bmeme\b/i.test(f.topic || p.topic || "")) {
        // caption fields (or "meme" in the topic) → automatic meme slide;
        // the image itself is uploaded in the editor after import
        type = "meme";
      } else if (p.bullets.length >= 2) {
        const valued = p.bullets.filter((b) => /(::|\|)/.test(b));
        const numeric = valued.filter((b) => looksNumeric(b.split(/::|\|/).slice(1).join(" ")));
        type = valued.length >= Math.ceil(p.bullets.length / 2) && numeric.length >= 1 ? "table" : "list";
      } else if (isFirst) type = "cover";
      else if (isLast) type = "cta";
      else type = "highlight";
    }

    // ---- theme ----
    let theme = VALID_THEMES.includes((f.theme || "").toLowerCase()) ? f.theme.toLowerCase() : null;
    if (!theme) {
      if (type === "cover" || type === "cta") theme = "dark";
      else theme = i % 2 === 0 ? "dark" : "light";
    }

    // ---- align ----
    const alignRaw = (f.align || "").toLowerCase();
    const align = VALID_ALIGNS.includes(alignRaw) ? alignRaw : "";

    // ---- text fields ----
    const topic = f.topic || p.topic || "";
    const eyebrow = f.eyebrow || "";
    const button = f.button || "";

    let title = f.title || "";
    let subtitle = f.subtitle || "";
    let items = "";
    let capTop = f.capTop || "";
    let capBottom = f.capBottom || "";
    let colA = f.colA || "", colB = f.colB || "", itemsA = "", itemsB = "";

    if (type === "compare") {
      itemsA = p.colBullets.colA.join("\n") || (p.groups[0] ? p.groups[0].items.join("\n") : "");
      itemsB = p.colBullets.colB.join("\n") || (p.groups[1] ? p.groups[1].items.join("\n") : "");
      if (!colA && p.groups[0]) colA = p.groups[0].head;
      if (!colB && p.groups[1]) colB = p.groups[1].head;
      if (!title) {
        // first loose line that is NOT a column header becomes the slide title
        const heads = new Set(p.groups.map((g) => g.head));
        const cand = p.looseLines.find((l) => !heads.has(l.replace(/:\s*$/, "").trim()));
        if (cand) title = cand;
      }
    } else if (type === "list" || type === "table") {
      items = p.bullets.join("\n");
      if (!title) title = p.looseLines[0] || topic || "";
      // extra loose lines beyond the title are dropped to keep list/table clean
    } else if (type === "meme") {
      capTop = capTop || p.looseLines[0] || "";
      capBottom = capBottom || p.looseLines[1] || "";
    } else {
      // cover / highlight / cta — combine explicit sub + leftover loose + bullets
      const titleFromLoose = !title && p.looseLines.length > 0;
      if (!title) title = p.looseLines[0] || topic || "";
      const restLoose = titleFromLoose ? p.looseLines.slice(1) : p.looseLines;
      const parts = [];
      if (f.subtitle) parts.push(f.subtitle);
      if (restLoose.length) parts.push(restLoose.join("\n"));
      if (p.bullets.length) parts.push(p.bullets.join("\n"));
      subtitle = parts.join("\n").trim();
    }

    return {
      type, theme, align, topic, eyebrow,
      title, subtitle, button, items, capTop, capBottom,
      colA, itemsA, colB, itemsB,
      image: null, bgImage: null,
    };
  });

  return slides;
}
