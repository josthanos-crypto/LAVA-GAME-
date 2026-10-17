import { byVisit, pick, fit, SANS, poster, apron, scissors } from './localesCommon.js';

/**
 * Centro Comercial Las Buganvillas (Manolo Millares 106): un pasillo con
 * suelo de terrazo y jardineras de buganvillas, y a los lados Todofone
 * (Siso: venta y reparación de móviles), la peluquería de Toño enfrente y
 * Calzado El Más Barato, la zapatería de Eliseo. Al fondo, la escalera al
 * gimnasio Areafit de la primera planta (de momento no se sube).
 */

const MAGENTA = 0xc2185b;

function ccSign(g, W, H) {
  const bg = g.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#2a2f36'); bg.addColorStop(1, '#1a1e24');
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  // ramilletes de buganvilla a los lados
  for (const cx of [H * 0.55, W - H * 0.55]) {
    for (let i = 0; i < 16; i++) {
      const a = i * 2.4, r = (i % 4) * H * 0.07;
      g.fillStyle = ['#d81b78', '#c2185b', '#f06292', '#ad1457'][i % 4];
      g.beginPath(); g.arc(cx + Math.cos(a) * r, H / 2 + Math.sin(a) * r, H * 0.1, 0, Math.PI * 2); g.fill();
    }
    g.fillStyle = '#7ac043'; g.beginPath(); g.arc(cx + H * 0.25, H * 0.75, H * 0.08, 0, Math.PI * 2); g.fill();
  }
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = '#f06292';
  fit(g, 'CENTRO COMERCIAL', W / 2, H * 0.27, W - H * 2.4, H * 0.2, '700', SANS);
  g.fillStyle = '#ffffff';
  fit(g, 'LAS BUGANVILLAS', W / 2, H * 0.62, W - H * 2.4, H * 0.48, '800', SANS);
}

function phonesWall(g, W, H) {
  g.fillStyle = '#10161c'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#18a0d8'; g.fillRect(0, 0, W, 70);
  g.fillStyle = '#ffffff'; g.textAlign = 'center'; g.textBaseline = 'middle';
  fit(g, 'TODOFONE', W / 2, 36, W - 40, 54, '800', SANS);
  const cols = ['#ff7a45', '#18c5b8', '#f2c41a', '#7a6aff', '#e84a6a', '#4ad07a'];
  for (let r = 0; r < 2; r++) for (let i = 0; i < 7; i++) {
    const x = 40 + i * ((W - 80) / 7), y = 100 + r * 150;
    g.fillStyle = '#2a2f36';
    g.fillRect(x + 10, y, 70, 130);
    const sc = g.createLinearGradient(x, y, x + 70, y + 130);
    sc.addColorStop(0, cols[(i + r) % cols.length]); sc.addColorStop(1, '#10161c');
    g.fillStyle = sc;
    g.fillRect(x + 15, y + 8, 60, 112);
  }
}

const hairApply = (h) => {
  const look = h.getLook();
  const fem = look.sex === 'f';
  const usual = (fem ? ['long', 'ponytail', 'bun', 'curly'] : ['short', 'surf', 'curly', 'rapado']).filter(s => s !== look.hairStyle);
  const rare = (fem ? ['short', 'surf'] : ['long', 'ponytail', 'bun', 'calvo']).filter(s => s !== look.hairStyle);
  look.hairStyle = Math.random() < 0.8 ? pick(usual) : pick(rare);
  if (!fem && Math.random() < 0.5) look.beard = !look.beard;
  h.setLook(look);
  h.addMinutes(30);
  h.toast('Corte nuevo de la peluquería de Toño');
};

const shoesApply = (h) => {
  const look = h.getLook();
  look.shoeStyle = pick(['sneaker', 'shoe', 'sandal'].filter(s => s !== look.shoeStyle));
  look.shoes = pick([0xf4f1ea, 0x1e1e20, 0x8a6a4a, 0xd8271c, 0x3a4a6a, 0x18c5b8].filter(c => c !== look.shoes));
  h.setLook(look);
  h.addMinutes(20);
  h.toast('Zapatos nuevos de Calzado El Más Barato');
};

