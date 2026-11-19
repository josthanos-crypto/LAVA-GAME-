import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { Kit, canvasTex } from './interiorKit.js';
import { laurel } from './sanGines.js';

/**
 * El restaurante Charco Vivo, la antigua Casa Ginory, en Juan de Quesada enfrente del aparcamiento
 * (foto de José Manuel desde el paso de cebra): una casa terrera larga, encalada, con el zócalo negro,
 * los cables por arriba y las puertas y ventanas de madera pintadas de azul; a la izquierda el
 * restaurante, con tres toldos azules, el rótulo «Charco Vivo · Antigua Casa Ginory» con las sombrillas
 * rojas y la terraza de mesas y sillas blancas detrás de una vallita negra; en la acera, la papelera
 * verde, el árbol joven con sus tutores, el flamboyán de la esquina y la farola blanca de dos campanas.
 * Detrás asoman los bloques blancos de cuatro y cinco plantas.
 * En el mapa venía todo como un bloque de tres plantas con escaparates: tuneCharcoVivo lo parte en la
 * casa de delante (una planta) y lo de detrás (más alto), y quita el rótulo rojo genérico del mapa;
 * shops.js no pone su rótulo de la casa Ginory si el edificio lleva charcoVivo.
 */

// la fachada a Juan de Quesada: de la esquina suroeste (B, a la izquierda en la foto) a la noreste (A)
const A = [601.39, 38.33], B = [574.83, 65.56];
const LEN = Math.hypot(A[0] - B[0], A[1] - B[1]);
const U = [(A[0] - B[0]) / LEN, (A[1] - B[1]) / LEN], N = [-U[1], U[0]];
const DEPTH = 8.6, H = 4.2;
// de la fachada hacia fuera: s a lo largo (desde B) y z hacia la calle
const W = (s, z) => [B[0] + U[0] * s + N[0] * z, B[1] + U[1] * s + N[1] * z];
// los huecos de la foto, de izquierda a derecha: [s del centro, ancho, alto, tipo, alto del alféizar]
const HUECOS = [
  [3.0, 1.0, 1.3, 'ventana', 1.0],
  [6.2, 1.1, 2.3, 'abierta', 0],
  [9.6, 1.1, 2.3, 'abierta', 0],
  [13.4, 1.2, 2.4, 'tablero', 0],
  [17.0, 1.2, 2.4, 'tablero', 0],
  [20.6, 1.2, 2.4, 'tablero', 0],
  [24.4, 1.4, 2.5, 'cristal', 0],
  [28.6, 1.5, 2.6, 'tablero', 0],
  [32.8, 1.4, 1.6, 'ventana', 0.85],
  [36.4, 1.1, 2.4, 'tablero', 0],
];
// los tres toldos del restaurante y la terraza debajo
const TOLDOS = [[1.8, 8.0], [8.3, 15.2], [15.5, 22.0]];
const TERRAZA = { s0: 5.6, s1: 21.2, valla: 1.7, entrada: [8.9, 10.3] };
const SIGN = { s: 8.8, w: 4.6, h: 0.8, y: 3.05 };
// el segundo paso de cebra, el de la calzada de este lado, seguido del de aparcamientoGinory.js
const ZEBRA = [591.9, 58.5], ZEBRA_N = [0.714, 0.7];
const BLUE = 0x1d4f9c, WHITE = 0xf3f1ec;
const SCRIPT = '"Segoe Script", "Brush Script MT", "Lucida Handwriting", "Comic Sans MS", cursive';

/**
 * antes de levantar la ciudad: la casa terrera de delante sale aparte (una planta, blanca, sin
 * escaparates) y lo de detrás sube a los bloques blancos de la foto; fuera el rótulo rojo genérico
 */
