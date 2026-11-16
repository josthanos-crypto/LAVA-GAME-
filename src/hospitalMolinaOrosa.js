import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';
import { alturaBloque } from './edificioReal.js';
import { tira, juntarLienzos } from './kitFachada.js';

/**
 * El Hospital Universitario Dr. José Molina Orosa (Argana Alta): el bloque principal y su entrada, con las vistas de la
 * calle de Google de julio de 2025 desde el vial de la entrada (solo se miran, no van dentro del juego; la gente no se
 * pone). La fachada larga del oeste es blanca, de dos plantas: abajo, las ventanas corridas de carpintería verde entre
 * machones blancos; arriba, las logias hondas con la barandilla de cristal verde, y de trecho en trecho un arco de medio
 * punto. La entrada lleva la carpa de tejado a cuatro aguas color crema sobre pilares grises, y delante están los
 * parterres de picón negro con cactus, las palmeras altas y los mástiles con las banderas de España y de Canarias.
 * El extremo del sur, sin logias, lleva ventanas verdes enrasadas. El lado del este (vista de 2014) es pared blanca:
 * lo pinta el juego con el color del bloque.
 *
 * La fachada se adelanta 1,9 m sobre la línea del mapa para que las logias tengan fondo de verdad. s va del norte (0)
 * al sur (164 m), z hacia el vial de la entrada (oeste).
 */

const F = marco([-1659.3, -1365.4], [-1576.8, -1223.3]);
const L = F.len;
const D = 1.9, H = 8.6, PISO = 4.6, DINTEL = 7.0;
const BLANCO = 0xf3f2ee, SOMBRA = 0xdcdad4, VERDE = 0x2c6b4c, GRIS = 0x5d6266, CREMA = 0xe6dfcc, PICON = 0x24221f;
const ARCOS = [77, 111];
const ENTRADA = 87;
const SIN_LOGIAS = 132;
const BANDERAS = [[104, 'es'], [106.4, 'ic']];
const PALMAS = [[52, 12.5, 0.3], [58, 13.5, 1.7], [64, 11.8, 0.9], [71, 13, 2.4], [95, 12.2, 1.1], [101, 8.5, 0.5], [118, 12.8, 2.0], [126, 11.5, 1.4]]
  .map(([s, h, r]) => [...F.W(s, D + 6.5), h, r]);

export function tuneHospitalMolinaOrosa(map) {
  if (!alturaBloque(map, -1595, -1325, H, [243, 242, 238])) return;
  map.hospitalMolinaOrosa = true;
  const signs = map.signs || [];
  for (let i = signs.length - 1; i >= 0; i--) if (/Hospital General de Lanzarote/i.test(signs[i].name || '')) signs.splice(i, 1);
  map.extraPalms = map.extraPalms || [];
  map.extraPalms.push(...PALMAS);
}

// ——— lienzos ———

function ventanaVerde(g, w, h) {
  const v = g.createLinearGradient(0, 0, 0, h);
  v.addColorStop(0, '#53656a');
  v.addColorStop(1, '#263033');
  g.fillStyle = v;
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,255,255,.12)';
  g.beginPath(); g.moveTo(w * 0.1, h); g.lineTo(w * 0.35, 0); g.lineTo(w * 0.5, 0); g.lineTo(w * 0.25, h); g.fill();
  g.strokeStyle = '#2c6b4c';
  g.lineWidth = Math.max(4, h * 0.07);
  g.strokeRect(2, 2, w - 4, h - 4);
  const n = Math.max(2, Math.round(w / (h * 0.55)));
  for (let i = 1; i < n; i++) { const x = (w / n) * i; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  g.beginPath(); g.moveTo(0, h * 0.3); g.lineTo(w, h * 0.3); g.stroke();
}

function fondoLogia(g, w, h) {
  g.fillStyle = '#e4e2dc';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(0,0,0,.18)';
  g.fillRect(0, 0, w, h * 0.18);
  const pw = w * 0.34, ph = h * 0.72;
  for (const x of [w * 0.1, w * 0.56]) {
    g.fillStyle = '#2f393c';
    g.fillRect(x, h - ph, pw, ph);
    g.strokeStyle = '#2c6b4c';
    g.lineWidth = 5;
    g.strokeRect(x + 2, h - ph + 2, pw - 4, ph - 4);
    g.beginPath(); g.moveTo(x + pw / 2, h - ph); g.lineTo(x + pw / 2, h); g.stroke();
  }
}

