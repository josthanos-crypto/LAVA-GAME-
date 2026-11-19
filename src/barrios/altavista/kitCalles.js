/**
 * Kit para hacer Altavista calle a calle con las vistas de la calle: cada acera es una lista corta de casas
 * (ancho, alto, color, si el bajo es tienda y el letrero) y el kit las levanta en su sitio, recortando el bloque
 * genérico del mapa que había debajo. Las fachadas las pinta world.js como las del resto de la ciudad (ventanas,
 * bajos de tienda, cornisa), con el color y la altura de cada casa.
 *
 * Una acera: { a, b, fondo, casas } — a y b son las dos esquinas de la fachada en metros del mapa (la línea de las
 * fachadas, del lado de la calle), fondo es lo que entran las casas hacia dentro de la manzana, y las casas van de a
 * hacia b: [ancho, alto, color, extra]. Los anchos se escalan para llenar de a a b justo. extra (opcional):
 * { tienda: true } (bajo de tienda) o { letrero: 'NOMBRE', k: 'food' | 'shop' | 'gen' ... } (bajo de tienda y su
 * rótulo con el nombre real del sitio).
 */

const MIN_TROZO = 3;
const MIN_ANCHO = 1.2;

const tocable = b => b && Array.isArray(b.p) && !(b.skip || b.ownFront || b.ownRoof || b.edificioReal);

function hexRgb(c) {
  if (Array.isArray(c)) return c;
  const n = parseInt(String(c).replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function area(p) {
  let s = 0;
  for (let i = 0; i < p.length; i++) {
    const [x0, z0] = p[i], [x1, z1] = p[(i + 1) % p.length];
    s += x0 * z1 - x1 * z0;
  }
  return s / 2;
}

function dentro(p, x, z) {
  let c = false;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    const [xi, zi] = p[i], [xj, zj] = p[j];
    if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c;
  }
  return c;
}

/** se queda con la parte del polígono donde f(punto) >= 0 (f lineal) */
function cortar(poly, f) {
  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const P = poly[i], Q = poly[(i + 1) % poly.length];
    const fp = f(P), fq = f(Q);
    if (fp >= 0) out.push(P);
    if ((fp >= 0) !== (fq >= 0)) {
      const t = fp / (fp - fq);
      out.push([P[0] + (Q[0] - P[0]) * t, P[1] + (Q[1] - P[1]) * t]);
    }
  }
  return out;
}

/** el polígono menos el rectángulo convexo dado por sus cuatro semiplanos (f >= 0 es dentro del rectángulo) */
function perimetro(p) {
  let s = 0;
  for (let i = 0; i < p.length; i++) s += Math.hypot(p[(i + 1) % p.length][0] - p[i][0], p[(i + 1) % p.length][1] - p[i][1]);
  return s;
}

/** un trozo que valga: ni diminuto ni una tira finísima (ancho medio = 2·área/perímetro) */
const valeTrozo = t => t.length >= 3 && Math.abs(area(t)) >= MIN_TROZO && (2 * Math.abs(area(t))) / perimetro(t) >= MIN_ANCHO;

function restar(poly, lados) {
  const trozos = [];
  let resto = poly;
  for (const f of lados) {
    const fuera = cortar(resto, q => -f(q));
    if (valeTrozo(fuera)) trozos.push(fuera);
    resto = cortar(resto, f);
    if (resto.length < 3) break;
  }
  return trozos;
}

const r2 = q => [+q[0].toFixed(2), +q[1].toFixed(2)];
const cerrar = p => [...p.map(r2), r2(p[0])];

