import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * La Joyería Isorlan (Compro Oro), en la calle Hermanos Zerolo 2 (centro), en la esquina con León y Castillo, con
 * la foto de Google Maps de octubre de 2026 y la vista de la calle de junio de 2014, cuando en el mismo hueco había
 * otra joyería (solo se miran, no van dentro del juego): el bajo forrado de granito marrón rojizo; el escaparate
 * grande con los bustos blancos de las joyas en sus baldas; encima, el toldo negro con «ISORLAN JOYERÍA» en dorado
 * en el faldón; a su lado, la placa negra de «ISORLAN GEMS», la puerta de cristal con marco negro y, encima, el
 * cartel negro de «COMPRA VENTA DE ORO Y PLATA»; el banderín negro de «COMPRO ORO», la alarma roja, el aparato
 * del aire acondicionado de arriba y el cartel de pie de la acera. Los diamantes del logotipo no se ponen. Al
 * lado, la puerta blanca del garaje del vecino. El bloque se queda como está; lo de abajo tapa su trozo.
 */

// la cara de Hermanos Zerolo del bloque de la esquina (s desde la esquina con León y Castillo, hacia el oeste);
// el rótulo del mapa estaba en la acera de enfrente
const M = marco([59.91, 156.76], [42.44, 150.94]);
const Z = 0.12, ZF = Z + 0.3, S0 = 0, S1 = 11.3, YB = 3.45;
const NEGRO = 0x1c1c1e, BLANCO = 0xf2f2ee;

/** antes de levantar la ciudad: fuera el rótulo genérico */
export function tuneIsorlan(map) {
  map.isorlanSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'Compro Oro' && Math.hypot(s.x - 20.7, s.z - 135) < 15);
  if (i >= 0) map.isorlanSign = map.signs.splice(i, 1)[0];
  map.isorlan = true;
}

// ——— lo que se pinta en lienzo ———

/** el granito marrón rojizo en placas */
function granito(g, w, h) {
  g.fillStyle = '#6e5048';
  g.fillRect(0, 0, w, h);
  let s = 11;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 900; i++) {
    const v = r();
    g.fillStyle = v < 0.4 ? 'rgba(40,26,22,.5)' : v < 0.75 ? 'rgba(150,118,104,.45)' : 'rgba(200,180,170,.35)';
    g.fillRect(r() * w, r() * h, 2, 2);
  }
  g.strokeStyle = 'rgba(30,20,18,.55)';
  g.lineWidth = 1;
  for (let y = 0; y <= h; y += h / 4) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  for (let x = 0; x <= w; x += w / 2) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
}

/** el escaparate: las baldas de cristal con los bustos blancos de las joyas */
function escaparate(g, w, h) {
  g.fillStyle = '#3a3c40';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#e8eaec';
  for (const y of [0.42, 0.78]) {
    g.fillRect(0, h * y, w, h * 0.03);
    for (let x = 0.05; x < 0.97; x += 0.065) {
      g.beginPath();
      g.moveTo(w * x, h * y);
      g.lineTo(w * (x + 0.012), h * (y - 0.2));
      g.quadraticCurveTo(w * (x + 0.025), h * (y - 0.26), w * (x + 0.038), h * (y - 0.2));
      g.lineTo(w * (x + 0.05), h * y);
      g.fill();
      g.fillStyle = '#d8b25a';
      g.fillRect(w * (x + 0.018), h * (y - 0.14), w * 0.014, h * 0.03);
      g.fillStyle = '#e8eaec';
    }
  }
  g.fillStyle = 'rgba(255,255,255,.12)';
  g.fillRect(0, 0, w * 0.35, h);
}

/** el faldón del toldo negro con «ISORLAN JOYERÍA» en dorado */
function faldon(g, w, h) {
  g.fillStyle = '#1c1c1e';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#d8bc7a';
  g.textBaseline = 'middle';
  g.textAlign = 'right';
  g.font = `400 ${Math.round(h * 0.62)}px "Trajan Pro", "Times New Roman", Georgia, serif`;
  g.fillText('ISORLAN', w * 0.6, h * 0.52);
  g.textAlign = 'left';
  g.font = `400 ${Math.round(h * 0.3)}px "Times New Roman", Georgia, serif`;
  g.fillText('J O Y E R Í A', w * 0.62, h * 0.66);
}

/** el cartel negro de encima de la puerta */
function cartel(g, w, h) {
  g.fillStyle = '#26262a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#e8e6e0';
  g.textBaseline = 'middle';
  g.textAlign = 'center';
  g.font = `400 ${Math.round(h * 0.13)}px "Segoe UI", Arial, sans-serif`;
  g.fillText('COMPRA VENTA DE ORO Y PLATA', w / 2, h * 0.3);
  g.fillStyle = '#d8bc7a';
  g.font = `400 ${Math.round(h * 0.3)}px "Times New Roman", Georgia, serif`;
  g.fillText('ISORLAN', w / 2, h * 0.64);
  g.font = `400 ${Math.round(h * 0.11)}px "Times New Roman", Georgia, serif`;
  g.fillText('J O Y E R Í A', w / 2, h * 0.86);
}

