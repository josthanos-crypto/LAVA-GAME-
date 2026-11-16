import * as THREE from 'three';
import { Kit, canvasTex, glowMaterial } from './interiorKit.js';
import { windowGlow } from './realism.js';
import { findBuilding } from './civic.js';

/**
 * El Nuevo Maccheroni por fuera, como en las fotos de José Manuel (referencias/maccheroni-*.jpg).
 * Edificio de estuco ocre en la esquina de Manolo Millares con la calle Valencia. Delantera
 * (Manolo Millares): madera barnizada, dos escaparates con los vinilos «El Nuevo» y «Maccheroni»,
 * puerta de cristal con abanico, faroles, toldo blanco, cornisa crema y el rótulo de verdad
 * (recortado de la foto: public/brand/maccheroni-rotulo.webp). Lateral (calle Valencia):
 * cristaleras con «Restaurante», «Pizzería» y «Comida para llevar», zócalo de piedra clara,
 * pizarra con la carta y la terraza: mesa larga con bancos, sombrillas blancas por fuera y rojas
 * por dentro, jardineras de madera con ficus, guirnaldas de bombillas y farola negra.
 * Medidas sacadas de las fotos (la puerta y las sillas de referencia): el local mide unos 6,8 m de
 * delantera; el resto, hasta los 9,5 m de la fachada del edificio, es el kebab de al lado.
 */

const CORNER = [-585.29, 365.42];              // esquina de Manolo Millares con la calle Valencia
const SOUTH_END = [-583.86, 379.83];           // donde acaba el lateral del edificio (calle Valencia)
const N_FRONT = [-0.0938, -0.9956];            // la delantera mira a Manolo Millares (norte)
const N_SIDE = [0.9951, -0.0988];              // el lateral mira a la calle Valencia (este)
const FRONT_W = 9.49, SIDE_W = 14.48;          // largo de las dos fachadas del edificio
const SHOP_W = 6.8;                            // delantera del local, desde la esquina
const SIDE_SHOP = 9.6;                         // lateral del local, desde la esquina
export const MACCHERONI_DOOR_SHIFT = -1.83;    // la puerta, en el centro de la delantera (locales.js)

const OCHRE = 0xe9b06c, WOOD = 0x8f4526, WOOD_DK = 0x5e2a16, CREAM = 0xf0ddc8, FRAME = 0x2b1e1b;
const AWNING = 0xf6f1ea, STONE = 0xcdc4b6, LEAF = 0x3b6a33, LOG = 0x8a5732, BLACK = 0x1c1d1f;
const SCRIPT = '"Yellowtail", "Brush Script MT", cursive';

/** el edificio del Maccheroni es de estuco ocre (antes de levantar la ciudad) y su terraza */
export function tuneMaccheroni(map) {
  const b = findBuilding(map, CORNER[0] - 5, CORNER[1] + 5);
  if (b) b.f = [236, 166, 86];
  // sillas y mesas que salen volando si las atropellas (props.js): delante, dos mesas con dos sillones
  // negros; en el lateral, mesas junto a la acera y las sombrillas
  const P = (map.extraProps ||= []);
  const at = (n, origin, x, z) => [origin[0] + n[1] * x + n[0] * z, origin[1] - n[0] * x + n[1] * z];
  const face = (from, to) => Math.atan2(to[0] - from[0], to[1] - from[1]);
  const set = (n, origin, x, z, chairs) => {
    const [tx, tz] = at(n, origin, x, z);
    P.push({ t: 'sqtable', x: tx, z: tz, a: Math.atan2(n[0], n[1]) });
    for (const [cx, cz] of chairs) {
      const c = at(n, origin, x + cx, z + cz);
      P.push({ t: 'armchair', x: c[0], z: c[1], a: face(c, [tx, tz]), c: 0x232527 });
    }
  };
  set(N_FRONT, CORNER, 1.45, 1.05, [[-0.62, 0], [0.62, 0]]);
  set(N_FRONT, CORNER, 5.8, 1.05, [[-0.62, 0], [0.62, 0]]);
  const sd = (d) => SIDE_W - d;                 // en el lateral, distancia desde la esquina
  set(N_SIDE, SOUTH_END, sd(9.2), 2.5, [[0, 0.62], [0.55, -0.55], [-0.55, -0.55]]);
  set(N_SIDE, SOUTH_END, sd(10.8), 2.5, [[0, 0.62], [0.55, -0.55], [-0.55, -0.55]]);
  for (const d of [5.6, 10.0]) {
    const [x, z] = at(N_SIDE, SOUTH_END, sd(d), d < 6 ? 3.05 : 2.5);
    P.push({ t: 'parasol', x, z, a: Math.atan2(N_SIDE[0], N_SIDE[1]) });
  }
}

