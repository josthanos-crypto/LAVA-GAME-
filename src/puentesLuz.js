import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { terrainY } from './terrain.js';

/**
 * (Version 183) Luz debajo de los puentes (José Manuel: «al pasar por debajo de un puente parece que entras en un cuarto
 * oscuro»).
 *  - El paso inferior de Tenderete lo dibujaban dos piezas a la vez: la vieja de los añadidos del PC de Arrecife
 *    (arrecifeExtras.js, una caja de tablero, muros y techo a su altura de antes) y el túnel del terraplén de
 *    trinchera.js, que vino después. La caja vieja quedaba a la altura del coche y se entraba en ella como en un cuarto
 *    gris sin luz. Se esconde aquí (el juego ya lo hace trinchera.js; sus losetas para el coche se dejan).
 *  - De noche, charcos de luz de farola en el suelo debajo de cada puente y dentro de cada túnel, y las luces del techo
 *    de los túneles encendidas (de día, a media luz, como en un túnel de verdad). Sin focos de luz nuevos: en el móvil
 *    cada foco cuesta en todos los píxeles.
 */

const RADIO = 3.6;

function texturaCharco() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const x = c.getContext('2d');
  const gr = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,1)');
  gr.addColorStop(0.45, 'rgba(255,255,255,0.45)');
  gr.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = gr;
  x.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

/** dónde van las lámparas de debajo de un puente de zanja (s, z del puente): sobre cada calzada, a lo ancho del tablero */
function lamparas(t, p) {
  const n = [-t.u[1], t.u[0]];
  const cn = Math.max(0.5, Math.abs(p.c[0] * n[0] + p.c[1] * n[1]));
  const ls = t.ancho > 10 ? [-t.ancho * 0.35, t.ancho * 0.35] : [-2, 2];
  const zs = p.tabX > 8 ? [-p.tabX * 0.5, 0, p.tabX * 0.5] : [-p.tabX * 0.4, p.tabX * 0.4];
  const out = [];
  for (const l of ls) for (const z of zs) out.push([p.tabC + l / cn, z]);
  return out;
}

/**
 * las lámparas: paneles de luz pegados a la cara de abajo del tablero (como pegarAlTablero de trinchera.js: el tablero
 * es una losa recta apoyada en sus esquinas, y cada lámpara se sube o se baja lo justo para quedar debajo de ella)
 */
function mallaLamparas(TRINCHERAS) {
  const geos = [];
  for (const t of TRINCHERAS) {
    if (t.tipo !== 'trinchera') continue;
    for (const p of t.puentes) {
      if (p.peatonal) continue;
      const C = p.tabC, X = p.tabX;
      const Pc = (s, z) => [p.o[0] + p.c[0] * (s - C) - p.c[1] * z, p.o[1] + p.c[1] * (s - C) + p.c[0] * z];
      const h = [Pc(0, -X), Pc(2 * C, -X), Pc(2 * C, X), Pc(0, X)].map(([x, z]) => terrainY(x, z));
      const losa = (s, z) => {
        const u = Math.min(1, Math.max(0, s / (2 * C))), v = Math.min(1, Math.max(0, (z + X) / (2 * X)));
        return u + v <= 1 ? h[0] + (h[1] - h[0]) * u + (h[3] - h[0]) * v : h[2] + (h[3] - h[2]) * (1 - u) + (h[1] - h[2]) * (1 - v);
      };
      for (const [s, z] of lamparas(t, p)) {
        const [x, zz] = Pc(s, z);
        const g = new THREE.BoxGeometry(1.4, 0.08, 0.35);
        g.rotateY(Math.atan2(-p.c[1], p.c[0]));
        g.translate(x, losa(s, z) - terrainY(x, zz) - 1.3, zz);
        geos.push(g.index ? g.toNonIndexed() : g);
      }
    }
  }
  if (!geos.length) return null;
  const mat = new THREE.MeshBasicMaterial({ color: 0x8a877f });
  mat.userData.trench = 'stay';
  const m = new THREE.Mesh(mergeGeometries(geos, false), mat);
  m.frustumCulled = false;
  m.name = 'puentesLamparas';
  return m;
}

