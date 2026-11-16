import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, hueco } from './restaurantesCharco.js';
import { cristales } from './edificioReal.js';
import { ZF, BLANCO, pared, pretil, tira } from './rapadurasSur.js';

/**
 * El Snack Bar El Túnel (calle León y Castillo 171, Altavista) y su manzana de la esquina con la calle Padre Claret,
 * con las fotos del sitio de 2018 y 2019 (de dentro), las vistas de la calle de Google de julio de 2025 (desde la LZ-1 y
 * desde Padre Claret 1) y la foto aérea de GRAFCAN (solo se miran, no van dentro del juego). En el mapa era el bloque
 * genérico de 4 m de toda la manzana. De verdad:
 * - la casa crema del bar, de dos plantas y la azotea: abajo, el aplacado de piedra gris, el portón de madera del bar
 *   con el toldo beige (abierto, con la cueva de piedra, las vigas y la barra de dentro, como en las fotos del bar), el
 *   portal blanco del 171 y la oficina de CaixaBank con la franja azul oscuro (solo el nombre, sin el dibujo de la marca)
 *   y los cajeros de aro amarillo; encima, la cornisa blanca, los cuerpos salientes con las balconeras de barandilla
 *   blanca y, arriba, las terrazas de balaustrada blanca;
 * - la casa de la esquina, más alta, con la esquina redonda: abajo, el granito rosa, la tienda Hobby Arte («TU TIENDA DE
 *   MANUALIDADES») y las cristaleras altas de la Floristería El Trébol, con su letrero, las letras «FLORISTERÍA» y la
 *   puerta de cristal por Padre Claret, y el portal blanco; arriba, las balconeras, las cornisas y la balaustrada.
 * Medido otra vez con el foco bueno de las capturas (475 px): la esquina de verdad está 1,9 m más al norte que la del
 * bloque del mapa (cuadra con la calle Padre Claret de la foto aérea) y la casa del bar llega a 25 m de la esquina, con
 * CaixaBank, sus cajeros y las balconeras de arriba más al sur. La cara de Padre Claret de la casa de la esquina, medida
 * también con el foco bueno (vistas de Padre Claret 1 de julio de 2025) y con el plano del Catastro: la casa sigue por
 * Padre Claret hasta la calle Fray Luis de León (25,3 m), con la floristería, el portal y la escalera, la tienda blanca
 * de los escaparates grandes, las balconeras, las balaustradas y la tercera planta metida; la del bar llega también
 * hasta esa calle por detrás, con su cara de Fray Luis de León (vistas de Fray Luis de León 59 y 48): el portón de
 * madera, el portal 50, la oficina de CaixaBank con su cajero, el portal 48, las rejillas, la cornisa y las balconeras.
 */

// la esquina del bloque del mapa y sus dos lados: por León y Castillo hacia el sur (US) y por Padre Claret hacia el oeste (UW)
const C_MAPA = [378.37, -1299.89];
const US = [-0.166579, 0.98603], UW = [-0.98605, -0.166412];
// la esquina de verdad, 1,9 m más al norte que la del bloque del mapa
const C = [C_MAPA[0] - US[0] * 1.9, C_MAPA[1] - US[1] * 1.9];
const en = (a, b) => [C[0] + US[0] * a + UW[0] * b, C[1] + US[1] * a + UW[1] * b];
// la casa de la esquina: 7 m por León y Castillo, con la esquina redonda de 1,5 m de radio; la casa del bar, de 7 a
// 25 m de la esquina por León y Castillo, y 10,5 m de fondo por delante
const R = 1.5, ESQ = 7.0, FIN = 25.0, FONDO = 10.5;
const ALTO_E = 9.9, ALTO_C = 9.4;
// por Padre Claret la casa de la esquina llega a la calle Fray Luis de León, y la del bar también por detrás
const FONDO_PC = 25.3, ALTO3 = 12.6;
const C1 = en(R, 0), C2 = en(0, R), P7 = en(ESQ, 0), PS = en(FIN, 0), I7 = en(ESQ, FONDO), IS = en(FIN, FONDO);
const PW = en(0, FONDO_PC), IO = en(ESQ, FONDO_PC), IW = en(FIN, FONDO_PC);
// por donde el bloque del mapa pierde la esquina: su lado de Padre Claret, a 10,5 m de su esquina
const PO_MAPA = [C_MAPA[0] + UW[0] * FONDO, C_MAPA[1] + UW[1] * FONDO];
// las caras: la del bar (s del sur al norte: s = 25 − lo que hay hasta la esquina), la de la esquina por León y
// Castillo (s = 7 − lo que hay hasta la esquina) y la de Padre Claret (s = lo que hay hasta la esquina − 1,5)
const FL = marco(PS, P7);
const FE = marco(P7, C1);
const FP = marco(C2, PW);

const CREMA = 0xead7a8, MOLDURA = 0xf1ead8, ROSA = 0xc39a8b, OSCURO = 0x3e3c3a, MADERA_OSC = 0x3a2618;

/** antes de levantar la ciudad: la esquina sale del bloque de 4 m y van las dos casas a su altura */
export function tuneTunelAltavista(map) {
  if (!Array.isArray(map?.buildings)) return;
  const d = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
  const r = q => [+q[0].toFixed(2), +q[1].toFixed(2)];
  const b = map.buildings.find(q => !q.skip && !q.edificioReal && Array.isArray(q.p) && q.p.some(p => d(p, C_MAPA) < 0.3));
  if (!b) return;
  const i = b.p.findIndex(p => d(p, C_MAPA) < 0.3);
  const n = b.p.length, cerrado = d(b.p[0], b.p[n - 1]) < 0.01;
  const antes = b.p[i > 0 ? i - 1 : (cerrado ? n - 2 : n - 1)];
  const nuevo = (d(antes, PO_MAPA) < d(antes, PS) ? [PO_MAPA, IS, PS] : [PS, IS, PO_MAPA]).map(r);
  b.p.splice(i, 1, ...nuevo);
  if (cerrado && i === 0) b.p[b.p.length - 1] = nuevo[0].slice();
  const casa = (pts, h) => {
    const p = pts.map(r);
    p.push(p[0].slice());
    map.buildings.push({ p, h, k: 'gen', s: 0, f: [234, 215, 168], c: [206, 202, 194], edificioReal: true });
  };
  casa([C1, P7, IO, PW, C2], ALTO_E);
  casa([P7, PS, IS, I7], ALTO_C);
  casa([I7, IS, IW, IO], ALTO_C);
  map.tunelAltavista = true;
}

