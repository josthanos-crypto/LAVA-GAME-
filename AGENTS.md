# Reglas para OpenCode (y cualquier agente) en Lava Game

Antes de tocar nada, lee `CLAUDE.md` de esta carpeta: ahí está el mapa del código, cómo probar el juego y cómo publicar.

El juego está **partido por barrios**: `BARRIOS.md` dice qué hay en cada uno y en qué carpeta está. Para una tarea de una zona, lee solo `src/barrios/<barrio>/LEEME.md` y su `index.js`; no hace falta leer `main.js` entero.

## Reparto de trabajo
- Trabajas en tareas concretas: una zona o una cosa cada vez.
- Claude revisa lo que haces y lo integra. No rehagas desde cero lo que ya está hecho; retoca.

## Reglas
- Trabaja en esta carpeta del juego (`game`).
- Antes de cada cambio grande, haz una copia en `_copia_antes_<tema>` (archivos que vas a cambiar).
- No toques `src/main.js` ni `index.html` sin avisar antes.
- No borres nada sin preguntar.
- No inventes datos de negocios ni de sitios reales (nombres, teléfonos, horarios, platos, precios).
- No pises lo que ya funciona en la versión actual: solo añadir o mejorar.
- El código nuevo va en un archivo nuevo dentro de `src/`, siguiendo el patrón de `atlantida.js` o `farmaciaGuenia.js`, y se llama desde el `construir()` del barrio que toque (`src/barrios/<barrio>/index.js`).
- No pongas nombres de modelos de IA en commits, PR, artefactos ni código.
- Los archivos de Wikimedia Commons no se copian a `public/` hasta confirmar la licencia.

## Cómo informar (para José Manuel)
- Habla en español sencillo. Dile qué cambia en el juego, no cómo está hecho por dentro.
- Al terminar cada tarea, dile en pocas líneas qué ha cambiado y cómo probarlo.
- Dile si algo ha quedado a medias.
- Añade una sección «Version N» al final de `VERSION_WEB.txt` (la última es la Version 78).

## Antes de dar algo por hecho
- Compila con `npx vite build --base ./`.
- Pruébalo en el navegador (ver «Probar» en `CLAUDE.md`) y mira las fotos que salgan.

## Skills y repos utiles (incorporados)
Ver SKILLS_Y_REPOS.md: 23 skills en game/.claude/skills/ y repos del PC (ComfyUI, Hunyuan3D-2, Fooocus, AnimateDiff, supertonic) para assets, texturas, modelos 3D y voces.
