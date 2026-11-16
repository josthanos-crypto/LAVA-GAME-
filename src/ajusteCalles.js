/**
 * Aceras libres: en el 10 % de las aceras del mapa los edificios de OpenStreetMap llegaban hasta el borde
 * de la calzada (o se metían en ella) y la acera quedaba debajo del edificio, con la gente paseando por
 * dentro. Aquí se arregla antes de levantar la ciudad, en dos pasos y calle a calle:
 *
 *  1. Estrechar la calle: la calzada se ajusta a lo que dejan las fachadas (la anchura de OpenStreetMap es
 *     una por tipo de calle, no la real), dejando ACERA metros de acera a cada lado. Nunca por debajo de
 *     MIN_UNICO (sentido único) o MIN_DOBLE (doble sentido), y solo calles normales y avenidas de hasta
 *     MAX_W m (ni rotondas, ni peatonales, ni caminos, ni las carreteras grandes de los puentes).
 *  2. Mover la fachada: si con la calle ya en su mínimo el edificio sigue pisando la acera, la cara del
 *     edificio que da a la calle se echa hacia atrás lo justo (MAX_EMPUJE m como mucho). No se tocan los
 *     edificios hechos a mano (skip, ownFront, ownRoof) ni los que quedarían demasiado finos.
 *
 * El eje de las calles no se mueve (los cruces, el tráfico y los puentes siguen igual).
 * Devuelve un resumen con los números de cada barrio (para las notas y las pruebas).
 */

const ACERA = 1.9;        // acera que se quiere entre bordillo y fachada (la gente va a 1,4 m del bordillo)
const ACERA_MIN = 2.3;    // si no se llega a esto ni con la calle en su mínimo, se mueve la fachada (la gente va a 1,4 m)
const MIN_DOBLE = 5.0;
const MIN_UNICO = 3.6;
const CARRIL = 3.0;       // anchura de un carril en ciudad: con los carriles de OpenStreetMap, la calle no baja de esto
const MAX_W = 9.5;
const MAX_EMPUJE = 5.5;
const MIN_FONDO = 2.0;    // al echar atrás una fachada, el edificio no se queda con menos fondo que esto
const MIN_FINO = 4.0;     // calle de doble sentido junto a un edificio fino: no baja de esto
const FALTA_OK = 0.5;    // si a la acera le faltan menos de estos metros, se da por buena
const MIN_CALLEJON = 3.0;// calle de un solo carril con fachadas a mano pegadas: se estrecha hasta aquí (un coche mide 1,9 m)
const ACERA_MAX = 7;      // la acera no pasa de esto (más allá queda el solar o la plaza)
const PASO = 3;           // una cata cada 3 m a lo largo de la calle
const ALCANCE = 16;       // hasta dónde se busca fachada a cada lado
const BOCA = 3;           // los primeros y últimos metros de cada calle (el centro del cruce) no cuentan
const CELL = 24;

const BARRIOS = [
  ['Arrecife Centro', -950, 894, -178, 900],
  ['Valterra', 100, 988, -706, 38],
  ['Titerroy', -1232, -25, -1382, -364],
  ['San Francisco Javier', -1799, -1036, -582, 432],
  ['Altavista', -238, 498, -2080, -495],
  ['Argana Alta', -2617, -1003, -2434, -840],
  ['Maneje', -2200, 472, -3400, -1035],
  ['Playa Honda', -5320, -2880, -20, 1500],
];
const barrioDe = (x, z) => (BARRIOS.find(([, x0, x1, z0, z1]) => x >= x0 && x <= x1 && z >= z0 && z <= z1) || ['El resto'])[0];

const tocable = (b) => !(b.skip || b.ownFront || b.ownRoof);

function indexBuildings(buildings) {
  const grid = new Map();
  buildings.forEach((b, bi) => {
    if (!b.p || b.p.length < 3) return;
    let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
    for (const [x, z] of b.p) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); z0 = Math.min(z0, z); z1 = Math.max(z1, z); }
    for (let cx = Math.floor(x0 / CELL); cx <= Math.floor(x1 / CELL); cx++) for (let cz = Math.floor(z0 / CELL); cz <= Math.floor(z1 / CELL); cz++) {
      const k = cx * 100003 + cz;
      if (!grid.has(k)) grid.set(k, []);
      grid.get(k).push(bi);
    }
  });
  return grid;
}

function inPoly(p, x, z) {
  let c = false;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    const [xi, zi] = p[i], [xj, zj] = p[j];
    if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) c = !c;
  }
  return c;
}

