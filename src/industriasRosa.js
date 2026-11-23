import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { paveMaterial, asfalto } from './suelos.js';
import { terrainY } from './terrain.js';

/**
 * Industrias Rosa — Calle Iguazú 5 (Argana Alta).
 *
 * La nave del rótulo naranja y verde que sale en el vídeo IMG_0399 de José Manuel
 * (26/10/2026, min. 1:00): las letras naranjas «ROSA» con la estrella verde en lo
 * alto del tejado, el panel azul de «T Tools», la banda blanca de la fachada con
 * los departamentos en verde —Cerámicas, Ferretería, Jardinería—, los escaparates
 * con las fotos de la casa, las palmeras canarias delante y la verja blanca con el
 * aparcamiento de delante.
 *
 * La planta es la de OpenStreetMap: el edificio bajo que da a Iguazú es la nave de
 * la ferretería (la grande de detrás, con las placas solares en el tejado, es el
 * almacén). El bloque genérico se queda —la huella y la altura son las suyas— y la
 * fachada nueva se monta por delante, separada unos centímetros para no pisar los
 * huecos que trae el mapa.
 */

const F0 = [-1344, -1290];      // esquina de poniente de la fachada
const F1 = [-1381, -1269];      // esquina de levante
const LEN = Math.hypot(F1[0] - F0[0], F1[1] - F0[1]);          // 42,5 m de fachada
const U = [(F1[0] - F0[0]) / LEN, (F1[1] - F0[1]) / LEN];
const N = [U[1], -U[0]];                                       // hacia la calle (sureste)
const RY = Math.atan2(U[0], U[1]) + Math.PI / 2;
/** punto en coordenadas de la nave: s a lo largo de la fachada, w hacia la calle */
const S = (s, w) => [F0[0] + U[0] * s + N[0] * w, F0[1] + U[1] * s + N[1] * w];

const SUELO = 0.34;
const APARC = 16;            // el aparcamiento de delante
const VERJA = 17.5;          // la verja blanca, en el borde del solar
const PLAZA = 2.55;
const BLANCO = 0xf4f2ec, CRISTAL = 0x39434a, ALU = 0x9aa0a4, VERDE = '#1f7a3c';

/** las palmeras canarias de delante de los escaparates (las planta world.js) */
export function tuneIndustriasRosa(map) {
  map.extraPalms = map.extraPalms || [];
  for (const [s, w, h] of [[7, 3.4, 8.8], [20, 3.4, 9.6], [33, 3.4, 8.4]]) {
    const [x, z] = S(s, w);
    map.extraPalms.push([x, z, h, 0.3 + s * 0.04]);
  }
}

/** el cartel grande: la estrella verde del logo y «ROSA» en naranja, sobre el tejado */
function rotuloRosa() {
  return canvasTex(1024, 190, (g, cw, ch) => {
    g.fillStyle = '#f7f6f1'; g.fillRect(0, 0, cw, ch);
    g.strokeStyle = 'rgba(0,0,0,.16)'; g.lineWidth = 5;
    g.strokeRect(2.5, 2.5, cw - 5, ch - 5);
    // la estrella de ocho puntas, verde con el centro naranja
    const cx = ch * 0.62, cy = ch * 0.5, R = ch * 0.4, r = R * 0.42;
    g.fillStyle = VERDE;
    g.beginPath();
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2 - Math.PI / 2, rad = i % 2 ? r : R;
      const px = cx + Math.cos(a) * rad, py = cy + Math.sin(a) * rad;
      i ? g.lineTo(px, py) : g.moveTo(px, py);
    }
    g.closePath(); g.fill();
    g.fillStyle = '#e8641a';
    g.beginPath(); g.arc(cx, cy, R * 0.3, 0, Math.PI * 2); g.fill();
    // las letras
    g.textAlign = 'left'; g.textBaseline = 'middle';
    g.fillStyle = '#e8641a';
    g.font = `800 ${Math.round(ch * 0.72)}px "Barlow", Arial, Helvetica, sans-serif`;
    g.fillText('ROSA', ch * 1.25, ch * 0.55);
  });
}

