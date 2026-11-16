import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, hueco, trocear, sueloTex } from './restaurantesCharco.js';
import { cristales } from './edificioReal.js';
import { paveMesh, polyTris } from './suelos.js';
import { Z, ZF, BLANCO, pared } from './rapadurasSur.js';

/**
 * El IES en Altavista (calle Mosta) y la cafetería-bocatería de enfrente, con las fotos del sitio de 2018 a 2023 y las
 * vistas de la calle de Google de julio de 2025 (calle Mosta 5; solo se miran, no van dentro del juego; la gente no se
 * pone) y la foto aérea de GRAFCAN de 2024-2026. En el juego no estaba el instituto: solo la foto aérea en el suelo. De
 * verdad:
 * - el edificio grande de cuatro plantas, color crema, con las ventanas en grupos de tres entre los pilares y la entrada
 *   de cristal en medio con sus escalones;
 * - delante, los dos pabellones bajos de paneles blancos y grises con el tejado marrón, el patio de hormigón, los dos
 *   parterres con las palmeras y el árbol grande;
 * - el muro crema de la calle con sus pilares y remates, la cancela gris de la entrada y el letrero «IES en Altavista»;
 * - enfrente, en la esquina de la calle Las Quemadas, la cafetería en el bajo de la casa blanca: la ventana grande que
 *   mira al instituto, la puerta de cristal, la pizarra del menú (sin letras ni platos), el murete gris y el árbol de la
 *   acera. Como no se ve el nombre en la fachada, no se le pone rótulo.
 */

// el edificio grande: su cara a la calle (s del este al oeste; N al norte, a la calle), de 47 × 23 m
const ED = marco([394.6, -1707.9], [348.33, -1715.4]);
const FONDO = 23, ALTO = 12.5;
const ESQ = [ED.W(0, 0), ED.W(ED.len, 0), ED.W(ED.len, -FONDO), ED.W(0, -FONDO)];
// el muro de la calle (s del este al oeste; N a la calle) y la cancela
const MU = marco([399.0, -1723.1], [340.0, -1730.3]);
const CANCELA = (399.0 - 372.0) / 0.9926;
// los dos pabellones de delante: centro, ancho y fondo (girados como el edificio)
const PABELLONES = [[355.0, -1723.5, 12.5, 9.5], [386.4, -1719.0, 12.5, 8.5]];
// el patio de delante
const PATIO = [[340.0, -1730.3], [399.0, -1723.1], [396.0, -1707.6], [343.0, -1716.3]];
// la cafetería de enfrente: la cara al instituto (s del oeste al este; N al sur) y la de Las Quemadas (N al este)
const CS = marco([353.9, -1749.0], [364.0, -1747.2]);
const CE = marco([364.0, -1747.2], [370.8, -1785.5]);
const CREMA = 0xece0c4, CREMA_OSC = 0xd8ccae, VERDE = 0x2f6f4f;

/** antes de levantar la ciudad: el edificio del instituto en el mapa (el juego le pone el choque y las caras de atrás) */
export function tuneIesAltavista(map) {
  if (!Array.isArray(map?.buildings)) return;
  const p = ESQ.map(q => [+q[0].toFixed(2), +q[1].toFixed(2)]);
  p.push(p[0].slice());
  map.buildings.push({ p, h: ALTO, k: 'gen', s: 0, f: [236, 224, 196], c: [176, 160, 140], edificioReal: true });
  map.iesAltavista = true;
}

/** el letrero de la entrada: blanco con las letras azules */
function letrero(g, w, h) {
  g.fillStyle = '#f4f4f2';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#9a9a96';
  g.lineWidth = 3;
  g.strokeRect(2, 2, w - 4, h - 4);
  g.fillStyle = '#1e4b9a';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `800 ${Math.round(h * 0.34)}px Arial, sans-serif`;
  g.fillText('IES', w / 2, h * 0.32, w * 0.8);
  g.font = `600 ${Math.round(h * 0.2)}px Arial, sans-serif`;
  g.fillText('en Altavista', w / 2, h * 0.68, w * 0.86);
}

