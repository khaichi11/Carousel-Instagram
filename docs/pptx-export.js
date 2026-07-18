/* Pixel-faithful editable PPTX.
 * Each slide = the exact rendered background (gradient/grain/cards/chips/logo — everything
 * except the words) as a full-bleed image, PLUS real editable text boxes placed at the exact
 * pixel positions measured from the DOM, with run-level text highlight for marked words.
 * So it looks very close to the PNG while keeping words editable in PowerPoint / Canva.
 *
 * Input `specs`: [{ bg: dataUrl, els: [...] }]  (measuring happens in app.js).
 * Slide is 1080x1350 px -> 11.25 x 14.0625 in (1 px = 1/96 in, font px -> pt = px * 0.75).
 */
const PX = 1 / 96;
const W = 1080 * PX, H = 1350 * PX;

export async function downloadPptx(specs, fileName) {
  const Pptx = window.PptxGenJS;
  if (!Pptx) throw new Error("PptxGenJS belum termuat.");
  const pptx = new Pptx();
  
  // Set layout based on the first slide's dimensions
  const layoutW = (specs[0]?.width || 1080) * PX;
  const layoutH = (specs[0]?.height || 1350) * PX;
  pptx.defineLayout({ name: "CAROUSEL", width: layoutW, height: layoutH });
  pptx.layout = "CAROUSEL";

  specs.forEach((spec) => {
    const s = pptx.addSlide();

    // exact rendered background (no words, no cards)
    s.addImage({ data: spec.bg, x: 0, y: 0, w: layoutW, h: layoutH });

    // editable shapes (cards, table rows)
    (spec.blocks || []).forEach((blk) => {
      const x = Number(blk.x), y = Number(blk.y), w = Number(blk.w), h = Number(blk.h);
      if (![x, y, w, h].every(Number.isFinite) || w <= 0 || h <= 0) return;
      s.addShape(pptx.ShapeType.rect, {
        x: x * PX, y: y * PX, w: w * PX, h: h * PX,
        fill: blk.fill,
        rectRadius: blk.roundness ? Math.min(blk.roundness / w, 0.5) : 0
      });
    });

    // editable text boxes at measured positions
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
        if (r.mark && el.markFill) {
          opts.highlight = String(el.markFill).replace("#", "");
        }
        // Per-run font size override (for mixed-size text like list lead + body)
        if (r.fontSize) {
          opts.fontSize = Math.max(6, r.fontSize * 0.75);
        }
        // Per-run font family
        if (r.fontFace) {
          opts.fontFace = r.fontFace;
        }
        return {
          text: r.text || "",
          options: opts,
        };
      });

      // Convert letter-spacing: CSS px -> PPTX charSpacing (in points)
      // PptxGenJS charSpacing is in points (1pt = 1.333px)
      const charSpacing = el.charSpacing ? Math.round(el.charSpacing * 0.75 * 100) / 100 : 0;

      // Calculate line spacing - lineSpacingMultiple in PptxGenJS is ratio
      // For very tight lines (display headings), use exact value
      // For normal text, use measured value
      let lineSpacingMultiple = el.lineh || 1.15;
      // Clamp to PptxGenJS acceptable range but wider than before
      lineSpacingMultiple = Math.min(2.5, Math.max(0.7, lineSpacingMultiple));

      s.addText(runs, {
        x: x * PX, y: y * PX, w: w * PX, h: h * PX,
        fontFace: el.font || "Plus Jakarta Sans",
        fontSize: Math.max(6, el.size * 0.75),
        align: el.align || "left",
        valign: el.valign || "top",
        color: el.color,
        lineSpacingMultiple: lineSpacingMultiple,
        charSpacing: charSpacing,
        margin: 0, autoFit: false, wrap: true, isTextBox: true,
        fit: "resize",
        paraSpaceBefore: 0, paraSpaceAfter: 0,
      });
    });
  });

  await pptx.writeFile({ fileName: fileName || "carousel-editable.pptx" });
}