/** rayo desde (ox, oz) en la dirección (dx, dz): la primera pared que corta, { t, bi, i } o null */
function cast(buildings, grid, ox, oz, dx, dz) {
  const seen = new Set();
  let best = null;
  for (let s = 0; s <= ALCANCE; s += CELL / 2) {
    for (const bi of grid.get(Math.floor((ox + dx * s) / CELL) * 100003 + Math.floor((oz + dz * s) / CELL)) || []) {
      if (seen.has(bi)) continue;
      seen.add(bi);
      const p = buildings[bi].p;
      for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
        const ax = p[j][0], az = p[j][1], ex = p[i][0] - ax, ez = p[i][1] - az;
        const den = dx * ez - dz * ex;
        if (Math.abs(den) < 1e-9) continue;
        const wx = ax - ox, wz = az - oz;
        const t = (wx * ez - wz * ex) / den, u = (wx * dz - wz * dx) / den;
        if (t > 0 && t <= ALCANCE && u >= 0 && u <= 1 && (!best || t < best.t)) best = { t, bi, a: j, b: i };
      }
    }
  }
  return best;
}

/** catas a lo largo de una calle: punto del eje, normal y lo que hay a cada lado */
function catas(r, buildings, grid) {
  const out = [];
  let total = 0;
  for (let i = 0; i + 1 < r.p.length; i++) total += Math.hypot(r.p[i + 1][0] - r.p[i][0], r.p[i + 1][1] - r.p[i][1]);
  let acc = 0;
  for (let i = 0; i + 1 < r.p.length; i++) {
    const [ax, az] = r.p[i], [bx, bz] = r.p[i + 1];
    const L = Math.hypot(bx - ax, bz - az);
    if (L < 0.5) { acc += L; continue; }
    const ux = (bx - ax) / L, uz = (bz - az) / L, nx = -uz, nz = ux;
    for (let d = (PASO - (acc % PASO)) % PASO; d < L; d += PASO) {
      const s = acc + d;
      if (s < BOCA || s > total - BOCA) continue;
      const x = ax + ux * d, z = az + uz * d;
      // el eje dentro de un edificio: el edificio corta la calle (error del mapa), esa cata no vale
      let dentro = false;
      for (const bi of grid.get(Math.floor(x / CELL) * 100003 + Math.floor(z / CELL)) || []) if (inPoly(buildings[bi].p, x, z)) { dentro = true; break; }
      if (dentro) continue;
      out.push({ x, z, nx, nz, l: cast(buildings, grid, x, z, nx, nz), r: cast(buildings, grid, x, z, -nx, -nz) });
    }
    acc += L;
  }
  return out;
}

/**
 * @param {{ roads: object[], buildings: object[] }} map
 * @returns {{ calles: number, estrechadas: number, edificios: number, sinArreglo: number, porBarrio: object }}
 */
