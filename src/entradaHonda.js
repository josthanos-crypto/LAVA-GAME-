import * as THREE from 'three';

/**
 * La entrada a Playa Honda por la LZ-301, a la altura del nudo de Deiland, como en la foto de
 * Street View de julio de 2025 (mirando hacia Arrecife): la calzada lleva quitamiedos en el
 * borde que da al pueblo y, detrás, una fila de palmeras sobre el arcén de tierra.
 *
 * Solo es mobiliario: no toca el trazado de las calles ni los edificios (los pone world.js
 * con los datos de OpenStreetMap). `preparar` se llama antes de construir el mundo, porque las
 * palmeras se plantan con las demás; `build` después, dentro de la escena.
 */

// el nudo de la LZ-301 junto a Deiland, donde arranca la partida en Playa Honda
const NUDO = [-3690, 596];
// tramo que se viste, en x (de Arrecife hacia el oeste)
const DESDE = -3420, HASTA = -4040;
// radio que se deja limpio alrededor del nudo (la boca de la rotonda)
const HUECO = 30;

/** distancia de un punto a un segmento */
function distSeg(px, pz, ax, az, bx, bz) {
  const dx = bx - ax, dz = bz - az;
  const L2 = dx * dx + dz * dz;
  const t = L2 ? Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / L2)) : 0;
  return Math.hypot(px - (ax + dx * t), pz - (az + dz * t));
}

/** lo más cerca que pasa una calle de un punto */
function calleCerca(roads, x, z) {
  let d = Infinity;
  for (const r of roads) {
    const p = r.p;
    for (let i = 1; i < p.length; i++) {
      d = Math.min(d, distSeg(x, z, p[i - 1][0], p[i - 1][1], p[i][0], p[i][1]));
      if (d < 1) return d;
    }
  }
  return d;
}

/** lo más cerca que queda un edificio (por su centro) */
function edificioCerca(buildings, x, z) {
  let d = Infinity;
  for (const b of buildings) {
    let cx = 0, cz = 0;
    for (const q of b.p) { cx += q[0]; cz += q[1]; }
    cx /= b.p.length; cz /= b.p.length;
    d = Math.min(d, Math.hypot(x - cx, z - cz));
    if (d < 1) return d;
  }
  return d;
}

/** desplaza una polilínea a un lado (d > 0 = derecha del sentido de recorrido) */
function desplaza(p, d) {
  const out = [];
  for (let i = 0; i < p.length; i++) {
    const a = p[Math.max(0, i - 1)], b = p[Math.min(p.length - 1, i + 1)];
    let dx = b[0] - a[0], dz = b[1] - a[1];
    const L = Math.hypot(dx, dz) || 1;
    dx /= L; dz /= L;
    out.push([p[i][0] - dz * d, p[i][1] + dx * d]);
  }
  return out;
}

/** parte la polilínea en puntos cada «paso» metros */
function muestrea(p, paso) {
  const out = [p[0]];
  for (let i = 1; i < p.length; i++) {
    const [ax, az] = p[i - 1], [bx, bz] = p[i];
    const L = Math.hypot(bx - ax, bz - az);
    const n = Math.max(1, Math.ceil(L / paso));
    for (let k = 1; k <= n; k++) out.push([ax + (bx - ax) * k / n, az + (bz - az) * k / n]);
  }
  return out;
}

/**
 * La calzada de la LZ-301 más cercana al nudo (las dos del desdoble son de 12 m) y su borde
 * sur, que es el que da al pueblo.
 */
function bordeSur(map) {
  let best = null, bestD = Infinity;
  for (const r of map.roads) {
    if ((r.w || 0) < 11 || r.p.length < 2) continue;
    const d = Math.min(...r.p.map(([x, z]) => Math.hypot(x - NUDO[0], z - NUDO[1])));
    if (d < bestD) { bestD = d; best = r; }
  }
  if (!best || bestD > 400) return null;
  // fuera de la acera (la poner world.js a 2,2 m del borde): el quitamiedos va en el arcén
  const w = best.w / 2 + 2.9;
  const a = desplaza(best.p, w), b = desplaza(best.p, -w);
  const mediaZ = (p) => p.reduce((s, q) => s + q[1], 0) / p.length;
  const borde = mediaZ(a) > mediaZ(b) ? a : b;   // z crece hacia el sur
  return muestrea(borde, 3).filter(([x]) => x > HASTA && x < DESDE);
}

