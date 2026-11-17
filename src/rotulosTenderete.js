import { buildRotulosEmpresas } from './parqueComercialEmpresas.js';

/**
 * Los rótulos de la calle Tenderete que faltaban (Version 142).
 *
 * De la lista que pasó José Manuel de los negocios de la calle Tenderete: la farmacia (Calle Tenderete 29, esquina con
 * la calle Saltona) y la cafetería de la Repsol. El sitio de cada una se miró en el mapa de Google Maps el 16/11/2026
 * (la farmacia sale allí con su cruz, en esa misma esquina). Mercadona, MediaMarkt, HiperDino y la Repsol ya estaban.
 *
 * Multicentro y Comercial Zonzamas no llevan cartel: Google los pone sobre naves que ya estaban hechas con los
 * vídeos de José Manuel (ver la nota de arriba de rotulosArgana.js, Version 143).
 */
export const TENDERETE = [
  ['Farmacia', -1527.5, -1825.8, 'farmacia'],
  ['Tenderete Café', -1197.5, -1336.9],
];

const ZONA = [-1620, -1150, -1900, -1280];

export function buildRotulosTenderete(scene, map) {
  return buildRotulosEmpresas(scene, map, TENDERETE, ZONA, 'rotulosTenderete');
}
