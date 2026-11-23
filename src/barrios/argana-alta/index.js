/**
 * ARGANA ALTA — el barrio del noroeste (hospital, Palacio de los Deportes, CEO Argana,
 * HiperDino de la Calle Tenderete).
 *
 * Límites en metros del juego: x de -2617 a -1003, z de -2434 a -840.
 * Ficha completa: ./LEEME.md
 */

import { tuneHiperdinoArgana, buildHiperdinoArgana } from '../../hiperdinoArgana.js';
import { tuneCentroComercialArgana, buildCentroComercialArgana } from '../../centroComercialArgana.js';
import { tuneIndustriasRosa, buildIndustriasRosa } from '../../industriasRosa.js';
import { tuneMcDonaldsArgana, buildMcDonaldsArgana } from '../../mcdonaldsArgana.js';
import { buildGasolineraTenderete } from '../../gasolineraTenderete.js';
import { tuneLidlRepsol, buildLidlRepsol } from '../../lidlRepsol.js';
import { buildAparcamientosTenderete } from '../../aparcamientosTenderete.js';
import { buildBazarArgana } from '../../bazarArgana.js';
import { tuneItvArgana, buildItvArgana } from '../../itvArgana.js';
import { buildAparcamientoHospital } from '../../hospitalAparcamiento.js';
import { tuneHospitalTrasera, buildHospitalTrasera } from '../../hospitalTrasera.js';
import { tuneHospitalEntradaTrasera, buildHospitalEntradaTrasera } from '../../hospitalEntradaTrasera.js';
import { buildRotulosTenderete } from '../../rotulosTenderete.js';
import { tuneCcArgana, buildCcArgana } from '../../ccArgana.js';
import { buildRotulosArgana } from '../../rotulosArgana.js';
import { tuneMarquesinasMercadona, buildMarquesinasMercadona } from '../../mercadonaMarquesinas.js';
import { tuneArganaFaltaba, buildArganaFaltaba } from '../../arganaFaltaba.js';
import { tuneCalleTanganillo } from '../../calleTanganillo.js';
import { tuneRellenoArgana } from '../../rellenoArgana.js';
import { tuneOrtopediaCarmen, buildOrtopediaCarmen } from '../../ortopediaCarmen.js';
import { tuneDosCabras, buildDosCabras } from '../../dosCabras.js';
import { tuneFontanalesArgana, buildFontanalesArgana } from '../../fontanalesArgana.js';
import { tuneArepasFactory, buildArepasFactory } from '../../arepasFactory.js';
import { desnivelesArganaAlta } from '../../desniveles/argana-alta.js';
import { tuneHospitalMolinaOrosa, buildHospitalMolinaOrosa } from '../../hospitalMolinaOrosa.js';
import { tunePalacioDeportes, buildPalacioDeportes } from '../../palacioDeportes.js';
import { tuneTendereteAvenida, buildTendereteAvenida } from '../../tendereteAvenida.js';
import { tuneCalles } from './calles.js';
import { tuneArriba } from './arriba.js';
import { tuneAbajo2 } from './abajo2.js';
import { tuneResto } from './resto.js';
import { tuneAbajo3 } from './abajo3.js';

export const BARRIO = {
  id: 'argana-alta',
  nombre: 'Argana Alta',
  caja: { x0: -2617, x1: -1003, z0: -2434, z1: -840 },
};

/** retoques al mapa antes de levantar la ciudad */
export function prepararMapa(map) {
  // las cuestas bruscas del barrio, suavizadas (antes que nada)
  map.desnivelesArgana = desnivelesArganaAlta();
  // el HiperDino de la Calle Tenderete: su nave trae modelo propio (hiperdinoArgana.js)
  tuneHiperdinoArgana(map);
  // el Parque Comercial de Argana (el MediaMarkt y sus palmeras) y la ferretería de Iguazú
  tuneCentroComercialArgana(map);
  tuneIndustriasRosa(map);
  // el McDonald's de la zona del centro comercial: su parcela trae local propio
  tuneMcDonaldsArgana(map);
  // el Lidl de la carretera de San Bartolomé y la Repsol de al lado: la marquesina no es un edificio
  tuneLidlRepsol(map);
  // el Centro Comercial Argana y las naves de Deko Hogar y Kiwoko: no venían en el mapa
  tuneCcArgana(map);
  // las marquesinas del aparcamiento del Mercadona de abajo: no son bloques de pisos
  tuneMarquesinasMercadona(map);
  // las naves que faltaban en el mapa (comparado con la foto oficial)
  tuneArganaFaltaba(map);
  // la ITV de la subida a San Bartolomé: fuera el bloque genérico de su nave
  tuneItvArgana(map);
  // el atajo real del camino de tierra a la Calle Tenderete, que faltaba en el mapa
  tuneCalleTanganillo(map);
  // la franja de calles y casas entre la Calle Luján Pérez y el campo de arriba, que faltaba (era todo arena)
  tuneRellenoArgana(map);
  // la Ortopedia Carmen, en la carretera de San Bartolomé: fuera su rótulo genérico
  tuneOrtopediaCarmen(map);
  // la fábrica de cerveza Dos Cabras, en la carretera de San Bartolomé junto a la LZ-20: fuera su rótulo genérico
  tuneDosCabras(map);
  // la Churrería Fontanales de la calle Tajaraste: fuera su rótulo genérico (y su terraza genérica: lleva la suya)
  tuneFontanalesArgana(map);
  // el Arepa's Factory, en la esquina de la calle Polca 16: fuera su rótulo genérico (y su terraza genérica: lleva la suya)
  tuneArepasFactory(map);
  // el Hospital Molina Orosa: el bloque blanco a su altura y fuera el rótulo con el nombre viejo
  tuneHospitalMolinaOrosa(map);
  // la parte de atrás del hospital (calle Santiago Alemán): foto aérea de suelo y los coches de sus aparcamientos
  tuneHospitalTrasera(map);
  // la entrada de atrás: el pabellón se echa atrás para dejar sitio al vial de la puerta
  tuneHospitalEntradaTrasera(map);
  // el Palacio de Deportes de la calle Seguidilla: la caja alta de chapa gris a su altura
  tunePalacioDeportes(map);
  // calle a calle con las vistas de la calle (kitCalles.js de Altavista): la parte de abajo, junto a Titerroy
  tuneCalles(map);
  // lo mismo en la parte de arriba (Seguidilla, Mazurca, Polca, Saltona, Malagueña, Isa, Folias, Zaranda...)
  tuneArriba(map);
  tuneAbajo2(map);
  tuneAbajo3(map);
  // el resto de las calles de casas, con el patrón del barrio
  tuneResto(map);
  // la Calle Tenderete, de la circunvalación a la rotonda de la Repsol: avenida con mediana y coches aparcados
  tuneTendereteAvenida(map);
  // ajustar rutas: marcar carreteras principales para rutas más cortas
  const roads = map.roads || [];
  for (const r of roads) {
    // Carretera principal Argana-Alta: route from HiperDino to track
    if (r.name && /San Bartolome|San Bartholome/i.test(r.name)) {
      r.major = 1;
    }
    // Secundarias que conectan HiperDino con la zona norte
    if (r.name && /Tenderete|iguazú/i.test(r.name)) {
      r.major = 1;
    }
    // Adicionales: caminos y tracks que conectan el diseminado con la zona urbana
    if (r.name && /Tajaraste/i.test(r.name)) {
      r.major = 1;
    }
  }
}

