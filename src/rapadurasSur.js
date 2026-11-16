import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, hueco, trocear, sueloTex } from './restaurantesCharco.js';
import { cristales, alzarEdificio } from './edificioReal.js';
import { paveMesh, polyTris } from './suelos.js';

/**
 * Las Rapaduras (Altavista), la mitad sur de la franja entre León y Castillo (la calzada que sube) y la calle Cádiz, de la
 * calle Palencia hasta la casa de León y Castillo 176, con las vistas de la calle de Google de julio de 2025 y la foto
 * aérea de GRAFCAN de 2024-2026 (solo se miran, no van dentro del juego). El juego no tenía ahí ni una casa: solo la foto
 * aérea borrosa en el suelo, con los tejados pintados. De verdad:
 * - la manzana de la esquina de Palencia: la pared blanca alta y desconchada de León y Castillo con su puerta gris de
 *   chapa, la de Palencia con el trozo alto de bloques sin enfoscar y, por la calle Cádiz, las casas terreras;
 * - la fila de casas terreras blancas de la calle Cádiz (los números 7 a 11 y siguientes): la de la franja verde con los
 *   rombos, la de la franja crema con las ventanas de reja, las de las celosías blancas, la del murete con la cancela y
 *   la de dos plantas del final; todas con las puertas y las ventanas marrones;
 * - la casa terrera blanca de León y Castillo 176, con el zócalo gris y las puertas marrones;
 * - el sitio de la gasolinera Petroprix (León y Castillo 172), donde tiraron la casa vieja en mayo de 2026: no hay fotos
 *   de cómo ha quedado, así que va de explanada de grava hasta que las haya;
 * - y los solares de tierra con sus matojos, en lugar de la foto aérea.
 * Las paredes, las puertas y las ventanas de aquí las usa también la mitad norte (rapadurasNorte.js).
 */

export const Z = 0.12, ZF = Z + 0.3;
export const BLANCO = 0xeeeeea, SUCIO = 0xdedbd2, MARRON = 0x6a4430, MARRON_OSC = 0x4e3122, VERDE = 0x3f8a52, GRIS = 0x8a8a86;
// la calle Cádiz (la línea de las fachadas, por el borde de la acera): K1 de la esquina de Palencia al quiebro, K2 hasta
// el final de las casas; N hacia la calle (al este)
const K1 = marco([341.3, -793.8], [351.42, -833.76]);
const K2 = marco([351.42, -833.76], [354.84, -853.0]);
// la manzana de la esquina de Palencia, sus caras de León y Castillo (LW, N al oeste), de Palencia (PS, N al sur) y la
// de atrás, hacia el solar (NB, N al norte)
const MANZANA = [[311.1, -802.2], [341.3, -793.8], [347.58, -818.62], [315.08, -818.62]];
const LW = marco([315.08, -818.62], [311.1, -802.2]);
const PS = marco([311.1, -802.2], [341.3, -793.8]);
const NB = marco([347.58, -818.62], [315.08, -818.62]);
// la casa de León y Castillo 176 (N al oeste, a la calle), de 20 m de fondo
const WH = marco([329.43, -880.0], [328.06, -872.6]);
// los suelos: el solar de tierra de toda la franja y el sitio de la Petroprix, de grava
const SOLAR = [[315.08, -818.62], [347.58, -818.62], [351.4, -833.6], [359.4, -878.6], [359.9, -882.0], [329.8, -882.0], [326.5, -864.3], [321.85, -845.2], [316.97, -826.4]];
const PETROPRIX = [[323.0, -850.0], [326.5, -864.2], [328.06, -872.6], [347.7, -869.0], [349.5, -850.0]];

/** antes de levantar la ciudad: las casas nuevas en el mapa (el juego les pone la azotea y el choque) */
export function tuneRapadurasSur(map) {
  if (!Array.isArray(map?.buildings)) return;
  const blanco = [236, 236, 232], azotea = [206, 202, 194];
  map.buildings.push({ p: [...MANZANA, MANZANA[0]].map(q => q.slice()), h: 3.6, k: 'gen', s: 0, f: blanco, c: azotea, edificioReal: true });
  alzarEdificio(map, K1, 25.6, K1.len, 12, 3.6, blanco, azotea);
  alzarEdificio(map, K2, 0, 12.3, 12, 3.6, blanco, azotea);
  alzarEdificio(map, K2, 12.3, 19.5, 12, 6.5, blanco, azotea);
  alzarEdificio(map, WH, 0, WH.len, 20, 3.6, blanco, azotea);
  map.rapadurasSur = true;
}