export const BUGANVILLAS = {
  id: 'buganvillas',
  name: 'C.C. Las Buganvillas',
  glyph: 'B',
  color: MAGENTA,
  doorWidth: 2.4,
  door: { sign: 'Sakura' },
  sign: { size: [7.2, 1.25], y: 3.7, px: [1280, 222], draw: ccSign, edge: 0x1a1e24 },
  light: { sun: 0xffffff, exposure: 0.84, sky: 0xf6f8fa, ground: 0x8a8278 },
  build(k, { canvasTex }) {
    const H = 3.4, T = (w, h, f) => canvasTex(w, h, f);
    // vestíbulo de la entrada y el pasillo
    k.room(-3.5, 8, 3.5, 12, {
      h: H, floor: 'terrazo', wall: 0xf2efe8, ceil: 0xf8f8f6,
      open: { s: [[0.5, 2.3, 'glass'], [2.3, 4.7, 'door'], [4.7, 6.5, 'glass']], n: [[1.3, 5.7, 'arch']] },
    });
    k.room(-2.2, -16, 2.2, 8, {
      h: H, floor: 'terrazo', wall: 0xf2efe8, ceil: 0xf8f8f6, lights: null,
      open: {
        s: [[0, 4.4, 'arch']],
        w: [[5.6, 9.6, 'glass'], [9.8, 11.3, 'door'], [12.1, 16.1, 'glass'], [16.3, 17.8, 'door'], [18.6, 23.4, 'glass']],
        e: [[5.6, 11.4, 'glass'], [12.1, 16.1, 'glass'], [16.3, 17.8, 'door'], [18.6, 23.4, 'glass']],
      },
    });
    // claraboya a lo largo del pasillo
    k.box(0, H - 0.04, -4, 1.6, 0.03, 23, 0xeef6ff, { list: k.glow });
    // rótulos de las tiendas sobre los escaparates
    const shopSign = (x, z, nx, title, bg, fg) => k.pic(x, 3.02, z, 3.9, 0.52, nx, 0, T(768, 102, poster({ bg, fg, title })), { glow: 0.45 });
    shopSign(-2.19, -7.45, 1, 'CALZADO EL MÁS BARATO', '#3a2a20', '#f2d27a');
    shopSign(-2.19, -1.05, 1, 'TODOFONE', '#18a0d8', '#ffffff');
    shopSign(-2.19, 5.0, 1, 'MODA', '#2a2f36', '#f6f2ea');
    shopSign(2.19, -7.45, -1, 'JOYERÍA', '#1c1c1e', '#e8c46a');
    shopSign(2.19, -1.05, -1, 'PELUQUERÍA', '#111111', '#ffffff');
    shopSign(2.19, 5.0, -1, 'MERCERÍA', '#f2d0d8', '#7a1f4a');
    // jardineras con buganvillas y bancos en medio del pasillo
    for (const z of [-9, -2, 4.5]) {
      k.plant(0, z, { h: 1.5, pot: 0x8a8f96, leaf: 0x2f6b3a, flowers: MAGENTA, r: 0.55 });
      k.box(0, 0, z + 1.2, 1.2, 0.45, 0.42, 0x8a6040).block(0, z + 1.2, 1.2, 0.42);
    }
    k.plant(-3.0, 11.3, { h: 1.6, flowers: MAGENTA }).plant(3.0, 11.3, { h: 1.6, flowers: MAGENTA });
    // directorio del centro
    k.box(2.9, 0, 8.6, 0.12, 1.9, 1.1, 0x2a2f36, { ry: 0 }).block(2.9, 8.6, 0.14, 1.1);
    k.pic(2.83, 1.25, 8.6, 1.0, 1.25, -1, 0, T(400, 500, (g, W, Hh) => {
      g.fillStyle = '#2a2f36'; g.fillRect(0, 0, W, Hh);
      g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#f06292';
      fit(g, 'LAS BUGANVILLAS', W / 2, 40, W - 30, 40, '800', SANS);
      const L = [['PLANTA BAJA', '#9fd6c2'], ['Todofone', '#fff'], ['Peluquería', '#fff'], ['Calzado El Más Barato', '#fff'], ['Moda · Joyería · Mercería', '#fff'], ['1ª PLANTA', '#9fd6c2'], ['Gimnasio Areafit', '#fff']];
      L.forEach(([t, c], i) => { g.fillStyle = c; fit(g, t, W / 2, 105 + i * 54, W - 40, 34, '700', SANS); });
    }), { glow: 0.4 });
    // escalera al gimnasio Areafit (arriba no se sube, de momento)
    for (let i = 0; i < 15; i++) k.box(-1.15, 0, -11.2 - i * 0.32, 1.9, 0.2 * (i + 1), 0.32, 0xd8d2c8);
    k.block(-1.15, -13.6, 1.95, 4.9);
    k.box(-0.18, 0, -13.6, 0.04, 1.0, 4.8, 0xbfd8e6, { list: k.glow });
    k.pic(1.1, 2.3, -15.97, 2.0, 0.9, 0, 1, T(512, 230, poster({ bg: '#18c5b8', fg: '#0e1116', title: 'AREAFIT', sub: 'GIMNASIO · 1ª PLANTA  ↑' })), { glow: 0.4 });

    // ── Todofone ──
    k.room(-8.5, -4, -2.2, 2, { h: 3.1, floor: 'tile', wall: 0xf4f4f2, open: { e: [[0.1, 4.1, 'hole'], [4.3, 5.8, 'door']] } });
    k.counter(-6.2, -1.0, 2.4, 0.6, Math.PI / 2, { front: 0x18a0d8, top: 0xf2f2f2 });
    k.box(-6.15, 1.05, -1.5, 0.3, 0.02, 0.18, 0x1c1c1e).box(-6.15, 1.05, -0.6, 0.16, 0.012, 0.32, 0x2a2f36);
    k.pic(-8.47, 1.65, -1.0, 4.4, 1.55, 1, 0, T(1024, 360, phonesWall), { glow: 0.35 });
    for (const z of [-3.62, 1.62]) {
      k.shelf(-5.3, z, 2.6, z < 0 ? 0 : Math.PI, {
        h: 2.0, d: 0.32, hex: 0xffffff, rows: 5,
        items: (kk, x, y, zz, w, ry) => { for (let i = 0; i < 7; i++) kk.box(x - w / 2 + 0.17 + i * (w - 0.3) / 6, y, zz, 0.12, 0.2, 0.05, [0xff7a45, 0x18c5b8, 0xf2c41a, 0x7a6aff, 0xe84a6a, 0x1c1c1e][i % 6], { ry }); },
      });
    }
    k.pic(-3.3, 1.6, 1.97, 1.6, 0.9, 0, -1, T(512, 288, poster({ bg: '#ffffff', fg: '#18a0d8', title: 'REPARACIÓN DE MÓVILES', sub: 'Pantallas · Baterías · Liberaciones · Accesorios', accent: '#18a0d8' })));

    // ── Peluquería de Toño ──
    k.room(2.2, -4, 8.5, 2, { h: 3.1, floor: 'checker', wall: 0xf2efe8, open: { w: [[0.1, 4.1, 'hole'], [4.3, 5.8, 'door']] } });
    for (const z of [-2.6, -0.4]) {
      // sillón de barbero mirando al espejo
      k.cyl(7.25, 0, z, 0.26, 0.3, 0.08, 0x8a8f96, { seg: 16 }).cyl(7.25, 0.08, z, 0.06, 0.06, 0.4, 0xc8ccd0, { seg: 10 });
      k.box(7.25, 0.48, z, 0.56, 0.12, 0.56, 0x6a1a1a).box(6.97, 0.6, z, 0.1, 0.62, 0.56, 0x6a1a1a);
      for (const s of [-1, 1]) k.box(7.25, 0.64, z + s * 0.3, 0.5, 0.06, 0.06, 0x6a1a1a);
      k.box(7.6, 0.18, z, 0.22, 0.04, 0.4, 0xc8ccd0).block(7.25, z, 0.6, 0.6);
      // espejo con su balda
      k.box(8.45, 1.1, z, 0.04, 1.3, 1.1, 0x2a2a2a, { list: k.shell });
      k.pic(8.42, 1.75, z, 1.0, 1.2, -1, 0, T(256, 300, (g, W, Hh) => {
        const gr = g.createLinearGradient(0, 0, W, Hh);
        gr.addColorStop(0, '#dfe8ee'); gr.addColorStop(0.5, '#b8c6d0'); gr.addColorStop(1, '#e8eef2');
        g.fillStyle = gr; g.fillRect(0, 0, W, Hh);
      }), { glow: 0.15 });
      k.box(8.3, 1.05, z, 0.3, 0.03, 1.0, 0xffffff);
      for (let i = 0; i < 4; i++) k.cyl(8.3, 1.08, z - 0.35 + i * 0.23, 0.04, 0.04, 0.18, [0x1c1c1e, 0xd8271c, 0x18c5b8, 0xf2c41a][i], { seg: 8 });
    }
    k.box(5.0, 0, -3.65, 1.0, 0.9, 0.55, 0xf2f2f2).ball(5.0, 0.86, -3.6, 0.22, 0x1c1c1e, { sy: 0.4 }).block(5.0, -3.65, 1.0, 0.55);
    k.sofa(4.6, 1.45, 1.8, Math.PI, 0x1c1c1e);
    // el poste de barbero en la puerta
    k.cyl(2.45, 1.2, 1.9, 0.07, 0.07, 0.7, 0xffffff, { seg: 12 });
    for (let i = 0; i < 4; i++) k.cyl(2.45, 1.25 + i * 0.16, 1.9, 0.072, 0.072, 0.05, i % 2 ? 0x1f4fa8 : 0xd8271c, { seg: 12 });

    // ── Calzado El Más Barato (la zapatería de Eliseo) ──
    k.room(-8.5, -10.5, -2.2, -4.5, { h: 3.1, floor: 'wood', wall: 0xf3eee4, open: { e: [[0.1, 4.1, 'hole'], [4.3, 5.8, 'door']] } });
    const pairs = (kk, x, y, z, w, ry, row) => {
      const c = Math.cos(ry), s = Math.sin(ry);
      for (let i = 0; i < 5; i++) {
        const u = -w / 2 + 0.25 + i * (w - 0.5) / 4, col = [0x1e1e20, 0x8a6a4a, 0xf4f1ea, 0xd8271c, 0x3a4a6a, 0x5a3422][(i + row) % 6];
        for (const o of [-0.06, 0.06]) kk.box(x + (u + o) * c, y, z - (u + o) * s, 0.1, 0.09, 0.26, col, { ry });
      }
    };
    k.shelf(-8.3, -7.5, 5.6, Math.PI / 2, { h: 2.3, d: 0.36, hex: 0xe8dcc4, rows: 6, items: pairs });
    k.shelf(-5.4, -10.3, 3.6, 0, { h: 2.3, d: 0.36, hex: 0xe8dcc4, rows: 6, items: pairs });
    k.box(-5.5, 0, -7.4, 1.5, 0.42, 0.5, 0x7a2a22).block(-5.5, -7.4, 1.5, 0.5);
    k.rug(-5.5, -7.4, 2.4, 1.6, 0, 0xc8b89a);
    k.counter(-3.2, -9.7, 1.3, 0.5, Math.PI / 2, { front: 0x5a3a22, top: 0xe8e2d8 });
    k.box(-2.5, 0, -5.1, 0.6, 1.8, 0.05, 0xd8dcdf, { ry: -0.4 });

    // ── escaparates que solo se miran: moda, joyería y mercería ──
    k.room(-4.0, 2.5, -2.2, 7.5, { h: 3.1, floor: 'wood', wall: 0xf2efe8, open: { e: [[0.1, 4.9, 'hole']] }, camera: false });
    for (const [z, c] of [[3.3, 0xd8271c], [5.0, 0x2c4f86], [6.7, 0xf2d06a]]) {
      k.cyl(-3.2, 0, z, 0.18, 0.2, 0.05, 0x1c1c1e).cyl(-3.2, 0.05, z, 0.02, 0.02, 0.85, 0x1c1c1e);
      k.box(-3.2, 0.9, z, 0.36, 0.62, 0.22, c).ball(-3.2, 1.68, z, 0.11, 0xe8e2d8);
    }
    k.room(2.2, -10.5, 4.0, -4.5, { h: 3.1, floor: 'dark', wall: 0x2a2a2c, open: { w: [[0.1, 5.9, 'hole']] }, camera: false });
    for (const z of [-9.4, -7.5, -5.6]) {
      k.box(3.1, 0, z, 0.8, 0.95, 1.2, 0x1c1c1e);
      for (let i = 0; i < 6; i++) k.ball(2.9 + (i % 2) * 0.35, 1.0, z - 0.4 + Math.floor(i / 2) * 0.4, 0.04, i % 3 ? 0xe8c46a : 0xdfe8ee, { list: k.glow, seg: 6 });
    }
    k.room(2.2, 2.5, 4.0, 7.5, { h: 3.1, floor: 'wood', wall: 0xf8f0f2, open: { w: [[0.1, 4.9, 'hole']] }, camera: false });
    k.shelf(3.8, 5.0, 4.6, -Math.PI / 2, {
      h: 2.0, d: 0.34, hex: 0xffffff, rows: 5,
      items: (kk, x, y, z, w, ry, row) => { for (let i = 0; i < 9; i++) kk.ball(x, y + 0.07, z - w / 2 + 0.2 + i * (w - 0.4) / 8, 0.07, [0xf06292, 0x7a6aff, 0xf2c41a, 0x18c5b8, 0xe84a3a][(i + row) % 5], { seg: 8 }); },
    });

    return {
      spawn: [0, 9.8, Math.PI], exit: [0, 11.5],
      npcs: [
        {
          name: 'Siso', at: [-7.0, -1.0], face: Math.PI / 2, pose: 'counter',
          look: { sex: 'm', skin: 0xd9a882, hair: 0x1e1712, hairStyle: 'short', beard: true, top: 0x18a0d8, topStyle: 'tshirt', bottom: 0x34465c, bottomStyle: 'pants', shoes: 0xf2f2f2, shoeStyle: 'sneaker', height: 1.77 },
          greet: () => '¡Buenas! Pasa, que aquí te dejamos el móvil como nuevo.',
          talk: byVisit([
            (c) => [
              { who: 'Siso', text: 'Esto es Todofone: venta y reparación de móviles. Pantallas, baterías, conectores... lo que le pase, lo miramos.' },
              { who: c.me, text: 'Se me cayó y la pantalla está hecha polvo.', player: true },
              { who: 'Siso', text: 'Tranquilo, eso tiene arreglo. ¿Qué es, un Apple, un Samsung, un Sony...?' },
            ],
            (c) => [
              { who: 'Siso', text: 'También liberamos móviles, para que lo uses con la compañía que quieras.' },
              { who: c.me, text: '¿Y fundas y cargadores?', player: true },
              { who: 'Siso', text: 'Todos los accesorios que busques: fundas, protectores, cargadores, auriculares... y electrónica.' },
            ],
            (c) => [
              { who: 'Siso', text: 'Estamos aquí dentro de Las Buganvillas, con entrada también por la calle Fenauso.' },
              { who: c.me, text: 'Pues ya sé dónde traerlo.', player: true },
              { who: 'Siso', text: '¡Aquí te espero!' },
            ],
          ]),
          offer: {
            label: 'Arreglar la pantalla del móvil', price: 25,
            talk: (c) => [
              { who: c.me, text: 'Venga, Siso, cámbiame la pantalla.', player: true },
              { who: 'Siso', text: c.paid ? 'Dame un ratito... ¡listo! Como recién sacado de la caja.' : 'Esta va de regalo. ¡Pero no lo vuelvas a tirar!' },
            ],
            apply: (h) => { h.addMinutes(30); h.toast('Móvil como nuevo · Todofone'); },
          },
        },
        {
          name: 'Toño', at: [6.45, -2.6], face: Math.PI / 2, pose: 'barber',
          look: { sex: 'm', skin: 0xc28a62, hair: 0x101010, hairStyle: 'surf', beard: true, top: 0x1c1c1e, topStyle: 'tshirt', bottom: 0x1e2024, bottomStyle: 'pants', shoes: 0x1e1e20, shoeStyle: 'sneaker', height: 1.75 },
          dress: (p) => { apron(p, 0x2a2a2c, false); scissors(p); },
          greet: () => '¡Buenas! Siéntate un momentito, que ahora te atiendo.',
          talk: byVisit([
            (c) => [
              { who: 'Toño', text: '¿Qué pasó, mi niño? ¿Un repasito o cambiamos de look?' },
              { who: c.me, text: 'No sé... algo fresquito para el verano.', player: true },
              { who: 'Toño', text: 'Déjate en mis manos, que de aquí se sale hecho un pincel.' },
            ],
            (c) => [
              { who: 'Toño', text: 'Cortes, degradados, arreglo de barba... aquí se viene a ponerse guapo.' },
              { who: c.me, text: '¿Y para alguien con poco pelo?', player: true },
              { who: 'Toño', text: '¡Para ese también! Un rapado bien hecho es un arte.' },
            ],
            (c) => [
              { who: 'Toño', text: 'Estamos aquí en Las Buganvillas, enfrente de Todofone.' },
              { who: c.me, text: 'Pues ya me tienes de cliente.', player: true },
              { who: 'Toño', text: '¡Eso me gusta! Siéntate cuando quieras.' },
            ],
          ]),
          offer: {
            label: 'Cortarte el pelo con Toño', price: 12,
            talk: (c) => [
              { who: c.me, text: 'Venga, Toño, sorpréndeme.', player: true },
              { who: 'Toño', text: c.paid ? 'Tris, tras... ¡mírate en el espejo! Hecho un pincel.' : 'Este corre de mi cuenta. ¡Mírate!' },
            ],
            apply: hairApply,
          },
        },
        {
          name: 'Eliseo', at: [-4.4, -6.3], face: Math.PI / 2, pose: 'host',
          look: { sex: 'm', skin: 0xe8c4a2, hair: 0x6e6c6a, hairStyle: 'short', top: 0x9ac0e0, topStyle: 'long', bottom: 0x6b5844, bottomStyle: 'pants', shoes: 0x5a3422, shoeStyle: 'shoe', height: 1.74, build: 1.08 },
          greet: () => 'Buenas, bienvenido a Calzado El Más Barato. Pase y mire sin compromiso.',
          talk: byVisit([
            (c) => [
              { who: 'Eliseo', text: 'Bienvenido a Calzado El Más Barato: zapatos, deportivas, sandalias... para toda la familia y a buen precio, como dice el nombre.' },
              { who: c.me, text: 'Busco algo cómodo para patear Arrecife.', player: true },
              { who: 'Eliseo', text: 'Tengo justo lo que necesita. Siéntese ahí y se los prueba.' },
            ],
            (c) => [
              { who: 'Eliseo', text: 'Para el trabajo, para salir, para la playa... aquí encuentra su número.' },
              { who: c.me, text: '¿Y para una boda?', player: true },
              { who: 'Eliseo', text: '¡Un buen zapato de vestir! Eso no puede faltar.' },
            ],
          ]),
          offer: {
            label: 'Probarte unos zapatos nuevos', price: 30,
            talk: (c) => [
              { who: c.me, text: 'A ver esos, Eliseo. Me los llevo puestos.', player: true },
              { who: 'Eliseo', text: c.paid ? 'Le quedan que ni pintados. ¡Que los disfrute!' : 'Lléveselos, ya me los pagará otro día.' },
            ],
            apply: shoesApply,
          },
        },
        { name: '', at: [7.25, -2.6], face: Math.PI / 2, pose: 'sit', seat: 0.58, detail: 1, look: { sex: 'm', skin: 0xe8c4a2, hair: 0x3a2a1c, hairStyle: 'short', top: 0xe8e4da, topStyle: 'tshirt', bottom: 0x34465c, bottomStyle: 'pants', shoes: 0x1e1e20, height: 1.76 } },
      ],
    };
  },
};
