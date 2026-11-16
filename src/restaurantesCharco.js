import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { sobreSuelo } from './piraguas.js';
import { polyTris, paveMesh, plazaSlabs } from './suelos.js';

/**
 * Los restaurantes de la orilla norte del lago grande del Charco de San Ginés (avenida César Manrique, de
 * la calle Muelle hacia el este), sacados de fotos de internet (Google Maps: fotos de los clientes y de los
 * propios locales; solo para mirarlas, no van dentro del juego). Se hacen de uno en uno:
 *  - la Tasca La Raspa (Av. César Manrique 20): el portón azul con el rótulo marrón de letras doradas, las
 *    dos ventanas azules de cuarterones con sus pizarras, el letrero WINE, los faroles blancos, el toldo azul
 *    marino y la terraza de mesas blancas con tablero de madera.
 *  - Divina Italia el Charco: el edificio blanco del fondo de la placita de piedrecilla (Google Maps lo pone
 *    ahí, no donde traía su rótulo el mapa), con las dos cristaleras azules plegables y los toldos rojos
 *    recogidos, los globos blancos, el rótulo DIVINA ITALIA / EL CHARCO con los dos faroles negros, las
 *    ventanas azules de la primera planta, la terraza de arriba con la baranda y la pérgola azules y el
 *    ático; y delante, la placita con el anillo de basalto, las dos palmeras y la terraza de sombrillas
 *    crema, estufas y sillas de mimbre oscuro con gente.
 *  - la Casa del Miedo (el club social de las fiestas de San Ginés), en el lado este de la placita: la planta
 *    baja que sale a la placita con los dos toldos azules con el nombre, las puertas azules de celosía, los
 *    ojos de buey, la baranda azul de la azotea y las mesas de aluminio; y al lado, en lo alto de su
 *    plataforma de piedra volcánica con baranda azul y escalera, La Chalana del Charco (gastro bar), con
 *    el rótulo, el farol, la cristalera azul, los bancos de delante, la barquita de pie y las jardineras.
 *  - La Miñoca Café del Charco (el número 22, en la punta de la manzana de la Raspa): la pared encalada con
 *    la franja azul con el nombre, la puerta abierta del bar, las puertas azules de cuarterones, la
 *    ventana-mostrador con las contraventanas abiertas, las pizarras, la placa del 22 y la terraza de
 *    sombrillas blancas grandes, mesas y sillas gris oscuro y las mesas altas de junto al muro.
 * El mapa trae cada manzana como un bloque genérico: la planta baja va por delante de su pared y lo de
 * arriba se queda como está. Los nombres son los de los rótulos de las fotos.
 */

export const WHITE = 0xf2f1ec;

// ——— lo mismo que en localesCharco.js: el marco de una fachada y cómo se monta en él ———

/** el marco de una fachada: s a lo largo (desde B), z hacia la calle */
export function marco(B, A) {
  const len = Math.hypot(A[0] - B[0], A[1] - B[1]);
  const U = [(A[0] - B[0]) / len, (A[1] - B[1]) / len], N = [-U[1], U[0]];
  return { B, len, U, N, W: (s, z) => [B[0] + U[0] * s + N[0] * z, B[1] + U[1] * s + N[1] * z], ry: Math.atan2(N[0], N[1]) };
}

/** un hueco en la fachada: el lienzo y un marco un poco saliente (y el alféizar si va en alto) */
export function hueco(k, s, y0, w, h, tex, { borde, z = 0.04 } = {}) {
  for (const x of [s - w / 2 - 0.05, s + w / 2 + 0.05]) k.box(x, y0, z + 0.04, 0.1, h + 0.05, 0.08, borde);
  k.box(s, y0 + h, z + 0.04, w + 0.2, 0.1, 0.08, borde);
  if (y0 > 0) k.box(s, y0 - 0.08, z + 0.07, w + 0.3, 0.08, 0.16, 0xe8e5de);
  k.pic(s, y0 + h / 2, z + 0.022, w, h, 0, 1, tex);
}

/** sube cada vértice lo que el suelo que se ve queda por encima del relieve (sobreSuelo, cada medio metro) */
export function aRasDelSuelo(scene, root) {
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const c = 0.5, x0 = box.min.x, z0 = box.min.z;
  const nx = Math.ceil((box.max.x - x0) / c) + 2, nz = Math.ceil((box.max.z - z0) / c) + 2;
  const pts = [];
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) pts.push([x0 + i * c, z0 + j * c]);
  const L = sobreSuelo(scene, pts);
  const at = (x, z) => {
    const fx = Math.max(0, Math.min(nx - 1.001, (x - x0) / c)), fz = Math.max(0, Math.min(nz - 1.001, (z - z0) / c));
    const i = Math.floor(fx), j = Math.floor(fz), u = fx - i, v = fz - j;
    return (L[j * nx + i] * (1 - u) + L[j * nx + i + 1] * u) * (1 - v) + (L[(j + 1) * nx + i] * (1 - u) + L[(j + 1) * nx + i + 1] * u) * v;
  };
  const v = new THREE.Vector3();
  root.traverse((o) => {
    if (!o.isMesh) return;
    const p = o.geometry.getAttribute('position'), inv = o.matrixWorld.clone().invert();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i).applyMatrix4(o.matrixWorld);
      v.y += at(v.x, v.z);
      v.applyMatrix4(inv);
      p.setXYZ(i, v.x, v.y, v.z);
    }
    p.needsUpdate = true;
    o.geometry.computeBoundingSphere();
  });
}

/** monta un kit en el marco de una fachada y le pone sus choques */
export function enMarco(k, M, name, colliders) {
  const { group, segs } = k.build(name);
  group.position.set(M.B[0], 0, M.B[1]);
  group.rotation.y = M.ry;
  for (const [as, az, bs, bz] of segs) colliders?.addSegment(...M.W(as, az), ...M.W(bs, bz));
  return group;
}

// la manzana de la Tasca La Raspa (de la calle Muelle hacia el este): s a lo largo, z hacia el Charco
const R = marco([288.0, 24.5], [315.6, 21.8]);
// el centro del portón de La Raspa (el rótulo del mapa cae en s 23,5)
const RASPA = 23.6;
// el azul de la Raspa (más vivo que el de las casas del Charco), su sombra y el azul marino del toldo
const AZUL = 0x1f76c2, AZUL_OSC = 0x155a96, MARINO = 0x1c2a4a, MADERA = 0xc8a06a;
export const SERIF = '"Bodoni MT", "Didot", "Times New Roman", Georgia, serif';

// Divina Italia: el edificio del fondo de la placita (s desde la esquina oeste, z hacia la placita)
const D = marco([349.8, 17.6], [360.7, 16.9]);
// la placita de delante, de piedrecilla: de la manzana de Cala a la de la Casa del Miedo y al paseo
const PLACITA = [[343.0, 23.0], [343.8, 18.0], [349.8, 17.6], [360.7, 16.9], [364.3, 16.7], [365.2, 36.4], [355.6, 46.0], [342.8, 36.0]];
// el anillo de basalto del medio de la placita (se ve en la foto aérea): centro y radio
const ANILLO = [354.4, 26.0, 3.5];
// las dos palmeras de delante de Divina Italia (foto de 2019): [x, z, alto, giro]
const PALMAS_DIVINA = [[0.8, 5.5, 9.0, 0.6], [8.4, 4.5, 10.0, 2.1]].map(([s, z, h, r]) => [...D.W(s, z), h, r]);
export const AZUL_D = 0x2a64b8, ROJO_TOLDO = 0xc4452c, CREMA = 0xe9dfc8;
// la Casa del Miedo y La Chalana: la fachada oeste del bloque que cierra la placita por el este (s de norte a sur)
const M = marco([364.1, -3.3], [365.3, 36.5]);

/** antes de levantar la ciudad: fuera los rótulos rojos genéricos (y sus mesas) de los locales que se hacen aquí */
export function tuneRestaurantesCharco(map) {
  map.restaurantesCharcoSigns = [];
  for (const name of ['Tasca La Raspa', 'Divina Italia', 'La Chalana del Charco', 'La Miñoca']) {
    const i = (map.signs || []).findIndex(s => s.name === name);
    if (i >= 0) map.restaurantesCharcoSigns.push(map.signs.splice(i, 1)[0]);
  }
  // las palmeras de la placita de Divina Italia
  map.extraPalms = map.extraPalms || [];
  map.extraPalms.push(...PALMAS_DIVINA);
  map.restaurantesCharco = true;
}

// ——— lo que se pinta en lienzo ———