export function tuneCharcoVivo(map) {
  const near = (q, p) => Math.hypot(q[0] - p[0], q[1] - p[1]) < 0.5;
  const b = (map.buildings || []).find(q => !q.skip && q.p.some(v => near(v, A)) && q.p.some(v => near(v, B)));
  if (!b) return;
  const iA = b.p.findIndex(v => near(v, A)), iB = b.p.findIndex(v => near(v, B));
  if (Math.abs(iA - iB) !== 1) return;
  const step = iB > iA ? 1 : -1, pa = b.p[iA - step], pb = b.p[iB + step];
  if (!pa || !pb) return;
  // hacia dentro, por los lados de la manzana, el fondo de la casa
  const back = (p, q) => { const l = Math.hypot(q[0] - p[0], q[1] - p[1]); return [p[0] + (q[0] - p[0]) / l * DEPTH, p[1] + (q[1] - p[1]) / l * DEPTH]; };
  const a = b.p[iA], c = b.p[iB], a2 = back(a, pa), c2 = back(c, pb);
  map.buildings.push({ p: [a, c, c2, a2, a], h: H, k: 'gen', s: 0, f: [246, 244, 238], c: [214, 211, 204], charcoVivo: true });
  b.p[iA] = a2;
  b.p[iB] = c2;
  b.h = 14;
  b.f = [242, 240, 234];
  const i = (map.signs || []).findIndex(s => s.name === 'Charco Vivo');
  if (i >= 0) map.charcoVivoSign = map.signs.splice(i, 1)[0];
  map.charcoVivo = true;
}

/** puerta o ventana de madera azul: de tablero (cuarterones), con cristales y visillo, o la de la ventana */
function carpinteria(tipo) {
  return (g, w, h) => {
    g.fillStyle = '#1d4f9c';
    g.fillRect(0, 0, w, h);
    const hojas = tipo === 'tablero' && w < 100 ? 1 : 2, lw = w / hojas;
    for (let i = 0; i < hojas; i++) {
      const x0 = i * lw;
      g.strokeStyle = '#123a75';
      g.lineWidth = 4;
      g.strokeRect(x0 + 3, 3, lw - 6, h - 6);
      if (tipo === 'tablero') {
        g.fillStyle = '#2459a8';
        for (const [y0, y1] of [[0.07, 0.45], [0.52, 0.93]]) {
          g.fillRect(x0 + lw * 0.16, h * y0, lw * 0.68, h * (y1 - y0));
          g.strokeRect(x0 + lw * 0.16, h * y0, lw * 0.68, h * (y1 - y0));
        }
      } else {
        // cristales en cuadritos con el visillo blanco detrás
        const y0 = tipo === 'ventana' ? 0.07 : 0.08, y1 = tipo === 'ventana' ? 0.93 : 0.6, rows = tipo === 'ventana' ? 3 : 4;
        g.fillStyle = '#20262c';
        g.fillRect(x0 + lw * 0.12, h * y0, lw * 0.76, h * (y1 - y0));
        g.fillStyle = 'rgba(236,234,226,.62)';
        g.fillRect(x0 + lw * 0.14, h * (y0 + 0.02), lw * 0.72, h * (y1 - y0 - 0.04));
        g.strokeStyle = '#1d4f9c';
        g.lineWidth = 5;
        for (let r = 1; r < rows; r++) { const y = h * (y0 + (y1 - y0) * r / rows); g.beginPath(); g.moveTo(x0 + lw * 0.12, y); g.lineTo(x0 + lw * 0.88, y); g.stroke(); }
        g.beginPath(); g.moveTo(x0 + lw / 2, h * y0); g.lineTo(x0 + lw / 2, h * y1); g.stroke();
        if (tipo === 'cristal') {
          g.fillStyle = '#2459a8';
          g.fillRect(x0 + lw * 0.16, h * 0.66, lw * 0.68, h * 0.27);
          g.strokeStyle = '#123a75';
          g.lineWidth = 4;
          g.strokeRect(x0 + lw * 0.16, h * 0.66, lw * 0.68, h * 0.27);
        }
      }
    }
    // el pomo y, en las de dos hojas, la junta del medio
    g.fillStyle = '#c9b27a';
    g.beginPath(); g.arc(hojas === 2 ? w / 2 + 8 : w * 0.82, h * 0.52, 4, 0, Math.PI * 2); g.fill();
  };
}

