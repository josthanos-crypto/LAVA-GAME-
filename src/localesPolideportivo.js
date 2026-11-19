import { byVisit, pick, poster } from './localesCommon.js';

/**
 * El Parque Deportivo Municipal Puerto del Arrecife por dentro: el edificio de la piscina, enfrente del Open Mall, en la
 * rotonda de la Rambla Medular con León y Castillo. Se entra por la escalinata de la fachada de la rotonda a la
 * recepción; a la izquierda, la sala de musculación (que mira a la piscina por un ventanal); a la derecha, los
 * vestuarios; y de frente, la nave de la piscina cubierta de 25 m con seis calles, las gradas, el jacuzzi y la sauna
 * (lo que cuentan las reseñas de la instalación). La entrada de adulto, 6 € (5,87 € en la tarifa de 2018 que se
 * encuentra publicada, redondeado).
 *
 * Medidas (metros del interior, z hacia dentro negativo): recepción x −8…8, z 0…12; gimnasio x −24…−8; vestuarios
 * x 8…20; la nave de la piscina x −20…20, z −34…0, con el vaso de x −12,5…12,5, z −26…−13,5; la sauna x 20…26,
 * z −12…−4.
 */

const AZUL = 0x1f5f9a, BEIS = 0xe9e0cf, AGUA = 0x2f9fd0, BALDOSA = 0xf2f2ee;
const POOL = { x0: -12.5, x1: 12.5, z0: -26, z1: -13.5 };
const ENTRADA = 6;

const PIELES = [0xf0cfb0, 0xe2b896, 0xc89a72, 0x9a6a4a, 0xe8c4a2];
const PELOS = [0x1e1712, 0x3a2a1c, 0x6a4a2a, 0x101010];

function persona(i, top, extra = {}) {
  const f = i % 2 === 0;
  return {
    sex: f ? 'f' : 'm', skin: PIELES[i % PIELES.length], hair: PELOS[i % PELOS.length],
    hairStyle: f ? pick(['ponytail', 'bun']) : pick(['short', 'rapado']), beard: false,
    top, topStyle: 'tshirt', bottom: 0x1e2024, bottomStyle: 'shorts', shoes: 0xf4f4f2, shoeStyle: 'sneaker',
    height: f ? 1.66 : 1.8, ...extra,
  };
}

const nadar = (h) => { h.heal(); h.addMinutes(60); h.toast('Una hora en la piscina municipal · salud al 100%'); };
const entrenar = (h) => { h.heal(); h.addMinutes(60); h.toast('Una hora en la sala de musculación · salud al 100%'); };

// ——— las salas ———

function recepcion(k, canvasTex) {
  k.room(-8, 0, 8, 12, {
    h: 4, floor: 'stone', wall: BEIS, ceil: 0xf4f2ee,
    open: { s: [[2, 6.4, 'glass'], [6.6, 9.4, 'door'], [9.6, 14, 'glass']], n: [[5, 11, 'arch']], w: [[4, 6.4, 'door']], e: [[4, 6.4, 'door']] },
  });
  k.pic(0, 3.2, 0.02, 7.2, 1.1, 0, 1, canvasTex(1024, 156, poster({ bg: '#1f5f9a', fg: '#ffffff', title: 'PARQUE DEPORTIVO MUNICIPAL', sub: 'PUERTO DEL ARRECIFE' })), { glow: 0.3 });
  k.counter(0, 6, 3.4, 0.7, 0, { front: AZUL, top: 0xf2f2ee });
  k.block(0, 6, 3.4, 0.7);
  // los torniquetes de paso a la piscina
  for (const x of [-3.2, -1.6, 1.6, 3.2]) k.box(x, 0, 2.2, 0.25, 1, 0.9, 0xb8bcc0).block(x, 2.2, 0.25, 0.9);
  for (const x of [-2.4, 2.4]) k.box(x, 0.95, 2.2, 1.3, 0.04, 0.04, 0xc8ccd0);
  k.sofa(-6.4, 9.5, 2.2, Math.PI / 2, 0x3a4a5a);
  k.plant(6.8, 10.8, { h: 1.6 });
  k.plant(-6.8, 1.2, { h: 1.6 });
}