function bandera(tipo) {
  return (g, w, h) => {
    if (tipo === 'es') {
      g.fillStyle = '#c60b1e'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#ffc400'; g.fillRect(0, h / 4, w, h / 2);
    } else {
      ['#ffffff', '#0768a9', '#fedd00'].forEach((c, i) => { g.fillStyle = c; g.fillRect((w / 3) * i, 0, w / 3 + 1, h); });
    }
  };
}

// ——— piezas ———


function bajo(k) {
  tira(k, 0, L, 0, D / 2, PISO, D, BLANCO);
  k.block(L / 2, D / 2, L, D);
  const tex = canvasTex(256, 112, ventanaVerde);
  for (let s = 4; s + 3.2 <= L - 2; s += 4.3) {
    if (Math.abs(s + 1.6 - ENTRADA) < 4.5) continue;
    k.pic(s + 1.6, 1.85, D + 0.01, 3.2, 1.6, 0, 1, tex);
    k.box(s + 1.6, 1.0, D + 0.06, 3.4, 0.07, 0.14, SOMBRA);
  }
  // la puerta de cristal de la entrada, bajo la carpa
  k.pic(ENTRADA, 1.35, D + 0.01, 6.4, 2.7, 0, 1, canvasTex(320, 135, ventanaVerde), { glow: 0.1 });
  tira(k, 0, L, PISO - 0.4, D + 0.08, 0.4, 0.16, SOMBRA, k.solid);
}

function logias(k) {
  const fondo = canvasTex(256, 128, fondoLogia);
  const PASO = 5.6, HUECO = 4.2;
  const machon = (s0, s1) => k.box((s0 + s1) / 2, PISO, D / 2, s1 - s0, DINTEL - PISO, D, BLANCO, { list: k.shell });
  let s = 6;
  machon(0, s);
  while (s + PASO <= SIN_LOGIAS) {
    const c = s + PASO / 2;
    const arco = ARCOS.find(a => Math.abs(a - c) < PASO / 2);
    if (arco) { arcoBay(k, s, s + PASO); s += PASO; continue; }
    machon(s, c - HUECO / 2);
    machon(c + HUECO / 2, s + PASO);
    k.box(c, PISO, 0.15, HUECO, DINTEL - PISO, 0.3, BLANCO, { list: k.shell });
    k.pic(c, (PISO + DINTEL) / 2, 0.31, HUECO, DINTEL - PISO, 0, 1, fondo);
    barandilla(k, c, HUECO);
    k.box(c, DINTEL, D / 2, HUECO, H - DINTEL, D, BLANCO, { list: k.shell });
    s += PASO;
  }
  // el extremo del sur: pared enrasada con ventanas verdes
  tira(k, s, L, PISO, D / 2, H - PISO, D, BLANCO);
  const tex = canvasTex(192, 128, ventanaVerde);
  for (let t = s + 2.2; t < L - 2; t += 3.6) k.pic(t, 5.9, D + 0.01, 2.1, 1.4, 0, 1, tex);
  k.box(3, DINTEL, D / 2, 6, H - DINTEL, D, BLANCO, { list: k.shell });
  tira(k, 0, L, H, D / 2 + 0.05, 0.12, D + 0.1, SOMBRA, k.solid);
}

function barandilla(k, c, w) {
  k.box(c, PISO, D - 0.25, w, 1.0, 0.04, 0x6f9e86, { list: k.glass });
  k.box(c, PISO + 1.0, D - 0.25, w, 0.05, 0.07, VERDE);
}

/** la logia del arco: el hueco de medio punto en el frente y el techo a la altura de la clave */
function arcoBay(k, s0, s1) {
  const c = (s0 + s1) / 2, w = s1 - s0, r = 2.3, arranque = 5.5;
  const forma = new THREE.Shape();
  forma.moveTo(-w / 2, 0); forma.lineTo(w / 2, 0); forma.lineTo(w / 2, H - PISO); forma.lineTo(-w / 2, H - PISO); forma.closePath();
  const hueco = new THREE.Path();
  hueco.moveTo(-r, 0); hueco.lineTo(-r, arranque - PISO);
  hueco.absarc(0, arranque - PISO, r, Math.PI, 0, true);
  hueco.lineTo(r, 0); hueco.closePath();
  forma.holes.push(hueco);
  const g = new THREE.ExtrudeGeometry(forma, { depth: 0.4, bevelEnabled: false, curveSegments: 18 });
  g.translate(c, PISO, D - 0.4);
  k.add(g, BLANCO, { list: k.shell });
  k.box(c, PISO, 0.15, w, arranque + r - PISO, 0.3, BLANCO, { list: k.shell });
  k.pic(c, (PISO + arranque + r) / 2, 0.31, w, arranque + r - PISO, 0, 1, canvasTex(256, 160, fondoLogia));
  k.box(c, arranque + r, (D - 0.4) / 2, w, H - arranque - r, D - 0.4, BLANCO, { list: k.shell });
  for (const x of [s0, s1]) k.box(x, PISO, D / 2 - 0.2, 0.3, arranque + r - PISO, D - 0.4, BLANCO, { list: k.shell });
  barandilla(k, c, 2 * r);
}

