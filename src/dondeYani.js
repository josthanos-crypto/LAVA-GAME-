import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, hueco } from './restaurantesCharco.js';
import { cristales } from './edificioReal.js';
import { ZF, BLANCO, pared } from './rapadurasSur.js';

/**
 * El Bar Cafetería Donde Yani (calle Blasco Ibáñez 19, Altavista) y la casa entera de la esquina con la calle Juan
 * Sebastián El Cano, con las vistas de la calle de Google de julio de 2025 (Blasco Ibáñez 17, 18, 21 y 23 y Juan
 * Sebastián El Cano 2; las fotos del sitio son solo de la comida; solo se miran, no van dentro del juego). En el mapa era
 * parte del bloque genérico de 8 m de toda la manzana. De verdad es una casa canaria blanca de dos plantas con las
 * pilastras, la imposta y la cornisa de piedra gris oscura y la balaustrada en la azotea, con la esquina en chaflán:
 * - abajo, por Blasco Ibáñez: la Boutique del Pan (el chaflán con su puerta y el tramo de las dos ventanas, con el
 *   letrero), el tramo de la ventana, la puerta de reja y la caja de la luz, y los dos tramos de Donde Yani: las ventanas
 *   de reja de rombos, las dos puertas abiertas (la del letrerito blanco y la de la lona azul), el cartel de comida en la
 *   ventana y el letrero amarillo y rojo en uve en la pilastra («Donde Yani»), con sus dos focos;
 * - arriba, las balconeras de barandilla blanca;
 * - por Juan Sebastián El Cano: la ventana de barrotes viejos, la balconera, la puerta de cristal del 2 y la cristalera
 *   alta y estrecha de la escalera.
 */

// la esquina del bloque del mapa (Blasco Ibáñez con Juan Sebastián El Cano), hacia el norte por Blasco Ibáñez (UN) y
// hacia el oeste por Juan Sebastián El Cano (UO)
const B = [163.32, -1025.2];
const UN = [-0.37196, -0.92825], UO = [-0.88853, 0.45884];
const en = (a, b) => [B[0] + UN[0] * a + UO[0] * b, B[1] + UN[1] * a + UO[1] * b];
// la casa: 24,85 m por Blasco Ibáñez y 8,35 m por Juan Sebastián El Cano, con el chaflán de 1,6 m por cada lado
const LB = 24.85, LJ = 8.35, CH = 1.6;
const ALTO = 6.75;
const CB = en(CH, 0), CJ = en(0, CH), PN = en(LB, 0), PJ = en(0, LJ), Q = en(LB, LJ);
// las caras: Blasco Ibáñez (s desde el chaflán hacia el norte: s = lo que hay hasta la esquina − 1,6), el chaflán y
// Juan Sebastián El Cano (s desde el oeste: s = 8,35 − lo que hay hasta la esquina)
const FB = marco(CB, PN);
const FC = marco(CJ, CB);
const FJ = marco(PJ, CJ);

const BLANCA = '#f0eee8', GRIS = 0x626264, BALAUSTRE = 0xece4d2;

/** antes de levantar la ciudad: la casa sale del bloque genérico de 8 m y va a su altura */
export function tuneDondeYani(map) {
  if (!Array.isArray(map?.buildings)) return;
  const d = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
  const r = q => [+q[0].toFixed(2), +q[1].toFixed(2)];
  const b = map.buildings.find(q => !q.skip && !q.edificioReal && Array.isArray(q.p) && q.p.some(p => d(p, B) < 0.3));
  if (!b) return;
  const i = b.p.findIndex(p => d(p, B) < 0.3);
  const n = b.p.length, cerrado = d(b.p[0], b.p[n - 1]) < 0.01;
  const antes = b.p[i > 0 ? i - 1 : (cerrado ? n - 2 : n - 1)];
  const nuevo = (d(antes, PN) < d(antes, PJ) ? [PN, Q, PJ] : [PJ, Q, PN]).map(r);
  b.p.splice(i, 1, ...nuevo);
  if (cerrado && i === 0) b.p[b.p.length - 1] = nuevo[0].slice();
  const p = [CB, CJ, PJ, Q, PN].map(r);
  p.push(p[0].slice());
  map.buildings.push({ p, h: ALTO, k: 'gen', s: 0, f: [240, 238, 232], c: [184, 132, 108], edificioReal: true });
  map.dondeYani = true;
}

