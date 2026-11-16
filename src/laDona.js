import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';
import { alzarEdificio, paredAlta, ventana as ventanaAlta, aire, cristales, medianera } from './edificioReal.js';

/**
 * La Cafetería Pastelería La Dona, en la avenida Hernández Pacheco 11 (Titerroy), al lado de la Farmacia Titerroy, con
 * la vista de la calle de Google de julio de 2025 (solo se mira, no va dentro del juego; la gente no se pone). Google
 * todavía la llama «Los Valles» (la panadería que había, con fotos de dentro de 2021), pero en la foto de la calle el
 * letrero es el de La Dona: la banda de cuadritos azules con «CAFETERÍA», las letras grandes blancas de «LA DONA» con
 * el dónut de chocolate en la O y «PASTELERÍA»; el toldo de rayas color crema con su faldón; debajo, la ventana del
 * marco de granito, la entrada de cristal con el bar dentro, la puerta de lamas de madera, el granito rosado y el
 * cajetín; delante, la terraza con la valla de barrotes gris, las mesas, las sillas negras y la mesita redonda de
 * madera; arriba, la ventana redonda; y al lado, el zócalo de piedra con la puerta verde de cuarterones. El bloque del
 * mapa (de una planta) se queda debajo; lo de abajo tapa su trozo. Encima, los edificios de verdad (vista de la calle
 * mirando hacia arriba): el de La Dona, blanco, de dos plantas, con la ventana de madera marrón y su barandilla, la
 * terraza metida con el peto de lamas blancas en marco marrón y el aire, las dos ventanas redondas y la cornisa con su
 * remate; y el de al lado, blanco, de cuatro plantas, con las ventanas de marco verde y los balcones de celosía.
 */

// la misma fachada de la avenida que la Farmacia Titerroy (s de izquierda a derecha mirándola; la farmacia llega a
// s 57,3 con su cruz en 57,65); la vista de la calle pone La Dona justo a la derecha de la farmacia
const F = marco([-882.82, -597.05], [-829.77, -658.32]);
const Z = 0.12, ZF = Z + 0.3, S0 = 57.9, S1 = 67.5, BLANCO = 0xf2f1ec, GRANITO = 0x9a6a5a, GRIS = 0x8a8c8e;
// los edificios de verdad: el de La Dona (s 57,9–65,3, dos plantas, 7,3 m) y el de al lado (s 65,3–71,3, cuatro, 12,4 m)
const D1 = 65.3, V1 = 71.3, ALTO_D = 7.3, ALTO_V = 12.4, MARRON = 0x5a3a26;

/** antes de levantar la ciudad: la marca de que se monta (el mapa no tenía rótulo suyo) y los edificios a su altura */
export function tuneLaDona(map) {
  map.laDona = true;
  // los dos edificios a su altura de verdad (el bloque del mapa es de una planta)
  alzarEdificio(map, F, S0, D1, 11, ALTO_D, [242, 241, 236]);
  alzarEdificio(map, F, D1, V1, 11, ALTO_V, [240, 238, 232]);
}

// ——— lo que se pinta en lienzo ———

