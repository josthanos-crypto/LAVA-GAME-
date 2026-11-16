import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { Kit, canvasTex } from './interiorKit.js';
import { laurel } from './sanGines.js';

/**
 * La calle del tanatorio (Juan de Quesada, de la esquina de Ingeniero Paz Peraza hacia la rotonda del
 * tanatorio), con las dos fotos de José Manuel. En la acera de los edificios, de la esquina hacia el
 * tanatorio:
 *  - el solar con su muro blanco largo, la valla de chapa de la esquina y el árbol grande de dentro;
 *  - el edificio de cuatro plantas: abajo de granito gris con las ventanas en arco y arriba amarillo, con
 *    las ventanas de recerco de piedra y las barandillas negras, y en medio la ventana larga de la escalera.
 *    En la planta baja, la Taquería Dichell Fusión's (rótulo negro con flores, terraza de hierro negro con
 *    toldos beis y la pancarta de abajo), el portal y el Oishi Restaurante Japonés (fachada de listones
 *    negros con su rótulo, la puerta blanca, las cartas, la sombrilla blanca y la valla negra de cruces);
 *  - el edificio blanco alto de al lado: el otro rótulo del Oishi, el cierre blanco, la correduría
 *    Graciplus (mediador de seguros) y los balcones;
 * y en la acera de en medio, la farola blanca de campanas azules y los flamboyanes.
 * Los nombres son los de los rótulos de las fotos. El mapa trae toda la manzana como un bloque de 5 m:
 * tuneLocalesTanatorio le quita el solar y lo demás va por delante de su pared y encima.
 */

// la fachada a Juan de Quesada del bloque del mapa: B, la esquina de Ingeniero Paz Peraza; A, hacia el tanatorio
const B0 = [608, 34], A0 = [659, -22];
const SOLAR = 12, SOLAR_FONDO = 15;
// la franja de la escalera del edificio de los locales (entre la taquería y el Oishi)
const CL = 18.6, CR = 20.2;
const WHITE = 0xf2f1ec, YELLOW = 0xf3e3b0, STONE = 0xe4dccb, BLACK = 0x1c1d1f;
const SCRIPT = '"Segoe Script", "Brush Script MT", "Lucida Handwriting", "Comic Sans MS", cursive';
const SERIF = '"Times New Roman", Georgia, serif';
const SANS = '"Barlow", Arial, sans-serif';

/** el marco de la fachada: s a lo largo (desde B), z hacia la calle (yendo de B a A, la manzana queda a la derecha) */
function marco(B, A) {
  const len = Math.hypot(A[0] - B[0], A[1] - B[1]);
  const U = [(A[0] - B[0]) / len, (A[1] - B[1]) / len], N = [-U[1], U[0]];
  return { B, len, U, N, W: (s, z) => [B[0] + U[0] * s + N[0] * z, B[1] + U[1] * s + N[1] * z], ry: Math.atan2(N[0], N[1]) };
}

/**
 * antes de levantar la ciudad: al bloque del mapa se le quita el solar de la esquina (12 m de fachada y
 * 15 de fondo), que en la foto es un solar tapiado con un árbol
 */
export function tuneLocalesTanatorio(map) {
  const near = (q, p) => Math.hypot(q[0] - p[0], q[1] - p[1]) < 1.5;
  const b = (map.buildings || []).find(q => !q.skip && q.p.some(v => near(v, B0)) && q.p.some(v => near(v, A0)));
  if (!b) return;
  const ring = b.p[0][0] === b.p[b.p.length - 1][0] && b.p[0][1] === b.p[b.p.length - 1][1] ? b.p.slice(0, -1) : b.p.slice();
  const iB = ring.findIndex(v => near(v, B0)), iA = ring.findIndex(v => near(v, A0)), n = ring.length;
  if (iB < 0 || iA < 0) return;
  // el vecino de B que no es A: el lado de Ingeniero Paz Peraza
  const iC = (iB + 1) % n === iA ? (iB - 1 + n) % n : (iB + 1) % n;
  const B = ring[iB], A = ring[iA], C = ring[iC];
  const M = marco(B, A);
  const P1 = M.W(SOLAR, 0), P3 = M.W(SOLAR, -SOLAR_FONDO);
  // en el lado de Paz Peraza, el punto a 15 m de fondo
  const dC = -((C[0] - B[0]) * M.N[0] + (C[1] - B[1]) * M.N[1]);
  const t = Math.min(0.95, SOLAR_FONDO / dC), P4 = [B[0] + (C[0] - B[0]) * t, B[1] + (C[1] - B[1]) * t];
  // B se cambia por el entrante del solar, en el orden que toca
  const notch = iC === (iB + 1) % n ? [P1, P3, P4] : [P4, P3, P1];
  ring.splice(iB, 1, ...notch);
  b.p = [...ring, ring[0]];
  map.localesTanatorio = { B, A, C, P1, P3, P4 };
}

