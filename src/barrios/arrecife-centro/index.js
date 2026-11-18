/**
 * ARRECIFE CENTRO — el casco: Charco de San Ginés, Calle Real, San Ginés, Castillo de San
 * Gabriel y Puente de las Bolas, el puerto, la playa del Reducto, el Ayuntamiento, la Casa
 * Fajardo, el Atlántida, el parque Ramírez Cerdá y la zona de Manolo Millares (Maccheroni,
 * Buganvillas, Farmacia Las Salinas, colegio Zerolo, esquina Guenia-Millares).
 *
 * Límites en metros del juego: x de -950 a 894, z de -178 a 900
 * (x hacia el este, z hacia el sur; el origen es el Charco).
 * Ficha completa: ./LEEME.md
 */

import { tuneMaccheroni, buildMaccheroniFacade } from '../../maccheroni.js';
import { tuneBuganvillas, buildBuganvillas } from '../../buganvillas.js';
import { tuneAtlantida, buildAtlantida } from '../../atlantida.js';
import { tuneFajardo, buildFajardo } from '../../casaFajardo.js';
import { tuneAyuntamiento, buildAyuntamiento } from '../../ayuntamiento.js';
import { buildCharco } from '../../charco.js';
import { buildCalleReal } from '../../calleReal.js';
import { buildSanGines } from '../../sanGines.js';
import { buildPlazaPalmas } from '../../plazaPalmas.js';
import { buildParqueRamirez } from '../../parqueRamirez.js';
import { buildEstatuas } from '../../estatuas.js';
import { buildCharcoEntrada } from '../../charcoEntrada.js';
import { buildFortBridge } from '../../fortBridge.js';
import { buildBeach } from '../../beach.js';
import { Regatta } from '../../regatta.js';
import { buildFarmaciaGuenia } from '../../farmaciaGuenia.js';
import { buildEscuelaZerolo } from '../../escuelaZerolo.js';
import { buildEsquinaMillares } from '../../esquinaMillares.js';
import { buildTerrace } from '../../terrace.js';
import { buildMayor } from '../../mayor.js';
import { tuneAparcamientoGinory, buildAparcamientoGinory, buildGorrillasGinory } from '../../aparcamientoGinory.js';
import { tuneCharcoVivo, buildCharcoVivo } from '../../charcoVivo.js';
import { buildPiraguas, buildPiraguasOrilla } from '../../piraguas.js';
import { buildMarea, ponerReloj } from '../../marea.js';
import { tuneLocalesCharco, buildLocalesCharco } from '../../localesCharco.js';
import { tuneRestaurantesCharco, buildRestaurantesCharco } from '../../restaurantesCharco.js';
import { tuneRestaurantesCharco2, buildRestaurantesCharco2 } from '../../restaurantesCharco2.js';
import { tuneGranHotel, buildGranHotel } from '../../granHotel.js';
import { tuneElAlmacen, buildElAlmacen } from '../../elAlmacen.js';
import { tuneHotelLancelot, buildHotelLancelot } from '../../hotelLancelot.js';
import { tuneMasLugares, buildMasLugares } from './masLugares.js';
import { tuneCasaAmarilla, buildCasaAmarilla } from '../../casaAmarilla.js';
import { desnivelesArrecifeCentro } from '../../desniveles/arrecife-centro.js';

export const BARRIO = {
  id: 'arrecife-centro',
  nombre: 'Arrecife Centro',
  caja: { x0: -950, x1: 894, z0: -178, z1: 900 },
};

/**
 * Los retoques al mapa tienen que ir ANTES de levantar la ciudad (world.js),
 * así que se llaman los primeros, en prepararBarrios().
 */
