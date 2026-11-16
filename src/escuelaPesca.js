import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { Kit, canvasTex } from './interiorKit.js';
import { findBuilding } from './civic.js';
import { paveMesh, polyTris, plazaSlabs } from './suelos.js';

/**
 * La Escuela de Pesca (Instituto Marítimo Pesquero, Avenida de Naos), con la foto del lateral que
 * mandó José Manuel: el extremo que da a la rotonda es un bloque blanco de tres plantas con aletas
 * verticales y ventanales oscuros, el bajo metido bajo una visera con ventanas corridas y, delante,
 * una jardinera de piedra volcánica con pitas. A su derecha, la escalera de incendios en una jaula
 * de acero negro y la verja crema con el portón del parking de tierra roja (con sus palmeras), que
 * sigue calle abajo. Delante pasa el carril bici rojo con sus macetas y una farola alta.
 * Con la segunda foto: el lado largo que da a la Avenida de Naos sigue igual (aletas, ventanales,
 * visera con pilares y ventanas corridas, bancos y macetas en la acera roja), entre los dos queda un
 * muro blanco liso, y enfrente, al otro lado de la avenida, está la torre gris de hormigón con el
 * letrero «Escuela de Pesca», sus antenas y la verja verde oscura.
 * Con la tercera foto (la entrada): el lado de la avenida tiene tres tramos, ventanales anchos con
 * aletas a los lados y, en el centro, ventanas estrechas; abajo, el pórtico con columnas blancas, las
 * puertas de cristal y en la visera el letrero «Gobierno de Canarias · Dirección General de Pesca ·
 * Residencia del Instituto Politécnico Marítimo Pesquero de Canarias» con dos anclas negras cruzadas
 * encima. Delante, la plaza roja con bancos, maceteros redondos, aparcabicis en U, papeleras, un
 * banderín azul, palmeras a la derecha y una farola alta; en la avenida, la mediana con arbustos y el
 * paso de cebra que lleva a la entrada.
 * Con la cuarta foto (el bloque de la esquina desde la avenida): el bajo de la derecha es un soportal
 * abierto que sigue por debajo del lateral, el pilar de la esquina aguanta las plantas de arriba, las
 * ventanas llevan una visera oscura encima y, a la izquierda, un poco más metido, hay un entrante con
 * una ventana alta, la placa azul y un foco. Delante de las palmeras, un arriate de piedra volcánica.
 * Medidas sacadas de las fotos y de la foto aérea; la trasera al mar, cuando llegue su foto.
 */

const WHITE = 0xf1f1ee, DARK = 0x1a1d21, GLASS = 0x3b4854, BASALT = 0x2b2826, SOIL = 0x5e3f2b;
const AGAVE = 0x6e8c74, STEEL = 0x1c1f23, CREAM = 0xe4d6a4, RAIL = 0xefe9d8, PINK = 0xd9c5d0;
const H_PT = [727.5, -52.6], G_PT = [721.2, -47.7];   // las dos esquinas del extremo (contorno del mapa)
const N_END = [-0.614, -0.789];                        // hacia la rotonda (fuera del edificio)
const I_PT = [732.9, -45.7], J_PT = [762.4, -68.8];   // el lado largo de la Avenida de Naos
// la torre gris, al otro lado de la avenida: su fachada a la avenida va de T0 a T1
const T0 = [735.8, -91], T1 = [751.6, -107], TOWER_H = 19.5;
// su contorno (del mapa): se forra entero de hormigón, que casi no tiene ventanas
const TOWER = [[751.6, -107], [735.8, -91], [732.8, -94.1], [737, -98.4], [732.4, -102.9], [741.2, -111.8], [745.6, -107.4], [748.4, -110.1]];
const CON = 0x9d9c96;
const W = Math.hypot(G_PT[0] - H_PT[0], G_PT[1] - H_PT[1]);   // ~8 m, lo mismo que en la foto
const TOP = 11.2;                                      // tres plantas
// la verja del parking: tramo junto al edificio (hasta END, junto al carril bici) y luego calle abajo
const FZ = 0.3, END = W + 5.85;
// el soportal: el bajo está abierto desde x = PASS hasta el lateral, y sigue por debajo de todo el
// lateral hasta la otra ala (SIDE_D más atrás, contorno del mapa)
const PASS = 5.4, SIDE_D = 10.18;
// el entrante de la izquierda: BAY de ancho y BAY_Z más metido que el frente; llega hasta el lado largo
const BAY = 2.1, BAY_Z = 0.5, BACK = 8.78;
// del marco del extremo (x de H hacia G, z hacia fuera) al mundo
const onEnd = (x, z) => [H_PT[0] + N_END[1] * x + N_END[0] * z, H_PT[1] - N_END[0] * x + N_END[1] * z];
const PARK_SW = [716.6, -3];
// el carril bici (el camino del mapa entre la calle y la escuela, alargado junto a la avenida)
const LANE = [[715, -14], [714, -36], [714, -40], [715, -47], [717, -49], [719, -51], [729, -59], [739, -65], [758.6, -80.5]];
// el lado de la avenida: x de J hacia I (de izquierda a derecha mirando la entrada), z hacia la avenida
const N_AV = [-0.616, -0.787], EX_AV = [N_AV[1], -N_AV[0]];
const onAv = (x, z) => [J_PT[0] + EX_AV[0] * x + N_AV[0] * z, J_PT[1] + EX_AV[1] * x + N_AV[1] * z];
const PY = 0.24;                                       // la plaza, a la altura de la acera
// la plaza roja hasta el carril bici (su borde va siguiendo el carril)
const PLAZA = [[0, 0], [37.4, 0], [37.4, 11.8], [32.3, 11.85], [20.8, 10.45], [0, 10.55]];
// las dos palmeras de la plaza, a la derecha de la entrada (con su parterre de piedra)
const PLAZA_PALMS = [[30.8, 6.6], [33.9, 4.4]];
// la mediana de la avenida: a medio camino entre las dos calzadas (Av. de Naos y Juan de Quesada),
// donde no la pisan los coches; se corta en el paso de cebra (x 19,5 a 22)
const MEDIAN = [[0, 22.4], [20.7, 22.9], [38, 22.8]];
const ZEBRA_X = 20.75;
/** palmeras del parking de tierra roja (manchas de la foto aérea) y las dos de la plaza de la entrada */
export const ESCUELA_PALMS = [[722.8, -27.1, 8.5], [729.1, -19.8, 9.2], [738.5, -14.6, 8], [721.8, -10.4, 9.6],
  ...PLAZA_PALMS.map(([x, z], i) => [...onAv(x, z), 9.4 + i * 0.8])];

