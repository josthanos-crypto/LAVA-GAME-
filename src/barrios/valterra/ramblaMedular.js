/**
 * Lo de la Rambla (Vía) Medular que se hace desde el 09/11/2026 (pidió José Manuel arreglarla entera): va aquí, en un
 * archivo aparte y corto, para no tener que reescribir el index.js del barrio en cada cambio. Aunque algo caiga en otro
 * barrio, las piezas van con sus coordenadas del mapa, así que da igual desde dónde se llamen.
 * Lo que hace cada una está en la cabecera de su archivo y en VERSION_WEB_94l.
 */

import { tuneOpenMall, buildOpenMall } from '../../openMall.js';
import { tuneCcArrecife, buildCcArrecife } from '../../ccArrecife.js';
import { tuneConservatorioTeatro, buildConservatorioTeatro } from '../../conservatorioTeatro.js';
import { tuneIesBlasCabrera, buildIesBlasCabrera } from '../../iesBlasCabrera.js';
import { tuneIesLasMaretas, buildIesLasMaretas } from '../../iesLasMaretas.js';
import { tuneParadasRambla, buildParadasRambla } from '../../paradasRambla.js';
import { tuneCuartelHerrera, buildCuartelHerrera } from '../../cuartelHerrera.js';
import { tuneCuartelRecinto, buildCuartelRecinto } from '../../cuartelRecinto.js';
import { montarTrincheras } from '../../trinchera.js';
import { tuneGrupoTiagua, buildGrupoTiagua } from '../../grupoTiagua.js';
import { tuneLosArrieros, buildLosArrieros } from '../../losArrieros.js';
import { tuneSalonAltavista, buildSalonAltavista } from '../../salonAltavista.js';
import { tunePlenergyAltavista, buildPlenergyAltavista } from '../../plenergyAltavista.js';
import { tuneRapadurasSur, buildRapadurasSur } from '../../rapadurasSur.js';
import { tuneRapadurasNorte, buildRapadurasNorte } from '../../rapadurasNorte.js';
import { tuneCampoCadiz, buildCampoCadiz } from '../../campoCadiz.js';
import { tuneValladolidOeste, buildValladolidOeste } from '../../valladolidOeste.js';
import { tuneAsaderoJonay, buildAsaderoJonay } from '../../asaderoJonay.js';
import { tuneConfeccionesAltavista, buildConfeccionesAltavista } from '../../confeccionesAltavista.js';
import { tuneAutolavadoParque, buildAutolavadoParque } from '../../autolavadoParque.js';
import { tuneShellAltavista, buildShellAltavista } from '../../shellAltavista.js';
import { tuneTentempie, buildTentempie } from '../../tentempie.js';
import { tuneSolarVirgilio, buildSolarVirgilio } from '../../solarVirgilio.js';
import { tuneSolarLubary, buildSolarLubary } from '../../solarLubary.js';
import { tuneIesAltavista, buildIesAltavista } from '../../iesAltavista.js';
import { tuneFranPenaEspino, buildFranPenaEspino } from '../../franPenaEspino.js';
import { tuneEurosparAltavista, buildEurosparAltavista } from '../../eurosparAltavista.js';
import { tuneTunelAltavista, buildTunelAltavista } from '../../tunelAltavista.js';
import { tuneDondeYani, buildDondeYani } from '../../dondeYani.js';
import { tuneCaMario, buildCaMario } from '../../caMario.js';
import { tuneLosGeranios, buildLosGeranios } from '../../losGeranios.js';
import { tuneLocutorioAltavista, buildLocutorioAltavista } from '../../locutorioAltavista.js';
import { tuneMinaSur, buildMinaSur } from '../../minaSur.js';
import { tuneBodegonMencey, buildBodegonMencey } from '../../bodegonMencey.js';
import { tuneCanaryTel, buildCanaryTel } from '../../canaryTel.js';
import { tuneEsquinaCervantes, buildEsquinaCervantes } from '../../esquinaCervantes.js';
import { tuneFarmaciaEnalta, buildFarmaciaEnalta } from '../../farmaciaEnalta.js';
import { tuneSuntelcoEndesa, buildSuntelcoEndesa } from '../../suntelcoEndesa.js';
import { tuneAlmudena175, buildAlmudena175 } from '../../almudena175.js';
import { tuneAparcamientoPadreClaret, buildAparcamientoPadreClaret } from '../../aparcamientoPadreClaret.js';
import { tuneAdosadasLyC, buildAdosadasLyC } from '../../adosadasLyC.js';
import { tuneSnackLosPicachos, buildSnackLosPicachos } from '../../snackLosPicachos.js';
import { tuneCompafricLyC, buildCompafricLyC } from '../../compafricLyC.js';
import { tuneColoraoLyC, buildColoraoLyC } from '../../coloraoLyC.js';
import { buildMedianaLyC } from '../../medianaLyC.js';
import { tuneFrayLuisNorte, buildFrayLuisNorte } from '../../frayLuisNorte.js';
import { tuneFrayLuisSur, buildFrayLuisSur } from '../../frayLuisSur.js';
import { tuneFasniaCrema, buildFasniaCrema } from '../../fasniaCrema.js';
import { tuneAdosadasVonBuch, buildAdosadasVonBuch } from '../../adosadasVonBuch.js';
import { tuneFrayLuisOeste, buildFrayLuisOeste } from '../../frayLuisOeste.js';
import { tuneTelesforoBravo, buildTelesforoBravo } from '../../telesforoBravo.js';
import { tuneAparcamientoTopham, buildAparcamientoTopham } from '../../aparcamientoTopham.js';
import { tuneEscuelaArte, buildEscuelaArte } from '../../escuelaArte.js';
import { tuneIglesiaAltavista, buildIglesiaAltavista } from '../../iglesiaAltavista.js';