/** el letrero: la banda de cuadritos azules, «CAFETERÍA», «LA DONA» con el dónut y «PASTELERÍA» */
function letrero(g, w, h) {
  g.fillStyle = '#e8f0f8';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(70,120,200,.45)';
  const c = h / 8;
  for (let y = 0; y < h; y += c) for (let x = 0; x < w; x += c) if (((x + y) / c) % 2 < 1) g.fillRect(x, y, c, c);
  g.fillStyle = 'rgba(70,120,200,.2)';
  for (let y = 0; y < h; y += c * 2) g.fillRect(0, y, w, c);
  g.textBaseline = 'middle';
  g.textAlign = 'center';
  // «CAFETERÍA» y «PASTELERÍA», en letra de mano blanca con el borde azul
  g.font = `italic 600 ${Math.round(h * 0.3)}px "Segoe Script", "Brush Script MT", Georgia, serif`;
  g.lineWidth = 4;
  g.strokeStyle = '#2a5ab0';
  for (const [t, x] of [['CAFETERÍA', 0.12], ['PASTELERÍA', 0.88]]) { g.strokeText(t, w * x, h * 0.5, w * 0.2); g.fillStyle = '#f6f8fc'; g.fillText(t, w * x, h * 0.5, w * 0.2); }
  // «LA D NA» en letras gordas blancas con el borde azul oscuro
  g.font = `900 ${Math.round(h * 0.74)}px "Arial Black", Arial, sans-serif`;
  g.lineWidth = 8;
  g.strokeStyle = '#1e3a8a';
  for (const [t, x] of [['LA', 0.3], ['D', 0.47], ['NA', 0.67]]) { g.strokeText(t, w * x, h * 0.55); g.fillStyle = '#f6f8fc'; g.fillText(t, w * x, h * 0.55); }
  // el dónut de chocolate con las virutas
  const dx = w * 0.56, dy = h * 0.5, r = h * 0.4;
  g.fillStyle = '#c89060';
  g.beginPath(); g.arc(dx, dy, r, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#5a3020';
  g.beginPath(); g.arc(dx, dy - 2, r * 0.88, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#e8f0f8';
  g.beginPath(); g.arc(dx, dy, r * 0.3, 0, Math.PI * 2); g.fill();
  let s = 3;
  const rr = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 26; i++) {
    const a = rr() * Math.PI * 2, d = r * (0.4 + rr() * 0.42);
    g.fillStyle = ['#f6f6f2', '#e86a8a', '#f2c84a'][i % 3];
    g.fillRect(dx + Math.cos(a) * d, dy + Math.sin(a) * d, 4, 2);
  }
}

/** la lona del toldo, de rayas crema */
function rayas(g, w, h) {
  for (let x = 0; x < w; x += 16) { g.fillStyle = (x / 16) % 2 ? '#e8dcc0' : '#d4c4a0'; g.fillRect(x, 0, 16, h); }
  g.fillStyle = 'rgba(0,0,0,.08)';
  g.fillRect(0, h * 0.85, w, h * 0.15);
}

/** el bar por la entrada de cristal: las sillas de metal, el mostrador y las luces */
function bar(g, w, h) {
  g.fillStyle = '#3a3834';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#e8e2d4';
  g.fillRect(0, 0, w, h * 0.1);
  g.fillStyle = '#8a8a86';
  for (const x of [0.3, 0.55]) { g.fillRect(w * x, h * 0.45, 3, h * 0.4); g.fillRect(w * x - 8, h * 0.45, 20, 3); }
  g.fillStyle = '#c8c0b0';
  g.fillRect(w * 0.65, h * 0.5, w * 0.35, h * 0.35);
  g.fillStyle = 'rgba(255,255,255,.12)';
  g.fillRect(0, 0, w * 0.4, h);
  g.strokeStyle = '#d8d8d4';
  g.lineWidth = 4;
  g.strokeRect(2, 2, w - 4, h - 4);
  g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke();
}

/** la puerta de madera con las lamas */
function lamas(g, w, h) {
  g.fillStyle = '#5a3a2a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#7a5440';
  for (let y = h * 0.1; y < h * 0.55; y += 7) g.fillRect(w * 0.15, y, w * 0.7, 3);
  g.strokeStyle = 'rgba(0,0,0,.35)';
  g.lineWidth = 3;
  g.strokeRect(w * 0.12, h * 0.6, w * 0.76, h * 0.34);
}

/** la ventana con el marco de granito */
function ventana(g, w, h) {
  g.fillStyle = '#4a4e52';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(220,230,240,.25)';
  g.fillRect(0, 0, w * 0.5, h);
  g.strokeStyle = '#f2f2ee';
  g.lineWidth = 4;
  g.strokeRect(2, 2, w - 4, h - 4);
}

/** la piedra en lajas del zócalo de al lado */
function piedra(g, w, h) {
  g.fillStyle = '#c8b8a0';
  g.fillRect(0, 0, w, h);
  let s = 41;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let y = 0; y < h; y += 12) {
    let x = -r() * 20;
    while (x < w) { const l = 18 + r() * 26; g.fillStyle = ['#b8a890', '#d4c4ac', '#a89880', '#c0b098'][Math.floor(r() * 4)]; g.fillRect(x + 1, y + 1, l - 2, 10); x += l; }
  }
}