/** los paneles blancos y grises de los pabellones */
function paneles(g, w, h) {
  g.fillStyle = '#e6e8e8';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#b8bcbe';
  g.lineWidth = 2;
  for (let x = 0; x < w; x += 30) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  g.fillStyle = '#9a9ea2';
  g.fillRect(0, h * 0.86, w, h * 0.14);
}

/** la pizarra del menú: el marco marrón y las fotos de colores, sin letras */
function pizarra(g, w, h) {
  g.fillStyle = '#6a2a1e';
  g.fillRect(0, 0, w, h);
  const c = ['#d8a050', '#c86a3a', '#e8d8b0', '#a8c070', '#d8b080', '#c89060'];
  for (let i = 0; i < 6; i++) {
    g.fillStyle = c[i];
    g.fillRect(w * (0.08 + (i % 2) * 0.46), h * (0.08 + Math.floor(i / 2) * 0.3), w * 0.38, h * 0.24);
  }
}

/** el hormigón claro del patio */
function hormigon() {
  return sueloTex(256, 5, (g, r, n) => {
    g.fillStyle = '#c4c0b6';
    g.fillRect(0, 0, n, n);
    for (let i = 0; i < 2400; i++) {
      const v = 170 + r() * 45;
      g.fillStyle = `rgb(${Math.round(v)},${Math.round(v - 3)},${Math.round(v - 10)})`;
      g.fillRect(r() * n, r() * n, 1 + r() * 2, 1 + r() * 2);
    }
    g.fillStyle = 'rgba(90,86,80,0.45)';
    g.fillRect(0, 0, n, 1.5);
    g.fillRect(0, 0, 1.5, n);
  });
}

/** la cara del edificio grande que da a la calle */
function fachada(k) {
  const L = ED.len;
  pared(k, 0, L, ALTO, (g, w, h) => { g.fillStyle = '#ece0c4'; g.fillRect(0, 0, w, h); });
  k.box(L / 2, ALTO, ZF - 0.12, L, 0.6, 0.24, CREMA);
  k.box(L / 2, ALTO + 0.6, ZF - 0.1, L + 0.04, 0.06, 0.3, CREMA_OSC);
  // las ventanas en grupos de tres entre los pilares, en las cuatro plantas
  const grupos = 8, paso = L / grupos;
  for (let gi = 0; gi < grupos; gi++) {
    const c = paso * (gi + 0.5);
    k.box(paso * gi, 0, ZF + 0.12, 0.6, ALTO, 0.24, CREMA_OSC);
    for (const [i, y] of [1.0, 4.1, 7.2, 10.3].entries()) {
      if (i === 0 && Math.abs(c - L / 2) < paso * 0.6) continue;
      for (const ds of [-1.45, 0, 1.45]) {
        hueco(k, c + ds, y, 1.2, 1.4, canvasTex(72, 84, cristales('#2f6f4f', 2, 'rgba(60,70,70,.3)')), { borde: VERDE, z: ZF });
      }
    }
  }
  k.box(L, 0, ZF + 0.12, 0.6, ALTO, 0.24, CREMA_OSC);
  // la entrada de cristal en medio, con los escalones y el tejadillo
  hueco(k, L / 2, 0.75, 3.0, 2.6, canvasTex(180, 156, cristales('#2a2c2e', 4, 'rgba(40,50,60,.35)')), { borde: 0x2a2c2e, z: ZF });
  for (let i = 0; i < 3; i++) k.box(L / 2, i * 0.25, ZF + 1.6 - i * 0.4, 5.0, 0.25, 0.4 + i * 0.0, 0xd8d4ca);
  k.box(L / 2, 0, ZF + 0.6, 5.0, 0.75, 1.2, 0xd8d4ca);
  k.block(L / 2, ZF + 0.9, 5.0, 1.4);
  k.box(L / 2, 3.55, ZF + 0.8, 4.6, 0.15, 1.6, CREMA_OSC);
}

