import { aceras } from '../altavista/kitCalles.js';

/**
 * (Version 174 y 175) El centro de Arrecife calle a calle, donde el mapa solo tenía la manzana entera de un color:
 * Góngora, Quevedo, Perú, Uruguay, Tomás Lubary, Augusto Lorenzo, Paraguay, Portugal, Doctor Fleming, Nicaragua, Isaac
 * Peral, Alonso Cano, Cuba, Trinidad, Cienfuegos, Alegranza, Cabo Juby, Eugenio d'Ors, México, El Greco, Almirante
 * Boado Endeiza, Carlos Sáenz Infante, Democracia, la avenida Coll y dos caras de Manolo Millares (el Jet Set y Armas
 * Trasmediterránea). Y la barriada blanca de Garajonay, Caldera de Bandama y Roque Bentayga con dos bloques beis de
 * Caldera de Taburiente, que son edificios enteros.
 * Hecho con las capturas de Look Around del 24 al 26-11-2026 (PC de Arrecife, carpeta «Downloads\Lava Game capturas
 * 2026-11-25\capturas\centro»: 441 fotos de 51 calles, unas 8 por calle). Solo se miran; no van dentro del juego.
 * Las fotos no traen coordenada: se sabe la calle, el punto donde empezó la tanda, los cruces que se ven (placas y
 * rótulos de las calles) y hacia dónde mira cada foto, por la brújula que lleva arriba a la derecha (N, S, E, O).
 * Con eso se reparte cada cara de manzana entre los edificios que se ven, en su orden, con su color y sus plantas.
 * A ojo: el ancho de cada edificio (la cara se reparte a partes iguales) y su sitio exacto a lo largo de la calle.
 * Lo que no se ve en las fotos se deja como estaba, y también las manzanas que ya tenían color puesto a mano o
 * aspecto propio (Charco, Calle Real).
 * (Version 175) La 174 se hizo sin mirar la brújula y once calles tenían el sentido mal o dudoso: se rehicieron
 * Tomás Lubary, Portugal, Doctor Fleming, Isaac Peral y Alonso Cano, y se quitaron (vuelven a como estaban) Ortega y
 * Gasset, Molino, Luis Fajardo Ferrer, Igualdad, Coronel Bens, García de Hita y Aquilino Fernández. Y los rótulos de
 * los negocios que confirmó José Manuel el 26-11-2026: en su casa los que caen en un tramo nuevo (`letrero`) y, los
 * demás, sueltos sobre la fachada que ya había (`ROTULOS`). Su sitio a lo largo de la calle es aproximado.
 * Cada tramo lleva en el comentario los números de las fotos de su calle. Alto 0 = solar. Casas de a hacia b.
 */

const B = '#f1eee7';

