import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, trocear, sueloTex } from './restaurantesCharco.js';
import { paveMesh, polyTris } from './suelos.js';
import { bloques } from './rapadurasSur.js';

/**
 * El campo grande de tierra de Altavista, entre la calle Cádiz, la de Palencia, la del Donante de Sangre y las casas
 * de la calle Valladolid, con las vistas de la calle de Google de julio de 2025 (calle Cádiz 13, Palencia 15, Donante
 * de Sangre 26 y Valladolid 23) y la foto aérea de GRAFCAN de 2024-2026 (solo se miran, no van dentro del juego). En el
 * juego era la foto aérea borrosa del suelo. De verdad es tierra marrón rojiza con piedras, escombros y matojos; la
 * punta del norte, junto al Donante de Sangre, la usan de aparcamiento (tierra más oscura y pisada, con las rodadas;
 * como es de tierra, sin líneas ni coches puestos); y por la calle Palencia, el muro bajo de bloques con la valla de
 * malla y los hierros de una obra.
 */

// el campo, por el borde de las aceras y las casas (en metros del mapa)
const CAMPO = [[352.0, -790.8], [398.8, -778.1], [420.0, -821.0], [407.0, -828.0], [435.0, -882.0], [448.0, -875.0], [458.0, -896.0],
  [447.0, -902.0], [444.0, -897.0], [430.0, -905.0], [446.0, -933.2], [411.8, -950.6], [387.8, -962.6], [383.8, -964.4], [370.6, -877.1],
  [362.5, -830.8], [352.5, -792.6]];
// la punta del norte, de aparcamiento
const APARCAMIENTO = [[383.8, -964.4], [411.8, -950.6], [446.0, -933.2], [442.8, -929.0], [378.4, -929.0]];
// el muro de bloques con la malla, por Palencia
const MURO = [[377.0, -784.0], [397.0, -778.6]];

/** antes de levantar la ciudad */
export function tuneCampoCadiz(map) {
  map.campoCadiz = true;
}

/** la tierra marrón rojiza del campo, con piedras grises y blancas y manchas */
function tierraRoja() {
  return sueloTex(256, 5, (g, r, n) => {
    g.fillStyle = '#9c7a5e';
    g.fillRect(0, 0, n, n);
    for (let i = 0; i < 16; i++) {
      g.fillStyle = r() < 0.5 ? 'rgba(90,60,40,0.14)' : 'rgba(190,160,120,0.14)';
      g.beginPath();
      g.arc(r() * n, r() * n, 14 + r() * 36, 0, Math.PI * 2);
      g.fill();
    }
    for (let i = 0; i < 2600; i++) {
      const v = r(), piedra = r() < 0.08;
      g.fillStyle = piedra ? `rgb(${Math.round(128 + v * 40)},${Math.round(118 + v * 36)},${Math.round(106 + v * 32)})`
        : `rgb(${Math.round(124 + v * 50)},${Math.round(92 + v * 40)},${Math.round(68 + v * 30)})`;
      const d = piedra ? 1.5 + r() * 1.5 : 1 + r() * 1.6;
      g.beginPath();
      g.arc(r() * n, r() * n, d * 0.6, 0, Math.PI * 2);
      g.fill();
    }
  });
}

/** la tierra del aparcamiento: más oscura y pisada, con las rodadas */
function tierraPisada() {
  return sueloTex(256, 8, (g, r, n) => {
    g.fillStyle = '#7e6a5a';
    g.fillRect(0, 0, n, n);
    for (let i = 0; i < 1800; i++) {
      const v = r();
      g.fillStyle = `rgb(${Math.round(100 + v * 50)},${Math.round(84 + v * 40)},${Math.round(70 + v * 34)})`;
      g.fillRect(r() * n, r() * n, 1 + r() * 2, 1 + r() * 2);
    }
    g.strokeStyle = 'rgba(60,48,40,0.25)';
    g.lineWidth = 5;
    for (let i = 0; i < 5; i++) {
      g.beginPath();
      g.arc(r() * n, r() * n, 40 + r() * 80, r() * 6, r() * 6 + 1.6);
      g.stroke();
    }
  });
}

