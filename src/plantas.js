/**
 * Altura real de los edificios: las plantas sobre rasante de cada parte de edificio del Catastro (servicio INSPIRE,
 * public/map/plantas.json: [x, z, plantas, m2], lo baja tools/catastro_plantas.py). Fuente: Dirección General del
 * Catastro.
 *
 * Cada edificio del mapa coge las partes del Catastro cuyo centro cae dentro de su contorno y se queda con las plantas
 * del cuerpo principal: la planta más alta que ocupe al menos un cuarto de la superficie (así un edificio de 4 plantas
 * con un patio o un cuarto de una planta detrás sigue teniendo 4). Altura = plantas × ALTO_PLANTA + PETO.
 * Se hace al cargar el mapa, ANTES de los retoques de cada barrio: las alturas puestas a mano (prepararMapa) mandan.
 */

const ALTO_PLANTA = 3.0;
const PETO = 0.4;
const CELL = 32;

function inPoly(p, x, z) {
  let c = false;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    const [xi, zi] = p[i], [xj, zj] = p[j];
    if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) c = !c;
  }
  return c;
}

/**
 * @param {{ buildings: object[] }} map
 * @param {number[][]} partes [[x, z, plantas, m2], ...]
 * @returns {{ edificios: number, conDato: number, cambiados: number, sinDato: number }}
 */
export function aplicarPlantas(map, partes) {
  const stats = { edificios: 0, conDato: 0, cambiados: 0, sinDato: 0 };
  if (!Array.isArray(partes) || !partes.length) return stats;
  const grid = new Map();
  for (const q of partes) {
    const k = Math.floor(q[0] / CELL) * 100003 + Math.floor(q[1] / CELL);
    if (!grid.has(k)) grid.set(k, []);
    grid.get(k).push(q);
  }
  for (const b of map.buildings || []) {
    if (!b.p || b.p.length < 3) continue;
    stats.edificios++;
    let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
    for (const [x, z] of b.p) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); z0 = Math.min(z0, z); z1 = Math.max(z1, z); }
    const porPlantas = new Map();
    let total = 0;
    for (let cx = Math.floor(x0 / CELL); cx <= Math.floor(x1 / CELL); cx++) {
      for (let cz = Math.floor(z0 / CELL); cz <= Math.floor(z1 / CELL); cz++) {
        for (const [x, z, pl, a] of grid.get(cx * 100003 + cz) || []) {
          if (x < x0 || x > x1 || z < z0 || z > z1 || !inPoly(b.p, x, z)) continue;
          porPlantas.set(pl, (porPlantas.get(pl) || 0) + a);
          total += a;
        }
      }
    }
    // sin datos o solo partes bajo rasante: se queda como estaba
    const arriba = [...porPlantas].filter(([pl]) => pl > 0);
    if (!total || !arriba.length) { stats.sinDato++; continue; }
    arriba.sort((a, c) => c[0] - a[0]);
    const principal = (arriba.find(([, a]) => a >= total * 0.25) || arriba.sort((a, c) => c[1] - a[1])[0])[0];
    const h = Math.round((principal * ALTO_PLANTA + PETO) * 10) / 10;
    stats.conDato++;
    if (Math.abs(h - b.h) > 0.5) stats.cambiados++;
    b.hOsm ??= b.h;
    b.h = h;
    b.plantas = principal;
  }
  return stats;
}
