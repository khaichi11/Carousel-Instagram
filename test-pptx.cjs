const { JSDOM } = require("jsdom");
const fs = require("fs");

const dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`, { url: "http://localhost/" });
global.window = dom.window;
global.document = window.document;
global.navigator = window.navigator;

const pptxCode = fs.readFileSync("./docs/vendor/pptxgen.bundle.js", "utf8");
dom.window.eval(pptxCode);

const origTrim = String.prototype.trim;
String.prototype.trim = function() {
  // console.log("trim called on:", JSON.stringify(this));
  return origTrim.apply(this);
};

const PptxGenJS = window.PptxGenJS;
const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_16x9";

const s = pptx.addSlide();
s.addShape(pptx.shapes.roundRect, {
    x: 1, y: 1, w: 1, h: 1,
    rectRadius: 0.1,
    fill: { color: "FF0000" }, line: { type: "none" }
});
s.addText([{ text: "hello", options: { color: "FF0000", fontFace: "Arial", fontSize: 12 } }], {
    x: 1, y: 1, w: 1, h: 1,
    fontFace: "Arial", fontSize: 12, color: "000000",
    lineSpacingMultiple: 1.15, charSpacing: 0
});

try {
  pptx.writeFile({ fileName: "test.pptx" }).then(() => console.log("Success")).catch(e => console.error("Promise Error:", e));
} catch (e) {
  console.error("Sync Error:", e);
}