/** el edificio entero es de tres plantas y blanco (antes de levantar la ciudad) */
export function tuneEscuelaPesca(map) {
  const b = findBuilding(map, 752, -50);
  if (!b) return;
  b.h = TOP;
  b.f = [242, 242, 238];
  b.s = 0;
  // las banderas, en el lado largo de la Avenida de Naos; el letrero lo lleva la torre gris
  b.face = [I_PT[0], I_PT[1], J_PT[0], J_PT[1], -0.616, -0.787, 37.5];
  b.ownFacade = true;
  // el soportal: el frente se parte en PASS y ni ese tramo ni el lateral llevan la pared genérica del bajo
  const at = (pt) => b.p.findIndex(q => Math.hypot(q[0] - pt[0], q[1] - pt[1]) < 0.3);
  const iG = at(G_PT), iH = at(H_PT);
  if (iG > 0 && iH > 0 && Math.abs(iG - iH) === 1) {
    const g = b.p[iG], P = onEnd(PASS, 0);
    b.p.splice(Math.max(iG, iH), 0, P);
    const gi = b.p.indexOf(g), side = [b.p[gi - 1], b.p[gi + 1]].find(q => q && q !== P);
    b.openGround = [[g[0], g[1], P[0], P[1]]];
    if (side) b.openGround.push([g[0], g[1], side[0], side[1]]);
  }
  // la torre de hormigón gris del otro lado de la avenida
  const t = findBuilding(map, 742, -101);
  if (t && t !== b) {
    t.h = TOWER_H;
    t.f = [160, 159, 152];
    t.s = 0;
  }
}

/** placa azul de calle, sin letras (el nombre completo no se ve en la foto) */
function plate(g, w, h) {
  g.fillStyle = '#1a4fa0'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#ffffff'; g.lineWidth = 5; g.strokeRect(6, 6, w - 12, h - 12);
  g.fillStyle = 'rgba(255,255,255,0.85)';
  for (const y of [0.38, 0.62]) g.fillRect(w * 0.18, h * y - 3, w * 0.64, 6);
}

/** ventanal: cristal oscuro un poco metido, marco negro, hojas correderas y montante arriba */
export function windowBay(k, x0, x1, y0, h, panes, z) {
  const w = x1 - x0, x = (x0 + x1) / 2, f = 0.06;
  k.box(x, y0, z, w, h, 0.03, GLASS);
  k.box(x, y0, z + 0.03, w, f, 0.04, DARK).box(x, y0 + h - f, z + 0.03, w, f, 0.04, DARK);
  k.box(x0 + f / 2, y0, z + 0.03, f, h, 0.04, DARK).box(x1 - f / 2, y0, z + 0.03, f, h, 0.04, DARK);
  k.box(x, y0 + h * 0.8, z + 0.03, w, f * 0.8, 0.04, DARK);
  for (let i = 1; i < panes; i++) k.box(x0 + (w * i) / panes, y0, z + 0.03, f * 0.8, h * 0.8, 0.04, DARK);
  k.box(x, y0 - 0.06, z + 0.06, w + 0.1, 0.06, 0.16, WHITE);   // vierteaguas
}

/** pita: hojas largas en abanico desde el suelo */
function agave(k, x, y, z, s = 1) {
  for (let i = 0; i < 9; i++) {
    const ry = (i / 9) * Math.PI * 2, rx = 0.35 + (i % 3) * 0.22;
    k.cyl(x, y, z, 0, 0.05 * s, 0.75 * s, AGAVE, { seg: 4, rx, ry });
  }
}

/** palmera pequeña: tronco corto y penachos de hojas */
function youngPalm(k, x, y, z, h) {
  k.cyl(x, y, z, 0.12, 0.17, h, 0x6b5a45, { seg: 8 });
  for (let i = 0; i < 12; i++) {
    const ry = (i / 12) * Math.PI * 2 + (i % 2) * 0.2, rx = 0.75 + (i % 3) * 0.3;
    k.cyl(x, y + h, z, 0, 0.07, 1.4, 0x4c7a3a, { seg: 3, rx, ry });
  }
}

/** barrotes de verja entre x0 y x1 (en z), de y0 a y1, con pasamanos arriba */
function bars(k, x0, x1, z, y0, y1, color = RAIL, step = 0.12) {
  for (let x = x0 + step / 2; x < x1; x += step) k.box(x, y0, z, 0.025, y1 - y0, 0.025, color);
  k.box((x0 + x1) / 2, y1 - 0.04, z, x1 - x0, 0.05, 0.05, color).box((x0 + x1) / 2, y0, z, x1 - x0, 0.05, 0.05, color);
}

/** visera oscura encima de un ventanal (foto del bloque de la esquina) */
function visor(k, x0, x1, y, z) {
  k.box((x0 + x1) / 2, y, z + 0.17, x1 - x0 + 0.06, 0.05, 0.34, DARK);
}

