import * as THREE from 'three';

/**
 * Cuestas de verdad: la altura del terreno de Arrecife (MDT05 del IGN, LiDAR, cada 10 m, suavizado;
 * public/map/terreno.json, lo genera tools/alturas_calles.py).
 *
 * La física sigue en plano (x, z): coches, gente y choques no cambian. Lo que cambia es el dibujo:
 * cada vértice del mundo se sube a la altura del terreno que tiene debajo, en la propia tarjeta
 * gráfica. Para que la cámara y lo de alrededor del jugador no se muevan, se resta la altura del
 * terreno bajo el jugador (terrainBase): lo de cerca queda casi donde estaba y lo de lejos sube o baja.
 *
 * Cada material puede elegir (material.userData.terrain):
 *  - (nada)   sigue el terreno
 *  - 'level'  se queda al nivel del mar (el agua, las barcas)
 *  - 'skirt'  la parte de abajo se queda al nivel del mar y la de arriba sigue el terreno (muros de la costa)
 *  - 'none'   no se toca (cielo, volcán del fondo)
 */

const OFF = 0.9;   // la orilla del mar sale a ~0,9 m en el modelo: se resta para que la costa quede a nivel del agua
// relieve exagerado: las cuestas de Arrecife son tan suaves que no se veían. Por encima de KNEE metros la
// altura se multiplica poco a poco hasta por terrainExag; la costa, el Charco y el paseo quedan a su altura real
const KNEE = 2.5, SOFT = 4;

const state = { grid: null, nx: 0, nz: 0, x0: 0, z0: 0, cell: 10 };

export const terrainUniforms = {
  terrainMap: { value: null },
  terrainRect: { value: new THREE.Vector4(0, 0, 1, 1) },
  terrainBase: { value: 0 },
  terrainOff: { value: OFF },
  terrainOn: { value: 0 },
  terrainExag: { value: 1 },
  waterMask: { value: null },
  waterRect: { value: new THREE.Vector4(0, 0, 1, 1) },
};

/** rasteriza el agua (mar menos islotes, y el Charco) en una malla: 1 = agua */
function rasterWater(map, nx, nz, x0, z0, cell) {
  const mark = new Uint8Array(nx * nz);
  const fill = (poly, v) => {
    for (let j = 0; j < nz; j++) {
      const z = z0 + (j + 0.5) * cell;
      const xs = [];
      for (let i = 0, k = poly.length - 1; i < poly.length; k = i++) {
        const [ax, az] = poly[k], [bx, bz] = poly[i];
        if ((az > z) !== (bz > z)) xs.push(ax + (z - az) / (bz - az) * (bx - ax));
      }
      xs.sort((a, b) => a - b);
      for (let q = 0; q + 1 < xs.length; q += 2) {
        const i0 = Math.max(0, Math.ceil((xs[q] - x0) / cell - 0.5)), i1 = Math.min(nx - 1, Math.floor((xs[q + 1] - x0) / cell - 0.5));
        for (let i = i0; i <= i1; i++) mark[j * nx + i] = v;
      }
    }
  };
  if (map?.sea) {
    fill(map.sea.outer, 1);
    for (const h of map.sea.holes) fill(h, 0);
  }
  for (const poly of map?.inlandWater || []) fill(poly, 1);
  return mark;
}

/**
 * mapa del agua cada 4 m para el suelo: donde hay agua, el suelo no se dibuja. Sin esto, en las celdas
 * de la malla del suelo que cruzan la orilla el suelo quedaba por encima del agua y la tapaba.
 */
// la malla del agua a 4 m, guardada para saber si un punto cae en el mar o en el Charco (waterAt)
const waterState = { mark: null, x0: 0, z0: 0, nx: 0, nz: 0, cell: 4 };