// ——— las texturas ———

const liso = color => (g, w, h) => { g.fillStyle = color; g.fillRect(0, 0, w, h); };

/** una reja de rombos negra sobre el cristal oscuro (o sobre el que se diga) */
function rombos(fondo = '#3a3e42', marcoColor = '#f0f0ec') {
  return (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, fondo);
    gr.addColorStop(1, '#22262a');
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = '#141414';
    g.lineWidth = 2;
    const paso = w / 6;
    for (let x = -h; x < w + h; x += paso) {
      g.beginPath(); g.moveTo(x, 0); g.lineTo(x + h, h); g.stroke();
      g.beginPath(); g.moveTo(x, h); g.lineTo(x + h, 0); g.stroke();
    }
    g.strokeStyle = marcoColor;
    g.lineWidth = 4;
    g.strokeRect(2, 2, w - 4, h - 4);
    g.beginPath(); g.moveTo(0, h * 0.18); g.lineTo(w, h * 0.18); g.stroke();
  };
}

/** la ventana de barrotes viejos, oxidados, de Juan Sebastián El Cano */
function barrotes(g, w, h) {
  g.fillStyle = '#2a2c2e';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(200,190,170,.35)';
  g.fillRect(0, 0, w, h * 0.4);
  g.strokeStyle = '#7a5a40';
  g.lineWidth = 3;
  for (let x = w / 9; x < w; x += w / 9) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  for (const y of [0.05, 0.3, 0.68, 0.95]) { g.beginPath(); g.moveTo(0, h * y); g.lineTo(w, h * y); g.stroke(); }
}

/** por la puerta abierta: el bar por dentro, con una mesa de mantel blanco y las sillas */
function dentroBar(g, w, h) {
  g.fillStyle = '#4a4038';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#6a5c4e';
  g.fillRect(w * 0.15, h * 0.1, w * 0.7, h * 0.55);
  g.fillStyle = '#8a8478';
  g.beginPath(); g.moveTo(0, h); g.lineTo(w, h); g.lineTo(w * 0.85, h * 0.65); g.lineTo(w * 0.15, h * 0.65); g.closePath(); g.fill();
  g.fillStyle = '#f2f0ea';
  g.fillRect(w * 0.25, h * 0.55, w * 0.5, h * 0.1);
  g.fillStyle = '#9a9ea2';
  for (const x of [0.2, 0.72]) {
    g.fillRect(w * x, h * 0.48, w * 0.08, h * 0.3);
    g.fillRect(w * x, h * 0.62, w * 0.12, h * 0.03);
  }
  g.strokeStyle = '#f0f0ec';
  g.lineWidth = 3;
  g.strokeRect(1.5, 1.5, w - 3, h - 3);
}

/** por la otra puerta abierta: el pasillo con la puerta de cristal del fondo */
function pasillo(g, w, h) {
  g.fillStyle = '#3e3a36';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#7a8088';
  g.fillRect(w * 0.3, h * 0.12, w * 0.4, h * 0.62);
  g.fillStyle = 'rgba(255,255,255,.18)';
  g.fillRect(w * 0.36, h * 0.15, w * 0.06, h * 0.56);
  g.fillStyle = '#8a8478';
  g.beginPath(); g.moveTo(0, h); g.lineTo(w, h); g.lineTo(w * 0.7, h * 0.74); g.lineTo(w * 0.3, h * 0.74); g.closePath(); g.fill();
  g.strokeStyle = '#f0f0ec';
  g.lineWidth = 3;
  g.strokeRect(1.5, 1.5, w - 3, h - 3);
}