// ── lienzos ──

/** tablones verticales de madera barnizada (pilares y paneles) */
function woodPlanks(g, W, H) {
  g.fillStyle = '#8a4426'; g.fillRect(0, 0, W, H);
  let x = 0, i = 0;
  while (x < W) {
    const w = 16 + ((i * 7) % 5);
    const v = ((i * 37) % 11) - 5;
    g.fillStyle = `rgb(${142 + v * 3},${68 + v * 2},${36 + v})`;
    g.fillRect(x, 0, w - 2, H);
    g.strokeStyle = 'rgba(60,24,10,.18)'; g.lineWidth = 1;
    for (let k = 0; k < 3; k++) {
      g.beginPath();
      const gx = x + 3 + k * (w / 3);
      g.moveTo(gx, 0);
      for (let y = 0; y <= H; y += 32) g.lineTo(gx + Math.sin(y * 0.02 + i + k) * 1.5, y);
      g.stroke();
    }
    g.fillStyle = 'rgba(40,14,6,.55)'; g.fillRect(x + w - 2, 0, 2, H);
    x += w; i++;
  }
  // brillo del barniz
  const sh = g.createLinearGradient(0, 0, 0, H);
  sh.addColorStop(0, 'rgba(255,220,180,.10)'); sh.addColorStop(0.5, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,.12)');
  g.fillStyle = sh; g.fillRect(0, 0, W, H);
}

/** lo que se ve por el cristal: sala cálida con lámparas de mimbre y la barra con botellas */
function interior(g, W, H) {
  const bg = g.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#6e4a30'); bg.addColorStop(0.55, '#8a6040'); bg.addColorStop(1, '#3a2418');
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  // estantería con botellas al fondo
  g.fillStyle = '#2e1d14'; g.fillRect(W * 0.08, H * 0.28, W * 0.84, H * 0.3);
  for (let r = 0; r < 3; r++) {
    for (let k = 0; k < 18; k++) {
      const bx = W * 0.1 + k * W * 0.045, by = H * (0.3 + r * 0.095);
      g.fillStyle = ['#2f5a34', '#5a2020', '#c9b98a', '#203040', '#7a5a2a'][(k + r * 2) % 5];
      g.fillRect(bx, by, W * 0.022, H * 0.07);
    }
  }
  // lámparas de mimbre
  for (const fx of [0.25, 0.62, 0.88]) {
    g.strokeStyle = '#1a120c'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(W * fx, 0); g.lineTo(W * fx, H * 0.1); g.stroke();
    const lg = g.createRadialGradient(W * fx, H * 0.16, 2, W * fx, H * 0.16, W * 0.09);
    lg.addColorStop(0, '#ffe6b0'); lg.addColorStop(1, 'rgba(255,200,120,0)');
    g.fillStyle = lg; g.fillRect(W * (fx - 0.12), H * 0.04, W * 0.24, H * 0.3);
    g.fillStyle = '#c9a36a';
    g.beginPath(); g.ellipse(W * fx, H * 0.14, W * 0.055, H * 0.05, 0, Math.PI, 0); g.fill();
  }
  // mesas y sillas
  for (const fx of [0.2, 0.55, 0.85]) {
    g.fillStyle = '#e8e0d0'; g.fillRect(W * (fx - 0.09), H * 0.74, W * 0.18, H * 0.03);
    g.fillStyle = '#1e1a18'; g.fillRect(W * (fx - 0.01), H * 0.77, W * 0.02, H * 0.2);
    g.fillRect(W * (fx - 0.16), H * 0.66, W * 0.05, H * 0.3); g.fillRect(W * (fx + 0.11), H * 0.66, W * 0.05, H * 0.3);
  }
}

