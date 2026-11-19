import { Kit } from './interiorKit.js';
import { marco, enMarco, trocear, sueloTex } from './restaurantesCharco.js';
import { paveMesh, polyTris } from './suelos.js';

/**
 * El aparcamiento de tierra de Altavista entre la manzana de Fray Luis de León y la calle Guillermo Topham (de
 * Telésforo Bravo a Fray Luis de León), con la foto aérea de GRAFCAN y las vistas de la calle de Google de julio de 2025
 * (Guillermo Topham 3; solo se miran, no van dentro del juego). En el juego era el hueco con la foto aérea borrosa:
 * - la tierra apisonada con grava y las rodadas (de tierra: sin rayas pintadas);
 * - los siete coches aparcados donde los muestra la foto aérea (dos de lado junto a Telésforo Bravo y los demás de cara
 *   a las casas);
 * - la señal de dirección prohibida de la esquina de Telésforo Bravo.
 */

// el marco de Fray Luis de León: a hacia el sur desde la esquina de Padre Claret, b hacia el oeste
const C = [378.37 + 0.166579 * 1.9, -1299.89 - 0.98603 * 1.9];
const US = [-0.166579, 0.98603], E = [0.98605, 0.166412];
const P = (a, b = 0) => [C[0] + US[0] * a - E[0] * b, C[1] + US[1] * a - E[1] * b];

// los coches de la foto aérea: a, b y rumbo (0 de norte a sur, π/2 de este a oeste)
export const TOPHAM_SPOTS = [
  [126.9, 65.4, 0.167], [133.2, 65.3, -0.66], [135.4, 61.8, -0.52], [126.6, 46.1, 0.167],
  [127.7, 41.9, 0.167], [127.7, 38.7, 0.167], [128.9, 35.4, 0.167],
].map(([a, b, h]) => { const [x, z] = P(a, b); return [+x.toFixed(2), +z.toFixed(2), h]; });

/** antes de levantar la ciudad: los coches aparcados en la tierra */
export function tuneAparcamientoTopham(map) {
  if (Array.isArray(map.lotSpots)) map.lotSpots.push(...TOPHAM_SPOTS);
  map.aparcamientoTopham = true;
}

/** la tierra apisonada clara, con grava, manchas y rodadas */
function tierraApisonada() {
  return sueloTex(256, 6, (g, r, n) => {
    g.fillStyle = '#9e907c';
    g.fillRect(0, 0, n, n);
    for (let i = 0; i < 16; i++) {
      g.fillStyle = r() < 0.5 ? 'rgba(70,62,54,0.14)' : 'rgba(190,172,146,0.16)';
      g.beginPath();
      g.arc(r() * n, r() * n, 14 + r() * 40, 0, Math.PI * 2);
      g.fill();
    }
    g.strokeStyle = 'rgba(80,72,62,0.18)';
    g.lineWidth = 5;
    for (let i = 0; i < 3; i++) { const y = r() * n; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(n * 0.3, y + 30, n * 0.6, y - 30, n, y + 10); g.stroke(); }
    for (let i = 0; i < 3800; i++) {
      const v = r(), osc = r() < 0.3;
      g.fillStyle = osc ? `rgb(${Math.round(60 + v * 40)},${Math.round(56 + v * 36)},${Math.round(50 + v * 32)})`
        : `rgb(${Math.round(140 + v * 60)},${Math.round(128 + v * 54)},${Math.round(108 + v * 46)})`;
      g.fillRect(r() * n, r() * n, 1 + r() * 2.2, 1 + r() * 2.2);
    }
  });
}

/** se monta con lo demás */
export function buildAparcamientoTopham(scene, colliders, map) {
  if (!map?.aparcamientoTopham) return null;
  const suelo = paveMesh(trocear(polyTris([P(122.95, 33.4), P(136.5, 33.3), P(136.5, 66.6), P(122.95, 66.7)]), 2), 0.17, tierraApisonada(), 0xffffff);
  if (suelo) { suelo.name = 'aparcamientoTopham'; scene.add(suelo); }
  // la señal de dirección prohibida en la esquina de Telésforo Bravo, mirando a la calle Guillermo Topham
  const k = new Kit();
  const M = marco(P(137.0, 66.6), P(137.0, 66.0));
  k.cyl(0.1, 0, 0, 0.03, 0.03, 2.6, 0x8a8e92, { seg: 8 });
  k.cyl(0.1, 2.25, 0.04, 0.3, 0.3, 0.02, 0xc8202a, { seg: 28, rx: Math.PI / 2 });
  k.box(0.1, 2.2, 0.065, 0.42, 0.1, 0.01, 0xf4f4f2);
  const senal = enMarco(k, M, 'aparcamientoTophamSenal', colliders);
  scene.add(senal);
  // en la versión web el juego ya había leído map.lotSpots antes de las piezas: los coches se ponen aquí
  const coches = [];
  const g = typeof window !== 'undefined' ? window.__game : null;
  const yaEstan = Array.isArray(map.lotSpots) && map.lotSpots.includes(TOPHAM_SPOTS[0]);
  if (g?.makeCar && !yaEstan) {
    const tipos = ['hatch', 'sedan', 'suv', 'compact'];
    TOPHAM_SPOTS.forEach(([x, z, h], i) => {
      let c;
      try { c = g.makeCar(tipos[(i * 3) % tipos.length], undefined, {}); } catch (e) { c = g.makeCar('sedan'); }
      c.group.position.set(x, 0.17, z);
      c.group.rotation.y = h;
      scene.add(c.group);
      coches.push(c.group);
    });
  }
  return { suelo, senal, coches };
}
