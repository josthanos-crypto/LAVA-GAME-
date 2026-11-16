import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * El Locutorio Nador Minimarket, en la calle Cuba 10 (centro), con las fotos de Google Maps de 2025 y 2026 y la vista
 * de la calle de junio de 2012, cuando en el mismo hueco había otro locutorio (solo se miran, no van dentro del
 * juego; la gente no se pone): la pared blanca con el zócalo gris; el escaparate de marco de aluminio lleno de
 * fundas y cargadores de móvil; la puerta abierta con las estanterías de comida, refrescos y patatas dentro; el
 * cartel azul colgado de brazo con «Locutorio Nador · MINIMARKET» y la bola del mundo (sin los teléfonos, las
 * direcciones ni el código de la foto); los cajetines grises de la luz; y a los lados, el portal del 10 con su
 * escalera y la puerta verde del 8. Los paneles de las casas de envío de dinero y de la compañía de móviles que
 * forran la fachada llevan marca y no se ponen. El bloque se queda como está; lo de abajo tapa su trozo.
 */

// la cara de la calle Cuba (s de norte a sur); Google pone la tienda en s 15,1 (el rótulo del mapa caía en la
// esquina, en la cara de al lado)
const M = marco([-128.47, 1.0], [-144.08, 18.84]);
const Z = 0.12, ZF = Z + 0.3, S0 = 11.6, S1 = 19.6, YP = 3.3, BLANCO = 0xf2f0ea, ALU = 0xb8bcc0;

/** antes de levantar la ciudad: fuera el rótulo genérico */
export function tuneLocutorioNador(map) {
  map.locutorioNadorSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'Minimarket Locutorio' && Math.hypot(s.x + 145.4, s.z - 20.3) < 15);
  if (i >= 0) map.locutorioNadorSign = map.signs.splice(i, 1)[0];
  map.locutorioNador = true;
}

// ——— lo que se pinta en lienzo ———

/** el escaparate: las fundas y los cargadores colgados en filas */
function escaparate(g, w, h) {
  g.fillStyle = '#e8e6ea';
  g.fillRect(0, 0, w, h);
  let s = 21;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const col = ['#2a2a2e', '#d84a6a', '#3a6ac8', '#e8c84a', '#6ab04a', '#f2f2ee', '#8a5ac8', '#c8c8cc'];
  for (let y = 0.06; y < 0.9; y += 0.14) for (let x = 0.04; x < 0.94; x += 0.1) {
    g.fillStyle = '#9a9aa0';
    g.fillRect(w * (x + 0.035), h * y, 2, h * 0.02);
    g.fillStyle = col[Math.floor(r() * col.length)];
    g.fillRect(w * x, h * (y + 0.02), w * 0.075, h * 0.1);
  }
  g.fillStyle = 'rgba(255,255,255,.18)';
  g.fillRect(0, 0, w * 0.3, h);
}

/** la tienda por la puerta: las estanterías de colores y la nevera al fondo */
function tienda(g, w, h) {
  g.fillStyle = '#d8d4cc';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#f4f4f0';
  g.fillRect(0, 0, w, h * 0.1);
  let s = 5;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const col = ['#d83a2a', '#e8c84a', '#3a6ac8', '#6ab04a', '#e87a2a', '#f2f2ee'];
  for (const [x0, x1] of [[0.02, 0.4], [0.6, 0.98]]) {
    for (let y = 0.2; y < 0.85; y += 0.12) {
      g.fillStyle = '#c8c8cc';
      g.fillRect(w * x0, h * (y + 0.09), w * (x1 - x0), h * 0.015);
      for (let x = x0; x < x1 - 0.04; x += 0.05) { g.fillStyle = col[Math.floor(r() * col.length)]; g.fillRect(w * x, h * y, w * 0.04, h * 0.085); }
    }
  }
  g.fillStyle = '#c8d8e0';
  g.fillRect(w * 0.42, h * 0.3, w * 0.16, h * 0.5);
  g.fillStyle = '#8a8a8e';
  g.fillRect(0, h * 0.88, w, h * 0.12);
  g.fillStyle = 'rgba(0,0,0,.15)';
  g.fillRect(0, 0, w, h);
}

