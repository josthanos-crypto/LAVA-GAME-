import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';
import { alzarEdificio, cristales, medianera } from './edificioReal.js';

/**
 * La cara de la calle Aragón de la manzana de Santa Teresa de Jesús (la otra cara de src/santaTeresaNorte.js), enfrente
 * del bloque blanco de Teruel, con las vistas de la calle de Google de julio de 2025 (solo se miran, no van dentro del
 * juego; la gente no se pone). Son dos edificios: en la esquina del oeste, el moderno forrado de placas blancas en
 * cuadrícula, de tres plantas, con las ventanas oscuras de varios tamaños sueltas por la fachada y el muro bajo rojo
 * delante; y de ahí hasta la esquina de Colombia, el largo color beis de tres plantas con la cuadrícula de bandas y
 * pilastras grises, las ventanas con contraventanas marrones o de aluminio, los portales metidos con su columna de
 * granito gris y los cajetines de la luz.
 */

// la cara de Aragón, de la esquina del oeste (s 0) a la de Colombia, N hacia la calle
const AR = marco([-972.95, -234.85], [-825.35, -219.05]);
const Z = 0.12, ZF = Z + 0.3, FONDO = 12, PLACAS1 = 43, H1 = 11.5, H2 = 10.0, BEIS = 0xe0d0b8, GRIS = 0xa8a49c;

/** antes de levantar la ciudad: los dos edificios a su altura encima del bloque (que va a 7 m) */
export function tuneCalleAragon(map) {
  if (!map?.santaTeresaNorte) return;
  map.calleAragon = true;
  alzarEdificio(map, AR, 0, PLACAS1, FONDO, H1, [236, 236, 234]);
  alzarEdificio(map, AR, PLACAS1, AR.len, FONDO, H2, [224, 208, 184]);
}

// ——— lo que se pinta en lienzo ———

/** las placas blancas en cuadrícula */
function placas(g, w, h) {
  g.fillStyle = '#eceeec';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(120,124,128,.45)';
  g.lineWidth = 1.5;
  for (let x = 0; x < w; x += 24) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  for (let y = 0; y < h; y += 24) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
}

/** el muro bajo rojo de delante */
function muroRojo(g, w, h) {
  g.fillStyle = '#a8442e';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(60,20,10,.25)';
  for (let x = 0; x < w; x += 60) g.fillRect(x, 0, 2, h);
  g.fillStyle = '#d8d4cc';
  g.fillRect(0, 0, w, h * 0.08);
}

/** el revoco beis */
function revoco(g, w, h) {
  g.fillStyle = '#e0d0b8';
  g.fillRect(0, 0, w, h);
  let s = 11;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < w * h / 80; i++) { g.fillStyle = 'rgba(120,100,80,.12)'; g.fillRect(r() * w, r() * h, 2, 2); }
}

/** una ventana con las contraventanas de lamas marrones abiertas a los lados */
function contraventanas(g, w, h) {
  g.fillStyle = '#3a4048';
  g.fillRect(w * 0.25, 0, w * 0.5, h);
  g.fillStyle = 'rgba(236,232,222,.6)';
  g.fillRect(w * 0.28, 2, w * 0.44, h * 0.7);
  for (const x0 of [0, w * 0.75]) {
    g.fillStyle = '#5a3a2a';
    g.fillRect(x0, 0, w * 0.25, h);
    g.fillStyle = '#3a2418';
    for (let y = 4; y < h - 3; y += 5) g.fillRect(x0 + 2, y, w * 0.25 - 4, 2);
  }
}

// ——— las piezas ———

