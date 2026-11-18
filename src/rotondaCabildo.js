import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { asphaltTexture, sidewalkTexture } from './textures.js';

/**
 * ROTONDA DEL CABILDO (Arrecife): la glorieta grande por la que pasa la Avenida
 * Fred Olsen, con la escultura de la Vela Latina en medio.
 *
 * El mapa la traía dibujada con cuatro arcos de calle sueltos y las calles que
 * entran. De ahí salían los defectos que se veían desde el aire: las líneas de
 * borde de los arcos se cruzaban en estrella por dentro del anillo, el borde
 * exterior salía en polígono, faltaban pasos de cebra en casi todas las salidas
 * y las aceras de las calles se metían dentro de la calzada.
 *
 * Aquí se vuelve a poner la calzada como un anillo limpio y circular por encima
 * del anterior (que queda debajo, tapado), con su acera alrededor, el bordillo,
 * las líneas y los cinco pasos de cebra. Las aceras y la pintura viejas que
 * quedaban dentro del anillo se descartan en el propio sombreador (una máscara
 * circular), así no hay que tocar las mallas del mundo.
 *
 * Las medidas salen de los propios arcos del mapa, ajustados a un círculo:
 * centro (-1283,54, 590,92), radio del eje 32,19 m y calzada de 9,5 m.
 */

const CX = -1283.54, CZ = 590.92;
const R_EJE = 32.19, ANCHO = 9.5;
const R_IN = 26.4;                       // el asfalto se mete bajo el bordillo de la isleta
const R_BORDE = R_EJE + ANCHO / 2;       // 36,94: borde exterior de la calzada
const R_ACERA = 39.8;                    // borde exterior de la acera de la rotonda
const Y_CALZADA = 0.185;                 // 2,5 cm por encima de las calzadas del mundo (0,16)
const Y_PINTURA = 0.196;
const Y_ACERA = 0.268;                   // 8 mm por encima de las aceras del mundo (0,26)
const TAU = Math.PI * 2;

/** redondeces: la máscara circular que borra lo viejo dentro del anillo */
const R_MASCARA_ACERA = 36.9;
/** hasta dónde se borra el mundo (aceras y bordillos): justo donde acaba la acera nueva */
const R_MASCARA_MUNDO = 39.85;

// ─────────────────────────── las cinco salidas ───────────────────────────

/** las calles que desembocan en la rotonda, con su línea desde el anillo hacia fuera */
function salidasDe(map) {
  const out = [];
  for (const r0 of map.roads) {
    if (r0.glorieta || r0.ped || r0.dirt || r0.p.length < 2) continue;
    const a = r0.p[0], b = r0.p[r0.p.length - 1];
    const da = Math.hypot(a[0] - CX, a[1] - CZ), db = Math.hypot(b[0] - CX, b[1] - CZ);
    let p = null;
    if (da < 38 && db > da + 2) p = r0.p;
    else if (db < 38 && da > db + 2) p = [...r0.p].reverse();
    if (!p) continue;
    out.push({ w: r0.w, p });
  }
  return out;
}

// ───────────────────── huecos de la acera en las salidas ─────────────────────

const BINS = 2880;

