import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';
import { alturaBloque } from './edificioReal.js';
import { tira, lienzoCorrido, juntarLienzos } from './kitFachada.js';

/**
 * El Pabellón Municipal de Titerroy (calle Burgos), con las vistas de la calle de Google de julio de 2025 (solo se miran).
 * El mapa lo tenía de 3,4 m; de verdad es una caja blanca de unos 10,5 m con la chapa beis de nervios arriba.
 * En la calle Burgos: la pared blanca con la fila de ventanitas con rejas y, hacia el suroeste, el mural del balonmano
 * (aquí, simplificado: la portería de rayas rojas y blancas, el portero de amarillo y negro y las palabras «Esfuerzo» y
 * «Pasión», que son las que se leen). En la calle Monseñor Óscar Romero: las ventanas de dos hojas arriba, las
 * rejillas alargadas y, en la punta del sur, la puerta y las rejillas de lamas blancas. Los otros dos lados no salen en
 * las fotos: blancos con la chapa arriba.
 */

const PLANTA = [[-552.4, -655.7], [-507, -689.8], [-488.8, -664.6], [-533.2, -630.6]];
const H = 10.5, CHAPA_Y = 7.9, Z = 0.25;
const BLANCO = 0xf1f0eb;

// las caras con N hacia fuera; Burgos va del noreste (s 0) al suroeste, Óscar Romero del sur (s 0) al norte
const BURGOS = marco(PLANTA[1], PLANTA[0]);
const ROMERO = marco(PLANTA[2], PLANTA[1]);
const SURESTE = marco(PLANTA[3], PLANTA[2]);
const SUROESTE = marco(PLANTA[0], PLANTA[3]);

export function tunePabellonTiterroy(map) {
  if (!alturaBloque(map, -526, -659, H, [241, 240, 235])) return;
  map.pabellonTiterroy = true;
}

// ——— lienzos ———

function blanco(g, w, h) {
  g.fillStyle = '#f1f0eb';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(140,135,120,.08)';
  for (let y = 0; y < h; y += 7) g.fillRect(0, y, w, 1);
}

function chapa(g, w, h) {
  g.fillStyle = '#d9cdb2';
  g.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += 9) {
    g.fillStyle = 'rgba(120,105,80,.3)'; g.fillRect(x, 0, 2, h);
    g.fillStyle = 'rgba(255,255,255,.3)'; g.fillRect(x + 2, 0, 1, h);
  }
}

/** la ventanita con los barrotes blancos */
function reja(g, w, h) {
  g.fillStyle = '#e9e8e2';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#2d3336';
  g.fillRect(4, 4, w - 8, h - 8);
  g.fillStyle = '#f4f4f0';
  for (let x = 4; x < w - 4; x += 9) g.fillRect(x, 4, 4, h - 8);
}

function ventana(g, w, h) {
  g.fillStyle = '#f2f1ec';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#7c8a91';
  g.fillRect(5, 5, w - 10, h - 10);
  g.fillStyle = 'rgba(230,236,238,.35)';
  g.fillRect(5, 5, w - 10, (h - 10) * 0.4);
  g.fillStyle = '#f2f1ec';
  g.fillRect(w * 0.5 - 2, 0, 4, h);
}

function lamas(g, w, h) {
  g.fillStyle = '#ecebe5';
  g.fillRect(0, 0, w, h);
  for (let y = 4; y < h - 2; y += 6) {
    g.fillStyle = 'rgba(90,90,85,.35)'; g.fillRect(3, y, w - 6, 2);
  }
}