// ——— las texturas ———

const liso = color => (g, w, h) => { g.fillStyle = color; g.fillRect(0, 0, w, h); };

/** el aplacado de piedra gris de la planta baja de la casa del bar */
function piedraGris(g, w, h) {
  g.fillStyle = '#76716a';
  g.fillRect(0, 0, w, h);
  let sd = 13;
  const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  const bw = 14, bh = 10;
  for (let y = 0, f = 0; y < h; y += bh, f++) {
    for (let x = (f % 2) * -bw / 2; x < w; x += bw) {
      const t = Math.round(-10 + rnd() * 20);
      g.fillStyle = `rgb(${118 + t},${113 + t},${106 + t})`;
      g.fillRect(x + 1, y + 1, bw - 1, bh - 1);
    }
  }
}

/** el granito rosa de la casa de la esquina, en placas */
function granitoRosa(g, w, h) {
  g.fillStyle = '#c39a8b';
  g.fillRect(0, 0, w, h);
  let sd = 29;
  const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < w * h / 30; i++) {
    g.fillStyle = rnd() < 0.5 ? 'rgba(120,80,70,.35)' : 'rgba(240,215,205,.35)';
    g.fillRect(rnd() * w, rnd() * h, 1.5, 1.5);
  }
  g.strokeStyle = 'rgba(110,80,70,.5)';
  g.lineWidth = 1;
  for (let x = 14; x < w; x += 14) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  for (let y = 10; y < h; y += 10) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
}

/** por el portón abierto: la cueva de piedra con las vigas, el suelo de madera y la barra iluminada del fondo */
function tunel(g, w, h) {
  g.fillStyle = '#17110d';
  g.fillRect(0, 0, w, h);
  const fx0 = w * 0.3, fx1 = w * 0.7, fy0 = h * 0.28, fy1 = h * 0.74;
  const luz = g.createLinearGradient(0, fy0, 0, fy1);
  luz.addColorStop(0, '#6a4a30');
  luz.addColorStop(1, '#d0a060');
  g.fillStyle = luz;
  g.fillRect(fx0, fy0, fx1 - fx0, fy1 - fy0);
  const colores = ['#2f6a3a', '#8a2a22', '#c8a040', '#e8e0c8', '#3a5a8a'];
  for (let i = 0; i < 12; i++) {
    g.fillStyle = colores[i % 5];
    g.fillRect(fx0 + 5 + i * ((fx1 - fx0 - 10) / 12), fy0 + (fy1 - fy0) * 0.22, 3.5, 11);
  }
  g.fillStyle = '#3a2416';
  g.fillRect(fx0 - w * 0.05, fy0 + (fy1 - fy0) * 0.6, (fx1 - fx0) * 0.78, (fy1 - fy0) * 0.4);
  g.fillStyle = '#7a5434';
  g.fillRect(fx0 - w * 0.05, fy0 + (fy1 - fy0) * 0.58, (fx1 - fx0) * 0.78, 3);
  // las paredes de piedra de cueva, a los dos lados
  let sd = 7;
  const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  g.fillStyle = '#625e4c';
  for (const [x0, x1] of [[0, fx0], [w, fx1]]) {
    g.beginPath(); g.moveTo(x0, 0); g.lineTo(x1, fy0); g.lineTo(x1, fy1); g.lineTo(x0, h); g.closePath(); g.fill();
  }
  const manchas = ['#76725c', '#4e4a3e', '#867f66', '#5c6250', '#6c6c5a'];
  for (let i = 0; i < 90; i++) {
    const izq = rnd() < 0.5, t = rnd();
    const x = izq ? t * fx0 : w - t * (w - fx1);
    const y0 = t * fy0, y1 = h - t * (h - fy1);
    g.fillStyle = manchas[i % 5];
    g.beginPath();
    g.ellipse(x, y0 + rnd() * (y1 - y0), 3 + rnd() * 8, 2 + rnd() * 6, rnd() * 3, 0, Math.PI * 2);
    g.fill();
  }
  // el techo de vigas de madera
  g.fillStyle = '#2e2016';
  g.beginPath(); g.moveTo(0, 0); g.lineTo(w, 0); g.lineTo(fx1, fy0); g.lineTo(fx0, fy0); g.closePath(); g.fill();
  g.strokeStyle = '#5a3c26';
  g.lineWidth = 3;
  for (let i = 1; i < 6; i++) {
    const t = i / 6;
    g.beginPath(); g.moveTo(t * fx0, t * fy0); g.lineTo(w - t * (w - fx1), t * fy0); g.stroke();
  }
  // el suelo de madera
  g.fillStyle = '#5e3e28';
  g.beginPath(); g.moveTo(0, h); g.lineTo(w, h); g.lineTo(fx1, fy1); g.lineTo(fx0, fy1); g.closePath(); g.fill();
  g.strokeStyle = '#3a2416';
  g.lineWidth = 1.5;
  for (let i = 0; i <= 8; i++) {
    g.beginPath(); g.moveTo(fx0 + (fx1 - fx0) * i / 8, fy1); g.lineTo(w * i / 8, h); g.stroke();
  }
  // las dos hojas de madera del portón, abiertas hacia dentro
  for (const lado of [0, 1]) {
    const x0 = lado ? w : 0, x1 = lado ? w * 0.85 : w * 0.15;
    g.fillStyle = '#5a3a26';
    g.beginPath(); g.moveTo(x0, 0); g.lineTo(x1, h * 0.1); g.lineTo(x1, h * 0.9); g.lineTo(x0, h); g.closePath(); g.fill();
    g.strokeStyle = '#3e2818';
    g.lineWidth = 1.2;
    for (let k = 1; k < 6; k++) {
      const t = k / 6, x = x0 + (x1 - x0) * t;
      g.beginPath(); g.moveTo(x, h * 0.1 * t); g.lineTo(x, h - h * 0.1 * t); g.stroke();
    }
  }
}

