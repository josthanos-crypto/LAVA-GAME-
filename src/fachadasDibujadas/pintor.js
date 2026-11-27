/**
 * Dibuja la fachada de una casa como una ilustración (estilo cartoon limpio) a partir de lo que se ve en su foto:
 * color de la pared, zócalo (piedra negra con juntas blancas, granito, liso o bloque), cornisa y franjas (con
 * rombos), esquinas (pilastras o sillares) y los huecos de la planta baja y de la de arriba, cada uno con su
 * carpintería. Solo se pinta lo que la casa tiene: cada casa trae su propia descripción.
 *
 * Huecos (tokens de `bajo` y `alto`, separados por espacios; «:n» fija el ancho en metros):
 *   P  puerta de cuarterones       PA puerta con arco y abanico   PD portón doble de tablas con montante de reja
 *   V  ventana con contraventanas de lamas (librillo)             VR ventana de cristal con reja
 *   VC ventana con cortina          VA ventana de aluminio blanco  B  balcón (puerta de cristal y barandilla)
 *   G  garaje seccional             M  persiana metálica (Mr: oxidada)  E  escaparate con reja blanca
 *   T  hueco tapiado con tablas     _  hueco vacío (solo separa)
 */

const ANCHO = { Es: 2.4, VB: 1.1, P: 1.0, PA: 1.15, PD: 2.6, V: 1.25, VR: 1.4, VC: 1.2, VA: 1.4, B: 1.3, G: 2.7, M: 2.8, Mr: 2.8, E: 2.4, T: 1.0, _: 0.8 };
const PRETIL = 0.6;
const PLANTA = 3.0;

