/* Instagram Story renderer — renderStory(rootEl, data) builds a full 1080x1920 story.
 *
 * Same shape as stage.js (plain global, no modules) so the PNG exporter can rasterize
 * it with the very same html-to-image pipeline. Every decorative element (sparkles,
 * arrow, clock, link chip, IG glyph) is hand-drawn inline SVG built from primitive
 * strokes — nothing is copied from a third-party icon set, so the output stays free
 * of licensing strings. Fonts come from the bundled OFL set already in fonts.css. */
(function (global) {
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  /* Two highlight syntaxes, both carried over from how the carousel brief already
   * marks emphasis, so a user only learns one convention:
   *   **kata**  -> accent-coloured word (the yellow words in the reference)
   *   ==kata==  -> accent-FILLED block (the yellow box behind "1 SAMPAI") */
  function inline(s) {
    return esc(s)
      .replace(/==([^=]+)==/g, '<span class="st-hl">$1</span>')
      .replace(/\*\*([^*]+)\*\*/g, '<span class="st-acc">$1</span>')
      .replace(/\n/g, "<br>");
  }
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  /* ---------- Inline SVG art (all original, drawn from plain strokes) ---------- */
  function svg24(body, extra) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"' +
      (extra || "") + ">" + body + "</svg>";
  }
  /* Sub-headline icon set. Which one is used is decided from the carousel's own words
   * (see storyIconFor in app.js) — a clock only when the post is actually about time. */
  var SUB_ICONS = {
    clock: svg24('<circle cx="12" cy="12" r="9"/><path d="M12 7v5.2l3.4 2"/>'),
    bulb: svg24('<path d="M9.1 17.4a6.1 6.1 0 1 1 5.8 0"/><path d="M9.7 17.6h4.6"/><path d="M10.5 20.6h3"/>'),
    list: svg24('<path d="M9.4 6.6h10.8M9.4 12h10.8M9.4 17.4h10.8"/>' +
      '<circle cx="4.8" cy="6.6" r="1.5" fill="currentColor" stroke="none"/>' +
      '<circle cx="4.8" cy="12" r="1.5" fill="currentColor" stroke="none"/>' +
      '<circle cx="4.8" cy="17.4" r="1.5" fill="currentColor" stroke="none"/>'),
    alert: svg24('<path d="M12 3.8L21.2 19.8H2.8z"/><path d="M12 9.6v4.4"/>' +
      '<circle cx="12" cy="17" r="1.15" fill="currentColor" stroke="none"/>'),
    target: svg24('<circle cx="12" cy="12" r="8.6"/><circle cx="12" cy="12" r="4.4"/>' +
      '<circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none"/>'),
    chart: svg24('<path d="M3.6 20h16.8"/><path d="M7.4 20v-6.4M12 20V5.8M16.6 20v-9.6"/>'),
    book: svg24('<path d="M3.4 5.4c2.8-1.2 5.6-1.2 8.6 0v13.4c-3-1.2-5.8-1.2-8.6 0z"/>' +
      '<path d="M12 5.4c3-1.2 5.8-1.2 8.6 0v13.4c-2.8-1.2-5.6-1.2-8.6 0z"/>'),
    tap: svg24('<path d="M9 11V5.6a2 2 0 1 1 4 0V11"/><path d="M13 11V9.4a1.9 1.9 0 0 1 3.8 0V11"/>' +
      '<path d="M16.8 11.4a1.9 1.9 0 0 1 3.7 0v3.4c0 3.8-2.8 6.6-6.6 6.6h-1.3c-2.4 0-3.8-1-5-2.9l-2.4-3.8a1.9 1.9 0 0 1 3-2.3l1.8 2"/>'),
    link: svg24('<path d="M10 13.6a3.6 3.6 0 0 0 5.3.4l2.8-2.8a3.7 3.7 0 0 0-5.2-5.2l-1.6 1.6"/>' +
      '<path d="M14 10.4a3.6 3.6 0 0 0-5.3-.4l-2.8 2.8a3.7 3.7 0 0 0 5.2 5.2l1.6-1.6"/>'),
    spark: svg24('<path d="M12 3.2l2.1 5.4 5.4 2.1-5.4 2.1L12 18.2l-2.1-5.4L4.5 10.7l5.4-2.1z"/>'),
  };
  var SVG_LINK = SUB_ICONS.link;
  var SVG_IG = svg24('<rect x="2.6" y="2.6" width="18.8" height="18.8" rx="5"/><circle cx="12" cy="12" r="4.5"/>' +
    '<circle cx="17.2" cy="6.8" r="1.3" fill="currentColor" stroke="none"/>');
  var SVG_WEB = svg24('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9S14.5 18.5 12 21"/>' +
    '<path d="M12 3C9.5 5.5 8.2 8.5 8.2 12S9.5 18.5 12 21"/>');
  /* CTA arrow: an upright shaft that bows slightly left, curves right at the foot into
   * a short tail, and finishes in a two-barb head aimed up at the post card. Drawn from
   * scratch as two cubic segments plus the barbs — no traced or imported artwork. */
  var SVG_ARROW =
    '<svg viewBox="0 0 64 80" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M62 74C46 78 29 74 22 61 16 50 15 30 21 4"/>' +
    '<path d="M21 4L1 22"/><path d="M21 4L30 25"/></svg>';

  /* Sparkle mark — ALWAYS three radiating dashes ("garis 3"). There is deliberately no
   * two-dash variant: a pair reads as a stray mark rather than an intentional accent.
   * The three rays fan upward out of a common origin at the bottom of the box, so
   * rotating the whole mark aims that fan at whatever it is decorating. */
  function sparkSvg() {
    return '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round">' +
      '<path d="M20 3v12"/><path d="M6 11l7.5 8.5"/><path d="M34 11l-7.5 8.5"/></svg>';
  }
  function spark(o) {
    var n = el("div", "st-spark" + (o.acc ? " acc" : ""), sparkSvg());
    n.style.width = n.style.height = o.size + "px";
    n.style.left = o.x + "px";
    n.style.top = o.y + "px";
    n.style.transform = "rotate(" + (o.rot || 0) + "deg)";
    n.setAttribute("data-auto", "1");
    return n;
  }

  function localRect(root, node) {
    var rootRect = root.getBoundingClientRect();
    var rect = node.getBoundingClientRect();
    var scale = rootRect.width / 1080 || 1;
    return { x: (rect.left - rootRect.left) / scale, y: (rect.top - rootRect.top) / scale, w: rect.width / scale, h: rect.height / scale };
  }

  /* Decorative marks are stored as Story-canvas coordinates so the debug panel can
   * tune their exact placement and have the preview and exported PNG match. */
  function placeSparks(root) {
    [].forEach.call(root.querySelectorAll(".st-spark[data-auto]"), function (n) { n.remove(); });
    var d = root.__storyData || {};
    if (d.sparkles === false) return;
    var add = function (acc, size, x, y, rot) {
      root.appendChild(spark({
        acc: acc, size: size, rot: rot,
        x: Math.max(12, Math.min(1080 - size - 12, x)),
        y: Math.max(12, Math.min(1920 - size - 12, y)),
      }));
    };

    var badgeManual = d.sparkManual || d.sparkBadgeManual;
    var linkManual = d.sparkManual || d.sparkLinkManual;
    if (badgeManual) {
      add(true, d.sparkBadgeSize || 86, d.sparkBadgeX == null ? 344 : d.sparkBadgeX, d.sparkBadgeY == null ? 118 : d.sparkBadgeY, d.sparkBadgeRotate == null ? -34 : d.sparkBadgeRotate);
    } else {
      var badge = root.querySelector(".st-badge");
      if (badge) {
        var b = localRect(root, badge);
        add(true, 62, b.x - 76, b.y - 42, -34);
      }
    }
    if (linkManual) {
      // A handle adds one footer row, so keep the manually tuned link mark beside
      // the CTA instead of leaving it beneath the new footer content.
      var handleOffset = d.igHandle ? 60 : 0;
      add(true, d.sparkLinkSize || 85, d.sparkLinkX == null ? 937 : d.sparkLinkX, (d.sparkLinkY == null ? 1755 : d.sparkLinkY) - handleOffset, d.sparkLinkRotate == null ? 61 : d.sparkLinkRotate);
    } else {
      var link = root.querySelector(".st-linkchip");
      if (link) {
        var l = localRect(root, link);
        add(true, 58, l.x + l.w + 12, l.y - 34, 24);
      }
    }
  }

  /* ---------- Background: the post image again, blurred ---------- */
  function buildBg(d, root) {
    var bg = el("div", "st-bg");
    var src = d.bgImage || d.postImage;
    if (src) {
      var img = document.createElement("img");
      img.className = "st-bg-img";
      img.src = src;
      // Blur samples transparent pixels past the edge, which shows up as a pale
      // halo, so the image is always scaled past 100% by at least the blur radius.
      var zoom = (d.bgZoom == null ? 115 : d.bgZoom) / 100;
      var blur = d.blur == null ? 30 : d.blur;
      zoom = Math.max(zoom, 1 + blur / 260);
      img.style.filter =
        "blur(" + blur + "px) saturate(" + (d.bgSaturate == null ? 105 : d.bgSaturate) + "%)";
      img.style.transform =
        "translate(" + ((d.bgX == null ? 50 : d.bgX) - 50) + "%, " +
        ((d.bgY == null ? 50 : d.bgY) - 50) + "%) scale(" + zoom + ")";
      bg.appendChild(img);
    } else {
      bg.style.background = "linear-gradient(155deg,#2F318B,#101138)";
    }
    root.appendChild(bg);

    var scrim = el("div", "st-scrim");
    var dark = (d.darken == null ? 55 : d.darken) / 100;
    // Slightly heavier at the very top and bottom, where the badge/CTA text sits.
    scrim.style.background =
      "linear-gradient(180deg, rgba(0,0,0," + Math.min(1, dark + 0.18).toFixed(3) + ") 0%, rgba(0,0,0," +
      dark.toFixed(3) + ") 34%, rgba(0,0,0," + dark.toFixed(3) + ") 62%, rgba(0,0,0," +
      Math.min(1, dark + 0.2).toFixed(3) + ") 100%)";
    root.appendChild(scrim);

    if (d.vignette !== false) root.appendChild(el("div", "st-vignette"));
    if (d.grain !== false) root.appendChild(el("div", "st-grain"));
  }

  function applyDebugTransform(node, d, prefix, base) {
    var x = Number(d[prefix + "X"] || 0);
    var y = Number(d[prefix + "Y"] || 0);
    var scale = Number(d[prefix + "Scale"] == null ? 100 : d[prefix + "Scale"]) / 100;
    var rotate = Number(d[prefix + "Rotate"] || 0);
    node.style.transformOrigin = "center center";
    node.style.transform = (base ? base + " " : "") +
      "translate(" + x + "px, " + y + "px) rotate(" + rotate + "deg) scale(" + scale + ")";
  }

  function renderStory(root, d) {
    d = d || {};
    root.className = "story";
    root.innerHTML = "";
    root.style.setProperty("--acc", d.accent || "#F7B400");
    root.style.setProperty("--acc-ink", d.accentInk || "#101138");
    root.style.setProperty("--st-font", '"' + (d.font || "Anton") + '", Impact, sans-serif');
    root.style.color = d.textColor || "#ffffff";
    root.style.setProperty("--st-title-right-clearance", "0px");

    buildBg(d, root);
    root.__storyData = d; // placeSparks() reads the flags back on its post-layout pass

    var inner = el("div", "st-inner");

    /* Brand row */
    if (d.showLogo !== false || d.brandName) {
      var brand = el("div", "st-brand");
      if (d.showLogo !== false && d.logo) {
        var lg = document.createElement("img");
        lg.className = "st-logo"; lg.src = d.logo;
        lg.style.height = (d.debugLogoHeight == null ? 96 : d.debugLogoHeight) + "px";
        brand.appendChild(lg);
      }
      if (d.brandName) {
        var brandName = el("span", "st-brandname", esc(d.brandName));
        brandName.style.fontFamily = '"' + (d.debugBrandFont || "Plus Jakarta Sans") + '", sans-serif';
        brandName.style.fontSize = (d.debugBrandNameSize == null ? 44 : d.debugBrandNameSize) + "px";
        brand.appendChild(brandName);
      }
      applyDebugTransform(brand, d, "debugBrand");
      inner.appendChild(brand);
    }

    /* "POST BARU!" badge */
    if (d.badge) {
      var brow = el("div", "st-badge-row");
      var badge = el("div", "st-badge", esc(d.badge));
      applyDebugTransform(badge, d, "debugBadge", "rotate(" + (d.badgeTilt || 0) + "deg)");
      brow.appendChild(badge);
      inner.appendChild(brow);
    }

    /* Headline. Its sparkles are added later by placeSparks(), which measures where
       the words actually landed. */
    if (d.title) {
      var h = el("h1", "st-title", inline(d.title));
      h.style.fontSize = (d.titleSize || 82) + "px";
      applyDebugTransform(h, d, "debugTitle");
      inner.appendChild(h);
    }

    /* Sub-line with its little circled icon */
    if (d.subtitle) {
      var sub = el("div", "st-sub");
      if (d.subIcon !== "none") {
        sub.appendChild(el("span", "st-sub-ic", SUB_ICONS[d.subIcon] || SUB_ICONS.tap));
      }
      var st = el("span", "st-sub-tx", inline(d.subtitle));
      st.style.fontSize = (d.subSize || 32) + "px";
      sub.appendChild(st);
      applyDebugTransform(sub, d, "debugSub");
      inner.appendChild(sub);
    }

    /* Keep the card slot in the layout; only its generated post image is optional. */
    var card = el("div", "st-card" + (d.cardFrame === false ? " bare" : ""));
    applyDebugTransform(card, d, "debugCard", "rotate(" + (d.cardRotate || 0) + "deg) scale(" + ((d.cardScale || 100) / 100) + ")");
    if (d.showPost === true && d.postImage) {
      var pi = document.createElement("img");
      pi.className = "st-card-img"; pi.src = d.postImage;
      card.appendChild(pi);
    }
    inner.appendChild(card);

    /* Footer CTA: hooked arrow + two-line call to action + link chip */
    var cta = el("div", "st-cta");
    if (d.showArrow !== false) cta.appendChild(el("div", "st-arrow", SVG_ARROW));
    var tx = el("div", "st-cta-tx");
    if (d.ctaTop) tx.appendChild(el("div", "st-cta-1", inline(d.ctaTop)));
    if (d.ctaBottom) tx.appendChild(el("div", "st-cta-2", '<span class="st-hl">' + esc(d.ctaBottom) + "</span>"));
    cta.appendChild(tx);
    if (d.showLink !== false) {
      var linkChip = el("div", "st-linkchip", SVG_LINK);
      applyDebugTransform(linkChip, d, "debugLink");
      cta.appendChild(linkChip);
    }
    applyDebugTransform(cta, d, "debugCta");
    if (d.ctaTop || d.ctaBottom || d.showArrow !== false) inner.appendChild(cta);

    /* Handles, mirroring the carousel footer */
    if (d.igHandle || d.website) {
      var hs = el("div", "st-handles");
      if (d.igHandle) hs.appendChild(el("span", "st-h", '<span class="st-hic">' + SVG_IG + "</span>" + esc(d.igHandle)));
      if (d.website) hs.appendChild(el("span", "st-h", '<span class="st-hic">' + SVG_WEB + "</span>" + esc(d.website)));
      inner.appendChild(hs);
    }

    root.appendChild(inner);
    fitStory(root);
  }

  /* Same fit-to-box safeguard as the slide stage: long headlines shrink the text
   * block instead of pushing the card off-canvas. The card is the flexible element,
   * so this only kicks in once it has already given up all its slack. */
  function fitStory(root) {
    var inner = root.querySelector(".st-inner");
    if (!inner) return;
    var card = inner.querySelector(".st-card");
    if (!card) {
      placeSparks(root);
      return;
    }
    var avail = inner.clientHeight;
    if (!avail) return;
    var need = 0;
    [].forEach.call(inner.children, function (c) {
      need += c === card ? card.scrollHeight : c.scrollHeight;
      need += parseFloat(getComputedStyle(c).marginTop || 0) + parseFloat(getComputedStyle(c).marginBottom || 0);
    });
    // The gap between rows isn't in scrollHeight; add it back before comparing.
    need += parseFloat(getComputedStyle(inner).rowGap || 0) * Math.max(0, inner.children.length - 1);
    if (need > avail + 1) {
      var k = Math.max(0.6, avail / need);
      inner.style.transformOrigin = "top center";
      inner.style.transform = "scale(" + k + ")";
      inner.style.height = (avail / k) + "px";
    } else {
      inner.style.transform = "";
      inner.style.height = "";
    }
    placeSparks(root); // measure only after the final layout/scale is settled
  }

  global.renderStory = renderStory;
  global.refitStory = fitStory;
})(window);
