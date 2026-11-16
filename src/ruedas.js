import * as THREE from 'three';
import { mergeGeometries, toCreasedNormals } from 'three/addons/utils/BufferGeometryUtils.js';

/**
 * Ruedas con detalle (Version 133): neumático con flanco, hombro y dibujo, llanta con radios en relieve,
 * garganta, tuercas, tapacubos y disco de freno. Todo es geometría original hecha aquí; los diseños de
 * llanta son inventados (no copian ninguna llanta real).
 *
 * La rueda gira sobre el eje X y la cara de fuera mira a +X (como en carModels.js; la del otro lado se
 * pone con scale.x = -1). `ruedaFina` devuelve lo mismo que la `wheelGeos` de siempre más el material del
 * neumático: { tire, tireMat, rim, rimMat }. `ruedaLejos` es la versión de pocos triángulos para el coche
 * visto de lejos (va fundida en la carrocería ligera, ver cocheLejos.js).
 */

const COL = {
  plata: [0.78, 0.8, 0.83],
  antracita: [0.2, 0.21, 0.23],
  garganta: [0.16, 0.165, 0.18],
  disco: [0.4, 0.41, 0.43],
  campana: [0.13, 0.135, 0.15],
  tuerca: [0.5, 0.51, 0.53],
  cromo: [0.96, 0.97, 1.0],
  chapa: [0.62, 0.64, 0.67],
  hueco: [0.035, 0.035, 0.04],
  crema: [0.84, 0.81, 0.72],
};

function pintar(geo, col) {
  const g = geo.index ? geo.toNonIndexed() : geo;
  for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal') g.deleteAttribute(k);
  const n = g.getAttribute('position').count;
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { a[i * 3] = col[0]; a[i * 3 + 1] = col[1]; a[i * 3 + 2] = col[2]; }
  g.setAttribute('color', new THREE.BufferAttribute(a, 3));
  return g;
}

/** cuerpo de revolución alrededor del eje X a partir de un perfil [[radio, x], ...] */
function torno(perfil, segs, col) {
  const g = new THREE.LatheGeometry(perfil.map(([r, x]) => new THREE.Vector2(r, x)), segs);
  g.rotateZ(-Math.PI / 2);   // el eje del torno (Y) pasa a ser X; la cara de fuera queda en +X
  return pintar(g, col);
}

/**
 * un radio: prisma achaflanado del buje a la garganta. Se construye a lo largo de +Y y luego se gira.
 * r0→r1 radios; w0→w1 anchos; x0→x1 dónde queda su cara de fuera (más hundido en el buje = llanta cóncava)
 */
function radio(r0, r1, w0, w1, x0, x1, grosor, ang, col, sesgo = 0) {
  const est = [0, 0.5, 1].map(t => {
    const r = r0 + (r1 - r0) * t, w = w0 + (w1 - w0) * t;
    // la cara de fuera hace una curva suave del buje a la garganta
    const x = x0 + (x1 - x0) * (t * t * (3 - 2 * t));
    const c = Math.min(w * 0.28, grosor * 0.4);
    const z0 = sesgo * (r - r0);
    return [
      [x, r, z0 - w / 2 + c], [x, r, z0 + w / 2 - c], [x - c, r, z0 + w / 2],
      [x - grosor, r, z0 + w / 2], [x - grosor, r, z0 - w / 2], [x - c, r, z0 - w / 2],
    ];
  });
  const pos = [];
  for (let i = 0; i < est.length - 1; i++) {
    for (let k = 0; k < 6; k++) {
      const a = est[i][k], b = est[i][(k + 1) % 6], c = est[i + 1][k], d = est[i + 1][(k + 1) % 6];
      pos.push(...a, ...c, ...b, ...b, ...c, ...d);
    }
  }
  let g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g = toCreasedNormals(g, 0.5);
  g.rotateX(ang);
  return pintar(g, col);
}