/** retoques al mapa antes de levantar la ciudad */
export function tuneRamblaMedular(map) {
  // el Centro Comercial Open Mall, en la Rambla Medular (León y Castillo 156)
  tuneOpenMall(map);
  // el Centro Comercial Arrecife (Rambla Medular 61-63), con el Aerofit en la punta del este
  tuneCcArrecife(map);
  // el Conservatorio (Rambla Medular 67) y el Teatro El Salinero (65, del Cabildo)
  tuneConservatorioTeatro(map);
  // el IES Blas Cabrera Felipe, en la avenida Alcalde Ginés de la Hoz 57
  tuneIesBlasCabrera(map);
  // el IES Las Maretas (calle Triana)
  tuneIesLasMaretas(map);
  // las paradas de guagua de la Rambla (7, 35 a los dos lados, 17A y 101)
  tuneParadasRambla(map);
  // el Acuartelamiento Marqués de Herrera (calle Doctor Juan Negrín 125; no es de la Rambla, pero va por coordenadas)
  tuneCuartelHerrera(map);
  // el recinto del cuartel: el muro de alrededor, los pabellones de dentro y la pista americana
  tuneCuartelRecinto(map);
  // las empresas del Grupo Tiagua: Mármoles Brito, Grupo Tiagua (Las Caletas) y Tinguatón Ferretería (van por coordenadas)
  tuneGrupoTiagua(map);
  // el Bar Picoteros Los Arrieros (León y Castillo 170, Altavista; va por coordenadas)
  tuneLosArrieros(map);
  // la Cafetería - Salón Recreativo Altavista (Calderón de la Barca 4)
  tuneSalonAltavista(map);
  // la gasolinera Plenergy Arrecife I (León y Castillo / Blasco Ibáñez), nueva, de bajo coste; quita la genérica del mapa
  tunePlenergyAltavista(map);
  // Las Rapaduras, mitad sur de la franja entre León y Castillo y la calle Cádiz (casas, solares y el sitio de la Petroprix)
  tuneRapadurasSur(map);
  // Las Rapaduras, mitad norte de la franja (el solar grande, el edificio de tres plantas, las casas viejas, el jardín y las ruinas)
  tuneRapadurasNorte(map);
  // el campo grande de tierra entre las calles Cádiz, Palencia, Donante de Sangre y Valladolid
  tuneCampoCadiz(map);
  // las casas del lado oeste de la calle Valladolid (las que dan al campo de tierra)
  tuneValladolidOeste(map);
  // el Asadero de Pollos Jonay Altavista (esquina de Chafarís con Ángel Ganivet)
  tuneAsaderoJonay(map);
  // Confecciones Altavista (Ángel Ganivet 36) y el solar de tierra de al lado (40)
  tuneConfeccionesAltavista(map);
  // el Autolavado Parque de Limpieza (León y Castillo, junto a la Shell)
  tuneAutolavadoParque(map);
  // la gasolinera Shell de León y Castillo 194 y la Cafetería Parque de Limpieza; quita la Shell genérica del mapa
  tuneShellAltavista(map);
  // la Hamburguesería Tentempié (esquina de Granada con Virgilio Cabrera); la esquina sale del bloque de 9 m
  tuneTentempie(map);
  // el solar grande de tierra entre Virgilio Cabrera, Granada, San Juan de la Cruz y Enrique Suárez Lubary
  tuneSolarVirgilio(map);
  // el solar de tierra entre Enrique Suárez Lubary, Granada, Guillermo Toledo Duchemin y San Juan de la Cruz, con el cuarto viejo de bloques
  tuneSolarLubary(map);
  // el IES en Altavista (calle Mosta), que no estaba, y la cafetería de enfrente
  tuneIesAltavista(map);
  // Fran en la calle Peña del Espino 24: la puerta abierta, sale y entra, y habla contigo si te acercas andando
  tuneFranPenaEspino(map);
  // el Supermercado Eurospar Altavista y su aparcamiento (plazas pintadas y coches aparcados)
  tuneEurosparAltavista(map);
  // el Snack Bar El Túnel y la esquina de Padre Claret: las dos casas salen del bloque genérico de 4 m
  tuneTunelAltavista(map);
  // el Bar Cafetería Donde Yani (Blasco Ibáñez 19) y su casa de la esquina de Juan Sebastián El Cano; sale del bloque genérico de 8 m
  tuneDondeYani(map);
  // Ca'Mario hamburguesería (Mosta 20, esquina de La Majada) y el edificio blanco de dos plantas de encima; sale de la punta sur del bloque genérico de 9 m
  tuneCaMario(map);
  // el Bar Cafetería Los Geranios (Mina 25) con su terraza, las casas del 23 y el 27 y el solar del 21 al 23; salen del bloque genérico de 6 m
  tuneLosGeranios(map);
  // el Supermercado Locutorio Altavista (Mina 17) y las adosadas crema del 19 y el 21; salen del bloque genérico de 6 m
  tuneLocutorioAltavista(map);
  // la calle Mina al sur del locutorio: las adosadas crema del 13 y el 15, la casa baja de las puertas azules y el edificio del 11; salen del bloque genérico de 6 m
  tuneMinaSur(map);
  // el Bodegón Los Mencey (León y Castillo 191) y la casa alta de al lado; salen del bloque genérico de 5 m
  tuneBodegonMencey(map);
  // el edificio de Canary-Tel 2 y Suntelco (León y Castillo, al norte del Bodegón Los Mencey); sale del bloque genérico de 5 m
  tuneCanaryTel(map);
  // la punta norte de la manzana de León y Castillo, de Canary-Tel a la esquina de Cervantes: la casa vieja de las persianas verdes y la casa de la esquina con la torre y la peluquería; salen del bloque genérico de 5 m
  tuneEsquinaCervantes(map);
  // la Farmacia de León y Castillo 181 y Énalta Atención Funeraria (183): salen de la punta sur del bloque genérico de 5 m y del hueco de al lado
  tuneFarmaciaEnalta(map);
  // la oficina de Suntelco y Punto de Servicio de Endesa (León y Castillo 187) y las dos casas de al lado hasta el bodegón; salen del bloque genérico de 5 m
  tuneSuntelcoEndesa(map);
  // el 173 y el 175 de León y Castillo (HenryCar, Almudena Seguros), en lugar del bloque de 6 m
  tuneAlmudena175(map);
  // el aparcamiento asfaltado de León y Castillo con Padre Claret y el monumento «Barrio de Altavista»
  tuneAparcamientoPadreClaret(map);
  // León y Castillo al norte de Cervantes: las casas del 199 al 203 y las adosadas crema hasta el pasaje del 215; salen del bloque genérico de 4 m
  tuneAdosadasLyC(map);
  // el Snack Bar Los Picachos (León y Castillo, esquina de Fasnia) y su casa entera; sale de la punta norte del bloque genérico de 4 m y llega a la esquina
  tuneSnackLosPicachos(map);
  // la acera de León y Castillo al sur de El Túnel, del 169 a Compafric
  tuneCompafricLyC(map);
  // el resto de la acera de León y Castillo al sur de El Túnel: el 159, el 157, OTIS, el callejón de tierra, El Colorao y el solar de la esquina
  tuneColoraoLyC(map);
  // la calle Fray Luis de León por detrás de El Túnel: la casa 46 de las puertas verdes y la casa baja de cemento del 44
  tuneFrayLuisNorte(map);
  // la calle Fray Luis de León por detrás, mitad sur: el 42, Compafric, el 157, OTIS y El Colorao por detrás
  tuneFrayLuisSur(map);
  // la calle Fasnia: las adosadas crema entre el Snack Los Picachos y Leopoldo von Buch, con Marcia centro de estética
  tuneFasniaCrema(map);
  // la cara de atrás de las adosadas crema, por Leopoldo von Buch (en Google, Crucero Canarias), con el patio del muro de piedra
  tuneAdosadasVonBuch(map);
  // la acera del oeste de Fray Luis de León: las casas terreras, cada una a su altura
  tuneFrayLuisOeste(map);
  // la calle Telésforo Bravo por detrás de Fray Luis de León: el 25 y el patio de grava con los garajes
  tuneTelesforoBravo(map);
  // el aparcamiento de tierra entre la manzana de Fray Luis de León y Guillermo Topham, con sus coches
  tuneAparcamientoTopham(map);
  // la Escuela de Arte Pancho Lasso, en la esquina de la Rambla con Salvador Allende
  tuneEscuelaArte(map);
  // la parroquia de San Antonio María Claret (Altavista; va por coordenadas)
  tuneIglesiaAltavista(map);
}

