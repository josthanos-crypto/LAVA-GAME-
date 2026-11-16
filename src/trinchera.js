import * as THREE from 'three';
import { Kit } from './interiorKit.js';
import { marco, enMarco, sueloTex, trocear } from './restaurantesCharco.js';
import { paveMesh, polyTris } from './suelos.js';

/**
 * Los cruces a distinto nivel de la circunvalación (LZ-3), pedidos por José Manuel el 09/11/2026 («los puentes de
 * verdad»), con sus fotos. El juego mueve coches y gente en un plano (las cuestas solo se dibujan, ver terrain.js), así
 * que se hace en el dibujo, en una franja a lo largo de la circunvalación. Hay dos tipos:
 * - 'trinchera' (el puente de Pereyra Galviaty y los que son como él): la circunvalación baja en trinchera y la calle
 *   cruza por encima por el puente, a ras de suelo. El puente como en las fotos: las barreras de hormigón, las aceras,
 *   la valla alta de barrotes blancos y postes verdes (para que nadie se tire) y, a lo largo de la circunvalación, las
 *   pantallas contra el ruido de metacrilato;
 * - 'terraplen' (la entrada a Titerroy por la calle Tenderete): la circunvalación sube en terraplén de tierra volcánica
 *   y la calle pasa por debajo por el túnel, con las aletas blancas en las bocas.
 *
 * Cómo se reparte qué sube o baja (lo dice el «tablero»: el rectángulo del cruce, a lo largo de la calle que cruza):
 * - lo fijo de la franja (calzadas, aceras, farolas) sube o baja con la circunvalación; en el terraplén, lo fijo que cae
 *   en las bocas del túnel no se dibuja (la calle de abajo la pone esta pieza);
 * - lo que se mueve y está en el tablero (coches, gente) sigue a la circunvalación si va a lo largo de ella, y si la
 *   cruza se queda a ras de suelo;
 * - lo de esta pieza lleva su modo: 'below' (sigue a la circunvalación), 'stay' (no se mueve), 'wall' (solo baja la
 *   parte de abajo) y 'wing' (solo sube la de arriba);
 * - el suelo de la foto aérea no se dibuja en la franja, y la cámara sube o baja con el jugador.
 * Todo se engancha desde fuera al sombreador de terreno del juego: no se cambia terrain.js ni main.js.
 */

