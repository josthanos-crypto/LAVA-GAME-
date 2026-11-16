import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * La Pizzería Venezia, en la avenida Fred Olsen 1 (centro), frente a la playa del Reducto, en la esquina del bloque,
 * con la vista de la calle de Google de octubre de 2022 y las fotos de Google Maps de 2021 a 2025 (solo se miran, no
 * van dentro del juego; la gente no se pone). A la avenida: el bajo forrado de granito rosado, la entrada con el
 * comedor dentro (el techo blanco y las lámparas colgadas), encima el cartel negro de 2025 con «PIZZERIA» en el
 * óvalo blanco, «Venezia» en letra roja y la góndola (los gondoleros dibujados no se ponen), el toldo gris pardo
 * con «PIZZERIA» en verde y «Venecia» en blanco en el faldón y su palo blanco, y la terraza: mesas negras, sillas
 * rojas y la barandilla negra de aspas. Al lado de la esquina: las ventanas del comedor detrás del seto del
 * jardincillo, en su jardinera blanca, y delante el pórtico negro con el cartel ovalado de «TRATORIA / PIZZERIA /
 * Venezia» (así lo pone el cartel) con la góndola. El Kebab Lanzarote de al lado se queda como está.
 */

// la cara de la avenida (s de oeste a este; la esquina cae en s 24,36) y la del jardincillo (s desde la esquina,
// hacia el norte); la vista de la calle pone la pizzería en s 21,4 hasta la esquina y el kebab antes
const AV = marco([-628.32, 448.43], [-605.05, 455.64]);
const JA = marco([-605.05, 455.64], [-600.39, 440.64]);
const Z = 0.12, ZF = Z + 0.3, S0 = 21.4, S1 = 24.36, YP = 3.6, GRANITO = 0xb89488, NEGRO = 0x1e1e20;

/** antes de levantar la ciudad: fuera el rótulo genérico (y su terraza genérica) */
export function tunePizzeriaVenezia(map) {
  map.pizzeriaVeneziaSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'Pizzeria Venecia' && Math.hypot(s.x + 608.9, s.z - 454.5) < 15);
  if (i >= 0) map.pizzeriaVeneziaSign = map.signs.splice(i, 1)[0];
  map.pizzeriaVenezia = true;
}

// ——— lo que se pinta en lienzo ———

/** la góndola negra con su proa alta, sin gente */
function gondola(g, x, y, w, h, color) {
  g.fillStyle = color;
  g.beginPath();
  g.moveTo(x, y + h * 0.2);
  g.quadraticCurveTo(x + w * 0.15, y + h, x + w * 0.5, y + h * 0.9);
  g.quadraticCurveTo(x + w * 0.85, y + h, x + w, y);
  g.lineTo(x + w * 0.97, y);
  g.quadraticCurveTo(x + w * 0.85, y + h * 0.7, x + w * 0.5, y + h * 0.65);
  g.quadraticCurveTo(x + w * 0.15, y + h * 0.7, x + w * 0.03, y + h * 0.15);
  g.closePath();
  g.fill();
  // la proa de peine
  g.fillRect(x + w * 0.955, y - h * 0.05, w * 0.03, h * 0.15);
}

