# Lava Game (antes «Arrecife a Todo Gas»)

Juego web de conducción estilo GTA por las calles reales de Arrecife, con los
negocios de los clientes de José Manuel Pérez Cabrera (Canary Consulting) por
dentro. Empezó como medio juego y ahora va a ser un **proyecto de publicidad**:
los negocios salen en el juego. La idea es ampliarlo a toda Lanzarote; de
momento solo es Arrecife.

El nombre elegido por José Manuel es **Lava Game**. En el juego todavía pone
«Arrecife a Todo Gas»: cambiarlo es lo primero de la lista de abajo.

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
- `public/ortho/` y `public/ortho-m/`: foto aérea del PNOA (4096 px; 2048 px para
  móviles). `public/mapillary/photos.json`: fotos de calle.
- Coordenadas del juego en metros: `x = (lon + 13.55) · 97398` (hacia el este),
  `z = (28.9625 − lat) · 111320` (hacia el sur). `pruebas/aerial.py x0 x1 z0 z1
  salida.png escala` recorta la foto aérea con edificios, calles y rótulos encima.
- En `index.html` está toda la interfaz (pantalla de inicio, HUD, menús, estilos).
- En el móvil (`body.touch`) hay menos peatones y coches y la calidad empieza en
  baja. Todo lo nuevo tiene que ir fluido en un móvil normal.

### Mapa del código (src/)

| Archivo | Qué hace |
|---|---|
| main.js | Arranque, bucle del juego, cámara, teclas, HUD, une todo lo demás |
| world.js | Ciudad a partir del mapa: suelo con la foto aérea, calles, edificios, farolas |
| textures.js | Texturas pintadas por código (fachadas, asfalto, aceras...) |
| realism.js, dayNight.js, quality.js | Cielo, sol, nubes, posproceso, día/noche, calidad (tecla Q) |
| character.js | Los 4 protagonistas (Noah, Michael, José, Iria), andar a pie |
| humanModel.js, humanHead.js, humanParts.js | El muñeco de las personas (cuerpo, cara, ropa, esqueleto) |
| customizer.js | Menú de ropa y aspecto (tecla M) |
| peds.js, dialogue.js | Peatones y lo que dicen (en femenino si juegas con Iria) |
| car.js, carModels.js, brand.js | Coche del jugador, modelos de coche, rótulos de Canary Consulting |
| traffic.js, parked.js, roadGraph.js | Tráfico, coches aparcados que se roban, rutas por las calles |
| police.js, combat.js, waterCannon.js | Policía y estrellas, disparos, la tanqueta de agua |
| missions.js, acampada.js, acampadaSite.js | Encargos (columnas de luz) y la misión principal |
| minimap.js | Minimapa redondo tipo GPS (ruta de la misión, locales con su letra) |
| locales.js, interiorKit.js | Entrar en los locales (F), interiores, hablar con la gente (T) |
| localesData.js | Lista de locales; datos en localesComida.js, localesBuganvillas.js, localesArroyo.js, localesCommon.js |
| terrace.js, dogs.js, skaters.js | Terrazas del Reducto, perros salchicha, gente en patineta |
| coast.js, beach.js, parks.js, sports.js, roundabouts.js | Costa, playa del Reducto, parques, deportes, rotondas |
| civic.js, shops.js, sanGines.js, fortBridge.js, landmarks.js, cityDetail.js, places.js, extraData.js | Edificios y sitios con nombre, azoteas y detalles |
| streetPhotos.js, facadePhotos.js | Fotos de calle de Mapillary |
| touch.js, input.js | Controles del móvil y del teclado |
| sound.js, audio.js, ambience.js | Sonido (motor, ciudad, olas) y el botón de silencio |
| props.js, collision.js | Mobiliario que sale volando, choques |

`window.__game` (en main.js) da acceso a todo desde las pruebas: `onFoot.placeAt(x, z, rumbo)`,
`toggleFoot()`, `setTime(h)`, `camOverride = { pos, look, fov }` para fotos, `locales`, `dogs`...

## Probar

- `sh pruebas/servir.sh` compila y sirve el juego en `http://localhost:8765/sub/index.html`
  (parámetros: `?t=12` hora, `?q=low|med|high` calidad, `?auto` sin pantalla de inicio).