const ACERAS = [
  // Góngora, acera sur (fotos 0532-0539)
  { a: [-577.0, 23.3], b: [-603.9, 36.4], fondo: 10, casas: [
    [10, 12.2, '#f1eee7'], [10, 12.2, '#dfb497'], [10, 9.4, '#d9b996']] },
  // Góngora, acera sur (fotos 0532-0539)
  { a: [-611.4, 40.7], b: [-622.3, 46.0], fondo: 10, casas: [
    [12.2, 6.6, '#f1eee7']] },
  // Góngora, acera norte (fotos 0532-0539)
  { a: [-581.9, 14.8], b: [-624.6, 35.6], fondo: 10, casas: [
    [9.5, 12.2, '#f1eee7'], [9.5, 12.2, '#ece8e0'], [9.5, 6.6, '#f1eee7'], [9.5, 9.4, '#f1eee7', { tienda: true }], [9.5, 6.6, '#f1eee7']] },
  // Quevedo, acera este (fotos 0598-0605)
  { a: [-552.1, 55.5], b: [-568.3, 21.9], fondo: 10, casas: [
    [12.4, 12.2, '#d9b996', { tienda: true }], [12.4, 9.4, '#f1eee7'], [12.4, 9.4, '#f1eee7', { tienda: true }]] },
  // Peru, acera norte (fotos 0581-0588)
  { a: [-550.7, -59.9], b: [-508.2, -69.1], fondo: 10, casas: [
    [14.5, 6.6, '#efe6c8'], [14.5, 6.6, '#f1eee7'], [14.5, 6.6, '#f1eee7']] },
  // Peru, acera sur (fotos 0581-0588)
  { a: [-560.5, -48.9], b: [-500.9, -61.5], fondo: 10, casas: [
    [12.2, 9.4, '#dfb497'], [12.2, 4.0, '#f1eee7'], [12.2, 4.0, '#ece8e0'], [12.2, 6.6, '#f1eee7'], [12.2, 4.0, '#8f9296']] },
  // Uruguay, acera este (fotos 0676-0681)
  { a: [-470.1, -24.4], b: [-433.9, 52.4], fondo: 10, casas: [
    [8.5, 6.6, '#cfd0cd'], [8.5, 6.6, '#cfd0cd'], [8.5, 9.4, '#dfb497'], [8.5, 9.4, '#dfb497'], [8.5, 4.0, '#f1eee7'], [8.5, 4.0, '#ece8e0'], [8.5, 9.4, '#b9b2a4'], [8.5, 9.4, '#b9b2a4'], [8.5, 9.4, '#f1eee7'], [8.5, 9.4, '#ece8e0']] },
  // Uruguay, acera oeste (fotos 0676-0681)
  { a: [-502.4, -63.7], b: [-485.2, -33.9], fondo: 10, casas: [
    [8.6, 9.4, '#f1eee7'], [8.6, 9.4, '#ece8e0'], [8.6, 9.4, '#f1eee7', { tienda: true }], [8.6, 9.4, '#ece8e0', { tienda: true }]] },
  // Uruguay, acera oeste (fotos 0676-0681)
  { a: [-479.2, -19.8], b: [-442.8, 57.4], fondo: 10, casas: [
    [10.7, 12.2, '#f1eee7', { tienda: true }], [10.7, 12.2, '#ece8e0', { tienda: true }], [10.7, 12.2, '#8f9296', { tienda: true }], [10.7, 12.2, '#8f9296', { tienda: true }], [10.7, 9.4, '#efe6c8'], [10.7, 9.4, '#efe6c8'], [10.7, 4.0, '#f1eee7'], [10.7, 4.0, '#ece8e0']] },
  // Tomas Lubary, acera este (fotos 0746-0753)
  { a: [-551.4, -60.3], b: [-569.8, -100.3], fondo: 10, casas: [
    [11, 6.6, '#cfd0cd'], [11, 9.4, '#f1eee7'], [11, 4.0, '#ece8e0'], [11, 4.0, '#f1eee7']] },
  // Tomas Lubary, acera oeste (fotos 0746-0753)
  { a: [-584.9, -107.2], b: [-592.1, -122.8], fondo: 10, casas: [
    [8.6, 4.0, '#f1eee7'], [8.6, 4.0, '#ece8e0']] },
  // Tomas Lubary, acera oeste (fotos 0746-0753)
  { a: [-561.5, -59.7], b: [-579.1, -96.8], fondo: 10, casas: [
    [10.3, 9.4, '#f1eee7'], [10.3, 9.4, '#ece8e0'], [10.3, 6.6, '#f1eee7'], [10.3, 6.6, '#ece8e0']] },
  // Augusto Lorenzo, acera norte (fotos 0540-0547)
  { a: [-629.7, -85.4], b: [-584.6, -106.6], fondo: 10, casas: [
    [10, 9.4, '#f1eee7'], [10, 6.6, '#f1eee7'], [10, 4.0, '#ece8e0'], [10, 6.6, '#f1eee7'], [10, 4.0, '#f1eee7']] },
  // Augusto Lorenzo, acera sur (fotos 0540-0547)
  { a: [-668.9, -56.2], b: [-620.9, -77.6], fondo: 10, casas: [
    [8.8, 6.6, '#f1eee7'], [8.8, 6.6, '#ece8e0'], [8.8, 9.4, '#f1eee7'], [8.8, 9.4, '#ece8e0'], [8.8, 9.4, '#f1eee7', { tienda: true }], [8.8, 9.4, '#ece8e0', { tienda: true }]] },
  // Augusto Lorenzo, acera sur (fotos 0540-0547)
  { a: [-610.0, -82.3], b: [-579.0, -97.0], fondo: 10, casas: [
    [8.6, 6.6, '#f1eee7'], [8.6, 6.6, '#8f9296'], [8.6, 4.0, '#f1eee7'], [8.6, 4.0, '#ece8e0']] },
  // Paraguay, acera oeste (fotos 0792-0799)
  { a: [-464.0, 121.6], b: [-480.4, 87.1], fondo: 10, casas: [
    [9.5, 4.0, '#f1eee7'], [9.5, 4.0, '#f1eee7'], [9.5, 4.0, '#ece8e0'], [9.5, 4.0, '#f1eee7']] },
  // Portugal, acera norte (fotos 0848-0855)
  { a: [-422.1, 102.0], b: [-352.3, 69.3], fondo: 10, casas: [
    [9.6, 12.2, '#cfd0cd', { tienda: true }], [9.6, 12.2, '#cfd0cd', { tienda: true }], [9.6, 12.2, '#cfd0cd', { letrero: 'Bingo', k: 'gen' }], [9.6, 12.2, '#cfd0cd', { tienda: true }], [9.6, 12.2, '#f1eee7', { tienda: true }], [9.6, 12.2, '#ece8e0', { tienda: true }], [9.6, 12.2, '#f1eee7', { tienda: true }], [9.6, 12.2, '#ece8e0', { tienda: true }]] },
  // Doctor Fleming, acera este (fotos 0816-0823)
  { a: [-343.9, 21.2], b: [-326.5, 56.9], fondo: 10, casas: [
    [9.9, 9.4, '#f1eee7'], [9.9, 9.4, '#ece8e0'], [9.9, 9.4, '#dfb497'], [9.9, 9.4, '#dfb497']] },
  // Doctor Fleming, acera oeste (fotos 0816-0823)
  { a: [-353.9, 26.6], b: [-337.1, 61.0], fondo: 10, casas: [
    [12.8, 4.0, '#f1eee7'], [12.8, 4.0, '#ece8e0'], [12.8, 4.0, '#f1eee7']] },
  // Doctor Fleming, acera oeste (fotos 0816-0823)
  { a: [-332.8, 72.4], b: [-316.2, 108.2], fondo: 10, casas: [
    [9.9, 9.4, '#f1eee7', { tienda: true }], [9.9, 6.6, '#f1eee7'], [9.9, 6.6, '#dfb497', { letrero: 'Video Tecnic', k: 'tech' }], [9.9, 6.6, '#dfb497', { letrero: 'Zona Fit', k: 'retail' }]] },
  // Nicaragua, acera norte (fotos 0636-0643)
  { a: [-168.7, -73.1], b: [-131.8, -38.9], fondo: 10, casas: [
    [10.1, 9.4, '#f1eee7'], [10.1, 9.4, '#ece8e0'], [10.1, 9.4, '#f1eee7'], [10.1, 9.4, '#ece8e0'], [10.1, 9.4, '#f1eee7']] },
  // Nicaragua, acera sur (fotos 0636-0643)
  { a: [-197.6, -84.4], b: [-184.3, -73.1], fondo: 10, casas: [
    [8.7, 6.6, '#f1eee7'], [8.7, 6.6, '#ece8e0']] },
  // Isaac Peral, acera sur (fotos 0888-0895)
  { a: [-320.0, -124.5], b: [-296.2, -132.1], fondo: 10, casas: [
    [12.5, 9.4, '#d9b996'], [12.5, 4.0, '#f1eee7']] },
  // Alonso Cano, acera norte (fotos 0754-0761)
  { a: [-353.2, -163.9], b: [-305.3, -166.1], fondo: 10, casas: [
    [16, 9.4, '#cfd0cd'], [16, 9.4, '#f1eee7'], [16, 12.2, '#dfb497']] },
  // Alonso Cano, acera sur (fotos 0754-0761)
  { a: [-403.6, -154.5], b: [-291.9, -158.9], fondo: 10, casas: [
    [11.2, 9.4, '#f1eee7', { tienda: true }], [11.2, 9.4, '#ece8e0', { tienda: true }], [11.2, 12.2, '#f1eee7'], [11.2, 12.2, '#ece8e0'], [11.2, 9.4, '#f1eee7'], [11.2, 9.4, '#ece8e0'], [11.2, 12.2, '#f1eee7'], [11.2, 12.2, '#ece8e0'], [11.2, 9.4, '#f1eee7'], [11.2, 9.4, '#ece8e0']] },
  // Cuba, acera este (fotos 0880-0887)
  { a: [-161.0, 38.1], b: [-122.4, -4.3], fondo: 10, casas: [
    [57.3, 12.2, '#b9b2a4']] },
  // Cuba, acera oeste (fotos 0880-0887)
  { a: [-148.8, 10.9], b: [-123.2, -15.8], fondo: 10, casas: [
    [9.3, 12.2, '#f1eee7', { tienda: true }], [9.3, 12.2, '#ece8e0', { tienda: true }], [9.3, 12.2, '#f1eee7', { tienda: true }], [9.3, 12.2, '#ece8e0', { tienda: true }]] },
  // Trinidad, acera norte (fotos 0644-0651)
  { a: [2.5, 108.2], b: [-35.1, 73.9], fondo: 10, casas: [
    [12.7, 4.0, '#e6d3b8'], [12.7, 4.0, '#ece8e0'], [12.7, 4.0, '#efe6c8'], [12.7, 4.0, '#ece8e0']] },
  // Cienfuegos, acera norte (fotos 0606-0613)
  { a: [-41.3, 63.1], b: [-22.9, 54.2], fondo: 10, casas: [
    [10.2, 4.0, '#f1eee7'], [10.2, 4.0, '#ece8e0']] },
  // Cienfuegos, acera sur (fotos 0606-0613)
  { a: [-36.8, 71.4], b: [12.1, 48.1], fondo: 10, casas: [
    [13.5, 6.6, '#f1eee7'], [13.5, 4.0, '#f1eee7'], [13.5, 4.0, '#ece8e0'], [13.5, 4.0, '#f1eee7']] },
  // Alegranza, acera oeste (fotos 0824-0831)
  { a: [-203.5, 173.6], b: [-168.0, 237.8], fondo: 10, casas: [
    [73.4, 9.4, '#f1eee7']] },
  // Cabo Juby, acera este (fotos 0832-0839)
  { a: [-347.8, 281.5], b: [-344.9, 325.0], fondo: 10, casas: [
    [10.9, 15.0, '#e6d3b8', { tienda: true }], [10.9, 12.2, '#e6d3b8'], [10.9, 12.2, '#d9b996'], [10.9, 9.4, '#d9b996']] },
  // Cabo Juby, acera oeste (fotos 0832-0839)
  { a: [-359.6, 254.5], b: [-357.2, 291.0], fondo: 10, casas: [
    [12.2, 4.0, '#f1eee7'], [12.2, 4.0, '#ece8e0'], [12.2, 4.0, '#f1eee7']] },
  // Cabo Juby, acera oeste (fotos 0832-0839)
  { a: [-356.5, 299.5], b: [-354.6, 326.9], fondo: 10, casas: [
    [27.5, 6.6, '#f1eee7']] },
  // Eugenio d'Ors, acera este (fotos 0856-0863)
  { a: [-523.2, 248.8], b: [-492.8, 328.7], fondo: 10, casas: [
    [85.5, 9.4, '#e3dccd']] },
  // México, acera oeste (fotos 0706-0713)
  { a: [-555.1, 340.6], b: [-572.8, 271.0], fondo: 10, casas: [
    [12, 9.4, '#d9b996'], [12, 12.2, '#cfd0cd'], [12, 12.2, '#f1eee7'], [12, 15.0, '#dfb497', { tienda: true }], [12, 9.4, '#f1eee7'], [12, 6.6, '#f1eee7']] },
  // México, acera oeste (fotos 0706-0713)
  { a: [-580.9, 255.4], b: [-599.1, 219.4], fondo: 10, casas: [
    [8.1, 6.6, '#f1eee7'], [8.1, 4.0, '#f1eee7'], [8.1, 4.0, '#b9b2a4'], [8.1, 4.0, '#f1eee7'], [8.1, 4.0, '#ece8e0']] },
  // México, acera oeste (fotos 0706-0713)
  { a: [-607.5, 206.2], b: [-622.3, 175.2], fondo: 10, casas: [
    [11.4, 9.4, '#f1eee7'], [11.4, 6.6, '#b9b2a4'], [11.4, 9.4, '#dfb497']] },
  // México, acera este (fotos 0706-0713)
  { a: [-544.4, 341.4], b: [-548.0, 314.2], fondo: 10, casas: [
    [13.7, 9.4, '#f1eee7'], [13.7, 9.4, '#ece8e0']] },
  // México, acera este (fotos 0706-0713)
  { a: [-549.8, 300.5], b: [-556.8, 281.9], fondo: 10, casas: [
    [9.9, 9.4, '#f1eee7'], [9.9, 9.4, '#ece8e0']] },
  // México, acera este (fotos 0706-0713)
  { a: [-569.1, 253.2], b: [-589.2, 213.3], fondo: 10, casas: [
    [11.2, 6.6, '#d9b996', { tienda: true }], [11.2, 4.0, '#f1eee7'], [11.2, 4.0, '#ece8e0'], [11.2, 4.0, '#efe6c8']] },
  // El Greco, acera sur (fotos 0714-0721)
  { a: [-663.8, 394.5], b: [-640.4, 401.3], fondo: 10, casas: [
    [12.2, 12.2, '#f1eee7', { tienda: true }], [12.2, 12.2, '#ece8e0', { tienda: true }]] },
  // El Greco, acera sur (fotos 0714-0721)
  { a: [-640.4, 401.3], b: [-626.3, 405.3], fondo: 10, casas: [
    [14.6, 9.4, '#f1eee7']] },
  // El Greco, acera sur (fotos 0714-0721)
  { a: [-621.4, 406.8], b: [-593.5, 414.9], fondo: 10, casas: [
    [14.5, 6.6, '#f1eee7'], [14.5, 4.0, '#ece8e0']] },
  // El Greco, acera sur (fotos 0714-0721)
  { a: [-587.8, 418.3], b: [-575.6, 416.7], fondo: 10, casas: [
    [12.3, 12.2, '#f1eee7']] },
  // Almirante Boado Endeiza, acera oeste (fotos 0808-0815)
  { a: [-507.7, 420.7], b: [-524.6, 358.2], fondo: 10, casas: [
    [10.8, 12.2, '#d8b870', { tienda: true }], [10.8, 12.2, '#d8b870', { tienda: true }], [10.8, 12.2, '#f1eee7'], [10.8, 12.2, '#ece8e0'], [10.8, 12.2, '#f1eee7'], [10.8, 12.2, '#ece8e0']] },
  // Almirante Boado Endeiza, acera este (fotos 0808-0815)
  { a: [-496.0, 415.9], b: [-504.5, 384.5], fondo: 10, casas: [
    [10.8, 9.4, '#e6d3b8', { tienda: true }], [10.8, 9.4, '#e6d3b8', { tienda: true }], [10.8, 9.4, '#e6d3b8', { tienda: true }]] },
  // Almirante Boado Endeiza, acera este (fotos 0808-0815)
  { a: [-504.3, 384.5], b: [-511.3, 358.8], fondo: 10, casas: [
    [13.3, 15.0, '#f1eee7'], [13.3, 15.0, '#f1eee7']] },
  // Carlos Sáenz Infante, acera este (fotos 0778-0785)
  { a: [-383.3, 340.3], b: [-385.4, 431.8], fondo: 10, casas: [
    [15.3, 6.6, '#f1eee7'], [15.3, 6.6, '#ece8e0'], [15.3, 4.0, '#f1eee7'], [15.3, 6.6, '#f1eee7'], [15.3, 6.6, '#dcc0b8'], [15.3, 6.6, '#f1eee7']] },
  // Carlos Sáenz Infante, acera este (fotos 0778-0785)
  { a: [-385.6, 439.7], b: [-386.6, 479.0], fondo: 10, casas: [
    [9.8, 9.4, '#f1eee7', { tienda: true }], [9.8, 9.4, '#ece8e0', { tienda: true }], [9.8, 9.4, '#d8b870'], [9.8, 9.4, '#d8b870']] },
  // Carlos Sáenz Infante, acera oeste (fotos 0778-0785)
  { a: [-391.6, 340.9], b: [-392.7, 391.3], fondo: 10, casas: [
    [12.6, 4.0, '#f1eee7'], [12.6, 4.0, '#ece8e0'], [12.6, 4.0, '#f1eee7'], [12.6, 4.0, '#efe6c8']] },
  // Carlos Sáenz Infante, acera oeste (fotos 0778-0785)
  { a: [-393.3, 404.4], b: [-395.3, 481.9], fondo: 10, casas: [
    [12.9, 4.0, '#efe6c8'], [12.9, 4.0, '#efe6c8'], [12.9, 6.6, '#f1eee7'], [12.9, 6.6, '#ece8e0'], [12.9, 9.4, '#f1eee7'], [12.9, 9.4, '#ece8e0']] },
  // Democracia, acera oeste (fotos 0786-0791)
  { a: [-372.7, 432.2], b: [-370.4, 339.1], fondo: 10, casas: [
    [9.3, 6.6, '#f1eee7'], [9.3, 6.6, '#ece8e0'], [9.3, 9.4, '#f1eee7'], [9.3, 9.4, '#ece8e0'], [9.3, 6.6, '#f1eee7'], [9.3, 6.6, '#ece8e0'], [9.3, 4.0, '#f1eee7'], [9.3, 4.0, '#ece8e0'], [9.3, 6.6, '#f1eee7', { tienda: true }], [9.3, 6.6, '#ece8e0', { tienda: true }]] },
  // Democracia, acera este (fotos 0786-0791)
  { a: [-363.2, 378.4], b: [-362.2, 337.1], fondo: 10, casas: [
    [10.3, 4.0, '#ece8e0'], [10.3, 4.0, '#efe6c8'], [10.3, 4.0, '#ece8e0'], [10.3, 4.0, '#f1eee7']] },
  // Avenida Coll, acera norte (fotos 0840-0847)
  { a: [241.4, 414.3], b: [249.9, 409.9], fondo: 10, casas: [
    [9.6, 6.6, '#f1eee7']] },
  // Manolo Millares, acera sur (fotos 0487-0523 y 0832-0839)
  { a: [-309.1, 331.4], b: [-362.3, 336.1], fondo: 10, casas: [
    [53.5, 4.0, '#f1eee7', { letrero: 'Jet Set', k: 'gen' }]] },
  // Manolo Millares, acera norte (fotos 0808-0815)
  { a: [-501.5, 337.5], b: [-544.3, 342.7], fondo: 10, casas: [
    [43.1, 12.2, '#d9b0a8', { letrero: 'Armas Trasmediterránea', k: 'gen' }]] },
];

