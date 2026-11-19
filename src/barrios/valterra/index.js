/**
 * VALTERRA — el barrio del noreste, desde la Escuela de Pesca y el Hospital Insular hasta
 * el Castillo de San José (el MIAC) y su explanada.
 *
 * Límites en metros del juego: x de 100 a 988, z de -706 a 38, más el Castillo de San José
 * y su explanada (sobre x 1550-1700, z -1050 a -900).
 * Ficha completa: ./LEEME.md
 */

import { tuneEscuelaPesca, buildEscuelaPesca } from '../../escuelaPesca.js';
import { buildEscuelaMar } from '../../escuelaMar.js';
import { buildParkingMedicos } from '../../parkingMedicos.js';
import { buildParqueHospital } from '../../parqueHospital.js';
import { buildHospitalInsular, HOSPITAL_SPOTS } from '../../hospitalInsular.js';
import { buildParqueDino } from '../../parqueDino.js';
import { tuneComisaria, buildComisaria } from '../../comisaria.js';
import { tuneCastilloSanJose, buildCastilloSanJose } from '../../castilloSanJose.js';
import { tuneTanatorio, buildTanatorioFacade } from '../../localesData.js';
import { buildTanatorioRoof } from '../../tanatorioAzotea.js';
import { buildTanatorioEntorno } from '../../tanatorioEntorno.js';
import { tuneLocalesTanatorio, buildLocalesTanatorio } from '../../localesTanatorio.js';
import { tuneLaEstacion, buildLaEstacion } from '../../laEstacion.js';
import { tuneLaVela, buildLaVela } from '../../laVela.js';
import { tuneLaCorona, buildLaCorona } from '../../laCorona.js';
import { buildPaseoMarina } from '../../paseoMarina.js';
import { tuneTerali, buildTerali } from '../../terali.js';
import { buildPantalanesMarina } from '../../pantalanesMarina.js';
import { tunePlazaMarina, buildPlazaMarina } from '../../plazaMarina.js';
import { tuneKarma, buildKarma } from '../../karma.js';
import { tuneIntrigo, buildIntrigo } from '../../intrigo.js';
import { tunePasarelaMarina, buildPasarelaMarina } from '../../pasarelaMarina.js';
import { tuneEdificiosMarina } from '../../edificiosMarina.js';
import { tuneVaraderoMarina, buildVaraderoMarina } from '../../varaderoMarina.js';
import { tuneDiqueMarina, buildDiqueMarina } from '../../diqueMarina.js';
import { tuneAparcamientosMarina, buildAparcamientosMarina } from '../../aparcamientosMarina.js';
import { tuneBahiaDeNao, buildBahiaDeNao } from '../../bahiaDeNao.js';
import { tuneElTelamon, buildElTelamon } from '../../elTelamon.js';
import { tuneAlisKebab, buildAlisKebab } from '../../alisKebab.js';
import { tunePasaPaDentro, buildPasaPaDentro } from '../../pasaPaDentro.js';
import { tuneBarTarragona, buildBarTarragona } from '../../barTarragona.js';
import { tuneBarNoray, buildBarNoray } from '../../barNoray.js';
import { tuneCostaAzulSushi, buildCostaAzulSushi } from '../../costaAzulSushi.js';
import { tuneCentroSaludValterra, buildCentroSaludValterra } from '../../centroSaludValterra.js';
import { tuneUrgenciasValterra, buildUrgenciasValterra } from '../../urgenciasValterra.js';
import { tuneEsquinaCaceres, buildEsquinaCaceres } from '../../esquinaCaceres.js';
import { tunePerezGaldos94, buildPerezGaldos94 } from '../../perezGaldos94.js';
import { tuneCasasMarina, buildCasasMarina } from '../../casasMarina.js';
import { tuneCasasClavijo, buildCasasClavijo } from '../../casasClavijo.js';
import { tuneClavijoNorte, buildClavijoNorte } from '../../clavijoNorte.js';
import { tuneRamblaMedular, buildRamblaMedular } from './ramblaMedular.js';
import { desnivelesValterra } from '../../desniveles/valterra.js';

