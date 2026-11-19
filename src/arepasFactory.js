import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * El Restaurante Arepa's Factory, en la calle Polca 16 (Argana Alta), en la esquina, con la vista de la calle de
 * Google de julio de 2025 (solo se mira, no va dentro del juego; la gente de la foto no se pone): la casa color
 * arena con el zócalo gris; en la esquina, el letrero negro alargado con las flechas rojas, «AREPA'S» y
 * «FACTORY» en blanco y las rayas amarilla y verde de los cantos; a su izquierda, el letrero negro cuadrado con
 * el logo redondo; debajo, la ventana de aluminio blanco con el local por dentro; a la izquierda, la terraza
 * cerrada con el toldo azul de brazos, los paneles de plástico con su cuadrícula blanca y el bajo gris, con las
 * mesas dentro; y en la esquina, la farola negra de farol. El bloque se queda como está; lo de abajo tapa su
 * trozo.
 */

// la fachada de la calle Polca (s de izquierda a derecha mirándola; la esquina cae en s 36,6, como en la foto)
const A = marco([-1936.27, -1762.32], [-1920.41, -1729.39]);
const Z = 0.12, ZF = Z + 0.3, S0 = 23.8, S1 = 36.55, ARENA = 0xd8b88a, GRIS = 0x8a8c8e, AZUL = 0x1e4a9a;
const T0 = 24.2, T1 = 31.0, FUERA = 2.7;

/** antes de levantar la ciudad: fuera el rótulo genérico (y su terraza genérica: lleva la suya) */
export function tuneArepasFactory(map) {
  map.arepasFactorySign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'Arepas Factory');
  if (i >= 0) map.arepasFactorySign = map.signs.splice(i, 1)[0];
  map.arepasFactory = true;
}

// ——— lo que se pinta en lienzo ———

/** el letrero alargado: las flechas rojas, las letras blancas y las rayas de los cantos */
function letrero(g, w, h) {
  g.fillStyle = '#18181a';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#e8c83a';
  g.lineWidth = h * 0.05;
  g.beginPath(); g.arc(0, 0, h * 0.4, 0, Math.PI / 2); g.stroke();
  g.strokeStyle = '#6aa83a';
  g.beginPath(); g.arc(0, 0, h * 0.28, 0, Math.PI / 2); g.stroke();
  g.strokeStyle = '#e8c83a';
  g.beginPath(); g.arc(w, h, h * 0.4, Math.PI, Math.PI * 1.5); g.stroke();
  // las dos flechas rojas
  g.fillStyle = '#d82a2a';
  for (const x of [0.1, 0.19]) {
    g.beginPath();
    g.moveTo(w * x, h * 0.5); g.lineTo(w * x + h * 0.3, h * 0.25); g.lineTo(w * x + h * 0.42, h * 0.25);
    g.lineTo(w * x + h * 0.12, h * 0.5); g.lineTo(w * x + h * 0.42, h * 0.75); g.lineTo(w * x + h * 0.3, h * 0.75);
    g.closePath(); g.fill();
  }
  g.fillStyle = '#f4f4f0';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(h * 0.3)}px "Bahnschrift", "Arial Narrow", Arial, sans-serif`;
  g.fillText("AREPA'S", w * 0.62, h * 0.32);
  g.font = `700 ${Math.round(h * 0.4)}px "Bahnschrift", "Arial Narrow", Arial, sans-serif`;
  g.fillText('FACTORY', w * 0.62, h * 0.7);
}

/** el letrero cuadrado: el logo redondo con la arepa y el nombre */
function logo(g, w, h) {
  g.fillStyle = '#18181a';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#e8c83a';
  g.lineWidth = h * 0.04;
  g.beginPath(); g.arc(w, h, h * 0.35, Math.PI, Math.PI * 1.5); g.stroke();
  g.strokeStyle = '#6aa83a';
  g.beginPath(); g.arc(0, 0, h * 0.3, 0, Math.PI / 2); g.stroke();
  const cx = w / 2, cy = h * 0.48, r = h * 0.3;
  g.fillStyle = '#f4f4f0';
  g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#18181a';
  g.beginPath(); g.arc(cx, cy, r * 0.85, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#e8d8b0';
  g.beginPath(); g.ellipse(cx, cy, r * 0.62, r * 0.42, 0, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#18181a';
  g.lineWidth = 2;
  for (const d of [-0.15, 0.15]) { g.beginPath(); g.moveTo(cx - r * 0.55, cy + d * r); g.lineTo(cx + r * 0.55, cy + d * r); g.stroke(); }
  g.fillStyle = '#f4f4f0';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(h * 0.1)}px "Bahnschrift", "Arial Narrow", Arial, sans-serif`;
  g.fillText("AREPA'S", cx, h * 0.12);
  g.font = `700 ${Math.round(h * 0.13)}px "Bahnschrift", "Arial Narrow", Arial, sans-serif`;
  g.fillText('FACTORY', cx, h * 0.88);
}

