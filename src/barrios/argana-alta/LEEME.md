# Argana Alta

**Límites:** x −2617…−1003 · z −2434…−840 (x hacia el este, z hacia el sur).
El barrio del noroeste, en la salida hacia San Bartolomé.

## Qué hay hecho a mano

### HiperDino Argana — Calle Tenderete 7

> **En su sitio de verdad (Version 147).** La planta de OpenStreetMap es la de la nave vieja, que ya no existe. La de
> ahora está 57 m más cerca de la Calle Tenderete y mide 79 × 67 m (ortofoto oficial del IGN): `MOVER` en
> hiperdinoArgana.js traslada todo el modelo y el del MediaMarkt. Ya no hay aparcamiento ni muro de lamas delante
> de la cara larga (ahí está la acera de Tenderete); el aparcamiento es el del testero, hacia la Calle Iguazú.

> **Cambio pedido por José Manuel (Version 91):** la **fachada** de la tienda (escaparate, marquesina,
> entrada de clientes y rótulo grande) está en el testero que da a la **Calle Iguazú**, al lado del
> MediaMarkt, y el **portón del garaje / muelle de carga** en la cara larga de la **Calle Tenderete**
> (que por lo demás es pared blanca con pilares y ventanas altas). Lo de abajo describe lo anterior
> en cuanto a materiales y medidas; la colocación manda esta nota.


Lo que se ve en el recorrido de José Manuel del **25/10/2026** (vídeo `IMG_5153`,
fotogramas `f_0121`–`f_0180`). Archivo: [`hiperdinoArgana.js`](../../hiperdinoArgana.js).

- La nave blanca alargada con el **bloque alto del extremo de la calle**, el **escaparate
  corrido** de suelo a marquesina y el **rótulo verde** de HiperDino sobre la fachada y en
  la esquina (en la nave real las letras son verdes, no azules).
- La **marquesina corrida** de verdad: forjado de 3,8 m de vuelo sobre columnas finas, con
  su canto blanco, como se ve en los fotogramas del recorrido.
- La **entrada de clientes**, a mitad de la nave: zaguán en sombra, dos puertas correderas
  de cristal con marcos de aluminio, felpudo y los carros al lado.
- El **muelle de carga** (Version 86): donde antes estaba la entrada hay un portón
  seccional de 10,6 × 4,6 m, con su marquesina de chapa, topes de goma, bolardos
  amarillos, puerta del personal y el cartel «CARGA Y DESCARGAS». El firme de delante se
  deja libre de plazas porque es la zona de maniobra del camión.
- El HiperDino queda **enfrente de la gasolinera Repsol** de la glorieta: desde el
  aparcamiento y desde la estación se ve el frente entero, con el muelle a un lado.
- El **aparcamiento** delante, con tres filas de plazas pintadas, los **carros metálicos**
  apilados junto a la pared y el **muro de lamas blancas** hacia la acera, con el hueco de
  la entrada de coches.
- El solar está en cuesta: el asfalto, las plazas, el muro y los carros **siguen la altura
  del terreno** (si no, el suelo de alrededor asomaba por encima del asfalto).
- La planta y el choque son los del edificio de OpenStreetMap (el nodo de HiperDino cae
  dentro de esta nave): se quita el bloque genérico con `tuneHiperdinoArgana` y se levanta
  este.

Lo demás del barrio (hospital, Palacio de los Deportes, CEO Argana, calles y casas) sigue
saliendo del mapa, como antes.

## Archivos suyos

- `index.js` — el barrio: llama a `tuneHiperdinoArgana` / `buildHiperdinoArgana`.
- `../../hiperdinoArgana.js` — el supermercado.
- `../../calleTanganillo.js` — la Calle Tanganillo y el primer trozo de la Calle Tenderete,
  que faltaban en el mapa (Version 87): el atajo del camino de tierra del campo a Tenderete.
  Puntos de OpenStreetMap. De la casa del campo al HiperDino: 2,4 km de verdad, 2,35 en el juego
  (también por el GPS). Pide suelo fino de 10 m en esa cuesta (`map.groundFine`, world.js) para que
  la arena no tape el asfalto.