/** el soportal de la esquina: pared de dentro, fondo, techo, suelo y pilares a lo largo del lateral */
function arcade(k) {
  const w = W - PASS, cx = (PASS + W) / 2, d = SIDE_D;
  k.box(PASS - 0.05, 0, -d / 2, 0.1, 3.25, d, WHITE, { list: k.shell });
  k.box(cx, 0, -d - 0.05, w, 3.25, 0.1, WHITE, { list: k.shell });
  k.box(cx, 2.95, -d / 2, w + 0.1, 0.3, d + 0.1, 0xeaeae6, { list: k.shell });
  k.box(cx, 0, -d / 2, w, 0.12, d, 0xc9c6bf, { list: k.shell });
  for (const z of [-3.4, -6.8, -d + 0.25]) {
    k.box(W - 0.22, 0, z, 0.4, 2.95, 0.4, WHITE);
    k.block(W - 0.22, z, 0.4, 0.4);
  }
  // en la pared de dentro, una puerta oscura y una ventana
  k.box(PASS + 0.03, 0.12, -4.6, 0.05, 2.2, 1.0, DARK);
  k.box(PASS + 0.03, 1.2, -8.0, 0.04, 1.4, 2.2, GLASS).box(PASS + 0.05, 2.55, -8.0, 0.05, 0.06, 2.3, DARK).box(PASS + 0.05, 1.15, -8.0, 0.05, 0.06, 2.3, DARK);
  k.box(cx, 2.7, -1.2, 0.3, 0.12, 0.3, 0x2a2d31);   // foco en el techo
}

/** el entrante de la izquierda: algo metido, con su ventana alta, la placa azul, el foco y ventanas estrechas */
function bay(k) {
  const z = -BAY_Z, d = BACK - BAY_Z, cx = -BAY / 2, cz = z - d / 2;
  k.box(cx, 0, cz, BAY, TOP, d, WHITE, { list: k.shell });
  k.box(cx, TOP, cz, BAY - 0.02, 0.02, d - 0.02, 0x3a4049, { list: k.shell });     // azotea
  k.box(cx, TOP, z - 0.1, BAY, 0.6, 0.2, WHITE).box(-BAY + 0.1, TOP, cz, 0.2, 0.6, d, WHITE);   // pretil
  k.box(-0.01, 0, z / 2, 0.02, TOP, BAY_Z, WHITE, { list: k.shell });             // el escalón con el frente
  k.box(cx, 3.05, z + 0.12, BAY, 0.22, 0.24, WHITE);                              // canto de la visera
  windowBay(k, -1.45, -0.75, 1.3, 1.6, 2, z + 0.04);
  k.pic(-1.78, 2.72, z + 0.02, 0.42, 0.24, 0, 1, canvasTex(168, 96, plate));
  k.box(-1.22, 2.92, z + 0.1, 0.18, 0.12, 0.2, 0x2a2d31);                         // foco
  for (const [y0, h] of [[4.72, 1.78], [7.75, 1.95]]) {
    windowBay(k, -1.8, -1.35, y0, h, 1, z + 0.04);
    visor(k, -1.8, -1.35, y0 + h, z + 0.04);
  }
  k.block(cx, cz, BAY, d);
}