/** estrella de cuatro puntas, como las de las esquinas del rótulo */
function estrella(g, x, y, r) {
  g.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4, q = i % 2 ? r * 0.3 : r;
    g.lineTo(x + Math.sin(a) * q, y - Math.cos(a) * q);
  }
  g.closePath();
  g.fill();
}

/** el rótulo de la Raspa: tabla marrón de esquinas recortadas, «tasca» pequeño y LA RASPA grande, en dorado */
function rotuloRaspa(g, w, h) {
  g.fillStyle = '#1f76c2';
  g.fillRect(0, 0, w, h);
  const m = h * 0.09, r = h * 0.16;
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, '#4b3729');
  gr.addColorStop(1, '#2c1f17');
  g.fillStyle = gr;
  g.beginPath();
  g.moveTo(m + r, m);
  g.lineTo(w - m - r, m);
  g.arc(w - m, m, r, Math.PI, Math.PI / 2, true);
  g.lineTo(w - m, h - m - r);
  g.arc(w - m, h - m, r, -Math.PI / 2, Math.PI, true);
  g.lineTo(m + r, h - m);
  g.arc(m, h - m, r, 0, -Math.PI / 2, true);
  g.lineTo(m, m + r);
  g.arc(m, m, r, Math.PI / 2, 0, true);
  g.closePath();
  g.fill();
  g.fillStyle = '#d8b46a';
  for (const [x, y] of [[m, m], [w - m, m], [m, h - m], [w - m, h - m]]) estrella(g, x, y, h * 0.08);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = '#d2ad62';
  g.save();
  g.scale(0.6, 1);
  g.font = `400 ${Math.round(h * 0.17)}px ${SERIF}`;
  g.fillText('t a s c a', w / 2 / 0.6, h * 0.27);
  g.font = `700 ${Math.round(h * 0.5)}px ${SERIF}`;
  g.fillText('LA RASPA', w / 2 / 0.6, h * 0.63);
  g.restore();
}

/** lo que se ve por el portón abierto: pared amarilla, zócalo de madera, suelo de damero, el barril y el ventilador */
function interiorRaspa(g, w, h) {
  const gr = g.createLinearGradient(0, 0, 0, h * 0.5);
  gr.addColorStop(0, '#b8955a');
  gr.addColorStop(1, '#e2c483');
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#3d2c22';
  g.fillRect(0, h * 0.45, w, h * 0.27);
  // el damero del suelo, que se va estrechando hacia el fondo
  const y0 = h * 0.72, n = 6;
  for (let r = 0; r < n; r++) {
    const ya = y0 + (h - y0) * Math.pow(r / n, 1.4), yb = y0 + (h - y0) * Math.pow((r + 1) / n, 1.4);
    const cols = 10 - r;
    for (let c = 0; c < cols; c++) {
      g.fillStyle = (r + c) % 2 ? '#e9e6df' : '#1d1d1f';
      g.fillRect((c * w) / cols, ya, w / cols + 1, yb - ya + 1);
    }
  }
  // la columna de la izquierda y las mesitas del fondo
  g.fillStyle = '#efe2c0';
  g.fillRect(w * 0.1, 0, w * 0.1, h * 0.72);
  g.fillStyle = '#f1efea';
  for (const x of [0.62, 0.8]) g.fillRect(w * x, h * 0.58, w * 0.14, h * 0.025);
  g.fillStyle = '#2a2420';
  for (const x of [0.64, 0.74, 0.82, 0.92]) g.fillRect(w * x, h * 0.6, 3, h * 0.1);
  // el barril
  g.fillStyle = '#8a5a34';
  g.beginPath();
  g.ellipse(w * 0.42, h * 0.74, w * 0.16, h * 0.13, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#6b4226';
  g.fillRect(w * 0.27, h * 0.6, w * 0.3, h * 0.03);
  g.strokeStyle = '#2f2a26';
  g.lineWidth = 3;
  for (const y of [0.66, 0.74, 0.82]) { g.beginPath(); g.moveTo(w * 0.27, h * y); g.lineTo(w * 0.57, h * y); g.stroke(); }
  // el ventilador del techo
  g.strokeStyle = '#3a2e26';
  g.lineWidth = 2;
  g.beginPath(); g.moveTo(w * 0.55, 0); g.lineTo(w * 0.55, h * 0.1); g.stroke();
  g.lineWidth = 4;
  g.beginPath(); g.moveTo(w * 0.3, h * 0.11); g.lineTo(w * 0.8, h * 0.11); g.stroke();
  // la luz cálida de dentro
  const luz = g.createRadialGradient(w * 0.5, h * 0.35, 4, w * 0.5, h * 0.35, w * 0.8);
  luz.addColorStop(0, 'rgba(255,220,160,.25)');
  luz.addColorStop(1, 'rgba(255,220,160,0)');
  g.fillStyle = luz;
  g.fillRect(0, 0, w, h);
}

/** cristales de cuarterones con el marco azul (las ventanas y los laterales del portón) */
export function cuarterones(cols, rows) {
  return (g, w, h) => {
    g.fillStyle = '#1f76c2';
    g.fillRect(0, 0, w, h);
    const b = Math.max(4, w * 0.05), pw = (w - b) / cols, ph = (h - b) / rows;
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const x = b + c * pw, y = b + r * ph;
        const gr = g.createLinearGradient(x, y, x + pw, y + ph);
        gr.addColorStop(0, '#5e7586');
        gr.addColorStop(0.5, '#2d3a44');
        gr.addColorStop(1, '#3d4c57');
        g.fillStyle = gr;
        g.fillRect(x, y, pw - b, ph - b);
      }
    }
    g.fillStyle = 'rgba(230,240,250,.18)';
    g.fillRect(b, b, w * 0.3, h * 0.25);
  };
}

/** el panel azul de encima del portón, con sus dos cuarterones */
function dintel(g, w, h) {
  g.fillStyle = '#1f76c2';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#155a96';
  g.lineWidth = 6;
  for (const x of [0.04, 0.52]) g.strokeRect(w * x, h * 0.16, w * 0.44, h * 0.68);
  g.strokeStyle = 'rgba(255,255,255,.25)';
  g.lineWidth = 2;
  for (const x of [0.04, 0.52]) g.strokeRect(w * x + 5, h * 0.16 + 5, w * 0.44 - 10, h * 0.68 - 10);
}

/** pizarra en su marco azul de arco (las esquinas, del blanco de la pared); el texto, garabatos de tiza */
function pizarraArco(seed) {
  return (g, w, h) => {
    g.fillStyle = '#f2f1ec';
    g.fillRect(0, 0, w, h);
    const arco = (m) => {
      g.beginPath();
      g.moveTo(m, h - m);
      g.lineTo(m, w / 2);
      g.arc(w / 2, w / 2, w / 2 - m, Math.PI, 0);
      g.lineTo(w - m, h - m);
      g.closePath();
    };
    g.fillStyle = '#1f76c2';
    arco(0);
    g.fill();
    g.fillStyle = '#1e2321';
    arco(w * 0.09);
    g.fill();
    let s = seed;
    const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    g.strokeStyle = 'rgba(240,240,235,.75)';
    g.lineWidth = 2;
    for (let y = w * 0.42; y < h - w * 0.15; y += h * 0.055) {
      let x = w * 0.2;
      const fin = w * (0.55 + rnd() * 0.25);
      g.beginPath();
      g.moveTo(x, y);
      while (x < fin) { x += 3 + rnd() * 4; g.lineTo(x, y + (rnd() - 0.5) * 5); }
      g.stroke();
    }
  };
}

