import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { byVisit, pick, fit, SANS, poster } from './localesCommon.js';
import { TIENDAS, PLAZA_TIENDAS, RESTAURANTES, CHARLA } from './openMallDatos.js';
import { amueblar, cocina, marcoLocal } from './openMallMuebles.js';

/**
 * El Open Mall por dentro (León y Castillo 156; la fachada de la Rambla la monta openMall.js). Es un centro comercial
 * al aire libre: se entra por la torre del norte a un vestíbulo, y de ahí sale el paseo de la moda (31 tiendas y las
 * loterías), que da a la plaza con el parque infantil y los quince restaurantes alrededor de la terraza (cada mesa pide
 * a su restaurante), las camas elásticas de Sould Park y la juguetería; de la plaza sale el segundo paseo (zapatos,
 * deporte, móviles, ópticas, Worten, JYSK, Primark, Kiabi...) que acaba en el HiperDino. Todos los locales del
 * directorio de su web (noviembre de 2026), con el nombre en letra normal (sin logotipos), y se puede entrar en todos.
 * En unos cuantos atiende alguien y se puede comprar: ropa, zapatos, una gorra, gafas de sol, un corte de pelo, un
 * décimo, una hora de saltos o un bocadillo; y en la plaza se come.
 *
 * Medidas (en metros del interior): el vestíbulo de z 0 a 12, el paseo de la moda de 0 a −112 (14 m de ancho), la
 * plaza de −112 a −152 (60 m de ancho), el segundo paseo de −152 a −278 y el HiperDino de −278 a −304. Cada local, 7 m
 * de fachada (los grandes, 14) y 8 de fondo; los de la plaza, 8 y 7,5.
 */

const SLOT = 7, FONDO = 8, PLAZA_SLOT = 8, RIM = 7.5;
const CIELO = 0xcfe6f6, SUELO_PASEO = 'terrazo', PARED = 0xf2ede4, GRANATE = 0x8a3e30;
const A_Z0 = -112, A_Z1 = 0, B_Z0 = -278, B_Z1 = -152, PX = 30;

// ——— el reparto de los locales ———

/** una fila de locales a un lado de un paseo, de zIni hacia −z */
function filaPaseo(lista, porLado, zIni) {
  const out = [];
  let lado = 'w', j = 0;
  for (const [name, cat, bg, fg, n = 1] of lista) {
    if (j + n > porLado) { lado = 'e'; j = 0; }
    const z1 = zIni - j * SLOT, z0 = z1 - n * SLOT;
    out.push(lado === 'w'
      ? { name, cat, bg, fg, n, x0: -7 - FONDO, x1: -7, z0, z1, front: 'e' }
      : { name, cat, bg, fg, n, x0: 7, x1: 7 + FONDO, z0, z1, front: 'w' });
    j += n;
  }
  return out;
}

/** los huecos de la plaza: los dos lados largos, y las cuatro esquinas de los paseos */
function huecosPlaza() {
  const h = [];
  for (let j = 0; j < 5; j++) h.push({ x0: -PX - FONDO, x1: -PX, z1: A_Z0 - j * PLAZA_SLOT, z0: A_Z0 - (j + 1) * PLAZA_SLOT, front: 'e' });
  for (const x0 of [-PX, -PX + RIM]) h.push({ x0, x1: x0 + RIM, z0: B_Z1 - 8, z1: B_Z1, front: 's' });
  for (const x0 of [PX - 2 * RIM, PX - RIM]) h.push({ x0, x1: x0 + RIM, z0: B_Z1 - 8, z1: B_Z1, front: 's' });
  for (let j = 0; j < 5; j++) h.push({ x0: PX, x1: PX + FONDO, z1: A_Z0 - j * PLAZA_SLOT, z0: A_Z0 - (j + 1) * PLAZA_SLOT, front: 'w' });
  for (const x0 of [PX - 2 * RIM, PX - RIM]) h.push({ x0, x1: x0 + RIM, z0: A_Z0, z1: A_Z0 + 8, front: 'n' });
  for (const x0 of [-PX, -PX + RIM]) h.push({ x0, x1: x0 + RIM, z0: A_Z0, z1: A_Z0 + 8, front: 'n' });
  return h;
}

