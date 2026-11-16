import { PLACES, OFFICIAL } from './places.js';
import { calleRealAxis } from './zones.js';
import { CAMPO_START } from './casaCampo.js';

/** quita tildes y mayúsculas para comparar lo que escribe la gente */
export const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();

const mid = (r) => r.p[Math.floor(r.p.length / 2)];

// para las faltas: las letras dobles, la «h» y las letras que suenan igual no cuentan
// («macarroni» encuentra «Maccheroni», «tanatorio» y «tanatoryo» son lo mismo)
const loose = (s) => norm(s).replace(/qu/g, 'c').replace(/k/g, 'c').replace(/h/g, '').replace(/v/g, 'b').replace(/z/g, 's').replace(/y\b/g, 'i').replace(/(.)\1+/g, '$1');
const SMALL = new Set(['el', 'la', 'los', 'las', 'de', 'del', 'al', 'y', 'en', 'c.c.', 'cc']);

/** letras que hay que cambiar para pasar de una palabra a otra */
function edits(a, b) {
  if (Math.abs(a.length - b.length) > 2) return 9;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[b.length];
}

/**
 * ¿se parece lo escrito a este nombre? 0 empieza igual · 1 una palabra empieza igual ·
 * 2 lo lleva dentro · 3 se parece aunque esté mal escrito · 9 nada que ver
 */
export function nameScore(query, name) {
  const q = norm(query), n = norm(name);
  if (!q || !n) return 9;
  if (n.startsWith(q)) return 0;
  if (n.includes(' ' + q)) return 1;
  if (n.includes(q)) return 2;
  const qw = loose(q).split(' ').filter(w => w.length > 2 && !SMALL.has(w));
  if (!qw.length) return 9;
  const nw = loose(n).split(' ').filter(w => w.length > 1);
  const near = (w) => nw.some(x => (w.length >= 4 && x.startsWith(w)) || edits(w, x) <= (w.length >= 7 ? 2 : w.length >= 4 ? 1 : 0));
  return qw.every(near) ? 3 : 9;
}

/**
 * sitios para empezar la partida: el centro, los sitios conocidos y los negocios
 * de los clientes. at: dónde; look: hacia dónde mira el coche al aparecer
 */
export function startPlaces(map, locales) {
  // la Calle Real de verdad es el tramo peatonal de León y Castillo (el otro tramo sigue muy al norte)
  const realAxis = calleRealAxis(map);
  const real = realAxis ? { p: realAxis } : map.roads.filter(r => /le[oó]n y castillo/i.test(r.name || '')).sort((a, b) => b.p.length - a.p.length)[0];
  const list = [
    { id: 'centro', label: 'Centro', keys: ['centro', 'inicio', 'normal'], at: null },
    // en la misma calzada, mirando al castillo (el coche cabe y llega hasta la puerta)
    { id: 'castillo', label: 'Castillo de San Gabriel', keys: ['castillo', 'san gabriel', 'puente de las bolas', 'bolas', 'museo'],
      at: [253, 515], look: PLACES.castilloSanGabriel, on: (r) => r.calzada },
    { id: 'ayto', label: 'Ayuntamiento', keys: ['ayuntamiento', 'alcalde', 'ayto'], at: OFFICIAL.find(o => o.k === 'ayto').at, look: OFFICIAL.find(o => o.k === 'ayto').at },
    { id: 'real', label: 'Calle Real', keys: ['calle real', 'real', 'leon y castillo'], at: real ? mid(real) : null, look: real ? real.p[0] : null },
    { id: 'charco', label: 'Charco de San Ginés', keys: ['charco', 'san gines', 'iglesia'], at: PLACES.chalanaCharco, look: PLACES.iglesiaSanGines },
    { id: 'reducto', label: 'Playa del Reducto', keys: ['reducto', 'playa', 'regata'], at: [-760, 452], look: [-990, 470], on: (r) => /fred olsen/i.test(r.name || '') },
    { id: 'hotel', label: 'Gran Hotel', keys: ['gran hotel', 'hotel'], at: [-440, 560], look: [-440, 600] },
    { id: 'parque', label: 'Parque Islas Canarias', keys: ['parque', 'islas canarias', 'acampada'], at: PLACES.parqueIslasCanarias },
    // lo de la Avenida de Naos: la entrada de la Escuela de Pesca y el parque del Hospital Insular (junto a la parada)
    { id: 'escuela', label: 'Escuela de Pesca', keys: ['escuela de pesca', 'escuela', 'pesca', 'avenida de naos'], at: [742.7, -63.5], look: [750, -45] },
    // el campo de arriba de Arrecife: el camino de tierra, junto a la casa (sin nombre de nadie)
    { id: 'campo', label: 'Camino de tierra', keys: ['camino de tierra', 'campo', 'casa', 'mi casa', 'tierra'], at: CAMPO_START.at, look: CAMPO_START.look },
    { id: 'hospital', label: 'Parque del Hospital Insular', keys: ['hospital insular', 'parque del hospital', 'insular', 'parking de los medicos'], at: [704, -79.5], look: [689, -81] },
    // el HiperDino de Argana Alta, en la Calle Tenderete (hiperdinoArgana.js): el coche aparece en la calle, de cara a la tienda
    { id: 'hiperdino', label: 'HiperDino Argana', keys: ['hiperdino', 'hiper dino', 'argana', 'argana alta', 'supermercado'], at: [-1280, -1313], look: [-1300, -1349] },
    // Playa Honda (barrios/playa-honda): en la Avenida Mamerto Cabrera, mirando a la entrada de Conforama
    { id: 'honda', label: 'Playa Honda', keys: ['playa honda', 'honda', 'conforama', 'mamerto cabrera'], at: [-3790, 552], look: [-3822, 548] },
  ];
  for (const d of locales.defs) {
    const s = d.spot || d.door;
    list.push({
      id: 'n:' + d.name, label: d.name, keys: [d.name, ...(d.keys || [])], at: [d.door.x + d.door.nx * 6, d.door.z + d.door.nz * 6], look: [d.door.x, d.door.z], client: true,
      spot: [s.x, s.z], color: d.color ?? 0xf4c542, glyph: d.glyph || '•',
    });
  }
  return list;
}