/** el letrero WINE de la pared */
function wine(g, w, h) {
  g.fillStyle = '#f2f1ec';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#1f76c2';
  g.beginPath();
  g.ellipse(w / 2, h / 2, w / 2 - 2, h / 2 - 2, 0, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = '#e8eef4';
  g.lineWidth = 4;
  g.beginPath();
  g.ellipse(w / 2, h / 2, w / 2 - 9, h / 2 - 9, 0, 0, Math.PI * 2);
  g.stroke();
  g.fillStyle = '#ffffff';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.save();
  g.scale(0.7, 1);
  g.font = `800 ${Math.round(h * 0.56)}px "Arial Narrow", Arial, sans-serif`;
  g.fillText('WINE', w / 2 / 0.7, h * 0.54);
  g.restore();
}

// ——— las piezas ———

/** farol de pared blanco, de brazo curvo (los de encima de las ventanas) */
function farol(k, s, y) {
  k.box(s, y - 0.12, 0.06, 0.08, 0.16, 0.04, 0xe9e9e6);
  k.box(s, y, 0.2, 0.03, 0.03, 0.3, 0xe9e9e6);
  k.cyl(s, y - 0.16, 0.36, 0.03, 0.16, 0.13, 0xf2f2ee, { seg: 12 });
  k.ball(s, y - 0.15, 0.36, 0.05, 0xfff0c8, { list: k.glow, seg: 8 });
}

/** el toldo azul marino que tapa la terraza, de la pared hacia el Charco, con sus brazos blancos */
export function toldo(k, s0, s1, yPared, yFuera, fuera) {
  const w = s1 - s0, sm = (s0 + s1) / 2, dy = yPared - yFuera, L = Math.hypot(fuera, dy), a = Math.atan2(dy, fuera);
  const tela = new THREE.BoxGeometry(w, 0.03, L);
  tela.rotateX(a);
  tela.translate(sm, (yPared + yFuera) / 2, fuera / 2 + 0.05);
  k.add(tela, MARINO);
  k.box(sm, yFuera - 0.24, fuera + 0.05, w, 0.24, 0.03, MARINO);
  k.box(sm, yFuera - 0.03, fuera + 0.03, w, 0.05, 0.05, 0xeeeeea);
  // los brazos, de la pared (más abajo que la tela) a la barra de delante
  for (const s of [s0 + 0.25, s1 - 0.25]) barra(k, [s, yPared - 0.6, 0.06], [s, yFuera - 0.05, fuera], 0.045, 0xeeeeea);
}

/** una barra recta de un punto a otro */
export function barra(k, a, b, r, hex) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
  const g = new THREE.BoxGeometry(r, r, A.distanceTo(B));
  g.applyMatrix4(new THREE.Matrix4().lookAt(A, B, new THREE.Vector3(0, 1, 0)));
  g.translate((A.x + B.x) / 2, (A.y + B.y) / 2, (A.z + B.z) / 2);
  k.add(g, hex);
}

/** la Tasca La Raspa (en el marco R): la planta baja encalada con zócalo gris, el portón, las ventanas, las pizarras y el toldo */
function raspa(k) {
  const c = RASPA, s0 = 19.3, s1 = 27.7, sm = (s0 + s1) / 2;
  // la pared encalada por delante de la del mapa y el zócalo gris
  k.box(sm, 0, 0.025, s1 - s0, 3.9, 0.05, WHITE);
  k.box(sm, 0, 0.055, s1 - s0, 1.0, 0.02, 0x8b9094);
  // el portón: jambas, laterales de cristal, el hueco abierto, el panel de encima y el rótulo
  for (const sg of [-1, 1]) {
    k.box(c + sg * 1.17, 0, 0.07, 0.16, 2.35, 0.14, AZUL);
    k.box(c + sg * 0.64, 0, 0.07, 0.08, 2.35, 0.14, AZUL);
    k.pic(c + sg * 0.88, 1.12, 0.06, 0.42, 2.15, 0, 1, canvasTex(64, 320, cuarterones(1, 5)));
  }
  k.pic(c, 1.1, 0.03, 1.2, 2.2, 0, 1, canvasTex(192, 352, interiorRaspa));
  k.box(c, 0, 0.03, 1.2, 0.04, 0.06, 0x2a2a2c);
  k.box(c, 2.35, 0.07, 2.5, 0.6, 0.14, AZUL);
  k.pic(c, 2.65, 0.14, 2.3, 0.5, 0, 1, canvasTex(384, 84, dintel));
  k.box(c, 2.95, 0.08, 2.62, 0.86, 0.16, AZUL);
  k.pic(c, 3.38, 0.16, 2.5, 0.76, 0, 1, canvasTex(640, 196, rotuloRaspa));
  for (const sg of [-1, 1]) k.box(c + sg * 1.31, 2.95, 0.17, 0.02, 0.86, 0.02, AZUL_OSC);
  // las dos ventanas de cuarterones, con un farol encima de cada una
  for (const sg of [-1, 1]) {
    const s = c + sg * 2.35;
    hueco(k, s, 0.95, 1.2, 1.5, canvasTex(192, 240, cuarterones(3, 4)), { borde: AZUL });
    farol(k, s, 2.85);
  }
  // las pizarras de arco, a los lados, y el letrero WINE
  k.pic(c - 3.4, 1.55, 0.07, 0.62, 1.05, 0, 1, canvasTex(124, 210, pizarraArco(11)));
  k.pic(c + 3.4, 1.55, 0.07, 0.62, 1.05, 0, 1, canvasTex(124, 210, pizarraArco(29)));
  k.pic(c - 3.2, 3.05, 0.07, 0.95, 0.38, 0, 1, canvasTex(256, 102, wine));
  // el toldo azul marino de la terraza
  toldo(k, s0 + 0.1, s1 - 0.1, 3.85, 3.0, 3.4);
}

/** la terraza de la Raspa: mesas de pata blanca y tablero de madera, con sus sillas, debajo del toldo */
function terrazaRaspa(k, palmas) {
  const mesas = [];
  const sitios = [[20.0, 1.4], [21.9, 1.4], [25.3, 1.4], [27.0, 1.4], [20.4, 2.85], [22.5, 2.85], [24.6, 2.85], [26.7, 2.85]];
  for (const [s, z] of sitios) {
    const [x, wz] = R.W(s, z);
    if (palmas.some(([px, pz]) => Math.hypot(px - x, pz - wz) < 1.3)) continue;
    k.table(s, z, { w: 0.7, d: 0.7, h: 0.75, top: MADERA, leg: 0xf1f1ee });
    k.chair(s - 0.55, z, Math.PI / 2, MADERA, { legs: 0xf1f1ee });
    k.chair(s + 0.55, z, -Math.PI / 2, MADERA, { legs: 0xf1f1ee });
    k.block(s, z, 0.7, 0.7);
    mesas.push([s, z]);
  }
  return mesas;
}

// ——— Divina Italia y su placita ———

/** lienzo que se repite, con la textura por metros del mundo (como los de suelos.js) */
export function sueloTex(size, mpt, draw) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  let s = 41;
  draw(c.getContext('2d'), () => (s = (s * 16807) % 2147483647) / 2147483647, size);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  t.userData.mpt = mpt;
  return t;
}

/** el suelo de la placita: piedrecilla beis prensada (hormigón lavado), como en la foto */
function piedrecilla() {
  return sueloTex(256, 2.2, (g, r, n) => {
    g.fillStyle = '#b3a58f';
    g.fillRect(0, 0, n, n);
    for (let i = 0; i < 5200; i++) {
      const v = r(), d = 1 + r() * 2.4, osc = r() < 0.2;
      g.fillStyle = osc ? `rgb(${Math.round(85 + v * 40)},${Math.round(80 + v * 35)},${Math.round(72 + v * 30)})`
        : `rgb(${Math.round(170 + v * 45)},${Math.round(160 + v * 40)},${Math.round(140 + v * 38)})`;
      g.beginPath();
      g.arc(r() * n, r() * n, d, 0, Math.PI * 2);
      g.fill();
    }
  });
}

/** un polígono troceado en triángulos pequeños (para que se pueda subir a ras del suelo que se ve) */
export function trocear(tris, max) {
  const out = [], mid = (A, B) => [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2], d = (A, B) => Math.hypot(A[0] - B[0], A[1] - B[1]);
  const go = (A, B, C) => {
    if (Math.max(d(A, B), d(B, C), d(C, A)) <= max) { out.push([A, B, C]); return; }
    const ab = mid(A, B), bc = mid(B, C), ca = mid(C, A);
    go(A, ab, ca); go(ab, B, bc); go(ca, bc, C); go(ab, bc, ca);
  };
  for (const t of tris) go(...t);
  return out;
}

/** la placita de piedrecilla con el anillo de basalto en medio */
function placita() {
  const g = new THREE.Group();
  g.name = 'placitaDivinaItalia';
  const suelo = paveMesh(trocear(polyTris(PLACITA), 1.5), 0.16, piedrecilla(), 0xffffff);
  const [cx, cz, r] = ANILLO;
  const circ = (rr) => Array.from({ length: 40 }, (_, i) => [cx + Math.cos((i / 40) * Math.PI * 2) * rr, cz + Math.sin((i / 40) * Math.PI * 2) * rr]);
  const anillo = paveMesh(trocear(polyTris(circ(r), [circ(r - 0.45).reverse()]), 1.5), 0.175, plazaSlabs(), 0x8e9094);
  for (const m of [suelo, anillo]) if (m) g.add(m);
  return g;
}

