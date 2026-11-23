import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, sueloTex, trocear } from './restaurantesCharco.js';
import { alturaBloque } from './edificioReal.js';
import { paveMesh, polyTris, bandTris } from './suelos.js';

/**
 * El recinto del Acuartelamiento Marqués de Herrera (lo de dentro y el muro de alrededor), con las fotos aéreas de Google y
 * las que mandó José Manuel (las dos fotos desde el aire del cuartel, la del arco de la entrada y las de la web del
 * Ejército: la pista de aplicación), el 09/11/2026:
 * - el muro alto y macizo de todo el recinto, que no deja ver a través, por la calle Doctor Juan Negrín, la calle Doctor
 *   Barraquer y la de Marqués de Herrera, hasta el cruce de las dos de abajo;
 * - el suelo de dentro, de asfalto gris (en vez de la foto aérea del mapa), con las calles entre los pabellones;
 * - los pabellones largos, blancos y de dos plantas, con las ventanas de carpintería verde;
 * - el patio de detrás del arco: el obelisco en medio, los parterres con las palmeras y el suelo claro;
 * - el campo grande del oeste: el anillo de asfalto oscuro, la tierra de dentro, la pista clara con el borde rojo y la
 *   pista de aplicación (las vallas, los muros de escalada, la red de arrastre, la viga, la escalera horizontal, los
 *   neumáticos, el pórtico de las cuerdas y los postes blancos);
 * - abajo, junto a Doctor Barraquer, la piscina con su edificio blanco y las palmeras.
 * El edificio de la puerta va aparte, en cuartelHerrera.js (con su muro de la calle y las garitas).
 */

const Z = 0.12, BLANCO = 0xf2f2ee, H = 7;
// el muro, por tramos (la parte de delante del edificio de la puerta ya la pone cuartelHerrera.js)
const MURO = [
  [[-1023.85, -641.19], [-1044.5, -658.29]],
  [[-1094.96, -700.1], [-1117.27, -719.27], [-1127.44, -728.83], [-1138.18, -740.79], [-1147.88, -751.82], [-1195, -726],
    [-1240, -748], [-1363, -551], [-1204.71, -422.66], [-1148.43, -490.22], [-1060.63, -596.62], [-1023.85, -641.19]],
];
// el suelo de dentro (el muro y la balaustrada de la puerta)
const RECINTO = [[-1094.96, -700.1], [-1117.27, -719.27], [-1127.44, -728.83], [-1138.18, -740.79], [-1147.88, -751.82],
  [-1195, -726], [-1240, -748], [-1363, -551], [-1204.71, -422.66], [-1148.43, -490.22], [-1060.63, -596.62],
  [-1023.85, -641.19], [-1044.5, -658.29]];
// los pabellones de dentro (un punto de cada bloque del mapa)
const PABELLONES = [[-1228, -511], [-1224, -563], [-1197, -526], [-1183, -542], [-1158, -506], [-1124, -547], [-1138, -559],
  [-1079, -594], [-1097, -608], [-1174, -590], [-1189, -602], [-1148, -651], [-1049, -636], [-1133, -639], [-1255, -528],
  [-1201, -477]];
// el campo del oeste: el anillo de asfalto, la tierra de dentro y la pista clara (de la foto aérea)
const CAMPO = [[-1350, -566], [-1285.2, -638.7], [-1231.8, -579.3], [-1304.6, -514]];
const TIERRA = [[-1340.67, -565.95], [-1285.18, -628.2], [-1241.69, -579.83], [-1303.99, -523.95]];
const PISTA_CLARA = marco([-1280.8, -632.8], [-1240.7, -600.1]);
// la pista de aplicación, en la tierra del campo (s a lo largo, z de lado)
const APLICACION = marco([-1321.0, -588.5], [-1282.8, -544.7]);
// el patio de detrás del arco (el marco de la fachada de la puerta: z hacia dentro es negativo)
const PATIO = marco([-1053, -654.3], [-1097.3, -691]);
// la piscina y su edificio, en el bloque del mapa de junto a Doctor Barraquer (z hacia dentro es negativo)
const PISCINA = marco([-1254.2, -462.8], [-1227.1, -495.5]);

