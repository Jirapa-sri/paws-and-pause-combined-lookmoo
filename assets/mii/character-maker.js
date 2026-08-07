/**
 * Character Maker — sheet-based Mii studio with Canvas recolor.
 * Layers sprites from assets/mii, tints via grayscale→colorize (preserves shading).
 *
 * Usage:
 *   <character-maker></character-maker>
 *   const url = await MiiAvatar.composeToDataURL(config);
 *   MiiAvatar.draw(ctx, config, x, y, scale);
 */
(function (global) {
  "use strict";

  const BASE = new URL("./", document.currentScript?.src || location.href).href;
  const CACHE_BUST = "13";
  const CANVAS_W = 200;
  const CANVAS_H = 260;

  const MOUTH_STYLES = [
    { id: "smile", name: "Smile" },
    { id: "neutral", name: "Line" },
    { id: "open", name: "Open" },
    { id: "smirk", name: "Smirk" },
  ];

  const NOSE_STYLES = [
    { id: "dot", name: "Dot" },
    { id: "button", name: "Button" },
    { id: "line", name: "Line" },
    { id: "tiny", name: "Tiny" },
  ];

  const CAT_META = [
    { id: "skin", label: "Skin", colorKey: "skin", mode: "skinTone" },
    { id: "hair", label: "Hair", colorKey: "hair", mode: "hair", sets: ["hair_m", "hair_f"] },
    { id: "eyes", label: "Eyes", colorKey: "eyes", mode: "eyes" },
    { id: "nose", label: "Nose", colorKey: "nose", mode: "nose" },
    { id: "mouth", label: "Mouth", colorKey: "mouth", mode: "mouth" },
    { id: "tops", label: "Tops", colorKey: "top", mode: "tint", optional: true },
    { id: "outer", label: "Outer", colorKey: "top", mode: "tint", optional: true },
    { id: "bottoms", label: "Bottoms", colorKey: "bottom", mode: "tint", optional: true },
    { id: "dresses", label: "Dress", colorKey: "top", mode: "tint", optional: true },
    { id: "shoes", label: "Shoes", colorKey: "shoes", mode: "tint", optional: true },
  ];

  const DEFAULT_COLORS = {
    skin: "#F3D0B0",
    hair: "#4A2F1A",
    eyes: "#4B2C20",
    nose: "#C48A6A",
    mouth: "#C45A6A",
    top: "#6B9BD1",
    bottom: "#5A6F9A",
    shoes: "#E8E0D5",
  };

  function defaultConfig() {
    return {
      hairSet: "hair_m",
      face: 0, // single shared face shape for all hair
      hair: 0,
      eyes: 0,
      nose: "dot",
      mouth: "smile",
      tops: 0,
      outer: -1,
      bottoms: 0,
      dresses: -1,
      shoes: 0,
      colors: Object.assign({}, DEFAULT_COLORS),
    };
  }

  function drawSimpleMouth(ctx, style, cx, cy, colorHex) {
    const { r, g, b } = hexToRgb(colorHex || "#C45A6A");
    ctx.save();
    ctx.strokeStyle = `rgb(${r},${g},${b})`;
    ctx.fillStyle = `rgb(${Math.max(0, r - 25)},${Math.max(0, g - 35)},${Math.max(0, b - 25)})`;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const id = typeof style === "number" ? (MOUTH_STYLES[style] || MOUTH_STYLES[0]).id : (style || "smile");
    if (id === "neutral") {
      ctx.beginPath(); ctx.moveTo(cx - 6, cy); ctx.lineTo(cx + 6, cy); ctx.stroke();
    } else if (id === "open") {
      ctx.beginPath(); ctx.ellipse(cx, cy + 1, 4.5, 3.5, 0, 0, Math.PI * 2); ctx.fill();
    } else if (id === "smirk") {
      ctx.beginPath(); ctx.moveTo(cx - 6, cy); ctx.quadraticCurveTo(cx + 1, cy + 5, cx + 7, cy - 1); ctx.stroke();
    } else {
      ctx.beginPath(); ctx.moveTo(cx - 7, cy); ctx.quadraticCurveTo(cx, cy + 6, cx + 7, cy); ctx.stroke();
    }
    ctx.restore();
  }

  function drawSimpleNose(ctx, style, cx, cy, colorHex) {
    const { r, g, b } = hexToRgb(colorHex || "#C48A6A");
    ctx.save();
    ctx.strokeStyle = `rgb(${Math.max(0, r - 40)},${Math.max(0, g - 45)},${Math.max(0, b - 40)})`;
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.lineWidth = 1.6;
    ctx.lineCap = "round";
    const id = typeof style === "number" ? (NOSE_STYLES[style] || NOSE_STYLES[0]).id : (style || "dot");
    if (id === "button") {
      ctx.beginPath(); ctx.ellipse(cx, cy, 3.2, 2.4, 0, 0, Math.PI * 2); ctx.fill();
    } else if (id === "line") {
      ctx.beginPath(); ctx.moveTo(cx, cy - 3); ctx.lineTo(cx, cy + 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy + 2); ctx.quadraticCurveTo(cx + 3, cy + 3, cx + 4, cy + 1); ctx.stroke();
    } else if (id === "tiny") {
      ctx.beginPath(); ctx.arc(cx, cy, 1.2, 0, Math.PI * 2); ctx.fill();
    } else {
      // soft dual-dot nose
      ctx.globalAlpha = 0.9;
      ctx.beginPath(); ctx.arc(cx - 2.2, cy + 0.5, 1.35, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 2.2, cy + 0.5, 1.35, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  function hexToRgb(hex) {
    const h = String(hex || "#000000").replace("#", "");
    const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h.padEnd(6, "0");
    return {
      r: parseInt(full.slice(0, 2), 16) || 0,
      g: parseInt(full.slice(2, 4), 16) || 0,
      b: parseInt(full.slice(4, 6), 16) || 0,
    };
  }

  function luma(r, g, b) {
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  function isNearWhite(r, g, b, t = 235) {
    return r >= t && g >= t && b >= t;
  }

  function isNearBlack(r, g, b, t = 36) {
    return r <= t && g <= t && b <= t;
  }

  /** Light face fill baked into grayscale hair sprites. */
  function isHairFaceStub(r, g, b) {
    const L = luma(r, g, b);
    // pale face area in hair sheets is very light gray / white
    return L >= 185 && !isNearBlack(r, g, b, 50);
  }

  /**
   * Grayscale → tint (multiply by luma). Preserves shading from the sheet.
   * opts:
   *  - knockoutFace: remove pale face stub from hair layers
   *  - eyeMode: keep white sparkles
   *  - keepOutline: leave near-black lines alone
   */
  function tintImageData(imageData, colorHex, opts = {}) {
    const { r: tr, g: tg, b: tb } = hexToRgb(colorHex);
    const keepWhite = opts.keepWhite !== false;
    const keepOutline = opts.keepOutline !== false;
    const knockoutFace = !!opts.knockoutFace;
    const eyeMode = !!opts.eyeMode;
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const a = data[i + 3];
      if (a < 8) continue;
      let r = data[i], g = data[i + 1], b = data[i + 2];

      if (knockoutFace && isHairFaceStub(r, g, b)) {
        data[i + 3] = 0;
        continue;
      }

      if (keepOutline && isNearBlack(r, g, b, 32)) continue;

      if (eyeMode) {
        if (keepWhite && isNearWhite(r, g, b, 220)) continue;
        if (isNearBlack(r, g, b, 28)) continue;
        const L = luma(r, g, b) / 255;
        data[i] = Math.min(255, Math.round(tr * Math.max(0.15, L) * 1.1));
        data[i + 1] = Math.min(255, Math.round(tg * Math.max(0.15, L) * 1.1));
        data[i + 2] = Math.min(255, Math.round(tb * Math.max(0.15, L) * 1.1));
        continue;
      }

      // Soft highlights stay a bit brighter than flat multiply
      if (keepWhite && isNearWhite(r, g, b, 245)) {
        data[i] = Math.min(255, Math.round(tr * 0.92 + 20));
        data[i + 1] = Math.min(255, Math.round(tg * 0.92 + 20));
        data[i + 2] = Math.min(255, Math.round(tb * 0.92 + 20));
        continue;
      }

      const L = luma(r, g, b) / 255;
      const f = 0.12 + L * 0.95;
      data[i] = Math.min(255, Math.round(tr * f));
      data[i + 1] = Math.min(255, Math.round(tg * f));
      data[i + 2] = Math.min(255, Math.round(tb * f));
    }
    return imageData;
  }

  const cache = {
    atlas: null,
    images: new Map(), // path -> HTMLImageElement
    tinted: new Map(), // key -> canvas
    ready: null,
  };

  function loadImage(src) {
    if (cache.images.has(src)) return cache.images.get(src);
    const p = new Promise((resolve, reject) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Failed to load " + src));
      img.src = src + (src.includes("?") ? "&" : "?") + "v=" + CACHE_BUST;
    });
    cache.images.set(src, p);
    return p;
  }

  async function ensureReady() {
    if (cache.ready) return cache.ready;
      cache.ready = (async () => {
      const res = await fetch(BASE + "atlas.json?v=" + CACHE_BUST);
      cache.atlas = await res.json();
      return cache.atlas;
    })();
    return cache.ready;
  }

  function itemOf(cat, index) {
    const list = cache.atlas?.categories?.[cat]?.items || [];
    if (!list.length) return null;
    if (index < 0) return null;
    const i = Math.min(index, list.length - 1);
    return list[i];
  }

  function tintKey(cat, index, color, mode) {
    return [cat, index, color || "-", mode].join("|");
  }

  async function getTintedSprite(cat, index, color, mode) {
    const item = itemOf(cat, index);
    if (!item) return null;
    const key = tintKey(cat, index, color, mode);
    if (cache.tinted.has(key)) return cache.tinted.get(key);

    const img = await loadImage(BASE + item.file);
    const c = document.createElement("canvas");
    c.width = img.naturalWidth || img.width;
    c.height = img.naturalHeight || img.height;
    const cx = c.getContext("2d");
    cx.drawImage(img, 0, 0);
    if (mode && mode !== "plain" && color) {
      const id = cx.getImageData(0, 0, c.width, c.height);
      if (mode === "skin") tintImageData(id, color, {}); // grayscale face → skin tint
      else if (mode === "hair") tintImageData(id, color, { knockoutFace: true });
      else if (mode === "eyes") tintImageData(id, color, { eyeMode: true });
      else if (mode === "tint") tintImageData(id, color, {});
      cx.putImageData(id, 0, 0);
    } else if (mode === "hair") {
      const id = cx.getImageData(0, 0, c.width, c.height);
      tintImageData(id, color || "#4A2F1A", { knockoutFace: true });
      cx.putImageData(id, 0, 0);
    }
    cache.tinted.set(key, c);
    return c;
  }

  function drawCentered(ctx, sprite, cx, cy, maxW, maxH) {
    if (!sprite) return;
    const sw = sprite.width, sh = sprite.height;
    let dw = sw, dh = sh;
    if (maxW && dw > maxW) { dh *= maxW / dw; dw = maxW; }
    if (maxH && dh > maxH) { dw *= maxH / dh; dh = maxH; }
    ctx.drawImage(sprite, cx - dw / 2, cy - dh / 2, dw, dh);
  }

  /**
   * Compose a full character onto a canvas.
   * Bottom-up stack: each piece sits on the one below with a small overlap.
   */
  async function compose(config, targetCanvas) {
    await ensureReady();
    const cfg = normalizeConfig(config);
    const canvas = targetCanvas || document.createElement("canvas");
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    const col = cfg.colors;
    const cx = CANVAS_W / 2;

    // Fixed silhouette slots — clothes change color/style, not overall character size
    const SLOT = {
      shoeW: 68, shoeH: 20,
      bottomW: 70, bottomH: 44,
      topW: 78, topH: 62,
      dressW: 78, dressH: 96,
      outerW: 82, outerH: 66,
      faceW: 80, faceH: 74,
      eyeW: 38, eyeH: 12,
      hairW: 94, hairHead: 80,
    };
    const GROUND = CANVAS_H - 12;
    const OVERLAP = 12;

    function fitDraw(sprite, cx0, bottomY, maxW, maxH, track) {
      if (!sprite) return 0;
      const scale = Math.min(maxW / sprite.width, maxH / sprite.height);
      const w = sprite.width * scale;
      const h = sprite.height * scale;
      const top = bottomY - h;
      ctx.drawImage(sprite, cx0 - w / 2, top, w, h);
      return h;
    }

    function fitCenter(sprite, cx0, cy, maxW, maxH) {
      if (!sprite) return;
      const scale = Math.min(maxW / sprite.width, maxH / sprite.height);
      const w = sprite.width * scale;
      const h = sprite.height * scale;
      ctx.drawImage(sprite, cx0 - w / 2, cy - h / 2, w, h);
    }

    function fitHairAt(sprite, faceCy, faceH, yNudge) {
      if (!sprite) return;
      const scaleUse = Math.min(SLOT.hairW / sprite.width, SLOT.hairHead / Math.min(sprite.height, SLOT.hairHead));
      const w = sprite.width * scaleUse;
      const h = sprite.height * scaleUse;
      const headBand = Math.min(h, faceH * 1.0);
      const top = faceCy - headBand / 2 + (yNudge || 0);
      ctx.drawImage(sprite, cx - w / 2, top, w, h);
    }

    function softFaceOval(faceCy, rx, ry) {
      ctx.beginPath();
      ctx.ellipse(cx, faceCy + 1, rx, ry, 0, 0, Math.PI * 2);
    }

    const useDress = cfg.dresses >= 0;
    const bottomsIdx = useDress ? -1 : (cfg.bottoms >= 0 ? cfg.bottoms : 0);
    const topsIdx = useDress ? -1 : (cfg.tops >= 0 ? cfg.tops : 0);

    const shoeSpr = cfg.shoes >= 0 ? await getTintedSprite("shoes", cfg.shoes, col.shoes, "tint") : null;
    const bottomSpr = bottomsIdx >= 0 ? await getTintedSprite("bottoms", bottomsIdx, col.bottom, "tint") : null;
    const dressSpr = useDress ? await getTintedSprite("dresses", cfg.dresses, col.top, "tint") : null;
    const topSpr = topsIdx >= 0 ? await getTintedSprite("tops", topsIdx, col.top, "tint") : null;
    const outerSpr = (!useDress && cfg.outer >= 0) ? await getTintedSprite("outer", cfg.outer, col.top, "tint") : null;

    // Always one face shape
    const faceSpr = await getTintedSprite("face", 0, col.skin, "skin");
    const hairCat = cfg.hairSet === "hair_f" ? "hair_f" : "hair_m";
    const hairSpr = cfg.hair >= 0 ? await getTintedSprite(hairCat, cfg.hair, col.hair, "hair") : null;

    let y = GROUND;
    let collarY = y;
    const tallBottom = false; // only short bottoms kept

    if (shoeSpr) {
      y -= fitDraw(shoeSpr, cx, y, SLOT.shoeW, SLOT.shoeH) - OVERLAP * 0.6;
    }
    const shoeTop = y;

    if (dressSpr) {
      collarY = y;
      y -= fitDraw(dressSpr, cx, y, SLOT.dressW, SLOT.dressH) - OVERLAP;
    } else {
      if (bottomSpr && !tallBottom) {
        y -= fitDraw(bottomSpr, cx, y, SLOT.bottomW, SLOT.bottomH) - OVERLAP;
      }
      if (topSpr) {
        collarY = y;
        y -= fitDraw(topSpr, cx, y, SLOT.topW, SLOT.topH) - OVERLAP;
      }
      if (bottomSpr && tallBottom) {
        fitDraw(bottomSpr, cx, shoeTop, SLOT.bottomW, SLOT.bottomH + 22);
      }
      if (outerSpr) {
        fitDraw(outerSpr, cx, collarY, SLOT.outerW, SLOT.outerH);
      }
    }

    const headBottom = Math.min(y + OVERLAP, CANVAS_H - 48);
    const headH = SLOT.faceH;
    const headCy = headBottom - headH / 2;
    const faceRx = SLOT.faceW * 0.46;
    const faceRy = SLOT.faceH * 0.48;

    // 1) Hair behind (sides / back) — avoids chin-hole outline cutting the face
    if (hairSpr) {
      fitHairAt(hairSpr, headCy - 4, headH, -6);
    }

    // 2) Soft clipped face on top of hair (hides hair hole edge + harsh sheet jaw)
    ctx.save();
    softFaceOval(headCy, faceRx, faceRy);
    ctx.clip();
    fitCenter(faceSpr, cx, headCy, SLOT.faceW, SLOT.faceH);
    ctx.restore();

    // Cute soft outline (not the sheet's hard chin line)
    ctx.save();
    softFaceOval(headCy, faceRx, faceRy);
    ctx.strokeStyle = "rgba(90,60,45,0.22)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // 3) Features — smaller eyes, cuter placement
    fitCenter(await getTintedSprite("eyes", cfg.eyes, col.eyes, "eyes"), cx, headCy + 2, SLOT.eyeW, SLOT.eyeH);
    // soft eye sparkle
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.beginPath(); ctx.arc(cx - 7, headCy - 1, 1.4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + 8, headCy - 1, 1.2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    drawSimpleNose(ctx, cfg.nose, cx, headCy + 9, col.nose || col.hair);
    drawSimpleMouth(ctx, cfg.mouth, cx, headCy + 16, col.mouth || "#E3998A");

    // 4) Bangs only: redraw hair clipped to upper forehead so chin stays clean
    if (hairSpr) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, CANVAS_W, headCy + 4);
      ctx.clip();
      fitHairAt(hairSpr, headCy - 4, headH, -6);
      ctx.restore();
    }
    return canvas;
  }

  function normalizeStyleId(val, styles, fallback) {
    if (typeof val === "number") return (styles[val] || styles[0]).id;
    if (styles.some((s) => s.id === val)) return val;
    return fallback;
  }

  function normalizeConfig(raw) {
    const d = defaultConfig();
    if (!raw || typeof raw !== "object") return d;
    const out = Object.assign({}, d, raw);
    out.colors = Object.assign({}, DEFAULT_COLORS, raw.colors || {});
    if (!out.colors.mouth) out.colors.mouth = out.colors.hair || DEFAULT_COLORS.mouth;
    if (!out.colors.nose) out.colors.nose = DEFAULT_COLORS.nose;
    if (raw.hairSet === "hair_f" || raw.hairSet === "f") out.hairSet = "hair_f";
    else out.hairSet = "hair_m";
    out.face = 0; // one shared face shape
    out.mouth = normalizeStyleId(out.mouth, MOUTH_STYLES, "smile");
    if (out.nose === -1 || out.nose === "none") out.nose = "dot";
    out.nose = normalizeStyleId(out.nose, NOSE_STYLES, "dot");
    delete out.brows; delete out.glasses; delete out.facial; delete out.hats;
    const cats = cache.atlas && cache.atlas.categories;
    if (cats) {
      for (const key of ["face", "eyes", "tops", "outer", "bottoms", "dresses", "shoes"]) {
        const n = cats[key]?.items?.length || 0;
        if (typeof out[key] === "number" && out[key] >= n) out[key] = n ? 0 : -1;
      }
      const hairKey = out.hairSet === "hair_f" ? "hair_f" : "hair_m";
      const hn = cats[hairKey]?.items?.length || 0;
      if (typeof out.hair === "number" && out.hair >= hn) out.hair = 0;
    }
    return out;
  }

  async function composeToDataURL(config) {
    const c = await compose(config);
    return c.toDataURL("image/png");
  }

  const drawCache = new Map();
  async function warmDraw(config) {
    const cfg = normalizeConfig(config);
    const key = JSON.stringify(cfg);
    if (drawCache.has(key)) return drawCache.get(key);
    const canvas = await compose(cfg);
    drawCache.set(key, canvas);
    if (drawCache.size > 48) {
      const first = drawCache.keys().next().value;
      drawCache.delete(first);
    }
    return canvas;
  }

  function draw(ctx, configOrCanvas, x, y, scale = 1) {
    const src = configOrCanvas;
    if (!src) return;
    const w = (src.width || CANVAS_W) * scale;
    const h = (src.height || CANVAS_H) * scale;
    ctx.drawImage(src, x - w / 2, y - h, w, h);
  }

  /* ---------- Web component UI ---------- */

  const STYLE = `
    :host {
      display: block;
      font-family: "Nunito", "Segoe UI", system-ui, sans-serif;
      color: #3a2c22;
      --mk-teal: #3d8b7a;
      --mk-line: rgba(58,44,34,0.18);
      --mk-paper: rgba(255,255,255,0.72);
    }
    .mk {
      display: flex; flex-direction: column; gap: 0.75rem;
    }
    .stage {
      position: relative;
      display: flex; align-items: flex-end; justify-content: center;
      min-height: 310px; padding: 1rem 1rem 0.6rem;
      border-radius: 18px; border: 2px solid rgba(58,44,34,0.22);
      background:
        radial-gradient(ellipse 70% 50% at 50% 30%, rgba(255,255,255,0.9), transparent 70%),
        linear-gradient(180deg, #dceee8 0%, #b7d4c8 50%, #8fb8a8 100%);
      overflow: hidden;
    }
    .stage::before {
      content: ""; position: absolute; left: 50%; bottom: 16px;
      transform: translateX(-50%); width: 120px; height: 22px;
      border-radius: 50%; background: rgba(58,44,34,0.14);
    }
    .stage canvas { position: relative; z-index: 1; width: 140px; height: 175px; image-rendering: auto; }
    .hint {
      position: relative; z-index: 1; margin-top: 0.25rem;
      font-size: 0.62rem; letter-spacing: 0.06em; text-transform: uppercase;
      color: rgba(58,44,34,0.55); font-family: ui-monospace, monospace;
    }
    .cats {
      display: flex; flex-wrap: wrap; gap: 0.35rem; justify-content: center;
    }
    .cat {
      border: 1px solid rgba(58,44,34,0.28); background: var(--mk-paper);
      border-radius: 999px; padding: 0.35rem 0.75rem;
      font-weight: 700; font-size: 0.78rem; cursor: pointer; color: #5a4a3c;
    }
    .cat.active { background: var(--mk-teal); color: #fff; border-color: var(--mk-teal); }
    .panel {
      background: var(--mk-paper); border: 1px solid var(--mk-line);
      border-radius: 14px; padding: 0.75rem;
    }
    .label {
      font-size: 0.72rem; letter-spacing: 0.04em; text-transform: uppercase;
      color: rgba(58,44,34,0.55); margin: 0 0 0.45rem; font-weight: 700;
    }
    .grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(64px, 1fr));
      gap: 0.4rem;
    }
    .thumb {
      aspect-ratio: 1; border-radius: 12px; border: 2px solid transparent;
      background: #fff; cursor: pointer; padding: 4px; display: grid; place-items: center;
    }
    .thumb img, .thumb canvas { max-width: 100%; max-height: 100%; object-fit: contain; width: 52px; height: 52px; }
    .thumb.selected { border-color: var(--mk-teal); box-shadow: 0 0 0 2px rgba(61,139,122,0.25); }
    .thumb.none { font-size: 0.7rem; color: #8a7a6a; }
    .swatches { display: flex; flex-wrap: wrap; gap: 0.35rem; margin-top: 0.55rem; }
    .swatch {
      width: 28px; height: 28px; border-radius: 50%; border: 2px solid rgba(58,44,34,0.2);
      cursor: pointer; padding: 0;
    }
    .swatch.selected { outline: 2px solid var(--mk-teal); outline-offset: 2px; }
    .row { display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; margin-bottom: 0.35rem; }
    .seg {
      border: 1px solid rgba(58,44,34,0.25); background: #fff; border-radius: 999px;
      padding: 0.25rem 0.65rem; font-size: 0.75rem; font-weight: 700; cursor: pointer;
    }
    .seg.active { background: #3a2c22; color: #fff; }
    .color-input { width: 36px; height: 28px; border: none; background: transparent; cursor: pointer; }
  `;

  const PALETTES = {
    skin: ["#F8E4D0", "#F3D0B0", "#E8B888", "#D9A066", "#B87A4B", "#8C5A34", "#5C3A24"],
    hair: ["#111111", "#2A1A12", "#4A2F1A", "#6B4423", "#A67C52", "#D4A574", "#C9B8A0", "#8B1E3F", "#2F5D50"],
    eyes: ["#2A1A12", "#4B2C20", "#5A7FB0", "#3D8B7A", "#6B4423", "#8A6BAE"],
    nose: ["#C48A6A", "#A87058", "#8C5A34", "#E8B888", "#5C3A24", "#D9A066"],
    mouth: ["#C45A6A", "#A84858", "#E3998A", "#8C3A3A", "#5A2C2C", "#F0A0A8", "#4A2F1A"],
    top: ["#6B9BD1", "#E8A0B0", "#D98F2B", "#7A9E7E", "#5A6F9A", "#C4B5A0", "#F5E9D3", "#3A2C22"],
    bottom: ["#5A6F9A", "#4A4A4A", "#C4B5A0", "#E8A0B0", "#6B9BD1", "#3A2C22"],
    shoes: ["#E8E0D5", "#2A2A2A", "#8C5A34", "#6B9BD1", "#D98F2B"],
  };

  class CharacterMaker extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this._cfg = defaultConfig();
      this._cat = "face";
      this._canvas = null;
      this._busy = false;
    }

    static get observedAttributes() {
      return ["value"];
    }

    get value() {
      return normalizeConfig(this._cfg);
    }

    set value(v) {
      this._cfg = normalizeConfig(v);
      this.render();
      this.refreshPreview();
    }

    connectedCallback() {
      const initial = this.getAttribute("value");
      if (initial) {
        try { this._cfg = normalizeConfig(JSON.parse(initial)); } catch (_) {}
      }
      this.renderShell();
      ensureReady().then(() => {
        this.render();
        this.refreshPreview();
      }).catch((e) => {
        this.shadowRoot.querySelector(".panel").textContent = "Could not load character assets: " + e.message;
      });
    }

    renderShell() {
      this.shadowRoot.innerHTML = `
        <style>${STYLE}</style>
        <div class="mk">
          <div class="stage">
            <canvas width="${CANVAS_W}" height="${CANVAS_H}"></canvas>
          </div>
          <div class="hint">Sheet studio · canvas recolor</div>
          <div class="cats"></div>
          <div class="panel"></div>
        </div>
      `;
      this._canvas = this.shadowRoot.querySelector("canvas");
      this.shadowRoot.querySelector(".cats").addEventListener("click", (e) => {
        const btn = e.target.closest("[data-cat]");
        if (!btn) return;
        this._cat = btn.dataset.cat;
        this.render();
      });
      this.shadowRoot.querySelector(".panel").addEventListener("click", (e) => this.onPanelClick(e));
      this.shadowRoot.querySelector(".panel").addEventListener("input", (e) => this.onPanelInput(e));
    }

    async refreshPreview() {
      if (!this._canvas || this._busy) return;
      this._busy = true;
      try {
        await compose(this._cfg, this._canvas);
        this.dispatchEvent(new CustomEvent("change", { detail: this.value, bubbles: true, composed: true }));
      } finally {
        this._busy = false;
      }
    }

    catIdForLayer(meta) {
      if (meta.id === "hair") return this._cfg.hairSet;
      return meta.id;
    }

    indexKey(meta) {
      if (meta.id === "hair") return "hair";
      return meta.id;
    }

    render() {
      const catsEl = this.shadowRoot.querySelector(".cats");
      const panel = this.shadowRoot.querySelector(".panel");
      if (!catsEl || !panel || !cache.atlas) return;

      catsEl.innerHTML = CAT_META.filter((c) => {
        if (c.mode === "mouth" || c.mode === "nose" || c.mode === "skinTone") return true;
        const key = c.id === "hair" ? this._cfg.hairSet : c.id;
        const n = cache.atlas.categories[key]?.items?.length || 0;
        return n > 0;
      }).map((c) =>
        `<button type="button" class="cat ${c.id === this._cat ? "active" : ""}" data-cat="${c.id}">${c.label}</button>`
      ).join("");

      // If active cat was Face (removed), fall back
      if (this._cat === "face") this._cat = "skin";
      const meta = CAT_META.find((c) => c.id === this._cat) || CAT_META[0];
      const catKey = this.catIdForLayer(meta);
      const styleList = meta.mode === "mouth" ? MOUTH_STYLES : (meta.mode === "nose" ? NOSE_STYLES : null);
      const items = styleList || (meta.mode === "skinTone" ? [] : (cache.atlas.categories[catKey]?.items || []));
      const idxKey = this.indexKey(meta);
      const current = this._cfg[idxKey];

      let html = "";
      if (meta.mode === "skinTone") {
        html += `<div class="label">Skin tone</div><div class="hint" style="margin:0 0 0.4rem;opacity:0.75;font-size:0.82rem">One face shape · works with every hairstyle</div>`;
        const pal = PALETTES.skin || [];
        const cur = this._cfg.colors.skin;
        html += `<div class="swatches">`;
        pal.forEach((c) => {
          html += `<button type="button" class="swatch ${c.toLowerCase() === String(cur).toLowerCase() ? "selected" : ""}" data-color="${c}" style="background:${c}"></button>`;
        });
        html += `<input class="color-input" type="color" data-color-picker value="${cur}"></div>`;
        panel.innerHTML = html;
        return;
      }
      if (meta.sets) {
        html += `<div class="row">
          <button type="button" class="seg ${this._cfg.hairSet === "hair_m" ? "active" : ""}" data-hair-set="hair_m">Short</button>
          <button type="button" class="seg ${this._cfg.hairSet === "hair_f" ? "active" : ""}" data-hair-set="hair_f">Long</button>
        </div>`;
      }
      html += `<div class="label">${meta.label}</div><div class="grid">`;
      if (meta.optional) {
        html += `<button type="button" class="thumb none ${current < 0 ? "selected" : ""}" data-none="1">None</button>`;
      }
      if (styleList) {
        const dataAttr = meta.mode === "mouth" ? "data-mouth" : "data-nose";
        const canvasAttr = meta.mode === "mouth" ? "data-mouth-thumb" : "data-nose-thumb";
        styleList.forEach((m) => {
          html += `<button type="button" class="thumb ${current === m.id ? "selected" : ""}" ${dataAttr}="${m.id}">
            <canvas width="64" height="64" ${canvasAttr}="${m.id}"></canvas>
          </button>`;
        });
      } else {
        items.forEach((it, i) => {
          html += `<button type="button" class="thumb ${current === i ? "selected" : ""}" data-idx="${i}">
            <canvas width="64" height="64" data-thumb-idx="${i}"></canvas>
          </button>`;
        });
      }
      html += `</div>`;

      if (meta.colorKey) {
        const pal = PALETTES[meta.colorKey] || [];
        const cur = this._cfg.colors[meta.colorKey] || "#888888";
        html += `<div class="label" style="margin-top:0.65rem">Color</div><div class="swatches">`;
        pal.forEach((c) => {
          html += `<button type="button" class="swatch ${c.toLowerCase() === String(cur).toLowerCase() ? "selected" : ""}" data-color="${c}" style="background:${c}"></button>`;
        });
        html += `<input class="color-input" type="color" data-color-picker value="${cur}">`;
        html += `</div>`;
      }
      panel.innerHTML = html;
      this.paintThumbs(meta, catKey, items);
    }

    async paintThumbs(meta, catKey, items) {
      const panel = this.shadowRoot.querySelector(".panel");
      if (!panel) return;

      const paintSimple = (sel, drawer, color) => {
        panel.querySelectorAll(sel).forEach((cv) => {
          const ctx = cv.getContext("2d");
          ctx.clearRect(0, 0, cv.width, cv.height);
          ctx.save();
          ctx.translate(cv.width / 2, cv.height / 2 + 2);
          ctx.scale(2.4, 2.4);
          const id = cv.dataset.mouthThumb || cv.dataset.noseThumb;
          drawer(ctx, id, 0, 0, color);
          ctx.restore();
        });
      };

      if (meta.mode === "mouth") {
        paintSimple("canvas[data-mouth-thumb]", drawSimpleMouth, this._cfg.colors.mouth || "#C45A6A");
        return;
      }
      if (meta.mode === "nose") {
        paintSimple("canvas[data-nose-thumb]", drawSimpleNose, this._cfg.colors.nose || "#C48A6A");
        return;
      }

      if (!items) return;
      const colorKey = meta.colorKey || "top";
      const color = this._cfg.colors[colorKey] || "#888888";
      let mode = meta.mode || "tint";
      if (mode === "plain") mode = "tint";
      const canvases = panel.querySelectorAll("canvas[data-thumb-idx]");
      await Promise.all(Array.from(canvases).map(async (cv) => {
        const i = Number(cv.dataset.thumbIdx);
        const btn = cv.closest(".thumb");
        try {
          const spr = await getTintedSprite(catKey, i, color, mode);
          if (!spr || spr.width < 2 || spr.height < 2) {
            if (btn) btn.remove();
            return;
          }
          const ctx = cv.getContext("2d");
          ctx.clearRect(0, 0, cv.width, cv.height);
          const pad = 6;
          const scale = Math.min((cv.width - pad * 2) / spr.width, (cv.height - pad * 2) / spr.height);
          const dw = spr.width * scale;
          const dh = spr.height * scale;
          ctx.drawImage(spr, (cv.width - dw) / 2, (cv.height - dh) / 2, dw, dh);
          // Drop blank thumbs (no visible pixels)
          const sample = ctx.getImageData(0, 0, cv.width, cv.height).data;
          let ink = 0;
          for (let p = 3; p < sample.length; p += 4) {
            if (sample[p] > 12) { ink++; if (ink > 8) break; }
          }
          if (ink <= 8 && btn) btn.remove();
        } catch (_) {
          if (btn) btn.remove();
        }
      }));
    }

    onPanelClick(e) {
      const setBtn = e.target.closest("[data-hair-set]");
      if (setBtn) {
        this._cfg.hairSet = setBtn.dataset.hairSet;
        this._cfg.hair = 0;
        cache.tinted.clear();
        this.render();
        this.refreshPreview();
        return;
      }
      const none = e.target.closest("[data-none]");
      const thumb = e.target.closest("[data-idx]");
      const mouthBtn = e.target.closest("[data-mouth]");
      const noseBtn = e.target.closest("[data-nose]");
      const sw = e.target.closest("[data-color]");
      const meta = CAT_META.find((c) => c.id === this._cat);
      if (!meta) return;
      const idxKey = this.indexKey(meta);

      if (none) {
        this._cfg[idxKey] = -1;
        this.render();
        this.refreshPreview();
        return;
      }
      if (mouthBtn) {
        this._cfg.mouth = mouthBtn.dataset.mouth;
        this.render();
        this.refreshPreview();
        return;
      }
      if (noseBtn) {
        this._cfg.nose = noseBtn.dataset.nose;
        this.render();
        this.refreshPreview();
        return;
      }
      if (thumb) {
        const i = Number(thumb.dataset.idx);
        this._cfg[idxKey] = i;
        if ((meta.id === "tops" || meta.id === "bottoms") && i >= 0) {
          this._cfg.dresses = -1;
        }
        this.render();
        this.refreshPreview();
        return;
      }
      if (sw && meta.colorKey) {
        this._cfg.colors[meta.colorKey] = sw.dataset.color;
        cache.tinted.clear();
        drawCache.clear();
        this.render();
        this.refreshPreview();
      }
    }

    onPanelInput(e) {
      const picker = e.target.closest("[data-color-picker]");
      if (!picker) return;
      const meta = CAT_META.find((c) => c.id === this._cat);
      if (!meta || !meta.colorKey) return;
      this._cfg.colors[meta.colorKey] = picker.value;
      cache.tinted.clear();
      drawCache.clear();
      this.render();
      this.refreshPreview();
    }
  }

  if (!customElements.get("character-maker")) {
    customElements.define("character-maker", CharacterMaker);
  }

  const MiiAvatar = {
    BASE,
    CANVAS_W,
    CANVAS_H,
    CAT_META,
    DEFAULT_COLORS,
    defaultConfig,
    normalizeConfig,
    ensureReady,
    compose,
    composeToDataURL,
    warmDraw,
    draw,
    tintImageData,
    get atlas() { return cache.atlas; },
    clearCaches() { cache.tinted.clear(); drawCache.clear(); },
  };

  global.MiiAvatar = MiiAvatar;
})(typeof window !== "undefined" ? window : globalThis);