- `../../ortopediaCarmen.js` — la fachada de la Ortopedia Carmen, en la carretera de San Bartolomé.
- `../../dosCabras.js` — la nave de la fábrica de cerveza Dos Cabras, en la carretera de San Bartolomé.
- `../../fontanalesArgana.js` — la Churrería Fontanales de la calle Tajaraste.
- `../../arepasFactory.js` — el restaurante Arepa's Factory de la calle Polca.

### El MediaMarkt del Parque Comercial — Calle Tenderete 7

De los vídeos del **26/10/2026** (`IMG_0398`, `IMG_0399`). Archivo:
[`centroComercialArgana.js`](../../centroComercialArgana.js).

- **Es un local pequeño**, de una planta: 16 m de escaparate, 9 m de fondo y 5,4 m de
alto, con la banda negra del rótulo («Media Markt» en rojo con el remolino), la
marquesina sobre la puerta, la valla blanca de barrotes y su aparcamiento delante.
Casi todo el complejo es la **nave del HiperDino**, que sigue entera y con su rótulo
en la esquina.
- Va pegado al **testero del bloque alto de la nave**, donde OpenStreetMap pone el nodo
del MediaMarkt —(−1291, −1354)—, y da al aparcamiento grande del centro comercial
(el de la foto aérea y el del vídeo, con los coches de frente).
- El aparcamiento sigue la cuesta (como el del HiperDino) y lleva las plazas pintadas,
el bordillo y dos farolas. Las tres palmeras de la orilla se plantan con las demás
(`map.extraPalms`).

### Industrias Rosa (el rótulo naranja y verde) — Calle Iguazú 5

De `IMG_0399` (min. 1:00): el cartel grande de **ROSA** —letras naranjas con la
estrella verde— sobre el tejado, la banda blanca de la fachada con los departamentos
en verde (**Cerámicas · Ferretería · Jardinería**), el panel azul de **T Tools**, los
escaparates, la verja blanca, el aparcamiento y las palmeras delante de los cristales.
Archivo: [`industriasRosa.js`](../../industriasRosa.js).

- La nave es la del mapa (el edificio bajo que da a Iguazú; el grande de detrás, con
  las placas solares, es el almacén): se queda el bloque genérico y encima se pone la
  fachada nueva. La dirección es la que da la ficha de la empresa.

### El McDonald's de la zona del centro comercial

Archivo: [`mcdonaldsArgana.js`](../../mcdonaldsArgana.js).

- En los fotogramas **no sale** el rótulo: se buscó el rojo y el amarillo de los arcos
  en las 2.902 imágenes de los tres vídeos y no aparece. Así que la posición es la del
  restaurante real (28,9727 · −13,5626 → x −1223, z −1135, el nodo de OpenStreetMap) y
  la planta, la del edificio de la foto aérea: la nave suelta de 26 × 30 m de la parcela
  de entre el Burger King y el Mercadona.
- Lleva el cajón claro, la cristalera con la visera, el rótulo rojo de la fachada, el
  mástil con los arcos en la esquina y el aparcamiento con las plazas pintadas.

### La gasolinera Repsol de la glorieta (lo que faltaba del solar)

Archivo: [`gasolineraTenderete.js`](../../gasolineraTenderete.js).

- La marquesina, los surtidores y la torre de precios ya los pone `world.js` con el
  resto de estaciones. Aquí van el arriate de grava con el bordillo bajo, el seto, el
  arranque de palmeras y las dos farolas del lado de atrás.
- El juego recoloca la estación antes de pintarla (el nodo de OSM cae dentro de la nave
  de al lado), así que las piezas se cuelgan de la posición ya colocada.

### La Ortopedia Carmen — Carretera de San Bartolomé 5

De la foto de Google Maps de **julio de 2019** (solo se mira; no entra en el juego, y la
gente de la foto no se pone). Archivo: [`ortopediaCarmen.js`](../../ortopediaCarmen.js).

- El bajo de la pared gris clara con el **recerco de granito gris** alrededor del hueco.
- Dentro del hueco, el **marco rojo**, la **caja roja de la persiana** subida y la entrada:
  dos hojas fijas de cristal con marco rojo y la puerta abierta en medio, con la tienda
  blanca y luminosa al fondo (el mostrador y las sillas de ruedas). Los papeles pegados en
  los cristales y el buzón blanco de la derecha.
- Los **dos escalones de granito** de la entrada.
- Encima, el rótulo: el **logo redondo verde azulado con el árbol blanco**, «ortopedia» en
  letras finas con su raya y «CARMEN» en letras blancas grandes.
