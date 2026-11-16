import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';
import { alturaBloque } from './edificioReal.js';

/**
 * La Estación de Guaguas de Arrecife, en la Rambla Medular esquina a la calle La Férmina, con las vistas de la calle de
 * Google de julio de 2025 (y la de octubre de 2016 para la esquina de la torre) y la foto aérea (solo se miran, no van
 * dentro del juego; la gente no se pone). El mapa tenía el bloque triangular gris de 6 m y liso. De verdad es de dos
 * plantas (9,6 m), color arena: por la Rambla, el bajo de cristaleras con la carpintería granate entre pilastras
 * amarillas y rojas, la franja de cuadros rojos y amarillos (azul en la punta del oeste), el gran portal rojo del paso
 * a las dársenas, las ventanas altas y estrechas de arriba con su barandilla de aspas, las dos ventanas redondas, el
 * balcón de aspas encima del portal, las letras de «estación de GUAGUAS» en el remate, la torre de cristal de la
 * esquina con el reloj, la parada con su poste azul y la papelera. Por La Férmina, la pared arena con las ventanas
 * enrejadas abajo, las ventanas de arriba y la fila de ventanitas redondas.
 */

// la cara de la Rambla (del oeste, s 0, a la esquina de La Férmina) y la de La Férmina, las dos con N hacia la calle
const R = marco([-176.94, -480.9], [-142.84, -486.66]);
const F = marco([-139.22, -496.5], [-158.01, -522.73]);
// el chaflán de la esquina, entre la torre de cristal y La Férmina
const C = marco([-142.84, -486.66], [-139.22, -496.5]);
const Z = 0.12, ZF = Z + 0.3, H = 9.6, YB = 3.6, ARENA = 0xe2cc98;
// el portal rojo del paso a las dársenas (de s a s) y la torre de cristal de la esquina
const P0 = 21.4, P1 = 26.2, T0 = 31.8;

/** antes de levantar la ciudad: el bloque a sus dos plantas y color arena */
export function tuneEstacionGuaguas(map) {
  if (!alturaBloque(map, -160, -500, H, [226, 204, 152])) return;
  map.estacionGuaguas = true;
}

// ——— lo que se pinta en lienzo ———

/** la pared color arena con las juntas del revoco */
function arena(g, w, h) {
  g.fillStyle = '#e2cc98';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(150,120,70,.25)';
  for (let y = h / 9; y < h; y += h / 9) g.fillRect(0, y, w, 1.2);
}

/** la cristalera del bajo con la carpintería granate en cuadrícula */
function cristalera(g, w, h) {
  g.fillStyle = '#3a4650';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(200,215,225,.18)';
  g.fillRect(w * 0.1, 0, w * 0.25, h);
  g.fillStyle = '#5a2226';
  const cols = Math.max(2, Math.round(w / 24));
  for (let i = 0; i <= cols; i++) g.fillRect(Math.min(w - 4, (i * w) / cols), 0, 4, h);
  for (const y of [0, 0.33, 0.66]) g.fillRect(0, h * y, w, 4);
  g.fillRect(0, h - 4, w, 4);
}

/** la franja de cuadros rojos y amarillos, con la punta azul */
function franja(g, w, h) {
  const c = ['#d23a2e', '#f0c43a'];
  const t = h * 1.5;
  for (let x = 0, i = 0; x < w; x += t, i++) { g.fillStyle = c[i % 2]; g.fillRect(x, 0, t + 1, h); }
  g.fillStyle = '#2a5ab4';
  g.fillRect(0, 0, t * 2.4, h);
  g.fillStyle = '#4a7ad0';
  g.fillRect(t * 0.8, 0, t * 0.8, h);
}

/** la ventana alta y estrecha con la barandilla de aspas abajo */
function ventanaAspas(g, w, h) {
  g.fillStyle = '#2e3438';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(190,200,210,.25)';
  g.fillRect(3, 3, w - 6, h * 0.45);
  g.strokeStyle = '#1a1a1a';
  g.lineWidth = 3;
  const y0 = h * 0.7;
  g.strokeRect(2, y0, w - 4, h - y0 - 2);
  g.beginPath(); g.moveTo(2, y0); g.lineTo(w - 2, h - 2); g.moveTo(w - 2, y0); g.lineTo(2, h - 2); g.stroke();
}

/** la ventana enrejada del bajo de La Férmina */
function enrejada(g, w, h) {
  g.fillStyle = '#3a4248';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#5a2a22';
  g.lineWidth = 4;
  g.strokeRect(2, 2, w - 4, h - 4);
  for (let x = 8; x < w; x += 9) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  for (const y of [0.33, 0.66]) { g.beginPath(); g.moveTo(0, h * y); g.lineTo(w, h * y); g.stroke(); }
}