// o: el centro de la franja; u: la dirección de la circunvalación; prof: lo que baja (si es negativo, sube); llano: el
// medio tramo llano; rampa: lo que tarda en volver a ras de suelo; ancho: el medio ancho (las dos calzadas con sus
// aceras); talud: lo que ocupa la cuesta de los lados; muros: false para taludes de tierra en vez de muros (donde hay
// ramales pegados); puentes: cada calle que cruza (su punto, su dirección c, su ancho w, si es peatonal, lo que se curva
// y, en el terraplén, el medio ancho del túnel); pantallas: false para no poner las pantallas contra el ruido
export const TRINCHERAS = [
  { nombre: 'Pereyra Galviaty', tipo: 'trinchera', o: [-759.2, -1215.1], u: [0.7562, -0.6545], prof: 7, llano: 22, rampa: 140,
    ancho: 16.5, talud: 1, puentes: [{ o: [-759.2, -1215.1], c: [0.6545, 0.7562], w: 8 }] },
  { nombre: 'Tenderete (Titerroy)', tipo: 'terraplen', o: [-996.05, -1016.3], u: [0.7745, -0.6325], prof: -5.5, llano: 35,
    rampa: 100, ancho: 16.5, talud: 8, puentes: [{ o: [-996.05, -1016.3], c: [-0.527, -0.8499], w: 8, medio: 6.6 }] },
  { nombre: 'Camino de Guime', tipo: 'trinchera', o: [-1680.34, -490.32], u: [0.6741, -0.7386], prof: 7, llano: 22, rampa: 80,
    ancho: 21, talud: 1, puentes: [{ o: [-1680.34, -490.32], c: [0.7326, 0.6806], w: 9.5 }] },
  // el enlace de la LZ-20: el ramal en curva pasa dos veces por encima y, al lado, la pasarela de la gente; a los lados
  // van los ramales pegados, así que sin muros (taludes de tierra)
  { nombre: 'Enlace LZ-20', tipo: 'trinchera', o: [-1259.2, -809.8], u: [0.7919, -0.6108], prof: 7, llano: 102, rampa: 95,
    ancho: 15, talud: 10, muros: false, puentes: [
      { o: [-1322.15, -761.21], c: [0.585, 0.811], w: 2.6, peatonal: true, curva: 4.4 },
      { o: [-1269.92, -801.9], c: [0.6016, 0.7988], w: 11, curva: 5.8 },
      { o: [-1196.26, -858.38], c: [0.5576, 0.8301], w: 11, curva: 3.4 }] },
  // el enlace de la Carretera de Las Caletas (LZ-18): la circunvalación baja por dentro de la rotonda grande y los dos
  // lados del anillo de la rotonda pasan por encima en puente (con los ramales pegados: taludes de tierra)
  { nombre: 'Las Caletas', tipo: 'trinchera', o: [1852.06, -1644.35], u: [0.9926, 0.1215], prof: 6.5, llano: 66, rampa: 32,
    ancho: 16.3, talud: 6, muros: false, puentes: [
      { o: [1798.13, -1650.95], c: [-0.1372, 0.9905], w: 11, curva: 2.6 },
      { o: [1905.98, -1637.75], c: [0.0963, -0.9954], w: 11, curva: 2.6 }] },
  // la calle Francisco Matallana: el puente entre las dos rotondas, con la circunvalación en curva por debajo
  { nombre: 'Francisco Matallana', tipo: 'trinchera', o: [129.15, -2031.15], u: [0.875, -0.483], prof: 7, llano: 22, rampa: 60,
    ancho: 17, talud: 8, muros: false, puentes: [{ o: [129.15, -2031.15], c: [-0.551, -0.835], w: 8 }] },
  // la circunvalación por encima de la LZ-1 (sus dos calzadas por el túnel)
  { nombre: 'LZ-1', tipo: 'terraplen', o: [522, -2085.02], u: [0.9992, 0.0388], prof: -6, llano: 35, rampa: 100, ancho: 15.3,
    talud: 8, puentes: [{ o: [522, -2085.02], c: [-0.1206, 0.9927], w: 28, medio: 18 }] },
  // el puente del Cabildo (San Francisco Javier): la carretera grande pasa por encima y la calle que baja de la rotonda
  // al Cabildo, con sus dos calzadas, por debajo. La franja es corta por el norte (la calle se va en curva hacia la
  // rotonda): por eso taludes de tierra en vez de muros y sin pantallas, que cortarian la curva
  { nombre: 'Cabildo', tipo: 'trinchera', o: [-1343.2, 424], u: [-0.0416, 0.9991], prof: 6.5, llano: 20, rampa: 40,
    ancho: 13, talud: 8, muros: false, pantallas: false, puentes: [{ o: [-1343, 418], c: [0.9965, -0.083], w: 26 }] },
  // los dos enlaces de la Carretera de San Bartolome (LZ-20) en Argana Alta: la carretera pasa hundida y la calle que
  // une las dos rotonditas cruza por encima. Los ramales van pegados (taludes de tierra, sin pantallas) y las rotondas
  // quedan a 20 m del puente (sin las barandillas de las entradas, que caerian encima de ellas)
  { nombre: 'LZ-20 (calle Ico)', tipo: 'trinchera', o: [-1573.3, -1122.2], u: [0.814, 0.581], prof: 6.5, llano: 10, rampa: 45,
    ancho: 8.5, talud: 6, muros: false, pantallas: false, puentes: [{ o: [-1573.3, -1122.2], c: [0.6, -0.8], w: 8, barandillas: false }] },
  { nombre: 'LZ-20 (calle Tajaraste)', tipo: 'trinchera', o: [-2294, -1721.5], u: [0.765, 0.644], prof: 6.5, llano: 10, rampa: 55,
    ancho: 8.5, talud: 5, muros: false, pantallas: false, puentes: [{ o: [-2294, -1721.5], c: [-0.841, 0.541], w: 13, barandillas: false }] },
  // el enlace de Playa Honda: la LZ-2 (sus dos calzadas) pasa por encima y la calle que une las dos rotondas, por el tunel
  { nombre: 'Playa Honda (LZ-2)', tipo: 'terraplen', o: [-4118, 590], u: [0.9992, -0.04], prof: -6, llano: 35, rampa: 100,
    ancho: 15.3, talud: 8, puentes: [{ o: [-4118, 590], c: [0.071, 0.9975], w: 9.5, medio: 10.5 }] },
  // el enlace del oeste, donde la circunvalacion llega a la carretera de Playa Honda: la carretera en curva (sus dos
  // calzadas) cruza por el puente y la circunvalacion pasa por debajo antes de meterse en el lazo
  { nombre: 'Enlace del oeste (circunvalación)', tipo: 'trinchera', o: [-1802, 362.5], u: [0, 1], prof: 6, llano: 14, rampa: 50,
    ancho: 7.5, talud: 6, muros: false, pantallas: false, puentes: [{ o: [-1802, 362.5], c: [1, 0], w: 20, barandillas: false }] },
  // el paso inferior de la LZ-2 entre San Francisco Javier y Playa Honda: la LZ-2 (dos calzadas y el carril de al lado)
  // por encima y la calle, con sus dos sentidos, por el tunel
  { nombre: 'LZ-2 (paso inferior del oeste)', tipo: 'terraplen', o: [-2213.6, 471.5], u: [0.9985, -0.055], prof: -6, llano: 35, rampa: 100,
    ancho: 17, talud: 8, puentes: [{ o: [-2213.6, 471.5], c: [0.07, 0.9975], w: 12, medio: 8.5 }] },
];
// el medio largo (a través de la circunvalación) y el medio ancho de cada tablero
for (const t of TRINCHERAS) {
  for (const p of t.puentes) {
    const cn = Math.abs(p.c[0] * -t.u[1] + p.c[1] * t.u[0]);
    p.tabC = (t.ancho + t.talud + (t.tipo === 'terraplen' ? 1 : 1.5)) / Math.max(0.5, cn);
    p.tabX = p.medio ?? (p.w / 2 + (p.peatonal ? 0.6 : 3) + (p.curva || 0));
  }
}
const N = 13, NP = 3;

