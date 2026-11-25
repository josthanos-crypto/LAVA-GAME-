import * as THREE from 'three';

/**
 * (Version 172) El muro blanco del campo de fútbol Agapito Reyes Viera por la calle Mosta, con su portón verde, y las
 * cuatro torres de focos. De las capturas de Look Around del 24-11-2026 (PC de casa, carpeta «recursos lava game
 * 2026-11-24 web casa», barrio altavista: calle_mosta 2761-2768, que recorre el muro, y calle_tornajo 2463-2464, que
 * lo ve de frente con el portón). Solo se miran. Antes el campo no tenía nada alrededor.
 * El muro choca. A ojo: dónde empieza y acaba, la altura (3,4 m), cada cuánto va un machón, el sitio exacto del
 * portón (un poco al este de la calle Tornajo) y el sitio y la altura de las torres.
 */

// la línea del muro, de oeste a este, a unos 8,5 m al sur del eje de Mosta
const ALTO = 3.4, GRUESO = 0.3, CADA = 6;
const TRAMOS = [
  { p: [[250.5, -1750.0], [298.5, -1741.6], [326.5, -1736.7]], alto: ALTO },
  { p: [[326.5, -1736.7], [326.1, -1734.3]], alto: ALTO, liso: true },                 // el retranqueo del portón
  { p: [[326.1, -1734.3], [343.1, -1731.4]], alto: 3.0, liso: true, porton: 7 },       // el paño bajo, con el portón
  { p: [[343.1, -1731.4], [343.5, -1733.8]], alto: ALTO, liso: true },
  { p: [[343.5, -1733.8], [366.0, -1729.9]], alto: ALTO },
];
// las torres de focos, por fuera de las esquinas del campo
const TORRES = [[257.5, -1722.5], [329.0, -1711.0], [239.5, -1614.0], [311.0, -1602.0]];
const CENTRO = [284, -1662];

export function buildCampoFutbolAltavista(scene, colliders) {
  const grupo = new THREE.Group();
  grupo.name = 'campoFutbolAltavista';
  const blanco = new THREE.MeshStandardMaterial({ color: 0xf2f0ea, roughness: 0.9 });
  const verde = new THREE.MeshStandardMaterial({ color: 0x2f6b45, roughness: 0.7 });
  const hierro = new THREE.MeshStandardMaterial({ color: 0x8b9095, roughness: 0.6, metalness: 0.4 });
  const foco = new THREE.MeshStandardMaterial({ color: 0xdfe3e6, roughness: 0.4 });
  const caja = (w, h, d, mat, x, y, z, giro) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.rotation.y = giro;
    m.castShadow = m.receiveShadow = true;
    grupo.add(m);
    return m;
  };
  let metros = 0, machones = 0;
  for (const t of TRAMOS) {
    for (let i = 1; i < t.p.length; i++) {
      const a = t.p[i - 1], b = t.p[i], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, giro = Math.atan2(ux, uz);
      caja(GRUESO, t.alto, L + GRUESO, blanco, (a[0] + b[0]) / 2, t.alto / 2, (a[1] + b[1]) / 2, giro);
      colliders?.addSegment?.(a[0], a[1], b[0], b[1]);
      metros += L;
      if (!t.liso) {
        // los machones con su remate, cada 6 m
        for (let s = 0; s <= L + 0.01; s += CADA, machones++) {
          const x = a[0] + ux * s, z = a[1] + uz * s;
          caja(GRUESO + 0.24, t.alto + 0.12, 0.5, blanco, x, (t.alto + 0.12) / 2, z, giro);
          if (machones % 2 === 0) caja(0.34, 0.3, 0.34, blanco, x, t.alto + 0.27, z, giro);
        }
      }
      if (t.porton) {
        // el portón verde de dos hojas, con su marco un poco más alto
        const x = a[0] + ux * t.porton, z = a[1] + uz * t.porton;
        caja(GRUESO + 0.2, t.alto + 0.5, 6.4, blanco, x, (t.alto + 0.5) / 2, z, giro);
        caja(GRUESO + 0.3, 2.9, 5.2, verde, x, 1.45, z, giro);
        caja(GRUESO + 0.34, 2.9, 0.06, hierro, x, 1.45, z, giro);
      }
    }
  }
  for (const [x, z] of TORRES) {
    const alto = 24, mira = Math.atan2(CENTRO[0] - x, CENTRO[1] - z);
    caja(0.55, alto, 0.55, hierro, x, alto / 2, z, mira);
    caja(3.0, 2.0, 0.35, foco, x, alto - 0.6, z, mira);
    caja(3.2, 0.12, 0.9, hierro, x, alto - 1.7, z, mira);
    colliders?.addSegment?.(x - 0.3, z, x + 0.3, z);
  }
  grupo.userData.cuenta = { metros: Math.round(metros), machones, torres: TORRES.length };
  scene.add(grupo);
  return grupo;
}