/** una puerta de aluminio blanco de dos hojas con cristal */
function puertaAluminio(g, w, h) {
  g.fillStyle = '#f0f0ec';
  g.fillRect(0, 0, w, h);
  for (const x0 of [0.08, 0.54]) {
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, '#4a5560');
    gr.addColorStop(1, '#262c32');
    g.fillStyle = gr;
    g.fillRect(w * x0, h * 0.04, w * 0.38, h * 0.92);
    g.fillStyle = 'rgba(255,255,255,.12)';
    g.fillRect(w * (x0 + 0.05), h * 0.06, w * 0.06, h * 0.88);
  }
}

/** la puerta blanca de cuarterones del portal */
function puertaPortal(g, w, h) {
  g.fillStyle = '#f2f2ee';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#d4d4ce';
  g.lineWidth = 3;
  for (const [y0, y1] of [[0.06, 0.3], [0.36, 0.6], [0.66, 0.94]]) g.strokeRect(w * 0.15, h * y0, w * 0.7, h * (y1 - y0));
  g.fillStyle = '#9a9a96';
  g.fillRect(w * 0.78, h * 0.5, w * 0.08, h * 0.03);
}

/** un rótulo de una línea */
function rotulo(texto, color, fondo, { peso = 'bold', serif = false, italica = false, alto = 0.66 } = {}) {
  return (g, w, h) => {
    g.fillStyle = fondo;
    g.fillRect(0, 0, w, h);
    g.fillStyle = color;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.font = `${italica ? 'italic ' : ''}${peso} ${Math.round(h * alto)}px ${serif ? 'Georgia, "Times New Roman", serif' : 'Arial, sans-serif'}`;
    g.fillText(texto, w / 2, h * 0.54, w * 0.94);
  };
}

/** la puerta de Hobby Arte con sus carteles: «HOBBY» y «ARTE» a la izquierda, la H y la A en las hojas */
function hobbyPuerta(g, w, h) {
  g.fillStyle = '#f0f0ec';
  g.fillRect(0, 0, w, h);
  const vertical = (letras, x, y0, y1, color) => {
    g.fillStyle = color;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    const paso = (y1 - y0) / letras.length;
    g.font = `bold ${Math.round(paso * 0.9)}px Arial, sans-serif`;
    [...letras].forEach((l, i) => g.fillText(l, x, y0 + paso * (i + 0.5)));
  };
  // a la izquierda, el cartel de «HOBBY» y «ARTE»
  g.fillStyle = '#e04a7a'; g.fillRect(w * 0.03, h * 0.04, w * 0.22, h * 0.5);
  g.fillStyle = '#c8325e'; g.fillRect(w * 0.03, h * 0.56, w * 0.22, h * 0.4);
  vertical('HOBBY', w * 0.14, h * 0.06, h * 0.52, '#fff2f6');
  vertical('ARTE', w * 0.14, h * 0.58, h * 0.94, '#fff2f6');
  // las dos hojas con los carteles amarillos de la H y la A
  for (const [x0, l] of [[0.28, 'H'], [0.51, 'A']]) {
    g.fillStyle = '#f2c232'; g.fillRect(w * x0, h * 0.04, w * 0.21, h * 0.58);
    g.fillStyle = '#e89a2a'; g.fillRect(w * x0, h * 0.64, w * 0.21, h * 0.32);
    g.fillStyle = '#1a1a1a';
    g.font = `bold ${Math.round(h * 0.2)}px Arial, sans-serif`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(l, w * (x0 + 0.105), h * 0.36);
  }
  g.fillStyle = '#2a2a2a';
  g.fillRect(w * 0.485, h * 0.5, w * 0.01, h * 0.1);
  g.fillRect(w * 0.505, h * 0.5, w * 0.01, h * 0.1);
  // a la derecha, los carteles rojos y rosas
  g.fillStyle = '#e05a3a'; g.fillRect(w * 0.75, h * 0.04, w * 0.22, h * 0.5);
  g.fillStyle = '#c8325a'; g.fillRect(w * 0.75, h * 0.56, w * 0.22, h * 0.4);
}

/** la lona de encima de Hobby Arte */
function manualidades(g, w, h) {
  const gr = g.createLinearGradient(0, 0, w, 0);
  gr.addColorStop(0, '#3a2a6a');
  gr.addColorStop(0.5, '#7a2a7a');
  gr.addColorStop(1, '#c03a8a');
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#ffd6ea';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `bold ${Math.round(h * 0.36)}px Georgia, serif`;
  g.fillText('TU TIENDA DE MANUALIDADES', w / 2, h * 0.45, w * 0.8);
  g.fillStyle = 'rgba(255,255,255,.7)';
  g.fillRect(w * 0.12, h * 0.74, w * 0.76, h * 0.06);
}

/** la cortina azul de la ventana de encima de Hobby Arte */
function cortinaAzul(g, w, h) {
  g.fillStyle = '#4a4e9c';
  g.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += 10) {
    g.fillStyle = 'rgba(30,30,80,.35)';
    g.fillRect(x, 0, 3, h);
    g.fillStyle = 'rgba(160,170,230,.18)';
    g.fillRect(x + 5, 0, 2, h);
  }
}

/** un portón de madera de tablas con los clavos y las riostras */
function portonMadera(g, w, h) {
  g.fillStyle = '#a86a40';
  g.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += 9) {
    g.fillStyle = (x / 9) % 2 ? 'rgba(0,0,0,.12)' : 'rgba(255,220,180,.08)';
    g.fillRect(x, 0, 8, h);
    g.fillStyle = 'rgba(40,20,10,.5)';
    g.fillRect(x + 8, 0, 1, h);
  }
  g.strokeStyle = 'rgba(60,34,18,.7)';
  g.lineWidth = Math.max(3, w * 0.02);
  for (const [x0, x1] of [[0.02, 0.49], [0.51, 0.98]]) {
    g.beginPath(); g.moveTo(w * x0, h * 0.95); g.lineTo(w * x1, h * 0.05); g.stroke();
  }
  g.fillStyle = '#2a1a10';
  g.fillRect(w * 0.495, 0, w * 0.01, h);
  for (let y = h * 0.08; y < h; y += h * 0.12) for (let x = w * 0.06; x < w; x += w * 0.11) g.fillRect(x, y, 2, 2);
}

