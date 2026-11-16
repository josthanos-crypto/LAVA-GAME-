import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, hueco, trocear } from './restaurantesCharco.js';
import { alturaBloque } from './edificioReal.js';
import { paveMesh, polyTris } from './suelos.js';
import { ZF, pared, tira, tierraParda } from './rapadurasSur.js';

/**
 * El solar de tierra de Altavista entre las calles Enrique Suárez Lubary, Granada, Guillermo Toledo Duchemin y San Juan
 * de la Cruz (al sur del solar de Virgilio Cabrera), con las vistas de la calle de Google de julio de 2025 (Granada 14,
 * Guillermo Toledo Duchemin 10 y San Juan de la Cruz 15) y la foto aérea de GRAFCAN de 2024-2026 (solo se miran, no van
 * dentro del juego). En el juego era la foto aérea borrosa del suelo, y el cuarto viejo de la esquina un bloque genérico
 * de 6 m. De verdad: tierra parda con piedras y manchas de hierba seca y verde (sin coches, porque es de tierra); y en la
 * esquina de San Juan de la Cruz, el cuarto viejo de bloques sin enfoscar, de una planta, con el portón doble de madera y
 * el tejadillo de hormigón roto.
 */

// el solar, por el borde de las aceras (en metros del mapa)
const SOLAR = [[104.14, -1462.27], [224.43, -1440.23], [217.14, -1400.1], [138.41, -1413.36], [97.05, -1420.83]];
// el cuarto de la esquina: su cara a San Juan de la Cruz (N al este), la del norte, la del oeste y la del sur
const CE = marco([222.4, -1430.9], [224.6, -1441.4]);
const CN = marco([224.6, -1441.4], [210.7, -1444.3]);
const CO = marco([210.7, -1444.3], [208.6, -1433.8]);
const CS = marco([208.6, -1433.8], [222.4, -1430.9]);
const ALTO = 4.2;

/** antes de levantar la ciudad: el cuarto de la esquina a su altura */
export function tuneSolarLubary(map) {
  alturaBloque(map, 216.6, -1437.6, ALTO, [150, 146, 138]);
  map.solarLubary = true;
}

/** los bloques de hormigón sin enfoscar, de su tamaño (40 × 20 cm; la pared va a 24 puntos por metro) */
function bloques(g, w, h) {
  g.fillStyle = '#9a968e';
  g.fillRect(0, 0, w, h);
  let s = 3;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const bw = 9.6, bh = 4.8;
  for (let y = 0, f = 0; y < h; y += bh, f++) {
    for (let x = (f % 2) * -bw / 2; x < w; x += bw) {
      const v = 128 + r() * 34;
      g.fillStyle = `rgb(${Math.round(v)},${Math.round(v - 3)},${Math.round(v - 8)})`;
      g.fillRect(x + 0.5, y + 0.5, bw - 1, bh - 1);
    }
  }
  g.fillStyle = 'rgba(90,80,70,0.25)';
  g.fillRect(0, h * 0.85, w, h * 0.15);
}

/** el portón doble de madera vieja */
function porton(g, w, h) {
  g.fillStyle = '#6a4a32';
  g.fillRect(0, 0, w, h);
  let s = 9;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let x = 0; x < w; x += w / 10) {
    g.fillStyle = `rgba(${60 + r() * 40},${40 + r() * 30},${28 + r() * 20},0.5)`;
    g.fillRect(x, 0, w / 10 - 1, h);
  }
  g.fillStyle = '#3a2a1e';
  g.fillRect(w / 2 - 2, 0, 4, h);
  for (const y of [0.15, 0.5, 0.85]) g.fillRect(0, h * y, w, 4);
}

/** la cara del cuarto que da a San Juan de la Cruz: bloques, el portón y el tejadillo roto */
function caraCalle(k, L) {
  pared(k, 0, L, ALTO, bloques);
  hueco(k, L / 2 + 1.0, 0, 2.6, 2.6, canvasTex(156, 156, porton), { borde: 0x7a7670, z: ZF });
  k.box(2.4, 1.5, ZF + 0.02, 0.7, 0.5, 0.04, 0x2a2a28);
  k.box(L / 2, 3.0, ZF + 0.6, L - 1.0, 0.18, 1.2, 0x9a968e);
  k.box(L / 2 + 2.5, 2.85, ZF + 1.1, 2.0, 0.18, 0.4, 0x8a867e);
}

/** matojos, hierba y piedras por el solar (en metros del mapa) */
function sueltos(k) {
  let s = 59;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const dentro = (x, z) => {
    let c = false;
    for (let i = 0, j = SOLAR.length - 1; i < SOLAR.length; j = i++) {
      const [ax, az] = SOLAR[i], [bx, bz] = SOLAR[j];
      if ((az > z) !== (bz > z) && x < ax + ((z - az) * (bx - ax)) / (bz - az)) c = !c;
    }
    return c;
  };
  const fuera = (x, z) => (x > 95 && x < 119 && z > -1433 && z < -1414) || (x > 207 && z < -1429);
  for (let i = 0, n = 0; i < 1000 && n < 240; i++) {
    const x = 96 + r() * 130, z = -1463 + r() * 64;
    if (!dentro(x, z) || fuera(x, z)) continue;
    const t = r();
    if (t < 0.4) k.ball(x, 0.2, z, 0.25 + r() * 0.4, [0x6a8a3a, 0x7a9a42, 0x8a9a4a][n % 3], { sx: 1.4, sy: 0.45, sz: 1.3, seg: 6 });
    else if (t < 0.65) k.ball(x, 0.2, z, 0.2 + r() * 0.3, 0xa8925a, { sx: 1.3, sy: 0.55, sz: 1.2, seg: 6 });
    else k.ball(x, 0.2, z, 0.08 + r() * 0.16, [0x8a8680, 0xb0aca4, 0x6a6660][Math.floor(r() * 3)], { sx: 1.2, sy: 0.7, sz: 1.0, seg: 6 });
    n++;
  }
}

/** se monta con lo demás */
export function buildSolarLubary(scene, colliders, map) {
  if (!map?.solarLubary) return null;
  const grupos = [];
  const kc = new Kit();
  caraCalle(kc, CE.len);
  grupos.push(enMarco(kc, CE, 'solarLubaryCuarto', colliders));
  for (const [M, n] of [[CN, 'Norte'], [CO, 'Oeste'], [CS, 'Sur']]) {
    grupos.push(tira(M.B, M.W(M.len, 0), ALTO, 'solarLubaryCuarto' + n, colliders, (k, L) => pared(k, 0, L, ALTO, bloques, -0.25)));
  }
  const ks = new Kit();
  sueltos(ks);
  grupos.push(ks.build('solarLubarySueltos').group);
  for (const g of grupos) scene.add(g);
  const suelo = paveMesh(trocear(polyTris(SOLAR), 2), 0.18, tierraParda(), 0xf0e4d4);
  if (suelo) { suelo.name = 'solarLubaryTierra'; scene.add(suelo); }
  return { grupos, suelo };
}
