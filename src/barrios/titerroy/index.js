/**
 * TITERROY — el barrio del norte del centro (antes «Titerroe»).
 *
 * Límites en metros del juego: x de -1232 a -25, z de -1382 a -364.
 * Ficha completa: ./LEEME.md
 */

import { tuneDelegacion, buildDelegacion } from '../../delegacion.js';
import { tuneLaGuinda, buildLaGuinda } from '../../laGuinda.js';
import { tuneFontanales, buildFontanales } from '../../fontanales.js';
import { tuneFarmaciaPerdomo, buildFarmaciaPerdomo } from '../../farmaciaPerdomo.js';
import { tuneFarmaciaTiterroy, buildFarmaciaTiterroy } from '../../farmaciaTiterroy.js';
import { tuneSupermercadoGranill, buildSupermercadoGranill } from '../../supermercadoGranill.js';
import { tuneMastik, buildMastik } from '../../mastik.js';
import { tuneMinimarketNazaret, buildMinimarketNazaret } from '../../minimarketNazaret.js';
import { tuneElDetalleIdeal, buildElDetalleIdeal } from '../../elDetalleIdeal.js';
import { tuneBarCarlosIII, buildBarCarlosIII } from '../../barCarlosIII.js';
import { tuneAsaderoTiterroy, buildAsaderoTiterroy } from '../../asaderoTiterroy.js';
import { tunePasteleriaZayes, buildPasteleriaZayes } from '../../pasteleriaZayes.js';
import { tuneCaPuchi, buildCaPuchi } from '../../caPuchi.js';
import { tunePuntaCana, buildPuntaCana } from '../../puntaCana.js';
import { tuneLaDona, buildLaDona } from '../../laDona.js';
import { tuneElPingui, buildElPingui } from '../../elPingui.js';
import { tuneEstacionGuaguas, buildEstacionGuaguas } from '../../estacionGuaguas.js';
import { desnivelesTiterroy } from '../../desniveles/titerroy.js';
import { tuneCentroSaludTiterroy, buildCentroSaludTiterroy } from '../../centroSaludTiterroy.js';
import { tunePabellonTiterroy, buildPabellonTiterroy } from '../../pabellonTiterroy.js';
import { tuneIesCesarManrique, buildIesCesarManrique } from '../../iesCesarManrique.js';
import { tuneEste } from './este.js';
import { tuneCentro } from './centro.js';
import { tuneOeste } from './oeste.js';
import { tuneLejano } from './lejano.js';
import { tuneNorte } from './norte.js';
import { tuneSur } from './sur.js';

export const BARRIO = {
  id: 'titerroy',
  nombre: 'Titerroy',
  caja: { x0: -1232, x1: -25, z0: -1382, z1: -364 },
};

/** retoques al mapa antes de levantar la ciudad */
export function prepararMapa(map) {
  // las cuestas bruscas del barrio, suavizadas (antes que nada; el estadio no se toca)
  map.desnivelesTiterroy = desnivelesTiterroy();
  // la Delegación del Gobierno (Extranjería) en Blas Cabrera Felipe
  tuneDelegacion(map);
  // la Panadería y Dulcería La Guinda, en la calle José Pereyra Galviaty: fuera su rótulo genérico
  tuneLaGuinda(map);
  // la Churrería Cafetería Fontanales, en la esquina de Carlos III con la avenida Eugenio Rijo Rocha
  tuneFontanales(map);
  // la Farmacia Perdomo González, en la calle José Pereyra Galviaty 31: fuera su rótulo genérico
  tuneFarmaciaPerdomo(map);
  // la Farmacia Titerroy, en la avenida Hernández Pacheco 13: fuera su rótulo genérico, que estaba mal puesto en la calle Gusa
  tuneFarmaciaTiterroy(map);
  // el Supermercado Granill, en la esquina de Carlos III con José Pereyra Galviaty: fuera su rótulo genérico
  tuneSupermercadoGranill(map);
  // Mastik Salchipapas, en la calle Doctor Juan Negrín 103: fuera su rótulo genérico (y su terraza genérica)
  tuneMastik(map);
  // el Minimarket Nazaret, en la calle Alcalde Lorenzo Cabrera 5: fuera su rótulo genérico
  tuneMinimarketNazaret(map);
  // El Detalle Ideal, en la calle La Carmen 5: fuera su rótulo genérico, que estaba en la otra cara de la manzana
  tuneElDetalleIdeal(map);
  // el Bar Carlos III, cocina peruana, en la calle Carlos III 67 (el mapa no tenía rótulo suyo)
  tuneBarCarlosIII(map);
  // el Asadero de Pollos Titerroy, en la calle Alcalde Lorenzo Cabrera 19 (el mapa no tenía rótulo suyo)
  tuneAsaderoTiterroy(map);
  // la Pastelería Zayes, en la avenida Eugenio Rijo Rocha 40 (el mapa no tenía rótulo suyo)
  tunePasteleriaZayes(map);
  // el Restaurante Ca'Puchi, de perritos calientes, en la calle Doctor Gregorio Marañón 5 (el mapa no tenía rótulo suyo)
  tuneCaPuchi(map);
  // el Bar Cafetería D.R. Punta Cana, en la calle la Férmina 2 (el mapa no tenía rótulo suyo)
  tunePuntaCana(map);
  // la Estación de Guaguas de Arrecife, en la Rambla Medular esquina a La Férmina
  tuneEstacionGuaguas(map);
  // la Cafetería Pastelería La Dona, en la avenida Hernández Pacheco 11, al lado de la Farmacia Titerroy (Google la llama Los Valles)
  tuneLaDona(map);
  // el Bar Cafetería El Pingüi, en la calle Tinamala, al lado del portal del 28 (el mapa no tenía rótulo suyo)
  tuneElPingui(map);
  // el Centro de Salud de Titerroy (calle Doctor Juan Negrín): el bloque a su altura y color crema
  tuneCentroSaludTiterroy(map);
  tunePabellonTiterroy(map);
  tuneIesCesarManrique(map);
  // calle a calle con las vistas de la calle (kitCalles.js de Altavista): el borde este
  tuneEste(map);
  tuneCentro(map);
  tuneOeste(map);
  tuneLejano(map);
  tuneNorte(map);
  tuneSur(map);
}

