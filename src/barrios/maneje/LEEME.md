# Maneje

**Límites:** x −2200…472 · z −3400…−1035 (x hacia el este, z hacia el sur).
Es el barrio del noroeste y, hacia el norte, el campo de arriba de Arrecife.

## Qué hay

- **El campo de arriba** (`casaCampo.js` + `campoDatos.js`): la casa de las fotos de
  José Manuel (sin nombre ni rótulo en el juego, que también va en la web), su patio con
  la piscina, la pérgola y el cuarto del tejado, y todo lo de alrededor sacado de las
  fotos aéreas: fincas con muro, casas sueltas, caminos de tierra, calles partidas en
  los cruces y enarenados de picón negro. El suelo es `campoGround` y hay un hueco en el
  suelo general del mapa (`map.groundHoles`, `world.js`).
- **El caserío del camino de Anmara** (`caminoAnmara.js`): la pista de tierra rojiza con
  la lancha «ANMARA UNO» en su remolque, la VW California gris, el Skoda, la casa de las
  persianas verdes con el trampolín, el solar sin urbanizar y los postes del tendido.
  Cuelga del final del camino largo del campo.
- **El bar de la gasolinera** (`../../gasolineraManeje.js`, en la Moeve de la Carretera San Bartolomé): fuera, la
  fachada con la puerta de cristal, el toldo verde y crema, el rótulo «Bar Restaurante · Bola canaria» y la terraza con
  vallita de metal, mesas y sombrillas; se entra con F. Dentro: el bar (la barra a la izquierda, la tele, la nevera),
  una puerta al fondo al comedor y, detrás del comedor, la cancha de bola canaria (terrero de arena con tablas, bancos,
  bolas y bolín). En una mesa del bar, una señora mayor, una chica rubia y un chico rubio de pelo largo: al acercarte
  (3 m) se oye su conversación (`plan.overhear`, locales.js). Sin nombre de negocio.
- El resto de Maneje (calles y casas) sale del mapa, como el resto de la ciudad.

## En su sitio de verdad (Version 145)

Todo el campo estaba corrido entre 30 y 60 m (se calcó de fotos sin coordenadas y se colgó del punto que da Apple
Maps para la dirección, que cae 62 m al sureste de la casa). `../../campoReal.js` pone la ortofoto oficial del IGN
como suelo (`public/campo/`) y recoloca sobre ella lo que hacen `casaCampo.js` y `caminoAnmara.js`, sin rehacerlo:
los números de esos dos archivos siguen siendo los antiguos y pasan por `mover()`. La casa es la del tejado rojo
con la piscina al oeste, en (-2055.5, -3337.5). **Para añadir algo nuevo ahí**, mídelo sobre la foto oficial (WMS
del IGN, ver CLAUDE.md) y constrúyelo directamente en la escena de verdad, no en la recolocada. El caserío de la
lancha ANMARA UNO sigue sin sitio real conocido.

## Archivos suyos

```
casaCampo.js  campoDatos.js  caminoAnmara.js  campoReal.js  casaParcela.js  gasolineraManeje.js (en src/)
```

## Probar

`&start=campo` («Camino de tierra» en la pantalla de inicio). El relieve de ahí lo
rellena `terrain.js` (`extendNorth`).

## Notas

- De esta zona no hay datos de OpenStreetMap ni del IGN: las alturas del terreno son
  aproximadas y las posiciones salen de las fotos aéreas, con la escala de los coches
  aparcados. No "corregirlas" con datos inventados.

## Notas del código (venían del mapa del código de CLAUDE.md)

- **`campoDatos.js`**: casas calcadas (`CAMPO_CASAS`), casas detectadas y de las calles de
  la ciudad (`CAMPO_AUTO`), muros, piscinas, caminos de tierra (`CAMPO_CAMINOS`), calles
  nuevas (`CAMPO_CALLES`) partidas en los cruces y enarenados (`CAMPO_ENARENADOS`).
- La casa y su cuarto con modelo propio (`skip`); las demás casas las dibuja `world.js` como
  el resto. Caminos `dirt`: sin acera, señales, tráfico ni peatones.
- Suelo `campoGround` (malla de 15 m en modo 'ground') y hueco en el suelo general
  (`map.groundHoles`, `world.js`). Sitio «Camino de tierra» (`CAMPO_START`) y ruta de prueba
  `CAMPO_RUTA`.
- El relieve de ahí lo rellena `terrain.js` (`extendNorth`).

## Desniveles

`../../desniveles/maneje.js` (con `desniveles/comun.js`), en `prepararMapa`: deja las cuestas del barrio
y del campo de arriba en un 12 % más o menos.

## Calles y casas (Version 125)

`calles.js` (`tuneCalles`, en `prepararMapa`): calle a calle con las vistas de la calle y el kit de `../altavista/kitCalles.js`.
Cubre Guadalajara, Guanareme, Caracas, Veracruz, Moterrey, Maracaibo, Tindaya, Tegaso, Telésforo Bravo, Granada y
alrededores: casas terreras blancas, adosados crema de dos plantas y solares. Rótulo: Bar Pablo. Unos 150 tramos sin vistas
de Google cerca se quedan como estaban. Bandera `map.manejeCalles`.

(Version 153) `../../casaParcela.js`: la parcela de la casa, de la casa hacia el sur, en su sitio de verdad (garaje con
la puerta al oeste, explanada de grava, el árbol en la esquina sureste, patio con la piscina y el jardín). Sustituye al
patio girado de casaCampo.js; `tuneParcela` baja la casa vecina del oeste a una planta.