/** las cristaleras plegables de la planta baja: el comedor de dentro (las botellas del vino en rojo) y los marcos azules */
function cristalera(seed) {
  return (g, w, h) => {
    let s = seed;
    const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    g.fillStyle = '#3a2a22';
    g.fillRect(0, 0, w, h);
    // las estanterías del vino, rojas, con las botellas
    g.fillStyle = '#8c2a22';
    g.fillRect(w * 0.08, h * 0.12, w * 0.84, h * 0.5);
    for (let y = h * 0.15; y < h * 0.6; y += h * 0.07) {
      g.fillStyle = '#5a1a16';
      g.fillRect(w * 0.08, y + h * 0.05, w * 0.84, 3);
      for (let x = w * 0.1; x < w * 0.9; x += 7) { g.fillStyle = r() < 0.5 ? '#2a3a22' : '#e8d8b0'; g.fillRect(x, y + h * 0.015, 3, h * 0.035); }
    }
    // las mesas y la luz cálida
    g.fillStyle = '#6a4630';
    for (let x = 0.1; x < 0.9; x += 0.22) g.fillRect(w * x, h * 0.72, w * 0.14, h * 0.03);
    const luz = g.createRadialGradient(w / 2, h * 0.3, 5, w / 2, h * 0.3, w * 0.7);
    luz.addColorStop(0, 'rgba(255,214,150,.3)');
    luz.addColorStop(1, 'rgba(255,214,150,0)');
    g.fillStyle = luz;
    g.fillRect(0, 0, w, h);
    // el suelo de dentro
    g.fillStyle = '#6e6258';
    g.fillRect(0, h * 0.86, w, h * 0.14);
    // los marcos azules de las hojas plegables y el travesaño de arriba
    g.fillStyle = '#2a64b8';
    const n = 6;
    for (let i = 0; i <= n; i++) g.fillRect((i * (w - 10)) / n, 0, 10, h);
    g.fillRect(0, h * 0.8, w, 7);
    g.fillRect(0, 0, w, 8);
    g.fillStyle = 'rgba(220,235,250,.12)';
    for (let i = 0; i < n; i++) g.fillRect((i * (w - 10)) / n + 14, 10, (w / n) * 0.35, h * 0.7);
  };
}

/** el rótulo de Divina Italia: letras grises de serifa sobre la pared blanca, y EL CHARCO entre dos rayas */
function rotuloDivina(g, w, h) {
  g.fillStyle = '#f2f1ec';
  g.fillRect(0, 0, w, h);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = '#4a4c50';
  g.save();
  g.scale(0.78, 1);
  g.font = `600 ${Math.round(h * 0.5)}px ${SERIF}`;
  g.fillText('DIVINA ITALIA', w / 2 / 0.78, h * 0.4);
  g.restore();
  g.font = `600 ${Math.round(h * 0.16)}px ${SERIF}`;
  g.fillText('E L   C H A R C O', w / 2, h * 0.8);
  g.fillRect(w * 0.27, h * 0.8 - 1, w * 0.12, 2);
  g.fillRect(w * 0.61, h * 0.8 - 1, w * 0.12, 2);
}

/** farol negro de los de siempre, en su brazo, con la luz dentro */
export function farolNegro(k, s, y) {
  k.box(s, y + 0.05, 0.12, 0.04, 0.04, 0.24, 0x1e1e20);
  k.box(s, y - 0.32, 0.3, 0.13, 0.22, 0.13, 0xffe2a8, { list: k.glow });
  k.box(s, y - 0.36, 0.3, 0.17, 0.04, 0.17, 0x1e1e20);
  for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) k.box(s + a * 0.075, y - 0.33, 0.3 + b * 0.075, 0.02, 0.26, 0.02, 0x1e1e20);
  k.cyl(s, y - 0.08, 0.3, 0.02, 0.14, 0.12, 0x1e1e20, { seg: 4, ry: Math.PI / 4 });
}

/** una baranda azul de barrotes, de s0 a s1, a la altura y y a la distancia z de la pared */
export function barandaAzul(k, s0, s1, y, z, hex = AZUL_D) {
  const L = s1 - s0;
  for (const yy of [y + 0.05, y + 0.95]) k.box((s0 + s1) / 2, yy, z, L, 0.05, 0.05, hex);
  for (let s = s0; s <= s1 + 0.001; s += 0.14) k.box(s, y, z, 0.025, 0.98, 0.025, hex);
}

/** una pérgola azul: postes delante y las tablillas del techo de la pared hacia fuera */
export function pergola(k, s0, s1, y0, y1, z0, z1, hex = AZUL_D) {
  for (const s of [s0 + 0.08, (s0 + s1) / 2, s1 - 0.08]) k.box(s, y0, z1 - 0.08, 0.1, y1 - y0, 0.1, hex);
  k.box((s0 + s1) / 2, y1, z1 - 0.08, s1 - s0, 0.14, 0.12, hex);
  for (let s = s0 + 0.1; s < s1; s += 0.32) k.box(s, y1 + 0.14, (z0 + z1) / 2, 0.1, 0.06, z1 - z0, hex);
}

/** Divina Italia (en el marco D): planta baja, primera planta, la terraza de arriba y el ático */
function divina(k) {
  const W = D.len;
  // todo el frente encalado por delante del bloque del mapa, y la sombra de la terraza de arriba
  k.box(W / 2, 0, 0.025, W, 8.0, 0.05, WHITE);
  k.box(W / 2, 6.45, 0.055, W, 1.55, 0.02, 0xd4d6d9);
  // las dos cristaleras plegables con su marco azul y el toldo rojo recogido encima
  [[0.6, 4.6, 7], [5.2, 9.2, 19]].forEach(([a, b, seed]) => {
    const m = (a + b) / 2, w = b - a;
    k.pic(m, 1.25, 0.03, w, 2.5, 0, 1, canvasTex(512, 320, cristalera(seed)));
    for (const x of [a + 0.05, b - 0.05]) k.box(x, 0, 0.08, 0.1, 2.55, 0.1, AZUL_D);
    k.box(m, 2.5, 0.08, w, 0.1, 0.1, AZUL_D);
    k.box(m, 2.62, 0.17, w + 0.1, 0.17, 0.24, ROJO_TOLDO);
    k.box(m, 2.58, 0.3, w + 0.1, 0.06, 0.03, 0xa8361f);
  });
  // los globos blancos de los machones
  for (const s of [0.3, 4.9, 9.5]) {
    k.box(s, 2.42, 0.12, 0.04, 0.04, 0.22, 0xdddddd);
    k.ball(s, 2.55, 0.26, 0.13, 0xfff6e0, { list: k.glow, seg: 12 });
  }
  // el rótulo y los dos faroles negros
  k.pic(4.9, 3.3, 0.06, 3.3, 0.8, 0, 1, canvasTex(660, 160, rotuloDivina));
  for (const s of [2.75, 7.05]) farolNegro(k, s, 3.55);
  // las ventanas azules de la primera planta
  hueco(k, 2.6, 4.3, 1.2, 1.55, canvasTex(160, 208, cuarterones(2, 2)), { borde: AZUL_D });
  hueco(k, 5.0, 4.9, 0.75, 0.95, canvasTex(100, 128, cuarterones(1, 2)), { borde: AZUL_D });
  hueco(k, 7.1, 4.6, 1.4, 1.25, canvasTex(180, 160, cuarterones(2, 1)), { borde: AZUL_D });
  // la terraza de arriba: el voladizo, la baranda azul, la puerta del fondo y la pérgola
  k.box(W / 2, 6.3, 0.45, W, 0.15, 0.9, WHITE);
  barandaAzul(k, 0.1, W - 0.1, 6.45, 0.85);
  k.pic(5.4, 7.2, 0.07, 1.6, 1.4, 0, 1, canvasTex(192, 168, cuarterones(3, 2)));
  pergola(k, 0, W, 6.45, 8.05, 0, 1.4);
  // el ático encima del bloque, retranqueado, con su pérgola azul y la chimenea
  k.box(5.6, 8.0, -3.0, 7.4, 2.3, 3.2, WHITE);
  k.pic(5.6, 9.05, -1.39, 2.4, 1.3, 0, 1, canvasTex(256, 140, cuarterones(4, 2)));
  barandaAzul(k, 0.2, W - 0.2, 8.0, -0.25);
  pergola(k, 1.9, 9.3, 8.0, 10.55, -1.4, 0.4);
  k.box(3.2, 10.3, -3.6, 0.5, 1.0, 0.5, WHITE);
  k.box(3.2, 11.3, -3.6, 0.62, 0.08, 0.62, 0x8a8f94);
}

