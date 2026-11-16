import * as THREE from 'three';

// Texturas procedurales en alta resolución: todo se dibuja en coordenadas
// "lógicas" (las de siempre) y el lienzo real es S veces mayor, así que el
// diseño no cambia pero gana nitidez. Cada textura puede generar además sus
// mapas PBR (rugosidad/metal y relieve) a partir de los mismos píxeles.

function canvas(w, h = w, s = 1) {
  const c = document.createElement('canvas');
  c.width = Math.round(w * s);
  c.height = Math.round(h * s);
  c.lw = w;
  c.lh = h;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.scale(s, s);
  return [c, ctx];
}

function toTex(c, repeat = 1, aniso = 4, color = true) {
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  if (color) tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = aniso;
  if (repeat !== 1) tex.repeat.set(repeat, repeat);
  return tex;
}

function noise(ctx, n, alphaLo, alphaHi, sizeLo = 1, sizeHi = 3) {
  const W = ctx.canvas.lw || ctx.canvas.width, H = ctx.canvas.lh || ctx.canvas.height;
  for (let i = 0; i < n; i++) {
    const a = alphaLo + Math.random() * (alphaHi - alphaLo);
    ctx.fillStyle = Math.random() < 0.5 ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${a})`;
    const s = sizeLo + Math.random() * (sizeHi - sizeLo);
    ctx.fillRect(Math.random() * W, Math.random() * H, s, s);
  }
}

/** grano fino a resolución real del lienzo (detalle que antes no cabía) */
function fineGrain(ctx, amount = 0.05, density = 0.35) {
  const c = ctx.canvas;
  const img = ctx.getImageData(0, 0, c.width, c.height);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    if (Math.random() > density) continue;
    const v = (Math.random() - 0.5) * 255 * amount;
    d[i] += v; d[i + 1] += v; d[i + 2] += v;
  }
  ctx.putImageData(img, 0, 0);
}

/**
 * Mapas PBR derivados del color:
 *  - orm: G = rugosidad, B = metal (formato que lee three.js)
 *  - bump: luminancia suavizada
 * glass(r,g,b) decide qué píxeles son cristal (reflejo nítido).
 */
function pbrMaps(c, { rough = 0.85, roughVar = 0.12, glass = null, aniso = 8, bumpBlur = 1 } = {}) {
  const w = c.width, h = c.height;
  const src = c.getContext('2d').getImageData(0, 0, w, h).data;
  const [oc, octx] = canvas(w, h);
  const [bc, bctx] = canvas(w, h);
  const orm = octx.createImageData(w, h);
  const bump = bctx.createImageData(w, h);
  for (let i = 0; i < src.length; i += 4) {
    const r = src[i], g = src[i + 1], b = src[i + 2];
    const lum = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
    let ro = rough + (0.5 - lum) * roughVar * 2;
    let me = 0;
    if (glass && glass(r, g, b, lum)) { ro = 0.04; me = 0.55; }
    orm.data[i] = 255;
    orm.data[i + 1] = Math.max(0, Math.min(255, ro * 255));
    orm.data[i + 2] = me * 255;
    orm.data[i + 3] = 255;
    const bv = lum * 255;
    bump.data[i] = bump.data[i + 1] = bump.data[i + 2] = bv;
    bump.data[i + 3] = 255;
  }
  octx.putImageData(orm, 0, 0);
  bctx.putImageData(bump, 0, 0);
  if (bumpBlur > 0) {
    bctx.filter = `blur(${bumpBlur}px)`;
    bctx.drawImage(bc, 0, 0);
    bctx.filter = 'none';
  }
  return { orm: toTex(oc, 1, aniso, false), bump: toTex(bc, 1, aniso, false) };
}

// cristal = azulado y oscuro (lo que pinta drawGlass)
const isGlass = (r, g, b, lum) => b > r + 8 && lum < 0.62 && lum > 0.08;

/** Asfalto desgastado canario: grano, manchas de aceite, parches */
export function asphaltTexture(aniso = 8) {
  const S = 4;
  const [c, ctx] = canvas(256, 256, S);
  const g = ctx.createLinearGradient(0, 0, 256, 256);
  g.addColorStop(0, '#3a3d42');
  g.addColorStop(0.5, '#34373c');
  g.addColorStop(1, '#3c4046');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  noise(ctx, 9000, 0.02, 0.09, 0.4, 1.6);
  for (let i = 0; i < 2400; i++) {
    const v = 45 + Math.random() * 50;
    ctx.fillStyle = `rgb(${v},${v + 2},${v + 4})`;
    ctx.fillRect(Math.random() * 256, Math.random() * 256, 0.4 + Math.random() * 0.9, 0.4 + Math.random() * 0.9);
  }
  for (let i = 0; i < 14; i++) {
    const x = Math.random() * 256, y = Math.random() * 256;
    const r = 8 + Math.random() * 22;
    const rg = ctx.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, 'rgba(15,15,18,0.35)');
    rg.addColorStop(0.6, 'rgba(20,22,28,0.12)');
    rg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.55, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = 'rgba(0,0,0,0.22)';
  ctx.lineWidth = 0.6;
  for (let i = 0; i < 10; i++) {
    let x = Math.random() * 256, y = Math.random() * 256;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let k = 0; k < 8; k++) {
      x += (Math.random() - 0.5) * 30;
      y += (Math.random() - 0.5) * 30;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = 'rgba(50,54,60,0.45)';
    ctx.fillRect(Math.random() * 200, Math.random() * 200, 30 + Math.random() * 50, 18 + Math.random() * 30);
  }
  fineGrain(ctx, 0.12, 0.6);
  const tex = toTex(c, 1, aniso);
  const maps = pbrMaps(c, { rough: 0.86, roughVar: 0.25, aniso, bumpBlur: 0.6 });
  tex.userData.orm = maps.orm;
  tex.userData.bump = maps.bump;
  return tex;
}

/** Baldosas de acera beige/ocre típicas de Lanzarote */
export function sidewalkTexture(aniso = 8) {
  const S = 4;
  const [c, ctx] = canvas(256, 256, S);
  ctx.fillStyle = '#9a8e7c';
  ctx.fillRect(0, 0, 256, 256);
  const tile = 32;
  for (let y = 0; y < 256; y += tile) {
    for (let x = 0; x < 256; x += tile) {
      const v = 188 + Math.floor(Math.random() * 28);
      const r = v, g = v - 12 - Math.floor(Math.random() * 8), b = v - 28 - Math.floor(Math.random() * 10);
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x + 0.8, y + 0.8, tile - 1.6, tile - 1.6);
      for (let i = 0; i < 60; i++) {
        ctx.fillStyle = Math.random() < 0.5 ? 'rgba(255,255,255,0.07)' : 'rgba(80,60,40,0.08)';
        ctx.fillRect(x + 2 + Math.random() * (tile - 4), y + 2 + Math.random() * (tile - 4), 0.6, 0.6);
      }
      // suciedad en los bordes de cada baldosa
      ctx.strokeStyle = 'rgba(70,58,44,0.12)';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(x + 1.5, y + 1.5, tile - 3, tile - 3);
    }
  }
  fineGrain(ctx, 0.08, 0.5);
  const tex = toTex(c, 1, aniso);
  const maps = pbrMaps(c, { rough: 0.8, roughVar: 0.1, aniso, bumpBlur: 0.8 });
  tex.userData.orm = maps.orm;
  tex.userData.bump = maps.bump;
  return tex;
}

/** Pavimento peatonal (plaza / calle peatonal) */
export function pedestrianTexture(aniso = 6) {
  const [c, ctx] = canvas(256, 256, 3);
  ctx.fillStyle = '#b4aa96';
  ctx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 24) {
    for (let x = 0; x < 256; x += 24) {
      const odd = ((x / 24) + (y / 24)) % 2;
      ctx.fillStyle = odd ? '#d4cbb8' : '#c4b9a4';
      ctx.fillRect(x + 0.6, y + 0.6, 22.8, 22.8);
    }
  }
  noise(ctx, 4000, 0.02, 0.07, 0.4, 1.2);
  fineGrain(ctx, 0.07, 0.5);
  const tex = toTex(c, 1, aniso);
  const maps = pbrMaps(c, { rough: 0.78, roughVar: 0.1, aniso });
  tex.userData.orm = maps.orm;
  tex.userData.bump = maps.bump;
  return tex;
}

/** Arena de la Playa del Reducto */
export function sandTexture(aniso = 6) {
  const [c, ctx] = canvas(256, 256, 3);
  ctx.fillStyle = '#e8d4a4';
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 16000; i++) {
    const v = Math.random();
    if (v < 0.4) ctx.fillStyle = 'rgba(210,180,120,0.25)';
    else if (v < 0.7) ctx.fillStyle = 'rgba(255,245,210,0.2)';
    else ctx.fillStyle = 'rgba(160,130,80,0.12)';
    ctx.fillRect(Math.random() * 256, Math.random() * 256, 0.5 + Math.random(), 0.5 + Math.random());
  }
  for (let i = 0; i < 20; i++) {
    ctx.strokeStyle = `rgba(200,170,110,${0.08 + Math.random() * 0.1})`;
    ctx.lineWidth = 2;
    const y = Math.random() * 256;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= 256; x += 12) ctx.lineTo(x, y + Math.sin(x * 0.08 + i) * 3);
    ctx.stroke();
  }
  fineGrain(ctx, 0.08, 0.6);
  return toTex(c, 1, aniso);
}

/** Tierra volcánica / erial lanzaroteño */
export function groundTexture(aniso = 4) {
  const [c, ctx] = canvas(256, 256, 2);
  ctx.fillStyle = '#9a8a6c';
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 9000; i++) {
    const v = Math.random();
    if (v < 0.35) ctx.fillStyle = 'rgba(70,55,40,0.14)';
    else if (v < 0.65) ctx.fillStyle = 'rgba(200,185,150,0.12)';
    else if (v < 0.85) ctx.fillStyle = 'rgba(90,70,50,0.1)';
    else ctx.fillStyle = 'rgba(40,36,34,0.2)'; // picón volcánico
    const s = 0.6 + Math.random() * 3;
    ctx.fillRect(Math.random() * 256, Math.random() * 256, s, s);
  }
  return toTex(c, 300, aniso);
}

/** Mar Atlántico (se conserva por compatibilidad) */
export function waveTexture() {
  const [c, ctx] = canvas(256);
  ctx.fillStyle = '#1a6a9e';
  ctx.fillRect(0, 0, 256, 256);
  return toTex(c);
}

/**
 * Mapa de normales del oleaje, repetible sin costuras: suma de ondas con
 * frecuencias enteras en ambos ejes (todas cierran en el borde de la tesela).
 */
export function waterNormalTexture(size = 512) {
  const [c, ctx] = canvas(size);
  const img = ctx.createImageData(size, size);
  const waves = [];
  for (let i = 0; i < 26; i++) {
    const fx = Math.round((Math.random() - 0.5) * (4 + i * 1.6));
    const fy = Math.round((Math.random() - 0.5) * (4 + i * 1.6)) || 1;
    waves.push([fx, fy, 1 / (1 + Math.hypot(fx, fy) * 0.55), Math.random() * Math.PI * 2]);
  }
  const TAU = Math.PI * 2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let dx = 0, dy = 0;
      const u = x / size, v = y / size;
      for (const [fx, fy, a, ph] of waves) {
        const k = Math.cos(TAU * (fx * u + fy * v) + ph) * a;
        dx += k * fx;
        dy += k * fy;
      }
      const nx = -dx * 0.045, ny = -dy * 0.045;
      const inv = 1 / Math.hypot(nx, ny, 1);
      const i = (y * size + x) * 4;
      img.data[i] = (nx * inv * 0.5 + 0.5) * 255;
      img.data[i + 1] = (ny * inv * 0.5 + 0.5) * 255;
      img.data[i + 2] = (inv * 0.5 + 0.5) * 255;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return toTex(c, 1, 8, false);
}

function drawGlass(ctx, x, y, w, h, night = false) {
  ctx.fillStyle = '#9aa2a8';
  ctx.fillRect(x, y, w, h);
  const gg = ctx.createLinearGradient(x, y, x + w, y + h);
  if (night) {
    gg.addColorStop(0, '#2a3540');
    gg.addColorStop(1, '#1e2830');
  } else {
    gg.addColorStop(0, '#3e5a6a');
    gg.addColorStop(0.5, '#2c4452');
    gg.addColorStop(1, '#22384a');
  }
  ctx.fillStyle = gg;
  ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
  // cortina interior, un poco distinta en cada hoja
  ctx.fillStyle = 'rgba(210,200,180,0.18)';
  ctx.fillRect(x + 2, y + 2, (w - 4) * (0.15 + Math.random() * 0.3), h - 4);
  ctx.strokeStyle = 'rgba(70,78,86,0.9)';
  ctx.lineWidth = 1.4;
  ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y + 2);
  ctx.lineTo(x + w / 2, y + h - 2);
  ctx.stroke();
  // alféizar con sombra
  ctx.fillStyle = '#e4ddd0';
  ctx.fillRect(x - 3, y + h, w + 6, 3);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(x - 3, y + h + 3, w + 6, 3);
}

function drawShutter(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = 'rgba(0,0,0,0.22)';
  ctx.lineWidth = 0.7;
  for (let i = 3; i < h - 2; i += 3) {
    ctx.beginPath();
    ctx.moveTo(x + 1.5, y + i);
    ctx.lineTo(x + w - 1.5, y + i);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
}

function drawBalcony(ctx, x, y, w) {
  ctx.fillStyle = '#2a2e32';
  ctx.fillRect(x, y + 48, w, 3);
  for (let i = 0; i <= 14; i++) ctx.fillRect(x + 2 + i * ((w - 4) / 14), y + 30, 1.3, 20);
  ctx.fillRect(x, y + 28, w, 2.5);
  ctx.fillStyle = '#d8d0c4';
  ctx.fillRect(x - 2, y + 51, w + 4, 6);
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.fillRect(x - 2, y + 57, w + 4, 5);
}

/** Fachada de planta superior: ventana + contraventana + balcón canario */
export function facadeTexture(aniso = 8, { wall = '#f5f2ec', shutter = null, balcony = true, frame = '#ebe5da' } = {}) {
  const [c, ctx] = canvas(128, 128, 4);
  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, 128, 128);
  // estuco: manchas suaves y churretes bajo el alféizar
  for (let i = 0; i < 140; i++) {
    ctx.fillStyle = Math.random() < 0.5 ? 'rgba(200,190,175,0.08)' : 'rgba(255,255,255,0.08)';
    ctx.beginPath();
    ctx.ellipse(Math.random() * 128, Math.random() * 128, 3 + Math.random() * 10, 2 + Math.random() * 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  const streak = ctx.createLinearGradient(0, 92, 0, 128);
  streak.addColorStop(0, 'rgba(110,100,85,0.16)');
  streak.addColorStop(1, 'rgba(110,100,85,0)');
  ctx.fillStyle = streak;
  ctx.fillRect(40, 92, 48, 36);
  noise(ctx, 1600, 0.02, 0.05, 0.3, 1);

  // recercado de la ventana (moldura canaria)
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.fillRect(35, 23, 60, 70);
  ctx.fillStyle = frame;
  ctx.fillRect(34, 22, 60, 70);
  drawGlass(ctx, 40, 27, 48, 58);
  const shut = shutter || (Math.random() < 0.5 ? '#2f6b5a' : '#3a6a8c');
  drawShutter(ctx, 27, 27, 12, 58, shut);
  drawShutter(ctx, 89, 27, 12, 58, shut);
  if (balcony) drawBalcony(ctx, 30, 30, 68);
  else {
    // sin balcón: reja baja de forja delante de la ventana
    ctx.fillStyle = '#2a2e32';
    for (let i = 0; i <= 10; i++) ctx.fillRect(40 + i * 4.8, 71, 1.1, 15);
    ctx.fillRect(40, 70, 48, 1.6);
  }
  // línea de forjado entre plantas
  ctx.fillStyle = 'rgba(0,0,0,0.07)';
  ctx.fillRect(0, 124, 128, 4);
  fineGrain(ctx, 0.05, 0.4);

  const tex = toTex(c, 1, aniso);
  const maps = pbrMaps(c, { rough: 0.88, roughVar: 0.1, glass: isGlass, aniso, bumpBlur: 1.2 });
  tex.userData.orm = maps.orm;
  tex.userData.bump = maps.bump;
  return tex;
}

/**
 * Tres fachadas distintas para que las manzanas no salgan todas con la misma ventana:
 * verde con balcón, azul con reja (sin balcón) y madera sobre pared más cálida.
 */
export function facadeVariants(aniso = 8) {
  return [
    facadeTexture(aniso, { shutter: '#2f6b5a' }),
    facadeTexture(aniso, { shutter: '#3a6a8c', balcony: false, wall: '#f7f4ee' }),
    facadeTexture(aniso, { shutter: '#6b4a2c', wall: '#f2ebdc', frame: '#e6dccb' }),
  ];
}

function stripBase(S) {
  const [c, ctx] = canvas(512, 128, S);
  ctx.fillStyle = '#6e665a';
  ctx.fillRect(0, 108, 512, 20);
  for (let i = 0; i < 600; i++) {
    ctx.fillStyle = Math.random() < 0.5 ? 'rgba(40,34,28,0.22)' : 'rgba(200,190,170,0.12)';
    ctx.fillRect(Math.random() * 512, 108 + Math.random() * 20, 1.5 + Math.random() * 3, 1 + Math.random() * 2);
  }
  ctx.fillStyle = '#f0ebe3';
  ctx.fillRect(0, 0, 512, 108);
  noise(ctx, 3000, 0.02, 0.05, 0.3, 1.2);
  // salpicaduras y suciedad a ras de suelo
  const dirt = ctx.createLinearGradient(0, 84, 0, 108);
  dirt.addColorStop(0, 'rgba(120,105,85,0)');
  dirt.addColorStop(1, 'rgba(120,105,85,0.22)');
  ctx.fillStyle = dirt;
  ctx.fillRect(0, 84, 512, 24);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(0, 106, 512, 2);
  return [c, ctx];
}

function drawDoor(ctx, x, color = '#5c3d28') {
  ctx.fillStyle = '#d8d0c0';
  ctx.fillRect(x - 4, 32, 42, 76);
  ctx.fillStyle = color;
  ctx.fillRect(x, 36, 34, 72);
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 1;
  for (const [px, pw] of [[3, 12], [19, 12]]) {
    ctx.strokeRect(x + px, 40, pw, 30);
    ctx.strokeRect(x + px, 74, pw, 30);
  }
  ctx.fillStyle = '#c9a227';
  ctx.beginPath();
  ctx.arc(x + 26, 72, 1.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e8e2d6';
  ctx.fillRect(x - 6, 28, 46, 6);
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fillRect(x - 6, 34, 46, 2);
}

function drawShop(ctx, x, brandColor, awning) {
  // la fachada lleva el rótulo real encima; aquí, cajón de rótulo neutro
  ctx.fillStyle = '#3a3f44';
  ctx.fillRect(x + 2, 14, 124, 20);
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fillRect(x + 2, 14, 124, 3);
  if (awning) {
    for (let i = 0; i < 12; i++) {
      ctx.fillStyle = i % 2 ? brandColor : '#efe7d6';
      ctx.fillRect(x + 2 + i * 10.5, 34, 10.5, 10);
    }
    for (let i = 0; i < 12; i++) {
      ctx.fillStyle = i % 2 ? brandColor : '#efe7d6';
      ctx.beginPath();
      ctx.arc(x + 7.25 + i * 10.5, 44, 5.25, 0, Math.PI);
      ctx.fill();
    }
  }
  const y0 = awning ? 50 : 38;
  ctx.fillStyle = '#20282e';
  ctx.fillRect(x + 2, y0, 124, 108 - y0);
  // interior iluminado: estanterías y producto
  const inner = ctx.createLinearGradient(0, y0, 0, 108);
  inner.addColorStop(0, '#5a5550');
  inner.addColorStop(1, '#2a2622');
  ctx.fillStyle = inner;
  ctx.fillRect(x + 8, y0 + 4, 112, 100 - y0);
  // baldas con producto (tonos apagados, como se ve a través del cristal)
  for (let sy = y0 + 18; sy < 104; sy += 16) {
    ctx.fillStyle = 'rgba(200,195,185,0.35)';
    ctx.fillRect(x + 10, sy, 108, 1.5);
    for (let px = x + 11; px < x + 116; px += 3 + Math.random() * 4) {
      const ph = 4 + Math.random() * 8;
      ctx.fillStyle = `hsl(${Math.random() * 360},${18 + Math.random() * 22}%,${32 + Math.random() * 26}%)`;
      ctx.fillRect(px, sy - ph, 2 + Math.random() * 2.5, ph);
    }
  }
  // reflejo del cristal del escaparate
  ctx.fillStyle = 'rgba(160,190,210,0.25)';
  ctx.fillRect(x + 8, y0 + 4, 112, 100 - y0);
  ctx.fillStyle = '#8c949a';
  ctx.fillRect(x + 62, y0 + 4, 4, 100 - y0);
  ctx.fillRect(x + 6, y0 + 2, 116, 2);
}

function drawGarageDoor(ctx, x, w = 100) {
  ctx.fillStyle = '#7a8288';
  ctx.fillRect(x, 36, w, 72);
  ctx.strokeStyle = 'rgba(0,0,0,0.22)';
  ctx.lineWidth = 0.8;
  for (let y = 38; y < 106; y += 3.4) {
    ctx.beginPath();
    ctx.moveTo(x + 1, y);
    ctx.lineTo(x + w - 1, y);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(80,60,40,0.18)';
  ctx.fillRect(x, 92, w, 16);
}

/** bar o cafetería: frente de madera oscura, toldo a rayas ocre y cristales con luz cálida dentro */
function drawCafe(ctx, x) {
  ctx.fillStyle = '#4a3326';
  ctx.fillRect(x + 2, 14, 124, 94);
  ctx.fillStyle = '#2b2f36';
  ctx.fillRect(x + 6, 16, 116, 18);
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.fillRect(x + 6, 16, 116, 3);
  for (let i = 0; i < 12; i++) {
    ctx.fillStyle = i % 2 ? '#c99a3a' : '#f1e8d2';
    ctx.fillRect(x + 2 + i * 10.5, 34, 10.5, 9);
    ctx.beginPath();
    ctx.arc(x + 7.25 + i * 10.5, 43, 5.25, 0, Math.PI);
    ctx.fill();
  }
  for (const wx of [x + 8, x + 78]) {
    ctx.fillStyle = '#20282e';
    ctx.fillRect(wx, 50, 42, 56);
    const warm = ctx.createLinearGradient(0, 50, 0, 106);
    warm.addColorStop(0, '#8a6a3a');
    warm.addColorStop(1, '#3a2c1c');
    ctx.fillStyle = warm;
    ctx.fillRect(wx + 3, 53, 36, 50);
    ctx.fillStyle = 'rgba(255,225,160,0.35)';
    ctx.fillRect(wx + 6, 56, 30, 10);
    ctx.fillStyle = 'rgba(160,190,210,0.2)';
    ctx.fillRect(wx + 3, 53, 36, 50);
  }
  ctx.fillStyle = '#2a2420';
  ctx.fillRect(x + 54, 50, 20, 58);
  ctx.fillStyle = '#3e5a6a';
  ctx.fillRect(x + 57, 54, 14, 30);
}

/** local cerrado: persiana metálica bajada, con el cajón del rótulo apagado encima */
function drawPersiana(ctx, x, w = 100) {
  ctx.fillStyle = '#3a3f44';
  ctx.fillRect(x + 2, 14, w - 4, 20);
  ctx.fillStyle = '#8d9398';
  ctx.fillRect(x + 2, 36, w - 4, 72);
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 0.8;
  for (let y = 38; y < 106; y += 3) {
    ctx.beginPath();
    ctx.moveTo(x + 3, y);
    ctx.lineTo(x + w - 3, y);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.fillRect(x + 2, 34, w - 4, 4);
  ctx.fillStyle = 'rgba(60,50,40,0.2)';
  ctx.fillRect(x + 2, 96, w - 4, 12);
}

/** oficina o banco: cristalera azulada de arriba abajo con montantes de aluminio */
function drawOffice(ctx, x) {
  ctx.fillStyle = '#20282e';
  ctx.fillRect(x + 2, 14, 124, 94);
  ctx.fillStyle = '#1d3c6e';
  ctx.fillRect(x + 2, 14, 124, 18);
  const gg = ctx.createLinearGradient(x, 34, x + 124, 108);
  gg.addColorStop(0, '#4a6a86');
  gg.addColorStop(0.5, '#34506a');
  gg.addColorStop(1, '#2a4258');
  ctx.fillStyle = gg;
  ctx.fillRect(x + 4, 34, 120, 72);
  ctx.fillStyle = 'rgba(230,236,240,0.14)';
  ctx.fillRect(x + 4, 34, 120, 20);
  ctx.fillStyle = 'rgba(255,245,220,0.18)';
  ctx.fillRect(x + 36, 70, 56, 34);
  ctx.fillStyle = '#b8bec4';
  for (let i = 0; i <= 4; i++) ctx.fillRect(x + 3 + i * 30, 34, 2, 72);
  ctx.fillRect(x + 4, 68, 120, 2);
}

/** Plantas bajas: comercios (dos tiras distintas), residencial, industrial */
export function groundStrips(aniso = 8) {
  const S = 3;
  const [c1, ctx1] = stripBase(S);
  drawShop(ctx1, 0, '#2a5a7a', false);
  drawShop(ctx1, 128, '#8a2f2f', true);
  drawDoor(ctx1, 280, '#4a5560');
  drawGlass(ctx1, 330, 36, 40, 48);
  drawShop(ctx1, 384, '#2a6b4a', true);
  fineGrain(ctx1, 0.05, 0.4);

  const [c2, ctx2] = stripBase(S);
  drawDoor(ctx2, 20, '#6b4428');
  drawGlass(ctx2, 72, 36, 44, 52);
  drawShutter(ctx2, 60, 36, 12, 52, '#2f6b5a');
  drawShutter(ctx2, 116, 36, 12, 52, '#2f6b5a');
  drawGlass(ctx2, 150, 36, 44, 52);
  drawDoor(ctx2, 220, '#e8e0d4');
  drawGlass(ctx2, 280, 40, 40, 46);
  drawDoor(ctx2, 400, '#5a4030');
  drawGlass(ctx2, 450, 36, 40, 50);
  fineGrain(ctx2, 0.05, 0.4);

  const [c3, ctx3] = stripBase(S);
  ctx3.fillStyle = '#b0b4b8';
  ctx3.fillRect(0, 0, 512, 106);
  noise(ctx3, 2000, 0.02, 0.06, 0.4, 1.4);
  drawGarageDoor(ctx3, 16, 100);
  drawGlass(ctx3, 140, 28, 40, 28);
  drawGarageDoor(ctx3, 220, 130);
  drawGlass(ctx3, 380, 28, 40, 28);
  drawDoor(ctx3, 460, '#555a60');
  fineGrain(ctx3, 0.05, 0.4);

  // segunda tira de comercios: cafetería, local cerrado, portal, oficina y tienda con toldo naranja
  const [c4, ctx4] = stripBase(S);
  drawCafe(ctx4, 0);
  drawPersiana(ctx4, 128, 86);
  drawDoor(ctx4, 218, '#4a5560');
  drawOffice(ctx4, 256);
  drawShop(ctx4, 384, '#c46a1b', true);
  fineGrain(ctx4, 0.05, 0.4);

  const out = {};
  for (const [k, c] of [['shop', c1], ['shop2', c4], ['res', c2], ['ind', c3]]) {
    const tex = toTex(c, 1, aniso);
    const maps = pbrMaps(c, { rough: 0.86, roughVar: 0.12, glass: isGlass, aniso });
    tex.userData.orm = maps.orm;
    tex.userData.bump = maps.bump;
    out[k] = tex;
  }
  return out;
}

/** Corteza de palmera canaria: escamas en rombo */
export function barkTexture() {
  const [c, ctx] = canvas(64, 128, 4);
  ctx.fillStyle = '#6e5a42';
  ctx.fillRect(0, 0, 64, 128);
  for (let y = -6; y < 134; y += 7) {
    for (let x = -8; x < 72; x += 10) {
      const ox = (Math.floor(y / 7) % 2) * 5;
      const v = 0.75 + Math.random() * 0.35;
      ctx.fillStyle = `rgb(${Math.round(150 * v)},${Math.round(118 * v)},${Math.round(82 * v)})`;
      ctx.beginPath();
      ctx.moveTo(x + ox, y);
      ctx.lineTo(x + ox + 5, y + 6);
      ctx.lineTo(x + ox, y + 9);
      ctx.lineTo(x + ox - 5, y + 6);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(30,20,10,0.35)';
      ctx.fillRect(x + ox - 4, y + 8, 8, 1);
    }
  }
  fineGrain(ctx, 0.1, 0.5);
  return toTex(c);
}

/** Hoja de palmera (fronda pinnada) con transparencia, para alphaTest */
export function frondTexture() {
  const [c, ctx] = canvas(128, 512, 2);
  ctx.clearRect(0, 0, 128, 512);
  // raquis central
  ctx.strokeStyle = '#6f7a3a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(64, 512);
  ctx.lineTo(64, 4);
  ctx.stroke();
  // foliolos
  for (let y = 500; y > 8; y -= 6) {
    const t = 1 - y / 512;
    const len = 58 * Math.sin(Math.min(1, (1 - t) * 1.1) * Math.PI * 0.95) * (0.85 + Math.random() * 0.2);
    for (const side of [-1, 1]) {
      const g = 90 + Math.random() * 50;
      ctx.strokeStyle = `rgb(${Math.round(g * 0.42)},${Math.round(g)},${Math.round(g * 0.32)})`;
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(64, y);
      ctx.quadraticCurveTo(64 + side * len * 0.5, y - 10, 64 + side * len, y - 22 - Math.random() * 6);
      ctx.stroke();
    }
  }
  const tex = toTex(c, 1, 4);
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

/** Sombra de contacto (mancha radial) para coches y objetos */
export function contactShadowTexture() {
  const [c, ctx] = canvas(128);
  const g = ctx.createRadialGradient(64, 64, 6, 64, 64, 64);
  g.addColorStop(0, 'rgba(0,0,0,0.85)');
  g.addColorStop(0.55, 'rgba(0,0,0,0.45)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  return tex;
}

/** Matrícula española (blanca con franja azul UE) */
export function plateTexture(text) {
  const [c, ctx] = canvas(256, 56, 2);
  ctx.fillStyle = '#f6f6f2';
  ctx.fillRect(0, 0, 256, 56);
  ctx.fillStyle = '#1f4fa8';
  ctx.fillRect(0, 0, 30, 56);
  ctx.fillStyle = '#f4d23c';
  ctx.font = 'bold 9px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('★', 15, 18);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 15px Arial';
  ctx.fillText('E', 15, 46);
  ctx.fillStyle = '#111';
  ctx.font = 'bold 40px "Arial Narrow", Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 143, 30);
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, 254, 54);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// ── Charco de San Ginés: casas blancas, carpintería pintada y zócalo de piedra volcánica ──
// (aproximación artística; los colores vienen de zones.js)

/** zócalo de piedra volcánica oscura a ras de suelo */
function drawPlinth(ctx, W, y0, H) {
  ctx.fillStyle = '#5a554f';
  ctx.fillRect(0, y0, W, H - y0);
  for (let y = y0; y < H; y += 7) {
    let x = -Math.random() * 10;
    while (x < W) {
      const w = 8 + Math.random() * 12, v = 38 + Math.floor(Math.random() * 30);
      ctx.fillStyle = `rgb(${v},${v - 3},${v - 6})`;
      ctx.beginPath();
      ctx.ellipse(x + w / 2, y + 3.5, w / 2 - 0.8, 3, (Math.random() - 0.5) * 0.3, 0, Math.PI * 2);
      ctx.fill();
      x += w;
    }
  }
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.fillRect(0, y0, W, 1.2);
}

/** puerta de madera pintada de cuarterones, con su dintel blanco */
function drawPaintedDoor(ctx, x, w, color, dark) {
  ctx.fillStyle = '#e9e4da';
  ctx.fillRect(x - 3, 30, w + 6, 70);
  ctx.fillStyle = color;
  ctx.fillRect(x, 34, w, 66);
  ctx.strokeStyle = dark;
  ctx.lineWidth = 1.2;
  const leaves = w > 30 ? 2 : 1;
  for (let l = 0; l < leaves; l++) {
    const lx = x + l * (w / leaves);
    for (const py of [38, 62]) ctx.strokeRect(lx + 3, py, w / leaves - 6, 20);
  }
  if (leaves === 2) { ctx.beginPath(); ctx.moveTo(x + w / 2, 34); ctx.lineTo(x + w / 2, 100); ctx.stroke(); }
  ctx.fillStyle = '#d4b04a';
  ctx.fillRect(x + w * (leaves === 2 ? 0.45 : 0.8), 66, 1.6, 3);
}

/** ventana de madera pintada: marco y contraventanas del color de la casa */
function drawPaintedWindow(ctx, x, y, w, h, color, dark, shutters = true) {
  ctx.fillStyle = '#ebe6dc';
  ctx.fillRect(x - 3, y - 3, w + 6, h + 6);
  drawGlass(ctx, x, y, w, h);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.6;
  ctx.strokeRect(x + 1.3, y + 1.3, w - 2.6, h - 2.6);
  ctx.beginPath(); ctx.moveTo(x + w / 2, y + 1); ctx.lineTo(x + w / 2, y + h - 1); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + 1, y + h * 0.42); ctx.lineTo(x + w - 1, y + h * 0.42); ctx.stroke();
  if (shutters) {
    drawShutter(ctx, x - w * 0.32 - 3, y, w * 0.3, h, color);
    drawShutter(ctx, x + w + 3, y, w * 0.3, h, color);
  }
  ctx.fillStyle = dark;
  ctx.fillRect(x - 4, y + h + 2, w + 8, 2.5);
}

function charcoWall(ctx, W, H) {
  ctx.fillStyle = '#f7f5f0';
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 120; i++) {
    ctx.fillStyle = Math.random() < 0.5 ? 'rgba(190,182,168,0.07)' : 'rgba(255,255,255,0.1)';
    ctx.beginPath();
    ctx.ellipse(Math.random() * W, Math.random() * H, 4 + Math.random() * 12, 2 + Math.random() * 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  noise(ctx, 1800, 0.015, 0.04, 0.3, 1.1);
}

/** planta baja del Charco: 16 m en cuatro módulos (puertas, ventanas y una puerta de dos hojas) */
export function charcoGroundStrip(carp, green = false, aniso = 8) {
  const S = 3;
  const [c, ctx] = canvas(512, 128, S);
  charcoWall(ctx, 512, 128);
  const col = green ? carp.green : carp.blue, dark = green ? carp.greenDark : carp.blueDark;
  drawPaintedDoor(ctx, 18, 30, col, dark);
  drawPaintedWindow(ctx, 70, 42, 34, 40, col, dark);
  drawPaintedWindow(ctx, 160, 42, 34, 40, col, dark);
  drawPaintedDoor(ctx, 218, 30, col, dark);
  drawPaintedDoor(ctx, 286, 46, col, dark);
  drawPaintedWindow(ctx, 370, 42, 34, 40, col, dark, false);
  drawPaintedDoor(ctx, 440, 30, col, dark);
  // churretes y salitre sobre el zócalo
  const dirt = ctx.createLinearGradient(0, 86, 0, 104);
  dirt.addColorStop(0, 'rgba(120,110,95,0)');
  dirt.addColorStop(1, 'rgba(120,110,95,0.2)');
  ctx.fillStyle = dirt;
  ctx.fillRect(0, 86, 512, 18);
  drawPlinth(ctx, 512, 100, 128);
  fineGrain(ctx, 0.04, 0.4);
  const tex = toTex(c, 1, aniso);
  const maps = pbrMaps(c, { rough: 0.86, roughVar: 0.12, glass: isGlass, aniso });
  tex.userData.orm = maps.orm;
  tex.userData.bump = maps.bump;
  return tex;
}

/** planta alta del Charco: ventana de madera pintada con contraventanas, sin balcón */
export function charcoFacadeTexture(carp, green = false, aniso = 8) {
  const [c, ctx] = canvas(128, 128, 4);
  charcoWall(ctx, 128, 128);
  const col = green ? carp.green : carp.blue, dark = green ? carp.greenDark : carp.blueDark;
  drawPaintedWindow(ctx, 44, 28, 40, 54, col, dark);
  ctx.fillStyle = 'rgba(0,0,0,0.06)';
  ctx.fillRect(0, 124, 128, 4);
  fineGrain(ctx, 0.04, 0.4);
  const tex = toTex(c, 1, aniso);
  const maps = pbrMaps(c, { rough: 0.88, roughVar: 0.1, glass: isGlass, aniso, bumpBlur: 1.2 });
  tex.userData.orm = maps.orm;
  tex.userData.bump = maps.bump;
  return tex;
}

/**
 * planta alta del Charco con balcón de madera pintado (azul en el vídeo de referencia 2020,
 * min. 11:00–16:15): puerta balconera, suelo del balcón, balaustres y pasamanos
 */
export function charcoBalconyTexture(carp, aniso = 8) {
  const [c, ctx] = canvas(128, 128, 4);
  charcoWall(ctx, 128, 128);
  const col = carp.blue, dark = carp.blueDark;
  // puerta balconera de dos hojas con montante
  ctx.fillStyle = '#ebe6dc';
  ctx.fillRect(41, 14, 46, 96);
  drawGlass(ctx, 44, 17, 40, 74);
  ctx.strokeStyle = col;
  ctx.lineWidth = 2.6;
  ctx.strokeRect(45.3, 18.3, 37.4, 71.4);
  ctx.beginPath(); ctx.moveTo(64, 18); ctx.lineTo(64, 90); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(45, 34); ctx.lineTo(83, 34); ctx.stroke();
  // balcón corrido: suelo, balaustres torneados y pasamanos
  ctx.fillStyle = dark;
  ctx.fillRect(14, 106, 100, 6);
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.fillRect(14, 112, 100, 4);
  ctx.fillStyle = col;
  ctx.fillRect(14, 72, 100, 5);
  for (let x = 17; x < 112; x += 6.2) {
    ctx.fillRect(x, 77, 2.4, 29);
    ctx.fillRect(x - 0.6, 86, 3.6, 3);
  }
  ctx.fillRect(14, 72, 4, 34);
  ctx.fillRect(110, 72, 4, 34);
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fillRect(14, 72, 100, 1.4);
  fineGrain(ctx, 0.04, 0.4);
  const tex = toTex(c, 1, aniso);
  const maps = pbrMaps(c, { rough: 0.86, roughVar: 0.1, glass: isGlass, aniso, bumpBlur: 1.2 });
  tex.userData.orm = maps.orm;
  tex.userData.bump = maps.bump;
  return tex;
}
