import { Kit, canvasTex } from './interiorKit.js';
import { paveMesh, polyTris, asfalto } from './suelos.js';

/**
 * El parking de los médicos del Hospital Insular (foto de José Manuel, mirando al norte desde la
 * entrada): la manzana en forma de gota entre Juan de Quesada y la calle de detrás (la foto aérea la
 * enseña con los árboles y los coches). Asfalto con las plazas pintadas y coches aparcados a los dos
 * lados (parked.js, map.lotSpots), casuarinas altas, palmeras a la izquierda y una farola alta. En la
 * entrada, la isleta con el bordillo pintado de rojo y blanco y picón, la barrera levantada en su poste
 * gris, el apoyo rojo y blanco de la barrera, la señal de dirección prohibida, el paso de cebra amarillo
 * y las líneas curvas del suelo. Medidas sobre la foto aérea.
 */

// el asfalto del parking, dejando las aceras de las calles de alrededor
const LOT = [[775.5, -115.5], [777.6, -115.5], [781.5, -118], [782, -121], [782, -127], [781.5, -130], [781, -133],
  [780, -136], [779.5, -139], [778.5, -142], [778.3, -145], [777.6, -148], [776.8, -151], [776, -153.5], [774, -153.5],
  [772.5, -151], [770, -148], [768.5, -145], [767.5, -142], [767, -139], [766.5, -136], [766.5, -133], [767, -130],
  [767.5, -127], [768, -124], [769, -121], [770, -118]];
// la entrada (x hacia el este, z hacia la calle): la isleta de x -1,6 a 0, el carril de entrada a su derecha
const GATE = [775.6, -117];
const CAR_L = 4.6, STALL = 2.6, AISLE = 4.4;

/** dónde empieza y acaba el asfalto a la altura z */
function span(z) {
  const xs = [];
  for (let i = 0; i < LOT.length; i++) {
    const [ax, az] = LOT[i], [bx, bz] = LOT[(i + 1) % LOT.length];
    if ((az > z) !== (bz > z)) xs.push(ax + ((z - az) * (bx - ax)) / (bz - az));
  }
  return xs.length >= 2 ? [Math.min(...xs), Math.max(...xs)] : null;
}

/** las plazas: dos filas donde cabe el pasillo en medio, y solo la de la derecha donde se estrecha */
function stalls() {
  const out = [];
  for (let z = -123; z > -152; z -= STALL) {
    const a = span(z - STALL / 2), b = span(z + STALL / 2);
    if (!a || !b) continue;
    const x0 = Math.max(a[0], b[0]), x1 = Math.min(a[1], b[1]);
    if (x1 - x0 >= 2 * CAR_L + AISLE) out.push([x0 + CAR_L / 2, z, -Math.PI / 2]);
    if (x1 - x0 >= CAR_L + AISLE) out.push([x1 - CAR_L / 2, z, Math.PI / 2]);
  }
  return out;
}
export const PARKING_MEDICOS_SPOTS = stalls();
/** las palmeras de la izquierda (foto), donde ya no hay fila de coches */
export const PARKING_MEDICOS_PALMS = [[771.2, -150.4, 8.4], [769.4, -147.4, 9.2], [768.2, -144.3, 7.8]];