/** el local por la ventana: oscuro, con la luz de la barra y un cartel de neón */
function ventana(g, w, h) {
  g.fillStyle = '#1e1e22';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#6a5438';
  g.fillRect(w * 0.55, h * 0.12, w * 0.4, h * 0.08);
  g.fillStyle = '#2a3a5a';
  g.fillRect(w * 0.6, h * 0.5, w * 0.3, h * 0.3);
  g.strokeStyle = '#f0f0ff';
  g.lineWidth = 2;
  for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(w * 0.08, h * (0.32 + i * 0.1)); g.lineTo(w * 0.3, h * (0.32 + i * 0.1)); g.stroke(); }
  g.fillStyle = 'rgba(255,255,255,.12)';
  g.fillRect(0, 0, w * 0.3, h);
}

/** el panel de plástico de la terraza con su cuadrícula blanca */
function plastico(g, w, h) {
  g.fillStyle = '#9aa8b4';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#f4f4f2';
  g.lineWidth = 3;
  for (let x = w / 6; x < w; x += w / 6) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  for (let y = h / 5; y < h; y += h / 5) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  g.fillStyle = 'rgba(255,255,255,.18)';
  g.fillRect(0, 0, w, h * 0.3);
}

// ——— las piezas ———

/** una mesa de terraza con dos sillas de mimbre */
function mesa(k, s, z) {
  k.cyl(s, 0, z, 0.04, 0.04, 0.72, 0x3a3a3c, { seg: 6 });
  k.box(s, 0.72, z, 0.7, 0.03, 0.7, 0x2a2a2c);
  for (const d of [-0.6, 0.6]) {
    k.box(s + d, 0, z, 0.45, 0.45, 0.45, 0x8a6a4a);
    k.box(s + d * 1.35, 0.45, z, 0.06, 0.45, 0.45, 0x8a6a4a);
  }
}

