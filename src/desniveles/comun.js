/**
 * DESNIVELES — arreglos del relieve barrio por barrio (brief: BRIEF-DESNIVELES-PUENTES.md).
 *
 * El relieve del juego sale de una malla de alturas cada 10 m (terrain.js) que la tarjeta gráfica y el
 * coche leen igual. Aquí se retoca esa misma malla ANTES de levantar la ciudad (en el prepararMapa de
 * cada barrio): así lo que se ve y lo que pisa el coche siguen coincidiendo y no hace falta tocar
 * terrain.js. Cada barrio tiene su archivo en esta carpeta con sus zonas.
 */
import * as THREE from 'three';
import { terrainGrid, terrainUniforms } from '../terrain.js';

// los mismos números que terrain.js (relieve exagerado por encima de KNEE metros)
const KNEE = 2.5, SOFT = 4;

const exag = () => terrainUniforms.terrainExag.value;

/** altura que se ve a partir de la altura real (igual que terrainLift de terrain.js) */
function subir(h) {
  const e = Math.max(0, h - KNEE);
  return h + (exag() - 1) * e * e / (e + SOFT);
}

/** la altura real que da una altura vista (lo contrario de subir) */
function bajar(d) {
  const dd = d - KNEE;
  if (dd <= 0) return d;
  const a = exag(), b = SOFT - dd;
  return KNEE + (-b + Math.sqrt(b * b + 4 * a * SOFT * dd)) / (2 * a);
}

const dentroDe = (r, x, z) => x >= r.x0 && x <= r.x1 && z >= r.z0 && z <= r.z1;

/** pasa a la imagen que lee la tarjeta gráfica las celdas de la malla que han cambiado */
function aLaTarjeta(grid, celdas) {
  const tex = terrainUniforms.terrainMap.value, datos = tex?.image?.data;
  if (!datos || !celdas.length) return;
  for (const q of celdas) datos[q] = THREE.DataUtils.toHalfFloat(grid[q]);
  tex.needsUpdate = true;
}

/**
 * Rellena hoyos y quita picos: dentro de cada rectángulo de `zonas` el suelo se sustituye por una
 * superficie lisa que empalma con lo que hay alrededor (como una sábana tensada entre los bordes).
 * Para los sótanos, solares excavados y bultos que traen los datos del terreno y que en el juego no existen.
 *
 * @param {{ zonas: Array<{x0:number,x1:number,z0:number,z1:number}>, vueltas?: number }} o
 * @returns {{ cambiadas: number, maxBaja: number, maxSube: number } | null}
 */
export function rellenar({ zonas, vueltas = 300 }) {
  const t = terrainGrid();
  if (!t || !terrainUniforms.terrainOn.value) return null;
  const { grid, nx, nz, x0, z0, cell } = t;
  const tocadas = [];
  let maxBaja = 0, maxSube = 0;
  for (const r of zonas) {
    const i0 = Math.max(1, Math.ceil((r.x0 - x0) / cell - 0.5)), i1 = Math.min(nx - 2, Math.floor((r.x1 - x0) / cell - 0.5));
    const j0 = Math.max(1, Math.ceil((r.z0 - z0) / cell - 0.5)), j1 = Math.min(nz - 2, Math.floor((r.z1 - z0) / cell - 0.5));
    if (i1 < i0 || j1 < j0) continue;
    const antes = [];
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) antes.push(grid[j * nx + i]);
    for (let n = 0; n < vueltas; n++) {
      let mov = 0;
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
        const q = j * nx + i, v = (grid[q - 1] + grid[q + 1] + grid[q - nx] + grid[q + nx]) / 4;
        mov = Math.max(mov, Math.abs(v - grid[q]));
        grid[q] = v;
      }
      if (mov < 0.005) break;
    }
    let k = 0;
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      const q = j * nx + i, d = grid[q] - antes[k++];
      if (Math.abs(d) < 0.02) continue;
      tocadas.push(q);
      if (-d > maxBaja) maxBaja = -d;
      if (d > maxSube) maxSube = d;
    }
  }
  aLaTarjeta(grid, tocadas);
  return { cambiadas: tocadas.length, maxBaja, maxSube };
}

/**
 * Quita las cuestas bruscas de una caja: donde el suelo sube más de `maxPendiente` entre dos puntos
 * vecinos de la malla, baja el alto y sube el bajo hasta dejarlo en esa pendiente (la tierra que se
 * quita de arriba va abajo, así las hondonadas estrechas se rellenan). No toca:
 *  - el agua ni la franja de costa (lo que se ve por debajo de `fijoBajo` metros);
 *  - los rectángulos de `fijos` (puentes, trincheras y piezas hechas a medida).
 *
 * @param {{ caja: {x0:number,x1:number,z0:number,z1:number}, margen?: number, maxPendiente?: number,
 *   fijoBajo?: number, fijos?: Array<{x0:number,x1:number,z0:number,z1:number}>, vueltas?: number }} o
 * @returns {{ celdas: number, cambiadas: number, maxBaja: number, maxSube: number, vueltas: number, ms: number } | null}
 */
