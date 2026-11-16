import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, barDentro } from './restaurantesCharco.js';
import { paredAlta, ventana } from './edificioReal.js';

/**
 * El Bar Cafetería El Pingüi, en la calle Tinamala, al lado del portal del 28 (Titerroy, cerca de la esquina con
 * Gregorio Chil), con la vista de la calle de Google de julio de 2025 (solo se mira, no va dentro del juego; la gente no
 * se pone; Google pone el bar unos metros más allá, en la puerta de la academia): la casa blanca de dos plantas (7 m, lo
 * que ya medía el bloque del mapa) con el zócalo y los marcos de granito gris moteado; en el bajo, la puerta del bar
 * con las dos hojas de reja negra abiertas, el bar dentro y «BAR CAFETERÍA» en rojo en el cristal de encima, el letrero
 * redondo blanco de «El Pingüi Cafetería» con el pingüino, y a la izquierda la ventana de la reja negra; arriba, los dos
 * cuerpos de granito que salen de la pared (el pequeño, con la ventana encima, y el grande con la ventana de tres hojas)
 * y la ventanita del final; y a la derecha, la puerta blanca del portal del 28. El mapa no tenía rótulo suyo; salió de
 * la lista de cafeterías de Google.
 */

// la cara de la calle Tinamala del bloque (s del este hacia la esquina de Gregorio Chil, en s 38,2); la vista de la
// calle pone la puerta del bar en s 24,7 y la del portal del 28 en s 27,5
const M = marco([-575.47, -786.96], [-606.22, -764.36]);
const Z = 0.12, ZF = Z + 0.3, YP = 3.8, TECHO = 7.0, BLANCO = 0xf2f2ee, GRANITO = 0xbab4aa;
const S0 = 18.8, S1 = 28.4;

/** antes de levantar la ciudad: solo la marca de que se monta (el mapa no tenía rótulo suyo) */
export function tuneElPingui(map) {
  map.elPingui = true;
}

// ——— lo que se pinta en lienzo ———

/** el granito gris moteado */
function granito(g, w, h) {
  g.fillStyle = '#bab4aa';
  g.fillRect(0, 0, w, h);
  let s = 23;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < w * h / 30; i++) {
    g.fillStyle = r() < 0.5 ? 'rgba(60,58,56,.35)' : 'rgba(220,216,210,.35)';
    g.fillRect(r() * w, r() * h, 1.5, 1.5);
  }
  g.strokeStyle = 'rgba(70,68,64,.35)';
  g.lineWidth = 1;
  for (let y = h / 4; y < h; y += h / 4) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
}