/** la placa negra de «ISORLAN GEMS» */
function placa(g, w, h) {
  g.fillStyle = '#1c1c1e';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#8a8a8a';
  g.lineWidth = 2;
  g.strokeRect(4, 4, w - 8, h - 8);
  g.fillStyle = '#e8e6e0';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `400 ${Math.round(w * 0.16)}px "Times New Roman", Georgia, serif`;
  g.fillText('ISORLAN', w / 2, h * 0.16);
  g.font = `400 ${Math.round(w * 0.09)}px "Times New Roman", Georgia, serif`;
  g.fillText('GEMS', w / 2, h * 0.26);
  g.font = `400 ${Math.round(w * 0.065)}px "Times New Roman", Georgia, serif`;
  const lineas = ['GEMÓLOGO', 'CERTIFICADO', '', 'PERITO TASADOR', 'PROFESIONAL', '', 'COMPRAMOS', 'DIAMANTES Y', 'PIEDRAS PRECIOSAS'];
  lineas.forEach((t, i) => g.fillText(t, w / 2, h * (0.4 + i * 0.065)));
}

/** el banderín de «COMPRO ORO» */
function banderin(g, w, h) {
  g.fillStyle = '#1c1c1e';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#d8bc7a';
  g.lineWidth = 3;
  g.strokeRect(5, 5, w - 10, h - 10);
  g.fillStyle = '#d8bc7a';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `400 ${Math.round(h * 0.22)}px "Times New Roman", Georgia, serif`;
  g.fillText('COMPRO', w / 2, h * 0.34);
  g.font = `400 ${Math.round(h * 0.34)}px "Times New Roman", Georgia, serif`;
  g.fillText('ORO', w / 2, h * 0.68);
}

/** la puerta de cristal: dentro, la tienda clara */
function puerta(g, w, h) {
  g.fillStyle = '#8a7a64';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#c8b494';
  g.fillRect(w * 0.15, h * 0.1, w * 0.7, h * 0.8);
  g.fillStyle = 'rgba(255,255,255,.18)';
  g.fillRect(0, 0, w * 0.4, h);
  g.fillStyle = '#f2f2ee';
  g.fillRect(w * 0.1, h * 0.3, w * 0.35, h * 0.12);
}

/** la puerta blanca del garaje del vecino, de lamas */
function garaje(g, w, h) {
  g.fillStyle = '#ecece8';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(0,0,0,.14)';
  g.lineWidth = 2;
  for (let y = h / 10; y < h; y += h / 10) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  g.fillStyle = '#e8c82a';
  for (const x of [0.25, 0.75]) g.fillRect(w * x - 5, h * 0.4, 10, 9);
}

/** el cartel de pie de la acera */
function cartelPie(g, w, h) {
  g.fillStyle = '#1c1c1e';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#d8bc7a';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `400 ${Math.round(w * 0.13)}px "Times New Roman", Georgia, serif`;
  g.fillText('ISORLAN', w / 2, h * 0.12);
  g.fillStyle = '#e8e6e0';
  g.font = `700 ${Math.round(w * 0.1)}px "Segoe UI", Arial, sans-serif`;
  g.fillText('COMPRO', w / 2, h * 0.28);
  g.fillText('ORO Y PLATA', w / 2, h * 0.38);
  g.fillStyle = '#5a5a5e';
  for (let y = 0.5; y < 0.9; y += 0.06) g.fillRect(w * 0.15, h * y, w * 0.7, h * 0.02);
}

// ——— las piezas ———

