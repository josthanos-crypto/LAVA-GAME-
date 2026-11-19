import { Kit } from './interiorKit.js';
import { crossings } from './sentidos.js';

/**
 * (Version 154) La Calle Tenderete, de la circunvalación a la rotonda de la Repsol, como es de verdad.
 *
 * En el mapa venía como una calle de 8 m. En la ortofoto del IGN la calzada mide unos 16 m y en los fotogramas del
 * recorrido de José Manuel (recursos\argana alta\argana-alta-frames\IMG_5153, el 152) se ve cómo está ahora:
 * dos carriles por sentido, coches aparcados en línea a los dos lados y, en medio, una mediana con bordillo, tierra
 * roja, matas bajas y farolas altas de tubo (fotogramas 152 y 164). De la rotonda de la Repsol para arriba la calle sigue estrecha, como estaba.
 *
 *  - `tuneTendereteAvenida(map)`: ensancha esos tramos (`r.wOsm` guarda la anchura vieja; ajusteCalles.js los vuelve
 *    a estrechar si alguna fachada no deja) y apunta los coches aparcados en `map.lotSpots` (los pone parked.js).
 *  - `buildTendereteAvenida(scene, colliders, map)`: la mediana, las farolas y las rayas de los aparcamientos.
 * La mediana se corta en los cruces (donde llega otra calle) para que se pueda girar.
 */
// de la mediana hacia fuera: dos carriles de 3 m, la raya de los aparcamientos y los coches en línea
const ANCHO = 18, MEDIANA = 1.3, CARRILES = 3.65, CARRIL = 6.7, APARCADO = 7.85;
const ARRIBA = -1372;   // la rotonda de la Repsol: de ahí para arriba no se toca
const CORTE = 11;       // metros de mediana que se quitan a cada lado de un cruce

const esAvenida = (r) => /^Calle Tenderete$/.test(r.name || '') && r.p.every(([, z]) => z > ARRIBA);

/** los tramos, encadenados de abajo (sureste) a arriba (noroeste) */
function eje(map) {
  const pts = [];
  for (const r of map.roads.filter(esAvenida)) for (const q of r.p) if (!pts.some(o => Math.hypot(o[0] - q[0], o[1] - q[1]) < 0.5)) pts.push(q);
  return pts.sort((a, b) => b[1] - a[1]);
}

/** puntos cada `paso` metros: [x, z, ux, uz, s] */
function recorrer(P, paso) {
  const out = [];
  let s = 0, next = 0;
  for (let i = 1; i < P.length; i++) {
    const [ax, az] = P[i - 1], [bx, bz] = P[i], L = Math.hypot(bx - ax, bz - az);
    if (L < 0.01) continue;
    const ux = (bx - ax) / L, uz = (bz - az) / L;
    for (; next <= s + L; next += paso) out.push([ax + ux * (next - s), az + uz * (next - s), ux, uz, next]);
    s += L;
  }
  return out;
}

/** a qué distancias del principio llega otra calle (ahí se corta la mediana y no se aparca) */
function cruces(map, P) {
  const largo = recorrer(P, 2), out = [];
  for (const r of map.roads) {
    if (esAvenida(r) || r.ped || r.p.length < 2) continue;
    for (const [x, z] of [r.p[0], r.p[r.p.length - 1]]) {
      let best = null, d = 13;
      for (const q of largo) { const e = Math.hypot(q[0] - x, q[1] - z); if (e < d) { d = e; best = q[4]; } }
      if (best != null) out.push(best);
    }
  }
  return out;
}

/** a qué distancias del principio hay un paso de peatones (la mediana se abre y no se aparca encima) */
function pasos(map, P) {
  const largo = recorrer(P, 1), out = [];
  let lista = [];
  try { lista = crossings(map) || []; } catch { lista = []; }
  for (const c of lista) {
    let best = null, d = 9;
    for (const q of largo) { const e = Math.hypot(q[0] - c.x, q[1] - c.z); if (e < d) { d = e; best = q[4]; } }
    if (best != null) out.push(best);
  }
  return out;
}

const hash = (n) => { const v = Math.sin(n * 127.1) * 43758.5453; return v - Math.floor(v); };