/** una puerta marrón de cuarterones */
export function puertaMarron(g, w, h) {
  g.fillStyle = '#6a4430';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#4e3122';
  g.lineWidth = Math.max(3, w * 0.05);
  for (const [y0, y1] of [[0.08, 0.45], [0.52, 0.92]]) g.strokeRect(w * 0.15, h * y0, w * 0.7, h * (y1 - y0));
}

/** la celosía blanca de los ventanucos, de rombos */
export function celosia(g, w, h) {
  g.fillStyle = '#2a2a28';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#f2f2ee';
  g.lineWidth = Math.max(3, w * 0.07);
  const p = w / 4;
  for (let x = -h; x < w + h; x += p) {
    g.beginPath(); g.moveTo(x, 0); g.lineTo(x + h, h); g.stroke();
    g.beginPath(); g.moveTo(x + h, 0); g.lineTo(x, h); g.stroke();
  }
}

/** la chapa gris de la puerta de León y Castillo */
function chapaGris(g, w, h) {
  g.fillStyle = '#9aa0a4';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(60,60,60,.25)';
  g.fillRect(w * 0.08, h * 0.05, w * 0.84, h * 0.02);
  g.fillRect(w * 0.08, h * 0.9, w * 0.84, h * 0.02);
}

/** los bloques de hormigón sin enfoscar */
export function bloques(g, w, h) {
  g.fillStyle = '#8e8a82';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#6e6a64';
  g.lineWidth = 2;
  const fh = h / 5, fw = w / 6;
  for (let r = 0; r < 5; r++) {
    g.beginPath(); g.moveTo(0, r * fh); g.lineTo(w, r * fh); g.stroke();
    for (let c = 0; c < 7; c++) { const x = c * fw + (r % 2) * fw / 2; g.beginPath(); g.moveTo(x, r * fh); g.lineTo(x, (r + 1) * fh); g.stroke(); }
  }
}

/** la pared blanca desconchada: blanco sucio, con la humedad gris de abajo y algún desconchón */
export function desconchada(g, w, h) {
  g.fillStyle = '#e9e7df';
  g.fillRect(0, 0, w, h);
  let s = 7;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const humedad = g.createLinearGradient(0, h, 0, h * 0.6);
  humedad.addColorStop(0, 'rgba(118,112,100,0.38)');
  humedad.addColorStop(1, 'rgba(118,112,100,0)');
  g.fillStyle = humedad;
  g.fillRect(0, h * 0.6, w, h * 0.4);
  for (let i = 0; i < w / 6; i++) {
    g.fillStyle = `rgba(110,104,94,${0.05 + r() * 0.08})`;
    g.beginPath();
    g.arc(r() * w, h * (0.95 + r() * 0.08), 4 + r() * h * 0.1, 0, Math.PI * 2);
    g.fill();
  }
  for (let i = 0; i < w / 20; i++) {
    g.fillStyle = `rgba(200,188,168,${0.06 + r() * 0.08})`;
    g.beginPath();
    g.ellipse(r() * w, r() * h * 0.75, 3 + r() * 8, 2 + r() * 5, r() * 3, 0, Math.PI * 2);
    g.fill();
  }
}

/** una pared lisa de la tira (tapa las ventanas que el juego pinta en todas las caras), con su textura */
export function pared(k, s0, s1, alto, tex = desconchada, z = Z) {
  const w = s1 - s0, c = (s0 + s1) / 2;
  k.box(c, 0, z + 0.15, w, alto, 0.3, BLANCO);
  k.pic(c, alto / 2, z + 0.3 + 0.004, w, alto, 0, 1, canvasTex(Math.min(1024, Math.max(64, Math.round(w * 24))), Math.round(alto * 24), tex));
  k.block(c, z + 0.15, w, 0.3);
}

/** el pretil de las terreras, con su remate */
export function pretil(k, s0, s1, y) {
  k.box((s0 + s1) / 2, y, ZF - 0.12, s1 - s0, 0.5, 0.24, BLANCO);
  k.box((s0 + s1) / 2, y + 0.5, ZF - 0.1, s1 - s0 + 0.04, 0.06, 0.3, 0xdcdad4);
}