function reparto() {
  const iB = TIENDAS.findIndex(t => t[0] === 'Primark');
  const loterias = PLAZA_TIENDAS.find(t => t[1] === 'loteria');
  const paseoA = filaPaseo([...TIENDAS.slice(0, iB), loterias], 16, A_Z1);
  const paseoB = filaPaseo([...TIENDAS.slice(iB), ['Aseos', 'aseos', '#f2f2ee', '#2a2a2c']], 18, B_Z1);
  const hp = huecosPlaza();
  const plaza = [];
  // Sould Park en los dos primeros huecos del oeste (juntos), luego la juguetería y los restaurantes
  const sould = PLAZA_TIENDAS.find(t => t[1] === 'saltos'), nikki = PLAZA_TIENDAS.find(t => t[1] === 'juguetes');
  plaza.push({ name: sould[0], cat: sould[1], bg: sould[2], fg: sould[3], n: 2, ...hp[0], z0: hp[1].z0 });
  plaza.push({ name: nikki[0], cat: nikki[1], bg: nikki[2], fg: nikki[3], n: 1, ...hp[2] });
  RESTAURANTES.forEach((r, i) => plaza.push({ name: r[0], cat: 'rest', rest: r, bg: r[3], fg: r[4], n: 1, ...hp[3 + i] }));
  return { paseoA, paseoB, plaza };
}

/** los huecos en la pared del pasillo para un local: escaparates y puerta (medidos desde el principio de la pared) */
function escaparate(a, L) {
  const d = Math.min(2.6, L * 0.34), c = a + L / 2;
  return [[a + 0.3, c - d / 2 - 0.25, 'glass'], [c - d / 2, c + d / 2, 'door'], [c + d / 2 + 0.25, a + L - 0.3, 'glass']];
}

/** dónde va el rótulo del local, en la cara del pasillo */
function sitioRotulo(u) {
  const zc = (u.z0 + u.z1) / 2, xc = (u.x0 + u.x1) / 2;
  const L = u.front === 'e' || u.front === 'w' ? u.z1 - u.z0 : u.x1 - u.x0;
  const w = Math.min(L - 1, u.n > 1 ? 9 : 5.6), h = u.n > 1 ? 1.25 : 0.9;
  if (u.front === 'e') return { x: u.x1 + 0.03, z: zc, nx: 1, nz: 0, w, h };
  if (u.front === 'w') return { x: u.x0 - 0.03, z: zc, nx: -1, nz: 0, w, h };
  if (u.front === 'n') return { x: xc, z: u.z0 - 0.03, nx: 0, nz: -1, w, h };
  return { x: xc, z: u.z1 + 0.03, nx: 0, nz: 1, w, h };
}

/** todos los rótulos en un solo lienzo y una sola malla (para el móvil) */
function rotulos(k, canvasTex, lista) {
  const COLS = 4, CW = 512, CH = 80, rows = Math.ceil(lista.length / COLS);
  const tex = canvasTex(COLS * CW, rows * CH, (g) => {
    lista.forEach((s, i) => {
      const x = (i % COLS) * CW, y = Math.floor(i / COLS) * CH;
      g.fillStyle = s.bg; g.fillRect(x, y, CW, CH);
      g.fillStyle = s.fg; g.textAlign = 'center'; g.textBaseline = 'middle';
      fit(g, s.name.toUpperCase(), x + CW / 2, y + CH / 2 + 2, CW - 36, CH * 0.6, '800', SANS);
    });
  });
  const geos = lista.map((s, i) => {
    const g = new THREE.PlaneGeometry(s.w, s.h);
    const u0 = (i % COLS) / COLS, u1 = u0 + 1 / COLS;
    const v1 = 1 - Math.floor(i / COLS) / rows, v0 = v1 - 1 / rows;
    const uv = g.getAttribute('uv');
    uv.setXY(0, u0, v1); uv.setXY(1, u1, v1); uv.setXY(2, u0, v0); uv.setXY(3, u1, v0);
    g.rotateY(Math.atan2(s.nx, s.nz));
    g.translate(s.x + s.nx * 0.012, s.y, s.z + s.nz * 0.012);
    return g;
  });
  k.pics.push({ geo: mergeGeometries(geos, false), tex, glow: 0.35 });
}

// ——— lo que se compra ———

const COLORES_ROPA = [0x1c1c1e, 0xf4f1ea, 0xd8271c, 0x2c4f86, 0xe8c46a, 0x5a8a5a, 0xc87a9a, 0x3a3a6a, 0x18c5b8];