/** la esquina: la pared y el zócalo, los dos letreros, la ventana, la terraza del toldo azul y la farola */
function fachada(k) {
  // la pared color arena del bajo por delante de lo genérico, con el zócalo gris
  k.box((S0 + S1) / 2, 0, Z + 0.15, S1 - S0, 3.5, 0.3, ARENA);
  k.box((S0 + S1) / 2, 0, Z + 0.18, S1 - S0, 1.25, 0.32, GRIS);
  k.block((S0 + S1) / 2, Z + 0.15, S1 - S0, 0.3);
  // la ventana de aluminio blanco con su recerco
  const v0 = 32.5, v1 = 35.4;
  k.pic((v0 + v1) / 2, 2.0, ZF + 0.01, v1 - v0, 1.45, 0, 1, canvasTex(240, 120, ventana), { glow: 0.15 });
  k.box((v0 + v1) / 2, 1.27, ZF + 0.02, 0.06, 1.45, 0.06, 0xf2f2f0);
  for (const s of [v0, v1]) k.box(s, 1.25, ZF + 0.02, 0.1, 1.55, 0.08, 0xf2f2f0);
  for (const y of [1.25, 2.72]) k.box((v0 + v1) / 2, y, ZF + 0.02, v1 - v0 + 0.1, 0.08, 0.08, 0xf2f2f0);
  k.box((v0 + v1) / 2, 2.82, ZF + 0.03, v1 - v0 + 0.5, 0.12, 0.1, 0xe8dcc4);
  // los dos letreros negros, despegados de la pared
  k.box(34.1, 3.25, ZF + 0.06, 2.9, 0.8, 0.12, 0x18181a);
  k.pic(34.1, 3.65, ZF + 0.125, 2.88, 0.78, 0, 1, canvasTex(520, 140, letrero));
  k.box(30.2, 3.25, ZF + 0.06, 1.2, 0.85, 0.12, 0x18181a);
  k.pic(30.2, 3.675, ZF + 0.125, 1.18, 0.83, 0, 1, canvasTex(200, 140, logo));
  // la terraza cerrada: el toldo azul inclinado con sus brazos, los paneles de plástico y el bajo gris
  const tm = (T0 + T1) / 2, L = T1 - T0, yP = 3.0, yF = 2.45, Lt = Math.hypot(FUERA, yP - yF);
  const tela = new THREE.BoxGeometry(L + 0.2, 0.03, Lt);
  tela.rotateX(Math.atan2(yP - yF, FUERA));
  tela.translate(tm, (yP + yF) / 2, ZF + FUERA / 2);
  k.add(tela, AZUL);
  k.box(tm, yF - 0.2, ZF + FUERA, L + 0.2, 0.2, 0.03, AZUL);
  k.box(tm, yF - 0.06, ZF + FUERA - 0.05, L + 0.2, 0.06, 0.08, 0xf2f2f0);
  for (const s of [T0 + 0.05, tm, T1 - 0.05]) k.box(s, 0, ZF + FUERA - 0.05, 0.08, yF - 0.06, 0.08, 0xf2f2f0);
  const pt = canvasTex(240, 120, plastico);
  k.box(tm, 0, ZF + FUERA - 0.05, L, 0.9, 0.05, 0x6a6c70);
  for (const [a, b] of [[T0, tm], [tm, T1]]) k.pic((a + b) / 2, 0.9 + (yF - 1.0) / 2, ZF + FUERA - 0.02, b - a - 0.1, yF - 1.0, 0, 1, pt);
  k.block(tm, ZF + FUERA - 0.05, L, 0.1);
  // el lateral de la derecha, con el mismo plástico
  k.box(T1, 0, ZF + FUERA / 2, 0.05, 0.9, FUERA, 0x6a6c70);
  k.glass.push(new THREE.PlaneGeometry(FUERA, yF - 1.0).rotateY(Math.PI / 2).translate(T1, 0.9 + (yF - 1.0) / 2, ZF + FUERA / 2));
  k.block(T1, ZF + FUERA / 2, 0.1, FUERA);
  for (const s of [T0 + 1.6, T0 + 4.6]) mesa(k, s, ZF + 1.2);
  // la farola negra de farol de la esquina
  const sf = S1 - 0.4, zf = ZF + 1.3;
  k.cyl(sf, 0, zf, 0.12, 0.16, 0.5, 0x1e1e20, { seg: 10 });
  k.cyl(sf, 0.5, zf, 0.06, 0.07, 3.3, 0x1e1e20, { seg: 8 });
  k.box(sf, 3.8, zf, 0.3, 0.42, 0.3, 0xf4ecd0, { list: k.glow });
  k.cyl(sf, 4.22, zf, 0.02, 0.24, 0.18, 0x1e1e20, { seg: 8 });
  k.block(sf, zf, 0.3, 0.3);
}

/** se monta con lo demás de Argana Alta */
export function buildArepasFactory(scene, colliders, map) {
  if (!map?.arepasFactory) return null;
  const k = new Kit();
  fachada(k);
  const group = enMarco(k, A, 'arepasFactory', colliders);
  scene.add(group);
  return { group };
}
