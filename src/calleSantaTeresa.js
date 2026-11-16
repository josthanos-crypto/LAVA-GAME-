import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';
import { rebajarTramo, medianera } from './edificioReal.js';
import { casa } from './casasTampico.js';

/**
 * La cara de la calle Santa Teresa de Jesús de la manzana de Panamá y Tampico (src/casasPanama.js), con las vistas de
 * la calle de Google de julio de 2025 (solo se miran, no van dentro del juego; la gente no se pone). Es una fila de
 * casas terreras blancas de una planta (el bloque las tenía a 7 m): cada una con su puerta (verde, blanca de lamas o
 * de reja), su ventana con las contraventanas de lamas verdes o blancas, el cajetín de la luz, los manojos de cables
 * negros corridos por lo alto de la fachada, el zócalo gris y el pretil, alguno con balaustres blancos; entre ellas,
 * algún portón de garaje; y en las dos esquinas, las casas de dos y tres plantas.
 */

// la cara de Santa Teresa del bloque, de la esquina de Panamá (oeste, s 0) a la de Venezuela, N hacia la calle
const STF = marco([-908.69, -267.51], [-821.3, -258.49]);
const Z = 0.12, ZF = Z + 0.3, H = 4.4, FONDO = 7, T0 = 6, T1 = STF.len - 7;
// las terreras: [s0, s1, puerta, contraventanas, pretil de balaustres]
const TERRERAS = [];
{
  const puertas = ['verde', 'blanca', 'reja', 'verde', 'garaje', 'blanca', 'verde', 'reja', 'blanca', 'garaje', 'verde'];
  let s = T0, i = 0;
  while (s < T1 - 3) {
    const w = Math.min(T1 - s, [6.5, 7.2, 5.8, 6.8][i % 4]);
    TERRERAS.push([s, s + w, puertas[i % puertas.length], i % 3 ? 'verde' : 'blanca', i % 4 === 1]);
    s += w;
    i++;
  }
}

/** antes de levantar la ciudad: la fila de terreras metida en el bloque, a su altura */
export function tuneCalleSantaTeresa(map) {
  if (!map?.casasPanama) return;
  if (rebajarTramo(map, STF, T0, T1, FONDO, H, undefined, [242, 242, 238])) map.calleSantaTeresa = true;
}

// ——— lo que se pinta en lienzo ———

/** las contraventanas de lamas, cerradas */
function contraventanas(color) {
  return (g, w, h) => {
    g.fillStyle = color;
    g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(0,0,0,.28)';
    for (let y = 6; y < h - 4; y += 6) g.fillRect(5, y, w - 10, 2);
    g.strokeStyle = 'rgba(0,0,0,.35)';
    g.lineWidth = 4;
    g.strokeRect(2, 2, w - 4, h - 4);
    g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke();
  };
}

/** una puerta de terrera: verde de cuarterones, blanca de lamas, de reja blanca o el portón de garaje */
function puerta(tipo) {
  return (g, w, h) => {
    const col = { verde: '#2a6a46', blanca: '#eeeeea', reja: '#3a4a50', garaje: '#ecebe6' }[tipo];
    g.fillStyle = col;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = tipo === 'verde' ? '#1e4a32' : 'rgba(0,0,0,.25)';
    g.lineWidth = 4;
    if (tipo === 'verde') { g.beginPath(); g.arc(w / 2, h * 0.2, w * 0.3, Math.PI, 0); g.stroke(); for (const y of [0.32, 0.6]) g.strokeRect(w * 0.18, h * y, w * 0.64, h * 0.22); }
    else if (tipo === 'reja') { g.fillStyle = '#f0f0ec'; for (let x = w * 0.1; x < w; x += w / 7) g.fillRect(x, 0, w * 0.04, h); g.fillRect(0, h * 0.5, w, h * 0.03); }
    else if (tipo === 'blanca') for (let y = 8; y < h; y += 8) { g.beginPath(); g.moveTo(4, y); g.lineTo(w - 4, y); g.stroke(); }
    else for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo((w / 4) * i, 0); g.lineTo((w / 4) * i, h); g.stroke(); }
    g.strokeRect(2, 2, w - 4, h - 4);
  };
}

