import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, hueco, trocear } from './restaurantesCharco.js';
import { cristales } from './edificioReal.js';
import { paveMesh, polyTris } from './suelos.js';
import { Z, ZF, BLANCO, pared, tira, tierraParda } from './rapadurasSur.js';

/**
 * Confecciones Altavista, en la calle Ángel Ganivet 36 (Altavista), y el solar de tierra de al lado (el 40), con las
 * fotos del local de 2021 y 2023 y las vistas de la calle de Google de julio de 2025 (solo se miran, no van dentro del
 * juego). El mapa tenía la esquina como el bloque genérico de 8 m con ventanas, y el solar como un hueco del bloque con
 * la foto aérea en el suelo y ventanas pintadas en las paredes de alrededor. De verdad:
 * - la casa blanca de la esquina: abajo, el escaparate grande y el pequeño con el marco amarillo y los paneles blancos de
 *   abajo, la puerta de la tienda con el marco amarillo y la celosía blanca, la puerta blanca del portal con los buzones
 *   y el contador, el aparato del aire y el letrero blanco con el vestido negro; arriba, los dos balcones de balaustrada
 *   blanca con las ventanas de marco granate y, en la azotea, la balaustrada blanca;
 * - el solar: el muro blanco de la calle con el portón verde grande de chapa y los hierros de punta, la tierra con los
 *   escombros, la caseta de obra oxidada y las paredes blancas y lisas de las casas de alrededor.
 */

// la cara de la tienda, de 12 m de la esquina hacia el este (s del este a la esquina; N al norte, a la calle)
const CF = marco([31.47, -1016.34], [20.41, -1011.7]);
const ALTO = 8.0, P1 = 3.3;
// el solar: el hueco del bloque del mapa, abierto a la calle
const SOLAR = [[20.41, -1011.7], [33.43, -980.71], [0.6, -963.2], [-15.41, -996.67]];
// el muro de la calle, de la esquina de la tienda hacia el oeste (N al norte)
const MURO = marco([20.41, -1011.7], [-15.41, -996.67]);

/** antes de levantar la ciudad */
export function tuneConfeccionesAltavista(map) {
  map.confeccionesAltavista = true;
}

/** la celosía blanca de rombos de la puerta de la tienda */
function celosiaBlanca(g, w, h) {
  g.fillStyle = '#3a3c40';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#f4f4f0';
  g.lineWidth = Math.max(2, w * 0.05);
  const p = w / 5;
  for (let x = -h; x < w + h; x += p) {
    g.beginPath(); g.moveTo(x, 0); g.lineTo(x + h, h); g.stroke();
    g.beginPath(); g.moveTo(x + h, 0); g.lineTo(x, h); g.stroke();
  }
}

/** la puerta blanca del portal, de cuarterones con el arco de arriba */
function puertaBlanca(g, w, h) {
  g.fillStyle = '#f6f6f2';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#d4d4ce';
  g.lineWidth = 3;
  g.strokeRect(w * 0.16, h * 0.55, w * 0.68, h * 0.36);
  g.beginPath();
  g.moveTo(w * 0.16, h * 0.48);
  g.lineTo(w * 0.16, h * 0.2);
  g.quadraticCurveTo(w * 0.5, h * 0.04, w * 0.84, h * 0.2);
  g.lineTo(w * 0.84, h * 0.48);
  g.closePath();
  g.stroke();
}

/** el letrero blanco con el vestido negro */
function vestido(g, w, h) {
  g.fillStyle = '#f6f6f4';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#2a2a2c';
  g.lineWidth = w * 0.04;
  g.strokeRect(w * 0.06, w * 0.06, w - w * 0.12, h - w * 0.12);
  g.fillStyle = '#1a1a1c';
  g.beginPath();
  g.moveTo(w * 0.42, h * 0.18); g.lineTo(w * 0.58, h * 0.18);
  g.lineTo(w * 0.62, h * 0.4); g.lineTo(w * 0.8, h * 0.85);
  g.lineTo(w * 0.2, h * 0.85); g.lineTo(w * 0.38, h * 0.4);
  g.closePath(); g.fill();
}

/** el portón verde de chapa, de dos hojas con los refuerzos */
function porton(g, w, h) {
  g.fillStyle = '#3e6e52';
  g.fillRect(0, 0, w, h);
  let s = 3;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 30; i++) {
    g.fillStyle = `rgba(${90 + r() * 60},${70 + r() * 40},${50 + r() * 30},0.25)`;
    g.fillRect(r() * w, r() * h, 4 + r() * 20, 2 + r() * 10);
  }
  g.strokeStyle = '#2c5a40';
  g.lineWidth = 3;
  for (let x = 0; x <= w; x += w / 8) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  g.beginPath(); g.moveTo(0, h * 0.5); g.lineTo(w, h * 0.5); g.stroke();
}

