import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';
import { alturaBloque, cristales } from './edificioReal.js';

/**
 * El edificio de oficinas blanco de la esquina de Santa Teresa de Jesús con Venezuela (Santa Teresa 10 y Venezuela 7),
 * el de Quirón Prevención, con las vistas de la calle de Google de julio de 2025 (solo se miran, no van dentro del
 * juego; la gente no se pone). El bloque del mapa era de 4 m; de verdad es el bajo y tres plantas (13,2 m), blanco
 * con el revoco de rayas tumbadas, el zócalo de granito gris, las molduras gruesas de cada planta y el remate curvo
 * de arriba; en el bajo, los ventanales con las cortinas verticales verde agua, la puerta de cristal y la banda
 * blanca de los letreros encima (sin las marcas: la de la clínica y la de la asesoría llevan logotipo); arriba, las
 * ventanas de marco blanco y cuarterones y, en la esquina, los balcones de barandilla blanca.
 */

// las dos caras del bloque con N hacia la calle: Santa Teresa (s 0 en la esquina de Venezuela, hacia el este) y
// Venezuela (s 0 al sur, hasta la esquina)
const STT = marco([-811.96, -257.38], [-791.91, -255.56]);
const VEN = marco([-810.06, -275.87], [-811.96, -257.38]);
const Z = 0.12, ZF = Z + 0.3, YB = 4.2, TECHO = 13.2, BLANCO = 0xeeece8;

/** antes de levantar la ciudad: el bloque a su altura */
export function tuneEdificioQuiron(map) {
  const p = STT.W(8, -6);
  if (alturaBloque(map, p[0], p[1], TECHO, [238, 236, 232])) map.edificioQuiron = true;
}

// ——— lo que se pinta en lienzo ———

/** el revoco blanco con las rayas tumbadas */
function revoco(g, w, h) {
  g.fillStyle = '#eeece8';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(150,145,135,.35)';
  for (let y = 10; y < h; y += 14) g.fillRect(0, y, w, 1.5);
  g.fillStyle = 'rgba(170,120,80,.12)';
  for (let x = 30; x < w; x += 90) g.fillRect(x, 0, 6, h);
}

/** el granito gris del zócalo */
function granito(g, w, h) {
  g.fillStyle = '#a8a6a2';
  g.fillRect(0, 0, w, h);
  let s = 3;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < w * h / 30; i++) { g.fillStyle = r() < 0.5 ? 'rgba(70,70,74,.4)' : 'rgba(230,230,228,.4)'; g.fillRect(r() * w, r() * h, 1.5, 1.5); }
}

/** un ventanal del bajo con las cortinas verticales verde agua */
function ventanal(g, w, h) {
  g.fillStyle = '#9ab8b0';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(60,90,85,.35)';
  for (let x = 4; x < w; x += 7) g.fillRect(x, 0, 2, h);
  g.strokeStyle = '#f4f4f2';
  g.lineWidth = 6;
  g.strokeRect(3, 3, w - 6, h - 6);
  for (let i = 1; i < 3; i++) { g.beginPath(); g.moveTo((w / 3) * i, 0); g.lineTo((w / 3) * i, h); g.stroke(); }
}

// ——— las piezas ———

/** una cara del edificio, de largo L: el bajo, las plantas, las molduras y los balcones del lado de la esquina */
function cara(k, L, esquinaAlFinal, puertas) {
  const c = L / 2;
  k.box(c, 0, Z + 0.15, L, TECHO, 0.3, BLANCO);
  k.block(c, Z + 0.15, L, 0.3);
  k.pic(c, TECHO / 2, ZF + 0.004, L, TECHO, 0, 1, canvasTex(Math.round(L * 30), 400, revoco));
  k.pic(c, 0.55, ZF + 0.01, L, 1.1, 0, 1, canvasTex(Math.round(L * 30), 33, granito));
  // el bajo: los ventanales y las puertas de cristal
  for (let s = 1.6; s < L - 1; s += 3.6) {
    if (puertas.some(p => Math.abs(p - s) < 1)) k.pic(s, 1.25, ZF + 0.02, 1.6, 2.5, 0, 1, canvasTex(80, 125, cristales('#e8e8e4', 2, 'rgba(0,0,0,0)')));
    else k.pic(s, 1.8, ZF + 0.02, 2.6, 2.3, 0, 1, canvasTex(156, 138, ventanal));
  }
  // la banda blanca de los letreros, sin las marcas
  k.box(c, 3.2, ZF + 0.06, L - 0.4, 0.85, 0.1, 0xf4f4f2);
  // las molduras gruesas de cada planta y el remate de arriba
  for (const y of [YB, YB + 3.0, YB + 6.0]) k.box(c, y - 0.2, ZF + 0.12, L + 0.1, 0.25, 0.3, 0xe4e0d8);
  k.box(c, TECHO - 0.45, ZF + 0.15, L + 0.2, 0.45, 0.36, 0xe4e0d8);
  // las ventanas de las plantas, y los balcones en el lado de la esquina
  for (const y of [YB + 0.4, YB + 3.4, YB + 6.4]) {
    for (let s = 1.8; s < L - 1; s += 3.2) {
      const balcon = esquinaAlFinal ? s > L - 7 : s < 6;
      k.pic(s, y + 1.0, ZF + 0.012, balcon ? 1.8 : 1.4, balcon ? 2.1 : 1.3, 0, 1, canvasTex(84, 84, cristales('#f6f6f4', 2, 'rgba(200,205,215,.5)')));
      if (balcon) {
        k.box(s, y - 0.05, ZF + 0.3, 2.1, 0.14, 0.6, 0xe8e4dc);
        k.box(s, y + 1.0, ZF + 0.58, 2.1, 0.05, 0.05, 0xf4f4f2);
        for (let x = s - 1.0; x <= s + 1.01; x += 0.12) k.box(x, y + 0.08, ZF + 0.58, 0.025, 0.92, 0.025, 0xf4f4f2);
      } else k.box(s, y - 0.06, ZF + 0.05, 1.6, 0.06, 0.12, 0xe4e0d8);
    }
  }
}

/** se monta con lo demás de Arrecife Centro */
export function buildEdificioQuiron(scene, colliders, map) {
  if (!map?.edificioQuiron) return null;
  const ks = new Kit();
  cara(ks, STT.len, false, [9.0]);
  ks.cyl(0, 0, -0.1, 0.45, 0.45, TECHO, BLANCO, { seg: 12 });
  const gs = enMarco(ks, STT, 'edificioQuiron', colliders);
  scene.add(gs);
  const kv = new Kit();
  cara(kv, VEN.len, true, [12.4]);
  const gv = enMarco(kv, VEN, 'edificioQuironVenezuela', colliders);
  scene.add(gv);
  return { group: gs, venezuela: gv };
}