function gimnasio(k, canvasTex) {
  k.room(-24, 0, -8, 12, {
    h: 3.6, floor: 'dark', wall: 0xeeeeea, ceil: 0xf2f2f0,
    open: { e: [[4, 6.4, 'door']], n: [[6, 16, 'glass']], s: [[2, 7, 'window'], [9, 14, 'window']] },
  });
  // espejo de la pared del oeste
  k.box(-23.96, 0.3, 6, 0.04, 2.4, 10, 0xc6d4dc, { list: k.glow, dim: 0 });
  k.pic(-16, 3.0, 11.97, 4.6, 0.7, 0, -1, canvasTex(512, 78, poster({ bg: '#1c1c1e', fg: '#ffffff', title: 'SALA DE MUSCULACIÓN' })));
  // cintas de correr mirando a la piscina
  for (const x of [-21, -18.6, -16.2, -13.8, -11.4]) {
    k.box(x, 0, 2.3, 0.8, 0.22, 1.9, 0x2a2c30).box(x, 0.22, 2.3, 0.6, 0.02, 1.6, 0x1a1a1c);
    for (const s of [-1, 1]) k.box(x + s * 0.36, 0.22, 1.5, 0.05, 1.1, 0.05, 0x8a8e92);
    k.box(x, 1.25, 1.42, 0.7, 0.3, 0.12, 0x2a2c30);
    k.block(x, 2.3, 0.85, 1.95);
  }
  // bicicletas
  for (const x of [-21, -19, -17]) {
    k.box(x, 0, 5.4, 0.5, 0.08, 1.1, 0x2a2c30).box(x, 0.08, 5.6, 0.12, 0.8, 0.12, 0x8a8e92).box(x, 0.88, 5.7, 0.3, 0.08, 0.35, 0x1a1a1c);
    k.box(x, 0.08, 5.05, 0.1, 1.05, 0.1, 0x8a8e92).box(x, 1.1, 5.0, 0.5, 0.06, 0.08, 0x2a2c30);
    k.block(x, 5.4, 0.6, 1.2);
  }
  // bancos con barra y discos, y el estante de las mancuernas
  for (const [x, z] of [[-14, 6], [-11, 6], [-14, 9.6]]) {
    k.box(x, 0, z, 0.35, 0.45, 1.3, 0x1c1c1e);
    for (const s of [-1, 1]) k.box(x + s * 0.6, 0, z - 0.45, 0.06, 1.2, 0.06, 0x8a8e92);
    k.cyl(x, 1.12, z - 0.45, 0.018, 0.018, 1.8, 0xb8bcc0, { seg: 6, rx: Math.PI / 2, ry: Math.PI / 2 });
    for (const s of [-1, 1]) k.cyl(x + s * 0.75, 1.12, z - 0.45, 0.22, 0.22, 0.05, 0x1c1c1e, { seg: 12, rx: Math.PI / 2, ry: Math.PI / 2 });
    k.block(x, z - 0.2, 1.6, 1.6);
  }
  k.box(-20, 0, 11.4, 4, 0.8, 0.5, 0x2a2c30);
  for (let i = 0; i < 10; i++) {
    const x = -21.8 + i * 0.4;
    for (const s of [-1, 1]) k.cyl(x, 0.85, 11.4 + s * 0.12, 0.06, 0.06, 0.08, 0x1c1c1e, { seg: 8, rx: Math.PI / 2 });
  }
  k.block(-20, 11.4, 4, 0.5);
  k.rug(-20, 9, 3, 2, 0, 0x3a6a8a);
}

