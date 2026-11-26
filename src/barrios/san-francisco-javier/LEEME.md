# San Francisco Javier

**Límites:** x −1799…−1036 · z −582…432 (x hacia el este, z hacia el sur).
Es el barrio del oeste, al otro lado del puente del Cabildo.

## Qué hay

- **El puente del Cabildo** (`cabildoBridge.js`): muros de piedra como los del Charco,
  por donde se cruza hacia el barrio.
- **El ALDI de Rambla Medular 58** (`aldiSfj.js`): el primer ALDI de Lanzarote. La planta
  es la real de OpenStreetMap (way/1368710278), así que la posición y el choque son los
  reales. Se le sube la altura a 7,6 m, se pinta de blanco y se le pone la franja azul, el
  rótulo en la fachada larga y en el testero, la entrada con marquesina, el cobertizo de
  los carros y el aparcamiento de delante con las plazas pintadas.
- **La rotonda del Cabildo** (`rotondaCabildo.js`): calzada circular limpia y circular
  encima de los arcos viejos del mapa, con su acera alrededor, el bordillo, las líneas
  pintadas (interior continua, exterior y discontinua en el eje) y los cinco pasos de
  cebra en las salidas. Quedan fuera de la caja del barrio (z > 432) pero se construye
  desde aquí al mismo tiempo.
- **Los 15 negocios con nombre real** (`negociosSfj.js`): la lista de los comercios que
  hay en el barrio, con su dirección y teléfono reales, y los 12 carteles de fachada que
  se les cuelgan (los otros tres van aparte: ALDI con su modelo, Repsol con el cartel que
  ya traía el mapa y el campo de fútbol, que ya es un área con nombre).
- El Cabildo de Lanzarote y el resto de la zona salen del mapa; los edificios con
  nombre los pone `civic.js`.

## Los negocios reales del barrio

**15 negocios, todos comprobados.** Dos fuentes, ninguna inventada:

1. **OpenStreetMap** (consulta a la API 0.6, octubre de 2026): los 4 sitios con nombre
   dentro del polígono oficial del barrio (`relation/2216873`).
2. **La Guía de Servicios de Atlántico Hoy** (`guia.atlanticohoy.com`): publica la
   dirección, el teléfono y las coordenadas de cada ficha. De ahí salen los 11 comercios
   que OSM todavía no tiene mapeados aquí.

De cada ficha se coge su latitud y longitud reales y se pasan al mapa del juego
(`x = (lon + 13,55) · 97398`, `z = (28,9625 − lat) · 111320`). Solo se queda lo que cae
dentro del barrio. El cartel se pega a la fachada que mira a la calle, calculada con el
polígono del edificio y la calle más próxima (quedan a 7–17 cm de la pared).

| Negocio | Tipo | Dirección | Teléfono | x | z |
|---|---|---|---|---|---|
| ALDI | supermercado | Rambla Medular 58 | 900 902 466 | −1164 | 105 |
| Estación de Servicio Repsol Canary Green Corner | gasolinera | (Canary Green Corner) | — | −1753 | −295 |
| Campo de Fútbol San Francisco Javier | deportivo | — | — | −1458 | −419 |
| IES Las Maretas (el antiguo IES Arrecife; cambió de nombre en 2017) | instituto | — | — | −1352 | −461 |
| Bar La Iguana | bar | Calle Enrique IV 51 | 928 810 368 | −1597 | −232 |
| Rincón de Manolo | bar cafetería | Calle Enrique IV 35 | — | −1623 | −231 |
| Armas Lira | bar cafetería | Calle Agustín Espinosa 45 | 928 346 348 | −1616 | 10 |
| Montaña Viña | bar | Calle Carlos V 29 | 928 810 914 | −1537 | −281 |
| Bazar Juana | bazar | Calle Carlos V 26 | 928 800 914 | −1591 | −285 |
| Centro de Belleza Rosa Negra | peluquería | Calle Enrique IV 11 | 928 801 872 | −1536 | −239 |
| Peluquería Magec | peluquería | Calle Viriato 47 | 928 805 208 | −1501 | −144 |
| Canestylo | peluquería canina | Calle Carlos V 7 | 928 802 279 | −1391 | −312 |
| Supermercado Rodríguez Padrón | supermercado | Calle Felipe II 3 | 928 815 418 | −1316 | −79 |
| Aluminios Medina | carpintería de aluminio | Calle Juana de Arco 20 | 928 844 773 | −1458 | −98 |
| Carpisur | carpintería | Calle Enrique IV 65 | 928 806 475 | −1734 | −210 |

