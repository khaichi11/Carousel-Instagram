/* Pixel-faithful editable PPTX.
 * Each slide = the exact rendered background (gradient/grain/cards/chips/logo — everything
 * except the words) as a full-bleed image, PLUS real editable text boxes placed at the exact
 * pixel positions measured from the DOM, PLUS highlight rectangles behind highlighted words.
 * So it looks identical to the PNG but every word stays editable in PowerPoint / Canva.
 *
 * Input `specs`: [{ bg: dataUrl, els: [...], marks: [...] }]  (measuring happens in app.js).
 * Slide is 1080x1350 px -> 11.25 x 14.0625 in (1 px = 1/96 in, font px -> pt = px * 0.75).
 */
const PX = 1 / 96;
const W = 1080 * PX, H = 1350 * PX;

export async function downloadPptx(specs, fileName) {
  const Pptx = window.PptxGenJS;
  if (!Pptx) throw new Error("PptxGenJS belum termuat.");
  const pptx = new Pptx();
  pptx.defineLayout({ name: "CAROUSEL", width: W, height: H });
  pptx.layout = "CAROUSEL";

  specs.forEach((spec) => {
    const s = pptx.addSlide();

    // exact rendered background (no words)
    s.addImage({ data: spec.bg, x: 0, y: 0, w: W, h: H });

    // highlight rectangles behind the words
    (spec.marks || []).forEach((m) => {
      s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: m.x * PX, y: m.y * PX, w: m.w * PX, h: m.h * PX,
        rectRadius: Math.max(0.02, (m.radius || 6) * PX),
        fill: { color: m.color }, line: { type: "none" },
      });
    });

    // editable text boxes at measured positions
    (spec.els || []).forEach((el) => {
      const runs = (el.runs && el.runs.length ? el.runs : [{ text: "" }]).map((r) => {
        const opts = {
          bold: r.bold || el.weight >= 700,
          italic: r.italic || false,
          color: r.mark ? el.markText : el.color,
          breakLine: !!r.br,
        };
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
        x: el.x * PX, y: el.y * PX, w: el.w * PX, h: el.h * PX,
        fontFace: el.font || "Plus Jakarta Sans",
        fontSize: Math.max(6, el.size * 0.75),
        align: el.align || "left",
        valign: el.valign || "top",
        color: el.color,
        lineSpacingMultiple: lineSpacingMultiple,
        charSpacing: charSpacing,
        margin: 0, autoFit: false, wrap: true, isTextBox: true,
        paraSpaceBefore: 0, paraSpaceAfter: 0,
      });
    });
  });

  await pptx.writeFile({ fileName: fileName || "carousel-editable.pptx" });
}