/** el extremo de la foto, con la escalera y el primer tramo de verja (x desde la esquina H hacia G) */
function endFacade() {
  const k = new Kit();
  // bajo: pared metida con ventanas corridas desde el pilar de la izquierda hasta el soportal, y el
  // pilar de la esquina, que aguanta las plantas de arriba (la puerta y la placa están en el entrante)
  k.box(PASS / 2, 0, 0.01, PASS, 3.25, 0.02, WHITE, { list: k.shell });
  k.box(0.3, 0, 0.45, 0.6, 3.25, 0.9, WHITE).box(W - 0.25, 0, 0.45, 0.5, 3.25, 0.9, WHITE);
  const ww = (PASS - 0.7) / 9;
  for (let i = 0; i < 9; i++) windowBay(k, 0.65 + i * ww, 0.65 + (i + 1) * ww - 0.04, 1.2, 1.6, 1, 0.04);
  arcade(k);
  bay(k);
  // la visera blanca encima del bajo
  k.box(W / 2, 3.2, 0.45, W, 0.72, 0.9, WHITE);
  // plantas de arriba: franjas blancas, pared del fondo, aletas y ventanales (ancho, estrecho, ancho)
  k.box(W / 2, 3.92, 0.3, W, 0.8, 0.6, WHITE).box(W / 2, 6.5, 0.3, W, 1.25, 0.6, WHITE).box(W / 2, 9.7, 0.3, W, TOP - 9.7, 0.6, WHITE);
  k.box(W / 2, 4.72, 0.2, W, 4.98, 0.4, WHITE, { list: k.shell });
  for (const [x0, x1] of [[0, 0.6], [2.95, 3.25], [4.3, 4.6], [W - 0.3, W]]) k.box((x0 + x1) / 2, 3.92, 0.36, x1 - x0, TOP - 3.92, 0.72, WHITE);
  for (const [y0, h] of [[4.72, 1.78], [7.75, 1.95]]) {
    windowBay(k, 0.6, 2.95, y0, h, 3, 0.42);
    windowBay(k, 3.25, 4.3, y0, h, 1, 0.42);
    windowBay(k, 4.6, W - 0.3, y0, h, 3, 0.42);
    for (const [x0, x1] of [[0.6, 2.95], [3.25, 4.3], [4.6, W - 0.3]]) visor(k, x0, x1, y0 + h, 0.42);
  }
  k.box(W - 0.6, TOP, 0.4, 0.3, 0.16, 0.24, 0x2a2d31);   // foco en lo alto de la esquina
  // jardinera de piedra volcánica a todo lo largo, con tierra y pitas
  const px0 = -BAY - 0.2, px1 = W + 0.2;
  k.box((px0 + px1) / 2, 0, 1.55, px1 - px0, 0.58, 1.3, BASALT);
  k.box((px0 + px1) / 2, 0.58, 1.55, px1 - px0 - 0.2, 0.03, 1.1, SOIL);
  for (const x of [-1.6, -0.4, 1.2, 2.6, 3.9, 5.3, 6.6]) agave(k, x, 0.6, 1.55 + (Math.abs(x) % 2 ? 0.15 : -0.2), 0.9 + (Math.abs(x) % 3) * 0.1);
  k.seg(px0, 2.2, px1, 2.2);
  // macetas redondas grises y la farola alta del carril bici
  for (const x of [0.6, 4.9]) {
    k.cyl(x, 0, 2.75, 0.27, 0.24, 0.52, 0x575b60, { seg: 16 });
    k.ball(x, 0.62, 2.75, 0.24, 0x7a9a5c, { sy: 0.7 });
    k.block(x, 2.75, 0.55, 0.55);
  }
  k.cyl(4.0, 0, 3.0, 0.07, 0.1, 9.0, 0x9aa0a6, { seg: 10 });
  k.box(4.0, 8.85, 2.65, 0.14, 0.08, 0.8, 0x9aa0a6).box(4.0, 8.72, 2.25, 0.3, 0.14, 0.4, 0x8a9096);
  k.box(4.0, 5.2, 3.3, 0.12, 0.07, 0.6, 0x9aa0a6).box(4.0, 5.08, 3.55, 0.26, 0.12, 0.34, 0x8a9096);
  k.block(4.0, 3.0, 0.3, 0.3);

  // la escalera de incendios en su jaula de acero negro, pegada al lateral
  const sx0 = W + 0.1, sx1 = W + 2.5, sz0 = -0.8, sz1 = -3.8, SH = TOP + 0.4;
  for (const x of [sx0, sx1]) for (const z of [sz0, sz1]) k.box(x, 0, z, 0.12, SH, 0.12, STEEL);
  for (let x = sx0 + 0.25; x < sx1; x += 0.25) k.box(x, 0, sz0, 0.035, SH, 0.035, STEEL);
  for (let z = sz0 - 0.25; z > sz1; z -= 0.25) k.box(sx1, 0, z, 0.035, SH, 0.035, STEEL);
  for (const y of [0, 3.6, 7.3, TOP - 0.2, SH - 0.08]) {
    k.box((sx0 + sx1) / 2, y, sz0, sx1 - sx0, 0.08, 0.08, STEEL).box(sx1, y, (sz0 + sz1) / 2, 0.08, 0.08, sz0 - sz1, STEEL);
    k.box((sx0 + sx1) / 2, y, (sz0 + sz1) / 2, sx1 - sx0 - 0.1, 0.05, sz0 - sz1 - 0.1, STEEL);   // rellano
  }
  // tramos de escalones, en zigzag entre rellanos
  for (let fl = 0; fl < 3; fl++) {
    const yA = [0, 3.6, 7.3][fl], dy = ([3.6, 7.3, TOP - 0.2][fl] - yA) / 2;
    for (const [half, back] of [[0, true], [1, false]]) {
      const x = half ? sx1 - 0.6 : sx0 + 0.6, n = 10;
      for (let i = 0; i < n; i++) {
        const t = i / n, z = back ? sz0 - 0.4 - t * 2.2 : sz1 + 0.4 + t * 2.2;
        k.box(x, yA + dy * half + dy * t, z, 1.05, 0.04, 0.26, STEEL);
      }
    }
  }
  k.block((sx0 + sx1) / 2, (sz0 + sz1) / 2, sx1 - sx0, sz0 - sz1);

  // primer tramo de verja: murete rosado y barrotes, pilar, portón crema y otro pilar
  const fz = FZ, gx0 = W + 2.15, end = END, gx1 = end - 0.5;
  k.box(W + 0.9, 0, fz, 1.8, 0.5, 0.26, PINK);
  bars(k, W, W + 1.8, fz, 0.5, 2.0);
  for (const x of [W + 1.95, end - 0.3]) k.box(x, 0, fz, 0.42, 2.5, 0.42, WHITE).box(x, 2.5, fz, 0.5, 0.08, 0.5, 0xdcdcd6);
  const mid = (gx0 + gx1) / 2;
  k.box((gx0 + mid) / 2, 0.05, fz, mid - gx0 - 0.03, 1.45, 0.06, CREAM).box((mid + gx1) / 2, 0.05, fz, gx1 - mid - 0.03, 1.75, 0.06, CREAM);
  bars(k, gx0, mid, fz, 1.5, 2.2, CREAM, 0.14);
  bars(k, mid, gx1, fz, 1.8, 2.2, CREAM, 0.14);
  k.box(mid, 0, fz, 0.05, 2.2, 0.07, 0xc9bb88);
  k.seg(W, fz, end, fz);
  return k;
}

/** letrero de la visera de la entrada, con el texto tal cual sale en la foto */
function entranceSign(g, w, h) {
  g.fillStyle = '#f5f5f2';
  g.fillRect(0, 0, w, h);
  // escudo azul con las siete islas
  const sx = h * 0.2, sw = h * 0.58, sy = h * 0.13, sh = h * 0.74;
  g.fillStyle = '#1d4f9c';
  g.beginPath();
  g.moveTo(sx, sy); g.lineTo(sx + sw, sy); g.lineTo(sx + sw, sy + sh * 0.58);
  g.quadraticCurveTo(sx + sw, sy + sh, sx + sw / 2, sy + sh);
  g.quadraticCurveTo(sx, sy + sh, sx, sy + sh * 0.58);
  g.closePath(); g.fill();
  g.fillStyle = '#f2c53d';
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 - Math.PI / 2;
    g.beginPath(); g.arc(sx + sw / 2 + Math.cos(a) * sw * 0.26, sy + sh * 0.44 + Math.sin(a) * sw * 0.26, h * 0.035, 0, Math.PI * 2); g.fill();
  }
  // a la izquierda, quién lo lleva; a la derecha, qué es
  const font = (wt, px) => `${wt} ${Math.round(px)}px "Barlow", Arial, sans-serif`;
  const tx = sx + sw + h * 0.22;
  g.fillStyle = '#1f2326';
  g.textBaseline = 'middle';
  g.textAlign = 'left';
  g.font = font(700, h * 0.3); g.fillText('Gobierno de Canarias', tx, h * 0.34);
  const w1 = g.measureText('Gobierno de Canarias').width;
  g.font = font(500, h * 0.24); g.fillText('Dirección General de Pesca', tx, h * 0.7);
  const left = tx + Math.max(w1, g.measureText('Dirección General de Pesca').width) + h * 0.3;
  g.fillStyle = '#1d4f9c';
  g.fillRect(left, h * 0.14, h * 0.04, h * 0.72);
  g.fillStyle = '#1f2326';
  g.textAlign = 'center';
  const lines = ['Residencia del Instituto Politécnico', 'Marítimo Pesquero de Canarias'], room = w - left - h * 0.5;
  let px = h * 0.36;
  g.font = font(700, px);
  while (g.measureText(lines[0]).width > room && px > 10) g.font = font(700, (px -= 2));
  const cx = left + h * 0.25 + room / 2;
  g.fillText(lines[0], cx, h * 0.31);
  g.fillText(lines[1], cx, h * 0.71);
}

