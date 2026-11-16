/**
 * Desniveles de EL RESTO: lo que queda fuera de las cajas de los barrios (la franja entre el Centro y
 * Titerroy, el oeste hasta Playa Honda con la LZ-2, el este hasta el Castillo de San José, Puerto Naos y
 * Las Caletas, y el norte de la LZ-1).
 *
 * Lo que había: cuestas del 36 % en Calle Norte y Costa Rica, del 33 % en la Carretera de los Castillos,
 * del 28 % en la avenida Las Palmeras, y hondonadas en Aragón, Severo Ochoa y junto a la LZ-1. Se dejan
 * en un 12 % como mucho. Solo se tocan las zonas con calles: los montes del borde del mapa se quedan.
 *
 * La meseta del Castillo de San José no se toca (ya la alisa terrain.js).
 */
import { suavizarCuestas } from './comun.js';

const CASTILLO_SAN_JOSE = { x0: 1500, x1: 1740, z0: -1000, z1: -880 };

const ZONAS = [
  { nombre: 'entre el Centro y Titerroy', caja: { x0: -1100, x1: 160, z0: -420, z1: -140 } },
  { nombre: 'entre San Francisco Javier y Argana', caja: { x0: -1840, x1: -960, z0: -880, z1: -540 } },
  { nombre: 'el oeste hasta Playa Honda', caja: { x0: -2920, x1: -1760, z0: -880, z1: 1540 } },
  { nombre: 'el este', caja: { x0: 460, x1: 3400, z0: -2400, z1: 60 }, fijos: [CASTILLO_SAN_JOSE] },
  { nombre: 'el norte de la LZ-1', caja: { x0: 430, x1: 1500, z0: -3440, z1: -2040 } },
];

/** se llama desde el prepararMapa de «compartido», antes de levantar la ciudad */
export function desnivelesResto() {
  return ZONAS.map(z => ({ nombre: z.nombre, ...suavizarCuestas({ caja: z.caja, margen: 40, maxPendiente: 0.12, fijos: z.fijos || [], vueltas: 300 }) }));
}
