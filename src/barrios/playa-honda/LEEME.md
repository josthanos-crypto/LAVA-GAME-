# Playa Honda

**Límites:** x −5320…−2880 · z −20…1500 (x hacia el este, z hacia el sur).
El pueblo al oeste de Arrecife, por la LZ-301. Sus calles, casas, rótulos y la gasolinera
salen de OpenStreetMap desde la Version 74 (las piezas del mapa llevan `ph`; el suelo va en
malla fina de 10 m, `world.js`).

## Qué hay hecho a mano

- **Conforama** (`conforama.js`), Avenida Mamerto Cabrera: la nave con sus rótulos y el
  emblema, el aparcamiento con plazas pintadas y el ramal de entrada desde la avenida
  (chevrones, isleta, quitamiedos y señal azul). La planta es la del edificio de
  OpenStreetMap (`tuneConforama` quita el bloque genérico).
- **B3RICEJ** (`bricej.js`), en la esquina de la avenida: la fachada de la casa terrera con
  el cartel negro del toro, los ventanales con reja de rombos y el arriate. Va pegada al
  edificio del mapa (`tuneBricej` lo baja a planta baja y le quita el rótulo genérico).
- **Concesionario** «Vehículos de ocasión» / «LG Automoción» (`concesionario.js`), con su
  explanada y dos furgonetas. **Sitio aproximado**: no está en OpenStreetMap; hay que
  confirmar con José Manuel dónde va exactamente.
- **La entrada por la LZ-301** (`entradaHonda.js`): el quitamiedos del borde que da al
  pueblo y la fila de palmeras del arcén, junto al nudo de Deiland.

## Version 132: Cash Lee, Baratíssimos, Cash Diplo y LG Automoción en su sitio

- Sitios sacados de sus fichas de Google Maps. Cash Lee, Baratíssimos y Cash Diplo están, de oeste a este, en la nave
  grande al oeste de Conforama: [`naveCash.js`](../../naveCash.js) sube la nave a 7,5 m y pone sus tres fachadas con los
  rótulos de la vista de la calle de octubre de 2016 (la más nueva que hay ahí). Se quita el rótulo genérico de Baratíssimos.
- El concesionario (`concesionario.js`, LG Automoción) pasa a su sitio de la ficha (28.95784, −13.58820), en la esquina
  de la avenida, y se quita el bloque genérico que había allí (`tuneConcesionario`).
- `cashlee.js`, `cashdiplo.js` y `baratissimos.js` siguen sin usarse: tenían el aspecto inventado.

## Lo que se dejó fuera (Version 88)

Estaban en `src/` pero no se usan, a propósito:

- `cashlee.js` (Cash Lee) y `cashdiplo.js` (Cash Diplo): cajas con el sitio inventado
  («pendiente de fotos»). Cash Lee caía encima de una calle. No están en OpenStreetMap.
- `baratissimos.js`: OpenStreetMap pone Baratíssimos dentro de la nave grande que hay al
  oeste de Conforama, 300 m más allá de donde lo ponía este archivo, y la caja chocaba con
  una calle. El rótulo de Baratíssimos del mapa (el de OpenStreetMap) sigue en su sitio.

Para meterlos hace falta saber dónde están de verdad (fotos o la dirección).

## Archivos suyos

```
conforama.js  bricej.js  concesionario.js  entradaHonda.js
```

## Probar

`?start=honda` («Playa Honda» en la pantalla de inicio): el coche sale en la Avenida
Mamerto Cabrera, mirando a la entrada de Conforama.

## Desniveles y puentes (noviembre de 2026)

- `../../desniveles/playa-honda.js` (con `desniveles/comun.js`), al principio de `prepararMapa`: quita
  los bultos del suelo y deja las cuestas del pueblo en un 12 % más o menos.
- El enlace de la LZ-2 con el pueblo (el túnel bajo la carretera, entre las dos rotondas) está en
  `../../trinchera.js` (`TRINCHERAS`, 'Playa Honda (LZ-2)').

## Calles y casas (Version 126)

`calles.js` (`tuneCalles`, en `prepararMapa`): calle a calle con las vistas de la calle y el kit de `../altavista/kitCalles.js`.
Cubre Foque, Botavara, Mesana, Lancha, Fragata, Siroco, Bajamar, Barlovento, Pleamar, Sotavento, Tinecheide, Alisios, Estay y
alrededores: casas encaladas de una y dos plantas con muro blanco, adosados y solares. Sin rótulos. Unos 380 tramos sin vistas
de Google cerca se quedan como estaban. Bandera `map.hondaCalles`.

## Repaso con las capturas de Look Around de casa (Version 177)

`capturas.js` (`tuneCapturasHonda`, lo último de `prepararMapa`, después de `blanquear`): 27 retoques de color o altura
sobre edificios que ya estaban, sacados de las 880 fotos de `Downloads\recursos lava game 2026-11-24 web
casa\playa_honda` (PC de casa). Cada línea lleva un punto de dentro del edificio y lo que cambia (`f`, `h`, `c`).
Calles: Manuel de Falla, Bergantín, Tomás Bretón, Pared del Canto, Princesa Ico, Bocaina y La Plazoleta. Las demás
calles confirman lo que había. Lo visto y no hecho y los nombres de negocios sin confirmar están en la nota de la
Version 177 de `VERSION_WEB.txt`. Las fotos llevan una brújula arriba a la derecha (N, S, E, O): mirarla siempre.

### Rótulos y arreglo (Version 178)

`capturas.js` lleva además `ROTULOS`: 13 nombres confirmados por José Manuel (26-11-2026), que se añaden a `map.signs`
sobre la fachada que ya había (si el mapa ya trae ese nombre, no se repite). Se quitó el amarillo que la 177 puso al
edificio de la esquina de Princesa Ico con Alisios: es el blanco de Boanva y Don Rafa; los bloques crema quedan más al
sur y no están en el mapa. El Concord (salón de juego) va en Mástil con Lancha. Sin poner: Catlanza Bus (no hay fachada).
