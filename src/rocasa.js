import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * Rocasa, la tienda de menaje y bazar de la esquina de la calle León y Castillo 34 con Emilio Ley (centro), con la
 * foto de Google Maps de marzo de 2017 (después de la reforma) y la vista de la calle de junio de 2012 (solo se
 * miran, no van dentro del juego; la gente de la foto no se pone): la esquina blanca con el machón de piedra
 * volcánica oscura; los escaparates grandes de cristal con el bajo verde y la tienda llena dentro (las baldas,
 * las lámparas naranjas colgadas, el cartel verde de los años); encima de cada escaparate, el toldillo rojo; la
 * banda gruesa color naranja rojizo que corre por las dos caras; y arriba, la banda blanca con «Rocasa» en letras
 * verdes en cada cara (escrito, sin el logotipo). En la cara de Emilio Ley, la entrada de cristal. El bloque se
 * queda como está; la tienda va un poco adelantada para tapar sus pilastras y su cornisa.
 */

const ESQ = [86.77, 199.46];
// la cara de León y Castillo (s de norte a sur; la esquina cae en s 53,2) y la de Emilio Ley (s desde la esquina)
const LEON = marco([68.35, 149.56], ESQ);
const EMILIO = marco(ESQ, [114.33, 189.29]);
// el bloque del mapa tiene pilastras y una cornisa que salen; la tienda se adelanta para quedar por delante
const Z = 0.9, ZF = Z + 0.3, BLANCO = 0xf4f4f0, NARANJA = 0xe0502a, ROJO = 0xd8402a, VERDE = 0x1e7a46;
const YV = 2.55, YB = 2.9, YF = 3.25, YT = 4.15;

/** antes de levantar la ciudad: fuera el rótulo genérico */
export function tuneRocasa(map) {
  map.rocasaSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'Rocasa');
  if (i >= 0) map.rocasaSign = map.signs.splice(i, 1)[0];
  map.rocasa = true;
}

// ——— lo que se pinta en lienzo ———

/** la banda blanca con «Rocasa» en verde */
function nombre(g, w, h) {
  g.fillStyle = '#f4f4f0';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#1e7a46';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `italic 700 ${Math.round(h * 0.55)}px "Trebuchet MS", "Segoe UI", Arial, sans-serif`;
  g.fillText('Rocasa', w / 2, h * 0.5);
}

/** la tienda por el escaparate: las baldas llenas, las lámparas naranjas y el cartel verde */
function tienda(g, w, h) {
  g.fillStyle = '#e8e4dc';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#f8f8f6';
  g.fillRect(0, 0, w, h * 0.12);
  let s = 6;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const col = ['#c8c8c8', '#d89a7a', '#9ab0c8', '#f2f2ee', '#b8c8a0', '#d8c8a8', '#7a7a7a'];
  for (let y = 0.25; y < 0.8; y += 0.1) for (let x = 0.02; x < 0.98; x += 0.035) { g.fillStyle = col[Math.floor(r() * 7)]; g.fillRect(w * x, h * y, w * 0.028, h * 0.07); }
  // las lámparas naranjas colgadas y el cartel verde
  for (const x of [0.15, 0.4, 0.62, 0.85]) {
    g.strokeStyle = '#3a3a3a'; g.lineWidth = 1;
    g.beginPath(); g.moveTo(w * x, 0); g.lineTo(w * x, h * 0.2); g.stroke();
    g.fillStyle = '#f08a2a';
    g.beginPath(); g.arc(w * x, h * 0.24, w * 0.035, Math.PI, 0); g.fill();
  }
  g.fillStyle = '#1e7a46';
  g.fillRect(w * 0.5, h * 0.18, w * 0.09, h * 0.28);
  g.fillStyle = '#f4f4f0';
  g.fillRect(w * 0.52, h * 0.26, w * 0.05, h * 0.08);
  g.fillStyle = '#b8b0a4';
  g.fillRect(0, h * 0.88, w, h * 0.12);
  g.fillStyle = 'rgba(255,255,255,.15)';
  g.fillRect(0, 0, w * 0.3, h);
}

/** la piedra volcánica oscura del machón */
function piedra(g, w, h) {
  g.fillStyle = '#4a4644';
  g.fillRect(0, 0, w, h);
  let s = 8;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 40; i++) {
    const v = 50 + r() * 50;
    g.fillStyle = `rgb(${v},${v - 4},${v - 6})`;
    g.beginPath(); g.ellipse(r() * w, r() * h, w * (0.08 + r() * 0.1), h * (0.04 + r() * 0.05), r(), 0, Math.PI * 2); g.fill();
  }
  g.strokeStyle = 'rgba(200,200,200,.3)';
  g.lineWidth = 1;
  for (let i = 0; i < 12; i++) { g.beginPath(); g.moveTo(r() * w, r() * h); g.lineTo(r() * w, r() * h); g.stroke(); }
}