- Las pruebas usan Playwright con el Chromium del entorno y gráficos por software
  (swiftshader): son lentas. Pon tiempos largos (180 s para el clic de inicio y las
  fotos) y lánzalas en segundo plano escribiendo en un archivo, no con `| tail`.
  Ejemplos en `pruebas/` (`tlocales.cjs pc|m [local]`, `tcorr.cjs`, `tmobile.cjs`...).
- Mira las fotos que sacan antes de decir que algo está bien.

## Publicar y entregar (lo de siempre al terminar algo)

1. **Artefacto** (el enlace que usa José Manuel, privado):
   https://claude.ai/artifact/AGkBFTGmX8R9ArAg1bsiHA
   Desde un chat nuevo: primero `Artifact read` de esa URL; luego publicar con
   `url` = esa URL, `file_path` = dist/index.html, `root` = dist y
   `files` = { "assets/<js nuevo>": "assets/<js nuevo>", "assets/<js viejo>": null }.
   El mapa, las fotos aéreas y los logos ya están publicados: no hace falta subirlos.
2. **ZIP para la web** (canaryislandconsulting.es/juego/): carpeta `juego/` con todo
   el contenido de `dist/`, y `zip -q -r -X -D arrecife-a-todo-gas-web.zip juego`.
   Se le manda con SendUserFile.
3. **PC de casa** (conector PC_Casa): la copia del juego está en
   `Downloads\gta canarias\game` (`src\`, `index.html`, `VERSION_WEB.txt`). Antes de
   cambiar nada, copia los archivos que vas a tocar en `_copia_antes_<tema>`. Sube cada
   archivo con `guardar_archivo` (texto, sobrescribir) y comprueba que los bytes que
   devuelve coinciden con `wc -c`. No pases imágenes en base64.
4. **Notas**: añade una sección «Version N» al final de `VERSION_WEB.txt` (aquí y en
   casa). La última es la Version 11.
5. **GitHub**: trabaja en una rama y abre un PR para que quede el historial.

## Datos confirmados de los negocios

- **El Nuevo Maccheroni** (Manolo Millares): Andrea (solo «Andrea», sin apellido) y
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
- Perros salchicha: no se les puede hacer daño. Las patinetas se caen y se levantan.

## Lo que viene (en este orden, acordado con José Manuel)

1. **Nombre «Lava Game» e imagen de lava**: título, pantalla de inicio con logo
   «LAVA GAME», vista previa al compartir, nombre del ZIP (`lava-game-web.zip`, la
   carpeta de dentro sigue siendo `juego/`) y colores de lava (negro y naranja
   incandescente) en el inicio, los menús y el marcador. Todo en `index.html`.
2. **Volcán al fondo**: echa humo de día y brilla en rojo de noche; se ve desde
   toda la ciudad.
3. **Piedras de lava escondidas**: brillan en naranja y dan dinero al cogerlas, como
   los paquetes ocultos de GTA; sobre todo en las puertas de los negocios de los
   clientes (así el juego lleva a la gente a pasar por delante). Contador en el
   marcador y que se recuerden las ya cogidas.
4. **Mapa grande con buscador**: al tocar el minimapa redondo se abre el mapa entero;
   pinchas un punto o escribes una calle o un negocio y el coche aparece allí, en la
   calzada y mirando a lo largo de la calle, y sigues desde ahí. Con la policía detrás
   o en mitad de una misión no se puede. En PC y en móvil.
5. **Estilo GTA V** (referencia: `referencias/estilo-personajes-y-calles.jpg`):
   personajes y calles realistas, por fases y probando el rendimiento en el móvil:
   protagonista sacado de esa imagen (imagen → modelo 3D, esqueleto, animaciones),
   gente de la calle, fachadas canarias (casas blancas, carpintería oscura, balcones de
   madera, piedra volcánica), adoquines, bolardos, farolas de globo blanco, palmeras,
   volcanes al fondo y luz de sol fuerte. Ser sincero con lo que se puede en un juego
   de navegador que va en el móvil.
6. Más adelante: coche «Lava» (deportivo negro con detalles naranjas, premio por reunir
   todas las piedras), misión «¡Erupción!» (la lava baja por las calles y hay que
   escapar o rescatar a la gente) y ampliar a toda Lanzarote.