/** antes de levantar la ciudad: los pabellones blancos y de dos plantas, el bloque de la piscina rebajado y el de la puerta */
export function tuneCuartelRecinto(map) {
  const bloques = [];
  for (const [x, z] of PABELLONES) {
    const b = alturaBloque(map, x, z, H, [240, 238, 230]);
    if (b) bloques.push(b.p.map(q => [q[0], q[1]]));
  }
  map.cuartelBloques = bloques;
  map.cuartelPiscina = !!alturaBloque(map, -1252, -488, 0.2, [214, 212, 204]);
  // el edificio de la puerta: sus caras del patio y de detrás, como los pabellones (la de la calle la hace cuartelHerrera.js)
  const puerta = alturaBloque(map, -1080, -669, 8.5, [242, 242, 238]);
  map.cuartelPuerta = puerta ? puerta.p.map(q => [q[0], q[1]]) : null;
  map.cuartelRecinto = true;
}

// ——— lo que se pinta en lienzo ———

/** el asfalto gris de las calles de dentro, más claro que el de la calle */
function asfaltoGris() {
  return sueloTex(256, 5, (g, r, n) => {
    g.fillStyle = '#6e6e6a';
    g.fillRect(0, 0, n, n);
    for (let i = 0; i < 3500; i++) { const v = Math.round(85 + r() * 50); g.fillStyle = `rgb(${v},${v},${v - 3})`; g.fillRect(r() * n, r() * n, 1.5, 1.5); }
  });
}

/** el asfalto oscuro del anillo del campo */
function asfaltoOscuro() {
  return sueloTex(256, 4, (g, r, n) => {
    g.fillStyle = '#3e3e3c';
    g.fillRect(0, 0, n, n);
    for (let i = 0; i < 3000; i++) { const v = Math.round(50 + r() * 40); g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(r() * n, r() * n, 1.5, 1.5); }
  });
}

/** la tierra del campo: parda, con las manchas grises y alguna mata */
function tierraCampo() {
  return sueloTex(256, 8, (g, r, n) => {
    g.fillStyle = '#8a7a62';
    g.fillRect(0, 0, n, n);
    for (let i = 0; i < 30; i++) { g.fillStyle = r() < 0.5 ? 'rgba(90,90,85,.18)' : 'rgba(170,150,115,.15)'; g.beginPath(); g.arc(r() * n, r() * n, 10 + r() * 35, 0, Math.PI * 2); g.fill(); }
    for (let i = 0; i < 2500; i++) { const v = r(); g.fillStyle = `rgb(${Math.round(100 + v * 60)},${Math.round(90 + v * 50)},${Math.round(72 + v * 40)})`; g.fillRect(r() * n, r() * n, 1.5, 1.5); }
  });
}

/** el suelo claro del patio del arco */
function hormigonClaro() {
  return sueloTex(256, 3, (g, r, n) => {
    g.fillStyle = '#c8c4b8';
    g.fillRect(0, 0, n, n);
    for (let i = 0; i < 2000; i++) { const v = Math.round(175 + r() * 50); g.fillStyle = `rgb(${v},${v - 4},${v - 12})`; g.fillRect(r() * n, r() * n, 1.5, 1.5); }
    g.strokeStyle = 'rgba(120,115,105,.35)';
    for (let x = 0; x <= n; x += n / 2) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, n); g.stroke(); g.beginPath(); g.moveTo(0, x); g.lineTo(n, x); g.stroke(); }
  });
}

/** el muro macizo con la balaustrada en relieve */
function balaustres(g, w, h) {
  g.fillStyle = '#f2f2ee';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(150,150,145,.35)';
  for (let x = 2; x < w; x += 6) { g.fillRect(x, 2, 1.2, h - 4); g.fillRect(x + 3.2, 2, 1.2, h - 4); }
}

