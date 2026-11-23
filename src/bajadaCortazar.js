import * as THREE from 'three';
import { Kit } from './interiorKit.js';
import { makeCar } from './carModels.js';

/**
 * (Version 162) La bajada del camino de tierra al barrio, como en el vídeo de José Manuel (recursos\argana alta\
 * argana-alta-frames\IMG_0397, fotogramas 1 a 232: sale en coche de su camino y baja hacia el sur).
 *
 * Situado sobre la ortofoto del IGN: el camino llega al barrio por la calle Julio Cortázar, la del borde este
 * (casas solo a la derecha, solar de lava con bordillo a la izquierda y el mar al fondo a la izquierda), y acaba en
 * un cruce en T. En el mapa esa calle venía entera como camino de tierra.
 *
 *  - `tuneBajadaCortazar(map)` (desde Maneje): parte la calle donde empieza el asfalto, junto al edificio crema de la
 *    esquina (`CORTE`); de ahí para abajo es calle asfaltada con coches aparcados en línea a la derecha (pasan a
 *    `map.lotSpots`).
 *  - `buildBajadaCortazar(scene, colliders, map)`: lo del cruce en T del final, que se ve en los fotogramas 204 a
 *    216: el poste con el STOP y el prohibido girar a la izquierda, los cuatro contenedores de la izquierda, la grúa
 *    torre amarilla desmontada en el solar vallado de la derecha y el coche plateado abandonado con su pegatina rosa.
 * Sin hacer: el color crema del edificio de la esquina (las fachadas genéricas no dejan elegir color) y, por no saberse
 * el sitio exacto, la valla de chapa ondulada, la casa del portal 65 y las fachadas una a una.
 */
const CALLE = /^Calle Julio Cortazar$/;
const CORTE = [-1884.73, -2603.63];      // donde el camino pasa a asfalto
const ANCHO = 6.2;
const SOLAR = { a: [-1866.0, -2443.6], b: [-1863.7, -2430.1], grua: [-1874.5, -2437.2] };
const hash = (n) => { const v = Math.sin(n * 41.3 + 2.7) * 43758.5453; return v - Math.floor(v); };

/** puntos a lo largo de la calle cada `paso` metros: [x, z, ux, uz, s] y el largo total */
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
  return { pts: out, largo: s };
}

export function tuneBajadaCortazar(map) {
  const cerca = (q) => Math.hypot(q[0] - CORTE[0], q[1] - CORTE[1]) < 3;
  const r = (map.roads || []).find(o => CALLE.test(o.name || '') && o.dirt && o.p.length >= 4 && o.p.some(cerca));
  if (!r) return;
  const i = r.p.findIndex(cerca);
  if (i < 1 || i > r.p.length - 2) return;
  // de la esquina para abajo, asfalto; el trozo de arriba sigue siendo camino de tierra
  const sur = { ...r, p: r.p.slice(i), w: ANCHO, noParking: true, bajada: true };
  delete sur.dirt;
  r.p = r.p.slice(0, i + 1);
  map.roads.push(sur);
  map.bajadaCortazar = sur;
  // los coches aparcados en línea a la derecha de la bajada (el último sitio se deja para el abandonado)
  if (!Array.isArray(map.lotSpots)) return;
  const { pts, largo } = recorrer(sur.p, 5.6);
  for (const [x, z, ux, uz, s] of pts) {
    if (s < 9 || s > largo - 20 || hash(s) > 0.62) continue;
    map.lotSpots.push([+(x - uz * (ANCHO / 2 - 0.95)).toFixed(2), +(z + ux * (ANCHO / 2 - 0.95)).toFixed(2), Math.atan2(ux, uz)]);
  }
}

