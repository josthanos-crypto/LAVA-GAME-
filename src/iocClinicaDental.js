import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * IOC Clínica Dental, en la esquina de la calle Triana con Paraguay, con la foto de Google Maps (solo se
 * mira, no va dentro del juego): la planta baja chapada de piedra azul marino casi negra con sus juntas
 * blancas a lo largo, el ventanal grande rematado en arco con el cartel claro de «implantología,
 * ortodoncia y estética dental», la franja negra con «IOC clínica dental» encima del cristal de abajo
 * (con la sala y la mesa dentro), la puerta de cristal de la derecha con sus escalones y su franja negra
 * del IOC, la ventana de arriba con la rejilla negra y el farol negro de brazo de la esquina. El bloque
 * se queda como está.
 */

// la cara de la calle Paraguay (s desde el extremo del norte)
const C = marco([-420.2, 215.8], [-438.2, 177.6]);
const Z = 0.12, S0 = 31.5, S1 = 39.6, ALTO = 4.6, MARINO = 0x1e2230;

/** antes de levantar la ciudad: fuera el rótulo genérico */
export function tuneIocClinicaDental(map) {
  map.iocClinicaDentalSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'IOC Clinica Dental');
  if (i >= 0) map.iocClinicaDentalSign = map.signs.splice(i, 1)[0];
  map.iocClinicaDental = true;
}

// ——— lo que se pinta en lienzo ———

/** la piedra azul marino con las juntas blancas a lo largo */
function piedra(g, w, h) {
  g.fillStyle = '#1e2230';
  g.fillRect(0, 0, w, h);
  let s = 5;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 1500; i++) { g.fillStyle = `rgba(${60 + r() * 40},${66 + r() * 40},${90 + r() * 40},.4)`; g.fillRect(r() * w, r() * h, 2, 2); }
  g.fillStyle = '#e8e8e4';
  const paso = h / 12;
  for (let i = 1; i < 12; i++) g.fillRect(0, i * paso, w, 3);
}

