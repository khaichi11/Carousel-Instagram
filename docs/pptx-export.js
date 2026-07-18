/* Builds an editable .pptx (PptxGenJS). Every element is a real text box / shape /
   table / image — nothing rasterized — so it stays editable in PowerPoint / Canva. */

const IN = (px) => +(px / 96).toFixed(3);
const W = IN(1080), H = IN(1350);
const MX = IN(60);                 // side margin
const CW = W - MX * 2;             // content width

const C = {
  navy: "2F318B", navyDeep: "101138", gold: "F7B400", goldSoft: "FFD65A",
  blue: "008FD7", cream: "FFF6E6", ink: "17183B", inkSoft: "454672", white: "FFFFFF",
  line: "E6E7F3", chipLight: "EEF0FB",
};
const FACE = { display: "Anton", head: "Archivo", body: "Plus Jakarta Sans" };
const displayFace = (slide) => slide.font || FACE.display;
const markCol = (slide) => (slide.markColor ? slide.markColor.replace("#", "") : C.gold);
const markColSoft = (slide) => (slide.markColor ? slide.markColor.replace("#", "") : C.goldSoft);

// "**x**" -> pptx text runs
function runs(text, base, mark) {
  return String(text == null ? "" : text)
    .split(/(\*\*[^*]+\*\*)/g).filter((s) => s !== "")
    .map((p) => {
      const m = p.match(/^\*\*([^*]+)\*\*$/);
      return m ? { text: m[1], options: { ...base, ...mark } } : { text: p, options: base };
    });
}
const EMOJI_RE = /^(\p{Extended_Pictographic}(️)?(‍\p{Extended_Pictographic}(️)?)*)\s*/u;
function splitEmoji(line) {
  const m = line.match(EMOJI_RE);
  return m ? { emoji: m[1], rest: line.slice(m[0].length) } : { emoji: "", rest: line };
}
function itemsArr(s) { return (s || "").split("\n").map((x) => x.trim()).filter(Boolean); }

function textColorFor(theme) { return theme === "light" ? C.ink : C.white; }
function subColorFor(theme) { return theme === "light" ? C.inkSoft : "E7E7F3"; }

function bgFor(slide, s) {
  const theme = slide.theme || "dark";
  if (theme === "photo" && slide.bgImage) {
    s.addImage({ data: slide.bgImage, x: 0, y: 0, w: W, h: H, sizing: { type: "cover", w: W, h: H } });
    s.addShape("rect", { x: 0, y: 0, w: W, h: H, fill: { color: C.navyDeep, transparency: 45 }, line: { type: "none" } });
    return "photo";
  }
  if (theme === "light") { s.background = { color: C.cream }; return "light"; }
  s.background = { color: C.navyDeep };
  // soft brand accents
  s.addShape("ellipse", { x: -IN(180), y: -IN(180), w: IN(760), h: IN(760), fill: { color: C.blue, transparency: 72 }, line: { type: "none" } });
  s.addShape("ellipse", { x: W - IN(520), y: H - IN(520), w: IN(680), h: IN(680), fill: { color: C.gold, transparency: 84 }, line: { type: "none" } });
  return "dark";
}

function addChrome(slide, s, logo) {
  // logo on white rounded chip
  s.addShape("roundRect", { x: MX, y: IN(54), w: IN(150), h: IN(72), rectRadius: 0.16, fill: { color: C.white }, line: { type: "none" }, shadow: { type: "outer", blur: 8, offset: 3, color: "000000", opacity: 0.25 } });
  if (logo) s.addImage({ data: logo, x: MX + IN(16), y: IN(64), w: IN(52), h: IN(52) });

  // topic badge (top-right)
  const topic = (slide.topic || "").trim();
  if (topic) {
    const w = Math.min(IN(520), IN(topic.length * 16 + 70));
    s.addText(topic, { x: W - MX - w, y: IN(54), w, h: IN(56), align: "center", valign: "middle",
      fontFace: FACE.head, bold: true, fontSize: 15, color: C.navyDeep,
      fill: { color: C.gold }, rectRadius: 0.28, shape: "roundRect", line: { type: "none" } });
  }

  // footer handles
  const parts = [];
  if (slide.igHandle) parts.push("IG  " + slide.igHandle);
  if (slide.website) parts.push("🌐  " + slide.website);
  if (parts.length) {
    s.addText(parts.join("      "), { x: MX, y: H - IN(84), w: CW, h: IN(40), align: "left", valign: "middle",
      fontFace: FACE.body, bold: true, fontSize: 13, color: slide.theme === "light" ? C.navy : C.white });
  }
}