/** una cara de pabellón: blanca, con el zócalo y las dos filas de ventanas verdes */
const caras = new Map();
function cara(L, HH = H) {
  const n = Math.max(1, Math.round(L)), key = n + '_' + HH;
  if (!caras.has(key)) caras.set(key, canvasTex(n * 10, Math.round(HH * 10), (g, w, h) => {
    g.fillStyle = '#f2f2ee';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#d8d8d2';
    g.fillRect(0, h - 7, w, 7);
    for (const y of [h * 0.18, h * 0.62]) {
      for (let x = 12; x < w - 14; x += 30) {
        g.fillStyle = '#3a6a4a';
        g.fillRect(x, y, 14, 17);
        g.fillStyle = 'rgba(190,210,215,.85)';
        g.fillRect(x + 2, y + 2, 4.5, 13);
        g.fillRect(x + 7.5, y + 2, 4.5, 13);
        g.fillStyle = '#e2e2dc';
        g.fillRect(x - 1, y + 17, 16, 2);
      }
    }
  }));
  return caras.get(key);
}

/** un punto dentro de un polígono [[x, z]...] */
function dentro(p, x, z) {
  let c = false;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    const [ax, az] = p[i], [bx, bz] = p[j];
    if ((az > z) !== (bz > z) && x < ax + ((z - az) * (bx - ax)) / (bz - az)) c = !c;
  }
  return c;
}

/** el lado a-c de un bloque, ordenado para que el marco mire hacia fuera (vale también para los bloques en U o en L) */
function haciaFuera(p, a, c) {
  const L = Math.hypot(c[0] - a[0], c[1] - a[1]), nx = -(c[1] - a[1]) / L, nz = (c[0] - a[0]) / L;
  const mx = (a[0] + c[0]) / 2 + nx * 0.4, mz = (a[1] + c[1]) / 2 + nz * 0.4;
  return dentro(p, mx, mz) ? [c, a] : [a, c];
}

// ——— las piezas ———

/** una palmera canaria */
function palmera(k, s, z, h, y = 0) {
  k.cyl(s, y, z, 0.22, 0.3, h, 0x8a7458, { seg: 8 });
  k.ball(s, y + h, z, 0.45, 0x6a7a3a);
  for (let i = 0; i < 9; i++) k.box(s, y + h, z, 4.4, 0.05, 0.45, 0x4f8034, { ry: (i * Math.PI) / 9 });
  for (let i = 0; i < 9; i++) k.box(s, y + h - 0.45, z, 6.0, 0.05, 0.35, 0x3f6e2a, { ry: ((i + 0.5) * Math.PI) / 9 });
}

/** un tramo del muro: macizo, con el zócalo gris, la balaustrada en relieve, la albardilla y los pilares */
function tramoMuro(k, L) {
  k.box(L / 2, 0, 0, L, 0.9, 0.5, 0x8a8c8c);
  k.block(L / 2, 0, L, 0.5);
  k.box(L / 2, 0.9, 0, L, 1.4, 0.4, BLANCO);
  const t = canvasTex(Math.max(8, Math.round(L * 20)), 24, balaustres);
  k.pic(L / 2, 1.6, 0.21, L, 1.2, 0, 1, t);
  k.pic(L / 2, 1.6, -0.21, L, 1.2, 0, -1, t);
  k.box(L / 2, 2.3, 0, L, 0.15, 0.5, 0xe6e6e2);
  const paso = L / Math.max(1, Math.round(L / 4.5));
  for (let s = 0; s <= L + 0.01; s += paso) {
    k.box(s, 0, 0, 0.7, 2.75, 0.7, BLANCO);
    k.box(s, 2.75, 0, 0.85, 0.15, 0.85, 0xe6e6e2);
  }
}

/** las porterías de la pista clara del campo (el suelo, el borde rojo y las rayas van con los suelos) */
function pistaClara(k, L) {
  const W = 23;
  for (const s of [0.4, L - 0.4]) {
    k.box(s, 0, W / 2 - 1.5, 0.08, 2.1, 0.08, 0xe8e8e4);
    k.box(s, 0, W / 2 + 1.5, 0.08, 2.1, 0.08, 0xe8e8e4);
    k.box(s, 2.05, W / 2, 0.08, 0.08, 3.08, 0xe8e8e4);
  }
}

