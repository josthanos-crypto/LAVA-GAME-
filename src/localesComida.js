import { byVisit, pick, fit, SANS, chalkboard, poster, chefHat, apron } from './localesCommon.js';
import { MACCHERONI_DOOR_SHIFT } from './maccheroni.js';

/**
 * Los locales de comer: El Nuevo Maccheroni (Manolo Millares 103: Andrea en
 * la sala y Elvis en la cocina, pasta fresca rellena), el Sakura (Fenauso 55:
 * buffet libre, wok y sushi; Willy) y La Cervecería del Reducto por dentro.
 * Los platos son los de sus cartas publicadas (sin precios, que cambian).
 */

const eat = (where, mins = 45) => (h) => { h.heal(); h.addMinutes(mins); h.toast(`Comida en ${where} · salud al 100%`); };

/** plato de espaguetis a la boloñesa (lo que se encoge al comer va en userData.food) */
function spaghettiPlate(THREE) {
  const g = new THREE.Group();
  const mat = (color, roughness = 0.6) => new THREE.MeshStandardMaterial({ color, roughness });
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.11, 0.022, 28), mat(0xffffff, 0.3));
  plate.position.y = 0.011;
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.008, 6, 28), mat(0xf4f4f0, 0.3));
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.022;
  g.add(plate, rim);
  const food = new THREE.Group();
  food.position.y = 0.022;
  const pasta = mat(0xe9c76b);
  const mound = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), pasta);
  mound.scale.y = 0.5;
  food.add(mound);
  // los espaguetis enrollados, en todas direcciones
  for (let i = 0; i < 16; i++) {
    const strand = new THREE.Mesh(new THREE.TorusGeometry(0.028 + (i % 5) * 0.011, 0.0035, 4, 22), pasta);
    strand.rotation.set(Math.PI / 2 + Math.sin(i * 1.7) * 0.5, i * 0.7, Math.cos(i * 2.3) * 0.4);
    strand.position.set(Math.cos(i * 2.4) * 0.03, 0.015 + (i % 3) * 0.008, Math.sin(i * 2.4) * 0.03);
    food.add(strand);
  }
  // la boloñesa por encima, con su carne, el parmesano y una hoja de albahaca
  const sauce = new THREE.Mesh(new THREE.SphereGeometry(0.05, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat(0xa8321e, 0.5));
  sauce.scale.y = 0.45;
  sauce.position.y = 0.034;
  food.add(sauce);
  for (let i = 0; i < 7; i++) {
    const bit = new THREE.Mesh(new THREE.SphereGeometry(0.009, 6, 4), mat(0x6b2a18));
    bit.position.set(Math.cos(i * 0.9) * 0.03, 0.05, Math.sin(i * 0.9) * 0.03);
    food.add(bit);
  }
  for (let i = 0; i < 10; i++) {
    const cheese = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.003, 0.006), mat(0xfaf3dc));
    cheese.position.set(Math.cos(i * 2.1) * 0.025, 0.057, Math.sin(i * 2.1) * 0.025);
    food.add(cheese);
  }
  const basil = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 4), mat(0x3e7a32));
  basil.scale.set(1, 0.2, 0.55);
  basil.position.set(0.012, 0.058, -0.01);
  food.add(basil);
  g.add(food);
  // el tenedor, a un lado del plato
  const steel = mat(0xc9ccd0, 0.25);
  const fork = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.004, 0.13), steel);
  fork.position.set(0.12, 0.028, 0.0);
  g.add(fork);
  for (let i = -1; i <= 1; i++) {
    const tine = new THREE.Mesh(new THREE.BoxGeometry(0.003, 0.003, 0.045), steel);
    tine.position.set(0.12 + i * 0.005, 0.028, 0.085);
    g.add(tine);
  }
  g.userData.food = food;
  return g;
}

// ── El Nuevo Maccheroni (la fachada, el rótulo y la terraza: maccheroni.js) ──
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

// la letra de mano de los vinilos y del rótulo (la misma que la fachada, maccheroni.js)
const SCRIPT = '"Yellowtail", "Brush Script MT", cursive';

