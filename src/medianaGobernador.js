import * as THREE from 'three';

/**
 * (Version 167) La calle Gobernador (Civil) José García Hernández, entre la rotonda de El Claudiano y la calle
 * Extremadura (Valterra, junto a la Escuela de Pesca), como en las capturas de Look Around del 23-11-2026 (PC de
 * Arrecife, `Downloads\recursos lava game 2026-11-23\centro`, fotos 0768 y 0772) y en la foto aérea del juego:
 *  - la mediana entre las dos calzadas: bordillo claro, tierra y una fila de arbustos verdes;
 *  - la manzana en forma de gota del final (donde se juntan con la calle Extremadura; es el parking de los
 *    médicos): palmeras y una araucaria en su acera de alrededor.
 * Es adorno: la mediana no choca. Las palmeras van por `map.extraPalms`, como las demás.
 * A ojo: el número y el sitio exacto de cada palmera y de la araucaria; la mediana y la isleta sí están donde en la foto aérea.
 */

// la línea del medio de las dos calzadas (x, z), medida en el mapa
const EJE = [[654, -295], [677.4, -268.5], [748, -193.5]];
// (Version 168) la «isleta ovalada» del final es el parking de los médicos (parkingMedicos.js). En la Version 167
// las palmeras y la araucaria caían dentro, entre los coches: ahora van en la acera de alrededor, entre las
// casuarinas que ya había (a 1,4 m por fuera del borde del asfalto).
const PALMERAS = [[783.4, -125.8], [782.4, -132.8], [780.6, -139.8], [779.3, -146.8], [767.3, -122], [765.8, -129.1], [765.1, -136.1]];
const ARAUCARIA = [775.6, -155];

function lejosDeCalles(roads, x, z, margen) {
  for (const r of roads || []) {
    const p = r.p; if (!p || p.length < 2) continue;
    if (Math.abs(p[0][0] - x) > 400 || Math.abs(p[0][1] - z) > 400) continue;
    const lim = (r.w || 6) / 2 + margen;
    for (let i = 1; i < p.length; i++) {
      const ax = p[i - 1][0], az = p[i - 1][1], dx = p[i][0] - ax, dz = p[i][1] - az, L2 = dx * dx + dz * dz || 1;
      const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L2));
      if (Math.hypot(ax + dx * t - x, az + dz * t - z) < lim) return false;
    }
  }
  return true;
}

/** las palmeras del palmeral de la isleta (antes de montar el mapa) */
export function tuneMedianaGobernador(map) {
  const puestas = [];
  PALMERAS.forEach(([x, z], k) => {
    if (!lejosDeCalles(map.roads, x, z, 0.7)) return;
    puestas.push([x, z, 6.2 + (k * 7 % 5) * 0.5, (k * 1.9) % (Math.PI * 2)]);
  });
  map.extraPalms = [...(map.extraPalms || []), ...puestas];
  map.medianaGobernador = { palmeras: puestas.length };
}

export function buildMedianaGobernador(scene, map) {
  const grupo = new THREE.Group();
  grupo.name = 'medianaGobernador';
  // tramos de 2 m a lo largo de la línea del medio
  const segs = [];
  for (let i = 1; i < EJE.length; i++) {
    const [ax, az] = EJE[i - 1], [bx, bz] = EJE[i];
    const n = Math.max(1, Math.round(Math.hypot(bx - ax, bz - az) / 2));
    for (let k = 0; k < n; k++) segs.push([[ax + (bx - ax) * k / n, az + (bz - az) * k / n], [ax + (bx - ax) * (k + 1) / n, az + (bz - az) * (k + 1) / n]]);
  }
  const gBord = new THREE.BoxGeometry(2.6, 0.2, 1); gBord.translate(0, 0.1, 0);
  const gTierra = new THREE.BoxGeometry(2.2, 0.06, 1); gTierra.translate(0, 0.22, 0);
  const bord = new THREE.InstancedMesh(gBord, new THREE.MeshStandardMaterial({ color: 0xcfcbc2, roughness: 0.95 }), segs.length);
  const tierra = new THREE.InstancedMesh(gTierra, new THREE.MeshStandardMaterial({ color: 0x5a4a3c, roughness: 1 }), segs.length);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0), pos = new THREE.Vector3(), esc = new THREE.Vector3();
  const sitios = [];
  segs.forEach(([a, b], i) => {
    const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz);
    q.setFromAxisAngle(up, Math.atan2(dx, dz));
    m.compose(pos.set((a[0] + b[0]) / 2, 0, (a[1] + b[1]) / 2), q, esc.set(1, 1, L + 0.03));
    bord.setMatrixAt(i, m); tierra.setMatrixAt(i, m);
    if (i % 2 === 0) sitios.push([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, i]);
  });
  bord.receiveShadow = tierra.receiveShadow = true;
  grupo.add(bord, tierra);

  // los arbustos verdes en fila (uno cada 4 m)
  const gMata = new THREE.IcosahedronGeometry(0.55, 0); gMata.translate(0, 0.5, 0);
  const mata = new THREE.InstancedMesh(gMata, new THREE.MeshStandardMaterial({ color: 0x3f6b36, roughness: 0.9, flatShading: true }), sitios.length);
  sitios.forEach(([x, z, i], k) => {
    q.setFromAxisAngle(up, i * 1.3);
    m.compose(pos.set(x, 0.24, z), q, esc.set(1, 1.1 + (i % 3) * 0.25, 1));
    mata.setMatrixAt(k, m);
  });
  mata.castShadow = true;
  grupo.add(mata);

  // la araucaria de la isleta: tronco recto y pisos de ramas, cada vez más cortos
  const [ax, az] = ARAUCARIA, alto = 15;
  const tronco = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.34, alto, 6), new THREE.MeshStandardMaterial({ color: 0x5a4636, roughness: 0.95 }));
  tronco.position.set(ax, alto / 2, az);
  const pisos = 9, gPiso = new THREE.ConeGeometry(1, 0.7, 7);
  const ramas = new THREE.InstancedMesh(gPiso, new THREE.MeshStandardMaterial({ color: 0x24492c, roughness: 0.9, flatShading: true }), pisos);
  for (let k = 0; k < pisos; k++) {
    const t = k / (pisos - 1), y = 3.2 + t * (alto - 3.4), r = 3.4 * (1 - t) + 0.5;
    q.setFromAxisAngle(up, k * 0.6);
    m.compose(pos.set(ax, y, az), q, esc.set(r, 1.3, r));
    ramas.setMatrixAt(k, m);
  }
  tronco.castShadow = ramas.castShadow = true;
  grupo.add(tronco, ramas);

  grupo.userData.cuenta = { tramos: segs.length, arbustos: sitios.length, palmeras: map?.medianaGobernador?.palmeras || 0 };
  scene.add(grupo);
  return grupo;
}