/** la pista de aplicación (s a lo largo, z de lado) */
function aplicacion(k) {
  const MAD = 0x8a6a44, TUBO = 0x6a6e6a, POSTE = 0xe8e8e4;
  for (const z of [-4, 4]) {
    for (const s of [3, 6, 9]) {
      for (const d of [-1, 1]) k.box(s, 0, z + d, 0.12, 0.95, 0.12, POSTE);
      k.box(s, 0.85, z, 0.12, 0.12, 2.2, POSTE);
    }
    k.box(13, 0, z, 0.3, 2.3, 3, MAD);
    k.block(13, z, 0.3, 3);
    for (let y = 0.3; y < 2.3; y += 0.3) k.box(13, y, z, 0.32, 0.03, 3.02, 0x6a5034);
    for (let s = 17; s <= 23; s += 2) for (const d of [-1.3, 1.3]) k.box(s, 0, z + d, 0.1, 0.6, 0.1, MAD);
    for (let s = 17; s < 23; s += 0.4) k.box(s, 0.55, z, 0.03, 0.03, 2.6, 0x3a3a2a);
    for (let d = -1.3; d <= 1.3; d += 0.4) k.box(20, 0.55, z + d, 6, 0.03, 0.03, 0x3a3a2a);
    for (const s of [27, 30, 33]) k.box(s, 0, z, 0.15, 1.1, 0.15, POSTE);
    k.box(30, 1.1, z, 6.4, 0.15, 0.18, MAD);
    for (const s of [36, 41]) for (const d of [-0.4, 0.4]) k.box(s, 0, z + d, 0.12, 2.5, 0.12, TUBO);
    for (const d of [-0.4, 0.4]) k.box(38.5, 2.45, z + d, 5.1, 0.08, 0.08, TUBO);
    for (let s = 36.3; s < 41; s += 0.4) k.box(s, 2.45, z, 0.05, 0.05, 0.85, TUBO);
    for (let i = 0; i < 6; i++) for (const d of [-0.5, 0.5]) k.cyl(44 + i * 0.8, 0, z + d + (i % 2 ? 0.1 : 0), 0.38, 0.38, 0.22, 0x1e1e1e, { seg: 12 });
    k.box(58, 0, z, 0.3, 3.0, 3, MAD);
    k.block(58, z, 0.3, 3);
    for (let y = 0.3; y < 3; y += 0.3) k.box(58, y, z, 0.32, 0.03, 3.02, 0x6a5034);
    k.box(57.8, 0.6, z, 0.04, 2.4, 0.04, 0xc8b48a);
  }
  for (const s of [52, 55]) for (const d of [-6, 6]) k.box(s, 0, d, 0.25, 5.5, 0.25, MAD);
  for (const d of [-6, 6]) k.box(53.5, 5.4, d, 3.3, 0.25, 0.25, MAD);
  for (const s of [52, 55]) k.box(s, 5.4, 0, 0.25, 0.25, 12.3, MAD);
  for (let d = -5; d <= 5; d += 1.25) k.box(53.5, 0.6, d, 0.05, 4.8, 0.05, 0xc8b48a);
  // los postes blancos sueltos del campo (foto de la pista de aplicación)
  for (const [s, z] of [[2, 12], [8, 13], [14, 12], [24, -12], [30, -13], [36, -12], [46, 12], [50, 13]]) k.box(s, 0, z, 0.35, 1.2, 0.35, POSTE);
}

/** el patio de detrás del arco: el obelisco, los parterres y los bancos (s como la fachada, z hacia dentro negativo) */
function patio(k) {
  const c = 28.76;
  k.box(c, 0, -22.5, 2.6, 0.5, 2.6, 0x9a948a);
  k.box(c, 0.5, -22.5, 1.6, 0.6, 1.6, 0xb8b2a8);
  k.box(c, 1.1, -22.5, 0.9, 4.2, 0.9, 0xd8d4c8);
  k.cyl(c, 5.3, -22.5, 0.02, 0.62, 1.0, 0xd8d4c8, { seg: 4, ry: Math.PI / 4 });
  for (const [s, z] of [[22, -17], [35.5, -17], [22, -28], [35.5, -28]]) {
    k.box(s, 0, z, 4.2, 0.45, 4.2, 0x3a3836);
    k.box(s, 0.45, z, 3.9, 0.05, 3.9, 0x4a6a3a);
    k.ball(s - 1.3, 0.9, z + 1.3, 0.6, 0x5a8a4a);
    palmera(k, s, z, 8.5 + (s % 2));
  }
  for (const [s, z] of [[c - 4.5, -22.5], [c + 4.5, -22.5]]) {
    k.box(s, 0.42, z, 0.5, 0.08, 1.8, 0x8a6a44);
    for (const d of [-0.7, 0.7]) k.box(s, 0, z + d, 0.45, 0.42, 0.1, 0x6a6e6a);
  }
}