/** sombrilla cuadrada grande, del color que se diga */
export function sombrillaGrande(k, s, z, hex) {
  k.cyl(s, 0, z, 0.24, 0.27, 0.08, 0x3a3d42, { seg: 10 });
  k.cyl(s, 0.08, z, 0.03, 0.03, 2.6, 0xc8c2b4, { seg: 6 });
  const tela = new THREE.ConeGeometry(1.9, 0.5, 4, 1, true);
  tela.rotateY(Math.PI / 4);
  tela.translate(s, 2.6, z);
  k.add(tela, hex);
  for (const [dx, dz, w, d] of [[0, 1.34, 2.7, 0.02], [0, -1.34, 2.7, 0.02], [1.34, 0, 0.02, 2.7], [-1.34, 0, 0.02, 2.7]]) k.box(s + dx, 2.18, z + dz, w, 0.18, d, hex);
  k.block(s, z, 0.32, 0.32);
}

/** estufa de terraza alta, de pirámide */
export function estufa(k, s, z) {
  k.cyl(s, 0, z, 0.24, 0.26, 0.12, 0x2e3034, { seg: 4, ry: Math.PI / 4 });
  k.cyl(s, 0.12, z, 0.07, 0.2, 1.9, 0x5a5d62, { seg: 4, ry: Math.PI / 4 });
  k.cyl(s, 0.5, z, 0.05, 0.05, 1.3, 0xff9a4a, { seg: 6, list: k.glow });
  k.cyl(s, 2.02, z, 0.12, 0.12, 0.18, 0x2e3034, { seg: 4, ry: Math.PI / 4 });
  k.block(s, z, 0.4, 0.4);
}

/** la terraza de Divina Italia en la placita: mesas de madera, sillas de mimbre oscuro, sombrillas crema y estufas */
function terrazaDivina(k, palmas) {
  const mesas = [];
  for (const z of [2.4, 4.6, 6.8]) {
    for (const s of [1.6, 3.6, 5.6, 7.6, 9.6]) {
      const [x, wz] = D.W(s, z);
      if (palmas.some(([px, pz]) => Math.hypot(px - x, pz - wz) < 1.4)) continue;
      k.table(s, z, { w: 0.75, d: 0.75, h: 0.75, top: 0x7a5236, leg: 0x2a2a2c });
      k.chair(s - 0.58, z, Math.PI / 2, 0x4a4038, { legs: 0x2a2a2c });
      k.chair(s + 0.58, z, -Math.PI / 2, 0x4a4038, { legs: 0x2a2a2c });
      k.block(s, z, 0.75, 0.75);
      mesas.push([s, z]);
    }
  }
  for (const [s, z] of [[2.6, 3.5], [6.6, 3.5], [4.6, 7.9], [9.6, 5.7]]) sombrillaGrande(k, s, z, CREMA);
  for (const [s, z] of [[4.6, 3.5], [8.6, 7.9]]) estufa(k, s, z);
  return mesas;
}

// la gente de la terraza de Divina Italia (sin nombre: no hablan)
const CLIENTES_DIVINA = [
  { sex: 'f', skin: 0xf1d3b8, hair: 0xd8c08a, hairStyle: 'ponytail', top: 0x2b6cb0, bottom: 0x2a2f3a, height: 1.68 },
  { sex: 'm', skin: 0xe8c4a2, hair: 0x8c8580, hairStyle: 'short', top: 0xf2efe6, bottom: 0x4a4038, height: 1.8 },
  { sex: 'm', skin: 0xb07a52, hair: 0x15110e, hairStyle: 'short', top: 0x3a3a40, bottom: 0x22252a, height: 1.75, beard: true },
  { sex: 'f', skin: 0xd9a882, hair: 0x2a1d14, hairStyle: 'bun', top: 0xb8324a, bottom: 0x1d2b44, height: 1.62 },
  { sex: 'f', skin: 0xc28a62, hair: 0x5a3a22, hairStyle: 'ponytail', top: 0xe8d47a, bottom: 0x2a2f3a, height: 1.65 },
  { sex: 'm', skin: 0xf1d3b8, hair: 0xb07a3a, hairStyle: 'short', top: 0x7a6a9a, bottom: 0x3a3a40, height: 1.83 },
].map(l => ({ eyes: 0x3a2616, topStyle: 'tshirt', bottomStyle: 'pants', shoes: 0x2a2c30, shoeStyle: 'shoe', build: 1, ...l }));
const SENTADOS_DIVINA = [[0, -1], [0, 1], [3, 1], [5, -1], [7, -1], [7, 1]];

// ——— la Casa del Miedo y La Chalana del Charco (el lado este de la placita) ———

/** el faldón azul del toldo de la Casa del Miedo: CASA DEL MIEDO en blanco y el borde de ondas */
function faldonMiedo(g, w, h) {
  g.fillStyle = '#2a64b8';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#f4f4f0';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.save();
  g.scale(0.8, 1);
  g.font = `800 ${Math.round(h * 0.5)}px "Arial Narrow", Arial, sans-serif`;
  g.fillText('CASA DEL MIEDO', w / 2 / 0.8, h * 0.42);
  g.restore();
  // el borde blanco de ondas de abajo
  const r = h * 0.12;
  for (let x = r; x < w; x += r * 2) { g.beginPath(); g.arc(x, h, r, Math.PI, 0); g.fill(); }
}

/** puerta azul de celosía (las de la Casa del Miedo) */
function puertaCelosia(g, w, h) {
  g.fillStyle = '#2a64b8';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#6f9ad8';
  g.lineWidth = 2;
  for (let d = -h; d < w + h; d += 12) {
    g.beginPath(); g.moveTo(d, h * 0.08); g.lineTo(d + h * 0.6, h * 0.68); g.stroke();
    g.beginPath(); g.moveTo(d + h * 0.6, h * 0.08); g.lineTo(d, h * 0.68); g.stroke();
  }
  g.strokeStyle = '#1d4f9c';
  g.lineWidth = 8;
  g.strokeRect(4, 4, w - 8, h - 8);
  g.strokeRect(w * 0.12, h * 0.07, w * 0.76, h * 0.62);
  g.fillStyle = '#2a64b8';
  g.fillRect(w * 0.12, h * 0.72, w * 0.76, h * 0.22);
}

/** ventana redonda de barco: aro azul gordo y el cristal oscuro, sobre la pared blanca */
function ojoDeBuey(g, w, h) {
  g.fillStyle = '#f2f1ec';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#2a64b8';
  g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 1, 0, Math.PI * 2); g.fill();
  const gr = g.createLinearGradient(0, 0, w, h);
  gr.addColorStop(0, '#5e7586');
  gr.addColorStop(1, '#1e262c');
  g.fillStyle = gr;
  g.beginPath(); g.arc(w / 2, h / 2, w * 0.3, 0, Math.PI * 2); g.fill();
}

/** el rótulo de La Chalana: tabla blanca con el marco azul, el nombre en letra de imprenta y GASTRO BAR */
function rotuloChalana(g, w, h) {
  g.fillStyle = '#f4f3ee';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#2a64b8';
  g.lineWidth = 6;
  g.strokeRect(3, 3, w - 6, h - 6);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = '#1f3d78';
  g.font = `600 ${Math.round(h * 0.4)}px ${SERIF}`;
  g.fillText('La Chalana Del Charco', w / 2, h * 0.38);
  g.font = `700 ${Math.round(h * 0.2)}px "Arial Narrow", Arial, sans-serif`;
  g.fillText('G A S T R O   B A R', w / 2, h * 0.76);
}

/** piedra volcánica oscura de los muros (lienzo pequeño que se estira) */
export function piedraOscura(g, w, h) {
  g.fillStyle = '#3b3633';
  g.fillRect(0, 0, w, h);
  let s = 5;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 260; i++) {
    const v = 40 + r() * 40;
    g.fillStyle = `rgb(${v + 6},${v + 2},${v})`;
    g.beginPath();
    g.ellipse(r() * w, r() * h, 6 + r() * 14, 4 + r() * 8, r() * 3, 0, Math.PI * 2);
    g.fill();
  }
}