/** un portal blanco de dos hojas con los cristales oscuros */
function portalDoble(g, w, h) {
  g.fillStyle = '#f0f0ec';
  g.fillRect(0, 0, w, h);
  for (const x0 of [0.1, 0.3, 0.56, 0.76]) {
    g.fillStyle = '#20242a';
    g.fillRect(w * x0, h * 0.05, w * 0.14, h * 0.68);
  }
  g.strokeStyle = '#d0d0ca';
  g.lineWidth = 2;
  for (const x0 of [0.06, 0.53]) g.strokeRect(w * x0, h * 0.78, w * 0.41, h * 0.18);
  g.fillStyle = '#c8c8c4';
  g.fillRect(w * 0.495, 0, w * 0.01, h);
}

/** una rejilla de ventilación de lamas */
function rejilla(g, w, h) {
  g.fillStyle = '#ece4d0';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#8a8070';
  for (let y = 3; y < h - 2; y += 5) g.fillRect(3, y, w - 6, 2);
  g.strokeStyle = '#d6ccb4';
  g.lineWidth = 2;
  g.strokeRect(1, 1, w - 2, h - 2);
}

/** el letrero de la floristería de la esquina */
function trebol(g, w, h) {
  g.fillStyle = '#f6f4ec';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#7aa86a';
  g.lineWidth = 3;
  g.strokeRect(3, 3, w - 6, h - 6);
  g.fillStyle = '#3d7a3a';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `italic bold ${Math.round(h * 0.4)}px Georgia, "Times New Roman", serif`;
  g.fillText('Floristería El Trébol', w / 2, h * 0.42, w * 0.86);
  g.font = `italic ${Math.round(h * 0.2)}px Georgia, serif`;
  g.fillText('Detalles que enamoran', w / 2, h * 0.78, w * 0.7);
  g.fillStyle = '#5a9a4a';
  for (const x of [w * 0.05, w * 0.95]) {
    for (let i = 0; i < 3; i++) {
      g.beginPath();
      g.ellipse(x, h * (0.3 + i * 0.2), w * 0.018, h * 0.08, i - 1, 0, Math.PI * 2);
      g.fill();
    }
  }
}

// ——— las piezas ———

/** una balconera con su barandilla blanca de barrotes */
function balconera(k, s, y, w, h, z) {
  hueco(k, s, y, w, h, canvasTex(Math.round(w * 50), Math.round(h * 50), cristales('#f2f2ee', 2, 'rgba(235,232,225,.6)')), { borde: 0xf2f2ee, z });
  const zr = z + 0.14;
  k.box(s, y + 0.95, zr, w + 0.1, 0.05, 0.05, BLANCO);
  k.box(s, y + 0.06, zr, w + 0.1, 0.04, 0.05, BLANCO);
  for (let x = -w / 2; x <= w / 2 + 0.01; x += 0.11) k.box(s + x, y + 0.06, zr, 0.025, 0.9, 0.025, BLANCO);
}

/** una ventana pequeña de aluminio blanco */
function ventanita(k, s, y, w, h, z) {
  hueco(k, s, y, w, h, canvasTex(Math.round(w * 60), Math.round(h * 60), cristales('#f2f2ee', 2)), { borde: 0xf2f2ee, z });
}

/** una balaustrada blanca (sin choques: va en alto) */
function balaustres(k, s0, s1, y, z) {
  const c = (s0 + s1) / 2, w = s1 - s0;
  k.box(c, y, z, w, 0.12, 0.24, MOLDURA);
  k.box(c, y + 0.82, z, w + 0.04, 0.1, 0.28, MOLDURA);
  for (let s = s0 + 0.1; s < s1 - 0.05; s += 0.2) k.cyl(s, y + 0.12, z, 0.05, 0.075, 0.7, 0xf4f0e4, { seg: 7 });
  for (let s = s0; s <= s1 + 0.01; s += Math.max(1, w / Math.ceil(w / 2.2))) k.box(s, y + 0.12, z, 0.24, 0.7, 0.24, MOLDURA);
}

/** un cajero con su aro amarillo */
function cajero(k, s, y, z) {
  k.cyl(s, y, z, 0.42, 0.42, 0.1, 0xf2b81c, { seg: 28, rx: Math.PI / 2 });
  k.cyl(s, y, z + 0.1, 0.33, 0.33, 0.01, 0x2a2c30, { seg: 28, rx: Math.PI / 2 });
  k.box(s, y - 0.12, z + 0.11, 0.3, 0.3, 0.03, 0x8a9096);
  k.box(s, y - 0.28, z + 0.12, 0.26, 0.08, 0.06, 0x5a5e62);
}

