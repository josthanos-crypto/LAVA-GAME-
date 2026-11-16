import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { paveMaterial, asfalto } from './suelos.js';
import { terrainY } from './terrain.js';

/**
 * El MediaMarkt del Parque Comercial de Argana — Calle Tenderete 7 (Argana Alta).
 *
 * Es un local PEQUEÑO pegado al supermercado: en el vídeo IMG_0398 de José Manuel
 * (26/10/2026) se ve la tienda de una sola planta, con la banda negra del rótulo
 * en el peto, la marquesina sobre la puerta, la valla blanca de barrotes y, detrás
 * y a los lados, la nave larga del HiperDino, que es casi todo el complejo.
 *
 * Va en el testero del bloque alto de la nave (el extremo de la calle), que es
 * donde OpenStreetMap pone el nodo del MediaMarkt —(−1291, −1354)—, y da al
 * aparcamiento grande del centro comercial, el que sale en la foto aérea y en el
 * vídeo con los coches aparcados de frente.
 *
 * El aparcamiento sigue la cuesta del terreno como el del HiperDino. Las palmeras
 * van con las demás de la ciudad (map.extraPalms, world.js).
 */

const A = [-1320.8, -1455.3];
const D = [-1270.3, -1365.2];
const B = [-1360.9, -1432.8];
const LEN = Math.hypot(D[0] - A[0], D[1] - A[1]);            // 103,3 m de fachada
const WID = Math.hypot(B[0] - A[0], B[1] - A[1]);            // 46,0 m de fondo
const U = [(D[0] - A[0]) / LEN, (D[1] - A[1]) / LEN];        // a lo largo de la fachada
const N = [U[1], -U[0]];                                     // hacia fuera (aparcamiento)
const RY = Math.atan2(U[0], U[1]) + Math.PI / 2;
const RY2 = RY + Math.PI / 2;                                // el ancho va por el fondo
/** punto en coordenadas de la nave: u a lo largo de la fachada, v hacia el aparcamiento */
const Q = (u, v) => [A[0] + U[0] * u + N[0] * v, A[1] + U[1] * u + N[1] * v];
const MURO = Q(LEN, -WID / 2);                               // el testero del extremo

// el local: pegado al testero por dentro del aparcamiento, 16 m de escaparate y 9 de fondo
const LOC_U = LEN + 4.6;         // su centro, 4,6 m por delante del testero
const LOC_V = -14;               // y desplazado a un lado, para no tapar el aparcamiento
const LOC_ANCHO = 16;            // a lo ancho (v)
const LOC_FONDO = 9;             // hacia fuera (u)
const LOC_ALTO = 5.4;
const SUELO = 0.34;
const APARC = 24;
const PLAZA = 2.55;
const BLANCO = 0xf2f0e9, HUESO = 0xe9e6dd, NEGRO = 0x1b1d20, ALU = 0x9aa0a4, CRISTAL = 0x39434a;

/** las palmeras del aparcamiento (las planta world.js), apartadas del escaparate */
export function tuneCentroComercialArgana(map) {
  map.extraPalms = map.extraPalms || [];
  for (const [v, h] of [[-2.4, 8.8], [-30, 9.4], [-42, 8.6]]) {
    const [x, z] = Q(LEN + APARC + 3.2, v);
    map.extraPalms.push([x, z, h, 0.4 + v * 0.05]);
  }
}

