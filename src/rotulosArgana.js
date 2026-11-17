import { buildRotulosEmpresas } from './parqueComercialEmpresas.js';

/**
 * Los rótulos de los negocios de la zona comercial de Argana que faltaban (Version 143).
 *
 * Nombres y sitios sacados del mapa de Google Maps (mirado el 17/11/2026). SON DATOS DE INTERNET: José Manuel tiene
 * que repasar la lista. Cartel sencillo con el nombre, sin logotipos ni teléfonos, en la pared más cercana que da a
 * una calle.
 *
 * Multicentro y Comercial Zonzamas son de la lista de la calle Tenderete que pasó José Manuel. Google los pone en
 * Tenderete 12 («Multi Centro») y Tenderete 20, sobre la fila de naves que ya estaba hecha con sus vídeos (la del
 * 928 Hybrid Club y la negra de Mitsubishi): el cartel va por delante de esa fachada, sin quitarle nada.
 *
 * SIN CARTEL, a propósito:
 *  - Cocodelanz (-1168, -1341): cae en la nave de Fuji y Kiwa, junto a la rotonda.
 *  - MultiMotor (-1529, -1048): entre la nave de Dos Cabras y la del «BAZAR» de bazarArgana.js.
 *  - Hortofrutícola Altavista (-1616, -1085): su pared da a un callejón y el cartel no se veía.
 *
 * Para quitar o cambiar uno, se toca su línea: [nombre, x, z] en coordenadas del juego.
 */
export const ARGANA = [
  // calle Tenderete
  ['Multicentro', -1097.2, -1218.5, '', 0.95],
  ['Comercial Zonzamas', -1147.4, -1307, '', 0.55],
  ['Maycan Arrecife', -1181, -1272.6],
  // junto al Lidl, frente al centro comercial
  ['Home Markt', -1368.7, -1105.7],
  // carretera de San Bartolomé, bajando de la ITV
  ['SZWAGEN Centro Multimarca', -1654.8, -1217.8],
  ['Centro Asistencial Lanzarote', -1624.5, -1191.9],
  ['Viguetas Lanzarote', -1659.1, -1152.5],
  ['Rastro Remar', -1584.8, -1089.8],
  ['Auto Laca Canarias', -1535.4, -1067.8],
  ['Norai Autoservicio', -1616.3, -1004.2],
];

const ZONA = [-1720, -1050, -1400, -960];

export function buildRotulosArgana(scene, map) {
  return buildRotulosEmpresas(scene, map, ARGANA, ZONA, 'rotulosArgana');
}