export const BARRIO = {
  id: 'valterra',
  nombre: 'Valterra',
  caja: { x0: 100, x1: 1700, z0: -1050, z1: 38 },
};

/** retoques al mapa antes de levantar la ciudad */
export function prepararMapa(map) {
  // el hoyo de la calle Badajoz, el bulto de La Mercedes y las cuestas bruscas (antes que nada)
  map.desnivelesValterra = desnivelesValterra();
  // el tanatorio es una casa terrera blanca de una planta
  tuneTanatorio(map);
  // la Comisaría de la calle Timón
  tuneComisaria(map);
  // el Castillo de San José: fuera el castillo genérico, que trae su propio modelo
  tuneCastilloSanJose(map);
  // la Escuela de Pesca: tres plantas, blanca (escuelaPesca.js pone el extremo de la foto)
  tuneEscuelaPesca(map);
  // las plazas del aparcamiento del Hospital Insular, para que parked.js aparque coches en ellas
  map.lotSpots?.push(...HOSPITAL_SPOTS);
  // la calle del tanatorio (Juan de Quesada): el solar de la esquina de Ingeniero Paz Peraza sale del bloque
  tuneLocalesTanatorio(map);
  // el Bar Cafetería La Estación, en la nave de la calle Velacho (fuera su rótulo y su terraza genérica)
  tuneLaEstacion(map);
  // La Vela Café, en el centro comercial de la Marina Lanzarote
  tuneLaVela(map);
  // la bombonería La Corona, en el paseo de tiendas de la Marina Lanzarote
  tuneLaCorona(map);
  // la zapatería Terali, en el paseo de la Marina Lanzarote
  tuneTerali(map);
  // la plaza del norte de la Marina: las dos palmeras de la jardinera de las letras
  tunePlazaMarina(map);
  // Karma, en el edificio del norte de la Marina: fuera su rótulo genérico
  tuneKarma(map);
  // Intrigo, en el paseo de la Marina: fuera su rótulo genérico
  tuneIntrigo(map);
  // la pasarela de la Marina y el monolito de la esquina de la plaza del norte
  tunePasarelaMarina(map);
  // los edificios de la Marina: blancos y con la azotea clara, como en la foto aérea
  tuneEdificiosMarina(map);
  // el varadero del sur de la Marina
  tuneVaraderoMarina(map);
  // el dique de la Marina por el lado del mar abierto
  tuneDiqueMarina(map);
  // las plazas de los dos aparcamientos asfaltados de la Marina, para que parked.js aparque coches en ellas
  tuneAparcamientosMarina(map);
  // el Bar Bahía de Nao, la casa vieja encalada de la avenida de Naos 32 (el mapa no tenía rótulo suyo)
  tuneBahiaDeNao(map);
  // el Bar Cafetería El Telamon, en la calle La Rosa 19 (el mapa no tenía rótulo suyo)
  tuneElTelamon(map);
  // Ali's Kebab, en la esquina de La Rosa con Tarragona (el mapa no tenía rótulo suyo)
  tuneAlisKebab(map);
  // el Bar Cafetería Pasa Pa Dentro, en la calle Chafaris 9 (el mapa no tenía rótulo suyo)
  tunePasaPaDentro(map);
  // el Bar Cafetería Tarragona, en la calle La Rosa, cerca de Lérida (el mapa no tenía rótulo suyo)
  tuneBarTarragona(map);
  // el bar del 83 de Pérez Galdós (Noray, ahora Sabor Manabita), con las terreras y el edificio de la farmacia
  tuneBarNoray(map);
  // el edificio blanco del Costa Azul Sushi en la Rambla Medular, junto a la gasolinera (el mapa no lo tenía)
  tuneCostaAzulSushi(map);
  // el Centro de Salud de Valterra (Pérez Galdós 90): el bloque color arena de dos plantas y el cuerpo del fondo
  tuneCentroSaludValterra(map);
  // la cara de Clavijo y Fajardo del centro de salud (Urgencias): la franja de tres plantas (después del centro de salud)
  tuneUrgenciasValterra(map);
  // la manzana de enfrente, en la esquina de Cáceres con Clavijo y Fajardo: las casas de bajo y dos plantas
  tuneEsquinaCaceres(map);
  // la cara de Pérez Galdós de esa manzana, del 91 al 95 (después de la esquina de Cáceres)
  tunePerezGaldos94(map);
  // las casas terreras del Instituto Social de la Marina, enfrente de Urgencias por Clavijo y Fajardo
  tuneCasasMarina(map);
  // los dúplex color crema de Clavijo y Fajardo, enfrente de la esquina de Cáceres
  tuneCasasClavijo(map);
  // el resto de la cara de Clavijo y Fajardo de la manzana de la esquina de Cáceres (después de la esquina)
  tuneClavijoNorte(map);
  // lo de la Rambla Medular (desde el 09/11/2026), que va en ramblaMedular.js
  tuneRamblaMedular(map);
}

