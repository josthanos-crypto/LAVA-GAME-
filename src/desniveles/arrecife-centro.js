/**
 * Desniveles de ARRECIFE CENTRO (x -950…894 · z -178…900).
 *
 * Lo que había: al norte del Charco (El Lomo, La Vega y las calles que suben hacia Titerroy y Valterra)
 * el relieve exagerado dejaba cuestas de hasta el 38 % y escalones entre calle y calle. Se dejan en un
 * 12 % como mucho. El Charco, el paseo, la Calle Real, el Reducto y el puerto no se tocan (son la
 * franja baja de la costa).
 */
import { suavizarCuestas } from './comun.js';

const CAJA = { x0: -950, x1: 894, z0: -178, z1: 900 };

/** se llama desde el prepararMapa del barrio, antes de levantar la ciudad */
export function desnivelesArrecifeCentro() {
  return suavizarCuestas({ caja: CAJA, margen: 40, maxPendiente: 0.12 });
}