// ——— el sombreador ———

const GLSL = /* glsl */`
uniform vec4 trA[ ${N} ];
uniform vec4 trB[ ${N} ];
uniform vec4 trC[ ${N} ];
uniform vec4 trPo[ ${N * NP} ];
uniform vec4 trPd[ ${N * NP} ];
uniform float trN;
varying float vTrHide;
float trenchAt( vec2 p, out vec2 ax, out int kk ) {
  float d = 0.0;
  ax = vec2( 0.0 );
  kk = 0;
  for ( int k = 0; k < ${N}; k++ ) {
    if ( float( k ) >= trN ) break;
    vec2 q = p - trA[ k ].xy, u = trA[ k ].zw;
    float a = abs( dot( q, u ) ), l = abs( dot( q, vec2( -u.y, u.x ) ) );
    float F = trB[ k ].y, R = trB[ k ].z, W = trB[ k ].w, S = trC[ k ].x;
    if ( a > F + R || l > W + S ) continue;
    float f = a <= F ? 1.0 : 1.0 - smoothstep( 0.0, 1.0, ( a - F ) / R );
    float g = l <= W ? 1.0 : 1.0 - ( l - W ) / S;
    float v = trB[ k ].x * f * g;
    if ( abs( v ) > abs( d ) ) { d = v; ax = u; kk = k; }
  }
  return d;
}
bool trenchRect( vec2 p, int k ) {
  for ( int i = 0; i < ${NP}; i++ ) {
    vec4 d = trPd[ k * ${NP} + i ];
    if ( d.z <= 0.0 ) continue;
    vec2 q = p - trPo[ k * ${NP} + i ].xy, c = d.xy;
    if ( abs( dot( q, c ) ) < d.z && abs( dot( q, vec2( -c.y, c.x ) ) ) < d.w ) return true;
  }
  return false;
}
`;

const VERT_CUT = /* glsl */`
  {
    vec2 trAx;
    int trK;
    float trd = trenchAt( wp.xz, trAx, trK );
    if ( trd != 0.0 ) {
      #if defined( TRENCH_BELOW )
      h -= trd;
      #elif defined( TRENCH_STAY )
      #elif defined( TRENCH_WALL )
      if ( wp.y < 0.3 ) h -= trd;
      #elif defined( TRENCH_WING )
      if ( wp.y > 0.3 ) h -= trd;
      #elif defined( TERRAIN_GROUND )
      // el suelo de la foto no se mueve: dentro de la franja no se dibuja (ver el sombreador de fragmentos)
      #else
      vec3 o = modelMatrix[ 3 ].xyz;
      vec2 rx = modelMatrix[ 0 ].xz;
      bool along = length( rx ) > 0.01 && abs( dot( normalize( rx ), trAx ) ) < 0.7;
      if ( trenchRect( o.xz, trK ) ) {
        // lo que se mueve por el cruce: sigue a la circunvalación si va a lo largo de ella
        if ( along ) h -= trd;
      } else {
        // en el terraplén, lo fijo que cae en el túnel (las bocas y debajo de la carretera) no se dibuja ni sube: la
        // calle de abajo y la calzada de encima las pone esta pieza. (Antes solo se escondían las bocas, y los trozos
        // de calzada a caballo del borde del túnel quedaban levantados como cuñas.)
        if ( trC[ trK ].y > 0.5 && trenchRect( wp.xz, trK ) ) vTrHide = 1.0;
        else h -= trd;
      }
      #endif
    }
  }
  return h - base;`;

