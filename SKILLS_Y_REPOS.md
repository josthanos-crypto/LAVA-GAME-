# Skills y repos del PC útiles para Lava Game

Inventario hecho el 25/10/2026. Todo lo que hay aquí está **incorporado** al
proyecto: las skills están copiadas en `game/.claude/skills/` y los repos se
referencian por su ruta para usarlos cuando haga falta.

## 1. Skills incorporadas (23) — en `game/.claude/skills/`

Se cargan solas cuando la tarea encaja. No hay que pedirlas a mano.

### Para construir el juego (código)
- **frontend-design** — interfaces web con buen diseño (menús, HUD, pantallas).
- **web-artifacts-builder** — componentes web más complejos con estado.
- **frontend-patterns** — patrones de frontend (estado, render, componentes).
- **coding-standards** — estilo y buenas prácticas de código.
- **documentation-lookup** — buscar documentación de librerías (Three.js, Vite).
- **search-first** — buscar antes de inventar: evita reimplementar lo que ya existe.

### Calidad y pruebas
- **tdd-workflow** — flujo de tests (útil para lógica de física, rutas).
- **verification-loop** — verificar cambios antes de darlos por hechos.
- **e2e-testing** — pruebas end-to-end en navegador.
- **security-review** — revisión de seguridad (por si se añade backend/servidor).

### Diseño y planificación
- **excalidraw-diagrams** — diagramas de arquitectura del juego.
- **flowchart-builder** — flujos de decisión (misiones, IA de tráfico).
- **gitreverse** — entender un repo de GitHub para replicar una idea.

### Assets y media
- **fal-ai-media** — generar imágenes (texturas, rótulos, gente) con IA.
- **video-editing** — editar vídeo (tráilers, reels del juego).

### Prompts e IA (ahorro de tokens)
- **prompt-master** — prompts optimizados para cualquier herramienta.
- **prompt-engineering-patterns** — patrones avanzados de prompts.
- **ollama-delegate** — delegar código repetitivo a Ollama local (ahorra tokens).
- **context-budget** — controlar el gasto de tokens en conversaciones largas.

### Meta
- **skill-creator** — crear skills nuevas (por ejemplo una skill propia de Lava Game).
- **find-skills** — buscar más skills instalables.
- **safety-guard** — evitar operaciones destructivas en producción.
- **pdf** — leer/escribir PDFs (documentación, manuales).

## 2. Repos del PC útiles para el juego

| Repo / carpeta | Para qué sirve en Lava Game | Ruta |
|---|---|---|
| ComfyUI | Generar texturas, rótulos de negocios, gente, props. | `C:\Users\joseb\ComfyUI` |
| Hunyuan3D-2 | Generar modelos 3D (props, coches, personajes) a partir de imagen. | `C:\Users\joseb\Hunyuan3D-2` |
| Fooocus | Generación de imágenes rápida (texturas, conceptos). | `C:\Users\joseb\iCloudDrive\Tools\Fooocus` |
| AnimateDiff | Animaciones de vídeo para tráilers/reels. | `C:\Users\joseb\iCloudDrive\Tools\AnimateDiff` |
| supertonic | Texto a voz (radio del coche, voces de NPCs). | `C:\Users\joseb\supertonic` |
| landing_page | Ejemplo de web estática (referencia de estructura). | `C:\Users\joseb\landing_page` |
| claude-cookbooks | Ejemplos de uso de IA (referencia). | `C:\Users\joseb\claude-cookbooks` |

### Cómo usarlos
- **Texturas/rótulos**: generar en ComfyUI o Fooocus → guardar en `game/public/` y referenciar desde `textures.js` o el módulo correspondiente.
- **Modelos 3D**: generar en Hunyuan3D-2 → exportar GLB/OBJ → cargar con Three.js en un módulo nuevo (`src/<nombre>.js`), siguiendo el patrón de `atlantida.js`.
- **Voces**: generar con supertonic → archivos de audio en `game/public/audio/` → reproducir con WebAudio (como el sonido del motor).

## 3. Cómo se incorporó

- Skills copiadas a `game/.claude/skills/` (23 carpetas).
- Este documento creado en `game/SKILLS_Y_REPOS.md`.
- Referencia añadida en `CLAUDE.md` y `AGENTS.md`.

## 4. Próximos pasos sugeridos

- Si hace falta una skill propia de Lava Game (reglas del proyecto, convenciones de módulos, cómo añadir un local nuevo), crearla con **skill-creator**.
- Para ahorrar tokens en sesiones largas, usar **ollama-delegate** para código repetitivo y **context-budget** para no cargar todo el código.
- Antes de añadir un modelo 3D nuevo, probar primero en Hunyuan3D-2 con una imagen de referencia.