// ——— las piezas ———

/** una terrera: la pared, el zócalo, la puerta, la ventana, el cajetín, los cables y el pretil */
function terrera(k, s0, s1, tipo, cv, balaustres, n) {
  const c = (s0 + s1) / 2, L = s1 - s0;
  k.box(c, 0, Z + 0.15, L, H, 0.3, n % 2 ? 0xf4f4f0 : 0xeeeeea);
  k.block(c, Z + 0.15, L, 0.3);
  k.box(c, 0, ZF + 0.005, L, 0.8, 0.02, 0x9a9c9e);
  const garaje = tipo === 'garaje', wp = garaje ? 2.8 : 1.0, hp = garaje ? 2.5 : 2.2, sp = garaje ? c : s0 + L * 0.62;
  k.pic(sp, hp / 2, ZF + 0.012, wp, hp, 0, 1, canvasTex(Math.round(wp * 50), 120, puerta(tipo)));
  if (!garaje) {
    k.pic(s0 + L * 0.28, 1.6, ZF + 0.014, 1.2, 1.3, 0, 1, canvasTex(72, 78, contraventanas(cv === 'verde' ? '#2a7a4a' : '#e4e4e0')));
    k.box(s0 + L * 0.28, 0.9, ZF + 0.05, 1.35, 0.06, 0.1, 0xe8e6e0);
  }
  k.box(s0 + L * 0.45, 2.7, ZF + 0.08, 0.35, 0.45, 0.14, 0xe4e2da);
  for (const y of [3.45, 3.55, 3.62]) k.box(c, y, ZF + 0.04 + (y - 3.4), L, 0.05, 0.05, 0x1c1c1e);
  k.box(c, H - 0.25, ZF + 0.08, L + 0.02, 0.25, 0.16, 0xe8e6e0);
  if (balaustres) {
    k.box(c, H, Z + 0.15, L * 0.6, 0.12, 0.3, 0xeeeeea);
    for (let x = c - L * 0.3 + 0.2; x < c + L * 0.3; x += 0.32) k.cyl(x, H + 0.12, Z + 0.15, 0.07, 0.09, 0.6, 0xf0f0ec, { seg: 8 });
    k.box(c, H + 0.72, Z + 0.15, L * 0.6, 0.1, 0.32, 0xeeeeea);
  }
}

/** se monta con lo demás de Arrecife Centro */
export function buildCalleSantaTeresa(scene, colliders, map) {
  if (!map?.calleSantaTeresa) return null;
  const k = new Kit();
  // las casas de las esquinas, de dos y tres plantas (la de Venezuela con la placa de la calle)
  casa(k, 0, T0, 7.0, 2, 0xe8c8b8, 'blanca', 'puerta', 2);
  casa(k, T1, STF.len, 9.6, 3, 0xf2f2ee, 'ninguna', 'puerta', 5);
  k.box(STF.len - 1.2, 2.3, ZF + 0.03, 0.6, 0.4, 0.02, 0x1e4a9a);
  TERRERAS.forEach(([s0, s1, tipo, cv, b], i) => terrera(k, s0, s1, tipo, cv, b, i));
  // las paredes lisas de las esquinas que asoman por encima de las terreras, y la de detrás de las terreras
  medianera(k, T0 + 0.07, H, 7.0, FONDO, Z, 0xe8e6e0);
  medianera(k, T1 - 0.07, H, 9.6, FONDO, Z, 0xe8e6e0);
  k.box((T0 + T1) / 2, H, -FONDO - 0.07, T1 - T0, 7.0 - H, 0.12, 0xe8e6e0);
  const group = enMarco(k, STF, 'calleSantaTeresa', colliders);
  scene.add(group);
  return { group };
}
