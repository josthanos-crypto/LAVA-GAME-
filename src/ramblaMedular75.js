import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, barDentro } from './restaurantesCharco.js';
import { cristales } from './edificioReal.js';

/**
 * La manzana de la Rambla Medular 75 a 85, entre la Rambla, Antonio Nieves Santos, Tampico y Panamá, con el
 * restaurante Kokoxili Sushi en la esquina, con la foto aérea y las vistas de la calle de Google de julio de 2025 (solo
 * se miran, no van dentro del juego; la gente no se pone). El mapa no tenía nada ahí: solo la foto aérea pintada en el
 * suelo. Por la Rambla va el edificio de oficinas y locales del 75 al 83: color beis rosado, el bajo y dos plantas
 * (12,6 m) con la barandilla de tubos de la azotea; las parejas de columnas blancas redondas de arriba abajo entre los
 * tramos; en el bajo, el zócalo y los marcos de azulejo negro, la fila de ventanitas redondas encima de los locales y,
 * en algunos tramos, los arcos de las entradas; arriba, las ventanas de aluminio. En la esquina, el Kokoxili con la
 * banda marrón curva de «SUSHI & ASIÁTICO», el letrero de «KOKOXILI» y la puerta de cristal; más allá, el Döner Kebab
 * con su letrero y los carteles de los platos (sin fotos), y los demás locales y oficinas sin sus letreros de marca
 * (bancos, seguros, la mutua y las academias llevan logotipo). Detrás y hacia el oeste, el resto de la manzana: las
 * casas de dos y tres plantas de Tampico y Panamá y la de la farmacia, que el juego levanta con su color.
 */

// el contorno de la manzana, a la distancia de las aceras (banco: scripts/manzanaRambla.cjs): la acera de la Rambla
// de la esquina de Antonio Nieves Santos (este) hacia el oeste, la de Panamá y Tampico de oeste a este, y la de
// Antonio Nieves Santos
const RAMBLA = [[-768.39, -343.71], [-775.6, -346.57], [-784.64, -350.15], [-791.35, -351.78], [-798.11, -352.26], [-804.22, -351.59],
  [-812.41, -350.21], [-828.94, -345.91], [-846.92, -339.85], [-862.43, -333.19], [-878.48, -324.49], [-893.31, -315.77],
  [-910.32, -303.97], [-924.16, -292.92], [-935.4, -282.5]];
const SUR = [[-930.61, -271.32], [-915.94, -276.48], [-852.16, -302.38], [-812.97, -294.42], [-795.0, -290.17]];
const ESTE = [[-795.0, -290.17], [-771.42, -333.94]];
// el edificio de oficinas: de la esquina hasta la casa de la farmacia (x -884), con 18 m de fondo
const N_OFI = 11, FIN = [-884.0, -321.2], FONDO = 18;
const Z = 0.12, ZF = Z + 0.3, YB = 4.2, TECHO = 12.6, BEIS = 0xd8ccc0, NEGRO = 0x222224, COLUMNA = 0xeeeae6;

/** la fachada de oficinas por tramos, cada uno con su marco (N hacia la Rambla) */
const TRAMOS = [...RAMBLA.slice(0, N_OFI), FIN].slice(0, -1).map((p, i, a) => marco(p, i < a.length - 1 ? a[i + 1] : FIN));
const LADO = marco(ESTE[0], RAMBLA[0]);

/** desplaza la polilínea hacia dentro (a la izquierda de la marcha) d metros, con inglete */
function haciaDentro(pts, d) {
  const nor = (a, b) => { const dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz); return [-dz / l, dx / l]; };
  return pts.map((p, i) => {
    const n1 = i > 0 ? nor(pts[i - 1], p) : null, n2 = i < pts.length - 1 ? nor(p, pts[i + 1]) : null;
    let v = n1 && n2 ? [n1[0] + n2[0], n1[1] + n2[1]] : (n1 || n2);
    const l = Math.hypot(v[0], v[1]);
    v = [v[0] / l, v[1] / l];
    const c = n1 && n2 ? v[0] * n1[0] + v[1] * n1[1] : 1;
    return [p[0] - v[0] * d / c, p[1] - v[1] * d / c];
  });
}