/** la banda de la fachada con los departamentos, en verde sobre blanco */
function bandaDepartamentos() {
  return canvasTex(2048, 128, (g, cw, ch) => {
    g.fillStyle = '#f6f5ef'; g.fillRect(0, 0, cw, ch);
    g.fillStyle = VERDE;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = `700 ${Math.round(ch * 0.46)}px "Barlow", Arial, Helvetica, sans-serif`;
    for (const [t, x] of [['CERÁMICAS', 0.17], ['FERRETERÍA', 0.5], ['JARDINERÍA', 0.83]]) {
      g.fillText(t, cw * x, ch * 0.54);
    }
    g.strokeStyle = 'rgba(31,122,60,.55)'; g.lineWidth = 4;
    for (const x of [0.335, 0.665]) {
      g.beginPath(); g.moveTo(cw * x, ch * 0.22); g.lineTo(cw * x, ch * 0.78); g.stroke();
    }
  });
}

/** el panel de la marca de herramientas */
function rotuloTTools() {
  return canvasTex(512, 128, (g, cw, ch) => {
    g.fillStyle = '#123a8c'; g.fillRect(0, 0, cw, ch);
    g.strokeStyle = 'rgba(255,255,255,.22)'; g.lineWidth = 4;
    g.strokeRect(2, 2, cw - 4, ch - 4);
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = '#ffffff';
    g.font = `800 ${Math.round(ch * 0.56)}px "Barlow", Arial, Helvetica, sans-serif`;
    g.fillText('T Tools', cw / 2, ch * 0.57);
  });
}

let BASE = 0;
const alto = (x, z) => Math.max(terrainY(x, z) - BASE + SUELO, SUELO);