/** el marco de una acera: u a lo largo de a→b, n hacia dentro de la manzana */
function marcoAcera(map, a, b) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const u = [(b[0] - a[0]) / L, (b[1] - a[1]) / L];
  let n = [-u[1], u[0]];
  const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const lleno = s => map.buildings.some(q => Array.isArray(q.p) && dentro(q.p, m[0] + n[0] * s, m[1] + n[1] * s));
  if (!lleno(3) && lleno(-3)) n = [-n[0], -n[1]];
  const P = (s, t) => [a[0] + u[0] * s + n[0] * t, a[1] + u[1] * s + n[1] * t];
  return { L, u, n, P };
}

/** quita del bloque genérico el trozo que ocupan las casas nuevas (deja el resto del bloque como estaba) */
function recortarGenericos(map, a, M, fondo, s0 = 0, s1 = M.L) {
  const { u, n } = M;
  const loc = q => [(q[0] - a[0]) * u[0] + (q[1] - a[1]) * u[1], (q[0] - a[0]) * n[0] + (q[1] - a[1]) * n[1]];
  const lados = [q => loc(q)[0] - s0 + 0.05, q => s1 + 0.05 - loc(q)[0], q => loc(q)[1] + 2, q => fondo - loc(q)[1]];
  const L = s1;
  const nuevos = [];
  for (const b of map.buildings) {
    if (!tocable(b)) { nuevos.push(b); continue; }
    const ls = b.p.map(loc);
    const toca = Math.min(...ls.map(q => q[0])) < L && Math.max(...ls.map(q => q[0])) > s0
      && Math.min(...ls.map(q => q[1])) < fondo && Math.max(...ls.map(q => q[1])) > -2;
    if (!toca) { nuevos.push(b); continue; }
    const abierto = b.p.slice(0, b.p.length - (b.p.length > 1 && b.p[0][0] === b.p.at(-1)[0] && b.p[0][1] === b.p.at(-1)[1] ? 1 : 0));
    for (const t of restar(abierto, lados)) nuevos.push({ ...b, p: cerrar(t), recortadoAltavista: true });
  }
  map.buildings = nuevos;
}

/** levanta una acera de casas */
export function acera(map, { a, b, fondo = 9, casas }) {
  if (!Array.isArray(map?.buildings) || !casas?.length) return;
  const M = marcoAcera(map, a, b);
  const total = casas.reduce((s, c) => s + c[0], 0);
  const k = M.L / total;
  // primero se recorta lo genérico de cada casa (un solar puede entrar más que las casas: extra.fondo)
  recortarGenericos(map, a, M, fondo);
  let s = 0;
  for (const [ancho, , , extra = {}] of casas) {
    if (extra.fondo > fondo) recortarGenericos(map, a, M, extra.fondo, s, s + ancho * k);
    s += ancho * k;
  }
  s = 0;
  for (const [ancho, alto, color, extra = {}] of casas) {
    const s0 = s, s1 = s + ancho * k;
    s = s1;
    if (alto <= 0) continue;
    const f = extra.fondo || fondo;
    const p = cerrar([M.P(s0, 0), M.P(s1, 0), M.P(s1, f), M.P(s0, f)]);
    // en las esquinas, si la casa ya la puso la otra calle (o una pieza hecha a mano), no se repite
    const [cx, cz] = M.P((s0 + s1) / 2, f / 2);
    if (map.buildings.some(q => q.edificioReal && Array.isArray(q.p) && dentro(q.p, cx, cz))) continue;
    const tienda = !!(extra.tienda || extra.letrero);
    map.buildings.push({ p, h: alto, k: 'gen', s: tienda ? 1 : 0, f: hexRgb(color), c: [204, 200, 192], edificioReal: true, altavistaCalle: true });
    if (extra.letrero) {
      const [x, z] = M.P((s0 + s1) / 2, 0);
      (map.signs ||= []).push({ x: +x.toFixed(2), z: +z.toFixed(2), nx: -M.n[0], nz: -M.n[1], name: extra.letrero, k: extra.k || 'gen' });
    }
  }
}

/** varias aceras seguidas */
export function aceras(map, lista) {
  for (const def of lista) acera(map, def);
}