/** dónde va cada charco: { below: [[x, y, z]...] (siguen a la trinchera), stay: [...] (a ras de suelo) } */
function sitios(TRINCHERAS) {
  const below = [], stay = [];
  for (const t of TRINCHERAS) {
    for (const p of t.puentes) {
      const C = p.tabC, X = p.tabX;
      const Pc = (s, z) => [p.o[0] + p.c[0] * (s - C) - p.c[1] * z, p.o[1] + p.c[1] * (s - C) + p.c[0] * z];
      if (t.tipo === 'terraplen') {
        // el túnel: a lo largo de la calle de abajo, en sus dos carriles
        const W = t.ancho, zs = X > 6 ? [-(X - 2.3) / 2, (X - 2.3) / 2] : [0];
        for (let s = C - W + 3; s <= C + W - 3; s += 7) for (const z of zs) stay.push([...Pc(s, z), 0.2]);
      } else {
        if (p.peatonal) continue;
        // (debajo de los puentes de zanja no: ahí la luz de las lámparas la pone la losa, que se enciende de noche;
        // un disco de luz dentro de la zanja quedaba tapado por el suelo)
      }
    }
  }
  return { below, stay };
}

function malla(puntos, mat, modo) {
  if (!puntos.length) return null;
  const geos = puntos.map(([x, z, y]) => {
    const g = new THREE.CircleGeometry(RADIO, 24);
    g.rotateX(-Math.PI / 2);
    g.translate(x, y, z);
    return g;
  });
  const m = new THREE.Mesh(mergeGeometries(geos, false), mat.clone());
  m.material.userData.trench = modo;
  m.renderOrder = 2;
  m.frustumCulled = false;   // el relieve lo pone la tarjeta gráfica: three.js no sabe dónde acaba
  m.name = 'puentesLuz';
  return m;
}

/** una textura blanca con los bordes difuminados (la luz de relleno de debajo de los puentes) */
function texturaRelleno() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const x = c.getContext('2d');
  const img = x.createImageData(64, 64);
  for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) {
    const e = (v) => Math.min(1, Math.min(v, 63 - v) / 14);
    const a = e(i) * e(j);
    const k = (j * 64 + i) * 4;
    img.data[k] = img.data[k + 1] = img.data[k + 2] = 255;
    img.data[k + 3] = Math.round(255 * a * a * (3 - 2 * a));
  }
  x.putImageData(img, 0, 0);
  return new THREE.CanvasTexture(c);
}

/**
 * la luz que rebota bajo los puentes y dentro de los túneles: un rectángulo de luz suave en el suelo (de día el
 * asfalto de debajo salía casi negro: solo le llegaba la luz del cielo). [centro, eje, largo, ancho, y, modo]
 */
function rellenos(TRINCHERAS) {
  const out = [];
  // solo en los túneles: en los puentes de zanja lo hace la losa de debajo, que trinchera.js aclara (un plano de luz
  // ahí, con la zanja bajando por debajo, salía como una cortina oscura)
  for (const t of TRINCHERAS) {
    if (t.tipo !== 'terraplen') continue;
    for (const p of t.puentes) if (!p.peatonal) out.push([p.o, p.c, 2 * t.ancho, 2 * p.tabX - 1, 0.21, 'stay']);
  }
  return out;
}

function mallaRelleno(lista, modo) {
  const geos = lista.filter(r => r[5] === modo).map(([o, c, L, W, y]) => {
    // (en trozos de 2 m: el relieve se pone en cada vértice y con solo 4 esquinas quedaba enterrado por el medio)
    const g = new THREE.PlaneGeometry(L, W, Math.ceil(L / 2), Math.ceil(W / 2));
    g.rotateX(-Math.PI / 2);
    g.rotateY(Math.atan2(-c[1], c[0]));
    g.translate(o[0], y, o[1]);
    return g;
  });
  if (!geos.length) return null;
  const mat = new THREE.MeshBasicMaterial({
    color: 0x292622, map: texturaRelleno(), transparent: true, opacity: 1, depthWrite: false,
    blending: THREE.AdditiveBlending, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
  });
  mat.userData.trench = modo;
  const m = new THREE.Mesh(mergeGeometries(geos, false), mat);
  m.renderOrder = 2;
  m.frustumCulled = false;
  m.name = 'puentesRelleno';
  return m;
}