// vertical stacker for cover/highlight/cta
function estLines(text, cpl) { return String(text || "").split("\n").reduce((a, l) => a + Math.max(1, Math.ceil(l.length / cpl)), 0); }

function addTextLayout(slide, s, kind) {
  const theme = slide.theme || (kind === "highlight" ? "light" : "dark");
  const isDisplay = kind !== "highlight";
  const titleFace = isDisplay ? displayFace(slide) : FACE.head;
  const titleSize = isDisplay ? (kind === "cta" ? 34 : 36) : 27;
  const titleColor = slide.textColor ? slide.textColor.replace("#", "") : (theme === "light" ? (isDisplay ? C.navy : C.ink) : C.white);
  const markOpts = isDisplay ? { highlight: markCol(slide), color: C.navyDeep } : { highlight: markColSoft(slide), color: theme === "light" ? C.ink : C.navyDeep };

  const items = [];
  if (slide.eyebrow) items.push({ h: IN(58), kind: "eyebrow" });
  const tLines = estLines(slide.title, isDisplay ? 20 : 26);
  if (slide.title) items.push({ h: (isDisplay ? IN(84) : IN(58)) * tLines + IN(10), kind: "title" });
  if (slide.subtitle) items.push({ h: IN(40) * estLines(slide.subtitle, 52) + IN(16), kind: "sub" });
  if (slide.button) items.push({ h: IN(74), kind: "btn" });

  const gap = IN(14);
  const total = items.reduce((a, it) => a + it.h, 0) + gap * Math.max(0, items.length - 1);
  const top = IN(150), bottom = H - IN(120);
  const align = slide.align || (kind === "cover" ? "bottom" : "center");
  let y = align === "top" ? top : align === "bottom" ? bottom - total : (top + bottom) / 2 - total / 2;
  y = Math.max(top, y);

  for (const it of items) {
    if (it.kind === "eyebrow") {
      const w = Math.min(CW, IN(slide.eyebrow.length * 15 + 60));
      s.addText(slide.eyebrow.toUpperCase(), { x: MX, y, w, h: IN(48), align: "center", valign: "middle",
        fontFace: FACE.head, bold: true, fontSize: 14, color: theme === "light" ? C.white : C.navyDeep,
        fill: { color: theme === "light" ? C.navy : C.gold }, rectRadius: 0.2, shape: "roundRect", line: { type: "none" } });
    } else if (it.kind === "title") {
      s.addText(runs(slide.title, { fontFace: titleFace, bold: !isDisplay, color: titleColor, fontSize: titleSize }, markOpts),
        { x: MX, y, w: CW, h: it.h, align: "left", valign: "top", lineSpacingMultiple: isDisplay ? 1.02 : 1.12, charSpacing: isDisplay ? -0.5 : 0 });
    } else if (it.kind === "sub") {
      s.addText(runs(slide.subtitle, { fontFace: FACE.body, color: subColorFor(theme), fontSize: 15 }, { highlight: C.goldSoft, color: C.ink }),
        { x: MX, y, w: CW, h: it.h, align: "left", valign: "top", lineSpacingMultiple: 1.25 });
    } else if (it.kind === "btn") {
      const w = Math.min(CW, IN(slide.button.length * 17 + 80));
      s.addText(slide.button, { x: MX, y, w, h: IN(60), align: "center", valign: "middle",
        fontFace: FACE.head, bold: true, fontSize: 17, color: C.navyDeep, fill: { color: C.gold }, rectRadius: 0.2, shape: "roundRect", line: { type: "none" } });
    }
    y += it.h + gap;
  }
}

