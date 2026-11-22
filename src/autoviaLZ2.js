import * as THREE from 'three';

/**
 * (Version 164) La autovía LZ-2 entre Arrecife y Playa Honda, vestida como en los vídeos del 20-11-2026
 * (kit `gta recursos\20..11..2026`, zona Z4 de su DISENO-MUNDO.md). Lo que se ve allí y no estaba en el juego:
 *  - la fila de palmeras a cada lado de la autovía (P11, «palmeral de la LZ-2»);
 *  - la pantalla acústica blanca de lamas del lado del pueblo de Playa Honda (P12);
 *  - los dos pórticos de destinos: el verde `ARRECIFE / PLAYA BLANCA / AEROPUERTO` (P05) y el azul
 *    `ARRECIFE / COSTA TEGUISE / PLAYA BLANCA` (P09);
 *  - los carteles de salida a 300, 200 y 100 m, el cartel azul `PLAYA HONDA` (P21) y la señal del avión (P13).
 *
 * Solo es mobiliario: no toca el trazado ni los edificios. Las dos calzadas se sacan del mapa (las calles de 13 m
 * encadenadas por las puntas) y todo se coloca midiendo sobre ellas. Las salidas son las del mapa; el sitio de los
 * pórticos y de la señal del avión está puesto a ojo (el kit no trae medidas): si José Manuel dice otro, se cambia
 * en PORTICOS y AVION.
 *
 *  - `tuneAutoviaLZ2(map)`: las palmeras (`map.extraPalms`, las planta el mundo).
 *  - `buildAutoviaLZ2(scene, colliders, map)`: pantalla, pórticos y carteles.
 */

// donde arranca cada calzada (la del norte va hacia el oeste; la del sur, hacia Arrecife)
const INICIO = { oeste: [-1634, 424], este: [-5316, 671] };
// tramo que se viste, en x
const TRAMO = [-5290, -1960];
// salidas de la autovía (el punto donde se separa el ramal, medido en el mapa)
const SALIDAS = [
  { calzada: 'oeste', en: [-3549, 547], nombre: 'PLAYA HONDA' },
  { calzada: 'oeste', en: [-2100, 458] },
  { calzada: 'este', en: [-4683, 632], nombre: 'PLAYA HONDA' },
  { calzada: 'este', en: [-2207, 480] },
];
// pórticos de destinos: un punto de la calzada que cruzan
const PORTICOS = [
  { en: [-1716, 392], color: 'azul', lineas: ['ARRECIFE', 'COSTA TEGUISE', 'PLAYA BLANCA'] },
  { en: [-1819, 90], color: 'verde', lineas: ['ARRECIFE', 'PLAYA BLANCA', 'AEROPUERTO'] },
];
// la señal azul del avión, en la calzada que va al oeste
const AVION = [-4900, 630];
// la pantalla acústica: lado sur (el del pueblo), en la franja que separa la autovía de la calle Mástil y sus casas
const PANTALLA = [-4700, -4130];
// la entrada de Playa Honda ya tiene sus palmeras (entradaHonda.js): ahí no se repiten
const YA_PLANTADO = [-4060, -3400];

const VERDE = '#0a6a3c', AZUL = '#0b4fa3';

function distSeg(px, pz, ax, az, bx, bz) {
  const dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz;
  const t = L2 ? Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / L2)) : 0;
  return Math.hypot(px - (ax + dx * t), pz - (az + dz * t));
}

const esAutovia = (r) => (r.w || 0) >= 11 && !r.glorieta && !r.ped && r.p.length >= 2
  && r.p.some(([x, z]) => x < -1600 && z > 300 && z < 720);

