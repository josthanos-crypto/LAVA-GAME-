import * as THREE from 'three';
import { isTouchDevice } from './touch.js';

/**
 * El campo de arriba, puesto en su sitio de verdad (Version 145).
 *
 * José Manuel: «esta zona está muy mal» (la casa del camino de tierra). Lo que pasaba:
 *  - La casa, los vecinos, los muros, los caminos y las fincas se calcaron en su día de fotos sin escala ni
 *    coordenadas y se colgaron del punto que da Apple Maps para la dirección, que cae unos 62 m al sureste de la
 *    casa de verdad. Todo el campo quedó corrido entre 30 y 60 m.
 *  - El suelo era un llano rojo pintado: de esa zona el juego no tenía foto aérea.
 *
 * Ahora:
 *  - El suelo del campo es la ortofoto oficial (PNOA, © Instituto Geográfico Nacional de España, CC BY 4.0), bajada
 *    del servicio del IGN el 17/11/2026: `public/campo/campo.jpg` (todo el campo, 1,3 m por punto) y
 *    `public/campo/casa.jpg` (500 × 400 m alrededor de la casa, 0,33 m por punto; en el móvil no se carga).
 *  - (Version 146) El relieve de esa zona es ya el de verdad (terrain.js, `map/terreno-norte.json`).
 *  - Todo lo que había hecho se RECOLOCA sobre esa foto, sin rehacerlo: `mover(x, z)` da el sitio de verdad de cada
 *    punto antiguo. Los puntos de control (`CONTROL`) están medidos comparando lo calcado con la foto oficial: en el
 *    caserío de la casa es un traslado limpio (53,5 m al oeste y 33,5 m al norte) y encaja al metro; hacia el sur
 *    va bajando hasta cero, porque las calles y casas reales del norte de Arrecife ya estaban en su sitio.
 *  - La casa es la del tejado rojo con la piscina al oeste y el cuarto de tejas en la esquina (como en sus fotos).
 *
 * Cómo se usa: casaCampo.js y caminoAnmara.js pasan sus datos por `recolocarCalles` / `recolocarCasas` /
 * `recolocarPunto` y construyen sobre `escenaReal(scene)` y `choquesReales(colliders)`, que mueven cada pieza al
 * añadirla. Para volver a lo de antes basta poner `ACTIVO = false`.
 *
 * Coordenadas del juego: x = (lon + 13,55) · 97398, z = (28,9625 − lat) · 111320.
 */

export const ACTIVO = true;

/** el rectángulo del campo (el mismo de casaCampo.js) y el del detalle de la casa */
const CAMPO = { x0: -2700, x1: 0, z0: -3700, z1: -2385 };
const DETALLE = { x0: -2305, x1: -1805, z0: -3537, z1: -3137 };

/** puntos de control: [x antigua, z antigua, metros al este, metros al sur] (negativo = al oeste / al norte) */
const CONTROL = [
  // el caserío de la casa: un traslado limpio
  [-2002, -3304, -53.5, -33.5], [-1950, -3380, -53.5, -33.5], [-2060, -3250, -53.5, -33.5], [-1930, -3170, -53.5, -33.5],
  // las casas del camino, bajando hacia la ciudad
  [-1835, -2945, -48, -22], [-1780, -2845, -40, -20], [-1717, -2750, -38, -15],
  // el cruce grande y el arranque del camino
  [-1960, -2612, -30, -13], [-2057, -2590, -17, -8],
  // las fincas de picón y el camino del este
  [-1580, -3290, -40, -30], [-1400, -3380, -40, -30],
];

// fuera del campo no se mueve nada (las montañas del fondo, la ciudad): se apaga poco a poco en los bordes
const rampa = (v, a, b) => Math.max(0, Math.min(1, (v - a) / (b - a)));
const dentro = (x, z) => rampa(z, -3950, -3750) * rampa(-z, 2560, 2640) * rampa(x, -2900, -2750) * rampa(-x, -100, 0);

