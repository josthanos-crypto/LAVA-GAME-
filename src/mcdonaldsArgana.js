import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { paveMaterial, asfalto } from './suelos.js';
import { terrainY } from './terrain.js';
import { buildAparcamientoMcDonalds } from './mcdonaldsAparcamiento.js';

/**
 * McDonald's de Argana — la esquina del centro comercial (Argana Alta).
 *
 * Es la pieza que faltaba del recorrido de José Manuel del 26/10/2026: el vídeo
 * pasa por la zona del restaurante, entre la rotonda y el Mercadona, pero en los
 * fotogramas no llega a salir el rótulo (se buscó el rojo y el amarillo de los
 * arcos en las 2.902 imágenes y no aparece). Así que la posición es la del sitio
 * real —OpenStreetMap lo pone en 28,9727 · −13,5626, o sea x −1223, z −1135— y la
 * planta, la del edificio de la foto aérea: la nave suelta de 26 × 30 m con el
 * aparcamiento alrededor, en la parcela de entre el Burger King y el Mercadona.
 *
 * Se quita el bloque genérico de esa parcela (`skip`) y se levanta el local: el
 * cajón claro con la cristalera, la banda blanca con el rótulo, los arcos en el
 * mástil de la esquina y las plazas pintadas de delante.
 */

const P0 = [-1214, -1149];
const P1 = [-1202, -1126];
const LEN = Math.hypot(P1[0] - P0[0], P1[1] - P0[1]);          // 25,9 m de fachada
const WID = 30.4;                                              // el fondo (polígono del mapa)
const U = [(P1[0] - P0[0]) / LEN, (P1[1] - P0[1]) / LEN];
const N = [U[1], -U[0]];                                       // hacia el aparcamiento del fondo
const RY = Math.atan2(U[0], U[1]) + Math.PI / 2;
const C = [-1194.5, -1144.75];                                 // el centro de la parcela
/** punto en coordenadas del local: s a lo largo de la fachada, t hacia el fondo */
const M = (s, t) => [C[0] + U[0] * s + N[0] * t, C[1] + U[1] * s + N[1] * t];
const FRENTE = -WID / 2;                                       // el muro que da a la calle

const ALTO = 6.2;
const SUELO = 0.32;
const PLAZA = 2.55;
const CLARO = 0xe7e4dc, BLANCO = 0xf4f1e9, PARAPETO = 0xcfcbc0, ALU = 0x9aa0a4, CRISTAL = 0x39434a;

/** quita el bloque genérico de la parcela: este modelo trae el local de verdad */
/** las calles del mapa (las guarda tuneMcDonaldsArgana): el aparcamiento no se pinta encima de ellas */
let CALLES = null;

export function tuneMcDonaldsArgana(map) {
  CALLES = map.roads;
  for (const b of map.buildings || []) {
    const p = b.p || [];
    if (p.length < 3) continue;
    let cx = 0, cz = 0;
    for (const q of p) { cx += q[0]; cz += q[1]; }
    cx /= p.length; cz /= p.length;
    if (Math.hypot(cx - C[0], cz - C[1]) < 9) {
      b.skip = true;
      b.mcdonalds = true;
    }
  }
}

/** los arcos dorados: dos arcos de medio punto con las patas juntas */
function arcos(g, cx, cy, ancho, alto) {
  const r = ancho * 0.26, lw = ancho * 0.13;
  g.strokeStyle = '#ffc72c';
  g.lineWidth = lw;
  g.lineCap = 'butt';
  for (const dx of [-r, r]) {
    g.beginPath();
    g.arc(cx + dx, cy, r, Math.PI, 0);
    g.stroke();
    g.beginPath();
    g.moveTo(cx + dx - r, cy);
    g.lineTo(cx + dx - r, cy + alto * 0.4);
    g.moveTo(cx + dx + r, cy);
    g.lineTo(cx + dx + r, cy + alto * 0.4);
    g.stroke();
  }
}

/** el rótulo de la fachada */
function rotuloFachada() {
  return canvasTex(1024, 160, (g, cw, ch) => {
    g.fillStyle = '#c8102e'; g.fillRect(0, 0, cw, ch);
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = '#ffffff';
    g.font = `700 italic ${Math.round(ch * 0.52)}px "Barlow", Georgia, serif`;
    g.fillText("McDonald's", cw * 0.58, ch * 0.55);
    g.save();
    g.translate(cw * 0.15, ch * 0.5);
    arcos(g, 0, 0, ch * 0.9, ch * 0.8);
    g.restore();
  });
}

/** el mástil de la esquina: los arcos solos, para verlos desde la rotonda */
function rotuloMastil() {
  return canvasTex(512, 420, (g, cw, ch) => {
    g.fillStyle = '#c8102e'; g.fillRect(0, 0, cw, ch);
    g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 6;
    g.strokeRect(3, 3, cw - 6, ch - 6);
    g.save();
    g.translate(0, -ch * 0.06);
    arcos(g, cw / 2, ch * 0.36, cw * 0.72, ch * 0.6);
    g.restore();
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = '#ffffff';
    g.font = `700 italic ${Math.round(ch * 0.16)}px "Barlow", Georgia, serif`;
    g.fillText("McDonald's", cw / 2, ch * 0.86);
  });
}

