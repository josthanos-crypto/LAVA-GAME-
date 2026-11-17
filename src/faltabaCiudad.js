/**
 * Naves que faltaban en el mapa, por toda la ciudad (Version 149).
 *
 * Al repasar el juego entero contra la ortofoto oficial (PNOA del IGN) —el centro, la marina, el puerto de Los
 * Mármoles, Titerroy, Maneje, San Francisco Javier, la zona industrial del nordeste y Playa Honda—, la planta del
 * mapa coincide casi en todo. Lo que no venía en OpenStreetMap y en el juego era solo la foto del suelo son estas
 * naves industriales, medidas sobre la foto (±2 m). Van como naves lisas del mapa, sin nombre: no se sabe qué
 * empresa es cada una.
 *
 * Para añadir otra: una línea con sus esquinas (en orden) y la altura.
 * Coordenadas del juego: x = (lon + 13,55) · 97398, z = (28,9625 − lat) · 111320.
 */
const NAVES = [
  // zona industrial del nordeste de Arrecife (al norte de la calle de las naves del puerto)
  [[[925.5, -1895.5], [988.5, -1906], [1005, -1859.5], [945, -1836.4]], 8],
  [[[1107, -1881.4], [1125.6, -1886.5], [1142.4, -1840], [1124.4, -1834.6]], 8],
  // Playa Honda, zona industrial del oeste (junto al aeropuerto)
  [[[-5144, 232.5], [-5121.5, 232.5], [-5111.5, 352.5], [-5135, 352.5]], 8],
  [[[-5249, 395], [-5203.5, 395], [-5201.5, 450], [-5242, 451]], 6],
  [[[-5177.5, 522.5], [-5111.5, 522.5], [-5110, 605], [-5174, 605]], 7],
  [[[-5110, 572.5], [-5092.5, 572.5], [-5091.5, 627.5], [-5109, 627.5]], 6],
  [[[-5229, 552.5], [-5196.5, 536], [-5196, 572.5], [-5229, 572.5]], 5],
  [[[-5216, 600], [-5194, 600], [-5194, 624], [-5216, 624]], 5],
  // Playa Honda, zona industrial del centro
  [[[-4413.2, 232.8], [-4352.8, 235.2], [-4354, 282], [-4414, 280]], 8],
  [[[-4396.8, 308.8], [-4321.2, 316], [-4350, 392], [-4381.2, 391.2], [-4378, 364], [-4364, 363.2], [-4362.8, 340], [-4396.8, 338]], 8],
  [[[-4277.2, 478], [-4210, 474], [-4208, 511.2], [-4275.6, 520]], 7],
];

/** retoques al mapa antes de levantar la ciudad */
export function tuneFaltabaCiudad(map) {
  if (map.faltabaCiudad) return;
  map.faltabaCiudad = true;
  for (const [esquinas, h] of NAVES) {
    const p = esquinas.map(([x, z]) => [x, z]);
    p.push(p[0].slice());
    map.buildings.push({ p, h, k: 'industrial', s: false, f: [232, 232, 228], c: [196, 198, 200], edificioReal: true });
  }
}