/** cuánto hay que mover un punto antiguo: [dx, dz] */
export function desplazamiento(x, z) {
  if (!ACTIVO) return [0, 0];
  const k = dentro(x, z);
  if (k <= 0) return [0, 0];
  let sw = 0, sx = 0, sz = 0;
  for (const [cx, cz, dx, dz] of CONTROL) {
    const d2 = (x - cx) * (x - cx) + (z - cz) * (z - cz);
    if (d2 < 1) return [dx * k, dz * k];
    const w = 1 / (d2 * Math.sqrt(d2));
    sw += w; sx += w * dx; sz += w * dz;
  }
  return [sx / sw * k, sz / sw * k];
}

/** el sitio de verdad de un punto antiguo */
export function mover(x, z) {
  const [dx, dz] = desplazamiento(x, z);
  return [+(x + dx).toFixed(2), +(z + dz).toFixed(2)];
}

// ───────────── la casa de José Manuel, en su parcela de verdad (Version 152) ─────────────
// José Manuel confirmó (17/11/2026, sobre la foto oficial numerada) que su casa es la de la esquina sureste del
// caserío: justo donde caía su enlace de Apple Maps y donde casaCampo.js tenía la casa desde el principio. En la
// Version 145 se movió por error, con todo el caserío, a la casa del tejado rojo. Ahora:
//  - la casa NO se mueve (sus números de casaCampo.js ya son los de verdad);
//  - la parcela es larga de norte a sur: la casa arriba, dando a la calle; en medio, el patio con la piscina; al
//    fondo, el garaje y la explanada. casaCampo.js tenía el patio y el garaje al OESTE de la casa: se giran un
//    cuarto de vuelta, enteros, para que queden al SUR (lo que miraba al norte pasa a mirar al oeste, como la
//    puerta del garaje en sus fotos);
//  - el resto del caserío sigue con el desplazamiento de `CONTROL`, que es el que encaja con la foto.
// (Version 153) La parcela mide 14 m de ancho (de x = -2010 a -1996) y el patio de casaCampo.js medía 21,4: al
// girarlo se estrecha a lo ancho (`ancho`) para que quepa entero dentro de sus muros, con el garaje pegado al muro
// del oeste y la puerta dando a la explanada. Y baja 3 m para dejar sitio a la terraza, que va en la cara sur.
export const PATIO = { de: [-2009.5, -3294.6], a: [-1996, -3292], ancho: 14 / 21.4 };
// la terraza con la pérgola: casaCampo.js la tenía en la cara oeste; va en la cara sur, sobre el patio
export const TERRAZA = { de: [-2009.5, -3302.3], a: [-2002.5, -3295], ancho: 1 };
/** el sitio de verdad de un punto de una pieza girada: `de` = punto de casaCampo.js, `a` = ese punto en la realidad */
export const giro = ({ de, a, ancho = 1 }) => (x, z) => [+(a[0] + ancho * (z - de[1])).toFixed(2), +(a[1] - (x - de[0])).toFixed(2)];
export const alPatioReal = giro(PATIO);
/** un grupo que pone en su sitio todo lo que se le meta (giro de un cuarto de vuelta, y el ancho) */
export function grupoGirado(nombre, { de, a, ancho = 1 }) {
  const g = new THREE.Group();
  g.name = nombre;
  g.rotation.y = Math.PI / 2;
  g.scale.z = ancho;
  g.position.set(a[0] - ancho * de[1], 0, a[1] + de[0]);
  g.updateMatrix();
  return g;
}
/** la parcela de verdad (casa, patio y garaje), con un margen: ahí no van casas genéricas ni matojos */
export const enCasaReal = (x, z) => ACTIVO && x < -1994.5 && ((x > -2010.5 && z > -3317.5 && z < -3294) || (x > -2023 && z >= -3295.5 && z < -3266));
/** la casa del tejado rojo con piscina (donde estuvo por error la casa en la Version 145): una casa más del caserío */
export const CASA_TEJADO_ROJO = { p: [[-2063, -3348], [-2049, -3348], [-2049, -3328], [-2063, -3328], [-2063, -3348]], h: 6.3 };

/** un punto [x, z, ...resto] (palmeras, sitios): se mueve y conserva lo demás */
export const recolocarPunto = (p) => { const [x, z] = mover(p[0], p[1]); return [x, z, ...p.slice(2)]; };

/** las calles y caminos: cada punto a su sitio (un camino largo se adapta a lo largo) */
export const recolocarCalles = (calles) => calles.map(c => ({ ...c, p: c.p.map(([x, z]) => mover(x, z)) }));

