/**
 * Los lugares nuevos de Arrecife Centro sacados de fotos de internet, a partir de los bares de San Ginés.
 * Van todos aquí para no tener que tocar el index.js del barrio cada vez: el index llama a tuneMasLugares
 * (antes de levantar la ciudad) y a buildMasLugares (en la segunda fase, con los locales ya hechos).
 * Lo que hace cada uno está en la cabecera de su archivo y en VERSION_WEB_94b a 94h.
 */

import { tuneLocalesSanGines, buildLocalesSanGines } from '../../localesSanGines.js';
import { tuneLocalesPuntilla, buildLocalesPuntilla } from '../../localesPuntilla.js';
import { tuneLocalesVarios, buildLocalesVarios } from '../../localesVarios.js';
import { tuneLaRustica, buildLaRustica } from '../../laRustica.js';
import { tuneGambrinus, buildGambrinus } from '../../gambrinus.js';
import { tuneLaCerveceria, buildLaCerveceria } from '../../laCerveceria.js';
import { tuneMiNina, buildMiNina } from '../../miNina.js';
import { tuneFrescoItalia, buildFrescoItalia } from '../../frescoItalia.js';
import { tuneLolita, buildLolita } from '../../lolita.js';
import { tuneElVelero, buildElVelero } from '../../elVelero.js';
import { tuneLaLupe, buildLaLupe } from '../../laLupe.js';
import { tuneMiniGaston, buildMiniGaston } from '../../miniGaston.js';
import { tuneBarAsturias, buildBarAsturias } from '../../barAsturias.js';
import { tunePapaMiguel, buildPapaMiguel } from '../../papaMiguel.js';
import { tuneRinconGranaino, buildRinconGranaino } from '../../rinconGranaino.js';
import { tuneLaDespensita, buildLaDespensita } from '../../laDespensita.js';
import { tuneLaTentacion, buildLaTentacion } from '../../laTentacion.js';
import { tuneElAborigen, buildElAborigen } from '../../elAborigen.js';
import { tuneLaCaribena, buildLaCaribena } from '../../laCaribena.js';
import { tunePescaderia, buildPescaderia } from '../../pescaderia.js';
import { tuneLibreriaElPuente, buildLibreriaElPuente } from '../../libreriaElPuente.js';
import { tuneLaPlatanera, buildLaPlatanera } from '../../laPlatanera.js';
import { tuneOpticaPerezDuran, buildOpticaPerezDuran } from '../../opticaPerezDuran.js';
import { tuneHotelCardona, buildHotelCardona } from '../../hotelCardona.js';
import { tuneFerreteriaN4, buildFerreteriaN4 } from '../../ferreteriaN4.js';
import { tuneQuePerro, buildQuePerro } from '../../quePerro.js';
import { tuneTintaSmile, buildTintaSmile } from '../../tintaSmile.js';
import { tuneMillerlandi, buildMillerlandi } from '../../millerlandi.js';
import { tuneFarmaciaTenorio, buildFarmaciaTenorio } from '../../farmaciaTenorio.js';
import { tuneFarmaciaMartinCapote, buildFarmaciaMartinCapote } from '../../farmaciaMartinCapote.js';
import { tunePlataReguera, buildPlataReguera } from '../../plataReguera.js';
import { tuneIocClinicaDental, buildIocClinicaDental } from '../../iocClinicaDental.js';
import { tunePodoDent, buildPodoDent } from '../../podoDent.js';
import { tuneVegasLaundry, buildVegasLaundry } from '../../vegasLaundry.js';
import { tuneTomSmith, buildTomSmith } from '../../tomSmith.js';
import { tuneSalsero, buildSalsero } from '../../salsero.js';
import { tuneBarCostaRica, buildBarCostaRica } from '../../barCostaRica.js';
import { tuneJufu, buildJufu } from '../../jufu.js';
import { tuneMinimarketSol, buildMinimarketSol } from '../../minimarketSol.js';
import { tuneCleanGo, buildCleanGo } from '../../cleanGo.js';
import { tuneElJolatero, buildElJolatero } from '../../elJolatero.js';
import { tuneLanzapesca, buildLanzapesca } from '../../lanzapesca.js';
import { tuneElTrueque, buildElTrueque } from '../../elTrueque.js';
import { tuneCapiBlas, buildCapiBlas } from '../../capiBlas.js';
import { tuneLander, buildLander } from '../../lander.js';
import { tuneCasaEmiliano, buildCasaEmiliano } from '../../casaEmiliano.js';
import { tuneFarmaciaMayor, buildFarmaciaMayor } from '../../farmaciaMayor.js';
import { tuneLaLuna, buildLaLuna } from '../../laLuna.js';
import { tuneCasaVictor, buildCasaVictor } from '../../casaVictor.js';
import { tuneStudioMK, buildStudioMK } from '../../studioMK.js';
import { tuneRocasa, buildRocasa } from '../../rocasa.js';
import { tuneIsorlan, buildIsorlan } from '../../isorlan.js';
import { tuneLStyle, buildLStyle } from '../../lstyle.js';
import { tuneRinconFajardo, buildRinconFajardo } from '../../rinconFajardo.js';
import { tuneHongKong, buildHongKong } from '../../hongKong.js';
import { tunePizzeriaVenezia, buildPizzeriaVenezia } from '../../pizzeriaVenezia.js';
import { tuneKebabLanzarote, buildKebabLanzarote } from '../../kebabLanzarote.js';
import { tuneLaZumeria, buildLaZumeria } from '../../laZumeria.js';
// lo de después de La Zumería va en masLugares2.js (VERSION_WEB_94i en adelante)
import { tuneMasLugares2, buildMasLugares2 } from './masLugares2.js';

