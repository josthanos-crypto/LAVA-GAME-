import * as THREE from 'three';

/**
 * (Version 165) La mediana ajardinada de León y Castillo entre la calle El Salvador y la Rambla Medular (Altavista),
 * como en las capturas de Look Around del 23-11-2026 (PC de Arrecife, `Downloads\recursos lava game 2026-11-23\centro`,
 * fotos 0503 «León y Castillo 147» y 0512 «León y Castillo 135», mirando al sur): un bordillo oscuro de piedra entre
 * las dos calzadas, con pitas y matas bajas de color granate en fila.
 *
 * Solo es adorno: no choca y no toca el trazado. La línea es la del medio de las dos calzadas del mapa (calles
 * 1172 y 1221) y, más abajo, el eje de la calle única hasta antes de la rotonda. Se abre en el paso de peatones del
 * resalto (z −846) y en el cruce de la calle Palencia (z −798).
 *
 * Sin hacer: la isleta de tierra y el carril bici del lado de la Plenergy, el tótem de precios y el «40» pintado en
 * los carriles que bajan (se probó como lámina sobre el asfalto y quedaba medio tapada por la cuesta).
 */

// la línea del medio, de norte a sur (x, z), medida en el mapa
const EJE = [
  [325.5, -926], [323.4, -914], [321.4, -902], [319.3, -890], [317.1, -878], [314.8, -866], [311.7, -854],
  [308.6, -842], [305.4, -830], [303.4, -818], [301.6, -796], [298.3, -780], [295.1, -764], [291.9, -748],
];
// huecos (en z): el paso de peatones del resalto y el cruce de la calle Palencia
const HUECOS = [[-851.5, -840.5], [-824, -786]];
const enHueco = (z) => HUECOS.some(([a, b]) => z > a && z < b);

function tramos() {
  const out = [];
  for (let i = 1; i < EJE.length; i++) {
    const [ax, az] = EJE[i - 1], [bx, bz] = EJE[i];
    const L = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.round(L / 2));
    for (let k = 0; k < n; k++) {
      const t0 = k / n, t1 = (k + 1) / n;
      const p = [ax + (bx - ax) * t0, az + (bz - az) * t0], q = [ax + (bx - ax) * t1, az + (bz - az) * t1];
      if (enHueco((p[1] + q[1]) / 2)) continue;
      out.push([p, q]);
    }
  }
  return out;
}

export function buildMedianaLyC(scene) {
  const segs = tramos();
  if (!segs.length) return null;
  const grupo = new THREE.Group();
  grupo.name = 'medianaLyC';

  // el bordillo de piedra oscura y la tierra de dentro
  const gBord = new THREE.BoxGeometry(0.9, 0.2, 1); gBord.translate(0, 0.1, 0);
  const gTierra = new THREE.BoxGeometry(0.6, 0.06, 1); gTierra.translate(0, 0.22, 0);
  const bord = new THREE.InstancedMesh(gBord, new THREE.MeshStandardMaterial({ color: 0x3b3a3c, roughness: 0.95 }), segs.length);
  const tierra = new THREE.InstancedMesh(gTierra, new THREE.MeshStandardMaterial({ color: 0x4a3c33, roughness: 1 }), segs.length);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0), pos = new THREE.Vector3(), esc = new THREE.Vector3();
  const plantas = [];
  segs.forEach(([a, b], i) => {
    const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz);
    q.setFromAxisAngle(up, Math.atan2(dx, dz));
    m.compose(pos.set((a[0] + b[0]) / 2, 0, (a[1] + b[1]) / 2), q, esc.set(1, 1, L + 0.03));
    bord.setMatrixAt(i, m); tierra.setMatrixAt(i, m);
    plantas.push([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, i]);
  });
  bord.receiveShadow = tierra.receiveShadow = true;
  grupo.add(bord, tierra);

  // las plantas en fila: de cada tres, una pita; las otras dos, matas granate
  const pitas = plantas.filter(p => p[2] % 3 === 0), matas = plantas.filter(p => p[2] % 3 !== 0);
  const gHoja = new THREE.ConeGeometry(0.09, 0.95, 4); gHoja.translate(0, 0.475, 0);
  const hojas = new THREE.InstancedMesh(gHoja, new THREE.MeshStandardMaterial({ color: 0x7f9c86, roughness: 0.85, flatShading: true }), pitas.length * 7);
  const e = new THREE.Euler();
  let n = 0;
  for (const [x, z, i] of pitas) {
    const alto = 0.85 + (i * 7 % 5) * 0.07;
    for (let k = 0; k < 7; k++) {
      const giro = k * 0.898 + i, caida = k === 0 ? 0 : 0.5 + (k % 3) * 0.13;
      q.setFromEuler(e.set(caida * Math.cos(giro), 0, caida * Math.sin(giro)));
      m.compose(pos.set(x, 0.24, z), q, esc.set(1.25, alto, 1.25));
      hojas.setMatrixAt(n++, m);
    }
  }
  hojas.castShadow = true;
  const gMata = new THREE.SphereGeometry(0.34, 7, 5); gMata.translate(0, 0.2, 0);
  const mata = new THREE.InstancedMesh(gMata, new THREE.MeshStandardMaterial({ color: 0x5c2434, roughness: 0.9, flatShading: true }), matas.length);
  matas.forEach(([x, z, i], k) => {
    q.setFromAxisAngle(up, i * 1.3);
    m.compose(pos.set(x, 0.24, z), q, esc.set(1, 0.62 + (i % 4) * 0.06, 1.25));
    mata.setMatrixAt(k, m);
  });
  mata.castShadow = true;
  grupo.add(hojas, mata);

  grupo.userData.cuenta = { tramos: segs.length, pitas: pitas.length, matas: matas.length };
  scene.add(grupo);
  return grupo;
}
