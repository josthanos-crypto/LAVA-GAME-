import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * Galicia Nuestra Casa, el bar restaurante gallego de la calle Guatemala 14 (centro), con la vista de la calle de
 * Google de julio de 2025 y las fotos de Google Maps de 2018 a 2026 (solo se miran, no van dentro del juego; la
 * gente no se pone): la casa color crema con su moldura; el frente del bar con las rejas negras de forja con sus
 * volutas y, detrás, el bar (la barra, las mesas y los azulejos); el toldillo azul con la raya blanca; el cartel
 * azul colgado de brazo con «Galicia Nuestra Casa» y la cruz roja de Santiago; la puerta marrón de lamas del
 * cuarto de contadores con el número 14 encima y el cajetín de la luz. Al lado, la casa blanca del 16 con su zócalo
 * de granito marrón, la puerta del garaje y la puerta de madera de arco. El bloque se queda como está; lo de abajo
 * tapa su trozo.
 */

// la cara de la calle Guatemala (s de oeste a este); Google pone el bar en s 23,4 (el rótulo del mapa en s 19,3)
const M = marco([-709.7, -154.5], [-676.83, -170.2]);
const Z = 0.12, ZF = Z + 0.3, YP = 3.6, CREMA = 0xe8d2a8, BLANCO = 0xf0eee8, AZUL = 0x1e5ab8;

/** antes de levantar la ciudad: fuera el rótulo genérico */
export function tuneGaliciaNuestraCasa(map) {
  map.galiciaNuestraCasaSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'Galicia Nuestra Casa' && Math.hypot(s.x + 692.7, s.z + 162.6) < 15);
  if (i >= 0) map.galiciaNuestraCasaSign = map.signs.splice(i, 1)[0];
  map.galiciaNuestraCasa = true;
}

// ——— lo que se pinta en lienzo ———

/** el frente del bar: dentro la barra, las mesas y los azulejos; delante, las rejas negras con sus volutas */
function rejas(g, w, h) {
  g.fillStyle = '#4a4440';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#e8e4dc';
  g.fillRect(0, 0, w, h * 0.45);
  g.fillStyle = '#c8d0d8';
  for (let x = 0; x < w; x += 10) for (let y = h * 0.25; y < h * 0.45; y += 10) if ((x + y) % 20 < 10) g.fillRect(x, y, 9, 9);
  g.fillStyle = '#6a5040';
  g.fillRect(w * 0.05, h * 0.5, w * 0.5, h * 0.22);
  g.fillStyle = '#2a2a2c';
  for (const x of [0.65, 0.82]) { g.fillRect(w * x, h * 0.6, w * 0.1, h * 0.03); g.fillRect(w * x + 3, h * 0.63, 4, h * 0.2); }
  g.fillStyle = 'rgba(0,0,0,.25)';
  g.fillRect(0, 0, w, h);
  // las rejas
  g.strokeStyle = '#1a1a1c';
  g.lineWidth = 5;
  g.strokeRect(3, 3, w - 6, h - 6);
  for (const x of [0.25, 0.5, 0.75]) { g.beginPath(); g.moveTo(w * x, 0); g.lineTo(w * x, h); g.stroke(); }
  g.lineWidth = 3;
  for (let x = w / 24; x < w; x += w / 24) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  for (const y of [0.25, 0.6, 0.72]) { g.beginPath(); g.moveTo(0, h * y); g.lineTo(w, h * y); g.stroke(); }
  g.lineWidth = 2;
  for (let x = w / 24; x < w; x += w / 12) {
    g.beginPath(); g.arc(x + w / 48, h * 0.66, w / 60, 0, Math.PI * 2); g.stroke();
  }
}

/** el cartel azul con el nombre de arriba abajo y la cruz de Santiago */
function cartel(g, w, h) {
  g.fillStyle = '#f2f2ee';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#2a6ac8';
  g.fillRect(3, 3, w - 6, h - 6);
  g.save();
  g.translate(w * 0.5, h * 0.35);
  g.rotate(Math.PI / 2);
  g.fillStyle = '#f4f4f0';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `italic 700 ${Math.round(w * 0.26)}px Georgia, serif`;
  g.fillText('Galicia', 0, -w * 0.18);
  g.font = `italic 700 ${Math.round(w * 0.2)}px Georgia, serif`;
  g.fillText('Nuestra Casa', 0, w * 0.16);
  g.restore();
  // la cruz de Santiago en rojo
  const cx = w * 0.5, cy = h * 0.8, r = w * 0.3;
  g.strokeStyle = '#d82a2a';
  g.lineWidth = w * 0.08;
  g.beginPath(); g.moveTo(cx, cy - r); g.lineTo(cx, cy + r); g.stroke();
  g.beginPath(); g.moveTo(cx - r * 0.7, cy - r * 0.35); g.lineTo(cx + r * 0.7, cy - r * 0.35); g.stroke();
  g.fillStyle = '#d82a2a';
  g.beginPath(); g.moveTo(cx, cy + r * 1.2); g.lineTo(cx - r * 0.2, cy + r * 0.8); g.lineTo(cx + r * 0.2, cy + r * 0.8); g.fill();
}