function lienzo(w, h, pinta) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  pinta(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** las dos señales del poste: el STOP y, debajo, el disco de prohibido girar a la izquierda */
function senales() {
  return lienzo(128, 256, (g) => {
    g.clearRect(0, 0, 128, 256);
    g.beginPath();
    for (let i = 0; i < 8; i++) { const a = Math.PI / 8 + i * Math.PI / 4; g.lineTo(64 + Math.cos(a) * 62, 64 + Math.sin(a) * 62); }
    g.closePath(); g.fillStyle = '#ffffff'; g.fill();
    g.beginPath();
    for (let i = 0; i < 8; i++) { const a = Math.PI / 8 + i * Math.PI / 4; g.lineTo(64 + Math.cos(a) * 56, 64 + Math.sin(a) * 56); }
    g.closePath(); g.fillStyle = '#c8102e'; g.fill();
    g.fillStyle = '#ffffff'; g.font = 'bold 34px Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('STOP', 64, 66);
    // el disco: fondo blanco, borde rojo, la flecha negra que tuerce a la izquierda y la barra roja
    g.fillStyle = '#c8102e'; g.beginPath(); g.arc(64, 192, 60, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#ffffff'; g.beginPath(); g.arc(64, 192, 47, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#111111'; g.lineWidth = 11; g.lineJoin = 'miter';
    g.beginPath(); g.moveTo(82, 224); g.lineTo(82, 180); g.lineTo(46, 180); g.stroke();
    g.fillStyle = '#111111'; g.beginPath(); g.moveTo(30, 180); g.lineTo(52, 164); g.lineTo(52, 196); g.closePath(); g.fill();
    g.strokeStyle = '#c8102e'; g.lineWidth = 10;
    g.beginPath(); g.moveTo(30, 158); g.lineTo(98, 226); g.stroke();
  });
}

function malla() {
  const t = lienzo(64, 64, (g) => {
    g.clearRect(0, 0, 64, 64);
    g.strokeStyle = 'rgba(150,156,160,1)'; g.lineWidth = 2;
    for (let k = -64; k <= 128; k += 16) {
      g.beginPath(); g.moveTo(k, 0); g.lineTo(k + 64, 64); g.stroke();
      g.beginPath(); g.moveTo(k + 64, 0); g.lineTo(k, 64); g.stroke();
    }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/** un tramo de la torre de la grúa, tumbado: cuatro largueros y las diagonales de celosía */
function tramoGrua(k, cx, cz, ry, largo, y0) {
  const AM = 0xe0b21a, L = 1.15, cos = Math.cos(ry), sin = Math.sin(ry);
  const en = (a, b) => [cx + cos * a + sin * b, cz - sin * a + cos * b];
  for (const [b, y] of [[-L / 2, y0], [L / 2, y0], [-L / 2, y0 + L], [L / 2, y0 + L]]) {
    const [x, z] = en(0, b);
    k.box(x, y, z, largo, 0.1, 0.1, AM, { ry });
  }
  for (let a = -largo / 2; a <= largo / 2 + 0.01; a += L) {
    // los marcos y las diagonales de la cara de arriba y de las dos de los lados
    for (const b of [-L / 2, L / 2]) { const [x, z] = en(a, b); k.box(x, y0, z, 0.07, L, 0.07, AM, { ry }); }
    for (const y of [y0, y0 + L]) { const [x, z] = en(a, 0); k.box(x, y, z, 0.07, 0.07, L, AM, { ry }); }
    if (a + L > largo / 2 + 0.01) continue;
    const [x, z] = en(a + L / 2, 0);
    k.box(x, y0 + L, z, 0.06, 0.06, L * 1.41, AM, { ry: ry + Math.PI / 4 });
    k.box(x, y0, z, 0.06, 0.06, L * 1.41, AM, { ry: ry - Math.PI / 4 });
  }
}

export function buildBajadaCortazar(scene, colliders, map) {
  const calle = map?.bajadaCortazar;
  if (!calle) return null;
  const P = calle.p, E = P[P.length - 1], A = P[P.length - 2];
  const L = Math.hypot(E[0] - A[0], E[1] - A[1]), u = [(E[0] - A[0]) / L, (E[1] - A[1]) / L];
  const R = [-u[1], u[0]], I = [u[1], -u[0]];   // derecha e izquierda de quien baja
  const en = (atras, lado, v) => [E[0] - u[0] * atras + v[0] * lado, E[1] - u[1] * atras + v[1] * lado];
  const k = new Kit();
  const ACERA = 0.24, CALZ = 0.14;

  // el poste del cruce: STOP y, debajo, prohibido girar a la izquierda; miran a quien baja
  const [px, pz] = en(5, ANCHO / 2 + 0.7, R);
  k.cyl(px, ACERA, pz, 0.035, 0.035, 3.0, 0x9aa0a4, { seg: 8 });
  k.block(px, pz, 0.2, 0.2);

  // los cuatro contenedores de la izquierda: el verde grande, dos negros y el amarillo
  const ry = Math.atan2(u[0], u[1]);
  [[1.35, 1.25, 1.3, 0x2f7d4a, 0x8d9296], [0.62, 1.05, 0.72, 0x1d1f21, 0x1d1f21], [0.62, 1.05, 0.72, 0x1d1f21, 0x1d1f21], [1.2, 1.2, 1.1, 0x8d9296, 0xe2bf22]]
    .reduce((s, [w, h, d, cuerpo, tapa]) => {
      const [x, z] = en(9 + s + w / 2, ANCHO / 2 + 0.75, I);
      k.box(x, CALZ + 0.12, z, d, h - 0.12, w, cuerpo, { ry });
      k.box(x, CALZ + h, z, d + 0.06, 0.1, w + 0.06, tapa, { ry });
      for (const t of [-w / 2 + 0.12, w / 2 - 0.12]) { const o = [x - u[0] * t, z - u[1] * t]; k.cyl(o[0], CALZ, o[1], 0.07, 0.07, 0.14, 0x18191a, { seg: 6 }); }
      k.block(x, z, d, w, ry);
      return s + w + 0.18;
    }, 0);

  // el solar vallado de la derecha: postes, malla y la grúa torre amarilla desmontada, en dos tramos tumbados
  const [ax, az] = SOLAR.a, [bx, bz] = SOLAR.b, LV = Math.hypot(bx - ax, bz - az), vx = (bx - ax) / LV, vz = (bz - az) / LV;
  for (let s = 0; s <= LV + 0.01; s += LV / 6) k.cyl(ax + vx * s, ACERA, az + vz * s, 0.03, 0.03, 2.05, 0x8a9094, { seg: 6 });
  k.box((ax + bx) / 2, ACERA + 2.0, (az + bz) / 2, 0.04, 0.04, LV, 0x8a9094, { ry: Math.atan2(vx, vz) });
  k.seg(ax, az, bx, bz);
  const [gx, gz] = SOLAR.grua;
  tramoGrua(k, gx - 0.6, gz - 2.2, 0.06, 11.5, ACERA);
  tramoGrua(k, gx + 0.8, gz + 1.9, -0.16, 9.2, ACERA);
  // los contrapesos de hormigón, apilados al lado
  for (const [dx, dz, h] of [[5.2, 4.2, 0.9], [6.5, 4.4, 0.9], [5.8, 4.3, 1.8]]) k.box(gx + dx - 4, ACERA + (h > 1 ? 0.9 : 0), gz + dz, 1.2, 0.9, 0.5, 0xa9a59c, { ry: 0.2 });

  // el sitio del coche abandonado (junto al STOP, a la derecha): choca como un coche aparcado
  const [cx, cz] = en(12.5, ANCHO / 2 - 0.95, R);
  for (const lado of [-1, 1]) {
    const o = [cx + R[0] * 0.85 * lado, cz + R[1] * 0.85 * lado];
    k.seg(o[0] - u[0] * 1.9, o[1] - u[1] * 1.9, o[0] + u[0] * 1.9, o[1] + u[1] * 1.9);
  }

  const { group, segs } = k.build('bajadaCortazar');
  // las dos placas del poste (recortadas: el lienzo es transparente alrededor)
  const placas = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 1.5),
    new THREE.MeshStandardMaterial({ map: senales(), alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.5 }));
  placas.rotation.y = Math.atan2(-u[0], -u[1]);
  placas.position.set(px - u[0] * 0.05, 2.35, pz - u[1] * 0.05);
  group.add(placas);
  // la malla de la valla (se ve a través)
  const tex = malla();
  tex.repeat.set(LV / 0.5, 4);
  const paño = new THREE.Mesh(new THREE.PlaneGeometry(LV, 2.0),
    new THREE.MeshStandardMaterial({ map: tex, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.6, metalness: 0.4 }));
  paño.rotation.y = Math.atan2(vx, vz) + Math.PI / 2;
  paño.position.set((ax + bx) / 2, ACERA + 1.02, (az + bz) / 2);
  group.add(paño);

  // el coche plateado abandonado junto al STOP, con la pegatina rosa en el parabrisas
  const coche = makeCar('hatch', 0xb4b8bc);
  coche.group.position.set(cx, 0.165, cz);
  coche.group.rotation.y = ry;
  const pegatina = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.21), new THREE.MeshBasicMaterial({ color: 0xf06aa8, side: THREE.DoubleSide }));
  const d = coche.dims || {};
  pegatina.position.set(0.32, (d.height || 1.45) * 0.72, (d.zf ?? 1.9) * 0.42);
  pegatina.rotation.x = -1.0;
  coche.body.add(pegatina);
  group.add(coche.group);
  scene.add(group);
  for (const sg of segs) colliders.addSegment(...sg);
  return group;
}