// ——— lo que se pinta en lienzo ———

/** granito gris moteado (la planta baja y la primera del edificio de los locales) */
function granito(g, w, h) {
  g.fillStyle = '#9a9692';
  g.fillRect(0, 0, w, h);
  let s = 11;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < w * h / 10; i++) {
    const v = 110 + r() * 90;
    g.fillStyle = `rgba(${v},${v - 3},${v - 6},.55)`;
    g.fillRect(r() * w, r() * h, 1.5, 1.5);
  }
  g.strokeStyle = 'rgba(70,68,66,.35)';
  g.lineWidth = 1;
  for (let y = 0; y < h; y += h / 9) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  for (let x = 0; x < w; x += w / 14) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
}

/** ventana de marco negro con cuarterones (y el arco de arriba, si va en arco) */
function ventanaNegra(cols, rows, { arco = false, fondo = '#9a9692' } = {}) {
  return (g, w, h) => {
    g.fillStyle = fondo;
    g.fillRect(0, 0, w, h);
    const top = arco ? h * 0.2 : 0;
    g.save();
    g.beginPath();
    if (arco) {
      g.moveTo(0, h);
      g.lineTo(0, top);
      g.quadraticCurveTo(w / 2, -top * 0.6, w, top);
      g.lineTo(w, h);
    } else g.rect(0, 0, w, h);
    g.closePath();
    const gr = g.createLinearGradient(0, 0, w, h);
    gr.addColorStop(0, '#6f8191');
    gr.addColorStop(0.5, '#2c343c');
    gr.addColorStop(1, '#151a1f');
    g.fillStyle = gr;
    g.fill();
    g.clip();
    g.strokeStyle = '#141516';
    g.lineWidth = Math.max(5, w * 0.03);
    for (let i = 1; i < cols; i++) { g.beginPath(); g.moveTo(w * i / cols, 0); g.lineTo(w * i / cols, h); g.stroke(); }
    for (let j = 1; j < rows; j++) { const y = top + (h - top) * j / rows; g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    if (arco) { g.beginPath(); g.moveTo(0, top); g.lineTo(w, top); g.stroke(); }
    g.restore();
    g.strokeStyle = '#141516';
    g.lineWidth = Math.max(8, w * 0.04);
    g.beginPath();
    if (arco) {
      g.moveTo(2, h);
      g.lineTo(2, top);
      g.quadraticCurveTo(w / 2, -top * 0.6 + 4, w - 2, top);
      g.lineTo(w - 2, h);
      g.lineTo(2, h);
    } else g.rect(2, 2, w - 4, h - 4);
    g.stroke();
  };
}

/** el rótulo de la taquería: negro, flores de hibisco rosas a los lados y las letras blancas */
function rotuloTaqueria(g, w, h) {
  g.fillStyle = '#141826';
  g.fillRect(0, 0, w, h);
  const flor = (cx, cy, r) => {
    for (let i = 0; i < 5; i++) {
      const a = i * Math.PI * 2 / 5 - Math.PI / 2;
      g.fillStyle = i % 2 ? '#d63c8c' : '#e8579e';
      g.beginPath();
      g.ellipse(cx + Math.cos(a) * r * 0.55, cy + Math.sin(a) * r * 0.55, r * 0.55, r * 0.38, a, 0, Math.PI * 2);
      g.fill();
    }
    g.fillStyle = '#7a1446';
    g.beginPath(); g.arc(cx, cy, r * 0.18, 0, Math.PI * 2); g.fill();
  };
  const hojas = (cx, cy, r, sgn) => {
    for (let i = 0; i < 4; i++) {
      g.fillStyle = ['#2f7fc4', '#1f5fa0', '#3aa0d8', '#2a6eb0'][i];
      g.beginPath();
      g.ellipse(cx + sgn * r * (0.4 + i * 0.25), cy + r * (i - 1.5) * 0.4, r * 0.5, r * 0.16, sgn * (0.6 + i * 0.3), 0, Math.PI * 2);
      g.fill();
    }
  };
  for (const [cx, sgn] of [[h * 0.75, 1], [w - h * 0.75, -1]]) {
    hojas(cx, h * 0.5, h * 0.42, sgn);
    flor(cx - sgn * h * 0.12, h * 0.36, h * 0.24);
    flor(cx + sgn * h * 0.22, h * 0.64, h * 0.22);
  }
  // las dos rayas blancas en diagonal hacia las letras
  g.strokeStyle = '#f2f2f2';
  g.lineWidth = 3;
  for (const [x0, x1] of [[h * 1.4, h * 1.9], [w - h * 1.4, w - h * 1.9]]) { g.beginPath(); g.moveTo(x0, h * 0.08); g.lineTo(x1, h * 0.92); g.stroke(); }
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = '#f4f4f4';
  g.font = `700 ${Math.round(h * 0.42)}px ${SERIF}`;
  g.fillText('TAQUERIA', w / 2, h * 0.4);
  g.font = `700 ${Math.round(h * 0.16)}px ${SANS}`;
  g.fillText('DICHELL FUSIÓN\'S', w / 2, h * 0.76);
}

/** la pancarta de abajo de la terraza: negra, con hojas, flores y las letras rosas */
function pancartaTaqueria(g, w, h) {
  g.fillStyle = '#161a2a';
  g.fillRect(0, 0, w, h);
  for (let i = 0; i < 9; i++) {
    g.fillStyle = ['#2f7fc4', '#d63c8c', '#3aa0d8', '#e8579e'][i % 4];
    g.beginPath();
    g.ellipse(w * (i % 2 ? 0.92 : 0.06) + (i % 3) * 6, h * (0.15 + (i / 9) * 0.75), h * 0.12, h * 0.05, i, 0, Math.PI * 2);
    g.fill();
  }
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = '#ef8fc0';
  g.font = `700 ${Math.round(h * 0.26)}px ${SERIF}`;
  g.fillText('TAQUERIA', w / 2, h * 0.3);
  g.font = `700 ${Math.round(h * 0.12)}px ${SANS}`;
  g.fillText('DICHELL FUSIÓN\'S', w / 2, h * 0.52);
  // las figuras blancas de abajo (como en la pancarta), sin más detalle
  g.fillStyle = '#eceae6';
  for (const x of [0.38, 0.5, 0.62]) { g.beginPath(); g.ellipse(w * x, h * 0.82, h * 0.09, h * 0.12, 0, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = '#111';
  for (const x of [0.38, 0.5, 0.62]) g.fillRect(w * x - h * 0.07, h * 0.76, h * 0.14, h * 0.035);
}

/** el logo del Oishi: la O en espiral blanca con el punto rojo */
function logoOishi(g, cx, cy, r) {
  g.fillStyle = '#f4f4f4';
  g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#141414';
  g.lineWidth = r * 0.16;
  g.beginPath();
  for (let a = 0; a < Math.PI * 4.2; a += 0.2) {
    const rr = r * (0.8 - a / (Math.PI * 4.2) * 0.55);
    const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
    if (a === 0) g.moveTo(x, y); else g.lineTo(x, y);
  }
  g.stroke();
  g.fillStyle = '#d22a2a';
  g.beginPath(); g.arc(cx, cy, r * 0.2, 0, Math.PI * 2); g.fill();
}

/** fachada de listones negros (con el rótulo del Oishi o solo el logo) */
function listones(conRotulo) {
  return (g, w, h) => {
    g.fillStyle = '#18191b';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#26272a';
    for (let y = 4; y < h; y += 12) g.fillRect(0, y, w, 6);
    g.textBaseline = 'middle';
    if (conRotulo) {
      // おいしい en rojo, en vertical, a la izquierda
      g.fillStyle = '#d22a2a';
      g.textAlign = 'center';
      g.font = `700 ${Math.round(h * 0.17)}px "Yu Gothic", "Meiryo", "MS Gothic", "Noto Sans JP", sans-serif`;
      ['お', 'い', 'し', 'い'].forEach((c, i) => g.fillText(c, w * 0.09, h * (0.16 + i * 0.22)));
      logoOishi(g, w * 0.24, h * 0.5, h * 0.3);
      g.fillStyle = '#f4f4f4';
      g.textAlign = 'left';
      g.font = `800 ${Math.round(h * 0.52)}px ${SANS}`;
      g.fillText('ISHI', w * 0.31, h * 0.52);
      g.font = `700 ${Math.round(h * 0.16)}px ${SANS}`;
      g.fillText('RESTAURANTE', w * 0.66, h * 0.55);
      g.font = `700 ${Math.round(h * 0.1)}px ${SANS}`;
      g.fillText('JAPONÉS', w * 0.72, h * 0.75);
      // el tejadito rojo de la marca
      g.strokeStyle = '#d22a2a';
      g.lineWidth = h * 0.04;
      g.beginPath(); g.moveTo(w * 0.86, h * 0.42); g.lineTo(w * 0.9, h * 0.18); g.lineTo(w * 0.95, h * 0.42); g.stroke();
    } else {
      logoOishi(g, w * 0.32, h * 0.5, h * 0.24);
      g.fillStyle = '#f4f4f4';
      g.textAlign = 'left';
      g.font = `800 ${Math.round(h * 0.38)}px ${SANS}`;
      g.fillText('ISHI', w * 0.37, h * 0.52);
    }
  };
}

/** el banderín del Oishi en la esquina del rótulo */
function banderin(g, w, h) {
  g.fillStyle = '#18191b';
  g.fillRect(0, 0, w, h);
  logoOishi(g, w / 2, h * 0.72, w * 0.28);
  g.fillStyle = '#f4f4f4';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(w * 0.16)}px ${SANS}`;
  g.fillText('RESTAURANTE', w / 2, h * 0.2);
  g.fillText('JAPONÉS', w / 2, h * 0.32);
  g.strokeStyle = '#d22a2a';
  g.lineWidth = 4;
  g.beginPath(); g.moveTo(w * 0.3, h * 0.48); g.lineTo(w * 0.5, h * 0.4); g.lineTo(w * 0.7, h * 0.48); g.stroke();
}

/** el rótulo de la correduría */
function rotuloGraciplus(g, w, h) {
  g.fillStyle = '#2b2d30';
  g.fillRect(0, 0, w, h);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = '#f2f2f2';
  g.font = `800 ${Math.round(h * 0.42)}px ${SANS}`;
  g.fillText('GRACIPLUS', w / 2, h * 0.38);
  g.font = `600 ${Math.round(h * 0.2)}px ${SANS}`;
  g.fillText('MEDIADOR DE SEGUROS', w / 2, h * 0.76);
}

/** cristalera de marcos negros (los escaparates de la planta baja) */
function cristalera(cols) {
  return (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, h);
    gr.addColorStop(0, '#5c6c7a');
    gr.addColorStop(0.6, '#1f262c');
    gr.addColorStop(1, '#14181c');
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,220,170,.12)';
    g.fillRect(w * 0.1, h * 0.35, w * 0.8, h * 0.3);
    g.strokeStyle = '#121314';
    g.lineWidth = 9;
    g.strokeRect(0, 0, w, h);
    for (let i = 1; i < cols; i++) { g.beginPath(); g.moveTo(w * i / cols, 0); g.lineTo(w * i / cols, h); g.stroke(); }
    g.beginPath(); g.moveTo(0, h * 0.82); g.lineTo(w, h * 0.82); g.stroke();
  };
}

/** cierre metálico blanco de lamas */
function cierre(g, w, h) {
  g.fillStyle = '#e9e9e6';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#c9c9c4';
  for (let y = 3; y < h; y += 8) g.fillRect(0, y, w, 2);
  g.fillStyle = '#b8b8b2';
  for (let x = 0; x < w; x += 6) for (let y = 6; y < h; y += 16) g.fillRect(x, y, 3, 2);
}

/** puerta blanca de lamas */
function puertaLamas(g, w, h) {
  g.fillStyle = '#f0f0ec';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#d4d4ce';
  for (let y = 10; y < h - 10; y += 9) g.fillRect(8, y, w - 16, 3);
  g.strokeStyle = '#bcbcb6';
  g.lineWidth = 6;
  g.strokeRect(3, 3, w - 6, h - 6);
}

/** carta en la pared o en atril: blanca o negra, con renglones (sin platos ni precios) */
function carta(oscura) {
  return (g, w, h) => {
    g.fillStyle = oscura ? '#1d1f22' : '#f6f5ef';
    g.fillRect(0, 0, w, h);
    g.fillStyle = oscura ? '#d22a2a' : '#c0392b';
    g.fillRect(w * 0.1, h * 0.05, w * 0.8, h * 0.08);
    g.fillStyle = oscura ? '#9a9a96' : '#8a8a86';
    for (let y = h * 0.2; y < h * 0.94; y += h * 0.06) g.fillRect(w * 0.1, y, w * (0.45 + ((y * 3) % 4) * 0.1), 2);
  };
}

/** ventana corriente (los balcones del edificio blanco) */
function ventana(cols, borde) {
  return (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, h);
    gr.addColorStop(0, '#8ca2b4');
    gr.addColorStop(1, '#2d3640');
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(236,232,220,.45)';
    g.fillRect(w * 0.04, h * 0.05, w * 0.92, h * 0.22);
    g.strokeStyle = borde;
    g.lineWidth = Math.max(6, w * 0.035);
    g.strokeRect(0, 0, w, h);
    for (let i = 1; i < cols; i++) { g.beginPath(); g.moveTo(w * i / cols, 0); g.lineTo(w * i / cols, h); g.stroke(); }
  };
}

// ——— las piezas ———

/** un hueco con su lienzo y un marco un poco saliente */
function hueco(k, s, y0, w, h, tex, { borde = BLACK, z = 0.04, marcoW = 0.08 } = {}) {
  for (const x of [s - w / 2 - marcoW / 2, s + w / 2 + marcoW / 2]) k.box(x, y0, z + 0.03, marcoW, h + marcoW, 0.06, borde);
  k.box(s, y0 + h, z + 0.03, w + marcoW * 2, marcoW, 0.06, borde);
  k.pic(s, y0 + h / 2, z + 0.02, w, h, 0, 1, tex);
}

/** barandilla negra de forja delante de una ventana */
function forja(k, s, y, w, z) {
  k.box(s, y + 0.92, z, w, 0.04, 0.04, BLACK).box(s, y, z, w, 0.04, 0.04, BLACK).box(s, y + 0.62, z, w, 0.03, 0.03, BLACK);
  for (let x = s - w / 2; x <= s + w / 2 + 0.01; x += 0.12) k.box(x, y, z, 0.02, 0.95, 0.02, BLACK);
  for (let x = s - w / 2 + 0.18; x < s + w / 2; x += 0.36) k.cyl(x, y + 0.77, z, 0.11, 0.11, 0.02, BLACK, { seg: 10, rx: Math.PI / 2 });
}

/** el solar: el muro blanco a la calle y la valla de chapa de la esquina (el suelo es el de la foto aérea) */
function solar(k, T) {
  k.box(SOLAR / 2, 0, 0.12, SOLAR + 0.05, 2.7, 0.24, WHITE, { list: k.shell });
  k.box(SOLAR / 2, 2.7, 0.12, SOLAR + 0.1, 0.08, 0.3, 0xdedcd6);
  k.seg(0, 0.12, SOLAR, 0.12);
  // la valla de chapa gris oscura por el lado de Ingeniero Paz Peraza (en el marco de la fachada)
  const [px, pz] = T.toLocal(T.P4);
  const L = Math.hypot(px, pz), ry = -Math.atan2(pz, px);
  k.box(px / 2, 0, pz / 2, L, 2.6, 0.06, 0x4a4d50, { ry });
  for (let d = 0.4; d < L; d += 0.4) k.box(px * d / L, 0, pz * d / L, 0.03, 2.6, 0.1, 0x3a3c3f, { ry });
  k.seg(0, 0, px, pz);
}

/** el edificio de los locales (s 12 a 25,2): granito abajo, amarillo arriba y la escalera en medio */
function edificioLocales(k) {
  const s0 = SOLAR, s1 = 25.2, H = 12.8, D = SOLAR_FONDO, cL = CL, cR = CR;
  k.box((s0 + s1) / 2, 0, -D / 2 + 0.03, s1 - s0, H, D, WHITE, { list: k.shell });
  // el granito de la planta baja y la primera, y la cornisa blanca encima
  k.pic((s0 + s1) / 2, 3.3, 0.045, s1 - s0, 6.6, 0, 1, canvasTex(512, 256, granito));
  k.box((s0 + s1) / 2, 6.55, 0.12, s1 - s0 + 0.1, 0.16, 0.24, 0xf1efe9);
  // arriba, las dos calles amarillas con sus pilastras de piedra y la franja gris de la escalera
  for (const [a, b] of [[s0, cL], [cR, s1]]) {
    k.box((a + b) / 2, 6.7, 0.07, b - a, H - 6.7, 0.06, YELLOW);
    for (const x of [a + 0.18, b - 0.18]) k.box(x, 6.7, 0.1, 0.36, H - 6.7, 0.08, STONE);
  }
  k.box((cL + cR) / 2, 6.7, 0.02, cR - cL, H - 6.7, 0.04, 0x8f8c88);
  k.box((s0 + s1) / 2, H - 0.35, 0.14, s1 - s0 + 0.2, 0.35, 0.3, STONE);
  // la ventana larga de la escalera, de la primera planta a la azotea
  hueco(k, (cL + cR) / 2, 3.8, 0.9, 8.2, canvasTex(96, 768, ventanaNegra(2, 12)), { z: 0.05 });
  // primera planta: las ventanas en arco
  hueco(k, 15.3, 3.9, 3.4, 2.4, canvasTex(512, 360, ventanaNegra(5, 2, { arco: true })), { z: 0.05 });
  hueco(k, 22.7, 3.9, 2.5, 2.3, canvasTex(384, 352, ventanaNegra(4, 2, { arco: true })), { z: 0.05 });
  // segunda y tercera: la ventana de cada calle con su recerco de piedra, el alféizar y la barandilla de forja
  for (const s of [15.3, 22.7]) {
    for (const y of [7.15, 9.95]) {
      k.box(s, y - 0.2, 0.12, 1.9, 2.15, 0.08, STONE);
      hueco(k, s, y, 1.3, 1.75, canvasTex(160, 216, ventanaNegra(2, 3, { fondo: '#2c343c' })), { z: 0.13 });
      k.box(s, y - 0.12, 0.25, 1.7, 0.1, 0.3, 0xf1efe9);
      forja(k, s, y - 0.05, 1.4, 0.36);
    }
  }
  // planta baja: la cristalera de la taquería, el portal con su carta y el Oishi (cristal, la puerta blanca y las cartas)
  hueco(k, 15.3, 0, 5.9, 2.85, canvasTex(768, 384, cristalera(6)), { z: 0.05 });
  hueco(k, 19.4, 0, 1.2, 2.5, canvasTex(160, 320, cristalera(1)), { z: 0.05 });
  k.pic(20.45, 1.5, 0.08, 0.36, 0.5, 0, 1, canvasTex(48, 64, carta(false)));
  hueco(k, 21.3, 0.2, 1.3, 2.3, canvasTex(160, 288, cristalera(2)), { z: 0.05 });
  hueco(k, 22.4, 0, 0.75, 2.3, canvasTex(96, 288, puertaLamas), { borde: 0xd8d8d2, z: 0.05 });
  k.pic(23.2, 1.45, 0.08, 0.5, 0.7, 0, 1, canvasTex(64, 88, carta(false)));
  k.pic(23.9, 1.4, 0.08, 0.5, 0.8, 0, 1, canvasTex(64, 104, carta(true)));
  hueco(k, 24.6, 0.2, 0.8, 2.3, canvasTex(96, 288, cristalera(1)), { z: 0.05 });
  // el aire acondicionado y los cables del lado del solar
  k.box(s0 - 0.25, 4.6, -1.0, 0.5, 0.55, 0.8, 0xe2e2de);
  for (const [y, len] of [[5.3, 3.0], [5.6, 2.4]]) k.cyl(s0 - 0.02, y, -0.2, 0.01, 0.01, len, 0x2a2a2a, { seg: 3, rx: Math.PI / 2 });
}

/** la terraza de la taquería: estructura de hierro negro, toldos beis, el rótulo encima y la pancarta abajo */
function terrazaTaqueria(k) {
  const a = 12.15, b = 18.45, z = 1.05, top = 2.75;
  for (const s of [a, (a + b) / 2, b]) {
    k.box(s, 0, z, 0.08, top, 0.08, BLACK);
    k.block(s, z, 0.12, 0.12);
  }
  for (const s of [a, b]) k.box(s, top, z / 2 + 0.03, 0.06, 0.08, z, BLACK);
  k.box((a + b) / 2, top, z, b - a, 0.1, 0.08, BLACK);
  // los dos toldos beis, del cajón de la pared a la barra de delante, con sus rodillos
  for (const [p, q] of [[a + 0.05, (a + b) / 2 - 0.05], [(a + b) / 2 + 0.05, b - 0.05]]) {
    const L = Math.hypot(z, 0.3), tela = new THREE.BoxGeometry(q - p, 0.02, L);
    tela.rotateX(Math.atan2(0.3, z));
    tela.translate((p + q) / 2, top + 0.25, z / 2 + 0.05);
    k.add(tela, 0xd9cfb8);
    k.cyl(p, top + 0.12, z - 0.05, 0.05, 0.05, q - p, 0xd2c8b0, { seg: 8, rx: Math.PI / 2, ry: Math.PI / 2 });
  }
  // los aparatos del aire encima y el rótulo
  for (const s of [13.1, 17.4]) k.box(s, top + 0.3, 0.45, 0.8, 0.4, 0.35, 0xe0e0dc);
  k.box((a + b) / 2, top + 0.72, 0.3, 5.8, 0.82, 0.08, 0x2a2a2a);
  k.pic((a + b) / 2, top + 1.13, 0.345, 5.6, 0.74, 0, 1, canvasTex(1024, 136, rotuloTaqueria));
  // abajo, la pancarta y los paneles negros de la valla
  k.pic(13.7, 0.62, z + 0.045, 2.9, 1.05, 0, 1, canvasTex(512, 186, pancartaTaqueria));
  k.box(13.7, 0.08, z, 3.0, 1.12, 0.04, BLACK);
  k.box(16.9, 0.08, z, 2.9, 1.0, 0.04, 0x26282c);
  k.box((a + b) / 2, 1.18, z, b - a, 0.05, 0.06, BLACK);
  k.seg(a, z, b, z);
}

/** el rótulo del Oishi en su fachada de listones, el banderín, la sombrilla y la valla negra de cruces */
function oishi(k) {
  const a = CR, b = 25.2;
  k.box((a + b) / 2, 2.85, 0.1, b - a, 1.0, 0.12, 0x18191b);
  k.pic((a + b) / 2, 3.35, 0.165, b - a - 0.06, 0.94, 0, 1, canvasTex(768, 144, listones(true)));
  // el banderín de la esquina, de canto a la calle
  k.box(a + 0.1, 2.75, 0.45, 0.05, 1.05, 0.6, 0x18191b);
  for (const nx of [-1, 1]) k.pic(a + 0.1 + nx * 0.03, 3.27, 0.45, 0.56, 1.0, nx, 0, canvasTex(96, 172, banderin));
  // la sombrilla blanca (sin marca)
  const s = 22.0, z = 0.75;
  k.cyl(s, 0, z, 0.2, 0.22, 0.08, 0x3a3d42, { seg: 10 }).cyl(s, 0.08, z, 0.025, 0.025, 2.3, 0xd8d8d4, { seg: 6 });
  const tela = new THREE.ConeGeometry(1.25, 0.38, 8, 1, true);
  tela.translate(s, 2.25, z);
  k.add(tela, 0xf4f4f0);
  k.cyl(s, 1.92, z, 1.26, 1.26, 0.14, 0xf4f4f0, { seg: 8 });
  k.block(s, z, 0.25, 0.25);
  // la valla negra de cruces de la terraza
  const v0 = 23.0, v1 = 27.6, vz = 1.0, panels = Math.round((v1 - v0) / 0.9), pw = (v1 - v0) / panels;
  k.box((v0 + v1) / 2, 0.98, vz, v1 - v0, 0.05, 0.05, BLACK).box((v0 + v1) / 2, 0.05, vz, v1 - v0, 0.05, 0.05, BLACK);
  const diag = Math.hypot(pw, 0.9), tilt = Math.atan2(pw, 0.9);
  for (let i = 0; i <= panels; i++) k.box(v0 + i * pw, 0, vz, 0.05, 1.02, 0.05, BLACK);
  for (let i = 0; i < panels; i++) {
    for (const sg of [1, -1]) {
      const g = new THREE.BoxGeometry(0.03, diag, 0.03);
      g.rotateZ(sg * tilt);
      g.translate(v0 + (i + 0.5) * pw, 0.52, vz);
      k.add(g, BLACK);
    }
  }
  k.seg(v0, vz, v1, vz);
}

/** el edificio blanco alto de al lado (s 25,2 a 36): el otro rótulo del Oishi, el cierre, Graciplus y los balcones */
function edificioBlanco(k) {
  const s0 = 25.2, s1 = 36.0, H = 17.0, D = 13;
  k.box((s0 + s1) / 2, 0, -D / 2 + 0.03, s1 - s0, H, D, WHITE, { list: k.shell });
  // planta baja: los listones con el logo del Oishi, el cierre blanco, el pilar de piedra y la correduría
  k.box(27.85, 2.9, 0.1, 5.3, 0.9, 0.12, 0x18191b);
  k.pic(27.85, 3.35, 0.165, 5.24, 0.84, 0, 1, canvasTex(640, 104, listones(false)));
  hueco(k, 27.85, 0, 4.6, 2.85, canvasTex(512, 320, cierre), { borde: 0xcfcfca });
  k.box(30.75, 0, 0.12, 0.35, 3.6, 0.2, 0xcdbfa4);
  k.box(32.6, 2.85, 0.1, 3.4, 0.75, 0.1, 0x2b2d30);
  k.pic(32.6, 3.22, 0.155, 3.3, 0.68, 0, 1, canvasTex(512, 106, rotuloGraciplus));
  hueco(k, 32.3, 0, 2.6, 2.75, canvasTex(320, 336, cristalera(3)), { borde: 0x6a6a68 });
  hueco(k, 34.6, 0, 0.95, 2.4, canvasTex(112, 288, cristalera(1)), { borde: 0x3a3a3a });
  k.box(35.3, 2.2, 0.15, 0.14, 0.24, 0.14, 0x2a2a2a);
  // primera planta: las ventanas de marco verde y el balcón de barandilla de aluminio
  for (const s of [27.2, 29.6]) hueco(k, s, 4.1, 1.9, 1.7, canvasTex(224, 200, ventana(2, '#2e6b4c')), { borde: 0x2e6b4c });
  balconAluminio(k, 25.6, 31.0, 3.6, 1.0);
  hueco(k, 33.6, 4.2, 1.6, 1.5, canvasTex(192, 176, ventana(2, '#d8d8d4')), { borde: 0xd8d8d4 });
  // de la segunda a la cuarta: los balcones de antepecho blanco con su aire acondicionado y las ventanas de la derecha
  for (const y of [6.6, 9.6, 12.6]) {
    hueco(k, 27.8, y + 0.3, 2.4, 2.2, canvasTex(288, 256, ventana(3, '#cfcfca')), { borde: 0xcfcfca });
    k.box(28.0, y, 0.5, 4.8, 0.12, 1.0, WHITE);
    k.box(28.0, y + 0.12, 0.98, 4.8, 0.85, 0.06, WHITE);
    k.box(28.0, y + 0.97, 0.98, 4.8, 0.04, 0.05, 0xb8bcc0);
    k.box(26.2, y + 0.12, 0.5, 0.7, 0.55, 0.3, 0xe2e2de);
    hueco(k, 33.4, y + 0.6, 1.5, 1.5, canvasTex(176, 176, ventana(2, '#cfcfca')), { borde: 0xcfcfca });
    balconAluminio(k, 32.3, 34.5, y, 0.5);
  }
  // azotea: pretil, el cuarto de arriba y la antena
  k.box((s0 + s1) / 2, H, 0.0, s1 - s0, 0.5, 0.15, WHITE);
  k.box(30.0, H, -6.0, 4.0, 2.2, 4.0, WHITE, { list: k.shell });
  k.cyl(31.5, H + 2.2, -5.0, 0.025, 0.025, 2.0, 0x8a8f94, { seg: 5 });
}

/** balcón con la barandilla de aluminio y cristal */
function balconAluminio(k, s0, s1, y, fuera) {
  k.box((s0 + s1) / 2, y, fuera / 2 + 0.04, s1 - s0, 0.12, fuera, WHITE);
  k.box((s0 + s1) / 2, y + 1.0, fuera, s1 - s0, 0.05, 0.05, 0xb8bcc0);
  for (let s = s0; s <= s1 + 0.01; s += (s1 - s0) / Math.max(1, Math.round((s1 - s0) / 1.1))) k.box(s, y + 0.12, fuera, 0.04, 0.9, 0.04, 0xb8bcc0);
  k.box((s0 + s1) / 2, y + 0.2, fuera, s1 - s0, 0.75, 0.02, 0xcfe0e8, { list: k.glass });
}

/** la papelera verde en su poste, en la acera junto al muro del solar */
function papelera(k, s, z) {
  k.cyl(s, 0, z, 0.03, 0.03, 1.0, 0x6a6f74, { seg: 6 }).box(s, 0.5, z - 0.08, 0.42, 0.6, 0.3, 0x7a8240);
  k.block(s, z, 0.35, 0.35);
}

/** la farola blanca de dos brazos con las campanas azul claro y las dos bolitas colgando (foto) */
function farola(k, s, z) {
  const POLE = 0xf2f2ef, BELL = 0x8fc3e0;
  k.cyl(s, 0, z, 0.13, 0.16, 0.4, POLE, { seg: 10 }).cyl(s, 0.4, z, 0.07, 0.1, 6.4, POLE, { seg: 10 });
  k.box(s, 6.55, z, 1.9, 0.08, 0.08, POLE).box(s, 5.5, z, 0.5, 0.06, 0.06, POLE);
  for (const d of [-0.9, 0.9]) {
    k.cyl(s + d, 6.15, z, 0.07, 0.3, 0.38, BELL, { seg: 14 });
    k.cyl(s + d, 6.5, z, 0.02, 0.02, 0.06, POLE, { seg: 5 });
    k.ball(s + d, 6.14, z, 0.08, 0xfff3d2, { seg: 8, list: k.glow });
  }
  for (const d of [-0.2, 0.2]) {
    k.cyl(s + d, 5.2, z, 0.01, 0.01, 0.3, POLE, { seg: 4 });
    k.ball(s + d, 5.15, z, 0.08, BELL, { seg: 8 });
  }
  k.block(s, z, 0.3, 0.3);
}

/** primera fase: el solar, los dos edificios con sus locales, la papelera, la farola y los árboles */
export function buildLocalesTanatorio(scene, colliders, map) {
  const T0 = map?.localesTanatorio;
  if (!T0) return null;
  const M = marco(T0.B, T0.A);
  // de un punto del mundo al marco de la fachada
  const toLocal = (p) => {
    const dx = p[0] - M.B[0], dz = p[1] - M.B[1];
    return [dx * M.U[0] + dz * M.U[1], dx * M.N[0] + dz * M.N[1]];
  };
  const group = new THREE.Group();
  group.name = 'localesTanatorio';
  const k = new Kit();
  solar(k, { P4: T0.P4, toLocal });
  edificioLocales(k);
  terrazaTaqueria(k);
  oishi(k);
  edificioBlanco(k);
  papelera(k, 3.5, 0.6);
  // en la acera de en medio de las dos calzadas (a 8,9 m de la fachada): la farola
  farola(k, 21.5, 8.9);
  const { group: g, segs } = k.build('localesTanatorio');
  g.position.set(M.B[0], 0, M.B[1]);
  g.rotation.y = M.ry;
  group.add(g);
  for (const [as, az, bs, bz] of segs) colliders?.addSegment(...M.W(as, az), ...M.W(bs, bz));
  // el árbol grande del solar y los flamboyanes de la acera de en medio
  const out = { trunk: [], leaves: [] };
  const arboles = [[6.0, -7.0, 0.85, 2], [30.0, 8.9, 0.7, 2], [41.0, 8.9, 0.62, 2]];
  for (const [s, z, sc, kind] of arboles) laurel(out, ...M.W(s, z), sc, kind);
  for (const [list, mat] of [[out.trunk, { vertexColors: true, roughness: 0.95 }], [out.leaves, { vertexColors: true, roughness: 0.85, flatShading: true }]]) {
    if (!list.length) continue;
    const m = new THREE.Mesh(mergeGeometries(list.map(q => (q.index ? q.toNonIndexed() : q)), false), new THREE.MeshStandardMaterial(mat));
    m.castShadow = true;
    m.receiveShadow = true;
    group.add(m);
  }
  for (const [s, z] of arboles.slice(1)) {
    const [x, zz] = M.W(s, z);
    colliders?.addPolygon([[x - 0.3, zz - 0.3], [x + 0.3, zz - 0.3], [x + 0.3, zz + 0.3], [x - 0.3, zz + 0.3], [x - 0.3, zz - 0.3]]);
  }
  scene.add(group);
  return group;
}