/** la joyería y el garaje de al lado */
function fachada(k) {
  const gt = canvasTex(128, 256, granito);
  // el granito: los machones y el bajo del escaparate, y el trozo de arriba hasta la planta primera
  const placas = [[0, 0.5, 0, YB], [4.3, 4.65, 0, YB], [4.65, 5.55, 0, 0.9], [4.65, 5.55, 2.25, 2.55], [6.55, 8.2, 0, YB], [0.5, 4.3, 0, 0.55], [5.55, 6.55, 2.35, 2.55]];
  for (const [a, b, y0, y1] of placas) {
    k.box((a + b) / 2, y0, Z + 0.15, b - a, y1 - y0, 0.3, 0x6e5048);
    k.pic((a + b) / 2, (y0 + y1) / 2, ZF + 0.005, b - a, y1 - y0, 0, 1, gt);
  }
  // la parte de arriba del bajo, por detrás del toldo y del cartel
  k.box(2.4, 2.45, Z + 0.15, 3.9, YB - 2.45, 0.3, NEGRO);
  k.box(6.05, 2.55, Z + 0.15, 1.9, YB - 2.55, 0.3, 0x6e5048);
  k.block((S0 + 8.2) / 2, Z + 0.15, 8.2, 0.3);
  // el escaparate con su marco negro
  k.pic(2.4, 1.5, Z + 0.08, 3.8, 1.9, 0, 1, canvasTex(380, 190, escaparate), { glow: 0.25 });
  for (const t of [0.5, 4.3]) k.box(t, 0.55, Z + 0.14, 0.08, 1.9, 0.08, NEGRO);
  for (const y of [0.55, 2.4]) k.box(2.4, y, Z + 0.14, 3.8, 0.06, 0.08, NEGRO);
  // el toldo negro: la tela inclinada y el faldón con el nombre
  const fuera = 0.95, yP = 3.3, yF = 2.95;
  const tela = new THREE.BoxGeometry(4.3, 0.03, Math.hypot(fuera, yP - yF));
  tela.rotateX(Math.atan2(yP - yF, fuera));
  tela.translate(2.4, (yP + yF) / 2, ZF + fuera / 2);
  k.add(tela, NEGRO);
  k.box(2.4, yF - 0.42, ZF + fuera, 4.3, 0.42, 0.03, NEGRO);
  k.pic(2.4, yF - 0.21, ZF + fuera + 0.02, 4.28, 0.4, 0, 1, canvasTex(640, 60, faldon));
  for (const s of [0.3, 4.5]) {
    const brazo = new THREE.BoxGeometry(0.03, 0.03, fuera);
    brazo.translate(s, yF - 0.05, ZF + fuera / 2);
    k.add(brazo, 0x2a2a2c);
  }
  k.box(2.4, yP - 0.05, ZF + 0.1, 4.4, 0.25, 0.2, NEGRO);
  // la placa de «ISORLAN GEMS», la puerta de cristal y el cartel de encima
  k.pic(5.1, 1.6, ZF + 0.02, 0.85, 1.3, 0, 1, canvasTex(130, 200, placa));
  k.pic(6.05, 1.175, Z + 0.02, 1.0, 2.35, 0, 1, canvasTex(100, 220, puerta), { glow: 0.15 });
  for (const t of [5.55, 6.55]) k.box(t, 0, Z + 0.14, 0.1, 2.35, 0.1, NEGRO);
  k.box(6.05, 2.25, Z + 0.14, 1.0, 0.1, 0.1, NEGRO);
  k.box(6.0, 2.6, ZF + 0.06, 2.6, 0.8, 0.12, NEGRO);
  k.pic(6.0, 3.0, ZF + 0.125, 2.56, 0.76, 0, 1, canvasTex(400, 120, cartel));
  // el banderín de «COMPRO ORO» y la alarma roja
  k.box(7.55, 2.7, ZF + 0.4, 0.08, 0.75, 0.75, NEGRO);
  const bt = canvasTex(150, 150, banderin);
  k.pic(7.6, 3.075, ZF + 0.4, 0.74, 0.74, 1, 0, bt);
  k.pic(7.5, 3.075, ZF + 0.4, 0.74, 0.74, -1, 0, bt);
  k.cyl(7.9, 2.35, ZF + 0.04, 0.13, 0.13, 0.06, 0xc82a2a, { seg: 14, rx: Math.PI / 2 });
  // el aire acondicionado de arriba
  k.box(4.6, 3.7, ZF + 0.15, 0.8, 0.55, 0.3, 0xe8e8e4);
  k.pic(4.6, 3.975, ZF + 0.305, 0.76, 0.5, 0, 1, canvasTex(80, 52, (g, w, h) => {
    g.fillStyle = '#e8e8e4'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#9a9a9a'; g.lineWidth = 1;
    for (let y = 4; y < h - 4; y += 4) { g.beginPath(); g.moveTo(4, y); g.lineTo(w * 0.6, y); g.stroke(); }
    g.fillStyle = '#2a9a5a'; g.fillRect(w * 0.7, h * 0.15, w * 0.2, h * 0.12);
  }));
  // el cartel de pie de la acera
  const pie = new THREE.BoxGeometry(0.6, 1.0, 0.04);
  pie.rotateX(-0.18);
  pie.translate(8.0, 0.5, ZF + 0.9);
  k.add(pie, NEGRO);
  k.pic(8.0, 0.52, ZF + 0.99, 0.56, 0.92, 0, 1, canvasTex(90, 150, cartelPie));
  k.box(8.0, 0, ZF + 0.85, 0.7, 0.03, 0.5, 0x4a4a4e);
  k.block(8.0, ZF + 0.85, 0.7, 0.4);
  // al lado, el garaje blanco del vecino
  for (const [a, b] of [[8.2, 8.6], [10.9, S1]]) k.box((a + b) / 2, 0, Z + 0.15, b - a, YB, 0.3, BLANCO);
  k.box(9.75, 2.4, Z + 0.15, 2.3, YB - 2.4, 0.3, BLANCO);
  k.block(9.75, Z + 0.15, S1 - 8.2, 0.3);
  k.pic(9.75, 1.2, Z + 0.02, 2.3, 2.4, 0, 1, canvasTex(220, 230, garaje));
}

/** se monta con lo demás de Arrecife Centro */
export function buildIsorlan(scene, colliders, map) {
  if (!map?.isorlan) return null;
  const k = new Kit();
  fachada(k);
  const group = enMarco(k, M, 'isorlan', colliders);
  scene.add(group);
  return { group };
}
