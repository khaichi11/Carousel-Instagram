/* Shared slide renderer. renderStage(stageEl, data) builds a full slide DOM. */
(function (global) {
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function inline(s, withBreaks) {
    var out = esc(s).replace(/\*\*([^*]+)\*\*/g, "<mark>$1</mark>");
    if (withBreaks) out = out.replace(/\n/g, "<br>");
    return out;
  }
  var EMOJI_RE = /^(\p{Extended_Pictographic}(️)?(‍\p{Extended_Pictographic}(️)?)*)\s*/u;
  function splitEmoji(line) {
    var m = line.match(EMOJI_RE);
    if (m) return { emoji: m[1], rest: line.slice(m[0].length) };
    return { emoji: null, rest: line };
  }
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function buildCover(d, wrap) {
    if (d.eyebrow) wrap.appendChild(el("div", "eyebrow", esc(d.eyebrow)));
    if (d.title) wrap.appendChild(el("h1", "display", inline(d.title)));
    if (d.subtitle) wrap.appendChild(el("div", "subtitle", inline(d.subtitle, true)));
    if (d.button) wrap.appendChild(el("div", "pill-btn", esc(d.button)));
  }
  function buildHighlight(d, wrap) {
    if (d.eyebrow) wrap.appendChild(el("div", "eyebrow", esc(d.eyebrow)));
    if (d.title) wrap.appendChild(el("h1", "statement", inline(d.title, true)));
    if (d.subtitle) wrap.appendChild(el("div", "subtitle", inline(d.subtitle, true)));
    if (d.button) wrap.appendChild(el("div", "pill-btn", esc(d.button)));
  }
  function buildList(d, wrap) {
    if (d.title) wrap.appendChild(el("h2", "section-title", inline(d.title)));
    var card = el("div", "card");
    var lines = (d.items || "").split("\n").map(function (x) { return x.trim(); }).filter(Boolean);
    lines.forEach(function (line, i) {
      var row = el("div", "list-row");
      var se = splitEmoji(line);
      var ic = se.emoji ? el("div", "list-ic", se.emoji) : el("div", "list-ic gold", String(i + 1));
      row.appendChild(ic);
      var parts = se.rest.split("::");
      var txt = el("div", "list-txt");
      if (parts.length > 1) txt.innerHTML = '<span class="lead">' + inline(parts[0].trim()) + "</span>" + inline(parts.slice(1).join("::").trim());
      else txt.innerHTML = inline(se.rest.trim());
      row.appendChild(txt);
      card.appendChild(row);
    });
    wrap.appendChild(card);
  }
  function buildTable(d, wrap) {
    if (d.title) wrap.appendChild(el("h2", "section-title", inline(d.title)));
    var card = el("div", "table-card");
    var lines = (d.items || "").split("\n").map(function (x) { return x.trim(); }).filter(Boolean);
    lines.forEach(function (line, i) {
      var row = el("div", "trow");
      row.appendChild(el("span", "rank", String(i + 1)));
      var se = splitEmoji(line);
      if (se.emoji) row.appendChild(el("span", "rlogo", se.emoji));
      var parts = se.rest.split(/::|\|/);
      var name = parts[0] ? parts[0].trim() : "";
      var val = parts.length > 1 ? parts.slice(1).join(" ").trim() : "";
      row.appendChild(el("span", "name", inline(name)));
      if (val) row.appendChild(el("span", "val", esc(val)));
      card.appendChild(row);
    });
    wrap.appendChild(card);
  }
  // Apply the caption typography config (size/weight/font/colour/alignment/line
  // height/letter spacing/margins/padding) as inline styles, so it always wins over
  // the CSS class defaults and is picked up by the PPTX exporter's computed-style
  // read. Falsy/blank fields (color:"" , font:"") are left untouched so the theme's
  // own colour and the CSS class's own font-family still apply — that's what makes
  // "" mean "inherit / theme default" instead of a random fallback.
  function applyCapStyle(node, cs) {
    if (!cs) return;
    if (cs.size) node.style.fontSize = cs.size + "px";
    if (cs.weight) node.style.fontWeight = String(cs.weight);
    if (cs.font) node.style.fontFamily = "'" + cs.font + "', sans-serif";
    if (cs.color) node.style.color = cs.color;
    if (cs.align) node.style.textAlign = cs.align;
    if (cs.lineHeight) node.style.lineHeight = String(cs.lineHeight / 100);
    if (cs.letterSpacing != null) node.style.letterSpacing = cs.letterSpacing + "px";
    if (cs.marginTop != null) node.style.marginTop = cs.marginTop + "px";
    if (cs.marginBottom != null) node.style.marginBottom = cs.marginBottom + "px";
    if (cs.padding != null) node.style.padding = cs.padding + "px";
  }
  function buildMeme(d, wrap) {
    if (d.capTop) { var capT = el("div", "meme-cap top", inline(d.capTop, true)); applyCapStyle(capT, d.capStyle); wrap.appendChild(capT); }
    if (d.image) {
      var frame = el("div", "meme-frame");
      var img = document.createElement("img");
      img.src = d.image;
      img.style.transform = "translate(" + ((d.imgX ?? 50)-50) + "%, " + ((d.imgY ?? 50)-50) + "%) scale(" + ((d.imgZoom||100)/100) + ")";
      frame.appendChild(img);
      wrap.appendChild(frame);
    }
    if (d.capBottom) { var capB = el("div", "meme-cap bottom", inline(d.capBottom, true)); applyCapStyle(capB, d.capStyle); wrap.appendChild(capB); }
  }
  function itemsArr(s) { return (s || "").split("\n").map(function (x) { return x.trim(); }).filter(Boolean); }

  function buildCompare(d, wrap) {
    if (d.title) wrap.appendChild(el("h2", "section-title", inline(d.title)));
    var cmp = el("div", "cmp");
    [["a", d.colA, d.itemsA], ["b", d.colB, d.itemsB]].forEach(function (col) {
      var side = el("div", "cmp-col " + col[0]);
      side.appendChild(el("div", "cmp-head", inline(col[1] || "")));
      var bodyEl = el("div", "cmp-body");
      itemsArr(col[2]).forEach(function (line) {
        var se = splitEmoji(line);
        var item = el("div", "cmp-item");
        if (se.emoji) item.appendChild(el("span", "cmp-ic", se.emoji));
        item.appendChild(el("span", "cmp-tx", inline(se.rest.trim())));
        bodyEl.appendChild(item);
      });
      side.appendChild(bodyEl);
      cmp.appendChild(side);
    });
    wrap.appendChild(cmp);
  }

  function buildCta(d, wrap) {
    if (d.eyebrow) wrap.appendChild(el("div", "eyebrow", esc(d.eyebrow)));
    if (d.title) wrap.appendChild(el("h1", "display", inline(d.title)));
    if (d.subtitle) wrap.appendChild(el("div", "subtitle", inline(d.subtitle, true)));
    if (d.button) wrap.appendChild(el("div", "pill-btn", esc(d.button)));
  }

  // Layout "figure": text beside a transparent-PNG person (kiri/kanan), with
  // scale/pos/rotate/flip/opacity + layer order. Falls back to a silhouette
  // placeholder until the user uploads their own PNG.
  var FIGURE_PLACEHOLDER =
    '<svg class="figure-img fig-ph" viewBox="0 0 220 400" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<circle cx="110" cy="64" r="42" fill="currentColor"/>' +
    '<path d="M110 118c-50 0-78 36-83 86l-7 196h180l-7-196c-5-50-33-86-83-86z" fill="currentColor"/>' +
    '<path d="M158 150l46 52-14 13-40-38z" fill="currentColor"/>' +
    "</svg>";
  function buildFigure(d, wrap) {
    wrap.style.flexDirection = "row";
    wrap.style.flex = "1";
    wrap.classList.add(d.figureSide === "left" ? "side-left" : "side-right");
    var txt = el("div", "fig-text");
    if (d.eyebrow) txt.appendChild(el("div", "eyebrow", esc(d.eyebrow)));
    if (d.title) txt.appendChild(el("h1", "display", inline(d.title, true)));
    if (d.subtitle) txt.appendChild(el("div", "subtitle", inline(d.subtitle, true)));
    if (d.button) txt.appendChild(el("div", "pill-btn", esc(d.button)));
    var col = el("div", "fig-col");
    if (d.figureLayer === "front") col.style.zIndex = "4";
    var sc = (d.figScale || 100) / 100;
    var t = "translate(" + ((d.figX ?? 50) - 50) + "%, " + ((d.figY ?? 50) - 50) + "%) rotate(" + (d.figRotate || 0) + "deg) scale(" + sc * (d.figFlip ? -1 : 1) + ", " + sc + ")";
    var op = (d.figOpacity == null ? 100 : d.figOpacity) / 100;
    var fig;
    if (d.figureImage) {
      fig = document.createElement("img");
      fig.className = "figure-img"; fig.alt = "";
      fig.src = d.figureImage;
    } else {
      col.innerHTML = FIGURE_PLACEHOLDER;
      fig = col.querySelector("svg");
    }
    fig.style.transform = t;
    fig.style.opacity = op;
    if (d.figureImage) col.appendChild(fig);
    if (d.figureSide === "left") { wrap.appendChild(col); wrap.appendChild(txt); }
    else { wrap.appendChild(txt); wrap.appendChild(col); }
  }

  var BUILDERS = { cover: buildCover, highlight: buildHighlight, list: buildList, table: buildTable, compare: buildCompare, meme: buildMeme, cta: buildCta, figure: buildFigure };

  function renderStage(stage, d) {
    d = d || {};
    var type = BUILDERS[d.type] ? d.type : "cover";
    var theme = d.theme || (type === "highlight" ? "light" : "dark");

    stage.className = "stage";
    stage.setAttribute("data-type", type);
    stage.setAttribute("data-theme", theme);
    // customization: pattern (garis), texture, text color, highlight color
    if (d.pattern) stage.setAttribute("data-pattern", d.pattern); else stage.removeAttribute("data-pattern");
    if (d.texture) stage.setAttribute("data-texture", d.texture); else stage.removeAttribute("data-texture");
    stage.style.removeProperty("--mark-color");
    stage.style.removeProperty("--text-color");
    stage.style.removeProperty("--display-font");
    // custom aspect ratio
    var w = 1080, h = 1350;
    if (d.ratio === "1:1") h = 1080;
    else if (d.ratio === "3:4") h = 1440;
    else if (d.ratio === "9:16") h = 1920;
    stage.style.width = w + "px";
    stage.style.height = h + "px";

    // custom font injection
    if (d.customFontUrl && d.font) {
      var linkId = "custom-font-" + d.font.replace(/\s+/g, "-");
      if (!document.getElementById(linkId)) {
        var link = document.createElement("link");
        link.id = linkId; link.rel = "stylesheet"; link.href = d.customFontUrl;
        document.head.appendChild(link);
      }
    }

    if (d.markColor) stage.style.setProperty("--mark-color", d.markColor);
    if (d.textColor) { stage.style.setProperty("--text-color", d.textColor); stage.classList.add("has-text-color"); }
    if (d.titleColor) { stage.style.setProperty("--title-color", d.titleColor); stage.classList.add("has-title-color"); }
    if (d.font) stage.style.setProperty("--display-font", "'" + d.font + "'");
    stage.innerHTML =
      '<div class="bg-photo"></div><div class="bg-gradient"></div><div class="bg-pattern"></div>' +
      '<div class="scrim"></div><div class="grain"></div>' +
      '<div class="stage-top"><div class="logo-chip"><img alt="logo"></div><div class="counter" style="display:none"></div></div>' +
      '<div class="stage-body"></div>' +
      '<div class="stage-foot"><div class="handles"></div></div>';

    // Background image (global or custom) — shown on ANY theme. Rendered as a real
    // <img> (not a CSS background) so html-to-image captures it reliably on export.
    // Only created when a bg exists (a src-less <img> would break the exporter).
    if (d.bgImage) {
      stage.classList.add("has-bg");
      var photoImg = document.createElement("img");
      photoImg.className = "bg-photo-img"; photoImg.alt = ""; photoImg.src = d.bgImage;
      photoImg.style.objectPosition = (d.bgX ?? 50) + "% " + (d.bgY ?? 50) + "%";
      photoImg.style.transform = "scale(" + ((d.bgZoom || 100) / 100) + ")";
      stage.querySelector(".bg-photo").appendChild(photoImg);
    }

    // Custom background fill (solid / linear / radial), global or per-slide — an
    // inline style so it wins over the theme gradient. A background IMAGE still
    // covers it (has-bg forces the gradient off).
    if (d.bgFill) stage.querySelector(".bg-gradient").style.background = d.bgFill;
    
    var pattern = stage.querySelector(".bg-pattern");
    if (d.pattern) {
      pattern.style.transform = "translate(" + ((d.patternX ?? 50)-50) + "%, " + ((d.patternY ?? 50)-50) + "%) scale(" + ((d.patternScale||100)/100) + ")";
    }
    var grain = stage.querySelector(".grain");
    // Procedurally generated textures (paper/fabric/noise/grain) — a tileable grayscale
    // tile blended over the slide. Falls back to the CSS grain for the default texture.
    if (d.texture) stage.setAttribute("data-texture-tone", d.textureTone === "dark" ? "dark" : "light");
    var texUrl = (global.CarouselTextures && d.texture) ? global.CarouselTextures.get(d.texture, d.textureTone) : "";
    if (texUrl) {
      grain.style.backgroundImage = "url('" + texUrl + "')";
      grain.style.backgroundRepeat = "repeat";
      grain.style.backgroundSize = Math.round(512 * ((d.textureScale || 100) / 100)) + "px";
      grain.style.backgroundPosition = (d.textureX ?? 50) + "% " + (d.textureY ?? 50) + "%";
      if (d.textureOpacity != null) grain.style.opacity = Math.max(0, Math.min(100, d.textureOpacity)) / 100;
    } else if (d.texture) {
      grain.style.transform = "translate(" + ((d.textureX ?? 50)-50) + "%, " + ((d.textureY ?? 50)-50) + "%) scale(" + ((d.textureScale||100)/100) + ")";
    }

    stage.querySelector(".logo-chip img").src = d.logo || "";
    var counter = stage.querySelector(".counter");
    var topic = (d.topic || "").trim();
    if (topic) { counter.textContent = topic; counter.style.display = "block"; }

    var body = stage.querySelector(".stage-body");
    var align = d.align || (type === "cover" ? "bottom" : (type === "list" || type === "table" || type === "compare") ? "top" : "center");
    body.style.justifyContent = align === "top" ? "flex-start" : align === "bottom" ? "flex-end" : "center";

    var wrap = el("div", "l-" + type);
    wrap.style.display = "flex";
    wrap.style.flexDirection = "column";
    wrap.style.width = "100%";
    if (type === "compare" || type === "figure") { wrap.style.flex = "1"; body.style.justifyContent = "stretch"; }
    var usesCard = !!d.bgImage && (type === "cover" || type === "highlight" || type === "cta");
    if (usesCard) wrap.classList.add("text-card");
    BUILDERS[type](d, wrap);
    
    // Regular image (layouts other than meme): image inside the slide + optional caption below.
    if (type !== "meme" && d.image) {
      var imgFrame = el("div", "meme-frame");
      imgFrame.style.marginTop = "24px";
      var iImg = document.createElement("img");
      iImg.src = d.image;
      iImg.style.transform = "translate(" + ((d.imgX ?? 50)-50) + "%, " + ((d.imgY ?? 50)-50) + "%) scale(" + ((d.imgZoom||100)/100) + ")";
      imgFrame.appendChild(iImg);
      wrap.appendChild(imgFrame);
      if (d.imageCaption) { var iCap = el("div", "img-caption", inline(d.imageCaption, true)); applyCapStyle(iCap, d.capStyle); wrap.appendChild(iCap); }
    }

    body.appendChild(wrap);
    // Remember alignment so refits (after fonts load, on export) keep the same anchor.
    stage.setAttribute("data-fit-align", align);

    // Handle text sits in its own .ht span so the PPTX export can grab it separately
    // from the .ic chip (otherwise "IG"/"@" got duplicated into the handle text box).
    // The IG chip shows the Instagram camera glyph (simple outline shapes, freely
    // reproducible) instead of the letters "IG"; the "@" chip is optically centred.
    var IG_ICON =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<rect x="2.6" y="2.6" width="18.8" height="18.8" rx="5"/><circle cx="12" cy="12" r="4.5"/>' +
      '<circle cx="17.2" cy="6.8" r="1.3" fill="currentColor" stroke="none"/></svg>';
    var handles = stage.querySelector(".handles");
    if (d.igHandle) handles.appendChild(el("span", "h", '<span class="ic ic-ig">' + IG_ICON + '</span><span class="ht">' + esc(d.igHandle) + "</span>"));
    if (d.website) handles.appendChild(el("span", "h", '<span class="ic ic-at">@</span><span class="ht">' + esc(d.website) + "</span>"));

    fitStage(stage);
  }

  // Fit-to-box safeguard: if the body content is taller than the available space
  // (e.g. lots of text on the short 1:1 ratio), scale it down to fit instead of
  // clipping it off-canvas. A no-op when content already fits, so it never alters
  // layouts that were fine. Re-runnable (resets its own transform first).
  function fitStage(stage) {
    var body = stage.querySelector(".stage-body");
    if (!body) return;
    var wrap = body.firstElementChild;
    if (!wrap) return;
    wrap.style.transform = "";
    // Equal-height compare headers: when one title wraps to two lines, stretch the
    // other to match so the yellow and grey header fields share the same dimension.
    var heads = stage.querySelectorAll(".cmp-head");
    if (heads.length > 1) {
      var maxH = 0, i;
      for (i = 0; i < heads.length; i++) heads[i].style.minHeight = "";
      for (i = 0; i < heads.length; i++) maxH = Math.max(maxH, heads[i].getBoundingClientRect().height);
      for (i = 0; i < heads.length; i++) heads[i].style.minHeight = maxH + "px";
    }
    var avail = body.clientHeight;
    var need = wrap.scrollHeight;
    if (avail > 0 && need > avail + 1) {
      var k = Math.max(0.5, avail / need);
      var align = stage.getAttribute("data-fit-align") || "center";
      wrap.style.transformOrigin = align === "top" ? "top center" : align === "bottom" ? "bottom center" : "center center";
      wrap.style.transform = "scale(" + k + ")";
    }
  }

  global.renderStage = renderStage;
  global.refitStage = fitStage;
})(window);