- Se quita el rótulo genérico «Ortopedia Carmen» del mapa (`tuneOrtopediaCarmen`); el
  rótulo no abre ningún local ni monta terraza. El bloque se queda como está.

### Dos Cabras (la fábrica de cerveza) — Carretera de San Bartolomé, junto a la LZ-20

De la vista de la calle de Google de **julio de 2025** y la foto del portón de **febrero de 2023**
(solo se miran; no entran en el juego). Archivo: [`dosCabras.js`](../../dosCabras.js).

- La nave blanca, **más alta que el local de al lado**, con su albardilla gris oscura. Va en el
  trozo del bloque donde cae el rótulo del mapa (unos 10 m) y tapa lo genérico de ese trozo.
- El bajante gris de la esquina, las **dos cajas color crema de los contadores** con su tubo y el
  piloto rojo de la alarma, arriba.
- El **portón seccional blanco de lamas** con su marco de acero, el dibujo de la cabra en negro,
  «DOS||CABRAS» y «LANZAROTE | CRAFT BEER»; a la derecha, la **puerta blanca pequeña**.
- El concesionario de coches de al lado no se pone (lleva la marca en la fachada).
- Se quita el rótulo genérico «Dos Cabras» del mapa (`tuneDosCabras`); el rótulo no abre ningún
  local ni monta terraza. El bloque se queda como está.

### La Churrería Fontanales de Argana — Calle Tajaraste 24

De la foto de Google Maps de **agosto de 2016**, la única de fuera (solo se mira; no entra en el juego, y la
gente de la foto no se pone). Archivo: [`fontanalesArgana.js`](../../fontanalesArgana.js).

- La **visera corrida** color crema de la planta baja y, debajo, la pared crema (tapa lo genérico).
- La **terraza cerrada de dos tramos**: el faldón naranja arriba, el plástico transparente y el panel
  naranja abajo, con una mesa de hierro negro y dos sillas en cada tramo; entre los dos, la entrada
  abierta con su faldón, la puerta de cristal de marco oscuro al fondo y otra mesa.
- Encima, sobre sus escuadras de acero, el **letrero azul de borde blanco** con la taza en su círculo
  dorado, «CHURRERIA - HAMBURGUESERIA» y «FONTANALES» en dorado.
- El letrero del otro local de al lado no se pone (en la foto no se lee bien el nombre).
- Se quita el rótulo genérico «Cafeteria Fontanales» del mapa (`tuneFontanalesArgana`), y con él la
  terraza genérica de sombrilla; el rótulo no abre ningún local. El bloque se queda como está.

### El Arepa's Factory — Calle Polca 16 (en la esquina)

De la vista de la calle de Google de **julio de 2025** (solo se mira; no entra en el juego, y la gente de la
foto no se pone). Archivo: [`arepasFactory.js`](../../arepasFactory.js).

- La casa color arena con el **zócalo gris** (tapa lo genérico del bajo de ese trozo).
- En la esquina, el **letrero negro alargado** con las dos flechas rojas, «AREPA'S» y «FACTORY» en blanco y las
  rayas amarilla y verde de los cantos; a su izquierda, el **letrero negro cuadrado** con el logo redondo.
- Debajo, la **ventana de aluminio blanco** con el local por dentro.
- A la izquierda, la **terraza cerrada** con el toldo azul de brazos, los paneles de plástico con su
  cuadrícula blanca y el bajo gris, con dos mesas y sus sillas; y en la esquina, la **farola negra de farol**.
- El rótulo del mapa caía unos 9 m antes de la esquina y Google lo pone más allá; la foto lo deja claro: el
  local es el de la esquina. Se quita el rótulo genérico «Arepas Factory» (`tuneArepasFactory`) y con él la
  terraza genérica de sombrilla; el rótulo no abre ningún local. El bloque se queda como está (en el juego
  tiene una planta más que la casa de verdad).

## El Hospital Dr. José Molina Orosa (Version 130, hecho)

Archivo: [`hospitalMolinaOrosa.js`](../../hospitalMolinaOrosa.js) (`tuneHospitalMolinaOrosa`, `buildHospitalMolinaOrosa`).
Sacado de la vista de la calle de Google de **julio de 2025** desde el vial de la entrada (solo se mira).