/** casuarina: tronco alto y fino con el follaje colgante, ralo, en varios mechones */
function casuarina(k, x, z, h) {
  k.cyl(x, 0, z, 0.12, 0.22, h, 0x6b5d50, { seg: 7 });
  // ramas finas que salen del tronco y mechones colgantes, claros y separados (se ve el cielo entre ellos)
  for (let i = 0; i < 11; i++) {
    const a = i * 2.39, d = 0.6 + (i % 4) * 0.5, y = h * (0.42 + (i / 11) * 0.55);
    k.cyl(x, y - 0.6, z, 0.03, 0.05, d + 0.2, 0x6b5d50, { seg: 4, rx: 1.1, ry: Math.PI / 2 - a });
    // mechón colgante: cono al revés, ancho arriba y en punta abajo
    const L = 1.6 + (i % 3) * 0.4;
    k.cyl(x + Math.cos(a) * d, y - L * 0.7, z + Math.sin(a) * d, 0.55 + (i % 2) * 0.2, 0.04, L, [0x7a8a63, 0x6c7c58, 0x87946e][i % 3], { seg: 6 });
  }
  for (let i = 0; i < 4; i++) k.cyl(x + Math.cos(i * 1.6) * 0.3, h - 1.4, z + Math.sin(i * 1.6) * 0.3, 0.5, 0.05, 1.8, 0x7a8a63, { seg: 6 });
  k.block(x, z, 0.4, 0.4);
}

/** la señal de dirección prohibida */
function noEntry(g, w, h) {
  g.fillStyle = '#c8322b';
  g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 2, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#ffffff'; g.lineWidth = w * 0.04;
  g.beginPath(); g.arc(w / 2, h / 2, w / 2 - w * 0.05, 0, Math.PI * 2); g.stroke();
  g.fillStyle = '#ffffff';
  g.fillRect(w * 0.18, h * 0.42, w * 0.64, h * 0.16);
}

/** la entrada de la foto, en su marco (x hacia el este, z hacia la calle) */
function gate() {
  const k = new Kit(), RED = 0xc8322b, WHITE = 0xf2f2ee;
  // isleta: bordillo a trozos rojo y blanco, picón dentro
  // todo encima del asfalto del parking (0,14 m): si no, en el móvil el asfalto tapa el bordillo
  const B = 0.14, ix0 = -1.6, ix1 = 0, iz0 = -4, iz1 = 0, H = 0.16, T = 0.2;
  const curb = (ax, az, bx, bz) => {
    const len = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.round(len / 0.5));
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n, w = (bx - ax) / n, d = (bz - az) / n;
      k.box(ax + (bx - ax) * t, B, az + (bz - az) * t, Math.abs(w) || T, H, Math.abs(d) || T, i % 2 ? WHITE : RED);
    }
  };
  curb(ix0, iz0, ix1, iz0); curb(ix0, iz1, ix1, iz1); curb(ix0, iz0 + T, ix0, iz1 - T); curb(ix1, iz0 + T, ix1, iz1 - T);
  k.box((ix0 + ix1) / 2, B, (iz0 + iz1) / 2, ix1 - ix0 - 2 * T, H - 0.03, iz1 - iz0 - 2 * T, 0x2b2927);
  k.block((ix0 + ix1) / 2, (iz0 + iz1) / 2, ix1 - ix0, iz1 - iz0);
  // la barrera: poste gris con el remate amarillo y el brazo levantado, a rayas rojas y blancas
  const px = -0.2, pz = -3.7;
  k.box(px, B + H, pz, 0.32, 1.0, 0.32, 0x6d7278).box(px, B + H + 1.0, pz, 0.34, 0.08, 0.34, 0xe0c341);
  for (let i = 0; i < 8; i++) k.box(px + 0.2, B + H + 0.95 + i * 0.52, pz, 0.08, 0.52, 0.08, i % 2 ? RED : WHITE);
  // el apoyo del brazo al otro lado del carril de entrada: tres patas a rayas, aro y horquilla rojos
  const rx = 3.4;
  k.cyl(rx, B, pz, 0.035, 0.035, 1.25, 0x1d1f22, { seg: 8 });
  for (const [dx, dz] of [[-0.14, 0.08], [0.14, 0.08], [0, -0.15]]) {
    for (let j = 0; j < 4; j++) k.cyl(rx + dx, B + j * 0.2, pz + dz, 0.035, 0.035, 0.2, j % 2 ? RED : WHITE, { seg: 6 });
  }
  k.cyl(rx, B + 0.78, pz, 0.24, 0.24, 0.08, RED, { seg: 16 }).box(rx, B + 1.15, pz, 0.24, 0.22, 0.2, RED);
  k.block(rx, pz, 0.4, 0.4);
  // dirección prohibida en la isleta, para los que salen
  k.cyl(-1.0, B + H, -1.2, 0.03, 0.03, 2.5, 0x9aa0a6, { seg: 8 });
  k.pic(-1.0, B + 2.35, -1.23, 0.6, 0.6, 0, -1, canvasTex(128, 128, noEntry));
  k.box(-1.0, B + 2.05, -1.2, 0.6, 0.6, 0.02, 0x9aa0a6);
  k.box(-1.0, B + 1.55, -1.21, 0.3, 0.42, 0.02, 0xdfe3e6);
  // paso de cebra amarillo a la izquierda y las líneas curvas del carril de entrada
  for (let i = 0; i < 4; i++) k.box(-3.5, 0.16, 0.6 + i * 0.85, 3.4, 0.015, 0.45, 0xe2c23e, { list: k.shell });
  for (let i = 0; i < 9; i++) {
    const a = Math.PI + (i / 8) * (Math.PI / 2), b = Math.PI + ((i + 1) / 8) * (Math.PI / 2);
    for (const [r, c] of [[3.0, 0xeeeeea], [2.3, 0xe2c23e]]) {
      const ax = 6.6 + Math.cos(a) * r, az = -1 + Math.sin(a) * -r, bx = 6.6 + Math.cos(b) * r, bz = -1 + Math.sin(b) * -r;
      if (i === 8) continue;
      k.box((ax + bx) / 2, 0.16, (az + bz) / 2, 0.12, 0.015, Math.hypot(bx - ax, bz - az) + 0.02, c, { ry: Math.atan2(bx - ax, bz - az), list: k.shell });
    }
  }
  return k;
}