/** una calzada entera: las calles anchas encadenadas por las puntas desde `inicio` */
function cadena(roads, inicio) {
  const cand = roads.filter(esAutovia);
  let act = null, d0 = 8;
  for (const r of cand) {
    const d = Math.hypot(r.p[0][0] - inicio[0], r.p[0][1] - inicio[1]);
    if (d < d0) { d0 = d; act = r; }
  }
  const pts = [], usadas = new Set();
  let ancho = 13;
  while (act && !usadas.has(act)) {
    usadas.add(act);
    ancho = act.w || ancho;
    for (const q of act.p) {
      const u = pts[pts.length - 1];
      if (!u || Math.hypot(u[0] - q[0], u[1] - q[1]) > 0.3) pts.push([q[0], q[1]]);
    }
    const fin = act.p[act.p.length - 1];
    let sig = null, ds = 2.5;
    for (const r of cand) {
      if (usadas.has(r)) continue;
      const d = Math.hypot(r.p[0][0] - fin[0], r.p[0][1] - fin[1]);
      if (d < ds) { ds = d; sig = r; }
    }
    act = sig;
  }
  if (pts.length < 2) return null;
  const acc = [0];
  for (let i = 1; i < pts.length; i++) acc.push(acc[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return { pts, acc, largo: acc[acc.length - 1], ancho };
}

/** el punto de la calzada a `s` metros del principio, con su sentido (ux, uz) */
function enS(c, s) {
  const { pts, acc } = c;
  let i = 1;
  while (i < pts.length - 1 && acc[i] < s) i++;
  const [ax, az] = pts[i - 1], [bx, bz] = pts[i], L = acc[i] - acc[i - 1] || 1;
  const t = Math.max(0, Math.min(1, (s - acc[i - 1]) / L));
  return { x: ax + (bx - ax) * t, z: az + (bz - az) * t, ux: (bx - ax) / L, uz: (bz - az) / L };
}

/** a cuántos metros del principio queda el punto de la calzada más cercano a (x, z) */
function sDe(c, [x, z]) {
  let best = 0, bd = Infinity;
  for (let i = 1; i < c.pts.length; i++) {
    const [ax, az] = c.pts[i - 1], [bx, bz] = c.pts[i];
    const dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz;
    const t = L2 ? Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L2)) : 0;
    const d = Math.hypot(x - (ax + dx * t), z - (az + dz * t));
    if (d < bd) { bd = d; best = c.acc[i - 1] + Math.sqrt(L2) * t; }
  }
  return { s: best, d: bd };
}

/** un punto a la derecha del sentido de la marcha (el arcén de fuera) */
const derecha = (p, d) => [p.x - p.uz * d, p.z + p.ux * d];

/** dónde va un cartel: en el arcén de fuera o, si ahí hay otra calle pegada, en la franja del medio */
function sitio(c, p, d, vecinas) {
  const [x, z] = derecha(p, c.ancho / 2 + d);
  if (calleCerca(vecinas, x, z, 0.6) >= 0.6) return [x, z];
  return derecha(p, -(c.ancho / 2 + 1.0));
}

/** las demás calles de alrededor de la autovía (para no plantar ni levantar nada encima) */
function callesVecinas(roads) {
  return roads.filter(r => !esAutovia(r) && r.p.length >= 2 && r.p.some(([x, z]) => x < -1850 && x > -5400 && z > 250 && z < 820));
}
function calleCerca(vecinas, x, z, tope) {
  let d = Infinity;
  for (const r of vecinas) {
    const p = r.p, m = (r.w || 6) / 2;
    for (let i = 1; i < p.length; i++) {
      d = Math.min(d, distSeg(x, z, p[i - 1][0], p[i - 1][1], p[i][0], p[i][1]) - m);
      if (d < tope) return d;
    }
  }
  return d;
}
function centros(buildings) {
  const out = [];
  for (const b of buildings || []) {
    if (b.skip || !b.p?.length) continue;
    let cx = 0, cz = 0;
    for (const q of b.p) { cx += q[0]; cz += q[1]; }
    cx /= b.p.length; cz /= b.p.length;
    if (cx < -1850 && cx > -5400 && cz > 250 && cz < 820) out.push([cx, cz]);
  }
  return out;
}