/** g: el juego; grupos y TRINCHERAS: los de trinchera.js (se pasan para no importar trinchera.js desde aquí) */
export function montarLucesPuentes(g, grupos, TRINCHERAS) {
  if (!g?.scene) return null;
  const mat = new THREE.MeshBasicMaterial({
    color: 0xffc878, map: texturaCharco(), transparent: true, opacity: 1, depthWrite: false,
    blending: THREE.AdditiveBlending, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
  });
  const tono = new THREE.Color(0xffc878);
  const { below, stay } = sitios(TRINCHERAS);
  const charcos = [malla(below, mat, 'below'), malla(stay, mat, 'stay')].filter(Boolean);
  for (const m of charcos) { m.visible = false; g.scene.add(m); }
  g.postfx?.excludeFromAO?.(...charcos);
  const lamp = mallaLamparas(TRINCHERAS);
  if (lamp) { g.scene.add(lamp); g.postfx?.excludeFromAO?.(lamp); }
  const lista = rellenos(TRINCHERAS);
  const relleno = [mallaRelleno(lista, 'below'), mallaRelleno(lista, 'stay')].filter(Boolean);
  for (const m of relleno) g.scene.add(m);
  g.postfx?.excludeFromAO?.(...relleno);

  // las losas de debajo de los puentes (trinchera.js las aclara de día con un brillo propio)
  const losas = [];
  for (const gr of grupos) if (gr.name === 'losaPuente' && gr.material?.emissive) losas.push(gr.material);
  // las luces del techo de los túneles (las pone trinchera.js de color crema, sin brillo)
  const techo = [];
  for (const gr of grupos) {
    if (gr.name !== 'terraplenTunel') continue;
    gr.traverse(o => {
      for (const m of Array.isArray(o.material) ? o.material : o.material ? [o.material] : []) {
        if (m.color && m.color.getHex() === 0xfff4d8 && 'emissive' in m) { m.emissive.setHex(0xffe2a8); techo.push(m); }
      }
    });
  }

  // la caja vieja del paso de Tenderete (arrecifeExtras.js) se monta sola un poco después: se espera a que esté
  const tick = () => {
    const paso = g.extras?.paso;
    if (paso?.group?.visible) {
      paso.group.visible = false;
      // y sus losetas para el coche (las de su tablero, a la altura de antes): con el túnel de trinchera.js subían el
      // coche 2 m dentro del túnel y la cámara atravesaba el techo
      const cells = g.player?.roofs?.cells;
      if (cells) for (const [k, arr] of cells) {
        const quedan = arr.filter(r => !(r.x1 - r.x0 < 1.9 && r.z1 - r.z0 < 1.9 && Math.hypot((r.x0 + r.x1) / 2 - paso.x, (r.z0 + r.z1) / 2 - paso.z) < 40));
        if (quedan.length !== arr.length) cells.set(k, quedan);
      }
    }
    const night = g.dayNight?.night ?? 0;
    const on = THREE.MathUtils.smoothstep(night, 0.04, 0.3);
    for (const m of charcos) { m.visible = on > 0.01; m.material.color.copy(tono).multiplyScalar(on * 0.8); }
    for (const m of techo) m.emissiveIntensity = 0.5 + on * 1.6;
    // de día, la luz que rebota; de noche, algo más (la de las farolas de abajo)
    // (lo que cuenta es el color: con mezcla aditiva y el sombreador del relieve la opacidad no hace nada)
    const k = 0.16 + on * 0.12;
    for (const m of relleno) m.material.color.setRGB(k, k * 0.94, k * 0.84);
    // de día, la luz que rebota bajo el tablero; de noche casi nada (la ponen los charcos de las farolas)
    // las lámparas: gris de día, encendidas de noche
    if (lamp) lamp.material.color.setRGB(0.25 + on * 0.95, 0.24 + on * 0.85, 0.22 + on * 0.6);
    // la losa: de día la luz que rebota; de noche, la luz cálida de las lámparas del tablero
    for (const m of losas) m.emissive.setRGB(0.12 * (1 - on) + 0.09 * on, 0.115 * (1 - on) + 0.07 * on, 0.105 * (1 - on) + 0.04 * on);
  };
  tick();
  setInterval(tick, 500);
  return { charcos, techo, relleno };
}
