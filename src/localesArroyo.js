import * as THREE from 'three';
import { byVisit, classicSign, fit, SERIF, SANS } from './localesCommon.js';
import { Kit, canvasTex, glowMaterial } from './interiorKit.js';
import { brandTexture } from './brand.js';
import { windowGlow } from './realism.js';
import { findBuilding } from './civic.js';

/**
 * Funeraria Arroyo (Manolo Millares 48, la antigua calle José Antonio; la
 * lleva Michael) y el nuevo Tanatorio Arroyo de Juan de Quesada 31, con su
 * rótulo grande, las salas de velatorio y el patio canario para las
 * ceremonias. La fachada del tanatorio es la de la foto: casa terrera blanca
 * con zócalo y molduras gris lila; por el lateral que sube, una puerta y,
 * un poco más arriba, la entrada a la oficina de Canary Consulting.
 * Los servicios son los que publican en su web (funerariaarroyo.es); el
 * teléfono, el mismo en los dos, es el de Michael.
 */

const GREEN = '#1f3b33', GOLD = '#c9a96a', CREAM = '#f4efe2';
const PHONE = '658 753 941';   // el de Michael: funeraria y tanatorio

const MICHAEL = {
  sex: 'm', skin: 0xe2b896, hair: 0x2a1d14, hairStyle: 'short', beard: false, top: 0x1d2633, topStyle: 'jacket', inner: 0xf2f2f2,
  bottom: 0x1d2633, bottomStyle: 'pants', shoes: 0x141414, shoeStyle: 'shoe', eyes: 0x3a2616, height: 1.8, build: 1.02,
};

/** una corbata oscura sobre la camisa blanca */
function dressSuit(p) {
  const t = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.34, 0.015), new THREE.MeshStandardMaterial({ color: 0x2a3f5a, roughness: 0.5 }));
  t.position.set(0, 0.22, 0.14);
  t.rotation.x = -0.08;
  p.spine.add(t);
}

