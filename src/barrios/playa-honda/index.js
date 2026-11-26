/**
 * PLAYA HONDA — el pueblo al oeste de Arrecife, por la LZ-301 (las calles y casas, de OpenStreetMap
 * desde la Version 74: las piezas del mapa llevan `ph`).
 *
 * Límites en metros del juego: x de -5320 a -2880, z de -20 a 1500.
 * Ficha completa: ./LEEME.md
 */

import { tuneConforama, buildConforama } from '../../conforama.js';
import { tuneBricej, buildBricej } from '../../bricej.js';
import { tuneConcesionario, buildConcesionario } from '../../concesionario.js';
import { tuneNaveCash, buildNaveCash } from '../../naveCash.js';
import { prepararEntradaHonda, buildEntradaHonda } from '../../entradaHonda.js';
import { desnivelesPlayaHonda } from '../../desniveles/playa-honda.js';
import { tuneCalles } from './calles.js';
import { tuneCalles2 } from './calles2.js';
import { tuneResto } from './resto.js';
import { tuneCapturasHonda } from './capturas.js';
import { blanquear } from '../compartido/blanquear.js';
import { buildPlayaHondaFoto } from '../../playaHondaFoto.js';

export const BARRIO = {
  id: 'playa-honda',
  nombre: 'Playa Honda',
  caja: { x0: -5320, x1: -2880, z0: -20, z1: 1500 },
};

// el borde de la LZ-301 que da al pueblo: lo calcula prepararMapa y lo usa construir (el quitamiedos)
let bordeEntrada = null;

/** retoques al mapa antes de levantar la ciudad */
export function prepararMapa(map) {
  // los bultos y las cuestas bruscas del pueblo, suavizados (antes que nada)
  map.desnivelesPlayaHonda = desnivelesPlayaHonda();
  // la nave de Conforama trae modelo propio: se quita la genérica
  tuneConforama(map);
  // B3RICEJ: la casa terrera de la esquina, en planta baja y sin rótulo genérico
  tuneBricej(map);
  // LG Automoción en su sitio (ficha de Google Maps): fuera el bloque genérico
  tuneConcesionario(map);
  // la nave de Cash Lee, Baratíssimos y Cash Diplo, a su altura y sin el rótulo genérico
  tuneNaveCash(map);
  // la entrada por la LZ-301: las palmeras del arcén se plantan con las demás
  bordeEntrada = prepararEntradaHonda(map);
  // calle a calle con las vistas de la calle (kitCalles.js de Altavista)
  tuneCalles(map);
  tuneCalles2(map);
  // el resto de las calles de casas, con el patrón del pueblo
  tuneResto(map);
  // la segunda fila de casas, detrás de las de la calle: blancas como el resto del pueblo
  blanquear(map, BARRIO.caja);
  // lo que las capturas de Look Around enseñan distinto (color o altura de edificios que ya estaban)
  tuneCapturasHonda(map);
}

/** primera fase: antes de crear los locales */
export function construir({ scene, colliders, map }) {
  // Conforama con su aparcamiento y el ramal de entrada desde la avenida
  buildConforama(scene, colliders);
  // la fachada de B3RICEJ, pegada a la casa del mapa
  buildBricej(scene);
  // el concesionario de vehículos de ocasión (LG Automoción, en el sitio de su ficha de Google Maps)
  buildConcesionario(scene, colliders);
  // las fachadas de Cash Lee, Baratíssimos y Cash Diplo en la nave grande (vistas de la calle de 2016)
  buildNaveCash(scene, colliders, map);
  // el quitamiedos de la LZ-301 a la entrada del pueblo
  buildEntradaHonda(scene, bordeEntrada, map);
  // la foto aérea oficial como suelo de Playa Honda (antes, arena pintada)
  buildPlayaHondaFoto(scene);

  return {};
}