const ropa = (tienda) => (h) => {
  const look = h.getLook();
  look.top = pick(COLORES_ROPA.filter(c => c !== look.top));
  look.topStyle = pick(['tshirt', 'long', 'jacket', 'tshirt']);
  look.bottom = pick(COLORES_ROPA.filter(c => c !== look.bottom));
  if (look.sex === 'f' && Math.random() < 0.3) look.bottomStyle = pick(['skirt', 'dress']);
  else look.bottomStyle = pick(['pants', 'pants', 'shorts']);
  h.setLook(look); h.addMinutes(25);
  h.toast(`Ropa nueva de ${tienda}`);
};
const zapatos = (tienda) => (h) => {
  const look = h.getLook();
  look.shoeStyle = pick(['sneaker', 'shoe', 'sandal'].filter(s => s !== look.shoeStyle));
  look.shoes = pick([0xf4f1ea, 0x1e1e20, 0x8a6a4a, 0xd8271c, 0x3a4a6a, 0x18c5b8].filter(c => c !== look.shoes));
  h.setLook(look); h.addMinutes(20);
  h.toast(`Zapatos nuevos de ${tienda}`);
};
const gorra = (tienda) => (h) => {
  const look = h.getLook();
  look.cap = true; look.capColor = pick([0x1c1c1e, 0xd8271c, 0x2c4f86, 0xf4f1ea, 0x5a8a5a]);
  h.setLook(look); h.toast(`Gorra nueva de ${tienda}`);
};
const gafas = (tienda) => (h) => {
  const look = h.getLook();
  look.shades = true; h.setLook(look); h.toast(`Gafas de sol de ${tienda}`);
};
const pelo = (tienda) => (h) => {
  const look = h.getLook();
  const fem = look.sex === 'f';
  look.hairStyle = pick((fem ? ['long', 'ponytail', 'bun', 'curly', 'short'] : ['short', 'surf', 'curly', 'rapado']).filter(s => s !== look.hairStyle));
  h.setLook(look); h.addMinutes(30); h.toast(`Corte nuevo de ${tienda}`);
};
const decimo = (h) => {
  if (Math.random() < 0.08) { h.pay(-300); h.toast('¡Premio! El décimo lleva 300 €'); }
  else h.toast('Sin premio esta vez. ¡Otra vez será!');
};

const OFERTAS = {
  Zara: { label: 'Comprarte ropa nueva', price: 40, apply: ropa('Zara') },
  Primark: { label: 'Comprarte ropa nueva', price: 20, apply: ropa('Primark') },
  Kiabi: { label: 'Comprarte ropa nueva', price: 20, apply: ropa('Kiabi') },
  'Pull & Bear': { label: 'Comprarte ropa nueva', price: 30, apply: ropa('Pull & Bear') },
  Deichmann: { label: 'Comprarte unos zapatos', price: 30, apply: zapatos('Deichmann') },
  Skechers: { label: 'Comprarte unas deportivas', price: 50, apply: zapatos('Skechers') },
  Sprinter: { label: 'Comprarte una gorra', price: 15, apply: gorra('Sprinter') },
  'Max Óptica': { label: 'Comprarte unas gafas de sol', price: 30, apply: gafas('Max Óptica') },
  'Elite Peluquería': { label: 'Cortarte el pelo', price: 15, apply: pelo('Elite Peluquería') },
  'Loterías y Apuestas del Estado': { label: 'Comprar un décimo', price: 3, apply: decimo },
  'Sould Park': { label: 'Una hora de saltos', price: 10, apply: (h) => { h.addMinutes(60); h.heal(); h.toast('Una hora de saltos en Sould Park · salud al 100%'); } },
  HiperDino: { label: 'Comprar un bocadillo y agua', price: 4, apply: (h) => { h.heal(); h.addMinutes(10); h.toast('Bocadillo del HiperDino · salud al 100%'); } },
};
// las que tienen a alguien atendiendo (y hablan) aunque no vendan nada en el juego
const CON_GENTE = new Set([...Object.keys(OFERTAS), 'Juguetería Nikki', 'Worten']);

// ——— la gente ———

const PIELES = [0xf0cfb0, 0xe2b896, 0xc89a72, 0x9a6a4a, 0xe8c4a2, 0x6a4a32];
const PELOS = [0x1e1712, 0x3a2a1c, 0x6a4a2a, 0xc8a060, 0x101010, 0x8a8a88];

