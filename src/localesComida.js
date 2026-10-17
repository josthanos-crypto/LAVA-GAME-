import { byVisit, pick, fit, SERIF, SANS, chalkboard, poster, chefHat, apron } from './localesCommon.js';

/**
 * Los locales de comer: El Nuevo Maccheroni (Manolo Millares 103: Andrea en
 * la sala y Elvis en la cocina, pasta fresca rellena), el Sakura (Fenauso 55:
 * buffet libre, wok y sushi; Willy) y La Cervecería del Reducto por dentro.
 * Los platos son los de sus cartas publicadas (sin precios, que cambian).
 */

const eat = (where, mins = 45) => (h) => { h.heal(); h.addMinutes(mins); h.toast(`Comida en ${where} · salud al 100%`); };

// ── El Nuevo Maccheroni ──
function maccheroniSign(g, W, H) {
  g.fillStyle = '#f6efe0'; g.fillRect(0, 0, W, H);
  // la bandera italiana a la izquierda
  ['#159447', '#f6efe0', '#cf2a2a'].forEach((c, i) => { g.fillStyle = c; g.fillRect(24 + i * 34, 22, 34, H - 44); });
  g.strokeStyle = '#2a2a2a'; g.lineWidth = 3; g.strokeRect(24, 22, 102, H - 44);
  g.fillStyle = '#7a1f1f'; g.textAlign = 'center'; g.textBaseline = 'middle';
  fit(g, 'El Nuevo Maccheroni', W / 2 + 60, H * 0.42, W - 220, H * 0.44, '700', SERIF, 'italic');
  g.fillStyle = '#159447';
  fit(g, 'PASTA FRESCA · PIZZA · CUCINA ITALIANA', W / 2 + 60, H * 0.78, W - 260, H * 0.15, '800', SANS);
}

const MENU = chalkboard('Pasta fresca fatta in casa', [
  '#PASTA',
  'Raviolis de carne · de ricotta y espinacas',
  'Raviolis de dátiles con bacon',
  'Raviolis negros de salmón o de marisco',
  'Tagliatelle al pesto · con nata, gambas, champiñones y jamón',
  'Spaghetti boloñesa · carbonara · lasaña de carne',
  '#PIZZAS',
  'Margherita · Prosciutto · Napoletana · Diavola',
  'Quattro formaggi · De la casa · Pizza Elvis',
  '#PARA EMPEZAR',
  'Focaccias · Carpaccio · Tartar de solomillo · Provolone',
  '#DOLCI',
  'Tiramisú · Tarta de queso · Tres leches',
]);