export function tuneTendereteAvenida(map) {
  const tramos = map.roads.filter(esAvenida);
  if (!tramos.length) return;
  for (const r of tramos) { r.wOsm ??= r.w; r.w = ANCHO; r.lanes = 4; r.noParking = true; }
  const P = eje(map), X = cruces(map, P), fin = recorrer(P, 1).length - 1;
  // (los pasos de peatones no se miran aquí: `crossings` guarda su lista y aún faltan retoques de otros barrios)
  const libre = (s, m) => s > m && s < fin - m && !X.some(c => Math.abs(c - s) < m);
  const spots = [];
  for (const [x, z, ux, uz, s] of recorrer(P, 5.6)) {
    if (!libre(s, CORTE + 4)) continue;
    // la derecha de la marcha subiendo es el lado de las naves; los del otro lado miran hacia abajo
    for (const lado of [1, -1]) {
      if (hash(s * 1.7 + lado) > 0.62) continue;
      spots.push([+(x - uz * APARCADO * lado).toFixed(2), +(z + ux * APARCADO * lado).toFixed(2), Math.atan2(ux, uz) + (lado > 0 ? 0 : Math.PI)]);
    }
  }
  map.tendereteAvenida = { eje: P, cruces: X, largo: fin };
  if (Array.isArray(map.lotSpots)) map.lotSpots.push(...spots);
}

export function buildTendereteAvenida(scene, colliders, map) {
  const dato = map.tendereteAvenida;
  if (!dato) return null;
  const { eje: P, cruces: X, largo } = dato, Z = pasos(map, P);
  const libre = (s, m) => s > m && s < largo - m && !X.some(c => Math.abs(c - s) < m) && !Z.some(c => Math.abs(c - s) < 4.5);
  const k = new Kit();
  for (const [x, z, ux, uz, s] of recorrer(P, 3)) {
    const ry = Math.atan2(ux, uz);
    // la raya que separa el carril de los aparcamientos, a trazos, y la continua de junto a la mediana
    if (libre(s, CORTE + 2)) for (const lado of [1, -1]) k.box(x - uz * CARRIL * lado, 0.148, z + ux * CARRIL * lado, 0.12, 0.012, 1.6, 0xd8d6cf, { ry, list: k.shell });
    // la raya entre los dos carriles de cada sentido
    if (libre(s, CORTE + 2) && Math.round(s / 3) % 2) for (const lado of [1, -1]) k.box(x - uz * CARRILES * lado, 0.148, z + ux * CARRILES * lado, 0.12, 0.012, 2.4, 0xd8d6cf, { ry, list: k.shell });
    if (!libre(s, CORTE)) continue;
    for (const lado of [1, -1]) k.box(x - uz * (MEDIANA / 2 + 0.3) * lado, 0.148, z + ux * (MEDIANA / 2 + 0.3) * lado, 0.12, 0.012, 3.02, 0xd8d6cf, { ry, list: k.shell });
    // la mediana: bordillo de hormigón, tierra roja y el seto bajo
    k.box(x, 0.14, z, MEDIANA, 0.2, 3.02, 0xb9b6ae, { ry, list: k.shell });
    k.box(x, 0.34, z, MEDIANA - 0.36, 0.03, 3.02, 0x7a4334, { ry, list: k.shell });
    if (Math.round(s / 3) % 2 === 0) k.ball(x, 0.52, z, 0.42, 0x4f6b3a, { sy: 0.75, seg: 7 });
    // las farolas altas de tubo, de dos brazos, cada 30 m
    if (Math.round(s / 3) % 10 === 5 && libre(s, CORTE + 6)) {
      k.cyl(x, 0.34, z, 0.07, 0.1, 9.2, 0xaeb2b5, { seg: 8 });
      k.box(x, 9.5, z, 2.6, 0.08, 0.1, 0xaeb2b5, { ry: ry + Math.PI / 2 });
      for (const lado of [1, -1]) k.box(x - uz * 1.25 * lado, 9.4, z + ux * 1.25 * lado, 0.5, 0.1, 0.22, 0xe8e6dc, { ry: ry + Math.PI / 2, list: k.glow });
      k.block(x, z, 0.3, 0.3);
    }
  }
  const { group, segs } = k.build('tendereteAvenida');
  scene.add(group);
  for (const sg of segs) colliders.addSegment(...sg);
  return group;
}
