import * as THREE from 'three';
import { TRINCHERAS } from './trinchera.js';
import { asphaltTexture } from './textures.js';
import { terrainY } from './terrain.js';

/**
 * El asfalto y las rayas de los puentes grandes (Version 134, pedido por José Manuel: «el puente del Cabildo se ve
 * mal»). trinchera.js pone en cada puente una losa gris lisa con una sola raya discontinua en medio: vale para una
 * calle estrecha, pero en el puente del Cabildo cruzan las dos calzadas de la carretera grande y se veía un
 * rectángulo gris sin carriles. Debajo pasaba lo mismo: la losa que tapa la calle de arriba se comía las rayas de
 * la calle de abajo.
 *
 * Aquí se pinta, siguiendo las calles del mapa que pasan por cada puente:
 *  - arriba: asfalto como el de la calzada y las rayas de cada calzada (bordes continuos y discontinua en medio);
 *  - abajo: las rayas de las calzadas que pasan por debajo, sobre la losa del fondo.
 * Las rayas se calculan igual que en world.js (misma anchura y mismos trazos), así empalman con las de la calle.
 * Abajo cubren toda la zanja (las dos rampas y el paso bajo el puente), porque el asfalto del fondo tapa las del mapa.
 *
 * Se llama desde el construir() del barrio, con el mapa. No cambia trinchera.js: solo usa su lista de puentes.
 */

const DASH = 3, GAP = 4, HW = 0.07;      // como dashGeometry de world.js
const TABLERO = 0.16;                     // la cara de arriba de la losa del tablero (trinchera.js)
const Y_FONDO = 0.10;                     // justo encima del asfalto del fondo de la zanja (0,08)
const Y_LOSA = 0.32;                      // justo encima de la losa de debajo del puente (0,30)
const PASO = 2;                           // las rayas llevan un punto cada 2 m: así siguen la cuesta

/** trozos de una polilínea que caen dentro del rectángulo |s| <= S, |z| <= Z del marco (o, c), con un punto cada PASO */
export function recortar(pts, o, c, S, Z) {
  const dentro = ([x, y]) => { const dx = x - o[0], dz = y - o[1]; return Math.abs(dx * c[0] + dz * c[1]) <= S && Math.abs(-dx * c[1] + dz * c[0]) <= Z; };
  const runs = [];
  let run = null;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    const N = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / PASO));
    for (let k = i ? 1 : 0; k <= N; k++) {
      const q = [a[0] + (b[0] - a[0]) * (k / N), a[1] + (b[1] - a[1]) * (k / N)];
      if (dentro(q)) { if (!run) { run = []; runs.push(run); } run.push(q); } else run = null;
    }
  }
  return runs.filter(r => r.length > 1);
}

/** ¿el trozo va a lo largo de la dirección c? (0 = cruzado, 1 = a lo largo) */
function aLoLargo(run, c) {
  const a = run[0], b = run[run.length - 1], l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  return Math.abs(((b[0] - a[0]) * c[0] + (b[1] - a[1]) * c[1]) / l);
}

/** la polilínea desplazada d metros a su izquierda (d negativo: a la derecha) */
export function desplazar(pts, d) {
  return pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    return [p[0] - (b[1] - a[1]) / l * d, p[1] + (b[0] - a[0]) / l * d];
  });
}

/** cinta de ancho 2·hw a lo largo de la polilínea, a la altura yDe(x, z); si trazos, discontinua */
export function cinta(pos, pts, yDe, hw, trazos) {
  let s = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, az] = pts[i], [bx, bz] = pts[i + 1];
    const len = Math.hypot(bx - ax, bz - az);
    if (len < 1e-3) continue;
    const ux = (bx - ax) / len, uz = (bz - az) / len, nx = -uz * hw, nz = ux * hw;
    const v = (x, z) => pos.push(x, yDe(x, z), z);
    const quad = (d0, d1) => {
      const x0 = ax + ux * d0, z0 = az + uz * d0, x1 = ax + ux * d1, z1 = az + uz * d1;
      v(x0 + nx, z0 + nz); v(x1 + nx, z1 + nz); v(x0 - nx, z0 - nz);
      v(x0 - nx, z0 - nz); v(x1 + nx, z1 + nz); v(x1 - nx, z1 - nz);
    };
    if (!trazos) quad(0, len);
    else {
      // los trazos siguen de un tramo al siguiente (s = lo recorrido desde el principio)
      let d = 0;
      while (d < len - 1e-6) {
        const fase = (s + d) % (DASH + GAP);
        const fin = Math.min(len, d + (fase < DASH ? DASH : DASH + GAP) - fase);
        if (fase < DASH) quad(d, fin);
        d = fin;
      }
    }
    s += len;
  }
}