const FRAG_GROUND_PARS = /* glsl */`
uniform vec4 trA[ ${N} ];
uniform vec4 trB[ ${N} ];
uniform vec4 trC[ ${N} ];
uniform float trN;
`;
const FRAG_GROUND = /* glsl */`
for ( int k = 0; k < ${N}; k++ ) {
  if ( float( k ) >= trN ) break;
  vec2 q = vTerrainXZ - trA[ k ].xy, u = trA[ k ].zw;
  if ( abs( dot( q, u ) ) < trB[ k ].y + trB[ k ].z && abs( dot( q, vec2( -u.y, u.x ) ) ) < trB[ k ].w + trC[ k ].x ) discard;
}
`;

const uniforms = {
  trA: { value: Array.from({ length: N }, () => new THREE.Vector4()) },
  trB: { value: Array.from({ length: N }, () => new THREE.Vector4()) },
  trC: { value: Array.from({ length: N }, () => new THREE.Vector4()) },
  trPo: { value: Array.from({ length: N * NP }, () => new THREE.Vector4()) },
  trPd: { value: Array.from({ length: N * NP }, () => new THREE.Vector4()) },
  trN: { value: 0 },
};
TRINCHERAS.forEach((t, k) => {
  uniforms.trA.value[k].set(t.o[0], t.o[1], t.u[0], t.u[1]);
  uniforms.trB.value[k].set(t.prof, t.llano, t.rampa, t.ancho);
  uniforms.trC.value[k].set(t.talud, t.tipo === 'terraplen' ? 1 : 0, 0, 0);
  t.puentes.slice(0, NP).forEach((p, i) => {
    uniforms.trPo.value[k * NP + i].set(p.o[0], p.o[1], 0, 0);
    uniforms.trPd.value[k * NP + i].set(p.c[0], p.c[1], p.tabC, p.tabX);
  });
});
uniforms.trN.value = TRINCHERAS.length;

const DEFINES = { below: '#define TRENCH_BELOW\n', stay: '#define TRENCH_STAY\n', wall: '#define TRENCH_WALL\n', wing: '#define TRENCH_WING\n' };

/** mete la franja en un sombreador que ya trae el terreno del juego */
function parchear(material, shader) {
  const vs = shader.vertexShader;
  if (!vs.includes('float terrainDY( vec3 wp ) {') || !vs.includes('return h - base;')) return;
  shader.vertexShader = vs
    .replace('float terrainDY( vec3 wp ) {', (DEFINES[material.userData?.trench] || '') + GLSL + 'float terrainDY( vec3 wp ) {\n  vTrHide = 0.0;')
    .replace('return h - base;', VERT_CUT);
  Object.assign(shader.uniforms, uniforms);
  let fs = shader.fragmentShader;
  if (!fs.includes('#include <clipping_planes_fragment>')) return;
  if (fs.includes('varying vec2 vTerrainXZ;')) {
    fs = fs.replace('varying vec2 vTerrainXZ;', 'varying vec2 vTerrainXZ;\n' + FRAG_GROUND_PARS)
      .replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>\n' + FRAG_GROUND);
  }
  shader.fragmentShader = 'varying float vTrHide;\n' + fs.replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>\nif ( vTrHide > 0.5 ) discard;');
}

// ——— lo mismo en la CPU (para la cámara) ———

/** lo que baja (o sube, si es negativo) la franja en (x, z) para algo con el rumbo heading, como en el sombreador */
export function bajadaEn(x, z, heading) {
  let d = 0, ax = null;
  for (const t of TRINCHERAS) {
    const qx = x - t.o[0], qz = z - t.o[1];
    const a = Math.abs(qx * t.u[0] + qz * t.u[1]), l = Math.abs(-qx * t.u[1] + qz * t.u[0]);
    if (a > t.llano + t.rampa || l > t.ancho + t.talud) continue;
    const s = Math.min(1, Math.max(0, (a - t.llano) / t.rampa));
    const f = a <= t.llano ? 1 : 1 - s * s * (3 - 2 * s);
    const g = l <= t.ancho ? 1 : 1 - (l - t.ancho) / t.talud;
    const v = t.prof * f * g;
    if (Math.abs(v) > Math.abs(d)) { d = v; ax = t; }
  }
  if (!d) return 0;
  const enCruce = ax.puentes.some(p => {
    const qx = x - p.o[0], qz = z - p.o[1];
    return Math.abs(qx * p.c[0] + qz * p.c[1]) < p.tabC && Math.abs(-qx * p.c[1] + qz * p.c[0]) < p.tabX;
  });
  if (!enCruce) return d;
  // la derecha del coche (su eje x) es (cos h, -sin h): va a lo largo de la circunvalación si es casi perpendicular a ella
  return Math.abs(Math.cos(heading) * ax.u[0] - Math.sin(heading) * ax.u[1]) < 0.7 ? d : 0;
}