/** la casa del bar por León y Castillo */
function caraBar(k) {
  const L = FL.len, s = sc => FIN - sc;
  pared(k, 0, L, ALTO_C, liso('#ead7a8'));
  // abajo: el aplacado de piedra gris
  k.box(L / 2, 0, ZF + 0.03, L, 3.4, 0.06, 0x76716a);
  k.pic(L / 2, 1.7, ZF + 0.062, L, 3.4, 0, 1, canvasTex(Math.round(L * 24), 82, piedraGris));
  for (const [a, b] of [[7.0, 7.4], [10.65, 11.05]]) k.box((s(a) + s(b)) / 2, 0, ZF + 0.12, b - a, 3.4, 0.14, OSCURO);
  // el portón del bar, abierto, con el toldo beige
  const bar = (s(7.4) + s(10.65)) / 2;
  hueco(k, bar, 0, 3.25, 2.8, canvasTex(260, 224, tunel), { borde: MADERA_OSC, z: ZF + 0.07 });
  k.box(bar, 2.86, ZF + 0.07, 3.25, 0.54, 0.05, 0x2e2a26);
  k.box(bar, 3.02, ZF + 0.5, 3.35, 0.07, 0.86, 0xc4baa4);
  k.box(bar, 2.8, ZF + 0.92, 3.35, 0.24, 0.04, 0xbcb29c);
  // el portal blanco del 171
  const portal = (s(11.05) + s(12.35)) / 2;
  hueco(k, portal, 0, 1.3, 2.5, canvasTex(78, 150, puertaAluminio), { borde: 0xf0f0ec, z: ZF + 0.07 });
  k.pic(portal, 2.9, ZF + 0.08, 0.45, 0.22, 0, 1, canvasTex(90, 44, rotulo('171', '#2e2e2e', '#8a857e')));
  // CaixaBank: la franja azul oscuro con el nombre, los escaparates, la puerta y los cajeros
  k.box((s(12.6) + s(FIN)) / 2, 2.78, ZF + 0.12, FIN - 12.6, 0.5, 0.1, 0x1c2433);
  k.pic(s(15.2), 3.03, ZF + 0.175, 2.6, 0.4, 0, 1, canvasTex(312, 48, rotulo('CaixaBank', '#ffffff', '#1c2433', { peso: 'normal', serif: true, alto: 0.8 })));
  const vidrio = (sc0, sc1, y, h) => hueco(k, (s(sc0) + s(sc1)) / 2, y, sc1 - sc0, h, canvasTex(Math.round((sc1 - sc0) * 50), Math.round(h * 50), cristales('#d8dadc', 2, 'rgba(60,70,80,.3)')), { borde: 0xd8dadc, z: ZF + 0.07 });
  vidrio(13.25, 15.2, 0.25, 2.4);
  vidrio(15.45, 16.2, 0, 2.6);
  hueco(k, s(18.1), 0.25, 1.7, 2.4, canvasTex(85, 120, liso('#22262c')), { borde: 0xd8dadc, z: ZF + 0.07 });
  cajero(k, s(18.1), 1.35, ZF + 0.1);
  hueco(k, s(20.5), 0, 1.3, 2.4, canvasTex(78, 144, puertaPortal), { borde: 0xf0f0ec, z: ZF + 0.07 });
  for (const sc of [22.6, 23.9]) cajero(k, s(sc), 1.35, ZF + 0.07);
  // la cornisa blanca de encima de la planta baja
  k.box(L / 2, 3.3, ZF + 0.15, L, 0.1, 0.3, MOLDURA);
  k.box(L / 2, 3.4, ZF + 0.22, L, 0.45, 0.45, MOLDURA);
  // la planta de arriba: los tres cuerpos salientes con las balconeras, y las ventanitas de los entrantes
  for (const [a, b] of [[7.0, 11.1], [12.4, 19.2], [21.8, FIN]]) {
    const c = (s(a) + s(b)) / 2, w = b - a;
    k.box(c, 3.85, ZF + 0.175, w, 2.75, 0.35, CREMA);
    k.box(c, 6.6, ZF + 0.27, w + 0.1, 0.3, 0.55, MOLDURA);
    balaustres(k, s(b) + 0.05, s(a) - 0.05, 6.9, ZF + 0.42);
  }
  for (const [sc, w] of [[9.1, 1.9], [14.4, 1.8], [17.85, 1.8], [23.4, 1.8]]) balconera(k, s(sc), 4.2, w, 2.0, ZF + 0.35);
  for (const sc of [11.75, 20.5]) {
    ventanita(k, s(sc), 4.9, 0.66, 0.8, ZF);
    ventanita(k, s(sc), 7.3, 0.6, 0.7, ZF);
  }
  // la planta de la azotea, detrás de las balaustradas
  hueco(k, s(9.2), 6.9, 0.9, 2.0, canvasTex(54, 120, cristales('#f2f2ee', 1)), { borde: 0xf2f2ee, z: ZF });
  ventanita(k, s(15.3), 7.5, 1.2, 1.1, ZF);
  ventanita(k, s(23.4), 7.5, 1.0, 1.1, ZF);
  pretil(k, 0, L, ALTO_C);
  // las antenas de la azotea
  for (const sc of [9.0, 16.5]) {
    k.cyl(s(sc), ALTO_C, -2.0, 0.025, 0.025, 2.2, 0x8a8a88, { seg: 5 });
    k.box(s(sc), ALTO_C + 1.7, -2.0, 0.9, 0.03, 0.03, 0x8a8a88);
  }
}

/** la casa de la esquina por León y Castillo: Hobby Arte y la cristalera de la floristería */
function caraEsquinaLyC(k) {
  const L = FE.len, s = sc => ESQ - sc;
  pared(k, 0, L, ALTO_E, liso('#ead7a8'));
  // el granito rosa de Hobby Arte y el zócalo de la cristalera
  k.box(s(5.1), 0, ZF + 0.03, 3.8, 3.4, 0.06, ROSA);
  k.pic(s(5.1), 1.7, ZF + 0.062, 3.8, 3.4, 0, 1, canvasTex(92, 82, granitoRosa));
  k.box(s(2.35), 0, ZF + 0.03, 1.7, 0.9, 0.06, ROSA);
  k.pic(s(2.35), 0.45, ZF + 0.062, 1.7, 0.9, 0, 1, canvasTex(42, 22, granitoRosa));
  // Hobby Arte: la puerta con los carteles, la lona de encima y la ventana de la cortina azul
  hueco(k, s(5.0), 0, 3.0, 2.7, canvasTex(240, 216, hobbyPuerta), { borde: 0xf0f0ec, z: ZF + 0.07 });
  k.pic(s(5.0), 3.05, ZF + 0.1, 3.2, 0.55, 0, 1, canvasTex(320, 55, manualidades));
  hueco(k, s(5.0), 3.7, 3.0, 2.3, canvasTex(150, 115, cortinaAzul), { borde: 0xf0f0ec, z: ZF });
  // la cristalera alta de la floristería
  hueco(k, s(2.4), 0.9, 1.6, 2.6, canvasTex(80, 130, cristales('#f0f0ec', 1, 'rgba(230,236,240,.25)')), { borde: 0xf0f0ec, z: ZF });
  hueco(k, s(2.4), 3.65, 1.6, 2.35, canvasTex(80, 118, cristales('#f0f0ec', 1, 'rgba(60,70,80,.2)')), { borde: 0xf0f0ec, z: ZF });
  // las cornisas, la balconera de arriba y la balaustrada de la azotea
  k.box(L / 2, 6.6, ZF + 0.25, L, 0.4, 0.5, MOLDURA);
  balconera(k, s(4.5), 7.4, 1.3, 1.7, ZF);
  k.box(L / 2, 9.6, ZF + 0.2, L, 0.3, 0.4, MOLDURA);
  balaustres(k, 0.1, L, ALTO_E, ZF + 0.1);
}