/** el letrero de Donde Yani: arriba amarillo con el nombre, abajo rojo con lo que ponen, y la comida a los lados */
function yani(g, w, h) {
  g.fillStyle = '#f2d03a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#c8282a';
  g.fillRect(0, h * 0.6, w, h * 0.4);
  g.fillStyle = '#7a1416';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `italic bold ${Math.round(h * 0.4)}px Georgia, "Times New Roman", serif`;
  g.fillText('Donde Yani', w / 2, h * 0.32, w * 0.8);
  g.fillStyle = '#ffffff';
  g.font = `bold ${Math.round(h * 0.15)}px Arial, sans-serif`;
  g.fillText('Menú diario · Desayunos', w / 2, h * 0.72, w * 0.62);
  g.fillText('Comida rápida', w / 2, h * 0.88, w * 0.5);
  // la comida de las esquinas de abajo
  for (const [x, c1, c2] of [[0.1, '#a8642a', '#d8a040'], [0.9, '#6a3a1a', '#e8c070']]) {
    g.fillStyle = c1;
    g.beginPath(); g.ellipse(w * x, h * 0.78, w * 0.07, h * 0.16, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = c2;
    g.beginPath(); g.ellipse(w * x, h * 0.72, w * 0.06, h * 0.07, 0, 0, Math.PI * 2); g.fill();
  }
  g.strokeStyle = '#7a1416';
  g.lineWidth = 3;
  g.strokeRect(1.5, 1.5, w - 3, h - 3);
}

/** el cartel de comida de la ventana de Donde Yani */
function cartelComida(g, w, h) {
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, '#f6c040');
  gr.addColorStop(1, '#e86a2a');
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
  const platos = [[0.3, 0.3, '#8a4a1e'], [0.7, 0.32, '#c87a2a'], [0.5, 0.55, '#6a8a2a'], [0.28, 0.72, '#b8502a'], [0.72, 0.72, '#f0e0b0']];
  for (const [x, y, c] of platos) {
    g.fillStyle = '#ffffff';
    g.beginPath(); g.ellipse(w * x, h * y, w * 0.2, h * 0.09, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = c;
    g.beginPath(); g.ellipse(w * x, h * y, w * 0.14, h * 0.06, 0, 0, Math.PI * 2); g.fill();
  }
  g.fillStyle = '#c8282a';
  g.fillRect(0, h * 0.88, w, h * 0.12);
}

/** la lona azul con fotos de comida de encima de la otra puerta */
function lonaAzul(g, w, h) {
  g.fillStyle = '#2a5aa8';
  g.fillRect(0, 0, w, h);
  for (let i = 0; i < 5; i++) {
    g.fillStyle = ['#e8a040', '#c8502a', '#f0d070', '#8a4a1e', '#e86a2a'][i];
    g.beginPath(); g.ellipse(w * (0.1 + i * 0.2), h * 0.5, w * 0.08, h * 0.32, 0, 0, Math.PI * 2); g.fill();
  }
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
    g.fillText(texto, w / 2, h * 0.54, w * 0.92);
  };
}

// ——— las piezas ———

/** una balconera con su barandilla blanca de barrotes */
function balconera(k, s, y, w, h) {
  hueco(k, s, y, w, h, canvasTex(Math.round(w * 50), Math.round(h * 50), cristales('#f2f2ee', 2, 'rgba(235,232,225,.6)')), { borde: 0xf2f2ee, z: ZF });
  const zr = ZF + 0.14;
  k.box(s, y + 0.9, zr, w + 0.1, 0.05, 0.05, BLANCO);
  k.box(s, y + 0.06, zr, w + 0.1, 0.04, 0.05, BLANCO);
  for (let x = -w / 2; x <= w / 2 + 0.01; x += 0.12) k.box(s + x, y + 0.06, zr, 0.025, 0.85, 0.025, BLANCO);
}

/** una ventana de reja de rombos, en la planta baja */
function ventanaRombos(k, s, w, tex = rombos()) {
  hueco(k, s, 1.4, w, 1.6, canvasTex(Math.round(w * 60), 96, tex), { borde: 0xf0f0ec, z: ZF });
}