/**
 * engancha la franja al juego: el sombreador de terreno de todos los materiales (los del juego y los de las piezas,
 * que copian el gancho del juego) y la cámara, que sube o baja con el jugador
 */
export function instalarTrinchera(game) {
  if (game.__trinchera) return true;
  const mats = [];
  game.scene.traverse(o => { if (o.isMesh && o.material && !Array.isArray(o.material)) mats.push(o.material); });
  // el gancho del juego está en el prototipo de sus materiales (las piezas lo llevan copiado en el propio material)
  const base = mats.find(m => !Object.prototype.hasOwnProperty.call(m, 'onBeforeCompile'));
  let p = base ? Object.getPrototypeOf(base) : null;
  while (p && !Object.prototype.hasOwnProperty.call(p, 'onBeforeCompile')) p = Object.getPrototypeOf(p);
  if (!p) return false;
  const antes = p.onBeforeCompile, clave = p.customProgramCacheKey;
  p.onBeforeCompile = function (shader, renderer) { antes.call(this, shader, renderer); parchear(this, shader); };
  p.customProgramCacheKey = function () { return clave.call(this) + '|trinchera:' + (this.userData?.trench || ''); };
  game.scene.traverse(o => {
    for (const m of Array.isArray(o.material) ? o.material : o.material ? [o.material] : []) {
      if (Object.prototype.hasOwnProperty.call(m, 'onBeforeCompile') && m.onBeforeCompile === antes) {
        m.onBeforeCompile = p.onBeforeCompile;
        m.customProgramCacheKey = p.customProgramCacheKey;
      }
      m.needsUpdate = true;
    }
  });
  // la base del terreno (lo que el juego resta para que lo de cerca del jugador quede a su altura) se mueve con el
  // jugador cuando va por la franja
  const U = game.terrainUniforms?.terrainBase;
  let puesto = 0, esperado = null;
  const previo = game.scene.onBeforeRender;
  game.scene.onBeforeRender = function (...args) {
    if (typeof previo === 'function') previo.apply(this, args);
    if (!U) return;
    const quien = game.getMode?.() === 'foot' ? game.onFoot : game.player;
    const pos = quien?.pos;
    const d = pos ? bajadaEn(pos.x, pos.y ?? pos.z ?? 0, quien.heading ?? 0) : 0;
    if (esperado !== null && U.value === esperado) U.value += puesto;
    U.value -= d;
    puesto = d;
    esperado = U.value;
  };
  game.__trinchera = true;
  return true;
}

// ——— lo que se ve ———

/** el asfalto del fondo de la trinchera y de debajo del túnel */
function asfaltoFondo() {
  return sueloTex(256, 4, (g, r, n) => {
    // (Version 134) el mismo tono que el asfalto de las calles (textures.js): antes era más claro y la bajada se veía
    // como un rectángulo gris pegado a la carretera
    g.fillStyle = '#373a3f';
    g.fillRect(0, 0, n, n);
    for (let i = 0; i < 3000; i++) { const v = Math.round(42 + r() * 42); g.fillStyle = `rgb(${v},${v + 2},${v + 4})`; g.fillRect(r() * n, r() * n, 1.5, 1.5); }
  });
}

/** la tierra volcánica oscura de los taludes del terraplén (foto de la entrada de Titerroy) */
function tierraVolcanica() {
  return sueloTex(256, 6, (g, r, n) => {
    g.fillStyle = '#3e3430';
    g.fillRect(0, 0, n, n);
    for (let i = 0; i < 26; i++) { g.fillStyle = r() < 0.5 ? 'rgba(90,60,45,.25)' : 'rgba(25,22,20,.25)'; g.beginPath(); g.arc(r() * n, r() * n, 10 + r() * 30, 0, Math.PI * 2); g.fill(); }
    for (let i = 0; i < 3500; i++) { const v = r(); g.fillStyle = `rgb(${Math.round(55 + v * 50)},${Math.round(45 + v * 35)},${Math.round(40 + v * 30)})`; g.fillRect(r() * n, r() * n, 1.5, 1.5); }
  });
}

/** marca todos los materiales de un objeto con un modo */
function modo(obj, m) {
  // cada pieza con su propio material (el kit los reparte por color y si no, un modo pisaría al otro)
  obj.traverse(o => {
    if (!o.material) return;
    o.material = Array.isArray(o.material) ? o.material.map(x => x.clone()) : o.material.clone();
    for (const mt of Array.isArray(o.material) ? o.material : [o.material]) { mt.userData.trench = m; mt.needsUpdate = true; }
  });
  return obj;
}

