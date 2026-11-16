/**
 * Desniveles de MANEJE (x -2200…472 · z -3400…-1035, con el campo de arriba).
 *
 * Buena parte de la caja ya la arreglan Argana Alta, Altavista y Titerroy. Lo que quedaba: cuestas del
 * 20 % en la avenida de Los Geranios, El Invernadero, Guinea Ecuatorial y Gabriel y Galán, y en el camino
 * de tierra del campo de arriba (ahí el relieve es inventado: lo rellena terrain.js). Se dejan en un 12 %.
 */
import { suavizarCuestas } from './comun.js';

const CAJA = { x0: -2200, x1: 472, z0: -3400, z1: -1035 };

/** se llama desde el prepararMapa del barrio, antes de levantar la ciudad */
export function desnivelesManeje() {
  return suavizarCuestas({ caja: CAJA, margen: 40, maxPendiente: 0.12, vueltas: 250 });
}