function azar(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function rgb(hex) {
  const n = parseInt(String(hex).replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function tono(hex, f) {
  const [r, g, b] = rgb(hex);
  const m = v => Math.max(0, Math.min(255, Math.round(f >= 0 ? v + (255 - v) * f : v * (1 + f))));
  return `rgb(${m(r)},${m(g)},${m(b)})`;
}

export function huecos(texto) {
  return String(texto || '').trim().split(/\s+/).filter(Boolean).map(t => {
    const [k, w] = t.split(':');
    return { k, w: w ? +w : (ANCHO[k] ?? 1.2) };
  });
}

/** alto total del dibujo (casa + pretil), en metros */
export const altoDibujo = alto => alto + PRETIL;

/**
 * Pinta la casa en ctx, en el rectángulo (x0, y0) de ancho×(alto+pretil) metros a S píxeles por metro.
 * c: { pared, zoc: { t, c, h }, corn: { c, rombos, y }, franja: { c, y, h }, esq: { c, t }, carp, bajo, alto,
 *      num, cables, contador }
 */
export function pintarCasa(ctx, x0, y0, S, ancho, alto, c, seed = 1) {
  const R = azar(seed);
  const H = alto + PRETIL;
  const W = ancho;
  const X = m => x0 + m * S;
  const Y = m => y0 + (H - m) * S;          // m = altura sobre la acera
  const lw = Math.max(1, S / 26);
  const pared = c.pared || '#f2f0ea';
  const carp = c.carp || '#4a2c1f';

  ctx.save();
  ctx.beginPath();
  ctx.rect(x0, y0, W * S, H * S);
  ctx.clip();

  // ---- pared ----
  if (c.pared === 'bloque') pintarBloque(ctx, X, Y, S, W, 0, H, R);
  else {
    ctx.fillStyle = pared;
    ctx.fillRect(x0, y0, W * S, H * S);
    // revoco: motas suaves
    const n = Math.round(W * H * 22);
    for (let i = 0; i < n; i++) {
      ctx.fillStyle = R() < 0.5 ? tono(pared, -0.05) : tono(pared, 0.35);
      const s = (0.6 + R() * 1.4) * S / 40;
      ctx.fillRect(X(R() * W), Y(R() * H), s, s);
    }
    // churretes y sombra bajo el pretil
    const g = ctx.createLinearGradient(0, Y(alto), 0, Y(alto - 0.7));
    g.addColorStop(0, 'rgba(60,50,40,0.16)');
    g.addColorStop(1, 'rgba(60,50,40,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x0, Y(alto), W * S, 0.7 * S);
    const g2 = ctx.createLinearGradient(0, Y(0), 0, Y(1.4));
    g2.addColorStop(0, 'rgba(70,60,50,0.18)');
    g2.addColorStop(1, 'rgba(70,60,50,0)');
    ctx.fillStyle = g2;
    ctx.fillRect(x0, Y(1.4), W * S, 1.4 * S);
  }

  // ---- pretil: albardilla ----
  ctx.fillStyle = tono(pared === 'bloque' ? '#9d9890' : pared, -0.1);
  ctx.fillRect(x0, Y(H), W * S, 0.09 * S);
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.fillRect(x0, Y(H - 0.09), W * S, 0.04 * S);

  // ---- zócalo ----
  if (c.zoc) pintarZocalo(ctx, X, Y, S, W, c.zoc, R, lw);

  // ---- franja y cornisa ----
  if (c.franja) {
    ctx.fillStyle = c.franja.c;
    const fy = c.franja.y ?? alto - 0.55, fh = c.franja.h ?? 0.35;
    ctx.fillRect(x0, Y(fy + fh), W * S, fh * S);
  }
  if (c.corn) pintarCornisa(ctx, X, Y, S, W, alto, c.corn, lw);

  // ---- esquinas ----
  if (c.esq) pintarEsquinas(ctx, X, Y, S, W, alto, c.esq, lw);

  // ---- cables (en Arrecife van por la fachada) ----
  if (c.cables) {
    ctx.strokeStyle = 'rgba(25,25,25,0.85)';
    ctx.lineWidth = Math.max(1, S / 34);
    for (let k = 0; k < 2; k++) {
      const yc = alto - 0.35 - k * 0.09;
      ctx.beginPath();
      ctx.moveTo(X(0), Y(yc));
      const pasos = Math.max(2, Math.round(W / 2.2));
      for (let i = 1; i <= pasos; i++) {
        const xa = W * (i - 0.5) / pasos, xb = W * i / pasos;
        ctx.quadraticCurveTo(X(xa), Y(yc - 0.12), X(xb), Y(yc));
      }
      ctx.stroke();
    }
  }

  // ---- huecos ----
  const bajo = huecos(c.bajo);
  colocar(bajo, W).forEach(([h, xm]) => pintarHueco(ctx, X, Y, S, h, xm, 0, carp, R, lw, c));
  // plantas de arriba: cada una a 3 m; `alto` vale para todas y `ultima` (si la hay) para la de más arriba
  // si no se dijo nada de arriba, ventanas de aluminio repartidas (mejor que una pared lisa)
  if (alto > 4.5 && !c.alto) c = { ...c, alto: Array(Math.max(1, Math.round(W / 3.6))).fill('VA').join(' ') };
  if (alto > 4.5 && c.alto) {
    const plantas = Math.max(1, Math.floor((alto - 0.4) / PLANTA) - 1);
    for (let p = 1; p <= plantas; p++) {
      const texto = p === plantas && c.ultima ? c.ultima : c.alto;
      colocar(huecos(texto), W).forEach(([h, xm]) => pintarHueco(ctx, X, Y, S, h, xm, PLANTA * p, c.carpAlto || carp, R, lw, c));
    }
  }

  // ---- contador y número ----
  if (c.contador) {
    const xm = W * (c.contador.x ?? 0.15);
    caja(ctx, X(xm), Y(1.55), 0.42 * S, 0.5 * S, '#f4f4f1', '#9a9a95', lw);
    ctx.fillStyle = '#c8c8c3';
    ctx.fillRect(X(xm + 0.08), Y(1.4), 0.26 * S, 0.12 * S);
  }
  if (c.num) {
    const xm = W * (c.numX ?? 0.5);
    caja(ctx, X(xm), Y(2.55), 0.32 * S, 0.24 * S, '#2f5fa8', '#1d3c6e', lw);
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.round(0.17 * S)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(c.num), X(xm + 0.16), Y(2.43));
  }

  // sombra de contacto con la acera
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.fillRect(x0, Y(0.05), W * S, 0.05 * S);
  ctx.restore();
}

/** reparte los huecos a lo largo de la fachada con el mismo aire entre ellos */
function colocar(lista, W) {
  if (!lista.length) return [];
  const total = lista.reduce((s, h) => s + h.w, 0);
  const escala = total > W * 0.92 ? (W * 0.92) / total : 1;
  const aire = (W - total * escala) / (lista.length + 1);
  let x = aire;
  return lista.map(h => {
    const r = [{ ...h, w: h.w * escala }, x];
    x += h.w * escala + aire;
    return r;
  });
}

function caja(ctx, x, y, w, h, fill, linea, lw) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = linea;
  ctx.lineWidth = lw;
  ctx.strokeRect(x + lw / 2, y + lw / 2, w - lw, h - lw);
}

function pintarBloque(ctx, X, Y, S, W, y0, y1, R) {
  ctx.fillStyle = '#8f8a82';
  ctx.fillRect(X(0), Y(y1), W * S, (y1 - y0) * S);
  for (let fila = 0, y = y0; y < y1; fila++, y += 0.2) {
    for (let x = fila % 2 ? -0.2 : 0; x < W; x += 0.4) {
      ctx.fillStyle = tono('#a29d94', (R() - 0.5) * 0.18);
      ctx.fillRect(X(x) + 1, Y(y + 0.2) + 1, 0.4 * S - 2, 0.2 * S - 2);
    }
  }
}

function pintarZocalo(ctx, X, Y, S, W, z, R, lw) {
  const h = z.h ?? 0.9;
  const col = z.c || '#9a9a96';
  if (z.t === 'piedra') {
    // piedra volcánica (o de color si se da c) con juntas blancas, a la canaria
    const junta = z.junta || '#f3f1ea';
    ctx.fillStyle = junta;
    ctx.fillRect(X(0), Y(h), W * S, h * S);
    // mosaico de piedras encajadas: una red de puntos movidos al azar; cada celda es una piedra y las juntas
    // blancas van entre ellas (como el zócalo canario de piedra volcánica)
    const dx = 0.36, dy = 0.27;
    const cols = Math.ceil(W / dx) + 2, filas = Math.max(2, Math.ceil(h / dy));
    const red = [];
    for (let j = 0; j <= filas; j++) {
      const fila = [];
      for (let i = 0; i <= cols; i++) {
        const borde = j === 0 || j === filas;
        const px = (i - 1) * dx + (R() - 0.5) * dx * 0.5;
        const py = borde ? (j === 0 ? -0.02 : h + 0.02) : j * (h / filas) + (R() - 0.5) * dy * 0.35;
        fila.push([px, py]);
      }
      red.push(fila);
    }
    for (let j = 0; j < filas; j++) {
      for (let i = 0; i < cols; i++) {
        const a = red[j][i], b = red[j][i + 1], c2 = red[j + 1][i + 1], d = red[j + 1][i];
        // a veces dos celdas forman una piedra más larga
        const larga = R() < 0.22 && i < cols - 1;
        const b2 = larga ? red[j][i + 2] : b, c3 = larga ? red[j + 1][i + 2] : c2;
        const t0 = (R() - 0.5) * 0.45;
        // esquinas redondeadas: se pasa por el medio de cada lado y se curva en cada esquina
        const q = [a, b2, c3, d];
        const mid = (p, r) => [(p[0] + r[0]) / 2, (p[1] + r[1]) / 2];
        ctx.beginPath();
        const m0 = mid(q[3], q[0]);
        ctx.moveTo(X(m0[0]), Y(m0[1]));
        for (let s = 0; s < 4; s++) {
          const esq = q[s], m1 = mid(q[s], q[(s + 1) % 4]);
          ctx.quadraticCurveTo(X(esq[0]), Y(esq[1]), X(m1[0]), Y(m1[1]));
        }
        ctx.closePath();
        ctx.fillStyle = tono(col, t0);
        ctx.fill();
        ctx.strokeStyle = junta;
        ctx.lineWidth = Math.max(2, 0.065 * S);
        ctx.lineJoin = 'round';
        ctx.stroke();
        // brillo en el canto de arriba de la piedra
        ctx.strokeStyle = tono(col, t0 + 0.3);
        ctx.lineWidth = Math.max(1, lw * 0.7);
        ctx.beginPath();
        ctx.moveTo(X(d[0] + 0.06), Y(d[1] - 0.045));
        ctx.lineTo(X(d[0] + (c3[0] - d[0]) * 0.6), Y(d[1] + (c3[1] - d[1]) * 0.6 - 0.045));
        ctx.stroke();
        if (larga) i++;
      }
    }
  } else if (z.t === 'granito') {
    ctx.fillStyle = col;
    ctx.fillRect(X(0), Y(h), W * S, h * S);
    const n = Math.round(W * h * 260);
    for (let i = 0; i < n; i++) {
      ctx.fillStyle = R() < 0.5 ? tono(col, -0.35) : tono(col, 0.4);
      const s = (0.5 + R()) * S / 45;
      ctx.fillRect(X(R() * W), Y(R() * h), s, s);
    }
    ctx.strokeStyle = tono(col, -0.3);
    ctx.lineWidth = Math.max(1, lw * 0.6);
    const fh = h > 1.2 ? h / 3 : h / 2;
    for (let y = fh; y < h - 0.01; y += fh) { ctx.beginPath(); ctx.moveTo(X(0), Y(y)); ctx.lineTo(X(W), Y(y)); ctx.stroke(); }
    for (let x = 0.6; x < W; x += 0.6) { ctx.beginPath(); ctx.moveTo(X(x), Y(0)); ctx.lineTo(X(x), Y(h)); ctx.stroke(); }
  } else if (z.t === 'bloque') {
    pintarBloque(ctx, X, Y, S, W, 0, h, R);
  } else {
    ctx.fillStyle = col;
    ctx.fillRect(X(0), Y(h), W * S, h * S);
  }
  // remate del zócalo
  ctx.fillStyle = tono(col, -0.25);
  ctx.fillRect(X(0), Y(h) - lw, W * S, lw * 1.5);
}

function pintarCornisa(ctx, X, Y, S, W, alto, k, lw) {
  const y = k.y ?? alto - 0.25;
  ctx.fillStyle = k.c;
  ctx.fillRect(X(0), Y(y + 0.14), W * S, 0.14 * S);
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.fillRect(X(0), Y(y), W * S, 0.04 * S);
  if (k.rombos) {
    const y2 = y - 0.55;
    ctx.fillStyle = k.c;
    ctx.fillRect(X(0), Y(y2 + 0.1), W * S, 0.1 * S);
    const yc = (y + y2 + 0.1) / 2;
    for (let x = 0.9; x < W - 0.3; x += 1.8) {
      ctx.beginPath();
      ctx.moveTo(X(x), Y(yc + 0.17));
      ctx.lineTo(X(x + 0.17), Y(yc));
      ctx.lineTo(X(x), Y(yc - 0.17));
      ctx.lineTo(X(x - 0.17), Y(yc));
      ctx.closePath();
      ctx.fill();
    }
  }
}

function pintarEsquinas(ctx, X, Y, S, W, alto, e, lw) {
  const lados = e.lados || [0, 1];
  for (const lado of lados) {
    const x = lado ? W - 0.35 : 0;
    if (e.t === 'sillares') {
      for (let y = 0, i = 0; y < alto; y += 0.35, i++) {
        const w = i % 2 ? 0.25 : 0.4;
        const xx = lado ? W - w : 0;
        ctx.fillStyle = e.c;
        ctx.fillRect(X(xx), Y(y + 0.31), w * S, 0.31 * S);
      }
    } else {
      ctx.fillStyle = e.c;
      ctx.fillRect(X(x), Y(alto), 0.35 * S, alto * S);
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.fillRect(X(x), Y(alto), lw * 1.5, alto * S);
    }
  }
}

/** marco con sombra interior (le da relieve de hueco metido en la pared) */
function hueco(ctx, X, Y, S, x, y, w, h, marco, lw) {
  ctx.fillStyle = tono(marco, -0.45);
  ctx.fillRect(X(x) - lw, Y(y + h) - lw, w * S + lw * 2, h * S + lw * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(X(x), Y(y + h), w * S, 0.07 * S);
}

function cristal(ctx, X, Y, S, x, y, w, h) {
  const g = ctx.createLinearGradient(X(x), Y(y + h), X(x + w), Y(y));
  g.addColorStop(0, '#6f8796');
  g.addColorStop(0.55, '#3c4f5c');
  g.addColorStop(1, '#2a3740');
  ctx.fillStyle = g;
  ctx.fillRect(X(x), Y(y + h), w * S, h * S);
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = Math.max(1, S / 30);
  ctx.beginPath();
  ctx.moveTo(X(x + w * 0.2), Y(y + h * 0.95));
  ctx.lineTo(X(x + w * 0.05), Y(y + h * 0.65));
  ctx.stroke();
}

function alfeizar(ctx, X, Y, S, x, y, w, lw) {
  ctx.fillStyle = '#e8e4da';
  ctx.fillRect(X(x - 0.06), Y(y), (w + 0.12) * S, 0.07 * S);
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fillRect(X(x - 0.06), Y(y - 0.07), (w + 0.12) * S, lw);
}

function lamas(ctx, X, Y, S, x, y, w, h, col, lw) {
  // las contraventanas oscuras se pintan algo más claras para que se lean las lamas
  const base = tono(col, 0.22);
  ctx.fillStyle = base;
  ctx.fillRect(X(x), Y(y + h), w * S, h * S);
  for (let yy = y + 0.1; yy < y + h - 0.08; yy += 0.07) {
    ctx.fillStyle = tono(col, -0.35);
    ctx.fillRect(X(x + 0.07), Y(yy), (w - 0.14) * S, Math.max(1, lw * 0.9));
    ctx.fillStyle = tono(col, 0.42);
    ctx.fillRect(X(x + 0.07), Y(yy) - Math.max(1, lw * 0.7), (w - 0.14) * S, Math.max(1, lw * 0.6));
  }
  // bastidor
  ctx.strokeStyle = tono(col, -0.15);
  ctx.lineWidth = Math.max(1, 0.06 * S);
  ctx.strokeRect(X(x) + 0.03 * S, Y(y + h) + 0.03 * S, w * S - 0.06 * S, h * S - 0.06 * S);
  ctx.fillStyle = tono(col, 0.05);
  ctx.fillRect(X(x + 0.06), Y(y + h * 0.52), (w - 0.12) * S, 0.06 * S);
}

function cuarterones(ctx, X, Y, S, x, y, w, h, col, lw, cols = 2, filas = 3) {
  ctx.fillStyle = col;
  ctx.fillRect(X(x), Y(y + h), w * S, h * S);
  const m = 0.1;
  const pw = (w - m * (cols + 1)) / cols, ph = (h - m * (filas + 1)) / filas;
  for (let i = 0; i < cols; i++) for (let j = 0; j < filas; j++) {
    const px = x + m + i * (pw + m), py = y + m + j * (ph + m);
    ctx.fillStyle = tono(col, 0.12);
    ctx.fillRect(X(px), Y(py + ph), pw * S, ph * S);
    ctx.fillStyle = tono(col, -0.35);
    ctx.fillRect(X(px), Y(py), pw * S, lw);
    ctx.fillRect(X(px + pw) - lw, Y(py + ph), lw, ph * S);
    ctx.fillStyle = tono(col, 0.3);
    ctx.fillRect(X(px), Y(py + ph), pw * S, lw);
  }
}

function reja(ctx, X, Y, S, x, y, w, h, col, lw, paso = 0.13) {
  ctx.strokeStyle = col;
  ctx.lineWidth = Math.max(1, lw * 1.1);
  for (let xx = x + paso; xx < x + w - 0.03; xx += paso) {
    ctx.beginPath(); ctx.moveTo(X(xx), Y(y)); ctx.lineTo(X(xx), Y(y + h)); ctx.stroke();
  }
  for (const f of [0.25, 0.75]) {
    ctx.beginPath(); ctx.moveTo(X(x), Y(y + h * f)); ctx.lineTo(X(x + w), Y(y + h * f)); ctx.stroke();
  }
  ctx.strokeRect(X(x), Y(y + h), w * S, h * S);
}

/** toldo de lona visto de frente: faldón con su sombra y el borde ondulado */
function toldo(ctx, X, Y, S, x, y, w, col, lw) {
  const x0 = x - 0.15, x1 = x + w + 0.15, alto = 0.75;
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.fillRect(X(x0), Y(y - 0.05), (x1 - x0) * S, 0.35 * S);
  const g = ctx.createLinearGradient(0, Y(y + alto), 0, Y(y));
  g.addColorStop(0, tono(col, -0.15));
  g.addColorStop(1, tono(col, 0.12));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(X(x0 + 0.1), Y(y + alto));
  ctx.lineTo(X(x1 - 0.1), Y(y + alto));
  ctx.lineTo(X(x1), Y(y + 0.12));
  ctx.lineTo(X(x0), Y(y + 0.12));
  ctx.closePath();
  ctx.fill();
  // faldón con ondas
  ctx.fillStyle = tono(col, -0.08);
  ctx.beginPath();
  ctx.moveTo(X(x0), Y(y + 0.12));
  for (let xx = x0; xx < x1 - 0.01; xx += 0.3) {
    ctx.lineTo(X(xx + 0.15), Y(y - 0.02));
    ctx.lineTo(X(Math.min(x1, xx + 0.3)), Y(y + 0.12));
  }
  ctx.lineTo(X(x1), Y(y + 0.12));
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = tono(col, -0.35);
  ctx.lineWidth = Math.max(1, lw);
  ctx.beginPath(); ctx.moveTo(X(x0), Y(y + 0.12)); ctx.lineTo(X(x1), Y(y + 0.12)); ctx.stroke();
}

function pintarHueco(ctx, X, Y, S, h, x, base, carp, R, lw, c) {
  const w = h.w;
  const k = h.k;
  if (k === '_') return;
  if (k === 'P' || k === 'PA') {
    const alto = k === 'PA' ? 2.45 : 2.2;
    hueco(ctx, X, Y, S, x, base, w, alto, carp, lw);
    if (k === 'PA') {
      const r = w / 2, cy = base + alto - r;
      cuarterones(ctx, X, Y, S, x, base, w, alto - r, carp, lw, 2, 3);
      ctx.fillStyle = '#3a4c58';
      ctx.beginPath(); ctx.moveTo(X(x), Y(cy)); ctx.arc(X(x + r), Y(cy), r * S, Math.PI, 0); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = carp; ctx.lineWidth = lw * 1.3;
      for (let a = 1; a < 6; a++) {
        const t = Math.PI + (a / 6) * Math.PI;
        ctx.beginPath(); ctx.moveTo(X(x + r), Y(cy)); ctx.lineTo(X(x + r) + Math.cos(t) * r * S, Y(cy) + Math.sin(t) * r * S); ctx.stroke();
      }
      ctx.beginPath(); ctx.arc(X(x + r), Y(cy), r * S, Math.PI, 0); ctx.stroke();
    } else {
      cuarterones(ctx, X, Y, S, x, base, w, alto - 0.3, carp, lw, 2, 3);
      // montante de cristal
      ctx.fillStyle = tono(carp, -0.2);
      ctx.fillRect(X(x), Y(base + alto), w * S, 0.3 * S);
      cristal(ctx, X, Y, S, x + 0.08, base + alto - 0.25, w - 0.16, 0.18);
    }
    ctx.fillStyle = '#d8b25a';
    ctx.beginPath(); ctx.arc(X(x + w * 0.82), Y(base + 1.05), Math.max(1.5, S * 0.035), 0, Math.PI * 2); ctx.fill();
    // escalón
    ctx.fillStyle = '#cfcac0';
    ctx.fillRect(X(x - 0.08), Y(base + 0.06), (w + 0.16) * S, 0.06 * S);
    return;
  }
  if (k === 'PD') {
    const alto = Math.min(3.1, (c.alturaBajo ?? 3.6) - 0.4);
    hueco(ctx, X, Y, S, x, base, w, alto, carp, lw);
    const hm = 0.45;
    ctx.fillStyle = tono(carp, -0.3);
    ctx.fillRect(X(x), Y(base + alto), w * S, hm * S);
    reja(ctx, X, Y, S, x + 0.05, base + alto - hm + 0.04, w - 0.1, hm - 0.08, tono(carp, -0.55), lw, 0.11);
    const hh = alto - hm;
    ctx.fillStyle = carp;
    ctx.fillRect(X(x), Y(base + hh), w * S, hh * S);
    ctx.strokeStyle = tono(carp, -0.35);
    ctx.lineWidth = Math.max(1, lw * 0.7);
    for (let xx = x + 0.12; xx < x + w; xx += 0.12) {
      ctx.beginPath(); ctx.moveTo(X(xx), Y(base + 0.1)); ctx.lineTo(X(xx), Y(base + hh - 0.1)); ctx.stroke();
    }
    ctx.lineWidth = lw * 1.6;
    ctx.beginPath(); ctx.moveTo(X(x + w / 2), Y(base)); ctx.lineTo(X(x + w / 2), Y(base + hh)); ctx.stroke();
    for (const q of [0.25, 0.75]) ctx.strokeRect(X(x + w * q - w * 0.2), Y(base + hh - 0.15), w * 0.4 * S, (hh - 0.3) * S);
    return;
  }
  if (k === 'G' || k === 'M' || k === 'Mr') {
    const alto = Math.min(2.7, (c.alturaBajo ?? 3.4) - 0.5);
    hueco(ctx, X, Y, S, x, base, w, alto, carp, lw);
    if (k === 'G') {
      const col = carp;
      ctx.fillStyle = col;
      ctx.fillRect(X(x), Y(base + alto), w * S, alto * S);
      const n = 5;
      for (let i = 1; i < n; i++) {
        const yy = base + alto * i / n;
        ctx.fillStyle = tono(col, -0.3);
        ctx.fillRect(X(x), Y(yy), w * S, lw * 1.2);
        ctx.fillStyle = tono(col, 0.25);
        ctx.fillRect(X(x), Y(yy) + lw * 1.2, w * S, lw);
      }
      if (c.garajeVentanas) {
        const yy = base + alto * 3.5 / n;
        for (let i = 0; i < 4; i++) cristal(ctx, X, Y, S, x + w * (0.12 + i * 0.21), yy - 0.1, w * 0.13, 0.2);
      }
    } else {
      const rust = k === 'Mr';
      const base1 = rust ? '#a98b6f' : (c.persiana || '#c9ccce');
      ctx.fillStyle = base1;
      ctx.fillRect(X(x), Y(base + alto), w * S, alto * S);
      for (let yy = base + 0.06; yy < base + alto; yy += 0.075) {
        ctx.fillStyle = rust ? (R() < 0.3 ? '#8a5a3a' : '#b89b80') : tono(base1, -0.18);
        ctx.fillRect(X(x), Y(yy), w * S, Math.max(1, lw * 0.7));
      }
      // cajón de la persiana y guías
      ctx.fillStyle = c.marcoPersiana || carp;
      ctx.fillRect(X(x - 0.08), Y(base + alto + 0.35), (w + 0.16) * S, 0.35 * S);
      ctx.fillRect(X(x - 0.08), Y(base + alto), 0.08 * S, alto * S);
      ctx.fillRect(X(x + w), Y(base + alto), 0.08 * S, alto * S);
      ctx.fillStyle = '#555';
      ctx.fillRect(X(x + w / 2 - 0.1), Y(base + 0.18), 0.2 * S, 0.05 * S);
    }
    return;
  }
  if (k === 'E' || k === 'Es') {
    const alto = 2.5;
    hueco(ctx, X, Y, S, x, base, w, alto, carp, lw);
    cristal(ctx, X, Y, S, x, base, w, alto);
    ctx.fillStyle = 'rgba(255,240,210,0.15)';
    ctx.fillRect(X(x), Y(base + 1.8), w * S, 1.0 * S);
    if (k === 'E') reja(ctx, X, Y, S, x, base, w, alto, c.rejaEscaparate || '#f2f2ef', lw, 0.16);
    else {
      // perfil de aluminio y un montante
      ctx.strokeStyle = c.marcoEscaparate || '#e9e9e6';
      ctx.lineWidth = Math.max(2, 0.06 * S);
      ctx.strokeRect(X(x), Y(base + alto), w * S, alto * S);
      ctx.beginPath(); ctx.moveTo(X(x), Y(base + 0.35)); ctx.lineTo(X(x + w), Y(base + 0.35)); ctx.stroke();
      if (w > 2) { ctx.beginPath(); ctx.moveTo(X(x + w / 2), Y(base)); ctx.lineTo(X(x + w / 2), Y(base + alto)); ctx.stroke(); }
    }
    if (c.toldo) toldo(ctx, X, Y, S, x, base + alto + 0.15, w, c.toldo, lw);
    return;
  }
  if (k === 'VB') {
    // puerta-ventana con balconcillo (barandilla pegada a la fachada)
    const alto = 2.15;
    hueco(ctx, X, Y, S, x, base + 0.1, w, alto, '#f0f0ee', lw);
    cristal(ctx, X, Y, S, x, base + 0.1, w, alto);
    ctx.strokeStyle = c.carpAlto || '#f4f4f2'; ctx.lineWidth = lw * 2;
    ctx.strokeRect(X(x) + lw, Y(base + 0.1 + alto) + lw, w * S - 2 * lw, alto * S - 2 * lw);
    ctx.beginPath(); ctx.moveTo(X(x + w / 2), Y(base + 0.1)); ctx.lineTo(X(x + w / 2), Y(base + 0.1 + alto)); ctx.stroke();
    reja(ctx, X, Y, S, x - 0.06, base + 0.1, w + 0.12, 0.95, c.barandilla || '#f4f4f2', lw, 0.1);
    return;
  }
  if (k === 'T') {
    const yb = base + 0.9, alto = 1.2;
    hueco(ctx, X, Y, S, x, yb, w, alto, '#6b5a48', lw);
    for (let xx = x; xx < x + w - 0.01; xx += 0.14) {
      ctx.fillStyle = tono('#8a6a48', (R() - 0.5) * 0.3);
      ctx.fillRect(X(xx) + 1, Y(yb + alto), 0.14 * S - 2, alto * S);
    }
    return;
  }
  if (k === 'B') {
    const alto = 2.3;
    hueco(ctx, X, Y, S, x, base, w, alto, carp, lw);
    cristal(ctx, X, Y, S, x + 0.05, base, w - 0.1, alto - 0.05);
    ctx.strokeStyle = carp; ctx.lineWidth = lw * 1.4;
    ctx.beginPath(); ctx.moveTo(X(x + w / 2), Y(base)); ctx.lineTo(X(x + w / 2), Y(base + alto)); ctx.stroke();
    // losa y barandilla por delante
    const bx = x - 0.35, bw = w + 0.7;
    ctx.fillStyle = '#e6e2d8';
    ctx.fillRect(X(bx), Y(base + 0.06), bw * S, 0.14 * S);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(X(bx), Y(base - 0.08), bw * S, 0.06 * S);
    reja(ctx, X, Y, S, bx, base + 0.06, bw, 0.95, c.barandilla || '#2a2a2a', lw, 0.12);
    return;
  }
  // ventanas
  const yb = base + (c.antepecho ?? 0.95), alto = h.k === 'VR' && c.ventanaAlta ? 0.9 : 1.25;
  const y0 = c.ventanaAlta && h.k === 'VR' ? base + 1.6 : yb;
  hueco(ctx, X, Y, S, x, y0, w, alto, k === 'VA' ? '#f0f0ee' : carp, lw);
  alfeizar(ctx, X, Y, S, x, y0, w, lw);
  if (k === 'V') {
    lamas(ctx, X, Y, S, x, y0, w / 2, alto, carp, lw);
    lamas(ctx, X, Y, S, x + w / 2, y0, w / 2, alto, carp, lw);
  } else if (k === 'VR') {
    cristal(ctx, X, Y, S, x, y0, w, alto);
    ctx.strokeStyle = carp; ctx.lineWidth = lw * 1.5;
    ctx.strokeRect(X(x) + lw, Y(y0 + alto) + lw, w * S - 2 * lw, alto * S - 2 * lw);
    reja(ctx, X, Y, S, x, y0, w, alto, c.reja || carp, lw, 0.14);
  } else if (k === 'VC') {
    cristal(ctx, X, Y, S, x, y0, w, alto);
    // visillos blancos a los dos lados, con sus pliegues
    for (const lado of [0, 1]) {
      const xa = lado ? x + w * 0.56 : x + 0.05, xb = lado ? x + w - 0.05 : x + w * 0.44;
      ctx.fillStyle = 'rgba(246,243,236,0.92)';
      ctx.fillRect(X(xa), Y(y0 + alto - 0.05), (xb - xa) * S, (alto - 0.1) * S);
      ctx.strokeStyle = 'rgba(190,184,172,0.9)';
      ctx.lineWidth = Math.max(1, lw * 0.7);
      for (let xx = xa + 0.06; xx < xb - 0.02; xx += 0.07) {
        ctx.beginPath(); ctx.moveTo(X(xx), Y(y0 + alto - 0.06)); ctx.lineTo(X(xx), Y(y0 + 0.06)); ctx.stroke();
      }
    }
    ctx.strokeStyle = carp; ctx.lineWidth = lw * 2;
    ctx.strokeRect(X(x) + lw, Y(y0 + alto) + lw, w * S - 2 * lw, alto * S - 2 * lw);
    ctx.beginPath(); ctx.moveTo(X(x + w / 2), Y(y0)); ctx.lineTo(X(x + w / 2), Y(y0 + alto)); ctx.stroke();
  } else {
    cristal(ctx, X, Y, S, x, y0, w, alto);
    ctx.strokeStyle = '#f4f4f2'; ctx.lineWidth = lw * 2;
    ctx.strokeRect(X(x) + lw, Y(y0 + alto) + lw, w * S - 2 * lw, alto * S - 2 * lw);
    ctx.beginPath(); ctx.moveTo(X(x + w / 2), Y(y0)); ctx.lineTo(X(x + w / 2), Y(y0 + alto)); ctx.stroke();
  }
}