// manzanas que son un solo edificio: [punto de dentro, color, alto]. Se pinta el bloque entero, sin partirlo
const BLOQUES = [
  [-1055.9, 243.3, '#f1eee7', 12.2],  // bloque de 79 x 65 m
  [-1054.4, 323.9, '#f1eee7', 12.2],  // bloque de 87 x 91 m
  [-973.1, 331.6, '#f1eee7', 12.2],  // bloque de 94 x 59 m
  [-1043.0, 194.0, '#f1eee7', 12.2],  // bloque de 55 x 65 m
  [-1000.2, 206.9, '#e6d3b8', 15.0],  // bloque de 44 x 60 m
  [-1013.7, 121.4, '#e6d3b8', 12.2],  // bloque de 84 x 68 m
];

// rótulos sueltos, sobre fachadas que ya estaban: [nombre, x, z, normal hacia la calle (x, z), tipo]
const ROTULOS = [
  ['Alain Afflelou', -77.0, 160.8, 0.704, -0.711, 'retail'],
  ['Librería Fajardo', -105.1, 132.4, 0.704, -0.711, 'retail'],
  ['Visanta', -168.0, 488.5, 0, 1, 'gen'],
  ['Auditax', -181.0, 490.6, 0, 1, 'gen'],
  ['Santa Marta', 177.7, 262.6, -0.894, 0.448, 'retail'],
  ['Orisa Óptica', 173.1, 253.7, -0.894, 0.448, 'retail'],
  ['Digi', 142.9, 280.5, 0.91, -0.416, 'tech'],
];