/** el mural del balonmano, simplificado */
function mural(g, w, h) {
  g.fillStyle = '#f1f0eb';
  g.fillRect(0, 0, w, h);
  // la portería de rayas rojas y blancas
  const px = w * 0.3, py = h * 0.12, pw = w * 0.5, ph = h * 0.62, t = h * 0.035;
  const raya = (x, y, ww, hh, vertical) => {
    const n = 9;
    for (let i = 0; i < n; i++) {
      g.fillStyle = i % 2 ? '#f6f6f2' : '#c8202a';
      if (vertical) g.fillRect(x, y + (hh / n) * i, ww, hh / n);
      else g.fillRect(x + (ww / n) * i, y, ww / n, hh);
    }
  };
  raya(px, py, pw, t, false);
  raya(px, py, t, ph, true);
  raya(px + pw - t, py, t, ph, true);
  g.strokeStyle = 'rgba(120,120,120,.35)';
  g.lineWidth = 1;
  for (let x = px + t; x < px + pw - t; x += 10) { g.beginPath(); g.moveTo(x, py + t); g.lineTo(x, py + ph); g.stroke(); }
  // el portero saltando, de amarillo y negro
  const cx = w * 0.66, cy = h * 0.4;
  g.lineCap = 'round';
  g.strokeStyle = '#e8b81c'; g.lineWidth = h * 0.06;
  g.beginPath(); g.moveTo(cx - w * 0.1, cy - h * 0.12); g.lineTo(cx, cy); g.lineTo(cx + w * 0.1, cy - h * 0.2); g.stroke();
  g.fillStyle = '#e8b81c';
  g.fillRect(cx - w * 0.03, cy - h * 0.02, w * 0.06, h * 0.2);
  g.strokeStyle = '#1b1b1b'; g.lineWidth = h * 0.055;
  g.beginPath(); g.moveTo(cx, cy + h * 0.17); g.lineTo(cx - w * 0.06, cy + h * 0.38); g.moveTo(cx, cy + h * 0.17); g.lineTo(cx + w * 0.09, cy + h * 0.3); g.stroke();
  g.fillStyle = '#e9c9a8';
  g.beginPath(); g.arc(cx + w * 0.005, cy - h * 0.08, h * 0.045, 0, Math.PI * 2); g.fill();
  // los jugadores de la izquierda, a lápiz
  g.strokeStyle = 'rgba(60,60,60,.7)'; g.lineWidth = h * 0.03;
  for (const [x, y] of [[w * 0.12, h * 0.45], [w * 0.22, h * 0.5]]) {
    g.beginPath(); g.arc(x, y - h * 0.16, h * 0.04, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.moveTo(x, y - h * 0.12); g.lineTo(x, y + h * 0.08); g.lineTo(x - w * 0.03, y + h * 0.26);
    g.moveTo(x, y + h * 0.08); g.lineTo(x + w * 0.035, y + h * 0.25); g.moveTo(x - w * 0.04, y - h * 0.05); g.lineTo(x + w * 0.04, y - h * 0.08); g.stroke();
  }
  // el balón gris del medio y las palabras
  g.fillStyle = 'rgba(90,90,90,.75)';
  g.beginPath(); g.arc(w * 0.47, h * 0.62, h * 0.09, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#c8202a';
  g.font = `italic 700 ${Math.round(h * 0.09)}px Georgia, serif`;
  g.textAlign = 'center';
  g.fillText('Esfuerzo', w * 0.5, h * 0.09);
  g.fillStyle = '#2a2a2a';
  g.font = `italic 700 ${Math.round(h * 0.1)}px Georgia, serif`;
  g.fillText('Pasión', w * 0.62, h * 0.86);
}

let BLANCO_T, CHAPA, REJA, VENTANA, LAMAS, MURAL;

// ——— piezas ———

function pared(k, L) {
  const zp = Z + 0.012;
  tira(k, 0, L, 0, Z / 2, H, Z, BLANCO);
  k.block(L / 2, Z / 2, L, Z);
  lienzoCorrido(k, 0, L, 0, CHAPA_Y, zp, BLANCO_T);
  lienzoCorrido(k, 0, L, CHAPA_Y, H, zp + 0.03, CHAPA);
  tira(k, 0, L, CHAPA_Y - 0.1, Z + 0.06, 0.12, 0.12, 0xe2e0d8, k.solid);
}

function burgos(k) {
  const L = BURGOS.len, zp = Z + 0.02;
  pared(k, L);
  const anchos = [1.6, 2.2, 1.2, 1.6, 1.0, 1.4, 1.4, 1.0, 1.6, 2.2, 1.6, 1.2];
  anchos.forEach((w, i) => k.pic(2.5 + i * 4.4, 2.3, zp, w, 0.75, 0, 1, REJA));
  k.pic(45.5, 5.0, zp + 0.004, 15, 5.4, 0, 1, MURAL);
}

function romero(k) {
  const L = ROMERO.len, zp = Z + 0.02;
  pared(k, L);
  // la punta del sur: la puerta y las rejillas de lamas
  k.pic(2.6, 1.15, zp, 1.4, 2.3, 0, 1, LAMAS);
  for (const s of [1.2, 3.4]) k.pic(s, 3.4, zp, 1.6, 1.0, 0, 1, LAMAS);
  for (let s = 8; s < L - 3; s += 7) {
    k.pic(s, 4.3, zp, 3.6, 0.55, 0, 1, REJA);
    k.pic(s + 1.2, 6.6, zp, 1.9, 1.0, 0, 1, VENTANA);
  }
}

function lisa(k) {
  pared(k, k._L);
}

export function buildPabellonTiterroy(scene, colliders, map) {
  if (!map?.pabellonTiterroy) return null;
  BLANCO_T = canvasTex(128, 128, blanco);
  CHAPA = canvasTex(160, 96, chapa);
  REJA = canvasTex(96, 40, reja);
  VENTANA = canvasTex(80, 44, ventana);
  LAMAS = canvasTex(64, 80, lamas);
  MURAL = canvasTex(900, 324, mural);
  return [[BURGOS, burgos], [ROMERO, romero], [SURESTE, lisa], [SUROESTE, lisa]].map(([M, f], i) => {
    const k = new Kit();
    k._L = M.len;
    f(k);
    juntarLienzos(k);
    const g = enMarco(k, M, 'pabellonTiterroy' + i, colliders);
    scene.add(g);
    return g;
  });
}