/** el letrero redondo blanco: el pingüino, «El Pingüi» y «Cafetería» */
function letreroRedondo(g, w, h) {
  g.clearRect(0, 0, w, h);
  const c = w / 2, r = w * 0.48;
  g.fillStyle = '#1e1e20';
  g.beginPath(); g.arc(c, c, r, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#f6f6f2';
  g.beginPath(); g.arc(c, c, r * 0.9, 0, Math.PI * 2); g.fill();
  // el pingüino de perfil, a la derecha
  g.fillStyle = '#1e1e20';
  g.beginPath(); g.ellipse(c + r * 0.32, c - r * 0.05, r * 0.2, r * 0.42, 0.15, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.arc(c + r * 0.38, c - r * 0.5, r * 0.16, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#f6f6f2';
  g.beginPath(); g.ellipse(c + r * 0.25, c + r * 0.02, r * 0.1, r * 0.3, 0.15, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#e8a82a';
  g.beginPath(); g.moveTo(c + r * 0.5, c - r * 0.52); g.lineTo(c + r * 0.68, c - r * 0.48); g.lineTo(c + r * 0.5, c - r * 0.44); g.fill();
  g.fillStyle = '#1e1e20';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `900 ${Math.round(r * 0.36)}px Georgia, serif`;
  g.fillText('El', c - r * 0.35, c - r * 0.42);
  g.fillText('Pingüi', c - r * 0.22, c - r * 0.02, r * 0.95);
  g.fillStyle = '#c82a2a';
  g.font = `italic 600 ${Math.round(r * 0.22)}px "Segoe Script", "Brush Script MT", Georgia, serif`;
  g.fillText('Cafetería', c - r * 0.1, c + r * 0.45);
}

/** el cristal de encima de la puerta, con «BAR CAFETERÍA» en rojo */
function montante(g, w, h) {
  g.fillStyle = '#3a4048';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,255,255,.12)';
  g.fillRect(0, 0, w, h * 0.4);
  g.fillStyle = '#c82a2a';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `800 ${Math.round(h * 0.55)}px Georgia, serif`;
  g.fillText('BAR     CAFETERÍA', w / 2, h * 0.55, w * 0.92);
  g.strokeStyle = '#f2f2ee';
  g.lineWidth = 4;
  for (const x of [w / 3, (2 * w) / 3]) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
}

/** la ventana de la reja negra, con el cristal oscuro detrás */
function ventanaReja(g, w, h) {
  g.fillStyle = '#3a3e44';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,255,255,.15)';
  g.fillRect(0, 0, w * 0.35, h);
  g.fillStyle = '#e8e8e4';
  g.fillRect(w * 0.48, 0, w * 0.04, h);
  g.fillStyle = '#1a1a1c';
  for (let x = w * 0.08; x < w; x += w / 9) g.fillRect(x, 0, 4, h);
  for (const y of [0.05, 0.5, 0.95]) g.fillRect(0, h * y - 2, w, 5);
}

/** la puerta blanca del portal del 28 */
function portal(g, w, h) {
  g.fillStyle = '#f2f2ee';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#9aa8b4';
  g.fillRect(w * 0.15, h * 0.08, w * 0.7, h * 0.8);
  g.strokeStyle = '#f2f2ee';
  g.lineWidth = 4;
  for (let y = h * 0.08; y < h * 0.88; y += h * 0.16) { g.beginPath(); g.moveTo(w * 0.15, y); g.lineTo(w * 0.85, y); g.stroke(); }
}

// ——— las piezas ———

/** un marco de granito alrededor de un hueco */
function marcoGranito(k, s, y, w, h) {
  for (const t of [s - w / 2 - 0.12, s + w / 2 + 0.12]) k.box(t, y, ZF + 0.03, 0.24, h + 0.12, 0.06, GRANITO);
  k.box(s, y + h, ZF + 0.03, w + 0.48, 0.24, 0.06, GRANITO);
}

/** una hoja de la reja negra de la puerta, abierta hacia fuera */
function hojaReja(k, bisagra, lado) {
  const w = 0.95, h = 2.3, ang = lado * 1.25;
  const piezas = [[w / 2, 0.05, w, 0.05], [w / 2, h - 0.05, w, 0.05], [w / 2, h * 0.55, w, 0.04], [0.02, h / 2, 0.05, h], [w - 0.02, h / 2, 0.05, h]];
  for (let x = 0.12; x < w - 0.05; x += 0.12) piezas.push([x, h / 2, 0.025, h]);
  for (const [x, y, ww, hh] of piezas) {
    const g = new THREE.BoxGeometry(ww, hh, 0.03);
    g.translate(x * lado, y, 0);
    g.rotateY(-ang);
    g.translate(bisagra, 0.02, ZF + 0.04);
    k.add(g, 0x1a1a1c);
  }
}

/** la fachada entera de la casa: el bajo con el bar, la ventana de reja y el portal, y la planta de arriba */
function fachada(k) {
  const c = (S0 + S1) / 2, L = S1 - S0;
  k.box(c, 0, Z + 0.15, L, YP, 0.3, BLANCO);
  k.block(c, Z + 0.15, L, 0.3);
  paredAlta(k, S0, S1, YP, TECHO, Z, BLANCO);
  // el zócalo de granito
  k.pic(c, 0.65, ZF + 0.006, L, 1.3, 0, 1, canvasTex(Math.round(L * 40), 52, granito));
  // la ventana de la reja negra, a la izquierda
  k.pic(20.5, 1.6, ZF + 0.012, 1.9, 2.3, 0, 1, canvasTex(160, 190, ventanaReja));
  marcoGranito(k, 20.5, 0.45, 1.9, 2.3);
  k.box(20.5, 0.4, ZF + 0.08, 2.1, 0.08, 0.16, GRANITO);
  // la puerta del bar: el bar dentro, el cristal de encima con el letrero y las dos hojas de reja abiertas
  k.pic(24.7, 1.15, ZF + 0.01, 2.0, 2.3, 0, 1, canvasTex(200, 230, barDentro), { glow: 0.25 });
  k.pic(24.7, 2.6, ZF + 0.012, 2.0, 0.5, 0, 1, canvasTex(260, 64, montante));
  marcoGranito(k, 24.7, 0, 2.0, 2.85);
  hojaReja(k, 23.7, 1);
  hojaReja(k, 25.7, -1);
  // el letrero redondo de El Pingüi, de bandera, con su brazo
  k.box(23.4, 3.25, ZF + 0.15, 0.04, 0.04, 0.3, 0x2a2a2c);
  k.pic(23.4, 3.25, ZF + 0.35, 0.9, 0.9, 1, 0, canvasTex(160, 160, letreroRedondo));
  k.pic(23.4, 3.25, ZF + 0.35, 0.9, 0.9, -1, 0, canvasTex(160, 160, letreroRedondo));
  k.box(22.6, 2.6, ZF + 0.02, 0.3, 0.4, 0.02, 0xf2f2ee);
  // la puerta blanca del portal del 28, con su número
  k.pic(27.6, 1.15, ZF + 0.012, 0.95, 2.3, 0, 1, canvasTex(95, 230, portal));
  marcoGranito(k, 27.6, 0, 0.95, 2.4);
  k.box(27.6, 2.7, ZF + 0.03, 0.2, 0.14, 0.02, 0x2a2a2c);
  // arriba: el cuerpo pequeño de granito con la ventana encima, el grande con la de tres hojas y la ventanita
  k.box(20.6, YP + 0.1, ZF + 0.2, 2.2, 1.1, 0.4, GRANITO);
  k.pic(20.6, YP + 0.65, ZF + 0.405, 2.2, 1.1, 0, 1, canvasTex(110, 56, granito));
  ventana(k, 20.6, YP + 1.35, 1.1, 1.0, Z, { carpinteria: '#f2f2ee' });
  marcoGranito(k, 20.6, YP + 1.35, 1.1, 1.0);
  k.box(24.4, YP + 0.1, ZF + 0.25, 4.2, TECHO - YP - 0.1, 0.5, GRANITO);
  k.pic(24.4, (YP + 0.1 + TECHO) / 2, ZF + 0.505, 4.2, TECHO - YP - 0.1, 0, 1, canvasTex(210, 150, granito));
  ventana(k, 24.4, YP + 1.2, 2.0, 1.1, Z + 0.5, { carpinteria: '#f2f2ee', hojas: 3 });
  ventana(k, 27.4, YP + 0.5, 0.7, 0.8, Z, { carpinteria: '#f2f2ee' });
  marcoGranito(k, 27.4, YP + 0.5, 0.7, 0.8);
  k.box(c, TECHO - 0.1, ZF + 0.03, L, 0.1, 0.06, 0xe8e6e0);
}

/** se monta con lo demás de Titerroy */
export function buildElPingui(scene, colliders, map) {
  if (!map?.elPingui) return null;
  const k = new Kit();
  fachada(k);
  const group = enMarco(k, M, 'elPingui', colliders);
  scene.add(group);
  return { group };
}