// ── Funeraria Arroyo ──
export const FUNERARIA = {
  id: 'funeraria',
  name: 'Funeraria Arroyo',
  glyph: 'F',
  color: 0x2f7a5f,
  door: { x: -227.0, z: 316.0, nx: 0.088, nz: 0.996 },
  sign: { size: [4.6, 0.95], y: 3.0, px: [1024, 212], draw: classicSign({ bg: GREEN, fg: CREAM, line: GOLD, title: 'FUNERARIA ARROYO', sub: `24 HORAS · ${PHONE}` }), edge: 0x1f3b33 },
  light: { sun: 0xfff2e2, exposure: 0.78, sky: 0xfff6ea, ground: 0x7a6c5e },
  build(k) {
    const H = 3.0;
    k.room(-4.5, -5, 4.5, 5, {
      h: H, floor: 'dark', wall: 0xe9e5dd, ceil: 0xf6f4f0,
      open: { s: [[-3.8, -1.6, 'window'], [-0.8, 0.8, 'door'], [1.6, 3.8, 'window']] },
    });
    // mostrador de nogal con su silla
    k.counter(1.6, -2.7, 2.6, 0.65, 0, { front: 0x3a2a20, top: 0xe8e2d8 });
    k.chair(1.6, -3.5, 0, 0x1c1c1e);
    // rótulo de la casa en la pared del fondo, con una consola y flores blancas debajo
    k.box(0, 1.55, -4.97, 3.5, 0.95, 0.04, 0x1f3b33, { list: k.shell });
    k.pic(0, 2.02, -4.94, 3.3, 0.78, 0, 1, canvasTex(1024, 242, classicSign({ bg: GREEN, fg: CREAM, line: GOLD, title: 'FUNERARIA ARROYO', sub: 'Al lado de las familias de Lanzarote' })));
    k.box(-2.4, 0, -4.7, 1.4, 0.8, 0.4, 0x3a2a20).plant(-2.4, -4.7, { h: 1.25, pot: 0x3a2a20, leaf: 0x3f6a46, flowers: 0xf8f6f0, r: 0.32 });
    // zona de espera: sofá, sillones y mesa baja con un centro de flores
    k.sofa(-3.75, 0.6, 2.0, Math.PI / 2, 0x6b6a68);
    k.sofa(-1.75, -0.2, 0.95, -Math.PI / 2, 0x6b6a68).sofa(-1.75, 1.4, 0.95, -Math.PI / 2, 0x6b6a68);
    k.box(-2.75, 0, 0.6, 0.7, 0.42, 1.1, 0x3a2a20).block(-2.75, 0.6, 0.7, 1.1);
    k.ball(-2.75, 0.55, 0.6, 0.16, 0xf8f6f0).ball(-2.75, 0.55, 0.45, 0.1, 0x9ac08a);
    k.rug(-2.75, 0.6, 2.6, 2.8, 0, 0xbab2a4);
    // urnas en la estantería de la derecha
    k.shelf(4.27, -2.6, 2.0, -Math.PI / 2, {
      h: 2.0, d: 0.36, hex: 0x3a2a20, rows: 4,
      items: (kk, x, y, z, w, ry, row) => {
        for (let i = 0; i < 4; i++) {
          const zz = z - w / 2 + 0.22 + i * (w - 0.44) / 3;
          const c = [0x8a6a3a, 0xece8e0, 0x5a3a28, 0x6a7a86][(i + row) % 4];
          kk.cyl(x, y, zz, 0.09, 0.07, 0.26, c, { seg: 14 }).ball(x, y + 0.27, zz, 0.06, c, { sy: 0.6 });
        }
      },
    });
    // féretro de muestra sobre su peana, con un ramo encima
    k.box(3.1, 0, 1.7, 0.75, 0.42, 2.1, 0x2a2420).box(3.1, 0.42, 1.7, 0.66, 0.42, 2.0, 0x5a3422).box(3.1, 0.84, 1.7, 0.6, 0.08, 1.92, 0x6a4028);
    for (const z of [1.1, 1.7, 2.3]) for (const s of [-1, 1]) k.box(3.1 + s * 0.34, 0.6, z, 0.02, 0.05, 0.22, 0xc9a96a);
    k.ball(3.1, 0.98, 1.7, 0.18, 0xf8f6f0, { sx: 1.4 }).ball(3.1, 0.96, 1.45, 0.08, 0x9ac08a);
    k.block(3.1, 1.7, 0.75, 2.1);
    // flores en la entrada y un cuadro del mar
    k.plant(-3.9, 4.3, { h: 1.4, flowers: 0xf8f6f0 }).plant(3.9, 4.3, { h: 1.4, flowers: 0xf8f6f0 });
    k.pic(-4.47, 1.7, -2.6, 1.6, 1.0, 1, 0, canvasTex(512, 320, seaPainting));
    return {
      spawn: [0, 2.9, Math.PI], exit: [0, 4.55],
      npcs: [{
        name: 'Michael', at: [0.3, -1.7], face: 0, pose: 'host', look: MICHAEL, dress: dressSuit,
        greet: () => 'Buenas, pase. Soy Michael, de Funeraria Arroyo. ¿En qué le puedo ayudar?',
        talk: byVisit([
          (c) => [
            { who: 'Michael', text: 'Le cuento lo que hacemos: velatorios las 24 horas, inhumaciones y cremaciones, con sus urnas.' },
            { who: c.me, text: '¿Y si la familia vive fuera de la isla?', player: true },
            { who: 'Michael', text: 'Hacemos traslados nacionales e internacionales y nos encargamos de toda la documentación, aquí y fuera.' },
          ],
          (c) => [
            { who: 'Michael', text: 'Organizamos ceremonias para todas las religiones, con arreglos florales y catering para la familia.' },
            { who: c.me, text: 'No sabía que hacíais tanto.', player: true },
            { who: 'Michael', text: 'También lápidas de diseño y, si la familia lo quiere, despedir las cenizas en el mar.' },
          ],
          (c) => [
            { who: 'Michael', text: 'Trabajamos con la mayoría de las compañías de seguros y damos financiación a medida.' },
            { who: c.me, text: 'Eso quita mucho peso en un momento así.', player: true },
            { who: 'Michael', text: `Esa es la idea: que la familia solo tenga que despedirse. Del resto nos ocupamos nosotros, día y noche: ${PHONE}.` },
          ],
          (c) => [
            { who: 'Michael', text: 'Y en la calle Juan de Quesada, junto al Charco, está el Tanatorio Arroyo: salas de velatorio y un patio canario para las ceremonias.' },
            { who: c.me, text: 'Me paso a verlo.', player: true },
            { who: 'Michael', text: 'Cuando quiera. También le orientamos con la herencia y la sucesión, sin compromiso.' },
          ],
        ]),
      }],
    };
  },
};