/** lo que escribe la persona → un sitio de la lista o una calle del mapa; null si no se encuentra */
export function findStart(query, places, map) {
  const q = norm(query);
  if (!q) return null;
  const exact = places.find(p => norm(p.label) === q || p.keys.some(k => norm(k) === q));
  if (exact) return exact;
  const part = places.find(p => norm(p.label).includes(q) || p.keys.some(k => norm(k).includes(q) || q.includes(norm(k))));
  if (part) return part;
  const street = (r) => ({ id: 'calle:' + r.name, label: r.name, at: mid(r), look: r.p[r.p.length - 1] });
  const roads = map.roads.filter(r => r.name && norm(r.name).includes(q)).sort((a, b) => b.p.length - a.p.length);
  if (roads.length) return street(roads[0]);
  // mal escrito: primero los sitios y negocios, luego las calles
  const fuzzy = places.find(p => [p.label, ...p.keys].some(k => nameScore(query, k) <= 3));
  if (fuzzy) return fuzzy;
  const road = map.roads.filter(r => r.name && nameScore(query, r.name) <= 3).sort((a, b) => b.p.length - a.p.length)[0];
  return road ? street(road) : null;
}

/**
 * el coche en la calzada más cercana al sitio, mirando a lo largo de la calle
 * (y, si se puede, hacia lo que hay que ver)
 */
export function carSpot(map, at, look, on = null) {
  let best = null, bestD = Infinity;
  for (const r of map.roads) {
    if (on ? !on(r) : (r.ped || r.w < 4)) continue;
    for (let i = 0; i < r.p.length - 1; i++) {
      const [ax, az] = r.p[i], [bx, bz] = r.p[i + 1];
      const dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz;
      if (L2 < 4) continue;
      const t = Math.max(0.15, Math.min(0.85, ((at[0] - ax) * dx + (at[1] - az) * dz) / L2));
      const x = ax + dx * t, z = az + dz * t;
      const d = Math.hypot(x - at[0], z - at[1]);
      if (d < bestD) { bestD = d; best = { x, z, dx, dz, name: r.name }; }
    }
  }
  if (!best) return null;
  let { dx, dz } = best;
  if (look && (look[0] - best.x) * dx + (look[1] - best.z) * dz < 0) { dx = -dx; dz = -dz; }
  // name: la calle donde sale el coche; d: lo lejos que queda del sitio pedido
  return { x: best.x, z: best.z, heading: Math.atan2(dx, dz), name: best.name, d: bestD };
}
