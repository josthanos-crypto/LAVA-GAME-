import * as THREE from 'three';
import { recortar, desplazar, cinta, malla } from './puenteRayas.js';

/**
 * El aparcamiento de delante del ALDI de la Rambla Medular (Version 134, pedido por José Manuel: «el parking del
 * ALDI se ve mal»).
 *
 * Lo que había: una franja de asfalto de 10 m con diez plazas en batería pegada a la fachada. No cabe: entre la
 * nave y la Rambla solo hay la acera, así que la franja quedaba pintada encima de la acera y de la calzada, con el
 * tráfico pasando por las plazas.
 *
 * Lo que se ve en la foto aérea (PNOA) delante de la nave es acera ancha y coches aparcados en línea junto al
 * bordillo. Eso es lo que se pinta aquí: la banda de aparcamiento en línea a lo largo de la fachada, en el borde de
 * la calzada, siguiendo la calle del mapa (y con ella la cuesta). Las 71 plazas de verdad del supermercado no están
 * en la calle; por dónde se entra a ellas no se sabe todavía (que lo diga José Manuel) y no se inventa.
 */

const ANCHO = 2.2;    // ancho de la banda de aparcamiento
const LARGO = 5.4;    // largo de cada plaza en línea

/**
 * a, b: los dos extremos de la fachada que da a la calle. Añade al grupo la pintura de las plazas y devuelve cuántas.
 */
export function buildAparcamientoAldi(grupo, map, a, b) {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const u = [(b[0] - a[0]) / len, (b[1] - a[1]) / len];
  const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  // la calzada que pasa por delante: el trozo de calle con coches más cercano a la fachada, a lo largo de ella
  let mejor = null;
  for (const r of map.roads || []) {
    if (r.ped || r.dirt || r.p.length < 2) continue;
    for (const run of recortar(r.p, mid, u, len / 2 - 4, 30)) {
      const d = Math.min(...run.map(q => Math.hypot(q[0] - mid[0], q[1] - mid[1])));
      const largo = Math.hypot(run[run.length - 1][0] - run[0][0], run[run.length - 1][1] - run[0][1]);
      if (largo > len * 0.6 && (!mejor || d < mejor.d)) mejor = { r, run, d };
    }
  }
  if (!mejor) return 0;
  const { r, run } = mejor;
  // de qué lado de la calle cae la nave (desplazar mueve a la izquierda de la marcha)
  const cerca = (pts) => Math.min(...pts.map(q => Math.hypot(q[0] - mid[0], q[1] - mid[1])));
  const lado = cerca(desplazar(run, 1)) < cerca(desplazar(run, -1)) ? 1 : -1;
  const y = (r.major ? 0.16 : 0.14) + 0.012;
  const yDe = () => y;
  const dentro = desplazar(run, lado * (r.w / 2 - ANCHO)), fuera = desplazar(run, lado * (r.w / 2 - 0.3));
  const pos = [];
  cinta(pos, dentro, yDe, 0.05, false);
  // las rayas que separan las plazas, cada LARGO metros
  let s = 0, sig = 0, plazas = -1;
  for (let i = 0; i < run.length - 1; i++) {
    const l = Math.hypot(run[i + 1][0] - run[i][0], run[i + 1][1] - run[i][1]);
    while (sig <= s + l) {
      const k = (sig - s) / (l || 1);
      const P = (pts) => [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k];
      const p0 = P(dentro), p1 = P(fuera);
      cinta(pos, [p0, [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2], p1], yDe, 0.05, false);
      sig += LARGO;
      plazas++;
    }
    s += l;
  }
  const mat = new THREE.MeshStandardMaterial({ color: 0xe9e7e1, roughness: 0.85, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  const m = malla(pos, mat);
  if (m) { m.name = 'aldiPlazasEnLinea'; grupo.add(m); }
  return Math.max(0, plazas);
}