/** el toldo azul de la Casa del Miedo: la lona en pendiente y el faldón con el nombre */
function toldoMiedo(k, s0, s1, yPared, fuera, zPared) {
  const w = s1 - s0, sm = (s0 + s1) / 2, dy = 0.45, L = Math.hypot(fuera, dy);
  const tela = new THREE.BoxGeometry(w, 0.03, L);
  tela.rotateX(Math.atan2(dy, fuera));
  tela.translate(sm, yPared - dy / 2, zPared + fuera / 2);
  k.add(tela, AZUL_D);
  k.pic(sm, yPared - dy - 0.16, zPared + fuera + 0.02, w, 0.34, 0, 1, canvasTex(512, 56, faldonMiedo));
}

/** banco de madera de listones con patas oscuras, a lo largo de s */
export function banco(k, s, z) {
  for (const dz of [-0.2, 0, 0.2]) k.box(s, 0.42, z + dz, 1.8, 0.04, 0.16, 0x7a5236);
  for (const y of [0.62, 0.78]) k.box(s, y, z + 0.32, 1.8, 0.1, 0.03, 0x7a5236);
  for (const ds of [-0.75, 0.75]) k.box(s + ds, 0, z, 0.06, 0.42, 0.6, 0x2a2a2c);
  k.block(s, z, 1.8, 0.6);
}

/** la barquita de adorno de pie, blanca y azul, con el nombre */
function barquita(k, s, z) {
  // el casco visto de frente: popa cuadrada abajo y la proa en punta arriba
  const forma = new THREE.Shape([[-0.42, 0], [0.42, 0], [0.4, 0.9], [0.26, 1.5], [0, 1.95], [-0.26, 1.5], [-0.4, 0.9]].map(([x, y]) => new THREE.Vector2(x, y)));
  const casco = new THREE.ExtrudeGeometry(forma, { depth: 0.36, bevelEnabled: false });
  casco.translate(s, 0.1, z - 0.18);
  k.add(casco, 0xf2f1ec);
  // el fondo azul de dentro, las bancadas y la franja roja de la popa
  const dentro = new THREE.ShapeGeometry(new THREE.Shape([[-0.32, 0.12], [0.32, 0.12], [0.3, 0.88], [0.18, 1.42], [0, 1.75], [-0.18, 1.42], [-0.3, 0.88]].map(([x, y]) => new THREE.Vector2(x, y))));
  dentro.translate(s, 0.1, z + 0.185);
  k.add(dentro, 0x2a64b8);
  for (const y of [0.55, 1.1]) k.box(s, y, z + 0.17, 0.6 - (y - 0.55) * 0.4, 0.06, 0.04, 0xf2f1ec);
  k.box(s, 0, z, 0.9, 0.12, 0.42, 0xd2443a);
  k.block(s, z, 0.8, 0.4);
}

/** jardinera de piragua vieja, de colores, con flores */
function jardinera(k, s, z, hex) {
  k.box(s, 0.35, z, 1.3, 0.3, 0.42, hex);
  for (const ds of [-0.45, 0.45]) k.box(s + ds, 0, z, 0.08, 0.35, 0.36, 0x8a6a4a);
  for (let i = 0; i < 6; i++) k.ball(s - 0.5 + i * 0.2, 0.72, z, 0.09, [0x3a7a3a, 0xd23a5a, 0xf0c419][i % 3], { seg: 6 });
}

/**
 * la Casa del Miedo (planta baja que sale 1,2 m hacia la placita, con los dos toldos, las puertas de celosía y
 * los ojos de buey) y La Chalana del Charco en lo alto de su plataforma de piedra, con la escalera, la baranda
 * azul, el rótulo, el farol, la cristalera, los bancos, la barquita y las jardineras (en el marco M)
 */
function casaDelMiedo(k) {
  const a = 20.4, b = 30.2, F = 1.2, H = 3.4;
  // el cuerpo de una planta que sale a la placita, con su azotea y la baranda azul
  k.box((a + b) / 2, 0, F / 2, b - a, H, F, WHITE);
  k.block((a + b) / 2, F / 2, b - a, F);
  k.box((a + b) / 2, H, F / 2, b - a + 0.1, 0.1, F + 0.1, 0xe6e4de);
  barandaAzul(k, a + 0.1, b - 0.1, H + 0.1, F - 0.05);
  // los ojos de buey, las puertas de celosía y la puerta abierta
  for (const s of [21.2, 22.1, 29.2, 30.0 - 0.15]) k.pic(s, 1.85, F + 0.02, 0.6, 0.6, 0, 1, canvasTex(96, 96, ojoDeBuey));
  for (const [s, w] of [[23.0, 1.0], [26.4, 1.25], [28.0, 1.0]]) {
    k.pic(s, 1.15, F + 0.02, w, 2.3, 0, 1, canvasTex(128, 288, puertaCelosia));
    k.box(s, 2.3, F + 0.04, w + 0.16, 0.08, 0.06, 0x1d4f9c);
  }
  k.pic(24.4, 1.15, F + 0.02, 1.4, 2.3, 0, 1, canvasTex(144, 240, (g, w, h) => {
    g.fillStyle = '#1b1d20';
    g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,214,150,.12)';
    g.fillRect(w * 0.15, h * 0.1, w * 0.7, h * 0.5);
    g.strokeStyle = '#2a64b8';
    g.lineWidth = 10;
    g.strokeRect(0, 0, w, h);
  }));
  // los dos toldos con el nombre
  toldoMiedo(k, 22.3, 25.2, 3.05, 1.4, F);
  toldoMiedo(k, 25.5, 28.7, 3.05, 1.4, F);
  // la escalera que sube a la plataforma de La Chalana, pegada a la pared, con su pasamanos azul
  const P = 1.26, n = 6, s0 = 30.4, run = 0.3;
  for (let i = 0; i < n; i++) k.box(s0 + run * (i + 0.5), 0, 0.8, run, (P * (i + 1)) / n, 1.4, 0x6b6560);
  barra(k, [s0, 0.95, 1.5], [s0 + run * n, P + 0.95, 1.5], 0.04, AZUL_D);
  for (const s of [s0, s0 + run * n]) k.box(s, s === s0 ? 0 : P, 1.5, 0.04, 0.95, 0.04, AZUL_D);
  // la plataforma de piedra volcánica con la baranda azul por delante y por el lado de la escalera
  const c0 = 32.2, c1 = 39.7, D2 = 4.5;
  k.box((c0 + c1) / 2, 0, D2 / 2, c1 - c0, P, D2, 0x3b3633);
  k.block((c0 + c1) / 2, D2 / 2, c1 - c0, D2);
  k.pic((c0 + c1) / 2, P / 2, D2 + 0.005, c1 - c0, P, 0, 1, canvasTex(512, 96, piedraOscura));
  k.box((c0 + c1) / 2, P, D2 / 2, c1 - c0, 0.04, D2, 0xb8b0a4);
  barandaAzul(k, c0 + 0.05, c1 - 0.05, P, D2 - 0.06);
  for (let z = 1.6; z < D2; z += 0.14) k.box(c0 + 0.05, P, z, 0.025, 0.98, 0.025, AZUL_D);
  for (const yy of [P + 0.05, P + 0.95]) k.box(c0 + 0.05, yy, (1.6 + D2) / 2, 0.05, 0.05, D2 - 1.6, AZUL_D);
  // La Chalana del Charco, en la pared de la plataforma: la cristalera azul, el rótulo, el farol y la ventana
  hueco(k, 35.6, P, 1.9, 2.4, canvasTex(224, 280, cuarterones(2, 3)), { borde: AZUL_D });
  k.pic(35.6, P + 2.95, 0.07, 2.6, 0.7, 0, 1, canvasTex(520, 140, rotuloChalana));
  farolNegro(k, 33.9, P + 3.3);
  hueco(k, 38.5, P + 0.75, 1.1, 1.5, canvasTex(144, 196, cuarterones(2, 2)), { borde: AZUL_D });
  k.box(36.2, P + 4.6, 0.5, 3.0, 0.12, 1.0, WHITE);
  barandaAzul(k, 34.8, 37.6, P + 4.72, 0.95);
  // delante de la plataforma, en la placita: los dos bancos, la barquita de pie y las jardineras de colores
  banco(k, 34.0, D2 + 0.5);
  banco(k, 37.8, D2 + 0.5);
  barquita(k, 35.9, D2 + 0.35);
  jardinera(k, 32.9, D2 + 0.45, 0xc23a32);
  jardinera(k, 30.9, 2.6, 0x2a64b8);
}