export function ajustarCalles(map) {
  const buildings = map.buildings || [];
  const grid = indexBuildings(buildings);
  const porBarrio = {};
  const B = (x, z) => (porBarrio[barrioDe(x, z)] ||= { catas: 0, tapadasAntes: 0, estrechadas: 0, metrosQuitados: 0, edificios: 0, sinArreglo: 0 });
  const empuje = new Map();   // edificio → (vértice → [dx, dz]) lo que hay que echarlo atrás
  let estrechadas = 0, sinArreglo = 0;
  const pendientes = [];
  for (const r of map.roads) {
    if (r.ped || r.dirt || r.glorieta || r.bolas || r.calzada || r.p.length < 2 || r.w > MAX_W) continue;
    const cs = catas(r, buildings, grid);
    if (!cs.length) continue;
    const mid = r.p[Math.floor(r.p.length / 2)], st = B(mid[0], mid[1]);
    st.catas += cs.length * 2;
    // anchura que deja cada cata (simétrica: el eje no se mueve)
    const libres = [];
    for (const c of cs) {
      const t = Math.min(c.l ? c.l.t : Infinity, c.r ? c.r.t : Infinity);
      for (const h of [c.l, c.r]) if (h && h.t < r.w / 2 + ACERA_MIN) st.tapadasAntes++;
      if (Number.isFinite(t)) libres.push(2 * (t - ACERA));
    }
    // 1) estrechar: lo que deja la cata más justa (sin contar un 10 % de catas raras, esquinas y salientes)
    // (si OpenStreetMap dice cuántos carriles tiene, caben todos: nunca más estrecha que eso, ni más ancha que antes)
    const minW = Math.min(r.w, Math.max(r.ow ? MIN_UNICO : MIN_DOBLE, (r.lanes || 0) * CARRIL));
    if (libres.length >= 3) {
      libres.sort((a, b) => a - b);
      const want = Math.max(minW, Math.round(libres[Math.floor(libres.length * 0.1)] * 4) / 4);
      if (want < r.w - 0.2) {
        st.estrechadas++; st.metrosQuitados += r.w - want; estrechadas++;
        r.wOsm ??= r.w;
        r.w = want;
      }
    }
    // 1b) fachada hecha a mano que no se puede mover: en una calle de un solo carril la calzada baja hasta MIN_CALLEJON
    let aMano = Infinity;
    for (const c of cs) for (const h of [c.l, c.r]) if (h && !tocable(buildings[h.bi])) aMano = Math.min(aMano, 2 * (h.t - ACERA_MIN));
    if (aMano < r.w - 0.2 && (r.lanes || 1) <= 1) {
      const want = Math.max(MIN_CALLEJON, Math.round(aMano * 4) / 4);
      if (want < r.w - 0.2) { st.metrosQuitados += r.w - want; r.wOsm ??= r.w; r.w = want; st.estrechadas++; }
    }
    // 1c) edificio fino que no se puede echar atrás lo bastante (se quedaría sin fondo): la calzada cede lo que
    // falta, hasta MIN_CALLEJON si es de sentido único o MIN_FINO si es de doble sentido (caben dos coches justos)
    let fino = Infinity;
    for (const c of cs) for (const [h, sgn] of [[c.l, 1], [c.r, -1]]) {
      if (!h || h.t >= r.w / 2 + ACERA_MIN) continue;
      const b = buildings[h.bi];
      if (!tocable(b)) continue;
      const hx = c.x + c.nx * sgn * h.t, hz = c.z + c.nz * sgn * h.t;
      let depth = 0;
      for (const q of b.p) depth = Math.max(depth, (q[0] - hx) * c.nx * sgn + (q[1] - hz) * c.nz * sgn);
      const can = Math.max(0, Math.min(MAX_EMPUJE, depth - MIN_FONDO));
      fino = Math.min(fino, 2 * (h.t + can - ACERA_MIN));
    }
    if (fino < r.w - 0.2 && (r.lanes || 1) <= 1) {
      const want = Math.max(r.ow ? MIN_CALLEJON : MIN_FINO, Math.round(fino * 4) / 4);
      if (want < r.w - 0.2) { st.metrosQuitados += r.w - want; r.wOsm ??= r.w; r.w = want; st.estrechadas++; }
    }
    // la acera de cada lado llega hasta la fachada (la mitad de las catas): al estrechar la calle no queda un
    // hueco de suelo entre la acera y el edificio. aceraL es el lado izquierdo de la marcha del primer punto al
    // último (el +side de world.js), aceraR el derecho
    for (const [k, key] of [['l', 'aceraL'], ['r', 'aceraR']]) {
      const ds = cs.filter(c => c[k]).map(c => c[k].t - r.w / 2).sort((a, b) => a - b);
      if (ds.length >= 3 && ds.length >= cs.length * 0.3) r[key] = Math.max(2.2, Math.min(ACERA_MAX, ds[Math.floor(ds.length / 2)]));
    }
    // 2) mover la fachada donde, aun así, el edificio pisa la acera
    for (const c of cs) {
      for (const [h, sgn] of [[c.l, 1], [c.r, -1]]) {
        if (!h || h.t >= r.w / 2 + ACERA_MIN) continue;
        const b = buildings[h.bi], need = r.w / 2 + ACERA_MIN - h.t;
        if (!tocable(b) || need > MAX_EMPUJE) {
          st.sinArreglo++; sinArreglo++;
          pendientes.push({ x: Math.round(c.x), z: Math.round(c.z), motivo: !tocable(b) ? 'a mano' : 'empuje ' + need.toFixed(1), calle: r.name || '', w: r.w });
          continue;
        }
        if (!empuje.has(h.bi)) empuje.set(h.bi, new Map());
        const m = empuje.get(h.bi), dx = c.nx * sgn * need, dz = c.nz * sgn * need;
        for (const v of [h.a, h.b]) {
          const old = m.get(v);
          if (!old || Math.hypot(...old) < need) m.set(v, [dx, dz]);
        }
      }
    }
  }
  // (ver abajo)
  // aplicar los empujes, sin dejar el edificio con menos de 3 m de fondo
  let edificios = 0;
  for (const [bi, m] of empuje) {
    const b = buildings[bi], p = b.p;
    // edificio fino: cada cara se echa atrás solo lo que deja MIN_FONDO m de fondo (de una en una, midiendo sobre
    // lo ya movido: un edificio entre dos calles no se da la vuelta). Lo que falte se apunta en pendientes
    const cur = p.map(q => [q[0], q[1]]);
    let falta = 0;
    for (const [v, [dx, dz]] of m) {
      const L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L;
      let depth = 0;
      for (const q of cur) depth = Math.max(depth, (q[0] - cur[v][0]) * ux + (q[1] - cur[v][1]) * uz);
      const can = Math.max(0, Math.min(L, depth - MIN_FONDO));
      falta = Math.max(falta, L - can);
      if (can < 0.05) { m.delete(v); continue; }
      m.set(v, [ux * can, uz * can]);
      cur[v] = [cur[v][0] + ux * can, cur[v][1] + uz * can];
    }
    const st = B(p[0][0], p[0][1]);
    if (falta > FALTA_OK) { st.sinArreglo++; sinArreglo++; pendientes.push({ x: Math.round(p[0][0]), z: Math.round(p[0][1]), motivo: 'fondo', calle: '', falta: Math.round(falta * 10) / 10, bi }); }
    if (!m.size) continue;
    // el primer punto se repite al final en los contornos cerrados: se mueven los dos
    const closed = p.length > 2 && p[0][0] === p[p.length - 1][0] && p[0][1] === p[p.length - 1][1];
    b.p = p.map((q, i) => {
      const d = m.get(i) || (closed && i === p.length - 1 ? m.get(0) : closed && i === 0 ? m.get(p.length - 1) : null);
      return d ? [q[0] + d[0], q[1] + d[1]] : q;
    });
    // los rótulos pegados a esa fachada se van con ella (si no, quedarían flotando delante)
    const nueva = b.p;
    for (const s of map.signs || []) {
      for (let i = 0; i + 1 < p.length; i++) {
        const [ax, az] = p[i], [bx, bz] = p[i + 1], ex = bx - ax, ez = bz - az, L2 = ex * ex + ez * ez;
        if (L2 < 0.01) continue;
        const t = Math.max(0, Math.min(1, ((s.x - ax) * ex + (s.z - az) * ez) / L2));
        if (Math.hypot(ax + ex * t - s.x, az + ez * t - s.z) > 0.6) continue;
        const da = [nueva[i][0] - ax, nueva[i][1] - az], db = [nueva[i + 1][0] - bx, nueva[i + 1][1] - bz];
        s.x += da[0] + (db[0] - da[0]) * t;
        s.z += da[1] + (db[1] - da[1]) * t;
        break;
      }
    }
    b.movido = 1;
    st.edificios++; edificios++;
  }
  for (const s of Object.values(porBarrio)) s.metrosQuitados = Math.round(s.metrosQuitados * 10) / 10;
  return { calles: map.roads.length, estrechadas, edificios, sinArreglo, porBarrio, pendientes };
}