export function buildIndustriasRosa(scene, colliders) {
  const k = new Kit();
  const [mx, mz] = S(LEN / 2, 0);
  BASE = terrainY(mx, mz);

  /** pieza montada por delante de la fachada: w a lo largo (s), d hacia fuera */
  const pieza = (s, w, y, ancho, h, d, hex, list = k.shell) => {
    const [x, z] = S(s, w);
    k.box(x, y, z, ancho, h, d, hex, { ry: RY, list });
  };
  const cartel = (s, w, y, ancho, h, tex) => {
    const [x, z] = S(s, w);
    k.pic(x, y, z, ancho, h, N[0], N[1], tex);
  };

  const s0 = 1.1, s1 = LEN - 1.1, sm = (s0 + s1) / 2, largo = s1 - s0;

  // ── el escaparate, montado por delante del bloque del mapa ──
  pieza(sm, 0.34, 0, largo, 0.55, 0.2, 0x4b4f52);                       // el zócalo
  pieza(sm, 0.4, 0.55, largo, 2.85, 0.16, CRISTAL);                      // los cristales
  pieza(sm, 0.47, 0.47, largo, 0.16, 0.2, ALU);
  pieza(sm, 0.47, 3.32, largo, 0.16, 0.2, ALU);
  for (let s = s0; s <= s1 + 0.01; s += 3.2) pieza(s, 0.45, 0.55, 0.12, 2.85, 0.18, ALU);
  // los escaparates grandes, con su marco claro
  for (const [a, b] of [[3, 12], [14, 27], [29, 39]]) pieza((a + b) / 2, 0.5, 0.9, b - a, 2.2, 0.1, 0xd9d6cd);
  // la entrada, en mitad de la fachada
  pieza(sm, 0.48, 0.05, 6.4, 3.0, 0.14, 0x2f383d);
  for (const ds of [-3.2, -1.1, 1.1, 3.2]) pieza(sm + ds, 0.5, 0.05, 0.13, 3.0, 0.18, 0x77807f);

  // ── la banda blanca de los departamentos ──
  pieza(sm, 0.42, 3.4, largo + 0.4, 1.05, 0.26, BLANCO);
  cartel(sm, 0.56, 3.92, largo - 1.5, 0.78, bandaDepartamentos());

  // ── el cartel grande, sobre el tejado ──
  cartel(sm + 1.5, 0.5, 6.45, 15, 2.75, rotuloRosa());
  for (const ds of [-5.6, 0, 5.6]) {                                     // los pies del cartel
    const [px, pz] = S(sm + 1.5 + ds, 0.55);
    k.box(px, 4.55, pz, 0.12, 1.9, 0.12, 0x8f9498, { ry: RY, list: k.solid });
  }
  // el panel de T Tools, a la izquierda, encima de la banda
  cartel(8.5, 0.55, 5.15, 4.6, 1.0, rotuloTTools());

  // ── el tejado: las cajas de climatización ──
  for (const [s, w] of [[12, -11], [31, -14], [22, -20]]) {
    const [x, z] = S(s, w);
    k.box(x, 5, z, 3, 1, 2.1, 0xb9bcb8, { ry: RY, list: k.shell });
  }

  // ── el aparcamiento, siguiendo el terreno ──
  const tex = asfalto();
  const rejilla = (sa, sb, wa, wb) => {
    const ns = Math.max(1, Math.ceil((sb - sa) / 1.6)), nw = Math.max(1, Math.ceil((wb - wa) / 1.6));
    const ps = [];
    for (let i = 0; i <= ns; i++) {
      for (let j = 0; j <= nw; j++) {
        const [x, z] = S(sa + (sb - sa) * i / ns, wa + (wb - wa) * j / nw);
        ps.push({ x, z, y: alto(x, z) });
      }
    }
    const at = (i, j) => ps[i * (nw + 1) + j];
    const pos = [], uv = [], mpt = tex.userData.mpt || 4;
    for (let i = 0; i < ns; i++) {
      for (let j = 0; j < nw; j++) {
        for (const p of [at(i, j), at(i + 1, j + 1), at(i, j + 1), at(i, j), at(i + 1, j), at(i + 1, j + 1)]) {
          pos.push(p.x, p.y, p.z);
          uv.push(p.x / mpt, -p.z / mpt);
        }
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.computeVertexNormals();
    return geo;
  };
  const asfaltar = (sa, sb, wa, wb, color, name) => {
    const m = new THREE.Mesh(rejilla(sa, sb, wa, wb), paveMaterial(tex, color));
    m.name = name; m.receiveShadow = true; scene.add(m);
  };
  asfaltar(1, LEN - 1, 0.35, APARC, 0xffffff, 'rosaAparcamiento');

  /** una raya de las plazas, tumbada sobre el asfalto */
  const raya = (sa, wa, sb, wb) => {
    const [x0, z0] = S(sa, wa), [x1, z1] = S(sb, wb);
    const largoR = Math.hypot(x1 - x0, z1 - z0);
    const y = Math.max(alto(x0, z0), alto(x1, z1)) + 0.02;
    k.box((x0 + x1) / 2, y, (z0 + z1) / 2, 0.1, 0.012, largoR + 0.06, 0xeceae2,
      { ry: Math.atan2(x1 - x0, z1 - z0), list: k.shell });
  };
  for (let s = 3.4; s < LEN - 2; s += PLAZA) raya(s, 8, s, 13);

  // ── la verja blanca, con el hueco de la entrada ──
  const modulo = 2.4;
  for (const [a, b] of [[1, 17], [25, LEN - 1]]) {
    for (let s = a; s < b - 0.3; s += modulo) {
      const se = Math.min(s + modulo, b);
      const [x0, z0] = S(s, VERJA), [x1, z1] = S(se, VERJA);
      const y = alto(x0, z0);
      k.box(x0, y, z0, 0.14, 1.15, 0.14, BLANCO, { ry: RY, list: k.solid });
      k.box((x0 + x1) / 2, y + 1.06, (z0 + z1) / 2, se - s, 0.09, 0.09, BLANCO, { ry: RY, list: k.solid });
      k.box((x0 + x1) / 2, y + 0.5, (z0 + z1) / 2, se - s, 0.07, 0.07, 0xe6e3d9, { ry: RY, list: k.solid });
      for (let t = s + 0.12; t < se - 0.05; t += 0.16) {
        const [x, z] = S(t, VERJA);
        k.box(x, alto(x, z) + 0.1, z, 0.035, 0.9, 0.035, BLANCO, { ry: RY, list: k.solid });
      }
      k.block((x0 + x1) / 2, (z0 + z1) / 2, se - s, 0.24, RY);
    }
  }

  const { group, segs } = k.build('industriasRosa');
  scene.add(group);
  if (colliders) for (const sg of segs) colliders.addSegment(...sg);

  return { group };
}
