import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * Karma Lanzarote, el restaurante y bar de copas del edificio del norte de la Marina Lanzarote, con la foto
 * de Google Maps de septiembre de 2025 (solo se mira, no va dentro del juego; la gente de la foto no se
 * pone): la terraza cubierta bajo la banda color arena del edificio, con el techo de lamas blancas y sus
 * tiras de luz verde, el helecho colgado, el murete blanco lleno de plantas tropicales, las letras grandes
 * «KARMA» de color cobre con el borde de luz blanca y su logo de flechas, y detrás la cristalera con el
 * local por dentro. El bloque se queda como está.
 */

// la cara del edificio del norte de la Marina (s desde el extremo del oeste); el rótulo del mapa cae en s 5,2
const K = marco([1005.89, 128.52], [1029.06, 141.65]);
const Z = 0.12, S0 = 0.6, S1 = 15.0, FUERA = 3.4, TECHO = 3.3, ARENA = 0xd8b89a, BLANCO = 0xf2f2ee;

/** antes de levantar la ciudad: fuera el rótulo genérico (y su terraza genérica: Karma lleva la suya) */
export function tuneKarma(map) {
  map.karmaSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'Karma');
  if (i >= 0) map.karmaSign = map.signs.splice(i, 1)[0];
  map.karma = true;
}

// ——— lo que se pinta en lienzo ———

/** el local por la cristalera: oscuro, con la barra iluminada, las luces de colores y las plantas */
function local(g, w, h) {
  g.fillStyle = '#141820';
  g.fillRect(0, 0, w, h);
  const luz = g.createLinearGradient(0, 0, w, 0);
  luz.addColorStop(0, 'rgba(40,200,180,.35)');
  luz.addColorStop(0.5, 'rgba(90,60,200,.3)');
  luz.addColorStop(1, 'rgba(40,200,180,.35)');
  g.fillStyle = luz;
  g.fillRect(0, 0, w, h * 0.5);
  g.fillStyle = '#d8d0c0';
  g.fillRect(w * 0.2, h * 0.55, w * 0.6, h * 0.12);
  g.fillStyle = '#e8c070';
  for (let x = 0.22; x < 0.78; x += 0.04) g.fillRect(w * x, h * 0.4, w * 0.012, h * 0.12);
  g.fillStyle = '#1e4a2a';
  for (const x of [0.06, 0.92]) g.fillRect(w * x, h * 0.45, w * 0.03, h * 0.55);
  g.fillStyle = 'rgba(255,255,255,.08)';
  g.fillRect(0, 0, w * 0.3, h);
}

/** la banda color arena del edificio, encima de la terraza */
function banda(g, w, h) {
  g.fillStyle = '#d8b89a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(120,90,70,.12)';
  for (let x = 0; x < w; x += w / 6) g.fillRect(x, 0, 2, h);
  g.fillStyle = 'rgba(255,255,255,.15)';
  g.fillRect(0, 0, w, h * 0.08);
}