export const MACCHERONI = {
  id: 'maccheroni',
  name: 'El Nuevo Maccheroni',
  glyph: 'M',
  color: 0xd8271c,
  door: { sign: 'El Nuovo Maccheroni' },
  sign: { size: [4.8, 1.0], y: 3.0, px: [1024, 214], draw: maccheroniSign, edge: 0x3a2a1c },
  light: { sun: 0xffe2c0, exposure: 0.8, sky: 0xfff0dc },
  build(k, { canvasTex }) {
    const H = 3.2;
    k.room(-5, -7, 5, 7, {
      h: H, floor: 'wood', wall: 0xf3e6cf, ceil: 0xf8f4ec, lights: null,
      open: { s: [[-4.4, -1.7, 'window'], [-0.9, 0.9, 'door'], [1.7, 4.4, 'window']], w: [[4.5, 9.5, 'window']] },
    });
    // pared del fondo de ladrillo visto (detrás de la cocina)
    k.box(0, 0, -6.97, 10, H, 0.03, 0x9a4a2e, { list: k.shell, dim: 0.2 });
    // cocina abierta: el pase, los fogones, la campana, la nevera y la mesa de la pasta
    k.counter(0.4, -4.45, 7.6, 0.7, 0, { front: 0x6a4a36, top: 0xe8e2d8 });
    const steel = 0xa8aeb4;
    k.box(1.0, 0, -6.5, 2.6, 0.9, 0.8, steel);
    for (const [x, z] of [[0.35, -6.3], [0.95, -6.3], [1.6, -6.3], [0.35, -6.75], [1.6, -6.75]]) k.cyl(x, 0.9, z, 0.13, 0.13, 0.02, 0x1c1c1e, { seg: 14 });
    k.cyl(0.35, 0.92, -6.3, 0.16, 0.15, 0.24, 0xc8ccd0, { seg: 16 });   // olla de la salsa
    k.cyl(1.6, 0.92, -6.75, 0.2, 0.2, 0.3, 0xc8ccd0, { seg: 16 });     // la de la pasta
    k.cyl(0.95, 0.92, -6.3, 0.17, 0.12, 0.06, 0x2a2a2a, { seg: 16 });  // sartén
    k.box(1.0, 2.15, -6.55, 2.8, 0.55, 0.9, steel);
    k.box(3.9, 0, -6.55, 0.95, 2.05, 0.75, 0xd8dcdf);
    k.box(-1.9, 0, -6.55, 2.4, 0.9, 0.7, steel);
    k.ball(-2.4, 0.98, -6.5, 0.16, 0xf0e2b0, { sy: 0.55 });              // masa
    k.box(-1.6, 0.9, -6.55, 0.38, 0.22, 0.3, 0xc8ccd0);                  // máquina de la pasta
    // tendedero de pasta fresca
    k.box(-2.0, 0.9, -6.75, 0.04, 0.75, 0.04, 0x8a6040).box(-1.2, 0.9, -6.75, 0.04, 0.75, 0.04, 0x8a6040).box(-1.6, 1.62, -6.75, 0.85, 0.04, 0.04, 0x8a6040);
    for (let i = 0; i < 9; i++) k.box(-1.95 + i * 0.09, 1.3, -6.75, 0.012, 0.32, 0.012, 0xf2d27a);
    k.block(1.0, -6.0, 6.2, 1.6);
    // estantería con tarros y botellas de vino
    k.shelf(-4.78, -5.6, 1.8, Math.PI / 2, {
      h: 2.2, d: 0.35, hex: 0x6a4a30, rows: 5,
      items: (kk, x, y, z, w, ry, row) => {
        for (let i = 0; i < 6; i++) {
          const zz = z - w / 2 + 0.12 + i * (w - 0.24) / 5;
          if (row % 2) kk.cyl(x, y, zz, 0.035, 0.035, 0.3, [0x3a1418, 0x2f4a1a, 0x5a1a22][i % 3], { seg: 8 });
          else kk.cyl(x, y, zz, 0.06, 0.06, 0.16, [0xd84a2a, 0xe8c040, 0x5a8a3a][i % 3], { seg: 10 });
        }
      },
    });
    // el cartel del pase y la pizarra con la carta
    const pasta = canvasTex(1024, 160, poster({ bg: '#1c1c1e', fg: '#f6d36b', title: 'PASTA FRESCA · HECHA EN CASA', sub: 'Cucina italiana · Arrecife' }));
    k.box(0.4, 2.3, -4.45, 3.3, 0.55, 0.06, 0x1c1c1e).pic(0.4, 2.575, -4.41, 3.2, 0.5, 0, 1, pasta, { glow: 0.5 });
    k.pic(4.97, 1.8, 0.2, 2.6, 1.9, -1, 0, canvasTex(768, 560, MENU));
    // la franja tricolor sobre la puerta
    k.pic(0, 2.75, 6.97, 2.4, 0.18, 0, -1, canvasTex(96, 8, (g) => { ['#159447', '#ffffff', '#cf2a2a'].forEach((c, i) => { g.fillStyle = c; g.fillRect(i * 32, 0, 32, 8); }); }));
    // mesas con mantel blanco, lámparas encima y platos
    const tables = [[-3.3, -2.4], [-1.2, -2.4], [1.2, -2.4], [3.3, -2.4], [-1.2, 0.4], [1.2, 0.4], [3.3, 0.4], [-3.3, 0.4], [1.2, 3.2], [3.3, 3.2], [-1.2, 3.2]];
    for (const [x, z] of tables) {
      k.table(x, z, { w: 0.85, d: 0.85, top: 0xf6f2ea, cloth: 0xf6f2ea });
      k.chair(x - 0.62, z, Math.PI / 2, 0x6a4a30).chair(x + 0.62, z, -Math.PI / 2, 0x6a4a30);
      k.pendant(x, z, H, { drop: 1.0, shade: 0x2a2a2a });
      k.cyl(x - 0.2, 0.77, z, 0.13, 0.13, 0.012, 0xffffff, { seg: 16 }).cyl(x + 0.2, 0.77, z, 0.13, 0.13, 0.012, 0xffffff, { seg: 16 });
      k.cyl(x, 0.77, z + 0.22, 0.03, 0.025, 0.22, 0x2f4a1a, { seg: 8 });
    }
    // atril de la entrada y plantas
    k.box(-2.0, 0, 5.35, 0.5, 1.1, 0.42, 0x5a3a22).box(-2.0, 1.1, 5.35, 0.56, 0.04, 0.48, 0x3a2416).block(-2.0, 5.35, 0.5, 0.42);
    k.plant(-4.4, 6.3, { h: 1.6 }).plant(4.4, 6.3, { h: 1.6 }).plant(4.4, -3.9, { h: 1.4 });
    return {
      spawn: [0, 4.9, Math.PI], exit: [0, 6.6],
      npcs: [
        {
          name: 'Andrea', at: [-2.7, 5.2], face: 0, pose: 'host',
          look: { sex: 'm', skin: 0xe2b896, hair: 0x2a1d14, hairStyle: 'short', beard: true, top: 0x1c1c1e, topStyle: 'long', bottom: 0x2e3844, bottomStyle: 'pants', shoes: 0x5a3a22, shoeStyle: 'shoe', eyes: 0x3a2616, height: 1.8 },
          greet: () => pick(['¡Buonasera! Benvenuto a El Nuevo Maccheroni. Pasa, pasa.', '¡Ciao! Pasa, que hoy la pasta está de escándalo.', '¡Benvenuto! Siéntate donde quieras.']),
          talk: byVisit([
            (c) => [
              { who: 'Andrea', text: 'Aquí la pasta es fresca, hecha en casa todos los días. Nuestra especialidad es la pasta rellena.' },
              { who: c.me, text: '¿Y qué me recomiendas?', player: true },
              { who: 'Andrea', text: 'Los raviolis de dátiles con bacon, o los negros de salmón. Y si vienes con hambre, tagliatelle con nata, gambas, champiñones y jamón.' },
            ],
            (c) => [
              { who: 'Andrea', text: '¿Pizza? Margherita, Prosciutto, Napoletana, Diavola, cuatro quesos... y la Pizza Elvis, con gambas y huevo. ¡La del jefe!' },
              { who: c.me, text: '¿La Pizza Elvis? Esa la tengo que probar.', player: true },
              { who: 'Andrea', text: 'Pregúntale a él, que está en la cocina. Va al mercado cada mañana a por el género.' },
            ],
            (c) => [
              { who: 'Andrea', text: 'Para empezar, una focaccia de ajo y tomate, o el carpaccio de solomillo con rúcula y parmigiano.' },
              { who: c.me, text: '¿Y de postre?', player: true },
              { who: 'Andrea', text: 'Tiramisú de la casa o tarta de queso. Questo è amore!' },
            ],
          ]),
          offer: {
            label: 'Pedir unos raviolis de la casa', price: 13,
            talk: (c) => [
              { who: c.me, text: 'Ponme unos raviolis de dátiles con bacon, que me has convencido.', player: true },
              { who: 'Andrea', text: c.paid ? '¡Perfetto! Siéntate, que salen enseguida. Buon appetito!' : 'Hoy invita la casa. ¡Buon appetito!' },
            ],
            apply: eat('El Nuevo Maccheroni'),
          },
        },
        {
          name: 'Elvis', at: [1.0, -5.75], face: Math.PI, pose: 'chef',
          look: { sex: 'm', skin: 0xd9a882, hair: 0x1e1712, hairStyle: 'short', beard: false, top: 0xf6f6f2, topStyle: 'long', bottom: 0x2a2a2c, bottomStyle: 'pants', shoes: 0x1e1e20, shoeStyle: 'shoe', eyes: 0x2a1a10, height: 1.76, build: 1.05 },
          dress: (p) => { chefHat(p); apron(p, 0xf2f2f2); },
          talk: byVisit([
            (c) => [
              { who: 'Elvis', text: '¡Eh, buenas! Aquí estoy, con la salsa al fuego. Cada mañana voy al mercado a por el género.' },
              { who: c.me, text: 'Huele de maravilla.', player: true },
              { who: 'Elvis', text: 'Es la boloñesa, despacito y con cariño. Y la carbonara, como tiene que ser.' },
            ],
            (c) => [
              { who: 'Elvis', text: 'La pasta la hacemos aquí mismo. Raviolis de carne, de ricotta y espinacas, negros de marisco...' },
              { who: c.me, text: '¿Y qué me aconsejas?', player: true },
              { who: 'Elvis', text: 'Prueba la lasaña de carne, gratinada al horno. Y la pizza que lleva mi nombre, ¡claro!' },
            ],
            (c) => [
              { who: 'Elvis', text: 'Si te va la carne, prueba el solomillo de Angus de la casa, o el tartar de solomillo con aguacate.' },
              { who: c.me, text: 'Ños, qué hambre me está entrando.', player: true },
              { who: 'Elvis', text: '¡Pues siéntate, que te lo preparo!' },
            ],
          ]),
          offer: {
            label: 'Pedir la Pizza Elvis', price: 15,
            talk: (c) => [
              { who: c.me, text: 'Elvis, ¡una Pizza Elvis!', player: true },
              { who: 'Elvis', text: c.paid ? '¡Marchando! Tomate, mozzarella, jamón, champiñones, gambas y huevo. Al horno ya.' : 'Esta te la regalo yo. ¡Ya me dirás qué tal!' },
            ],
            apply: eat('El Nuevo Maccheroni'),
          },
        },
        { name: '', at: [-1.82, 0.4], face: Math.PI / 2, pose: 'sit', detail: 1, look: { sex: 'f', skin: 0xe8c4a2, hair: 0x5a4028, hairStyle: 'long', top: 0xd88a9a, topStyle: 'tshirt', bottom: 0x34465c, bottomStyle: 'pants', shoes: 0xf2f2f2, height: 1.64 } },
        { name: '', at: [-0.58, 0.4], face: -Math.PI / 2, pose: 'sit', detail: 1, look: { sex: 'm', skin: 0xd9a882, hair: 0x1e1712, hairStyle: 'short', top: 0x3a5f8a, topStyle: 'tshirt', bottom: 0x2c3440, bottomStyle: 'pants', shoes: 0x1e1e20, height: 1.78 } },
        { name: '', at: [2.68, -2.4], face: Math.PI / 2, pose: 'sit', detail: 1, look: { sex: 'm', old: true, skin: 0xe8c4a2, hair: 0xc8c8c4, hairStyle: 'calvo', top: 0xe8e4da, topStyle: 'long', bottom: 0x6b5844, bottomStyle: 'pants', shoes: 0x6a4a30, height: 1.72 } },
        { name: '', at: [3.92, -2.4], face: -Math.PI / 2, pose: 'sit', detail: 1, look: { sex: 'f', old: true, skin: 0xf1d3b8, hair: 0xe2e0da, hairStyle: 'short', top: 0x2c4f86, topStyle: 'long', bottom: 0x1c1c1e, bottomStyle: 'skirt', shoes: 0x1e1e20, height: 1.6 } },
      ],
    };
  },
};

