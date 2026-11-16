/**
 * LOS BARRIOS DE ARRECIFE — el registro.
 *
 * El juego está partido por barrios para no tener que leerlo entero cada vez:
 * cada carpeta de aquí dentro tiene lo que se construye en ese barrio y su ficha
 * (LEEME.md). El índice con los límites y lo que hay en cada uno está en
 * src/barrios/LEEME.md y en BARRIOS.md (en la raíz del juego).
 *
 * Para añadir algo nuevo: se pone en el `construir()` del barrio que toque.
 * Si es de toda la ciudad, en `compartido`.
 */

import * as arganaAlta from './argana-alta/index.js';
import * as maneje from './maneje/index.js';
import * as titerroy from './titerroy/index.js';
import * as altavista from './altavista/index.js';
import * as valterra from './valterra/index.js';
import * as centro from './arrecife-centro/index.js';
import * as sanFranciscoJavier from './san-francisco-javier/index.js';
import * as playaHonda from './playa-honda/index.js';
import * as compartido from './compartido/index.js';
import { tuneNegociosGoogle } from '../negociosGoogle.js';

/** los barrios en el orden en que se construyen */
export const BARRIOS = {
  'arrecife-centro': centro,
  valterra,
  'san-francisco-javier': sanFranciscoJavier,
  titerroy,
  'argana-alta': arganaAlta,
  altavista,
  maneje,
  'playa-honda': playaHonda,
  compartido,
};

/**
 * Retoques al mapa de OpenStreetMap (alturas de edificios, fachadas, quitar lo que sobra).
 * Se llama ANTES de levantar la ciudad: world.js tiene que ver el mapa ya retocado.
 */
export function prepararBarrios(map) {
  for (const barrio of Object.values(BARRIOS)) barrio.prepararMapa?.(map);
  // los negocios de Google Maps que faltaban: al final, cuando cada barrio ya ha quitado y puesto lo suyo
  tuneNegociosGoogle(map);

  // los barrios añaden y quitan cosas del mapa (carteles, edificios): el resumen
  // que trae el JSON se queda desfasado, así que se pone al día al terminar
  if (map.meta) {
    if (Array.isArray(map.buildings)) map.meta.buildings = map.buildings.length;
    if (Array.isArray(map.signs)) map.meta.signs = map.signs.length;
    if (Array.isArray(map.roads)) map.meta.roads = map.roads.length;
  }
}

/**
 * Antes que nada: lo que tiene que estar por debajo del resto. Hoy es solo la costa
 * (los muros de la orilla), que se dibujaba antes que toda la ciudad.
 */
export function construirBarriosAlPrincipio(ctx, salida = {}) {
  for (const [id, barrio] of Object.entries(BARRIOS)) {
    if (!barrio.construirPrimero) continue;
    salida[id] = Object.assign(salida[id] || {}, barrio.construirPrimero(ctx));
  }
  return salida;
}

/**
 * Primera fase: todo lo que no necesita los locales (edificios, calles, parques, playa...).
 * Devuelve un objeto por barrio con lo que hay que actualizar en cada fotograma.
 */
export function construirBarrios(ctx, salida = {}) {
  for (const [id, barrio] of Object.entries(BARRIOS)) {
    if (!barrio.construir) continue;
    salida[id] = Object.assign(salida[id] || {}, barrio.construir(ctx));
  }
  return salida;
}

/**
 * Segunda fase: lo que necesita los locales ya creados (terrazas con sus mesas,
 * el alcalde en la puerta del Ayuntamiento, el tanatorio con la oficina del cliente).
 */
export async function construirBarriosConLocales(ctx) {
  for (const [id, barrio] of Object.entries(BARRIOS)) {
    if (!barrio.construirConLocales) continue;
    Object.assign(ctx.salida[id], await barrio.construirConLocales(ctx));
  }

  // último repaso al resumen del mapa: los locales y las terrazas mueven carteles,
  // así que hasta aquí no se sabe el número final
  const { map } = ctx;
  if (map?.meta) {
    if (Array.isArray(map.buildings)) map.meta.buildings = map.buildings.length;
    if (Array.isArray(map.signs)) map.meta.signs = map.signs.length;
    if (Array.isArray(map.roads)) map.meta.roads = map.roads.length;
  }
}
