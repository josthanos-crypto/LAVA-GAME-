/**
 * Más lugares de Arrecife Centro sacados de fotos de internet, desde La Sonrisa (VERSION_WEB_94i en adelante).
 * Van aparte de masLugares.js para no tener que reescribir aquel archivo, que ya es muy largo, en cada cambio:
 * masLugares.js llama a tuneMasLugares2 y a buildMasLugares2 al final de los suyos.
 * Lo que hace cada uno está en la cabecera de su archivo y en VERSION_WEB_94i y 94j.
 */

import { tuneLaSonrisa, buildLaSonrisa } from '../../laSonrisa.js';
import { tuneLemonTasca, buildLemonTasca } from '../../lemonTasca.js';
import { tuneRemarOutlet, buildRemarOutlet } from '../../remarOutlet.js';
import { tuneLocutorioNador, buildLocutorioNador } from '../../locutorioNador.js';
import { tuneElAlquimista, buildElAlquimista } from '../../elAlquimista.js';
import { tuneGaliciaNuestraCasa, buildGaliciaNuestraCasa } from '../../galiciaNuestraCasa.js';
import { tuneHotelDiamar, buildHotelDiamar } from '../../hotelDiamar.js';
import { tuneBarTintan, buildBarTintan } from '../../barTintan.js';
import { tuneErCuchitri, buildErCuchitri } from '../../erCuchitri.js';
import { tuneJjBar, buildJjBar } from '../../jjBar.js';
import { tuneElGuaro, buildElGuaro } from '../../elGuaro.js';
import { tuneDeliciosamente, buildDeliciosamente } from '../../deliciosamente.js';
import { tuneCafeSaudade, buildCafeSaudade } from '../../cafeSaudade.js';
import { tuneElJardinSecreto, buildElJardinSecreto } from '../../elJardinSecreto.js';
import { tuneAntipoda, buildAntipoda } from '../../antipoda.js';
import { tuneElCortadito, buildElCortadito } from '../../elCortadito.js';
import { tuneElJardinPresentes, buildElJardinPresentes } from '../../elJardinPresentes.js';
import { tuneSafeJakobson, buildSafeJakobson } from '../../safeJakobson.js';
import { tuneManzanaTeruel, buildManzanaTeruel } from '../../manzanaTeruel.js';
import { tuneEdificioAurora, buildEdificioAurora } from '../../edificioAurora.js';
import { tuneChurreriaHubara, buildChurreriaHubara } from '../../churreriaHubara.js';
import { tuneRamblaMedular75, buildRamblaMedular75 } from '../../ramblaMedular75.js';
import { tuneFarmaciaLosRobles, buildFarmaciaLosRobles } from '../../farmaciaLosRobles.js';
import { tuneRamblaMedular40, buildRamblaMedular40 } from '../../ramblaMedular40.js';
import { tuneCasasTampico, buildCasasTampico } from '../../casasTampico.js';
import { tuneCasasPanama, buildCasasPanama } from '../../casasPanama.js';
import { tuneCalleSantaTeresa, buildCalleSantaTeresa } from '../../calleSantaTeresa.js';
import { tuneEdificioQuiron, buildEdificioQuiron } from '../../edificioQuiron.js';
import { tuneSantaTeresaNorte, buildSantaTeresaNorte } from '../../santaTeresaNorte.js';
import { tuneCalleAragon, buildCalleAragon } from '../../calleAragon.js';
import { tuneCalleVenezuela, buildCalleVenezuela } from '../../calleVenezuela.js';
import { tuneJuzgadosArrecife, buildJuzgadosArrecife } from '../../juzgadosArrecife.js';