/** las letras de «estación de» finas y «GUAGUAS» gruesas, en relieve claro */
function letrasFinas(g, w, h) {
  g.fillStyle = '#e2cc98';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#9a8a6a';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `300 ${Math.round(h * 0.8)}px "Segoe UI Light", Arial, sans-serif`;
  g.fillText('estación de', w / 2, h * 0.55, w * 0.96);
}
function letrasGordas(g, w, h) {
  g.fillStyle = '#e2cc98';
  g.fillRect(0, 0, w, h);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `900 ${Math.round(h * 0.86)}px "Arial Black", Arial, sans-serif`;
  g.fillStyle = '#8a8a88';
  g.fillText('GUAGUAS', w / 2 + 3, h * 0.56 + 3, w * 0.96);
  g.fillStyle = '#f4f4f2';
  g.fillText('GUAGUAS', w / 2, h * 0.56, w * 0.96);
}

/** la esfera del reloj */
function reloj(g, w, h) {
  g.fillStyle = '#f4f4f0';
  g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 2, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#2a2a2a';
  g.lineWidth = 3;
  g.stroke();
  g.beginPath(); g.moveTo(w / 2, h / 2); g.lineTo(w / 2, h * 0.2); g.moveTo(w / 2, h / 2); g.lineTo(w * 0.72, h / 2); g.stroke();
}

/** la placa azul de la parada de guaguas */
function placaParada(g, w, h) {
  g.fillStyle = '#f4f4f2';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#1f4aa0';
  g.fillRect(4, 4, w - 8, h - 8);
  g.fillStyle = '#f4f4f2';
  g.fillRect(w * 0.2, h * 0.3, w * 0.6, h * 0.32);
  g.fillStyle = '#1f4aa0';
  g.fillRect(w * 0.26, h * 0.36, w * 0.48, h * 0.1);
}

// ——— las piezas ———

/** la pared de una cara, del color arena */
function pared(k, L, h) {
  k.box(L / 2, 0, Z + 0.15, L, h, 0.3, ARENA);
  k.block(L / 2, Z + 0.15, L, 0.3);
  k.pic(L / 2, h / 2, ZF + 0.003, L, h, 0, 1, canvasTex(Math.round(L * 12), Math.round(h * 12), arena));
}

/** la cara de la Rambla */
function rambla(k) {
  const L = R.len;
  pared(k, L, H);
  // el bajo: las cristaleras entre las pilastras amarillas y rojas
  const tramos = [[0.3, 8.6], [9.6, 14.6], [15.6, 20.6], [26.8, 29.0], [29.6, 31.4]];
  for (const [a, b] of tramos) k.pic((a + b) / 2, YB / 2 - 0.1, ZF + 0.012, b - a, YB - 0.4, 0, 1, canvasTex(Math.round((b - a) * 30), 100, cristalera), { glow: 0.08 });
  for (const [s, c] of [[9.1, 0xf0c43a], [15.1, 0xf0c43a], [21.0, 0xd23a2e], [29.3, 0xf0c43a]]) k.box(s, 0, ZF + 0.15, 0.9, YB, 0.3, c);
  k.box(0.2, 0, ZF + 0.15, 0.5, YB, 0.3, 0x2a5ab4);
  // la franja de cuadros rojos y amarillos
  k.box(L / 2, YB, ZF + 0.1, L, 0.12, 0.25, 0xd8d4cc);
  k.pic(L / 2, YB + 0.55, ZF + 0.012, L, 0.9, 0, 1, canvasTex(Math.round(L * 20), 30, franja));
  k.box(L / 2, YB + 1.0, ZF + 0.1, L, 0.1, 0.25, 0xd8d4cc);
  // el portal rojo del paso a las dársenas
  const pc = (P0 + P1) / 2, PW = P1 - P0;
  for (const s of [P0 + 0.35, P1 - 0.35]) { k.box(s, 0, ZF + 0.6, 0.7, 4.8, 1.2, 0xc8302a); k.block(s, ZF + 0.6, 0.7, 1.2); }
  k.box(pc, 3.9, ZF + 0.6, PW, 0.9, 1.2, 0xc8302a);
  k.box(pc, 0, ZF + 0.02, PW - 1.4, 3.9, 0.05, 0x5a1a1a);
  // arriba: las ventanas altas con aspas, las dos redondas y el balcón de aspas sobre el portal
  for (let s = 5.6; s < P0 - 0.5; s += 1.75) k.pic(s, 6.5, ZF + 0.012, 0.85, 2.4, 0, 1, canvasTex(34, 96, ventanaAspas));
  for (let s = P1 + 1.2; s < T0 - 0.4; s += 1.75) k.pic(s, 6.5, ZF + 0.012, 0.85, 2.4, 0, 1, canvasTex(34, 96, ventanaAspas));
  for (const s of [1.6, 3.4]) {
    k.cyl(s, 6.9, ZF + 0.02, 0.42, 0.42, 0.06, 0xc8b480, { seg: 20, rx: Math.PI / 2 });
    k.cyl(s, 6.9, ZF + 0.06, 0.32, 0.32, 0.03, 0x2e3438, { seg: 20, rx: Math.PI / 2 });
  }
  k.pic(pc, 6.5, ZF + 0.012, PW - 0.6, 2.2, 0, 1, canvasTex(160, 80, ventanaAspas));
  k.box(pc, 5.1, ZF + 0.6, PW, 0.15, 1.2, 0xc8302a);
  for (let s = P0 + 0.2; s < P1; s += 1.2) {
    k.box(s + 0.6, 5.25, ZF + 1.15, 1.25, 0.05, 0.05, 0x1a1a1a);
  }
  k.box(pc, 6.15, ZF + 1.15, PW, 0.05, 0.05, 0x1a1a1a);
  for (let s = P0 + 0.2; s <= P1 - 0.1; s += 1.2) k.box(s, 5.25, ZF + 1.15, 0.05, 0.9, 0.05, 0x1a1a1a);
  // el remate con las letras
  k.box(L / 2, H - 0.2, ZF + 0.05, L, 0.2, 0.15, 0xd8c08a);
  k.pic(12.8, 8.55, ZF + 0.012, 8.0, 1.2, 0, 1, canvasTex(400, 60, letrasFinas));
  k.pic(23.2, 8.6, ZF + 0.03, 10.0, 1.6, 0, 1, canvasTex(500, 80, letrasGordas));
  k.box(23.2, H, ZF, 11, 0.6, 0.3, ARENA);
  // la torre de cristal de la esquina con el reloj
  const tc = (T0 + L) / 2, TW = L - T0;
  k.box(tc, YB + 1.0, ZF + 0.4, TW, H - YB, 0.8, 0x5a7080, { list: k.glass });
  for (let y = YB + 2.2; y < H + 1; y += 1.4) k.box(tc, y, ZF + 0.82, TW, 0.06, 0.05, 0x5a2226);
  k.box(tc, H + 1.0, ZF + 0.4, TW + 0.2, 0.15, 0.9, 0x5a2226);
  k.pic(T0 - 0.4, 8.2, ZF + 0.05, 0.7, 0.7, 0, 1, canvasTex(40, 40, reloj));
  k.pic(T0 + 1.2, 1.4, ZF + 0.012, 1.4, 2.6, 0, 1, canvasTex(56, 104, cristalera));
  // la parada: el poste con la placa azul, la papelera y el panel de horarios
  k.cyl(7.2, 0, ZF + 1.6, 0.05, 0.05, 2.7, 0x8a8a88, { seg: 8 });
  k.pic(7.2, 2.4, ZF + 1.66, 0.6, 0.6, 0, 1, canvasTex(40, 40, placaParada));
  k.cyl(6.4, 0, ZF + 1.4, 0.22, 0.2, 0.8, 0x7aa05a, { seg: 12 });
  k.box(0.9, 0, ZF + 2.4, 0.5, 2.2, 0.15, 0xe8e8e4);
  k.box(0.9, 2.2, ZF + 2.0, 1.4, 0.06, 1.0, 0x9a9a98);
}