export function prepararMapa(map) {
  // las cuestas bruscas del norte del Charco, suavizadas (antes que nada: lo demás ya ve el relieve arreglado)
  map.desnivelesCentro = desnivelesArrecifeCentro();
  // el edificio ocre del Maccheroni y las mesas de su terraza
  tuneMaccheroni(map);
  // el Centro Comercial Buganvillas: esquina achaflanada y estuco blanco
  tuneBuganvillas(map);
  tuneAtlantida(map);
  // la Casa Fajardo (calle Fajardo 5): se le abre hueco en el bloque y se levanta como en la foto
  tuneFajardo(map);
  tuneAyuntamiento(map);
  // el aparcamiento de enfrente de la Casa Ginory: sus plazas, las palmeras y el edificio blanco de la esquina
  tuneAparcamientoGinory(map);
  // el restaurante Charco Vivo (antigua Casa Ginory): la casa terrera de delante sale aparte del bloque
  tuneCharcoVivo(map);
  // los locales del paseo norte del Charco: palmeras y farolas como en las fotos, y fuera los rótulos rojos genéricos
  tuneLocalesCharco(map);
  // los restaurantes de la orilla norte del lago grande del Charco: fuera sus rótulos rojos genéricos
  tuneRestaurantesCharco(map);
  tuneRestaurantesCharco2(map);
  // el Arrecife Gran Hotel: se apunta la torre del mapa para ponerle la piel de las fotos
  tuneGranHotel(map);
  // El Almacén de César Manrique: la manzana a una planta encalada y fuera sus rótulos genéricos
  tuneElAlmacen(map);
  // el Hotel Lancelot: fuera su rótulo genérico (lleva el suyo en la fachada)
  tuneHotelLancelot(map);
  // y los lugares nuevos de las fotos de internet que vienen después (masLugares.js)
  tuneMasLugares(map);
  // la Casa Amarilla (León y Castillo 6): el bloque del mapa pasa a tener su fachada de la foto
  tuneCasaAmarilla(map);
}

/** primera fase: antes de crear los locales */
export function construir({ scene, map, colliders, touch }) {
  // la playa del Reducto con su gente
  const beach = buildBeach(scene, map, { few: touch });
  // la explanada de la antigua discoteca se quitó (Version 101f): era una losa flotando sobre el mar. Va dentro de la
  // isla; cuando José Manuel diga dónde, se vuelve a montar con explanadaDisco.js (el archivo se conserva)
  const explanadaDisco = null;
  // regata de vela latina delante del Reducto
  const regatta = new Regatta(scene, { touch });
  // zona piloto del Charco de San Ginés: barquillos amarrados (fachadas y muretes en world.js y coast.js)
  const charco = buildCharco(scene, map, { touch });
  // la marea del Charco: llena a las 10 y a las 22, vacía a las 4 y a las 16 (fango, piedras y barquillos varados)
  const marea = buildMarea(scene, map, charco, { touch });
  // los chavales de las piraguas remando por el Charco detrás del monitor (se mueven con el update del Charco)
  buildPiraguas(scene, { charco, touch });
  // Calle Real según el vídeo de referencia: losas grises de fachada a fachada, farolas y bancos
  const calleReal = buildCalleReal(scene, map);
  // la iglesia de San Ginés y su entorno
  buildSanGines(scene, map, colliders);
  // las calles de la iglesia empedradas como en la postal, con la cruz y los laureles de la plaza
  buildPlazaPalmas(scene, map, colliders);
  // parque José Ramírez Cerdá: kiosco de la música, kiosco verde, suelo de ladrillo en espiga y farolas de bola
  const parqueRamirez = buildParqueRamirez(scene);
  // la estatua del Pollo de Arrecife (Heraclio Niz Mesa), al final de la Calle Real
  buildEstatuas(scene, colliders);
  // la Casa Amarilla, con su fachada de azulejo y el reloj
  buildCasaAmarilla(scene, map);
  // el edificio Atlántida (Multicines, C/ León y Castillo 42) como en la foto
  const atlantida = buildAtlantida(scene);
  buildFajardo(scene);
  // la entrada del Charco: estanque con muros de piedra volcánica, puente azul, esqueleto de ballena y farolas mástil
  const charcoEntrada = buildCharcoEntrada(scene, colliders);
  // la fachada del Ayuntamiento como en la foto (portada de cantería, letras, faroles y la torrecilla)
  const ayuntamiento = buildAyuntamiento(scene);
  // el Castillo de San Gabriel y el Puente de las Bolas
  const fortBridge = buildFortBridge(scene, map, colliders);
  // el aparcamiento grande de enfrente de la Casa Ginory (foto): asfalto, plazas, farolas con guirnaldas y el paso de cebra
  buildAparcamientoGinory(scene, colliders);
  // el Charco Vivo como en la foto: fachada encalada, puertas azules, toldos, rótulo, terraza, farola y árboles
  buildCharcoVivo(scene, colliders, map);

  return {
    beach, explanadaDisco, regatta, charco, marea, calleReal, parqueRamirez,
    atlantida, charcoEntrada, ayuntamiento, fortBridge,
  };
}

