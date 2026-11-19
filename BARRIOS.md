# Los barrios de Arrecife — por dónde está cada cosa

El juego está partido por barrios para **no tener que leerlo entero cada vez** que
se toca algo. Cada barrio tiene su carpeta en `src/barrios/` con:

- `index.js` — lo que se construye en ese barrio (y los retoques que se le hacen al mapa).
- `LEEME.md` — la ficha: límites, qué hay, qué archivos son suyos y qué queda pendiente.

**Para trabajar en un sitio:** lee solo la ficha de ese barrio y su `index.js`.
No hace falta leer `main.js` entero ni los archivos de los otros barrios.

## Los barrios

| Barrio | Carpeta | Límites en el juego (metros) | Qué hay hecho a mano |
|---|---|---|---|
| Arrecife Centro | `src/barrios/arrecife-centro/` | x −950…894 · z −178…900 | Charco de San Ginés, Calle Real, iglesia de San Ginés, Castillo de San Gabriel y Puente de las Bolas, Ayuntamiento y alcalde, Casa Fajardo, Atlántida, Maccheroni, playa del Reducto con su regata y terrazas, la zona de Manolo Millares (Buganvillas, Farmacia Las Salinas, colegio Zerolo, esquina Guenia-Millares), el restaurante Charco Vivo (antigua Casa Ginory), el aparcamiento de enfrente, los chavales de las piraguas del Charco, la marea del Charco (llena y vacía) y los locales del paseo norte del Charco (heladería Antiu Xixona, la escalera al Charco, el edificio de las galerías y el Leito de Proa con su terraza) |
| Valterra | `src/barrios/valterra/` | x 100…988 · z −706…38 (y el castillo, x 1550…1700 · z −1050…−900) | Escuela de Pesca, su trasera y pantalán, parque del Hospital Insular, el Hospital Insular (jardín de la puerta, porche, aparcamiento y cartel del 75 aniversario con el buzón), parking de los médicos, Comisaría, parque del dinosaurio, Tanatorio Arroyo (azotea, entorno y oficina), los locales de la calle del tanatorio (Taquería Dichell Fusión's, Oishi y Graciplus) y el Castillo de San José (MIAC) con su explanada |
| San Francisco Javier | `src/barrios/san-francisco-javier/` | x −1799…−1036 · z −582…432 | Puente del Cabildo hacia el barrio |
| Titerroy | `src/barrios/titerroy/` | x −1232…−25 · z −1382…−364 | Delegación del Gobierno (Extranjería), en Blas Cabrera Felipe |
| Argana Alta | `src/barrios/argana-alta/` | x −2617…−1003 · z −2434…−840 | El HiperDino de la Calle Tenderete (hiperdinoArgana.js) con su aparcamiento y el muro de lamas; el resto sale del mapa (hospital, Palacio de los Deportes, CEO Argana…) |
| Altavista | `src/barrios/altavista/` | x −238…498 · z −2080…−495 | La mitad sur (León y Castillo, Mina, Fray Luis de León…) está hecha a mano y se llama desde `valterra/ramblaMedular.js`; la mitad norte sale del mapa (ver su ficha) |
| Maneje | `src/barrios/maneje/` | x −2200…472 · z −3400…−1035 | El campo de arriba hasta la casa de las fotos (casaCampo.js, campoDatos.js) y el caserío del camino de Anmara (caminoAnmara.js) |
| Playa Honda | `src/barrios/playa-honda/` | x −5320…−2880 · z −20…1500 | Conforama con su aparcamiento y el ramal de entrada, la fachada de B3RICEJ, el concesionario (sitio aproximado) y el quitamiedos y las palmeras de la entrada por la LZ-301 |
| Compartido | `src/barrios/compartido/` | toda la ciudad | Costa y mar, aeropuerto, naturaleza de los solares, señales y semáforos, rotondas, edificios con nombre de todo Arrecife, tiendas y detalles de azoteas |

Las guaguas azules de Arrecife (`guaguas.js`) no son de ningún barrio: van con el tráfico
(`traffic.js`) por las calles anchas de toda la ciudad.

Los límites son la caja del barrio según el reparto administrativo de Arrecife
(OpenStreetMap), redondeada. `x` crece hacia el **este** y `z` hacia el **sur**;
el origen (0, 0) está en el Charco de San Ginés. Valterra incluye a propósito el
Castillo de San José y su explanada, como pidió José Manuel.

## Los datos del mapa, también por barrios

`public/map/` tiene un archivo por barrio con **sus edificios, sus calles y sus
carteles**, para que una IA pueda leer solo la zona que toca:

| Archivo | Edificios | Calles | Carteles | Tamaño |
|---|---:|---:|---:|---:|
| `arrecife-centro.json` | 370 | 501 | 161 | 152 KB |
| `valterra.json` | 95 | 135 | 16 | 37 KB |
| `san-francisco-javier.json` | 108 | 161 | 2 | 42 KB |
| `titerroy.json` | 232 | 296 | 15 | 79 KB |
| `argana-alta.json` | 241 | 200 | 13 | 71 KB |
| `altavista.json` | 148 | 152 | 7 | 46 KB |
| `maneje.json` | 35 | 86 | 0 | 23 KB |
| `playa-honda.json` | 1695 | 424 | 33 | 291 KB |
| `resto.json` | 593 | 463 | 52 | 174 KB |

`resto.json` es lo que cae fuera de las cajas de los ocho barrios (la periferia,
el aeropuerto…). Así la suma de los nueve archivos es **exactamente**
`arrecife.json`: 3.517 edificios, 2.418 calles y 299 carteles.

Cada edificio, calle o cartel va **entero** al barrio donde cae su centro. No se
corta ninguna geometría: por eso no hay costuras ni huecos al pasar de un barrio a
otro. Una calle que cruza varios barrios vive en el archivo de su punto medio.

El índice con los recuentos y las cajas reales está en `public/map/barrios.json`.
Para regenerar y comprobar el reparto:

```bash
node tools/split-barrios.mjs           # escribe los nueve archivos
node tools/split-barrios.mjs --check   # solo comprueba: 0 repetidos, 0 perdidos
```

> `centro.json`, `norte.json` y `sur.json` son el reparto antiguo en tres trozos.
> Ya no se usan; se dejan por si acaso.

## Cómo se monta

1. `prepararBarrios(map)` — cada barrio retoca el mapa (fachadas, alturas, quitar
   edificios que sustituye) **antes** de que `world.js` levante la ciudad.
2. `construirBarrios(ctx)` — la primera fase: edificios, calles, parques, playa…
3. Se crean los locales (`Locales`, en `main.js`).
4. `construirBarriosConLocales(ctx)` — la segunda fase: lo que necesita los locales
   (terrazas con sus mesas, el alcalde en su puerta, el tanatorio y su oficina).

Lo que cada barrio construye se guarda por barrio: `centro.charco`,
`valterra.office`, `comun.shops`… y `main.js` lo actualiza en cada fotograma
(esas líneas están juntas, en `stepFrame`).

## Para añadir algo nuevo

1. Mira en qué barrio cae (los límites de arriba).
2. Escribe el archivo nuevo en `src/` como siempre (patrón `atlantida.js`).
3. Llámalo desde el `construir()` de `src/barrios/<barrio>/index.js`. Si es de toda
   la ciudad, desde `compartido`.
4. Si cambia el mapa antes de construir (alturas, fachadas, quitar un bloque),
   va en `prepararMapa()` de ese barrio.
5. Apunta el archivo y lo que hace en el `LEEME.md` del barrio.