function vestuarios(k) {
  k.room(8, 0, 20, 12, {
    h: 3.2, floor: 'tile', wall: 0xdfe6ea, ceil: 0xf4f6f6,
    open: { w: [[4, 6.4, 'door']], n: [[8, 10.4, 'door']] },
  });
  // taquillas en las paredes este y sur, y los bancos
  for (let i = 0; i < 10; i++) {
    const z = 1.2 + i * 0.6;
    k.box(19.7, 0, z, 0.55, 1.9, 0.56, i % 2 ? 0x2f7fb8 : 0x3a8fc8);
  }
  k.block(19.7, 3.9, 0.6, 6);
  for (let i = 0; i < 12; i++) k.box(10.3 + i * 0.7, 0, 11.7, 0.66, 1.9, 0.55, i % 2 ? 0x2f7fb8 : 0x3a8fc8);
  k.block(14.2, 11.7, 8.4, 0.6);
  for (const z of [4, 8]) { k.box(14, 0.42, z, 4, 0.06, 0.4, 0xb08a5a); for (const x of [12.3, 15.7]) k.box(x, 0, z, 0.08, 0.42, 0.3, 0x8a8e92); k.block(14, z, 4, 0.4); }
}

function vaso(k) {
  const { x0, x1, z0, z1 } = POOL;
  const w = x1 - x0, d = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  k.box(cx, 0, cz, w, 0.03, d, AGUA, { list: k.shell });
  // el borde de piedra blanca y la rejilla
  for (const [x, z, bw, bd] of [[cx, z0 - 0.3, w + 1.2, 0.6], [cx, z1 + 0.3, w + 1.2, 0.6], [x0 - 0.3, cz, 0.6, d], [x1 + 0.3, cz, 0.6, d]]) {
    k.box(x, 0, z, bw, 0.06, bd, BALDOSA, { list: k.shell });
  }
  for (const [ax, az, bx, bz] of [[x0, z0, x1, z0], [x1, z0, x1, z1], [x1, z1, x0, z1], [x0, z1, x0, z0]]) k.seg(ax, az, bx, bz);
  // las seis calles: corcheras rojas y blancas, y las líneas del fondo
  for (let i = 1; i < 6; i++) {
    const z = z0 + (d * i) / 6;
    k.box(cx, 0.03, z, w, 0.06, 0.09, i % 2 ? 0xd8271c : 0xf4f4f2);
    k.box(cx, 0.031, z - d / 12, w - 4, 0.002, 0.25, 0x1a3a6a, { list: k.shell });
  }
  k.box(cx, 0.031, z1 - d / 12, w - 4, 0.002, 0.25, 0x1a3a6a, { list: k.shell });
  // los poyetes de salida y las escalerillas
  for (let i = 0; i < 6; i++) {
    const z = z0 + d * (i + 0.5) / 6;
    k.box(x0 - 0.45, 0, z, 0.55, 0.7, 0.5, 0xf4f4f2).box(x0 - 0.35, 0.7, z, 0.6, 0.05, 0.55, 0x2f7fb8);
    k.block(x0 - 0.45, z, 0.55, 0.5);
  }
  for (const x of [x1 - 2, x0 + 2]) for (const s of [-0.3, 0.3]) {
    k.cyl(x + s, 0, z1 + 0.25, 0.025, 0.025, 1.0, 0xc8ccd0, { seg: 6 });
  }
  // la silla alta del socorrista
  for (const [dx, dz] of [[-0.35, -0.3], [0.35, -0.3], [-0.35, 0.3], [0.35, 0.3]]) k.box(x1 + 1.6 + dx, 0, z1 + 1.2 + dz, 0.06, 1.6, 0.06, 0xf4f4f2);
  k.box(x1 + 1.6, 1.6, z1 + 1.2, 0.8, 0.08, 0.7, 0xd8271c).box(x1 + 1.6, 1.68, z1 + 1.52, 0.8, 0.6, 0.06, 0xd8271c);
  k.block(x1 + 1.6, z1 + 1.2, 0.8, 0.7);
}