/** el ventanal: el arco con el cartel claro arriba, la franja negra con el IOC y el cristal de abajo */
function ventanal(g, w, h) {
  piedra(g, w, h);
  const m = 6, r = w / 2 - m, top = r + m, yF = h * 0.48, yC = h * 0.6;
  // el cartel claro del arco, con su texto y los círculos de fotos
  g.save();
  g.beginPath(); g.moveTo(m, yF); g.lineTo(m, top); g.arc(w / 2, top, r, Math.PI, 0); g.lineTo(w - m, yF); g.closePath(); g.clip();
  g.fillStyle = '#c8e0e8';
  g.fillRect(0, 0, w, yF);
  g.fillStyle = '#2a3a5a';
  g.textAlign = 'left';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(w * 0.045)}px "Segoe UI", Arial, sans-serif`;
  g.fillText('implantología, ortodoncia', w * 0.16, h * 0.2);
  g.fillText('y estética dental', w * 0.16, h * 0.25);
  g.fillStyle = '#5a8ab0';
  for (const [x, y, rr] of [[0.72, 0.1, 0.035], [0.82, 0.18, 0.045], [0.5, 0.32, 0.04], [0.7, 0.34, 0.035], [0.32, 0.36, 0.03]]) { g.beginPath(); g.arc(w * x, h * y, w * rr, 0, Math.PI * 2); g.fill(); }
  g.restore();
  g.strokeStyle = '#e8e8e4';
  g.lineWidth = 6;
  g.beginPath(); g.moveTo(m, yF); g.lineTo(m, top); g.arc(w / 2, top, r, Math.PI, 0); g.lineTo(w - m, yF); g.stroke();
  // la franja negra con IOC clínica dental
  g.fillStyle = '#141416';
  g.fillRect(m, yF, w - 2 * m, yC - yF);
  g.fillStyle = '#f2f2ee';
  g.textBaseline = 'middle';
  g.font = `800 ${Math.round((yC - yF) * 0.5)}px "Arial Black", Arial, sans-serif`;
  g.fillText('IOC', w * 0.08, (yF + yC) / 2 - (yC - yF) * 0.08);
  g.fillStyle = '#e8c040';
  g.font = `600 ${Math.round((yC - yF) * 0.22)}px Arial, sans-serif`;
  g.fillText('clínica dental', w * 0.08, yF + (yC - yF) * 0.8);
  // el cristal de abajo: la sala con la mesa, la planta y el reflejo
  g.fillStyle = '#b8c8d0';
  g.fillRect(m, yC, w - 2 * m, h - yC - m);
  g.fillStyle = '#8a6a4a';
  g.fillRect(w * 0.55, h * 0.8, w * 0.3, h * 0.08);
  g.fillStyle = '#3a8a4a';
  g.beginPath(); g.arc(w * 0.85, h * 0.78, w * 0.05, 0, Math.PI * 2); g.fill();
  g.fillStyle = 'rgba(255,255,255,.3)';
  g.fillRect(m, yC, w * 0.35, h - yC - m);
  g.strokeStyle = '#e8e8e4';
  g.lineWidth = 5;
  g.strokeRect(m, yC, w - 2 * m, h - yC - m);
}

/** la parte de la puerta: la ventana con su rejilla negra, la franja del IOC y la puerta de cristal */
function puerta(g, w, h) {
  piedra(g, w, h);
  const m = w * 0.08;
  // la ventana de arriba con la rejilla negra delante
  g.fillStyle = '#a8c8c8';
  g.fillRect(m, h * 0.05, w - 2 * m, h * 0.28);
  g.fillStyle = '#1a1a1c';
  for (let y = h * 0.22; y < h * 0.33; y += h * 0.02) g.fillRect(m, y, w - 2 * m, h * 0.012);
  // la franja negra del IOC
  g.fillStyle = '#141416';
  g.fillRect(0, h * 0.36, w, h * 0.12);
  g.fillStyle = '#f2f2ee';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `800 ${Math.round(h * 0.06)}px "Arial Black", Arial, sans-serif`;
  g.fillText('IOC', w / 2, h * 0.41);
  g.fillStyle = '#e8c040';
  g.font = `600 ${Math.round(h * 0.025)}px Arial, sans-serif`;
  g.fillText('clínica dental', w / 2, h * 0.46);
  // la puerta de cristal con las baldas claras de dentro
  g.fillStyle = '#d8d4cc';
  g.fillRect(m, h * 0.5, w - 2 * m, h * 0.42);
  g.fillStyle = '#c8b498';
  for (let y = 0.56; y < 0.9; y += 0.08) g.fillRect(w * 0.45, h * y, w * 0.4, h * 0.012);
  g.strokeStyle = '#e8e8e4';
  g.lineWidth = 4;
  g.strokeRect(m, h * 0.5, w - 2 * m, h * 0.42);
  g.fillStyle = '#2a2a2c';
  g.fillRect(m, h * 0.92, w - 2 * m, h * 0.08);
}

// ——— las piezas ———

/** la planta baja de la clínica */
function fachada(k) {
  const sm = (S0 + S1) / 2, a1 = S0 + 5.0;
  k.box(sm, 0, Z - 0.05, S1 - S0, ALTO, 0.1, MARINO);
  // el ventanal grande y, a la derecha, la parte de la puerta
  k.pic((S0 + a1) / 2, ALTO / 2, Z + 0.004, a1 - S0, ALTO, 0, 1, canvasTex(320, 294, ventanal), { glow: 0.08 });
  k.pic((a1 + S1) / 2, ALTO / 2, Z + 0.004, S1 - a1, ALTO, 0, 1, canvasTex(192, 284, puerta), { glow: 0.06 });
  // los escalones de la puerta y el remate blanco de arriba
  k.box((a1 + S1) / 2, 0, Z + 0.25, S1 - a1 - 0.4, 0.14, 0.5, 0x2a2a2c);
  k.box(sm, ALTO, Z + 0.05, S1 - S0 + 0.2, 0.2, 0.25, 0xeeece6);
  // el farol negro de brazo de la esquina
  const s = S1 - 0.2;
  k.box(s, 3.6, Z + 0.2, 0.04, 0.04, 0.4, 0x1a1a1a);
  k.box(s, 3.2, Z + 0.42, 0.2, 0.3, 0.2, 0xffe2a8, { list: k.glow });
  k.box(s, 3.5, Z + 0.42, 0.26, 0.06, 0.26, 0x1a1a1a);
  k.box(s, 3.16, Z + 0.42, 0.22, 0.04, 0.22, 0x1a1a1a);
}

/** segunda fase, como los demás de este barrio */
export function buildIocClinicaDental(scene, colliders, map) {
  if (!map?.iocClinicaDental) return null;
  const k = new Kit();
  fachada(k);
  const group = enMarco(k, C, 'iocClinicaDental', colliders);
  scene.add(group);
  return { group };
}
