/**
 * MANEJE — el barrio del noroeste y el campo de arriba de Arrecife.
 *
 * Límites en metros del juego: x de -1206 a 472, z de -2447 a -1035, y hacia el norte
 * el campo de la casa de las fotos y el camino de Anmara (hasta z ≈ -3400).
 * Ficha completa: ./LEEME.md
 */

import { buildCasaCampo } from '../../casaCampo.js';
import { buildCaminoAnmara } from '../../caminoAnmara.js';
import { desnivelesManeje } from '../../desniveles/maneje.js';
import { prepararGasolineraManeje, buildGasolineraManeje } from '../../gasolineraManeje.js';
import { tuneCalles } from './calles.js';
import { tuneCalles2 } from './calles2.js';
import { tuneResto } from './resto.js';
import { tuneCalles3 } from './calles3.js';

export const BARRIO = {
  id: 'maneje',
  nombre: 'Maneje',
  caja: { x0: -2200, x1: 472, z0: -3400, z1: -1035 },
};

/** retoques al mapa antes de levantar la ciudad */
export function prepararMapa(map) {
  // las cuestas bruscas del barrio y del campo de arriba, suavizadas
  map.desnivelesManeje = desnivelesManeje();
  // el bar de la gasolinera (Moeve, Carretera San Bartolomé): su fachada se queda donde está
  prepararGasolineraManeje(map);
  // calle a calle con las vistas de la calle (kitCalles.js de Altavista)
  tuneCalles(map);
  tuneCalles2(map);
  tuneCalles3(map);
  // el resto de las calles de casas, con el patrón del barrio
  tuneResto(map);
}

/** primera fase: antes de crear los locales */
export function construir({ scene, colliders }) {
  // el campo de arriba: el camino de tierra hasta la casa de las fotos desde la azotea
  buildCasaCampo(scene, colliders);
  // el caserío del camino de tierra de Anmara (la lancha ANMARA UNO, la casa de las persianas verdes...)
  buildCaminoAnmara(scene, colliders);
  // la fachada y la terraza del bar de la gasolinera (por dentro es un local: gasolineraManeje.js)
  buildGasolineraManeje(scene, colliders);

  return {};
}
