import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';
import { alzarEdificio, cristales } from './edificioReal.js';

/**
 * El edificio de los Juzgados de Arrecife, en la Rambla Medular 101 (esquina con Aragón), con las vistas de la calle
 * de Google de julio de 2025 y la foto aérea (solo se miran, no van dentro del juego; la gente no se pone). El mapa
 * tenía el bloque gris de 9,3 m y liso. Por la Rambla: el bajo de sillares de piedra gris oscura, un poco metido, con
 * los portones de chapa marrón con su rejilla, las letras de «JUZGADOS» en la piedra, la placa de la institución y la
 * entrada de cristal; encima, el cuerpo grande forrado de placas cuadradas blancas que vuela sobre la acera; y en medio,
 * delante de la entrada, el gran marco de vigas de madera oscura que sube desde la primera planta hasta arriba. Delante,
 * los escalones de piedra corridos, la barandilla de tubo y la señal de aparcamiento; en la esquina de Aragón, la torre
 * de cristal de la escalera y el parterre de piedra con los cactus.
 */

// la cara de la Rambla Medular del bloque, de la esquina de Aragón (s 0) al norte, N hacia la calle (al oeste)
const M = marco([-983.53, -221.93], [-999.34, -183.91]);
const Z = 0.12, ZF = Z + 0.3, H = 14, YB = 3.6, VUELO = 0.9;
// la entrada con el marco de madera (centro y ancho) y los grupos de portones marrones
const E = 23.2, EW = 7.6;
const PORTONES = [[8.4, 10.8, 13.2], [31.4, 33.8, 36.2]];

/** antes de levantar la ciudad: la franja del edificio por la Rambla, más alta que el bloque */
export function tuneJuzgadosArrecife(map) {
  if (!Array.isArray(map?.buildings)) return;
  map.juzgadosArrecife = true;
  alzarEdificio(map, M, 0, M.len, 16, H, [228, 228, 226]);
}

// ——— lo que se pinta en lienzo ———

/** los sillares de piedra gris oscura del bajo */
function sillares(g, w, h) {
  g.fillStyle = '#6a6c6c';
  g.fillRect(0, 0, w, h);
  let s = 21;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const fila = h / 6;
  for (let y = 0, i = 0; y < h; y += fila, i++) {
    for (let x = -(i % 2) * 30; x < w; x += 60) {
      g.fillStyle = `rgb(${92 + r() * 30},${94 + r() * 28},${94 + r() * 26})`;
      g.fillRect(x + 1, y + 1, 58, fila - 2);
    }
  }
  for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(${r() < 0.5 ? '40,40,40' : '170,170,168'},.25)`; g.fillRect(r() * w, r() * h, 2, 2); }
}

/** el forro de placas cuadradas blancas con las juntas finas */
function placas(g, w, h) {
  g.fillStyle = '#e8e8e6';
  g.fillRect(0, 0, w, h);
  const t = h / 10;
  let s = 4;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let y = 0; y < h; y += t) for (let x = 0; x < w; x += t) {
    g.fillStyle = `rgba(${200 + r() * 30},${200 + r() * 30},${200 + r() * 30},.35)`;
    g.fillRect(x, y, t, t);
  }
  g.strokeStyle = 'rgba(120,120,118,.6)';
  g.lineWidth = 1.2;
  for (let y = 0; y <= h; y += t) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  for (let x = 0; x <= w; x += t) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
}

/** el portón de chapa marrón con la rejilla a media altura */
function porton(g, w, h) {
  g.fillStyle = '#4a2e24';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#3a2218';
  g.fillRect(w / 2 - 1, 0, 2, h);
  g.fillStyle = '#c8c4bc';
  for (let y = h * 0.55; y < h * 0.66; y += 5) g.fillRect(w * 0.12, y, w * 0.76, 2);
}

/** las letras metálicas de «JUZGADOS» sobre la piedra */
function letras(g, w, h) {
  g.fillStyle = '#7a7c7c';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#3a3a38';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(h * 0.78)}px "Times New Roman", Georgia, serif`;
  g.fillText('JUZGADOS', w / 2, h * 0.55, w * 0.98);
}

/** la placa azul y amarilla de la institución (sin escudo) */
function placa(g, w, h) {
  g.fillStyle = '#f2f0e8';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#1f3e8a';
  g.fillRect(0, 0, w * 0.35, h);
  g.fillStyle = '#e8c040';
  g.fillRect(w * 0.35, 0, w * 0.08, h);
}

const cristalera = cristales('#3a3a3c', 4, 'rgba(190,205,215,.25)');

// ——— las piezas ———