// ── Sakura ──
function sakuraSign(g, W, H) {
  g.fillStyle = '#121214'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#c8102e'; g.beginPath(); g.arc(H * 0.62, H / 2, H * 0.36, 0, Math.PI * 2); g.fill();
  // ramita de cerezo en flor
  g.strokeStyle = '#3a2418'; g.lineWidth = 6;
  g.beginPath(); g.moveTo(10, H * 0.15); g.bezierCurveTo(H * 0.5, H * 0.3, H * 0.8, H * 0.1, H * 1.25, H * 0.32); g.stroke();
  for (let i = 0; i < 14; i++) {
    const t = i / 13, x = 10 + t * H * 1.2, y = H * 0.15 + Math.sin(t * 3) * H * 0.08;
    g.fillStyle = i % 3 ? '#f6b6c8' : '#ffffff';
    g.beginPath(); g.arc(x + Math.sin(i * 7) * 12, y + Math.cos(i * 5) * 10, 9, 0, Math.PI * 2); g.fill();
  }
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = '#ffffff';
  fit(g, 'SAKURA', W / 2 + H * 0.45, H * 0.42, W - H * 1.6, H * 0.5, '800', SANS);
  g.fillStyle = '#f6b6c8';
  fit(g, 'BUFFET LIBRE · WOK · SUSHI', W / 2 + H * 0.45, H * 0.8, W - H * 1.7, H * 0.15, '700', SANS);
}