/** la pared blanca, las pilastras, la imposta, la cornisa y la balaustrada de la azotea de una cara */
function caja(k, L, pilastras, imposta = [0, L]) {
  pared(k, 0, L, ALTO, liso(BLANCA));
  for (const s of pilastras) k.box(s, 0, ZF + 0.05, 0.45, ALTO - 0.3, 0.1, GRIS);
  k.box((imposta[0] + imposta[1]) / 2, 4.2, ZF + 0.06, imposta[1] - imposta[0], 0.3, 0.12, GRIS);
  k.box(L / 2, ALTO - 0.3, ZF + 0.12, L, 0.3, 0.24, GRIS);
  // la balaustrada: el zócalo gris, los balaustres, el pasamanos y los pedestales grises encima de las pilastras
  const zb = ZF - 0.05;
  k.box(L / 2, ALTO, zb, L, 0.1, 0.22, GRIS);
  k.box(L / 2, ALTO + 0.72, zb, L, 0.09, 0.24, BALAUSTRE);
  for (let s = 0.12; s < L - 0.08; s += 0.19) k.cyl(s, ALTO + 0.1, zb, 0.045, 0.07, 0.62, BALAUSTRE, { seg: 7 });
  for (const s of pilastras) {
    k.box(s, ALTO, zb, 0.42, 0.85, 0.36, GRIS);
    k.box(s, ALTO + 0.85, zb, 0.5, 0.08, 0.44, GRIS);
    k.ball(s, ALTO + 0.96, zb, 0.07, GRIS, { seg: 8 });
  }
}

/** la cara de Blasco Ibáñez: la Boutique del Pan, el tramo de la puerta de reja y los dos tramos de Donde Yani */
function caraBlasco(k) {
  const L = FB.len, s = sb => sb - CH;
  caja(k, L, [0.22, 4.02, 11.82, 17.52, L - 0.22]);
  // la Boutique del Pan: las dos ventanas y el letrero
  ventanaRombos(k, s(2.9), 0.95);
  ventanaRombos(k, s(4.45), 1.1);
  k.box(s(3.75), 3.15, ZF + 0.05, 3.0, 0.5, 0.1, 0xd8ccb0);
  k.pic(s(3.75), 3.4, ZF + 0.102, 2.9, 0.44, 0, 1, canvasTex(290, 44, rotulo('BOUTIQUE DEL PAN', '#4a2a16', '#e2d6b8', { italica: true, alto: 0.72 })));
  // el tramo de la ventana, la puerta de reja con su tejadillo gris y la caja de la luz
  ventanaRombos(k, s(7.05), 1.1);
  hueco(k, s(8.85), 0, 1.1, 2.6, canvasTex(66, 156, rombos('#8a9094', '#5a5e62')), { borde: 0x5a5e62, z: ZF });
  k.box(s(8.85), 2.7, ZF + 0.2, 1.35, 0.25, 0.4, 0x6a6e72);
  k.box(s(11.0), 0.5, ZF + 0.08, 2.0, 0.9, 0.16, 0xe4e2dc);
  // Donde Yani: las ventanas de reja, las dos puertas abiertas, el letrerito blanco, la lona azul y el cartel de comida
  ventanaRombos(k, s(14.4), 1.25);
  hueco(k, s(16.2), 0, 1.1, 2.7, canvasTex(66, 162, dentroBar), { borde: 0xf0f0ec, z: ZF });
  k.box(s(16.2), 2.85, ZF + 0.15, 1.3, 0.3, 0.3, 0xf2f2ee);
  k.box(s(16.2), 2.85, ZF + 0.3, 1.1, 0.05, 0.02, 0xb0b0aa);
  ventanaRombos(k, s(17.9), 1.05);
  k.box(s(15.3), 1.35, ZF + 0.08, 0.32, 0.4, 0.14, 0x6a7a8a);
  ventanaRombos(k, s(20.1), 1.0);
  hueco(k, s(21.75), 0, 1.0, 2.7, canvasTex(60, 162, pasillo), { borde: 0xf0f0ec, z: ZF });
  k.pic(s(21.75), 3.0, ZF + 0.08, 1.2, 0.32, 0, 1, canvasTex(120, 32, lonaAzul));
  hueco(k, s(23.2), 1.4, 1.05, 1.6, canvasTex(63, 96, cartelComida), { borde: 0xf0f0ec, z: ZF });
  // el letrero en uve de la pilastra, con sus dos focos
  const sp = 17.52, ang = 0.42, ancho = 1.15;
  for (const lado of [-1, 1]) {
    const cx = sp + lado * Math.cos(ang) * ancho / 2, cz = ZF + 0.12 + Math.sin(ang) * ancho / 2;
    const nx = lado * Math.sin(ang), nz = Math.cos(ang);
    k.box(cx, 3.3, cz, ancho, 0.65, 0.05, 0x7a1416, { ry: lado * ang });
    k.pic(cx + nx * 0.03, 3.625, cz + nz * 0.03, ancho - 0.04, 0.61, nx, nz, canvasTex(160, 85, yani));
  }
  for (const sf of [15.9, 18.7]) {
    k.box(sf, 3.62, ZF + 0.12, 0.06, 0.06, 0.24, 0x5a5a5a);
    k.box(sf, 3.52, ZF + 0.3, 0.26, 0.18, 0.14, 0x8a8a88);
  }
  // arriba, las balconeras de barandilla blanca
  for (const [sb, w] of [[4.6, 1.0], [7.3, 1.4], [10.35, 1.8], [15.5, 1.3], [17.9, 1.35], [20.2, 1.3], [22.5, 1.35]]) balconera(k, s(sb), 4.65, w, 1.5);
}