const centro = (p) => {
  const n = p.length > 1 && p[0][0] === p[p.length - 1][0] && p[0][1] === p[p.length - 1][1] ? p.length - 1 : p.length;
  let x = 0, z = 0;
  for (let i = 0; i < n; i++) { x += p[i][0]; z += p[i][1]; }
  return [x / n, z / n];
};

/** las casas: cada una entera, sin deformarla, con el traslado de su centro */
export function recolocarCasas(casas) {
  return casas.map(b => {
    const [cx, cz] = centro(b.p), [dx, dz] = desplazamiento(cx, cz);
    return { ...b, p: b.p.map(([x, z]) => [+(x + dx).toFixed(2), +(z + dz).toFixed(2)]) };
  });
}

/**
 * Las casas «detectadas» de la parte de abajo (z > -2740) eran una cuadrícula puesta a ojo: ahí el juego ya tiene
 * las calles y casas reales del norte de Arrecife (public/extras), y sobre la foto de verdad se veían fuera de sitio.
 */
export const casaDeAbajo = ([, z]) => ACTIVO && z > -2740;

// ───────────── recolocar lo que se construye ─────────────

const _v = new THREE.Vector3(), _m = new THREE.Matrix4();

function moverGeometria(g) {
  const pos = g.getAttribute('position');
  if (!pos) return;
  g.computeBoundingBox();
  const bb = g.boundingBox, rigido = Math.hypot(bb.max.x - bb.min.x, bb.max.z - bb.min.z) < 120;
  if (rigido) {
    // una pieza pequeña (una casa, un muro, un coche): entera, sin deformarla
    const [dx, dz] = desplazamiento((bb.min.x + bb.max.x) / 2, (bb.min.z + bb.max.z) / 2);
    if (dx || dz) g.translate(dx, 0, dz);
  } else {
    // una pieza que cruza el campo (un camino, los cables, lo fundido en una sola malla): punto a punto
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i), [dx, dz] = desplazamiento(x, z);
      pos.setXYZ(i, x + dx, pos.getY(i), z + dz);
    }
    pos.needsUpdate = true;
  }
  g.computeBoundingBox();
  g.computeBoundingSphere();
}

function moverObjeto(o) {
  o.updateMatrixWorld(true);
  // «en su sitio del mundo»: sin giro, escala ni traslado (la altura no cuenta)
  const enOrigen = (q) => q.matrixWorld.elements.every((e, i) => i === 13 || Math.abs(e - (i % 5 === 0 ? 1 : 0)) < 1e-6);
  if (!enOrigen(o)) {
    // colocado con su posición (un coche, una loma): se mueve entero
    const [dx, dz] = desplazamiento(o.position.x, o.position.z);
    o.position.x += dx; o.position.z += dz;
    return;
  }
  const hechas = new Set();
  o.traverse(q => {
    if (q.isInstancedMesh) {
      // los matojos y las piedras: uno a uno
      for (let i = 0; i < q.count; i++) {
        q.getMatrixAt(i, _m);
        _v.setFromMatrixPosition(_m);
        const [dx, dz] = desplazamiento(_v.x, _v.z);
        _m.elements[12] += dx; _m.elements[14] += dz;
        if (enCasaReal(_v.x + dx, _v.z + dz)) _m.makeScale(0, 0, 0);   // dentro de la parcela de la casa no hay matojos
        q.setMatrixAt(i, _m);
      }
      q.instanceMatrix.needsUpdate = true;
      return;
    }
    if (!q.geometry || hechas.has(q.geometry)) return;
    if (enOrigen(q)) { hechas.add(q.geometry); moverGeometria(q.geometry); } else if (q.parent && enOrigen(q.parent)) {
      const [dx, dz] = desplazamiento(q.position.x, q.position.z);
      q.position.x += dx; q.position.z += dz;
    }
  });
}

