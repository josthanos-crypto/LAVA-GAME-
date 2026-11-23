import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/**
 * (Version 160) La Casa Amarilla (antigua sede del Cabildo, Calle León y Castillo 6), como en la foto de la fachada
 * que dejó José Manuel en `recursos\CASAAMARILLA` (enlace de Google Maps): dos plantas altas, zócalo de piedra
 * salmón, paredes de azulejo vidriado amarillo mostaza puesto como ladrillo, esquinas, impostas y cornisas blancas,
 * puerta central abierta con montante de forja y dos ventanas altas con contraventanas de madera oscura; arriba, tres
 * ventanas de arco, la del centro con balcón de balaustres sobre ménsulas, tres mástiles con bandera (dos amarillas y
 * una blanca, lisas) y el frontón con la torrecilla del reloj.
 *
 * Es el bloque del mapa de la esquina de León y Castillo con Inspector Luis Martín: `tuneCasaAmarilla` lo marca como
 * hecho a mano (`skip`: sigue chocando) y `buildCasaAmarilla` lo levanta. La fachada da al oeste, a la Calle Real.
 * Los costados y la trasera no salen en la foto: van en blanco liso con ventanas sencillas (sin comprobar).
 */
const NW = [162.94, 400.82], SW = [168.14, 411.78], SE = [187.06, 402.8], NE = [181.86, 391.84];
const CASA = [NW, SW, SE, NE];
const ZOCALO = 0.95, FORJADO = 4.75, CORNISA = 8.55, FRISO = 9.45, ALTO = 9.75, ALERO = 9.3;
const VANOS = [2.55, 6.085, 9.62];   // centro de cada hueco, medido desde la esquina norte de la fachada
const PX_M = 64;
const BLANCO = '#f4f2ec', MADERA = '#3d2417', SALMON = '#e2a98d';

const hash = (n) => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };

/** lado de la casa: longitud, dirección, normal hacia fuera y giro */
function lado(P0, P1) {
  const len = Math.hypot(P1[0] - P0[0], P1[1] - P0[1]);
  const dir = [(P1[0] - P0[0]) / len, (P1[1] - P0[1]) / len];
  let nrm = [dir[1], -dir[0]];
  const cx = CASA.reduce((s, p) => s + p[0], 0) / 4, cz = CASA.reduce((s, p) => s + p[1], 0) / 4;
  if (((P0[0] + P1[0]) / 2 - cx) * nrm[0] + ((P0[1] + P1[1]) / 2 - cz) * nrm[1] < 0) nrm = [-nrm[0], -nrm[1]];
  return { P0, len, dir, nrm, a: Math.atan2(nrm[0], nrm[1]) };
}
const en = (e, s, d) => [e.P0[0] + e.dir[0] * s + e.nrm[0] * d, e.P0[1] + e.dir[1] * s + e.nrm[1] * d];

