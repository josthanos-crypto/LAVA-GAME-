import { buildRotulosEmpresas } from './parqueComercialEmpresas.js';

/**
 * Los rótulos de los negocios de la zona comercial de Argana que faltaban (Version 143).
 *
 * Nombres y sitios sacados del mapa de Google Maps (mirado el 17/11/2026). SON DATOS DE INTERNET: José Manuel tiene
 * que repasar la lista. Cartel sencillo con el nombre, sin logotipos ni teléfonos, en la pared más cercana que da a
 * una calle.
 *
 * SIN CARTEL, a propósito (caen sobre naves hechas a mano con los vídeos de José Manuel, y no se pisa lo hecho):
 *  - Comercial Zonzamas (Tenderete 20, Google: -1147, -1307): cae justo en la nave negra de Mitsubishi.
 *  - Multicentro (Google lo llama «Multi Centro», Tenderete 12: -1097, -1218): cae en la fachada donde el juego
 *    tiene el 928 Hybrid Club (Google pone el 928 y el Taller el Norte por la trasera de esa misma nave).
 *  - Cocodelanz (-1168, -1341): cae en la nave de Fuji y Kiwa, junto a la rotonda.
 *  - MultiMotor (-1529, -1048): entre la nave de Dos Cabras y la del «BAZAR» de bazarArgana.js.
 * Que José Manuel diga cómo los quiere.
 *
 * Para quitar o cambiar uno, se toca su línea: [nombre, x, z] en coordenadas del juego.
 */
export const ARGANA = [
  // calle Tenderete
  ['Maycan Arrecife', -1181, -1272.6],
  // junto al Lidl, frente al centro comercial
  ['Home Markt', -1368.7, -1105.7],
  // carretera de San Bartolomé, bajando de la ITV
  ['SZWAGEN Centro Multimarca', -1654.8, -1217.8],
  ['Centro Asistencial Lanzarote', -1624.5, -1191.9],
  ['Viguetas Lanzarote', -1659.1, -1152.5],
  ['Rastro Remar', -1584.8, -1089.8],
  ['Hortofrutícola Altavista', -1615.9, -1085.2],
  ['Auto Laca Canarias', -1535.4, -1067.8],
  ['Norai Autoservicio', -1616.3, -1004.2],
];

const ZONA = [-1720, -1050, -1400, -960];

export function buildRotulosArgana(scene, map) {
  return buildRotulosEmpresas(scene, map, ARGANA, ZONA, 'rotulosArgana');
}