/** el muro de la calle: crema, con los pilares y sus remates, la cancela gris y el letrero */
function muro(k) {
  const L = MU.len, c0 = CANCELA - 2.0, c1 = CANCELA + 2.0, alto = 1.7;
  for (const [a, b] of [[0, c0], [c1, L]]) {
    k.box((a + b) / 2, 0, Z + 0.15, b - a, alto, 0.3, CREMA);
    k.box((a + b) / 2, alto, Z + 0.15, b - a + 0.02, 0.06, 0.36, CREMA_OSC);
    k.block((a + b) / 2, Z + 0.15, b - a, 0.3);
    for (let s = a; s <= b + 0.01; s += 4.0) {
      const x = Math.min(s, b);
      k.box(x, 0, Z + 0.15, 0.5, alto + 0.35, 0.5, CREMA);
      k.box(x, alto + 0.35, Z + 0.15, 0.6, 0.1, 0.6, CREMA_OSC);
    }
  }
  for (const s of [c0, c1]) {
    k.box(s, 0, Z + 0.15, 0.7, 2.4, 0.7, CREMA);
    k.box(s, 2.4, Z + 0.15, 0.8, 0.12, 0.8, CREMA_OSC);
  }
  // la cancela gris de barrotes, de dos hojas
  for (const y of [0.1, 1.0, 1.9]) k.box(CANCELA, y, Z + 0.15, 3.3, 0.05, 0.05, 0x8a8e92);
  for (let s = c0 + 0.45; s < c1 - 0.3; s += 0.12) k.box(s, 0.05, Z + 0.15, 0.03, 1.95, 0.03, 0x8a8e92);
  k.block(CANCELA, Z + 0.15, 3.4, 0.15);
  // el letrero y la placa oscura del muro
  k.pic(c1 + 0.37, 1.5, Z + 0.15, 0.6, 0.6, 1, 0, canvasTex(120, 120, letrero));
  k.pic(c1, 1.55, Z + 0.51, 0.62, 0.62, 0, 1, canvasTex(120, 120, letrero));
  k.box(c0 - 3.0, 0.7, Z + 0.32, 1.6, 0.8, 0.04, 0x6a6662);
}

/** un pabellón bajo de paneles con el tejado marrón */
function pabellon(k, w, d) {
  const alto = 3.1;
  k.box(0, 0, 0, w, alto, d, 0xe6e8e8);
  k.block(0, 0, w, d);
  for (const [z, n] of [[d / 2 + 0.01, 1], [-d / 2 - 0.01, -1]]) k.pic(0, alto / 2, z, w, alto, 0, n, canvasTex(Math.round(w * 30), 93, paneles));
  for (const [x, n] of [[w / 2 + 0.01, 1], [-w / 2 - 0.01, -1]]) k.pic(x, alto / 2, 0, d, alto, n, 0, canvasTex(Math.round(d * 30), 93, paneles));
  for (const s of [-w / 3, 0, w / 3]) k.pic(s, 1.8, d / 2 + 0.02, 1.4, 1.0, 0, 1, canvasTex(84, 60, cristales('#9a9ea2', 2)));
  k.box(0, alto, 0, w + 0.4, 0.25, d + 0.4, 0x8a5a44);
}

/** las palmeras, el árbol grande y los parterres de delante, y el árbol de la acera de la cafetería (en metros del mapa) */
function verde(k) {
  for (const [x, z] of [[369.4, -1723.0], [374.6, -1723.2]]) {
    k.box(x, 0, z, 2.0, 0.45, 3.0, 0xd8d4ca);
    k.box(x, 0.45, z, 1.8, 0.02, 2.8, 0x5a4a3a);
    k.block(x, z, 2.0, 3.0);
    k.cyl(x, 0.45, z, 0.28, 0.36, 7.5, 0x8a7258, { seg: 9 });
    for (let i = 0; i < 12; i++) k.box(x, 7.8, z, 4.6, 0.06, 0.5, [0x4a7a32, 0x5a8a3a][i % 2], { ry: (i * Math.PI) / 12 });
  }
  for (const [x, z, h, sd] of [[362.8, -1727.6, 7.0, 13], [360.0, -1745.6, 6.0, 29]]) {
    k.cyl(x, 0.15, z, 0.18, 0.26, h * 0.5, 0x6a5440, { seg: 8 });
    let s = sd;
    const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 14; i++) k.ball(x + (r() - 0.5) * h * 0.45, h * (0.55 + r() * 0.35), z + (r() - 0.5) * h * 0.45, h * (0.1 + r() * 0.05), [0x3e6a2e, 0x4a7a36, 0x56863c][i % 3], { seg: 7 });
    k.block(x, z, 0.4, 0.4);
  }
}