/** la puerta verde de cuarterones */
function verde(g, w, h) {
  g.fillStyle = '#2a5a3a';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(0,0,0,.35)';
  g.lineWidth = 2;
  for (const x of [0.1, 0.55]) for (let y = 0.05; y < 0.9; y += 0.15) g.strokeRect(w * x, h * y, w * 0.35, h * 0.12);
}

/** la celosía de cemento blanco de los balcones de al lado */
function celosia(g, w, h) {
  g.fillStyle = '#f2f0ea';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#6a6a66';
  const c = h / 3;
  for (let y = c * 0.15; y < h; y += c) for (let x = (Math.round(y / c) % 2) * c / 2; x < w; x += c) {
    g.beginPath(); g.ellipse(x + c / 2, y + c * 0.35, c * 0.28, c * 0.16, 0, 0, Math.PI * 2); g.fill();
  }
}

/** el peto de la terraza: las lamas blancas tumbadas en su marco marrón */
function lamasTerraza(g, w, h) {
  g.fillStyle = '#3a3634';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#f2f0ea';
  for (let y = h * 0.08; y < h * 0.95; y += h / 7) g.fillRect(0, y, w, h / 12);
  g.strokeStyle = '#5a3a26';
  g.lineWidth = 6;
  g.strokeRect(3, 3, w - 6, h - 6);
  for (let x = w / 5; x < w; x += w / 5) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
}

// ——— las piezas ———

/** la fachada: la pared, el granito, la ventana, la entrada, la puerta de lamas, el letrero, la ventana redonda y lo de al lado */
function fachada(k) {
  const c = (S0 + S1) / 2;
  k.box(c, 0, Z + 0.15, S1 - S0, 4.2, 0.3, BLANCO);
  k.block(c, Z + 0.15, S1 - S0, 0.3);
  // el granito rosado del bajo de La Dona y el gris de la pilastra del medio
  k.box(62.0, 0, ZF + 0.005, 8.2, 2.6, 0.02, GRANITO);
  k.box(64.2, 0.6, ZF + 0.03, 0.55, 0.5, 0.08, 0xf2f2ee);
  // la ventana, la entrada de cristal y la puerta de lamas
  k.pic(59.0, 1.6, ZF + 0.03, 1.3, 1.5, 0, 1, canvasTex(120, 140, ventana));
  k.pic(61.3, 1.2, ZF + 0.03, 2.2, 2.4, 0, 1, canvasTex(220, 240, bar), { glow: 0.2 });
  k.pic(63.25, 1.15, ZF + 0.03, 0.9, 2.3, 0, 1, canvasTex(90, 230, lamas));
  // el letrero largo encima del toldo
  k.box(61.6, 3.05, ZF + 0.04, 5.4, 0.85, 0.08, 0x2a5ab0);
  k.pic(61.6, 3.475, ZF + 0.085, 5.36, 0.81, 0, 1, canvasTex(640, 98, letrero));
  // la ventana redonda de arriba, a la izquierda
  k.cyl(58.6, 3.55, ZF + 0.0, 0.42, 0.42, 0.08, 0xf2f2ee, { seg: 20, rx: Math.PI / 2 });
  k.cyl(58.6, 3.55, ZF + 0.02, 0.34, 0.34, 0.08, 0x4a5a66, { seg: 20, rx: Math.PI / 2 });
  // al lado: el zócalo de piedra en lajas y la puerta verde de cuarterones
  k.pic(66.4, 1.3, ZF + 0.006, 2.2, 2.6, 0, 1, canvasTex(160, 190, piedra));
  k.pic(66.4, 1.1, ZF + 0.012, 0.95, 2.2, 0, 1, canvasTex(90, 210, verde));
}