/** primera fase: antes de crear los locales */
export function construir({ scene, map, colliders }) {
  // los locales de la calle del tanatorio (fotos): la Taquería Dichell Fusión's, el Oishi y la correduría Graciplus
  buildLocalesTanatorio(scene, colliders, map);
  // el parque de piedra entre el Hospital Insular y la Escuela de Pesca
  buildParqueHospital(scene, colliders);
  // el Hospital Insular (fotos): el jardín que sube a la puerta, el porche, el aparcamiento y el cartel con el buzón
  buildHospitalInsular(scene, colliders);
  buildEscuelaPesca(scene, colliders);
  // el parking de los médicos del Hospital Insular
  buildParkingMedicos(scene, colliders);
  // la trasera de la Escuela de Pesca, con el pantalán y los barcos naranjas, y el paseo de Olof Palme
  buildEscuelaMar(scene, colliders);
  // la Comisaría de Policía Nacional, pasado el tanatorio (bandas de ventanas, marquesina y valla)
  buildComisaria(scene, colliders);
  // el parque infantil del dinosaurio, frente al tanatorio, junto a la avenida
  buildParqueDino(scene, colliders);
  // el Castillo de San José con su explanada de esculturas (terrain.js alisa la loma)
  buildCastilloSanJose(scene, colliders);
  // el Bar Cafetería La Estación (foto de la calle): la nave blanca, la entrada del bar y la valla verde
  buildLaEstacion(scene, colliders, map);
  // La Vela Café (foto de noviembre de 2025): la fachada gris con el logo redondo, la cristalera y la terraza de mamparas
  buildLaVela(scene, colliders, map);
  // la bombonería La Corona (foto de mayo de 2021): el panel gris con el logo de la corona y la cristalera
  buildLaCorona(scene, colliders, map);
  // el paseo de losas de la Marina Lanzarote, de las tiendas al borde del agua (antes se veía como agua)
  buildPaseoMarina(scene);
  // la zapatería Terali (foto de abril de 2022): el frente azul con ZAPATOS · TERALI · SHOES y sus escaparates
  buildTerali(scene, colliders, map);
  // los pantalanes de la Marina Lanzarote, de la A a la L, con sus fingers, sus tomas y los barcos amarrados
  buildPantalanesMarina(scene);
  // la plaza del norte de la Marina: el borde del muelle de losas y las letras «marina lanzarote»
  buildPlazaMarina(scene, map);
  // Karma (foto de septiembre de 2025): la terraza de lamas con luz verde, el murete de plantas y las letras de cobre
  buildKarma(scene, colliders, map);
  // Intrigo (foto de mayo de 2023): la banda negra con INTRIGO, la cristalera con el bar dentro y el ficus
  buildIntrigo(scene, colliders, map);
  // la pasarela peatonal de la Marina sobre el agua, y el monolito con el mástil en la esquina de la plaza
  buildPasarelaMarina(scene, colliders, map);
  // el varadero del sur de la Marina: los barcos en sus cunas, la grúa pórtico y los dos muelles de la grúa
  buildVaraderoMarina(scene, colliders, map);
  // el dique de la Marina: el muro blanco, las farolas de dos brazos y los bloques de la escollera
  buildDiqueMarina(scene, colliders, map);
  // los aparcamientos de la Marina: las rayas de las plazas en batería (los coches los pone parked.js)
  buildAparcamientosMarina(scene, map);
  // el Bar Bahía de Nao (fotos de 2024 y 2025): la puerta azul, el letrero con el timón y la terraza de las sombrillas blancas
  buildBahiaDeNao(scene, colliders, map);
  // el Bar El Telamon (vista de la calle de julio de 2025): el hueco de chapa marrón, los barriles y el letrero del barco
  buildElTelamon(scene, colliders, map);
  // Ali's Kebab (vista de la calle de julio de 2025): el granito gris y negro, las ventanas de los platos y el letrero del doner
  buildAlisKebab(scene, colliders, map);
  // el Pasa Pa Dentro (vista de la calle de julio de 2025): el bajo rosado, la pérgola negra y las casas viejas de los lados
  buildPasaPaDentro(scene, colliders, map);
  // el Bar Tarragona (vista de la calle de julio de 2025): la entrada con escalones, el letrero negro y el edificio de encima
  buildBarTarragona(scene, colliders, map);
  // el bar del 83 de Pérez Galdós (vista de la calle de julio de 2025): las dos terreras y el edificio de la farmacia
  buildBarNoray(scene, colliders, map);
  // el edificio del Costa Azul Sushi (vistas de la calle de julio de 2025): la fachada de la Rambla y las dos puntas
  buildCostaAzulSushi(scene, colliders, map);
  // el Centro de Salud de Valterra (vistas de la calle de julio de 2025): las dos alas, la plaza de la entrada y el fondo
  buildCentroSaludValterra(scene, colliders, map);
  // la cara de Urgencias por Clavijo y Fajardo (vistas de la calle de julio de 2025): tres plantas y la entrada
  buildUrgenciasValterra(scene, colliders, map);
  // la esquina de Cáceres con Clavijo y Fajardo (vistas de la calle de julio de 2025): el amarillo, el crema y el blanco
  buildEsquinaCaceres(scene, colliders, map);
  // la cara de Pérez Galdós (vistas de la calle de julio de 2025): el bloque de pisos blanco y el amarillo de la esquina
  buildPerezGaldos94(scene, colliders, map);
  // las casas de enfrente de Urgencias (vistas de la calle de julio de 2025): la fila encalada con sus patios
  buildCasasMarina(scene, colliders, map);
  // los dúplex de Clavijo y Fajardo (vistas de la calle de julio de 2025): la esquina, la fila y la casa del 34
  buildCasasClavijo(scene, colliders, map);
  // el bloque de pisos blanco por Clavijo y Fajardo (vistas de la calle de julio de 2025): portales y balcones
  buildClavijoNorte(scene, colliders, map);
  // lo de la Rambla Medular (desde el 09/11/2026), que va en ramblaMedular.js
  buildRamblaMedular(scene, colliders, map);

  return {};
}

/** segunda fase: después de crear los locales (el tanatorio viene con la oficina del cliente) */
export function construirConLocales({ scene, colliders }) {
  // fachada del tanatorio y la oficina de Canary Consulting en el lateral (como en las fotos)
  const office = buildTanatorioFacade(scene, colliders);
  // y su azotea, como en la foto desde arriba
  buildTanatorioRoof(scene);
  // y lo de alrededor (foto de dron): aparcamiento de detrás, calle del lateral, jardín y la calle de delante
  buildTanatorioEntorno(scene, colliders);

  return { office };
}
