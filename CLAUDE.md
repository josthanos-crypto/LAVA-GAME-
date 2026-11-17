# Lava Game (antes «Arrecife a Todo Gas»)

Juego web de conducción estilo GTA por las calles reales de Arrecife, con los
negocios de los clientes de José Manuel Pérez Cabrera (Canary Consulting) por
dentro. Empezó como medio juego y ahora va a ser un **proyecto de publicidad**:
los negocios salen en el juego. La idea es ampliarlo a toda Lanzarote; de
momento solo es Arrecife.

El nombre elegido por José Manuel es **Lava Game** (ya puesto en la Version 12).

## Para empezar: el juego está partido por barrios

El código de la ciudad está dividido en barrios para **no tener que leerlo entero
cada vez**. El índice es **`BARRIOS.md`** (en esta misma carpeta).

- Para tocar un sitio concreto, lee **solo** `src/barrios/<barrio>/LEEME.md` y su
  `index.js`. Ahí está lo que hay en ese barrio y qué archivos son suyos.
- Los barrios son: Arrecife Centro, Valterra, San Francisco Javier, Titerroy,
  Argana Alta, Altavista, Maneje, Playa Honda y Compartido (lo de toda la ciudad).
- Lo nuevo de un barrio va en el `construir()` de su carpeta; lo que cambia el mapa
  (alturas, fachadas, quitar un bloque) en su `prepararMapa()`.
- El resto (tráfico, policía, misiones, HUD, sonido…) sigue en `src/` como siempre:
  es el mapa de abajo.

## Cómo trabajar con José Manuel

- Habla siempre en **español**, con palabras sencillas: no es programador.
  Explícale qué ha cambiado en el juego, no cómo está hecho.
- Le preocupa el gasto de tokens: lee solo los archivos que hagan falta para la
  tarea (el mapa de abajo dice dónde está cada cosa) y no recorras todo el código.
- Nada de nombres de modelos de IA en commits, PR, artefactos ni código.
- Los datos de los negocios (nombres, teléfonos, direcciones) los confirma él.
  Si sacas algo de internet, díselo y pregúntale. No inventes platos ni precios.
- Antes de dar algo por hecho, pruébalo en el navegador (más abajo, «Probar»).

## Cómo está hecho

- three.js 0.170 + Vite 6, sin framework. `npm install` y luego
  `npx vite build --base ./` (salida en `dist/`, con rutas relativas).
- `public/map/arrecife.json`: calles, edificios, rótulos, árboles... sacados de
  OpenStreetMap (ya procesados; desde este entorno OSM/Overpass no responde).
- Alturas del terreno: `python tools/alturas_calles.py` (desde `gta canarias/`) baja el MDT05 del IGN
  (LiDAR, 5 m, CC BY 4.0) y saca altura y pendiente de cada calle → `../data/alturas_calles.json` y
  `ALTURAS_CALLES.md`, y la malla del juego `public/map/terreno.json` (cada 10 m, base64). Desde la
  Version 22 el juego usa esas alturas (ver terrain.js).
- `public/ortho/` y `public/ortho-m/`: foto aérea del PNOA (4096 px; 2048 px para
  móviles). `public/mapillary/photos.json`: fotos de calle.
- Coordenadas del juego en metros: `x = (lon + 13.55) · 97398` (hacia el este),
  `z = (28.9625 − lat) · 111320` (hacia el sur). `pruebas/aerial.py x0 x1 z0 z1
  salida.png escala` recorta la foto aérea con edificios, calles y rótulos encima.
- En `index.html` está toda la interfaz (pantalla de inicio, HUD, menús, estilos).
- En el móvil (`body.touch`) hay menos peatones y coches y la calidad empieza en
  baja. Todo lo nuevo tiene que ir fluido en un móvil normal.

### Mapa del código (src/) — lo que no es de un barrio

Los archivos de cada barrio están en la ficha de ese barrio (`src/barrios/<barrio>/LEEME.md`).

