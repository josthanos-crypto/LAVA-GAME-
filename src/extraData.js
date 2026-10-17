/**
 * Datos añadidos a mano sobre la foto aérea del PNOA (coordenadas del juego, en
 * metros: x hacia el este, z hacia el sur). El mapa de OpenStreetMap no traía
 * el agua del Charco de San Ginés ni la arena de la playa del Reducto.
 */
import { PLACES, ROUNDABOUTS, islandR } from './places.js';
import { markCivic } from './civic.js';
import { SAN_GINES_PARK } from './sanGines.js';

// Charco de San Ginés: la laguna grande y la cuenca de levante
export const CHARCO_WATER = [
  [[562.3, 114.2], [552.3, 182.7], [553.7, 186.9], [559.4, 189.1], [570.1, 189.1], [590.8, 192.7],
    [594.4, 194.8], [665.8, 209.8], [676.5, 209.8], [687.9, 205.5], [699.3, 194.1], [699.3, 129.1],
    [692.9, 124.9], [675, 125.6], [667.9, 122], [658.6, 124.2], [652.2, 120.6], [595.8, 115.6], [586.5, 117],
    [571.6, 113.5], [562.3, 114.2]],
  [[75.7, 33.5], [75.7, 40], [82.8, 51.4], [128.5, 68.5], [134.2, 66.4], [137, 68.5], [142.7, 83.5],
    [142.7, 90.6], [138.5, 94.2], [139.2, 99.2], [143.5, 109.9], [147, 112.7], [148.4, 120.6], [156.3, 126.3],
    [159.9, 133.4], [160.6, 142.7], [164.1, 145.6], [166.3, 154.8], [170.6, 157.7], [178.4, 177],
    [196.3, 204.8], [207, 215.5], [214.1, 219.8], [222.7, 229.8], [234.1, 236.2], [238.3, 235.5], [240.5, 229],
    [249.8, 226.9], [249.8, 224.8], [254, 221.9], [259, 221.9], [271.2, 230.5], [271.2, 236.9], [280.4, 234.7],
    [286.9, 239], [291.2, 239], [300.4, 229.8], [300.4, 225.5], [306.8, 219.1], [308.3, 212.6], [316.1, 201.9],
    [328.3, 198.4], [344.7, 200.5], [351.8, 195.5], [359.6, 202.6], [363.9, 200.5], [382.5, 207.6],
    [384.6, 209.8], [384.6, 214.1], [379.6, 228.3], [400.3, 239.7], [407.5, 225.5], [416.7, 216.2],
    [427.4, 213.3], [460.3, 209.8], [459.5, 204.1], [465.3, 199.8], [471.7, 201.2], [475.2, 208.3],
    [510.9, 205.5], [515.2, 202.6], [518.8, 204.8], [522.3, 204.1], [537.3, 196.2], [544.5, 189.1],
    [555.2, 113.5], [551.6, 112], [506.6, 109.9], [498.8, 112], [494.5, 109.2], [489.5, 109.9], [487.4, 108.5],
    [416, 102], [370.4, 70.6], [366.1, 66.4], [363.2, 59.2], [340.4, 40], [321.1, 32.1], [284, 32.1],
    [226.9, 45], [221.2, 49.2], [216.2, 47.1], [202.7, 49.9], [199.1, 54.2], [194.1, 56.4], [184.8, 53.5],
    [154.2, 59.2], [144.9, 59.2], [139.2, 63.5], [135.6, 59.9], [134.9, 49.2], [118.5, 33.5], [97.1, 31.4],
    [75.7, 33.5]],
];

// Playa del Reducto: entre el paseo de las palmeras y la orilla
export const REDUCTO_BEACH = [[-987.4, 481.2], [-941.3, 463.2], [-909.4, 450.2], [-876.7, 438.3], [-856.4, 434.5], [-834.6, 432.5],
  [-825.6, 431.5], [-785.8, 428.5], [-746.1, 427.5], [-732.8, 429.4], [-718.9, 432.4], [-704.1, 435.4],
  [-688.4, 440.3], [-654.4, 451.3], [-606.4, 466.3], [-557.4, 482.3], [-541.3, 487.3], [-514, 500],
  [-500, 518], [-494, 540], [-495, 557.8], [-521.4, 545.4], [-560.2, 530.8], [-594, 522.7], [-622.8, 523.4],
  [-648.8, 525.3], [-667.5, 548], [-683.6, 549.3], [-689.4, 541.7], [-689.9, 530.9], [-688.2, 518.1],
  [-690.3, 504.8], [-698.6, 494.4], [-717.1, 483.3], [-731.1, 477.3], [-779.1, 464.5], [-830.6, 460.5],
  [-860.9, 463.8], [-889.2, 472.2], [-922.6, 490.3], [-951.2, 515.9], [-969.4, 540.1], [-977.1, 554.2],
  [-987.4, 481.2]];

/** añade al mapa lo que le faltaba */
export function applyExtras(map) {
  map.places = PLACES;
  map.inlandWater = CHARCO_WATER;
  map.beaches = [REDUCTO_BEACH, ...(map.beaches || [])];
  // palmeras en corro en las isletas grandes de las rotondas (y ninguna donde va la escultura)
  const trees = (map.trees || []).filter(([x, z]) => !ROUNDABOUTS.some(([cx, cz]) => Math.hypot(x - cx, z - cz) < 3.5));
  ROUNDABOUTS.forEach((ra, i) => {
    const ri = islandR(ra);
    if (ri < 6) return;
    const n = Math.max(3, Math.min(9, Math.round(ri / 2.6)));
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2 + i * 0.7;
      trees.push([ra[0] + Math.cos(a) * ri * 0.7, ra[1] + Math.sin(a) * ri * 0.7]);
    }
  });
  map.trees = trees;
  // organismos, colegios y hoteles: su edificio y su color de fachada
  markCivic(map);
  markFamous(map);
  return map;
}

/**
 * sitios con modelo propio: la iglesia de San Ginés (no se levanta como un
 * bloque más), el Puente de las Bolas (lleva sus muretes) y el parque de
 * detrás de la iglesia
 */
function markFamous(map) {
  const [gx, gz] = PLACES.iglesiaSanGines;
  for (const b of map.buildings || []) {
    if (b.k !== 'church') continue;
    const cx = b.p.reduce((s, q) => s + q[0], 0) / b.p.length, cz = b.p.reduce((s, q) => s + q[1], 0) / b.p.length;
    if (Math.hypot(cx - gx, cz - gz) < 30) { b.skip = true; b.sanGines = true; }
  }
  const bolas = (map.roads || []).find(r => /puente de las bolas/i.test(r.name || ''));
  if (bolas) {
    bolas.bolas = true;
    const ends = [bolas.p[0], bolas.p[bolas.p.length - 1]];
    for (const r of map.roads) {
      if (r === bolas || !r.ped || r.w > 3.5) continue;
      const touch = [r.p[0], r.p[r.p.length - 1]].some(([x, z]) => ends.some(([ex, ez]) => Math.hypot(x - ex, z - ez) < 0.6));
      if (touch) r.bolas = true;
    }
  }
  map.areas = [...(map.areas || []), { k: 'park', p: SAN_GINES_PARK }];
}
