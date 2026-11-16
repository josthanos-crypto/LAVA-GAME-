import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, trocear } from './restaurantesCharco.js';
import { paveMesh, polyTris, asfalto } from './suelos.js';

/**
 * El aparcamiento asfaltado de León y Castillo con Padre Claret (Altavista), entre el edificio del 173 y la calle Padre
 * Claret, y el monumento «Barrio de Altavista» de la esquina, con la foto aérea de GRAFCAN y la vista de la calle de
 * Google de julio de 2025 (LZ-1 173; solo se miran, no van dentro del juego). En el mapa era suelo con la foto aérea. De
 * verdad es asfalto sin plazas pintadas, abierto a la acera, con los coches aparcados sueltos (van donde los muestra la
 * foto aérea), y en la esquina de la acera la placa de hierro oxidado con la bola y las letras «BARRIO DE ALTAVISTA»,
 * sobre su base blanca.
 */

// la cara de León y Castillo, con el mismo marco que las casas de al lado (n hacia el norte, b hacia dentro)
const ESQ_S = [396.6, -1409.71];
const UN = [0.16073, -0.987], NE = [0.987, 0.16073];
const P = (n, b = 0) => [ESQ_S[0] + UN[0] * n - NE[0] * b, ESQ_S[1] + UN[1] * n - NE[1] * b];
// el asfalto: de la pared del 173 a 2 m de Padre Claret y de 1,5 m de la línea de fachadas a 1,5 m de Leopoldo von Buch
const LOT = [P(-76.15, 1.5), [359.6, -1338.58], [356.5, -1316.4], P(-98, 1.5)];
// los coches que se ven en la foto aérea: x, z y rumbo (0 de norte a sur, π/2 de este a oeste)
export const PADRE_CLARET_SPOTS = [
  [360.6, -1336.1, 0], [362.4, -1335.75, Math.PI], [372.05, -1334.1, 0], [378.25, -1334.1, Math.PI / 2],
  [378.9, -1331.4, -Math.PI / 2], [378.5, -1324.4, Math.PI / 2], [368.95, -1317.15, 0], [371.5, -1317.9, Math.PI],
  [378.05, -1316.4, 0], [362.55, -1314.7, Math.PI / 2], [367.85, -1313.95, -Math.PI / 2],
].map(([x, z, h]) => [x, z, +h.toFixed(3)]);
// el monumento, en la acera de la esquina (n y lo que sale hacia la calle)
const F = marco(P(-100), P(-76.15));
const MON_S = -93.7 + 100, MON_Z = 1.15;

/** antes de levantar la ciudad: los coches aparcados del asfalto */
export function tuneAparcamientoPadreClaret(map) {
  if (Array.isArray(map.lotSpots)) map.lotSpots.push(...PADRE_CLARET_SPOTS);
  map.aparcamientoPadreClaret = true;
}

/** la placa de hierro oxidado con las letras */
function placa(g, w, h) {
  g.fillStyle = '#7a4a2e';
  g.fillRect(0, 0, w, h);
  let sd = 7;
  const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < w * h / 30; i++) {
    g.fillStyle = rnd() < 0.5 ? 'rgba(60,34,20,.35)' : 'rgba(150,92,52,.35)';
    g.fillRect(rnd() * w, rnd() * h, 2, 2);
  }
  g.strokeStyle = '#4a2a1a';
  g.lineWidth = 3;
  g.strokeRect(w * 0.18, h * 0.12, w * 0.64, h * 0.76);
  g.fillStyle = '#f0ece4';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `bold ${Math.round(h * 0.14)}px Georgia, serif`;
  g.fillText('BARRIO', w / 2, h * 0.3, w * 0.6);
  g.font = `bold ${Math.round(h * 0.11)}px Georgia, serif`;
  g.fillText('DE', w / 2, h * 0.5, w * 0.3);
  g.font = `bold ${Math.round(h * 0.14)}px Georgia, serif`;
  g.fillText('ALTAVISTA', w / 2, h * 0.7, w * 0.62);
}

/** el monumento: la base blanca, la placa inclinada y la bola */
function monumento(k) {
  const x = MON_S, z = MON_Z;
  k.box(x, 0, z, 1.7, 0.55, 0.75, 0xf2f2ee);
  k.block(x, z, 1.7, 0.75);
  k.box(x + 0.1, 0.55, z, 1.2, 0.08, 0.3, 0x5a3420);
  k.box(x + 0.1, 0.63, z, 1.1, 1.05, 0.12, 0x7a4a2e);
  k.pic(x + 0.1, 1.155, z + 0.062, 1.1, 1.05, 0, 1, canvasTex(176, 168, placa));
  k.cyl(x - 0.32, 1.68, z, 0.035, 0.035, 0.12, 0x5a3420, { seg: 6 });
  k.ball(x - 0.32, 1.9, z, 0.14, 0x6a3e26, { seg: 12 });
}

/** se monta con lo demás */
export function buildAparcamientoPadreClaret(scene, colliders, map) {
  if (!map?.aparcamientoPadreClaret) return null;
  const k = new Kit();
  monumento(k);
  const grupos = [enMarco(k, F, 'aparcamientoPadreClaretMonumento', colliders)];
  for (const g of grupos) scene.add(g);
  const suelo = paveMesh(trocear(polyTris(LOT), 2), 0.2, asfalto(), 0xd0d0d0);
  if (suelo) { suelo.name = 'aparcamientoPadreClaret'; scene.add(suelo); }
  // en la versión web el juego ya había leído map.lotSpots antes de las piezas: los coches se ponen aquí
  const coches = [];
  const g = typeof window !== 'undefined' ? window.__game : null;
  const yaEstan = Array.isArray(map.lotSpots) && map.lotSpots.includes(PADRE_CLARET_SPOTS[0]);
  if (g?.makeCar && !yaEstan) {
    const tipos = ['sedan', 'hatch', 'suv', 'compact', 'van'];
    PADRE_CLARET_SPOTS.forEach(([x, z, h], i) => {
      let c;
      try { c = g.makeCar(tipos[(i * 3) % tipos.length], undefined, {}); } catch (e) { c = g.makeCar('sedan'); }
      c.group.position.set(x, 0.16, z);
      c.group.rotation.y = h;
      scene.add(c.group);
      coches.push(c.group);
    });
  }
  return { grupos, suelo, coches };
}