/** el chaflán de la esquina: la puerta de la Boutique del Pan con su letrero y la balconera de arriba */
function caraChaflan(k) {
  const L = FC.len;
  caja(k, L, []);
  hueco(k, L / 2, 0, 1.0, 2.6, canvasTex(60, 156, rombos('#8a9094', '#5a5e62')), { borde: 0x5a5e62, z: ZF });
  k.box(L / 2, 2.95, ZF + 0.05, 1.9, 0.5, 0.1, 0xd8ccb0);
  k.pic(L / 2, 3.2, ZF + 0.102, 1.8, 0.44, 0, 1, canvasTex(180, 44, rotulo('BOUTIQUE DEL PAN', '#4a2a16', '#e2d6b8', { italica: true, alto: 0.6 })));
  balconera(k, L / 2, 4.65, 0.9, 1.5);
}

/** la cara de Juan Sebastián El Cano: la puerta del 2, la cristalera de la escalera, la ventana de barrotes y la balconera */
function caraJuanSebastian(k) {
  const L = FJ.len, s = t => LJ - t;
  caja(k, L, [L - 0.22], [s(5.9), L]);
  hueco(k, s(6.9), 0, 1.0, 2.5, canvasTex(60, 150, cristales('#e8e8e4', 1, 'rgba(60,70,80,.25)')), { borde: 0xe8e8e4, z: ZF });
  k.pic(s(6.9), 2.75, ZF + 0.03, 0.22, 0.24, 0, 1, canvasTex(22, 24, rotulo('2', '#ffffff', '#2a4a8a', { alto: 0.8 })));
  hueco(k, s(6.8), 3.0, 0.85, 3.2, canvasTex(51, 192, cristales('#e8e8e4', 1, 'rgba(60,70,80,.3)')), { borde: 0xe8e8e4, z: ZF });
  k.box(s(6.0), 1.2, ZF + 0.08, 0.3, 0.35, 0.12, 0x5a4a3a);
  hueco(k, s(3.73), 1.0, 1.3, 1.7, canvasTex(78, 102, barrotes), { borde: 0xf0f0ec, z: ZF });
  balconera(k, s(4.1), 4.65, 1.0, 1.5);
}

/** se monta con lo demás */
export function buildDondeYani(scene, colliders, map) {
  if (!map?.dondeYani) return null;
  const kb = new Kit(), kc = new Kit(), kj = new Kit();
  caraBlasco(kb);
  caraChaflan(kc);
  caraJuanSebastian(kj);
  const grupos = [
    enMarco(kb, FB, 'dondeYani', colliders),
    enMarco(kc, FC, 'dondeYaniChaflan', colliders),
    enMarco(kj, FJ, 'dondeYaniJuanSebastian', colliders),
  ];
  for (const g of grupos) scene.add(g);
  return { grupos };
}