// ── Tanatorio Arroyo ──
export const TANATORIO = {
  id: 'tanatorio',
  name: 'Tanatorio Arroyo',
  glyph: 'T',
  color: 0x2f7a5f,
  doorWidth: 1.7,
  // en el centro de la casa terrera de la esquina (Juan de Quesada 31)
  door: { x: 679.6, z: -42.8, nx: 0.726, nz: 0.688 },
  sign: {
    size: [8.6, 0.82], y: 3.78, px: [1536, 146], edge: 0x1f3b33,
    draw: classicSign({ bg: GREEN, fg: CREAM, line: GOLD, title: `TANATORIO ARROYO · 24 HORAS · ${PHONE}` }),
  },
  light: { sun: 0xfff4e6, exposure: 0.8, sky: 0xfff8ee, ground: 0x80766a },
  build(k, { canvasTex: tex }) {
    // vestíbulo
    k.room(-5, 2, 5, 9, {
      h: 3.4, floor: 'stone', wall: 0xeee9e0, ceil: 0xf8f6f2,
      open: { s: [[-4.3, -1.8, 'window'], [-1.1, 1.1, 'door'], [1.8, 4.3, 'window']], n: [[3.5, 6.5, 'door']], e: [[2.6, 4.4, 'door']], w: [[2.6, 4.4, 'door']] },
    });
    k.pic(0, 2.82, 2.03, 4.4, 0.8, 0, 1, tex(1024, 186, classicSign({ bg: GREEN, fg: CREAM, line: GOLD, title: 'TANATORIO ARROYO' })), { glow: 0.35 });
    k.counter(3.4, 6.9, 2.0, 0.6, -Math.PI / 2, { front: 0x3a2a20, top: 0xe8e2d8 });
    k.sofa(-3.6, 6.6, 1.8, Math.PI / 2, 0x6b6a68);
    k.plant(-4.3, 8.3, { h: 1.5, flowers: 0xf8f6f0 }).plant(4.3, 8.3, { h: 1.5 });
    for (const [x, t] of [[5, 'SALA 1'], [-5, 'SALA 2']]) {
      k.pic(x - Math.sign(x) * 0.03, 2.5, 5.5, 1.2, 0.32, -Math.sign(x), 0, tex(384, 102, classicSign({ bg: GREEN, fg: CREAM, line: GOLD, title: t, serif: false })));
    }
    // salas de velatorio, una a cada lado
    for (const s of [1, -1]) {
      const x0 = s > 0 ? 5 : -12, x1 = s > 0 ? 12 : -5;
      k.room(x0, 2, x1, 9, {
        h: 3.1, floor: 'wood', wall: 0xece7dd, ceil: 0xf8f6f2,
        open: s > 0 ? { w: [[2.6, 4.4, 'door']], e: [[1.2, 5.8, 'window']] } : { e: [[2.6, 4.4, 'door']], w: [[1.2, 5.8, 'window']] },
      });
      const cx = (x0 + x1) / 2;
      k.sofa(cx, 8.4, 2.4, Math.PI, 0x6b6a68).sofa(cx + s * 2.95, 5.6, 1.8, s > 0 ? -Math.PI / 2 : Math.PI / 2, 0x6b6a68);
      k.box(cx, 0, 6.6, 1.2, 0.42, 0.6, 0x3a2a20).block(cx, 6.6, 1.2, 0.6);
      k.ball(cx, 0.55, 6.6, 0.14, 0xf8f6f0);
      // al fondo, el rincón de la despedida: flores y luz cálida
      k.box(cx, 0, 2.5, 2.4, 0.5, 0.7, 0x3a2a20).block(cx, 2.5, 2.4, 0.7);
      for (const dx of [-0.8, 0, 0.8]) k.ball(cx + dx, 0.66, 2.5, 0.2, dx ? 0xf8f6f0 : 0xf2d0d8, { sx: 1.2 });
      k.plant(cx - 1.6, 2.6, { h: 1.6, flowers: 0xf8f6f0, r: 0.35 }).plant(cx + 1.6, 2.6, { h: 1.6, flowers: 0xf8f6f0, r: 0.35 });
      k.box(cx, 2.2, 2.04, 1.8, 0.04, 0.04, 0xffe2b0, { list: k.glow });
    }
    // patio canario (las ceremonias): cielo abierto, balcones de tea, piedra, palmeras y sillas
    k.room(-6, -9, 6, 2, {
      h: 6.5, floor: 'stone', wall: 0xf4f1ea, ceil: 0xcfe3f2, lights: null, open: { s: [[4.5, 7.5, 'door']] },
    });
    k.box(0, 6.44, -3.5, 12, 0.04, 11, 0xd8ecf8, { list: k.glow });
    for (const [x0, z0, x1, z1] of [[-6, -9, 6, -9], [-6, -9, -6, 2], [6, -9, 6, 2]]) {
      const len = Math.hypot(x1 - x0, z1 - z0), ux = (x1 - x0) / len, uz = (z1 - z0) / len, nx = uz ? (x0 < 0 ? 1 : -1) : 0, nz = uz ? 0 : 1;
      const mx = (x0 + x1) / 2 + nx * 0.6, mz = (z0 + z1) / 2 + nz * 0.6, ry = Math.atan2(nx, nz);
      k.box(mx, 3.3, mz, len - 1.2, 0.1, 1.2, 0x4a2e1c, { ry });
      k.box(mx + nx * 0.55, 3.4, mz + nz * 0.55, len - 1.2, 0.08, 0.08, 0x4a2e1c, { ry });
      k.box(mx + nx * 0.55, 4.25, mz + nz * 0.55, len - 1.2, 0.08, 0.08, 0x4a2e1c, { ry });
      for (let s2 = -len / 2 + 0.9; s2 < len / 2 - 0.6; s2 += 0.22) {
        k.box(mx + nx * 0.55 + ux * s2, 3.4, mz + nz * 0.55 + uz * s2, 0.04, 0.85, 0.04, 0x5a3a24);
      }
    }
    for (const [x, z] of [[-4.8, -7.8], [4.8, -7.8], [-4.8, 0.8], [4.8, 0.8]]) k.plant(x, z, { h: 2.6, pot: 0x8a6a4a, leaf: 0x2f6b3a, r: 0.6 });
    k.box(0, 0, -7.6, 0.6, 1.1, 0.45, 0x3a2a20).block(0, -7.6, 0.6, 0.45);
    k.plant(-1.6, -7.8, { h: 1.6, flowers: 0xf8f6f0, r: 0.4 }).plant(1.6, -7.8, { h: 1.6, flowers: 0xf8f6f0, r: 0.4 });
    for (let row = 0; row < 4; row++) for (let i = 0; i < 6; i++) {
      if (i === 2 || i === 3) continue;
      k.chair(-3.5 + i * 1.4, -5.2 + row * 1.25, Math.PI, 0xece8e0, { legs: 0x8a8f96 });
    }
    return {
      spawn: [0, 6.9, Math.PI], exit: [0, 8.55],
      npcs: [{
        name: 'Recepción', at: [4.15, 6.9], face: -Math.PI / 2, pose: 'counter',
        look: { sex: 'f', skin: 0xe8c4a2, hair: 0x3a2a1c, hairStyle: 'bun', top: 0x1d2633, topStyle: 'jacket', inner: 0xf2f2f2, bottom: 0x1d2633, bottomStyle: 'skirt', shoes: 0x141414, shoeStyle: 'shoe', height: 1.66 },
        greet: () => 'Buenas, bienvenido al Tanatorio Arroyo.',
        talk: byVisit([
          (c) => [
            { who: 'Recepción', text: 'Atendemos las 24 horas, todos los días del año.' },
            { who: c.me, text: '¿Qué hay aquí dentro?', player: true },
            { who: 'Recepción', text: 'Salas de velatorio tranquilas y amplias, y al fondo el patio canario, para las ceremonias. Pase y véalo.' },
          ],
          (c) => [
            { who: 'Recepción', text: `Para lo que necesite, llámenos al ${PHONE}. De día o de noche siempre hay alguien.` },
            { who: c.me, text: 'Muy bonito todo, la verdad.', player: true },
            { who: 'Recepción', text: 'Gracias. Está pensado para que las familias de Arrecife se despidan con calma.' },
          ],
          (c) => [
            { who: 'Recepción', text: 'Somos Funeraria Arroyo: traslados, velatorios, cremaciones, ceremonias para todas las religiones...' },
            { who: c.me, text: '¿Y la funeraria dónde está?', player: true },
            { who: 'Recepción', text: 'En la calle Manolo Millares, la antigua José Antonio. Allí le atiende Michael.' },
          ],
        ]),
      }],
    };
  },
};