function cilindroX(r0, r1, h, x, col, segs = 12, abierto = false) {
  const g = new THREE.CylinderGeometry(r0, r1, h, segs, 1, abierto);
  g.rotateZ(-Math.PI / 2);   // la tapa de arriba (r0) mira a +X
  g.translate(x, 0, 0);
  return pintar(g, col);
}

// ── neumático ──
let texGoma = null;
/** dibujo y flancos del neumático: color y relieve en un lienzo pequeño que se repite alrededor */
function gomaTex() {
  if (texGoma) return texGoma;
  const W = 128, H = 256;
  const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return [c, c.getContext('2d')]; };
  const [cc, cx] = mk();   // color
  const [bc, bx] = mk();   // relieve
  // v va del talón de dentro (0) al de fuera (1): flanco · hombro · banda de rodadura · hombro · flanco
  const F0 = 0.3, F1 = 0.7;
  cx.fillStyle = '#1b1c1e';
  cx.fillRect(0, 0, W, H);
  bx.fillStyle = '#808080';
  bx.fillRect(0, 0, W, H);
  // banda de rodadura: algo más clara (polvo de la calle), con tres canales y tacos en espiga
  cx.fillStyle = '#242526';
  cx.fillRect(0, H * F0, W, H * (F1 - F0));
  bx.fillStyle = '#b0b0b0';
  bx.fillRect(0, H * F0, W, H * (F1 - F0));
  for (const t of [0.38, 0.5, 0.62]) {
    cx.fillStyle = '#0c0c0d';
    cx.fillRect(0, H * t - 2.5, W, 5);
    bx.fillStyle = '#202020';
    bx.fillRect(0, H * t - 2.5, W, 5);
  }
  bx.strokeStyle = '#303030';
  cx.strokeStyle = '#101011';
  bx.lineWidth = cx.lineWidth = 3;
  for (let i = 0; i < 4; i++) {
    const x = (i + 0.5) * (W / 4);
    for (const ctx of [bx, cx]) {
      ctx.beginPath();
      ctx.moveTo(x - 9, H * F0 + 2); ctx.lineTo(x + 5, H * 0.38);
      ctx.moveTo(x - 9, H * F1 - 2); ctx.lineTo(x + 5, H * 0.62);
      ctx.moveTo(x - 6, H * 0.41); ctx.lineTo(x + 6, H * 0.47);
      ctx.moveTo(x - 6, H * 0.59); ctx.lineTo(x + 6, H * 0.53);
      ctx.stroke();
    }
  }
  // flancos: dos nervios y una banda de letras gastadas (rayas, no dicen nada)
  for (const [a, b] of [[0, F0], [F1, 1]]) {
    const y0 = H * a, h = H * (b - a);
    bx.fillStyle = '#9a9a9a';
    bx.fillRect(0, y0 + h * 0.2, W, 2);
    bx.fillRect(0, y0 + h * 0.8, W, 2);
    cx.fillStyle = '#2a2b2d';
    for (let x = 6; x < W - 10; x += 9) {
      if ((x * 7) % 5 === 0) continue;
      cx.fillRect(x, y0 + h * 0.42, 5, h * 0.16);
      bx.fillRect(x, y0 + h * 0.42, 5, h * 0.16);
    }
  }
  const map = new THREE.CanvasTexture(cc);
  map.colorSpace = THREE.SRGBColorSpace;
  const bump = new THREE.CanvasTexture(bc);
  for (const t of [map, bump]) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(14, 1);
    t.anisotropy = 4;
  }
  texGoma = { map, bump };
  return texGoma;
}

let GOMA = null;
function gomaMat() {
  if (GOMA) return GOMA;
  const t = gomaTex();
  GOMA = new THREE.MeshStandardMaterial({ color: 0xffffff, map: t.map, bumpMap: t.bump, bumpScale: 2.2, roughness: 0.9, metalness: 0 });
  return GOMA;
}