/** el cartel azul de «Locutorio Nador · MINIMARKET» con la bola del mundo */
function cartel(g, w, h) {
  g.fillStyle = '#f2f2ee';
  g.fillRect(0, 0, w, h);
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, '#2a4aa8');
  gr.addColorStop(1, '#0e1e5a');
  g.fillStyle = gr;
  g.fillRect(4, 4, w - 8, h - 8);
  g.fillStyle = '#f4f4f0';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `italic 700 ${Math.round(h * 0.13)}px "Segoe Script", "Brush Script MT", Georgia, serif`;
  g.fillText('Locutorio Nador', w / 2, h * 0.14);
  g.font = `700 ${Math.round(h * 0.07)}px "Segoe UI", Arial, sans-serif`;
  g.fillText('MINIMARKET', w / 2, h * 0.26);
  g.fillStyle = '#4a8ad8';
  g.beginPath(); g.arc(w * 0.4, h * 0.55, h * 0.17, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#4ab05a';
  g.beginPath(); g.ellipse(w * 0.36, h * 0.5, h * 0.07, h * 0.05, 0.4, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse(w * 0.45, h * 0.62, h * 0.05, h * 0.07, -0.3, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#c8ccd8';
  for (let y = 0.78; y < 0.94; y += 0.05) g.fillRect(w * 0.15, h * y, w * 0.7, h * 0.015);
}

/** el portal del 10: el hueco oscuro con la escalera que sube */
function portal(g, w, h) {
  g.fillStyle = '#e8e6e0';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#c8c4bc';
  for (let i = 0; i < 6; i++) g.fillRect(0, h * (0.62 + i * 0.065), w * (0.95 - i * 0.12), h * 0.05);
  g.fillStyle = '#4a3a2e';
  g.fillRect(w * 0.7, h * 0.1, w * 0.25, h * 0.5);
  g.fillStyle = 'rgba(0,0,0,.25)';
  g.fillRect(0, 0, w, h * 0.1);
}

/** la puerta verde del 8 */
function puertaVerde(g, w, h) {
  g.fillStyle = '#2a8a4a';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(0,0,0,.3)';
  g.lineWidth = 3;
  g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke();
  for (const x of [0.08, 0.56]) for (const [y, hh] of [[0.06, 0.4], [0.52, 0.42]]) g.strokeRect(w * x, h * y, w * 0.36, h * hh);
}

// ——— las piezas ———

/** la pared blanca con el zócalo gris y todo lo de la tienda */
function fachada(k) {
  k.box((S0 + S1) / 2, 0, Z + 0.15, S1 - S0, YP, 0.3, BLANCO);
  k.block((S0 + S1) / 2, Z + 0.15, S1 - S0, 0.3);
  k.box((S0 + S1) / 2, 0, ZF + 0.01, S1 - S0, 0.8, 0.03, 0x9a9a98);
  // el portal del 10 con la plaquita azul del número
  k.pic(12.6, 1.25, ZF + 0.03, 1.2, 2.5, 0, 1, canvasTex(120, 250, portal));
  k.box(11.9, 1.95, ZF + 0.03, 0.2, 0.16, 0.02, 0x2a5ab8);
  // el escaparate con su marco de aluminio
  k.pic(14.35, 1.55, ZF + 0.03, 1.5, 1.7, 0, 1, canvasTex(170, 190, escaparate), { glow: 0.15 });
  for (const t of [13.6, 15.1]) k.box(t, 0.7, ZF + 0.035, 0.06, 1.7, 0.06, ALU);
  for (const y of [0.7, 2.37]) k.box(14.35, y, ZF + 0.035, 1.56, 0.06, 0.06, ALU);
  // la puerta abierta con la tienda dentro
  k.pic(15.95, 1.2, ZF + 0.03, 1.0, 2.4, 0, 1, canvasTex(110, 240, tienda), { glow: 0.25 });
  for (const t of [15.45, 16.45]) k.box(t, 0, ZF + 0.035, 0.07, 2.42, 0.06, ALU);
  k.box(15.95, 2.4, ZF + 0.035, 1.07, 0.07, 0.06, ALU);
  // el cartel azul colgado de su brazo, de canto a la calle
  k.box(16.75, 3.1, ZF + 0.45, 0.05, 0.05, 0.9, 0x2a2a2c);
  k.box(16.75, 2.35, ZF + 0.5, 0.04, 0.8, 0.6, 0x0e1e5a);
  k.pic(16.78, 2.75, ZF + 0.5, 0.6, 0.8, 1, 0, canvasTex(120, 160, cartel));
  k.pic(16.72, 2.75, ZF + 0.5, 0.6, 0.8, -1, 0, canvasTex(120, 160, cartel));
  // los cajetines grises de la luz y la papelera blanca
  for (const [s, y, w, h] of [[17.1, 1.2, 0.45, 0.6], [17.15, 0.35, 0.4, 0.5], [17.6, 1.9, 0.3, 0.35]]) k.box(s, y, ZF + 0.05, w, h, 0.12, 0xd8d8d4);
  k.cyl(13.4, 0, ZF + 0.3, 0.17, 0.15, 0.6, 0xf2f2ee, { seg: 12 });
  // la puerta verde del 8
  k.pic(18.6, 1.15, ZF + 0.03, 1.0, 2.3, 0, 1, canvasTex(100, 230, puertaVerde));
  k.box(19.2, 1.95, ZF + 0.03, 0.2, 0.16, 0.02, 0x2a5ab8);
}

/** se monta con lo demás de Arrecife Centro */
export function buildLocutorioNador(scene, colliders, map) {
  if (!map?.locutorioNador) return null;
  const k = new Kit();
  fachada(k);
  const group = enMarco(k, M, 'locutorioNador', colliders);
  scene.add(group);
  return { group };
}