/** el arcén de detrás del quitamiedos, con grupos de palmeras como en la foto */
function plantarPalmeras(map, borde) {
  const fuera = desplaza(borde, 7.5);
  const puestas = [];
  const cabe = (x, z) => Math.hypot(x - NUDO[0], z - NUDO[1]) >= HUECO + 6
    && calleCerca(map.roads, x, z) >= 5          // ni en la calzada ni en la acera
    && edificioCerca(map.buildings, x, z) >= 7   // ni dentro de un edificio
    && !puestas.some(([px, pz]) => Math.hypot(px - x, pz - z) < 6);
  // un grupo de tres cada ~40 m, con el del medio un poco más atrás
  for (let i = 0; i < fuera.length; i += 13) {
    const [x, z] = fuera[i];
    const [ax, az] = fuera[Math.max(0, i - 1)];
    let tx = x - ax, tz = z - az;
    const L = Math.hypot(tx, tz) || 1;
    tx /= L; tz /= L;
    const grupo = [[-5, 0, 0], [0, 2.6, 1], [5, 0.8, 2]];
    for (const [largo, fondo, k] of grupo) {
      const px = x + tx * largo - tz * fondo, pz = z + tz * largo + tx * fondo;
      if (!cabe(px, pz)) continue;
      puestas.push([px, pz, 6.2 + k * 0.9 + ((i * 3) % 4) * 0.35, (i * 1.7 + k) % (Math.PI * 2)]);
    }
  }
  map.extraPalms = [...(map.extraPalms || []), ...puestas];
  return puestas.length;
}

/** antes de buildWorld: calcula el borde y añade las palmeras al mapa */
export function prepararEntradaHonda(map) {
  const borde = bordeSur(map);
  if (!borde) return null;
  plantarPalmeras(map, borde);
  return borde;
}

/**
 * El quitamiedos: postes cada 6 m y una banda de chapa a 0,72 m. Es solo adorno (no choca),
 * como el resto del mobiliario de las calles; el jugador no se queda encerrado.
 */
export function buildEntradaHonda(scene, borde, map) {
  if (!borde) return null;
  const postes = [], chapas = [];
  // donde una calle sale a la calzada (un cruce en T) el quitamiedos se corta: se mira el
  // extremo de cada calle, no su trazado, para no abrir huecos donde solo pasa cerca
  const bocas = [];
  for (const r of map?.roads || []) {
    if ((r.w || 0) >= 11 || r.p.length < 2) continue;
    bocas.push(r.p[0], r.p[r.p.length - 1]);
  }
  const cruce = (x, z) => bocas.some(([bx, bz]) => Math.hypot(bx - x, bz - z) < 13);
  for (let i = 1; i < borde.length; i++) {
    const [ax, az] = borde[i - 1], [bx, bz] = borde[i];
    const mx = (ax + bx) / 2, mz = (az + bz) / 2;
    if (Math.hypot(mx - NUDO[0], mz - NUDO[1]) < HUECO) continue;   // la boca de la rotonda, libre
    const dx = bx - ax, dz = bz - az, L = Math.hypot(dx, dz);
    if (L < 0.2) continue;
    if (cruce(mx, mz)) continue;                                   // ni delante de un cruce
    chapas.push([mx, mz, Math.atan2(dx, dz), L]);
    if (i % 2 === 0) postes.push([ax, az]);
  }
  if (!chapas.length) return null;

  const group = new THREE.Group();
  group.name = 'entradaPlayaHonda';

  const acero = new THREE.MeshStandardMaterial({ color: 0x9aa1a6, metalness: 0.65, roughness: 0.42 });
  // la chapa (una caja de 1 m de largo que se estira a cada tramo)
  const chapaGeo = new THREE.BoxGeometry(0.07, 0.32, 1);
  chapaGeo.translate(0, 0.72, 0);
  const chapa = new THREE.InstancedMesh(chapaGeo, acero, chapas.length);
  // los postes, hincados en el arcén
  const posteGeo = new THREE.BoxGeometry(0.11, 0.9, 0.13);
  posteGeo.translate(0, 0.45, 0);
  const poste = new THREE.InstancedMesh(posteGeo, acero, postes.length);

  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0);
  const uno = new THREE.Vector3(1, 1, 1), pos = new THREE.Vector3();
  chapas.forEach(([x, z, rot, L], i) => {
    q.setFromAxisAngle(up, rot);
    m.compose(pos.set(x, 0, z), q, new THREE.Vector3(1, 1, L + 0.06));
    chapa.setMatrixAt(i, m);
  });
  postes.forEach(([x, z], i) => {
    q.setFromAxisAngle(up, 0);
    m.compose(pos.set(x, 0, z), q, uno);
    poste.setMatrixAt(i, m);
  });
  chapa.castShadow = poste.castShadow = true;
  chapa.receiveShadow = poste.receiveShadow = true;
  group.add(chapa, poste);
  scene.add(group);
  return { group, tramos: chapas.length, postes: postes.length };
}