/** un ancla negra (caña, cepo, arganeo, brazos y uñas) girada tilt en el plano de la fachada */
function anchorGeo(s, tilt) {
  const parts = [];
  const put = (g, x, y) => { g.translate(x, y, 0); parts.push(g); };
  put(new THREE.BoxGeometry(0.08 * s, 1.1 * s, 0.07), 0, 0);
  put(new THREE.BoxGeometry(0.52 * s, 0.07 * s, 0.08), 0, 0.38 * s);
  put(new THREE.TorusGeometry(0.09 * s, 0.025 * s, 6, 14), 0, 0.64 * s);
  // los brazos: un arco de 120° con el punto más bajo al pie de la caña, y las uñas en las puntas
  const R = 0.3 * s, ARC = (Math.PI * 2) / 3;
  const arms = new THREE.TorusGeometry(R, 0.045 * s, 6, 14, ARC);
  arms.rotateZ(1.5 * Math.PI - ARC / 2);
  put(arms, 0, -0.55 * s + R);
  for (const side of [-1, 1]) {
    const fluke = new THREE.ConeGeometry(0.09 * s, 0.24 * s, 4);
    fluke.rotateZ(-side * 0.524);
    put(fluke, side * (0.866 * R + 0.06 * s), -0.55 * s + 0.5 * R + 0.1 * s);
  }
  const g = mergeGeometries(parts);
  g.rotateZ(tilt);
  return g;
}

/** aparcabicis en U, de lado a la fachada */
function bikeRack(k, x, y, z) {
  const u = new THREE.TorusGeometry(0.32, 0.028, 6, 12, Math.PI);
  u.rotateY(Math.PI / 2);
  u.translate(x, y + 0.5, z);
  k.add(u, 0x8e949a);
  for (const dz of [-0.32, 0.32]) k.cyl(x, y, z + dz, 0.028, 0.028, 0.5, 0x8e949a, { seg: 6 });
}

/**
 * el lado de la avenida, como en la foto de la entrada: a los lados (tramos A y C) ventanales anchos con
 * aletas y uno estrecho en medio; en el centro (B), siete ventanas estrechas con aletas finas. Abajo,
 * el pórtico con columnas, las puertas de cristal, el letrero y las anclas, y delante la plaza roja.
 */