/** la piscina con su borde blanco, la escalerilla, el edificio blanco y la valla (s a lo largo, z hacia dentro negativo) */
function piscina(k) {
  k.box(21.25, 0.2, -14.5, 42.5, 0.06, 29, 0xd6d2c6);
  k.box(16, 0.26, -6.5, 13.4, 0.12, 7.4, 0xf4f4f0);
  // la lámina del agua
  k.box(16, 0.27, -6.5, 12, 0.07, 6, 0x3ab0d8);
  for (const d of [-0.3, 0.3]) k.box(21.6 + d, 0.3, -9.4, 0.04, 1.0, 0.04, 0xc8c8c8);
  for (let s = 6; s < 26; s += 0.15) k.box(s, 0.3, -1.2, 0.02, 1.2, 0.02, 0x5a6a5a);
  k.box(16, 1.48, -1.2, 20, 0.04, 0.04, 0x5a6a5a);
  for (const s of [10, 14, 18, 22]) k.box(s, 0.32, -11, 1.8, 0.35, 0.7, 0xf2f2ee);
  // el edificio blanco de la piscina
  for (const [ps, pz, h] of [[8, -2.5, 8], [26, -2.5, 9], [41, -5, 7.5]]) palmera(k, ps, pz, h, 0.2);
  k.box(33, 0.2, -16, 15, 4.3, 12, BLANCO);
  k.block(33, -16, 15, 12);
  k.box(33, 4.5, -16, 15.4, 0.3, 12.4, 0xe6e6e2);
  for (let s = 27.5; s < 39; s += 2.6) k.pic(s, 2.4, -9.95, 1.3, 1.5, 0, 1, canvasTex(52, 60, (g, w, h) => {
    g.fillStyle = '#3a6a4a'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(190,210,215,.85)'; g.fillRect(4, 4, w / 2 - 6, h - 8); g.fillRect(w / 2 + 2, 4, w / 2 - 6, h - 8);
  }));
}