/** la casa de la esquina por Padre Claret, hasta Fray Luis de León (sc: lo que hay hasta la cara de León y Castillo):
 * la floristería, el portal y la escalera, la tienda blanca de los escaparates grandes y, arriba, las balconeras, las
 * cornisas, las balaustradas, la torre de la escalera y la tercera planta metida */
function caraEsquinaClaret(k) {
  const L = FP.len, s = sc => sc - R;
  const c = (a, b) => (s(a) + s(b)) / 2;
  const vidrio = (a, b, y, h, hojas, oscuro) => hueco(k, c(a, b), y, b - a, h, canvasTex(Math.round((b - a) * 50), Math.round(h * 50),
    cristales('#f0f0ec', hojas, oscuro ? 'rgba(60,70,80,.2)' : 'rgba(230,236,240,.25)')), { borde: 0xf0f0ec, z: ZF });
  pared(k, 0, L, ALTO_E, liso('#ead7a8'));
  // abajo: el zócalo de granito rosa (alto junto al portal) y la planta baja blanca de la tienda
  k.box(L / 2, 0, ZF + 0.03, L, 0.6, 0.06, ROSA);
  k.pic(L / 2, 0.3, ZF + 0.062, L, 0.6, 0, 1, canvasTex(Math.round(L * 24), 15, granitoRosa));
  k.box(c(10.9, 14.3), 0, ZF + 0.035, 3.4, 1.97, 0.07, ROSA);
  k.pic(c(10.9, 14.3), 0.985, ZF + 0.072, 3.4, 1.97, 0, 1, canvasTex(82, 48, granitoRosa));
  k.pic(c(14.3, FONDO_PC), 3.6, ZF + 0.008, FONDO_PC - 14.3, 6.0, 0, 1, canvasTex(Math.round((FONDO_PC - 14.3) * 24), 144, liso('#f2f1ec')));
  // la floristería: el escaparate grande, la puerta de cristal con el letrero de El Trébol y las letras «FLORISTERÍA»
  vidrio(3.78, 7.04, 0.6, 2.25, 2);
  vidrio(3.78, 7.04, 2.95, 1.35, 2, true);
  vidrio(7.47, 10.89, 0, 2.65, 4);
  k.pic(c(7.6, 10.7), 2.95, ZF + 0.06, 3.1, 0.45, 0, 1, canvasTex(300, 44, trebol));
  vidrio(7.47, 10.89, 3.3, 1.0, 4, true);
  k.pic(c(5.8, 10.8), 4.8, ZF + 0.02, 5.0, 0.7, 0, 1, canvasTex(500, 70, rotulo('FLORISTERÍA', '#8a6a3a', '#ead7a8', { serif: true, alto: 0.8 })));
  k.box(s(7.25), 2.95, ZF + 0.02, 0.32, 0.22, 0.03, 0x2a4aa8);
  k.pic(s(7.25), 3.06, ZF + 0.052, 0.32, 0.22, 0, 1, canvasTex(64, 44, rotulo('PADRE CLARET', '#ffffff', '#2a4aa8', { alto: 0.5 })));
  // el portal blanco y las ventanitas de la escalera encima
  hueco(k, c(11.99, 13.2), 0.05, 1.21, 2.4, canvasTex(72, 144, puertaPortal), { borde: 0xf0f0ec, z: ZF + 0.07 });
  ventanita(k, c(12.0, 13.05), 4.5, 0.9, 0.9, ZF);
  // la tienda blanca: la puerta doble de cristal con su montante, los dos escaparates grandes, los apliques y el aparato del aire
  vidrio(14.42, 17.93, 0, 2.75, 4);
  vidrio(14.42, 15.09, 3.4, 1.4, 1);
  hueco(k, c(15.09, 17.93), 3.4, 2.84, 1.4, canvasTex(142, 70, liso('#2a2e34')), { borde: 0xf0f0ec, z: ZF });
  for (const [a, b] of [[18.46, 21.83], [22.36, 24.9]]) {
    vidrio(a, b, 0.6, 2.7, 2);
    vidrio(a, b, 3.4, 1.4, 2, true);
  }
  for (const sc of [14.2, 18.2, 22.1, 25.0]) k.box(s(sc), 4.85, ZF + 0.15, 0.12, 0.26, 0.3, 0x1e1e1e);
  k.box(c(13.4, 14.1), 5.15, ZF + 0.18, 0.7, 0.6, 0.36, 0xe6e2da);
  // las cornisas y las balconeras de arriba, con la ventanita de la escalera
  k.box(L / 2, 6.6, ZF + 0.25, L, 0.4, 0.5, MOLDURA);
  for (const [a, b] of [[1.93, 3.13], [4.75, 6.68], [9.1, 11.25], [14.37, 16.49], [18.91, 21.19], [22.55, 23.99]]) balconera(k, c(a, b), 7.4, b - a, 1.7, ZF);
  ventanita(k, c(12.07, 13.17), 7.65, 0.9, 0.95, ZF);
  k.box(L / 2, 9.6, ZF + 0.2, L, 0.3, 0.4, MOLDURA);
  // la azotea: las dos balaustradas con sus machones, el pretil del resto, la torre de la escalera y la tercera planta
  balaustres(k, s(4.95), s(10.43), ALTO_E, ZF + 0.1);
  balaustres(k, s(14.66), s(20.34), ALTO_E, ZF + 0.1);
  for (const [a, b] of [[7.26, 8.22], [17.02, 18.12]]) k.box(c(a, b), ALTO_E, ZF + 0.05, b - a, 1.3, 0.34, MOLDURA);
  for (const [a, b] of [[R, 4.95], [10.43, 11.6], [20.34, FONDO_PC]]) pretil(k, s(a), s(b), ALTO_E);
  k.box(c(11.6, 14.3), ALTO_E, (ZF - 4.7) / 2, 2.7, 12.2 - ALTO_E, 4.7 + ZF, CREMA);
  ventanita(k, c(12.2, 13.0), 11.1, 0.65, 0.75, ZF);
  k.box(c(2.6, 11.6), ALTO_E, -4.9, 9.0, ALTO3 - ALTO_E, 4.2, CREMA);
  k.box(c(14.3, 22.8), ALTO_E, -4.9, 8.5, ALTO3 - ALTO_E, 4.2, CREMA);
  for (const sc of [5.0, 9.5, 16.2, 20.4]) ventanita(k, s(sc), 10.8, 1.0, 1.1, -2.8);
}

