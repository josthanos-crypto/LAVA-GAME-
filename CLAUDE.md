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
- **Gasto y forma de trabajar (lo pidió el 19/11/2026, manda sobre lo anterior)**: se va mejorando el juego y se
  guarda en GitHub; **antes de cada paso caro se le pregunta en una línea y se espera su «adelante»** (él mira los
  tokens que quedan). Pasos caros: copiar al PC de casa, repasar vídeos o fotogramas con ayudantes, pruebas largas o
  de varias fotos, investigar un fallo a fondo y subir a la web. **Al PC de casa no se copia en cada versión**: solo
  cuando lo pida. Una foto de prueba por cambio. No repasar vídeos enteros: solo el fotograma del sitio que diga.
- **Cómo gastar menos (elegido el 19/11/2026)**: (1) encargos pequeños y cerrados: un sitio, un archivo nuevo, una
  carga del juego de prueba con todas sus fotos; (2) **una sola entrega al final** (publicar el enlace y subir a la
  web una vez, con todo lo del rato), no una por cambio, y sin ZIP salvo que lo pida; (3) nada de ayudantes para mirar
  vídeos: que él diga el sitio o mande una foto; (4) ante un fallo raro, preguntarle primero dónde estaba y qué hacía;
  (5) recomendarle sesión nueva para cada bloque de trabajo (una conversación larga se relee entera y es lo más caro).
- **Los `.bat`** (lo pidió el 18/11/2026): no quiere `.bat` ya usados por ahí. Cada `.bat` nuevo se borra solo al
  terminar bien (última línea: `(goto) 2>nul & del "%~f0"`) y solo se deja uno «HACER» (el de la última versión,
  que hace todo lo de las anteriores). El conector no puede borrar archivos: los que queden viejos se borran con un
  `.bat` de limpieza que también se borra a sí mismo. `JUGAR.bat` y `game\ABRIR-JUEGO.bat` no se tocan.

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

Está en **`MAPA_CODIGO.md`** (una fila por archivo, con la versión en que se hizo y lo que falta). **No lo leas
entero**: busca con grep el archivo o el sitio que toque. Cada versión nueva añade allí su fila, no aquí.

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
| Altavista | `altavista/` | las calles, una a una, con las vistas de la calle (kit de aceras; ver su ficha) |
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
   **Subirlo a la web desde aquí** (conector de Hostinger; hecho por primera vez el 19/11/2026 con la Version 163): la
   web es `canaryislandconsulting.es` (usuario `u778984572`) y el juego va en `public_html/juego/`. Primero se mira qué
   hay (`hosting_files_list-website-and-directories`, carpeta `juego`) y se sube **solo lo nuevo o cambiado**: el js
   nuevo de `assets/`, las carpetas de fotos nuevas y, **al final**, `demo.html` e `index.html`. Se sube con
   `hosting_files_generate-upload-url` (da una dirección y dos claves que caducan: no guardarlas en el repositorio) y
   el protocolo TUS con `curl`, a `juego/<ruta>`. **No se toca** lo que no es del juego compilado: `.htaccess`,
   `registro.php`, `confirmar.php`, `admin-registros.php`, `privacidad.html` y la carpeta `datos/` (el registro de
   usuarios y su base de datos). El js viejo se deja (no se borra nada) y la página anterior se guarda como
   `juego/index-anterior-vNNN.html` para poder volver atrás. La red del entorno tiene que permitir
   `srv1471-files.hstgr.io` y `canaryislandconsulting.es` (ya añadidos al entorno «Lava Game (vistas de calle)»). La
   CDN de Hostinger recomprime los JPG al servirlos (el tamaño no coincide con el subido: es normal); el js y los json
   sí salen idénticos. Después se comprueba con `curl` que cada archivo que pide el juego da 200.
3. **PC de casa** (conector PC_Casa; **solo cuando José Manuel lo pida**, ver «Gasto»): la copia del juego está en
   `Downloads\gta canarias\game` (`src\`, `index.html`, `VERSION_WEB.txt`). Antes de
   cambiar nada, copia los archivos que vas a tocar en `_copia_antes_<tema>`. Sube cada
   archivo con `guardar_archivo` (texto, sobrescribir) y comprueba que los bytes que
   devuelve coinciden con `wc -c`. No pases imágenes en base64.
4. **Notas**: añade una sección «Version N» al final de `VERSION_WEB.txt` (aquí y en
   casa). La última es la Version 173.
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
- **Recinto Ferial de Arrecife**: la cubierta gris con aparcamiento de junto a la rotonda de la Vela Latina, al oeste del Cabildo (Avenida Fred Olsen). No es un edificio de pisos: es donde se hacen las fiestas (lo dijo José Manuel, Version 157).
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