function lookDe(i, color) {
  const f = i % 2 === 0;
  return {
    sex: f ? 'f' : 'm', skin: PIELES[i % PIELES.length], hair: PELOS[(i * 3) % PELOS.length],
    hairStyle: f ? pick(['long', 'ponytail', 'bun']) : pick(['short', 'surf', 'curly']), beard: !f && i % 3 === 0,
    top: color, topStyle: 'tshirt', bottom: 0x1e2024, bottomStyle: 'pants', shoes: 0x1e1e20, shoeStyle: 'sneaker',
    height: f ? 1.66 : 1.78,
  };
}

function charla(nombre, cat) {
  const frases = CHARLA[cat] || ['Bienvenido. Mira lo que quieras.'];
  return byVisit(frases.map((f, i) => (c) => [
    { who: nombre, text: f },
    { who: c.me, text: pick(['Solo estoy mirando, gracias.', '¿Y eso qué tal?', 'Muy bien, gracias.', 'Pues igual me llevo algo.']), player: true },
    { who: nombre, text: i === 0 ? 'Cualquier cosa, me dices.' : '¡Tú mismo! Aquí estoy.' },
  ]));
}

function dependiente(u, i, at, face) {
  const o = OFERTAS[u.name];
  const n = {
    name: u.name, at, face, pose: 'counter', detail: 1,
    look: lookDe(i, new THREE.Color(u.bg).getHex() === 0xffffff ? new THREE.Color(u.fg).getHex() : new THREE.Color(u.bg).getHex()),
    greet: () => pick(['¡Hola! Pasa, pasa.', '¡Buenas! Bienvenido.', 'Hola, ¿te puedo ayudar?']),
    talk: charla(u.name, u.cat),
  };
  if (o) n.offer = { ...o, talk: (c) => [
    { who: c.me, text: `${o.label.replace(/^Comprarte|^Comprar|^Cortarte|^Una/, (s) => ({ Comprarte: 'Me llevo', Comprar: 'Dame', Cortarte: 'Córtame', Una: 'Quiero una' }[s]))}.`, player: true },
    { who: u.name, text: c.paid ? '¡Ahí lo tienes! Que lo disfrutes.' : 'Esta vez corre de nuestra cuenta. ¡Vuelve pronto!' },
  ] };
  return n;
}

// ——— los platos de la plaza ———

function plato(kind) {
  return (T) => {
    const g = new T.Group();
    const mat = (color) => new T.MeshStandardMaterial({ color, roughness: 0.6 });
    const bebida = kind === 'bebida' || kind === 'zumo' || kind === 'helado' || kind === 'yogur';
    if (!bebida) {
      const p = new T.Mesh(new T.CylinderGeometry(0.15, 0.11, 0.022, 24), mat(0xffffff));
      p.position.y = 0.011; g.add(p);
    }
    const food = new T.Group();
    food.position.y = 0.022;
    const add = (geo, color, x = 0, y = 0, z = 0) => { const m = new T.Mesh(geo, mat(color)); m.position.set(x, y, z); food.add(m); return m; };
    if (kind === 'burger') {
      add(new T.CylinderGeometry(0.07, 0.07, 0.03, 16), 0xd8a050, -0.03, 0.015);
      add(new T.CylinderGeometry(0.068, 0.068, 0.025, 16), 0x5a3020, -0.03, 0.04);
      add(new T.SphereGeometry(0.07, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), 0xd8a050, -0.03, 0.055);
      add(new T.BoxGeometry(0.06, 0.07, 0.04), 0xd8271c, 0.08, 0.035);
    } else if (kind === 'pizza') {
      add(new T.CylinderGeometry(0.14, 0.14, 0.015, 24), 0xe8b050, 0, 0.008);
      for (let i = 0; i < 6; i++) add(new T.CylinderGeometry(0.02, 0.02, 0.006, 8), 0xb02a1a, Math.cos(i) * 0.08, 0.018, Math.sin(i) * 0.08);
    } else if (kind === 'sushi' || kind === 'pollo' || kind === 'tapa') {
      for (let i = 0; i < 6; i++) {
        const a = i * Math.PI / 3, x = Math.cos(a) * 0.075, z = Math.sin(a) * 0.075;
        if (kind === 'sushi') add(new T.CylinderGeometry(0.022, 0.022, 0.03, 10), 0x1c2a1c, x, 0.015, z);
        else add(new T.SphereGeometry(0.03, 8, 6), kind === 'pollo' ? 0xb8762a : 0xd89a40, x, 0.02, z);
      }
    } else if (kind === 'tacos' || kind === 'empanadas' || kind === 'arepa') {
      for (let i = 0; i < 3; i++) add(new T.CylinderGeometry(0.045, 0.045, 0.03, 12), kind === 'tacos' ? 0xe8c878 : kind === 'arepa' ? 0xf2e2b0 : 0xd89a40, -0.07 + i * 0.07, 0.015);
    } else if (kind === 'dulce') {
      add(new T.BoxGeometry(0.09, 0.05, 0.07), 0xf4c2d0, -0.03, 0.025);
      add(new T.CylinderGeometry(0.035, 0.03, 0.07, 12), 0xf4f1ea, 0.08, 0.035);
    } else {
      add(new T.CylinderGeometry(0.045, 0.035, 0.12, 14), kind === 'zumo' ? 0xf2a01a : kind === 'bebida' ? 0xd8b0a0 : 0xf4f1ea, 0, 0.06);
      if (kind === 'helado' || kind === 'yogur') add(new T.SphereGeometry(0.045, 10, 8), kind === 'helado' ? 0xf4c2d0 : 0xf4f6ee, 0, 0.13);
      else add(new T.CylinderGeometry(0.005, 0.005, 0.1, 6), 0x1c1c1e, 0.015, 0.14);
    }
    g.add(food);
    g.userData.food = food;
    return g;
  };
}