/** el lienzo de las letras y el logo: cobre con el borde de luz blanca, en fondo transparente */
function letrasKarma() {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 256;
  const g = c.getContext('2d');
  g.clearRect(0, 0, c.width, c.height);
  // letra fina, con las A sin raya como en el cartel de verdad
  g.font = `300 ${Math.round(c.height * 0.8)}px "Century Gothic", "Futura", "Segoe UI Light", Arial, sans-serif`;
  g.textAlign = 'left';
  g.textBaseline = 'alphabetic';
  g.letterSpacing = '12px';
  g.lineJoin = 'miter';
  g.lineWidth = 12;
  g.strokeStyle = '#fff8ee';
  g.strokeText('KΛRMΛ', 16, c.height * 0.9);
  g.fillStyle = '#b8683a';
  g.fillText('KΛRMΛ', 16, c.height * 0.9);
  // el logo de las flechas, después del nombre
  const x0 = Math.min(c.width - c.height * 0.7, 16 + g.measureText('KΛRMΛ').width + 10), y0 = c.height * 0.14, a = c.height * 0.76;
  for (const dx of [0, a * 0.3]) {
    g.beginPath();
    g.moveTo(x0 + dx, y0); g.lineTo(x0 + dx + a * 0.36, y0 + a / 2); g.lineTo(x0 + dx, y0 + a);
    g.lineTo(x0 + dx + a * 0.09, y0 + a); g.lineTo(x0 + dx + a * 0.45, y0 + a / 2); g.lineTo(x0 + dx + a * 0.09, y0);
    g.closePath();
    g.lineWidth = 8;
    g.stroke();
    g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

// ——— las piezas ———

/** la terraza: la cristalera, la banda de arriba, el techo de lamas, los pilares, el murete y las plantas */
function terraza(k) {
  const sm = (S0 + S1) / 2, L = S1 - S0;
  // la cristalera del local, al fondo
  k.pic(sm, TECHO / 2, Z + 0.01, L, TECHO, 0, 1, canvasTex(640, 150, local), { glow: 0.12 });
  // la banda color arena, del fondo hacia fuera hasta encima de los pilares
  k.box(sm, TECHO, Z + FUERA / 2, L + 0.4, 1.4, FUERA + 0.3, ARENA);
  k.pic(sm, TECHO + 0.7, Z + FUERA + 0.155, L + 0.4, 1.4, 0, 1, canvasTex(640, 56, banda));
  // el techo de lamas blancas, del fondo hacia fuera, con la luz verde por debajo de cada una
  for (let s = S0 + 0.2; s < S1; s += 0.36) {
    k.box(s, TECHO - 0.14, Z + FUERA / 2, 0.07, 0.14, FUERA, BLANCO);
    k.box(s, TECHO - 0.16, Z + FUERA / 2, 0.03, 0.02, FUERA - 0.2, 0x48eaa8, { list: k.glow });
  }
  // los pilares blancos de delante
  for (const s of [S0 + 0.2, sm, S1 - 0.2]) { k.box(s, 0, Z + FUERA - 0.1, 0.3, TECHO, 0.3, BLANCO); k.block(s, Z + FUERA - 0.1, 0.3, 0.3); }
  // el murete blanco de la terraza con las plantas tropicales
  k.box(sm, 0, Z + FUERA - 0.1, L - 1.6, 1.05, 0.45, BLANCO);
  k.block(sm, Z + FUERA - 0.1, L - 1.6, 0.45);
  let s0 = 41;
  const r = () => (s0 = (s0 * 16807) % 2147483647) / 2147483647;
  for (let s = S0 + 1.2; s < S1 - 1; s += 0.55) {
    const alto = 0.4 + r() * 0.7;
    k.ball(s, 1.05 + alto * 0.5, Z + FUERA - 0.1, 0.25 + r() * 0.2, [0x2a7a3a, 0x3a8a2a, 0x1e6a4a][Math.floor(r() * 3)], { seg: 7 });
  }
  // el helecho colgado del techo, en medio
  k.box(sm - 1.5, TECHO - 0.6, Z + 1.6, 0.02, 0.5, 0.02, 0x3a3a3a);
  for (let i = 0; i < 9; i++) k.ball(sm - 1.5 + (r() - 0.5) * 1.1, TECHO - 0.9 - r() * 0.6, Z + 1.6 + (r() - 0.5) * 0.9, 0.22 + r() * 0.12, 0x3a8a3a, { seg: 6 });
}

/** las letras «KARMA» y el logo delante del murete, con varias capas para que tengan grosor */
function letras(group) {
  const tex = letrasKarma();
  const clara = new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide });
  const plano = new THREE.PlaneGeometry(6.4, 1.6);
  const cartel = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const m = new THREE.Mesh(plano, clara);
    m.position.z = -i * 0.03;
    cartel.add(m);
  }
  // en el marco: s 6,8, delante del murete, con la base un poco por encima del suelo
  const [x, z] = K.W(6.8, Z + FUERA + 0.35);
  cartel.position.set(x, 0.85, z);
  cartel.rotation.y = K.ry;
  group.add(cartel);
}

/** se monta con lo demás de Valterra, en su primera fase */
export function buildKarma(scene, colliders, map) {
  if (!map?.karma) return null;
  const k = new Kit();
  terraza(k);
  const group = new THREE.Group();
  group.add(enMarco(k, K, 'karma', colliders));
  letras(group);
  scene.add(group);
  return { group };
}
