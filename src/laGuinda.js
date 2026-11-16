import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * La Panadería y Dulcería La Guinda, en la calle José Pereyra Galviaty 12 (Titerroy), con la foto de Google
 * Maps de agosto de 2022 (solo se mira, no va dentro del juego): la casa blanca con el zócalo color melocotón
 * y su raya naranja; la puerta oscura del portal con el número 12 y el buzón; la entrada de la panadería,
 * abierta, con las mesitas y las sillas dentro, bajo el toldo naranja con «PANADERIA LA GUINDA» en el
 * faldón y, encima, el letrero de colores de «Panadería y Pastelería La Guinda»; a la derecha, la caja
 * blanca de lamas del contador y el cubo de basura. El bloque se queda como está.
 */

// la fachada de la calle José Pereyra Galviaty (s de izquierda a derecha mirándola); el rótulo cae en s 8,85
const G = marco([-292.25, -596.59], [-274.91, -572.63]);
const Z = 0.12, S0 = 5.2, S1 = 12.2, NARANJA = 0xd8742a, MELOCOTON = 0xf2c8a0;

/** antes de levantar la ciudad: fuera el rótulo genérico */
export function tuneLaGuinda(map) {
  map.laGuindaSign = null;
  const i = (map.signs || []).findIndex(s => /Guinda/.test(s.name));
  if (i >= 0) map.laGuindaSign = map.signs.splice(i, 1)[0];
  map.laGuinda = true;
}

// ——— lo que se pinta en lienzo ———

/** el letrero de colores: «Panadería y Pastelería» arriba y «LA GUINDA» en grande, con dos pasteles */
function letrero(g, w, h) {
  const gr = g.createLinearGradient(0, 0, w, 0);
  gr.addColorStop(0, '#c81e6a');
  gr.addColorStop(0.5, '#e0307a');
  gr.addColorStop(1, '#8a2ab0');
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#f2e04a';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `italic 700 ${Math.round(h * 0.24)}px Georgia, serif`;
  g.fillText('Panadería y Pastelería', w * 0.55, h * 0.24);
  g.fillStyle = '#2a5ad8';
  g.fillRect(w * 0.26, h * 0.46, w * 0.58, h * 0.44);
  g.fillStyle = '#ffffff';
  g.font = `900 ${Math.round(h * 0.36)}px "Arial Black", Arial, sans-serif`;
  g.fillText('LA GUINDA', w * 0.55, h * 0.69);
  // los dos pasteles de los lados, con su guinda
  for (const x of [0.11, 0.93]) {
    g.fillStyle = '#f8f0e0';
    g.fillRect(w * x - w * 0.05, h * 0.5, w * 0.1, h * 0.32);
    g.fillStyle = '#7a4a2a';
    g.fillRect(w * x - w * 0.05, h * 0.62, w * 0.1, h * 0.06);
    g.fillStyle = '#e02020';
    g.beginPath(); g.arc(w * x, h * 0.45, h * 0.07, 0, Math.PI * 2); g.fill();
  }
}

/** el faldón del toldo con el nombre */
function faldon(g, w, h) {
  g.fillStyle = '#d8742a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#5a2a10';
  g.font = `700 ${Math.round(h * 0.6)}px Georgia, serif`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText('PANADERIA LA GUINDA', w / 2, h * 0.55);
}

/** la panadería por la puerta abierta: el mostrador, las vitrinas y las sillas */
function dentro(g, w, h) {
  g.fillStyle = '#3a2a22';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#e8d8b8';
  g.fillRect(0, 0, w, h * 0.12);
  g.fillStyle = '#8a6a4a';
  g.fillRect(w * 0.55, h * 0.45, w * 0.45, h * 0.3);
  g.fillStyle = 'rgba(230,240,250,.5)';
  g.fillRect(w * 0.55, h * 0.3, w * 0.45, h * 0.15);
  g.fillStyle = '#d8a860';
  for (let x = 0.58; x < 0.98; x += 0.07) g.fillRect(w * x, h * 0.36, w * 0.04, h * 0.05);
  // las mesitas y las sillas
  g.fillStyle = '#5a3a26';
  for (const x of [0.12, 0.35]) { g.fillRect(w * x, h * 0.6, w * 0.16, h * 0.03); g.fillRect(w * (x + 0.07), h * 0.63, w * 0.02, h * 0.25); g.fillRect(w * (x - 0.04), h * 0.5, w * 0.03, h * 0.38); }
  g.fillStyle = '#c8c0b0';
  g.fillRect(0, h * 0.88, w, h * 0.12);
}