/** antes de levantar el mundo: una fila de palmeras en el arcén de fuera de cada calzada */
export function tuneAutoviaLZ2(map) {
  const vecinas = callesVecinas(map.roads), casas = centros(map.buildings);
  const antes = map.extraPalms || [], puestas = [];
  for (const lado of ['oeste', 'este']) {
    const c = cadena(map.roads, INICIO[lado]);
    if (!c) continue;
    for (let s = 30, k = 0; s < c.largo - 20; s += 26, k++) {
      const p = enS(c, s);
      if (p.x < TRAMO[0] || p.x > TRAMO[1]) continue;
      if (lado === 'este' && p.x > YA_PLANTADO[0] && p.x < YA_PLANTADO[1]) continue;
      const [x, z] = derecha(p, c.ancho / 2 + 6.2 + (k % 3) * 0.5);
      if (calleCerca(vecinas, x, z, 3.5) < 3.5) continue;
      if (casas.some(([cx, cz]) => Math.hypot(cx - x, cz - z) < 9)) continue;
      if (antes.some(q => Math.hypot(q[0] - x, q[1] - z) < 7)) continue;
      puestas.push([+x.toFixed(1), +z.toFixed(1), 7.2 + (k * 7 % 5) * 0.45, (k * 1.9) % (Math.PI * 2)]);
    }
  }
  map.extraPalms = [...antes, ...puestas];
  map.autoviaLZ2 = { palmeras: puestas.length };
  return puestas.length;
}

function lienzo(w, h, pinta) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  pinta(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** fondo de cartel con su orla blanca */
function fondo(c, w, h, color, r = 18) {
  c.fillStyle = '#f4f4f0'; c.fillRect(0, 0, w, h);
  c.fillStyle = color;
  c.beginPath(); c.roundRect(8, 8, w - 16, h - 16, r); c.fill();
}

/** una flecha blanca: hacia arriba (giro 0) o en diagonal a la derecha */
function flecha(c, x, y, t, giro) {
  c.save();
  c.translate(x, y); c.rotate(giro);
  c.fillStyle = '#fff';
  c.beginPath();
  c.moveTo(0, -t); c.lineTo(t * 0.62, -t * 0.2); c.lineTo(t * 0.22, -t * 0.2); c.lineTo(t * 0.22, t);
  c.lineTo(-t * 0.22, t); c.lineTo(-t * 0.22, -t * 0.2); c.lineTo(-t * 0.62, -t * 0.2);
  c.closePath(); c.fill();
  c.restore();
}

/** la silueta del avión de la señal del aeropuerto */
function avion(c, x, y, t) {
  c.save();
  c.translate(x, y);
  c.fillStyle = '#fff';
  c.beginPath(); c.ellipse(0, 0, t * 0.13, t, 0, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.moveTo(0, -t * 0.25); c.lineTo(t * 0.95, t * 0.3); c.lineTo(t * 0.95, t * 0.48); c.lineTo(0, t * 0.2);
  c.lineTo(-t * 0.95, t * 0.48); c.lineTo(-t * 0.95, t * 0.3); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(0, t * 0.62); c.lineTo(t * 0.38, t * 0.9); c.lineTo(t * 0.38, t); c.lineTo(0, t * 0.9);
  c.lineTo(-t * 0.38, t); c.lineTo(-t * 0.38, t * 0.9); c.closePath(); c.fill();
  c.restore();
}

const texPortico = ({ color, lineas }) => lienzo(1024, 336, (c, w, h) => {
  fondo(c, w, h, color === 'verde' ? VERDE : AZUL);
  c.fillStyle = '#fff'; c.textBaseline = 'middle'; c.textAlign = 'left';
  c.font = 'bold 78px Arial, Helvetica, sans-serif';
  lineas.forEach((t, i) => {
    const y = 66 + i * 102;
    c.fillText(t, 140, y + 4, w - 300);
    flecha(c, 78, y, 34, 0);
    if (t === 'AEROPUERTO') avion(c, w - 96, y, 36);
  });
});

const texCuenta = (barras, texto) => lienzo(128, 288, (c, w, h) => {
  fondo(c, w, h, AZUL, 10);
  c.strokeStyle = '#fff'; c.lineWidth = 20; c.lineCap = 'butt';
  for (let i = 0; i < barras; i++) {
    const y = 58 + i * 52;
    c.beginPath(); c.moveTo(24, y + 28); c.lineTo(w - 24, y - 28); c.stroke();
  }
  c.fillStyle = '#fff'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.font = 'bold 34px Arial, Helvetica, sans-serif';
  c.fillText(texto, w / 2, h - 44);
});

const texSalida = (nombre) => lienzo(640, 224, (c, w, h) => {
  fondo(c, w, h, AZUL);
  c.fillStyle = '#fff'; c.textAlign = 'left'; c.textBaseline = 'middle';
  c.font = 'bold 76px Arial, Helvetica, sans-serif';
  c.fillText(nombre, 40, h / 2 + 4, w - 190);
  flecha(c, w - 86, h / 2, 50, Math.PI / 4);
});

const texAvion = () => lienzo(256, 336, (c, w, h) => {
  fondo(c, w, h, AZUL, 14);
  avion(c, w / 2, 126, 92);
  c.fillStyle = '#fff'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.font = 'bold 34px Arial, Helvetica, sans-serif';
  c.fillText('AEROPUERTO', w / 2, h - 46, w - 30);
});

/** un grupo en (x, z) con su eje z local en el sentido de la marcha: lo que mira a −z lo ve el que llega */
function mirando(grupo, x, z, ux, uz) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = Math.atan2(ux, uz);
  grupo.add(g);
  return g;
}

/** un panel con su chapa de detrás, mirando al que llega */
function panel(g, mats, tex, ancho, alto, x, y) {
  const chapa = new THREE.Mesh(new THREE.BoxGeometry(ancho, alto, 0.08), mats.acero);
  chapa.position.set(x, y, 0);
  chapa.castShadow = true;
  const cara = new THREE.Mesh(new THREE.PlaneGeometry(ancho, alto), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.55, emissive: 0x5a5a5a, emissiveMap: tex }));
  cara.position.set(x, y, -0.05);
  cara.rotation.y = Math.PI;
  g.add(chapa, cara);
}

