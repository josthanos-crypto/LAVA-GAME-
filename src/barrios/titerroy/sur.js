import { aceras } from '../altavista/kitCalles.js';

/**
 * La franja sur de Titerroy (Doctor Severo Ochoa, Senador Rafael Stinga, El Isleño, El Bartolo y La Carmen), con las
 * vistas de la calle de Google (solo se miran): casas terreras blancas de zócalo gris con garaje, algún solar tapiado,
 * bloques beis de dos y tres plantas, los bajos de granito de Severo Ochoa y el edificio blanco de cristal de Senador
 * Stinga. Rótulos que se leen en las fotos: Arjovi, Mutua Balear y una cafetería. El estadio, la Ciudad Deportiva,
 * los edificios grandes de Alcalde Ginés de la Hoz y Salvador Allende y las fachadas hechas a mano no se tocan.
 * Casas de a hacia b.
 */

const B = '#f1eee7', B2 = '#ece8e0', BE = '#e6cfa8';

const ACERAS = [
  // Doctor Severo Ochoa
  { a: [-786.7, -555.7], b: [-805.9, -533.6], fondo: 9, casas: [[10, 6.6, B], [9, 6.6, B2], [10, 4.0, B]] },
  { a: [-777.9, -549.7], b: [-798.3, -526.1], fondo: 9, casas: [[10, 6.6, B], [11, 6.6, BE], [10, 9.2, BE]] },
  // Senador Rafael Stinga
  { a: [-847.6, -386.6], b: [-801.5, -441.5], fondo: 9, casas: [[36, 9.2, B], [36, 6.6, B2]] },
  { a: [-854.2, -400.7], b: [-828.7, -429.1], fondo: 9, casas: [[38, 6.6, B]] },
  // El Isleño
  { a: [-711.8, -506], b: [-650.3, -551.9], fondo: 9, casas: [[12, 6.6, B, { tienda: true }], [10, 6.6, B2], [10, 6.6, B], [10, 4.0, B2], [35, 4.0, B]] },
  { a: [-747, -481.7], b: [-726.4, -505.1], fondo: 9, casas: [[12, 6.6, '#d9a070'], [9, 6.6, B], [10, 6.6, B, { letrero: 'Arjovi', k: 'shop' }]] },
  { a: [-720.4, -512], b: [-705.4, -529.7], fondo: 9, casas: [[23, 6.6, B, { letrero: 'Mutua Balear', k: 'gen' }]] },
  // El Bartolo
  { a: [-777.9, -549.7], b: [-726.4, -505.1], fondo: 9, casas: [
    [10, 6.6, '#b8b2a8'], [10, 6.6, B], [10, 4.0, B], [10, 4.0, B2], [14, 0, B], [8, 4.0, B], [6, 6.6, B2]] },
  { a: [-772.8, -557.3], b: [-720.4, -512], fondo: 9, casas: [
    [12, 4.0, B], [10, 4.0, B2], [10, 4.0, B], [8, 0, B], [10, 4.0, B2], [10, 4.0, B], [9, 6.6, B]] },
  // La Carmen
  { a: [-747, -481.7], b: [-798.3, -526.1], fondo: 9, casas: [
    [12, 6.6, B], [10, 6.6, B, { letrero: 'Cafetería', k: 'food' }], [10, 6.6, B2, { tienda: true }], [10, 6.6, B],
    [12, 6.6, '#e2cfae'], [14, 6.6, '#dcc6a4']] },
];

export function tuneSur(map) {
  aceras(map, ACERAS);
  map.titerroySur = true;
}