/** el cartel negro de 2025: «PIZZERIA» en el óvalo blanco, «Venezia» en rojo y la góndola */
function cartel(g, w, h) {
  g.fillStyle = '#141416';
  g.fillRect(0, 0, w, h);
  gondola(g, w * 0.04, h * 0.45, w * 0.92, h * 0.5, '#d8d4cc');
  g.strokeStyle = '#f4f2ee';
  g.lineWidth = 3;
  g.beginPath(); g.ellipse(w * 0.5, h * 0.26, w * 0.16, h * 0.17, 0, 0, Math.PI * 2); g.stroke();
  g.fillStyle = '#f4f2ee';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(h * 0.17)}px Georgia, "Times New Roman", serif`;
  g.fillText('PIZZERIA', w * 0.5, h * 0.27);
  g.fillStyle = '#d82a3a';
  g.font = `italic 700 ${Math.round(h * 0.42)}px "Brush Script MT", "Segoe Script", cursive`;
  const t = 'Venezia', m = g.measureText(t).width, k = Math.min(1, (w * 0.62) / m);
  g.save(); g.translate(w * 0.56, h * 0.64); g.scale(k, 1); g.fillText(t, 0, 0); g.restore();
}

/** el faldón del toldo: «PIZZERIA» en verde y «Venecia» en blanco */
function faldon(g, w, h) {
  g.fillStyle = '#7a7466';
  g.fillRect(0, 0, w, h);
  g.textBaseline = 'middle';
  g.textAlign = 'left';
  g.fillStyle = '#6ac83a';
  g.font = `900 ${Math.round(h * 0.66)}px "Arial Black", Arial, sans-serif`;
  g.fillText('PIZZERIA', w * 0.03, h * 0.55);
  const a = g.measureText('PIZZERIA').width;
  g.fillStyle = '#f4f2ee';
  g.font = `400 ${Math.round(h * 0.7)}px "Lucida Calligraphy", "Monotype Corsiva", Georgia, serif`;
  g.fillText('Venecia', w * 0.06 + a, h * 0.55);
}

/** el comedor por la entrada: el techo blanco con las lámparas, la barra y la carta */
function comedor(g, w, h) {
  g.fillStyle = '#e8e4dc';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#f6f6f2';
  g.fillRect(0, 0, w, h * 0.25);
  g.strokeStyle = '#d0ccc4';
  g.lineWidth = 1;
  for (let x = 0; x < w; x += w / 6) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h * 0.25); g.stroke(); }
  for (const x of [0.3, 0.5, 0.7]) {
    g.strokeStyle = '#3a3a3a';
    g.beginPath(); g.moveTo(w * x, h * 0.25); g.lineTo(w * x, h * 0.38); g.stroke();
    g.fillStyle = '#c8a050';
    g.beginPath(); g.moveTo(w * (x - 0.05), h * 0.44); g.lineTo(w * x, h * 0.37); g.lineTo(w * (x + 0.05), h * 0.44); g.fill();
  }
  g.fillStyle = '#4a3a30';
  g.fillRect(0, h * 0.6, w * 0.6, h * 0.25);
  g.fillStyle = '#f2ece0';
  g.fillRect(w * 0.7, h * 0.4, w * 0.24, h * 0.4);
  g.fillStyle = '#8a7a6a';
  g.fillRect(0, h * 0.85, w, h * 0.15);
  g.fillStyle = 'rgba(0,0,0,.18)';
  g.fillRect(0, 0, w, h);
}

/** las ventanas del comedor, con las flores y las luces de colores detrás del cristal */
function ventanas(g, w, h) {
  g.fillStyle = '#3a2a24';
  g.fillRect(0, 0, w, h);
  let s = 4;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 40; i++) {
    g.fillStyle = ['#d84a6a', '#e8c84a', '#6ab04a', '#f2f2ee', '#d8402a'][Math.floor(r() * 5)];
    g.beginPath(); g.arc(r() * w, h * (0.25 + r() * 0.7), 2 + r() * 4, 0, Math.PI * 2); g.fill();
  }
  g.fillStyle = 'rgba(255,255,255,.12)';
  g.fillRect(0, 0, w * 0.3, h);
  g.strokeStyle = '#8a5a3a';
  g.lineWidth = 5;
  g.strokeRect(2, 2, w - 4, h - 4);
  for (const x of [1 / 3, 2 / 3]) { g.beginPath(); g.moveTo(w * x, 0); g.lineTo(w * x, h); g.stroke(); }
}

/** el cartel ovalado del pórtico: «TRATORIA», «PIZZERIA», «Venezia» y la góndola */
function ovalo(g, w, h) {
  g.fillStyle = '#1a1e1a';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#5a5e5a';
  g.lineWidth = 3;
  g.beginPath(); g.ellipse(w / 2, h / 2, w * 0.48, h * 0.45, 0, 0, Math.PI * 2); g.stroke();
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = '#6ac83a';
  g.font = `700 ${Math.round(h * 0.17)}px Georgia, "Times New Roman", serif`;
  g.fillText('TRATORIA', w / 2, h * 0.2);
  g.fillStyle = '#f4f2ee';
  g.font = `700 ${Math.round(h * 0.13)}px Georgia, "Times New Roman", serif`;
  g.fillText('PIZZERIA', w / 2, h * 0.36);
  gondola(g, w * 0.22, h * 0.56, w * 0.56, h * 0.26, '#3a6ab8');
  g.fillStyle = '#d82a3a';
  g.font = `italic 700 ${Math.round(h * 0.24)}px "Brush Script MT", "Segoe Script", cursive`;
  g.fillText('Venezia', w / 2, h * 0.6);
}

/** el granito rosado en placas */
function granito(g, w, h) {
  g.fillStyle = '#b89488';
  g.fillRect(0, 0, w, h);
  let s = 9;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 700; i++) {
    g.fillStyle = r() < 0.5 ? 'rgba(90,60,55,.35)' : 'rgba(230,210,200,.35)';
    g.fillRect(r() * w, r() * h, 2, 2);
  }
  g.strokeStyle = 'rgba(80,60,55,.4)';
  g.lineWidth = 1;
  for (let y = 0; y <= h; y += h / 6) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
}

// ——— las piezas ———

/** la barandilla negra de aspas, de s0 a s1, a una distancia z de la fachada */
function barandilla(k, s0, s1, z) {
  const n = Math.max(1, Math.round((s1 - s0) / 1.3)), paso = (s1 - s0) / n, alto = 0.95;
  for (let i = 0; i <= n; i++) k.box(s0 + i * paso, 0, z, 0.06, alto, 0.06, NEGRO);
  for (const y of [0.08, alto - 0.05]) k.box((s0 + s1) / 2, y, z, s1 - s0, 0.05, 0.05, NEGRO);
  const largo = Math.hypot(paso, alto - 0.13), ang = Math.atan2(alto - 0.13, paso);
  for (let i = 0; i < n; i++) {
    for (const sg of [1, -1]) {
      const d = new THREE.BoxGeometry(largo, 0.035, 0.035);
      d.rotateZ(sg * ang);
      d.translate(s0 + (i + 0.5) * paso, 0.1 + (alto - 0.13) / 2, z);
      k.add(d, NEGRO);
    }
  }
  k.block((s0 + s1) / 2, z, s1 - s0, 0.12);
}

/** la cara de la avenida: el granito, la entrada, el cartel, el toldo y la terraza */
function caraAvenida(k) {
  const gt = canvasTex(64, 192, granito);
  for (const [a, b, y0, y1] of [[S0, 21.6, 0, YP], [23.3, S1, 0, YP], [21.6, 23.3, 2.4, YP]]) {
    k.box((a + b) / 2, y0, Z + 0.15, b - a, y1 - y0, 0.3, GRANITO);
    k.pic((a + b) / 2, (y0 + y1) / 2, ZF + 0.005, b - a, y1 - y0, 0, 1, gt);
  }
  k.block((S0 + S1) / 2, Z + 0.15, S1 - S0, 0.3);
  // la entrada abierta con el comedor dentro y el umbral
  k.pic(22.45, 1.2, Z + 0.04, 1.7, 2.4, 0, 1, canvasTex(170, 240, comedor), { glow: 0.25 });
  k.box(22.45, 2.32, ZF - 0.1, 1.7, 0.08, 0.2, 0x6a5a48);
  // el cartel negro de encima de la entrada
  k.box(22.85, 2.42, ZF + 0.03, 2.8, 0.6, 0.06, 0x141416);
  k.pic(22.85, 2.72, ZF + 0.065, 2.78, 0.58, 0, 1, canvasTex(420, 88, cartel));
  // el toldo gris pardo con su faldón y el palo blanco
  const fuera = 2.6, yP = 3.45, yF = 2.75;
  const tela = new THREE.BoxGeometry(S1 - S0, 0.03, Math.hypot(fuera, yP - yF));
  tela.rotateX(Math.atan2(yP - yF, fuera));
  tela.translate((S0 + S1) / 2, (yP + yF) / 2, ZF + fuera / 2);
  k.add(tela, 0x8a8476);
  k.box((S0 + S1) / 2, yF - 0.32, ZF + fuera, S1 - S0, 0.32, 0.03, 0x7a7466);
  k.pic((S0 + S1) / 2, yF - 0.16, ZF + fuera + 0.02, S1 - S0 - 0.02, 0.3, 0, 1, canvasTex(400, 40, faldon));
  k.box((S0 + S1) / 2, yF - 0.04, ZF + fuera - 0.05, S1 - S0, 0.06, 0.08, 0xe8e6e0);
  k.cyl(S0 + 0.25, 0, ZF + fuera - 0.1, 0.03, 0.03, yF - 0.3, 0xe8e6e0, { seg: 8 });
  k.block(S0 + 0.25, ZF + fuera - 0.1, 0.1, 0.1);
  // la terraza: mesas negras y sillas rojas debajo del toldo
  for (const [s, z] of [[22.1, 1.2], [23.6, 1.2], [22.1, 2.3], [23.6, 2.3]]) {
    k.table(s, ZF + z, { w: 0.65, d: 0.65, h: 0.75, top: NEGRO, leg: NEGRO });
    k.chair(s - 0.5, ZF + z, Math.PI / 2, 0xc82a2a, { legs: 0x8a1a1a });
    k.chair(s + 0.5, ZF + z, -Math.PI / 2, 0xc82a2a, { legs: 0x8a1a1a });
    k.block(s, ZF + z, 0.65, 0.65);
  }
  // la barandilla de aspas por delante de la terraza
  barandilla(k, 20.8, S1 + 0.2, ZF + 3.3);
}

/** la cara del jardincillo: las ventanas del comedor, la jardinera con el seto y el pórtico con el cartel */
function caraJardin(k) {
  const gt = canvasTex(64, 192, granito);
  k.box(1.9, 0, Z + 0.15, 3.6, YP, 0.3, 0xc8a090);
  k.box(0.15, 0, Z + 0.15, 0.3, YP, 0.3, GRANITO);
  k.pic(0.15, YP / 2, ZF + 0.005, 0.3, YP, 0, 1, gt);
  k.block(1.9, Z + 0.15, 3.6, 0.3);
  k.pic(2.0, 1.75, ZF + 0.01, 3.0, 1.6, 0, 1, canvasTex(300, 160, ventanas), { glow: 0.2 });
  k.box(2.0, 2.55, ZF + 0.04, 3.1, 0.08, 0.08, 0x8a5a3a);
  // la jardinera blanca con el seto
  k.box(3.2, 0, ZF + 0.95, 5.6, 0.45, 1.1, 0xf2f2ee);
  for (let i = 0; i < 7; i++) k.ball(0.8 + i * 0.75, 0.75, ZF + 0.95 + (i % 2 ? 0.12 : -0.1), 0.48 + (i % 3) * 0.05, 0x3a6a2a);
  k.block(3.2, ZF + 0.95, 5.6, 1.1);
  // el pórtico negro con el cartel ovalado
  const zp = ZF + 2.0;
  for (const s of [0.4, 2.9]) { k.box(s, 0, zp, 0.12, 3.1, 0.12, NEGRO); k.block(s, zp, 0.14, 0.14); }
  k.box(1.65, 2.98, zp, 2.62, 0.12, 0.12, NEGRO);
  k.box(1.65, 2.25, zp + 0.07, 1.7, 0.75, 0.03, 0x1a1e1a);
  k.pic(1.65, 2.62, zp + 0.09, 1.7, 0.75, 0, 1, canvasTex(300, 132, ovalo));
}

/** se monta con lo demás de Arrecife Centro: las dos caras de la esquina */
export function buildPizzeriaVenezia(scene, colliders, map) {
  if (!map?.pizzeriaVenezia) return null;
  const partes = [];
  for (const [M, nom, hacer] of [[AV, 'pizzeriaVeneziaAv', caraAvenida], [JA, 'pizzeriaVeneziaJardin', caraJardin]]) {
    const k = new Kit();
    hacer(k);
    const group = enMarco(k, M, nom, colliders);
    scene.add(group);
    partes.push(group);
  }
  return { partes };
}
