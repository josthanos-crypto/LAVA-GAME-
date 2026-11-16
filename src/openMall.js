import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';
import { alturaBloque, cristales } from './edificioReal.js';

/**
 * El Centro Comercial Open Mall, en la Rambla Medular (León y Castillo 156), con las vistas de la calle de Google de julio
 * de 2025 y la foto aérea (solo se miran, no van dentro del juego; la gente no se pone). El mapa lo tenía como un bloque
 * gris de 9 m y liso. Por la Rambla: el muro alto forrado de chapa perforada color granate oscuro (12 m), sentado sobre el
 * muro de piedra volcánica del parterre, con las palmeras jóvenes, los cactus y las pitas; la pancarta blanca del premio
 * al mejor centro comercial de España de 2024; y en la punta del norte, la torre de entrada más alta, color chocolate, con
 * el rótulo de «OPEN MALL», la marquesina de cristal oscuro y los escalones. Los rótulos de las tiendas no se ponen, que
 * son de marcas.
 */

// la cara de la Rambla, de la esquina del sur (s 0) a la entrada del norte, N hacia la calle (al oeste)
const M = marco([287.41, -653.62], [253.88, -581.8]);
const Z = 0.12, ZF = Z + 0.3, H = 12, GRANATE = 0x8a3e30;
// la entrada del norte (de s a s)
const E0 = 70, E1 = M.len;

/** antes de levantar la ciudad: el bloque del centro comercial a su altura y color */
export function tuneOpenMall(map) {
  if (!alturaBloque(map, 320, -600, H, [96, 46, 40])) return;
  map.openMall = true;
}

// ——— lo que se pinta en lienzo ———

/** la chapa perforada granate, con las juntas de los paneles y los agujeritos */
function chapa(g, w, h) {
  g.fillStyle = '#8e4232';
  g.fillRect(0, 0, w, h);
  let s = 31;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < w * h / 30; i++) { g.fillStyle = `rgba(${r() < 0.5 ? '60,24,18' : '160,90,72'},.3)`; g.fillRect(r() * w, r() * h, 1.5, 1.5); }
  g.strokeStyle = 'rgba(60,26,20,.45)';
  g.lineWidth = 1.5;
  const t = h / 8;
  for (let y = t; y < h; y += t) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  for (let x = t * 1.5; x < w; x += t * 1.5) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
}

/** el muro de piedra volcánica del parterre */
function piedra(g, w, h) {
  g.fillStyle = '#5a5a56';
  g.fillRect(0, 0, w, h);
  let s = 17;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < w * 3; i++) {
    const v = 70 + r() * 40;
    g.fillStyle = `rgb(${v},${v},${v - 4})`;
    g.fillRect(r() * w, r() * h, 3 + r() * 6, 2 + r() * 4);
  }
}

/** la pancarta blanca del premio (solo letras) */
function pancarta(g, w, h) {
  g.fillStyle = '#f2f2ee';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#c8c8c4';
  g.lineWidth = 3;
  g.strokeRect(2, 2, w - 4, h - 4);
  g.fillStyle = '#2a2a2a';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `800 ${Math.round(h * 0.2)}px Arial, sans-serif`;
  g.fillText('PREMIO AL', w / 2, h * 0.24, w * 0.9);
  g.fillText('MEJOR CENTRO COMERCIAL', w / 2, h * 0.5, w * 0.92);
  g.fillText('DE ESPAÑA 2024', w / 2, h * 0.76, w * 0.9);
}

/** el rótulo vertical de la torre: el círculo de puntos y «OPEN MALL» en blanco */
function rotulo(g, w, h) {
  g.fillStyle = '#5a3226';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#e8e8e4';
  const cx = w / 2, cy = h * 0.3, R = w * 0.28;
  for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; g.beginPath(); g.arc(cx + Math.cos(a) * R, cy + Math.sin(a) * R, w * 0.035, 0, Math.PI * 2); g.fill(); }
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `800 ${Math.round(w * 0.2)}px Arial, sans-serif`;
  g.fillText('OPEN', cx, h * 0.62, w * 0.85);
  g.fillText('MALL', cx, h * 0.8, w * 0.85);
}

const vidrioOscuro = cristales('#1e1e20', 4, 'rgba(160,175,185,.2)');