export function buildParkingMedicos(scene, colliders) {
  const pave = paveMesh(polyTris(LOT), 0.14, asfalto(), 0xffffff);
  if (pave) { pave.name = 'parkingMedicos'; scene.add(pave); }
  // las plazas pintadas, las casuarinas y la farola, en el mundo
  const k = new Kit(), LINE = 0xe9e7e0;
  for (const [x, z, heading] of PARKING_MEDICOS_SPOTS) {
    const out = heading > 0 ? 1 : -1;
    for (const dz of [-STALL / 2, STALL / 2]) k.box(x, 0.16, z + dz, CAR_L + 0.3, 0.015, 0.1, LINE, { list: k.shell });
    k.box(x + out * (CAR_L / 2 + 0.15), 0.16, z, 0.1, 0.015, STALL, LINE, { list: k.shell });
  }
  for (let z = -121; z > -150; z -= 7) {
    const s = span(z);
    if (!s) continue;
    casuarina(k, s[1] + 0.5, z - 1.3, 10.5 + ((z * 7) % 3));
    if (z > -142) casuarina(k, s[0] - 0.5, z - 4.6, 9.5 + ((z * 3) % 2.5));
  }
  k.cyl(773.6, 0.14, -137, 0.07, 0.1, 8.5, 0x9aa0a6, { seg: 10 });
  k.box(773.6, 8.4, -137.4, 0.12, 0.08, 0.8, 0x9aa0a6).box(773.6, 8.28, -137.8, 0.3, 0.14, 0.4, 0x8a9096);
  k.block(773.6, -137, 0.3, 0.3);
  const lot = k.build('parkingMedicosCosas');
  scene.add(lot.group);
  for (const sg of lot.segs) colliders.addSegment(...sg);
  // la entrada, en su sitio
  const g = gate().build('entradaParkingMedicos');
  g.group.position.set(GATE[0], 0, GATE[1]);
  scene.add(g.group);
  for (const [ax, az, bx, bz] of g.segs) colliders.addSegment(GATE[0] + ax, GATE[1] + az, GATE[0] + bx, GATE[1] + bz);
}
