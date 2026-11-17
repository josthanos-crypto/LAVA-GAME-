/**
 * COMPARTIDO — lo que no es de un barrio concreto, porque está por toda la ciudad.
 *
 * Aquí van: la costa y el mar, el aeropuerto, la naturaleza de los solares, las señales
 * y los semáforos, las rotondas, los edificios con nombre de todo Arrecife (civic.js),
 * las tiendas (shops.js) y los detalles de azoteas y fachadas (cityDetail.js).
 *
 * Si algo de aquí se puede atar a un barrio, mejor va en la carpeta de ese barrio.
 * Ficha y límites: ./LEEME.md
 */

import { buildCoast } from '../../coast.js';
import { buildAeropuerto } from '../../aeropuerto.js';
import { buildNaturaleza } from '../../naturaleza.js';
import { buildTrafficSigns } from '../../senales.js';
import { buildRoundabouts } from '../../roundabouts.js';
import { buildCivic } from '../../civic.js';
import { buildShops } from '../../shops.js';
import { buildCityDetail } from '../../cityDetail.js';
import { desnivelesResto } from '../../desniveles/resto.js';
import { redondearQuiebros } from '../../desniveles/quiebros.js';
import { applyOneWay } from '../../sentidos.js';
import { ajustarCalles } from '../../ajusteCalles.js';
import { buildWalkIndex } from '../../aceras.js';
import { buildParadasGuagua } from '../../paradasGuagua.js';
import { tuneParqueComercialPuerto, buildParqueComercialPuerto } from '../../parqueComercialPuerto.js';
import { buildRamblaArboles } from '../../ramblaArboles.js';
import { tuneRamblaFaltaba, buildRamblaFaltaba } from '../../ramblaFaltaba.js';

export const BARRIO = {
  id: 'compartido',
  nombre: 'Compartido (toda la ciudad)',
  caja: null,   // no tiene caja: se reparte por toda Arrecife
};

/** retoques al mapa antes de levantar la ciudad */
export function prepararMapa(map) {
  // las cuestas bruscas de lo que queda fuera de los barrios (carreteras, periferia), suavizadas
  map.desnivelesResto = desnivelesResto();
  // y los pocos picos y uves que quedaban en mitad de una calle, redondeados
  map.quiebros = redondearQuiebros();
  // el parque comercial de la salida a Costa Teguise (IKEA, Electron): no es de ningún barrio
  tuneParqueComercialPuerto(map);
  // lo que faltaba a lo largo de la Rambla Medular (junto a la comisaría, el cuartel): no venía en el mapa
  tuneRamblaFaltaba(map);
  // aceras libres: las calles se ajustan a lo que dejan las fachadas y, si no basta, la fachada se echa atrás
  // (ajusteCalles.js). Va aquí, al final, para respetar los edificios que los barrios marcan como hechos a mano.
  // El índice de aceras (aceras.js) se hizo antes con las anchuras viejas: se rehace.
  applyOneWay(map);
  map.ajusteCalles = ajustarCalles(map);
  buildWalkIndex(map.roads);
}

/**
 * Antes que nada: la orilla de todo Arrecife. Va la primera (como siempre ha ido) para
 * que los muelles, el paseo y el castillo de encima de ella se dibujen encima.
 */
export function construirPrimero({ scene, map, colliders, story }) {
  // la orilla cerrada (menos el muro de la misión, que es el que cede)
  const coast = buildCoast(scene, map, colliders, { skip: [story.site.wallLine] });
  return { coast };
}

/** primera fase: antes de crear los locales */
export function construir({ scene, map, colliders, touch, story }) {
  // aeropuerto de Lanzarote (ACE), borde suroeste de Arrecife
  const aeropuerto = buildAeropuerto(scene);
  // las paradas de guagua reales de toda la ciudad (OpenStreetMap), con su nombre; las guaguas paran en ellas
  const paradas = buildParadasGuagua(scene, map, colliders);
  // el parque comercial de la salida a Costa Teguise: IKEA, Electron, las canchas de pádel y los aparcamientos
  buildParqueComercialPuerto(scene, colliders, map);
  // la Rambla Medular: el paseo del centro con sus dos filas de árboles
  buildRamblaArboles(scene, colliders, map);
  // el aparcamiento de verdad del ALDI y los rótulos de la zona de la comisaría
  buildRamblaFaltaba(scene, colliders, map);
  // rotondas con su isleta y su escultura
  const roundabouts = buildRoundabouts(scene, colliders);
  // edificios y sitios con nombre de toda la ciudad (cabildo, comisarías, hoteles, colegios...)
  const civic = buildCivic(scene, map);
  // más naturaleza por los solares: tuneras, arbustos, rocas de lava, matos y dragos
  buildNaturaleza(scene, map, { count: touch ? 90 : 200 });
  // señales de STOP, ceda el paso y velocidad en los cruces (el tráfico las respeta: traffic.js)
  const senales = buildTrafficSigns(scene, map.roads);
  // las tiendas y sus escaparates (la tiendita del chino y las demás)
  const shops = buildShops(scene, map, colliders);
  // azoteas, depósitos, balcones y demás detalles de los edificios del mapa
  const cityDetail = buildCityDetail(scene, map);

  return { aeropuerto, roundabouts, civic, senales, shops, cityDetail, paradas };
}