| Archivo | Qué hace |
|---|---|
| main.js | Arranque, bucle del juego, cámara, teclas, HUD, une todo lo demás. Llama a los barrios (`prepararBarrios`, `construirBarrios`, `construirBarriosConLocales`) y guarda lo de cada uno (`centro.charco`, `valterra.office`, `comun.shops`). El bucle pide el siguiente fotograma antes de nada y si algo falla lo dice una vez y sigue (antes un solo error congelaba el juego). Si el navegador apaga el 3D por falta de memoria (`webglcontextlost`), sale el aviso «Sin memoria para los gráficos» y el botón recarga en la misma calle con calidad baja. Esc (o Menú en el mando) = pausa (`setPausa`). `terrainBase` sale de donde está el personaje |
| world.js | Ciudad a partir del mapa: suelo con la foto aérea, calles, edificios, farolas (`loadMap`, `buildWorld`, `setupLights`, `flatPoly`) |
| terrain.js | Cuestas: sube cada vértice a la altura del terreno en la tarjeta gráfica, con el relieve exagerado x2 por encima de 2,5 m (`terrainExag`, `KNEE`: la costa queda real; `?relieve=1` = sin exagerar). `realHeight` da la altura real (aviso «Sube un 6 %» y mapa). `tessellateFlat` parte lo plano (calzadas, aceras, plazas) en trozos de 6 m (8 en el móvil) y `userData.terrainSeg` baja el suelo de malla gruesa en las hondonadas (`TERRAIN_SAG`). Choques y peatones siguen en plano, pero el coche nota la pendiente (car.js) y la cámara se inclina un tercio con la calle (`camSlope`). Modos por material: `userData.terrain` = 'level' (agua), 'skirt' (muros de costa), 'ground' (suelo: no se dibuja sobre el agua), 'none' |
| memoria.js | Solo en el móvil: lienzos de 512 px o más a la mitad, sin relieve ni mapa de brillo (`slimTextures`, se repasa cada 4 s), y las formas de 40 000 vértices o más se sueltan de la memoria al subir a la tarjeta gráfica (`freeBigGeometry`). Pasa de ~400 a ~200 MB de imágenes y libera ~170 MB de formas |
| textures.js | Texturas pintadas por código (fachadas, asfalto, aceras...) |
| realism.js, dayNight.js, quality.js, cielo.js | Cielo, sol, nubes, posproceso, día/noche, calidad (tecla Q; si no llega a 24 fotogramas por segundo durante 8 s baja sola un escalón, ver `frame` en main.js), luna y lluvia |
| character.js | Los protagonistas (Noah, Michael, José e Iria; teclas 1–4, se empieza con Noah), andar a pie. Airam se quitó en la Version 71 (lo pidió José Manuel: no volver a ponerlo) |
| humanModel.js, humanHead.js, humanParts.js | El muñeco de las personas (cuerpo, cara, ropa, esqueleto) |
| andares.js, rasgos.js | (Version 133) `andares.js`: andar y correr con naturalidad sobre el esqueleto de humanModel.js (`andar(p, fase, { zancada, correr })`, `reposo(p)`); lo usan peds.js y character.js. `rasgos.js`: el tipo de cara de cada persona (`rasgosDe`): ocho de calle y una propia por protagonista (`cara` en el aspecto). `buildHuman({ detail: 0 })` es el cuerpo ligero (~2.300 triángulos) que peds.js enseña de lejos (`p.lejos`) |
| customizer.js | Menú de ropa y aspecto (tecla M) |
| peds.js, dialogue.js | Peatones y lo que dicen (en femenino si juegas con Iria) |
| fotoGente.js | Gente de foto: personas recortadas de fotos realistas (`public/gente/foto1-4.webp`) de pie en las aceras; se caen si las atropellas (`peds.onEvent` runover) |
| car.js, carModels.js, brand.js | Coche del jugador (choca con círculos a lo largo del coche y en las esquinas, `hitShape`; nota las cuestas: `SLOPE_G`, `followGround`, `slope`, `air`), modelos de coche, rótulos de Canary Consulting. Turbo salto (`boost`, coches con `JUMP`: el roadster Chispa Órbita): sube 20 m y cae en ~4 s; en el aire se corrige un poco; subiendo trepa por las fachadas y cae en los tejados. J o el botón Salto. Tejados (`surfaceAt`, `roofs` = tejados.js): se conduce por las azoteas, se baja por el borde cayendo, y en alto (`air` > 1,2 m o en un salto) solo chocan las paredes de los edificios más altos; `air` = altura sobre la calle, `gap` = sobre lo que pisa. Motos (`LEAN`: se inclinan hacia dentro de la curva). O / B / U traen el roadster, la moto y el quad (main.js `parkVehicle`, `GARAGE`) |
| tejados.js | Los tejados para conducir por encima: altura de la azotea de cada edificio del mapa (`heightAt`) y choques solo con las paredes que sobresalen por encima del coche (`contacts`) |
| motos.js | Moto Tinajo Rayo 650 y quad Malpaís Jable 450 (marca, modelo y colores en carModels.js `BIKES`): `makeBike` devuelve lo mismo que `makeCar`, así el tráfico, los aparcados y el jugador las usan igual. Los del tráfico llevan piloto con casco; si la llevas tú, va tu personaje con casco (main.js `syncRider`, `ridePose`) |
| carKit.js | Sin intermitentes desde la Version 71 (José Manuel no los quiere: `addIndicators` no pone nada), puerta del conductor que se abre al subir y bajar (`swingDoor`; el roadster, `doorUp`, lleva las dos puertas de tijera desde la Version 151: bisagra delante, suben girando hacia arriba y delante, con su amortiguador; José Manuel no las quiere como alas), puesto del conductor para la primera persona (`addCockpit`) y cartel de marca y modelo al subirte |
| puenteRayas.js, caraArriba.js | (Version 134) `puenteRayas.js`: asfalto y rayas de carril en los puentes de trinchera.js, siguiendo las calles del mapa (`buildPuenteRayas(scene, map, ['Cabildo'])` desde el barrio): en una 'trinchera', el tablero y la calle de abajo; en un 'terraplen' (Tenderete), la carretera de arriba y la losa del túnel. Lo que va sobre una losa recta se pega a ella con `sobreLosa`. También da `cinta`, `desplazar`, `recortar` y `malla` para pintar rayas que sigan una calle. `caraArriba.js`: da la vuelta a los triángulos de calzada que quedan del revés (si no, agujeros con forma de cuña por los que asoma la foto aérea) |
| aldiAparcamiento.js, mcdonaldsAparcamiento.js, navesLados.js, lidlRepsol.js | (Version 134) Plazas en línea delante del ALDI; el aparcamiento del McDonald's de Argana (plano, sigue el terreno, no pisa la calle); la trasera y los costados del Burger King y el Decathlon (`vestirLados`, lo llama arrecifeExtras.js); y el Lidl de la carretera de San Bartolomé con su Repsol (marquesina en su sitio) y el lavadero de coches |
| aparcamientosTenderete.js | (Version 135) Aparcamientos de la zona comercial de Tenderete: firme y plazas en batería en los solares de la lista `SOLARES` (McDonald's/Mercadona, Mercadona de abajo, Burger King y Decathlon, medidos sobre la foto aérea) y el carril del autoservicio (`AUTOSERVICIOS`) dando la vuelta al McDonald's y al Burger King. No pinta sobre calle, acera ni edificio. Para otro aparcamiento de esa zona, añadir una línea a `SOLARES`; para otro sitio, `buildAparcamientos(scene, map, { nombre, solares, autoservicios, zona })` (Version 140) |
| hospitalAparcamiento.js | (Version 140) Los aparcamientos del Hospital Molina Orosa: la franja de delante de la fachada (con marquesinas de sombra) y la explanada de abajo, con `buildAparcamientos`. La franja se queda corta por el lado de la ITV, que tiene su valla ahí |
| parqueComercialPuerto.js | (Version 141) El parque comercial de la salida a Costa Teguise (calles Océano Atlántico, Pacífico e Índico y Carretera de los Mármoles; no es de ningún barrio, se llama desde `compartido`): IKEA (caja azul con letras amarillas, entrada y aparcamientos), Electron (rótulo grande), las seis canchas de pádel de detrás de Electron y los aparcamientos de delante de las naves. Las demás naves, sin nombre hasta que José Manuel diga qué empresa es cada una |
| parqueComercialEmpresas.js, rotulosTenderete.js | (Version 142) Los carteles con el nombre de las empresas: `buildRotulosEmpresas(scene, map, lista, zona)` cuelga cada cartel en la pared de la nave más cercana que da a una calle (lista de `[nombre, x, z]`; con `'farmacia'` al final, cartel verde con la cruz). `parqueComercialEmpresas.js` lleva las 32 del parque comercial de IKEA y `rotulosTenderete.js` la farmacia de la esquina con Saltona y el café de la Repsol. **Nombres y sitios sacados del mapa de Google Maps (16/11/2026): José Manuel tiene que repasarlos.** Multicentro y Comercial Zonzamas: ver rotulosArgana.js (Version 143) |
| ccArgana.js, rotulosArgana.js | (Version 143) `ccArgana.js`: el Centro Comercial Argana (nave con placas solares, entrada, nombre, aparcamiento y los carteles de sus tiendas), la nave de Deko Hogar al otro lado de la calle Iguazú, la de Kiwoko detrás y la nave sin nombre que sigue calle arriba. Ninguno venía en el mapa: `tuneCcArgana` mete los cuatro bloques (bajos, para el choque) y `buildCcArgana` levanta la nave por fuera (medidas en `NAVES`). `rotulosArgana.js`: carteles de otros negocios de la zona (lista `ARGANA`). **Nombres sacados de Google Maps (17/11/2026), sin confirmar por José Manuel**; Deko Hogar es, casi seguro, su «seco hogar». (Version 144) Multicentro y Comercial Zonzamas llevan su cartel por delante de las fachadas del 928 Hybrid Club y de Mitsubishi (el quinto dato de la línea es cuánto sale de la pared). Arriba de `rotulosArgana.js` están los que NO llevan cartel (Cocodelanz, MultiMotor, Hortofrutícola Altavista) |
| campoReal.js | (Version 145) El campo de arriba (Maneje: la casa del camino de tierra) en su sitio de verdad. El suelo es la ortofoto oficial del IGN (`public/campo/campo.jpg` y, alrededor de la casa, `public/campo/casa.jpg`; PNOA, CC BY 4.0) y todo lo que había (casaCampo.js, caminoAnmara.js) se recoloca sobre ella sin rehacerlo: `mover(x, z)` da el sitio real de un punto antiguo según los puntos de control `CONTROL` (en el caserío, 53,5 m al oeste y 33,5 m al norte); `recolocarCalles` / `recolocarCasas` para los datos y `escenaReal(scene)` / `choquesReales(colliders)` para lo que se construye. **(Version 152) La casa de José Manuel es la de la esquina sureste del caserío, en (-2002, -3305): lo confirmó él, y es donde caía su enlace de Apple Maps; la casa del tejado rojo es una vecina.** La casa no se mueve (casaCampo.js ya la tenía en su sitio) y el patio con el garaje se giran un cuarto de vuelta al sur (`grupoPatioReal`, `alPatioReal`, `enCasaReal`); solo el resto del caserío lleva el desplazamiento. `ACTIVO = false` lo deja como antes. Para mirar la zona: el servicio WMS del IGN (`www.ign.es/wms-inspire/pnoa-ma`, capa `OI.OrthoimageCoverage`) da la foto de cualquier rectángulo. (Version 146) El relieve de esa zona es el de verdad: `public/map/terreno-norte.json` (MDT05 del IGN para la franja del norte, lo genera `pruebas/terreno_norte.py`) y `relieveNorteReal` en terrain.js, que lo pone encima de lo que rellenaba `extendNorth` |
| casaParcela.js | (Version 153) La parcela de la casa de José Manuel, de la casa hacia el sur, en su sitio de verdad (medida sobre la ortofoto del IGN y los fotogramas `IMG_5113` de la llegada): el bloque blanco del fondo en L (`GARAJE`, `PASO`, `CUARTO`) con la puerta seccional del garaje mirando al **oeste**, la explanada de grava gris, el muro del sur que da a la pista (óxido, macetas, mesa, casco de barca, palés) con **el árbol en la esquina sureste**, y el patio (baldosa, piscina con su entrada al norte, césped al este, pérgola de chapa, busto, delfines, cancela junto al garaje). `buildParcela(scene, colliders, { delfin, oxido })` lo llama casaCampo.js en vez del patio girado; `tuneParcela(map)` (desde el barrio de Maneje) deja la casa vecina del oeste en una planta. La terraza de la casa va en la cara sur (`TERRAZA` en campoReal.js) |
| tendereteAvenida.js, rotondaConcha.js | (Version 154) Del recorrido Repsol → casa grabado por José Manuel (`recursos\argana alta\argana-alta-frames\IMG_5153`, guía en `argana-alta-prompt.md`). `tendereteAvenida.js`: la Calle Tenderete, de la circunvalación a la rotonda de la Repsol, como avenida de 18 m (dos carriles por sentido, mediana con tierra roja y farolas, coches aparcados en línea que pasan a `map.lotSpots`); `tuneTendereteAvenida(map)` ensancha los tramos (`esAvenida`) y `buildTendereteAvenida` pone la mediana, que se abre en cruces y pasos de peatones. `rotondaConcha.js`: la jardinera blanca en forma de concha y el adoquín rojo de la rotonda de la Repsol (escultura `concha` en `SCULPTURES` de places.js; la llama roundabouts.js). Además, casaParcela.js lleva la pista de tierra de la llegada (`PISTA_GARAJE`) y el sitio de inicio «Camino de tierra» cae delante del garaje. **Falta**: la calle estrecha de Argana Alta con coches a los dos lados y las fachadas una a una (solo se miraron 20 fotogramas de 513) |
| mercadonaMarquesinas.js, arganaFaltaba.js | (Version 147) Argana comparada con la ortofoto oficial del IGN. `mercadonaMarquesinas.js`: las tres marquesinas de sombra del aparcamiento del Mercadona de abajo (el mapa las traía como edificios). `arganaFaltaba.js`: lo que no venía en el mapa — las naves del desguace de detrás del hospital (lista `NAVES`: una línea por nave) y la depuradora de detrás del Decathlon. Además, el HiperDino y el MediaMarkt (hiperdinoArgana.js, centroComercialArgana.js) están movidos a la nave de verdad: la planta de OpenStreetMap es la de la nave vieja (`MOVER`, `CENTRO_OSM`). **Cómo se repasa una zona**: se baja la foto del WMS del IGN, se pinta encima el mapa del juego y se mira qué falta o sobra; revisado de la circunvalación a Tenderete y del hospital al C.C. Argana, falta el resto del barrio |
| ramblaArboles.js, ramblaFaltaba.js | (Version 148) `ramblaArboles.js`: el paseo central de la Rambla Medular con sus dos filas de árboles, plantado solo a partir de las calzadas del mapa que se llaman «Rambla Medular» (445 árboles en dos mallas; la mitad en el móvil). `ramblaFaltaba.js`: lo que no venía en el mapa a lo largo de la Rambla, medido sobre la ortofoto del IGN — los edificios de junto a la Comisaría de la Policía Nacional (`PLANTAS`, `CASETAS`), el cuartel Marqués de Herrera (`NAVES`), el aparcamiento de verdad del ALDI (al sur de la tienda, con marquesina) y los rótulos de la zona de la comisaría (`ROTULOS`, **de Google Maps, sin confirmar**). Se llaman desde `compartido`. Repasados contra la foto y sin cambios: Altavista y el Castillo de San Gabriel |
| ramblaGimnasio.js, sanJoseJardin.js, faltabaCiudad.js, playaHondaFoto.js | (Version 149) Repaso de todo el juego contra la ortofoto del IGN. `playaHondaFoto.js`: la foto aérea oficial como suelo de Playa Honda (`public/honda/`; cambia la textura del grupo `sueloFinoHonda` de world.js, sin tocarlo). `faltabaCiudad.js`: naves que no venían en el mapa (nordeste de Arrecife y Playa Honda; una línea por nave). `ramblaGimnasio.js`: las máquinas de hacer deporte del paseo de la Rambla (seis grupos repartidos solos; `SITIOS` para ponerlos donde diga José Manuel). `sanJoseJardin.js`: las matas del jardín de picón del Castillo de San José. Además, volcano.js: el ancla del volcán está tres veces más lejos (`LEJOS`), porque caía encima de Playa Honda. (Version 150) `norteFoto.js`: la foto aérea oficial de la franja del norte de Arrecife (`public/norte/`; abre un hueco en el suelo general con `map.groundHoles` y pone su suelo en teselas). Repasada ya la planta de todo el mapa (también El Cable y el sur de Playa Honda, sin cambios); **las fachadas no se han podido repasar** (hacen falta fotos a pie de calle) |
| bazarArgana.js | (Version 136) El bazar de la esquina de la carretera de San Bartolomé con Tomás Morales, frente al C.C. Argana y junto a Dos Cabras: nave que no venía en el mapa, medida sobre la foto aérea. **Nombre sin confirmar** (José Manuel cree que «Seco Hogar»): el rótulo dice solo «BAZAR»; se cambia en `NOMBRE`. (Version 143: la tienda de hogar que recordaba es, casi seguro, Deko Hogar, que está en ccArgana.js; esta nave no se ha tocado, falta que diga qué cartel lleva) |
| itvArgana.js | (Version 137) La estación de ITV de la subida a San Bartolomé, entre la carretera y el Hospital Molina Orosa: nave con tres líneas que se cruzan con el coche (fosos, rodillos, números de línea), caseta, poste y filas de espera pintadas. Solo pone «ITV»: sin empresa, horarios ni precios. Lo tumbado en el suelo va en trozos de 4 m (`tira`) para que suba con el terreno. (Version 138) El recinto: firme, aparcamiento entre la nave y la carretera, la valla de rejilla que lo rodea (choca) y la puerta abierta en la punta de abajo, junto a la nave de Remar, que lleva el rótulo «REMAR» (Version 139: Remar está por DEBAJO de la ITV, bajando hacia Arrecife; lo corrigió José Manuel). Las medidas del recinto están arriba del archivo (`VALLA_V`, `PUERTA`, `REMAR_S`…) |
| ruedas.js, cocheDetalle.js, cocheAdornos.js, cocheLejos.js, matriculas.js | Detalle de los coches (Version 133). `ruedas.js`: neumático con dibujo y llanta con radios, tuercas y disco (`ruedaFina`), y la rueda de pocos triángulos (`ruedaLejos`). `cocheDetalle.js`: lunas (`LUNA`), suciedad (`ensuciar`), dónde caen faros y pilotos (`focos`), su cristal (`tulipas`), el resplandor de noche (`halos`) y la pinza de freno. `cocheAdornos.js`: juntas, gomas, limpias, retrovisores, tercera luz de freno, antena y faldón, fundidos en la carrocería. `cocheLejos.js`: la carrocería ligera (~1.600 triángulos, 4 llamadas) que carModels.js enseña a más de 32 m (20 en el móvil) con `userData.setDist(d)`; la llaman traffic.js y parked.js. `matriculas.js`: matrículas inventadas con portamatrículas |
| marcas.js | Marcas de coche inventadas: emblema dibujado de cada una (`drawLogo`, `logoCanvas`) y su lema. Los coches se parecen a los reales, pero ni nombres ni logos son de marcas reales |
| traffic.js, parked.js, roadGraph.js | Tráfico, coches aparcados que se roban, rutas por las calles |
| police.js, combat.js, waterCannon.js | Policía y estrellas, disparos, la tanqueta de agua |
| missions.js, acampada.js, acampadaSite.js | Encargos (columnas de luz: reparto, carrera, esquinazo y ¡Erupción!, en la que un muro de lava, `lavaWall`, y el mar de lava que deja, `lavaLake`, avanzan desde detrás de ti hasta que llegas a la zona segura) y la misión principal (la acampada del Parque Islas Canarias, que es de Arrecife Centro) |
| minimap.js | Minimapa redondo tipo GPS (ruta de la misión, locales con su letra) |
| bigMap.js | Mapa grande (G, tocar el minimapa o ··· → Mapa): Arrecife entero, buscador de calles y negocios, «Ir aquí» pone el coche en la calzada; bloqueado con policía, misión o tanqueta (`travelBlock` en main.js); el juego se para mientras está abierto; botón «Relieve» (R) |
| locales.js, interiorKit.js | Entrar en los locales (F), interiores, hablar con la gente (T) |
| localesData.js | Lista de locales; datos en localesComida.js, localesBuganvillas.js, localesArroyo.js, localesCommon.js |
| localesOpenMall.js, openMallDatos.js, openMallMuebles.js | El Open Mall por dentro (Version 114): vestíbulo, dos paseos al aire libre, la plaza con el parque infantil y el patio de comidas, y el HiperDino al fondo; los locales del directorio de su web (openMallDatos.js), el mobiliario por tipo de tienda (openMallMuebles.js) y los rótulos en un solo lienzo. Cada silla de la plaza pide a su restaurante (`seat.order`, `orderFor` en locales.js) |
| terrace.js, dogs.js, skaters.js | Terrazas techadas del Reducto, perros salchicha, gente en patineta |
| props.js, collision.js | Mobiliario que sale volando, choques (`rayHit`: la cámara no entra en los edificios, `pullCamera` en main.js) |
| sentidos.js, marcasViales.js | Carriles (`r.lanes`) y velocidad máxima (`r.vmax`: OpenStreetMap o la legal, `limiteUrbano`) de cada calle; STOP, ceda y semáforos de OpenStreetMap (`roads._sen`, los usa senales.js). Sentido de cada calle (`r.ow`, de OpenStreetMap: `public/map/sentidos.json`, `tools/sentidos.mjs`), pasos de peatones (`crossings`, reales y provisionales), dónde hay calzada (`Calzada`) y la pintura: flechas, líneas de detención y ceda, pasos. El tráfico, las señales y la gente leen lo mismo. Pendientes en `PENDIENTES-vial.md` |
| paradasGuagua.js | Paradas de guagua reales (OpenStreetMap, `map.sentidos.paradas`): marquesina o poste con la placa del nombre, en su lado de la calle; las guaguas paran en ellas (`road._paradas`, traffic.js). Las hechas a mano (paradasRambla.js y otras) no se repiten |
| gasolineraManeje.js | El bar de la gasolinera de Maneje (Version 108): fachada y terraza fuera, bar + comedor + cancha de bola canaria dentro (local `GASOLINERA_MANEJE` en localesData.js), con la conversación que se oye al acercarse a la mesa (`plan.overhear` y el gesto de asombro `n.shock` en locales.js). El suelo `arena` está en interiorKit.js |
| plantas.js | Altura real de los edificios (Version 105): plantas del Catastro (`public/map/plantas.json`, `tools/catastro_plantas.py`) → `b.h` y `b.plantas` (`b.hOsm` guarda la vieja). Va en loadMap, antes de los barrios: las alturas a mano mandan |
| ajusteCalles.js | Aceras libres (Version 102): estrecha las calles a lo que dejan las fachadas (`r.wOsm` guarda la anchura vieja), echa atrás la cara de los edificios que siguen pisando la acera (`b.movido`; no toca skip/ownFront/ownRoof) y mide la acera de cada lado hasta la fachada (`r.aceraL`, `r.aceraR`). Se llama al final del prepararMapa de compartido. `acerasTapadas(map)` da el % por barrio |
| aceras.js | Dónde hay acera (`walkRise`): el coche del jugador sube el bordillo rueda a rueda y la carrocería lo sigue con muelle y amortiguador (`suspension` en car.js) |
| save.js | Todo lo que se guarda en el navegador; en la demo no se lee ni se guarda nada |
| stones.js | Piedras de lava escondidas (puertas de los clientes + aceras), guardadas en localStorage `lava.stones`. Al reunirlas todas se desbloquea el coche Lava (`lava.coche`; `MODELS.lava` en carModels.js, `lavaGlow` y la tecla L en main.js; `?lava` en la dirección lo da desde el principio, para probarlo) |
| touch.js, input.js | Controles del móvil, del teclado y del mando: cada botón del mando pulsa una tecla del juego (`PAD_KEYS` en input.js) y el stick y los gatillos van como el joystick táctil |
| sound.js, audio.js, ambience.js | Sonido (motor, ciudad, olas) y el botón de silencio |
| startPlaces.js | «¿Por dónde quieres empezar?»: sitios, buscador de calles (`findStart`) y coche en la calzada mirando a lo largo de la calle (`carSpot`); entiende faltas (`nameScore`: «macarroni», «tanatoryo») y las palabras de cada local (`keys`) |
| streetPhotos.js, facadePhotos.js | Fotos de calle de Mapillary (quitas los paneles flotando: main.js los pone a `null`) |
| places.js, extraData.js | Sitios con nombre y datos añadidos al mapa (playa del Reducto, rotondas, palmeras) |

### Los barrios

Cada barrio está en `src/barrios/` con su `index.js` y su ficha. Índice completo,
límites y qué hay en cada uno: **`BARRIOS.md`**.

| Barrio | Carpeta | Lo que se toca ahí |
|---|---|---|
| Arrecife Centro | `arrecife-centro/` | Charco, Calle Real, San Ginés, San Gabriel, Ayuntamiento y alcalde, Atlántida, Casa Fajardo, Maccheroni, Reducto, Buganvillas y Manolo Millares |
| Valterra | `valterra/` | Escuela de Pesca y su trasera, Hospital Insular y su parking, Comisaría, parque del dinosaurio, Tanatorio Arroyo, Castillo de San José |
| San Francisco Javier | `san-francisco-javier/` | el puente del Cabildo |
| Titerroy | `titerroy/` | la Delegación del Gobierno |
| Argana Alta | `argana-alta/` | HiperDino y MediaMarkt, McDonald's, Lidl y su Repsol, aparcamientos de Tenderete, ITV, hospital Molina Orosa, el Centro Comercial Argana con Deko Hogar y Kiwoko, y los carteles de los negocios de la zona |
| Altavista | `altavista/` | de momento nada hecho a mano |
| Maneje | `maneje/` | el campo de arriba y el camino de Anmara |
| Playa Honda | `playa-honda/` | Conforama, B3RICEJ, el concesionario y la entrada por la LZ-301 |
| Compartido | `compartido/` | costa y mar, aeropuerto, naturaleza, señales, rotondas, civic, tiendas, detalles de azoteas |

`window.__game` (en main.js) da acceso a todo desde las pruebas: `onFoot.placeAt(x, z, rumbo)`,
`toggleFoot()`, `setTime(h)`, `camOverride = { pos, look, fov }` para fotos, `locales`, `dogs`...

### Añadidos del PC de Arrecife (public/extras y src/arrecifeExtras.js)

Lo que se hizo en el PC de Arrecife encima del juego compilado está en el código. Antes del juego van
`public/extras/arrecife-norte-datos.js` y `public/extras/arrecife-mapa.js` (cambian el mapa al cargarlo; los mete en la
página el plugin `extras-arrecife` de `vite.config.js`); lo que se construye encima es `src/arrecifeExtras.js`, que
importa main.js y monta sobre `window.__game` con el mismo three.js del juego. Son las 310 calles y 207 casas
reales del norte de Arrecife (de la Calle Luján Pérez al camino de tierra de la casa del campo; las genera
`tools/arrecife-norte.py`), la Repsol de Tenderete con su muelle, McDonald's, Burger King, Decathlon, el monumento de
Titerroy, el paso inferior de Tenderete, el Cabildo con su reloj, las naves de Playa Honda, la Marina, el crucero y
los choques con el tráfico. Ficha: **`public/extras/LEEME.md`**. Léela antes de tocar esas zonas: si el juego pasa a
hacer algo que ya hacen los extras, se apaga allí la parte repetida (como se hizo con el HiperDino).

## Probar

- `sh pruebas/servir.sh` compila y sirve el juego en `http://localhost:8765/sub/index.html`
  (parámetros: `?t=12` hora, `?q=low|med|high` calidad, `?auto` sin pantalla de inicio, `&start=castillo` dónde empezar, `&demo` sin policía, `&relieve=1` cuestas reales sin exagerar).
- Las pruebas usan Playwright con el Chromium del entorno y gráficos por software
  (swiftshader): son lentas. Pon tiempos largos (180 s para el clic de inicio y las
  fotos) y lánzalas en segundo plano escribiendo en un archivo, no con `| tail`.
  Ejemplos en `pruebas/` (`tlocales.cjs pc|m [local]`, `tcorr.cjs`, `tmobile.cjs`...).
  Cada `__game.step()` (fotograma entero) tarda 1–2 s con gráficos por software: para medir solo la
  conducción, llama a `player.update(dt, entrada, colliders, map.meta.bounds)` como `tcuestas.cjs`.
- Banco de pruebas de modelos (Version 133): con el servidor de desarrollo, `pruebas/banco.html` enseña coches y gente
  con la misma luz y cielo que el juego pero sin ciudad (un segundo por foto). Se maneja con `window.__b`
  (`setTime(h)`, `stage`, `shot(nombre, pos, mira, fov)`, `tris(obj)`).
- Para las fotos con `__game.step(dt, mandos)`, los mandos tienen que ir completos (`{ throttle: 0, steer: 0, handbrake: true }`):
  con `{}` el coche del jugador se queda con valores rotos y desaparece la carrocería.
- Mira las fotos que sacan antes de decir que algo está bien. En el navegador integrado con el
  panel oculto, la primera captura tras un cambio a veces es la imagen anterior: haz otra.
- Los vídeos de YouTube SÍ se pueden ver: en el navegador integrado se abre el vídeo, se rechazan
  las cookies no esenciales, se para con `video.currentTime` y se hace captura (ver REFERENCIA_VIDEO_CALLE_REAL.md).

## Publicar y entregar (lo de siempre al terminar algo)

1. **Artefacto** (el enlace que usa José Manuel, privado):
   https://claude.ai/artifact/AGkBFTGmX8R9ArAg1bsiHA
   Desde un chat nuevo: primero `Artifact read` de esa URL; luego publicar con
   `url` = esa URL, `file_path` = dist/index.html, `root` = dist y
   `files` = { "assets/<js nuevo>": "assets/<js nuevo>", "assets/<js viejo>": null }.
   El mapa, las fotos aéreas y los logos ya están publicados: no hace falta subirlos.
   Los dos scripts de `extras/` también están ya publicados en los dos enlaces; si cambia alguno,
   súbelo en `files` (`"extras/<archivo>": "extras/<archivo>"`) en los dos.
   **Demo** (partida nueva cada vez, sin policía, no guarda nada):
   https://claude.ai/artifact/D3HVvFiQLNiFQShTpExSpa (el 17/11/2026 ese enlace ya no existe: si hace falta demo,
   publicar una nueva con todo `dist/` y apuntar aquí su enlace) — se publica con `file_path` = dist/demo.html,
   `root` = dist y el js nuevo en `files` (el resto ya está). `demo.html` lo genera `vite.config.js`;
   el modo demo está en `src/save.js` (también vale `?nueva` en la dirección).