/** el muro bajo de bloques con la malla encima y los hierros de la obra */
function muroObra(k, L) {
  k.box(L / 2, 0, 0, L, 1.2, 0.2, 0x8e8a82);
  k.pic(L / 2, 0.6, 0.104, L, 1.2, 0, 1, canvasTex(Math.round(L * 30), 36, bloques));
  k.pic(L / 2, 0.6, -0.104, L, 1.2, 0, -1, canvasTex(Math.round(L * 30), 36, bloques));
  for (let s = 0; s <= L + 0.01; s += 2.5) k.box(Math.min(s, L), 1.2, 0, 0.05, 1.5, 0.05, 0x7a7e80);
  for (const y of [1.25, 1.95, 2.65]) k.box(L / 2, y, 0, L, 0.02, 0.02, 0x9a9ea0);
  for (let s = 0.25; s < L; s += 0.5) k.box(s, 1.2, 0, 0.012, 1.5, 0.012, 0xa8acae);
  for (const s of [3.0, 7.5, 12.0, 16.5]) k.box(s, 1.2, -1.2, 0.03, 2.6, 0.03, 0x6a3a2a);
  k.block(L / 2, 0, L, 0.25);
}

/** piedras, escombros y matojos por el campo (en metros del mapa) */
function sueltos(k) {
  let s = 77;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const dentro = (p, x, z) => {
    let c = false;
    for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
      const [ax, az] = p[i], [bx, bz] = p[j];
      if ((az > z) !== (bz > z) && x < ax + ((z - az) * (bx - ax)) / (bz - az)) c = !c;
    }
    return c;
  };
  let mat = 0, pie = 0, esc = 0;
  for (let i = 0; i < 3000 && (mat < 160 || pie < 140 || esc < 14); i++) {
    const x = 352 + r() * 106, z = -965 + r() * 187;
    if (!dentro(CAMPO, x, z) || dentro(APARCAMIENTO, x, z)) continue;
    const t = r();
    if (t < 0.45 && mat < 160) {
      const g = 0.2 + r() * 0.4, verde = r() < 0.45;
      k.ball(x, 0.2, z, g, verde ? 0x7a8a3a : 0xa8925a, { sx: 1.3, sy: 0.55, sz: 1.2, seg: 7 });
      mat++;
    } else if (t < 0.9 && pie < 140) {
      k.ball(x, 0.2, z, 0.08 + r() * 0.18, [0x8a8680, 0xb0aca4, 0x6a6660][Math.floor(r() * 3)], { sx: 1.2, sy: 0.7, sz: 1.0, seg: 6 });
      pie++;
    } else if (esc < 14) {
      for (let j = 0; j < 4; j++) k.ball(x + (r() - 0.5) * 1.6, 0.18, z + (r() - 0.5) * 1.6, 0.3 + r() * 0.4, [0x9a948a, 0xb8b0a2, 0xc8b8a0][j % 3], { sx: 1.3, sy: 0.5, sz: 1.1, seg: 6 });
      esc++;
    }
  }
}

/** se monta con lo demás */
export function buildCampoCadiz(scene, colliders, map) {
  if (!map?.campoCadiz) return null;
  const M = marco(MURO[0], MURO[1]), km = new Kit();
  muroObra(km, M.len);
  const ks = new Kit();
  sueltos(ks);
  const grupos = [enMarco(km, M, 'campoCadizMuro', colliders), ks.build('campoCadizSueltos').group];
  for (const g of grupos) scene.add(g);
  const suelos = [
    ['campoCadizTierra', CAMPO, 0.18, tierraRoja(), 0xffffff],
    ['campoCadizAparcamiento', APARCAMIENTO, 0.2, tierraPisada(), 0xffffff],
  ].map(([nombre, poly, y, tex, color]) => {
    const m = paveMesh(trocear(polyTris(poly), 2), y, tex, color);
    if (m) { m.name = nombre; scene.add(m); }
    return m;
  });
  return { grupos, suelos };
}