function nave(k, canvasTex) {
  const ventanas = [];
  for (let a = 2; a < 38; a += 4) ventanas.push([a, a + 3, 'window']);
  k.room(-20, -34, 20, 0, {
    h: 8, floor: 'tile', wall: 0xeef2f2, ceil: 0xe8ecee,
    open: { s: [[2, 12, 'glass'], [17, 23, 'arch'], [36, 38.4, 'door']], n: ventanas, e: [[24, 26, 'door']] },
  });
  vaso(k);
  // las gradas, contra la pared del sur, a los dos lados del paso de la recepción
  for (const cx of [-9, 9]) {
    for (let i = 0; i < 3; i++) k.box(cx, 0, -1.1 - i * 0.7, 10, 0.4 * (3 - i), 0.7, i % 2 ? 0xcfd6da : 0xbfc8cc);
    k.block(cx, -1.8, 10, 2.1);
  }
  k.pic(0, 6.4, -33.97, 9, 1.3, 0, 1, canvasTex(1024, 148, poster({ bg: '#ffffff', fg: '#1f5f9a', title: 'PISCINA MUNICIPAL', sub: 'ARRECIFE' })), { glow: 0.2 });
  // el reloj de nadar
  k.cyl(-17, 4.6, -33.9, 0.6, 0.6, 0.08, 0x1c1c1e, { seg: 20, rx: Math.PI / 2 });
  k.cyl(-17, 4.6, -33.84, 0.52, 0.52, 0.02, 0xf4f4f2, { seg: 20, rx: Math.PI / 2, list: k.glow });
  // el jacuzzi, en la esquina de la sauna
  k.cyl(15.5, 0, -6.5, 1.75, 1.75, 0.5, BALDOSA, { seg: 20 });
  k.cyl(15.5, 0.5, -6.5, 1.5, 1.5, 0.02, 0x6ad0e0, { seg: 20, list: k.glow });
  k.block(15.5, -6.5, 3.4, 3.4);
  for (const [x, z] of [[-18, -30], [18, -30]]) k.plant(x, z, { h: 1.8, leaf: 0x3a7a3a });
}

function sauna(k) {
  k.room(20, -12, 26, -4, {
    h: 2.6, floor: 'wood', wall: 0xb07a44, ceil: 0xa06a38, base: 0x7a4a24, lights: null,
    open: { w: [[2, 4, 'door']] },
  });
  k.box(23, 2.45, -8, 0.5, 0.05, 0.5, 0xffc880, { list: k.glow });
  // los bancos de madera en dos alturas
  for (const [y, x] of [[0.45, 25.2], [0.9, 25.6]]) k.box(x, y, -8, 0.8, 0.06, 7.6, 0xc89058);
  k.box(25.4, 0, -8, 1.2, 0.45, 7.6, 0x9a6a3a);
  k.block(25.4, -8, 1.2, 7.6);
  // la estufa con sus piedras
  k.box(21, 0, -11, 0.7, 0.8, 0.7, 0x3a3a3c);
  for (let i = 0; i < 6; i++) k.ball(20.8 + (i % 3) * 0.2, 0.86, -11.15 + Math.floor(i / 3) * 0.3, 0.12, 0x6a6a6a);
  k.block(21, -11, 0.8, 0.8);
  k.cyl(22.2, 0, -11.2, 0.2, 0.17, 0.3, 0x9a6a3a, { seg: 10 });
}

// ——— la gente ———

