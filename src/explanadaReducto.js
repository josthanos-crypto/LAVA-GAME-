import { buildAparcamientos } from './aparcamientosTenderete.js';

/**
 * (Version 155) La explanada de aparcar de junto al Cabildo, al oeste de la Playa del Reducto.
 *
 * Es la de las capturas de Street View que José Manuel guardó en «recursos» (24/10/2026): asfalto con plazas pintadas
 * entre la rotonda de la Vela Latina, el muro del mar con sus farolas de dos faroles y el edificio de la cúpula.
 * En el juego ahí solo estaba la foto aérea. Medida sobre la ortofoto oficial del IGN; el firme y las plazas los
 * pone `buildAparcamientos` (no pinta sobre calle, acera ni edificio). El número de plazas es el que cabe, no el real.
 *
 * (Version 157) Al otro lado de la rotonda está el Recinto Ferial: ver recintoFerial.js.
 *
 * El edificio de la cúpula (la antigua discoteca) NO se toca: José Manuel dijo que no se pusiera (Version 101f).
 */
const SOLARES = [
  // junto a la rotonda, donde aparcan los coches en la foto
  { nombre: 'explanadaReductoNorte', centro: [-1318, 678], eje: [0.21, 0.978], largo: 40, ancho: 15 },
  // (Version 157) la explanada grande del suroeste ya no lleva firme pintado: se salía sobre el mar; ahora el suelo
  // de toda la zona es la foto aérea oficial (reductoFoto.js), que enseña el asfalto y sus rayas de verdad
];

export function buildExplanadaReducto(scene, map) {
  return buildAparcamientos(scene, map, { nombre: 'explanadaReducto', solares: SOLARES, zona: [-1600, -1260, 460, 900] });
}
