import { byVisit, pick, poster } from './localesCommon.js';

/**
 * Crossfit Lanzarote por dentro (Calle Polca, Arrecife): el "box" de Oliver, con la persiana de la entrada subida
 * y la puerta abierta de par en par. Es un box de crossfit genérico, hecho con lo que se ve en cualquier box:
 * suelo de goma, estructura de dominadas, racks con barras y discos, cajones de salto, remos, kettlebells, cuerdas,
 * una pizarra con el WOD del día y espejo. Es una recreación para el juego: no hay horarios, precios, nombres de
 * entrenadores ni datos reales del negocio inventados (solo el nombre del local, que es el del rótulo de la calle).
 *
 * Medidas (metros del interior, z hacia dentro negativo): una sola sala x −10…10, z 0…14. La entrada está en el lado
 * sur (z = 14), ancha, y de frente queda la estructura de dominadas, pegada a la pared del fondo.
 */

const ROJO = 0xd1261c, NEGRO = 0x1a1a1c, GOMA = 0x2a2c30, ACERO = 0xb8bcc0, GRIS = 0x8a8e92;

const PIELES = [0xf0cfb0, 0xe2b896, 0xc89a72, 0x9a6a4a, 0xe8c4a2];
const PELOS = [0x1e1712, 0x3a2a1c, 0x6a4a2a, 0x101010];

function atleta(i, top, extra = {}) {
  const f = i % 2 === 0;
  return {
    sex: f ? 'f' : 'm', skin: PIELES[i % PIELES.length], hair: PELOS[i % PELOS.length],
    hairStyle: f ? pick(['ponytail', 'bun']) : pick(['short', 'rapado']), beard: false,
    top, topStyle: 'tshirt', bottom: 0x1e2024, bottomStyle: 'shorts', shoes: 0xf4f4f2, shoeStyle: 'sneaker',
    height: f ? 1.66 : 1.82, ...extra,
  };
}

const wod = (h) => { h.heal(); h.addMinutes(45); h.toast('Una clase de crossfit · salud al 100%'); };

function sala(k, canvasTex) {
  k.room(-10, 0, 10, 14, {
    h: 4.8, floor: 'dark', wall: 0xe4e4e0, ceil: 0x3a3c40,
    open: { s: [[6, 14, 'arch']] },
  });

  // rótulos de la pared del fondo
  k.pic(-5.5, 3.5, 0.02, 7, 1.0, 0, 1, canvasTex(1024, 146, poster({ bg: '#1a1a1c', fg: '#ffffff', title: 'CROSSFIT LANZAROTE', accent: '#d1261c' })), { glow: 0.3 });
  // pizarra del WOD (solo el formato; nada de datos reales)
  k.pic(5.5, 2.4, 0.02, 4, 2.0, 0, 1, canvasTex(512, 256, (g, W, H) => {
    g.fillStyle = '#f4f4f2'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#d1261c'; g.fillRect(0, 0, W, 46);
    g.fillStyle = '#fff'; g.font = '800 34px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('WOD DEL DÍA', W / 2, 24);
    g.fillStyle = '#111'; g.font = '700 28px Arial'; g.textAlign = 'left';
    ['AMRAP 12 MIN', '10 Sentadillas con balón', '8 Dominadas', '6 Burpees', 'Remo 250 m'].forEach((l, i) => g.fillText(l, 22, 84 + i * 36));
  }));

  // estructura de dominadas y anillas: pegada a la pared del fondo
  for (const x of [-9, -6, -3, 0, 3]) k.cyl(x, 0, 1.6, 0.05, 0.05, 3.2, ACERO, { seg: 8 });
  k.box(-9, 3.1, 1.6, 12.2, 0.07, 0.07, ACERO);
  k.box(-9, 2.4, 1.6, 12.2, 0.05, 0.05, GRIS);
  for (const x of [-7.8, -7.3]) k.box(x, 0.5, 1.6, 0.04, 2.6, 0.04, 0x3a6a8a); // anillas colgando
  for (const x of [-4.4, -4.0]) k.cyl(x, 0.0, 1.6, 0.04, 0.04, 3.0, 0xc8a46a, { seg: 6 }); // cuerdas
  k.block(-3, 1.6, 12.4, 0.5);

  // racks de sentadilla con barra y discos
  for (const x of [6, 9]) {
    for (const s of [-1, 1]) k.box(x + s * 0.7, 0, 6, 0.08, 2.4, 0.08, ROJO);
    k.box(x - 0.74, 2.4, 6, 1.5, 0.08, 0.08, ROJO);
    k.cyl(x, 1.45, 6, 0.018, 0.018, 2.2, ACERO, { seg: 6, rx: Math.PI / 2, ry: Math.PI / 2 });
    for (const s of [-1, 1]) k.cyl(x + s * 0.95, 1.45, 6, 0.22, 0.22, 0.06, NEGRO, { seg: 12, rx: Math.PI / 2, ry: Math.PI / 2 });
    k.block(x, 6, 2.2, 0.8);
  }

  // cajones de salto (tres alturas)
  k.box(-9, 0, 9, 0.9, 0.5, 0.9, 0xc8a46a);
  k.box(-7.8, 0, 9, 0.8, 0.6, 0.8, 0xc8a46a);
  k.box(-6.7, 0, 9, 0.7, 0.75, 0.7, 0xc8a46a);
  k.block(-7.8, 9, 3.2, 1);

  // remos (ergómetros) en fila
  for (const x of [-2.5, -1.2, 0.1]) {
    k.box(x, 0.0, 8.6, 0.34, 0.12, 2.2, NEGRO);
    k.box(x, 0.12, 7.6, 0.3, 0.55, 0.3, GRIS);
    k.box(x, 0.65, 7.6, 0.28, 0.2, 0.06, NEGRO);
    k.block(x, 8.6, 0.5, 2.3);
  }

  // estante de kettlebells y balones medicinales
  k.box(9.4, 0, 11, 0.5, 0.5, 4, GRIS);
  k.box(9.4, 0.5, 11, 0.5, 0.05, 4, GOMA);
  for (let i = 0; i < 6; i++) {
    k.cyl(9.35, 0.58, 9.3 + i * 0.6, 0.16, 0.16, 0.2, NEGRO, { seg: 10 });
    k.cyl(9.35, 0.74, 9.3 + i * 0.6, 0.06, 0.06, 0.1, NEGRO, { seg: 8 });
  }
  k.block(9.4, 11, 0.6, 4);

  // zona de discos y cuerda de saltar: bancos y banda de goma de colores
  k.box(-9.5, 0, 11.5, 0.6, 0.3, 2.4, GRIS);
  for (let i = 0; i < 4; i++) k.cyl(-9.5, 0.3 + i * 0.07, 11.5, 0.3, 0.3, 0.06, [ROJO, NEGRO, ROJO, NEGRO][i], { seg: 12 });
  k.block(-9.5, 11.5, 0.7, 2.5);

  // zona libre de tatami para el trabajo en el suelo
  k.rug(-1, 11.5, 6, 3.2, 0, 0x3a3c42);
}