export const MACCHERONI = {
  id: 'maccheroni',
  name: 'El Nuevo Maccheroni',
  // como lo escribe la gente al buscarlo
  keys: ['maccheroni', 'macarroni', 'macheroni', 'macarrones', 'restaurante italiano', 'italiano'],
  glyph: 'M',
  color: 0xd8271c,
  // el rótulo de OpenStreetMap se llama «Nuovo»; la puerta va en el centro de la delantera
  door: { sign: 'El Nuovo Maccheroni', shift: MACCHERONI_DOOR_SHIFT },
  ownFront: true,
  light: { sun: 0xffe2c0, exposure: 0.8, sky: 0xfff0dc },
  /**
   * Por dentro, como en las 16 fotos de José Manuel (24/10/2026): suelo de barro en diagonal,
   * paredes crema con zócalo y molduras de madera oscura, lámparas de mimbre, mesas cuadradas
   * con mantel marrón o rojo y sillas de travesaños; la barra en L de mármol ocre con la balda
   * de botellas colgada del techo, el horno con las cajas de pizza, el rótulo naranja y la
   * ventana a la cocina; a la izquierda los vinos, la vinoteca, la pizarra y la tele; a la
   * derecha la cristalera con los vinilos (del revés, que se ven desde dentro); al fondo el
   * arco de madera con el cartel de pala «Toilette» y el pasillo blanco de los aseos.
   */
  build(k, { canvasTex, THREE }) {
    const H = 3.2;
    const CREMA = 0xeee3cf, MADERA = 0x4a2a1a, MADERA_CL = 0x6a3a22, MARMOL = 0xc98a4e, BARRA = 0x3a2418;
    const MARRON = 0x6e4a3a, ROJO = 0xb3262a, SILLA = 0x4a2c1a, STEEL = 0xa8aeb4, MIMBRE = 0xc9a062;

    // ── la sala (6,8 × 9,6 m): delante (s) la puerta con un escaparate a cada lado, a la
    // derecha (e) la cristalera del lateral y al fondo (n) el paso a los aseos ──
    k.room(-3.4, -4.8, 3.4, 4.8, {
      h: H, floor: 'barro', wall: CREMA, ceil: 0xf8f6f0, base: MADERA, lights: null,
      open: {
        s: [[0.3, 2.2, 'window'], [2.5, 4.3, 'door'], [4.6, 6.5, 'window']],
        e: [[4.4, 6.6, 'window'], [6.9, 9.3, 'window']],
        n: [[4.9, 6.1, 'door']],
      },
    });
    // zócalo de madera oscura hasta 1 m y la moldura de arriba
    const zocalo = (x, z, w, ry) => k.box(x, 0, z, w, 1.0, 0.03, MADERA, { ry, list: k.shell });
    const moldura = (x, z, w, ry) => k.box(x, H - 0.14, z, w, 0.14, 0.07, MADERA, { ry, list: k.shell });
    zocalo(-3.385, 0, 9.6, Math.PI / 2); zocalo(3.385, 0, 9.6, Math.PI / 2);
    zocalo(-0.95, -4.785, 4.9, 0); zocalo(3.05, -4.785, 0.7, 0);
    zocalo(-2.15, 4.785, 2.5, 0); zocalo(2.15, 4.785, 2.5, 0);
    moldura(-3.365, 0, 9.6, Math.PI / 2); moldura(3.365, 0, 9.6, Math.PI / 2);
    moldura(0, -4.765, 6.8, 0); moldura(0, 4.765, 6.8, 0);
    // el aire acondicionado de cassette del techo
    k.box(0.6, H - 0.05, 0.6, 0.85, 0.05, 0.85, 0xf2f2ee).box(0.6, H - 0.06, 0.6, 0.6, 0.01, 0.6, 0x9a9a96);

    // ── la barra en L: frente marrón oscuro, encimera de mármol ocre y el escalón alto de delante ──
    k.counter(-1.3, -2.5, 4.1, 0.7, 0, { front: BARRA, top: MARMOL, h: 1.05 });
    k.box(-1.3, 1.05, -2.25, 4.1, 0.14, 0.26, MARMOL);
    k.counter(0.95, -3.2, 1.1, 0.6, Math.PI / 2, { front: BARRA, top: MARMOL, h: 1.05 });
    // el grifo de cerveza, la caja y la cafetera roja
    k.cyl(-0.4, 1.19, -2.3, 0.04, 0.055, 0.5, 0xb08a4a, { seg: 10 }).box(-0.4, 1.6, -2.3, 0.03, 0.14, 0.03, 0x1c1c1e);
    k.box(0.45, 1.05, -2.55, 0.08, 0.06, 0.2, 0xe8e8e4).box(0.45, 1.11, -2.5, 0.38, 0.28, 0.04, 0xf2f2ee);
    k.box(0.95, 1.05, -3.35, 0.45, 0.42, 0.6, 0xc0282a).box(0.95, 1.47, -3.35, 0.4, 0.04, 0.55, STEEL);
    // copas boca abajo y vasos en el escalón
    for (let i = 0; i < 7; i++) k.cyl(-2.1 + i * 0.22, 1.19, -2.25, 0.035, 0.03, 0.16, 0xdfe6ea, { seg: 8 });
    // la balda de acero colgada del techo encima de la barra, llena de botellas
    for (const x of [-3.0, -1.3, 0.4]) k.cyl(x, 2.2, -2.5, 0.018, 0.018, H - 2.2, 0xc8ccd0, { seg: 6 });
    k.box(-1.3, 2.18, -2.5, 3.8, 0.05, 0.34, 0x9a6a3e);
    k.box(-1.3, 2.36, -2.33, 3.8, 0.02, 0.02, 0xc8ccd0).box(-1.3, 2.46, -2.33, 3.8, 0.02, 0.02, 0xc8ccd0);
    const botella = [0x2f4a1a, 0xe8e4d8, 0x6a3a1a, 0x5a1a22, 0xd8b04a, 0x1e2e3a, 0x8a2a1a];
    for (let i = 0; i < 30; i++) {
      const x = -3.1 + i * 0.125, c = botella[(i * 3) % botella.length], alta = 0.26 + ((i * 7) % 4) * 0.03;
      k.cyl(x, 2.23, -2.5, 0.038, 0.038, alta, c, { seg: 8 }).cyl(x, 2.23 + alta, -2.5, 0.013, 0.025, 0.08, c, { seg: 6 });
    }
    // las cajas de pizza apiladas en la punta de la barra
    for (const [x, n] of [[-3.0, 18], [-2.55, 13]]) {
      for (let i = 0; i < n; i++) k.box(x, 1.05 + i * 0.045, -2.6, 0.4, 0.043, 0.4, i % 2 ? 0xc9a46c : 0xbf9a62);
    }

    // ── detrás de la barra: el horno de pizza, la mesa de acero, el rótulo y la ventana a la cocina ──
    k.box(-2.65, 0, -4.3, 1.3, 1.0, 0.9, 0x5a5550);
    k.box(-2.65, 1.0, -4.35, 1.2, 0.7, 0.8, 0x3a3734);
    k.box(-2.65, 1.12, -3.94, 0.6, 0.32, 0.02, 0x120e0b);
    k.box(-2.65, 1.7, -4.4, 1.0, H - 1.7, 0.6, 0x4a4642);
    k.block(-2.65, -4.3, 1.35, 1.0);
    k.box(-1.3, 0, -4.45, 1.6, 0.9, 0.6, STEEL).block(-1.3, -4.45, 1.6, 0.6);
    k.cyl(-1.7, 0.9, -4.45, 0.16, 0.15, 0.24, 0xc8ccd0, { seg: 16 }).cyl(-1.0, 0.9, -4.45, 0.13, 0.12, 0.18, 0xc8ccd0, { seg: 16 });
    k.pic(-0.9, 2.65, -4.79, 2.4, 0.8, 0, 1, canvasTex(1024, 340, (g, W, Hc) => {
      g.fillStyle = '#eee3cf'; g.fillRect(0, 0, W, Hc);
      g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
      const linea = (t, y, size) => {
        g.font = `${size}px ${SCRIPT}`;
        g.lineWidth = size * 0.16; g.strokeStyle = '#3a1a10'; g.strokeText(t, W * 0.56, y);
        g.fillStyle = '#ee6a2a'; g.fillText(t, W * 0.56, y);
      };
      linea('El Nuevo', Hc * 0.28, Hc * 0.36);
      linea('Maccheroni', Hc * 0.68, Hc * 0.5);
      // el tenedor naranja del logo
      g.fillStyle = '#ee6a2a';
      for (let i = 0; i < 4; i++) g.fillRect(W * 0.07 + i * W * 0.022, Hc * 0.28, W * 0.012, Hc * 0.3);
      g.fillRect(W * 0.07, Hc * 0.56, W * 0.078, Hc * 0.06);
      g.fillRect(W * 0.1, Hc * 0.6, W * 0.018, Hc * 0.32);
    }), { glow: 0.25 });
    // la ventana de servicio, con la cocina de azulejo blanco y acero detrás
    k.box(0.1, 0.98, -4.78, 1.1, 0.06, 0.06, MADERA_CL).box(0.1, 2.13, -4.78, 1.1, 0.06, 0.06, MADERA_CL);
    k.pic(0.1, 1.55, -4.79, 1.0, 1.15, 0, 1, canvasTex(256, 296, (g, W, Hc) => {
      g.fillStyle = '#dfe9ee'; g.fillRect(0, 0, W, Hc);
      g.strokeStyle = 'rgba(150,170,180,.6)'; g.lineWidth = 2;
      for (let y = 0; y < Hc; y += 22) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
      for (let x = 0; x < W; x += 22) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, Hc); g.stroke(); }
      g.fillStyle = '#9aa4ac'; g.fillRect(0, Hc * 0.62, W, Hc * 0.06);
      g.fillRect(W * 0.08, Hc * 0.25, W * 0.5, Hc * 0.03);
      g.fillStyle = '#c8ccd0';
      for (let i = 0; i < 5; i++) g.fillRect(W * (0.1 + i * 0.09), Hc * 0.17, W * 0.06, Hc * 0.08);
      g.fillStyle = '#7a8a94'; g.fillRect(W * 0.7, Hc * 0.1, W * 0.22, Hc * 0.5);
    }), { glow: 0.5 });

    // ── el fondo derecho: el arco de madera de los aseos, el cartel de pala y el cuadro de las llaves ──
    const arco = new THREE.Shape();
    arco.absellipse(0, 0, 0.72, 0.45, 0, Math.PI, false);
    arco.absellipse(0, 0, 0.6, 0.36, Math.PI, 0, true);
    const arcoGeo = new THREE.ShapeGeometry(arco, 16);
    arcoGeo.translate(2.1, 2.25, -4.77);
    k.add(arcoGeo, MADERA);
    const hueco = new THREE.Shape();
    hueco.absellipse(0, 0, 0.6, 0.36, 0, Math.PI, false);
    hueco.lineTo(0.6, 0);
    const huecoGeo = new THREE.ShapeGeometry(hueco, 16);
    huecoGeo.translate(2.1, 2.25, -4.775);
    k.add(huecoGeo, 0xf1f1ec);
    k.pic(2.1, 2.88, -4.79, 1.0, 0.3, 0, 1, canvasTex(512, 154, (g, W, Hc) => {
      g.fillStyle = '#eee3cf'; g.fillRect(0, 0, W, Hc);
      g.fillStyle = '#4a2a18'; g.fillRect(W * 0.14, Hc * 0.06, W * 0.84, Hc * 0.88); g.fillRect(0, Hc * 0.38, W * 0.16, Hc * 0.24);
      g.strokeStyle = 'rgba(30,14,6,.5)'; g.lineWidth = 2;
      for (let y = 10; y < Hc; y += 14) { g.beginPath(); g.moveTo(W * 0.14, y); g.lineTo(W * 0.98, y + 3); g.stroke(); }
      g.font = `${Hc * 0.5}px ${SCRIPT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillStyle = '#f08a3a'; g.fillText('Toilette', W * 0.57, Hc * 0.52);
    }));
    k.box(3.05, 1.1, -4.77, 0.6, 0.8, 0.05, MADERA_CL);
    k.pic(3.05, 1.5, -4.74, 0.5, 0.7, 0, 1, canvasTex(160, 224, (g, W, Hc) => {
      g.fillStyle = '#3a2014'; g.fillRect(0, 0, W, Hc);
      g.fillStyle = '#f2efe6'; g.font = `${Math.round(Hc * 0.06)}px Arial`; g.textAlign = 'center';
      for (let i = 1; i <= 23; i++) {
        const r = Math.floor((i - 1) / 5), c = (i - 1) % 5;
        g.fillText(String(i), W * (0.12 + c * 0.19), Hc * (0.14 + r * 0.18));
      }
    }));
    // la nevera de bebidas de puerta de cristal, contra la pared de la derecha
    k.box(3.08, 0, -3.0, 0.6, 1.85, 0.62, 0xc4c8cc).block(3.08, -3.0, 0.62, 0.62);
    k.pic(2.775, 1.0, -3.0, 0.5, 1.5, -1, 0, canvasTex(128, 384, (g, W, Hc) => {
      g.fillStyle = '#1c2630'; g.fillRect(0, 0, W, Hc);
      g.fillStyle = '#c8102e'; g.fillRect(0, 0, W, Hc * 0.08);
      for (let r = 0; r < 5; r++) {
        g.fillStyle = '#8a949c'; g.fillRect(4, Hc * (0.2 + r * 0.16), W - 8, 3);
        for (let i = 0; i < 5; i++) {
          g.fillStyle = ['#e8c84a', '#3a6a2a', '#c8102e', '#e8e8e8', '#4a2a1a'][(i + r) % 5];
          g.fillRect(10 + i * 22, Hc * (0.2 + r * 0.16) - Hc * 0.1, 12, Hc * 0.1);
        }
      }
    }), { glow: 0.3 });

    // ── la pared de la izquierda: copas y vinos, la vinoteca, más vinos, la pizarra y la tele ──
    const vinos = (kk, x, y, z, w, ry, row) => {
      for (let i = 0; i < 7; i++) {
        const zz = z - w / 2 + 0.1 + i * (w - 0.2) / 6;
        if (row < 2) kk.cyl(x, y, zz, 0.03, 0.025, 0.14, 0xdfe6ea, { seg: 8 });
        else kk.cyl(x, y, zz, 0.034, 0.034, 0.3, [0x3a1418, 0x2f4a1a, 0x5a1a22, 0xd8cfa0][(i + row) % 4], { seg: 8 });
      }
    };
    k.shelf(-3.22, -1.25, 1.4, Math.PI / 2, { h: 2.2, d: 0.32, hex: MADERA_CL, rows: 5, items: vinos });
    k.box(-3.08, 0, 0.3, 0.6, 1.75, 0.6, 0x16181a).block(-3.08, 0.3, 0.6, 0.6);
    k.pic(-2.78, 0.9, 0.3, 0.5, 1.6, 1, 0, canvasTex(128, 400, (g, W, Hc) => {
      g.fillStyle = '#121416'; g.fillRect(0, 0, W, Hc);
      for (let r = 0; r < 9; r++) {
        g.fillStyle = '#3a3a3a'; g.fillRect(W * 0.06, Hc * (0.06 + r * 0.1), W * 0.88, 3);
        for (let i = 0; i < 6; i++) {
          g.fillStyle = ['#4a1a22', '#2f3a1a', '#d8cfa0', '#5a1a22'][(i + r) % 4];
          g.beginPath(); g.arc(W * (0.14 + i * 0.145), Hc * (0.1 + r * 0.1), W * 0.045, 0, Math.PI * 2); g.fill();
        }
      }
    }), { glow: 0.15 });
    k.shelf(-3.22, 1.2, 1.0, Math.PI / 2, { h: 2.0, d: 0.3, hex: MADERA_CL, rows: 4, items: (kk, x, y, z, w, ry, row) => vinos(kk, x, y, z, w, ry, row + 2) });
    k.box(-3.38, 1.2, 2.75, 0.04, 1.05, 1.4, 0x3a2014);
    k.pic(-3.36, 1.72, 2.75, 1.3, 0.95, 1, 0, canvasTex(768, 560, MENU));
    k.box(-3.35, 2.2, 3.9, 0.06, 0.5, 0.85, 0x101114);
    k.pic(-3.31, 2.45, 3.9, 0.8, 0.44, 1, 0, canvasTex(192, 108, (g, W, Hc) => {
      g.fillStyle = '#2a3a4a'; g.fillRect(0, 0, W, Hc);
      g.fillStyle = '#6a9ac8'; g.fillRect(W * 0.1, Hc * 0.15, W * 0.8, Hc * 0.5);
      g.fillStyle = '#e8e4da'; g.fillRect(W * 0.1, Hc * 0.7, W * 0.5, Hc * 0.12);
    }), { glow: 0.35 });

    // ── los cristales: franja esmerilada con las letras (desde dentro se leen del revés) ──
    const vinilo = (text) => canvasTex(768, 160, (g, W, Hc) => {
      g.fillStyle = '#d9dfe0'; g.fillRect(0, 0, W, Hc);
      g.fillStyle = 'rgba(60,66,70,.8)'; g.fillRect(0, Hc * 0.18, W, Hc * 0.04); g.fillRect(0, Hc * 0.26, W, Hc * 0.02);
      g.save(); g.translate(W, 0); g.scale(-1, 1);
      g.font = `${Math.round(Hc * 0.55)}px ${SCRIPT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
      g.lineWidth = Hc * 0.06; g.strokeStyle = '#2f3438'; g.strokeText(text, W / 2, Hc * 0.62);
      g.fillStyle = '#f4f6f6'; g.fillText(text, W / 2, Hc * 0.62);
      g.restore();
    });
    k.pic(-2.15, 1.25, 4.79, 1.86, 0.6, 0, -1, vinilo('Maccheroni'));
    k.pic(2.15, 1.25, 4.79, 1.86, 0.6, 0, -1, vinilo('El Nuevo'));
    k.pic(3.39, 1.25, 0.7, 2.16, 0.6, -1, 0, vinilo('Restaurante'));
    k.pic(3.39, 1.25, 3.3, 2.36, 0.6, -1, 0, vinilo('Pizzería'));

    // ── la puerta: jambas y dintel de madera, el abanico de cristal encima y las dos hojas abiertas ──
    for (const sx of [-1.05, 1.05]) k.box(sx, 0, 4.68, 0.28, 2.3, 0.22, MADERA);
    k.box(0, 2.25, 4.68, 2.38, 0.12, 0.22, MADERA);
    k.pic(0, 2.6, 4.76, 1.6, 0.5, 0, -1, canvasTex(256, 80, (g, W, Hc) => {
      g.fillStyle = '#eee3cf'; g.fillRect(0, 0, W, Hc);
      g.fillStyle = '#cfe4ee'; g.beginPath(); g.ellipse(W / 2, Hc, W * 0.48, Hc * 0.92, 0, Math.PI, 0); g.fill();
      g.strokeStyle = '#3a2418'; g.lineWidth = 5;
      for (let i = 0; i <= 6; i++) { g.beginPath(); g.moveTo(W / 2, Hc); g.lineTo(W / 2 + Math.cos(Math.PI * i / 6) * W * 0.48, Hc - Math.sin(Math.PI * i / 6) * Hc * 0.92); g.stroke(); }
      g.lineWidth = 9; g.beginPath(); g.ellipse(W / 2, Hc, W * 0.48, Hc * 0.92, 0, Math.PI, 0); g.stroke();
    }), { glow: 0.45 });
    for (const sx of [-0.98, 0.98]) {
      k.box(sx, 0, 4.42, 0.07, 2.2, 0.65, 0x2b1e1b);
      k.box(sx, 0.14, 4.42, 0.02, 1.9, 0.52, 0, { list: k.glass });
    }

    // ── las mesas: cuadradas, con mantel marrón o rojo, platos cuadrados blancos y sillas de travesaños ──
    const silla = (x, z, ry) => {
      const c = Math.cos(ry), s = Math.sin(ry);
      const at = (u, v) => [x + u * c + v * s, z - u * s + v * c];
      k.box(x, 0.42, z, 0.42, 0.04, 0.4, 0x8a5a32, { ry });
      for (const [u, v] of [[-0.18, -0.17], [0.18, -0.17], [-0.18, 0.17], [0.18, 0.17]]) {
        const [px, pz] = at(u, v);
        k.box(px, 0, pz, 0.035, 0.42, 0.035, SILLA, { ry });
      }
      for (const u of [-0.18, 0.18]) {
        const [px, pz] = at(u, -0.19);
        k.box(px, 0.42, pz, 0.035, 0.52, 0.035, SILLA, { ry });
      }
      const [bx, bz] = at(0, -0.19);
      for (const y of [0.62, 0.74, 0.86]) k.box(bx, y, bz, 0.36, 0.05, 0.02, SILLA, { ry });
    };
    const tables = [[-1.9, -0.7, ROJO], [-1.9, 0.2, ROJO], [0.7, -0.9, MARRON], [0.7, 1.0, MARRON],
      [2.5, -0.9, MARRON], [2.5, 1.0, ROJO], [2.5, 2.9, MARRON], [-2.3, 2.6, MARRON]];
    for (const [x, z, mantel] of tables) {
      k.table(x, z, { w: 0.85, d: 0.85, top: mantel, cloth: mantel });
      silla(x - 0.62, z, Math.PI / 2);
      silla(x + 0.62, z, -Math.PI / 2);
      for (const sx of [-0.24, 0.24]) {
        k.box(x + sx, 0.762, z, 0.22, 0.005, 0.22, 0xf6f4ee);
        k.box(x + sx, 0.765, z + 0.15, 0.02, 0.004, 0.16, 0xc9ccd0);
      }
      // la lámpara de mimbre de encima, con su franja oscura
      k.pendant(x, z, H, { drop: 1.05, shade: MIMBRE, r: 0.3 });
      k.cyl(x, H - 1.03, z, 0.28, 0.29, 0.05, 0x6a4a2a, { seg: 18 });
    }
    k.pendant(0, 2.7, H, { drop: 1.0, shade: MIMBRE, r: 0.3 });
    k.cyl(0, H - 0.98, 2.7, 0.28, 0.29, 0.05, 0x6a4a2a, { seg: 18 });

    // ── el pasillo de los aseos: blanco, con suelo oscuro y las puertas de Señoras y Caballeros ──
    k.room(1.5, -8.4, 2.7, -4.8, {
      h: 2.7, floor: 'dark', wall: 0xf1f1ec, ceil: 0xf6f6f2, base: MADERA, lights: 'panel',
      open: { s: [[0, 1.2, 'door']] },
    });
    const placa = (texto, color) => canvasTex(128, 160, (g, W, Hc) => {
      g.fillStyle = '#c9a54a'; g.fillRect(0, 0, W, Hc);
      g.fillStyle = color;
      g.beginPath(); g.arc(W / 2, Hc * 0.18, W * 0.08, 0, Math.PI * 2); g.fill();
      g.fillRect(W * 0.4, Hc * 0.28, W * 0.2, Hc * 0.32);
      g.fillRect(W * 0.41, Hc * 0.58, W * 0.07, Hc * 0.16); g.fillRect(W * 0.52, Hc * 0.58, W * 0.07, Hc * 0.16);
      g.fillStyle = '#2a2018'; g.font = `700 ${Math.round(Hc * 0.1)}px Arial`; g.textAlign = 'center';
      g.fillText(texto, W / 2, Hc * 0.9);
    });
    for (const [z, texto, color] of [[-6.0, 'SEÑORAS', '#c8102e'], [-7.5, 'CABALLEROS', '#1c1c1e']]) {
      k.box(2.685, 0, z, 0.03, 2.18, 0.97, MADERA_CL, { list: k.shell });
      k.box(2.66, 0, z, 0.04, 2.1, 0.85, 0x9a5a2a);
      k.box(2.63, 1.0, z + 0.3, 0.03, 0.03, 0.12, 0xc9a54a);
      k.pic(2.635, 1.6, z, 0.22, 0.27, -1, 0, placa(texto, color));
    }

    return {
      spawn: [0, 3.6, Math.PI], exit: [0, 4.5],
      // te puedes sentar en cualquier silla libre (locales.js) y pedir unos espaguetis desde la mesa
      seats: tables.flatMap(([x, z]) => [
        { at: [x - 0.62, z], face: Math.PI / 2, plate: [x - 0.24, 0.785, z] },
        { at: [x + 0.62, z], face: -Math.PI / 2, plate: [x + 0.24, 0.785, z] },
      ]),
      order: {
        label: 'Pedir unos espaguetis', again: 'Pedir otro plato de espaguetis', who: 'Andrea', wait: 7, eat: 14,
        talk: (c) => [
          { who: c.me, text: '¡Andrea! ¿Me pones unos espaguetis?', player: true },
          { who: 'Andrea', text: '¡Certo! ¿Boloñesa o carbonara?' },
          { who: c.me, text: 'Boloñesa, la de Elvis, que huele desde la calle.', player: true },
          { who: 'Andrea', text: '¡Perfetto! Elvis, ¡unos spaghetti alla bolognese para la mesa!' },
        ],
        served: () => 'Ecco qua: spaghetti alla bolognese. ¡Buon appetito!',
        after: () => '¡Mmm, qué buenos! Pasta fresca de verdad.',
        plate: spaghettiPlate,
        apply: eat('El Nuevo Maccheroni', 40),
      },
      npcs: [
        {
          name: 'Andrea', at: [-0.9, 3.5], face: 0, pose: 'host',
          look: { sex: 'm', skin: 0xe2b896, hair: 0xd8b878, hairStyle: 'short', beard: false, top: 0x1c1c1e, topStyle: 'long', bottom: 0x2e3844, bottomStyle: 'pants', shoes: 0x5a3a22, shoeStyle: 'shoe', eyes: 0x3a2616, height: 1.8 },
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
          name: 'Elvis', at: [-1.3, -3.6], face: Math.PI, pose: 'chef',
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
        { name: '', at: [0.08, 1.0], face: Math.PI / 2, pose: 'sit', detail: 1, look: { sex: 'f', skin: 0xe8c4a2, hair: 0x5a4028, hairStyle: 'long', top: 0xd88a9a, topStyle: 'tshirt', bottom: 0x34465c, bottomStyle: 'pants', shoes: 0xf2f2f2, height: 1.64 } },
        { name: '', at: [1.32, 1.0], face: -Math.PI / 2, pose: 'sit', detail: 1, look: { sex: 'm', skin: 0xd9a882, hair: 0x1e1712, hairStyle: 'short', top: 0x3a5f8a, topStyle: 'tshirt', bottom: 0x2c3440, bottomStyle: 'pants', shoes: 0x1e1e20, height: 1.78 } },
        { name: '', at: [1.88, -0.9], face: Math.PI / 2, pose: 'sit', detail: 1, look: { sex: 'm', old: true, skin: 0xe8c4a2, hair: 0xc8c8c4, hairStyle: 'calvo', top: 0xe8e4da, topStyle: 'long', bottom: 0x6b5844, bottomStyle: 'pants', shoes: 0x6a4a30, height: 1.72 } },
        { name: '', at: [3.12, -0.9], face: -Math.PI / 2, pose: 'sit', detail: 1, look: { sex: 'f', old: true, skin: 0xf1d3b8, hair: 0xe2e0da, hairStyle: 'short', top: 0x2c4f86, topStyle: 'long', bottom: 0x1c1c1e, bottomStyle: 'skirt', shoes: 0x1e1e20, height: 1.6 } },
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