/** segunda fase: después de crear los locales (las terrazas y el alcalde los necesitan) */
export async function construirConLocales({ scene, map, colliders, locales, touch }) {
  // la marea del Charco va con el reloj del juego (la hora la tienen los locales)
  ponerReloj(locales.hooks?.hour);
  // la fachada del Maccheroni como en las fotos (rótulo de verdad, toldo, faroles y terraza)
  const maccheroni = await buildMaccheroniFacade(scene, colliders);
  // el C.C. Buganvillas entero: WOK, Sakura, Kassino, muelles de Fenauso y la plaza de Aniagua
  const buganvillas = await buildBuganvillas(scene, colliders);
  // la Farmacia Las Salinas, en la esquina de Calle Guenia con Aniagua
  const farmacia = buildFarmaciaGuenia(scene, map);
  // el colegio Antonio Zerolo: muro encalado con verja verde, portones, rótulo y flamboyanes
  const escuelaZerolo = buildEscuelaZerolo(scene, map, colliders);
  // la esquina de Guenia con Manolo Millares: Calzado El Más Barato y el arco
  const esquinaMillares = buildEsquinaMillares(scene, map);
  // terrazas techadas del Reducto (antes que los muebles que salen volando: añade sus mesas de fuera)
  const terrace = buildTerrace(scene, map, colliders, { locales, touch });
  // el alcalde, en la puerta del Ayuntamiento (se habla con él con T)
  const mayor = buildMayor(map, locales);
  // los gorrillas del aparcamiento de enfrente de la Casa Ginory, con su chaleco amarillo (se habla con ellos con T)
  const gorrillas = buildGorrillasGinory(locales);
  // el grupo de las piraguas en el paseo del Charco, preparándose (se habla con ellos con T)
  const piraguas = buildPiraguasOrilla(scene, locales);
  // los locales del paseo norte del Charco como en las fotos: la heladería Antiu Xixona, la escalera al Charco,
  // el edificio de las galerías, la casita de las puertas azules, el Leito de Proa con su terraza y la esquina verde
  const localesCharco = buildLocalesCharco(scene, colliders, map, locales);
  // los restaurantes de la orilla norte del lago grande, con las fotos de internet: la Tasca La Raspa
  const restaurantesCharco = buildRestaurantesCharco(scene, colliders, map, locales);
  // y los demás de la orilla: Martino's Gelato y Estrella
  const restaurantesCharco2 = buildRestaurantesCharco2(scene, colliders, map, locales);
  // el Arrecife Gran Hotel como en las fotos: la torre de cristal con las franjas blancas y la entrada del norte
  const granHotel = buildGranHotel(scene, colliders, map);
  // El Almacén como en las fotos: la fachada encalada con la carpintería verde, la celosía y los faroles
  const elAlmacen = buildElAlmacen(scene, colliders, map);
  // el Hotel Lancelot como en la foto: las logias blancas de la fachada de la playa y el paño con el logo
  const hotelLancelot = buildHotelLancelot(scene, colliders, map);
  // los lugares nuevos que vienen después: los bares de San Ginés y lo que se vaya añadiendo (masLugares.js)
  const masLugares = buildMasLugares(scene, colliders, map, locales);

  return { maccheroni, buganvillas, farmacia, escuelaZerolo, esquinaMillares, terrace, mayor, gorrillas, piraguas, localesCharco, restaurantesCharco, restaurantesCharco2, granHotel, elAlmacen, hotelLancelot, masLugares };
}