/** vinilo esmerilado del escaparate, con su letrero de letra de mano y una raya oscura debajo */
function frosted(text, { logo = false, sub = '' } = {}) {
  return (g, W, H) => {
    g.fillStyle = '#dfe4e4'; g.fillRect(0, 0, W, H);
    const fr = g.createLinearGradient(0, 0, 0, H);
    fr.addColorStop(0, 'rgba(255,255,255,.35)'); fr.addColorStop(1, 'rgba(150,160,165,.25)');
    g.fillStyle = fr; g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(60,66,70,.85)'; g.fillRect(0, H * 0.3, W, H * 0.025);
    g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    const size = Math.min(H * 0.34, W / Math.max(4, text.length * 0.42));
    g.font = `${size}px ${SCRIPT}`;
    g.lineJoin = 'round';
    g.strokeStyle = '#2f3438'; g.lineWidth = size * 0.11;
    g.strokeText(text, W / 2, H * 0.27);
    g.fillStyle = '#f6f8f8';
    g.fillText(text, W / 2, H * 0.27);
    if (sub) {
      g.font = `${size * 0.75}px ${SCRIPT}`;
      g.strokeText(sub, W / 2, H * 0.52); g.fillText(sub, W / 2, H * 0.52);
    }
    if (logo) {
      // el tenedor con los espaguetis enrollados del logo
      g.strokeStyle = '#2f3438'; g.lineWidth = H * 0.018; g.lineCap = 'round';
      const x0 = W * 0.12, y0 = H * 0.42;
      for (let k = 0; k < 4; k++) {
        g.beginPath(); g.moveTo(x0 + k * W * 0.025, y0); g.quadraticCurveTo(x0 + k * W * 0.03 + W * 0.01, y0 + H * 0.12, x0 + k * W * 0.035 + W * 0.02, y0 + H * 0.24); g.stroke();
      }
      g.beginPath(); g.moveTo(x0 + W * 0.13, y0 + H * 0.12); g.lineTo(W * 0.95, y0 + H * 0.02); g.stroke();
      g.beginPath(); g.moveTo(x0 + W * 0.13, y0 + H * 0.17); g.lineTo(W * 0.95, y0 + H * 0.07); g.stroke();
      g.beginPath(); g.moveTo(x0 + W * 0.09, y0 + H * 0.24); g.bezierCurveTo(x0 + W * 0.05, y0 + H * 0.4, x0 + W * 0.16, y0 + H * 0.42, x0 + W * 0.12, y0 + H * 0.3); g.stroke();
    }
  };
}

/** montante de arriba: cristal oscuro con dos franjas esmeriladas */
function transom(g, W, H) {
  g.fillStyle = '#26323a'; g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(220,228,230,.75)'; g.fillRect(0, H * 0.3, W, H * 0.12); g.fillRect(0, H * 0.6, W, H * 0.12);
}

/** la placa de restaurante de Canarias, marrón con la R blanca */
function rPlaque(g, W, H) {
  g.fillStyle = '#b8743a'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#7a4a24'; g.fillRect(0, 0, W, H * 0.22);
  g.fillStyle = '#ffffff'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = `600 ${H * 0.62}px "Barlow Condensed", Arial, sans-serif`;
  g.fillText('R', W / 2, H * 0.6);
}

