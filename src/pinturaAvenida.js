import * as THREE from 'three';
import { canvasTex } from './interiorKit.js';

/**
 * La pintura de la avenida de la entrada, como en la foto de Street View de julio de 2025:
 * el nombre «Av. Mamerto Cabrera» escrito en el carril, y la señal azul de obligación de
 * girar a la derecha en el acceso al aparcamiento.
 *
 * Se apoya en el trazado real de la avenida (no se inventa ninguna calle): se cogen dos
 * tramos cerca de la entrada, uno por sentido, y se pintan en su carril. Son calcomanías
 * planas con transparencia, `MeshBasicMaterial` (la pintura no recibe luz, como en la calle).
 */

const CERCA = [-3600, 517];     // el tramo de la entrada
const ANCHO_TEXTO = 13, ALTO_TEXTO = 2.4;

/** el nombre de la calle pintado en el asfalto, visto por quien conduce */
function textoVia() {
  return canvasTex(1024, 190, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.fillStyle = 'rgba(246,246,242,0.92)';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    // letra de calzada: alta y estrecha, como la de la foto
    g.font = `600 ${Math.round(h * 0.72)}px "Barlow Condensed", "Arial Narrow", Arial, sans-serif`;
    g.save();
    g.translate(w / 2, h / 2);
    g.scale(0.92, 1.22);
    g.fillText('Av. Mamerto Cabrera', 0, 0);
    g.restore();
  });
}

/** la señal azul redonda de girar a la derecha */
function senalAzul() {
  return canvasTex(256, 256, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.fillStyle = '#1f5fa8'; g.beginPath(); g.arc(w / 2, h / 2, w * 0.47, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#ffffff'; g.lineWidth = 10; g.beginPath(); g.arc(w / 2, h / 2, w * 0.44, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = '#ffffff'; g.lineWidth = 26; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath();
    g.moveTo(w * 0.4, h * 0.74); g.lineTo(w * 0.4, h * 0.46); g.lineTo(w * 0.66, h * 0.46);
    g.stroke();
    g.fillStyle = '#ffffff'; g.beginPath();
    g.moveTo(w * 0.72, h * 0.46); g.lineTo(w * 0.56, h * 0.34); g.lineTo(w * 0.56, h * 0.58);
    g.closePath(); g.fill();
  });
}

export function buildPinturaAvenida(scene, map) {
  // la avenida de verdad (la que lleva el nombre), y su tramo más cercano a la entrada
  const vias = (map.roads || []).filter(r => /avenida mamerto cabrera/i.test(r.name || '') && r.p.length > 1);
  if (!vias.length) return null;
  const dist = (p) => Math.min(...p.map(([x, z]) => Math.hypot(x - CERCA[0], z - CERCA[1])));
  vias.sort((a, b) => dist(a.p) - dist(b.p));

  const g = new THREE.Group();
  g.name = 'pinturaAvenida';
  const tex = textoVia();
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0.9 });

  let pintadas = 0;
  for (const via of vias.slice(0, 2)) {
    // el punto de la vía más cercano a la entrada
    let best = null;
    for (let i = 1; i < via.p.length; i++) {
      const [ax, az] = via.p[i - 1], [bx, bz] = via.p[i];
      const L = Math.hypot(bx - ax, bz - az);
      if (L < 20) continue;   // en un tramo recto, no en la curva
      const t = 0.5;
      const x = ax + (bx - ax) * t, z = az + (bz - az) * t;
      const d = Math.hypot(x - CERCA[0], z - CERCA[1]);
      if (!best || d < best.d) best = { x, z, dx: (bx - ax) / L, dz: (bz - az) / L, d };
    }
    if (!best || pintadas >= 2) continue;
    // el carril: media calzada hacia la derecha del sentido de la vía
    const off = (via.w || 8) / 4;
    const px = best.x - best.dz * off * (pintadas ? -1 : 1);
    const pz = best.z + best.dx * off * (pintadas ? -1 : 1);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(ANCHO_TEXTO, ALTO_TEXTO), mat);
    m.rotation.x = -Math.PI / 2;
    m.rotation.z = -Math.atan2(best.dx, best.dz) + (pintadas ? Math.PI : 0);
    m.position.set(px, 0.27, pz);
    m.renderOrder = 2;
    g.add(m);
    pintadas++;
  }

  // la señal azul, a la derecha del carril de la entrada
  const via = vias[0];
  const [sx, sz] = via.p[0];
  const [nx, nz] = via.p[1];
  const L = Math.hypot(nx - sx, nz - sz) || 1;
  const ux = (nx - sx) / L, uz = (nz - sz) / L;
  const bx = sx + ux * 8 - uz * (via.w / 2 + 1.4);
  const bz = sz + uz * 8 + ux * (via.w / 2 + 1.4);
  const poste = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 2.7, 8),
    new THREE.MeshStandardMaterial({ color: 0x9aa1a6, metalness: 0.6, roughness: 0.4 }),
  );
  poste.position.set(bx, 1.35, bz);
  const disco = new THREE.Mesh(
    new THREE.CircleGeometry(0.42, 24),
    new THREE.MeshStandardMaterial({ map: senalAzul(), transparent: true, roughness: 0.5, side: THREE.DoubleSide }),
  );
  disco.position.set(bx, 2.55, bz);
  disco.rotation.y = Math.atan2(ux, uz);
  g.add(poste, disco);

  scene.add(g);
  return { group: g, pintadas, senal: true };
}