export const SAKURA = {
  id: 'sakura',
  name: 'Sakura',
  glyph: 'S',
  color: 0xe0405a,
  // calle Fenauso 55, detrás de Las Buganvillas: se entra desde Manolo Millares (sentido
  // único) y está al final, en la esquina de la izquierda, la de la calle Aniagua
  door: { x: -708.27, z: 282.79, nx: 0.996, nz: -0.091 },
  sign: { size: [4.4, 1.0], y: 3.0, px: [1024, 232], draw: sakuraSign, edge: 0x121214 },
  light: { sun: 0xffe2c8, exposure: 0.8, sky: 0xfff0e0, ground: 0x6a4a3a },
  build(k, { canvasTex }) {
    const H = 3.2;
    k.room(-5.5, -7, 5.5, 7, {
      h: H, floor: 'dark', wall: 0xf1e6d6, ceil: 0xc8a882, lights: null,
      open: { s: [[-4.8, -1.8, 'window'], [-0.9, 0.9, 'door'], [1.8, 4.8, 'window']] },
    });
    // focos redondos en el techo de madera clara
    for (let i = -2; i <= 2; i++) for (let j = -3; j <= 3; j++) k.cyl(i * 2.1, H - 0.02, j * 1.9, 0.09, 0.09, 0.02, 0xfff0d8, { list: k.glow, seg: 12 });
    // zócalo rojo laca
    for (const [x, z, w, d] of [[0, -6.97, 11, 0.03], [-5.47, 0, 0.03, 14], [5.47, 0, 0.03, 14]]) k.box(x, 0, z, w, 1.0, d, 0x7a1414, { list: k.shell });
    // isla del buffet con sus bandejas y la mampara
    k.counter(0, -0.6, 4.6, 1.3, 0, { front: 0x2a1a14, top: 0x9aa0a6, h: 0.92 });
    const food = [0xf2f0ea, 0xe8a040, 0xd84a2a, 0x7ac043, 0xf2d06a, 0xc8642a, 0xf6b6c8, 0x5a3a22];
    for (let i = 0; i < 8; i++) for (const z of [-0.95, -0.25]) {
      k.box(-1.95 + i * 0.56, 0.92, z, 0.48, 0.05, 0.5, 0xc8ccd0);
      k.box(-1.95 + i * 0.56, 0.97, z, 0.42, 0.04, 0.42, food[(i + (z > -0.5 ? 3 : 0)) % food.length]);
    }
    k.pane(-2.3, -0.6, 1, 0, 0, 1, 0, 4.6, 1.25, 1.6, false);
    // el wok del fondo
    k.box(0, 0, -6.55, 4.2, 0.9, 0.8, 0xa8aeb4).box(0, 1.95, -6.55, 4.4, 0.45, 0.9, 0xa8aeb4);
    for (const x of [-1.2, 0, 1.2]) k.ball(x, 0.98, -6.5, 0.25, 0x1c1c1e, { sy: 0.35 });
    k.block(0, -6.55, 4.2, 0.8);
    // mesas redondas con sillas negras
    const tables = [[-3.6, -3.6], [3.6, -3.6], [-3.6, -0.6], [3.6, -0.6], [-3.6, 2.6], [3.6, 2.6], [-1.5, 3.6], [1.5, 3.6]];
    for (const [x, z] of tables) {
      k.table(x, z, { w: 1.1, round: true, top: 0x4a1a14, leg: 0x1c1c1e });
      k.cyl(x, 0.765, z, 0.32, 0.32, 0.02, 0x3a2a20, { seg: 18 });  // plato giratorio
      for (let a = 0; a < 4; a++) {
        const ang = a * Math.PI / 2 + 0.4;
        k.chair(x + Math.sin(ang) * 0.78, z + Math.cos(ang) * 0.78, ang + Math.PI, 0x1c1c1e, { legs: 0x1c1c1e });
      }
    }
    // farolillos rojos colgando y cerezos en flor
    for (const [x, z] of [[-3.6, -3.6], [3.6, -3.6], [-3.6, -0.6], [3.6, -0.6], [-3.6, 2.6], [3.6, 2.6], [0, 2.4], [0, -3.6]]) {
      k.cyl(x, H - 0.6, z, 0.005, 0.005, 0.6, 0x1c1c1e, { seg: 4 });
      k.ball(x, H - 0.85, z, 0.24, 0xe23020, { sy: 1.2, list: k.glow });
      k.cyl(x, H - 0.62, z, 0.09, 0.09, 0.05, 0xd9a520, { seg: 10 }).cyl(x, H - 1.13, z, 0.09, 0.09, 0.05, 0xd9a520, { seg: 10 });
    }
    for (const [x, z] of [[-4.8, -6.2], [4.8, -6.2], [-4.8, 6.2], [4.8, 6.2]]) k.plant(x, z, { h: 2.3, pot: 0x1c1c1e, leaf: 0x4a3020, flowers: 0xf6b6c8, r: 0.55 });
    // cuadro grande del fondo y gato de la suerte en la caja
    k.pic(0, 2.82, -6.94, 3.0, 0.68, 0, 1, canvasTex(1024, 232, sakuraSign), { glow: 0.3 });
    k.counter(3.7, 5.3, 1.6, 0.6, Math.PI / 2, { front: 0x2a1a14, top: 0x3a2a20 });
    k.ball(3.7, 1.12, 5.1, 0.11, 0xffffff).ball(3.7, 1.28, 5.1, 0.08, 0xffffff).box(3.7, 1.08, 5.1, 0.16, 0.03, 0.12, 0xd8271c);
    return {
      spawn: [0, 4.9, Math.PI], exit: [0, 6.6],
      npcs: [
        {
          name: 'Willy', at: [2.4, 5.0], face: 0, pose: 'host',
          look: { sex: 'm', skin: 0xecd2b0, hair: 0x101010, hairStyle: 'short', top: 0x1c1c1e, topStyle: 'long', bottom: 0x1c1c1e, bottomStyle: 'pants', shoes: 0x1e1e20, shoeStyle: 'shoe', eyes: 0x1a120c, height: 1.72 },
          dress: (p) => apron(p, 0x9a1414, false),
          greet: () => pick(['¡Hola, amigo! Bienvenido a Sakura. ¿Mesa para uno?', '¡Pasa, pasa! Hoy el buffet está buenísimo.']),
          talk: byVisit([
            (c) => [
              { who: 'Willy', text: 'Buffet libre: comes todo lo que quieras. Wok, sushi, arroz frito, tallarines...' },
              { who: c.me, text: '¿Qué me recomiendas?', player: true },
              { who: 'Willy', text: 'El pato Pekín y el sushi deluxe. Y el pollo agridulce, que le gusta a todo el mundo.' },
            ],
            (c) => [
              { who: 'Willy', text: '¿Te gusta el sushi? Sashimi, nigiri, maki... y rollo de gambas y mango.' },
              { who: c.me, text: '¿Y algo calentito?', player: true },
              { who: 'Willy', text: 'Sopa de miso o sopa de maíz con pollo. Y la ternera con bambú y setas, muy rica.' },
            ],
            (c) => [
              { who: 'Willy', text: 'También tenemos comida para llevar y a domicilio. ¡Tú llamas y te lo llevamos!' },
              { who: c.me, text: 'Eso para los días de sofá.', player: true },
              { who: 'Willy', text: 'Arroz frito con gambas, tallarines Thai crujientes... ¡y ya está la cena!' },
            ],
          ]),
          offer: {
            label: 'Comer en el buffet libre', price: 14,
            talk: (c) => [
              { who: c.me, text: 'Venga, Willy, un buffet libre.', player: true },
              { who: 'Willy', text: c.paid ? 'Coge plato y sírvete todo lo que quieras. ¡Que aproveche!' : 'Hoy invito yo, amigo. ¡Que aproveche!' },
            ],
            apply: eat('el Sakura', 50),
          },
        },
        { name: '', at: [-3.6, 3.38], face: Math.PI, pose: 'sit', detail: 1, look: { sex: 'm', skin: 0xc28a62, hair: 0x1e1712, hairStyle: 'rapado', top: 0xd8b030, topStyle: 'tshirt', bottom: 0x34465c, bottomStyle: 'shorts', shoes: 0xf2f2f2, height: 1.76 } },
        { name: '', at: [3.6, -2.82], face: 0, pose: 'sit', detail: 1, look: { sex: 'f', skin: 0xf1d3b8, hair: 0x8a6a3a, hairStyle: 'ponytail', top: 0x9ad0b8, topStyle: 'tank', bottom: 0xe8e4da, bottomStyle: 'skirt', shoes: 0xc8a27a, height: 1.62 } },
      ],
    };
  },
};