function addList(slide, s) {
  const theme = slide.theme || "dark";
  if (slide.title) {
    s.addText(slide.title.toUpperCase(), { x: MX, y: IN(150), w: CW, h: IN(150), align: "left", valign: "top",
      fontFace: displayFace(slide), fontSize: 28, color: theme === "light" ? C.navy : C.white, lineSpacingMultiple: 1.02 });
  }
  const items = itemsArr(slide.items);
  const cardY = IN(320), cardH = H - IN(120) - cardY;
  s.addShape("roundRect", { x: MX, y: cardY, w: CW, h: cardH, rectRadius: 0.06, fill: { color: C.white }, line: { color: C.line, width: 1 }, shadow: { type: "outer", blur: 14, offset: 6, color: "1B1C40", opacity: 0.18 } });

  const rowH = Math.min(IN(150), (cardH - IN(24)) / Math.max(1, items.length));
  items.forEach((line, i) => {
    const y = cardY + IN(12) + i * rowH;
    const { emoji, rest } = splitEmoji(line);
    // icon chip
    const icX = MX + IN(24), icY = y + rowH / 2 - IN(34);
    s.addShape("roundRect", { x: icX, y: icY, w: IN(68), h: IN(68), rectRadius: 0.24, fill: { color: emoji ? C.navy : C.gold }, line: { type: "none" } });
    s.addText(emoji || String(i + 1), { x: icX, y: icY, w: IN(68), h: IN(68), align: "center", valign: "middle", fontFace: FACE.head, bold: true, fontSize: 20, color: emoji ? C.white : C.navyDeep });
    // text (label :: desc)
    const parts = rest.split("::");
    const tx = icX + IN(88), tw = CW - IN(88) - IN(36);
    if (parts.length > 1) {
      s.addText([
        { text: parts[0].trim() + "\n", options: { bold: true, fontSize: 16 } },
        { text: parts.slice(1).join("::").trim(), options: { bold: false, fontSize: 15 } },
      ], { x: tx, y, w: tw, h: rowH, align: "left", valign: "middle", fontFace: FACE.body, color: C.ink, lineSpacingMultiple: 1.1 });
    } else {
      s.addText(runs(rest.trim(), { fontFace: FACE.body, fontSize: 16, color: C.ink }, { highlight: C.goldSoft }),
        { x: tx, y, w: tw, h: rowH, align: "left", valign: "middle", lineSpacingMultiple: 1.1 });
    }
    if (i < items.length - 1) s.addShape("line", { x: tx, y: y + rowH, w: tw, h: 0, line: { color: C.line, width: 1 } });
  });
}

function addTable(slide, s) {
  const theme = slide.theme || "dark";
  if (slide.title) {
    s.addText(slide.title.toUpperCase(), { x: MX, y: IN(150), w: CW, h: IN(150), align: "left", valign: "top",
      fontFace: displayFace(slide), fontSize: 28, color: theme === "light" ? C.navy : C.white, lineSpacingMultiple: 1.02 });
  }
  const items = itemsArr(slide.items);
  const rows = items.map((line, i) => {
    const { emoji, rest } = splitEmoji(line);
    const parts = rest.split(/::|\|/);
    const name = (emoji ? emoji + "  " : "") + (parts[0] || "").trim();
    const val = parts.length > 1 ? parts.slice(1).join(" ").trim() : "";
    const fill = i === 0 ? C.gold : i === 1 ? "D7DCF2" : i === 2 ? "E7DCC4" : C.chipLight;
    return [
      { text: String(i + 1), options: { align: "center", valign: "middle", bold: true, color: C.navyDeep, fill: { color: fill }, fontFace: FACE.head, fontSize: 16 } },
      { text: name, options: { align: "left", valign: "middle", bold: true, color: C.ink, fontFace: FACE.body, fontSize: 15 } },
      { text: val, options: { align: "right", valign: "middle", bold: true, color: C.blue, fontFace: FACE.head, fontSize: 15 } },
    ];
  });
  const tableY = IN(320), tableH = H - IN(120) - tableY;
  s.addShape("roundRect", { x: MX, y: tableY, w: CW, h: tableH, rectRadius: 0.06, fill: { color: C.white }, line: { color: C.line, width: 1 }, shadow: { type: "outer", blur: 14, offset: 6, color: "1B1C40", opacity: 0.18 } });
  s.addTable(rows, { x: MX + IN(20), y: tableY + IN(16), w: CW - IN(40), colW: [IN(70), CW - IN(40) - IN(70) - IN(180), IN(180)],
    rowH: (tableH - IN(32)) / Math.max(1, rows.length), border: { type: "none" }, valign: "middle", autoPage: false });
}

