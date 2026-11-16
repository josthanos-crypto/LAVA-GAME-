/**
 * Desniveles de PLAYA HONDA (x -5320…-2880 · z -20…1500).
 *
 * Lo que había: el suelo del pueblo salía a bultos (cuestas de hasta el 37 % en calles que son llanas,
 * escalones y hondonadas donde asomaba el suelo de la foto, sobre todo junto a la LZ-2 y en Varenga,
 * Pino Cuervo, José María Gil y Canto El Jable). Se dejan en un 12 % como mucho. La playa y la franja
 * de la costa no se tocan.
 *
 * El enlace de la LZ-2 con el pueblo (el túnel bajo la carretera) va en trinchera.js.
 */
import { suavizarCuestas } from './comun.js';

const CAJA = { x0: -5320, x1: -2880, z0: -20, z1: 1500 };

/** se llama desde el prepararMapa del barrio, antes de levantar la ciudad */
export function desnivelesPlayaHonda() {
  return suavizarCuestas({ caja: CAJA, margen: 40, maxPendiente: 0.12 });
}