const libre = b => b && Array.isArray(b.p) && !(b.skip || b.ownFront || b.ownRoof || b.edificioReal || b.zone);

function dentro(p, x, z) {
  let d = false;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    const [x1, z1] = p[i], [x2, z2] = p[j];
    if ((z1 > z) !== (z2 > z) && x < (x2 - x1) * (z - z1) / (z2 - z1) + x1) d = !d;
  }
  return d;
}

const rgb = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));

export function tuneFachadasCentro(map) {
  if (!Array.isArray(map?.buildings)) return;
  let pintados = 0;
  for (const [x, z, color, alto] of BLOQUES) {
    const b = map.buildings.find(q => libre(q) && dentro(q.p, x, z));
    if (!b) continue;
    b.h = alto;
    b.f = rgb(color);
    pintados++;
  }
  aceras(map, ACERAS);
  const ya = new Set((map.signs || []).map(s => s.name));
  let rotulos = 0;
  for (const [name, x, z, nx, nz, k] of ROTULOS) {
    if (ya.has(name)) continue;
    (map.signs ||= []).push({ x, z, nx, nz, name, k });
    rotulos++;
  }
  map.fachadasCentro = ACERAS.length;
  map.rotulosCentro = rotulos;
  map.bloquesCentro = pintados;
}
