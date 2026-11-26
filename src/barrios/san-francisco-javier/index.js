/**
 * SAN FRANCISCO JAVIER — el barrio del oeste, al otro lado del puente del Cabildo.
 *
 * Límites en metros del juego: x de -1799 a -1036, z de -582 a 432.
 * Ficha completa: ./LEEME.md
 */

import { desnivelesSanFranciscoJavier } from '../../desniveles/san-francisco-javier.js';
import { tuneAldiSfj, buildAldiSfj } from '../../aldiSfj.js';
import { tuneNegociosSfj } from '../../negociosSfj.js';
import { buildRotondaCabildo } from '../../rotondaCabildo.js';
import { buildPuenteRayas } from '../../puenteRayas.js';
import { tuneCalles } from './calles.js';
import { tuneCalles2 } from './calles2.js';
import { tuneCalles3 } from './calles3.js';
import { tuneResto } from './resto.js';
import { tuneFachadasSfj } from './fachadas.js';

export const BARRIO = {
  id: 'san-francisco-javier',
  nombre: 'San Francisco Javier',
  caja: { x0: -1799, x1: -1036, z0: -582, z1: 432 },
};

/** retoques al mapa antes de levantar la ciudad */
export function prepararMapa(map) {
  // las cuestas bruscas del barrio, suavizadas (antes que nada)
  map.desnivelesSfj = desnivelesSanFranciscoJavier();
  // el ALDI de Rambla Medular 58: la nave pasa a ser un supermercado de verdad
  tuneAldiSfj(map);
  // los negocios reales del barrio que el mapa traía sin nombre (la gasolinera Repsol)
  tuneNegociosSfj(map);
  // calle a calle con las vistas de la calle (kitCalles.js de Altavista)
  tuneCalles(map);
  // el resto de las calles del barrio (segunda tanda)
  tuneCalles2(map);
  tuneCalles3(map);
  // el resto de las calles de casas, con el patrón del barrio
  tuneResto(map);
  // los tramos que seguían genéricos (capturas de fachadas de casa)
  tuneFachadasSfj(map);
}

/** primera fase: antes de crear los locales */
export function construir({ scene, map, colliders }) {
  // El puente del Cabildo va ahora en su sitio de verdad, con los demas puentes (trinchera.js, 'Cabildo': la carretera
  // por encima y la calle que baja al Cabildo por debajo). Los muros de cabildoBridge.js caian por error en el agua de
  // la playa del Reducto (x -820 a -700, z 450 a 540) y ya no se montan; el archivo sigue ahi por si hace falta:
  //   import { buildCabildoBridge } from '../../cabildoBridge.js';  buildCabildoBridge(scene, colliders);
  // el ALDI de Rambla Medular: franja azul, rótulo, entrada y aparcamiento
  buildAldiSfj(scene, map);
  // la rotonda del Cabildo: calzada circular limpia, acera, líneas y cinco pasos de cebra
  buildRotondaCabildo(scene, map);
  // el puente del Cabildo: asfalto y rayas de carril en el tablero y rayas en la calle que pasa por debajo
  buildPuenteRayas(scene, map, ['Cabildo']);

  return {};
}