/** la pizarra de pie de la carta: la carta arriba y la foto de la parrilla abajo */
function menuBoard(g, W, H) {
  g.fillStyle = '#f4efe4'; g.fillRect(0, 0, W, H * 0.6);
  g.fillStyle = '#d8271c'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = `${H * 0.05}px ${SCRIPT}`;
  g.fillText('El Nuevo Maccheroni', W / 2, H * 0.05);
  g.fillStyle = '#3a3330';
  const cols = [['Raviolis de carne', 'Raviolis de ricotta', 'Raviolis negros', 'Tagliatelle al pesto', 'Spaghetti carbonara', 'Lasaña de carne'],
    ['Margherita', 'Prosciutto', 'Napoletana', 'Quattro formaggi', 'Pizza Elvis', 'De la casa'],
    ['Focaccia', 'Carpaccio', 'Provolone', 'Tiramisú', 'Tarta de queso', 'Tres leches']];
  g.font = `600 ${H * 0.021}px "Barlow Condensed", Arial, sans-serif`;
  cols.forEach((c, i) => c.forEach((t, k) => g.fillText(t, W * (0.18 + i * 0.32), H * (0.13 + k * 0.075))));
  g.fillStyle = '#c9c0b0';
  for (const x of [0.34, 0.66]) g.fillRect(W * x - 1, H * 0.1, 2, H * 0.46);
  // la parrilla
  const fire = g.createLinearGradient(0, H * 0.6, 0, H);
  fire.addColorStop(0, '#1a1210'); fire.addColorStop(0.6, '#5a1e0a'); fire.addColorStop(1, '#f08a1c');
  g.fillStyle = fire; g.fillRect(0, H * 0.6, W, H * 0.4);
  g.fillStyle = '#6a3a22'; g.beginPath(); g.ellipse(W * 0.6, H * 0.83, W * 0.25, H * 0.07, -0.1, 0, Math.PI * 2); g.fill();
  g.strokeStyle = 'rgba(30,20,16,.8)'; g.lineWidth = 3;
  for (let k = 0; k < 7; k++) { g.beginPath(); g.moveTo(W * (0.38 + k * 0.07), H * 0.76); g.lineTo(W * (0.33 + k * 0.07), H * 0.9); g.stroke(); }
  g.fillStyle = '#ffffff'; g.textAlign = 'left';
  g.font = `800 ${H * 0.03}px "Barlow Condensed", Arial, sans-serif`;
  ['Restaurante', 'Pizzería', 'Grill'].forEach((t, k) => g.fillText(t, W * 0.06, H * (0.66 + k * 0.04)));
}

// ── piezas ──

/** marco de carpintería oscura: los cuatro lados de un hueco (x centro, y0 abajo) */
function frame(k, x, y0, w, h, z, t = 0.06) {
  k.box(x - w / 2 + t / 2, y0, z, t, h, 0.05, FRAME).box(x + w / 2 - t / 2, y0, z, t, h, 0.05, FRAME);
  k.box(x, y0, z, w, t, 0.05, FRAME).box(x, y0 + h - t, z, w, t, 0.05, FRAME);
}

/** escaparate: interior detrás, vinilo esmerilado abajo, cristal y marco (de y0 a y1) */
function shopWindow(k, x, w, y0, y1, vinyl, vinylH) {
  k.pic(x, (y0 + y1) / 2, 0.183, w, y1 - y0, 0, 1, canvasTex(512, 384, interior), { glow: 0.12 });
  k.pic(x, y0 + vinylH / 2, 0.186, w - 0.08, vinylH, 0, 1, canvasTex(768, Math.round(768 * vinylH / w), vinyl));
  k.box(x, y0, 0.19, w, y1 - y0, 0.01, 0, { list: k.glass });
  frame(k, x, y0, w, y1 - y0, 0.205);
}

/** farol de pared de latón oscuro, con su brazo */
function lantern(k, x, y) {
  k.box(x, y + 0.34, 0.24, 0.04, 0.04, 0.28, 0x2a2018);
  k.box(x, y, 0.36, 0.2, 0.05, 0.2, 0x2a2018);
  k.box(x, y + 0.05, 0.36, 0.15, 0.24, 0.15, 0xffd9a0, { list: k.glow });
  k.cyl(x, y + 0.29, 0.36, 0.02, 0.14, 0.1, 0x2a2018, { seg: 4, ry: Math.PI / 4 });
}

/** jardinera de troncos con dos ficus (tronco claro y copa redonda) */
function planter(k, x, z, ry = 0) {
  const c = Math.cos(ry), s = Math.sin(ry);
  const off = (u) => [x + u * c, z - u * s];
  k.box(x, 0, z, 1.7, 0.55, 0.6, LOG, { ry });
  for (const y of [0.13, 0.27, 0.41]) k.box(x, y, z, 1.72, 0.03, 0.62, 0x6a4024, { ry });
  for (const u of [-0.45, 0.45]) {
    const [px, pz] = off(u);
    k.cyl(px, 0.55, pz, 0.04, 0.06, 1.0, 0x9a8a70, { seg: 8 });
    // copa de ficus: muchas matas pequeñas en columna, de 1,3 m a 3,1 m
    for (let i = 0; i < 14; i++) {
      const a = i * 2.4 + u * 3, y = 1.4 + (i % 7) * 0.26, r = 0.28 + ((i * 5) % 3) * 0.05;
      const sp = 0.28 * Math.sin(Math.PI * (y - 1.2) / 2.1);
      k.ball(px + Math.cos(a) * sp, y, pz + Math.sin(a) * sp, r, i % 3 ? LEAF : 0x4d8040, { seg: 8 });
    }
  }
  k.block(x, z, 1.7, 0.6, ry);
}