/** el edificio de las placas blancas: la cuadrícula, las ventanas sueltas, la entrada y el muro rojo */
function placasBlancas(k) {
  const c = PLACAS1 / 2, L = PLACAS1;
  k.box(c, 0, Z + 0.15, L, H1, 0.3, 0xeceeec);
  k.block(c, Z + 0.15, L, 0.3);
  k.pic(c, H1 / 2, ZF + 0.004, L, H1, 0, 1, canvasTex(Math.round(L * 24), Math.round(H1 * 24), placas));
  const vidrio = (s, y, w, h) => k.pic(s, y + h / 2, ZF + 0.01, w, h, 0, 1, canvasTex(Math.round(w * 40), Math.round(h * 40), cristales('#2a2c2e', w > 1 ? 2 : 1, 'rgba(160,170,180,.3)')));
  for (const y of [1.2, 4.6, 8.0]) {
    for (let s = 3; s < L - 2; s += 7) {
      vidrio(s, y, 1.6, 1.2);
      vidrio(s + 2.4, y, 0.6, 1.2);
      vidrio(s + 3.6, y, 0.6, 1.2);
    }
  }
  // la entrada metida con su barandilla, y el muro bajo rojo delante del resto
  k.box(4, 0, ZF + 0.02, 6, 2.6, 0.04, 0x2a2c2e);
  k.box(4, 1.0, ZF + 1.2, 6, 0.04, 0.04, 0xa8aaac);
  k.box((8 + L) / 2, 0, ZF + 0.6, L - 8, 1.1, 0.25, 0xa8442e);
  k.pic((8 + L) / 2, 0.55, ZF + 0.73, L - 8, 1.1, 0, 1, canvasTex(Math.round((L - 8) * 20), 22, muroRojo));
  k.block((8 + L) / 2, ZF + 0.6, L - 8, 0.25);
  medianera(k, -0.07, 7.0, H1, FONDO, Z, 0xe4e4e2);
}

/** el edificio beis: el revoco, la cuadrícula de bandas y pilastras grises, las ventanas y los portales */
function beis(k) {
  const s0 = PLACAS1, s1 = AR.len, c = (s0 + s1) / 2, L = s1 - s0;
  k.box(c, 0, Z + 0.15, L, H2, 0.3, BEIS);
  k.block(c, Z + 0.15, L, 0.3);
  k.pic(c, H2 / 2, ZF + 0.004, L, H2, 0, 1, canvasTex(Math.round(L * 10), 100, revoco));
  // las bandas de cada planta y el zócalo
  for (const y of [0, 3.3, 6.5, H2 - 0.35]) k.box(c, y, ZF + 0.06, L, 0.35, 0.12, GRIS);
  // las pilastras grises, los portales con su columna de granito y las ventanas entre ellas
  let n = 0;
  for (let s = s0 + 0.2; s < s1 - 0.5; s += 6.4, n++) {
    k.box(s, 0, ZF + 0.08, 0.45, H2, 0.16, GRIS);
    const m = s + 3.2;
    if (m > s1 - 1) break;
    if (n % 4 === 1) {
      k.box(m, 0, ZF + 0.005, 3.4, 2.8, 0.02, 0xd8c8b0);
      k.pic(m + 0.6, 1.25, ZF + 0.02, 1.0, 2.5, 0, 1, canvasTex(50, 125, cristales('#2a2c2e', 1, 'rgba(0,0,0,0)')));
      k.cyl(m - 1.4, 0, ZF + 0.9, 0.18, 0.18, 2.9, 0xa8a8a4, { seg: 10 });
      k.box(m, 2.85, ZF + 0.5, 3.4, 0.25, 1.0, 0xc8b8a0);
      k.box(m + 1.4, 0.4, ZF + 0.04, 0.9, 0.6, 0.1, 0x2a2a2c);
    } else k.pic(m, 1.75, ZF + 0.01, 1.7, 1.4, 0, 1, canvasTex(100, 84, contraventanas));
    for (const y of [4.2, 7.3]) {
      if (n % 3 === 2) k.pic(m, y + 0.65, ZF + 0.01, 1.9, 1.3, 0, 1, canvasTex(95, 65, cristales('#4a3a2e', 2, 'rgba(236,232,222,.6)')));
      else k.pic(m, y + 0.65, ZF + 0.01, 1.7, 1.3, 0, 1, canvasTex(100, 76, contraventanas));
    }
  }
  // el cable corrido por lo alto
  for (const y of [H2 - 0.15, H2 - 0.05]) k.box(c, y, ZF + 0.2, L, 0.03, 0.03, 0x2a2a2c);
  medianera(k, s0 - 0.07, 7.0, H1, FONDO, Z, 0xe4e4e2);
}

/** se monta con lo demás de Arrecife Centro */
export function buildCalleAragon(scene, colliders, map) {
  if (!map?.calleAragon) return null;
  const k = new Kit();
  placasBlancas(k);
  beis(k);
  const group = enMarco(k, AR, 'calleAragon', colliders);
  scene.add(group);
  return { group };
}