/** perfil del neumático [[radio, x]...] de talón a talón: flanco abombado, hombro redondo y banda casi plana */
function perfilGoma(R, W, Rll) {
  const h = R - Rll, a = W / 2;
  return [
    [Rll - 0.004, -a + 0.035], [Rll + h * 0.08, -a + 0.012], [Rll + h * 0.45, -a - 0.004], [Rll + h * 0.8, -a + 0.012],
    [R - 0.012, -a + 0.04], [R, -a + 0.075], [R + 0.002, 0], [R, a - 0.075],
    [R - 0.012, a - 0.04], [Rll + h * 0.8, a - 0.012], [Rll + h * 0.45, a + 0.004], [Rll + h * 0.08, a - 0.012], [Rll - 0.004, a - 0.035],
  ];
}

const fino = new Map();
/**
 * la rueda de cerca. estilo: alloy5 | alloy6 | sport | steel | classic (los mismos nombres que MODELS.rim)
 * { tire, tireMat, rim, rimMat }
 */
export function ruedaFina(R, W, estilo = 'alloy5') {
  const clave = R + ':' + W + ':' + estilo;
  if (fino.has(clave)) return fino.get(clave);
  // la llanta crece con la rueda: perfil más bajo en los deportivos
  const Rll = R * (estilo === 'sport' ? 0.72 : estilo === 'steel' || estilo === 'classic' ? 0.62 : 0.67);
  const tire = new THREE.LatheGeometry(perfilGoma(R, W, Rll).map(([r, x]) => new THREE.Vector2(r, x)), 24);
  tire.rotateZ(-Math.PI / 2);

  const cara = W / 2 - 0.022;          // plano de la cara de fuera de la llanta
  const p = [];
  // pestaña, garganta (el interior oscuro) y fondo
  p.push(torno([[Rll + 0.006, cara + 0.012], [Rll + 0.012, cara + 0.006], [Rll + 0.004, cara - 0.006], [Rll - 0.012, cara - 0.012]], 24, estilo === 'classic' ? COL.cromo : COL.plata));
  p.push(torno([[Rll - 0.012, cara - 0.012], [Rll - 0.02, cara - 0.05], [Rll - 0.022, -W / 2 + 0.03]], 20, COL.garganta));
  // disco de freno con su campana, detrás de los radios
  p.push(torno([[0.001, cara - 0.075], [Rll * 0.34, cara - 0.075], [Rll * 0.36, cara - 0.095], [Rll * 0.8, cara - 0.095], [Rll * 0.8, cara - 0.115], [0.001, cara - 0.115]], 20, COL.disco));

  if (estilo === 'steel') {
    // llanta de chapa: plato embutido con ventanas y tapacubos pequeño
    p.push(torno([[0.001, cara - 0.012], [R * 0.16, cara - 0.014], [R * 0.2, cara - 0.03], [Rll * 0.62, cara - 0.05], [Rll * 0.86, cara - 0.03], [Rll - 0.012, cara - 0.014]], 20, COL.chapa));
    for (let i = 0; i < 8; i++) {
      const g = new THREE.CylinderGeometry(Rll * 0.085, Rll * 0.085, 0.012, 8);
      g.rotateZ(-Math.PI / 2);
      g.scale(1, 1.5, 1);
      g.translate(cara - 0.034, Rll * 0.72, 0);
      g.rotateX((i / 8) * Math.PI * 2);
      p.push(pintar(g, COL.hueco));
    }
    p.push(cilindroX(R * 0.1, R * 0.13, 0.03, cara + 0.002, COL.tuerca, 12));
  } else if (estilo === 'classic') {
    // llanta pintada con aro embellecedor y tapacubos de cúpula cromado
    p.push(torno([[Rll * 0.5, cara - 0.035], [Rll * 0.8, cara - 0.045], [Rll - 0.012, cara - 0.014]], 22, COL.crema));
    p.push(torno([[0.001, cara + 0.03], [Rll * 0.2, cara + 0.024], [Rll * 0.38, cara + 0.004], [Rll * 0.5, cara - 0.03], [Rll * 0.52, cara - 0.04]], 22, COL.cromo));
  } else {
    const n = estilo === 'sport' ? 10 : estilo === 'alloy6' ? 6 : 5;
    const col = estilo === 'sport' ? COL.antracita : COL.plata;
    const rHub = 0.062, r1 = Rll - 0.014;
    const hundido = estilo === 'sport' ? 0.05 : 0.034;
    for (let i = 0; i < n; i++) {
      const ang = (i / n) * Math.PI * 2;
      if (estilo === 'sport') {
        // radios finos en uve: cada pareja sale junta del buje y se abre hacia la garganta
        const s = (i % 2 ? 1 : -1) * 0.2;
        p.push(radio(rHub, r1, 0.03, 0.022, cara - hundido, cara - 0.006, 0.03, ang + (i % 2 ? -1 : 1) * 0.12, col, s));
      } else {
        // radio doble: dos nervios con un hueco en medio
        const w0 = estilo === 'alloy6' ? 0.034 : 0.04, sep = estilo === 'alloy6' ? 0.2 : 0.24;
        for (const k of [-1, 1]) p.push(radio(rHub, r1, w0, w0 * 0.74, cara - hundido, cara - 0.006, 0.034, ang, col, k * sep));
      }
    }
    // buje, tapacubos y tuercas
    p.push(cilindroX(0.07, 0.082, 0.045, cara - hundido - 0.004, col, 14));
    p.push(cilindroX(0.03, 0.034, 0.012, cara - hundido + 0.022, COL.campana, 10));
    for (let i = 0; i < 5; i++) {
      const g = new THREE.CylinderGeometry(0.0085, 0.0095, 0.014, 6);
      g.rotateZ(-Math.PI / 2);
      g.translate(cara - hundido + 0.024, 0.05, 0);
      g.rotateX((i / 5 + 0.1) * Math.PI * 2);
      p.push(pintar(g, COL.tuerca));
    }
  }
  const rim = mergeGeometries(p, false);
  rim.computeBoundingSphere();
  const out = { tire, tireMat: gomaMat(), rim, rimMat: estilo === 'steel' ? CHAPA : METAL, rLlanta: Rll };
  fino.set(clave, out);
  return out;
}