export function tuneMasLugares(map) {
  // el Bar Andalucía 1960 y Barbacana, en la calle de detrás de la iglesia de San Ginés
  tuneLocalesSanGines(map);
  // el restaurante La Puntilla, en el paseo, y el Bar Enrique, en la calle Academia
  tuneLocalesPuntilla(map);
  // Mawi (en el paseo, al lado de El Velero), el Bar Cafetería Guanapay y Antípoda
  tuneLocalesVarios(map);
  // La Rústica, en la esquina de Blas Cabrera Felipe
  tuneLaRustica(map);
  // el restaurante Gambrinus, en los soportales de la avenida Fred Olsen
  tuneGambrinus(map);
  // el faldón con el nombre de La Cervecería, encima de sus terrazas de la plaza del Reducto
  tuneLaCerveceria(map);
  // la cafetería y panadería Mi Niña, en la calle Canalejas
  tuneMiNina(map);
  // la heladería Fresco d'Italia, en la avenida Doctor Rafael González
  tuneFrescoItalia(map);
  // la panadería y cafetería Lolita, enfrente
  tuneLolita(map);
  // la terraza de El Velero del Charco, al pasaje El Velero
  tuneElVelero(map);
  // la cantina mexicana La Lupe, en la casa de piedra de la calle La Porra
  tuneLaLupe(map);
  // Mini & Gastón, comidas y postres para llevar, en la calle Manolo Millares
  tuneMiniGaston(map);
  // el Bar & Restaurant Asturias y su terraza, en la placita de Almirante Boado Endeiza
  tuneBarAsturias(map);
  // Papa Miguel y su terraza, en el paseo del Charco (al oeste de Mawi)
  tunePapaMiguel(map);
  // el bar El Rincón Granaíno, en la esquina de la calle Alicante
  tuneRinconGranaino(map);
  // La Despensita, café y migas, en la esquina de Emilio Ley con García de Hita
  tuneLaDespensita(map);
  // La Tentación, en la fachada que da a la plaza de la iglesia de San Ginés
  tuneLaTentacion(map);
  // la Cafetería El Aborigen y su pérgola, en la plaza de Ruperto González Negrín
  tuneElAborigen(map);
  // el bar La Caribeña, la casa terrera blanca y azul de la calle Doctor Juan Negrín
  tuneLaCaribena(map);
  // la esquina de la Pescadería Municipal, junto al paseo de la avenida
  tunePescaderia(map);
  // la Librería El Puente, al lado de Barbacana
  tuneLibreriaElPuente(map);
  // La Platanera, el supermercado bio de la calle Nicolás Martín Cabrera
  tuneLaPlatanera(map);
  // la Óptica Pérez-Durán, en la esquina de Coronel Bens con Manolo Millares
  tuneOpticaPerezDuran(map);
  // la entrada del Hotel Residencia Cardona, en la calle Democracia
  tuneHotelCardona(map);
  // la Ferretería N4, en Coronel Bens junto a la esquina de Igualdad
  tuneFerreteriaN4(map);
  // QuePerro!, la veterinaria y peluquería canina de la calle Doctor Juan Negrín
  tuneQuePerro(map);
  // Tinta Smile, la tienda de tintas y papelería de la calle La Inés
  tuneTintaSmile(map);
  // el Centro de Belleza Millerlandi, en la calle La Inés
  tuneMillerlandi(map);
  // la Farmacia Tenorio, la casa antigua de la calle León y Castillo
  tuneFarmaciaTenorio(map);
  // la Farmacia Martín Capote, la de mármol verde de la calle Fajardo
  tuneFarmaciaMartinCapote(map);
  // la Clínica Dental Plata & Reguera, el edificio blanco de la avenida Coll
  tunePlataReguera(map);
  // IOC Clínica Dental, en la esquina de Triana con Paraguay
  tuneIocClinicaDental(map);
  // PodoDent, la clínica de los vinilos morados de la calle Cuba
  tunePodoDent(map);
  // la lavandería Vegas Laundry, en la calle Blas Cabrera Topham
  tuneVegasLaundry(map);
  // la Zapatería Tom Smith, en la calle León y Castillo
  tuneTomSmith(map);
  // el bar El Salsero, en la esquina de Lebrillo con Santander
  tuneSalsero(map);
  // el Bar Costa Rica, en la calle Puerto Rico junto a la esquina con Costa Rica
  tuneBarCostaRica(map);
  // Jufu, el restaurante chino de buffet libre de la calle Guenia
  tuneJufu(map);
  // el Minimarket Sol Lanzarote, en la calle Coronel Bens enfrente de la Ferretería N4
  tuneMinimarketSol(map);
  // la lavandería autoservicio Clean&Go Bello Lanzarote, en la calle Francos
  tuneCleanGo(map);
  // El Jolatero, en la calle La Coruña frente al Charco
  tuneElJolatero(map);
  // la Pescadería Lanzapesca, en la calle Pérez Galdós
  tuneLanzapesca(map);
  // El Trueque, la tienda de compraventa y casa de empeños de la calle Fajardo
  tuneElTrueque(map);
  // el Restaurante Capi Blas, hamburguesería y pizzería de la avenida Doctor Rafael González
  tuneCapiBlas(map);
  // la Cafetería Restaurante Lander, en la Rambla Medular (al borde del barrio, junto a San Francisco Javier)
  tuneLander(map);
  // Casa Emiliano, el café bar de la calle Democracia 30
  tuneCasaEmiliano(map);
  // la Farmacia David Mayor Gomà, en la calle Luis Morote (su rótulo del mapa llevaba el nombre de la Farmacia Tenorio)
  tuneFarmaciaMayor(map);
  // el Restaurante La Luna (La Destiladera La Luna), en la esquina de la calle Pedro Barba
  tuneLaLuna(map);
  // el Restaurante Casa Víctor, en la esquina de Esperanza con Luis Morote (y la fachada ocre de su bloque)
  tuneCasaVictor(map);
  // Studio MK, la barbería de la avenida Alcalde Ginés de la Hoz 2
  tuneStudioMK(map);
  // Rocasa, la tienda de menaje de la esquina de León y Castillo con Emilio Ley
  tuneRocasa(map);
  // la Joyería Isorlan (Compro Oro), en la esquina de Hermanos Zerolo con León y Castillo
  tuneIsorlan(map);
  // L'Style Bar y su terraza, en la calle Hermanos Zerolo
  tuneLStyle(map);
  // El Rincón de Fajardo, el bar de la calle Fajardo 37
  tuneRinconFajardo(map);
  // el Hong Kong, el restaurante chino de buffet libre de la avenida Doctor Rafael González
  tuneHongKong(map);
  // la Pizzería Venezia y su terraza, en la esquina de la avenida Fred Olsen 1
  tunePizzeriaVenezia(map);
  // el Kebab Lanzarote, al lado de la Pizzería Venezia
  tuneKebabLanzarote(map);
  // La Zumería y su terraza, en la plazoleta de la calle Hermanos Zerolo junto a Fajardo
  tuneLaZumeria(map);
  // y lo que va en masLugares2.js
  tuneMasLugares2(map);
}