const comer = (donde, mins = 30) => (h) => { h.heal(); h.addMinutes(mins); h.toast(`Comida en ${donde} · salud al 100%`); };

function pedido(u) {
  const [nombre, que, kind] = u.rest;
  return {
    label: `Pedir ${que}`, again: `Pedir otra vez`, who: nombre, wait: 6, eat: 11,
    talk: (c) => [
      { who: c.me, text: `¡Hola! ¿Me pones ${que}?`, player: true },
      { who: nombre, text: pick(['¡Marchando! Ahora te lo llevo a la mesa.', '¡Claro! Siéntate, que enseguida va.', '¡Hecho! Un momentito.']) },
    ],
    served: () => '¡Aquí tienes! Que aproveche.',
    after: () => pick(['¡Qué rico!', 'Esto está buenísimo.', 'Me ha encantado.']),
    plate: plato(kind),
    apply: comer(nombre),
  };
}

// ——— el decorado del paseo y de la plaza ———

function palmera(k, x, z) {
  k.box(x, 0, z, 2.2, 0.5, 2.2, 0x6a6a66).block(x, z, 2.2, 2.2);
  k.box(x, 0.5, z, 2.0, 0.05, 2.0, 0x3a2e24);
  k.cyl(x, 0.5, z, 0.16, 0.22, 3.4, 0x7a6248, { seg: 8 });
  for (let i = 0; i < 7; i++) k.box(x, 3.85, z, 2.8, 0.05, 0.4, 0x4a7a32, { ry: (i * Math.PI) / 7 });
}

function farola(k, x, z) {
  k.cyl(x, 0, z, 0.06, 0.08, 4.2, 0x2a2a2c, { seg: 8 }).ball(x, 4.3, z, 0.22, 0xfff4e2, { list: k.glow, seg: 10 });
  k.block(x, z, 0.2, 0.2);
}

function banco(k, x, z, alongZ) {
  k.box(x, 0, z, alongZ ? 0.45 : 1.8, 0.45, alongZ ? 1.8 : 0.45, 0x8a6040).block(x, z, alongZ ? 0.45 : 1.8, alongZ ? 1.8 : 0.45);
}

function decorarPaseo(k, z0, z1) {
  for (let z = z1 - 7; z > z0 + 4; z -= 14) {
    palmera(k, 0, z);
    banco(k, -1.8, z - 3.2, true); banco(k, 1.8, z - 3.2, true);
    farola(k, -5.6, z); farola(k, 5.6, z);
  }
}