/** la carpa de la entrada: tejado a cuatro aguas color crema sobre cuatro pilares grises */
function carpa(k) {
  const z = D + 4.2, a = 8.4, b = 7.2, y = 3.1;
  for (const [ds, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    k.cyl(ENTRADA + ds * (a / 2 - 0.3), 0, z + dz * (b / 2 - 0.3), 0.1, 0.1, y, GRIS, { seg: 8 });
    k.block(ENTRADA + ds * (a / 2 - 0.3), z + dz * (b / 2 - 0.3), 0.25, 0.25);
  }
  k.box(ENTRADA, y, z, a, 0.35, b, GRIS);
  const techo = new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1, true);
  techo.rotateY(Math.PI / 4);
  techo.scale(a + 0.4, 2.0, b + 0.4);
  techo.translate(ENTRADA, y + 0.35 + 1.0, z);
  k.add(techo, CREMA);
  k.box(ENTRADA, 0, z, a, 0.06, b, 0xb9b3a8, { list: k.shell });
}

/** los parterres de picón con cactus y arbustos, y los mástiles de las banderas */
function jardin(k) {
  const tramos = [[10, ENTRADA - 6], [ENTRADA + 6, SIN_LOGIAS + 20]];
  let semilla = 7;
  const rnd = () => (semilla = (semilla * 16807) % 2147483647) / 2147483647;
  for (const [s0, s1] of tramos) {
    tira(k, s0, s1, 0, D + 3.0, 0.25, 2.6, 0xd6d0c4);
    tira(k, s0 + 0.15, s1 - 0.15, 0.25, D + 3.0, 0.03, 2.3, PICON);
    k.block((s0 + s1) / 2, D + 3.0, s1 - s0, 2.6);
    for (let s = s0 + 1.5; s < s1 - 1; s += 2.6 + rnd() * 2) {
      const z = D + 2.2 + rnd() * 1.6;
      if (rnd() < 0.4) {
        const h = 1.2 + rnd() * 1.6;
        k.cyl(s, 0.25, z, 0.14, 0.17, h, 0x4f7a4a, { seg: 8 });
        k.cyl(s + 0.3, 0.25 + h * 0.4, z, 0.1, 0.1, h * 0.45, 0x4f7a4a, { seg: 8 });
      } else {
        k.ball(s, 0.65, z, 0.55 + rnd() * 0.3, rnd() < 0.5 ? 0x3c6a36 : 0x547a3e, { sy: 0.75 });
      }
    }
  }
  for (const [s, tipo] of BANDERAS) {
    k.cyl(s, 0, D + 8, 0.06, 0.08, 9.5, 0xe8e8e6, { seg: 8 });
    k.block(s, D + 8, 0.2, 0.2);
    const g = new THREE.PlaneGeometry(1.8, 1.2);
    g.translate(s + 0.95, 8.6, D + 8);
    k.pics.push({ geo: g, tex: canvasTex(96, 64, bandera(tipo)), glow: 0 });
    const r = new THREE.PlaneGeometry(1.8, 1.2);
    r.rotateY(Math.PI);
    r.translate(s + 0.95, 8.6, D + 8 - 0.01);
    k.pics.push({ geo: r, tex: canvasTex(96, 64, bandera(tipo)), glow: 0 });
  }
}

export function buildHospitalMolinaOrosa(scene, colliders, map) {
  if (!map?.hospitalMolinaOrosa) return null;
  const k = new Kit();
  bajo(k);
  logias(k);
  carpa(k);
  jardin(k);
  juntarLienzos(k);
  const g = enMarco(k, F, 'hospitalMolinaOrosa', colliders);
  scene.add(g);
  return g;
}