// metal de llanta: el color va en los vértices (plata, antracita, disco, tuercas...)
const METAL = new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.3, metalness: 0.88, envMapIntensity: 1.25, side: THREE.DoubleSide });
const CHAPA = new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.5, metalness: 0.55, side: THREE.DoubleSide });

const lejos = new Map();
/**
 * la rueda de lejos: un neumático de 12 lados con la llanta como un disco claro. Devuelve una geometría con
 * color en los vértices (sin texturas) para fundirla con la carrocería ligera
 */
export function ruedaLejos(R, W, estilo = 'alloy5') {
  const clave = R + ':' + W + ':' + estilo;
  if (lejos.has(clave)) return lejos.get(clave);
  const Rll = R * (estilo === 'sport' ? 0.72 : estilo === 'steel' || estilo === 'classic' ? 0.62 : 0.67);
  const a = W / 2;
  const goma = torno([[Rll, -a + 0.01], [R - 0.02, -a], [R, -a + 0.05], [R, a - 0.05], [R - 0.02, a], [Rll, a - 0.01]], 12, [0.03, 0.03, 0.033]);
  const col = estilo === 'sport' ? COL.antracita : estilo === 'steel' ? COL.chapa : estilo === 'classic' ? COL.crema : COL.plata;
  const cara = torno([[0.001, a - 0.035], [Rll * 0.5, a - 0.04], [Rll, a - 0.012]], 12, col.map(v => v * 0.8));
  const g = mergeGeometries([goma, cara], false);
  lejos.set(clave, g);
  return g;
}