function lienzo(w, h, pinta) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  pinta(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** azulejo vidriado puesto como ladrillo: `tonos` son los colores entre los que varía */
function azulejos(g, X, Y, x0, x1, y0, y1, tonos, semilla) {
  const aw = 0.23, ah = 0.115;
  let fila = 0;
  for (let y = y0; y < y1 - 0.001; y += ah, fila++) {
    for (let x = x0 - (fila % 2) * aw / 2, k = 0; x < x1; x += aw, k++) {
      const a = Math.max(x, x0), b = Math.min(x + aw, x1);
      if (b <= a) continue;
      g.fillStyle = tonos[Math.floor(hash(semilla + fila * 57.3 + k * 1.9) * tonos.length)];
      const px = X(a), py = Y(Math.min(y + ah, y1)), pw = X(b) - X(a), ph = Y(y) - py;
      g.fillRect(px, py, pw, ph);
      // el bisel: luz arriba y sombra abajo
      g.fillStyle = 'rgba(255,240,170,.28)'; g.fillRect(px, py, pw, 1.4);
      g.fillStyle = 'rgba(40,28,6,.38)'; g.fillRect(px, py + ph - 1.3, pw, 1.3);
      g.fillRect(px + pw - 1, py, 1, ph);
    }
  }
}

/** ventana de madera oscura con sus cuarterones; `reja` = antepecho de forja blanca abajo */
function madera(g, x0, y0, x1, y1, { reja = 0, cristal = false } = {}) {
  g.fillStyle = MADERA; g.fillRect(x0, y0, x1 - x0, y1 - y0);
  const xc = (x0 + x1) / 2, hoja = (x1 - x0) / 2;
  for (const hx of [x0, xc]) {
    for (let k = 0; k < 4; k++) {
      const py = y0 + 6 + k * ((y1 - y0 - 8) / 4), ph = (y1 - y0 - 8) / 4 - 6;
      g.fillStyle = cristal && k < 3 ? '#28343c' : '#2c190f';
      g.fillRect(hx + 6, py, hoja - 12, ph);
      g.fillStyle = cristal && k < 3 ? 'rgba(160,190,205,.22)' : 'rgba(120,80,50,.3)';
      g.fillRect(hx + 6, py, hoja - 12, 2);
    }
  }
  g.fillStyle = '#1e110a'; g.fillRect(xc - 1.5, y0, 3, y1 - y0);
  if (!reja) return;
  g.strokeStyle = BLANCO; g.lineWidth = 2.2;
  const ry = y1 - reja;
  g.strokeRect(x0 + 2, ry, x1 - x0 - 4, reja - 2);
  for (let x = x0 + 8; x < x1 - 4; x += 9) { g.beginPath(); g.moveTo(x, ry); g.lineTo(x, y1 - 2); g.stroke(); }
  g.beginPath(); g.arc(xc, ry + reja / 2, reja * 0.3, 0, Math.PI * 2); g.stroke();
}

function fachada(len) {
  const W = Math.round(len * PX_M), H = Math.round(ALTO * PX_M);
  return lienzo(W, H, (g) => {
    const X = (s) => (s * W) / len, Y = (y) => H - (y * H) / ALTO;
    const caja = (s0, s1, y0, y1, color) => { g.fillStyle = color; g.fillRect(X(s0), Y(y1), X(s1) - X(s0), Y(y0) - Y(y1)); };
    const MOSTAZA = ['#b08d22', '#a37f1c', '#bd9a2c', '#8f7a1e', '#c7a534', '#97771a', '#7f7424', '#b9932a'];
    const PARDO = ['#6a4a2c', '#5c3f26', '#775432', '#634428'];
    azulejos(g, X, Y, 0, len, 0, CORNISA, MOSTAZA, 3);
    azulejos(g, X, Y, 0, len, CORNISA, ALTO, PARDO, 91);
    // paños blancos del friso, uno sobre cada ventana de los lados
    for (const s of [VANOS[0], VANOS[2]]) { caja(s - 1.45, s + 1.45, CORNISA + 0.42, FRISO - 0.12, BLANCO); caja(s - 1.3, s + 1.3, CORNISA + 0.5, FRISO - 0.2, '#e4e0d6'); }
    // zócalo, imposta, cornisas y esquinas
    caja(0, len, 0, ZOCALO, SALMON);
    caja(0, len, FORJADO, FORJADO + 0.2, BLANCO);
    caja(0, len, 5.88, 5.96, BLANCO);
    caja(0, len, CORNISA, CORNISA + 0.3, BLANCO);
    caja(0, len, FRISO, ALTO, BLANCO);
    caja(0, 0.78, ZOCALO, ALTO, BLANCO);
    caja(len - 0.78, len, ZOCALO, ALTO, BLANCO);
    // las dos bajantes blancas entre los huecos
    for (const s of [(VANOS[0] + VANOS[1]) / 2, (VANOS[1] + VANOS[2]) / 2]) caja(s - 0.035, s + 0.035, ZOCALO, CORNISA, BLANCO);
    // planta baja: dos ventanas altas con contraventanas y antepecho de forja
    for (const s of [VANOS[0], VANOS[2]]) {
      caja(s - 0.9, s + 0.9, 0.98, 4.28, BLANCO);
      madera(g, X(s - 0.73), Y(4.12), X(s + 0.73), Y(1.12), { reja: 30 });
    }
    // la puerta, abierta: marco blanco, montante de forja, hojas de madera a los lados y la escalera
    const p = VANOS[1];
    caja(p - 1.15, p + 1.15, 0, 4.5, BLANCO);
    caja(p - 0.97, p + 0.97, 0, 4.32, '#17161a');
    const fondo = g.createLinearGradient(0, Y(3.6), 0, Y(0.4));
    fondo.addColorStop(0, '#201f24'); fondo.addColorStop(1, '#3c3a3d');
    g.fillStyle = fondo; g.fillRect(X(p - 0.72), Y(3.62), X(p + 0.72) - X(p - 0.72), Y(0.45) - Y(3.62));
    caja(p - 0.97, p - 0.72, 0.45, 3.62, MADERA);
    caja(p + 0.72, p + 0.97, 0.45, 3.62, MADERA);
    for (let k = 0; k < 3; k++) caja(p - 0.97, p + 0.97, k * 0.15, k * 0.15 + 0.15, ['#8d8a84', '#a09d96', '#b3b0a8'][k]);
    caja(p - 0.97, p + 0.97, 3.62, 3.7, BLANCO);
    g.strokeStyle = BLANCO; g.lineWidth = 2.4;
    const my = (Y(3.7) + Y(4.32)) / 2, mr = (Y(3.7) - Y(4.32)) / 2 - 3;
    for (let x = X(p - 0.9); x < X(p + 0.92); x += 10) { g.beginPath(); g.moveTo(x, Y(3.7)); g.lineTo(x, Y(4.32)); g.stroke(); }
    g.fillStyle = '#17161a'; g.beginPath(); g.arc(X(p), my, mr + 3, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.arc(X(p), my, mr, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.arc(X(p), my, mr * 0.5, 0, Math.PI * 2); g.stroke();
    // planta alta: tres ventanas de arco
    for (const s of VANOS) {
      const x0 = X(s - 0.73), x1 = X(s + 0.73), xc = X(s), r = (x1 - x0) / 2, ya = Y(7.25), yb = Y(4.95), m = X(0.17) - X(0);
      const arco = (a, b, rr) => { g.beginPath(); g.moveTo(a, yb); g.lineTo(a, ya); g.arc(xc, ya, rr, Math.PI, 0); g.lineTo(b, yb); g.closePath(); };
      g.fillStyle = BLANCO; arco(x0 - m, x1 + m, r + m); g.fill();
      g.save(); arco(x0, x1, r); g.clip();
      madera(g, x0, ya - r, x1, yb, { cristal: true });
      g.fillStyle = MADERA; g.fillRect(x0, ya - 3, x1 - x0, 6);
      g.restore();
    }
  });
}

/** costado o trasera: estuco blanco, zócalo salmón y ventanas sencillas */
function costado(len, semilla) {
  const W = Math.min(1024, Math.round(len * 40)), H = Math.round(ALTO * 40);
  return lienzo(W, H, (g) => {
    const X = (s) => (s * W) / len, Y = (y) => H - (y * H) / ALTO;
    const caja = (s0, s1, y0, y1, color) => { g.fillStyle = color; g.fillRect(X(s0), Y(y1), X(s1) - X(s0), Y(y0) - Y(y1)); };
    g.fillStyle = '#efece3'; g.fillRect(0, 0, W, H);
    for (let k = 0; k < 60; k++) { g.fillStyle = `rgba(120,112,96,${0.02 + hash(semilla + k) * 0.03})`; g.fillRect(hash(k * 3.1 + semilla) * W, 0, 6 + hash(k) * 22, H); }
    caja(0, len, 0, ZOCALO, SALMON);
    caja(0, len, FORJADO, FORJADO + 0.2, '#e2ded3');
    caja(0, len, CORNISA, CORNISA + 0.3, '#e2ded3');
    caja(0, len, FRISO, ALTO, '#e2ded3');
    const n = Math.max(2, Math.round(len / 4.2));
    for (let k = 0; k < n; k++) {
      const s = (len * (k + 0.5)) / n;
      for (const [y0, y1] of [[1.5, 3.7], [5.5, 7.7]]) {
        caja(s - 0.75, s + 0.75, y0 - 0.14, y1 + 0.14, '#f7f5ef');
        madera(g, X(s - 0.62), Y(y1), X(s + 0.62), Y(y0));
      }
    }
  });
}

function esfera() {
  return lienzo(128, 128, (g) => {
    g.fillStyle = '#f6f4ee'; g.beginPath(); g.arc(64, 64, 62, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#2a2622'; g.lineWidth = 5; g.beginPath(); g.arc(64, 64, 59, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 3;
    for (let k = 0; k < 12; k++) {
      const a = (k * Math.PI) / 6, r0 = k % 3 ? 48 : 42;
      g.beginPath(); g.moveTo(64 + Math.sin(a) * r0, 64 - Math.cos(a) * r0); g.lineTo(64 + Math.sin(a) * 54, 64 - Math.cos(a) * 54); g.stroke();
    }
    const aguja = (a, r, w) => { g.lineWidth = w; g.beginPath(); g.moveTo(64, 64); g.lineTo(64 + Math.sin(a) * r, 64 - Math.cos(a) * r); g.stroke(); };
    aguja((10.2 * Math.PI) / 6, 28, 6);
    aguja((2 * Math.PI) / 6, 44, 4);
    g.fillStyle = '#2a2622'; g.beginPath(); g.arc(64, 64, 5, 0, Math.PI * 2); g.fill();
  });
}

export function tuneCasaAmarilla(map) {
  const b = (map.buildings || []).find(o => Math.abs(o.p[0][0] - NW[0]) < 0.3 && Math.abs(o.p[0][1] - NW[1]) < 0.3);
  if (!b) return;
  b.hAntes = b.h;
  b.h = ALERO;
  b.skip = true;
  b.casaAmarilla = true;
  map.casaAmarilla = true;
}

export function buildCasaAmarilla(scene, map) {
  if (!map.casaAmarilla) return null;
  const group = new THREE.Group();
  group.name = 'casaAmarilla';
  const F = lado(NW, SW), S = lado(SW, SE), E = lado(SE, NE), N = lado(NE, NW);
  const mesh = (geo, mat, sombra = true) => { const m = new THREE.Mesh(geo, mat); m.castShadow = sombra; m.receiveShadow = true; group.add(m); return m; };
  const mate = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.75, ...extra });

  // las cuatro paredes
  const pared = (e, tex) => {
    const g = new THREE.PlaneGeometry(e.len, ALTO);
    g.rotateY(e.a);
    const c = en(e, e.len / 2, 0.02);
    g.translate(c[0], ALTO / 2, c[1]);
    mesh(g, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 }));
  };
  pared(F, fachada(F.len));
  const largo = costado(S.len, 5);
  pared(S, largo); pared(N, largo); pared(E, costado(E.len, 17));

  // el tejado de teja roja, a cuatro aguas, por detrás del peto
  const m1 = [(NW[0] + SW[0]) / 2 + S.dir[0] * 5.5, (NW[1] + SW[1]) / 2 + S.dir[1] * 5.5];
  const m2 = [(NE[0] + SE[0]) / 2 - S.dir[0] * 5.5, (NE[1] + SE[1]) / 2 - S.dir[1] * 5.5];
  const v = (p, y) => [p[0], y, p[1]];
  const CUMBRE = ALERO + 1.3;
  const caras = [
    [v(NW, ALERO), v(SW, ALERO), v(m1, CUMBRE)],
    [v(SW, ALERO), v(SE, ALERO), v(m2, CUMBRE)], [v(SW, ALERO), v(m2, CUMBRE), v(m1, CUMBRE)],
    [v(SE, ALERO), v(NE, ALERO), v(m2, CUMBRE)],
    [v(NE, ALERO), v(NW, ALERO), v(m1, CUMBRE)], [v(NE, ALERO), v(m1, CUMBRE), v(m2, CUMBRE)],
  ];
  const tejado = new THREE.BufferGeometry();
  tejado.setAttribute('position', new THREE.Float32BufferAttribute(caras.flat(2), 3));
  tejado.computeVertexNormals();
  mesh(tejado, mate(0x9a4b36, { side: THREE.DoubleSide, roughness: 0.9 }));

  // ——— el relieve de la fachada ———
  const blancas = [], salmon = [], oscuras = [], pardas = [];
  /** caja centrada a `s` metros de la esquina norte, con el centro a `d` metros de la pared y la base a la altura `y` */
  const caja = (lista, s, d, y, w, h, f, e = F) => {
    const g = new THREE.BoxGeometry(w, h, f);
    g.rotateY(e.a);
    const c = en(e, s, d);
    g.translate(c[0], y + h / 2, c[1]);
    lista.push(g);
  };
  const palo = (lista, s, d, y, r, h, seg = 6) => {
    const g = new THREE.CylinderGeometry(r, r, h, seg);
    const c = en(F, s, d);
    g.translate(c[0], y + h / 2, c[1]);
    lista.push(g);
  };
  const bola = (lista, s, d, y, r) => {
    const g = new THREE.SphereGeometry(r, 10, 8);
    const c = en(F, s, d);
    g.translate(c[0], y, c[1]);
    lista.push(g);
  };
  const L = F.len, p = VANOS[1];
  // zócalo de piedra salmón, cortado en la puerta
  caja(salmon, (p - 1.15) / 2, 0.12, 0, p - 1.15 + 0.3, ZOCALO, 0.3);
  caja(salmon, (p + 1.15 + L) / 2, 0.12, 0, L - p - 1.15 + 0.3, ZOCALO, 0.3);
  caja(salmon, (p - 1.15) / 2, 0.16, 0, p - 1.15 + 0.38, 0.22, 0.38);
  caja(salmon, (p + 1.15 + L) / 2, 0.16, 0, L - p - 1.15 + 0.38, 0.22, 0.38);
  // esquinas, imposta y cornisas
  for (const s of [0.39, L - 0.39]) {
    caja(blancas, s, 0.07, ZOCALO, 0.82, ALTO - ZOCALO, 0.16);
    caja(blancas, s, 0.07, ALTO, 0.95, 0.38, 0.5);
    caja(blancas, s, 0.07, ALTO + 0.38, 1.1, 0.1, 0.62);
  }
  caja(blancas, L / 2, 0.08, FORJADO, L + 0.1, 0.2, 0.16);
  caja(blancas, L / 2, 0.16, CORNISA, L + 0.36, 0.14, 0.34);
  caja(blancas, L / 2, 0.22, CORNISA + 0.14, L + 0.5, 0.16, 0.46);
  caja(blancas, L / 2, 0.14, FRISO, L + 0.3, 0.14, 0.3);
  caja(blancas, L / 2, 0.2, FRISO + 0.14, L + 0.44, 0.16, 0.42);
  // el balcón del centro: losa sobre dos ménsulas y balaustrada
  const BW = 3.8, BF = 0.95, BY = FORJADO + 0.02;
  caja(blancas, p, BF / 2, BY - 0.2, BW, 0.22, BF);
  caja(blancas, p, BF / 2, BY - 0.3, BW - 0.3, 0.1, BF - 0.14);
  for (const s of [p - 1.35, p + 1.35]) { caja(blancas, s, 0.3, BY - 0.85, 0.3, 0.6, 0.6); caja(blancas, s, 0.16, BY - 1.15, 0.26, 0.32, 0.32); }
  caja(blancas, p, BF - 0.1, BY + 0.02, BW - 0.06, 0.1, 0.16);
  caja(blancas, p, BF - 0.1, BY + 0.95, BW, 0.12, 0.2);
  for (const s of [p - BW / 2 + 0.08, p + BW / 2 - 0.08]) {
    caja(blancas, s, BF / 2, BY + 0.02, 0.16, 0.1, BF - 0.1);
    caja(blancas, s, BF / 2, BY + 0.95, 0.2, 0.12, BF);
    caja(blancas, s, BF - 0.1, BY, 0.2, 1.07, 0.2);
    for (let d = 0.16; d < BF - 0.25; d += 0.2) palo(blancas, s, d, BY + 0.1, 0.045, 0.86);
  }
  for (let s = p - BW / 2 + 0.28; s < p + BW / 2 - 0.2; s += 0.2) palo(blancas, s, BF - 0.1, BY + 0.1, 0.045, 0.86);
  // los antepechos de balaustres de las ventanas de los lados
  for (const c of [VANOS[0], VANOS[2]]) {
    caja(blancas, c, 0.14, BY - 0.02, 2.0, 0.12, 0.3);
    caja(blancas, c, 0.2, BY + 0.9, 2.0, 0.11, 0.16);
    for (const s of [c - 0.94, c + 0.94]) caja(blancas, s, 0.2, BY + 0.1, 0.14, 0.8, 0.14);
    for (let s = c - 0.74; s < c + 0.8; s += 0.185) palo(blancas, s, 0.2, BY + 0.1, 0.04, 0.8);
  }
  // el frontón con su placa y la torrecilla del reloj
  caja(blancas, p, 0.1, ALTO, 3.9, 0.95, 0.44);
  caja(pardas, p - 1.5, 0.33, ALTO + 0.22, 0.5, 0.5, 0.03);
  caja(pardas, p + 1.5, 0.33, ALTO + 0.22, 0.5, 0.5, 0.03);
  caja(blancas, p, 0.34, ALTO + 0.2, 2.2, 0.55, 0.05);
  caja(blancas, p, 0.12, ALTO + 0.95, 4.2, 0.14, 0.6);
  for (const s of [p - 1.75, p + 1.75]) bola(blancas, s, 0.12, ALTO + 1.27, 0.19);
  const TY = ALTO + 1.09;
  caja(blancas, p, 0.1, TY, 1.6, 1.5, 0.5);
  caja(pardas, p, 0.36, TY + 0.2, 1.16, 1.12, 0.03);
  for (const s of [p - 1.0, p + 1.0]) { bola(blancas, s, 0.1, TY + 0.22, 0.24); bola(blancas, s * 0.5 + p * 0.5, 0.1, TY + 0.5, 0.14); }
  caja(blancas, p, 0.12, TY + 1.5, 1.9, 0.14, 0.66);
  caja(blancas, p, 0.1, TY + 1.64, 1.0, 0.3, 0.4);
  bola(blancas, p, 0.1, TY + 2.12, 0.22);
  for (const s of [p - 0.42, p + 0.42]) bola(blancas, s, 0.1, TY + 1.98, 0.13);
  // los tres mástiles, inclinados hacia la calle, con sus banderas colgando
  const amarillas = [], claras = [];
  [[VANOS[0], amarillas], [p - 0.55, claras], [VANOS[2], amarillas]].forEach(([s, lista], k) => {
    const d0 = k === 1 ? BF - 0.1 : 0.2, largoM = 3.3, tilt = 0.36;
    const g = new THREE.CylinderGeometry(0.028, 0.034, largoM, 6);
    g.translate(0, largoM / 2, 0);
    g.rotateX(tilt);
    g.rotateY(F.a);
    const c = en(F, s, d0);
    g.translate(c[0], BY + 0.2, c[1]);
    oscuras.push(g);
    const dTop = d0 + Math.sin(tilt) * largoM, yTop = BY + 0.2 + Math.cos(tilt) * largoM;
    const tela = new THREE.PlaneGeometry(0.62, 1.75, 3, 1);
    const pos = tela.attributes.position;
    for (let i = 0; i < pos.count; i++) pos.setZ(i, Math.sin(pos.getX(i) * 9 + k) * 0.05);
    tela.rotateY(F.a);
    const t = en(F, s, dTop - 0.12);
    tela.translate(t[0], yTop - 1.0, t[1]);
    lista.push(tela);
  });

  const blanco = mate(0xf2f0e9, { roughness: 0.7 });
  mesh(mergeGeometries(blancas, false), blanco);
  mesh(mergeGeometries(salmon, false), mate(0xe2a98d, { roughness: 0.85 }));
  mesh(mergeGeometries(pardas, false), mate(0x5f4128, { roughness: 0.5 }), false);
  mesh(mergeGeometries(oscuras, false), mate(0x2c2a28, { roughness: 0.5, metalness: 0.4 }));
  mesh(mergeGeometries(amarillas, false), mate(0xe0b020, { side: THREE.DoubleSide, roughness: 0.9 }));
  mesh(mergeGeometries(claras, false), mate(0xf3f1ea, { side: THREE.DoubleSide, roughness: 0.9 }));
  // la esfera del reloj
  const reloj = new THREE.CircleGeometry(0.47, 24);
  reloj.rotateY(F.a);
  const rc = en(F, p, 0.385);
  reloj.translate(rc[0], TY + 0.76, rc[1]);
  mesh(reloj, new THREE.MeshStandardMaterial({ map: esfera(), roughness: 0.4 }), false);

  scene.add(group);
  return { group };
}