/** primera fase: antes de crear los locales */
export function construir({ scene, map, colliders }) {
  // la Delegación del Gobierno (balcón verde, portada de dos arcos, almenas y banderas)
  buildDelegacion(scene, colliders);
  // la Panadería La Guinda (foto de agosto de 2022): el toldo naranja, el letrero de colores y el portal 12
  buildLaGuinda(scene, colliders, map);
  // la Churrería Fontanales (foto de mayo de 2018): el toldo naranja largo, la terraza cerrada y los laureles
  buildFontanales(scene, colliders, map);
  // la Farmacia Perdomo González (fotos de 2018 y 2021): las letras verdes, la entrada de cristal, el portal y la cruz
  buildFarmaciaPerdomo(scene, colliders, map);
  // la Farmacia Titerroy (fotos de 2019 y 2022): la banda blanca con «farmacia titerroy» en verde y el frente de aluminio
  buildFarmaciaTiterroy(scene, colliders, map);
  // el Supermercado Granill (vista de la calle de julio de 2025): el letrero rojo, la puerta estrecha y las verduras pintadas
  buildSupermercadoGranill(scene, colliders, map);
  // Mastik Salchipapas (vista de la calle de julio de 2025): la franja roja, el local de los carteles, el portal y la persiana
  buildMastik(scene, colliders, map);
  // el Minimarket Nazaret (vista de la calle de julio de 2025): el letrero de las verduras, las rejas blancas y el portal del 5
  buildMinimarketNazaret(scene, colliders, map);
  // El Detalle Ideal (vista de la calle de julio de 2025): el granito gris, el escaparate de las franjas rosa y menta y el portal del 5
  buildElDetalleIdeal(scene, colliders, map);
  // el Bar Carlos III (vista de la calle de julio de 2025): la persiana, la banda roja de las letras de colores y el cartel redondo
  buildBarCarlosIII(scene, colliders, map);
  // el Asadero de Pollos Titerroy (vista de la calle de julio de 2025): la piedra beige, la cornisa roja y el letrero del pollo
  buildAsaderoTiterroy(scene, colliders, map);
  // la Pastelería Zayes (vista de la calle de julio de 2025): el toldo rosa abovedado, la terraza blanca y el muro beige
  buildPasteleriaZayes(scene, colliders, map);
  // el Restaurante Ca'Puchi (vista de la calle de julio de 2025): las persianas blancas, el toldo, la valla de aspas y el perrito gigante
  buildCaPuchi(scene, colliders, map);
  // el Bar Punta Cana (vista de la calle de julio de 2025): el toldo verde, la caseta de madera de la terraza y el minimarket de al lado
  buildPuntaCana(scene, colliders, map);
  // La Dona (vista de la calle de julio de 2025): el letrero de cuadritos azules con el dónut, el toldo de rayas y la terraza
  buildLaDona(scene, colliders, map);
  // El Pingüi (vista de la calle de julio de 2025): el letrero redondo del pingüino, las rejas negras abiertas y los cuerpos de granito de arriba
  buildElPingui(scene, colliders, map);
  // la Estación de Guaguas (vista de la calle de julio de 2025): la franja de colores, el portal rojo y las letras
  buildEstacionGuaguas(scene, colliders, map);
  // el Centro de Salud de Titerroy (vista de la calle de julio de 2025): bloque gris, paneles crema y contraventanas verdes
  buildCentroSaludTiterroy(scene, colliders, map);
  buildPabellonTiterroy(scene, colliders, map);
  buildIesCesarManrique(scene, colliders, map);

  return {};
}