function gente() {
  return [
    {
      name: 'Recepción', at: [0, 5.3], face: 0, pose: 'counter', detail: 1, look: persona(2, AZUL, { bottomStyle: 'pants' }),
      greet: () => '¡Buenas! Bienvenido al Parque Deportivo.',
      talk: byVisit([
        (c) => [{ who: 'Recepción', text: 'De frente, la piscina cubierta. A la izquierda, la sala de musculación; a la derecha, los vestuarios.' }, { who: c.me, text: '¿Y la sauna?', player: true }, { who: 'Recepción', text: 'Al fondo de la piscina, junto al jacuzzi. Las taquillas, con tu candado.' }],
        (c) => [{ who: 'Recepción', text: 'Fuera tienes el campo de fútbol y las pistas de pádel.' }, { who: c.me, text: '¿A qué hora abrís?', player: true }, { who: 'Recepción', text: 'Entre semana, a las siete de la mañana.' }],
      ]),
      offer: {
        label: 'Entrada a la piscina', price: ENTRADA, apply: nadar,
        talk: (c) => [{ who: c.me, text: 'Una entrada para la piscina.', player: true }, { who: 'Recepción', text: c.paid ? 'Aquí tienes. Gorro obligatorio, ¿eh?' : 'Hoy pasa, invita la casa.' }],
      },
    },
    {
      name: 'Monitor', at: [-15.5, 8.2], face: Math.PI / 2, pose: 'stand', detail: 1, look: persona(1, 0x1c1c1e),
      greet: () => '¿Vienes a entrenar?',
      talk: byVisit([
        (c) => [{ who: 'Monitor', text: 'Calienta diez minutos en la cinta y luego vamos con las pesas.' }, { who: c.me, text: '¿Cuánto levanto?', player: true }, { who: 'Monitor', text: 'Lo que puedas con buena postura. Sin prisas.' }],
        (c) => [{ who: 'Monitor', text: 'Después de entrenar, un rato de jacuzzi y como nuevo.' }, { who: c.me, text: 'Eso me lo apunto.', player: true }, { who: 'Monitor', text: '¡Así me gusta!' }],
      ]),
      offer: {
        label: 'Entrenar una hora', price: ENTRADA, apply: entrenar,
        talk: (c) => [{ who: c.me, text: 'Quiero entrenar un rato.', player: true }, { who: 'Monitor', text: c.paid ? '¡Vamos allá! Primero, a calentar.' : 'Hoy te invito yo. ¡Vamos!' }],
      },
    },
    {
      name: 'Socorrista', at: [POOL.x1 + 1.2, POOL.z1 + 2.4], face: Math.PI, pose: 'stand', detail: 1,
      look: persona(3, 0xd8271c, { bottom: 0xf4c542 }),
      greet: () => 'Por el borde, sin correr.',
      talk: byVisit([
        (c) => [{ who: 'Socorrista', text: 'Calle uno y dos, nado libre. Las otras, cursillos.' }, { who: c.me, text: '¿Cuánto cubre?', player: true }, { who: 'Socorrista', text: 'Lo suficiente para no hacer el burro. Ducha antes de entrar.' }],
      ]),
    },
    { name: '', at: [-16.2, 2.3], face: Math.PI, pose: 'stand', detail: 1, look: persona(4, 0xc87a9a) },
    { name: '', at: [-11.6, 6.3], face: -Math.PI / 2, pose: 'stand', detail: 1, look: persona(5, 0x5a8a5a) },
    { name: '', at: [-6, -9], face: Math.PI, pose: 'stand', detail: 1, look: persona(6, 0x2c4f86, { bottomStyle: 'shorts' }) },
  ];
}

// ——— el local ———

export const POLIDEPORTIVO = {
  id: 'polideportivo',
  name: 'Parque Deportivo',
  glyph: 'P',
  color: AZUL,
  // la escalinata de la fachada de la rotonda de la Rambla (vistas de la calle), a 45 m de la esquina sur
  door: { x: 259.9, z: -724.5, nx: 0.444, nz: 0.896 },
  doorWidth: 2.4,
  frameColor: 0x8a8e92,
  sign: { size: [7.2, 1.1], y: 3.9, edge: 0x1f5f9a, px: [1024, 156], draw: poster({ bg: '#1f5f9a', fg: '#ffffff', title: 'PARQUE DEPORTIVO MUNICIPAL', sub: 'PUERTO DEL ARRECIFE' }) },
  light: { sun: 0xffffff, sunI: 1.5, hemiI: 1.1, sky: 0xe4f0f8, ground: 0x9aa2a6, exposure: 0.95 },
  build(k, { canvasTex }) {
    recepcion(k, canvasTex);
    gimnasio(k, canvasTex);
    vestuarios(k);
    nave(k, canvasTex);
    sauna(k);
    return { spawn: [0, 9.5, Math.PI], exit: [0, 11.4], npcs: gente(), seats: [] };
  },
};