function addMeme(slide, s) {
  const theme = slide.theme || "light";
  const capColor = theme === "light" ? C.ink : C.white;
  if (slide.capTop) s.addText(runs(slide.capTop, { fontFace: FACE.head, bold: true, fontSize: 20, color: capColor }, { highlight: C.goldSoft, color: C.ink }),
    { x: MX, y: IN(180), w: CW, h: IN(80), align: "center", valign: "middle" });
  if (slide.image) {
    s.addShape("roundRect", { x: MX + IN(20), y: IN(300), w: CW - IN(40), h: IN(720), rectRadius: 0.03, fill: { color: C.white }, line: { type: "none" }, shadow: { type: "outer", blur: 16, offset: 8, color: "000000", opacity: 0.4 } });
    s.addImage({ data: slide.image, x: MX + IN(28), y: IN(308), w: CW - IN(56), h: IN(704), sizing: { type: "contain", w: CW - IN(56), h: IN(704) } });
  }
  if (slide.capBottom) s.addText(runs(slide.capBottom, { fontFace: FACE.head, bold: true, fontSize: 20, color: capColor }, { highlight: C.goldSoft, color: C.ink }),
    { x: MX, y: IN(1050), w: CW, h: IN(80), align: "center", valign: "middle" });
}

function addCompare(slide, s) {
  const theme = slide.theme || "dark";
  if (slide.title) s.addText(slide.title.toUpperCase(), { x: MX, y: IN(150), w: CW, h: IN(120), align: "left", valign: "top",
    fontFace: displayFace(slide), fontSize: 25, color: theme === "light" ? C.navy : C.white, lineSpacingMultiple: 1.02 });
  const topY = IN(320), colH = H - IN(120) - topY, gap = IN(24), colW = (CW - gap) / 2;
  [[0, slide.colA, slide.itemsA, "a"], [colW + gap, slide.colB, slide.itemsB, "b"]].forEach(([dx, head, items, side]) => {
    const x = MX + dx;
    s.addShape("roundRect", { x, y: topY, w: colW, h: colH, rectRadius: 0.05, fill: { color: C.white }, line: { color: C.line, width: 1 }, shadow: { type: "outer", blur: 14, offset: 6, color: "1B1C40", opacity: 0.18 } });
    s.addText(head || "", { x, y: topY, w: colW, h: IN(96), align: "center", valign: "middle", fontFace: FACE.head, bold: true, fontSize: 16,
      color: side === "a" ? C.white : C.navyDeep, fill: { color: side === "a" ? "6B6D91" : C.gold }, line: { type: "none" } });
    const arr = itemsArr(items);
    const para = arr.length ? arr.map((line, i) => ({ text: line + (i < arr.length - 1 ? "\n" : ""), options: { breakLine: true, paraSpaceAfter: 8 } })) : [{ text: "" }];
    s.addText(para, { x: x + IN(22), y: topY + IN(112), w: colW - IN(44), h: colH - IN(128), align: "left", valign: "top", fontFace: FACE.body, fontSize: 14, color: C.ink, lineSpacingMultiple: 1.12 });
  });
}

export async function downloadPptx(slides, settings, logoDataUrl, fileName) {
  const Pptx = window.PptxGenJS;
  if (!Pptx) throw new Error("PptxGenJS belum termuat.");
  const pptx = new Pptx();
  pptx.defineLayout({ name: "CAROUSEL", width: W, height: H });
  pptx.layout = "CAROUSEL";

  slides.forEach((slide0, i) => {
    const slide = { ...slide0, index: i + 1, total: slides.length, igHandle: settings.igHandle, website: settings.website };
    const s = pptx.addSlide();
    bgFor(slide, s);
    const type = ["cover", "highlight", "list", "table", "compare", "meme", "cta"].includes(slide.type) ? slide.type : "cover";
    if (type === "list") addList(slide, s);
    else if (type === "table") addTable(slide, s);
    else if (type === "compare") addCompare(slide, s);
    else if (type === "meme") addMeme(slide, s);
    else addTextLayout(slide, s, type);
    addChrome(slide, s, logoDataUrl);
  });

  await pptx.writeFile({ fileName: fileName || "carousel-editable.pptx" });
}