function frontFacade(L) {
  const k = new Kit(), A = 12.5, C = L - 12.5, M = L / 2, P0 = A - 1.5, P1 = C + 1.5;
  // ── bajo: pared del fondo, visera a los lados y más honda en el pórtico ──
  k.box(M, 0, 0.01, L, 3.25, 0.02, WHITE, { list: k.shell });
  k.box(P0 / 2, 3.2, 0.45, P0, 0.72, 0.9, WHITE).box((P1 + L) / 2, 3.2, 0.45, L - P1, 0.72, 0.9, WHITE);
  k.box(M, 3.2, 1.0, P1 - P0, 0.72, 2.0, WHITE);
  // tramos A y C: pilares y ventanas corridas
  for (const [x, w, d] of [[0.25, 0.5, 0.9], [6.0, 0.36, 0.36], [L - 6.0, 0.36, 0.36], [L - 0.25, 0.5, 0.9]]) k.box(x, 0, d / 2, w, 3.2, d, WHITE);
  windowBay(k, 0.7, 5.6, 1.0, 1.9, 4, 0.04);
  windowBay(k, 6.4, P0 - 0.4, 1.0, 1.9, 3, 0.04);
  windowBay(k, P1 + 0.4, L - 6.4, 1.0, 1.9, 3, 0.04);
  windowBay(k, L - 5.6, L - 0.7, 1.0, 1.9, 4, 0.04);
  // el pórtico: columnas redondas blancas, puertas de cristal y ventanas a los lados
  for (const x of [P0 + 0.3, M - 3.55, M + 3.55, P1 - 0.3]) {
    k.cyl(x, 0, 1.7, 0.22, 0.22, 3.2, WHITE, { seg: 16 });
    k.block(x, 1.7, 0.44, 0.44);
  }
  windowBay(k, M - 3.1, M + 3.1, 0, 2.9, 6, 0.04);
  for (const x of [M - 1.6, M - 0.1, M + 0.1, M + 1.6]) k.box(x, 0.95, 0.12, 0.04, 0.5, 0.04, 0xb8bcc0);   // tiradores
  windowBay(k, P0 + 0.6, M - 3.6, 1.0, 1.9, 3, 0.04);
  windowBay(k, M + 3.6, P1 - 0.6, 1.0, 1.9, 3, 0.04);
  k.box(M, 0, 1.0, P1 - P0, PY + 0.02, 2.0, 0xc9c6bf, { list: k.shell });   // suelo del pórtico
  // el letrero en el canto de la visera y las dos anclas negras cruzadas encima
  k.pic(M, 3.56, 2.0, 8.4, 0.64, 0, 1, canvasTex(2048, 156, entranceSign));
  for (const tilt of [-0.75, 0.75]) {
    const g = anchorGeo(1.4, tilt);
    g.translate(M, 3.92 + 0.95, 1.45);
    k.add(g, 0x16181b);
  }
  // ── plantas de arriba ──
  // A y C: franjas hondas, pared del fondo, aletas y ventanales (ancho, estrecho, ancho)
  for (const [x0, x1] of [[0, A], [C, L]]) {
    const w = x1 - x0, x = (x0 + x1) / 2;
    k.box(x, 3.92, 0.3, w, 0.8, 0.6, WHITE).box(x, 6.5, 0.3, w, 1.25, 0.6, WHITE).box(x, 9.7, 0.3, w, TOP - 9.7, 0.6, WHITE);
    k.box(x, 4.72, 0.2, w, 4.98, 0.4, WHITE, { list: k.shell });
  }
  const finsA = [[0, 0.3], [5.05, 5.35], [6.65, 6.95], [A - 0.15, A + 0.15]];
  const fins = [...finsA, ...finsA.map(([a, b]) => [L - b, L - a])];
  for (const [x0, x1] of fins) k.box((x0 + x1) / 2, 3.92, 0.36, x1 - x0, TOP - 3.92, 0.72, WHITE);
  for (const [y0, h] of [[4.72, 1.78], [7.75, 1.95]]) {
    for (const [x0, x1, panes] of [[0.3, 5.05, 4], [5.35, 6.65, 1], [6.95, A - 0.15, 4]]) {
      windowBay(k, x0, x1, y0, h, panes, 0.42);
      windowBay(k, L - x1, L - x0, y0, h, panes, 0.42);
    }
  }
  // B: más metido, franjas finas y siete ventanas estrechas entre aletas finas
  const b0 = A + 0.15, b1 = C - 0.15, bw = b1 - b0, step = bw / 7;
  k.box(M, 3.92, 0.15, bw, 0.8, 0.3, WHITE).box(M, 6.5, 0.15, bw, 1.25, 0.3, WHITE).box(M, 9.7, 0.15, bw, TOP - 9.7, 0.3, WHITE);
  k.box(M, 4.72, 0.1, bw, 4.98, 0.2, WHITE, { list: k.shell });
  for (let i = 1; i < 7; i++) k.box(b0 + i * step, 3.92, 0.18, 0.14, TOP - 3.92, 0.36, WHITE);
  for (let i = 0; i < 7; i++) {
    for (const [y0, h] of [[4.72, 1.78], [7.75, 1.95]]) windowBay(k, b0 + i * step + 0.09, b0 + (i + 1) * step - 0.09, y0, h, 1, 0.24);
  }
  // ── la plaza (el suelo rojo va aparte, en el mundo): bordillo del lado de J ──
  k.box(-0.06, 0, 5.3, 0.12, PY + 0.01, 10.6, 0xd6d2ca, { list: k.shell });
  // bancos oscuros
  for (const [x, z] of [[4.2, 5.6], [8.6, 5.6], [27.6, 5.0]]) {
    k.box(x, PY, z, 1.9, 0.42, 0.5, 0x2a2c2f).box(x, PY + 0.42, z - 0.22, 1.9, 0.4, 0.07, 0x2a2c2f);
    k.block(x, z, 1.9, 0.5);
  }
  // maceteros redondos de hormigón con arbustos
  for (const [x, z] of [[2.0, 8.6], [9.6, 8.6], [13.4, 7.0], [24.1, 7.0], [27.4, 8.9]]) {
    k.cyl(x, PY, z, 0.62, 0.55, 0.5, 0x9a9a94, { seg: 18 });
    k.cyl(x, PY + 0.47, z, 0.55, 0.55, 0.04, SOIL, { seg: 18 });
    for (const [dx, dz, r] of [[0, 0, 0.42], [0.22, 0.15, 0.3], [-0.2, -0.12, 0.32]]) k.ball(x + dx, PY + 0.75, z + dz, r, 0x4f7a3e, { sy: 0.8, seg: 8 });
    k.block(x, z, 1.2, 1.2);
  }
  // aparcabicis en U y papeleras
  for (let x = 3.5; x < 8; x += 1.0) bikeRack(k, x, PY, 9.6);
  k.block(5.5, 9.6, 4.6, 0.7);
  for (const x of [12.4, 25.2]) {
    k.cyl(x, PY, 9.4, 0.24, 0.22, 0.85, 0x3b4a3e, { seg: 12 }).cyl(x, PY + 0.85, 9.4, 0.26, 0.26, 0.06, 0x2b332d, { seg: 12 });
    k.block(x, 9.4, 0.5, 0.5);
  }
  // el banderín azul en su mástil
  k.cyl(25.9, PY, 9.9, 0.04, 0.05, 5.6, 0xd8dade, { seg: 8 });
  k.box(26.27, PY + 5.3, 9.9, 0.74, 0.04, 0.04, 0xd8dade);
  k.box(26.27, PY + 2.9, 9.9, 0.7, 2.4, 0.02, 0x1d4fa0);
  k.block(25.9, 9.9, 0.2, 0.2);
  // la farola alta
  k.cyl(28.6, PY, 10.1, 0.07, 0.1, 9.0, 0x9aa0a6, { seg: 10 });
  k.box(28.6, PY + 8.85, 9.75, 0.14, 0.08, 0.8, 0x9aa0a6).box(28.6, PY + 8.72, 9.35, 0.3, 0.14, 0.4, 0x8a9096);
  k.block(28.6, 10.1, 0.3, 0.3);
  // junto al carril bici, a la derecha: arriate de piedra volcánica con un arbusto grande, palmeritas y pitas
  const ax0 = 29.6, ax1 = L - BAY - 0.1;
  k.box((ax0 + ax1) / 2, PY, 10.5, ax1 - ax0, 0.5, 1.8, BASALT);
  k.box((ax0 + ax1) / 2, PY + 0.5, 10.5, ax1 - ax0 - 0.2, 0.03, 1.6, SOIL);
  for (const [dx, dy, dz, r] of [[0, 1.1, 0, 0.8], [0.5, 1.7, 0.2, 0.7], [-0.4, 1.6, -0.2, 0.65], [0.1, 2.3, 0, 0.6], [0.7, 1.0, -0.3, 0.55]]) {
    k.ball(30.6 + dx, PY + dy, 10.4 + dz, r, 0x3f6b35, { seg: 9 });
  }
  k.cyl(30.6, PY + 0.5, 10.4, 0.08, 0.1, 0.8, 0x5a4a38, { seg: 6 });
  for (const x of [32.2, 33.6, 34.8]) youngPalm(k, x, PY + 0.5, 10.4 + (x % 2 ? 0.25 : -0.2), 0.9 + (x % 3) * 0.25);
  for (const x of [31.6, 33.0, 34.2]) agave(k, x, PY + 0.52, 10.9, 0.7);
  k.block((ax0 + ax1) / 2, 10.5, ax1 - ax0, 1.8);
  // parterres de piedra volcánica de las palmeras, con pitas
  for (const [x, z] of PLAZA_PALMS) {
    k.cyl(x, PY, z, 1.15, 1.2, 0.45, BASALT, { seg: 20 });
    k.cyl(x, PY + 0.45, z, 1.05, 1.05, 0.02, SOIL, { seg: 20 });
    for (const a of [0.4, 2.5, 4.4]) agave(k, x + Math.cos(a) * 0.65, PY + 0.46, z + Math.sin(a) * 0.65, 0.7);
    k.block(x, z, 2.3, 2.3);
  }
  return k;
}