/** la esquina redonda (en metros del mapa): el granito, las cristaleras, el letrero de la floristería y las cornisas */
function curva(k) {
  const O = en(R, R), E = [-UW[0], -UW[1]], N = [-US[0], -US[1]];
  const n = 8, dt = Math.PI / 2 / n;
  const punto = (t, r) => [O[0] + r * (Math.cos(t) * E[0] + Math.sin(t) * N[0]), O[1] + r * (Math.cos(t) * E[1] + Math.sin(t) * N[1])];
  const normal = t => [Math.cos(t) * E[0] + Math.sin(t) * N[0], Math.cos(t) * E[1] + Math.sin(t) * N[1]];
  // un anillo de trozos rectos de y a y + h, con la cara de fuera a r de O y `d` de grueso
  const anillo = (y, h, r, d, hex) => {
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) * dt, [nx, nz] = normal(t), [cx, cz] = punto(t, r * Math.cos(dt / 2) - d / 2);
      k.box(cx, y, cz, 2 * r * Math.sin(dt / 2) + 0.03, h, d, hex, { ry: Math.atan2(nx, nz) });
    }
  };
  const RF = R + ZF;
  anillo(0, ALTO_E, RF, RF - 0.95, CREMA);
  anillo(0, 0.9, RF + 0.06, 0.12, ROSA);
  // las cristaleras de abajo, con los montantes blancos
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) * dt, [nx, nz] = normal(t), [cx, cz] = punto(t, RF * Math.cos(dt / 2) + 0.01);
    const w = 2 * RF * Math.sin(dt / 2) + 0.02;
    k.pic(cx, 2.75, cz, w, 3.7, nx, nz, canvasTex(40, 150, cristales('#f0f0ec', 1, 'rgba(230,236,240,.25)')));
  }
  for (let i = 0; i <= n; i += 2) {
    const [x, z] = punto(i * dt, RF + 0.03);
    k.box(x, 0.9, z, 0.08, 3.7, 0.08, 0xf0f0ec);
  }
  anillo(3.5, 0.12, RF + 0.04, 0.1, 0xf0f0ec);
  // el letrero de la floristería, en el medio de la curva
  const [lx, lz] = punto(Math.PI / 4, RF + 0.1), [mx, mz] = normal(Math.PI / 4);
  k.pic(lx, 5.1, lz, 1.9, 0.6, mx, mz, canvasTex(190, 60, trebol));
  // las cornisas y la balaustrada de la azotea
  anillo(6.6, 0.4, RF + 0.5, 0.5, MOLDURA);
  anillo(9.6, 0.3, RF + 0.4, 0.4, MOLDURA);
  anillo(ALTO_E, 0.12, RF + 0.22, 0.24, MOLDURA);
  anillo(ALTO_E + 0.82, 0.1, RF + 0.24, 0.28, MOLDURA);
  for (let t = dt / 2; t < Math.PI / 2; t += dt) {
    const [x, z] = punto(t, RF + 0.1);
    k.cyl(x, ALTO_E + 0.12, z, 0.05, 0.075, 0.7, 0xf4f0e4, { seg: 7 });
  }
}