/** ¿hay agua en (x, z)? (el mar menos los islotes, y el Charco) */
export function waterAt(x, z) {
  const s = waterState;
  if (!s.mark) return false;
  const i = Math.floor((x - s.x0) / s.cell), j = Math.floor((z - s.z0) / s.cell);
  if (i < 0 || j < 0 || i >= s.nx || j >= s.nz) return false;
  return s.mark[j * s.nx + i] > 0;
}

function buildWaterMask(map) {
  const b = map?.meta?.bounds;
  if (!b) return;
  const cell = 4, pad = 400;
  const x0 = b.minX - pad, z0 = b.minZ - pad;
  const nx = Math.ceil((b.maxX + pad - x0) / cell), nz = Math.ceil((b.maxZ + pad - z0) / cell);
  const mark = rasterWater(map, nx, nz, x0, z0, cell);
  for (let k = 0; k < mark.length; k++) mark[k] *= 255;
  Object.assign(waterState, { mark, x0, z0, nx, nz, cell });
  const tex = new THREE.DataTexture(mark, nx, nz, THREE.RedFormat, THREE.UnsignedByteType);
  tex.minFilter = tex.magFilter = THREE.LinearFilter;
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  terrainUniforms.waterMask.value = tex;
  terrainUniforms.waterRect.value.set(x0, z0, nx * cell, nz * cell);
}

/**
 * pone a nivel del mar las celdas que caen en el agua (mar menos islotes, y el Charco): al suavizar,
 * la altura de los muelles se «derramaba» sobre el agua y el suelo la tapaba
 */
function flattenWater(grid, meta, map) {
  const mark = rasterWater(map, meta.nx, meta.nz, meta.x0, meta.z0, meta.cell);
  let n = 0;
  for (let k = 0; k < mark.length; k++) if (mark[k]) { grid[k] = 0; n++; }
  return n;
}

/**
 * Más allá del borde norte del MDT (hacia z = −2860) no hay datos (vienen a 0): el campo de arriba de
 * Arrecife, hasta la casa del camino de tierra (casaCampo.js). Se rellena siguiendo la cuesta del borde
 * (sube algo más de un 3 %, como los últimos 300 m con datos, y se va suavizando) y la malla se alarga
 * NORTH_ROWS filas hacia el norte. No es el relieve real: sin conexión al IGN desde aquí, es una
 * aproximación para que no haya un barranco donde se acaban los datos.
 * La altura y la cuesta del borde se suavizan entre columnas (±EDGE_SMOOTH celdas): columna a columna salían
 * lomos de norte a sur que tapaban, desde la azotea de la casa, la bajada hacia Arrecife y el mar de las fotos.
 */
const NORTH_ROWS = 60;
const EDGE_SMOOTH = 25;
function extendNorth(grid, meta) {
  const { nx, nz, cell } = meta, add = NORTH_ROWS, NZ = nz + add;
  const out = new Float32Array(nx * NZ);
  out.set(grid, add * nx);
  const filled = new Uint8Array(nx * NZ);
  // por columna: la primera fila con datos desde el norte (50 m más adentro, que el borde viene suavizado
  // hacia 0), su altura y la cuesta hacia el norte en metros por fila
  const J = new Int32Array(nx), V = new Float32Array(nx), G = new Float32Array(nx), ok = new Uint8Array(nx);
  for (let i = 0; i < nx; i++) {
    let jd = add;
    while (jd < NZ && out[jd * nx + i] < 1) jd++;
    const j1 = jd + 5;
    if (j1 + 30 >= NZ) continue;
    const v1 = out[j1 * nx + i], v2 = out[(j1 + 30) * nx + i];
    if (v1 < 5) continue;   // en la costa sigue el mar
    J[i] = j1;
    V[i] = v1;
    G[i] = Math.max(-0.2, Math.min(0.5, (v1 - v2) / 30));
    ok[i] = 1;
  }
  const smooth = (src) => Float32Array.from(src, (_, i) => {
    let sum = 0, n = 0;
    for (let d = -EDGE_SMOOTH; d <= EDGE_SMOOTH; d++) if (ok[i + d]) { sum += src[i + d]; n++; }
    return n ? sum / n : src[i];
  });
  const Vs = smooth(V), Gs = smooth(G);
  for (let i = 0; i < nx; i++) {
    if (!ok[i]) continue;
    for (let j = J[i] - 1; j >= 0; j--) {
      // pegado a los datos, lo de la columna; hacia el norte, lo suavizado
      const d = J[i] - j, w = 1 - Math.exp(-d / 12);
      const v = V[i] + (Vs[i] - V[i]) * w, g = G[i] + (Gs[i] - G[i]) * w;
      out[j * nx + i] = v + g * 40 * (1 - Math.exp(-d / 40));
      filled[j * nx + i] = 1;
    }
  }
  // lo rellenado, suavizado entre columnas vecinas (que no queden rayas de norte a sur)
  const tmp = Float32Array.from(out);
  for (let j = 0; j < NZ; j++) {
    for (let i = 2; i < nx - 2; i++) {
      const k = j * nx + i;
      if (!filled[k]) continue;
      let sum = 0, n = 0;
      for (let d = -2; d <= 2; d++) if (filled[k + d]) { sum += tmp[k + d]; n++; }
      out[k] = sum / n;
    }
  }
  meta.nz = NZ;
  meta.z0 -= add * cell;
  return out;
}