function seaPainting(g, W, H) {
  const sky = g.createLinearGradient(0, 0, 0, H * 0.6);
  sky.addColorStop(0, '#f2c89a'); sky.addColorStop(1, '#f6e6c8');
  g.fillStyle = sky; g.fillRect(0, 0, W, H * 0.6);
  const sea = g.createLinearGradient(0, H * 0.6, 0, H);
  sea.addColorStop(0, '#5a8aa6'); sea.addColorStop(1, '#2a4a62');
  g.fillStyle = sea; g.fillRect(0, H * 0.6, W, H * 0.4);
  g.fillStyle = 'rgba(255,240,210,.9)'; g.beginPath(); g.arc(W * 0.7, H * 0.55, 34, Math.PI, 0); g.fill();
  g.strokeStyle = '#3a2a20'; g.lineWidth = 14; g.strokeRect(0, 0, W, H);
}

// ── la casa terrera de Juan de Quesada 31 (fachada y lateral, como en las fotos) ──
const LILAC = 0xa9a5b8, WHITE = 0xf3f2ee, FRAME = 0x16181b, GLASS = 0x22303c;
const CORNER = [684.8, -48.2];                 // esquina de Juan de Quesada con el lateral
const N_FRONT = [0.726, 0.688], N_SIDE = [0.702, -0.712];