/** la valla alta de los puentes: postes verdes, barras arriba y abajo y barrotes blancos (s a lo largo, en z) */
function vallaAlta(k, s0, s1, z, y = 0) {
  const VERDE = 0x3e5e44, BLANCO = 0xe4e6e2;
  for (let s = s0; s <= s1 + 0.01; s += 2.5) k.box(s, y, z, 0.1, 2.5, 0.1, VERDE);
  for (const yy of [0.15, 2.4]) k.box((s0 + s1) / 2, y + yy, z, s1 - s0, 0.07, 0.07, VERDE);
  for (let s = s0 + 0.08; s < s1; s += 0.14) k.box(s, y + 0.15, z, 0.025, 2.25, 0.025, BLANCO);
}

/** la barandilla verde baja de las entradas */
function barandilla(k, s0, s1, z, y = 0) {
  const VERDE = 0x3e5e44;
  for (let s = s0; s <= s1 + 0.01; s += 2) k.box(s, y, z, 0.06, 1.0, 0.06, VERDE);
  for (const yy of [0.15, 0.95]) k.box((s0 + s1) / 2, y + yy, z, s1 - s0, 0.05, 0.05, VERDE);
  for (let s = s0 + 0.1; s < s1; s += 0.12) k.box(s, y + 0.15, z, 0.02, 0.8, 0.02, VERDE);
}

/** la barrera de hormigón (tipo New Jersey) */
function barrera(k, s0, s1, z, y) {
  k.box((s0 + s1) / 2, y, z, s1 - s0, 0.3, 0.6, 0xcfccc4);
  k.box((s0 + s1) / 2, y + 0.3, z, s1 - s0, 0.55, 0.26, 0xd6d3cb);
}

/** la trinchera: el fondo, los muros o los taludes, las pantallas contra el ruido y los puentes */
function trinchera(t, scene, colliders, grupos) {
  const L = t.llano + t.rampa, W = t.ancho, S = t.talud, muros = t.muros !== false;
  const n = [-t.u[1], t.u[0]];
  const P = (a, l) => [t.o[0] + t.u[0] * a + n[0] * l, t.o[1] + t.u[1] * a + n[1] * l];
  const add = (g, m) => { if (!g) return; modo(g, m); scene.add(g); grupos.push(g); };
  // dónde cae cada puente a lo largo de la circunvalación y lo que ocupa (para cortar los muros y las pantallas)
  const tramos = t.puentes.map(p => {
    const a = (p.o[0] - t.o[0]) * t.u[0] + (p.o[1] - t.o[1]) * t.u[1];
    const B = p.tabX / Math.max(0.2, Math.abs(p.c[0] * n[0] + p.c[1] * n[1])) + 0.5;
    return [a - B, a + B];
  });
  const libre = (a, m = 0) => tramos.every(([a0, a1]) => a < a0 - m || a > a1 + m);
  const cerca = (a) => tramos.some(([a0, a1]) => a > a0 - 120 && a < a1 + 120);
  // el fondo de asfalto y, si no hay muros, los taludes de tierra
  const F = muros ? S : 0;
  add(paveMesh(trocear(polyTris([P(-L, -W - F), P(L, -W - F), P(L, W + F), P(-L, W + F)]), 3), 0.08, asfaltoFondo(), 0xffffff), 'below');
  if (!muros) {
    for (const lado of [-1, 1]) {
      const talud = paveMesh(trocear(polyTris([P(-L, lado * W), P(L, lado * W), P(L, lado * (W + S)), P(-L, lado * (W + S))]), 3), 0.02, tierraVolcanica(), 0xffffff);
      add(talud, 'below');
      if (talud) { talud.material.polygonOffset = false; talud.material.needsUpdate = true; }
    }
  }
  // los muros de hormigón de los dos lados en trozos de 4 m (la parte de abajo baja con la trinchera) y, encima, las
  // pantallas de metacrilato contra el ruido en los 120 m de cada lado de los puentes
  const nTr = Math.round(2 * L / 4), paso = 2 * L / nTr;
  for (const lado of [-1, 1]) {
    const lw = lado * (W + (muros ? 0.2 : S + 0.3));
    const M = marco(P(-L, lw), P(L, lw));
    const km = new Kit(), kp = new Kit();
    for (let i = 0; i < nTr; i++) {
      const s = (i + 0.5) * paso, a = s - L;
      if (!libre(a, 2)) continue;
      if (muros) {
        km.box(s, -0.2, 0, paso + 0.02, 1.3, 0.4, 0xb0aea6);
        km.box(s, 1.1, 0, paso + 0.02, 0.08, 0.5, 0xc8c6be);
        km.block(s, 0, paso, 0.4);
      }
      if (cerca(a) && t.pantallas !== false) {
        const y = muros ? 1.15 : 0;
        kp.box(s - paso / 2, y, 0, 0.18, 4.0, 0.18, 0x6a645c);
        kp.box(s, y + 0.1, 0, paso - 0.2, 3.7, 0.04, 0xbcd4dc, { list: kp.glass });
        kp.box(s, y, 0, paso, 0.1, 0.12, 0x6a645c);
        kp.box(s, y + 3.85, 0, paso, 0.12, 0.2, 0x6a645c);
      }
    }
    if (muros) add(enMarco(km, M, 'trincheraMuro', colliders), 'wall');
    add(enMarco(kp, M, 'trincheraPantallas', null), 'stay');
  }
  for (const p of t.puentes) puente(t, p, W, S, add);
}

