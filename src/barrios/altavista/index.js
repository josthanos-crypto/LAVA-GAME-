/**
 * ALTAVISTA — el barrio del norte, entre Titerroy y Maneje.
 *
 * Límites en metros del juego: x de -238 a 498, z de -2080 a -495.
 * Ficha completa: ./LEEME.md
 *
 * Todavía no hay nada hecho a mano aquí: las casas y las calles salen del mapa
 * (world.js) y los comercios del mapa (map.signs). Cuando se haga algo de este
 * barrio, se pone en este archivo.
 */

import { desnivelesAltavista } from '../../desniveles/altavista.js';
import { tuneChafaris } from './chafaris.js';
import { tuneSevilla } from './sevilla.js';
import { tuneJaen } from './jaen.js';
import { tuneHuelva } from './huelva.js';
import { tuneAndalucia } from './andalucia.js';
import { tuneCalderon } from './calderon.js';
import { tuneSalvador } from './salvador.js';
import { tuneMenendez } from './menendez.js';
import { tuneRamon } from './ramon.js';
import { tuneElcano } from './elcano.js';
import { tuneCapaz } from './capaz.js';
import { tuneHonduras } from './honduras.js';
import { tuneAlmeria } from './almeria.js';
import { tuneMalaga } from './malaga.js';
import { tuneGuasia } from './guasia.js';
import { tuneArcipreste } from './arcipreste.js';
import { tunePolideportivo } from './polideportivo.js';
import { tuneSantillana } from './santillana.js';
import { tuneSanJuan } from './sanjuan.js';
import { tuneNorte } from './norte.js';
import { tuneOeste } from './oeste.js';
import { tuneUltimos } from './ultimos.js';
import { tuneLookAround } from './lookaround.js';
import { buildCampoFutbolAltavista } from './campoFutbol.js';

export const BARRIO = {
  id: 'altavista',
  nombre: 'Altavista',
  caja: { x0: -238, x1: 498, z0: -2080, z1: -495 },
};

/** retoques al mapa antes de levantar la ciudad */
export function prepararMapa(map) {
  // las cuestas bruscas del barrio, suavizadas
  map.desnivelesAltavista = desnivelesAltavista();
  // las calles hechas con las vistas de la calle (kitCalles.js), de Chafarís hacia arriba
  tuneChafaris(map);
  tuneSevilla(map);
  tuneJaen(map);
  tuneHuelva(map);
  tuneAndalucia(map);
  tuneCalderon(map);
  tuneSalvador(map);
  tuneMenendez(map);
  tuneRamon(map);
  tuneElcano(map);
  tuneCapaz(map);
  tuneHonduras(map);
  tuneAlmeria(map);
  tuneMalaga(map);
  tuneGuasia(map);
  tuneArcipreste(map);
  tuneSantillana(map);
  tuneSanJuan(map);
  tuneNorte(map);
  tuneOeste(map);
  // el edificio de la piscina municipal, enfrente del Open Mall (por dentro: localesPolideportivo.js)
  tunePolideportivo(map);
  tuneUltimos(map);
  // lo que quedaba generico, con las capturas de Look Around del 24-11-2026 (Arniches, Filipinas, Almeria y Guasia)
  tuneLookAround(map);
}

/** lo que se levanta encima del mapa */
export function construir({ scene, colliders }) {
  // el muro blanco del campo de futbol por la calle Mosta, el porton verde y las torres de focos (Version 172)
  return { campoFutbol: buildCampoFutbolAltavista(scene, colliders) };
}