/** el edificio del tanatorio es de una planta y blanco (antes de levantar la ciudad) */
export function tuneTanatorio(map) {
  const b = findBuilding(map, CORNER[0] - 8, CORNER[1] - 2);
  if (!b) return;
  b.h = 4.3;
  b.f = [243, 242, 238];
  b.s = 0;
}

function blueplate(g, W, H) {
  g.fillStyle = '#1a4fa0'; g.fillRect(0, 0, W, H);
  g.strokeStyle = '#ffffff'; g.lineWidth = 6; g.strokeRect(8, 8, W - 16, H - 16);
  g.fillStyle = '#ffffff'; g.textAlign = 'center'; g.textBaseline = 'middle';
  fit(g, 'CALLE', W / 2, H * 0.3, W - 40, 26, '700', SANS);
  fit(g, 'JUAN DE QUESADA', W / 2, H * 0.64, W - 40, 44, '800', SANS);
}

/** ventana o puerta de aluminio negro con su recercado gris (x centro, y0 abajo) */
function opening(k, x, y0, w, h, { transom = 0, mullion = true, glass = GLASS, surround = 0.22 } = {}) {
  k.box(x, Math.max(0, y0 - surround), 0.035, w + surround * 2, h + surround * (y0 > 0 ? 2 : 1), 0.03, LILAC);
  k.box(x, y0, 0.06, w, h, 0.02, glass);
  const f = 0.055;
  k.box(x - w / 2 + f / 2, y0, 0.075, f, h, 0.03, FRAME).box(x + w / 2 - f / 2, y0, 0.075, f, h, 0.03, FRAME);
  k.box(x, y0, 0.075, w, f, 0.03, FRAME).box(x, y0 + h - f, 0.075, w, f, 0.03, FRAME);
  if (transom) k.box(x, y0 + h - transom, 0.075, w, f, 0.03, FRAME);
  if (mullion) k.box(x, y0, 0.075, f, h - (transom || 0), 0.03, FRAME);
}

/** aplique negro de pared (cubito) que se enciende de noche */
function lamp(k, x, y) {
  k.box(x, y, 0.1, 0.13, 0.13, 0.13, 0x111214);
  k.box(x, y - 0.012, 0.1, 0.09, 0.012, 0.09, 0xffd9a0, { list: k.glow });
}

/** ficus de la acera, con el tronco encalado */
function ficus(k, x, z) {
  k.cyl(x, 0, z, 0.08, 0.11, 2.4, 0xd9d5ca, { seg: 10 });
  for (const [dx, dy, dz, r] of [[0, 2.9, 0, 0.95], [0.45, 2.75, 0.2, 0.6], [-0.4, 2.8, -0.25, 0.62], [0.1, 3.35, -0.1, 0.6]]) {
    k.ball(x + dx, dy, z + dz, r, 0x3d6a36, { sy: 0.8, seg: 12 });
  }
  k.block(x, z, 0.26, 0.26);
}

