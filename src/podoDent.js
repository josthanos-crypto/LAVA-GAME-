import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * PodoDent, la clínica dental y de podología de la calle Cuba, en la esquina, con las fotos de Google Maps
 * de julio de 2025 (solo se miran, no van dentro del juego): la planta baja chapada de piedra gris clara,
 * la puerta de cristal de la esquina con el letrero blanco de «PODODENT · LANZAROTE» encima, y los
 * escaparates grandes con los vinilos morados: «Especialistas en IMPLANTOLOGÍA DENTAL» con los dientes y
 * los implantes, «¡Sonríe! · ORTODONCIA» y la lista de lo que hacen con el teléfono. Las caras de las
 * modelos de la foto no se ponen. En la acera, los bolardos negros. El bloque se queda como está.
 */

// la cara de la calle Cuba (s desde la esquina del oeste)
const P = marco([-115.8, -27.1], [-98.5, -47.1]);
const Z = 0.12, PIEDRA = 0xc8c4bc, MORADO = '#6a2a6a';

/** antes de levantar la ciudad: fuera el rótulo genérico */
export function tunePodoDent(map) {
  map.podoDentSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'Podo Dent');
  if (i >= 0) map.podoDentSign = map.signs.splice(i, 1)[0];
  map.podoDent = true;
}

// ——— lo que se pinta en lienzo ———

/** la piedra gris clara en placas */
function piedra(g, w, h) {
  g.fillStyle = '#c8c4bc';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(120,116,108,.5)';
  g.lineWidth = 2;
  for (let y = 0; y < h; y += h / 8) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  for (let j = 0; j < 8; j++) for (let x = (j % 2) * w / 12; x < w; x += w / 6) { g.beginPath(); g.moveTo(x, j * h / 8); g.lineTo(x, (j + 1) * h / 8); g.stroke(); }
}

/** el nombre: PODO en gris y DENT, con el monograma PD */
function nombre(g, x, y, s, claro) {
  g.textAlign = 'left';
  g.textBaseline = 'middle';
  g.font = `300 ${Math.round(s)}px "Segoe UI", Arial, sans-serif`;
  g.fillStyle = claro ? '#f2f2ee' : '#8a8a8e';
  g.fillText('PODO', x, y);
  const w = g.measureText('PODO').width;
  g.fillStyle = claro ? '#f2f2ee' : MORADO;
  g.fillText('DENT', x + w, y);
}

/** un diente blanco y, si toca, su implante gris debajo */
function diente(g, x, y, s, implante) {
  g.fillStyle = '#f8f8f6';
  g.beginPath(); g.ellipse(x, y, s * 0.5, s * 0.45, 0, 0, Math.PI * 2); g.fill();
  if (implante) {
    g.fillStyle = '#9a9ea4';
    g.beginPath(); g.moveTo(x - s * 0.22, y + s * 0.35); g.lineTo(x + s * 0.22, y + s * 0.35); g.lineTo(x + s * 0.08, y + s * 1.3); g.lineTo(x - s * 0.08, y + s * 1.3); g.closePath(); g.fill();
    g.strokeStyle = '#6a6e74';
    g.lineWidth = 2;
    for (let k = 0.5; k < 1.25; k += 0.15) { g.beginPath(); g.moveTo(x - s * 0.2, y + s * k); g.lineTo(x + s * 0.2, y + s * k); g.stroke(); }
  } else {
    g.beginPath(); g.ellipse(x - s * 0.2, y + s * 0.45, s * 0.15, s * 0.35, 0, 0, Math.PI * 2); g.ellipse(x + s * 0.2, y + s * 0.45, s * 0.15, s * 0.35, 0, 0, Math.PI * 2); g.fill();
  }
}

/** el vinilo grande: la franja morada con el nombre, el titular y los dientes con los implantes */
function viniloImplantes(g, w, h) {
  const gr = g.createLinearGradient(0, 0, w, 0);
  gr.addColorStop(0, '#8a6a9a');
  gr.addColorStop(1, '#d8c8e0');
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
  g.fillStyle = MORADO;
  g.fillRect(0, 0, w, h * 0.16);
  g.fillRect(0, h * 0.86, w, h * 0.14);
  nombre(g, w * 0.08, h * 0.08, h * 0.1, true);
  g.fillStyle = MORADO;
  g.textAlign = 'right';
  g.textBaseline = 'middle';
  g.font = `600 ${Math.round(h * 0.08)}px "Segoe UI", Arial, sans-serif`;
  g.fillText('Especialistas en', w * 0.95, h * 0.24);
  g.font = `800 ${Math.round(h * 0.11)}px "Segoe UI", Arial, sans-serif`;
  g.fillText('IMPLANTOLOGÍA', w * 0.95, h * 0.36);
  g.fillText('DENTAL', w * 0.95, h * 0.48);
  diente(g, w * 0.25, h * 0.38, h * 0.14, true);
  diente(g, w * 0.42, h * 0.46, h * 0.14, true);
  diente(g, w * 0.62, h * 0.68, h * 0.14, false);
  g.fillStyle = '#f2f2ee';
  g.textAlign = 'center';
  g.font = `500 ${Math.round(h * 0.035)}px "Segoe UI", Arial, sans-serif`;
  g.fillText('EXPERTOS EN TÉCNICAS AVANZADAS DE IMPLANTES DENTALES', w / 2, h * 0.92);
}

