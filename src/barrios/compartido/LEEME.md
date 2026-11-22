# Compartido

Lo que no es de un barrio concreto porque está por toda la ciudad. Si algo se puede
atar a un barrio, mejor va a la carpeta de ese barrio.

## Qué hay

- **La costa y el mar** (`coast.js`): la orilla cerrada de todo Arrecife, con el muro de
  la misión recortado; los muros de costa siguen las cuestas del terreno.
- **El aeropuerto de Lanzarote (ACE)** (`aeropuerto.js`), en el borde suroeste.
- **La naturaleza de los solares** (`naturaleza.js`): tuneras, arbustos, rocas de lava,
  matos y dragos.
- **Señales y semáforos** (`senales.js`): STOP, ceda el paso y límites de velocidad en
  los cruces; el tráfico los respeta (`traffic.js`).
- **Rotondas** (`roundabouts.js`): isleta, escultura y prioridad del anillo.
- **Edificios con nombre de todo Arrecife** (`civic.js`): cabildo, comisarías, hoteles,
  colegios, gasolineras… los rótulos de los clientes no se pisan (`claimSigns`).
- **Tiendas y escaparates** (`shops.js`): los rótulos reales del mapa y la tiendita del
  chino, donde se hace un parón con T.
- **Negocios de Google Maps** (Version 132, `../../negociosGoogle.js`, desde `prepararBarrios`): unos 145 negocios de las
  fichas de Google Maps (bares, restaurantes, cafeterías, supers, tiendas, peluquerías y talleres de todos los barrios)
  que el mapa no traía. Solo nombre y punto de la ficha; el cartel se pone solo en la pared que da a la calle. No se pone
  si ya hay uno con ese nombre, si la pared es una fachada hecha a mano (`../../marcosHechos.json`) o si el negocio tiene
  modelo propio o está dentro de un centro comercial. Se colocan unos 110.
- **La autovía LZ-2 hasta Playa Honda** (Version 164, `../../autoviaLZ2.js`): palmeras a los dos lados, los dos pórticos
  de destinos, los carteles de salida (300/200/100 m y `PLAYA HONDA`), la señal del avión y la pantalla acústica.
- **Detalles de los edificios** (`cityDetail.js`): azoteas, depósitos, balcones,
  contraventanas y árboles del mapa.

## Lo que es sistema, no barrio (sigue en `main.js`)

Tráfico, peatones, policía, coches aparcados, misiones, minimapa, mapa grande, HUD,
sonido, controles, clima, día y noche, volcán, piedras de lava, perros y patinetas.
Esos no son de ningún barrio: están por toda la ciudad y se tocan en su propio archivo.

## Archivos suyos

```
coast.js  aeropuerto.js  naturaleza.js  senales.js  roundabouts.js  civic.js
shops.js  cityDetail.js
```

## Notas del código (venían del mapa del código de CLAUDE.md)

- **Señales y semáforos** (`senales.js`): funcionan de verdad, el tráfico los respeta
  (`traffic.js`). En las rotondas (`r.glorieta`, `extraData.js`) el anillo va antihorario y
  con prioridad y el que entra cede; `world.js` recorta las aceras de los cruces y limpia
  el anillo.
- **Costa y playa** (`coast.js`, `beach.js`): la orilla de todo Arrecife y la playa del
  Reducto con su gente; `parks.js` y `sports.js` reparten parques y canchas del mapa.
- **Edificios con nombre** (`civic.js`): los del mapa que llevan rótulo (cabildo, hoteles,
  colegios, gasolineras…); los clientes llevan el suyo y `claimSigns` (en `main.js`) evita
  que se pinte el genérico. `places.js` (sitios con nombre) y `extraData.js` (playa, rotondas,
  palmeras, aparcamientos) le dan los datos.
- **`cityDetail.js`**: azoteas, depósitos, balcones, contraventanas y árboles del mapa.
- **`shops.js`**: rótulos reales de las tiendas y la tiendita del chino (parón con T).
- **Volcán** (`volcano.js`): al fondo, humo de día y lava al rojo de noche; sigue a la
  cámara a escala y se monta en `main.js` porque es de toda la ciudad.

## Desniveles y puentes (noviembre de 2026)

- `../../desniveles/resto.js` (con `desniveles/comun.js`), en `prepararMapa`: deja en un 12 % más o
  menos las cuestas de lo que queda fuera de los barrios (zonas `ZONAS`). La meseta del Castillo de San
  José no se toca.
- Todos los cruces a distinto nivel están en `../../trinchera.js` (`TRINCHERAS`, 13 con los nuevos).