// ——— las piezas ———

/** un tramo de la tienda: la pared, los escaparates con su toldillo, la banda naranja y la banda blanca con el
 *  nombre; huecos [s0, s1, tipo] con tipo «e» (escaparate) o «p» (puerta) */
function tramo(k, S0, S1, huecos, sNombre, pt, tt) {
  let s = S0;
  for (const [a, b] of [...huecos, [S1, S1]]) {
    if (a > s) k.box((s + a) / 2, 0, (Z + 0.3) / 2, a - s, YB, Z + 0.3, BLANCO);
    s = b;
  }
  for (const [a, b, tipo] of huecos) {
    const m = (a + b) / 2, base = tipo === 'e' ? 0.45 : 0;
    k.pic(m, base + (YV - base) / 2, Z + 0.02, b - a, YV - base, 0, 1, tt, { glow: 0.2 });
    for (const t of [a, b]) k.box(t, 0, Z / 2, 0.06, YV, Z, BLANCO);
    k.box(m, YV, Z / 2, b - a, 0.2, Z, BLANCO);
    if (base) k.box(m, 0, Z + 0.1, b - a, base, 0.12, VERDE);
    for (const t of [a, b]) k.box(t, 0, Z + 0.12, 0.08, YV, 0.12, 0x6a6c70);
    k.box(m, YV - 0.05, Z + 0.12, b - a, 0.08, 0.12, 0x6a6c70);
    if (tipo === 'p') k.box(m, 0, Z + 0.1, 0.05, YV, 0.08, 0x6a6c70);
    // el toldillo rojo inclinado
    const tela = new THREE.BoxGeometry(b - a, 0.03, 0.62);
    tela.rotateX(0.5);
    tela.translate(m, YV + 0.15, ZF + 0.26);
    k.add(tela, ROJO);
    k.box(m, YV + 0.25, (Z + 0.3) / 2, b - a, YB - YV - 0.25, Z + 0.3, BLANCO);
  }
  k.block((S0 + S1) / 2, (Z + 0.3) / 2, S1 - S0, Z + 0.3);
  // la banda naranja rojiza y la blanca de arriba con el nombre
  k.box((S0 + S1) / 2, YB, Z + 0.3, S1 - S0, YF - YB, 0.6, NARANJA);
  k.box((S0 + S1) / 2, YF, (Z + 0.4) / 2, S1 - S0, YT - YF, Z + 0.4, BLANCO);
  k.pic(sNombre, (YF + YT) / 2, Z + 0.41, 3.0, YT - YF - 0.1, 0, 1, canvasTex(360, 100, nombre));
}

/** la cara de León y Castillo: el escaparate largo hasta el machón de la esquina */
function caraLeon(k, pt, tt) {
  // llega hasta s 54,1 para cerrar la esquina (la tienda va adelantada 0,9 m)
  tramo(k, 44.0, 54.1, [[45.0, 51.9, 'e']], 52.2, pt, tt);
  // el machón de piedra de la esquina
  k.box(53.0, 0, ZF + 0.02, 2.2, 1.15, 0.06, 0x4a4644);
  k.pic(53.0, 0.575, ZF + 0.055, 2.2, 1.15, 0, 1, pt);
}

/** la cara de Emilio Ley: el machón, la entrada de cristal y el escaparate pequeño */
function caraEmilio(k, pt, tt) {
  tramo(k, 0, 7.0, [[1.2, 3.6, 'p'], [3.9, 6.2, 'e']], 5.0, pt, tt);
  k.box(0.6, 0, ZF + 0.02, 1.2, 1.15, 0.06, 0x4a4644);
  k.pic(0.6, 0.575, ZF + 0.055, 1.2, 1.15, 0, 1, pt);
}

/** se monta con lo demás de Arrecife Centro: las dos caras de la esquina */
export function buildRocasa(scene, colliders, map) {
  if (!map?.rocasa) return null;
  const pt = canvasTex(100, 90, piedra), tt = canvasTex(320, 200, tienda);
  const partes = [];
  for (const [M, nom, hacer] of [[LEON, 'rocasaLeon', caraLeon], [EMILIO, 'rocasaEmilio', caraEmilio]]) {
    const k = new Kit();
    hacer(k, pt, tt);
    const group = enMarco(k, M, nom, colliders);
    scene.add(group);
    partes.push(group);
  }
  return { partes };
}