/** una puerta marrón con su marco */
export function puerta(k, s, ancho = 0.95, alto = 2.2) {
  hueco(k, s, 0, ancho, alto, canvasTex(96, 220, puertaMarron), { borde: MARRON_OSC, z: ZF });
}

/** una ventana marrón, con reja si se pide */
export function ventana(k, s, y, w, h, reja = false) {
  hueco(k, s, y, w, h, canvasTex(Math.round(w * 80), Math.round(h * 80), cristales('#6a4430', 2, 'rgba(200,190,170,.5)')), { borde: MARRON_OSC, z: ZF });
  if (reja) for (let x = -w / 2 + 0.08; x < w / 2; x += 0.12) k.box(s + x, y, ZF + 0.1, 0.02, h, 0.02, 0x2a2a28);
}

/** un ventanuco de celosía blanca con el marco marrón */
export function ventanuco(k, s, y = 1.55, w = 0.8, h = 0.6) {
  hueco(k, s, y, w, h, canvasTex(96, 72, celosia), { borde: MARRON_OSC, z: ZF });
}

/** las casas de la calle Cádiz, del tramo de la esquina de Palencia al quiebro */
function cadizSur(k) {
  pared(k, 0, K1.len, 3.6);
  pretil(k, 0, K1.len, 3.6);
  // la de la esquina de Palencia y las dos siguientes (sin foto de cerca: puerta y ventana marrones, como sus vecinas)
  puerta(k, 2.2);
  ventana(k, 4.6, 1.0, 1.0, 1.1, true);
  puerta(k, 11.0);
  ventana(k, 13.2, 1.0, 1.0, 1.1, true);
  puerta(k, 17.6);
  ventana(k, 19.8, 1.0, 1.1, 1.1, true);
  // la de la franja verde con los rombos (Cádiz 7): dos puertas y dos ventanas marrones
  k.box(26.65, 2.35, ZF + 0.03, 7.5, 0.12, 0.06, VERDE);
  for (const [s, fn] of [[23.8, () => puerta(k, 23.8, 1.0)], [25.0, () => ventana(k, 25.0, 1.0, 0.9, 1.1)], [26.9, () => puerta(k, 26.9, 1.0)], [28.5, () => ventana(k, 28.5, 1.0, 0.9, 1.1)]]) {
    fn();
    k.cyl(s, 2.68, ZF, 0.15, 0.15, 0.05, VERDE, { seg: 4, rx: Math.PI / 2 });
  }
  for (const s of [22.95, 30.35]) k.box(s, 0, ZF + 0.03, 0.12, 2.35, 0.06, VERDE);
  // la de la franja crema con las ventanas de reja (y el trozo alto del pretil)
  k.box(35.0, 2.3, ZF + 0.02, 9.1, 0.28, 0.05, 0xe2d2a8);
  ventana(k, 32.3, 1.0, 1.0, 1.15, true);
  ventana(k, 37.8, 1.0, 1.0, 1.15, true);
  k.box(32.2, 4.1, ZF - 0.12, 3.2, 1.2, 0.24, BLANCO);
  puerta(k, 40.2);
}

/** las casas de la calle Cádiz, del quiebro al final: las de las celosías, la del murete y la de dos plantas */
function cadizNorte(k) {
  pared(k, 0, 12.3, 3.6);
  pretil(k, 0, 12.3, 3.6);
  pared(k, 12.3, 19.5, 6.5);
  pretil(k, 12.3, 19.5, 6.5);
  // las de las celosías
  ventana(k, 3.4, 1.0, 0.9, 1.1);
  ventana(k, 4.7, 1.0, 0.9, 1.1);
  ventanuco(k, 5.9);
  puerta(k, 7.0);
  ventanuco(k, 8.0);
  ventanuco(k, 9.1);
  // la del murete blanco con la cancela, y detrás la ventana de reja y la puerta
  k.box(11.0, 0, 1.6, 2.6, 1.15, 0.2, BLANCO);
  k.box(11.0, 1.15, 1.6, 2.64, 0.06, 0.26, 0xdcdad4);
  for (const s of [9.75, 12.25]) k.box(s, 0, 0.9, 0.2, 1.15, 1.4, BLANCO);
  k.block(11.0, 1.6, 2.6, 0.2);
  ventana(k, 10.6, 1.0, 0.9, 1.1, true);
  puerta(k, 11.6, 0.9);
  // la de dos plantas del final
  puerta(k, 14.7);
  ventana(k, 17.2, 1.0, 1.1, 1.1, true);
  ventana(k, 14.7, 3.9, 1.0, 1.1);
  ventana(k, 17.2, 3.9, 1.1, 1.1);
}