/** el hueco de la puerta abierta del restaurante: oscuro, con un poco de luz al fondo */
function abierta(g, w, h) {
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, '#2b2622'); gr.addColorStop(1, '#0f0d0c');
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,214,150,.12)';
  g.fillRect(w * 0.25, h * 0.15, w * 0.5, h * 0.35);
}

/** el rótulo: «Charco Vivo» en letra de mano, «ANTIGUA CASA GINORY» debajo y una sombrilla roja a cada lado */
function rotulo(g, w, h) {
  g.fillStyle = '#efede7';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#3a3532';
  g.lineWidth = 6;
  g.strokeRect(3, 3, w - 6, h - 6);
  for (const cx of [w * 0.09, w * 0.91]) {
    // sombrilla roja y blanca con su palo
    g.fillStyle = '#c8202a';
    g.beginPath(); g.moveTo(cx - h * 0.32, h * 0.5); g.quadraticCurveTo(cx, h * 0.08, cx + h * 0.32, h * 0.5); g.closePath(); g.fill();
    g.fillStyle = '#ffffff';
    for (const dx of [-0.12, 0.12]) { g.beginPath(); g.moveTo(cx + h * dx * 0.3, h * 0.2); g.lineTo(cx + h * dx * 1.6, h * 0.5); g.lineTo(cx + h * dx * 0.9, h * 0.5); g.closePath(); g.fill(); }
    g.fillStyle = '#3a3532';
    g.fillRect(cx - 1.5, h * 0.48, 3, h * 0.36);
    g.fillRect(cx - h * 0.22, h * 0.82, h * 0.44, 3);
  }
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = '#1c2a44';
  g.font = `italic 700 ${Math.round(h * 0.52)}px ${SCRIPT}`;
  g.fillText('Charco Vivo', w / 2, h * 0.4);
  g.font = `700 ${Math.round(h * 0.17)}px "Barlow", Arial, sans-serif`;
  g.fillText('ANTIGUA CASA GINORY', w / 2, h * 0.8);
}