- La fachada larga del oeste (164 m, de norte a sur): abajo las ventanas corridas de carpintería verde; arriba las
  logias hondas con barandilla de cristal verde y dos arcos de medio punto (s 77 y 111); el extremo del sur con
  ventanas verdes enrasadas. Se adelanta 1,9 m sobre el mapa para que las logias tengan fondo.
- La carpa de la entrada (tejado a cuatro aguas crema sobre pilares grises, s 87), los parterres de picón con cactus,
  las palmeras y los mástiles con las banderas de España y de Canarias (el tercer mástil no se pone: no se ve bien qué
  bandera es).
- El bloque pasa a blanco y a 8,6 m. Se quita el rótulo del mapa «Hospital General de Lanzarote» (nombre viejo); en la
  fachada de verdad no se ve ningún rótulo, así que no se pone ninguno.
- El lado del este (vista de 2014: pared blanca con ventanas de pavés verde y barandilla roja) lo pinta el juego.

### Lo que se apuntó antes de hacerlo

Acordado con José Manuel: **el bloque principal y su entrada** (como se hizo con la Escuela
de Pesca). El resto del complejo (Urgencias, Consultas, aparcamientos) sigue saliendo del mapa.

- **El bloque, en coordenadas del juego:** centro en **x −1595, z −1325** (lat 28,9744 ·
  lon −13,5664), 17.356 m² de planta, 8 m de alto, 15 esquinas. Es el edificio más grande
  de la zona; alrededor están Calle Santiago Alemán (137 m), Carretera San Bartolomé
  (145 m) y Calle Sabin Berthelot (153 m).
- **Nombre del rótulo:** «Hospital Dr. José Molina Orosa» (el oficial, el de `places.js`).
  El mapa trae otro rótulo en el edificio, «Hospital General de Lanzarote»: se quitará
  cuando la fachada nueva esté puesta.
- **Cómo se hará:** un archivo nuevo `src/hospitalMolinaOrosa.js` con `tuneHospital(map)`
  (quita la fachada genérica del bloque) y `buildHospital(scene, colliders)`; se llama
  desde el `prepararMapa()` y el `construir()` de este barrio.
- **Falta:** las fotos de la fachada. Los vídeos del 25/10/2026 son del recorrido de
  Tenderete y **no pasan por el hospital**, así que no sirven para esto.

## Fotos reales en las fachadas (Version 85)

Pipeline: `src/facadePhotos.js` + manifiesto `public/map/argana_assets.json` +
texturas en `public/textures/argana-alta/fachadas/`.

- **Una sola foto activa**, y es la que se puede pegar de verdad:

  | Foto | Edificio de destino | Tamaño en el muro |
  |---|---|---|
  | `04-garaje-blanco.jpg` | el bloque de dos plantas de la calle Tenderete (pared de −1241, −1471) | 3,0 × 2,3 m |

- **Tres fotos descartadas** (quedan en el apartado `rejected` del manifiesto, con
  el motivo, para no volver a colarlas):
  - `01-casa-blanca-dos-plantas.jpg`: no es una fachada. El recorte lleva una farola
    en medio, la señal de prohibido el paso, cielo arriba y el edificio de al lado;
    sobre un muro se ve como un cartel pegado.
  - `02-muro-blanco-puerta-verde.jpg`: la puerta sale en 375×540 px para 3,4 m de
    ancho; ampliada se ve borrosa.
  - `03-estacion-sprint.jpg`: es la tienda de la estación de servicio (que ya tiene
    modelo propio) y además lleva una farola cruzada.

- **Cómo se engancha:** el manifiesto dice el punto que cae dentro del edificio
  (`buildingAt`), el punto de la pared que da a la calle (`wallAt`) y hacia dónde
  mira (`facing`). El código busca la pared, comprueba que la normal sale hacia
  fuera (mismo criterio que `world.js`), **comprueba que hay calle delante** (a 1,6 ·
  3 · 6 · 9 m no puede haber otro edificio: antes se elegía una pared metida dentro
  de la manzana y la foto quedaba escondida tras la fachada de al lado) y pega la
  foto a 16 cm del muro, por delante de la cornisa. Detrás lleva un respaldo liso
  del color del edificio para que no se vean las ventanas genéricas por los bordes.
- **Perspectiva:** el portón se ha rectificado con una homografía desde las cuatro
  esquinas del fotograma `IMG_5113/f_0008.jpg` (ahora sale derecho, con sus paneles
  y sin el borde negro del marco).
