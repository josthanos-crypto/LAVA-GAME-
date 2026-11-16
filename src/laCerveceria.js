import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * La Cervecería, en la plaza del Reducto (avenida Fred Olsen), al lado de La Botica, con la foto de Google
 * Maps (solo se mira, no va dentro del juego). El juego ya trae sus terrazas cerradas («La Cervecería · El
 * Reducto», con el techo granate, las cristaleras y las guirnaldas) y la puerta al local: todo eso se queda,
 * y el rótulo del mapa también (es el que abre la puerta), igual que las mesas que el juego tiene delante, en
 * la plaza. Aquí se pone lo que faltaba de la foto: el faldón color teja de la pared, justo encima del techo
 * granate, con «La Cervecería» dos veces en letra de mano marrón, la espiral de la izquierda y el sol.
 */

// la cara sur del bloque, a la plaza (s de oeste a este, la misma medida que usan las terrazas del juego)
const C = marco([-725.5, 405.1], [-671.7, 421.4]);
// el tramo de La Cervecería en esas terrazas (de 9,5 m antes del rótulo a medio camino de La Botica)
const S0 = 21.7, S1 = 38.85, Z = 0.15;
// la altura del techo de las terrazas junto a la pared (más los 0,2 m a los que se levantan)
const TECHO = 3.45;

/** antes de levantar la ciudad: solo se apunta (el rótulo no se quita, que abre la puerta del local) */
export function tuneLaCerveceria(map) {
  map.laCerveceria = true;
}

// ——— lo que se pinta en lienzo ———

const MANO = '"Segoe Script", "Brush Script MT", "Lucida Handwriting", cursive';

/** la espiral crema y marrón del letrero de la izquierda */
function espiral(g, x, y, r) {
  g.fillStyle = '#efe2c8';
  g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#6a3a22';
  g.lineWidth = r * 0.12;
  g.beginPath();
  for (let a = 0; a < Math.PI * 6; a += 0.1) {
    const rr = r * 0.85 * (a / (Math.PI * 6));
    const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr;
    if (a === 0) g.moveTo(px, py); else g.lineTo(px, py);
  }
  g.stroke();
}

/** el sol de la derecha: el disco y los rayos */
function sol(g, x, y, r) {
  g.fillStyle = '#e8b030';
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    g.beginPath();
    g.moveTo(x + Math.cos(a - 0.12) * r * 0.6, y + Math.sin(a - 0.12) * r * 0.6);
    g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
    g.lineTo(x + Math.cos(a + 0.12) * r * 0.6, y + Math.sin(a + 0.12) * r * 0.6);
    g.fill();
  }
  g.fillStyle = '#6a3a22';
  g.beginPath(); g.arc(x, y, r * 0.55, 0, Math.PI * 2); g.fill();
}

/** el faldón color teja: La Cervecería dos veces, con la espiral y el sol */
function faldon(g, w, h) {
  g.fillStyle = '#c8937a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(90,50,30,.12)';
  g.fillRect(0, h * 0.9, w, h * 0.1);
  espiral(g, w * 0.08, h * 0.5, h * 0.42);
  sol(g, w * 0.86, h * 0.5, h * 0.48);
  g.fillStyle = '#5a2c1c';
  g.textBaseline = 'middle';
  g.textAlign = 'center';
  g.font = `700 ${Math.round(h * 0.62)}px ${MANO}`;
  g.fillText('La Cervecería', w * 0.3, h * 0.54);
  g.fillText('La Cervecería', w * 0.63, h * 0.54);
}

// ——— las piezas ———

/** el faldón de la pared, justo encima del techo de la terraza */
function faldonPared(k) {
  const sm = (S0 + S1) / 2;
  k.box(sm, TECHO + 0.05, Z + 0.15, S1 - S0, 0.9, 0.3, 0xc8937a);
  k.pic(sm, TECHO + 0.5, Z + 0.305, S1 - S0 - 0.1, 0.84, 0, 1, canvasTex(1536, 80, faldon));
}

/** segunda fase, como los demás de este barrio */
export function buildLaCerveceria(scene, colliders, map) {
  if (!map?.laCerveceria) return null;
  const group = new THREE.Group();
  group.name = 'laCerveceria';
  const k = new Kit();
  faldonPared(k);
  group.add(enMarco(k, C, 'faldonLaCerveceria', colliders));
  scene.add(group);
  return { group };
}
