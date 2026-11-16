import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';
import { alzarEdificio, cristales } from './edificioReal.js';

/**
 * La cara de Clavijo y Fajardo del Centro de Salud de Valterra, la del Servicio de Urgencias (números 22 a 28), con
 * las vistas de la calle de Google de julio de 2025 y la foto aérea (solo se miran, no van dentro del juego; la gente
 * no se pone). Por este lado el edificio es una franja larga de tres plantas con su propio tejado (se ve en la foto
 * aérea): color arena con las rayas, como el resto; arriba, las ventanas estrechas metidas en la pared, sueltas o de
 * dos en dos; abajo, las rejillas altas de malla con marco blanco; y hacia el norte, la entrada de Urgencias metida
 * bajo la marquesina oscura, con los pilares de piedra, la puerta de cristal, el letrero azul de «URGENCIAS» y el
 * cartel blanco del servicio; en la pared, las placas azules de aparcamiento y la de prohibido aparcar.
 */

// la cara de Clavijo y Fajardo del bloque, del sur (s 0) al norte (la esquina de Cáceres), N hacia la calle (al este)
const M = marco([500.97, -416.67], [538.85, -483.65]);
// las dos puntas de la franja alta, por encima del resto del edificio (N hacia fuera)
const PUNTA_S = marco(M.W(0, -12), M.W(0, 0));
const PUNTA_N = marco(M.W(M.len, 0), M.W(M.len, -12));
const Z = 0.12, ZF = Z + 0.3, H = 11.6, H0 = 8.4, FONDO = 12, ARENA = 0xcdb89e;
// la entrada de Urgencias (de s a s) y las ventanas de las plantas: en cada tramo de 6,4 m, una pareja y una suelta
const E0 = 51.4, E1 = 58.8;
const PLANTAS = [4.6, 7.8];

/** antes de levantar la ciudad: la franja de tres plantas de Clavijo y Fajardo (va después del centro de salud) */
export function tuneUrgenciasValterra(map) {
  if (!map?.centroSaludValterra) return;
  map.urgenciasValterra = true;
  alzarEdificio(map, M, 0, M.len, FONDO, H, [205, 184, 158]);
}

// ——— lo que se pinta en lienzo ———

/** la pared color arena con las rayas horizontales */
function arena(g, w, h) {
  g.fillStyle = '#cdb89e';
  g.fillRect(0, 0, w, h);
  let s = 5;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(150,128,100,${0.05 + r() * 0.08})`; g.fillRect(r() * w, r() * h, 2 + r() * 6, 2 + r() * 6); }
  g.fillStyle = 'rgba(120,100,78,.45)';
  for (let y = h / 18; y < h; y += h / 18) g.fillRect(0, y, w, 1.5);
}

/** la rejilla alta de malla con su marco blanco */
function malla(g, w, h) {
  g.fillStyle = '#f2f0ea';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#7a6a58';
  g.fillRect(4, 4, w - 8, h - 8);
  g.strokeStyle = 'rgba(200,190,175,.6)';
  g.lineWidth = 1;
  for (let x = 6; x < w - 4; x += 4) { g.beginPath(); g.moveTo(x, 4); g.lineTo(x, h - 4); g.stroke(); }
  for (let y = 6; y < h - 4; y += 4) { g.beginPath(); g.moveTo(4, y); g.lineTo(w - 4, y); g.stroke(); }
}

/** la ventana estrecha con el marco oscuro y la cortina clara */
function estrecha(g, w, h) {
  g.fillStyle = '#2a3236';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(210,230,232,.75)';
  g.fillRect(4, h * 0.2, w - 8, h * 0.75);
  g.strokeStyle = '#1e2426';
  g.lineWidth = 4;
  g.strokeRect(2, 2, w - 4, h - 4);
}

/** el letrero azul de URGENCIAS (sin el logotipo del servicio de salud) */
function urgencias(g, w, h) {
  g.fillStyle = '#1f4aa0';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#f4f4f2';
  g.fillRect(0, 0, h, h);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `800 ${Math.round(h * 0.62)}px "Arial Narrow", Arial, sans-serif`;
  g.fillText('URGENCIAS', (w + h) / 2, h * 0.55, w - h - 8);
}

/** el cartel blanco del servicio, con las letras rojas pequeñas */
function cartel(g, w, h) {
  g.fillStyle = '#f4f2ec';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#c8c0b0';
  g.lineWidth = 3;
  g.strokeRect(1.5, 1.5, w - 3, h - 3);
  g.fillStyle = '#b83a32';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(h * 0.22)}px Arial, sans-serif`;
  g.fillText('SERVICIO', w * 0.6, h * 0.36);
  g.fillText('DE URGENCIAS', w * 0.6, h * 0.66);
}

/** la placa azul de aparcamiento para minusválidos */
function placaP(g, w, h) {
  g.fillStyle = '#1f5ab4';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#f4f4f2';
  g.font = `900 ${Math.round(h * 0.8)}px Arial, sans-serif`;
  g.textBaseline = 'middle';
  g.fillText('P', w * 0.1, h * 0.55);
  g.beginPath(); g.arc(w * 0.78, h * 0.35, h * 0.1, 0, Math.PI * 2); g.fill();
  g.fillRect(w * 0.72, h * 0.48, w * 0.12, h * 0.3);
}

// ——— las piezas ———