/** la mediana de la avenida, con arbustos, y el paso de cebra hasta la entrada (mismo marco que la fachada) */
function avenue() {
  const k = new Kit(), GAP = [ZEBRA_X - 1.25, ZEBRA_X + 1.25];
  const zAt = (x) => {
    for (let i = 0; i < MEDIAN.length - 1; i++) {
      const [ax, az] = MEDIAN[i], [bx, bz] = MEDIAN[i + 1];
      if (x <= bx) return az + ((bz - az) * (x - ax)) / (bx - ax);
    }
    return MEDIAN[MEDIAN.length - 1][1];
  };
  for (const [x0, x1] of [[MEDIAN[0][0], GAP[0]], [GAP[1], MEDIAN[MEDIAN.length - 1][0]]]) {
    for (let x = x0; x < x1 - 0.01; x += 3) {
      const xe = Math.min(x1, x + 3), za = zAt(x), zb = zAt(xe);
      const len = Math.hypot(xe - x, zb - za), ry = Math.atan2(zb - za, xe - x), cx = (x + xe) / 2, cz = (za + zb) / 2;
      k.box(cx, 0, cz, len + 0.02, 0.3, 0.8, 0xbdb8ae, { ry: -ry, list: k.shell });
      k.box(cx, 0.3, cz, len, 0.02, 0.6, SOIL, { ry: -ry, list: k.shell });
      // arbustos pequeños y salteados, como en la foto
      for (let t = 0.6 + ((x * 7.3) % 1.1); t < len; t += 2.4) {
        const px = x + ((xe - x) * t) / len, pz = za + ((zb - za) * t) / len, s = 0.8 + ((px * 3.7) % 0.5);
        k.cyl(px, 0.3, pz, 0.025, 0.035, 0.35 * s, 0x5a4a38, { seg: 5 });
        k.ball(px, 0.3 + 0.42 * s, pz, 0.24 * s, 0x5d8a46, { sy: 1.15, seg: 7 }).ball(px + 0.12, 0.3 + 0.3 * s, pz + 0.08, 0.17 * s, 0x527d3e, { seg: 6 });
      }
      k.seg(x, za - 0.4, xe, zb - 0.4).seg(x, za + 0.4, xe, zb + 0.4);
    }
    k.seg(x0, zAt(x0) - 0.4, x0, zAt(x0) + 0.4).seg(x1, zAt(x1) - 0.4, x1, zAt(x1) + 0.4);
  }
  // paso de cebra: franjas a lo largo de la avenida, de acera a acera
  for (let z = 15.4; z < 30; z += 1.0) {
    if (Math.abs(z - zAt(ZEBRA_X)) < 0.6) continue;
    k.box(ZEBRA_X, 0.14, z, 3.0, 0.012, 0.5, 0xe6e6dc, { list: k.shell });
  }
  return k;
}

/** el muro blanco liso donde el lado largo se mete respecto al bloque del extremo */
function blankWall(L) {
  const k = new Kit();
  k.box(L / 2, 0, 0.02, L, TOP, 0.04, WHITE, { list: k.shell });
  k.box(L / 2, TOP - 0.3, 0.05, L, 0.3, 0.1, 0xe4e4e0);
  return k;
}

/** letras azules «Escuela de Pesca» sobre el hormigón */
function letters(g, w, h) {
  g.fillStyle = '#9d9c96';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#2b4f9e';
  g.font = `700 ${Math.round(h * 0.62)}px "Barlow", Arial, sans-serif`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText('Escuela de Pesca', w / 2, h * 0.55);
}

/** la torre gris: líneas del encofrado, rendijas, ventanas alargadas, letrero, antenas y verja verde */
function tower(L) {
  const k = new Kit(), LINE = 0x86857f, SLIT = 0x23272b;
  for (let y = 3.2; y < TOWER_H; y += 3.2) k.box(L / 2, y, 0.03, L, 0.06, 0.06, LINE);
  k.box(L / 2, TOWER_H - 0.5, 0.05, L + 0.1, 0.5, 0.1, CON);
  k.box(L * 0.42, TOWER_H - 2.6, 0.05, L * 0.6, 0.45, 0.06, SLIT);          // ventana corrida de arriba
  for (const x of [L * 0.2, L * 0.62]) k.box(x, 12.3, 0.05, 1.1, 0.9, 0.06, SLIT);
  for (const x of [L * 0.78, L * 0.85]) for (const y of [6.4, 9.6, 12.8]) k.box(x, y, 0.05, 1.2, 0.35, 0.06, SLIT);
  for (let i = 0; i < 7; i++) k.box(L * 0.25 + i * 1.1, 0.5, 0.05, 0.22, 2.4, 0.06, SLIT);   // rendijas abajo
  k.pic(L * 0.42, 8.7, 0.08, 8.5, 1.4, 0, 1, canvasTex(1024, 168, letters));
  // antenas en la azotea
  for (const [x, z, h] of [[L * 0.3, -3, 5.5], [L * 0.38, -4.5, 4.2], [L * 0.55, -2.5, 3.4]]) k.cyl(x, TOWER_H, z, 0.04, 0.06, h, 0xc8ccd0, { seg: 6 });
  k.ball(L * 0.6, TOWER_H + 1.2, -5, 0.45, 0xe6e8ea, { sz: 0.35 });
  // la verja verde oscura junto a la acera de la avenida, con el cartel blanco de obra
  const fz = 8.8;
  for (let x = -6; x < L + 4; x += 2.5) k.box(x, 0, fz, 0.07, 1.9, 0.07, 0x1f3a2c);
  for (let x = -6; x < L + 4; x += 0.15) k.box(x, 0.1, fz, 0.02, 1.75, 0.02, 0x1f3a2c);
  k.box(L / 2 - 1, 1.82, fz, L + 10, 0.06, 0.06, 0x1f3a2c).box(L / 2 - 1, 0.08, fz, L + 10, 0.06, 0.06, 0x1f3a2c);
  k.box(5.5, 0.4, fz + 0.06, 2.4, 1.3, 0.04, 0xf4f4f0);
  k.seg(-6, fz, L + 4, fz);
  return k;
}