/** el rótulo: «Media Markt» en rojo con el remolino, sobre banda negra */
function rotuloMediaMarkt() {
  return canvasTex(1024, 128, (g, cw, ch) => {
    g.fillStyle = '#1b1d20'; g.fillRect(0, 0, cw, ch);
    g.textBaseline = 'middle';
    g.fillStyle = '#e2001a';
    g.font = `italic 800 ${Math.round(ch * 0.6)}px "Barlow", Arial, Helvetica, sans-serif`;
    g.textAlign = 'right';
    g.fillText('Media', cw * 0.44, ch * 0.56);
    g.textAlign = 'left';
    g.fillText('Markt', cw * 0.58, ch * 0.56);
    // el remolino rojo y blanco, en medio
    const cxp = cw * 0.51, cyp = ch * 0.5, r = ch * 0.3;
    g.fillStyle = '#ffffff';
    g.beginPath(); g.arc(cxp, cyp, r, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#e2001a';
    for (let i = 0; i < 3; i++) {
      g.beginPath();
      g.moveTo(cxp, cyp);
      g.arc(cxp, cyp, r, i * 2.09, i * 2.09 + 1.25);
      g.closePath(); g.fill();
    }
    g.fillStyle = '#ffffff';
    g.beginPath(); g.arc(cxp, cyp, r * 0.28, 0, Math.PI * 2); g.fill();
  });
}

let BASE = 0;
const alto = (x, z) => Math.max(terrainY(x, z) - BASE + SUELO, SUELO);

export function buildCentroComercialArgana(scene, colliders) {
  const k = new Kit();
  BASE = terrainY(MURO[0], MURO[1]);

  /** pieza del local: w a lo ancho (v), d hacia fuera (u) */
  const local = (u, v, y, w, h, d, hex, list = k.shell, ry = RY2) => {
    const [x, z] = Q(u, v);
    k.box(x, y, z, w, h, d, hex, { ry, list });
  };
  const cartel = (u, v, y, w, h, tex) => {
    const [x, z] = Q(u, v);
    k.pic(x, y, z, w, h, U[0], U[1], tex);
  };

  // ── el cajón del local ──
  local(LOC_U, LOC_V, 0, LOC_ANCHO, LOC_ALTO, LOC_FONDO, HUESO);
  local(LOC_U, LOC_V, LOC_ALTO, LOC_ANCHO + 0.5, 0.34, LOC_FONDO + 0.5, 0xd9d6cd);   // el peto
  // la banda negra del rótulo, en el frente y en los dos costados
  local(LOC_U + LOC_FONDO / 2, LOC_V, 4.35, LOC_ANCHO + 0.2, 1.05, 0.3, NEGRO);
  local(LOC_U, LOC_V + LOC_ANCHO / 2, 4.35, LOC_FONDO, 1.05, 0.3, NEGRO, k.shell, RY);
  local(LOC_U, LOC_V - LOC_ANCHO / 2, 4.35, LOC_FONDO, 1.05, 0.3, NEGRO, k.shell, RY);

  // ── el escaparate y la puerta ──
  const esc = LOC_U + LOC_FONDO / 2;
  local(esc + 0.06, LOC_V, 0, LOC_ANCHO - 1, 0.5, 0.12, 0x8c8f8a);
  local(esc + 0.08, LOC_V, 0.5, LOC_ANCHO - 2, 3.4, 0.12, CRISTAL);
  local(esc + 0.14, LOC_V, 0.42, LOC_ANCHO - 2, 0.14, 0.18, ALU);
  local(esc + 0.14, LOC_V, 3.88, LOC_ANCHO - 2, 0.14, 0.18, ALU);
  for (let v = LOC_V - LOC_ANCHO / 2 + 1.6; v < LOC_V + LOC_ANCHO / 2 - 1; v += 2.4) {
    local(esc + 0.13, v, 0.5, 0.11, 3.4, 0.16, ALU);
  }
  local(esc + 0.15, LOC_V - 3.4, 0.05, 4.2, 3.2, 0.1, 0x2f383d);     // la puerta
  for (const dv of [-2.1, -0.7, 0.7, 2.1]) local(esc + 0.17, LOC_V - 3.4 + dv, 0.05, 0.12, 3.2, 0.14, 0x77807f);

  // ── la marquesina sobre la puerta, con sus dos tirantes ──
  local(esc + 1.0, LOC_V - 3.4, 3.62, 8.4, 0.26, 2.0, BLANCO);
  for (const dv of [-4.0, 4.0]) {
    const [bx, bz] = Q(esc + 1.85, LOC_V - 3.4 + dv);
    k.box(bx, alto(bx, bz), bz, 0.13, 3.55, 0.13, 0xbfc2be, { ry: RY2, list: k.solid });
  }

  // ── el rótulo, en la banda negra ──
  cartel(esc + 0.2, LOC_V, 4.88, 9.4, 0.95, rotuloMediaMarkt());
  // y otro pequeño en el costado que se ve desde la calle
  {
    const [x, z] = Q(LOC_U - 1.5, LOC_V + LOC_ANCHO / 2 + 0.18);
    k.pic(x, 4.88, z, 5.4, 0.62, N[0], N[1], rotuloMediaMarkt());
  }

  // ── la valla blanca de barrotes, con el hueco de la entrada ──
  const valla = (u0, u1, v) => {
    for (let u = u0; u < u1 - 0.3; u += 2.4) {
      const ue = Math.min(u + 2.4, u1);
      const [x0, z0] = Q(u, v), [x1, z1] = Q(ue, v);
      const y = alto(x0, z0);
      k.box(x0, y, z0, 0.12, 1.2, 0.12, 0xf3f1ea, { ry: RY, list: k.solid });
      k.box((x0 + x1) / 2, y + 1.1, (z0 + z1) / 2, ue - u, 0.08, 0.08, 0xf3f1ea, { ry: RY, list: k.solid });
      for (let t = u + 0.12; t < ue - 0.05; t += 0.15) {
        const [x, z] = Q(t, v);
        k.box(x, alto(x, z) + 0.12, z, 0.03, 0.95, 0.03, 0xffffff, { ry: RY, list: k.solid });
      }
      k.block((x0 + x1) / 2, (z0 + z1) / 2, ue - u, 0.22, RY);
    }
  };
  valla(LEN + 9.4, LEN + APARC, LOC_V + LOC_ANCHO / 2 + 0.4);   // el lado de arriba
  valla(LEN + 9.4, LEN + APARC, LOC_V - LOC_ANCHO / 2 - 0.4);   // el de abajo

  // ── el aparcamiento, siguiendo la cuesta ──
  const tex = asfalto();
  const rejilla = (u0, u1, va, vb) => {
    const nu = Math.max(1, Math.ceil((u1 - u0) / 1.6)), nv = Math.max(1, Math.ceil((vb - va) / 1.6));
    const ps = [];
    for (let i = 0; i <= nu; i++) {
      for (let j = 0; j <= nv; j++) {
        const [x, z] = Q(u0 + (u1 - u0) * i / nu, va + (vb - va) * j / nv);
        ps.push({ x, z, y: alto(x, z) });
      }
    }
    const at = (i, j) => ps[i * (nv + 1) + j];
    const pos = [], uv = [], mpt = tex.userData.mpt || 4;
    for (let i = 0; i < nu; i++) {
      for (let j = 0; j < nv; j++) {
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
  const asfaltar = (u0, u1, va, vb, color, name) => {
    const m = new THREE.Mesh(rejilla(u0, u1, va, vb), paveMaterial(tex, color));
    m.name = name; m.receiveShadow = true; scene.add(m);
  };
  asfaltar(LEN + 0.1, LEN + APARC, -WID + 1.6, -1.6, 0xffffff, 'arganaCentroAparcamiento');

  /** una raya de las plazas, tumbada sobre el asfalto */
  const raya = (u0, va, u1, vb) => {
    const [x0, z0] = Q(u0, va), [x1, z1] = Q(u1, vb);
    const largo = Math.hypot(x1 - x0, z1 - z0);
    const y = Math.max(alto(x0, z0), alto(x1, z1)) + 0.02;
    k.box((x0 + x1) / 2, y, (z0 + z1) / 2, 0.1, 0.012, largo + 0.06, 0xeceae2,
      { ry: Math.atan2(x1 - x0, z1 - z0), list: k.shell });
  };
  for (let v = -WID + 3.6; v < -2.4; v += PLAZA) {
    for (const [a, b] of [[11, 16], [18, 23]]) raya(LEN + a, v, LEN + b, v);
  }

  // ── el bordillo del aparcamiento y dos farolas ──
  for (let v = -WID + 1.6; v < -1.6; v += 2.4) {
    const [x, z] = Q(LEN + APARC, v);
    k.box(x, alto(x, z), z, 2.3, 0.18, 0.24, 0xc9c6bd, { ry: RY2, list: k.shell });
  }
  for (const v of [-6, -40]) {
    const [x, z] = Q(LEN + APARC - 1.2, v);
    const y = alto(x, z);
    k.cyl(x, y, z, 0.11, 0.14, 7.6, 0x9ba0a3, { seg: 10 });
    k.box(x, y + 7.6, z, 1.5, 0.16, 0.5, 0xb9bebf, { ry: RY2, list: k.solid });
    k.box(x, y + 7.44, z, 1.2, 0.06, 0.34, 0xfff4e0, { ry: RY2, list: k.glow });
  }

  // el choque del local (el de la nave ya lo pone hiperdinoArgana.js)
  const [lcx, lcz] = Q(LOC_U, LOC_V);
  k.block(lcx, lcz, LOC_ANCHO, LOC_FONDO, RY2);

  const { group, segs } = k.build('centroComercialArgana');
  scene.add(group);
  if (colliders) for (const sg of segs) colliders.addSegment(...sg);

  return { group };
}