function parqueInfantil(k, canvasTex) {
  const x0 = -22, x1 = -4, z0 = -146, z1 = -122;
  k.rug((x0 + x1) / 2, (z0 + z1) / 2, x1 - x0, z1 - z0, 0, 0x2a8a5a);
  k.rug((x0 + x1) / 2 + 3, (z0 + z1) / 2 + 3, 6, 6, 0, 0xd8271c);
  // la valla con la entrada por el sur
  for (const [ax, az, bx, bz] of [[x0, z0, x1, z0], [x0, z0, x0, z1], [x1, z0, x1, z1], [x0, z1, -15, z1], [-11, z1, x1, z1]]) {
    const cx = (ax + bx) / 2, cz = (az + bz) / 2, w = Math.abs(bx - ax) || 0.08, d = Math.abs(bz - az) || 0.08;
    k.box(cx, 0, cz, w, 0.9, d, 0xf2c41a).block(cx, cz, w, d);
  }
  // tobogán: escalera, plataforma y la rampa
  k.box(-17, 0, -128, 1.4, 1.6, 1.4, 0x2c4f86).block(-17, -128, 1.4, 1.4);
  k.box(-17, 1.6, -128, 1.6, 0.9, 1.6, 0xd8271c);
  const rampa = new THREE.BoxGeometry(0.9, 0.06, 3.2);
  rampa.rotateX(0.5); rampa.translate(-17, 0.85, -125.8);
  k.add(rampa, 0xf2c41a);
  // columpios
  for (const x of [-10, -7]) {
    k.cyl(x - 1.2, 0, -138, 0.06, 0.06, 2.4, 0xd8271c, { seg: 8 }).cyl(x + 1.2, 0, -138, 0.06, 0.06, 2.4, 0xd8271c, { seg: 8 });
    k.box(x, 2.4, -138, 2.6, 0.08, 0.08, 0xd8271c);
    k.box(x, 0.45, -138, 0.5, 0.05, 0.22, 0x1c1c1e).box(x - 0.2, 0.5, -138, 0.02, 1.9, 0.02, 0x8a8f96).box(x + 0.2, 0.5, -138, 0.02, 1.9, 0.02, 0x8a8f96);
    k.block(x, -138, 2.6, 0.5);
  }
  // la cúpula de cuerdas y la zona de arena
  for (let i = 0; i < 14; i++) { const a = i * Math.PI / 7; k.cyl(-16 + Math.cos(a) * 1.5, 0, -140 + Math.sin(a) * 1.5, 0.04, 0.04, 1.8, 0x18c5b8, { seg: 6 }); }
  k.ball(-16, 1.4, -140, 0.5, 0x18c5b8, { seg: 10 }).block(-16, -140, 3, 3);
  k.box(-8, 0, -128, 4, 0.25, 4, 0xe8d6a6).block(-8, -128, 4, 4);
  k.pic(-13, 2.0, z1 + 0.05, 3.6, 0.8, 0, 1, canvasTex(512, 114, poster({ bg: '#f2c41a', fg: '#c8102e', title: 'PARQUE INFANTIL' })), { glow: 0.3 });
  k.box(-13, 0, z1 + 0.05, 0.1, 1.6, 0.1, 0x2a2a2c);
}

function directorio(k, canvasTex, todos) {
  const tex = canvasTex(1024, 1400, (g, W, H) => {
    g.fillStyle = '#2a1a16'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#e8c46a'; g.textAlign = 'center'; g.textBaseline = 'middle';
    fit(g, 'OPEN MALL · DIRECTORIO', W / 2, 46, W - 60, 44, '800', SANS);
    const col = 3, per = Math.ceil(todos.length / col);
    g.textAlign = 'left';
    todos.forEach((t, i) => {
      const c = Math.floor(i / per), r = i % per;
      g.fillStyle = t.cat === 'rest' ? '#9fd6c2' : '#f4f1ea';
      fit(g, t.name, 30 + c * (W / col) + 60, 110 + r * ((H - 140) / per), W / col - 30, 26, '600', SANS);
    });
  });
  k.box(8.5, 0, 6, 0.3, 3.0, 2.2, 0x2a1a16).block(8.5, 6, 0.3, 2.2);
  k.pic(8.33, 1.6, 6, 2.0, 2.7, -1, 0, tex, { glow: 0.35 });
}

// ——— el local ———

