# Añadidos del PC de Arrecife

Estos añadidos se hicieron en el PC de Arrecife encima del juego ya compilado (Lava Game) y desde el 31/10/2026
están en el código:

- `public/extras/arrecife-norte-datos.js` y `public/extras/arrecife-mapa.js` son scripts normales que van ANTES
  del juego, porque cambian el mapa al cargarlo. Los mete en index.html y demo.html el plugin `extras-arrecife`
  de `vite.config.js`, tanto con `npm run dev` como al compilar.
- `src/arrecifeExtras.js` construye encima del juego (sobre `window.__game`). Lo importa `main.js`, así usa el
  mismo three.js que el resto. Antes era `public/extras/arrecife-extras.js` y traía otro three.js de jsdelivr.

## Qué hace cada uno

- **arrecife-norte-datos.js** (script normal, antes del juego). Las 310 calles (40 de tierra) y las 207 casas
  reales del norte de Arrecife, sacadas de OpenStreetMap: todo lo que hay entre la Calle Luján Pérez y el camino
  de tierra de la casa del campo. Entre otras, Julio Cortázar (de tierra), Mario Benedetti, la Calle Tanganillo
  entera, Escardillo, Trillo, Pablo Neruda, El Invernadero, el arco norte de la circunvalación y la LZ-1 hacia
  el norte. Es un archivo generado: no se toca a mano.
- **arrecife-mapa.js** (script normal, antes del juego). Cambia map/arrecife.json y map/terreno.json al
  cargarlos:
  - Mete las calles y casas del norte. Parte las calles que ya había donde se enganchan las nuevas, porque el
    tráfico solo enlaza calles por las puntas.
  - Quita la cuadrícula de calles puestas a ojo y el atajo de tierra a Campoamor, también si se añaden después.
  - Marca `skip` en los edificios del mapa que rehace arrecifeExtras.js y quita la gasolinera genérica de
    Tenderete.
  - Baja el Cabildo, añade los paseos y abre en el terreno la trinchera del paso inferior de Tenderete.
- **src/arrecifeExtras.js** (módulo del juego). Construye sobre `window.__game`:
  - Marina Lanzarote, el crucero de Los Mármoles y los nombres de barrio.
  - La Repsol de Tenderete con su muelle de carga, McDonald's, Burger King, Decathlon, Fuji y Kiwa,
    Mitsubishi, los talleres de Tenderete y el monumento de Titerroy. El McDonald's y la gasolinera del juego
    (mcdonaldsArgana.js, gasolineraTenderete.js) se ocultan para que no salgan dos.
  - El Cabildo con portada y reloj, las naves de Playa Honda y el paso inferior de Tenderete.
  - Los choques con el tráfico: el coche golpeado sale despedido y arrastra a los que encuentra, con el ruido
    de golpe del juego (`props.onHit`), más flojo cuanto más lejos.
  - En el norte: los caminos de tierra nuevos (el juego solo pinta los de la casa del campo), el suelo del campo
    rehecho a 3 m (`tierraCampo`, de 15 m, tapaba el asfalto) y fuera las matas y piedras que caen encima.
  - `buildHiperDino` devuelve null: el HiperDino y el MediaMarkt ya los hace el juego (hiperdinoArgana.js y
    centroComercialArgana.js).
  - Ya no redondea las bocanadas de los propulsores: lo arregló la Version 89 y apagaba las llamas azules de
    la Version 92.

## Rehacer las calles del norte

1. Compilar: `npx vite build --base ./`. El generador lee los caminos de tierra y la cuadrícula inventada del juego
   compilado, porque cambian de nombre en cada compilación.
2. Bajar de OpenStreetMap estas cinco zonas a `tools/osm/` (https://api.openstreetmap.org/api/0.6/map?bbox=oeste,sur,este,norte):
   - norte-argana.xml: -13.5820,28.9780,-13.5600,28.9970
   - norte-1.xml: -13.5600,28.9780,-13.5507,28.9880
   - norte-2.xml: -13.5507,28.9780,-13.5414,28.9880
   - norte-3.xml: -13.5414,28.9780,-13.5321,28.9880
   - norte-4.xml: -13.5321,28.9780,-13.5228,28.9880
3. `python tools/arrecife-norte.py`, que escribe public/extras/arrecife-norte-datos.js.
4. Volver a compilar para que pase a dist/.

## Cuidado al cambiar el juego

- arrecifeExtras.js busca las piezas del juego por su nombre: `caminoTierra`, `tierraCampo`, `matojosCampo`,
  `piedrasCampo`, `mcdonaldsArgana`, `gasolineraTenderete`, `hiperdinoAcera`. Si cambia alguno, hay que
  cambiarlo también allí.
- Si el juego añade por su cuenta algo que ya hacen los extras (como pasó con el HiperDino), se desactiva allí
  la parte repetida con un `return null` en su función build, para que no salgan dos.
- Lo de Argana Alta de rellenoArgana.js no se repite: las calles del norte entran antes y el relleno salta las
  que ya están (en el juego publicado añade 0 calles y 0 casas).
