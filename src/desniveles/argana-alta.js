/**
 * Desniveles de ARGANA ALTA (x -2617…-1003 · z -2434…-840).
 *
 * Lo que había: cuestas de más del 40 % en las calles del norte (Virgen de la Paloma, del Rocío, de
 * Covadonga, de la Peña), en Zaranda, Luján Pérez, León Felipe y Camilo José Cela, y hondonadas en la
 * Carretera de San Bartolomé. Se dejan en un 12 % como mucho.
 *
 * Los puentes van en trinchera.js: el enlace de la LZ-20 con la circunvalación y los dos de la
 * Carretera de San Bartolomé (calle Ico y calle Tajaraste), que bajan sobre el suelo que haya.
 */
import { suavizarCuestas } from './comun.js';

const CAJA = { x0: -2617, x1: -1003, z0: -2434, z1: -840 };

/** se llama desde el prepararMapa del barrio, antes de levantar la ciudad */
export function desnivelesArganaAlta() {
  return suavizarCuestas({ caja: CAJA, margen: 40, maxPendiente: 0.12 });
}
