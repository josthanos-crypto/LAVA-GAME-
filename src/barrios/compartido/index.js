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
import { tuneAparcadosArgana } from '../../aparcadosArgana.js';
import { buildExplanadaReducto } from '../../explanadaReducto.js';
import { tuneRecorridoHonda, buildRecorridoHonda } from '../../recorridoHonda.js';
import { tuneRecintoFerial, buildRecintoFerial } from '../../recintoFerial.js';
import { tuneReductoFoto, buildReductoFoto } from '../../reductoFoto.js';
import { tuneAvenidaFredOlsen, buildAvenidaFredOlsen } from '../../avenidaFredOlsen.js';
import { buildWalkIndex } from '../../aceras.js';
import { buildParadasGuagua } from '../../paradasGuagua.js';
import { tuneParqueComercialPuerto, buildParqueComercialPuerto } from '../../parqueComercialPuerto.js';
import { buildRamblaArboles } from '../../ramblaArboles.js';
import { buildRamblaGimnasio } from '../../ramblaGimnasio.js';
import { buildSanJoseJardin } from '../../sanJoseJardin.js';
import { tuneFaltabaCiudad } from '../../faltabaCiudad.js';
import { tuneNorteFoto, buildNorteFoto } from '../../norteFoto.js';
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
  // las naves que faltaban en los polígonos industriales (nordeste de Arrecife y Playa Honda)
  tuneFaltabaCiudad(map);
  // la franja del norte, con la foto aérea oficial en vez de la arena pintada
  tuneNorteFoto(map);
  // el Recinto Ferial (junto al Cabildo): no es un bloque de pisos, es la cubierta de las fiestas con su aparcamiento
  tuneRecintoFerial(map);
  // esa zona (Recinto Ferial, Cabildo y Parque Temático) con la foto aérea oficial como suelo, y el parque sin césped
  tuneReductoFoto(map);
  // la Avenida Fred Olsen a lo largo de la Playa del Reducto: foto aérea de suelo y las palmeras de la arena
  tuneAvenidaFredOlsen(map);
  // aceras libres: las calles se ajustan a lo que dejan las fachadas y, si no basta, la fachada se echa atrás
  // (ajusteCalles.js). Va aquí, al final, para respetar los edificios que los barrios marcan como hechos a mano.
  // El índice de aceras (aceras.js) se hizo antes con las anchuras viejas: se rehace.
  applyOneWay(map);
  map.ajusteCalles = ajustarCalles(map);
  // Argana Alta: las calles estrechas de sentido único, con coches aparcados en línea (después de medir las aceras)
  tuneAparcadosArgana(map);
  // el aparcamiento de fuera del Deiland Plaza, con sus coches (vídeo del recorrido Playa Honda → tanatorio)
  tuneRecorridoHonda(map);
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
  // la explanada de aparcar de junto al Cabildo, al oeste del Reducto (capturas de «recursos»)
  buildExplanadaReducto(scene, map);
  // del vídeo Deiland Plaza → tanatorio: aparcamiento del Deiland, cartel del municipio, letras ARRECIFE y jardineras
  buildRecorridoHonda(scene, colliders, map);
  // el Recinto Ferial: la cubierta con el escenario y el aparcamiento
  buildRecintoFerial(scene, colliders, map);
  buildReductoFoto(scene, colliders);
  // la Avenida Fred Olsen: carril bici rojo, bancos, torre del socorrista y pasarelas de la playa
  buildAvenidaFredOlsen(scene, colliders);
  // las paradas de guagua reales de toda la ciudad (OpenStreetMap), con su nombre; las guaguas paran en ellas
  const paradas = buildParadasGuagua(scene, map, colliders);
  // el parque comercial de la salida a Costa Teguise: IKEA, Electron, las canchas de pádel y los aparcamientos
  buildParqueComercialPuerto(scene, colliders, map);
  // la Rambla Medular: el paseo del centro con sus dos filas de árboles
  const rambla = buildRamblaArboles(scene, colliders, map);
  // las máquinas de hacer deporte del paseo de la Rambla
  buildRamblaGimnasio(scene, colliders, rambla.userData.centros);
  // el jardín de picón con matas de la loma del Castillo de San José
  buildSanJoseJardin(scene, map);
  // el suelo de la franja del norte de Arrecife, con su foto aérea
  buildNorteFoto(scene);
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