/** las mesas de aluminio de la Casa del Miedo, delante de los toldos */
function terrazaMiedo(k) {
  const mesas = [];
  for (const [s, z] of [[22.6, 3.3], [25.2, 3.3], [27.8, 3.3], [24.0, 5.4], [26.8, 5.4]]) {
    k.table(s, z, { w: 0.7, d: 0.7, h: 0.74, top: 0xc4c8cc, leg: 0xa8acb0 });
    k.chair(s - 0.55, z, Math.PI / 2, 0xb8bcc2, { legs: 0xa8acb0 });
    k.chair(s + 0.55, z, -Math.PI / 2, 0xb8bcc2, { legs: 0xa8acb0 });
    k.block(s, z, 0.7, 0.7);
    mesas.push([s, z]);
  }
  return mesas;
}

// la gente de la Casa del Miedo (sin nombre: no hablan)
const CLIENTES_MIEDO = [
  { sex: 'm', skin: 0xc8916c, hair: 0x2a1d14, hairStyle: 'short', top: 0x1d1d1f, bottom: 0x3b4a66, height: 1.76 },
  { sex: 'm', skin: 0x9a6844, hair: 0x8c8580, hairStyle: 'short', top: 0xe8e2d4, bottom: 0x4a4038, height: 1.7, beard: true },
  { sex: 'f', skin: 0xe8c4a2, hair: 0x15110e, hairStyle: 'ponytail', top: 0x2a8a8a, bottom: 0x22252a, height: 1.63 },
].map(l => ({ eyes: 0x3a2616, topStyle: 'tshirt', bottomStyle: 'pants', shoes: 0x2a2c30, shoeStyle: 'shoe', build: 1, ...l }));
const SENTADOS_MIEDO = [[0, 1], [1, -1], [3, 1]];

// ——— La Miñoca Café del Charco (en la manzana de la Raspa, en la punta de la calle Muelle) ———

/** la franja azul de encima de la planta baja con «La Miñoca» en blanco y el ancla */
function bandaMinoca(g, w, h) {
  g.fillStyle = '#2a64b8';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#f4f4f0';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `600 ${Math.round(h * 0.62)}px ${SERIF}`;
  g.fillText('La Miñoca', w / 2 + h * 0.3, h * 0.55);
  // el ancla de delante del nombre
  const x = w / 2 - h * 1.9, y = h * 0.5, r = h * 0.28;
  g.strokeStyle = '#f4f4f0';
  g.lineWidth = Math.max(2, h * 0.06);
  g.beginPath(); g.moveTo(x, y - r); g.lineTo(x, y + r); g.stroke();
  g.beginPath(); g.arc(x, y + r * 0.2, r * 0.8, 0.2, Math.PI - 0.2); g.stroke();
  g.beginPath(); g.moveTo(x - r * 0.4, y - r * 0.55); g.lineTo(x + r * 0.4, y - r * 0.55); g.stroke();
}