// ——— las piezas ———

/** una palmera joven del parterre */
function palmera(k, s, z, h) {
  k.cyl(s, 1.4, z, 0.16, 0.22, h, 0x7a6248, { seg: 8 });
  for (let i = 0; i < 7; i++) k.box(s, 1.4 + h - 0.1, z, 2.6, 0.05, 0.4, 0x4a7a32, { ry: (i * Math.PI) / 7 });
}

/** la cara de la Rambla */
function fachada(k) {
  const L = M.len;
  // el muro alto de chapa granate
  k.box(E0 / 2, 0, Z + 0.15, E0, H, 0.3, GRANATE);
  k.block(E0 / 2, Z + 0.15, E0, 0.3);
  k.pic(E0 / 2, H / 2, ZF + 0.004, E0, H, 0, 1, canvasTex(Math.round(E0 * 10), Math.round(H * 10), chapa));
  k.box(E0 / 2, H - 0.15, ZF + 0.05, E0, 0.15, 0.1, 0x5a2a22);
  // la pancarta del premio
  k.pic(36, 9.4, ZF + 0.02, 10, 2.4, 0, 1, canvasTex(500, 120, pancarta));
  // el parterre: el muro de piedra con la tierra, las palmeras jóvenes, los cactus y las pitas
  const zp = ZF + 1.8;
  k.box(E0 / 2, 0, zp + 1.6, E0, 1.4, 0.4, 0x6a6a66);
  k.block(E0 / 2, zp + 1.6, E0, 0.4);
  k.pic(E0 / 2, 0.7, zp + 1.81, E0, 1.4, 0, 1, canvasTex(Math.round(E0 * 12), 18, piedra));
  k.box(E0 / 2, 1.2, zp, E0, 0.2, 3.2, 0x3a2e24);
  for (let s = 4; s < E0 - 2; s += 7.5) palmera(k, s, zp, 2.6 + (s % 3) * 0.4);
  for (let s = 7.5; s < E0 - 2; s += 7.5) {
    k.cyl(s, 1.4, zp + 0.6, 0.14, 0.16, 1.6, 0x4a7a4a, { seg: 8 });
    k.cyl(s + 0.35, 2.0, zp + 0.6, 0.09, 0.09, 0.8, 0x4a7a4a, { seg: 8 });
    k.ball(s + 1.6, 1.6, zp - 0.4, 0.5, 0x5a8a5a);
  }
  // la torre de entrada del norte, más alta, con el rótulo y la marquesina de cristal oscuro
  const ec = (E0 + E1) / 2, EW = E1 - E0;
  k.box(ec, 0, Z + 0.15, EW, H + 3, 0.3, 0x6a3a2c);
  k.block(ec, Z + 0.15, EW, 0.3);
  k.box(E0 + 1.3, 0, ZF + 0.8, 2.6, H + 3, 1.6, 0x5a3226);
  k.pic(E0 + 1.3, H - 0.5, ZF + 1.61, 2.4, 5.0, 0, 1, canvasTex(120, 250, rotulo));
  k.pic(ec + 1.4, 1.6, ZF + 0.012, EW - 3.4, 3.0, 0, 1, canvasTex(Math.round((EW - 3.4) * 30), 90, vidrioOscuro), { glow: 0.2 });
  k.box(ec + 1.4, 3.4, ZF + 1.6, EW - 3, 0.25, 3.2, 0x2a2a2c);
  k.box(ec + 1.4, 3.65, ZF + 1.6, EW - 3, 0.05, 3.2, 0x5a6a74, { list: k.glass });
  for (const s of [E0 + 3.0, E1 - 0.3]) k.box(s, 0, ZF + 3.0, 0.12, 3.4, 0.12, 0x2a2a2c);
  for (let i = 0; i < 4; i++) k.box(ec + 1.4, i * 0.18, ZF + 4.6 - i * 0.4, EW - 3, 0.18, 0.4, 0x8a8a86);
}

/** se monta con lo demás de Valterra */
export function buildOpenMall(scene, colliders, map) {
  if (!map?.openMall) return null;
  const k = new Kit();
  fachada(k);
  const group = enMarco(k, M, 'openMall', colliders);
  scene.add(group);
  return { group };
}
