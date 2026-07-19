/* Procedurally generated, copyright-free textures (paper, fabric, noise, grain).
 * Each texture is a seamlessly tileable "structure field" (0..1). From it we build two
 * variants so a texture is visible on ANY background regardless of theme:
 *   - light: white detail on transparent  → shows on dark backgrounds/images
 *   - dark : black detail on transparent  → shows on light/bright backgrounds/images
 * Alpha comes from the deviation from neutral, so flat areas stay clear. Seeded so
 * every context (each preview iframe + the export stage) builds identical tiles; lazily
 * cached. Exposed as window.CarouselTextures.get(name, tone) -> dataURL ("" for none). */
(function (global) {
  var SIZE = 512; // larger tile => far fewer visible repeats across a slide
  var cache = {};

  function makeRng(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // seamlessly tileable value noise (periodic grid)
  function tileNoise(rng, cells) {
    var grid = new Float32Array(cells * cells);
    for (var i = 0; i < grid.length; i++) grid[i] = rng();
    var g = function (x, y) { return grid[(((y % cells) + cells) % cells) * cells + (((x % cells) + cells) % cells)]; };
    var out = new Float32Array(SIZE * SIZE);
    var cell = SIZE / cells;
    for (var yy = 0; yy < SIZE; yy++) for (var xx = 0; xx < SIZE; xx++) {
      var gx = xx / cell, gy = yy / cell, x0 = Math.floor(gx), y0 = Math.floor(gy);
      var fx = gx - x0, fy = gy - y0, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
      var a = g(x0, y0), b = g(x0 + 1, y0), c = g(x0, y0 + 1), d = g(x0 + 1, y0 + 1);
      var top = a + (b - a) * sx, bot = c + (d - c) * sx;
      out[yy * SIZE + xx] = top + (bot - top) * sy;
    }
    return out;
  }
  function fractal(rng, octaves, baseCells, ridged) {
    var out = new Float32Array(SIZE * SIZE), amp = 1, cells = baseCells, norm = 0;
    for (var o = 0; o < octaves; o++) {
      var n = tileNoise(rng, cells);
      for (var i = 0; i < out.length; i++) {
        var v = n[i];
        if (ridged) v = 1 - Math.abs(v * 2 - 1); // fold-like ridges
        out[i] += v * amp;
      }
      norm += amp; amp *= 0.5; cells *= 2;
    }
    for (var j = 0; j < out.length; j++) out[j] /= norm;
    return out;
  }

  // structure field in 0..1, ~0.5 neutral
  function field(name) {
    var rng = makeRng(seedFor(name));
    var f = new Float32Array(SIZE * SIZE), i, x, y;
    if (name === "noise") {
      var n = fractal(rng, 4, 24, false);
      for (i = 0; i < f.length; i++) f[i] = clamp01(0.5 + (n[i] - 0.5) * 1.15 + (rng() - 0.5) * 0.45);
    } else if (name === "grain") {
      for (i = 0; i < f.length; i++) {
        var v = 0.5 + (rng() - 0.5) * 0.12, r = rng();
        if (r > 0.98) v += 0.45; else if (r < 0.02) v -= 0.4;
        f[i] = clamp01(v);
      }
    } else if (name === "paper") {
      // crumpled paper: broad SOFT tonal creases (low frequency, gentle contrast) with
      // faint fold ridges + a touch of fibre. Kept subtle so repeats aren't obvious.
      var creases = fractal(rng, 5, 3, false);   // large soft wrinkles
      var folds = fractal(rng, 3, 6, true);       // occasional fold lines
      for (i = 0; i < f.length; i++)
        f[i] = clamp01(0.5 + (creases[i] - 0.5) * 0.6 + (folds[i] - 0.6) * 0.28 + (rng() - 0.5) * 0.08);
    } else if (name === "fabric") {
      var weave = fractal(rng, 2, 24, false), tw = 4;
      for (y = 0; y < SIZE; y++) for (x = 0; x < SIZE; x++) {
        var over = ((Math.floor(x / tw) + Math.floor(y / tw)) % 2) === 0;
        var av = Math.sin((x % tw) / tw * Math.PI), ah = Math.sin((y % tw) / tw * Math.PI);
        var thread = over ? av * 1.0 + ah * 0.3 : ah * 1.0 + av * 0.3;
        f[y * SIZE + x] = clamp01(0.5 + (thread - 0.6) * 0.85 + (weave[y * SIZE + x] - 0.5) * 0.3);
      }
    } else return null;
    return f;
  }

  function build(name, tone) {
    var f = field(name);
    if (!f) return "";
    var strength = STRENGTH[name] || 1.6;
    var dark = tone === "dark";
    var c = document.createElement("canvas"); c.width = c.height = SIZE;
    var ctx = c.getContext("2d"), img = ctx.createImageData(SIZE, SIZE), data = img.data;
    for (var i = 0; i < f.length; i++) {
      var a = Math.abs(f[i] - 0.5) * 2 * strength; // deviation from neutral -> opacity
      a = a > 1 ? 1 : a;
      var o = i * 4, col = dark ? 0 : 255;
      data[o] = data[o + 1] = data[o + 2] = col;
      data[o + 3] = Math.round(a * 255);
    }
    ctx.putImageData(img, 0, 0);
    return c.toDataURL("image/png");
  }

  var STRENGTH = { noise: 1.3, grain: 1.7, paper: 1.15, fabric: 1.4 };
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function seedFor(name) { var s = 0; for (var i = 0; i < name.length; i++) s = (s * 131 + name.charCodeAt(i)) >>> 0; return s || 1; }

  global.CarouselTextures = {
    get: function (name, tone) {
      if (!name || name === "none" || name === "default") return "";
      tone = tone === "dark" ? "dark" : "light";
      var key = name + ":" + tone;
      if (!(key in cache)) { try { cache[key] = build(name, tone); } catch (e) { cache[key] = ""; } }
      return cache[key];
    }
  };
})(window);