/** la cara de La Férmina */
function fermina(k) {
  const L = F.len;
  pared(k, L, H);
  for (let s = 2.4; s < L - 1.5; s += 3.6) {
    k.pic(s, 1.6, ZF + 0.012, 2.4, 2.2, 0, 1, canvasTex(96, 88, enrejada));
    k.pic(s, 6.4, ZF + 0.012, 1.0, 2.2, 0, 1, canvasTex(40, 88, ventanaAspas));
  }
  for (let s = 3.0; s < L - 1; s += 1.2) {
    k.cyl(s, 4.3, ZF + 0.02, 0.22, 0.22, 0.04, 0xc8b480, { seg: 16, rx: Math.PI / 2 });
    k.cyl(s, 4.3, ZF + 0.05, 0.16, 0.16, 0.03, 0x2e3438, { seg: 16, rx: Math.PI / 2 });
  }
  k.box(L / 2, H - 0.2, ZF + 0.05, L, 0.2, 0.15, 0xd8c08a);
}

/** el chaflán de la esquina: la pared arena con la cristalera abajo y las ventanas de aspas arriba */
function chaflan(k) {
  const L = C.len;
  pared(k, L, H);
  k.pic(L / 2, YB / 2 - 0.1, ZF + 0.012, L - 1.0, YB - 0.4, 0, 1, canvasTex(Math.round(L * 30), 100, cristalera), { glow: 0.08 });
  k.pic(L / 2, YB + 0.55, ZF + 0.012, L, 0.9, 0, 1, canvasTex(Math.round(L * 20), 30, franja));
  for (let s = 1.4; s < L - 0.8; s += 1.75) k.pic(s, 6.5, ZF + 0.012, 0.85, 2.4, 0, 1, canvasTex(34, 96, ventanaAspas));
  k.box(L / 2, H - 0.2, ZF + 0.05, L, 0.2, 0.15, 0xd8c08a);
}

/** se monta con lo demás de Titerroy */
export function buildEstacionGuaguas(scene, colliders, map) {
  if (!map?.estacionGuaguas) return null;
  const grupos = [[R, 'estacionGuaguasRambla', rambla], [F, 'estacionGuaguasFermina', fermina], [C, 'estacionGuaguasChaflan', chaflan]].map(([m, n, f]) => {
    const k = new Kit();
    f(k);
    const g = enMarco(k, m, n, colliders);
    scene.add(g);
    return g;
  });
  return { group: grupos[0], grupos };
}