/** la fachada en su marco (x a lo largo desde B, z hacia la calle, el suelo en y = 0) */
function fachada() {
  const k = new Kit();
  // el encalado por delante de la pared del mapa, con el remate del pretil
  k.box(LEN / 2, 0, 0.035, LEN, H + 0.05, 0.07, WHITE, { list: k.shell });
  k.box(LEN / 2, H - 0.05, 0.1, LEN + 0.1, 0.12, 0.12, 0xe8e5de);
  // el zócalo negro, cortado en las puertas
  const doors = HUECOS.filter(([, , , , sill]) => sill === 0).map(([s, w]) => [s - w / 2 - 0.1, s + w / 2 + 0.1]).sort((p, q) => p[0] - q[0]);
  let s0 = 0;
  for (const [a, b] of [...doors, [LEN, LEN]]) {
    if (a > s0 + 0.05) k.box((s0 + a) / 2, 0, 0.085, a - s0, 0.62, 0.04, 0x1e1f21);
    s0 = b;
  }
  // puertas y ventanas: marco de madera azul un poco saliente y la hoja pintada
  for (const [s, w, h, tipo, sill] of HUECOS) {
    const y0 = sill;
    for (const [x, ww] of [[s - w / 2 - 0.05, 0.1], [s + w / 2 + 0.05, 0.1]]) k.box(x, y0, 0.09, ww, h + 0.05, 0.08, BLUE);
    k.box(s, y0 + h, 0.09, w + 0.2, 0.1, 0.08, BLUE);
    if (sill > 0) k.box(s, sill - 0.08, 0.13, w + 0.3, 0.08, 0.16, 0xe8e5de);
    const tex = tipo === 'abierta' ? canvasTex(96, 200, abierta) : canvasTex(tipo === 'ventana' || w > 1.3 ? 192 : 96, 200, carpinteria(tipo));
    k.pic(s, y0 + h / 2, 0.072, w, h, 0, 1, tex);
  }
  // el escalón de la puerta grande
  k.box(28.6, 0, 0.3, 1.8, 0.14, 0.45, 0xd8d4cc);
  // los cables viejos que corren por arriba de la fachada
  for (const y of [H - 0.3, H - 0.42]) k.cyl(0, y, 0.12, 0.012, 0.012, LEN, 0x2a2a2a, { seg: 4, rx: Math.PI / 2, ry: Math.PI / 2 });
  // los toldos azules del restaurante, con su faldón
  const slope = Math.atan2(0.45, 1.33), L = Math.hypot(0.45, 1.33);
  for (const [a, b] of TOLDOS) {
    const w = b - a, g = new THREE.BoxGeometry(w, 0.03, L);
    g.rotateX(slope);
    g.translate((a + b) / 2, 2.775, 0.075 + 1.33 / 2);
    k.add(g, 0x1d3a7a);
    k.box((a + b) / 2, 2.3, 1.42, w, 0.25, 0.02, 0x1d3a7a);
    k.box((a + b) / 2, 2.38, 1.435, w, 0.04, 0.01, 0xe9eef5);
    k.box((a + b) / 2, 2.98, 0.1, w, 0.08, 0.06, 0x16161a);
  }
  // el rótulo, encima del toldo del medio
  k.box(SIGN.s, SIGN.y, 0.1, SIGN.w + 0.1, SIGN.h + 0.1, 0.06, 0x3a3532);
  k.pic(SIGN.s, SIGN.y + SIGN.h / 2 + 0.05, 0.135, SIGN.w, SIGN.h, 0, 1, canvasTex(512, 96, rotulo));
  // la terraza: mesas y sillas blancas de plástico y la vallita negra, con su hueco de entrada
  const { s0: t0, s1: t1, valla, entrada } = TERRAZA;
  for (let s = t0 + 1.2; s < t1 - 0.8; s += 2.5) {
    k.table(s, 0.95, { w: 0.7, d: 0.7, h: 0.74, top: 0xf2f2ef, leg: 0xe2e2df });
    k.chair(s - 0.62, 0.95, Math.PI / 2, 0xf0f0ed, { legs: 0xdcdcd8 });
    k.chair(s + 0.62, 0.95, -Math.PI / 2, 0xf0f0ed, { legs: 0xdcdcd8 });
  }
  const BLACK = 0x1b1c1e;
  const run = (a, b) => {
    k.box((a + b) / 2, 0.8, valla, b - a, 0.04, 0.04, BLACK).box((a + b) / 2, 0.1, valla, b - a, 0.03, 0.03, BLACK);
    for (let s = a; s <= b + 0.01; s += 0.14) k.box(s, 0.1, valla, 0.018, 0.7, 0.018, BLACK);
    k.seg(a, valla, b, valla);
  };
  run(t0, entrada[0]);
  run(entrada[1], t1);
  for (const s of [t0, t1]) {
    k.box(s, 0.8, (valla + 0.3) / 2, 0.04, 0.04, valla - 0.3, BLACK);
    k.box(s, 0, (valla + 0.3) / 2, 0.04, 0.84, 0.04, BLACK);
    k.seg(s, 0.3, s, valla);
  }
  // la papelera verde en su poste
  k.cyl(12.2, 0, 2.4, 0.03, 0.03, 0.95, 0x6a6f74, { seg: 6 }).box(12.2, 0.45, 2.3, 0.42, 0.55, 0.3, 0x2f6b3a);
  k.block(12.2, 2.35, 0.45, 0.35);
  // la farola blanca de dos campanas, cada brazo hacia un lado y a distinta altura
  const fs = 22.4, fz = 2.3, POLE = 0xf2f2ef;
  k.cyl(fs, 0, fz, 0.1, 0.13, 0.5, POLE, { seg: 10 }).cyl(fs, 0.5, fz, 0.06, 0.08, 5.8, POLE, { seg: 10 });
  for (const [side, top] of [[-1, 6.2], [1, 5.55]]) {
    const pts = [[0, top - 0.6], [0.25, top - 0.05], [0.55, top + 0.1], [0.78, top - 0.05], [0.85, top - 0.3]];
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], dx = (x1 - x0) * side, dy = y1 - y0, l = Math.hypot(dx, dy);
      k.cyl(fs + x0 * side, y0, fz, 0.035, 0.035, l, POLE, { seg: 6, rx: Math.acos(dy / l), ry: Math.atan2(dx, 0) });
    }
    k.cyl(fs + 0.85 * side, top - 0.65, fz, 0.06, 0.24, 0.36, 0x6f7c88, { seg: 14 });
    k.ball(fs + 0.85 * side, top - 0.66, fz, 0.12, 0xfff3d2, { seg: 8, list: k.glow });
  }
  k.block(fs, fz, 0.3, 0.3);
  return k;
}

