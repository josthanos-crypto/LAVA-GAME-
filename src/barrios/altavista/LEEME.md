# Altavista

**Límites:** x −238…498 · z −2080…−495 (x hacia el este, z hacia el sur).
El barrio del norte, entre Titerroy y Maneje.

## Qué hay

- **La mitad sur (calle León y Castillo, Mina, Fray Luis de León, Telésforo Bravo, Cádiz,
  Granada, Mosta, Blasco Ibáñez, Ángel Ganivet, Chafarís…) está hecha a mano**, pero el
  código no vive en esta carpeta: se llama desde `../valterra/ramblaMedular.js` (la lista de
  `tune…`/`build…` está ahí, con una línea de explicación por pieza): Open Mall, Eurospar,
  Shell, Plenergy Arrecife I, Autolavado Parque de Limpieza, IES Altavista, Bodegón Los Mencey,
  Los Arrieros, Salón Altavista, Asadero Jonay, Donde Yani, Ca'Mario, Tentempié, Los Geranios
  (bar), Locutorio, Farmacia Enalta, Fray Luis de León (norte, sur y oeste), Telésforo Bravo,
  aparcamientos de Topham y de Padre Claret, solares de Virgilio y Lubary, campo de Cádiz…
- **La mitad norte (z más al norte de −1500) sale casi toda del mapa**: los CEIP Los Geranios
  y Mercedes Medina Díaz, el campo de fútbol Agapito Reyes Viera, la gasolinera Plenergy
  Arrecife II (471, −1607), las manzanas de casas, el parque y las pistas.
- El volcán del fondo (`volcano.js`) se ve desde todo el barrio, pero es de toda la
  ciudad y por eso vive en `compartido`.

## Calle a calle con las vistas de la calle (Version 111 en adelante)

- `kitCalles.js`: cada acera es `{ a, b, fondo, casas }` — a y b son las esquinas de la fachada (metros del mapa),
  las casas van de a hacia b como `[ancho, alto, color, extra]` (los anchos se escalan para llenar a→b; alto 0 =
  solar; extra: `tienda`, `letrero` + `k`, `fondo` propio para un solar que entra más). Recorta el bloque genérico de
  debajo (no toca nada hecho a mano) y no repite una casa que ya puso otra calle en la esquina.
- Una calle por archivo, llamadas en orden desde `prepararMapa` de `index.js`: `chafaris.js`, `sevilla.js` (y
  Córdoba), `jaen.js`, `huelva.js`, `andalucia.js`, `calderon.js`, `salvador.js`, `menendez.js`, `ramon.js`,
  `elcano.js`, `capaz.js`, `honduras.js`, `almeria.js`, `malaga.js`, `guasia.js`, `arcipreste.js`, y luego
  `santillana.js` (Marqués de Santillana), `sanjuan.js` (San Juan de la Cruz, Leopoldo von Buch, Cervantes, Fasnia y
  Guigua este), `norte.js` (Mina, Mosta, Tornajo, Régulo, Las Quemadas, Peña del Espino, La Majada, Tinguatón) y
  `oeste.js` (Temisa, Muyay, Chimia, Guigua, Guatisea, Virgilio Cabrera).
- `polideportivo.js`: el edificio de la piscina del Parque Deportivo Municipal Puerto del Arrecife (enfrente del Open
  Mall), en beis; por dentro lo monta `../../localesPolideportivo.js` (recepción, piscina de 25 m, jacuzzi, sauna,
  vestuarios y sala de musculación; entrada 6 €).
- Ayuda para sacar las aceras de una calle desde la consola: `tools/vistas/aceras.js`.
- Cómo se saca una calle: se abre la vista de calle de Google en el navegador en el medio de la calle; la página pide
  `photometa/si`, y su respuesta trae el identificador y el sitio de todas las fotos de alrededor. Con eso, un script
  baja las fotos mirando de frente a cada fachada (cada 6-7 m) y las junta en una hoja con la distancia desde la
  esquina a. Las fotos solo se miran: no se copian al juego.