/** se monta con lo demás de Valterra */
export function buildRamblaMedular(scene, colliders, map) {
  return {
    // el Open Mall (vistas de la calle de julio de 2025): el muro granate, el parterre de piedra y la torre de la entrada
    openMall: buildOpenMall(scene, colliders, map),
    // el Centro Comercial Arrecife y el Aerofit (vistas de la calle de julio de 2025): la marquesina morada, la escalera y los mástiles
    ccArrecife: buildCcArrecife(scene, colliders, map),
    // el Conservatorio y el Teatro El Salinero (vistas de la calle de julio de 2025): la balaustrada, las placas beis y las letras
    conservatorioTeatro: buildConservatorioTeatro(scene, colliders, map),
    // el IES Blas Cabrera (vistas de la calle de julio de 2025): el edificio blanco, el muro con la reja y la marquesina azul
    iesBlasCabrera: buildIesBlasCabrera(scene, colliders, map),
    // el IES Las Maretas
    iesLasMaretas: buildIesLasMaretas(scene, colliders, map),
    // las paradas de guagua de la Rambla
    paradasRambla: buildParadasRambla(scene, colliders, map),
    // el cuartel Marqués de Herrera
    cuartelHerrera: buildCuartelHerrera(scene, colliders, map),
    // el recinto del cuartel
    cuartelRecinto: buildCuartelRecinto(scene, colliders, map),
    // el paso de la calle de Pereyra Galviaty por encima de la circunvalación, que baja en trinchera (se monta cuando
    // el juego ya está en marcha, porque engancha el sombreador del terreno)
    trincheras: montarTrincheras(scene, colliders),
    // las empresas del Grupo Tiagua
    grupoTiagua: buildGrupoTiagua(scene, colliders, map),
    // el Bar Picoteros Los Arrieros
    losArrieros: buildLosArrieros(scene, colliders, map),
    // la Cafetería - Salón Recreativo Altavista: el edificio entero, las casas de los lados, la terraza y el paseo
    salonAltavista: buildSalonAltavista(scene, colliders, map),
    // la gasolinera Plenergy: la explanada, la marquesina, la caseta, las vallas y el jardín de la punta
    plenergyAltavista: buildPlenergyAltavista(scene, colliders, map),
    // Las Rapaduras sur: la manzana de Palencia, las casas de la calle Cádiz, la casa 176, los solares de tierra y la grava de la Petroprix
    rapadurasSur: buildRapadurasSur(scene, colliders, map),
    // Las Rapaduras norte: el edificio de los balcones, las casas viejas de León y Castillo y de la calle Cádiz, el edificio gris, el jardín, las ruinas y el solar
    rapadurasNorte: buildRapadurasNorte(scene, colliders, map),
    // el campo de tierra: la tierra con piedras, escombros y matojos, el aparcamiento de tierra del norte y el muro de la obra de Palencia
    campoCadiz: buildCampoCadiz(scene, colliders, map),
    // las casas de la calle Valladolid: los pisos color melocotón, la casa de LOGOS, la casa crema, las terreras y la trasera blanca
    valladolidOeste: buildValladolidOeste(scene, colliders, map),
    // el Asadero Jonay: la casa de tres plantas de la esquina, con el bajo de ladrillo, el cartel, los balcones y las persianas de madera
    asaderoJonay: buildAsaderoJonay(scene, colliders, map),
    // Confecciones Altavista: la casa de la esquina con los escaparates amarillos y los balcones, y el solar con el portón verde
    confeccionesAltavista: buildConfeccionesAltavista(scene, colliders, map),
    // el autolavado: el patio, la valla amarilla, la marquesina de LIMPIEZA DE INTERIORES, la nave con los carteles y el edificio del norte
    autolavadoParque: buildAutolavadoParque(scene, colliders, map),
    // la Shell y la cafetería: la marquesina, los surtidores, la tienda, el poste, la explanada y la casa de la terraza roja
    shellAltavista: buildShellAltavista(scene, colliders, map),
    // la Hamburguesería Tentempié: la casa rosa de dos plantas, la terraza cerrada, el balcón de aspas y las persianas
    tentempie: buildTentempie(scene, colliders, map),
    // el solar de Virgilio Cabrera: la tierra, las rodadas, los escombros, los muros rotos y el matorral
    solarVirgilio: buildSolarVirgilio(scene, colliders, map),
    // el solar de Enrique Suárez Lubary: la tierra con hierba y piedras, y el cuarto viejo de bloques con el portón de madera
    solarLubary: buildSolarLubary(scene, colliders, map),
    // el IES en Altavista: el edificio de cuatro plantas, los pabellones, el patio, las palmeras, el muro con la cancela y la cafetería de enfrente
    iesAltavista: buildIesAltavista(scene, colliders, map),
    // Fran en Peña del Espino 24: la casa de la puerta verde abierta y Fran, que sale, entra y habla
    franPenaEspino: buildFranPenaEspino(scene, colliders, map),
    // el Eurospar: la fachada blanca con la franja y las letras rojas, el aparcamiento asfaltado con las plazas en espiga, los pasos de cebra y los coches
    eurosparAltavista: buildEurosparAltavista(scene, colliders, map),
    // El Túnel: la casa crema del bar (portón abierto, CaixaBank, balaustradas) y la de la esquina (Hobby Arte, Floristería El Trébol, la esquina redonda)
    tunelAltavista: buildTunelAltavista(scene, colliders, map),
    // Donde Yani: la casa canaria blanca de la esquina (pilastras grises, balaustrada, Boutique del Pan, Donde Yani y la cara de Juan Sebastián El Cano)
    dondeYani: buildDondeYani(scene, colliders, map),
    // Ca'Mario: el edificio blanco con los chaflanes, los rótulos rojos, la terraza cerrada roja, los locales de Mosta y las caras de La Majada y Peña del Espino
    caMario: buildCaMario(scene, colliders, map),
    // Los Geranios: la casa salmón del 23, la blanca del 25 con el bar y la terraza, la vieja del 27 y el solar con el cartel de EN VENTA
    losGeranios: buildLosGeranios(scene, colliders, map),
    // el Locutorio: el edificio blanco de tres plantas con la tienda y el toldo, y las dos adosadas crema hasta el solar
    locutorioAltavista: buildLocutorioAltavista(scene, colliders, map),
    // la calle Mina al sur: las adosadas crema con la planta de arriba metida, la casa azul y el edificio de las ventanas verdes
    minaSur: buildMinaSur(scene, colliders, map),
    // el Bodegón Los Mencey: la casa blanca con el toldo, las mesas, el balcón y el letrero de madera, y la casa alta de las ventanas verdes
    bodegonMencey: buildBodegonMencey(scene, colliders, map),
    // Canary-Tel 2 y Suntelco: el edificio crema con la cristalera, los carteles de placas solares, los letreros rojos y las lamas
    canaryTel: buildCanaryTel(scene, colliders, map),
    // la esquina de Cervantes: la casa vieja blanca de las persianas verdes y la casa crema de la torre de los ojos de buey, la peluquería y el balcón de madera
    esquinaCervantes: buildEsquinaCervantes(scene, colliders, map),
    // la Farmacia y Énalta: la casa del toldo azul, el letrero y la cruz verde, y la casa del letrero lila con el azulejo marrón
    farmaciaEnalta: buildFarmaciaEnalta(scene, colliders, map),
    // Suntelco y Endesa: la casa del balcón oscuro con las puertas azuladas, la escalonada del escaparate azul y la del portón verde
    suntelcoEndesa: buildSuntelcoEndesa(scene, colliders, map),
    // el 173 y el 175 de León y Castillo
    almudena175: buildAlmudena175(scene, colliders, map),
    // el aparcamiento de Padre Claret: el asfalto, los coches y el monumento
    aparcamientoPadreClaret: buildAparcamientoPadreClaret(scene, colliders, map),
    // las adosadas de León y Castillo: las casas blancas de la esquina, los porches, las celosías, las ventanas y los dos pasajes
    adosadasLyC: buildAdosadasLyC(scene, colliders, map),
    // el Snack Bar Los Picachos: la persiana ocre, la puerta abierta, los letreros verdes y la cara de Fasnia con la ventanilla y el toldo
    snackLosPicachos: buildSnackLosPicachos(scene, colliders, map),
    // el 169, el 165, el 163 metido y Compafric
    compafricLyC: buildCompafricLyC(scene, colliders, map),
    // el 159 de la terraza, el 157 de la espadaña, OTIS, el callejón, la Cafetería Churrería El Colorao y el solar
    coloraoLyC: buildColoraoLyC(scene, colliders, map),
    // la mediana de pitas y matas granate de León y Castillo, de El Salvador a la Rambla
    medianaLyC: buildMedianaLyC(scene),
    // el 46 y el 44 de Fray Luis de León
    frayLuisNorte: buildFrayLuisNorte(scene, colliders, map),
    // el 42, las traseras de Compafric, del 157, de OTIS y de El Colorao por Fray Luis de León
    frayLuisSur: buildFrayLuisSur(scene, colliders, map),
    // las adosadas crema de Fasnia y Marcia
    fasniaCrema: buildFasniaCrema(scene, colliders, map),
    // las adosadas crema por la calle de atrás, los dos pasajes y el patio del muro de piedra
    adosadasVonBuch: buildAdosadasVonBuch(scene, colliders, map),
    // la acera del oeste de Fray Luis de León
    frayLuisOeste: buildFrayLuisOeste(scene, colliders, map),
    // el 25 de Telésforo Bravo y el patio de los garajes
    telesforoBravo: buildTelesforoBravo(scene, colliders, map),
    // el aparcamiento de tierra de Guillermo Topham
    aparcamientoTopham: buildAparcamientoTopham(scene, colliders, map),
    // la Escuela de Arte Pancho Lasso (vistas de la calle de julio de 2025): el cuerpo rojo con las letras, la verja y la torre roja
    escuelaArte: buildEscuelaArte(scene, colliders, map),
    // la parroquia de Altavista (vista de la calle de julio de 2025): el muro encalado, el pretil de curvas y la puerta marrón
    iglesiaAltavista: buildIglesiaAltavista(scene, colliders, map),
  };
}