/** un escaparate de marco amarillo: los paneles blancos de abajo, el cristal y los cristalitos de arriba */
function escaparate(k, s, ancho) {
  const amarillo = 0xf0c21c;
  k.box(s, 0, ZF + 0.05, ancho, 0.65, 0.04, 0xf2f2ee);
  for (let x = s - ancho / 2 + ancho / 8; x < s + ancho / 2; x += ancho / 4) k.box(x, 0.12, ZF + 0.08, ancho / 4 - 0.15, 0.42, 0.02, 0xdedede);
  k.pic(s, 1.55, ZF + 0.03, ancho, 1.7, 0, 1, canvasTex(Math.round(ancho * 60), 102, cristales('#f0c21c', 2, 'rgba(120,140,170,.25)')));
  k.pic(s, 2.68, ZF + 0.03, ancho, 0.42, 0, 1, canvasTex(Math.round(ancho * 60), 25, cristales('#f0c21c', 4, 'rgba(220,220,215,.5)')));
  for (const x of [s - ancho / 2, s + ancho / 2]) k.box(x, 0, ZF + 0.07, 0.1, 2.95, 0.1, amarillo);
  for (const y of [0.65, 2.42, 2.9]) k.box(s, y, ZF + 0.07, ancho, 0.08, 0.1, amarillo);
}

/** un balcón de balaustrada blanca */
function balaustrada(k, s0, s1, y, z, sale = 0.8) {
  const c = (s0 + s1) / 2, w = s1 - s0;
  if (sale) k.box(c, y - 0.15, z + sale / 2, w, 0.15, sale, 0xf2f2ee);
  const zr = z + Math.max(sale - 0.08, 0.06);
  k.box(c, y, zr, w, 0.1, 0.16, 0xf0f0ec);
  k.box(c, y + 0.9, zr, w + 0.04, 0.1, 0.2, 0xf0f0ec);
  for (let s = s0 + 0.12; s < s1; s += 0.2) k.cyl(s, y + 0.1, zr, 0.045, 0.06, 0.8, 0xf4f4f0, { seg: 7 });
}

/** la fachada de la tienda y la casa de encima */
function tienda(k) {
  const L = CF.len;
  pared(k, 0, L, ALTO, (g, w, h) => { g.fillStyle = '#f2f2ee'; g.fillRect(0, 0, w, h); });
  // abajo: el escaparate grande, la puerta de la tienda, la puerta del portal y el escaparate pequeño
  escaparate(k, 2.5, 3.0);
  hueco(k, 4.7, 0, 0.95, 2.6, canvasTex(57, 156, celosiaBlanca), { borde: 0xf0c21c, z: ZF });
  hueco(k, 6.4, 0, 0.95, 2.3, canvasTex(57, 138, puertaBlanca), { borde: 0xf2f2ee, z: ZF });
  for (const s of [5.6, 7.2]) k.box(s, 1.4, ZF + 0.08, 0.32, 0.36, 0.12, 0xc8964a);
  k.box(6.9, 0.3, ZF + 0.06, 0.6, 0.6, 0.1, 0xe2e2de);
  escaparate(k, 8.9, 2.4);
  k.box(10.6, 3.3, ZF + 0.2, 0.8, 0.55, 0.32, 0xd8d4c8);
  k.pic(2.6, 3.0, ZF + 0.45, 0.5, 1.0, 0, 1, canvasTex(60, 120, vestido));
  k.box(2.6, 3.0, ZF + 0.22, 0.04, 0.04, 0.45, 0x5a5a5a);
  // arriba: los dos balcones de balaustrada blanca con las ventanas de marco granate, y la azotea
  balaustrada(k, 0.4, 4.6, P1 + 0.15, ZF);
  hueco(k, 2.5, P1 + 0.15, 1.0, 2.1, canvasTex(60, 126, cristales('#7a1e24', 2)), { borde: 0x7a1e24, z: ZF });
  hueco(k, 5.6, P1 + 0.9, 0.9, 1.2, canvasTex(54, 72, cristales('#7a1e24', 2)), { borde: 0x7a1e24, z: ZF });
  balaustrada(k, 7.0, 11.2, P1 + 0.15, ZF, 0.9);
  hueco(k, 9.1, P1 + 0.15, 1.0, 2.1, canvasTex(60, 126, cristales('#7a1e24', 2)), { borde: 0x7a1e24, z: ZF });
  balaustrada(k, 0, L, ALTO - 1.0, ZF - 0.2, 0);
  k.box(L / 2, ALTO - 1.1, ZF - 0.06, L, 0.12, 0.2, 0xdedcd6);
}

