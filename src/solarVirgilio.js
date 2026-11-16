import { Kit } from './interiorKit.js';
import { trocear, sueloTex } from './restaurantesCharco.js';
import { paveMesh, polyTris, bandTris } from './suelos.js';

/**
 * El solar grande de tierra de Altavista entre las calles Virgilio Cabrera, Granada, San Juan de la Cruz y Enrique
 * Suárez Lubary (enfrente de la Hamburguesería Tentempié), con las vistas de la calle de Google de julio de 2025 (Granada
 * 36 y Virgilio Cabrera 21) y la foto aérea de GRAFCAN de 2024-2026 (solo se miran, no van dentro del juego). En el
 * juego era la foto aérea borrosa del suelo. De verdad es tierra marrón rojiza con piedras, cruzada por las rodadas de
 * los coches que aparcan; con montones de escombro en el medio, los dos restos de muro bajo de bloques de la parte de
 * arriba, el matorral de tabaibas y algún cardón en la esquina del sureste, y matojos por todo.
 */

// el solar, por el borde de las aceras (en metros del mapa)
const SOLAR = [[122.19, -1566.03], [225.83, -1547.96], [220.55, -1505.58], [211.51, -1454.09], [106.12, -1473.41], [113.92, -1515.95]];
// las rodadas que se ven en la foto aérea
const RODADAS = [
  [[124, -1520], [150, -1522], [175, -1518], [195, -1510], [212, -1505]],
  [[160, -1560], [168, -1535], [172, -1515], [178, -1490], [185, -1462]],
  [[130, -1555], [150, -1540], [170, -1532]],
];
// los dos restos de muro de bloques: [x, z, ancho, fondo]
const MUROS = [[174.5, -1555.0, 5.0, 6.0], [214.0, -1549.5, 10.0, 5.0]];

/** antes de levantar la ciudad */
export function tuneSolarVirgilio(map) {
  map.solarVirgilio = true;
}

/** la tierra marrón rojiza, con las piedras y las manchas */
function tierraRoja() {
  return sueloTex(256, 5, (g, r, n) => {
    g.fillStyle = '#9a785c';
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
      g.beginPath();
      g.arc(r() * n, r() * n, (piedra ? 1.5 + r() * 1.5 : 1 + r() * 1.6) * 0.6, 0, Math.PI * 2);
      g.fill();
    }
  });
}

/** la tierra pisada de las rodadas, más gris */
function rodada() {
  return sueloTex(128, 3, (g, r, n) => {
    g.fillStyle = '#8a7a6a';
    g.fillRect(0, 0, n, n);
    for (let i = 0; i < 900; i++) {
      const v = r();
      g.fillStyle = `rgb(${Math.round(110 + v * 40)},${Math.round(98 + v * 34)},${Math.round(84 + v * 30)})`;
      g.fillRect(r() * n, r() * n, 1 + r() * 2, 1 + r() * 2);
    }
  });
}

/** el muro bajo de bloques, roto, alrededor de un hueco */
function muroRoto(k, x, z, w, d, sd) {
  const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  const lados = [[x, z - d / 2, w, 0.2], [x, z + d / 2, w, 0.2], [x - w / 2, z, 0.2, d], [x + w / 2, z, 0.2, d]];
  for (const [cx, cz, lw, ld] of lados) {
    const alto = 0.6 + r() * 0.7;
    k.box(cx, 0.15, cz, lw, alto, ld, 0x8e8a82);
    k.block(cx, cz, lw, ld);
  }
}

/** piedras, escombros, matojos y el matorral de la esquina (en metros del mapa) */
function sueltos(k) {
  let s = 41;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const dentro = (x, z) => {
    let c = false;
    for (let i = 0, j = SOLAR.length - 1; i < SOLAR.length; j = i++) {
      const [ax, az] = SOLAR[i], [bx, bz] = SOLAR[j];
      if ((az > z) !== (bz > z) && x < ax + ((z - az) * (bx - ax)) / (bz - az)) c = !c;
    }
    return c;
  };
  // los montones de escombro del medio
  for (let i = 0; i < 10; i++) {
    const x = 178 + r() * 14, z = -1535 + r() * 10;
    k.ball(x, 0.15, z, 0.5 + r() * 0.8, [0xb8b0a2, 0xc8c0b0, 0x9a948a][i % 3], { sx: 1.3, sy: 0.45, sz: 1.1, seg: 7 });
  }
  // el matorral de la esquina del sureste: tabaibas y algún cardón
  for (let i = 0; i < 26; i++) {
    const x = 197 + r() * 18, z = -1492 + r() * 34;
    if (!dentro(x, z)) continue;
    const t = 0.4 + r() * 0.6;
    k.ball(x, 0.15, z, t, [0x5a7a3a, 0x6a8a42, 0x4a6a32][i % 3], { sx: 1.2, sy: 0.75, sz: 1.2, seg: 8 });
  }
  for (const [x, z, h] of [[203, -1478, 1.8], [209, -1468, 1.4], [206, -1486, 1.2]]) {
    for (let j = 0; j < 5; j++) k.cyl(x + (j - 2) * 0.22, 0.15, z + ((j * 7) % 3 - 1) * 0.2, 0.09, 0.11, h * (0.7 + (j % 3) * 0.15), 0x5a7a40, { seg: 6 });
  }
  // las piedras y los matojos por todo el solar
  for (let i = 0, n = 0; i < 900 && n < 260; i++) {
    const x = 106 + r() * 120, z = -1567 + r() * 113;
    if (!dentro(x, z)) continue;
    if (r() < 0.5) k.ball(x, 0.2, z, 0.2 + r() * 0.35, r() < 0.5 ? 0x7a8a3a : 0xa8925a, { sx: 1.3, sy: 0.55, sz: 1.2, seg: 6 });
    else k.ball(x, 0.2, z, 0.08 + r() * 0.16, [0x8a8680, 0xb0aca4, 0x6a6660][Math.floor(r() * 3)], { sx: 1.2, sy: 0.7, sz: 1.0, seg: 6 });
    n++;
  }
  MUROS.forEach(([x, z, w, d], i) => muroRoto(k, x, z, w, d, 7 + i * 13));
}

/** se monta con lo demás */
export function buildSolarVirgilio(scene, colliders, map) {
  if (!map?.solarVirgilio) return null;
  const k = new Kit();
  sueltos(k);
  const { group, segs } = k.build('solarVirgilio');
  for (const [ax, az, bx, bz] of segs) colliders?.addSegment(ax, az, bx, bz);
  scene.add(group);
  const suelos = [];
  const tierra = paveMesh(trocear(polyTris(SOLAR), 2), 0.18, tierraRoja(), 0xffffff);
  if (tierra) { tierra.name = 'solarVirgilioTierra'; scene.add(tierra); suelos.push(tierra); }
  const tex = rodada();
  RODADAS.forEach((linea, i) => {
    const m = paveMesh(trocear(bandTris(linea, 2.4), 1.5), 0.19, tex, 0xffffff);
    if (m) { m.name = 'solarVirgilioRodada' + i; scene.add(m); suelos.push(m); }
  });
  return { group, suelos };
}
