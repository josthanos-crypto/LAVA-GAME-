/**
 * Desniveles de TITERROY (x -1232…-25 · z -1382…-364).
 *
 * Lo que había: cuestas de más del 35 % en La Cristina, El Antonio, Tilama, Tisalaya y en la
 * circunvalación junto al túnel de Tenderete, y escalones entre manzanas en la ladera que baja de la
 * circunvalación al barrio. Se dejan en un 12 % como mucho.
 *
 * No se toca el estadio de la Ciudad Deportiva: su hoyo es de verdad (el campo abajo y las gradas en
 * el talud). Los puentes de la circunvalación (Pereyra Galviaty, Tenderete, enlace de la LZ-20) van
 * aparte, en trinchera.js: suben y bajan sobre el suelo que haya, así que siguen igual.
 */
import { suavizarCuestas } from './comun.js';

const CAJA = { x0: -1232, x1: -25, z0: -1382, z1: -364 };

// solo el campo y las gradas: las calles de alrededor (Ginés de la Hoz, Vicente Guerra, El Antonio) sí se suavizan
const ESTADIO = { x0: -495, x1: -360, z0: -600, z1: -400 };

/** se llama desde el prepararMapa del barrio, antes de levantar la ciudad */
export function desnivelesTiterroy() {
  return suavizarCuestas({ caja: CAJA, margen: 40, maxPendiente: 0.12, fijos: [ESTADIO] });
}