/** el árbol joven con sus tres tutores de madera (foto) */
function tutores(k, s, z) {
  for (const a of [0, 2.1, 4.2]) {
    const dx = Math.sin(a) * 0.32, dz = Math.cos(a) * 0.32;
    k.cyl(s + dx, 0, z + dz, 0.03, 0.03, 1.9, 0x8a6a48, { seg: 5, rx: 0.12, ry: Math.atan2(-dx, -dz) });
  }
}

export function buildCharcoVivo(scene, colliders, map) {
  if (!map?.charcoVivo) return null;
  const group = new THREE.Group();
  group.name = 'charcoVivo';
  // la fachada, la terraza y la farola, en su marco
  const k = fachada();
  tutores(k, 22.9, 1.4);
  const { group: g, segs } = k.build('fachadaCharcoVivo');
  g.position.set(B[0], 0, B[1]);
  g.rotation.y = Math.atan2(N[0], N[1]);
  group.add(g);
  for (const [as, az, bs, bz] of segs) colliders.addSegment(...W(as, az), ...W(bs, bz));
  // los árboles de la acera: el joven con tutores y el flamboyán grande de la esquina
  const out = { trunk: [], leaves: [] };
  laurel(out, ...W(22.9, 1.4), 0.42, 1);
  laurel(out, ...W(37.2, 1.3), 0.78, 2);
  for (const [list, mat] of [[out.trunk, { vertexColors: true, roughness: 0.95 }], [out.leaves, { vertexColors: true, roughness: 0.85, flatShading: true }]]) {
    const m = new THREE.Mesh(mergeGeometries(list.map(q => (q.index ? q.toNonIndexed() : q)), false), new THREE.MeshStandardMaterial(mat));
    m.castShadow = true;
    m.receiveShadow = true;
    group.add(m);
  }
  for (const [s, z] of [[22.9, 1.4], [37.2, 1.3]]) {
    const [x, zz] = W(s, z);
    colliders.addPolygon([[x - 0.3, zz - 0.3], [x + 0.3, zz - 0.3], [x + 0.3, zz + 0.3], [x - 0.3, zz + 0.3], [x - 0.3, zz - 0.3]]);
  }
  // el paso de cebra de la calzada de este lado de Juan de Quesada
  const z = new Kit(), ry = Math.atan2(ZEBRA_N[0], ZEBRA_N[1]);
  for (let s = -3.6; s <= 3.61; s += 0.9) z.box(ZEBRA[0] + ZEBRA_N[0] * s, 0.165, ZEBRA[1] + ZEBRA_N[1] * s, 3.0, 0.012, 0.45, 0xf1f0ec, { ry, list: z.shell });
  group.add(z.build('pasoCebraCharcoVivo').group);
  scene.add(group);
  return group;
}