/**
 * La loma del Castillo de San José: el MDT salía a escalones y los desniveles se veían fatal
 * (casas medio enterradas, bultos). Se suaviza toda la loma con una media móvil y, alrededor
 * del castillo y su explanada, se deja una meseta llana a la altura media; hacia los bordes
 * se vuelve poco a poco al terreno de siempre y el mar se queda como está (flattenWater).
 */
// la meseta es una cápsula desde la entrada (ax,az) hasta el castillo (bx,bz), a la altura
// de la entrada: así el parking y la explanada quedan al nivel de la avenida (fuera la
// cuesta abajo que se veía) y el desnivel queda solo hacia el mar, como en la realidad
const SJ = { ax: 1572, az: -972, bx: 1633, bz: -947, rFlat: 32, rBlend: 85, x0: 1500, x1: 1720, z0: -1030, z1: -855 };
const sjSeg = (x, z) => {
  const dx = SJ.bx - SJ.ax, dz = SJ.bz - SJ.az;
  const t = Math.max(0, Math.min(1, ((x - SJ.ax) * dx + (z - SJ.az) * dz) / (dx * dx + dz * dz)));
  return Math.hypot(x - SJ.ax - t * dx, z - SJ.az - t * dz);
};
function smoothSanJose(grid, meta) {
  const { nx, nz, x0, z0, cell } = meta;
  const i0 = Math.max(1, Math.floor((SJ.x0 - x0) / cell)), i1 = Math.min(nx - 2, Math.ceil((SJ.x1 - x0) / cell));
  const j0 = Math.max(1, Math.floor((SJ.z0 - z0) / cell)), j1 = Math.min(nz - 2, Math.ceil((SJ.z1 - z0) / cell));
  if (i1 <= i0 || j1 <= j0) return;
  const W = i1 - i0 + 1, R = 3;
  const sm = new Float32Array(W * (j1 - j0 + 1));
  for (let j = j0; j <= j1; j++) {
    for (let i = i0; i <= i1; i++) {
      let s = 0, n = 0;
      for (let dj = -R; dj <= R; dj++) {
        for (let di = -R; di <= R; di++) {
          const ii = i + di, jj = j + dj;
          if (ii < 0 || jj < 0 || ii >= nx || jj >= nz) continue;
          s += grid[jj * nx + ii];
          n++;
        }
      }
      sm[(j - j0) * W + (i - i0)] = s / n;
    }
  }
  // la altura de la meseta: la media de lo que hay junto a la entrada (el lado de la avenida)
  let ps = 0, pn = 0;
  for (let j = j0; j <= j1; j++) {
    for (let i = i0; i <= i1; i++) {
      const x = x0 + (i + 0.5) * cell, z = z0 + (j + 0.5) * cell;
      if (Math.hypot(x - SJ.ax, z - SJ.az) < 14) { ps += sm[(j - j0) * W + (i - i0)]; pn++; }
    }
  }
  const plateau = pn ? ps / pn : 0;
  for (let j = j0; j <= j1; j++) {
    for (let i = i0; i <= i1; i++) {
      const x = x0 + (i + 0.5) * cell, z = z0 + (j + 0.5) * cell;
      const k = j * nx + i;
      // en el borde de la caja se vuelve a lo que había (que no quede un escalón nuevo)
      const eb = Math.min(x - SJ.x0, SJ.x1 - x, z - SJ.z0, SJ.z1 - z);
      const edge = Math.max(0, Math.min(1, eb / 30));
      let v = grid[k] + (sm[(j - j0) * W + (i - i0)] - grid[k]) * edge;
      const d = sjSeg(x, z);
      if (d < SJ.rBlend) {
        const t = d < SJ.rFlat ? 1 : 1 - (d - SJ.rFlat) / (SJ.rBlend - SJ.rFlat);
        v += (plateau - v) * t * t * (3 - 2 * t) * edge;
      }
      grid[k] = v;
    }
  }
}