/** un puente sobre la trinchera, a lo largo de su calle (s) y de través (z), como el de Pereyra Galviaty en las fotos */
function puente(t, p, W, S, add) {
  const C = p.tabC, X = p.tabX;
  const Pc = (s, z) => [p.o[0] + p.c[0] * (s - C) - p.c[1] * z, p.o[1] + p.c[1] * (s - C) + p.c[0] * z];
  const cn = Math.max(0.5, Math.abs(p.c[0] * -t.u[1] + p.c[1] * t.u[0]));
  const M = marco(Pc(0, 0), Pc(2 * C, 0));
  const k = new Kit();
  // (lo de la calle de arriba que cae en el tablero baja con todo: la calzada del puente va a su altura de siempre)
  k.box(C, -1.41, 0, 2 * C - 0.6, 1.45, 2 * X, 0x9a9890);
  if (p.peatonal) {
    k.box(C, 0.04, 0, 2 * C - 0.6, 0.2, 2 * X - 0.4, 0xc8bfae);
  } else {
    k.box(C, 0.04, 0, 2 * C - 0.6, 0.12, 2 * (X - 2.7), 0x4a4a48);
    for (let s = 1; s < 2 * C - 1; s += 4) k.box(s + 1, 0.165, 0, 2, 0.01, 0.15, 0xe8e6e0);
  }
  for (const zz of [-1, 1]) {
    if (!p.peatonal) {
      barrera(k, 0.3, 2 * C - 0.3, zz * (X - 2.5), 0.16);
      k.box(C, 0.04, zz * (X - 1.1), 2 * C - 0.6, 0.25, 2.2, 0xc8bfae);
      if (p.barandillas !== false) for (const ss of [-12, 2 * C]) barandilla(k, ss, ss + 12, zz * (X - 0.2), 0.25);
    }
    vallaAlta(k, 0.3, 2 * C - 0.3, zz * (X - 0.2), p.peatonal ? 0.24 : 0.29);
  }
  for (let zz = -X + 1.5; zz < X - 1; zz += 4) k.box(C, -1.91, zz, 2 * C - 0.6, 0.5, 0.9, 0x8a8880);
  k.box(C, -t.prof - 0.1, 0, 1.2, t.prof - 1.31, 2 * X - 2, 0xb0aea6);
  for (const s of [C - (W + 0.2) / cn, C + (W + 0.2) / cn]) k.box(s, -t.prof - 0.2, 0, 0.6, t.prof - 1.21, 2 * X, 0xb0aea6);
  add(enMarco(k, M, 'trincheraPuente', null), 'stay');
  // la losa del fondo debajo del puente: tapa el trozo de la calle de arriba que baja con todo y las rayas
  const e = (W + S) / cn;
  add(paveMesh(trocear(polyTris([Pc(C - e, -X - 0.5), Pc(C + e, -X - 0.5), Pc(C + e, X + 0.5), Pc(C - e, X + 0.5)]), 2), 0.3, asfaltoFondo(), 0xffffff), 'below');
}

