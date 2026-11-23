import { aceras } from './kitCalles.js';

/**
 * La calle Chafarís (Altavista), las dos aceras de punta a punta, con las vistas de la calle de Google (2022-2025;
 * solo se miran, no van dentro del juego). En el mapa eran las puntas de los bloques genéricos de 6,4 m; ahora cada
 * casa con su ancho, sus plantas y su color, y los negocios con su rótulo (los nombres son los que se leen en los
 * letreros de las fotos). Las aceras van de sur a norte; dentro de cada una, las casas de a hacia b.
 */

const BLANCO = '#f1eee7', BLANCO2 = '#ece8df', CREMA = '#efe5cf';
const P1 = 4.0, P2 = 6.6, P3 = 9.4;

const ACERAS = [
  // (entre Sevilla y Jaén, la acera oeste es la del Bar Pasa Pa Dentro: la monta pasaPaDentro.js)
  // esquina de Huelva con Jaén (oeste): el edificio salmón de tres plantas con el zócalo de piedra (el resto, sin vistas)
  { a: [82.5, -721.8], b: [89.3, -707.3], fondo: 10, casas: [[16, P3, '#dfa587']] },
  // entre Andalucía y Huelva (oeste): el edificio beige de tres plantas con local abajo
  { a: [70.9, -747.7], b: [79.1, -730.2], fondo: 10, casas: [[19, P3, '#e8cda4', { tienda: true }]] },
  // entre Calderón de la Barca y Andalucía (oeste): Cansegur y la casa blanca de al lado
  { a: [56.6, -776.7], b: [66.3, -755.8], fondo: 10, casas: [
    [10, P2, BLANCO, { letrero: 'Cansegur', k: 'bank' }], [13, P2, BLANCO2]] },
  { a: [49.4, -799.6], b: [55.3, -786], fondo: 9, casas: [[15, P1, '#f0efe9']] },
  // la acera este, de sur a norte: el estudio de tatuajes ocre y la casa blanca de las ventanas verdes
  { a: [89.4, -735.5], b: [81.4, -752.5], fondo: 10, casas: [[7, P3, '#b98f63', { tienda: true }], [12, P2, BLANCO]] },
  { a: [76.6, -761.1], b: [67.2, -781.2], fondo: 9, casas: [
    [8, P1, '#f1ece2', { tienda: true }], [8, 3.8, BLANCO2], [6, P1, BLANCO, { tienda: true }]] },
  { a: [62.5, -790.5], b: [56.7, -803], fondo: 9, casas: [[14, P1, BLANCO]] },
  // entre Menéndez y Pelayo y Calderón (oeste): la casa crema de la esquina, tiendas, Ria y el súper de la esquina
  { a: [28.6, -841], b: [44.3, -807.4], fondo: 10, casas: [
    [7, P2, '#e3e6cc'], [9, P2, BLANCO, { tienda: true }], [8, P2, BLANCO2], [8, P2, BLANCO, { letrero: 'Ria', k: 'tech' }],
    [5, P2, BLANCO2, { tienda: true }]] },
  // enfrente (este): casas bajas blancas con el zócalo gris y la pared crema
  { a: [53.3, -812.7], b: [37.8, -846.7], fondo: 9, casas: [[12, 4.2, BLANCO], [9, P1, BLANCO2], [8, P1, CREMA], [8, 4.2, BLANCO]] },
  // entre Ramón y Cajal y Menéndez y Pelayo (oeste): The Men Salon, la casa beige baja y la del portón azul
  { a: [10, -882.6], b: [24.7, -851.4], fondo: 10, casas: [
    [8, P2, BLANCO, { letrero: 'The Men Salon', k: 'gen' }], [7, P1, '#d9b48f'], [6, P2, BLANCO2], [8, P2, BLANCO],
    [5, P2, BLANCO2, { tienda: true }]] },
  { a: [32.7, -855.4], b: [17.3, -888.6], fondo: 9, casas: [[10, P1, BLANCO], [6, P1, BLANCO2], [6, 3.0, BLANCO], [15, P1, BLANCO2]] },
  // entre Juan Sebastián Elcano y Ramón y Cajal (oeste): las casas de dos plantas con el bajo de piedra y de azulejo
  { a: [-12, -926.5], b: [1.2, -898.2], fondo: 10, casas: [
    [6, P2, '#e2dccf'], [9, P2, '#f3efe6'], [10, P2, '#e8d2b9'], [6, P2, BLANCO2]] },
  { a: [12.9, -895.6], b: [-2.6, -927.7], fondo: 9, casas: [[12, P1, BLANCO], [12, P1, BLANCO2], [12, P1, BLANCO]] },
  // entre Coronel Capaz y Elcano (oeste): el Salón de Juego Versus entre casas bajas
  { a: [-34.4, -972.8], b: [-16.9, -936.7], fondo: 10, casas: [
    [9, 4.2, BLANCO], [9, 4.5, BLANCO2, { letrero: 'Salón de Juego Versus', k: 'tech' }], [11, 4.2, BLANCO], [11, P2, '#e4e1db']] },
  // enfrente (este): el edificio de azulejo naranja, la casa de ladrillo amarillo, el Bar Dinamar y la barbería
  { a: [-5.7, -937.9], b: [-32.4, -989.6], fondo: 10, casas: [
    [12, P2, '#c98a52'], [10, P2, BLANCO], [10, 4.2, '#d9b25f'], [10, P1, BLANCO2],
    [8, P2, '#8a5a44', { letrero: 'Bar Dinamar', k: 'food' }], [8, P1, BLANCO, { tienda: true }]] },
  // la punta norte, hasta Coronel Capaz
  { a: [-61.6, -1029.8], b: [-50.3, -1005.4], fondo: 10, casas: [[9, P2, BLANCO], [10, P2, '#ece3d3'], [8, P2, BLANCO2]] },
  { a: [-38, -1001.6], b: [-46.8, -1022], fondo: 10, casas: [[11, P2, BLANCO], [11, P2, '#efe7dc']] },
];

export function tuneChafaris(map) {
  aceras(map, ACERAS);
  map.chafarisAltavista = true;
}
