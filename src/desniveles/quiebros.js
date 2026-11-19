/**
 * Quiebros de pendiente: sitios donde la calle sube y baja en pico (o en uve) justo en un punto y el
 * coche da un bote. Se redondean rellenando un cuadro pequeño alrededor (la cresta se queda en loma).
 * Solo los que salen al medir todas las calles (PENDIENTES-vial.md); la cuesta general no se toca.
 * El de la Carretera de San Bartolomé (−1280, −856) no está aquí: es la rampa del enlace de la LZ-20.
 * Los de (−4017, 258) y Calle Balayo (−2080, −2122) tampoco: no salen de la malla (el relleno no los cambia).
 */
import { rellenar } from './comun.js';

const R = 22;
const PUNTOS = [
  [590, -216],    // Calle Extremadura (Valterra): cresta
  [-1801, -866],  // Calle Safantia: uve
  [-3390, 1121],  // Calle Borrasca (Playa Honda): cresta
];

/** se llama al final del prepararMapa de «compartido», después de los suavizados de cada barrio */
export function redondearQuiebros() {
  return rellenar({ zonas: PUNTOS.map(([x, z]) => ({ x0: x - R, x1: x + R, z0: z - R, z1: z + R })) });
}