/** la casa terrera blanca de León y Castillo 176, con el zócalo gris y las dos puertas marrones de reja */
function casa176(k) {
  pared(k, 0, WH.len, 3.6);
  pretil(k, 0, WH.len, 3.6);
  k.box(WH.len / 2, 0, ZF + 0.02, WH.len, 1.0, 0.06, GRIS);
  for (const s of [2.65, 4.6]) {
    puerta(k, s, 0.95, 2.25);
    for (let x = -0.4; x <= 0.4; x += 0.1) k.box(s + x, 0.05, ZF + 0.12, 0.02, 2.15, 0.02, 0x3a2a20);
  }
}

/** las paredes de los lados y de atrás de una tira de casas (marco de la fachada, fondo hacia dentro) */
function trasera(scene, colliders, M, s0, s1, fondo, alto, nombre, grupos) {
  const A = M.W(s1, -fondo), B = M.W(s0, -fondo);
  grupos.push(tira(A, B, alto, nombre + 'Atras', colliders));
}

/** una pared lisa entre dos puntos del mapa, mirando a la derecha de A→B */
export function tira(A, B, alto, nombre, colliders, hacer) {
  const M = marco(A, B), k = new Kit();
  if (hacer) hacer(k, M.len);
  else pared(k, 0, M.len, alto, desconchada, -0.25);
  return enMarco(k, M, nombre, colliders);
}

/** la manzana de la esquina de Palencia: la cara de León y Castillo, la de Palencia y la de atrás */
function manzana(colliders, grupos) {
  grupos.push(tira(LW.B, LW.W(LW.len, 0), 3.9, 'rapadurasManzanaLyC', colliders, (k, L) => {
    pared(k, 0, L, 3.9);
    hueco(k, 11.3, 0, 1.15, 2.4, canvasTex(115, 240, chapaGris), { borde: 0x8a9094, z: ZF });
    k.box(9.0, 1.1, ZF + 0.08, 0.4, 0.3, 0.12, 0xd8d6cc);
  }));
  grupos.push(tira(PS.B, PS.W(PS.len, 0), 3.6, 'rapadurasManzanaPalencia', colliders, (k, L) => {
    pared(k, 0, L, 3.6);
    k.box(16.0, 3.6, ZF - 0.12, 6.0, 1.9, 0.24, 0xdedbd2);
    k.pic(16.0, 4.55, ZF + 0.004, 6.0, 1.9, 0, 1, canvasTex(300, 95, bloques));
    puerta(k, 6.5, 1.0);
    puerta(k, 26.5, 1.0);
  }));
  grupos.push(tira(NB.B, NB.W(NB.len, 0), 3.6, 'rapadurasManzanaAtras', colliders));
}

/** matojos secos y verdes por los solares (sin pisar las casas ni la grava) */
function matojos(k) {
  let s = 91;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const dentro = (p, x, z) => {
    let c = false;
    for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
      const [ax, az] = p[i], [bx, bz] = p[j];
      if ((az > z) !== (bz > z) && x < ax + ((z - az) * (bx - ax)) / (bz - az)) c = !c;
    }
    return c;
  };
  const casas = [
    [K1.W(25.6, 0), K1.W(K1.len, 0), K1.W(K1.len, -12.5), K1.W(25.6, -12.5)],
    [K2.W(0, 0), K2.W(19.5, 0), K2.W(19.5, -12.5), K2.W(0, -12.5)],
    [WH.W(0, 0), WH.W(WH.len, 0), WH.W(WH.len, -20.5), WH.W(0, -20.5)],
  ];
  let n = 0;
  for (let i = 0; i < 400 && n < 70; i++) {
    const x = 316 + r() * 44, z = -882 + r() * 63;
    if (!dentro(SOLAR, x, z) || dentro(PETROPRIX, x, z) || casas.some(c => dentro(c, x, z))) continue;
    const t = 0.2 + r() * 0.35, verde = r() < 0.55;
    k.ball(x, 0.2, z, t, verde ? 0x7a8a3a : 0xa8925a, { sx: 1.3, sy: 0.55, sz: 1.2, seg: 7 });
    if (r() < 0.4) k.ball(x + t * 0.6, 0.2, z + t * 0.3, t * 0.6, verde ? 0x6a7a32 : 0x9a8450, { sx: 1.2, sy: 0.6, sz: 1.1, seg: 6 });
    n++;
  }
}

