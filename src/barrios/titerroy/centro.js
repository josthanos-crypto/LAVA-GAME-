import { aceras } from '../altavista/kitCalles.js';

/**
 * El centro de Titerroy (José Pereyra Galviaty, La Férmina, Tinamala, Tilama, Carlos III, El Faustino, La Cristina,
 * Ángel Ganivet, El Antonio, La Joaquina, Burgos, Logroño, Ávila y alrededores), con las vistas de la calle de Google
 * (solo se miran). Casas terreras blancas con zócalos de piedra, granito o azulejo, bloques beis de dos y tres
 * plantas, los bloques blancos largos de las ventanas verdes (Burgos) y los adosados crema de las ventanas azules (La
 * Joaquina). Rótulos que se leen en las fotos: Mecánica Rápida, Cruz Díaz S.L., una pescadería y Ria;
 * los demás bajos con tienda van sin nombre. Lo que ya tiene fachada propia (farmacias, bares, panadería...) no se
 * toca. Casas de a hacia b.
 */

const B = '#f1eee7', B2 = '#ece8e0', BE = '#e6cfa8', BE2 = '#e9d8b8', CR = '#efe6d0', GRA = '#5d6064';

const ACERAS = [
  // Tilama, Burgos y Logroño
  { a: [-550.2, -945.8], b: [-498.5, -983.8], fondo: 9, casas: [[20, 4.0, B], [24, 3.5, B2], [20, 4.0, B]] },
  { a: [-494.5, -1001.7], b: [-557.7, -955.5], fondo: 9, casas: [[26, 4.0, B], [26, 4.0, '#ece4dc'], [26, 4.0, B2]] },
  { a: [-463.3, -723.1], b: [-501.2, -695.2], fondo: 9, casas: [[24, 6.6, B], [23, 6.6, B]] },
  { a: [-511.4, -698.1], b: [-547.8, -671.2], fondo: 9, casas: [[23, 6.6, B], [22, 6.6, B2]] },
  { a: [-458.3, -716.3], b: [-496.2, -688.4], fondo: 9, casas: [[24, 6.6, B], [23, 6.6, B2]] },
  // José Pereyra Galviaty
  { a: [-333.9, -650.8], b: [-348.5, -672.7], fondo: 9, casas: [[13, 4.0, B], [13, 4.0, B2]] },
  { a: [-363.7, -691.4], b: [-390.2, -727.5], fondo: 9, casas: [
    [6, 0, B], [9, 4.0, B], [10, 6.6, B], [10, 6.6, B, { letrero: 'Mecánica Rápida', k: 'tech' }], [10, 6.6, B2]] },
  { a: [-396.3, -736.4], b: [-423.5, -773.5], fondo: 9, casas: [[10, 6.6, B], [12, 6.6, '#e9ddd0'], [12, 6.6, B], [12, 4.0, B2]] },
  { a: [-459.9, -822.4], b: [-483, -853.9], fondo: 9, casas: [[10, 6.6, B, { tienda: true }], [10, 6.6, B2], [10, 6.6, '#efe8d8'], [9, 6.6, B]] },
  { a: [-489.9, -864.3], b: [-516.8, -900.9], fondo: 9, casas: [
    [7, 4.0, '#9a9e9e'], [8, 4.0, B], [8, 4.0, B2], [8, 6.6, B], [7, 6.6, B, { tienda: true }],
    [7, 6.6, B, { letrero: 'Cruz Díaz S.L.', k: 'shop' }]] },
  { a: [-523.4, -909.3], b: [-550.2, -945.8], fondo: 9, casas: [[9, 6.6, B], [9, 6.6, B2], [9, 6.6, B], [9, 4.0, B2], [9, 4.0, B]] },
  { a: [-386.5, -705.7], b: [-390.6, -711.5], fondo: 9, casas: [[7, 6.6, B]] },
  { a: [-407, -732.8], b: [-411.8, -739.4], fondo: 9, casas: [[8, 4.0, B]] },
  { a: [-439.9, -775.5], b: [-493, -847.8], fondo: 9, casas: [[30, 4.0, B], [10, 6.6, B2], [12, 6.6, B], [12, 4.0, B], [13, 4.0, B2], [13, 4.0, B]] },
  { a: [-499.4, -856.1], b: [-510.5, -871.1], fondo: 9, casas: [[19, 4.0, '#e4e4e2']] },
  { a: [-515.3, -878.3], b: [-526.7, -893.8], fondo: 9, casas: [[19, 4.0, B]] },
  { a: [-533, -902.5], b: [-544.6, -918.3], fondo: 9, casas: [[20, 4.0, B]] },
  { a: [-548.8, -924.1], b: [-560.9, -940.6], fondo: 9, casas: [[10, 6.6, B], [10, 6.6, '#ece4d0']] },
  // La Férmina
  { a: [-362.9, -818.7], b: [-335, -780.9], fondo: 9, casas: [[24, 4.0, B], [23, 4.0, B2]] },
  { a: [-316.8, -754], b: [-302.6, -733.9], fondo: 9, casas: [[25, 6.6, '#e9dcc0']] },
  { a: [-296.6, -724.4], b: [-274.6, -691.5], fondo: 9, casas: [[20, 6.6, B], [20, 6.6, BE]] },
  { a: [-268.2, -681.5], b: [-258.8, -667], fondo: 9, casas: [[17, 9.2, BE]] },
  { a: [-443.3, -954.9], b: [-416.7, -917], fondo: 9, casas: [[10, 9.2, B], [10, 6.6, B2], [8, 6.6, '#6e6a66'], [9, 6.6, B], [9, 6.6, B2]] },
  { a: [-411, -907.1], b: [-359.5, -833.7], fondo: 9, casas: [
    [12, 6.6, '#d99a5a'], [10, 6.6, '#d99a5a'], [14, 4.0, B], [14, 9.2, B], [12, 9.2, B2], [14, 0, B], [14, 6.6, B, { tienda: true }]] },
  { a: [-353.1, -824.1], b: [-330.2, -792.9], fondo: 9, casas: [[13, 6.6, B], [13, 6.6, B2], [13, 6.6, B]] },
  { a: [-318.4, -773.2], b: [-295.6, -738.7], fondo: 9, casas: [[14, 6.6, '#e9d8a8'], [14, 6.6, B], [13, 6.6, B2]] },
  { a: [-259.5, -688.9], b: [-239.3, -658.2], fondo: 9, casas: [[18, 9.2, B], [19, 9.2, '#d8d4cc']] },
  { a: [-452.3, -948.8], b: [-425.2, -911.9], fondo: 9, casas: [
    [9, 9.2, '#e6c6a6', { tienda: true }], [10, 9.2, '#e6c6a6'], [10, 6.6, '#ecdcd0'], [9, 6.6, '#c8c4bc'], [8, 6.6, B]] },
  { a: [-419.2, -901.3], b: [-395.7, -869.3], fondo: 9, casas: [[12, 4.0, '#efe2b8', { tienda: true }], [14, 4.0, '#efe2b8'], [14, 4.0, B]] },
  { a: [-390.6, -859.8], b: [-367.6, -828.5], fondo: 9, casas: [[13, 6.6, B], [13, 4.0, B2], [13, 4.0, '#e4e4e2']] },
  // Tinamala
  { a: [-392.8, -933.7], b: [-416.7, -917], fondo: 9, casas: [[7, 0, B], [8, 4.0, B], [7, 4.0, B2], [7, 4.0, B]] },
  { a: [-425.2, -911.9], b: [-489.9, -864.3], fondo: 9, casas: [
    [12, 6.6, '#3c4a6a'], [12, 4.0, B], [14, 6.6, B2], [14, 4.0, B], [14, 4.0, B2], [14, 4.0, GRA]] },
  { a: [-346.7, -954.4], b: [-379, -931.5], fondo: 9, casas: [[20, 6.6, BE2], [20, 6.6, BE2]] },
  { a: [-386, -924.6], b: [-411, -907.1], fondo: 9, casas: [[10, 6.6, BE2], [11, 9.2, '#e8a858'], [10, 6.6, '#c99a6a']] },
  { a: [-419.2, -901.3], b: [-444.7, -882.6], fondo: 9, casas: [[11, 4.0, '#ece0b8'], [11, 4.0, '#efd890'], [10, 6.6, B]] },
  { a: [-452.8, -876.1], b: [-483, -853.9], fondo: 9, casas: [[19, 4.0, B], [18, 4.0, B2]] },
  // Carlos III (la acera del Bar Carlos III la monta barCarlosIII.js; la del Supermercado Granill, supermercadoGranill.js)
  { a: [-362.2, -819], b: [-393.9, -795.7], fondo: 9, casas: [[10, 4.0, B], [10, 4.0, B, { letrero: 'Pescadería', k: 'food' }], [10, 6.6, B2], [9, 6.6, GRA]] },
  // El Faustino
  { a: [-452, -813.7], b: [-389.7, -859.4], fondo: 9, casas: [
    [7, 6.6, B, { tienda: true }], [10, 6.6, '#e6d6b8', { tienda: true }], [10, 6.6, '#ece0c8'], [10, 6.6, B, { letrero: 'Ria', k: 'tech' }],
    [10, 4.0, B2], [10, 6.6, B], [10, 6.6, B2], [10, 6.6, B]] },
  { a: [-459.9, -822.4], b: [-429.6, -844.6], fondo: 9, casas: [[10, 6.6, B, { tienda: true }], [10, 6.6, B2], [10, 9.2, B], [8, 0, B]] },
  { a: [-421.2, -850.6], b: [-395.7, -869.3], fondo: 9, casas: [[8, 6.6, B], [8, 4.0, B2], [8, 4.0, B], [8, 6.6, B]] },
  // La Cristina
  { a: [-302.6, -733.9], b: [-363.7, -691.4], fondo: 9, casas: [[26, 4.0, B], [10, 6.6, B2], [10, 6.6, B], [10, 4.0, '#e4ded4'], [10, 0, B], [8, 4.0, B]] },
  { a: [-296.6, -724.4], b: [-333.4, -699.9], fondo: 9, casas: [[20, 6.6, B], [14, 6.6, B2], [10, 0, B]] },
  // Ángel Ganivet
  { a: [-312.5, -867.1], b: [-333.7, -852.2], fondo: 9, casas: [[8, 6.6, '#e6c6a0'], [9, 6.6, B], [9, 4.0, B2]] },
  { a: [-339.2, -847.9], b: [-359.5, -833.7], fondo: 9, casas: [[6, 0, B], [7, 6.6, '#ecdcd8', { tienda: true }], [6, 6.6, B], [6, 6.6, B2]] },
  { a: [-288.5, -871.6], b: [-353.1, -824.1], fondo: 9, casas: [
    [10, 4.0, B], [10, 6.6, '#ddd6cc'], [10, 6.6, B], [10, 6.6, B2], [10, 6.6, B], [10, 6.6, B2], [10, 4.0, '#e6c08a'], [10, 4.0, B]] },
  // El Antonio
  { a: [-380.9, -606.8], b: [-336.2, -637.8], fondo: 9, casas: [[6, 6.6, '#e6d0a8'], [6, 0, B], [10, 6.6, BE], [10, 6.6, BE], [11, 6.6, B], [11, 6.6, B2]] },
  { a: [-199.8, -741.8], b: [-266.5, -697.8], fondo: 9, casas: [
    [15, 4.0, B], [15, 4.0, B2], [15, 4.0, B], [10, 4.0, '#ecdcd8'], [10, 4.0, '#efe6d6'], [10, 4.0, B], [5, 4.0, B2]] },
  { a: [-274.6, -691.5], b: [-311.5, -666.9], fondo: 9, casas: [[15, 4.0, B], [12, 6.6, B2], [5, 0, B], [12, 6.6, B]] },
  { a: [-317, -662.1], b: [-333.9, -650.8], fondo: 9, casas: [[10, 4.0, B], [10, 3.2, B2]] },
  { a: [-327.4, -643.1], b: [-268.2, -681.5], fondo: 9, casas: [
    [12, 6.6, BE, { tienda: true }], [12, 6.6, BE], [12, 6.6, '#e9d4b0'], [12, 6.6, BE], [12, 6.6, '#e9d4b0'], [11, 6.6, BE]] },
  { a: [-385, -614.6], b: [-341.7, -645.5], fondo: 9, casas: [
    [8, 3.2, B], [9, 4.0, '#d8d8d6'], [9, 6.6, B], [9, 6.6, B2], [9, 6.6, B, { tienda: true }], [9, 6.6, '#ecdcc8']] },
  // Ávila, Tinguafaya y La Joaquina
  { a: [-425.4, -677.1], b: [-386.5, -705.7], fondo: 9, casas: [[16, 6.6, B], [16, 6.6, B2], [16, 6.6, B]] },
  { a: [-586.1, -863.6], b: [-533, -902.5], fondo: 9, casas: [
    [8, 4.0, B], [9, 4.0, B2], [9, 4.0, B], [9, 4.0, '#e4dccf'], [9, 4.0, B], [8, 6.6, '#e6d0c0'], [8, 6.6, B], [6, 4.0, B2]] },
  { a: [-303.3, -893.2], b: [-346.7, -954.4], fondo: 9, casas: [[12, 6.6, CR], [13, 6.6, B], [12, 6.6, CR], [13, 6.6, B], [12, 6.6, CR], [13, 6.6, B]] },
  { a: [-367.1, -981.3], b: [-380.4, -1000.2], fondo: 9, casas: [[12, 0, B], [11, 6.6, '#e9cfa8']] },
  { a: [-265.3, -840], b: [-288.5, -871.6], fondo: 9, casas: [[20, 6.6, BE2], [19, 6.6, B]] },
];

export function tuneCentro(map) {
  aceras(map, ACERAS);
  map.titerroyCentro = true;
}
