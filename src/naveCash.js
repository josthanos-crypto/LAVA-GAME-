import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';
import { alturaBloque } from './edificioReal.js';
import { tira, lienzoCorrido, juntarLienzos } from './kitFachada.js';

/**
 * La nave grande al oeste de Conforama (Avenida Mamerto Cabrera, Playa Honda), donde están, de oeste a este, Cash Lee,
 * Baratíssimos y Cash Diplo. Sitios: las fichas de Google Maps de cada uno (Cash Lee 28.95786, −13.59075; Baratíssimos
 * 28.95805, −13.59054; Cash Diplo 28.95810, −13.59006). Aspecto: las vistas de la calle de Google de octubre de 2016,
 * que son las más nuevas que hay ahí (solo se miran). Los rótulos son los que se leen en la foto:
 *  - Cash Lee: fachada blanca, «CASH LEE» en letras azules, la franja roja y los toldos.
 *  - Baratíssimos: fachada crema con dos rótulos rojos («Fashion BARATISSIMOS» y «BARATISSIMOS», con el logo redondo)
 *    y los cuadritos de colores; las dos entradas grandes.
 *  - Cash Diplo: abajo la pared gris con los portones, arriba la banda blanca con «CASH» azul, «DIPLO» naranja y el
 *    logo redondo.
 * El resto de la nave (hacia el oeste) se queda como la pone el mapa.
 */

const OESTE = marco([-4089.9, 504.3], [-3928.4, 529.9]);
const ESTE = marco([-3928.4, 529.9], [-3886.6, 525]);
const H = 7.5, Z = 0.25;

export function tuneNaveCash(map) {
  if (!alturaBloque(map, -3990, 480, H, [236, 234, 228])) return;
  map.naveCash = true;
  const signs = map.signs || [];
  for (let i = signs.length - 1; i >= 0; i--) if (/baratis/i.test(signs[i].name || '')) signs.splice(i, 1);
}

// ——— lienzos ———

function liso(color) {
  return (g, w, h) => {
    g.fillStyle = color;
    g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(120,115,100,.07)';
    for (let y = 0; y < h; y += 8) g.fillRect(0, y, w, 1);
  };
}

function letrero(fondo, pinta) {
  return (g, w, h) => {
    g.fillStyle = fondo;
    g.fillRect(0, 0, w, h);
    g.textBaseline = 'middle';
    pinta(g, w, h);
  };
}

function logoRedondo(g, x, y, r, a, b, letra) {
  g.fillStyle = a;
  g.beginPath(); g.arc(x, y, r, Math.PI / 2, Math.PI * 1.5); g.fill();
  g.fillStyle = b;
  g.beginPath(); g.arc(x, y, r, -Math.PI / 2, Math.PI / 2); g.fill();
  g.fillStyle = '#ffffff';
  g.textAlign = 'center';
  g.font = `900 ${Math.round(r * 1.3)}px Arial, sans-serif`;
  g.fillText(letra, x, y + r * 0.06);
}

const cashLee = letrero('#f3f2ee', (g, w, h) => {
  g.fillStyle = '#1d3f9a';
  g.textAlign = 'center';
  g.font = `700 ${Math.round(h * 0.62)}px Arial, sans-serif`;
  g.fillText('C A S H   L E E', w / 2, h * 0.52, w * 0.96);
});

const fashion = letrero('#e9dfc6', (g, w, h) => {
  logoRedondo(g, h * 0.55, h * 0.5, h * 0.4, '#f2c21b', '#d9252a', 'B');
  g.textAlign = 'left';
  g.fillStyle = '#c4212b';
  g.font = `italic 700 ${Math.round(h * 0.34)}px Georgia, serif`;
  g.fillText('Fashion', h * 1.25, h * 0.27);
  g.font = `900 ${Math.round(h * 0.42)}px Arial, sans-serif`;
  g.fillText('BARATISSIMOS', h * 1.15, h * 0.7, w - h * 1.25);
});

const barat = letrero('#e9dfc6', (g, w, h) => {
  logoRedondo(g, h * 0.55, h * 0.5, h * 0.42, '#f2c21b', '#d9252a', 'B');
  g.textAlign = 'left';
  g.fillStyle = '#c4212b';
  g.font = `900 ${Math.round(h * 0.5)}px Arial, sans-serif`;
  g.fillText('BARATISSIMOS', h * 1.15, h * 0.52, w - h * 1.25);
});

const cuadritos = (g, w, h) => {
  g.fillStyle = '#e9dfc6';
  g.fillRect(0, 0, w, h);
  const col = ['#d9252a', '#2a8c3e', '#2a5cc4', '#f2c21b', '#8a3fb0', '#e8771e'];
  const n = 6, m = 2, c = Math.min(w / n, h / m);
  for (let j = 0; j < m; j++) for (let i = 0; i < n; i++) {
    g.fillStyle = col[(i + j * 2) % col.length];
    g.fillRect(i * c + 3, j * c + 3, c - 6, c - 6);
  }
};