/** el toldo de rayas crema y la terraza con su valla de barrotes */
function terraza(k) {
  const a = 57.8, b = 65.9, fuera = 3.2, c = (a + b) / 2, alto = 2.7, caida = 0.5;
  // la lona, inclinada desde la pared, y el faldón
  const lona = new THREE.PlaneGeometry(b - a, Math.hypot(fuera, caida));
  lona.rotateX(-Math.PI / 2 + Math.atan2(caida, fuera));
  lona.translate(c, alto - caida / 2, ZF + fuera / 2);
  k.pics.push({ geo: lona, tex: canvasTex(512, 128, rayas), glow: 0 });
  const bajo = new THREE.PlaneGeometry(b - a, Math.hypot(fuera, caida));
  bajo.rotateX(Math.PI / 2 + Math.atan2(caida, fuera));
  bajo.translate(c, alto - caida / 2 - 0.01, ZF + fuera / 2);
  k.pics.push({ geo: bajo, tex: canvasTex(512, 128, rayas), glow: 0 });
  k.pic(c, alto - caida - 0.12, ZF + fuera + 0.01, b - a, 0.25, 0, 1, canvasTex(512, 16, rayas));
  for (const s of [a + 0.1, b - 0.1]) k.box(s, alto - caida - 0.02, ZF + fuera / 2, 0.04, 0.04, fuera, 0x6a6a6a);
  for (const s of [a + 0.1, b - 0.1]) { k.box(s, 0, ZF + fuera, 0.05, alto - caida, 0.05, 0x8a8a8a); k.block(s, ZF + fuera, 0.08, 0.08); }
  // la valla de barrotes gris de la terraza, por delante y por los lados
  const zf = ZF + 3.0;
  const valla = (x0, z0, x1, z1) => {
    const xm = (x0 + x1) / 2, zm = (z0 + z1) / 2, w = Math.abs(x1 - x0) + 0.05, d = Math.abs(z1 - z0) + 0.05;
    k.box(xm, 0.95, zm, w, 0.05, d, GRIS);
    k.box(xm, 0.08, zm, w, 0.04, d, GRIS);
    const n = Math.round(Math.max(w, d) / 0.11);
    for (let i = 0; i <= n; i++) { const t = i / n; k.box(x0 + (x1 - x0) * t, 0.08, z0 + (z1 - z0) * t, 0.02, 0.87, 0.02, GRIS); }
    for (let t = 0; t <= 1.001; t += 0.25) k.box(x0 + (x1 - x0) * t, 0, z0 + (z1 - z0) * t, 0.07, 1.0, 0.07, 0x6a6c6e);
    k.block(xm, zm, w + 0.05, d + 0.05);
  };
  valla(a + 0.2, zf, b - 0.2, zf);
  valla(a + 0.2, ZF + 0.9, a + 0.2, zf);
  // las mesas con las sillas negras y la mesita redonda de madera
  for (const s of [59.2, 61.2, 63.2]) {
    k.table(s, ZF + 1.9, { w: 0.7, d: 0.7, h: 0.74, top: 0x3a3a3c, leg: 0x2a2a2c });
    k.chair(s, ZF + 1.35, 0, 0x2a2a2c, { legs: 0x2a2a2c });
    k.chair(s, ZF + 2.45, Math.PI, 0x2a2a2c, { legs: 0x2a2a2c });
  }
  k.table(65.0, ZF + 1.6, { w: 0.7, d: 0.7, h: 0.74, top: 0xb8885a, leg: 0x8a8a8a, round: true });
  k.chair(65.0, ZF + 2.1, Math.PI, 0xb8b8b4, { legs: 0x8a8a8a });
}