let BASE = 0;
const alto = (x, z) => Math.max(terrainY(x, z) - BASE + SUELO, SUELO);

export function buildMcDonaldsArgana(scene, colliders) {
  const k = new Kit();
  BASE = terrainY(C[0], C[1]);

  /** pieza pegada a la fachada: w a lo largo (s), d hacia fuera */
  const pieza = (s, t, y, ancho, h, d, hex, list = k.shell) => {
    const [x, z] = M(s, t);
    k.box(x, y, z, ancho, h, d, hex, { ry: RY, list });
  };
  const cartel = (s, t, y, ancho, h, tex) => {
    const [x, z] = M(s, t);
    k.pic(x, y, z, ancho, h, -N[0], -N[1], tex);
  };

  // ── el cajón: cuerpo claro, banda blanca y parapeto ──
  k.box(C[0], 0, C[1], LEN, ALTO, WID, CLARO, { ry: RY, list: k.shell });
  pieza(0, FRENTE - 0.14, 4.05, LEN + 0.1, 1.3, 0.34, BLANCO);
  pieza(0, FRENTE - 0.12, 5.35, LEN + 0.16, ALTO - 5.35, 0.3, PARAPETO);
  pieza(0, 0, ALTO, LEN + 0.4, 0.16, WID + 0.4, PARAPETO);

  // ── la cristalera, con los montantes y las puertas ──
  pieza(0, FRENTE - 0.06, 0, 20, 0.6, 0.14, 0x8c8f8a);
  pieza(0, FRENTE - 0.08, 0.6, 19, 3.45, 0.12, CRISTAL);
  pieza(0, FRENTE - 0.13, 0.52, 19, 0.14, 0.18, ALU);
  pieza(0, FRENTE - 0.13, 3.99, 19, 0.16, 0.18, ALU);
  for (let s = -9.5; s <= 9.51; s += 2.4) pieza(s, FRENTE - 0.12, 0.6, 0.11, 3.45, 0.16, ALU);
  pieza(0, FRENTE - 0.14, 0.05, 5.6, 3.1, 0.1, 0x2f383d);
  for (const ds of [-2.8, -0.9, 0.9, 2.8]) pieza(ds, FRENTE - 0.16, 0.05, 0.12, 3.1, 0.14, 0x77807f);

  // ── la visera de la entrada ──
  pieza(0, FRENTE - 1.1, 4.1, 21, 0.28, 2.2, BLANCO);
  for (const ds of [-10, 10]) {
    const [px, pz] = M(ds, FRENTE - 2.0);
    k.cyl(px, alto(px, pz), pz, 0.14, 0.16, 3.9, 0xbfc2be, { seg: 10 });
  }

  // ── el rótulo de la fachada ──
  cartel(0, FRENTE - 0.34, 4.72, 10.5, 1.2, rotuloFachada());

  // ── el mástil de la esquina, con los arcos ──
  {
    const [px, pz] = M(-1, FRENTE - 6.4);
    const y = alto(px, pz);
    k.cyl(px, y, pz, 0.2, 0.26, 5.4, 0x9ba0a3, { seg: 12 });
    k.box(px, y + 5.3, pz, 3.6, 3.0, 0.34, 0x8f9498, { ry: RY, list: k.solid });
    k.pic(px - N[0] * 0.19, y + 6.8, pz - N[1] * 0.19, 3.4, 2.8, -N[0], -N[1], rotuloMastil());
  }

  // ── el aparcamiento de delante, siguiendo el terreno ──
  // (Version 134) La losa de antes llevaba la altura calculada a mano y el juego le sumaba otra vez la del terreno:
  // quedaba levantada, tapando la acera y el paso de cebra de la rotonda. Ahora: mcdonaldsAparcamiento.js.
  buildAparcamientoMcDonalds(scene, CALLES, M, { s0: -LEN / 2 - 8, s1: LEN / 2 + 8, t0: FRENTE - 20, t1: FRENTE - 0.2, plaza: PLAZA });

  // ── la azotea: climatización y lucernarios ──
  for (const [s, t] of [[-6, -4], [5, 6], [7, -9]]) {
    const [x, z] = M(s, t);
    k.box(x, ALTO + 0.1, z, 2.6, 1.0, 1.9, 0xb9bcb8, { ry: RY, list: k.shell });
  }

  // el choque del local
  k.block(C[0], C[1], LEN, WID, RY);

  const { group, segs } = k.build('mcdonaldsArgana');
  scene.add(group);
  if (colliders) for (const sg of segs) colliders.addSegment(...sg);

  return { group };
}