/** maceta de madera con la yuca de tres troncos (la de la puerta) */
function yucca(k, x, z) {
  k.box(x, 0, z, 0.55, 0.6, 0.55, 0x9a5a2c);
  for (const [dx, dz] of [[-0.29, -0.29], [0.29, -0.29], [-0.29, 0.29], [0.29, 0.29]]) k.box(x + dx, 0, z + dz, 0.06, 0.66, 0.06, 0x6a3a1a);
  const leaf = new THREE.ConeGeometry(0.035, 0.6, 4);
  leaf.translate(0, 0.3, 0);
  for (const [dx, dz, h, lean] of [[0.04, 0, 1.0, 0.12], [-0.05, 0.04, 1.45, -0.18], [0.02, -0.05, 1.9, 0.05]]) {
    const tx = x + dx + lean * 0.5, tz = z + dz, ty = 0.6 + h;
    k.cyl(x + dx, 0.6, z + dz, 0.035, 0.05, h, 0x8a7a62, { seg: 6 });
    for (let i = 0; i < 16; i++) {
      const g = leaf.clone();
      g.rotateZ(0.5 + (i % 3) * 0.35);
      g.rotateY(i * 2.4);
      g.translate(tx, ty, tz);
      k.add(g, i % 2 ? 0x4f8a3a : 0x3a7030);
    }
  }
  k.block(x, z, 0.55, 0.55);
}

/** mesa larga de madera con sus dos bancos (patas de hierro negro), a lo largo del eje x */
function picnic(k, x, z) {
  const top = 0xb07a42;
  k.box(x, 0.72, z, 2.6, 0.04, 0.8, top);
  for (const bz of [-0.68, 0.68]) {
    k.box(x, 0.43, z + bz, 2.6, 0.04, 0.3, top);
    for (const lx of [-1.2, 1.2]) k.box(x + lx, 0, z + bz, 0.05, 0.43, 0.3, BLACK);
  }
  for (const lx of [-1.2, 1.2]) {
    k.box(x + lx, 0, z, 0.05, 0.72, 0.7, BLACK);
    k.box(x + lx, 0.2, z, 0.05, 0.04, 1.7, BLACK);
  }
  k.block(x, z, 2.7, 1.8);
}

/** farola negra de fuste fino con farol cuadrado */
function streetLamp(k, x, z) {
  k.cyl(x, 0, z, 0.09, 0.12, 0.5, BLACK, { seg: 10 });
  k.cyl(x, 0.5, z, 0.05, 0.06, 3.3, BLACK, { seg: 8 });
  k.box(x, 3.8, z, 0.34, 0.06, 0.34, BLACK);
  k.box(x, 3.86, z, 0.28, 0.36, 0.28, 0xfff1d0, { list: k.glow });
  k.cyl(x, 4.22, z, 0.03, 0.27, 0.22, BLACK, { seg: 4, ry: Math.PI / 4 });
  k.block(x, z, 0.3, 0.3);
}

/** guirnalda de bombillas colgando entre dos puntos, con su comba */
function lights(k, a, b, sag = 0.35) {
  const n = Math.max(4, Math.round(Math.hypot(b[0] - a[0], b[2] - a[2]) / 0.55));
  let prev = null;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const p = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - Math.sin(Math.PI * t) * sag, a[2] + (b[2] - a[2]) * t];
    if (prev) {
      const dx = p[0] - prev[0], dy = p[1] - prev[1], dz = p[2] - prev[2], L = Math.hypot(dx, dy, dz);
      const g = new THREE.CylinderGeometry(0.006, 0.006, L, 3);
      g.translate(0, L / 2, 0);
      g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(dx / L, dy / L, dz / L)));
      g.translate(...prev);
      k.add(g, 0x1a1a1a);
    }
    if (i > 0 && i < n) k.ball(p[0], p[1] - 0.06, p[2], 0.035, 0xffe6a8, { list: k.glow, seg: 6 });
    prev = p;
  }
}