/** la planta de arriba de La Dona, la cornisa y el edificio de al lado con sus balcones de celosía */
function plantas(k) {
  // La Dona: la pared blanca, la ventana redonda de arriba, la ventana marrón con su barandilla y la terraza metida
  paredAlta(k, S0, D1, 4.2, ALTO_D, Z, BLANCO);
  k.cyl(58.6, 6.2, ZF + 0.0, 0.36, 0.36, 0.08, 0xf2f2ee, { seg: 20, rx: Math.PI / 2 });
  k.cyl(58.6, 6.2, ZF + 0.02, 0.29, 0.29, 0.08, 0x4a5a66, { seg: 20, rx: Math.PI / 2 });
  ventanaAlta(k, 60.7, 4.45, 1.2, 1.6, Z, { carpinteria: '#5a3a26' });
  k.box(60.7, 4.45, ZF + 0.12, 1.25, 0.05, 0.12, MARRON);
  k.box(60.7, 5.3, ZF + 0.12, 1.25, 0.05, 0.12, MARRON);
  for (let s = 60.12; s <= 61.3; s += 0.12) k.box(s, 4.45, ZF + 0.12, 0.025, 0.85, 0.025, MARRON);
  // el marco blanco de la ventana vieja, abierto hacia fuera
  k.box(59.55, 4.5, ZF + 0.3, 0.05, 1.0, 0.6, 0xf2f2ee);
  // la terraza metida: el fondo oscuro con la ventana, el aire y el peto de lamas
  k.box(63.3, 4.2, ZF + 0.01, 2.6, 2.6, 0.02, 0x5a5652);
  k.pic(63.6, 5.4, ZF + 0.03, 1.1, 1.0, 0, 1, canvasTex(66, 60, cristales('#5a3a26', 2)));
  aire(k, 62.6, 5.9, Z);
  k.pic(63.3, 4.75, ZF + 0.08, 2.6, 1.0, 0, 1, canvasTex(260, 100, lamasTerraza));
  // la cornisa con su moldura y el remate más alto de la izquierda
  k.box((S0 + D1) / 2, ALTO_D - 0.35, ZF + 0.08, D1 - S0, 0.12, 0.2, 0xe8e6e0);
  k.box((S0 + D1) / 2, ALTO_D - 0.15, ZF + 0.12, D1 - S0, 0.15, 0.28, 0xe8e6e0);
  k.box(58.9, ALTO_D, Z + 0.15, 2.0, 0.8, 0.3, BLANCO);
  k.box(58.9, ALTO_D + 0.75, ZF + 0.05, 2.1, 0.1, 0.18, 0xe8e6e0);
  // el de al lado: la planta baja (piedra y las dos puertas de marco rojo), la pared blanca y las tres plantas
  k.box((67.5 + V1) / 2, 0, Z + 0.15, V1 - 67.5, 4.2, 0.3, BLANCO);
  k.block((67.5 + V1) / 2, Z + 0.15, V1 - 67.5, 0.3);
  k.pic((67.5 + V1) / 2, 1.3, ZF + 0.006, V1 - 67.5, 2.6, 0, 1, canvasTex(260, 190, piedra));
  for (const s of [68.6, 70.2]) {
    k.box(s, 0, ZF + 0.02, 1.2, 2.5, 0.06, 0xa83a2a);
    k.pic(s, 1.25, ZF + 0.055, 1.0, 2.3, 0, 1, canvasTex(60, 140, cristales('#a83a2a', 1)));
  }
  paredAlta(k, D1, V1, 4.2, ALTO_V, Z, 0xf0eee8);
  k.box((D1 + V1) / 2, 3.9, ZF + 0.03, V1 - D1, 0.3, 0.12, 0xe8e6e0);
  for (const y of [4.3, 7.1, 9.9]) {
    ventanaAlta(k, 66.4, y + 0.6, 0.9, 1.4, Z, { carpinteria: '#2a6a5a' });
    ventanaAlta(k, 69.6, y + 0.6, 1.3, 1.5, Z, { carpinteria: '#2a6a5a' });
  }
  // los balcones de celosía de la segunda y la tercera planta (salen un poco)
  for (const y of [7.1, 9.9]) {
    k.box(69.6, y - 0.1, ZF + 0.45, 2.6, 0.15, 0.9, 0xe8e6e0);
    k.pic(69.6, y + 0.5, ZF + 0.91, 2.6, 0.9, 0, 1, canvasTex(260, 90, celosia));
    k.box(69.6, y + 0.95, ZF + 0.9, 2.65, 0.08, 0.12, 0xf2f0ea);
    for (const s of [68.3, 70.9]) { k.box(s, y + 0.05, ZF + 0.45, 0.05, 0.9, 0.9, 0xf2f0ea); }
  }
  k.box((D1 + V1) / 2, ALTO_V - 0.1, ZF + 0.08, V1 - D1, 0.18, 0.2, 0xe8e6e0);
  // las medianeras lisas de los costados que asoman por encima de las casas bajas
  medianera(k, S0 - 0.07, 4.0, ALTO_D + 0.6, 11, Z, 0xeceae4);
  medianera(k, V1 + 0.07, 4.0, ALTO_V + 0.6, 11, Z, 0xeceae4);
  medianera(k, D1, ALTO_D, ALTO_V + 0.6, 11, Z, 0xeceae4);
}

/** se monta con lo demás de Titerroy */
export function buildLaDona(scene, colliders, map) {
  if (!map?.laDona) return null;
  const k = new Kit();
  fachada(k);
  plantas(k);
  terraza(k);
  const group = enMarco(k, F, 'laDona', colliders);
  scene.add(group);
  return { group };
}
