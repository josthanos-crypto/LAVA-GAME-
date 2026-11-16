import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';
import { alturaBloque, cristales } from './edificioReal.js';

/**
 * El IES Las Maretas, en la calle Triana 82, con las vistas de la calle de Google de julio de 2025 y la foto aérea (solo se
 * miran, no van dentro del juego; la gente no se pone). El mapa tenía el bloque gris de 5 m. De verdad es un edificio color
 * crema de tres plantas (10,5 m) con las filas de ventanas de aluminio y los ventanucos cuadrados; en medio, el cuerpo de
 * la entrada con los paños de bloque de cristal, las letras grandes «IES LAS MARETAS» sobre la puerta de cristal verde y
 * los focos en el remate. Por la calle Triana, el muro crema con la reja verde encima y, entre el muro y el edificio, el
 * jardín de picón con las palmeras y los arbustos.
 */

// la cara de la calle Triana, N hacia la calle; el muro de la calle va 8 m más allá
const M = marco([-1354.75, -417.85], [-1326.02, -394.07]);
const Z = 0.12, ZF = Z + 0.3, H = 10.5, CREMA = 0xeee2c4, DM = 8;

/** antes de levantar la ciudad: el bloque a sus tres plantas y color crema */
export function tuneIesLasMaretas(map) {
  if (!alturaBloque(map, -1350, -425, H, [238, 226, 196])) return;
  map.iesLasMaretas = true;
}

const ventana = cristales('#c8c8c4', 4, 'rgba(235,238,240,.45)');

/** el bloque de cristal de la entrada */
function bloqueVidrio(g, w, h) {
  g.fillStyle = '#9aa4a2';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#d8dcd8';
  g.lineWidth = 1;
  for (let x = 0; x < w; x += 6) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  for (let y = 0; y < h; y += 6) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
}

/** las letras del instituto, en relieve gris sobre el crema */
function letras(g, w, h) {
  g.fillStyle = '#eee2c4';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#7a7468';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(h * 0.7)}px Georgia, serif`;
  g.fillText('IES LAS MARETAS', w / 2, h / 2, w * 0.96);
}

/** una palmera del jardín */
function palmera(k, s, z, h) {
  k.cyl(s, 0, z, 0.25, 0.32, h, 0x7a6248, { seg: 8 });
  for (let i = 0; i < 9; i++) k.box(s, h - 0.1, z, 3.8, 0.05, 0.45, 0x4a7a32, { ry: (i * Math.PI) / 9 });
}

/** la fachada del edificio, el jardín y el muro de la calle */
function fachada(k) {
  const L = M.len, c = L / 2, EW = 9;
  k.box(c, 0, Z + 0.15, L, H, 0.3, CREMA);
  k.block(c, Z + 0.15, L, 0.3);
  // el cuerpo de la entrada, un poco salido, con los paños de bloque de cristal
  k.box(c, 0, ZF + 0.3, EW, H + 0.3, 0.6, CREMA);
  for (const ds of [-2.6, 0, 2.6]) k.pic(c + ds, 7.8, ZF + 0.62, 2.0, 2.4, 0, 1, canvasTex(60, 72, bloqueVidrio));
  for (const ds of [-2.6, 0, 2.6]) k.pic(c + ds, 5.0, ZF + 0.62, 2.0, 1.0, 0, 1, canvasTex(60, 30, bloqueVidrio));
  k.pic(c, 3.7, ZF + 0.9, EW - 0.6, 1.0, 0, 1, canvasTex(540, 60, letras));
  k.box(c, 3.1, ZF + 0.9, EW - 0.4, 0.35, 0.6, CREMA);
  k.box(c, 0, ZF + 0.64, 4.2, 2.6, 0.06, 0x2e6a3e);
  k.pic(c, 1.3, ZF + 0.68, 3.8, 2.3, 0, 1, canvasTex(152, 92, cristales('#2e6a3e', 4, 'rgba(160,180,175,.3)')));
  // las alas: las filas de ventanas de aluminio y los ventanucos
  for (const y of [1.2, 4.6, 8.0]) {
    for (const [a, b] of [[1, c - EW / 2 - 0.5], [c + EW / 2 + 0.5, L - 1]]) {
      for (let s = a + 1.3; s < b - 1; s += 3.2) k.pic(s, y + 0.8, ZF + 0.012, 2.6, 1.3, 0, 1, canvasTex(104, 52, ventana));
      k.box((a + b) / 2, y - 0.1, ZF + 0.06, b - a, 0.1, 0.15, 0xe2d6b8);
    }
    for (const ds of [-EW / 2 - 1.2, EW / 2 + 1.2]) k.pic(c + ds, y + 1.3, ZF + 0.012, 0.5, 0.5, 0, 1, canvasTex(20, 20, ventana));
  }
  k.box(c, H - 0.15, ZF + 0.05, L, 0.15, 0.15, 0xe2d6b8);
  for (const s of [3, c - 2, c + 2, L - 3]) k.box(s, H - 0.6, ZF + 0.25, 0.4, 0.25, 0.4, 0x3a3a3a);
  // el jardín de picón entre el edificio y el muro, con las palmeras y los arbustos
  k.box(c, 0, (ZF + DM) / 2 + 0.3, L, 0.3, DM - ZF - 1, 0x2e2a28);
  for (const s of [4, L - 6]) palmera(k, s, DM - 2.5, 7);
  palmera(k, c + 6, DM - 3, 4.5);
  for (const s of [9, c - 3, c + 3, L - 11]) k.ball(s, 1.0, DM - 2, 1.4, 0x4a7a3a);
  // el muro crema de la calle con la reja verde encima y la puerta de reja
  const P = c;
  for (const [p, q] of [[-2, P - 1.6], [P + 1.6, L + 2]]) {
    const m = (p + q) / 2;
    k.box(m, 0, DM, q - p, 1.4, 0.35, CREMA);
    k.block(m, DM, q - p, 0.35);
    k.box(m, 2.9, DM, q - p, 0.05, 0.05, 0x2e6a3e);
    for (let s = p + 0.1; s < q; s += 0.18) k.box(s, 1.4, DM, 0.03, 1.5, 0.03, 0x2e6a3e);
    for (let s = p; s <= q; s += 2.5) k.box(s, 1.4, DM, 0.08, 1.5, 0.08, 0x2e6a3e);
  }
  for (const s of [P - 1.6, P + 1.6]) k.box(s, 0, DM, 0.35, 2.9, 0.35, CREMA);
  for (let s = P - 1.4; s < P + 1.4; s += 0.14) k.box(s, 0.1, DM, 0.035, 2.4, 0.035, 0x2e6a3e);
}

/** se monta con lo de la Rambla Medular */
export function buildIesLasMaretas(scene, colliders, map) {
  if (!map?.iesLasMaretas) return null;
  const k = new Kit();
  fachada(k);
  const group = enMarco(k, M, 'iesLasMaretas', colliders);
  scene.add(group);
  return { group };
}