function gente() {
  const lista = [
    {
      name: 'Entrenador', at: [-1, 10.5], face: Math.PI, pose: 'stand', detail: 1, look: atleta(1, ROJO, { bottom: 0x101010 }),
      greet: () => '¡Pasa, pasa! ¿Vienes a probar?',
      talk: byVisit([
        (c) => [{ who: 'Entrenador', text: 'Aquí se entrena en grupo: calentamos, hacemos la técnica y luego el WOD.' }, { who: c.me, text: '¿Y si no he hecho crossfit nunca?', player: true }, { who: 'Entrenador', text: 'Todo se escala. Se empieza con lo que puedas y se va subiendo.' }],
        (c) => [{ who: 'Entrenador', text: 'Si quieres un reto, fuera tengo un WOD de calle: tres puntos por el barrio y vuelta aquí.' }, { who: c.me, text: '¿Dónde te encuentro?', player: true }, { who: 'Entrenador', text: 'En la acera, justo delante de la puerta.' }],
      ]),
      offer: {
        label: 'Clase de crossfit', price: 0, apply: wod,
        talk: (c) => [{ who: c.me, text: 'Me apunto a una clase.', player: true }, { who: 'Entrenador', text: '¡Vamos! Calienta, que empezamos ya.' }],
      },
    },
    // la gente entrenando
    { name: '', at: [-8.4, 2.9], face: Math.PI, pose: 'pullup', detail: 1, look: atleta(2, 0xe8e8e4) },
    { name: '', at: [-5.2, 2.9], face: Math.PI, pose: 'pullup', detail: 1, look: atleta(3, 0x2c4f86) },
    { name: '', at: [6, 5.2], face: -Math.PI / 2 + Math.PI / 2, pose: 'squat', detail: 1, look: atleta(5, 0x1e2024) },
    { name: '', at: [9, 5.2], face: 0, pose: 'press', detail: 1, look: atleta(4, 0xc87a9a) },
    { name: '', at: [3, 4.6], face: Math.PI, pose: 'kettle', detail: 1, look: atleta(7, 0x5a8a5a) },
    { name: '', at: [-4, 12.2], face: Math.PI / 2, pose: 'squat', detail: 1, look: atleta(6, 0xd8271c) },
    { name: '', at: [1.2, 12.4], face: 0, pose: 'press', detail: 1, look: atleta(8, 0x3a3c42) },
  ];
  return lista;
}

export const CROSSFIT_LANZAROTE = {
  id: 'crossfit-lanzarote',
  name: 'Crossfit Lanzarote',
  glyph: 'C',
  color: ROJO,
  // la puerta del lado corto que da a la Calle Polca (edificio del gimnasio, ~Calle Polca 2)
  door: { x: -1834.5, z: -1553.6, nx: -0.897, nz: 0.442 },
  doorWidth: 3.2,
  frameColor: 0x1a1a1c,
  ownFront: true,
  openDoor: true,
  sign: { size: [4.4, 0.9], y: 3.4, edge: 0x1a1a1c, px: [1024, 210], draw: poster({ bg: '#1a1a1c', fg: '#ffffff', title: 'CROSSFIT LANZAROTE', accent: '#d1261c' }) },
  light: { sun: 0xffffff, sunI: 1.3, hemiI: 1.1, sky: 0xe8eef2, ground: 0x7a7e82, exposure: 0.95 },
  build(k, { canvasTex }) {
    sala(k, canvasTex);
    return { spawn: [0, 12.6, Math.PI], exit: [0, 13.4], npcs: gente(), seats: [] };
  },
};