/** la puerta marrón de lamas del cuarto de contadores */
function puertaLamas(g, w, h) {
  g.fillStyle = '#6a3e2a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#4a2a1a';
  for (const y0 of [0.04, 0.82]) for (let y = y0; y < y0 + 0.14; y += 0.03) g.fillRect(w * 0.1, h * y, w * 0.8, h * 0.012);
  g.fillStyle = '#f2d24a';
  g.beginPath(); g.moveTo(w * 0.15, h * 0.42); g.lineTo(w * 0.3, h * 0.32); g.lineTo(w * 0.45, h * 0.42); g.fill();
}

/** la puerta del garaje del 16, de lamas marrones */
function garaje(g, w, h) {
  g.fillStyle = '#8a5a3a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#6a4228';
  for (let y = 6; y < h; y += 10) g.fillRect(0, y, w, 3);
}

/** la puerta de madera de arco del 16 */
function puertaArco(g, w, h) {
  g.fillStyle = '#f0eee8';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#3a2a1e';
  g.beginPath(); g.moveTo(0, h); g.lineTo(0, h * 0.2); g.arc(w / 2, h * 0.2, w / 2, Math.PI, 0); g.lineTo(w, h); g.fill();
  g.strokeStyle = 'rgba(200,170,130,.4)';
  g.lineWidth = 2;
  g.beginPath(); g.moveTo(w / 2, h * 0.05); g.lineTo(w / 2, h); g.stroke();
  for (const y of [0.35, 0.55, 0.75]) for (const x of [0.12, 0.58]) g.strokeRect(w * x, h * y, w * 0.3, h * 0.15);
}

/** el granito marrón del zócalo del 16 */
function granito(g, w, h) {
  g.fillStyle = '#6a5048';
  g.fillRect(0, 0, w, h);
  let s = 7;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 600; i++) { g.fillStyle = r() < 0.5 ? 'rgba(30,20,18,.45)' : 'rgba(170,140,130,.4)'; g.fillRect(r() * w, r() * h, 2, 2); }
}

// ——— las piezas ———

/** la casa del bar y la del 16 */
function fachada(k) {
  // la casa crema del bar con su moldura
  k.box(23.5, 0, Z + 0.15, 8.0, YP, 0.3, CREMA);
  k.block(23.5, Z + 0.15, 8.0, 0.3);
  k.box(23.5, YP, ZF + 0.03, 8.0, 0.18, 0.12, 0xf0e4c8);
  k.pic(23.55, 1.3, ZF + 0.01, 4.1, 2.6, 0, 1, canvasTex(400, 250, rejas), { glow: 0.12 });
  k.pic(20.7, 0.85, ZF + 0.01, 0.8, 1.7, 0, 1, canvasTex(70, 150, puertaLamas));
  k.box(20.7, 2.0, ZF + 0.01, 0.2, 0.15, 0.01, 0x2a2a2c);
  k.box(26.1, 1.6, ZF + 0.04, 0.35, 0.45, 0.1, 0xe8e6e0);
  // el toldillo azul con la raya blanca
  const fuera = 0.7, yP = 3.0, yF = 2.7;
  const tela = new THREE.BoxGeometry(5.2, 0.03, Math.hypot(fuera, yP - yF));
  tela.rotateX(Math.atan2(yP - yF, fuera));
  tela.translate(23.6, (yP + yF) / 2, ZF + fuera / 2);
  k.add(tela, AZUL);
  k.box(23.6, yF - 0.22, ZF + fuera, 5.2, 0.22, 0.03, AZUL);
  k.box(23.6, yF - 0.13, ZF + fuera + 0.02, 5.2, 0.05, 0.01, 0xf2f2ee);
  // el cartel azul colgado de su brazo
  k.box(25.2, 4.35, ZF + 0.45, 0.05, 0.05, 0.9, 0x2a2a2c);
  k.box(25.2, 3.0, ZF + 0.55, 0.05, 1.3, 0.45, 0x2a6ac8);
  k.pic(25.23, 3.65, ZF + 0.55, 0.45, 1.3, 1, 0, canvasTex(90, 260, cartel));
  k.pic(25.17, 3.65, ZF + 0.55, 0.45, 1.3, -1, 0, canvasTex(90, 260, cartel));
  // la casa blanca del 16, con su zócalo de granito, el garaje y la puerta de arco
  k.box(16.5, 0, Z + 0.15, 6.0, YP, 0.3, BLANCO);
  k.block(16.5, Z + 0.15, 6.0, 0.3);
  k.pic(16.5, 1.25, ZF + 0.005, 6.0, 2.5, 0, 1, canvasTex(300, 125, granito));
  k.pic(15.0, 1.15, ZF + 0.01, 2.3, 2.3, 0, 1, canvasTex(200, 200, garaje));
  k.pic(18.3, 1.2, ZF + 0.01, 0.9, 2.4, 0, 1, canvasTex(90, 240, puertaArco));
  k.box(17.4, 1.5, ZF + 0.04, 0.2, 0.3, 0.1, 0x2a2a2c);
}

/** se monta con lo demás de Arrecife Centro */
export function buildGaliciaNuestraCasa(scene, colliders, map) {
  if (!map?.galiciaNuestraCasa) return null;
  const k = new Kit();
  fachada(k);
  const group = enMarco(k, M, 'galiciaNuestraCasa', colliders);
  scene.add(group);
  return { group };
}