/** la tierra de los solares de aquí: gris parda, con piedrecitas y manchas de picón negro */
export function tierraParda() {
  return sueloTex(256, 4, (g, r, n) => {
    g.fillStyle = '#8e8476';
    g.fillRect(0, 0, n, n);
    for (let i = 0; i < 14; i++) {
      g.fillStyle = r() < 0.5 ? 'rgba(40,36,34,0.16)' : 'rgba(170,150,120,0.14)';
      g.beginPath();
      g.arc(r() * n, r() * n, 12 + r() * 34, 0, Math.PI * 2);
      g.fill();
    }
    for (let i = 0; i < 2600; i++) {
      const v = r(), osc = r() < 0.25;
      g.fillStyle = osc ? `rgb(${Math.round(35 + v * 30)},${Math.round(32 + v * 26)},${Math.round(30 + v * 24)})`
        : `rgb(${Math.round(130 + v * 60)},${Math.round(118 + v * 52)},${Math.round(100 + v * 44)})`;
      g.fillRect(r() * n, r() * n, 1 + r() * 2.2, 1 + r() * 2.2);
    }
  });
}

/** la grava de la explanada de la Petroprix */
function grava() {
  return sueloTex(256, 3, (g, r, n) => {
    g.fillStyle = '#b4aa98';
    g.fillRect(0, 0, n, n);
    for (let i = 0; i < 4200; i++) {
      const v = 120 + r() * 90;
      g.fillStyle = `rgb(${Math.round(v)},${Math.round(v - 6)},${Math.round(v - 16)})`;
      g.fillRect(r() * n, r() * n, 1 + r() * 2.5, 1 + r() * 2.5);
    }
  });
}

/** se monta con lo demás */
export function buildRapadurasSur(scene, colliders, map) {
  if (!map?.rapadurasSur) return null;
  const grupos = [];
  const k1 = new Kit(), k2 = new Kit(), kw = new Kit();
  cadizSur(k1);
  cadizNorte(k2);
  casa176(kw);
  grupos.push(enMarco(k1, K1, 'rapadurasCadizSur', colliders), enMarco(k2, K2, 'rapadurasCadizNorte', colliders), enMarco(kw, WH, 'rapadurasCasa176', colliders));
  manzana(colliders, grupos);
  // las traseras y los costados que dan a los solares
  trasera(scene, colliders, K1, 25.6, K1.len, 12, 3.6, 'rapadurasCadizSur', grupos);
  trasera(scene, colliders, K2, 0, 12.3, 12, 3.6, 'rapadurasCadizNorteBaja', grupos);
  trasera(scene, colliders, K2, 12.3, 19.5, 12, 6.5, 'rapadurasCadizNorteAlta', grupos);
  grupos.push(tira(K2.W(19.5, 0), K2.W(19.5, -12), 6.5, 'rapadurasCadizLadoNorte', colliders));
  trasera(scene, colliders, WH, 0, WH.len, 20, 3.6, 'rapadurasCasa176', grupos);
  grupos.push(tira(WH.W(0, -20), WH.W(0, 0), 3.6, 'rapadurasCasa176Norte', colliders));
  grupos.push(tira(WH.W(WH.len, 0), WH.W(WH.len, -20), 3.6, 'rapadurasCasa176Sur', colliders));
  // los matojos de los solares, en metros del mapa
  const km = new Kit();
  matojos(km);
  grupos.push(km.build('rapadurasMatojos').group);
  for (const g of grupos) scene.add(g);
  // los suelos: la tierra de toda la franja y la grava del sitio de la Petroprix
  const suelos = [
    ['rapadurasTierra', SOLAR, 0.18, tierraParda(), 0xffffff],
    ['rapadurasGrava', PETROPRIX, 0.2, grava(), 0xffffff],
  ].map(([nombre, poly, y, tex, color]) => {
    const m = paveMesh(trocear(polyTris(poly), 1.5), y, tex, color);
    if (m) { m.name = nombre; scene.add(m); }
    return m;
  });
  return { grupos, suelos };
}