/** antes de levantar la ciudad: la marca, la manzana entera con las casas y, encima, el edificio de oficinas */
export function tuneRamblaMedular75(map) {
  if (!Array.isArray(map?.buildings)) return;
  map.ramblaMedular75 = true;
  const r = q => [+q[0].toFixed(2), +q[1].toFixed(2)];
  const manzana = [...RAMBLA, ...SUR, ESTE[1]].map(r);
  manzana.push(manzana[0].slice());
  map.buildings.push({ p: manzana, h: 8.2, k: 'gen', s: 0, c: [236, 230, 218], edificioReal: true });
  const frente = [...RAMBLA.slice(0, N_OFI), FIN];
  const ofi = [...frente, ...haciaDentro(frente, FONDO).reverse()].map(r);
  ofi.push(ofi[0].slice());
  map.buildings.push({ p: ofi, h: TECHO, k: 'gen', s: 0, c: [216, 204, 192], edificioReal: true });
}

// ——— lo que se pinta en lienzo ———

/** la fila de ventanitas redondas con su marco blanco sobre el azulejo negro */
function ojos(g, w, h) {
  g.fillStyle = '#222224';
  g.fillRect(0, 0, w, h);
  const r = h * 0.32, paso = h * 1.2;
  for (let x = paso / 2; x < w; x += paso) {
    g.fillStyle = '#e8e6e2';
    g.beginPath(); g.arc(x, h / 2, r, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#4a5866';
    g.beginPath(); g.arc(x, h / 2, r * 0.7, 0, Math.PI * 2); g.fill();
  }
}

/** un local cerrado o una oficina: el cristal con la persiana blanca a medias o los papeles pegados */
function local(tipo) {
  return (g, w, h) => {
    g.fillStyle = '#34404a';
    g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,.13)';
    g.fillRect(0, 0, w * 0.3, h);
    if (tipo === 1) { g.fillStyle = '#dcdcd6'; g.fillRect(0, 0, w, h * 0.35); }
    if (tipo === 2) { g.fillStyle = 'rgba(240,240,232,.85)'; g.fillRect(w * 0.42, h * 0.3, w * 0.14, h * 0.2); }
    if (tipo === 3) { g.fillStyle = '#8ab8c8'; g.fillRect(0, h * 0.1, w, h * 0.8); }
    g.strokeStyle = '#a8aaa8';
    g.lineWidth = 5;
    g.strokeRect(2, 2, w - 4, h - 4);
    for (let i = 1; i < 3; i++) { g.beginPath(); g.moveTo((w / 3) * i, 0); g.lineTo((w / 3) * i, h); g.stroke(); }
  };
}

/** la banda marrón de «SUSHI & ASIÁTICO» */
function bandaSushi(g, w, h) {
  const fondo = g.createLinearGradient(0, 0, 0, h);
  fondo.addColorStop(0, '#6a4632');
  fondo.addColorStop(1, '#4a2e20');
  g.fillStyle = fondo;
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#f4ece0';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `800 ${Math.round(h * 0.62)}px Georgia, serif`;
  g.fillText('SUSHI & ASIÁTICO', w / 2, h * 0.55, w * 0.92);
}

/** el letrero de «KOKOXILI», en letras claras espaciadas sobre marrón oscuro */
function kokoxili(g, w, h) {
  g.fillStyle = '#3a2418';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#efe4d2';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(h * 0.6)}px Georgia, serif`;
  g.fillText('K O K O X I L I', w / 2, h * 0.55, w * 0.9);
}

/** el letrero del Döner Kebab, rojo oscuro con las letras blancas (sin la marca) */
function kebab(g, w, h) {
  g.fillStyle = '#2a1414';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#c83a28';
  g.fillRect(0, h * 0.62, w, h * 0.38);
  g.fillStyle = '#f4e8d8';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `italic 800 ${Math.round(h * 0.38)}px Georgia, serif`;
  g.fillText('Döner Kebab', w / 2, h * 0.32, w * 0.9);
  g.font = `700 ${Math.round(h * 0.2)}px Arial, sans-serif`;
  g.fillText('KEBABS · PLATOS · DURUM', w / 2, h * 0.81, w * 0.9);
}