/** la cara de la cafetería que mira al instituto */
function cafeteriaSur(k) {
  const L = CS.len;
  pared(k, 0, L, 6.0, (g, w, h) => { g.fillStyle = '#f0f0ec'; g.fillRect(0, 0, w, h); });
  k.box(L / 2, 6.0, ZF - 0.12, L, 0.5, 0.24, BLANCO);
  k.box(1.8, 0, ZF + 0.25, 2.6, 1.1, 0.5, 0x5a5c5e);
  k.block(1.8, ZF + 0.25, 2.6, 0.5);
  hueco(k, 7.0, 0.9, 4.4, 1.6, canvasTex(264, 96, cristales('#5a3a28', 3, 'rgba(70,60,50,.3)')), { borde: 0x5a3a28, z: ZF });
  k.box(7.0, 0.82, ZF + 0.12, 4.6, 0.08, 0.24, 0x7a5236);
  for (const s of [2.0, 4.5, 7.0, 9.0]) hueco(k, s, 3.9, 0.8, 0.8, canvasTex(48, 48, cristales('#e8e8e4', 1)), { borde: 0xe2e0da, z: ZF });
}

/** la cara de la cafetería a la calle Las Quemadas: la puerta de cristal y la pizarra del menú */
function cafeteriaEste(k) {
  const L = 10;
  pared(k, 0, L, 6.0, (g, w, h) => { g.fillStyle = '#f0f0ec'; g.fillRect(0, 0, w, h); });
  k.box(L / 2, 6.0, ZF - 0.12, L, 0.5, 0.24, BLANCO);
  hueco(k, 3.0, 0, 1.1, 2.3, canvasTex(66, 138, cristales('#5a3a28', 1, 'rgba(70,60,50,.35)')), { borde: 0x5a3a28, z: ZF });
  k.pic(1.0, 1.5, ZF + 0.05, 1.1, 1.4, 0, 1, canvasTex(110, 140, pizarra));
  for (const s of [5.5, 8.0]) hueco(k, s, 3.9, 0.8, 0.8, canvasTex(48, 48, cristales('#e8e8e4', 1)), { borde: 0xe2e0da, z: ZF });
}

/** se monta con lo demás */
export function buildIesAltavista(scene, colliders, map) {
  if (!map?.iesAltavista) return null;
  const grupos = [];
  const montar = (M, nombre, hacer) => { const k = new Kit(); hacer(k); grupos.push(enMarco(k, M, nombre, colliders)); };
  montar(ED, 'iesAltavistaFachada', fachada);
  montar(MU, 'iesAltavistaMuro', muro);
  PABELLONES.forEach(([x, z, w, d], i) => {
    const U = ED.U;
    montar(marco([x, z], [x + U[0], z + U[1]]), 'iesAltavistaPabellon' + i, (k) => pabellon(k, w, d));
  });
  montar(CS, 'cafeteriaIesAltavista', cafeteriaSur);
  montar(CE, 'cafeteriaIesAltavistaEste', cafeteriaEste);
  const kv = new Kit();
  verde(kv);
  grupos.push(kv.build('iesAltavistaVerde').group);
  for (const g of grupos) scene.add(g);
  const suelo = paveMesh(trocear(polyTris(PATIO), 1.5), 0.2, hormigon(), 0xffffff);
  if (suelo) { suelo.name = 'iesAltavistaPatio'; scene.add(suelo); }
  return { grupos, suelo };
}