/**
 * la fachada de la foto, pegada a la pared del edificio, y el lateral que sube
 * con la puerta de servicio y, un poco más arriba, la oficina de Canary Consulting
 */
export function buildTanatorioFacade(scene, colliders) {
  const glow = glowMaterial(0.2);
  const place = (k, origin, n, name) => {
    const { group, segs } = k.build(name, { glow });
    const ex = [n[1], -n[0]];
    group.position.set(origin[0], 0, origin[1]);
    group.rotation.y = Math.atan2(n[0], n[1]);
    scene.add(group);
    const w = (x, z) => [origin[0] + ex[0] * x + n[0] * z, origin[1] + ex[1] * x + n[1] * z];
    for (const [ax, az, bx, bz] of segs) colliders.addSegment(...w(ax, az), ...w(bx, bz));
  };

  // delantera: 15 m de fachada a la izquierda de la esquina (x crece hacia la esquina)
  const F = new Kit(), W = 15, H = 4.9;
  F.box(W / 2, 0, 0.015, W, H, 0.03, WHITE, { list: F.shell });
  F.box(3.18, 0, 0.045, 6.36, 1.0, 0.05, LILAC).box(11.82, 0, 0.045, 6.36, 1.0, 0.05, LILAC);
  F.box(0.2, 0, 0.05, 0.4, H, 0.06, LILAC).box(W - 0.2, 0, 0.05, 0.4, H, 0.06, LILAC);
  F.box(W / 2, 3.32, 0.05, W, 0.14, 0.06, LILAC);
  for (const x of [5.1, 9.9]) F.box(x, 3.32, 0.05, 0.3, 1.2, 0.06, LILAC);
  F.box(W / 2, 4.5, 0.08, W + 0.2, 0.4, 0.14, LILAC).box(W / 2, 4.88, 0.1, W + 0.3, 0.06, 0.18, 0xbcb8c8);
  for (const x of [3.4, 11.6]) opening(F, x, 0.95, 1.5, 2.15, { transom: 0.5 });
  // la puerta la pone locales.js; aquí, su recercado y el montante de cristal
  F.box(7.5, 0, 0.03, 2.14, 3.3, 0.03, LILAC);
  opening(F, 7.5, 2.52, 1.7, 0.6, { mullion: false, surround: 0 });
  for (const x of [2.15, 4.65, 9.0, 12.85]) lamp(F, x, 2.88);
  F.pic(14.25, 2.95, 0.075, 0.6, 0.34, 0, 1, canvasTex(256, 146, blueplate));
  ficus(F, 0.9, 1.2);
  ficus(F, 14.1, 1.2);
  const t = [-N_FRONT[1], N_FRONT[0]];          // de la esquina hacia la izquierda
  place(F, [CORNER[0] + t[0] * W, CORNER[1] + t[1] * W], N_FRONT, 'fachada del tanatorio');

  // lateral: de la esquina calle arriba (x crece hacia arriba)
  const S = new Kit(), L = 20.8;
  S.box(L / 2, 0, 0.015, L, H, 0.03, WHITE, { list: S.shell });
  S.box(0.2, 0, 0.05, 0.4, H, 0.06, LILAC);
  S.box(5.6, 0, 0.045, 11.2, 0.95, 0.05, LILAC).box(14.6, 0, 0.045, 2.0, 0.95, 0.05, LILAC).box(19.75, 0, 0.045, 2.1, 0.95, 0.05, LILAC);
  S.box(L / 2, 4.5, 0.08, L, 0.4, 0.14, LILAC);
  // la puerta del lateral (la de la foto)
  opening(S, 12.2, 0, 1.1, 2.3, { mullion: false, glass: 0x2a2c30 });
  lamp(S, 12.2, 2.75);
  // un poco más arriba, la entrada de la oficina, con su rótulo
  opening(S, 17.55, 0, 1.3, 2.35, { transom: 0.5 });
  S.box(17.55, 2.85, 0.06, 2.9, 1.2, 0.06, 0x0e1116);
  S.pic(17.55, 3.45, 0.1, 2.75, 1.07, 0, 1, brandTexture('cargoDark'), { glow: 0.35 });
  lamp(S, 16.3, 2.6);
  lamp(S, 18.8, 2.6);
  place(S, CORNER, N_SIDE, 'lateral del tanatorio y oficina');

  return { update() { glow.emissiveIntensity = 0.15 + windowGlow.value * 3; } };
}