/** las rayas de un trozo de calle, como las pinta world.js: bordes continuos en las grandes y discontinua en medio */
function rayasDe(pos, r, run, yDe) {
  if (r.major) {
    cinta(pos, desplazar(run, r.w / 2 - 0.35), yDe, 0.04, false);
    cinta(pos, desplazar(run, -r.w / 2 + 0.35), yDe, 0.04, false);
  }
  const dosCarriles = r.ow ? r.w >= 9 : (r.major || r.w >= 6.5);
  if (dosCarriles) cinta(pos, run, yDe, HW, true);
}

export function malla(pos, mat) {
  if (!pos.length) return null;
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const n = new Float32Array(pos.length);
  for (let i = 1; i < n.length; i += 3) n[i] = 1;
  g.setAttribute('normal', new THREE.BufferAttribute(n, 3));
  const m = new THREE.Mesh(g, mat);
  m.receiveShadow = true;
  return m;
}

/** rejilla de asfalto (celdas de ~3 m) sobre el rectángulo |s| <= S, |z| <= Z del marco (o, c); quita(x, z) salta vértices */
function rejillaAsfalto(o, c, S, Z, yDe, quita) {
  const P = (s, z) => [o[0] + c[0] * s - c[1] * z, o[1] + c[1] * s + c[0] * z];
  const ns = Math.ceil(2 * S / 3), nz = Math.ceil(2 * Z / 3), pos = [], uv = [];
  const pt = (i, j) => P(-S + 2 * S * i / ns, -Z + 2 * Z * j / nz);
  for (let i = 0; i < ns; i++) for (let j = 0; j < nz; j++) {
    const q = [pt(i, j), pt(i, j + 1), pt(i + 1, j), pt(i + 1, j), pt(i, j + 1), pt(i + 1, j + 1)];
    for (let k = 0; k < 6; k += 3) {
      const tri = q.slice(k, k + 3);
      if (quita && tri.every(([x, z]) => quita(x, z))) continue;
      for (const [x, z] of tri) { pos.push(x, yDe(x, z), z); uv.push(x, z); }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.computeVertexNormals();
  return g;
}

let texAsfalto = null;
/** el asfalto de las calles (textures.js), una sola vez para todos los puentes */
function asfaltoMat(modo) {
  if (!texAsfalto) { texAsfalto = asphaltTexture(4); texAsfalto.repeat.set(0.3, 0.3); }
  const m = new THREE.MeshStandardMaterial({ map: texAsfalto, roughness: 0.95, side: THREE.DoubleSide });
  m.userData.trench = modo;
  return m;
}

/**
 * la altura sobre el terreno que hay que dar a un punto para que quede pegado a una losa recta apoyada en sus cuatro
 * esquinas (una caja de trinchera.js: dos triángulos con la diagonal de la esquina (-s, +z) a la (+s, -z))
 */
function sobreLosa(o, c, S, Z, cara) {
  const P = (s, z) => [o[0] + c[0] * s - c[1] * z, o[1] + c[1] * s + c[0] * z];
  const h = [P(-S, -Z), P(S, -Z), P(S, Z), P(-S, Z)].map(([x, z]) => terrainY(x, z));
  return (sube) => (x, z) => {
    const dx = x - o[0], dz = z - o[1];
    const u = Math.min(1, Math.max(0, (dx * c[0] + dz * c[1] + S) / (2 * S)));
    const v = Math.min(1, Math.max(0, (-dx * c[1] + dz * c[0] + Z) / (2 * Z)));
    const losa = u + v <= 1 ? h[0] + (h[1] - h[0]) * u + (h[3] - h[0]) * v : h[2] + (h[3] - h[2]) * (1 - u) + (h[1] - h[2]) * (1 - v);
    return losa - terrainY(x, z) + cara + sube;
  };
}

/**
 * Un terraplén (la circunvalación pasa por arriba y la calle por un túnel): la carretera de arriba salía sin carriles
 * pintados, a manchas, y con un rectángulo gris liso encima del túnel. Se le pone asfalto limpio a todo lo ancho y
 * las rayas de sus calzadas. Lo que va sobre la tierra sube con ella ('below'); lo de encima del túnel va pegado a su
 * losa ('stay').
 */
function pintarTerraplen(t, map, grupo, blanco) {
  const L = t.llano + t.rampa, W = t.ancho, H = -t.prof;
  const tuneles = t.puentes.filter(p => !p.peatonal).map(p => ({ o: p.o, c: p.c, S: W, Z: p.tabX + 0.6 }));
  const enTunel = (x, z) => tuneles.some(l => { const dx = x - l.o[0], dz = z - l.o[1]; return Math.abs(dx * l.c[0] + dz * l.c[1]) <= l.S && Math.abs(-dx * l.c[1] + dz * l.c[0]) <= l.Z; });
  // la carretera sobre la tierra: por encima de las calzadas del mapa (0,16) y de su pintura
  const m1 = new THREE.Mesh(rejillaAsfalto(t.o, t.u, L - 1, W - 0.3, () => 0.19, enTunel), asfaltoMat('below'));
  m1.receiveShadow = true;
  grupo.add(m1);
  const sobreTierra = [], sobreTunel = [];
  const calles = map.roads.filter(r => !r.ped && !r.dirt && r.p.length > 1);
  for (const r of calles) {
    for (const run of recortar(r.p, t.o, t.u, L - 1, W - 0.3)) if (aLoLargo(run, t.u) > 0.7) rayasDe(sobreTierra, r, run, () => 0.205);
  }
  // encima de cada túnel: la losa de trinchera.js (su cara de arriba está a H + 0,33 del suelo de abajo)
  for (const l of tuneles) {
    const y = sobreLosa(l.o, l.c, l.S, l.Z, H + 0.33);
    const m2 = new THREE.Mesh(rejillaAsfalto(l.o, l.c, l.S, l.Z, y(0.03)), asfaltoMat('stay'));
    m2.receiveShadow = true;
    grupo.add(m2);
    for (const r of calles) {
      for (const run of recortar(r.p, l.o, l.c, l.S, l.Z)) if (aLoLargo(run, t.u) > 0.7) rayasDe(sobreTunel, r, run, y(0.045));
    }
  }
  const ma = malla(sobreTierra, blanco('below')), mb = malla(sobreTunel, blanco('stay'));
  if (ma) grupo.add(ma);
  if (mb) grupo.add(mb);
}

/**
 * pinta los cruces de la lista (por su nombre en trinchera.js): los de tipo 'trinchera' (la calle grande cruza por
 * arriba a ras de suelo y la otra baja) y los de tipo 'terraplen' (la grande sube y la otra pasa por un túnel).
 * Devuelve el grupo, por si hay que mirarlo desde las pruebas.
 */
export function buildPuenteRayas(scene, map, nombres = ['Cabildo']) {
  const grupo = new THREE.Group();
  grupo.name = 'puenteRayas:' + nombres.join('+');
  // (el modo de trinchera.js va en el material: 'stay' = no baja con la zanja, 'below' = baja con ella)
  const blanco = (modo) => {
    const m = new THREE.MeshStandardMaterial({ color: 0xe9e7e1, roughness: 0.85, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
    m.userData.trench = modo;
    return m;
  };
  for (const t of TRINCHERAS) {
    if (!nombres.includes(t.nombre)) continue;
    if (t.tipo === 'terraplen') { pintarTerraplen(t, map, grupo, blanco); continue; }
    if (t.tipo !== 'trinchera') continue;
    const arriba = [], abajo = [];
    const losas = [];   // los rectángulos de debajo de cada puente, donde el suelo va más alto (la losa)
    for (const p of t.puentes) {
      if (p.peatonal) continue;
      const C = p.tabC, X = p.tabX, c = p.c;
      const cn = Math.max(0.5, Math.abs(c[0] * -t.u[1] + c[1] * t.u[0]));
      losas.push({ o: p.o, c, S: (t.ancho + t.talud) / cn, Z: X + 0.5 });
      // ── arriba: asfalto y rayas de las calzadas que cruzan por el puente ──
      // El tablero es una losa recta apoyada en sus cuatro esquinas (dos triángulos, con la diagonal de la esquina
      // (-s, +z) a la (+s, -z)); el terreno de debajo no es recto, así que cada punto de aquí se sube o se baja lo
      // justo para quedar pegado a la losa y no al terreno.
      const Ld = C - 0.3, Xr = X - 2.7;
      const P = (s, z) => [p.o[0] + c[0] * s - c[1] * z, p.o[1] + c[1] * s + c[0] * z];
      const h = [P(-Ld, -Xr), P(Ld, -Xr), P(Ld, Xr), P(-Ld, Xr)].map(([x, z]) => terrainY(x, z));
      const sobreTablero = (sube) => (x, z) => {
        const dx = x - p.o[0], dz = z - p.o[1];
        const u = Math.min(1, Math.max(0, (dx * c[0] + dz * c[1] + Ld) / (2 * Ld)));
        const v = Math.min(1, Math.max(0, (-dx * c[1] + dz * c[0] + Xr) / (2 * Xr)));
        const losa = u + v <= 1 ? h[0] + (h[1] - h[0]) * u + (h[3] - h[0]) * v : h[2] + (h[3] - h[2]) * (1 - u) + (h[1] - h[2]) * (1 - v);
        return losa - terrainY(x, z) + TABLERO + sube;
      };
      {
        const yDe = sobreTablero(0.03), pos = [], uv = [];
        const ns = Math.ceil(2 * Ld / 3), nz = Math.ceil(2 * Xr / 3);
        const V = (i, j) => { const [x, z] = P(-Ld + 2 * Ld * i / ns, -Xr + 2 * Xr * j / nz); pos.push(x, yDe(x, z), z); uv.push(x, z); };
        // (P gira a derechas visto desde arriba: este orden deja la cara hacia arriba)
        for (let i = 0; i < ns; i++) for (let j = 0; j < nz; j++) { V(i, j); V(i, j + 1); V(i + 1, j); V(i + 1, j); V(i, j + 1); V(i + 1, j + 1); }
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
        g.computeVertexNormals();
        const tex = asphaltTexture(4);
        tex.repeat.set(0.3, 0.3);
        const asf = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95, side: THREE.DoubleSide });
        asf.userData.trench = 'stay';
        const m = new THREE.Mesh(g, asf);
        m.receiveShadow = true;
        grupo.add(m);
      }
      const yRaya = sobreTablero(0.045);
      for (const r of map.roads) {
        if (r.ped || r.dirt || r.p.length < 2) continue;
        for (const run of recortar(r.p, p.o, c, Ld, Xr - 0.2)) if (aLoLargo(run, c) > 0.7) rayasDe(arriba, r, run, yRaya);
      }
    }
    // ── abajo: las rayas de las calzadas que van por el fondo de la zanja (el asfalto del fondo tapa las del mapa) ──
    const enLosa = (x, z) => losas.some(l => { const dx = x - l.o[0], dz = z - l.o[1]; return Math.abs(dx * l.c[0] + dz * l.c[1]) <= l.S && Math.abs(-dx * l.c[1] + dz * l.c[0]) <= l.Z; });
    const yAbajo = (x, z) => (enLosa(x, z) ? Y_LOSA : Y_FONDO);
    for (const r of map.roads) {
      if (r.ped || r.dirt || r.p.length < 2) continue;
      for (const run of recortar(r.p, t.o, t.u, t.llano + t.rampa - 1, t.ancho + 2)) if (aLoLargo(run, t.u) > 0.7) rayasDe(abajo, r, run, yAbajo);
    }
    const ma = malla(arriba, blanco('stay')), mb = malla(abajo, blanco('below'));
    if (ma) grupo.add(ma);
    if (mb) grupo.add(mb);
  }
  scene.add(grupo);
  return grupo;
}