// ── La Cervecería del Reducto (por dentro) ──
export const CERVECERIA = {
  id: 'cerveceria',
  name: 'La Cervecería',
  glyph: 'Ce',
  color: 0xe8a026,
  keepSign: true,
  door: { sign: 'La Cerveceria' },
  light: { sun: 0xffe6c8, exposure: 0.82 },
  build(k, { canvasTex }) {
    const H = 3.1;
    k.room(-4.5, -4, 4.5, 4, {
      h: H, floor: 'tile', wall: 0xe8dcc4, ceil: 0xf2ece0, lights: null,
      open: { s: [[-4.0, -1.6, 'window'], [-0.8, 0.8, 'door'], [1.6, 4.0, 'window']] },
    });
    // zócalo de madera
    for (const [x, z, w, d] of [[-4.47, 0, 0.03, 8], [4.47, 0, 0.03, 8]]) k.box(x, 0, z, w, 1.1, d, 0x6a4a30, { list: k.shell });
    // barra con grifos de cerveza, botellero iluminado y taburetes
    k.counter(0.4, -2.4, 6.6, 0.7, 0, { front: 0x5a3a22, top: 0x2a2a2a, h: 1.1 });
    for (let i = 0; i < 4; i++) {
      const x = -1.2 + i * 0.5;
      k.cyl(x, 1.1, -2.55, 0.03, 0.03, 0.38, 0xd8dcdf, { seg: 8 }).box(x, 1.4, -2.47, 0.05, 0.22, 0.05, [0xd8271c, 0x1c7a3e, 0xf2c41a, 0x1c1c1e][i]);
    }
    k.box(0.4, 0, -3.8, 7.2, 0.95, 0.4, 0x3a2416);
    for (let r = 0; r < 3; r++) {
      k.box(0.4, 1.3 + r * 0.45, -3.85, 7.0, 0.03, 0.3, 0xffd9a0, { list: k.glow });
      for (let i = 0; i < 26; i++) k.cyl(-2.9 + i * 0.26, 1.33 + r * 0.45, -3.85, 0.035, 0.035, 0.28, [0x3a1418, 0x2f4a1a, 0x7a5a1a, 0xc8c8c8, 0x1a3a5a][(i + r) % 5], { seg: 8 });
    }
    for (let i = 0; i < 6; i++) k.stool(-2.2 + i * 1.0, -1.7, 0x2a2c30, { top: 0x7a2a22 });
    // mesas altas junto a las ventanas
    for (const x of [-2.8, 2.8]) {
      k.table(x, 2.4, { w: 0.7, round: true, h: 1.05, top: 0x5a3a22, leg: 0x2a2c30 });
      k.stool(x - 0.55, 2.4).stool(x + 0.55, 2.4);
      k.cyl(x - 0.1, 1.07, 2.4, 0.035, 0.03, 0.14, 0xe0a531, { seg: 10 }).cyl(x - 0.1, 1.21, 2.4, 0.037, 0.037, 0.025, 0xf7f1e2, { seg: 10 });
    }
    // la tele del fútbol y la pizarra de tapas
    k.box(4.4, 1.6, -1.0, 0.08, 0.9, 1.5, 0x111111);
    k.pic(4.35, 2.05, -1.0, 1.4, 0.8, -1, 0, canvasTex(512, 288, (g, W, Hh) => {
      g.fillStyle = '#2f7a3a'; g.fillRect(0, 0, W, Hh);
      g.strokeStyle = '#e8f2e8'; g.lineWidth = 4; g.strokeRect(16, 16, W - 32, Hh - 32);
      g.beginPath(); g.moveTo(W / 2, 16); g.lineTo(W / 2, Hh - 16); g.stroke();
      g.beginPath(); g.arc(W / 2, Hh / 2, 40, 0, Math.PI * 2); g.stroke();
      g.fillStyle = '#ffffff'; g.font = '800 28px Arial'; g.fillText('UDL 1 - 0', 24, 44);
    }), { glow: 0.6 });
    k.pic(-4.46, 1.7, -0.6, 1.6, 1.2, 1, 0, canvasTex(640, 480, chalkboard('La Cervecería · El Reducto', ['Cocina canaria con producto de la isla', '#PARA COMER', 'Tapas · Pescado · Ensaladas', 'Hamburguesas · Pizzas · Sándwiches', '#PARA BEBER', 'Cañas bien frías', 'Sangría · Daiquiris · Cócteles'])));
    for (let i = 0; i < 4; i++) k.pendant(-2.4 + i * 1.6, -2.0, H, { drop: 0.8, shade: 0x5a3a22 });
    k.pendant(-2.8, 2.4, H, { drop: 0.9 }).pendant(2.8, 2.4, H, { drop: 0.9 });
    k.plant(-4.0, 3.5, { h: 1.3 }).plant(4.0, 3.5, { h: 1.3 });
    return {
      spawn: [0, 2.0, Math.PI], exit: [0, 3.55],
      npcs: [
        {
          name: 'Camarera', at: [0.4, -3.15], face: 0, pose: 'counter',
          look: { sex: 'f', skin: 0xd9a882, hair: 0x2a1d14, hairStyle: 'ponytail', top: 0x1c1c1e, topStyle: 'tshirt', bottom: 0x1c1c1e, bottomStyle: 'pants', shoes: 0x1e1e20, shoeStyle: 'sneaker', height: 1.66 },
          dress: (p) => apron(p, 0x7a1f24, false),
          greet: () => pick(['¡Buenas! ¿Qué te pongo?', '¡Hola! Pasa, que fuera aprieta el sol.']),
          talk: byVisit([
            (c) => [
              { who: 'Camarera', text: 'Bienvenido a La Cervecería, frente a la playa del Reducto. ¿Una caña bien fría?' },
              { who: c.me, text: '¿Qué tenéis para picar?', player: true },
              { who: 'Camarera', text: 'Tapas, pescado, hamburguesas, pizzas, ensaladas... cocina canaria con producto de la isla.' },
            ],
            (c) => [
              { who: 'Camarera', text: 'La cocina abre desde el desayuno hasta la noche. Aquí siempre hay algo.' },
              { who: c.me, text: '¿Y para refrescarse?', player: true },
              { who: 'Camarera', text: 'Cañas, sangría, daiquiris, cócteles... y fuera, la terraza con vistas al mar.' },
            ],
          ]),
          offer: {
            label: 'Pedir una caña con tapa', price: 4,
            talk: (c) => [
              { who: c.me, text: 'Una caña y una tapita, porfa.', player: true },
              { who: 'Camarera', text: c.paid ? '¡Marchando! Aquí la tienes, bien fresquita.' : 'Esta corre a cuenta de la casa. ¡Salud!' },
            ],
            apply: (h) => { h.heal(); h.addMinutes(20); h.toast('Caña y tapa en La Cervecería · salud al 100%'); },
          },
        },
        { name: '', at: [-1.2, -1.7], face: Math.PI, pose: 'sit', seat: 0.72, detail: 1, look: { sex: 'm', skin: 0xc28a62, hair: 0x3a2a1c, hairStyle: 'short', beard: true, top: 0x557a4a, topStyle: 'tshirt', bottom: 0x34465c, bottomStyle: 'shorts', shoes: 0xf2f2f2, height: 1.78 } },
      ],
    };
  },
};
