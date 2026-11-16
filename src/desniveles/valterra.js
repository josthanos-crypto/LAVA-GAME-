/**
 * Desniveles de VALTERRA (x 100…988 · z -706…38). El Castillo de San José no se toca: su loma ya la
 * alisa terrain.js (smoothSanJose) y la meseta está bien.
 *
 * Lo que había:
 *  - un hoyo de unos 15 m junto a la calle Badajoz (el sótano de la nave grande de la foto aérea):
 *    la calle caía al 45 % y las casas de alrededor se hundían;
 *  - un bulto de 6 m con un hoyo al lado junto a la calle La Mercedes (ruido de los datos): el suelo
 *    de la foto asomaba por encima de la calle;
 *  - cuestas de más del 20 % en Sevilla, Velázquez, Gobernador García Hernández y Velacho.
 */
import { rellenar, suavizarCuestas } from './comun.js';

const CAJA = { x0: 100, x1: 988, z0: -706, z1: 38 };

// hoyos y bultos que no existen en la calle (medidos en la malla de alturas)
const ZONAS = [
  { x0: 350, x1: 490, z0: -535, z1: -435 },   // el hoyo de la calle Badajoz
  { x0: 595, x1: 690, z0: -290, z1: -200 },   // el bulto y el hoyo de La Mercedes
];

/** se llama desde el prepararMapa del barrio, antes de levantar la ciudad */
export function desnivelesValterra() {
  const relleno = rellenar({ zonas: ZONAS });
  const cuestas = suavizarCuestas({ caja: CAJA, margen: 40, maxPendiente: 0.12 });
  return { relleno, cuestas };
}