export function suavizarCuestas({ caja, margen = 40, maxPendiente = 0.12, fijoBajo = 3.2, fijos = [], vueltas = 400 }) {
  const t0 = performance.now();
  const t = terrainGrid();
  if (!t || !terrainUniforms.terrainOn.value) return null;
  const { grid, nx, nz, x0, z0, cell, off } = t;
  const ci = (x) => Math.round((x - x0) / cell - 0.5), cj = (z) => Math.round((z - z0) / cell - 0.5);
  // ventana de trabajo: la caja con su margen y una celda más de borde, que no se mueve
  const i0 = Math.max(0, ci(caja.x0 - margen) - 1), i1 = Math.min(nx - 1, ci(caja.x1 + margen) + 1);
  const j0 = Math.max(0, cj(caja.z0 - margen) - 1), j1 = Math.min(nz - 1, cj(caja.z1 + margen) + 1);
  const w = i1 - i0 + 1, h = j1 - j0 + 1;
  if (w < 3 || h < 3) return null;

  const D = new Float32Array(w * h), antes = new Float32Array(w * h), libre = new Uint8Array(w * h);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const k = j * w + i, d = subir(Math.max(0, grid[(j + j0) * nx + i + i0] - off));
    D[k] = antes[k] = d;
    if (i === 0 || j === 0 || i === w - 1 || j === h - 1 || d <= fijoBajo) continue;
    const x = x0 + (i + i0 + 0.5) * cell, z = z0 + (j + j0 + 0.5) * cell;
    if (!fijos.some(r => dentroDe(r, x, z))) libre[k] = 1;
  }

  // vecinos: derecha, abajo y las dos diagonales (con su tope de desnivel). Solo se repasan las celdas
  // «vivas»: las que se han movido en la vuelta anterior y las de su alrededor (lo demás ya cumple)
  const lim1 = maxPendiente * cell, lim2 = lim1 * Math.SQRT2;
  let viva = new Uint8Array(w * h).fill(1), sig = new Uint8Array(w * h);
  const avisar = (k) => {
    const i = k % w, j = (k - i) / w;
    const ja = j > 0 ? -1 : 0, jb = j < h - 1 ? 1 : 0, ia = i > 0 ? -1 : 0, ib = i < w - 1 ? 1 : 0;
    for (let dj = ja; dj <= jb; dj++) for (let di = ia; di <= ib; di++) sig[k + dj * w + di] = 1;
  };
  let n = 0;
  for (; n < vueltas; n++) {
    let peor = 0;
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const a = j * w + i;
      if (!viva[a]) continue;
      for (let q = 0; q < 4; q++) {
        if (q === 0 ? i === w - 1 : j === h - 1 || (q === 2 && i === w - 1) || (q === 3 && i === 0)) continue;
        const b = q === 0 ? a + 1 : q === 1 ? a + w : q === 2 ? a + w + 1 : a + w - 1;
        const la = libre[a], lb = libre[b];
        if (!la && !lb) continue;
        const dif = D[b] - D[a], sobra = (dif < 0 ? -dif : dif) - (q < 2 ? lim1 : lim2);
        if (sobra <= 0) continue;
        if (sobra > peor) peor = sobra;
        const s = (dif < 0 ? -0.5 : 0.5) * sobra;
        if (la && lb) { D[a] += s * 0.5; D[b] -= s * 0.5; avisar(a); avisar(b); }
        else if (la) { D[a] += s; avisar(a); }
        else { D[b] -= s; avisar(b); }
      }
    }
    if (peor < 0.03) break;
    const t = viva; viva = sig; sig = t; sig.fill(0);
  }

  // un repaso suave de lo que se ha movido, para que no queden aristas donde empieza la cuesta nueva
  for (let pasada = 0; pasada < 2; pasada++) {
    const C = D.slice();
    for (let j = 1; j < h - 1; j++) for (let i = 1; i < w - 1; i++) {
      const k = j * w + i;
      if (!libre[k] || Math.abs(C[k] - antes[k]) < 0.05) continue;
      let s = 0;
      for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) s += C[k + dj * w + di];
      D[k] = C[k] * 0.5 + s / 18;
    }
  }

  // de vuelta a la malla (alturas reales) y a la imagen que lee la tarjeta gráfica
  const tex = terrainUniforms.terrainMap.value, datos = tex?.image?.data;
  let cambiadas = 0, maxBaja = 0, maxSube = 0;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const k = j * w + i, d = D[k] - antes[k];
    if (!libre[k] || Math.abs(d) < 0.02) continue;
    const q = (j + j0) * nx + i + i0;
    grid[q] = bajar(D[k]) + off;
    if (datos) datos[q] = THREE.DataUtils.toHalfFloat(grid[q]);
    cambiadas++;
    if (-d > maxBaja) maxBaja = -d;
    if (d > maxSube) maxSube = d;
  }
  if (tex && cambiadas) tex.needsUpdate = true;
  return { celdas: w * h, cambiadas, maxBaja, maxSube, vueltas: n, ms: Math.round(performance.now() - t0) };
}
