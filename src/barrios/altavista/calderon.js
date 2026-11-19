import { aceras } from './kitCalles.js';

/**
 * La calle Calderón de la Barca (Altavista), de Chafarís hacia el oeste, con las vistas de la calle de Google (solo
 * se miran, no van dentro del juego). Casi todo casas terreras: blancas, cremas, con zócalos de piedra o de azulejo y
 * mucho verde en puertas y ventanas; una obra con andamios en la acera norte y, al final de la sur, el edificio beige
 * de dos plantas con los balcones. La acera sur es la mitad de una manzana estrecha (la otra mitad da a Menéndez y
 * Pelayo), por eso entra menos. Casas de a hacia b.
 */

const B = '#f1eee7', B2 = '#ece8e0', SOLAR = 0;

const ACERAS = [
  { a: [47.5, -772.5], b: [-65.7, -720], fondo: 9, casas: [
    [8, 4.0, '#b89a7e'], [10, 4.0, B], [10, 4.0, B2], [10, 4.0, '#8e9690'], [13, 4.0, '#efe6cc'], [12, 4.0, '#ece0b8'],
    [10, 4.0, B], [10, 4.0, B2], [10, 4.0, B], [10, 4.0, B2], [8, SOLAR, B], [14, 6.6, B]] },
  { a: [53.3, -786], b: [-111.1, -709], fondo: 6.5, casas: [
    [8, 4.0, '#cfe3c4', { tienda: true }], [10, 4.0, B], [10, 4.0, B2], [10, 4.0, '#d9c2a5'], [11, 4.0, B], [14, 4.0, B2],
    [12, 4.0, B], [10, 4.0, '#ece2c6'], [10, 4.0, '#efe7dc'], [10, 4.0, B], [11, 4.0, B2], [12, 4.0, '#efe5da'],
    [30, 6.6, '#e6cfae'], [8, 6.6, B], [16, 6.6, '#e3c588']] },
];

export function tuneCalderon(map) {
  aceras(map, ACERAS);
  map.calderonAltavista = true;
}