/** una ventana estrecha de las plantas, con su hueco y su alféizar */
function ventana(k, s, y) {
  k.box(s, y - 0.06, ZF + 0.05, 0.75, 0.1, 0.16, 0xc4ae92);
  k.pic(s, y + 0.95, ZF + 0.01, 0.55, 1.9, 0, 1, canvasTex(28, 95, estrecha));
  for (const x of [s - 0.33, s + 0.33]) k.box(x, y, ZF + 0.06, 0.1, 1.95, 0.12, 0xc8b296);
}

/** la fachada de Clavijo y Fajardo */
function fachada(k) {
  const L = M.len;
  k.box(L / 2, 0, Z + 0.15, L, H, 0.3, ARENA);
  k.block(L / 2, Z + 0.15, L, 0.3);
  k.pic(L / 2, H / 2, ZF + 0.003, L, H, 0, 1, canvasTex(Math.round(L * 12), Math.round(H * 12), arena));
  k.box(L / 2, H - 0.2, ZF + 0.04, L, 0.2, 0.1, 0xc4ae92);
  // las plantas: en cada tramo de 6,4 m, una pareja de ventanas y una suelta (menos encima de la marquesina)
  for (let t = 1.2; t < L - 2; t += 6.4) {
    for (const y of PLANTAS) {
      for (const s of [t + 0.4, t + 1.25, t + 4.0]) if (s < L - 0.8) ventana(k, s, y);
    }
    // abajo, las rejillas de malla: dos juntas y una suelta, fuera de la entrada
    for (const s of [t + 0.4, t + 1.3, t + 4.0]) {
      if (s > E0 - 0.6 && s < E1 + 0.6) continue;
      if (s > L - 0.8) continue;
      k.pic(s, 1.75, ZF + 0.012, 0.8, 2.3, 0, 1, canvasTex(40, 115, malla));
    }
  }
  // la entrada de Urgencias: el hueco metido, los pilares de piedra, la cristalera, la marquesina y los letreros
  const ec = (E0 + E1) / 2, EL = E1 - E0;
  k.box(ec, 0, ZF + 0.02, EL, 3.4, 0.06, 0x5a5048);
  k.pic(ec + 1.2, 1.3, ZF + 0.06, 3.6, 2.5, 0, 1, canvasTex(144, 100, cristales('#2a2a2c', 3, 'rgba(210,220,225,.25)')), { glow: 0.15 });
  k.pic(ec - 2.4, 1.3, ZF + 0.06, 1.6, 2.5, 0, 1, canvasTex(64, 100, cristales('#2a2a2c', 1, 'rgba(210,220,225,.25)')));
  for (const s of [E0 + 1.2, E1 - 2.2]) { k.box(s, 0, ZF + 1.4, 0.8, 3.4, 0.8, 0xd8c8b0); k.block(s, ZF + 1.4, 0.8, 0.8); }
  k.box(ec, 3.4, ZF + 1.3, EL + 1.2, 0.3, 2.8, 0x2e2e30);
  k.box(ec, 3.7, ZF + 0.3, EL + 1.2, 0.1, 0.6, 0x2e2e30);
  k.pic(ec + 0.4, 2.85, ZF + 0.1, 2.8, 0.55, 0, 1, canvasTex(224, 44, urgencias));
  k.box(ec, 0, ZF + 1.4, EL - 1.0, 0.12, 2.8, 0xc8beb0);
  k.pic(E0 - 2.6, 3.7, ZF + 0.04, 3.0, 0.6, 0, 1, canvasTex(150, 30, cartel));
  // las placas de la pared: las de aparcamiento para minusválidos y la de prohibido aparcar, y la papelera verde
  for (const s of [26.0, 44.0]) k.pic(s, 2.1, ZF + 0.03, 0.75, 0.6, 0, 1, canvasTex(50, 40, placaP));
  k.cyl(62.6, 2.0, ZF + 0.04, 0.3, 0.3, 0.03, 0xc82a2a, { seg: 20, rx: Math.PI / 2 });
  k.cyl(62.6, 2.0, ZF + 0.06, 0.24, 0.24, 0.03, 0x1f4aa0, { seg: 20, rx: Math.PI / 2 });
  k.cyl(E0 - 0.6, 0, ZF + 2.6, 0.04, 0.04, 0.9, 0x6a6a68, { seg: 6 });
  k.cyl(E0 - 0.6, 0.6, ZF + 2.6, 0.22, 0.2, 0.7, 0x2e7a3e, { seg: 12 });
}

/** las puntas de la franja alta: la pared color arena por encima del resto, con una ventana por planta */
function punta(k, L) {
  k.box(L / 2, H0, Z + 0.15, L, H - H0, 0.3, ARENA);
  k.pic(L / 2, (H0 + H) / 2, ZF + 0.003, L, H - H0, 0, 1, canvasTex(Math.round(L * 12), 40, arena));
  k.box(L / 2, H - 0.2, ZF + 0.04, L, 0.2, 0.1, 0xc4ae92);
  for (const s of [L * 0.3, L * 0.7]) ventana(k, s, PLANTAS[1]);
}

/** se monta con lo demás de Valterra */
export function buildUrgenciasValterra(scene, colliders, map) {
  if (!map?.urgenciasValterra) return null;
  const grupos = [[M, 'urgenciasValterra', fachada], [PUNTA_S, 'urgenciasPuntaS', k => punta(k, PUNTA_S.len)],
    [PUNTA_N, 'urgenciasPuntaN', k => punta(k, PUNTA_N.len)]].map(([m, n, f]) => {
    const k = new Kit();
    f(k);
    const g = enMarco(k, m, n, colliders);
    scene.add(g);
    return g;
  });
  return { group: grupos[0], grupos };
}
