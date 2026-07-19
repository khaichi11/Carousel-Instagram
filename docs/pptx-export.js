/* Editable, layered PPTX — Canva-first (nothing flattened together):
 *   1. Background raster — gradient/photo/texture/pattern + baked pills/logo/footer.
 *                          A single "background" layer; no words, cards, or images.
 *   2. Editable shapes   — cards/boxes/badges/image-frames as real, movable rects.
 *   3. Editable images   — meme/regular pictures placed at their visible rect.
 *   4. Editable text     — every text block a real text box, fonts named so Canva
 *                          maps them (Anton/Bebas/…); stabilo words keep a run-level
 *                          highlight. So a 10-element slide → 10 editable objects.
 *
 * Input `specs`: [{ bg, els:[...], blocks:[...], images:[...], width, height }]
 * (rendering + measuring happen in app.js). 1 px = 1/96 in; font px -> pt = px*0.75.
 */
const PX = 1 / 96;

export async function downloadPptx(specs, fileName) {
  const Pptx = window.PptxGenJS;
  if (!Pptx) throw new Error("PptxGenJS belum termuat.");
  const pptx = new Pptx();

  const layoutW = (specs[0]?.width || 1080) * PX;
  const layoutH = (specs[0]?.height || 1350) * PX;
  pptx.defineLayout({ name: "CAROUSEL", width: layoutW, height: layoutH });
  pptx.layout = "CAROUSEL";

  specs.forEach((spec) => {
    const s = pptx.addSlide();

    // 1. background raster (no words, no cards, no images)
    s.addImage({ data: spec.bg, x: 0, y: 0, w: layoutW, h: layoutH });

    // 2. editable shapes (cards, table rows, badges, image frames)
    (spec.blocks || []).forEach((blk) => {
      const x = Number(blk.x), y = Number(blk.y), w = Number(blk.w), h = Number(blk.h);
      if (![x, y, w, h].every(Number.isFinite) || w <= 0 || h <= 0) return;
      s.addShape(pptx.ShapeType.rect, {
        x: x * PX, y: y * PX, w: w * PX, h: h * PX,
        fill: blk.fill,
        line: { type: "none" },
        rectRadius: blk.roundness ? Math.min(blk.roundness / w, 0.5) : 0
      });
    });

    // 3. editable images (placed at their visible object-fit rect — full picture, no crop)
    (spec.images || []).forEach((img) => {
      const x = Number(img.x), y = Number(img.y), w = Number(img.w), h = Number(img.h);
      if (!img.src || ![x, y, w, h].every(Number.isFinite) || w <= 0 || h <= 0) return;
      s.addImage({ data: img.src, x: x * PX, y: y * PX, w: w * PX, h: h * PX });
    });

    // 4. editable text boxes (one per text element), with run-level stabilo highlight
    (spec.els || []).forEach((el) => {
      const x = Number(el.x), y = Number(el.y), w = Number(el.w), h = Number(el.h);
      if (![x, y, w, h].every(Number.isFinite) || w <= 0 || h <= 0) return;

      const runs = (el.runs && el.runs.length ? el.runs : [{ text: "" }]).map((r) => {
        const opts = {
          bold: r.bold || el.weight >= 700,
          italic: r.italic || false,
          color: r.mark ? el.markText : el.color,
          breakLine: !!r.br,
        };
        // Highlighter is drawn as a separate editable box behind the text (see
        // collectPptx), so no run-level highlight here — just the readable text colour.
        if (r.fontSize) opts.fontSize = Math.max(6, r.fontSize * 0.75);
        return { text: r.text || "", options: opts };
      });

      const charSpacing = el.charSpacing ? Math.round(el.charSpacing * 0.75 * 100) / 100 : 0;
      const lineSpacingMultiple = Math.min(2.5, Math.max(0.7, el.lineh || 1.15));

      s.addText(runs, {
        x: x * PX, y: y * PX, w: w * PX, h: h * PX,
        fontFace: el.font || "Plus Jakarta Sans",
        fontSize: Math.max(6, el.size * 0.75),
        align: el.align || "left",
        valign: el.valign || "top",
        color: el.color,
        lineSpacingMultiple,
        charSpacing,
        margin: 0, autoFit: false, wrap: true, isTextBox: true,
        paraSpaceBefore: 0, paraSpaceAfter: 0,
      });
    });
  });

  // Collect the font families actually used so we can embed just those.
  const families = new Set();
  specs.forEach((sp) => (sp.els || []).forEach((el) => el.font && families.add(el.font)));
  families.add("Archivo"); families.add("Plus Jakarta Sans"); // badges + body always present

  const name = fileName || "carousel-editable.pptx";
  let blob;
  try { blob = await pptx.write({ outputType: "blob" }); }
  catch (e) { await pptx.writeFile({ fileName: name }); return; } // fallback

  try {
    blob = await embedFonts(blob, families);
  } catch (e) {
    console.warn("Font embedding skipped:", e && e.message); // still ship the editable file
  }
  triggerDownload(blob, name);
}