/** cuántas aceras siguen debajo de un edificio (catas cada 4 m a cada lado), por barrio: para las pruebas */
export function acerasTapadas(map) {
  const buildings = map.buildings || [];
  const grid = indexBuildings(buildings);
  const res = {};
  for (const r of map.roads) {
    if (r.ped || r.dirt || r.glorieta || r.p.length < 2) continue;
    for (let i = 0; i + 1 < r.p.length; i++) {
      const [ax, az] = r.p[i], [bx, bz] = r.p[i + 1];
      const L = Math.hypot(bx - ax, bz - az);
      if (L < 1) continue;
      for (let d = 0; d < L; d += 4) for (const s of [-1, 1]) {
        const o = s * (r.w / 2 + 1.4);
        const x = ax + (bx - ax) * d / L - (bz - az) / L * o, z = az + (bz - az) * d / L + (bx - ax) / L * o;
        const st = (res[barrioDe(x, z)] ||= { catas: 0, tapadas: 0 });
        st.catas++;
        for (const bi of grid.get(Math.floor(x / CELL) * 100003 + Math.floor(z / CELL)) || []) {
          if (inPoly(buildings[bi].p, x, z)) { st.tapadas++; break; }
        }
      }
    }
  }
  for (const s of Object.values(res)) s.pct = Math.round(1000 * s.tapadas / s.catas) / 10;
  return res;
}