export function buildMasLugares(scene, colliders, map, locales) {
  return {
    localesSanGines: buildLocalesSanGines(scene, colliders, map, locales),
    localesPuntilla: buildLocalesPuntilla(scene, colliders, map, locales),
    localesVarios: buildLocalesVarios(scene, colliders, map, locales),
    laRustica: buildLaRustica(scene, colliders, map),
    gambrinus: buildGambrinus(scene, colliders, map, locales),
    laCerveceria: buildLaCerveceria(scene, colliders, map),
    miNina: buildMiNina(scene, colliders, map),
    frescoItalia: buildFrescoItalia(scene, colliders, map, locales),
    lolita: buildLolita(scene, colliders, map),
    elVelero: buildElVelero(scene, colliders, map, locales),
    laLupe: buildLaLupe(scene, colliders, map),
    miniGaston: buildMiniGaston(scene, colliders, map),
    barAsturias: buildBarAsturias(scene, colliders, map, locales),
    papaMiguel: buildPapaMiguel(scene, colliders, map, locales),
    rinconGranaino: buildRinconGranaino(scene, colliders, map),
    laDespensita: buildLaDespensita(scene, colliders, map),
    laTentacion: buildLaTentacion(scene, colliders, map, locales),
    elAborigen: buildElAborigen(scene, colliders, map, locales),
    laCaribena: buildLaCaribena(scene, colliders, map),
    pescaderia: buildPescaderia(scene, colliders, map),
    libreriaElPuente: buildLibreriaElPuente(scene, colliders, map),
    laPlatanera: buildLaPlatanera(scene, colliders, map),
    opticaPerezDuran: buildOpticaPerezDuran(scene, colliders, map),
    hotelCardona: buildHotelCardona(scene, colliders, map),
    ferreteriaN4: buildFerreteriaN4(scene, colliders, map),
    quePerro: buildQuePerro(scene, colliders, map),
    tintaSmile: buildTintaSmile(scene, colliders, map),
    millerlandi: buildMillerlandi(scene, colliders, map),
    farmaciaTenorio: buildFarmaciaTenorio(scene, colliders, map),
    farmaciaMartinCapote: buildFarmaciaMartinCapote(scene, colliders, map),
    plataReguera: buildPlataReguera(scene, colliders, map),
    iocClinicaDental: buildIocClinicaDental(scene, colliders, map),
    podoDent: buildPodoDent(scene, colliders, map),
    vegasLaundry: buildVegasLaundry(scene, colliders, map),
    tomSmith: buildTomSmith(scene, colliders, map),
    salsero: buildSalsero(scene, colliders, map),
    barCostaRica: buildBarCostaRica(scene, colliders, map),
    jufu: buildJufu(scene, colliders, map),
    minimarketSol: buildMinimarketSol(scene, colliders, map),
    cleanGo: buildCleanGo(scene, colliders, map),
    elJolatero: buildElJolatero(scene, colliders, map),
    lanzapesca: buildLanzapesca(scene, colliders, map),
    elTrueque: buildElTrueque(scene, colliders, map),
    capiBlas: buildCapiBlas(scene, colliders, map),
    lander: buildLander(scene, colliders, map),
    casaEmiliano: buildCasaEmiliano(scene, colliders, map),
    farmaciaMayor: buildFarmaciaMayor(scene, colliders, map),
    laLuna: buildLaLuna(scene, colliders, map),
    casaVictor: buildCasaVictor(scene, colliders, map),
    studioMK: buildStudioMK(scene, colliders, map),
    rocasa: buildRocasa(scene, colliders, map),
    isorlan: buildIsorlan(scene, colliders, map),
    lstyle: buildLStyle(scene, colliders, map),
    rinconFajardo: buildRinconFajardo(scene, colliders, map),
    hongKong: buildHongKong(scene, colliders, map),
    pizzeriaVenezia: buildPizzeriaVenezia(scene, colliders, map),
    kebabLanzarote: buildKebabLanzarote(scene, colliders, map),
    laZumeria: buildLaZumeria(scene, colliders, map),
    ...buildMasLugares2(scene, colliders, map),
  };
}