Los locales que quedan sin cartel son fachadas de tienda que genera el juego a partir de
los edificios del mapa: no se les pone nombre porque no hay dato real que lo respalde.

## Material gráfico para mejorar el barrio

En `game/_imagenes_sfj/` está todo lo que se ha podido juntar del barrio, con licencia
y autor anotados (ver su `LEEME.md` y `CREDITOS.md`). **Todavía no se ha usado nada**:

- `ortofoto/` — el barrio en aéreo del PNOA (IGN) a 0,25 m por píxel: manzanas, patios,
  tejados, la plaza, el campo de fútbol y el ALDI. Es la referencia buena.
- `fotos/` — la **placa oficial de calle de Arrecife** («RAMBLA MEDULAR», azul con escudo),
  que es el modelo para rotular las 41 calles del barrio; el **mural de Rosana**, única
  foto libre hecha dentro del barrio; y la fachada del **Cabildo Insular**.

Fotos libres del barrio de calle no hay ninguna (Commons, Openverse/Flickr CC, Kartaview
y Panoramax: cero).

## Archivos suyos

```
cabildoBridge.js
aldiSfj.js
negociosSfj.js
rotondaCabildo.js
```

## Pendiente

- El barrio está casi entero por hacer: del Cabildo hacia dentro solo están el puente, el
  ALDI y los carteles de los 15 negocios. Cuando se haga el Cabildo por dentro o cualquier
  edificio del barrio, va aquí.
- Los 11 comercios de la Guía de Atlántico Hoy **ya están en OpenStreetMap** (25/10/2026,
  changeset `191024927`, usuario *josthanos*). Se subieron a propósito **solo con el nombre y
  el tipo de negocio** (bar, peluquería, supermercado, taller…): sin teléfono, sin dirección
  y sin horarios, que esos datos se quedan para trabajarlos desde la asesoría.
  Nodos: La Iguana `14319448084`, Rincón de Manolo `…85`, Armas Lira `…86`, Montaña Viña
  `…87`, Bazar Juana `…88`, Rosa Negra `…89`, Magec `…90`, Canestylo `…91`, Rodríguez Padrón
  `…92`, Aluminios Medina `…93`, Carpisur `…94`.

## Desniveles y puentes (noviembre de 2026)

- `../../desniveles/san-francisco-javier.js` (con `desniveles/comun.js`), al principio de
  `prepararMapa`: deja las cuestas del barrio en un 12 % más o menos.
- El **puente del Cabildo** está en `../../trinchera.js` (entrada 'Cabildo' de `TRINCHERAS`), en
  (−1343, 418): la carretera por encima y la calle que baja al Cabildo por debajo.
- `cabildoBridge.js` ya no se monta: sus muros caían en el agua de la playa del Reducto. El archivo
  sigue en `src/` y en el `index.js` está la línea para volver a ponerlo.

## Calle a calle (Version 121)

- `calles.js` (`tuneCalles`): las casas de Agustín Espinosa, Enrique IV, Isabel la Católica, Juan II, Felipe II,
  Cardenal Cisneros, Antonio Bermúdez, Alfonso XIII, Carlos V y Viriato con las vistas de la calle de Google, con el
  kit de Altavista (`../altavista/kitCalles.js`). Los tramos delante de los carteles de `negociosSfj.js` van cortados.

## Calle a calle, segunda tanda (Version 123)

- `calles2.js` (`tuneCalles2`, bandera `map.sfjCalles2`): el resto de las calles del barrio (El Forito, Timple, Fernando
  el Católico, Jaime I, Don Rodrigo, Gregorio Medina, el Cid y alrededores) con las vistas de Google y el mismo kit.
  Rótulo: Frutería Supermercado (Isabel la Católica). Faltan unos 27 tramos sin vistas cerca.

## Con las capturas de fachadas de casa (Version 173)

`fachadas.js`: los tramos que seguían genéricos en José Hernández Almeida, Juana de Arco, Alfonso XIII, Enrique IV,
Pizarro, El Cid Campeador, Cardenal Cisneros, Juan II y Gregorio Medina Armas, con la segunda pasada de Look Around
(PC de casa, `Downloads\Lava Game\recursos lava game 2026-11-25 web casa fachadas\argana_baja`). Cada tramo recorta
el bloque genérico al que daban las fotos y levanta las casas en su orden; los solares de aparcamiento quedan como
solares. Anchos y sitio exacto a lo largo de la calle, a ojo. Nombres vistos y no puestos (sin confirmar): Nufitbell
y El Rincón de Manolo.