/* Map each font family to the TTF(s) to embed (regular + optional bold weight). */
const FONT_FILES = {
  "Anton": { regular: "fonts/anton-latin-400-normal.ttf" },
  "Bebas Neue": { regular: "fonts/bebas-neue-latin-400-normal.ttf" },
  "Oswald": { regular: "fonts/oswald-latin-500-normal.ttf", bold: "fonts/oswald-latin-700-normal.ttf" },
  "Archivo": { regular: "fonts/archivo-latin-600-normal.ttf", bold: "fonts/archivo-latin-900-normal.ttf" },
  "Archivo Black": { regular: "fonts/archivo-black-latin-400-normal.ttf" },
  "Montserrat": { regular: "fonts/montserrat-latin-700-normal.ttf", bold: "fonts/montserrat-latin-900-normal.ttf" },
  "Plus Jakarta Sans": { regular: "fonts/plus-jakarta-sans-latin-600-normal.ttf", bold: "fonts/plus-jakarta-sans-latin-800-normal.ttf" },
};

function escapeXml(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
async function fetchBuf(path) { const r = await fetch(path); if (!r.ok) throw new Error("font " + path); return await r.arrayBuffer(); }
function triggerDownload(blob, name) {
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

/* Post-process the generated .pptx (a zip) to embed the fonts so the editable text
 * renders in the REAL fonts (matching the preview, incl. bold) in PowerPoint /
 * LibreOffice / Canva — instead of substituting a fallback face. */
async function embedFonts(blob, families) {
  const JSZip = window.JSZip;
  if (!JSZip) return blob;
  const zip = await JSZip.loadAsync(blob);

  const rels = [], embLst = [];
  let ridN = 900, fileN = 1, any = false;
  for (const fam of families) {
    const map = FONT_FILES[fam];
    if (!map) continue;
    const slots = {};
    for (const kind of ["regular", "bold"]) {
      if (!map[kind]) continue;
      let buf; try { buf = await fetchBuf(map[kind]); } catch (e) { continue; }
      const fname = "font" + (fileN++) + ".fntdata";
      zip.file("ppt/fonts/" + fname, buf);
      const rid = "rIdFnt" + (ridN++);
      rels.push('<Relationship Id="' + rid + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/font" Target="fonts/' + fname + '"/>');
      slots[kind] = rid; any = true;
    }
    if (!slots.regular && !slots.bold) continue;
    let e = '<p:embeddedFont><p:font typeface="' + escapeXml(fam) + '"/>';
    if (slots.regular) e += '<p:regular r:id="' + slots.regular + '"/>';
    if (slots.bold) e += '<p:bold r:id="' + slots.bold + '"/>';
    e += "</p:embeddedFont>";
    embLst.push(e);
  }
  if (!any) return blob;

  // [Content_Types].xml — declare the .fntdata part type
  let ct = await zip.file("[Content_Types].xml").async("string");
  if (ct.indexOf('Extension="fntdata"') < 0) {
    ct = ct.replace("</Types>", '<Default Extension="fntdata" ContentType="application/x-fontdata"/></Types>');
    zip.file("[Content_Types].xml", ct);
  }
  // presentation rels — add the font relationships
  let prels = await zip.file("ppt/_rels/presentation.xml.rels").async("string");
  prels = prels.replace("</Relationships>", rels.join("") + "</Relationships>");
  zip.file("ppt/_rels/presentation.xml.rels", prels);
  // presentation.xml — turn on embedding + add the embeddedFontLst (after notesSz per schema)
  let pres = await zip.file("ppt/presentation.xml").async("string");
  pres = pres.replace(/<p:presentation([^>]*)>/, function (m, attrs) {
    return attrs.indexOf("embedTrueTypeFonts") >= 0 ? m : "<p:presentation" + attrs + ' embedTrueTypeFonts="1">';
  });
  const embXml = "<p:embeddedFontLst>" + embLst.join("") + "</p:embeddedFontLst>";
  if (/<p:notesSz[^>]*\/>/.test(pres)) pres = pres.replace(/(<p:notesSz[^>]*\/>)/, "$1" + embXml);
  else pres = pres.replace("</p:presentation>", embXml + "</p:presentation>");
  zip.file("ppt/presentation.xml", pres);

  return await zip.generateAsync({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation" });
}