/** el vinilo de la ortodoncia: ¡Sonríe! y ORTODONCIA */
function viniloOrtodoncia(g, w, h) {
  g.fillStyle = '#c8b4d4';
  g.fillRect(0, 0, w, h);
  g.fillStyle = MORADO;
  g.fillRect(0, 0, w, h * 0.16);
  g.fillRect(0, h * 0.86, w, h * 0.14);
  nombre(g, w * 0.1, h * 0.08, h * 0.08, true);
  g.fillStyle = MORADO;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `italic 700 ${Math.round(h * 0.13)}px Georgia, serif`;
  g.fillText('¡Sonríe!', w / 2, h * 0.32);
  g.font = `800 ${Math.round(h * 0.09)}px "Segoe UI", Arial, sans-serif`;
  g.fillText('ORTODONCIA', w / 2, h * 0.52);
  for (let i = 0; i < 4; i++) diente(g, w * (0.25 + i * 0.17), h * 0.7, h * 0.08, false);
}

/** el vinilo de la lista de servicios con el teléfono */
function viniloLista(g, w, h) {
  g.fillStyle = '#dcd0e4';
  g.fillRect(0, 0, w, h);
  g.fillStyle = MORADO;
  g.fillRect(0, 0, w, h * 0.16);
  g.fillRect(0, h * 0.86, w, h * 0.14);
  g.fillStyle = '#f2f2ee';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(h * 0.1)}px "Segoe UI", Arial, sans-serif`;
  g.fillText('PD', w / 2, h * 0.08);
  g.fillStyle = MORADO;
  g.textAlign = 'left';
  g.font = `700 ${Math.round(h * 0.06)}px "Segoe UI", Arial, sans-serif`;
  ['Implantología', 'Ortodoncia', 'Endodoncia', 'Periodoncia', 'Cirugía del pie', 'Podología deportiva'].forEach((t, i) => g.fillText(t, w * 0.08, h * (0.25 + i * 0.1)));
  g.fillStyle = '#f2f2ee';
  g.textAlign = 'center';
  g.font = `700 ${Math.round(h * 0.07)}px "Segoe UI", Arial, sans-serif`;
  g.fillText('928 395 854', w / 2, h * 0.93);
}

/** el letrero blanco de encima de la puerta */
function letrero(g, w, h) {
  g.fillStyle = '#f4f4f2';
  g.fillRect(0, 0, w, h);
  g.fillStyle = MORADO;
  g.fillRect(w * 0.05, h * 0.2, h * 0.5, h * 0.55);
  g.fillStyle = '#f4f4f2';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(h * 0.32)}px "Segoe UI", Arial, sans-serif`;
  g.fillText('PD', w * 0.05 + h * 0.25, h * 0.48);
  nombre(g, w * 0.22, h * 0.42, h * 0.42, false);
  g.fillStyle = '#8a8a8e';
  g.textAlign = 'center';
  g.font = `500 ${Math.round(h * 0.14)}px "Segoe UI", Arial, sans-serif`;
  g.fillText('LANZAROTE', w * 0.6, h * 0.82);
}

/** la puerta de cristal: el pasillo blanco */
function puerta(g, w, h) {
  g.fillStyle = '#e8e6e2';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#c8c4be';
  g.fillRect(0, h * 0.8, w, h * 0.2);
  g.fillStyle = 'rgba(120,140,160,.3)';
  g.fillRect(0, 0, w * 0.45, h);
  g.strokeStyle = '#b8bcc0';
  g.lineWidth = 4;
  g.strokeRect(2, 2, w - 4, h - 4);
}

// ——— las piezas ———

/** la planta baja de la clínica */
function fachada(k) {
  const s1 = 15.0, H = 3.4;
  k.box(s1 / 2, 0, Z - 0.05, s1, H, 0.1, PIEDRA);
  k.pic(s1 / 2, H / 2, Z + 0.004, s1, H, 0, 1, canvasTex(640, 146, piedra));
  // la puerta de la esquina y su letrero
  k.pic(1.2, 1.2, Z + 0.01, 1.4, 2.4, 0, 1, canvasTex(96, 164, puerta), { glow: 0.08 });
  k.box(1.2, 2.45, Z + 0.03, 1.9, 0.6, 0.06, 0xf4f4f2);
  k.pic(1.2, 2.75, Z + 0.065, 1.84, 0.54, 0, 1, canvasTex(300, 88, letrero));
  // los escaparates con sus vinilos
  k.pic(4.0, 1.5, Z + 0.01, 2.6, 2.4, 0, 1, canvasTex(200, 184, viniloLista));
  k.pic(7.0, 1.5, Z + 0.01, 2.6, 2.4, 0, 1, canvasTex(200, 184, viniloOrtodoncia));
  k.pic(11.4, 1.5, Z + 0.01, 5.0, 2.4, 0, 1, canvasTex(420, 202, viniloImplantes));
  for (const [a, b] of [[2.7, 5.3], [5.7, 8.3], [8.9, 13.9]]) for (const y of [0.3, 2.7]) k.box((a + b) / 2, y - 0.04, Z + 0.03, b - a, 0.08, 0.06, 0x8a8c90);
}

/** los bolardos negros del borde de la acera */
function bolardos(k) {
  for (const s of [3.0, 6.0, 9.0, 12.0]) {
    k.cyl(s, 0, 2.9, 0.08, 0.08, 0.9, 0x1e1e20, { seg: 10 });
    k.block(s, 2.9, 0.18, 0.18);
  }
}

/** segunda fase, como los demás de este barrio */
export function buildPodoDent(scene, colliders, map) {
  if (!map?.podoDent) return null;
  const k = new Kit();
  fachada(k);
  bolardos(k);
  const group = enMarco(k, P, 'podoDent', colliders);
  scene.add(group);
  return { group };
}
