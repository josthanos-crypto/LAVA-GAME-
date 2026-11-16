---
name: lava-game
description: Cómo trabajar en Lava Game (GTA Canarias), el juego web de conducción por Arrecife hecho con Three.js y Vite. Úsala al empezar cualquier tarea del juego: dónde está cada cosa, cómo probar y sacar fotos, cómo medir el rendimiento y cómo publicar y entregar una versión.
---

# Lava Game: cómo trabajar

Esta skill es el resumen de trabajo. El detalle está en `CLAUDE.md` (mapa del código, datos confirmados de los
negocios, publicar y entregar), `AGENTS.md` (reglas) y `BARRIOS.md` (la ciudad por barrios). Léelos antes de tocar nada.

## Con José Manuel

- Español sencillo: no es programador. Cuéntale qué cambia en el juego, no cómo está hecho.
- No preguntes si sigues: trabaja hasta terminar y comprobar. Al final, pocas líneas: qué has hecho, qué no y qué
  no has podido comprobar.
- Le preocupa el gasto: lee solo los archivos que hagan falta.

## Reglas que no se saltan

- Antes de un cambio grande, copia de los archivos que vas a tocar en `_copia_antes_<tema>`. Mira antes si la
  carpeta ya existe (hay muchas, algunas antiguas con el mismo nombre): si existe, usa otro nombre.
- No se borra nada sin preguntar. No se toca `src/main.js` ni `index.html` sin avisar antes.
- Código nuevo en archivos nuevos dentro de `src/`; en los archivos de siempre, solo el enganche.
- Coches con marcas y modelos inventados; personas originales (ni de otros juegos ni reales).
- No inventar datos de negocios. Sin nombres de modelos de IA en código, commits ni archivos.
- Nunca claves, tokens, ni el contenido de `_servidor_privado` o `data/mapillary_token.txt`.
- Modelos o texturas de fuera: solo con licencia libre comprobada y apuntada en un LEEME.

## Dónde abrir la sesión

Lo mejor es abrirla en el PC de casa, en la carpeta `game`: ahí se puede compilar, probar con la tarjeta gráfica,
usar los programas del PC y dejar el ZIP hecho.

Si la sesión corre en la nube, el conector del PC de casa solo lee, guarda y copia archivos (no ejecuta nada):
- Se puede traer el código, trabajar y probar en la nube, publicar el enlace y subir los archivos cambiados uno a
  uno (texto, sobrescribir), comprobando después que lo guardado es idéntico.
- No se puede compilar en el PC ni escribir allí el ZIP completo. Los archivos muy grandes (`VERSION_WEB.txt`)
  no se pueden reescribir enteros: se deja la sección nueva en un archivo aparte y un `.bat` que la añade.
- Dilo claro al principio y al final.

## Probar

- Servidor de desarrollo «gta-canarias» (puerto 5274): `http://localhost:5274/?auto&demo&q=low`.
  `window.__game` está listo a los 20-25 s.
- Foto de prueba: `g.camOverride = { pos, look, fov }`, unos pasos con
  `g.step(0.05, { throttle: 0, steer: 0, handbrake: true })` (los mandos, completos: con `{}` el coche del jugador
  se queda con valores rotos y desaparece la carrocería), `g.terrainUniforms.terrainBase.value = g.terrainY(x, z)`
  del sitio de la cámara, `g.renderer.render(g.scene, g.camera)` y mandar
  `canvas.toDataURL('image/jpeg', 0.8)` por POST a `/__shot/<nombre>` (queda en `game/.shots/`).
- Banco de pruebas de modelos: `pruebas/banco.html` enseña coches y personas con la misma luz y cielo que el
  juego, sin ciudad. Se maneja con `window.__b` (`setTime(h)`, `stage`, `clear()`, `shot(nombre, pos, mira, fov)`,
  `tris(objeto)`). Sirve para afinar un modelo; lo definitivo se mira dentro del juego.
- Compara siempre antes y después con la misma cámara: de cerca y de lejos, de día y de noche, y en tamaño móvil.
  Mira las fotos antes de dar algo por bueno.

## Rendimiento

- Mide triángulos y llamadas de dibujo (por objeto y de la escena con `renderer.info`) en `q=low` y en móvil.
- Presupuesto: coche del tráfico unos 3.000 triángulos; el coche y el protagonista que llevas, hasta unos 15.000.
- Ya hay niveles de detalle (Version 133): los coches pasan a una carrocería ligera con
  `userData.setDist(distancia)` (la llaman `traffic.js` y `parked.js`) y la gente tiene un cuerpo ligero
  (`buildHuman({ detail: 0 })`, `p.lejos` en `peds.js`). Lo nuevo que se vea de lejos tiene que respetarlos.
- Texturas de 1024 px como mucho (512 en móvil). En el móvil hay menos coches y gente, y la calidad empieza en baja.

## Entregar una versión

1. Compilar: `npx vite build --base ./`.
2. Publicar en el enlace de siempre (ver «Publicar y entregar» en `CLAUDE.md`): leer antes el artefacto, subir
   `dist/index.html` con el js nuevo de `assets` y quitar el anterior. Comprobar que la web sirve el js nuevo.
3. ZIP `lava-game-web.zip`: todo lo de `dist` dentro de la carpeta `juego/`, sin `textures/argana-alta` y sin
   secretos. Comprobar que se abre. En el PC de casa se puede hacer con `hacer_zip_web.ps1`.
4. Añadir la sección «Version N» al final de `VERSION_WEB.txt` (usa finales de línea de Windows) y poner la
   última versión en `CLAUDE.md`.
5. Mandar las fotos de antes y después y el ZIP, y el resumen final.