/** el muro blanco de la calle con el portón verde y los hierros de punta */
function muroSolar(k, L) {
  const p0 = 12.2, p1 = 20.2;
  pared(k, 0, p0 - 0.3, 2.8);
  pared(k, p1 + 0.3, L, 2.8);
  for (const s of [p0 - 0.15, p1 + 0.15]) k.box(s, 0, Z + 0.15, 0.6, 3.0, 0.6, BLANCO);
  k.box((p0 + p1) / 2, 0, Z + 0.15, p1 - p0, 2.6, 0.06, 0x3e6e52);
  k.pic((p0 + p1) / 2, 1.3, Z + 0.19, p1 - p0, 2.6, 0, 1, canvasTex(400, 130, porton));
  k.pic((p0 + p1) / 2, 1.3, Z + 0.11, p1 - p0, 2.6, 0, -1, canvasTex(400, 130, porton));
  for (let s = p0 + 0.2; s < p1; s += 0.45) k.box(s, 2.6, Z + 0.15, 0.025, 0.55, 0.025, 0x6a3a2a);
  k.block((p0 + p1) / 2, Z + 0.15, p1 - p0, 0.2);
}

/** la caseta de obra oxidada y los escombros del solar (en metros del mapa) */
function dentroSolar(k) {
  k.box(16.5, 0.18, -991.5, 3.0, 2.4, 2.3, 0x8a6a4e);
  k.box(16.5, 2.58, -991.5, 3.1, 0.08, 2.4, 0x6a5240);
  k.block(16.5, -991.5, 3.0, 2.3);
  let s = 19;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const dentro = (x, z) => {
    let c = false;
    for (let i = 0, j = SOLAR.length - 1; i < SOLAR.length; j = i++) {
      const [ax, az] = SOLAR[i], [bx, bz] = SOLAR[j];
      if ((az > z) !== (bz > z) && x < ax + ((z - az) * (bx - ax)) / (bz - az)) c = !c;
    }
    return c;
  };
  for (let i = 0, n = 0; i < 200 && n < 12; i++) {
    const x = 0 + r() * 26, z = -1004 + r() * 30;
    if (!dentro(x, z) || Math.hypot(x - 16.5, z + 991.5) < 3) continue;
    k.ball(x, 0.18, z, 0.3 + r() * 0.5, [0x9a948a, 0xb8b0a2, 0x7a766e][n % 3], { sx: 1.3, sy: 0.45, sz: 1.1, seg: 6 });
    n++;
  }
  for (let i = 0, n = 0; i < 400 && n < 40; i++) {
    const x = -14 + r() * 46, z = -1011 + r() * 47;
    if (!dentro(x, z) || Math.hypot(x - 16.5, z + 991.5) < 2.5) continue;
    k.ball(x, 0.2, z, 0.2 + r() * 0.3, r() < 0.5 ? 0x7a8a3a : 0xa8925a, { sx: 1.3, sy: 0.55, sz: 1.2, seg: 6 });
    n++;
  }
}

/** se monta con lo demás */
export function buildConfeccionesAltavista(scene, colliders, map) {
  if (!map?.confeccionesAltavista) return null;
  const kt = new Kit(), km = new Kit(), kd = new Kit();
  tienda(kt);
  muroSolar(km, MURO.len);
  dentroSolar(kd);
  const grupos = [enMarco(kt, CF, 'confeccionesAltavista', colliders), enMarco(km, MURO, 'confeccionesMuroSolar', colliders)];
  // dentro del solar, solo las matas y escombros que caen dentro
  const g = kd.build('confeccionesSolarDentro').group;
  grupos.push(g);
  // las paredes blancas y lisas de las casas de alrededor del solar (tapan las ventanas que pinta el juego)
  grupos.push(tira(SOLAR[0], SOLAR[1], ALTO, 'confeccionesSolarEste', colliders));
  grupos.push(tira(SOLAR[1], SOLAR[2], ALTO, 'confeccionesSolarSur', colliders));
  grupos.push(tira(SOLAR[2], SOLAR[3], ALTO, 'confeccionesSolarOeste', colliders));
  for (const gr of grupos) scene.add(gr);
  const suelo = paveMesh(trocear(polyTris(SOLAR), 1.5), 0.18, tierraParda(), 0xd8d0c4);
  if (suelo) { suelo.name = 'confeccionesSolarTierra'; scene.add(suelo); }
  return { grupos, suelo };
}