2. **ZIP para la web** (canaryislandconsulting.es/juego/): carpeta `juego/` con todo
   el contenido de `dist/`, y `zip -q -r -X -D lava-game-web.zip juego` (si no hay `zip`, con
   `zipfile` de Python, cada archivo como `juego/<ruta dentro de dist>`). Ya incluye `ortho-m/`
   (copiado a `public/ortho-m/` en la Version 12).
   Se le manda con SendUserFile.
3. **PC de casa** (conector PC_Casa): la copia del juego está en
   `Downloads\gta canarias\game` (`src\`, `index.html`, `VERSION_WEB.txt`). Antes de
   cambiar nada, copia los archivos que vas a tocar en `_copia_antes_<tema>`. Sube cada
   archivo con `guardar_archivo` (texto, sobrescribir) y comprueba que los bytes que
   devuelve coinciden con `wc -c`. No pases imágenes en base64.
4. **Notas**: añade una sección «Version N» al final de `VERSION_WEB.txt` (aquí y en
   casa). La última es la Version 154.
5. **GitHub**: trabaja en una rama y abre un PR para que quede el historial (la copia del
   PC de casa no es un repositorio git: ahí no hay rama ni PR).

## Cómo tiene que ser la ciudad (lo pidió José Manuel)

- Tiene que parecer Arrecife de verdad: arquitectura canaria de costa, casas blancas de
  fachada sencilla con azotea, mezcladas con bloques modernos; no todo avenidas ni todo
  edificios iguales.
- Distinguir el casco antiguo marinero (calles estrechas, callejones, plazitas, casas de
  pescadores), el centro comercial (Calle Real), los barrios modernos y la zona del puerto.
- El centro es el Charco de San Ginés (casas blancas, terrazas, barquillos). Están el Castillo
  de San Gabriel con el Puente de las Bolas, la iglesia de San Ginés, la Calle Real, la playa
  del Reducto y el puerto de Los Mármoles.
- Costa con paseos, muelles, playas, roca volcánica negra y mar azul; alrededor, terreno
  árido y volcánico con palmeras y poca vegetación. Colores: blanco, arena, crema, gris,
  negro volcánico y azul marino; sol fuerte y clima seco.
- Todo conectado para ir andando o en coche.
- **No borrar nada hecho: solo mejorarlo.** Cuando manda una foto de un sitio, se hace igual
  que en la foto y en su sitio exacto.

## Datos confirmados de los negocios

- **El Nuevo Maccheroni** (Manolo Millares, esquina con la calle Valencia; fotos de la fachada en `referencias/`): Andrea (solo «Andrea», sin apellido) y
  Elvis, el cocinero. Pasta fresca rellena; carta real sin precios.
- **C.C. Las Buganvillas**: Todofone (Siso, reparación de móviles), peluquería de Toño
  enfrente, **Calzado El Más Barato** (la zapatería de Eliseo). Arriba, el gimnasio
  **Areafit** (de momento no se sube).
- **Sakura** (Willy): calle Fenauso 55. Se entra a Fenauso desde Manolo Millares y
  está al final, en la esquina de la izquierda, con la calle Aniagua.
- **La Cervecería** del Reducto: sin nombres para el personal.
- **Funeraria Arroyo**: Manolo Millares 48 (antigua José Antonio), la lleva Michael.
- **Tanatorio Arroyo**: Juan de Quesada 31, casa terrera de la esquina. Mismo teléfono
  que la funeraria: **658 753 941** (el de Michael). En el lateral que sube está la
  puerta de la oficina de Canary Consulting; por ahora no se explican sus servicios.
- **ITV y Remar** (subida a San Bartolomé): el local de **Remar** está en la nave de **abajo** de la ITV (bajando
  hacia Arrecife) y la entrada de la ITV está pegada a él. La ITV tiene aparcamiento y una valla de rejilla alrededor.
- **IKEA Lanzarote**: Parque Industrial Arrecife Puerto, Carretera de los Mármoles s/n (de su web). En el juego,
  la nave de la esquina con la calle Océano Índico. Al lado están Electron y las canchas de pádel.
- **La casa de José Manuel** (el camino de tierra, Maneje): la de la esquina sureste del caserío, (-2002, -3305) en el juego. Parcela larga de norte a sur: casa arriba (da a la calle), patio con piscina en medio y, al fondo, el bloque blanco del garaje: la puerta seccional mira al **oeste**, a una explanada de grava gris, y **el árbol está en la esquina sureste del bloque**, junto al muro que da a la pista (lo corrigió él en la Version 153). Sus fotos y fotogramas están en el PC de casa, en `Downloads\gta canarias\recursos` (los copió de `OneDrive\Images\gta recursos`, donde el conector no llega): `argana alta\argana-alta-frames\IMG_5153` (496 fotogramas del recorrido Repsol → casa, uno cada 1,5 s) e `IMG_5113` (17 de la llegada), con su guía `argana-alta-prompt.md`.
- Perros salchicha: no se les puede hacer daño. Las patinetas se caen y se levantan.

## Lo que viene (en este orden, acordado con José Manuel)

1. ~~**Nombre «Lava Game» e imagen de lava**~~ (hecho, Version 12): título, pantalla de inicio con logo
   «LAVA GAME», vista previa al compartir, nombre del ZIP (`lava-game-web.zip`, la
   carpeta de dentro sigue siendo `juego/`) y colores de lava (negro y naranja
   incandescente) en el inicio, los menús y el marcador. Todo en `index.html`.
2. ~~**Volcán al fondo**~~ (hecho, Version 12): echa humo de día y brilla en rojo de noche; se ve desde
   toda la ciudad.
3. ~~**Piedras de lava escondidas**~~ (hecho, Version 12: 20 piedras, 100 € cada una, 1.000 € al reunirlas todas): brillan en naranja y dan dinero al cogerlas, como
   los paquetes ocultos de GTA; sobre todo en las puertas de los negocios de los
   clientes (así el juego lleva a la gente a pasar por delante). Contador en el
   marcador y que se recuerden las ya cogidas.
4. ~~**Mapa grande con buscador**~~ (hecho, Version 23): al tocar el minimapa redondo se abre el mapa entero;
   pinchas un punto o escribes una calle o un negocio y el coche aparece allí, en la
   calzada y mirando a lo largo de la calle, y sigues desde ahí. Con la policía detrás
   o en mitad de una misión no se puede. En PC y en móvil.
5. **Estilo GTA V** (referencia: `referencias/estilo-personajes-y-calles.jpg`):
   personajes y calles realistas, por fases y probando el rendimiento en el móvil:
   protagonista sacado de esa imagen (imagen → modelo 3D, esqueleto, animaciones): joven
   canario de 28 años, atlético, moreno de sol, pelo castaño oscuro corto y ondulado, barba
   de pocos días, gafas aviador negras, camiseta negra con pequeño logo verde de panel solar,
   pantalón cargo caqui, zapatillas blancas altas, cadena de plata, una mano en el bolsillo y
   en la otra un aparato solar pequeño; calle soleada de Arrecife con colinas volcánicas,
   palmeras y casas blancas (José Manuel lo quiere exactamente así),
   gente de la calle, fachadas canarias (casas blancas, carpintería oscura, balcones de
   madera, piedra volcánica), adoquines, bolardos, farolas de globo blanco, palmeras,
   volcanes al fondo y luz de sol fuerte. Ser sincero con lo que se puede en un juego
   de navegador que va en el móvil.
   - (Version 71: Airam quitado del juego por José Manuel; no volver a ponerlo.) Antes, Version 29: el protagonista **Airam** (character.js, `solarKit`): moreno, pelo
     castaño corto, gafas de aviador, camiseta negra con el panel solar verde, cadena de plata,
     bermudas cargo caqui (como en la imagen, no pantalón largo), zapatillas blancas y el
     cargador solar en la mano. Es con el que se empieza; con 1–4 se cambia a los otros (5 = Airam).
     El nombre lo puso Claude: que José Manuel lo confirme o lo cambie.
6. Más adelante: ~~coche «Lava»~~ (hecho, Version 95: el Volcanía Cráter en negro con brillo de lava naranja,
   se desbloquea al reunir todas las piedras y se trae con la L), ~~misión «¡Erupción!»~~ (hecha, Version 96:
   columna naranja; la lava avanza desde detrás de ti por las calles y hay que llegar a la zona segura. Version 109: ya se rescata a la gente) y ampliar a toda Lanzarote.

## Skills y repos utiles (incorporados)
Ver SKILLS_Y_REPOS.md: 23 skills en game/.claude/skills/ y repos del PC (ComfyUI, Hunyuan3D-2, Fooocus, AnimateDiff, supertonic) para assets, texturas, modelos 3D y voces. Usalas antes de inventar nada.