- Sin vistas de Google: Arniches y las puntas de Almería y Guasia. Desde la Version 171 están medio hechas con Look Around (abajo); faltan la mitad de arriba de Arniches y la punta de abajo de Almería.

## Con las capturas de Look Around de casa (Version 171)

`lookaround.js` (se llama al final de `prepararMapa`): lo que no tenía vistas de Google, con las capturas de Look Around
del PC de casa (`Downloads\recursos lava game 2026-11-24 web casa\altavista`, 8 por calle, mirando a lo largo de la
calle): la mitad de abajo de Arniches, las casas de Filipinas que la cierran, los últimos 40 m de Almería y la acera
norte de Guasia desde el descampado. Los anchos van a ojo. Apple no abre la calle en el punto del catálogo: hay que
situar cada tanda por los rótulos de calle que salen en la foto y por la letra de la brújula (lo de `avenida_temisa` es
Guasia; lo de `calle_granada` no es Granada).

## El campo de fútbol y Tornajo (Version 172)

`campoFutbol.js` (se monta desde `construir` de `index.js`): el muro blanco del campo Agapito Reyes Viera por la acera
sur de Mosta, el portón verde y las cuatro torres de focos, de las capturas `calle_mosta` y `calle_tornajo` de casa.
En `lookaround.js`, las cuatro manzanas de Tornajo entre Régulo y Mosta pasan a blancas de dos plantas (solo color y
altura). Mirado y no usado: `calle_pena_del_espino` (ya estaba hecho), `calle_chimia` (no se sabe qué tramo es) y
`calle_granada` (es otra calle).

## La mediana de León y Castillo (Version 165)

`../../medianaLyC.js` (se monta desde `../valterra/ramblaMedular.js`): el bordillo con pitas y matas granate entre las dos
calzadas, de El Salvador a la Rambla, de las capturas de Look Around del 23-11-2026 (PC de Arrecife).

## Archivos suyos

Los de la lista de arriba (en esta carpeta). Lo de la mitad sur hecho antes está en `src/` y se engancha desde
`ramblaMedular.js`.

## Pendiente

- Siguen genéricos los tramos sin fotos de Google: el sur de Temisa (z −1400…−1800, lado este), Chimia sur y
  norte, el oeste de Mosta, Tornajo oeste, Peña del Espino norte, Granada y algún trozo suelto.
- **La iglesia** (parroquia San Antonio María Claret): hecha en la Version 132, [`iglesiaAltavista.js`](../../iglesiaAltavista.js)
  (se monta desde `../valterra/ramblaMedular.js`). Sitio: la ficha de Google Maps (28.97437, −13.54827), el bloque bajo
  entre Padre Claret y la explanada de picón de San Juan de la Cruz. Aspecto: la vista de la calle de julio de 2025 desde
  San Juan de la Cruz: muro encalado con el pretil de curvas, la puerta marrón de dos hojas con el tejadillo, la placa,
  las ventanas de marco marrón, el cuerpo alto y la torre con la cruz. Sin rótulo (la foto no lo lleva).
- **La residencia Cruz Blanca y la Plaza (parque) de los Luchadores**: según La Voz de Lanzarote están junto a la
  iglesia. En la vista de julio de 2025 la residencia es una obra parada con vallas rojas y blancas, en el solar de tierra
  al lado de la iglesia; la plaza es la de la cancha que se ve en la foto aérea del suelo del juego, al suroeste. Las dos
  se quedan como las pone el mapa (el solar y la cancha ya salen en el suelo).

## Desniveles

`../../desniveles/altavista.js` (con `desniveles/comun.js`), en `prepararMapa`: deja las cuestas del
barrio en un 12 % más o menos. Los puentes (Francisco Matallana, LZ-1) siguen en `trinchera.js`.