export const OPEN_MALL = {
  id: 'openMall',
  name: 'Open Mall',
  glyph: 'O',
  color: GRANATE,
  ownFront: true,
  // en lo alto de los escalones de la torre de entrada (openMall.js: s 76, a 3,8 m de la fachada)
  door: { x: 251.8, z: -586.4, nx: -0.906, nz: -0.423 },
  light: { sun: 0xffffff, sunI: 1.7, hemiI: 1.1, sky: 0xdcefff, ground: 0x9a9286, exposure: 0.9 },
  build(k, { canvasTex }) {
    const { paseoA, paseoB, plaza } = reparto();
    const huecos = { aw: [], ae: [], bw: [], be: [], pw: [], pe: [], pn: [], ps: [] };

    // los locales: la sala, sus muebles y el hueco en la pared del pasillo
    const npcs = [], seats = [], carteles = [];
    let idx = 0;
    const local = (u, zona) => {
      const m = marcoLocal(u);
      const rest = u.cat === 'rest';
      k.room(u.x0, u.z0, u.x1, u.z1, {
        h: 4.2, floor: rest || u.cat === 'super' ? 'tile' : u.cat === 'saltos' ? 'cement' : 'wood', wall: PARED, ceil: 0xf6f4f0,
        open: { [u.front]: [[0.3, m.L - 0.3, 'hole']] },
      });
      const sitio = rest ? cocina(k, u) : amueblar(k, u);
      const s = sitioRotulo(u);
      carteles.push({ ...s, y: 3.35, name: u.name, bg: u.bg, fg: u.fg });
      // el hueco del escaparate en la pared del pasillo (o de la plaza)
      const a = zona === 'pw' || zona === 'pe' ? u.z0 - B_Z1 : zona === 'pn' || zona === 'ps' ? u.x0 + PX
        : zona[0] === 'a' ? u.z0 - A_Z0 : u.z0 - B_Z0;
      huecos[zona].push(...escaparate(a, m.L));
      // quien atiende
      if (rest || CON_GENTE.has(u.name)) {
        const [x, z] = m.P(sitio[0], sitio[1]);
        const d = dependiente(u, idx++, [x, z], m.cara);
        if (rest) { d.offer = undefined; d.pose = 'counter'; d.greet = () => pick(['¡Hola! Siéntate en una mesa y te lo llevo.', '¡Bienvenido! ¿Qué te apetece?']); }
        npcs.push(d);
      }
      // la mesa del restaurante, en la plaza delante de la barra
      if (rest) {
        const [tx, tz] = m.P(m.L / 2, -2.6);
        k.table(tx, tz, { w: 0.8, d: 0.8, top: 0xf2f2ee, leg: 0x2a2a2c });
        const o = pedido(u);
        for (const sgn of [-1, 1]) {
          const [cx, cz] = m.P(m.L / 2 + sgn * 0.62, -2.6);
          const face = Math.atan2(tx - cx, tz - cz);
          k.chair(cx, cz, face, new THREE.Color(u.bg).getHex() === 0xffffff ? 0x2a2a2c : new THREE.Color(u.bg).getHex());
          const [px, pz] = m.P(m.L / 2 + sgn * 0.24, -2.6);
          seats.push({ at: [cx, cz], face, plate: [px, 0.785, pz], order: o });
        }
      }
    };
    for (const u of paseoA) local(u, u.front === 'e' ? 'aw' : 'ae');
    for (const u of paseoB) local(u, u.front === 'e' ? 'bw' : 'be');
    for (const u of plaza) local(u, { e: 'pw', w: 'pe', s: 'pn', n: 'ps' }[u.front]);

    // el vestíbulo de la entrada
    k.room(-12, 0, 12, 12, {
      h: 7, floor: 'stone', wall: 0xece4d8, ceil: 0xf2eee8,
      open: { s: [[3, 10, 'glass'], [10.5, 13.5, 'door'], [14, 21, 'glass']], n: [[5, 19, 'arch']] },
    });
    k.pic(0, 5.4, 0.02, 7, 1.3, 0, 1, canvasTex(1024, 190, poster({ bg: '#6a3a2c', fg: '#f4ede4', title: 'OPEN MALL', sub: 'LANZAROTE' })), { glow: 0.3 });
    k.counter(-6, 6, 2.6, 0.7, 0, { front: GRANATE, top: 0xf2f2ee });
    npcs.push({
      name: 'Información', at: [-6, 5.3], face: 0, pose: 'counter', detail: 1, look: lookDe(1, GRANATE),
      greet: () => '¡Bienvenido al Open Mall!',
      talk: byVisit([
        (c) => [{ who: 'Información', text: 'Por este paseo, toda la moda. Al fondo, la plaza con el parque infantil y los restaurantes.' }, { who: c.me, text: '¿Y para comer?', player: true }, { who: 'Información', text: 'En la plaza: te sientas en la mesa del restaurante que quieras y te lo llevan.' }],
        (c) => [{ who: 'Información', text: 'Pasada la plaza, el segundo paseo: zapatos, deporte, móviles, ópticas... y al final el HiperDino.' }, { who: c.me, text: '¿Y las camas elásticas?', player: true }, { who: 'Información', text: 'Sould Park, en la plaza, a la izquierda.' }],
      ]),
    });
    for (const x of [-10, 10]) k.plant(x, 10.5, { h: 1.8, leaf: 0x3a7a3a });
    directorio(k, canvasTex, [...paseoA, ...plaza, ...paseoB, { name: 'HiperDino', cat: 'super' }]);

    // los dos paseos al aire libre (el techo es el cielo) y la plaza
    k.room(-7, A_Z0, 7, A_Z1, { h: 8, floor: SUELO_PASEO, wall: PARED, ceil: CIELO, lights: null, walls: 'ew', open: { w: huecos.aw, e: huecos.ae } });
    k.room(-7, B_Z0, 7, B_Z1, { h: 8, floor: SUELO_PASEO, wall: PARED, ceil: CIELO, lights: null, walls: 'ew', open: { w: huecos.bw, e: huecos.be } });
    k.room(-PX, B_Z1, PX, A_Z0, {
      h: 10, floor: 'stone', wall: PARED, ceil: CIELO, lights: null,
      open: { w: huecos.pw, e: huecos.pe, n: [...huecos.pn, [PX - 7, PX + 7, 'arch']], s: [...huecos.ps, [PX - 7, PX + 7, 'arch']] },
    });
    // el cielo: una lámina que brilla bajo el techo (el techo de la sala no lo ilumina el sol)
    for (const [x0, z0, x1, z1, h] of [[-7, A_Z0, 7, A_Z1, 8], [-7, B_Z0, 7, B_Z1, 8], [-PX, B_Z1, PX, A_Z0, 10]]) {
      k.box((x0 + x1) / 2, h - 0.08, (z0 + z1) / 2, x1 - x0, 0.04, z1 - z0, CIELO, { list: k.glow });
    }
    decorarPaseo(k, A_Z0, A_Z1);
    decorarPaseo(k, B_Z0, B_Z1);
    parqueInfantil(k, canvasTex);
    for (const [x, z] of [[8, -118], [24, -146], [-26, -118]]) palmera(k, x, z);
    for (const [x, z] of [[2, -126], [2, -140], [26, -132]]) farola(k, x, z);
    npcs.push({
      name: 'Vigilante', at: [0, -132], face: Math.PI, pose: 'host', detail: 1,
      look: { ...lookDe(3, 0x1c2a44), bottom: 0x1c2a44, topStyle: 'long', hairStyle: 'short' },
      greet: () => 'Buenas. Todo tranquilo por aquí.',
      talk: byVisit([(c) => [{ who: 'Vigilante', text: 'Los niños, en el parque; los mayores, de compras o comiendo. Y yo, vigilando.' }, { who: c.me, text: '¿Mucho lío los sábados?', player: true }, { who: 'Vigilante', text: '¡Uf! Esto se llena. Pero se pasa bien.' }]]),
    });
    // dos niños en el parque (sin conversación)
    for (const [x, z, f, alto] of [[-12, -134, 0.6, 1.15], [-19, -137, 2.1, 1.25]]) npcs.push({ name: '', at: [x, z], face: f, pose: 'stand', detail: 1, look: { ...lookDe(x < -15 ? 2 : 5, pick(COLORES_ROPA)), height: alto } });

    // el HiperDino al fondo del segundo paseo
    const hd = { name: 'HiperDino', cat: 'super', bg: '#d8271c', fg: '#ffffff', n: 1, x0: -14, x1: 14, z0: B_Z0 - 26, z1: B_Z0, front: 's' };
    k.room(hd.x0, hd.z0, hd.x1, hd.z1, { h: 5, floor: 'tile', wall: 0xf4f4f2, ceil: 0xf6f6f4, open: { s: [[7.3, 11.6, 'glass'], [12, 16, 'door'], [16.4, 20.7, 'glass']] } });
    const shd = amueblar(k, hd), mhd = marcoLocal(hd);
    npcs.push(dependiente(hd, idx++, mhd.P(shd[0], shd[1]), mhd.cara));
    carteles.push({ x: 0, z: B_Z0 + 0.04, nx: 0, nz: 1, w: 9, h: 1.4, y: 3.6, name: 'HiperDino', bg: '#d8271c', fg: '#ffffff' });

    rotulos(k, canvasTex, carteles);
    // al entrar saluda el de Información (el primero de la lista que saluda)
    npcs.unshift(...npcs.splice(npcs.findIndex(n => n.name === 'Información'), 1));
    return { spawn: [0, 9.5, Math.PI], exit: [0, 11.4], npcs, seats };
  },
};