/** la verja que sigue calle abajo, delante del parking (x desde la esquina del parking hacia el sur) */
function parkFence(L) {
  const k = new Kit();
  k.box(L / 2, 0, 0, L, 0.5, 0.26, WHITE);
  for (let x = 0; x < L; x += 4) {
    bars(k, x, Math.min(L, x + 4), 0, 0.5, 1.9);
    k.box(x, 0, 0, 0.36, 2.2, 0.36, WHITE);
  }
  k.seg(0, 0, L, 0);
  return k;
}

/** el carril bici rojo: losa a la altura de la acera, bordes blancos y raya discontinua */
export function bikeLane(k, line = LANE) {
  const LW = 1.9, Y = 0.245;
  for (let i = 0; i < line.length - 1; i++) {
    const [ax, az] = line[i], [bx, bz] = line[i + 1];
    const L = Math.hypot(bx - ax, bz - az), ry = Math.atan2(bx - ax, bz - az);
    const cx = (ax + bx) / 2, cz = (az + bz) / 2, ux = (bz - az) / L, uz = -(bx - ax) / L;   // a un lado
    k.box(cx, 0, cz, LW, Y, L + 0.3, 0xa94a40, { ry, list: k.shell });
    for (const s of [-1, 1]) k.box(cx + ux * s * (LW / 2 - 0.08), Y, cz + uz * s * (LW / 2 - 0.08), 0.08, 0.006, L + 0.3, 0xf2efe6, { ry, list: k.shell });
    for (let t = 0.5; t < L; t += 2.2) {
      const px = ax + ((bx - ax) * t) / L, pz = az + ((bz - az) * t) / L;
      k.box(px, Y, pz, 0.08, 0.006, 1.0, 0xf2efe6, { ry, list: k.shell });
    }
  }
}

export function buildEscuelaPesca(scene, colliders) {
  const place = (k, origin, n, name) => {
    const { group, segs } = k.build(name);
    const ex = [n[1], -n[0]];
    group.position.set(origin[0], 0, origin[1]);
    group.rotation.y = Math.atan2(n[0], n[1]);
    scene.add(group);
    const w = (x, z) => [origin[0] + ex[0] * x + n[0] * z, origin[1] + ex[1] * x + n[1] * z];
    for (const [ax, az, bx, bz] of segs) colliders.addSegment(...w(ax, az), ...w(bx, bz));
    return group;
  };
  place(endFacade(), H_PT, N_END, 'escuelaPesca');
  const side = (a, b, n, name, make) => {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    place(make(L), a, n, name);
  };
  side(J_PT, I_PT, N_AV, 'escuelaPescaAvenida', frontFacade);   // x de J hacia I
  place(avenue(), J_PT, N_AV, 'medianaNaos');
  // el suelo rojo de la plaza de la entrada, de losas, en el mundo
  const pave = paveMesh(polyTris(PLAZA.map(([x, z]) => onAv(x, z))), PY, plazaSlabs(), 0xf09a84);
  if (pave) { pave.name = 'plazaEscuelaPesca'; scene.add(pave); }
  side(onEnd(-BAY, -BACK), onEnd(-BAY, -BAY_Z), [0.788, -0.616], 'escuelaPescaMuro', blankWall);   // el costado del entrante
  // los detalles de la torre van por fuera del forro (que tiene 20 cm hacia cada lado)
  place(tower(Math.hypot(T1[0] - T0[0], T1[1] - T0[1])), [T0[0] + 0.7115 * 0.2, T0[1] + 0.7026 * 0.2], [0.7115, 0.7026], 'escuelaPescaTorre');
  // el forro de hormigón de toda la torre (tapa las ventanas genéricas del edificio)
  // el contorno va siempre en el mismo sentido: hacia fuera es (dz, −dx) en todas las paredes,
  // también en las de los entrantes (con el centro de la torre esas salían al revés)
  TOWER.forEach((a, i) => {
    const b = TOWER[(i + 1) % TOWER.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const n = [(b[1] - a[1]) / L, -(b[0] - a[0]) / L];
    // el origen en la punta desde la que x avanza hacia la otra
    const ex = [n[1], -n[0]], fwd = ex[0] * (b[0] - a[0]) + ex[1] * (b[1] - a[1]) > 0;
    const k = new Kit();
    // grueso y centrado en la pared: tapa la fachada genérica se mire por donde se mire
    k.box(L / 2, 0, 0, L + 0.4, TOWER_H, 0.4, CON, { list: k.shell });
    place(k, fwd ? a : b, n, 'forroTorre' + i);
  });
  // la esquina donde la verja gira calle abajo, en el mundo
  const ex = [N_END[1], -N_END[0]];
  const nw = [H_PT[0] + ex[0] * END + N_END[0] * FZ, H_PT[1] + ex[1] * END + N_END[1] * FZ];
  const L = Math.hypot(PARK_SW[0] - nw[0], PARK_SW[1] - nw[1]);
  const dx = (PARK_SW[0] - nw[0]) / L, dz = (PARK_SW[1] - nw[1]) / L;
  place(parkFence(L), nw, [-dz, dx], 'verjaParkingEscuela');
  // el carril bici va en coordenadas del mundo
  const lane = new Kit();
  bikeLane(lane);
  const { group } = lane.build('carrilBiciNaos');
  scene.add(group);
}