function poste(g, mats, x, alto, grueso = 0.14) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(grueso / 2, grueso / 2, alto, 8), mats.acero);
  m.position.set(x, alto / 2, 0);
  m.castShadow = true;
  g.add(m);
}

/** el pórtico: dos pilares, la viga de celosía y el panel de destinos sobre la calzada */
function portico(grupo, colliders, mats, roads, def) {
  let best = null, bd = 25;
  for (const r of roads) {
    if ((r.w || 0) < 11 || r.p.length < 2) continue;
    for (let i = 1; i < r.p.length; i++) {
      const [ax, az] = r.p[i - 1], [bx, bz] = r.p[i];
      const d = distSeg(def.en[0], def.en[1], ax, az, bx, bz);
      if (d < bd) { bd = d; best = { ax, az, bx, bz, w: r.w }; }
    }
  }
  if (!best) return false;
  const L = Math.hypot(best.bx - best.ax, best.bz - best.az) || 1;
  const ux = (best.bx - best.ax) / L, uz = (best.bz - best.az) / L;
  const t = Math.max(0, Math.min(1, ((def.en[0] - best.ax) * ux + (def.en[1] - best.az) * uz) / L));
  const x = best.ax + ux * L * t, z = best.az + uz * L * t;
  const g = mirando(grupo, x, z, ux, uz);
  const medio = best.w / 2 + 1.6, ALTO = 7.4;
  for (const s of [-1, 1]) {
    const pilar = new THREE.Mesh(new THREE.BoxGeometry(0.34, ALTO, 0.34), mats.acero);
    pilar.position.set(s * medio, ALTO / 2, 0);
    pilar.castShadow = true;
    g.add(pilar);
    colliders?.addSegment(x + s * medio * uz - 0.3 * ux, z - s * medio * ux - 0.3 * uz, x + s * medio * uz + 0.3 * ux, z - s * medio * ux + 0.3 * uz);
  }
  // la viga: dos largueros y los montantes entre ellos
  for (const y of [ALTO - 0.15, ALTO - 1.25]) {
    const v = new THREE.Mesh(new THREE.BoxGeometry(medio * 2 + 0.34, 0.16, 0.24, 8, 1, 1), mats.acero);
    v.position.set(0, y, 0);
    v.castShadow = true;
    g.add(v);
  }
  for (let k = -5; k <= 5; k++) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.1, 0.1), mats.acero);
    m.position.set(k * medio / 5.2, ALTO - 0.7, 0);
    g.add(m);
  }
  panel(g, mats, texPortico(def), 9.6, 3.15, 0, ALTO - 0.75);
  g.children[g.children.length - 1].position.z = -0.2;
  g.children[g.children.length - 2].position.z = -0.15;
  return true;
}