/** se monta con lo demás */
export function buildTunelAltavista(scene, colliders, map) {
  if (!map?.tunelAltavista) return null;
  const kb = new Kit(), ke = new Kit(), kp = new Kit(), kc = new Kit();
  caraBar(kb);
  caraEsquinaLyC(ke);
  caraEsquinaClaret(kp);
  curva(kc);
  const grupos = [
    enMarco(kb, FL, 'tunelAltavista', colliders),
    enMarco(ke, FE, 'tunelEsquinaLyC', colliders),
    enMarco(kp, FP, 'tunelEsquinaClaret', colliders),
    enMarco(kc, marco([0, 0], [1, 0]), 'tunelEsquinaCurva', null),
  ];
  // las medianeras lisas que asoman por encima de las casas bajas de al lado
  const lisa = (A, B, alto, nombre) => tira(A, B, alto, nombre, colliders, (k, L) => pared(k, 0, L, alto, liso('#e6d3a4'), -0.25));
  grupos.push(lisa(IS, PS, ALTO_C, 'tunelMedianeraSur'));
  grupos.push(lisa(IW, IS, ALTO_C, 'tunelTraseraSur'));
  // la cara de Fray Luis de León de la casa del bar (x: lo que hay hasta la esquina − 7)
  grupos.push(tira(IO, IW, ALTO_C, 'tunelBarFrayLuis', colliders, (k, L) => {
    const F = 0.054, x = a => a - ESQ;
    const hu = (a0, a1, y0, y1, tex, borde = 0xf0f0ec) => hueco(k, (x(a0) + x(a1)) / 2, y0, a1 - a0, y1 - y0, tex, { borde, z: F });
    pared(k, 0, L, ALTO_C, liso('#ead7a8'), -0.25);
    // la parte blanca de abajo, la de las rejillas
    k.pic((x(20.8) + L) / 2, 1.7, F + 0.004, L - x(20.8), 3.4, 0, 1, canvasTex(Math.round((L - x(20.8)) * 24), 82, liso('#f4f2ec')));
    hu(7.05, 9.4, 0, 3.0, canvasTex(140, 180, portonMadera), 0x3a2618);
    hu(9.92, 11.29, 0, 2.37, canvasTex(82, 142, portalDoble));
    k.pic((x(9.92) + x(11.29)) / 2, 2.62, F + 0.01, 0.3, 0.16, 0, 1, canvasTex(60, 32, rotulo('50', '#3a3632', '#ead7a8')));
    // CaixaBank por detrás: la franja azul oscuro con el nombre, la puerta de cristal, el cajero y el escaparate
    k.box((x(11.95) + x(16.5)) / 2, 2.75, F + 0.06, 16.5 - 11.95, 0.5, 0.1, 0x1c2433);
    k.pic((x(13.0) + x(15.6)) / 2, 3.0, F + 0.115, 2.6, 0.4, 0, 1, canvasTex(312, 48, rotulo('CaixaBank', '#ffffff', '#1c2433', { peso: 'normal', serif: true, alto: 0.8 })));
    hu(12.1, 13.26, 0, 2.4, canvasTex(58, 120, cristales('#d8dadc', 1, 'rgba(60,70,80,.3)')), 0xd8dadc);
    hu(13.45, 14.25, 0.25, 2.4, canvasTex(40, 108, liso('#22262c')), 0xd8dadc);
    cajero(k, (x(13.45) + x(14.25)) / 2, 1.35, F + 0.04);
    hu(14.4, 16.6, 0.3, 2.5, canvasTex(110, 110, cristales('#d8dadc', 2, 'rgba(60,70,80,.3)')), 0xd8dadc);
    // las cajas de los contadores, el portal 48, las rejillas y el armario
    k.box((x(16.78) + x(17.48)) / 2, 1.92, F + 0.05, 0.7, 0.35, 0.1, 0xb8b0a0);
    k.box((x(17.44) + x(18.14)) / 2, 1.55, F + 0.05, 0.7, 0.72, 0.1, 0xc8c0ae);
    hu(18.91, 20.32, 0, 2.45, canvasTex(84, 146, portalDoble));
    k.pic((x(18.91) + x(20.32)) / 2, 2.7, F + 0.01, 0.3, 0.16, 0, 1, canvasTex(60, 32, rotulo('48', '#3a3632', '#ead7a8')));
    k.pic((x(20.87) + x(23.76)) / 2, 3.15, F + 0.01, 23.76 - 20.87, 0.32, 0, 1, canvasTex(174, 20, rejilla));
    hu(20.98, 22.09, 2.0, 2.7, canvasTex(66, 42, rejilla), 0xe8e2d4);
    hu(22.4, 23.21, 2.3, 2.75, canvasTex(48, 27, rejilla), 0xe8e2d4);
    k.box((x(22.71) + x(23.6)) / 2, 0.9, F + 0.04, 0.89, 1.2, 0.08, 0xd8d0c0);
    // la cornisa blanca, las balconeras y las ventanitas de las dos escaleras, y la planta de arriba
    k.box(L / 2, 3.4, F + 0.22, L, 0.45, 0.45, MOLDURA);
    for (const [a0, a1] of [[7.2, 9.0], [12.5, 14.9], [15.1, 17.5], [21.2, 23.5]]) {
      balconera(k, (x(a0) + x(a1)) / 2, 4.2, a1 - a0, 1.8, F);
      ventanita(k, (x(a0) + x(a1)) / 2, 7.0, Math.min(1.6, a1 - a0 - 0.4), 1.2, F);
    }
    for (const a of [10.55, 19.55]) {
      ventanita(k, x(a), 4.4, 0.85, 0.8, F);
      ventanita(k, x(a), 6.7, 0.85, 0.8, F);
    }
    k.box(L / 2, 6.45, F + 0.12, L, 0.15, 0.24, MOLDURA);
    k.box(L / 2, ALTO_C, F - 0.12, L, 0.5, 0.24, 0xf2efe6);
    k.box(L / 2, ALTO_C + 0.5, F - 0.1, L + 0.04, 0.06, 0.3, 0xdcdad4);
  }));
  // la cara de Fray Luis de León de la casa de la esquina: la planta baja blanca con la ventana y la puerta
  grupos.push(tira(PW, IO, ALTO_E, 'tunelEsquinaFrayLuis', colliders, (k, L) => {
    const F = 0.054;
    pared(k, 0, L, ALTO_E, liso('#ead7a8'), -0.25);
    k.pic(L / 2, 3.6, F + 0.004, L, 6.0, 0, 1, canvasTex(Math.round(L * 24), 144, liso('#f2f1ec')));
    k.box(L / 2, 0, F + 0.03, L, 0.6, 0.06, ROSA);
    hueco(k, 1.0, 0.6, 1.3, 2.6, canvasTex(65, 130, cristales('#f0f0ec', 1, 'rgba(230,236,240,.25)')), { borde: 0xf0f0ec, z: F });
    hueco(k, 2.7, 0.05, 0.9, 2.3, canvasTex(54, 138, liso('#3a3632')), { borde: 0xf0f0ec, z: F });
    k.box(L / 2, 6.6, F + 0.25, L, 0.4, 0.5, MOLDURA);
    balconera(k, 3.5, 7.4, 1.2, 1.7, F);
    k.box(L / 2, 9.6, F + 0.2, L, 0.3, 0.4, MOLDURA);
    k.box(L / 2, ALTO_E, F - 0.12, L, 0.5, 0.24, 0xf2efe6);
    k.box(L / 2, ALTO_E + 0.5, F - 0.1, L + 0.04, 0.06, 0.3, 0xdcdad4);
  }));
  for (const g of grupos) scene.add(g);
  return { grupos };
}