export function tuneMasLugares2(map) {
  // la Pizzería La Sonrisa y su terraza cerrada, en la avenida de la Mancomunidad esquina a Democracia
  tuneLaSonrisa(map);
  // Lemon Tasca y su caseta de madera, en el paseo del Charco (avenida César Manrique)
  tuneLemonTasca(map);
  // el Rastro y Outlet Remar, la nave de la calle Fajardo 36 en la esquina con Cienfuegos
  tuneRemarOutlet(map);
  // el Locutorio Nador Minimarket, en la calle Cuba 10
  tuneLocutorioNador(map);
  // el Herbolario El Alquimista, en la esquina de Góngora con Colombia
  tuneElAlquimista(map);
  // Galicia Nuestra Casa, el bar restaurante gallego de la calle Guatemala 14
  tuneGaliciaNuestraCasa(map);
  // el bajo del Hotel Diamar y su terraza, en la avenida Fred Olsen 8
  tuneHotelDiamar(map);
  // el Bar Cafetería Tin-Tan, en la esquina de Juan Negrín con Castillo de las Coloradas (junto a El Salsero)
  tuneBarTintan(map);
  // el Bar Er Cuchitrí de Jose Luis, la casa encalada de la calle Argentina 32
  tuneErCuchitri(map);
  // J&J Bar Cafetería, el bajo de granito oscuro de la calle México 35
  tuneJjBar(map);
  // el Bar Cafetería El Guaro, en la esquina de Caldera de Bandama con Caldera de Taburiente (junto a Manolo Millares)
  tuneElGuaro(map);
  // Deliciosamente Coffee & More, en la casa antigua de la calle José Molina 8
  tuneDeliciosamente(map);
  // el Café Saudade, el del letrero de las golondrinas de la calle Manolo Millares 98
  tuneCafeSaudade(map);
  // El Jardín Secreto, la cafetería y crepería de la casa antigua de Manolo Millares 6, en la esquina con Ramón Franco
  tuneElJardinSecreto(map);
  // Antípoda, el café de especialidad de la esquina de Hermanos Zerolo con Francos, con su edificio entero
  tuneAntipoda(map);
  // la Cafetería El Cortadito y El nido, en el edificio color arena de Manolo Millares junto al Maccheroni
  tuneElCortadito(map);
  // la Cafetería El Jardín de los Presentes, en la calle Teruel 25 esquina a Parranda de los Buches, con su casa y el solar
  tuneElJardinPresentes(map);
  // Safe Tore Jakobson, la casa de cuatro alturas de la esquina de Teruel con Colombia, al lado del solar
  tuneSafeJakobson(map);
  // la manzana de los pisos blancos entre Teruel, Colombia, Aragón y Parranda de los Buches, que el mapa no tenía
  tuneManzanaTeruel(map);
  // el Edificio Aurora y su cafetería, en Parranda de los Buches 16, pegado a la casa del Jardín de los Presentes
  tuneEdificioAurora(map);
  // la Churrería Hubara Cafetería, en la calle Triana 78, con su edificio entero hasta el paso de los pilares
  tuneChurreriaHubara(map);
  // la manzana de la Rambla Medular 75 a 85, con el Kokoxili Sushi en la esquina, que el mapa no tenía
  tuneRamblaMedular75(map);
  // la Farmacia Los Robles, en la Rambla Medular 85 (después de la manzana, porque le hace una muesca)
  tuneFarmaciaLosRobles(map);
  // la manzana de la Rambla Medular 40, enfrente: el Restaurante Gopi y los edificios de oficinas
  tuneRamblaMedular40(map);
  // las casas de Tampico y Panamá, la otra cara de la manzana de la Rambla Medular 75 (va después de ella)
  tuneCasasTampico(map);
  // la acera de enfrente: las casas de Panamá y Tampico de la manzana de Santa Teresa de Jesús, con el solar
  tuneCasasPanama(map);
  // las casas terreras de Santa Teresa de Jesús, la otra cara de esa manzana (va después de ella)
  tuneCalleSantaTeresa(map);
  // el edificio de oficinas blanco de la esquina de Santa Teresa con Venezuela (el de Quirón Prevención)
  tuneEdificioQuiron(map);
  // la acera norte de Santa Teresa de Jesús, con la Lavandería Autoservicio y el solar de la esquina
  tuneSantaTeresaNorte(map);
  // la cara de Aragón de esa manzana: el edificio de las placas blancas y el largo color beis (va después)
  tuneCalleAragon(map);
  // la cara de Venezuela de esa manzana, enfrente de Quirón Prevención (va después)
  tuneCalleVenezuela(map);
  // los Juzgados de Arrecife, en la Rambla Medular 101 (esquina con Aragón)
  tuneJuzgadosArrecife(map);
}

export function buildMasLugares2(scene, colliders, map) {
  return {
    laSonrisa: buildLaSonrisa(scene, colliders, map),
    lemonTasca: buildLemonTasca(scene, colliders, map),
    remarOutlet: buildRemarOutlet(scene, colliders, map),
    locutorioNador: buildLocutorioNador(scene, colliders, map),
    elAlquimista: buildElAlquimista(scene, colliders, map),
    galiciaNuestraCasa: buildGaliciaNuestraCasa(scene, colliders, map),
    hotelDiamar: buildHotelDiamar(scene, colliders, map),
    barTintan: buildBarTintan(scene, colliders, map),
    erCuchitri: buildErCuchitri(scene, colliders, map),
    jjBar: buildJjBar(scene, colliders, map),
    elGuaro: buildElGuaro(scene, colliders, map),
    deliciosamente: buildDeliciosamente(scene, colliders, map),
    cafeSaudade: buildCafeSaudade(scene, colliders, map),
    elJardinSecreto: buildElJardinSecreto(scene, colliders, map),
    antipoda: buildAntipoda(scene, colliders, map),
    elCortadito: buildElCortadito(scene, colliders, map),
    elJardinPresentes: buildElJardinPresentes(scene, colliders, map),
    safeJakobson: buildSafeJakobson(scene, colliders, map),
    manzanaTeruel: buildManzanaTeruel(scene, colliders, map),
    edificioAurora: buildEdificioAurora(scene, colliders, map),
    churreriaHubara: buildChurreriaHubara(scene, colliders, map),
    ramblaMedular75: buildRamblaMedular75(scene, colliders, map),
    farmaciaLosRobles: buildFarmaciaLosRobles(scene, colliders, map),
    ramblaMedular40: buildRamblaMedular40(scene, colliders, map),
    casasTampico: buildCasasTampico(scene, colliders, map),
    casasPanama: buildCasasPanama(scene, colliders, map),
    calleSantaTeresa: buildCalleSantaTeresa(scene, colliders, map),
    edificioQuiron: buildEdificioQuiron(scene, colliders, map),
    santaTeresaNorte: buildSantaTeresaNorte(scene, colliders, map),
    calleAragon: buildCalleAragon(scene, colliders, map),
    calleVenezuela: buildCalleVenezuela(scene, colliders, map),
    juzgadosArrecife: buildJuzgadosArrecife(scene, colliders, map),
  };
}