/** el terraplén: los taludes de tierra, el túnel de la calle, las aletas blancas y la calzada de arriba */
function terraplen(t, scene, colliders, grupos) {
  const L = t.llano + t.rampa, W = t.ancho, S = t.talud, H = -t.prof, p = t.puentes[0], C = p.tabC, X = p.tabX;
  const P = (a, l) => [t.o[0] + t.u[0] * a - t.u[1] * l, t.o[1] + t.u[1] * a + t.u[0] * l];
  const Pc = (s, z) => [p.o[0] + p.c[0] * (s - C) - p.c[1] * z, p.o[1] + p.c[1] * (s - C) + p.c[0] * z];
  const add = (g, m) => { if (!g) return; modo(g, m); scene.add(g); grupos.push(g); };
  // la tierra del terraplén en dos trozos, uno a cada lado del túnel. (Antes era una sola pieza con el hueco del túnel
  // recortado; el hueco sobresale 1 m de la franja y el recorte fallaba: en la LZ-1 la boca salía tapada de tierra.)
  const nU = [-t.u[1], t.u[0]], pc = [-p.c[1], p.c[0]];
  const cnS = p.c[0] * nU[0] + p.c[1] * nU[1];
  // el borde del túnel (a lado·X del eje de la calle de abajo) cortado en los dos bordes de la franja
  const corte = (lado) => {
    const B = [p.o[0] + pc[0] * lado * X, p.o[1] + pc[1] * lado * X];
    const lB = (B[0] - t.o[0]) * nU[0] + (B[1] - t.o[1]) * nU[1];
    return [-1, 1].map(borde => { const k = (borde * (W + S) - lB) / cnS; return [B[0] + p.c[0] * k, B[1] + p.c[1] * k]; });
  };
  const texTierra = tierraVolcanica();
  for (const lado of [-1, 1]) {
    const [q0, q1] = corte(lado);
    const haciaU = (pc[0] * t.u[0] + pc[1] * t.u[1]) * lado > 0 ? 1 : -1;
    const tierra = paveMesh(trocear(polyTris([P(haciaU * L, -W - S), P(haciaU * L, W + S), q1, q0]), 3), 0.02, texTierra, 0xffffff);
    add(tierra, 'below');
    // la tierra va por debajo de las calzadas: sin el empujón hacia delante que llevan los suelos (si no, asoma a manchas)
    if (tierra) { tierra.material.polygonOffset = false; tierra.material.needsUpdate = true; }
  }
  // s a lo largo de la calle de abajo (de 0 a 2C), z de través
  const M = marco(Pc(0, 0), Pc(2 * C, 0));
  // las aletas blancas de las bocas: siguen la cuesta del talud por arriba
  const ka = new Kit();
  for (const zz of [-(X + 0.25), X + 0.25]) {
    for (const [s0, s1] of [[C - W - S - 0.5, C - W + 0.5], [C + W - 0.5, C + W + S + 0.5]]) {
      for (let s = s0; s < s1; s += 1) ka.box(s + 0.5, 0, zz, 1.02, 0.6, 0.45, 0xeeeeea);
    }
  }
  add(enMarco(ka, M, 'terraplenAletas', colliders), 'wing');
  // el túnel: la calzada y las aceras de abajo, las paredes, el techo con sus luces, los frentes de las bocas y, por
  // encima, la calzada de la circunvalación sobre el túnel
  const k = new Kit();
  const T0 = C - W - S - 1, T1 = C + W + S + 1;
  k.box(C, 0.06, 0, T1 - T0, 0.12, 2 * X - 4.6, 0x4a4a48);
  for (let s = T0 + 1; s < T1 - 1; s += 4) k.box(s + 1, 0.185, 0, 2, 0.01, 0.15, 0xe8e6e0);
  for (const zz of [-1, 1]) {
    k.box(C, 0.06, zz * (X - 1.3), T1 - T0, 0.22, 2.2, 0xc8bfae);
    k.box(C, 0, zz * (X + 0.25), 2 * W, H - 1.3, 0.45, 0xe6e4de);
  }
  k.box(C, H - 1.3, 0, 2 * W + 0.6, 1.55, 2 * X + 1.2, 0xbab8b0);
  for (let s = C - W + 3; s < C + W - 2; s += 6) for (let zz = -X + 3; zz < X - 2; zz += 6) k.box(s, H - 1.36, zz, 1.2, 0.06, 0.3, 0xfff4d8);
  for (const s of [C - W - 0.15, C + W + 0.15]) k.box(s, H - 1.3, 0, 0.3, 2.3, 2 * X + 1.2, 0xeeeeea);
  k.box(C, H + 0.25, 0, 2 * W, 0.08, 2 * X + 1.2, 0x4a4a48);
  // (sin choques: las paredes del túnel cortarían en el plano la circunvalación que pasa por encima)
  add(enMarco(k, M, 'terraplenTunel', null), 'stay');
}

/** se monta una vez: cada cruce de la lista */
export function buildTrincheras(scene, colliders) {
  const grupos = [];
  for (const t of TRINCHERAS) (t.tipo === 'terraplen' ? terraplen : trinchera)(t, scene, colliders, grupos);
  return { grupos };
}

/** para las dos versiones (el juego de casa y la web): espera a que esté el juego, engancha la franja y la monta */
export function montarTrincheras(scene, colliders) {
  return new Promise((ok) => {
    const t = setInterval(() => {
      const g = window.__game;
      if (!g?.scene || !g.terrainUniforms) return;
      clearInterval(t);
      instalarTrinchera(g);
      ok(buildTrincheras(scene || g.scene, colliders || g.colliders));
    }, 300);
  });
}