/** se monta con lo demás */
export function buildCuartelRecinto(scene, colliders, map) {
  if (!map?.cuartelRecinto) return null;
  const grupos = [];
  const montar = (M, nombre, hacer) => {
    const k = new Kit();
    hacer(k, M.len);
    const g = enMarco(k, M, nombre, colliders);
    scene.add(g);
    grupos.push(g);
  };
  // el suelo: el asfalto gris de dentro, el anillo oscuro del campo y su tierra, y el patio claro del arco
  const suelos = [
    paveMesh(trocear(polyTris(RECINTO, [CAMPO.slice().reverse()]), 6), 0.1, asfaltoGris(), 0xffffff),
    paveMesh(trocear(polyTris(CAMPO, [TIERRA.slice().reverse()]), 4), 0.12, asfaltoOscuro(), 0xffffff),
    paveMesh(trocear(polyTris(TIERRA), 6), 0.13, tierraCampo(), 0xffffff),
    paveMesh(trocear(polyTris([PATIO.W(14, -14), PATIO.W(44, -14), PATIO.W(44, -33), PATIO.W(14, -33)]), 3), 0.14, hormigonClaro(), 0xffffff),
  ];
  // la pista clara del campo: el borde rojo, el suelo claro y las rayas blancas
  const PL = PISTA_CLARA.len, PW = 23, liso = (c) => sueloTex(16, 4, (g, r, n) => { g.fillStyle = c; g.fillRect(0, 0, n, n); });
  const rect = (s0, z0, s1, z1) => [PISTA_CLARA.W(s0, z0), PISTA_CLARA.W(s1, z0), PISTA_CLARA.W(s1, z1), PISTA_CLARA.W(s0, z1)];
  suelos.push(paveMesh(trocear(polyTris(rect(-0.8, -0.8, PL + 0.8, PW + 0.8), [rect(0, 0, PL, PW).reverse()]), 3), 0.16, liso('#a0503c'), 0xffffff));
  suelos.push(paveMesh(trocear(polyTris(rect(0, 0, PL, PW)), 3), 0.16, liso('#c8c4a0'), 0xffffff));
  const rayas = [[[0.6, 0.6], [PL - 0.6, 0.6]], [[0.6, PW - 0.6], [PL - 0.6, PW - 0.6]], [[0.6, 0.6], [0.6, PW - 0.6]],
    [[PL - 0.6, 0.6], [PL - 0.6, PW - 0.6]], [[PL / 2, 0.6], [PL / 2, PW - 0.6]]];
  for (const [a, b] of rayas) suelos.push(paveMesh(trocear(bandTris([PISTA_CLARA.W(...a), PISTA_CLARA.W(...b)], 0.12), 3), 0.22, liso('#f4f4f0'), 0xffffff));
  for (const m of suelos) if (m) { m.name = 'cuartelSuelo'; scene.add(m); grupos.push(m); }
  // el muro de alrededor
  MURO.forEach((tramo, t) => {
    for (let i = 0; i < tramo.length - 1; i++) montar(marco(tramo[i], tramo[i + 1]), `cuartelMuro${t}_${i}`, tramoMuro);
  });
  // los pabellones: cada cara blanca con sus ventanas verdes, mirando hacia fuera
  (map.cuartelBloques || []).forEach((p, b) => {
    const cerrado = p[0][0] === p[p.length - 1][0] && p[0][1] === p[p.length - 1][1];
    const n = p.length - (cerrado ? 1 : 0);
    for (let i = 0; i < n; i++) {
      if (Math.hypot(p[(i + 1) % n][0] - p[i][0], p[(i + 1) % n][1] - p[i][1]) < 2) continue;
      const [a, c] = haciaFuera(p, p[i], p[(i + 1) % n]);
      montar(marco(a, c), `cuartelPabellon${b}_${i}`, (k, L) => {
        k.box(L / 2, 0, Z + 0.15, L, H, 0.3, BLANCO);
        k.pic(L / 2, H / 2, Z + 0.31, L, H, 0, 1, cara(L));
        k.box(L / 2, H - 0.15, Z + 0.35, L, 0.2, 0.2, 0xe6e6e2);
      });
    }
  });
  // el edificio de la puerta: las caras del patio y de detrás (no la de la calle, que es la de cuartelHerrera.js)
  const p = map.cuartelPuerta;
  if (p) {
    const cerca = (q, r) => Math.hypot(q[0] - r[0], q[1] - r[1]) < 1;
    const A = [-1053, -654.3], B = [-1097.3, -691];
    const n = p.length - (cerca(p[0], p[p.length - 1]) ? 1 : 0);
    for (let i = 0; i < n; i++) {
      const a0 = p[i], c0 = p[(i + 1) % n];
      if ((cerca(a0, A) && cerca(c0, B)) || (cerca(a0, B) && cerca(c0, A)) || Math.hypot(c0[0] - a0[0], c0[1] - a0[1]) < 2) continue;
      const [a, c] = haciaFuera(p, a0, c0);
      montar(marco(a, c), `cuartelPuerta${i}`, (k, L) => {
        k.box(L / 2, 0, Z + 0.15, L, 8.5, 0.3, BLANCO);
        k.pic(L / 2, 4.25, Z + 0.31, L, 8.5, 0, 1, cara(L, 8.5));
        k.box(L / 2, 8.35, Z + 0.35, L, 0.2, 0.2, 0xe6e6e2);
      });
    }
  }
  // el campo, la pista de aplicación, el patio del arco y la piscina
  montar(PISTA_CLARA, 'cuartelPistaClara', pistaClara);
  montar(APLICACION, 'cuartelAplicacion', (k) => aplicacion(k));
  montar(PATIO, 'cuartelPatio', (k) => patio(k));
  if (map.cuartelPiscina) montar(PISCINA, 'cuartelPiscina', (k) => piscina(k));
  return { grupos };
}