/** los carteles de los platos del kebab, a colores, sin fotos */
function platos(g, w, h) {
  barDentro(g, w, h);
  const c = ['#e8b040', '#c84a2a', '#5a9a3a', '#e8d8b0'];
  for (let i = 0; i < 4; i++) { g.fillStyle = c[i]; g.fillRect(w * (0.05 + i * 0.24), h * 0.55, w * 0.2, h * 0.3); }
}

// ——— las piezas ———

/** un arco rebajado de entrada en el bajo, de media anchura w, centrado en s, que sube 0,6 m */
function arco(k, s, w) {
  const R = (w * w + 0.36) / 1.2, yC = YB - 0.3 - R, a0 = Math.asin(w / R), n = 12;
  for (let i = 0; i < n; i++) {
    const b = Math.PI / 2 - a0 + ((i + 0.5) * 2 * a0) / n;
    const g = new THREE.BoxGeometry((R * 2 * a0) / n + 0.03, 0.22, 0.3);
    g.rotateZ(b + Math.PI / 2);
    g.translate(s + Math.cos(b) * R, yC + Math.sin(b) * R, ZF + 0.12);
    k.add(g, 0xe2d8cc);
  }
}

/** un tramo de la fachada de oficinas, de s0 a s1, con las columnas al principio y los locales que le tocan */
function tramo(k, s0, s1, que) {
  const c = (s0 + s1) / 2, L = s1 - s0;
  k.box(c, 0, Z + 0.15, L, TECHO, 0.3, BEIS);
  k.block(c, Z + 0.15, L, 0.3);
  // el zócalo negro, la franja de las ventanitas redondas y la losa clara de encima del bajo
  k.box(c, 0, ZF + 0.02, L, 0.45, 0.06, NEGRO);
  k.box(c, YB - 0.85, ZF + 0.02, L, 0.75, 0.05, NEGRO);
  k.pic(c, YB - 0.475, ZF + 0.051, L - 0.2, 0.62, 0, 1, canvasTex(Math.round(L * 30), 26, ojos));
  k.box(c, YB - 0.1, ZF + 0.2, L + 0.05, 0.22, 0.4, 0xe2d8cc);
  // el local del bajo
  const tex = que === 'sushi' ? canvasTex(300, 150, barDentro) : que === 'kebab' ? canvasTex(300, 150, platos) : canvasTex(240, 140, local(que));
  k.pic(c, 0.45 + (YB - 1.35) / 2, ZF + 0.012, L - 0.6, YB - 1.35, 0, 1, tex, { glow: que === 'sushi' || que === 'kebab' ? 0.2 : 0 });
  for (const t of [s0 + 0.15, s1 - 0.15]) k.box(t, 0.45, ZF + 0.03, 0.3, YB - 1.3, 0.08, NEGRO);
  if (que === 2 && L > 5) arco(k, c, Math.min(2.6, L / 2 - 0.6));
  // las dos plantas: las ventanas de aluminio, dos por tramo o una de tres hojas en medio
  for (const y of [YB + 0.9, YB + 4.2]) {
    if (L > 6) for (const t of [c - L / 4, c + L / 4]) k.pic(t, y + 0.8, ZF + 0.008, Math.min(2.4, L / 2 - 1.0), 1.6, 0, 1, canvasTex(120, 80, cristales('#cfd0cc', 3, 'rgba(225,230,232,.45)')));
    else k.pic(c, y + 0.8, ZF + 0.008, Math.max(0.9, L - 1.4), 1.6, 0, 1, canvasTex(90, 80, cristales('#cfd0cc', 2, 'rgba(225,230,232,.45)')));
    k.box(c, y - 0.05, ZF + 0.05, L - 0.4, 0.07, 0.12, 0xe8e0d6);
  }
  // la pareja de columnas blancas al principio del tramo, con su remate
  for (const d of [-0.22, 0.22]) k.cyl(s0 + d, 0.45, ZF + 0.12, 0.17, 0.17, TECHO - 0.75, COLUMNA, { seg: 12 });
  k.box(s0, TECHO - 0.35, ZF + 0.1, 0.9, 0.35, 0.36, COLUMNA);
  // el pretil con la barandilla de tubos de la azotea
  k.box(c, TECHO - 0.2, ZF + 0.04, L, 0.2, 0.1, 0xe2d8cc);
  for (const y of [TECHO + 0.45, TECHO + 0.85]) k.box(c, y, Z + 0.05, L, 0.04, 0.04, 0xb8bcc0);
  for (let s = s0 + 0.6; s < s1; s += 1.6) k.box(s, TECHO, Z + 0.05, 0.04, 0.9, 0.04, 0xb8bcc0);
}