/** la fachada de la Rambla: el bajo de piedra, el cuerpo de placas que vuela, el marco de madera y la entrada */
function fachada(k) {
  const L = M.len;
  // el bajo de piedra, un poco metido
  k.box(L / 2, 0, Z + 0.15, L, YB, 0.3, 0x6a6c6c);
  k.block(L / 2, Z + 0.15, L, 0.3);
  k.pic(L / 2, YB / 2, ZF + 0.004, L, YB, 0, 1, canvasTex(Math.round(L * 20), 72, sillares));
  // el cuerpo de placas blancas que vuela sobre la acera
  k.box(L / 2, YB, ZF + VUELO / 2, L, H - YB, VUELO, 0xe8e8e6);
  k.pic(L / 2, (YB + H) / 2, ZF + VUELO + 0.004, L, H - YB, 0, 1, canvasTex(Math.round(L * 14), Math.round((H - YB) * 14), placas));
  k.box(L / 2, YB - 0.12, ZF + VUELO / 2, L, 0.12, VUELO, 0xd8d8d4);
  // los portones marrones del bajo
  for (const grupo of PORTONES) for (const s of grupo) k.pic(s, 1.35, ZF + 0.012, 1.9, 2.7, 0, 1, canvasTex(70, 100, porton));
  // las letras de JUZGADOS, la placa de la institución y la entrada de cristal
  k.pic(16.2, 2.6, ZF + 0.02, 4.0, 0.55, 0, 1, canvasTex(260, 36, letras));
  k.pic(28.8, 2.4, ZF + 0.02, 0.9, 0.6, 0, 1, canvasTex(45, 30, placa));
  k.pic(E, 1.5, ZF + 0.012, EW - 1.2, 3.0, 0, 1, canvasTex(240, 120, cristalera), { glow: 0.15 });
  for (const s of [E - EW / 2 + 0.3, E + EW / 2 - 0.3]) { k.box(s, 0, ZF + 0.3, 0.6, YB, 0.6, 0x6a6c6c); k.block(s, ZF + 0.3, 0.6, 0.6); }
  // el gran marco de vigas de madera oscura delante de la entrada, de la primera planta hasta arriba
  const MAD = 0x8a5c3a, y0 = YB, y1 = H - 0.4, zm = ZF + VUELO + 1.1, P = 2.2;
  k.box(E, y0, zm, EW, 0.45, P, MAD);
  k.box(E, y1 - 0.4, zm, EW, 0.4, P, MAD);
  for (const s of [E - EW / 2, E + EW / 2]) {
    k.box(s, y0, zm, 0.4, y1 - y0, P, MAD);
    for (let y = y0 + 0.9; y < y1 - 0.5; y += 0.9) k.box(s, y, zm, 0.45, 0.12, P, MAD);
    for (let z = -P / 2 + 0.35; z < P / 2; z += 0.55) k.box(s, y0, zm + z, 0.45, y1 - y0, 0.12, MAD);
  }
  for (let s = E - EW / 2 + 0.6; s < E + EW / 2 - 0.3; s += 0.6) {
    k.box(s, y0, zm, 0.12, 0.45, P, 0x6e4a30);
    k.box(s, y1 - 0.4, zm, 0.12, 0.4, P, 0x6e4a30);
  }
  // el hueco de cristal detrás del marco
  k.pic(E, (y0 + y1) / 2, ZF + VUELO + 0.012, EW - 1.0, y1 - y0 - 0.6, 0, 1, canvasTex(200, 220, cristalera));
  // los escalones de piedra corridos y la barandilla de tubo
  for (let i = 0; i < 3; i++) k.box(L / 2 + 2, 0, ZF + 1.0 + i * 0.45, L - 8, 0.45 - i * 0.15, 0.45, 0x8a8a86);
  k.box(17.7, 0.95, ZF + 1.4, 2.6, 0.05, 0.05, 0xb8b8b4);
  for (const s of [16.5, 18.9]) k.box(s, 0, ZF + 1.4, 0.05, 0.95, 0.05, 0xb8b8b4);
  // la señal azul de aparcamiento y la de prohibido aparcar
  k.cyl(27.0, 0, ZF + 2.6, 0.04, 0.04, 2.6, 0x9a9a98, { seg: 8 });
  k.box(27.0, 2.2, ZF + 2.62, 0.5, 0.55, 0.03, 0x1f5ab4);
  k.cyl(13.6, 0, ZF + 2.6, 0.04, 0.04, 2.6, 0x9a9a98, { seg: 8 });
  k.cyl(13.6, 2.4, ZF + 2.62, 0.3, 0.3, 0.03, 0xc82a2a, { seg: 20, rx: Math.PI / 2 });
  k.cyl(13.6, 2.4, ZF + 2.64, 0.24, 0.24, 0.03, 0x1f4aa0, { seg: 20, rx: Math.PI / 2 });
  // en la esquina de Aragón: la torre de cristal de la escalera y el parterre de piedra con los cactus
  k.box(1.3, YB, ZF + VUELO + 0.2, 2.4, H - YB + 0.5, 0.4, 0x5a6a74, { list: k.glass });
  for (let y = YB + 1.6; y < H; y += 1.8) k.box(1.3, y, ZF + VUELO + 0.42, 2.4, 0.08, 0.06, 0x2a2a2a);
  k.box(3.2, 0, ZF + 3.0, 5.6, 0.8, 2.6, 0x6a6c6c);
  k.block(3.2, ZF + 3.0, 5.6, 2.6);
  for (const [s, h] of [[4.6, 2.4], [2.8, 1.6], [1.4, 2.0]]) {
    k.cyl(s, 0.8, ZF + 3.0, 0.14, 0.16, h, 0x4a7a4a, { seg: 8 });
    k.cyl(s + 0.3, 0.8 + h * 0.5, ZF + 3.0, 0.09, 0.09, h * 0.4, 0x4a7a4a, { seg: 8 });
  }
}

/** se monta con lo demás de Arrecife Centro */
export function buildJuzgadosArrecife(scene, colliders, map) {
  if (!map?.juzgadosArrecife) return null;
  const k = new Kit();
  fachada(k);
  const group = enMarco(k, M, 'juzgadosArrecife', colliders);
  scene.add(group);
  return { group };
}