export async function loadTerrain(map) {
  try {
    const meta = await (await fetch('map/terreno.json')).json();
    // las alturas van en el mismo JSON, en base64 (Uint16 en centímetros)
    const bin = atob(meta.b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const cm = new Uint16Array(bytes.buffer);
    const n = meta.nx * meta.nz;
    if (cm.length < n) throw new Error('terreno incompleto');
    const raw = new Float32Array(n);
    for (let i = 0; i < n; i++) raw[i] = cm[i] / 100;
    const grid = extendNorth(raw, meta);
    const N = meta.nx * meta.nz;
    smoothSanJose(grid, meta);
    flattenWater(grid, meta, map);
    buildWaterMask(map);
    const half = new Uint16Array(N);
    for (let i = 0; i < N; i++) half[i] = THREE.DataUtils.toHalfFloat(grid[i]);
    Object.assign(state, { grid, nx: meta.nx, nz: meta.nz, x0: meta.x0, z0: meta.z0, cell: meta.cell });
    const tex = new THREE.DataTexture(half, meta.nx, meta.nz, THREE.RedFormat, THREE.HalfFloatType);
    tex.minFilter = tex.magFilter = THREE.LinearFilter;
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.generateMipmaps = false;
    tex.needsUpdate = true;
    terrainUniforms.terrainMap.value = tex;
    terrainUniforms.terrainRect.value.set(meta.x0, meta.z0, meta.nx * meta.cell, meta.nz * meta.cell);
    terrainUniforms.terrainOn.value = 1;
    return true;
  } catch (e) {
    console.warn('Sin terreno (el juego sigue llano):', e.message);
    return false;
  }
}

/** altura del terreno en (x, z), igual que la calcula la tarjeta gráfica (bilineal entre centros de celda) */
export function terrainY(x, z) {
  if (!state.grid || !terrainUniforms.terrainOn.value) return 0;
  return exaggerate(realHeight(x, z));
}

/** altura real sobre el mar en (x, z), sin exagerar (la del IGN: para el mapa y el aviso de cuesta) */
export function realHeight(x, z) {
  const s = state;
  if (!s.grid) return 0;
  const fx = Math.min(s.nx - 1, Math.max(0, (x - s.x0) / s.cell - 0.5));
  const fz = Math.min(s.nz - 1, Math.max(0, (z - s.z0) / s.cell - 0.5));
  const i = Math.min(s.nx - 2, Math.floor(fx)), j = Math.min(s.nz - 2, Math.floor(fz));
  const u = fx - i, v = fz - j;
  const g = s.grid, w = s.nx;
  const h = (g[j * w + i] * (1 - u) + g[j * w + i + 1] * u) * (1 - v) + (g[(j + 1) * w + i] * (1 - u) + g[(j + 1) * w + i + 1] * u) * v;
  return Math.max(0, h - OFF);
}

/** la malla de alturas tal cual (para pintar el mapa de relieve); null si no hay terreno */
export function terrainGrid() {
  return state.grid ? { ...state, off: OFF } : null;
}

/** relieve exagerado (igual que terrainLift en la tarjeta gráfica) */
function exaggerate(h) {
  const e = Math.max(0, h - KNEE);
  return h + (terrainUniforms.terrainExag.value - 1) * e * e / (e + SOFT);
}

const GLSL_PARS = /* glsl */`
uniform sampler2D terrainMap;
uniform vec4 terrainRect;
uniform float terrainBase;
uniform float terrainOff;
uniform float terrainOn;
uniform float terrainExag;
float terrainLift( float h ) {
  float e = max( 0.0, h - ${KNEE.toFixed(2)} );
  return h + ( terrainExag - 1.0 ) * e * e / ( e + ${SOFT.toFixed(2)} );
}
float terrainH( vec2 uv ) {
  return terrainLift( max( 0.0, texture( terrainMap, clamp( uv, 0.0, 1.0 ) ).r - terrainOff ) ) * terrainOn;
}
float terrainLap( vec2 uv, vec2 tx ) {
  return terrainH( uv + vec2( tx.x, 0.0 ) ) + terrainH( uv - vec2( tx.x, 0.0 ) )
    + terrainH( uv + vec2( 0.0, tx.y ) ) + terrainH( uv - vec2( 0.0, tx.y ) ) - 4.0 * terrainH( uv );
}
float terrainDY( vec3 wp ) {
#if defined( TERRAIN_NONE )
  return 0.0;
#else
  float base = terrainBase * terrainOn;
  #if defined( TERRAIN_LEVEL )
  return -base;
  #else
  #if defined( TERRAIN_SKIRT )
  if ( wp.y < 0.3 ) return -base;
  #endif
  vec2 uv = ( wp.xz - terrainRect.xy ) / terrainRect.zw;
  float h = terrainH( uv );
  #ifdef TERRAIN_SAG
  // suelo de malla gruesa: entre vértice y vértice va recto y en las hondonadas quedaba por encima de las
  // calles (que van en trozos pequeños). Se baja lo que se combaría ahí: curvatura x TERRAIN_SAG
  vec2 tx = 1.0 / vec2( textureSize( terrainMap, 0 ) );
  float cellM = terrainRect.z * tx.x;
  float lap = terrainLap( uv, tx );
  // (Version 134) En las cuestas fuertes (Cabildo, Rambla Medular) el suelo seguía asomando sobre el asfalto: la
  // hondonada puede caer en medio del cuadro del suelo y no en su esquina, y un cuadro alabeado (una esquina más
  // alta que la de enfrente) queda por encima en su diagonal. Se mira también medio cuadro alrededor y se baja lo
  // del alabeo (torsión x L²/4, con margen).
  vec2 hs = vec2( TERRAIN_SEG * 0.5 ) / terrainRect.zw;
  lap = max( lap, max( max( terrainLap( uv + vec2( hs.x, 0.0 ), tx ), terrainLap( uv - vec2( hs.x, 0.0 ), tx ) ),
    max( terrainLap( uv + vec2( 0.0, hs.y ), tx ), terrainLap( uv - vec2( 0.0, hs.y ), tx ) ) ) );
  float tw = abs( terrainH( uv + tx ) + terrainH( uv - tx ) - terrainH( uv + vec2( tx.x, -tx.y ) ) - terrainH( uv + vec2( -tx.x, tx.y ) ) ) * 0.25;
  h -= ( max( 0.0, lap ) * TERRAIN_SAG + tw * TERRAIN_SEG * TERRAIN_SEG * 0.3 ) / ( cellM * cellM );
  #endif
  return h - base;
  #endif
#endif
}
`;

const GLSL_FRAG_PARS = /* glsl */`
uniform sampler2D waterMask;
uniform vec4 waterRect;
uniform float terrainOn;
varying vec2 vTerrainXZ;
`;

// el suelo no se dibuja encima del agua (ver buildWaterMask)
const GLSL_FRAG_DISCARD = /* glsl */`
if ( terrainOn > 0.5 && texture( waterMask, ( vTerrainXZ - waterRect.xy ) / waterRect.zw ).r > 0.5 ) discard;
`;

const GLSL_PROJECT = /* glsl */`
vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
  mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
  mvPosition = instanceMatrix * mvPosition;
#endif
vec4 terrainWorld = modelMatrix * mvPosition;
terrainWorld.y += terrainDY( terrainWorld.xyz );
#ifdef TERRAIN_GROUND
vTerrainXZ = terrainWorld.xz;
#endif
mvPosition = viewMatrix * terrainWorld;
gl_Position = projectionMatrix * mvPosition;
`;

const GLSL_WORLDPOS = /* glsl */`
#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
  vec4 worldPosition = vec4( transformed, 1.0 );
  #ifdef USE_BATCHING
    worldPosition = batchingMatrix * worldPosition;
  #endif
  #ifdef USE_INSTANCING
    worldPosition = instanceMatrix * worldPosition;
  #endif
  worldPosition = modelMatrix * worldPosition;
  worldPosition.y += terrainDY( worldPosition.xyz );
#endif
`;

const MODE_DEFINE = { level: '#define TERRAIN_LEVEL\n', skirt: '#define TERRAIN_SKIRT\n', none: '#define TERRAIN_NONE\n', ground: '#define TERRAIN_GROUND\nvarying vec2 vTerrainXZ;\n' };

/** mete el terreno en el sombreador de vértices de un material (si usa los trozos estándar de three.js) */
function inject(material, shader) {
  const mode = material.userData?.terrain;
  if (mode === 'none') return;
  let vs = shader.vertexShader;
  const sprite = vs.includes('vec4 mvPosition = modelViewMatrix[ 3 ];');
  if (!sprite && !vs.includes('#include <project_vertex>')) return;
  Object.assign(shader.uniforms, terrainUniforms);
  // suelo de malla gruesa (userData.terrainSeg = lado de su cuadrícula, m): la flecha de un lado diagonal
  // es curvatura x L²/8, con L = lado x √2, y un 30 % de margen
  const seg = material.userData?.terrainSeg;
  const sag = seg ? `#define TERRAIN_SAG ${(seg * seg * 0.325).toFixed(1)}\n#define TERRAIN_SEG ${seg.toFixed(1)}\n` : '';
  const pars = (MODE_DEFINE[mode] || '') + sag + GLSL_PARS;
  vs = vs.includes('#include <common>') ? vs.replace('#include <common>', '#include <common>\n' + pars) : pars + vs;
  vs = vs.replace('#include <project_vertex>', GLSL_PROJECT).replace('#include <worldpos_vertex>', GLSL_WORLDPOS);
  // los sprites (brillos, humo): el centro del sprite sigue el terreno
  vs = vs.replace('vec4 mvPosition = modelViewMatrix[ 3 ];',
    'vec4 terrainC = modelMatrix * vec4( 0.0, 0.0, 0.0, 1.0 ); terrainC.y += terrainDY( terrainC.xyz ); vec4 mvPosition = viewMatrix * terrainC;');
  shader.vertexShader = vs;
  if (mode === 'ground' && shader.fragmentShader.includes('#include <clipping_planes_fragment>')) {
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\n' + GLSL_FRAG_PARS)
      .replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>\n' + GLSL_FRAG_DISCARD);
  }
}

const key = (m) => '|terreno:' + (m.userData?.terrain || 'sigue') + (m.userData?.terrainSeg ? ':' + m.userData.terrainSeg : '');

/** todos los materiales que no tengan su propio onBeforeCompile (incluidos los de sombras) */
function installDefault() {
  THREE.Material.prototype.onBeforeCompile = function (shader) { inject(this, shader); };
  const baseKey = THREE.Material.prototype.customProgramCacheKey;
  THREE.Material.prototype.customProgramCacheKey = function () { return baseKey.call(this) + key(this); };
}

/** los materiales que ya traen su propio onBeforeCompile (luces de ventanas...): se envuelve */
function wrap(material) {
  if (material.userData.__terrain || !Object.prototype.hasOwnProperty.call(material, 'onBeforeCompile')) return false;
  const own = material.onBeforeCompile;
  const ownKey = material.customProgramCacheKey;
  material.onBeforeCompile = function (shader, renderer) { own.call(this, shader, renderer); inject(this, shader); };
  material.customProgramCacheKey = function () { return (ownKey === THREE.Material.prototype.customProgramCacheKey ? own.toString() : ownKey.call(this)) + key(this); };
  material.userData.__terrain = true;
  material.needsUpdate = true;
  return true;
}

/** revisa la escena: se llama al arrancar y de vez en cuando (por si aparecen materiales nuevos con hook propio) */
export function wrapScene(scene) {
  let n = 0;
  scene.traverse((o) => {
    const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
    for (const m of mats) if (wrap(m)) n++;
    for (const m of [o.customDepthMaterial, o.customDistanceMaterial]) if (m && wrap(m)) n++;
  });
  return n;
}

/** marca un objeto entero (y sus hijos) con un modo de terreno */
export function setTerrainMode(obj, mode) {
  obj?.traverse?.((o) => {
    const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
    for (const m of mats) { m.userData.terrain = mode; m.needsUpdate = true; }
  });
}

/**
 * Lo plano y a ras de suelo (calzadas, aceras, plazas, pintura...) solo se dobla por sus vértices: un tramo
 * de calle de 60 m queda recto mientras la foto aérea de debajo sigue la cuesta y, en los cambios de
 * rasante, asoma por encima. Se parte en triángulos de como mucho maxEdge metros. Se llama una vez al
 * arrancar; devuelve cuántos triángulos hay ahora de más.
 */
export function tessellateFlat(scene, maxEdge) {
  const done = new Map(), box = new THREE.Box3();
  let added = 0;
  scene.updateMatrixWorld(true);
  scene.traverse((o) => {
    if (!o.isMesh || o.isInstancedMesh || o.isSkinnedMesh || Array.isArray(o.material)) return;
    if (['ground', 'level', 'none'].includes(o.material?.userData?.terrain)) return;
    const g = o.geometry;
    if (!g?.attributes?.position || Object.keys(g.morphAttributes).length) return;
    if (!g.boundingBox) g.computeBoundingBox();
    box.copy(g.boundingBox).applyMatrix4(o.matrixWorld);
    if (box.max.y - box.min.y > 1.2 || box.max.y > 2) return;
    if (!done.has(g)) done.set(g, splitTriangles(g, maxEdge / o.matrixWorld.getMaxScaleOnAxis()));
    const ng = done.get(g);
    if (ng === g) return;
    added += (ng.attributes.position.count - (g.index ? g.index.count : g.attributes.position.count)) / 3;
    o.geometry = ng;
  });
  for (const [g, ng] of done) if (ng !== g) g.dispose();
  return Math.round(added);
}

/** parte por la mitad el lado más largo de cada triángulo hasta que ninguno pase de maxEdge (sin grietas) */
function splitTriangles(geom, maxEdge) {
  const src = geom.index ? geom.toNonIndexed() : geom;
  const names = ['position', ...Object.keys(src.attributes).filter(nm => nm !== 'position')];   // la posición, primero
  const arrs = names.map(nm => src.attributes[nm]);
  if (arrs.some(a => a.isInterleavedBufferAttribute || !(a.array instanceof Float32Array))) return geom;
  const n = src.attributes.position.count, P = src.attributes.position.array, max2 = maxEdge * maxEdge;
  const d2 = (v, a, b) => {
    const x = v[a] - v[b], y = v[a + 1] - v[b + 1], z = v[a + 2] - v[b + 2];
    return x * x + y * y + z * z;
  };
  let big = false;
  for (let t = 0; t < n * 3 && !big; t += 9) big = Math.max(d2(P, t, t + 3), d2(P, t + 3, t + 6), d2(P, t + 6, t)) > max2;
  if (!big) return geom;
  // primero se parten los triángulos grandes (son pocos) en extra; luego se reserva la medida justa, se
  // copian de golpe los tramos de triángulos pequeños y se añaden los trozos al final
  const sizes = arrs.map(a => a.itemSize), stride = sizes.reduce((s, v) => s + v, 0);
  let extra = new Float32Array(1024 * stride), used = 0;
  let pool = new Float32Array(64 * stride);
  const bigs = [], stack = [];
  for (let t = 0; t < n; t += 3) {
    if (Math.max(d2(P, t * 3, t * 3 + 3), d2(P, t * 3 + 3, t * 3 + 6), d2(P, t * 3 + 6, t * 3)) <= max2) continue;
    bigs.push(t);
    let pv = 0;
    for (let c = 0; c < 3; c++, pv++) {
      let o = pv * stride;
      for (let ai = 0; ai < arrs.length; ai++) {
        const a = arrs[ai].array, sz = sizes[ai], base = (t + c) * sz;
        for (let q = 0; q < sz; q++) pool[o++] = a[base + q];
      }
    }
    stack.push(0, 1, 2);
    while (stack.length) {
      const c = stack.pop() * stride, b = stack.pop() * stride, a = stack.pop() * stride;
      const ab = d2(pool, a, b), bc = d2(pool, b, c), ca = d2(pool, c, a), m = Math.max(ab, bc, ca);
      if (m <= max2) {
        if (used + 3 * stride > extra.length) { const e2 = new Float32Array(extra.length * 2); e2.set(extra); extra = e2; }
        extra.set(pool.subarray(a, a + stride), used);
        extra.set(pool.subarray(b, b + stride), used + stride);
        extra.set(pool.subarray(c, c + stride), used + 2 * stride);
        used += 3 * stride;
        continue;
      }
      if ((pv + 1) * stride > pool.length) { const p2 = new Float32Array(pool.length * 2); p2.set(pool); pool = p2; }
      const p = m === ab ? a : m === bc ? b : c, q = m === ab ? b : m === bc ? c : a;
      const M = pv * stride, mi = pv++;
      for (let k = 0; k < stride; k++) pool[M + k] = (pool[p + k] + pool[q + k]) / 2;
      const ia = a / stride, ib = b / stride, ic = c / stride;
      if (m === ab) stack.push(ia, mi, ic, mi, ib, ic);
      else if (m === bc) stack.push(ia, ib, mi, ia, mi, ic);
      else stack.push(ia, ib, mi, mi, ib, ic);
    }
  }
  const keep = n - bigs.length * 3, extraN = used / stride;
  const ng = new THREE.BufferGeometry();
  let off = 0;
  arrs.forEach((a, ai) => {
    const sz = sizes[ai], out = new Float32Array((keep + extraN) * sz);
    let w = 0, run = 0;
    for (const t of [...bigs, n]) {
      if (t > run) { out.set(a.array.subarray(run * sz, t * sz), w); w += (t - run) * sz; }
      run = t + 3;
    }
    for (let v = 0; v < extraN; v++) for (let q = 0; q < sz; q++) out[w++] = extra[v * stride + off + q];
    off += sz;
    ng.setAttribute(names[ai], new THREE.BufferAttribute(out, sz, a.normalized));
  });
  ng.computeBoundingBox();
  ng.computeBoundingSphere();
  return ng;
}

installDefault();