/** espera a la letra de mano de los vinilos (Google Fonts), como mucho 2,5 s */
async function scriptFont() {
  if (!document.fonts?.load) return;
  await Promise.race([document.fonts.load('48px "Yellowtail"').catch(() => {}), new Promise(r => setTimeout(r, 2500))]);
}

/**
 * monta las dos fachadas del local y la terraza del lateral; devuelve update() para que de noche se
 * enciendan los faroles, las bombillas, la farola, el interior y, un poco, el rótulo
 */
export async function buildMaccheroniFacade(scene, colliders) {
  await scriptFont();
  const glow = glowMaterial(0.2);
  const lit = [];
  const place = (k, origin, n, name) => {
    const { group, segs } = k.build(name, { glow });
    const ex = [n[1], -n[0]];
    group.position.set(origin[0], 0, origin[1]);
    group.rotation.y = Math.atan2(n[0], n[1]);
    scene.add(group);
    const w = (x, z) => [origin[0] + ex[0] * x + n[0] * z, origin[1] + ex[1] * x + n[1] * z];
    for (const [ax, az, bx, bz] of segs) colliders.addSegment(...w(ax, az), ...w(bx, bz));
    group.traverse((o) => { if (o.material?.emissiveMap) lit.push(o.material); });
    return group;
  };
  const wood = canvasTex(1024, 512, woodPlanks);
  const H = 3.5;                                  // hasta la cornisa

  // ── delantera (Manolo Millares): x desde la esquina hacia el kebab ──
  const F = new Kit();
  F.box(SHOP_W / 2, 0, 0.09, SHOP_W, H, 0.18, WOOD_DK, { list: F.shell });
  F.pic(SHOP_W / 2, H / 2, 0.181, SHOP_W, H, 0, 1, wood);
  // escaparates (0,68–2,21 y 5,06–6,59 m) con el dintel crema y el montante encima
  shopWindow(F, 1.445, 1.53, 0.5, 2.55, frosted('El Nuevo'), 1.1);
  shopWindow(F, 5.825, 1.53, 0.5, 2.55, frosted('Maccheroni', { logo: true }), 1.1);
  for (const [a, b] of [[0, 2.7], [4.57, SHOP_W]]) F.box((a + b) / 2, 2.55, 0.22, b - a, 0.2, 0.09, CREAM);
  for (const x of [1.445, 5.825]) {
    F.pic(x, 3.0, 0.183, 1.53, 0.42, 0, 1, canvasTex(256, 72, transom));
    frame(F, x, 2.79, 1.53, 0.42, 0.205, 0.05);
  }
  // la puerta: dos hojas de cristal, el abanico de encima con sus radios y el arco de madera
  F.pic(3.635, 1.25, 0.183, 1.87, 2.5, 0, 1, canvasTex(512, 640, interior), { glow: 0.12 });
  for (const x of [3.29, 3.98]) {
    F.box(x, 0, 0.19, 0.69, 2.45, 0.01, 0, { list: F.glass });
    frame(F, x, 0, 0.69, 2.45, 0.205, 0.06);
    F.box(x + (x < 3.6 ? 0.25 : -0.25), 0.8, 0.24, 0.03, 0.6, 0.03, 0xc9a54a);
  }
  F.box(2.81, 0, 0.2, 0.22, 2.5, 0.06, WOOD).box(4.46, 0, 0.2, 0.22, 2.5, 0.06, WOOD);
  const fan = new THREE.Shape();
  fan.absellipse(0, 0, 0.935, 0.55, 0, Math.PI, false);
  fan.lineTo(0.935, 0);
  const fanGeo = new THREE.ShapeGeometry(fan, 16);
  fanGeo.translate(3.635, 2.5, 0.19);
  F.add(fanGeo, 0x2a2520);
  for (let i = 1; i < 8; i++) {
    const a = Math.PI * i / 8, g = new THREE.BoxGeometry(0.025, 0.55, 0.03);
    g.translate(0, 0.27, 0);
    g.rotateZ(Math.PI / 2 - a);
    g.translate(3.635, 2.5, 0.205);
    F.add(g, FRAME);
  }
  const arch = new THREE.Shape();
  arch.absellipse(0, 0, 1.05, 0.66, 0, Math.PI, false);
  arch.absellipse(0, 0, 0.935, 0.55, Math.PI, 0, true);
  const archGeo = new THREE.ShapeGeometry(arch, 16);
  archGeo.translate(3.635, 2.5, 0.2);
  F.add(archGeo, WOOD);
  F.box(3.635, 2.45, 0.21, 1.9, 0.06, 0.05, FRAME);
  lantern(F, 2.43, 2.15);
  lantern(F, 4.82, 2.15);
  F.pic(0.3, 2.0, 0.19, 0.3, 0.3, 0, 1, canvasTex(128, 128, rPlaque));
  // toldo blanco recogido en su cajón y extendido 1,5 m, con el faldón delante
  F.cyl(-0.05, 3.38, 0.18, 0.09, 0.09, SHOP_W + 0.1, AWNING, { rx: Math.PI / 2, ry: Math.PI / 2, seg: 10 });
  const cloth = new THREE.BoxGeometry(SHOP_W + 0.1, 0.025, 1.5);
  cloth.translate(0, 0, 0.75);
  cloth.rotateX(0.29);
  cloth.translate(SHOP_W / 2, 3.33, 0.22);
  F.add(cloth, AWNING);
  F.box(SHOP_W / 2, 2.72, 1.66, SHOP_W + 0.1, 0.17, 0.02, AWNING);
  for (const x of [0.05, SHOP_W - 0.05]) {
    const arm = new THREE.BoxGeometry(0.03, 0.03, 1.52);
    arm.translate(0, 0, 0.76); arm.rotateX(0.29); arm.translate(x, 3.29, 0.2);
    F.add(arm, 0xb8bcc0);
  }
  // cornisa crema a todo lo largo, estuco ocre con el rótulo encima y la mancha clara detrás
  F.box(FRONT_W / 2, 3.44, 0.17, FRONT_W, 0.08, 0.34, CREAM);
  F.box(FRONT_W / 2, 3.52, 0.2, FRONT_W, 0.33, 0.4, CREAM);
  // la esquina: el pilar de madera, la cornisa y el estuco doblan hacia el lateral
  F.box(-0.09, 0, 0.09, 0.18, H, 0.18, WOOD_DK, { list: F.shell });
  F.box(-0.2, 3.44, 0.2, 0.4, 0.41, 0.4, CREAM);
  F.box(-0.05, 3.85, 0.05, 0.1, 1.85, 0.1, OCHRE, { list: F.shell });
  F.box(FRONT_W / 2, 3.85, 0.05, FRONT_W, 1.85, 0.1, OCHRE, { list: F.shell });
  F.box(3.24, 3.9, 0.105, 2.2, 0.92, 0.01, 0xead9c4, { list: F.shell });
  for (const y of [5.75, 8.75, 11.75]) F.box(FRONT_W / 2 - 0.05, y, 0.03, FRONT_W + 0.1, 0.5, 0.06, 0xf1ece2, { list: F.shell });
  yucca(F, 3.635, 0.62);
  const front = place(F, CORNER, N_FRONT, 'Maccheroni delantera');

  // el rótulo de verdad, recortado de la foto, con un canto oscuro detrás para que tenga grueso
  const signTex = new THREE.TextureLoader().load('brand/maccheroni-rotulo.webp');
  signTex.colorSpace = THREE.SRGBColorSpace;
  signTex.anisotropy = 8;
  const sw = 3.3, sh = sw * 0.38;
  const signFace = new THREE.MeshStandardMaterial({ map: signTex, alphaTest: 0.5, roughness: 0.5, emissive: 0xffffff, emissiveMap: signTex, emissiveIntensity: 0.08 });
  const signBack = new THREE.MeshStandardMaterial({ map: signTex, alphaTest: 0.5, roughness: 0.7, color: 0x3a2418 });
  for (const [mat, z] of [[signBack, 0.12], [signFace, 0.165]]) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(sw, sh), mat);
    m.position.set(3.62, 4.45, z);
    m.castShadow = true;
    front.add(m);
  }

  // ── lateral (calle Valencia): x desde el final del edificio; sd(d) = a d metros de la esquina ──
  const sd = (d) => SIDE_W - d;
  const S = new Kit();
  S.box(sd(SIDE_SHOP / 2), 0, 0.09, SIDE_SHOP, H, 0.18, WOOD_DK, { list: S.shell });
  for (const [a, b] of [[0, 0.9], [7.0, 7.3], [9.3, SIDE_SHOP]]) S.pic(sd((a + b) / 2), H / 2, 0.181, b - a, H, 0, 1, wood);
  const bays = [[0.9, 3.0, frosted('Comida para llevar', { sub: 'Take away' })], [3.0, 5.0, frosted('Pizzería')],
    [5.0, 7.0, frosted('Restaurante')], [7.3, 9.3, frosted('Maccheroni', { logo: true })]];
  for (const [a, b, vinyl] of bays) {
    shopWindow(S, sd((a + b) / 2), b - a, 0.55, 2.55, vinyl, 0.9);
    S.pic(sd((a + b) / 2), 3.01, 0.183, b - a, 0.5, 0, 1, canvasTex(256, 64, transom));
    frame(S, sd((a + b) / 2), 2.76, b - a, 0.5, 0.205, 0.05);
  }
  S.box(sd(5.1), 0, 0.2, 8.4, 0.55, 0.06, STONE);
  S.box(sd(5.1), 2.55, 0.22, 8.4, 0.2, 0.09, CREAM);
  S.pic(sd(0.45), 2.0, 0.19, 0.3, 0.3, 0, 1, canvasTex(128, 128, rPlaque));
  S.box(SIDE_W / 2, 3.44, 0.17, SIDE_W, 0.08, 0.34, CREAM);
  S.box(SIDE_W / 2, 3.52, 0.2, SIDE_W, 0.33, 0.4, CREAM);
  S.box(SIDE_W / 2, 3.85, 0.05, SIDE_W, 1.85, 0.1, OCHRE, { list: S.shell });
  for (const y of [5.75, 8.75, 11.75]) S.box(SIDE_W / 2, y, 0.03, SIDE_W, 0.5, 0.06, 0xf1ece2, { list: S.shell });
  // la pizarra de la carta junto a la esquina, en la acera
  const mx = sd(1.35);
  S.box(mx - 0.6, 0, 0.85, 0.06, 1.95, 0.06, 0x7a4a2a).box(mx + 0.6, 0, 0.85, 0.06, 1.95, 0.06, 0x7a4a2a);
  S.box(mx, 1.88, 0.85, 1.26, 0.07, 0.06, 0x7a4a2a);
  S.pic(mx, 1.05, 0.885, 1.12, 1.6, 0, 1, canvasTex(320, 456, menuBoard));
  S.box(mx, 0.25, 0.82, 1.2, 1.6, 0.03, 0x7a4a2a);
  S.block(mx, 0.85, 1.3, 0.15);
  // la terraza en la calle: mesa larga con bancos, jardineras con ficus, farola y guirnaldas
  picnic(S, sd(5.6), 3.05);
  planter(S, sd(3.4), 4.35);
  planter(S, sd(7.7), 4.35);
  streetLamp(S, sd(1.9), 2.2);
  lights(S, [sd(1.9), 3.75, 2.2], [sd(5.2), 3.4, 0.35]);
  lights(S, [sd(5.2), 3.4, 0.35], [sd(7.7), 3.0, 4.35]);
  lights(S, [sd(7.7), 3.0, 4.35], [sd(10.6), 3.4, 0.35]);
  place(S, SOUTH_END, N_SIDE, 'Maccheroni lateral');

  return {
    update() {
      const n = windowGlow.value;
      glow.emissiveIntensity = 0.12 + n * 3;
      for (const m of lit) m.emissiveIntensity = 0.1 + n * 1.6;
      signFace.emissiveIntensity = 0.08 + n * 0.9;
    },
  };
}