/** primera fase: antes de crear los locales */
export function construir({ scene, colliders, map }) {
  // el supermercado HiperDino Argana, con su aparcamiento, las lamas y el paso de cebra
  buildHiperdinoArgana(scene, colliders);
  // el escaparate del MediaMarkt en el testero de la nave, con su aparcamiento
  buildCentroComercialArgana(scene, colliders);
  // la ferretería del rótulo naranja y verde, en la Calle Iguazú
  buildIndustriasRosa(scene, colliders);
  // el McDonald's de la esquina del centro comercial
  buildMcDonaldsArgana(scene, colliders);
  // lo que faltaba del solar de la Repsol del arranque del circuito
  buildGasolineraTenderete(scene, colliders, map);
  // el Lidl (entrada y rótulo) y su gasolinera Repsol con el lavadero de coches
  buildLidlRepsol(scene, colliders, map);
  // los aparcamientos con sus plazas (McDonald's, Burger King, Decathlon y Mercadona) y los carriles de autoservicio
  buildAparcamientosTenderete(scene, map);
  // el bazar de la esquina de la carretera de San Bartolomé con Tomás Morales, frente al C.C. Argana
  buildBazarArgana(scene, colliders);
  // la estación de ITV, entre la carretera de San Bartolomé y el hospital
  buildItvArgana(scene, colliders);
  // la mediana, las farolas y las rayas de la avenida de la Calle Tenderete
  buildTendereteAvenida(scene, colliders, map);
  // los aparcamientos del hospital Molina Orosa: delante de la fachada y la explanada de abajo
  buildAparcamientoHospital(scene, map);
  // los aparcamientos de detrás del hospital, del lado de la calle Santiago Alemán
  buildHospitalTrasera(scene, map);
  // el vial, el murete con la barandilla verde, la marquesina y los lucernarios de la entrada de atrás
  buildHospitalEntradaTrasera(scene, colliders, map);
  // los rótulos que faltaban en la calle Tenderete: la farmacia de la esquina con Saltona y la cafetería de la Repsol
  buildRotulosTenderete(scene, map);
  // el Centro Comercial Argana (con su aparcamiento y sus tiendas), Deko Hogar y Kiwoko
  buildCcArgana(scene, colliders, map);
  // los rótulos de los demás negocios de la zona comercial de Argana
  buildRotulosArgana(scene, map);
  // las tres marquesinas de sombra del aparcamiento del Mercadona de abajo
  buildMarquesinasMercadona(scene, colliders, map);
  // la depuradora de detrás del Decathlon: los depósitos redondos y la balsa
  buildArganaFaltaba(scene, colliders);
  // la Ortopedia Carmen (foto de julio de 2019): el recerco de granito, el marco rojo y el rótulo con el árbol
  buildOrtopediaCarmen(scene, colliders, map);
  // la nave de Dos Cabras (vista de la calle de julio de 2025): la pared blanca alta, el portón con la cabra y la puerta pequeña
  buildDosCabras(scene, colliders, map);
  // la Churrería Fontanales de la calle Tajaraste (foto de agosto de 2016): la terraza cerrada naranja y el letrero azul
  buildFontanalesArgana(scene, colliders, map);
  // el Arepa's Factory (vista de la calle de julio de 2025): los letreros negros, la ventana y la terraza del toldo azul
  buildArepasFactory(scene, colliders, map);
  // el Hospital Molina Orosa (vista de la calle de julio de 2025): logias, arcos, ventanas verdes, la carpa y las banderas
  buildHospitalMolinaOrosa(scene, colliders, map);
  // el Palacio de Deportes (vista de la calle de julio de 2025): zócalo, chapa, ventanales, letras azules y la torre de cristal
  buildPalacioDeportes(scene, colliders, map);

  return {};
}