const cashDiplo = letrero('#f3f2ee', (g, w, h) => {
  logoRedondo(g, h * 0.55, h * 0.5, h * 0.44, '#1d4fa0', '#e8602a', 'D');
  g.textAlign = 'left';
  g.font = `900 ${Math.round(h * 0.66)}px Arial, sans-serif`;
  g.fillStyle = '#1d4fa0';
  g.fillText('CASH', h * 1.2, h * 0.54);
  const ancho = g.measureText('CASH ').width;
  g.fillStyle = '#e0502a';
  g.fillText('DIPLO', h * 1.2 + ancho, h * 0.54);
});

function cristal(g, w, h) {
  g.fillStyle = '#2b2f33';
  g.fillRect(0, 0, w, h);
  const c = g.createLinearGradient(0, 0, w, h);
  c.addColorStop(0, '#4e6370');
  c.addColorStop(1, '#25303a');
  g.fillStyle = c;
  g.fillRect(4, 4, w - 8, h - 8);
  g.fillStyle = '#2b2f33';
  for (let x = w / 4; x < w; x += w / 4) g.fillRect(x - 2, 0, 4, h);
}

function porton(g, w, h) {
  g.fillStyle = '#9ca1a4';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(60,64,68,.35)';
  for (let y = 0; y < h; y += 6) g.fillRect(0, y, w, 1.5);
}

let T = {};

// ——— piezas ———

function pared(k, s0, s1, tex, hex) {
  const zp = Z + 0.012;
  tira(k, s0, s1, 0, Z / 2, H, Z, hex);
  k.block((s0 + s1) / 2, Z / 2, s1 - s0, Z);
  lienzoCorrido(k, s0, s1, 0, H, zp, tex);
  tira(k, s0, s1, H - 0.2, Z + 0.06, 0.2, 0.15, 0xdedcd4, k.solid);
}

function oeste(k) {
  const zp = Z + 0.03;
  // Cash Lee
  pared(k, 103, 127.5, T.blanco, 0xf3f2ee);
  k.pic(115, 5.6, zp, 16, 1.5, 0, 1, T.cashLee);
  tira(k, 103, 127.5, 3.4, Z + 0.05, 0.45, 0.1, 0xc9302a, k.solid);
  for (const s of [108, 120]) {
    k.pic(s, 1.35, zp, 5, 2.6, 0, 1, T.cristal);
    k.box(s, 2.75, Z + 0.7, 5.4, 0.12, 1.3, 0xe0662a);
  }
  // Baratíssimos
  pared(k, 127.5, OESTE.len, T.crema, 0xe9dfc6);
  k.pic(136, 5.5, zp, 11, 2.0, 0, 1, T.fashion);
  k.pic(151, 5.5, zp, 11, 1.8, 0, 1, T.barat);
  k.pic(155, 3.4, zp, 4.2, 1.4, 0, 1, T.cuadritos);
  for (const s of [136, 147]) k.pic(s, 1.75, zp, 5.4, 3.4, 0, 1, T.cristal);
}

function este(k) {
  const L = ESTE.len, zp = Z + 0.03;
  // Cash Diplo: abajo la pared gris con portones, arriba la banda blanca con las letras
  tira(k, 0, L, 0, Z / 2, H, Z, 0xa6abae);
  k.block(L / 2, Z / 2, L, Z);
  lienzoCorrido(k, 0, L, 0, 3.6, Z + 0.012, T.gris);
  lienzoCorrido(k, 0, L, 3.6, H, Z + 0.012, T.blanco);
  tira(k, 0, L, 3.55, Z + 0.06, 0.12, 0.15, 0xdedcd4, k.solid);
  k.pic(L / 2 - 1, 5.5, zp, 24, 2.7, 0, 1, T.cashDiplo);
  for (const s of [6, 12]) k.pic(s, 1.6, zp, 4.2, 3.2, 0, 1, T.porton);
  k.pic(24, 1.4, zp, 6, 2.8, 0, 1, T.cristal);
  for (const s of [32, 38]) k.pic(s, 1.6, zp, 4.2, 3.2, 0, 1, T.porton);
}

export function buildNaveCash(scene, colliders, map) {
  if (!map?.naveCash) return null;
  T = {
    blanco: canvasTex(128, 128, liso('#f3f2ee')),
    crema: canvasTex(128, 128, liso('#e9dfc6')),
    gris: canvasTex(128, 128, liso('#a6abae')),
    cashLee: canvasTex(1024, 96, cashLee),
    fashion: canvasTex(768, 140, fashion),
    barat: canvasTex(768, 126, barat),
    cuadritos: canvasTex(240, 80, cuadritos),
    cashDiplo: canvasTex(1280, 144, cashDiplo),
    cristal: canvasTex(128, 80, cristal),
    porton: canvasTex(96, 80, porton),
  };
  return [[OESTE, oeste, 'naveCashOeste'], [ESTE, este, 'naveCashEste']].map(([M, f, n]) => {
    const k = new Kit();
    f(k);
    juntarLienzos(k);
    const g = enMarco(k, M, n, colliders);
    scene.add(g);
    return g;
  });
}
