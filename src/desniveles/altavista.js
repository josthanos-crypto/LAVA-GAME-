/**
 * Desniveles de ALTAVISTA (x -238…498 · z -2080…-495).
 *
 * Lo que había: cuestas de hasta el 33 % en Blasco Ibáñez, Palencia, Andalucía y Valladolid (la ladera
 * que baja hacia Valterra), del 23 % en Telésforo Bravo, Muyay y Ronda, y una hondonada en Huelva y
 * Córdoba. Se dejan en un 12 % como mucho.
 *
 * Los puentes (Francisco Matallana y el túnel de la LZ-1) van en trinchera.js: suben y bajan sobre el
 * suelo que haya.
 */
import { suavizarCuestas } from './comun.js';

const CAJA = { x0: -238, x1: 498, z0: -2080, z1: -495 };

/** se llama desde el prepararMapa del barrio, antes de levantar la ciudad */
export function desnivelesAltavista() {
  return suavizarCuestas({ caja: CAJA, margen: 40, maxPendiente: 0.12 });
}