/** la pantalla acústica: zócalo de hormigón, lamas blancas hasta 4,6 m y un pilar cada tramo */
function pantalla(grupo, colliders, c, vecinas, casas) {
  const borde = [];
  for (let s = 0; s <= c.largo; s += 4) {
    const p = enS(c, s);
    if (p.x < PANTALLA[0] || p.x > PANTALLA[1]) continue;
    borde.push(derecha(p, c.ancho / 2 + 1.8));
  }
  const tramos = [];
  for (let i = 1; i < borde.length; i++) {
    const [ax, az] = borde[i - 1], [bx, bz] = borde[i];
    const mx = (ax + bx) / 2, mz = (az + bz) / 2, L = Math.hypot(bx - ax, bz - az);
    if (L < 0.5 || L > 6) continue;
    // donde un ramal o una calle cruza la franja, la pantalla se abre
    if (calleCerca(vecinas, mx, mz, 0.4) < 0.4) continue;
    if (!casas.some(([cx, cz]) => cz > mz && Math.hypot(cx - mx, cz - mz) < 75)) continue;
    tramos.push([ax, az, bx, bz, L, i]);
  }
  // fuera los trozos sueltos entre ramales: solo se dejan las tiradas de 40 m o más
  for (let i = 0; i < tramos.length;) {
    let j = i;
    while (j + 1 < tramos.length && tramos[j + 1][5] === tramos[j][5] + 1) j++;
    if (j - i + 1 < 10) tramos.splice(i, j - i + 1); else i = j + 1;
  }
  if (!tramos.length) return 0;
  const lamas = lienzo(16, 128, (k, w, h) => {
    k.fillStyle = '#eef0ee'; k.fillRect(0, 0, w, h);
    k.fillStyle = '#b9bfbd';
    for (let y = 0; y < h; y += 16) k.fillRect(0, y + 12, w, 4);
  });
  lamas.wrapS = lamas.wrapT = THREE.RepeatWrapping;
  lamas.repeat.set(1, 2);
  const blanco = new THREE.MeshStandardMaterial({ map: lamas, roughness: 0.6, emissive: 0x262626, emissiveMap: lamas });
  const hormigon = new THREE.MeshStandardMaterial({ color: 0xa9a59c, roughness: 0.95 });
  const gris = new THREE.MeshStandardMaterial({ color: 0x8d9398, roughness: 0.5, metalness: 0.5 });
  const gLama = new THREE.BoxGeometry(0.14, 3.9, 1); gLama.translate(0, 2.65, 0);
  const gZoc = new THREE.BoxGeometry(0.3, 0.7, 1); gZoc.translate(0, 0.35, 0);
  const gPilar = new THREE.BoxGeometry(0.2, 4.75, 0.2); gPilar.translate(0, 2.375, 0);
  const iLama = new THREE.InstancedMesh(gLama, blanco, tramos.length);
  const iZoc = new THREE.InstancedMesh(gZoc, hormigon, tramos.length);
  const iPilar = new THREE.InstancedMesh(gPilar, gris, tramos.length);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0), pos = new THREE.Vector3(), esc = new THREE.Vector3();
  tramos.forEach(([ax, az, bx, bz, L], i) => {
    q.setFromAxisAngle(up, Math.atan2(bx - ax, bz - az));
    m.compose(pos.set((ax + bx) / 2, 0, (az + bz) / 2), q, esc.set(1, 1, L + 0.04));
    iLama.setMatrixAt(i, m); iZoc.setMatrixAt(i, m);
    m.compose(pos.set(ax, 0, az), q, esc.set(1, 1, 1));
    iPilar.setMatrixAt(i, m);
    colliders?.addSegment(ax, az, bx, bz);
  });
  for (const im of [iLama, iZoc, iPilar]) { im.castShadow = im.receiveShadow = true; grupo.add(im); }
  return tramos.length;
}