/** la caja blanca de lamas del contador */
function lamasBlancas(g, w, h) {
  g.fillStyle = '#f4f2ee';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(0,0,0,.12)';
  for (let y = 6; y < h; y += 7) g.fillRect(4, y, w / 2 - 6, 2);
  for (let y = 6; y < h; y += 7) g.fillRect(w / 2 + 2, y, w / 2 - 6, 2);
  g.fillStyle = '#c8c4bc';
  g.fillRect(w / 2 - 1, 0, 2, h);
}

// ——— las piezas ———

/** el bajo de la casa: el zócalo, el portal 12, la panadería con su toldo y letrero, el contador y el cubo */
function fachada(k) {
  const p = S0 + 1.1, a = 7.6, b = 10.1;
  // la pared blanca del bajo (tapa los escaparates genéricos) con los huecos del portal y de la panadería,
  // y encima el zócalo color melocotón con su raya naranja
  for (const [s0, s1, y0] of [[S0, p - 0.5, 0], [p + 0.5, a, 0], [b, S1, 0], [p - 0.5, p + 0.5, 2.28], [a, b, 2.45]]) {
    k.box((s0 + s1) / 2, y0, Z - 0.02, s1 - s0, 3.7 - y0, 0.06, 0xf2f1ec);
    if (y0 === 0) {
      k.box((s0 + s1) / 2, 0, Z + 0.02, s1 - s0, 1.25, 0.04, MELOCOTON);
      k.box((s0 + s1) / 2, 1.25, Z + 0.03, s1 - s0, 0.1, 0.05, NARANJA);
    }
  }
  // la puerta del portal 12, de madera oscura, con su número y el buzón
  k.box(p, 0, Z + 0.04, 1.0, 2.2, 0.06, 0x2a2420);
  k.box(p, 2.2, Z + 0.05, 1.15, 0.08, 0.08, 0xe8e4dc);
  k.box(p, 1.95, Z + 0.08, 0.16, 0.12, 0.02, 0xd8d4cc);
  k.box(p + 0.95, 1.2, Z + 0.06, 0.25, 0.32, 0.1, 0x7a7c80);
  // la entrada de la panadería, abierta, con su marco
  k.pic((a + b) / 2, 1.2, Z + 0.01, b - a, 2.4, 0, 1, canvasTex(200, 190, dentro), { glow: 0.12 });
  for (const s of [a, b]) k.box(s, 0, Z + 0.05, 0.08, 2.45, 0.08, 0x2a2a2c);
  k.box((a + b) / 2, 2.4, Z + 0.05, b - a + 0.08, 0.08, 0.08, 0x2a2a2c);
  // el toldo naranja con su faldón y, encima, el letrero de colores
  const fuera = 1.4, yP = 2.95, yF = 2.45;
  const L = Math.hypot(fuera, yP - yF);
  const tela = new THREE.BoxGeometry(b - a + 0.5, 0.03, L);
  tela.rotateX(Math.atan2(yP - yF, fuera));
  tela.translate((a + b) / 2, (yP + yF) / 2, Z + fuera / 2);
  k.add(tela, NARANJA);
  k.box((a + b) / 2, yF - 0.28, Z + fuera, b - a + 0.5, 0.28, 0.03, NARANJA);
  k.pic((a + b) / 2, yF - 0.14, Z + fuera + 0.02, b - a + 0.45, 0.26, 0, 1, canvasTex(420, 44, faldon));
  k.box((a + b) / 2 + 0.2, 3.05, Z + 0.04, 3.0, 0.75, 0.08, 0xc81e6a);
  k.pic((a + b) / 2 + 0.2, 3.425, Z + 0.085, 2.98, 0.73, 0, 1, canvasTex(400, 100, letrero));
  // la caja blanca de lamas del contador y el cubo gris de tapa azul
  k.pic(11.2, 0.75, Z + 0.03, 0.8, 0.7, 0, 1, canvasTex(80, 70, lamasBlancas));
  k.box(10.6, 0, Z + 0.4, 0.55, 0.9, 0.55, 0x9a9ca0);
  k.box(10.6, 0.9, Z + 0.4, 0.6, 0.06, 0.6, 0x2a5ab8);
  k.block(10.6, Z + 0.4, 0.55, 0.55);
}

/** se monta con lo demás de Titerroy */
export function buildLaGuinda(scene, colliders, map) {
  if (!map?.laGuinda) return null;
  const k = new Kit();
  fachada(k);
  const group = enMarco(k, G, 'laGuinda', colliders);
  scene.add(group);
  return { group };
}