/** el número de la casa en su placa azul */
function placa22(g, w, h) {
  g.fillStyle = '#2a64b8';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#f4f4f0';
  g.lineWidth = 3;
  g.strokeRect(4, 4, w - 8, h - 8);
  g.fillStyle = '#f4f4f0';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(h * 0.6)}px Arial, sans-serif`;
  g.fillText('22', w / 2, h * 0.54);
}

/** lo que se ve por la puerta abierta del bar: la barra, las botellas y la tele */
export function barDentro(g, w, h) {
  g.fillStyle = '#2a2624';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#e8e2d4';
  g.fillRect(0, 0, w, h * 0.12);
  // las baldas de las botellas y la tele
  for (const y of [0.22, 0.34]) {
    g.fillStyle = '#5a4636';
    g.fillRect(w * 0.08, h * y + h * 0.07, w * 0.84, 3);
    for (let x = w * 0.1; x < w * 0.9; x += 6) { g.fillStyle = ['#3a5a2a', '#d8c08a', '#8a2a22'][Math.floor(x) % 3]; g.fillRect(x, h * y, 3, h * 0.07); }
  }
  g.fillStyle = '#121416';
  g.fillRect(w * 0.55, h * 0.13, w * 0.35, h * 0.08);
  // la barra
  g.fillStyle = '#6a5a4a';
  g.fillRect(0, h * 0.55, w * 0.8, h * 0.06);
  g.fillStyle = '#3e3630';
  g.fillRect(0, h * 0.61, w * 0.8, h * 0.39);
  const luz = g.createRadialGradient(w / 2, h * 0.3, 4, w / 2, h * 0.3, w);
  luz.addColorStop(0, 'rgba(255,224,170,.22)');
  luz.addColorStop(1, 'rgba(255,224,170,0)');
  g.fillStyle = luz;
  g.fillRect(0, 0, w, h);
}

/** puerta azul de cuarterones, de una o dos hojas */
export function puertaAzul(hojas) {
  return (g, w, h) => {
    g.fillStyle = '#2a64b8';
    g.fillRect(0, 0, w, h);
    const lw = w / hojas;
    g.strokeStyle = '#1d4f9c';
    g.lineWidth = 5;
    for (let i = 0; i < hojas; i++) {
      const x0 = i * lw;
      g.strokeRect(x0 + 3, 3, lw - 6, h - 6);
      for (const [y0, y1] of [[0.06, 0.3], [0.34, 0.62], [0.66, 0.94]]) g.strokeRect(x0 + lw * 0.16, h * y0, lw * 0.68, h * (y1 - y0));
    }
  };
}

/** una pizarra colgada (garabatos de tiza: no se lee) */
export function pizarraColgada(seed) {
  return (g, w, h) => {
    g.fillStyle = '#5a4636';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#1e2321';
    g.fillRect(6, 6, w - 12, h - 12);
    let s = seed;
    const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    g.strokeStyle = 'rgba(240,240,235,.7)';
    g.lineWidth = 2;
    for (let y = h * 0.15; y < h * 0.9; y += h * 0.09) {
      let x = w * 0.15;
      const fin = w * (0.5 + r() * 0.35);
      g.beginPath(); g.moveTo(x, y);
      while (x < fin) { x += 3 + r() * 4; g.lineTo(x, y + (r() - 0.5) * 4); }
      g.stroke();
    }
  };
}

/** La Miñoca (en el marco R, de s 0,2 a 9,2): pared encalada, huecos azules, pizarras y la franja azul con el nombre */
function minoca(k) {
  const s0 = 0.2, s1 = 9.2, sm = (s0 + s1) / 2;
  k.box(sm, 0, 0.025, s1 - s0, 3.15, 0.05, WHITE);
  k.pic(0.65, 2.45, 0.06, 0.32, 0.32, 0, 1, canvasTex(64, 64, placa22));
  // la puerta abierta del bar, con la hoja azul abierta contra la pared
  hueco(k, 1.65, 0, 1.25, 2.35, canvasTex(160, 300, barDentro), { borde: AZUL_D });
  k.pic(2.62, 1.15, 0.07, 0.55, 2.25, 0, 1, canvasTex(72, 288, puertaAzul(1)));
  k.pic(3.35, 1.65, 0.07, 0.6, 0.85, 0, 1, canvasTex(96, 136, pizarraColgada(3)));
  // las puertas azules de dos hojas, la ventana-mostrador con las contraventanas abiertas y otra pizarra
  hueco(k, 4.4, 0, 1.45, 2.4, canvasTex(176, 288, puertaAzul(2)), { borde: AZUL_D });
  hueco(k, 6.25, 1.0, 1.25, 1.25, canvasTex(160, 160, barDentro), { borde: AZUL_D });
  for (const sg of [-1, 1]) k.pic(6.25 + sg * 0.98, 1.62, 0.07, 0.6, 1.25, 0, 1, canvasTex(72, 152, puertaAzul(1)));
  k.pic(7.55, 1.6, 0.07, 0.55, 0.8, 0, 1, canvasTex(88, 128, pizarraColgada(17)));
  hueco(k, 8.45, 0, 1.0, 2.35, canvasTex(128, 288, puertaAzul(1)), { borde: AZUL_D });
  // la franja azul que sale encima de la planta baja, con el nombre
  k.box(sm, 2.75, 0.25, s1 - s0, 0.38, 0.5, AZUL_D);
  k.pic(sm, 2.94, 0.505, 3.6, 0.36, 0, 1, canvasTex(640, 64, bandaMinoca));
}

/** mesa alta con dos taburetes (las de La Miñoca junto al muro del Charco) */
export function mesaAlta(k, s, z) {
  k.cyl(s, 0, z, 0.22, 0.24, 0.04, 0x2a2c30, { seg: 10 });
  k.cyl(s, 0.04, z, 0.035, 0.035, 1.02, 0x2a2c30, { seg: 6 });
  k.box(s, 1.06, z, 0.62, 0.04, 0.62, 0x3a3d42);
  for (const ds of [-0.55, 0.55]) {
    k.cyl(s + ds, 0, z, 0.03, 0.03, 0.75, 0x2a2c30, { seg: 6 });
    k.cyl(s + ds, 0.75, z, 0.18, 0.18, 0.05, 0x2a2c30, { seg: 10 });
  }
  k.block(s, z, 0.62, 0.62);
}

/** la terraza de La Miñoca: sombrillas blancas grandes, mesas y sillas gris oscuro y las mesas altas del muro */
function terrazaMinoca(k, palmas) {
  const mesas = [];
  const libre = (s, z, r) => { const [x, wz] = R.W(s, z); return !palmas.some(([px, pz]) => Math.hypot(px - x, pz - wz) < r); };
  for (const z of [1.5, 3.3, 5.1]) {
    for (const s of [1.3, 3.1, 4.9, 6.7, 8.5]) {
      if (!libre(s, z, 1.4)) continue;
      k.table(s, z, { w: 0.7, d: 0.7, h: 0.74, top: 0x3a3d42, leg: 0x2a2c30 });
      k.chair(s - 0.55, z, Math.PI / 2, 0x4a4e54, { legs: 0x3a3d42 });
      k.chair(s + 0.55, z, -Math.PI / 2, 0x4a4e54, { legs: 0x3a3d42 });
      k.block(s, z, 0.7, 0.7);
      mesas.push([s, z]);
    }
  }
  for (const [s, z] of [[2.2, 2.4], [5.8, 2.4], [2.2, 5.6], [5.8, 5.6], [8.9, 4.0]]) if (libre(s, z, 1.0)) sombrillaGrande(k, s, z, 0xf4f4f0);
  for (const s of [1.6, 4.0, 6.4]) if (libre(s, 7.3, 1.0)) mesaAlta(k, s, 7.3);
  return mesas;
}

// la gente de La Miñoca (sin nombre: no hablan)
const CLIENTES_MINOCA = [
  { sex: 'f', skin: 0xe8c4a2, hair: 0x8a4a22, hairStyle: 'bun', top: 0xf2efe6, bottom: 0x2a2f3a, height: 1.62 },
  { sex: 'm', skin: 0xd9a882, hair: 0x15110e, hairStyle: 'short', top: 0xe8e2d4, bottom: 0x3b4a66, height: 1.78 },
  { sex: 'f', skin: 0xc28a62, hair: 0x2a1d14, hairStyle: 'ponytail', top: 0xd85a8a, bottom: 0x1d2b44, height: 1.6 },
  { sex: 'm', skin: 0xf1d3b8, hair: 0x5a3a22, hairStyle: 'short', top: 0x9a9ea4, bottom: 0x22252a, height: 1.75, beard: true },
  { sex: 'f', skin: 0xf1d3b8, hair: 0x6a4a2a, hairStyle: 'ponytail', top: 0x3a8a4a, bottom: 0x2a2f3a, height: 1.66 },
].map(l => ({ eyes: 0x3a2616, topStyle: 'tshirt', bottomStyle: 'pants', shoes: 0x2a2c30, shoeStyle: 'shoe', build: 1, ...l }));
const SENTADOS_MINOCA = [[0, 1], [1, -1], [2, 1], [6, -1], [7, 1]];

// la gente de la terraza de la Raspa (sin nombre: no hablan)
const CLIENTES_RASPA = [
  { sex: 'm', skin: 0xd9a882, hair: 0x2a1d14, hairStyle: 'short', top: 0x1f2a44, bottom: 0x3b4a66, height: 1.77, beard: true },
  { sex: 'f', skin: 0xe8c4a2, hair: 0x6a4a2a, hairStyle: 'ponytail', top: 0xe85a4a, bottom: 0x2a2f3a, height: 1.63 },
  { sex: 'f', skin: 0xc28a62, hair: 0x15110e, hairStyle: 'bun', top: 0xf2efe6, bottom: 0x1d2b44, height: 1.66 },
  { sex: 'm', skin: 0xf1d3b8, hair: 0x8c8580, hairStyle: 'short', top: 0x6a8a5a, bottom: 0x3a3a40, height: 1.72 },
].map(l => ({ eyes: 0x3a2616, topStyle: 'tshirt', bottomStyle: 'pants', shoes: 0x2a2c30, shoeStyle: 'shoe', build: 1, ...l }));
// en qué mesa (por orden) y en qué silla: -1 la de la izquierda, 1 la de la derecha
const SENTADOS_RASPA = [[1, -1], [1, 1], [5, 1], [6, -1]];

/** gente sentada en las sillas de una terraza, con el asiento a la altura del suelo que se ve */
export function sentados(scene, locales, M, mesas, looks, cuales, extra = 0) {
  if (!locales?.addStreetNpc) return [];
  const sitios = cuales.filter(([m]) => mesas[m]).map(([m, side]) => [mesas[m][0] + side * 0.55, mesas[m][1], side]);
  const lift = sobreSuelo(scene, sitios.map(([s, z]) => M.W(s, z)));
  return sitios.map(([s, z, side], i) => {
    const look = looks[i % looks.length];
    return locales.addStreetNpc({
      name: '',
      look,
      at: M.W(s, z),
      face: Math.atan2(-side * M.U[0], -side * M.U[1]),
      pose: 'sit',
      // el asiento de la silla del kit (0,46 m) sobre el suelo que se ve; addStreetNpc ya suma 0,22
      y: lift[i] + extra + 0.46 - 0.93 * look.height / 1.78 - 0.22,
    });
  });
}

/** segunda fase (el suelo grueso ya está hecho, para las terrazas, y los locales, para la gente) */
export function buildRestaurantesCharco(scene, colliders, map, locales) {
  if (!map?.restaurantesCharco) return null;
  const group = new THREE.Group();
  group.name = 'restaurantesCharco';
  const kR = new Kit();
  raspa(kR);
  group.add(enMarco(kR, R, 'tascaLaRaspa', colliders));
  const palmas = [...(map.extraPalms || []), ...(map._charcoProm?.palms || [])];
  const kT = new Kit();
  const mesas = terrazaRaspa(kT, palmas);
  const terraza = enMarco(kT, R, 'terrazaLaRaspa', colliders);
  group.add(terraza);
  scene.add(group);
  aRasDelSuelo(scene, terraza);
  const gente = sentados(scene, locales, R, mesas, CLIENTES_RASPA, SENTADOS_RASPA);
  // Divina Italia, su placita y su terraza (encima de la piedrecilla, que va a 0,16 m)
  const kD = new Kit();
  divina(kD);
  group.add(enMarco(kD, D, 'divinaItalia', colliders));
  const suelo = placita();
  const kDT = new Kit();
  const mesasD = terrazaDivina(kDT, palmas);
  const terrazaD = enMarco(kDT, D, 'terrazaDivinaItalia', colliders);
  terrazaD.position.y = 0.16;
  group.add(suelo, terrazaD);
  aRasDelSuelo(scene, suelo);
  aRasDelSuelo(scene, terrazaD);
  gente.push(...sentados(scene, locales, D, mesasD, CLIENTES_DIVINA, SENTADOS_DIVINA, 0.16));
  // la Casa del Miedo y La Chalana del Charco, en el lado este de la placita (también encima de la piedrecilla)
  const kM = new Kit();
  casaDelMiedo(kM);
  const miedo = enMarco(kM, M, 'casaDelMiedo', colliders);
  const kMT = new Kit();
  const mesasM = terrazaMiedo(kMT);
  const terrazaM = enMarco(kMT, M, 'terrazaCasaDelMiedo', colliders);
  for (const g of [miedo, terrazaM]) g.position.y = 0.16;
  group.add(miedo, terrazaM);
  aRasDelSuelo(scene, miedo);
  aRasDelSuelo(scene, terrazaM);
  gente.push(...sentados(scene, locales, M, mesasM, CLIENTES_MIEDO, SENTADOS_MIEDO, 0.16));
  // La Miñoca, en la punta de la manzana de la Raspa, y su terraza hasta el muro del Charco
  const kN = new Kit();
  minoca(kN);
  group.add(enMarco(kN, R, 'laMinoca', colliders));
  const kNT = new Kit();
  const mesasN = terrazaMinoca(kNT, palmas);
  const terrazaN = enMarco(kNT, R, 'terrazaLaMinoca', colliders);
  group.add(terrazaN);
  aRasDelSuelo(scene, terrazaN);
  gente.push(...sentados(scene, locales, R, mesasN, CLIENTES_MINOCA, SENTADOS_MINOCA));
  return { group, gente };
}