export function buildAutoviaLZ2(scene, colliders, map) {
  const grupo = new THREE.Group();
  grupo.name = 'autoviaLZ2';
  const mats = { acero: new THREE.MeshStandardMaterial({ color: 0x8f969b, roughness: 0.45, metalness: 0.6 }) };
  const calz = { oeste: cadena(map.roads, INICIO.oeste), este: cadena(map.roads, INICIO.este) };
  const vecinas = callesVecinas(map.roads), casas = centros(map.buildings);
  const cuenta = { palmeras: map.autoviaLZ2?.palmeras || 0, porticos: 0, carteles: 0, pantalla: 0 };

  for (const def of PORTICOS) if (portico(grupo, colliders, mats, map.roads, def)) cuenta.porticos++;

  // los carteles de salida: 300, 200 y 100 m antes, y el de destino en el arranque del ramal
  const tCuenta = [texCuenta(3, '300 m'), texCuenta(2, '200 m'), texCuenta(1, '100 m')];
  const tSalida = {};
  for (const sal of SALIDAS) {
    const c = calz[sal.calzada];
    if (!c) continue;
    const { s, d } = sDe(c, sal.en);
    if (d > 20) continue;
    [300, 200, 100].forEach((antes, i) => {
      if (s - antes < 10) return;
      const p = enS(c, s - antes);
      const [x, z] = sitio(c, p, 2.6, vecinas);
      const g = mirando(grupo, x, z, p.ux, p.uz);
      poste(g, mats, 0, 3.0, 0.1);
      panel(g, mats, tCuenta[i], 0.95, 2.14, 0, 2.7);
      cuenta.carteles++;
    });
    if (sal.nombre && s > 60) {
      const p = enS(c, s - 45);
      const [x, z] = sitio(c, p, 4.2, vecinas);
      const g = mirando(grupo, x, z, p.ux, p.uz);
      poste(g, mats, -1.8, 4.6); poste(g, mats, 1.8, 4.6);
      tSalida[sal.nombre] ||= texSalida(sal.nombre);
      panel(g, mats, tSalida[sal.nombre], 5.6, 1.96, 0, 3.9);
      cuenta.carteles++;
    }
  }

  // la señal azul del avión, camino del aeropuerto
  if (calz.oeste) {
    const { s, d } = sDe(calz.oeste, AVION);
    if (d < 30) {
      const p = enS(calz.oeste, s);
      const [x, z] = sitio(calz.oeste, p, 2.8, vecinas);
      const g = mirando(grupo, x, z, p.ux, p.uz);
      poste(g, mats, 0, 3.4, 0.12);
      panel(g, mats, texAvion(), 1.5, 1.97, 0, 3.2);
      cuenta.carteles++;
    }
  }

  if (calz.este) cuenta.pantalla = pantalla(grupo, colliders, calz.este, vecinas, casas);

  grupo.userData.cuenta = cuenta;
  scene.add(grupo);
  return grupo;
}