- **Marco:** la foto de puerta lleva un marco de 9 cm color hueso; así el borde
  difuminado queda tapado y se lee como un hueco en la pared, no como un póster.
- **Rendimiento:** las texturas se cargan por cercanía (120 m) y se sueltan al
  alejarse (170 m). En esta zona hay **un plano y una textura** (512×392) en la GPU.
- **`IMG_5153` no se usa:** es una calle en movimiento (cielo, calzada, una moto).

## El Palacio de Deportes (Version 130)

Archivo: [`palacioDeportes.js`](../../palacioDeportes.js) (`tunePalacioDeportes`, `buildPalacioDeportes`); ayudas
comunes en [`kitFachada.js`](../../kitFachada.js). Vista de la calle de Google de **julio de 2025** desde la calle
Seguidilla (solo se mira).

- Caja de 16 m: zócalo color arena rosada de placas con la fila de ventanitas cuadradas, cornisa blanca, chapa gris
  de nervios con ventanales altos y estrechos, letras azules «PALACIO DE DEPORTES ARRECIFE» (se leen en la foto), la
  rampa con muro bajo y barandilla negra, el zócalo de ladrillo del este y la torre de la escalera de cristal en la
  esquina del oeste.
- Los otros tres lados no salen en la foto: zócalo y chapa lisos.

## Pendiente

- Es el barrio más grande en edificios sin fachada propia (el hospital y el Palacio ya están).
- El vídeo pasa por la zona del McDonald's y por la gasolinera, pero hay rótulos que no
  se llegan a leer en los fotogramas (el edificio de neumáticos de al lado de la
  gasolinera, por ejemplo): sin una foto clara no se les pone nombre.

## Relleno de la franja que faltaba (Version 90)
- `src/rellenoArgana.js` (`tuneRellenoArgana`) mete las calles y casas reales de OpenStreetMap entre la Calle Luján Pérez y el campo de arriba, que antes eran arena.
- Datos en `rellenoDatos.js`, generados con `node tools/argana-relleno.mjs` desde `tools/osm/argana-relleno.json`. No se tocan a mano.
- Se salta lo que ya está (calles casi enteras a menos de 14 m de otra y casas que pisan otra casa o la calzada).

## Desniveles y puentes (noviembre de 2026)

- `../../desniveles/argana-alta.js` (con `desniveles/comun.js`), al principio de `prepararMapa`: deja
  las cuestas del barrio en un 12 % más o menos.
- Los dos enlaces de la Carretera de San Bartolomé (calle Ico y calle Tajaraste) están en
  `../../trinchera.js` (`TRINCHERAS`): la carretera pasa hundida y la calle cruza por el puente.

## Calle a calle (Version 122)

- `calles.js` (`tuneCalles`): las casas de la parte de abajo del barrio (Luisa Linares, Martínez Montañés, Safantía
  y alrededor) con las vistas de la calle de Google y el kit de Altavista (`../altavista/kitCalles.js`).

## Calle a calle, la parte de arriba (Version 124)

- `arriba.js` (`tuneArriba`, bandera `map.arganaArriba`): Seguidilla, Mazurca, Polca, Saltona, Malagueña, Isa, Folias,
  Zaranda, Miguel Hernández, Felo Monzón, Santiago Amón, Valle Inclán y alrededores con las vistas de Google y el kit de
  Altavista. Rótulos: Multicentimo, Bar Pizzería, Aluminios, Bar Cafetería El Barrio y Autoescuela Marco. Faltan unos 93
  tramos sin vistas de Google cerca. Los colegios (Alonso Quesada) y las canchas se dejan como estaban.

## Repaso contra la foto oficial (Version 147)

Con la ortofoto del IGN (WMS, ver `../../campoReal.js` en CLAUDE.md) se ha comparado el mapa del juego de la
circunvalación a la Calle Tenderete y del hospital al Centro Comercial Argana. Arreglado: el HiperDino y el
MediaMarkt (estaban en el solar de al lado), las marquesinas del aparcamiento del Mercadona de abajo
(`../../mercadonaMarquesinas.js`, eran bloques de pisos), las naves del desguace de detrás del hospital y la
depuradora de detrás del Decathlon (`../../arganaFaltaba.js`). Falta repasar igual el resto del barrio.