/** tramos angulares (rad, 0..2π) donde la acera de la rotonda se corta porque pasa una calle */
function huecosDeSalidas(salidas) {
  const mark = new Uint8Array(BINS);
  const marcar = (a) => {
    let k = Math.floor((a / TAU) * BINS) % BINS;
    if (k < 0) k += BINS;
    mark[k] = 1;
  };
  for (const s of salidas) {
    const half = s.w / 2 + 0.9;
    let acc = 0;
    for (let i = 0; i < s.p.length - 1 && acc < 40; i++) {
      const [ax, az] = s.p[i], [bx, bz] = s.p[i + 1];
      const L = Math.hypot(bx - ax, bz - az);
      const ux = L > 0.01 ? (bx - ax) / L : 1, uz = L > 0.01 ? (bz - az) / L : 0;
      for (let d = 0; d <= L && acc + d < 40; d += 0.4) {
        for (const o of [-1, -0.5, 0, 0.5, 1]) {
          const x = ax + ux * d - uz * o * half, z = az + uz * d + ux * o * half;
          const rr = Math.hypot(x - CX, z - CZ);
          if (rr < R_BORDE - 0.5 || rr > R_ACERA + 0.5) continue;
          marcar(Math.atan2(z - CZ, x - CX));
        }
      }
      acc += L;
    }
  }
  // engordar el hueco un poco (0,5 m) para que el bordillo no pise el asfalto
  const grow = 6;
  const tmp = mark.slice();
  for (let i = 0; i < BINS; i++) {
    if (!tmp[i]) continue;
    for (let k = -grow; k <= grow; k++) {
      let j = (i + k) % BINS;
      if (j < 0) j += BINS;
      mark[j] = 1;
    }
  }
  // bins a intervalos
  const out = [];
  let ini = -1;
  for (let i = 0; i < BINS; i++) {
    if (mark[i] && ini < 0) ini = i;
    else if (!mark[i] && ini >= 0) { out.push([(ini / BINS) * TAU, (i / BINS) * TAU]); ini = -1; }
  }
  if (ini >= 0) out.push([(ini / BINS) * TAU, TAU]);
  // unir el último con el primero si dan la vuelta
  if (out.length > 1 && out[out.length - 1][1] >= TAU - 0.001 && out[0][0] <= 0.001) {
    const ult = out.pop();
    out[0] = [ult[0] - TAU, out[0][1]];
  }
  return out;
}

/** lo que queda de acera: el complemento de los huecos */
function tramosDeAcera(huecos) {
  if (!huecos.length) return [[0, TAU]];
  const out = [];
  for (let i = 0; i < huecos.length; i++) {
    const e = huecos[i][1], s = huecos[(i + 1) % huecos.length][0] + (i === huecos.length - 1 ? TAU : 0);
    const len = s - e;
    if (len > 0.01) out.push([e, s]);
  }
  return out;
}

// ─────────────────────────────── superficies ───────────────────────────────