/** lo de la esquina: la banda marrón del Kokoxili, el letrero, la puerta y la esquina redonda */
function sushi(k, s0, s1) {
  const c = (s0 + s1) / 2, L = s1 - s0;
  k.box(c, YB - 0.95, ZF + 0.12, L + 0.4, 0.95, 0.2, 0x5a3a28);
  k.pic(c, YB - 0.475, ZF + 0.221, L + 0.4, 0.95, 0, 1, canvasTex(Math.round(L * 50), 80, bandaSushi));
  k.box(c, 2.5, ZF + 0.08, Math.min(3.4, L - 0.8), 0.5, 0.06, 0x3a2418);
  k.pic(c, 2.75, ZF + 0.111, Math.min(3.4, L - 0.8), 0.5, 0, 1, canvasTex(300, 44, kokoxili));
  k.pic(c, 1.15, ZF + 0.03, 1.8, 2.3, 0, 1, canvasTex(90, 115, cristales('#b8bcc0', 2, 'rgba(0,0,0,0)')));
}

/** se monta con lo demás de Arrecife Centro */
export function buildRamblaMedular75(scene, colliders, map) {
  if (!map?.ramblaMedular75) return null;
  const grupos = [];
  const xs = (M, s) => M.W(s, 0)[0];
  TRAMOS.forEach((M, i) => {
    const k = new Kit();
    const n = Math.max(1, Math.round(M.len / 7));
    for (let j = 0; j < n; j++) {
      const s0 = (M.len * j) / n, s1 = (M.len * (j + 1)) / n, x = xs(M, (s0 + s1) / 2);
      const que = i === 0 && j === 0 ? 'sushi' : Math.abs(x + 803) < 3.6 ? 'kebab' : (i * 3 + j) % 4;
      tramo(k, s0, s1, que);
      if (que === 'sushi') sushi(k, s0, s1);
      if (que === 'kebab') {
        k.box((s0 + s1) / 2, YB - 0.95, ZF + 0.12, s1 - s0 - 0.4, 0.95, 0.12, 0x2a1414);
        k.pic((s0 + s1) / 2, YB - 0.475, ZF + 0.181, s1 - s0 - 0.4, 0.95, 0, 1, canvasTex(320, 80, kebab));
      }
    }
    // la esquina redonda con la de Antonio Nieves Santos
    if (i === 0) k.cyl(0, 0, -0.2, 0.75, 0.75, TECHO, BEIS, { seg: 18 });
    const g = enMarco(k, M, 'ramblaMedular75_' + i, colliders);
    scene.add(g);
    grupos.push(g);
  });
  // la cara de Antonio Nieves Santos del edificio de oficinas, con la banda del Kokoxili que da la vuelta
  const k = new Kit();
  const s0 = LADO.len - FONDO;
  tramo(k, s0, s0 + FONDO / 2, 1);
  tramo(k, s0 + FONDO / 2, LADO.len, 'sushi');
  sushi(k, s0 + FONDO / 2, LADO.len);
  const g = enMarco(k, LADO, 'ramblaMedular75_lado', colliders);
  scene.add(g);
  grupos.push(g);
  return { group: grupos[0], grupos };
}