/** la foto oficial como suelo del campo, en vez de la tierra pintada */
function fotoDeSuelo(malla) {
  const base = import.meta.env.BASE_URL || './';
  const cargar = (archivo) => {
    const t = new THREE.TextureLoader().load(base + 'campo/' + archivo);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  };
  // La malla conserva sus coordenadas de textura (metros del mundo entre `mpt`) y su atributo de color, porque
  // los añadidos del norte de Arrecife (arrecifeExtras.js) le cambian un trozo por una malla más fina que copia
  // las dos cosas y comparte el material. La foto se coloca con la matriz de la textura: u = (x - x0) / ancho,
  // v = 1 - (z - z0) / alto.
  const mpt = malla.material.map?.userData?.mpt || 6;
  const W = CAMPO.x1 - CAMPO.x0, H = CAMPO.z1 - CAMPO.z0;
  const foto = cargar('campo.jpg');
  foto.wrapS = foto.wrapT = THREE.ClampToEdgeWrapping;
  foto.repeat.set(mpt / W, mpt / H);
  foto.offset.set(-CAMPO.x0 / W, 1 + CAMPO.z0 / H);
  const col = malla.geometry.getAttribute('color');
  if (col) { for (let k = 0; k < col.count; k++) col.setXYZ(k, 1, 1, 1); col.needsUpdate = true; }
  malla.material.color.set(0xffffff);
  malla.material.map = foto;
  // malla de 15 m: que baje en las hondonadas, como el suelo de la ciudad, y no asome por encima de los caminos
  malla.material.userData.terrainSeg = 15;
  malla.material.needsUpdate = true;
  const piezas = [malla];
  // Alrededor de la casa, una malla fina (5 m) un pelo por encima: con el relieve de verdad la de 15 m tapaba a
  // trozos las calles del caserío. En el ordenador lleva la foto de detalle; en el móvil, la misma foto general.
  const movil = isTouchDevice();
  const S = 5, nx = Math.round((DETALLE.x1 - DETALLE.x0) / S), nz = Math.round((DETALLE.z1 - DETALLE.z0) / S);
  const pos = [], uv = [], idx = [];
  for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) {
    const x = DETALLE.x0 + i * S, z = DETALLE.z0 + j * S;
    pos.push(x, 0.075, z);
    if (movil) uv.push(x / mpt, -z / mpt); else uv.push(i / nx, 1 - j / nz);
  }
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) { const a = j * (nx + 1) + i, b = a + nx + 1; idx.push(a, b, b + 1, a, b + 1, a + 1); }
  const g = new THREE.BufferGeometry();
  g.setIndex(idx);
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.computeVertexNormals();
  const m = malla.material.clone();
  if (!movil) m.map = cargar('casa.jpg');
  m.vertexColors = false;      // esta malla no lleva color por vértice
  m.polygonOffsetFactor = -2; m.polygonOffsetUnits = -2;
  m.userData = { ...malla.material.userData, terrainSeg: S };
  const detalle = new THREE.Mesh(g, m);
  detalle.receiveShadow = true;
  detalle.name = 'tierraCampoDetalle';
  piezas.push(detalle);
  return piezas;
}

/** una escena que pone en su sitio cada pieza que se le añade (lo demás, igual que la de verdad) */
export function escenaReal(scene) {
  if (!ACTIVO) return scene;
  return new Proxy(scene, {
    get(t, k) {
      if (k !== 'add') { const v = t[k]; return typeof v === 'function' ? v.bind(t) : v; }
      return (...objs) => {
        for (const o of objs) {
          if (!o) continue;
          if (o.name === 'tierraCampo') { t.add(...fotoDeSuelo(o)); continue; }
          // los enarenados ya salen en la foto, en su sitio y con su forma de verdad
          if (o.name === 'enarenado') continue;
          moverObjeto(o);
          t.add(o);
        }
        return t;
      };
    },
  });
}

/** los choques, en su sitio: cada tramo entero, con el traslado de su centro */
export function choquesReales(colliders) {
  if (!ACTIVO || !colliders) return colliders;
  return new Proxy(colliders, {
    get(t, k) {
      if (k !== 'addSegment') { const v = t[k]; return typeof v === 'function' ? v.bind(t) : v; }
      return (x1, z1, x2, z2, ...resto) => {
        const [dx, dz] = desplazamiento((x1 + x2) / 2, (z1 + z2) / 2);
        return t.addSegment(x1 + dx, z1 + dz, x2 + dx, z2 + dz, ...resto);
      };
    },
  });
}