/** anillo (o trozo) plano a la altura y; uv = 'asfalto' | 'acera' | null */
function anilloGeo(r0, r1, a0, a1, y, uv) {
  const medio = (r0 + r1) / 2;
  const n = Math.max(2, Math.ceil(((a1 - a0) * medio) / 2.2));
  const rad = Math.max(1, Math.ceil((r1 - r0) / 2.5));
  const pos = [], uvs = [], idx = [];
  for (let i = 0; i <= n; i++) {
    const a = a0 + ((a1 - a0) * i) / n;
    const ca = Math.cos(a), sa = Math.sin(a);
    for (let j = 0; j <= rad; j++) {
      const r = r0 + ((r1 - r0) * j) / rad;
      const x = CX + ca * r, z = CZ + sa * r;
      pos.push(x, y, z);
      if (uv === 'asfalto') uvs.push(x / 31.7, -z / 26.7);
      else if (uv === 'acera') uvs.push(x / 4.4, -z / 4.4);
      else uvs.push(x * 0.25, -z * 0.25);
    }
  }
  const fila = rad + 1;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < rad; j++) {
      const a = i * fila + j, b = a + fila, c = a + 1, d = b + 1;
      idx.push(a, b, c, c, b, d);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** pared vertical siguiendo un radio (bordillo) */
function muroGeo(r, a0, a1, y0, y1) {
  const n = Math.max(2, Math.ceil(((a1 - a0) * r) / 2));
  const pos = [], uvs = [];
  for (let i = 0; i <= n; i++) {
    const a = a0 + ((a1 - a0) * i) / n;
    const ca = Math.cos(a), sa = Math.sin(a);
    const x = CX + ca * r, z = CZ + sa * r;
    pos.push(x, y0, z, x, y1, z);
    const u = (i / n) * (((a1 - a0) * r) / 4.4);
    uvs.push(u, 0, u, (y1 - y0) / 4.4);
  }
  const idx = [];
  for (let i = 0; i < n; i++) {
    const a = i * 2;
    idx.push(a, a + 1, a + 2, a + 2, a + 1, a + 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

// ─────────────────────────── materiales (PBR) ───────────────────────────

function pbr(tex, bumpScale = 1) {
  const o = tex.userData.orm, b = tex.userData.bump;
  return new THREE.MeshStandardMaterial({
    map: tex, roughnessMap: o || null, metalnessMap: o || null,
    bumpMap: b || null, bumpScale, roughness: 1, metalness: 1,
    polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
  });
}

// ─────────────────────── máscara: borrar lo viejo ───────────────────────

/**
 * Descarta en el sombreador los trozos de una malla que caen dentro del círculo.
 * Se usa para las aceras y la pintura viejas que se metían dentro de la rotonda.
 */
function recortarEnCirculo(mat, r) {
  if (!mat || mat.userData.__ronda) return;
  mat.userData.__ronda = true;
  const prev = mat.onBeforeCompile;
  const centro = `vec2(${CX.toFixed(2)}, ${CZ.toFixed(2)})`;
  mat.onBeforeCompile = function (shader, renderer) {
    if (prev) prev.call(this, shader, renderer);
    // la posición se toma del atributo `position`, no de `transformed`: así funciona
    // tanto si este hook corre antes como después del parche del terreno, que
    // reescribe el trozo del vértice.
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec2 vRondaXZ;')
      .replace('void main() {', 'void main() {\n  vRondaXZ = (modelMatrix * vec4(position, 1.0)).xz;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec2 vRondaXZ;')
      .replace('void main() {', `void main() {\n  if (distance(vRondaXZ, ${centro}) < ${r.toFixed(2)}) discard;`);
  };
  mat.needsUpdate = true;
}

/** busca las mallas del mundo que hay que recortar (por su material) */
function recortarMundo(scene) {
  const hechos = new Set();
  scene.traverse((o) => {
    if (!o.isMesh || Array.isArray(o.material) || !o.material) return;
    const m = o.material;
    const col = m.color ? m.color.getHexString() : '';
    const rep = m.map?.repeat?.x;
    if (col === 'e6e6dc' && !hechos.has(m)) {           // pintura vial (cebras y líneas)
      hechos.add(m);
      recortarEnCirculo(m, 38.3);
    } else if ((col === 'd8d4cc' || col === 'bcb8b0') && !hechos.has(m)) {   // bordillos
      hechos.add(m);
      recortarEnCirculo(m, R_MASCARA_MUNDO);
    } else if (col === 'ffffff' && Math.abs((rep ?? 0) - 0.5) < 0.01 && o.geometry?.attributes?.position?.count > 500000) {
      hechos.add(m);                                     // aceras (textura repetida a 0,5)
      recortarEnCirculo(m, R_MASCARA_MUNDO);
    }
  });
}

// ─────────────────────────────── construir ───────────────────────────────

export function buildRotondaCabildo(scene, map) {
  const salidas = salidasDe(map);
  const huecos = huecosDeSalidas(salidas);
  const tramos = tramosDeAcera(huecos);

  // 1. la pintura y las aceras viejas que quedaban dentro del anillo
  recortarMundo(scene);

  const grupo = new THREE.Group();
  grupo.name = 'rotondaCabildo';

  // 2. calzada: un anillo limpio y circular encima del anterior
  const asfaltoTex = asphaltTexture(8);
  const asfalto = new THREE.Mesh(anilloGeo(R_IN, R_BORDE + 0.02, 0, TAU, Y_CALZADA, 'asfalto'), pbr(asfaltoTex));
  asfalto.receiveShadow = true;
  grupo.add(asfalto);

  // 3. acera alrededor, con un hueco en cada salida
  const aceraTex = sidewalkTexture(8);
  const aceraMat = pbr(aceraTex, 1.4);
  aceraMat.side = THREE.DoubleSide;
  const piedra = new THREE.MeshStandardMaterial({ color: 0xd8d4cc, roughness: 0.8 });
  const piedraLado = new THREE.MeshStandardMaterial({ color: 0xbcb8b0, roughness: 0.85, side: THREE.DoubleSide });

  const aceraTop = [];
  const cerca = [];
  const caras = [];
  for (const [a0, a1] of tramos) {
    aceraTop.push(anilloGeo(R_MASCARA_ACERA - 0.02, 37.3, a0, a1, Y_ACERA, 'acera'));
    cerca.push(anilloGeo(37.3, R_ACERA, a0, a1, Y_ACERA, 'acera'));
    caras.push(muroGeo(R_MASCARA_ACERA, a0, a1, 0.16, Y_ACERA));            // bordillo interior
    caras.push(muroGeo(R_ACERA, a0, a1, 0.06, Y_ACERA));                     // borde exterior hacia el suelo
  }
  // los laterales del corte en cada salida (el bordillo que remata el hueco)
  for (const [s, e] of huecos) {
    if (s < 0) continue;
    for (const a of [s, e]) {
      const ca = Math.cos(a), sa = Math.sin(a);
      const x0 = CX + ca * R_MASCARA_ACERA, z0 = CZ + sa * R_MASCARA_ACERA;
      const x1 = CX + ca * R_ACERA, z1 = CZ + sa * R_ACERA;
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute([
        x0, 0.16, z0, x1, 0.16, z1, x0, Y_ACERA, z0, x1, Y_ACERA, z1,
      ], 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 0, 1, 1, 1], 2));
      g.setIndex([0, 1, 2, 2, 1, 3]);
      g.computeVertexNormals();
      caras.push(g);
    }
  }
  if (cerca.length) {
    const m = new THREE.Mesh(mergeGeometries(cerca.map((g) => g.toNonIndexed()), false), piedra);
    m.receiveShadow = true;
    grupo.add(m);
  }
  if (aceraTop.length) {
    const m = new THREE.Mesh(mergeGeometries(aceraTop.map((g) => g.toNonIndexed()), false), aceraMat);
    m.receiveShadow = true;
    grupo.add(m);
  }
  if (caras.length) {
    const m = new THREE.Mesh(mergeGeometries(caras.map((g) => g.toNonIndexed()), false), piedraLado);
    m.receiveShadow = true;
    grupo.add(m);
  }

  // 4. pintura del anillo
  const pinturaMat = new THREE.MeshStandardMaterial({
    color: 0xe9e7dc, roughness: 0.6, metalness: 0,
    polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3,
  });
  const pintura = [];
  // línea interior pegada a la isleta (continua)
  pintura.push(anilloGeo(27.9, 28.05, 0, TAU, Y_PINTURA, null));
  // línea exterior de la calzada (se corta en las salidas)
  for (const [a0, a1] of tramos) pintura.push(anilloGeo(36.2, 36.35, a0, a1, Y_PINTURA, null));
  // línea discontinua del carril (3 m de trazo, 4,5 m de hueco), cortada en las salidas
  const paso = (3 + 4.5) / R_EJE;
  const trazo = 3 / R_EJE;
  for (const [a0, a1] of tramos) {
    for (let a = a0; a + trazo <= a1; a += paso) {
      pintura.push(anilloGeo(R_EJE - 0.07, R_EJE + 0.07, a, a + trazo, Y_PINTURA, null));
    }
  }

  // 5. (los pasos de cebra ya los trae el mapa en las cinco salidas; aquí no se
  //    duplican para no salir dos zebrados seguidos)

  const malla = new THREE.Mesh(mergeGeometries(pintura.map((g) => g.toNonIndexed()), false), pinturaMat);
  malla.receiveShadow = true;
  grupo.add(malla);

  scene.add(grupo);
  return { group: grupo, salidas: salidas.length };
}
